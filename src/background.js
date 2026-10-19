// background.js
// 監聽藥歷 API 請求

import { writeHtml } from './utils/nativeHostBridge.js';
import { generateHtmlReport, getReportFilename } from './utils/htmlReportGenerator.js';

// Modify currentSessionData to include new data types
let currentSessionData = {
  medicationData: null,
  labData: null,
  chinesemedData: null,
  acupunctureData: null, // imue0100 — pure-acupuncture / 處置 records (no
                         // drug rows in chinesemedData), enabling this so
                         // 純針灸 diagnoses become visible in the report.
  imagingData: null,
  allergyData: null,     // New
  surgeryData: null,     // New
  dischargeData: null,   // New
  medDaysData: null,     // New
  patientSummaryData: null, // Patient summary data
  adultHealthCheckData: null, // 成人預防保健
  cancerScreeningData: null,  // 四癌篩檢
  hbcvData: null,             // B、C 型肝炎專區
  token: null,
  currentUserSession: null,
  patientName: null,
  patientIdFromToken: null
};

// Tracks the tab whose API activity last fed currentSessionData. The auto-
// export uses this to ask getPatientInfo from the *correct* tab, instead of
// chrome.tabs.query()[0] which could be a stale NHI tab left open on a
// previous patient (root cause of the "files all named after one patient"
// bug — wrong tab returns wrong JWT, then we overwrote the good saveToken
// value with the stale one).
let _activePatientTabId = -1;

// Patient identity (name, ID, token) is set by saveToken and should survive
// session-data clears. Otherwise a saveToken that arrives *before* the
// content-script's clearSessionData/userSessionChanged message gets wiped,
// and the HTML report falls back to ID-only filename.
const IDENTITY_KEYS = new Set(['token', 'currentUserSession', 'patientName', 'patientIdFromToken', '_identityCapturedSession']);

function clearMedicalData() {
  for (const key of Object.keys(currentSessionData)) {
    if (!IDENTITY_KEYS.has(key)) currentSessionData[key] = null;
  }
}

/**
 * Classify the current time into a clinic session folder name.
 * Boundaries: 早診 < 13:00 ≤ 午診 < 17:50 ≤ 晚診
 * (set by clinic schedule — keep in sync with native host expectations)
 */
function getClinicSession(date) {
  const d = date || new Date();
  const minutes = d.getHours() * 60 + d.getMinutes();
  if (minutes < 13 * 60) return '早診';            // < 13:00
  if (minutes < 17 * 60 + 50) return '午診';       // 13:00 – 17:49
  return '晚診';                                    // ≥ 17:50
}

// --- 下載模式(審查/免安裝替代方案) --------------------------------------
// 走 chrome.downloads 把報告存進「Chrome 下載資料夾/NHITW_reports/日期/診次/」。
// 院所標準做法仍是 Native Host;此模式給無法安裝主機的環境(例如商店審查員)
// 驗證完整功能用。不含自動清理(下載夾不是我們的地盤,不主動刪使用者檔案)。
function downloadHtml(filename, html, dateStr, session) {
  return new Promise((resolve, reject) => {
    let b64;
    try {
      // UTF-8 → base64(btoa 只吃 latin1,先經 TextEncoder;分段避免堆疊爆掉)
      const bytes = new TextEncoder().encode(html);
      let bin = '';
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
      }
      b64 = btoa(bin);
    } catch (e) {
      return reject(new Error('encode failed: ' + (e && e.message)));
    }
    chrome.downloads.download({
      url: 'data:text/html;base64,' + b64,
      filename: `NHITW_reports/${dateStr}/${session}/${filename}`,
      conflictAction: 'uniquify',
      saveAs: false,
    }, (downloadId) => {
      const err = chrome.runtime.lastError;
      if (err || downloadId == null) reject(new Error(err?.message || 'download rejected'));
      else resolve({ downloadId });
    });
  });
}

/**
 * Auto-export patient data to shared folder via Native Messaging Host.
 * Debounced: waits for all data types to arrive before generating HTML.
 * Uses chrome.alarms instead of setTimeout because MV3 Service Workers
 * can be killed before setTimeout fires.
 */
// Fingerprint of the last report actually written (patientId + data counts),
// so an identical re-fire doesn't produce a duplicate file. In-memory only —
// a SW restart resets it, at worst re-writing one identical report.
let _lastExportFingerprint = null;
// Concurrent-export lock: a hung native write must not let a second alarm run
// a parallel export of the same content (fingerprint not yet committed).
let _exportInFlight = false;
// 匯出進行中被跳過的重試次數(避免無限重排)
let _inFlightRetries = 0;
// 提早擷取到的年齡/性別/生日,綁定當時的會話 —— 換卡快照要靠它,badge 判定
// (CKD/氣喘)才不會因為問不到分頁而失準。
let _capturedMeta = null;

// --- Export event log (診斷用) -------------------------------------------
// 換卡過快 / 健保網站慢時偶爾「沒產出 HTML」。檔案不存在就看不到檔案內的
// probe,所以事件記在 chrome.storage.session(撐得過 service worker 回收),
// 再由「下一份成功產出的報告」把歷程帶出來 —— 病人 A 沒出檔的原因,會出現
// 在病人 B 的報告裡。全部去識別化:只存事件、資料筆數、遮蔽後的代號。
const EVENT_LOG_KEY = 'nhitwExportEvents';
const EVENT_LOG_MAX = 60;

async function logEvent(event, detail) {
  try {
    const entry = { t: new Date().toISOString(), e: event };
    if (detail != null) entry.d = detail;
    const store = await chrome.storage.session.get(EVENT_LOG_KEY);
    const list = Array.isArray(store[EVENT_LOG_KEY]) ? store[EVENT_LOG_KEY] : [];
    list.push(entry);
    while (list.length > EVENT_LOG_MAX) list.shift();
    await chrome.storage.session.set({ [EVENT_LOG_KEY]: list });
  } catch (_) { /* storage.session unavailable → 診斷降級,不影響匯出 */ }
}

// 從事件記錄推算「這批資料的讀取耗時」:最後一次換卡之後,第一筆到最後一筆
// 健保資料抵達的間隔。worker 被回收也算得出來(事件本來就存在 storage)。
function deriveReadTiming(events) {
  if (!Array.isArray(events) || events.length === 0) return null;
  let start = 0;
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].e === 'session.changed') { start = i + 1; break; }
  }
  const data = events.slice(start).filter(ev => String(ev.e || '').startsWith('data.'));
  if (data.length === 0) return null;
  const first = Date.parse(data[0].t), last = Date.parse(data[data.length - 1].t);
  if (!isFinite(first) || !isFinite(last)) return null;
  return { readMs: Math.max(0, last - first), types: data.length, lastDataAt: last };
}

// --- 提早取得病人身分 ---------------------------------------------------
// 匯出是在最後一筆資料抵達約 7 秒後才跑;櫃檯若在這 7 秒內就退出病人、回到
// 選單頁,分頁的 sessionStorage(token)與 DOM 都已清空 → 問不到姓名,檔名
// 只好退回身分證號(G222673775_20260811_200557.html,2026-08-11 案例)。
// 資料正在抵達時病人頁一定還活著,所以那一刻就先把姓名抓下來存著。
let _identityAskedForSession = null;
const NAME_MEMO_KEY = 'nhitwNameBySession';

async function rememberName(session, name) {
  if (!session || !name) return;
  try {
    const store = await chrome.storage.session.get(NAME_MEMO_KEY);
    const memo = store[NAME_MEMO_KEY] || {};
    memo[session] = name;
    const keys = Object.keys(memo);
    while (keys.length > 40) delete memo[keys.shift()];
    await chrome.storage.session.set({ [NAME_MEMO_KEY]: memo });
  } catch (_) { /* 記不起來就算了,不影響匯出 */ }
}

async function recallName(session) {
  if (!session) return null;
  try {
    const store = await chrome.storage.session.get(NAME_MEMO_KEY);
    return (store[NAME_MEMO_KEY] || {})[session] || null;
  } catch (_) { return null; }
}

async function captureIdentityEarly(tabId) {
  const session = currentSessionData.currentUserSession;
  if (!session || !(tabId > 0)) return;
  const haveName = currentSessionData.patientName &&
    currentSessionData.patientName !== currentSessionData.patientIdFromToken;
  if (haveName || _identityAskedForSession === session) return;
  _identityAskedForSession = session;
  try {
    const fresh = await chrome.tabs.sendMessage(tabId, { action: 'getPatientInfo' });
    if (fresh?.name) {
      currentSessionData.patientName = fresh.name;
      if (fresh.id) currentSessionData.patientIdFromToken = fresh.id;
      currentSessionData._identityCapturedSession = session;
      _capturedMeta = { session, age: fresh.age ?? null, sex: fresh.sex || '', birthday: fresh.birthday || '' };
      rememberName(session, fresh.name);
      logEvent('identity.early', `name=${maskPii(fresh.name, 1, 1)} id=${maskPii(fresh.id || '', 4, 3)}`);
    } else {
      logEvent('identity.earlyEmpty');
    }
  } catch (e) {
    logEvent('identity.earlyFail', String(e && e.message || e).slice(0, 80));
  }
}

async function readEventLog() {
  try {
    const store = await chrome.storage.session.get(EVENT_LOG_KEY);
    return Array.isArray(store[EVENT_LOG_KEY]) ? store[EVENT_LOG_KEY] : [];
  } catch (_) { return []; }
}

// 換卡先匯出再清空。連續看診(病人 A 的資料剛到、7 秒內 B 就插卡)時,舊流程
// 會在計時器到期前把 A 的資料清掉 → A 完全沒有檔案且無任何訊息。現在先用快照
// 把 A 寫出去,再清空給 B。快照是複本,之後的清空動作不會影響它。
async function flushPendingPatient(reason) {
  const hasData = Object.entries(currentSessionData).some(([k, v]) => {
    if (IDENTITY_KEYS.has(k)) return false;
    const arr = v?.rObject || v?.robject;
    return Array.isArray(arr) ? arr.length > 0 : !!v;
  });
  if (!hasData) return;
  const snapshot = { ...currentSessionData };
  if (_capturedMeta && _capturedMeta.session === snapshot.currentUserSession) {
    snapshot._meta = _capturedMeta;
  }
  logEvent('flush.start', `${reason} session=${maskPii(snapshot.currentUserSession || '-', 8, 3)}`);
  try {
    await autoExportToSharedFolder({ state: snapshot });
  } catch (e) {
    logEvent('flush.fail', String(e && e.message || e).slice(0, 120));
  }
}

function scheduleExport() {
  // Debounce by RESET: every new data arrival (or saveToken) pushes the
  // alarm back ~6s, so we only export once the data has stopped streaming
  // in. The previous flag-based version locked the alarm on the FIRST
  // trigger (usually saveToken, before any medical data arrived), fired an
  // empty report, then the data arriving fired a SECOND export — producing
  // two files for one patient (空檔 @ :33 + 完整檔 @ :39 for 許晴媃
  // 2026-06-29). chrome.alarms.create with the same name overwrites the
  // pending alarm, resetting the timer.
  chrome.alarms.create('htmlExport', { delayInMinutes: 0.1 }); // ~6 seconds quiet period
}

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'htmlExport') {
    logEvent('alarm.fired');
    autoExportToSharedFolder().catch(err => {
      logEvent('export.crash', String(err && err.message || err));
      console.warn('[NHITW Clinic] Export alarm handler error:', err.message);
    });
  }
});

async function autoExportToSharedFolder(opts) {
  // opts.state = 換卡前拍下的快照(flushPendingPatient)。有快照時完全不碰
  // 分頁 —— 那個分頁此刻已經是「下一位病人」,問它只會拿到錯的身分。
  const snap = (opts && opts.state) || null;
  const state = snap || currentSessionData;
  if (_exportInFlight) {
    console.log('[NHITW Clinic] Export already in flight — skipping concurrent run');
    // 排隊而非丟棄:寫入卡住時,後續病人不該跟著沒檔案。
    if (!snap && _inFlightRetries < 5) {
      _inFlightRetries++;
      chrome.alarms.create('htmlExport', { delayInMinutes: 0.1 });
      logEvent('skip.inFlight', `已重新排隊 (第 ${_inFlightRetries} 次)`);
    } else {
      logEvent('skip.inFlight', snap ? 'flush 放棄' : '重試次數用盡');
    }
    return;
  }
  _exportInFlight = true;
  _inFlightRetries = 0;
  try {
    const settings = await chrome.storage.sync.get('sharedFolder');
    const sharedFolder = settings.sharedFolder || {};
    if (!sharedFolder.enabled) { logEvent('skip.disabled'); return; }

    // #9a — MV3 worker restarts wipe module state while the chrome.alarm
    // survives, so this can run with an empty state even though
    // every payload sits in chrome.storage.local (saveDataHandler persists
    // them). Rehydrate when memory is empty AND the stored batch is fresh
    // (<10 min) — stale batches stay ignored so a browser-restart alarm can't
    // re-export yesterday's patient.
    const memoryHasData = snap ? true : Object.entries(state).some(([k, v]) => {
      if (IDENTITY_KEYS.has(k)) return false;
      const arr = v?.rObject || v?.robject;
      return Array.isArray(arr) ? arr.length > 0 : !!v;
    });
    if (!memoryHasData) {
      const stored = await chrome.storage.local.get(
        [...Object.values(DATA_TYPE_TO_STORAGE_KEY), 'currentUserSession', '_lastSaveAt']);
      if (stored._lastSaveAt && (Date.now() - stored._lastSaveAt) < 10 * 60 * 1000) {
        let restored = 0;
        for (const key of Object.values(DATA_TYPE_TO_STORAGE_KEY)) {
          if (stored[key] && !state[key]) { state[key] = stored[key]; restored++; }
        }
        if (!state.currentUserSession && stored.currentUserSession) {
          state.currentUserSession = stored.currentUserSession;
        }
        if (restored > 0) console.warn(`[NHITW Clinic] worker was recycled — rehydrated ${restored} data types from storage`);
      }
    }

    // #9b — the content-dedup fingerprint must survive worker recycling too,
    // or NHI's periodic API re-fires keep producing identical duplicate files.
    if (_lastExportFingerprint == null) {
      try {
        const s = await chrome.storage.session.get('lastExportFingerprint');
        if (s.lastExportFingerprint) _lastExportFingerprint = s.lastExportFingerprint;
      } catch (_) { /* storage.session unavailable → in-memory only */ }
    }

    // Ask content script for fresh patient info from the SPECIFIC tab whose
    // API activity triggered this export (tracked via _activePatientTabId).
    // Querying chrome.tabs.query({url:'.../*'})[0] is unsafe — Chrome may
    // return a stale NHI tab the doctor left open on a previous patient,
    // and that tab's JWT would mis-identify the current export. Fall back
    // to active NHI tab only if the tracked tab is gone (closed).
    let patientMeta = { age: null, sex: '', birthday: '' };
    let fresh = null;
    // 快照模式:身分只能來自快照(含提早擷取到的年齡/性別),絕不問分頁。
    if (snap) {
      if (snap._meta) patientMeta = { age: snap._meta.age ?? null, sex: snap._meta.sex || '', birthday: snap._meta.birthday || '' };
    }
    let targetTabId = snap ? -1 : _activePatientTabId;
    if (targetTabId > 0) {
      try {
        fresh = await chrome.tabs.sendMessage(targetTabId, { action: 'getPatientInfo' });
        console.log(`[NHITW Clinic] Fresh patient info from tracked tab ${targetTabId}:`, fresh);
      } catch (e) {
        console.warn(`[NHITW Clinic] Tracked tab ${targetTabId} unreachable: ${e.message}, falling back`);
        targetTabId = -1;
      }
    }
    if (!fresh && !snap) {
      try {
        // Last-resort fallback: prefer the active NHI tab, never just tabs[0]
        const tabs = await chrome.tabs.query({ url: 'https://medcloud2.nhi.gov.tw/*' });
        const active = tabs.find(t => t.active) || tabs[0];
        if (active) {
          fresh = await chrome.tabs.sendMessage(active.id, { action: 'getPatientInfo' });
          console.log(`[NHITW Clinic] Fresh patient info from active fallback tab ${active.id}:`, fresh);
        }
      } catch (e) {
        console.warn('[NHITW Clinic] Fallback getPatientInfo also failed:', e.message);
      }
    }
    // 分頁可能已經換到下一位病人了(櫃檯在計時器到期的同一秒插下一張卡):
    // 那時問到的身分/年齡/性別屬於「下一位」,套到這份報告上會讓檔名、CKD、
    // 氣喘等判定全部錯位 —— 更糟的是接著被自己的一致性防護擋下,整份檔案消失,
    // 得再刷一次卡才出得來(翁于珊 2026-08-17 19:19:16)。與會話不符就不採用。
    const sessionIdNow = (state.currentUserSession || '').startsWith('patient_')
      ? state.currentUserSession.replace('patient_', '') : '';
    if (fresh?.id && sessionIdNow && fresh.id !== sessionIdNow) {
      logEvent('identity.tabAhead',
        `分頁=${maskPii(fresh.id, 4, 3)} 會話=${maskPii(sessionIdNow, 4, 3)},不採用分頁身分`);
      fresh = null;
    }
    // Atomic update: (name, id) move together. Only trust fresh if it has an
    // id — empty responses leave the cached saveToken value intact.
    if (fresh?.id) {
      const switched = fresh.id !== state.patientIdFromToken;
      state.patientIdFromToken = fresh.id;
      // Only overwrite the cached name when getPatientInfo actually returned
      // one. Some hospitals' JWT omits UserName, so getPatientInfo's
      // JWT-only decode comes back nameless even though saveToken's DOM
      // fallback had already captured the real name. Downgrading a good name
      // to the bare ID here is what regressed filenames back to ID numbers —
      // so keep the existing name unless the patient genuinely changed or we
      // never had a name to begin with.
      if (fresh.name) {
        state.patientName = fresh.name;
      } else if (switched || !state.patientName) {
        state.patientName = fresh.id;
      }
      // Fresh identity is read from the CURRENT tab right now → bind it to the
      // current session (#2), same as the saveToken path.
      state._identityCapturedSession = state.currentUserSession || null;
      if (fresh.name) rememberName(state.currentUserSession, fresh.name);
      patientMeta = { age: fresh.age ?? null, sex: fresh.sex || '', birthday: fresh.birthday || '' };
    }
    // 分頁問不到、或分頁已跑到下一位病人而不予採用時,改用提早擷取時記下的
    // 年齡/性別(限同一會話)—— 否則 CKD/氣喘等需要年齡性別的判定會失準。
    if (patientMeta.age == null && !patientMeta.sex && _capturedMeta &&
        _capturedMeta.session === state.currentUserSession) {
      patientMeta = { age: _capturedMeta.age, sex: _capturedMeta.sex, birthday: _capturedMeta.birthday };
    }

    let patientId = state.patientIdFromToken;
    let patientName = state.patientName;
    // 這次問不到姓名,但本瀏覽器工作階段內看過同一位病人 → 用記住的姓名,
    // 免得同一位病人一下有名字、一下變身分證號。
    if (!patientName && state.currentUserSession) {
      const memo = await recallName(state.currentUserSession);
      if (memo) {
        patientName = memo;
        logEvent('identity.recalled', maskPii(memo, 1, 1));
      }
    }

    // SAFETY — identity/session consistency. The medical payloads are fetched
    // against currentUserSession (the patient currently loaded). If the cached
    // identity (name/id) belongs to a DIFFERENT patient than the session, a
    // patient switch left stale identity behind and exporting now would stamp
    // one patient's records with another's name (陳淑媚 2026-06-29: patient
    // F127375002's 眼科 data was about to be exported under 陳淑媚 R220136259).
    // Defer the export — the new patient's saveToken will sync identity to the
    // session shortly, then the next alarm exports correctly.
    const userSession = state.currentUserSession || '';
    if (userSession.startsWith('patient_')) {
      const sessionId = userSession.replace('patient_', '');
      if (sessionId && patientId && sessionId !== patientId) {
        // 身分與會話不符。以前一律延後匯出,等身分同步 —— 但櫃檯在計時器到期
        // 的同一秒插下一張卡時,身分會「跑在會話前面」,這個會話馬上就要被清掉,
        // 根本等不到下一次機會 → 該病人整份檔案消失,得再刷一次卡才出得來
        // (翁于珊 2026-08-17 19:19:16)。
        // 資料是這個會話抓的,所以會話才是資料的擁有者:直接改用這個會話自己的
        // 身分(提早擷取時記住的姓名 + 會話帶的身分證號),照樣把檔案寫出去。
        // 記不得姓名時才維持原本的延後行為(避免產出只有號碼的重複檔)。
        const memoName = await recallName(userSession);
        if (memoName || snap) {
          logEvent('identity.substituted',
            `會話 ${maskPii(sessionId, 4, 3)} 取代被蓋掉的身分 ${maskPii(patientId, 4, 3)}`);
          patientId = sessionId;
          patientName = memoName || '';
        } else {
          console.warn(`[NHITW Clinic] identity/session mismatch (id=${maskPii(patientId, 4, 3)} vs session=${maskPii(sessionId, 4, 3)}) — deferring export until they sync`);
          logEvent('skip.identityMismatch', `id=${maskPii(patientId, 4, 3)} session=${maskPii(sessionId, 4, 3)}`);
          return;
        }
      }
    }
    // #2 general form — covers token_/dom_ sessions the ID check above can't
    // verify: identity captured under a DIFFERENT session than the current one
    // is stale. Deferring can't help here (there's no ID to sync against), so
    // drop the identity and continue — the fallback naming below produces an
    // anonymous-but-correctly-scoped report instead of one with the wrong name.
    const capturedUnder = state._identityCapturedSession;
    if (patientId && capturedUnder && userSession && capturedUnder !== userSession) {
      console.warn(`[NHITW Clinic] identity was captured under a different session (${maskPii(capturedUnder, 8, 3)} ≠ ${maskPii(userSession, 8, 3)}) — dropping stale identity, exporting with fallback naming`);
      state.patientName = null;
      state.patientIdFromToken = null;
      state._identityCapturedSession = null;
      patientId = '';
      patientName = '';
    }

    // Fallback ID: extract from currentUserSession (format: "patient_A123456789")
    if (!patientId) {
      if (!userSession) {
        console.log('[NHITW Clinic] No session data, skipping export');
        logEvent('skip.noSession');
        return;
      }
      patientId = userSession.startsWith('patient_') ? userSession.replace('patient_', '') : userSession;
    }

    // Fallback name
    if (!patientName) patientName = patientId;
    console.log(`[NHITW Clinic] Export: ID=${maskPii(patientId, 4, 3)}, Name=${maskPii(patientName, 1, 1)}`);

    // Identity probe: rides into the report as a hidden HTML comment so we
    // can investigate cases where the doctor sees a report named after the
    // ID instead of the patient (e.g. 孟卉妍 → P223307767 incident). All
    // values are masked / structural — the snippet captured from DOM has
    // PHI replaced with [ID]/[漢]. See buildIdentityProbeComment.
    // Snapshot which medical data types currently hold records. If a future
    // report shows '仲呈銘 + 結腸瘤' style mix-up again, this counts row will
    // catch it: if dataAtExport shows chinesemedData=0 the moment after we
    // resolve to patient X but the report STILL renders 中藥 entries, the
    // residue is sneaking in through some channel we haven't traced yet.
    const dataAtExport = {};
    for (const [k, v] of Object.entries(state)) {
      if (IDENTITY_KEYS.has(k)) continue;
      const arr = v?.rObject;
      dataAtExport[k] = Array.isArray(arr) ? arr.length : (v == null ? 0 : 'present');
    }

    patientMeta._exportLog = await readEventLog();
    const _readTiming = deriveReadTiming(patientMeta._exportLog);
    // 本次的「讀取 / 等待」在產生報告前就知道,直接放進報告摘要;產生與寫入
    // 耗時發生在報告產生之後,會出現在下一份報告的歷程裡(export.timing)。
    patientMeta._exportTiming = _readTiming ? {
      readSec: +(_readTiming.readMs / 1000).toFixed(1),
      types: _readTiming.types,
      waitSec: +(Math.max(0, Date.now() - _readTiming.lastDataAt) / 1000).toFixed(1),
    } : null;
    patientMeta._identityProbe = {
      generatedAt: new Date().toISOString(),
      resolvedName: maskPii(patientName, 1, 1),
      resolvedId: maskPii(patientId, 4, 3),
      nameSource: patientName === patientId ? 'fallback_to_id' : (state.patientName ? 'cache' : 'fresh'),
      activeTabId: _activePatientTabId,
      dataAtExport,
      cached: {
        name: maskPii(state.patientName || '', 1, 1),
        id: maskPii(state.patientIdFromToken || '', 4, 3),
        session: state.currentUserSession || null,
      },
      freshFromTab: fresh ? {
        name: maskPii(fresh.name || '', 1, 1),
        id: maskPii(fresh.id || '', 4, 3),
        hasAge: fresh.age != null,
        hasSex: !!fresh.sex,
        hasBirthday: !!fresh.birthday,
        _debug: fresh._debug || null,
      } : null,
    };

    const exportData = {};
    for (const [key, value] of Object.entries(state)) {
      // 底線開頭是內部欄位(_meta、_identityCapturedSession…),不是醫療資料:
      // 混進去會改變去重指紋,換卡 flush 時就會把剛匯出過的病人再寫一次。
      if (key !== 'token' && key !== 'currentUserSession' && !key.startsWith('_') && value) {
        exportData[key] = value;
      }
    }

    // Empty-report guard: if NO medical data has arrived yet (every payload
    // empty), skip writing — the data is still streaming in and a later
    // alarm will fire with the full set. Belt-and-braces alongside the
    // debounce-reset above, so an over-early alarm can't emit a blank file.
    const hasAnyData = Object.entries(exportData).some(([k, v]) => {
      if (IDENTITY_KEYS.has(k)) return false;
      const arr = v?.rObject || v?.robject;
      if (Array.isArray(arr)) return arr.length > 0;
      return !!v; // non-array payloads (summaries) count as present
    });
    if (!hasAnyData) {
      console.log('[NHITW Clinic] Export skipped — no medical data yet (avoiding empty report)');
      logEvent('skip.noData', JSON.stringify(dataAtExport));
      return;
    }

    // Content dedup: same patient + identical data payload counts shouldn't
    // produce a second file. NHI re-fires its APIs while the doctor lingers on
    // a patient (范珈寧 2026-06-29: identical 29/311/0 data exported twice,
    // 3.5 min apart — too far apart for the debounce window). Fingerprint =
    // patientId + per-type row counts; skip if unchanged since last write.
    const fingerprint = patientId + '#' + Object.entries(exportData)
      .filter(([k]) => !IDENTITY_KEYS.has(k))
      .map(([k, v]) => {
        const arr = v?.rObject || v?.robject;
        return `${k}:${Array.isArray(arr) ? arr.length : (v ? 1 : 0)}`;
      })
      .sort().join('|');
    if (fingerprint === _lastExportFingerprint) {
      console.log('[NHITW Clinic] Export skipped — identical to last export (' + maskPii(patientId, 4, 3) + ')');
      logEvent('skip.duplicate', maskPii(patientId, 4, 3));
      return;
    }

    // Generate and write HTML report only (no JSON)
    // 使用者在設定頁調整的 ATC5 分類/顏色,報告要跟著走(以前報告是另一份寫死
    // 的複本,設定改了報告不會變)。讀不到就用預設,不影響匯出。
    let userSettings = null;
    try {
      userSettings = await chrome.storage.sync.get({
        atc5Groups: null, atc5ColorGroups: null, enableATC5Colors: true,
      });
    } catch (_) { /* 讀不到設定 → 報告端自動退回預設值 */ }

    const genStart = Date.now();
    let html = generateHtmlReport(patientName, patientId, exportData, patientMeta, userSettings);
    const genMs = Date.now() - genStart;
    const filename = getReportFilename(patientName);
    const session = getClinicSession(new Date());
    // 匯出方式:'host'(預設,院所標準)或 'download'(免安裝替代方案)。
    const exportMode = sharedFolder.exportMode === 'download' ? 'download' : 'host';
    const todayStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    const originalKB = Math.round(new Blob([html]).size / 1024);
    let sizeKB = originalKB;
    console.log(`[NHITW Clinic] Generating HTML: ${filename} (${sizeKB}KB, ${Object.keys(exportData).length} data types, session=${session})`);

    // Native Messaging is hard-capped near 1 MB per message. The embedded
    // <!--NHITW-DEBUG--> JSON is large (full lab records); strip it first as
    // a cheap recovery before falling back to a placeholder.
    if (exportMode === 'host' && sizeKB > 900) {
      html = stripDebugComment(html);
      sizeKB = Math.round(new Blob([html]).size / 1024);
      if (sizeKB <= 900) {
        console.warn(`[NHITW Clinic] HTML trimmed (${originalKB}KB → ${sizeKB}KB) by dropping debug comment`);
      }
    }

    if (exportMode === 'host' && sizeKB > 900) {
      // Still too big — write a small stub so the doctor SEES something
      // missing in the shared folder, and badge the action red so they
      // notice in the popup too. Without this they'd think the export
      // succeeded silently.
      console.warn(`[NHITW Clinic] HTML too large (${sizeKB}KB) — writing oversize stub instead`);
      try {
        chrome.action.setBadgeText({ text: '⚠' });
        chrome.action.setBadgeBackgroundColor({ color: '#c62828' });
      } catch (_) {}
      html = buildOversizeStub(patientName, patientId, originalKB);
      logEvent('write.oversizeStub', `${originalKB}KB`);
      await writeHtml(filename, html, undefined, session, sharedFolder.retentionDays || 40);
      return;
    }

    // retentionDays rides along so the host cleans with the SETTINGS value —
    // the 設定頁「資料保留天數」 knob used to be dead (host only ever read its
    // own config.json, hardcoded to 7 by install.bat).
    const writeStart = Date.now();
    if (exportMode === 'download') {
      await downloadHtml(filename, html, todayStr, session);
    } else {
      await writeHtml(filename, html, undefined, session, sharedFolder.retentionDays || 40);
    }
    const writeMs = Date.now() - writeStart;
    // 三段耗時分開報:讀取(健保雲端回資料)/ 產生 HTML / 寫入共享資料夾,
    // 外加「最後一筆資料 → 開始匯出」的等待(去抖動 + 排程延遲)。
    const waitMs = _readTiming?.lastDataAt ? Math.max(0, genStart - _readTiming.lastDataAt) : null;
    logEvent('write.ok', `${sizeKB}KB in ${writeMs}ms${exportMode === 'download' ? ' (下載模式)' : ''}`);
    logEvent('export.timing',
      `讀取 ${_readTiming ? (_readTiming.readMs / 1000).toFixed(1) + 's/' + _readTiming.types + '類' : '-'}`
      + ` | 等待 ${waitMs != null ? (waitMs / 1000).toFixed(1) + 's' : '-'}`
      + ` | 產生 ${genMs}ms | 寫入 ${writeMs}ms | 檔案 ${sizeKB}KB`);
    _lastExportFingerprint = fingerprint;
    try { chrome.storage.session.set({ lastExportFingerprint: fingerprint }); } catch (_) {}
    console.log(`[NHITW Clinic] HTML report saved: ${session}/${filename}`);
  } catch (err) {
    console.warn('[NHITW Clinic] Auto-export failed (non-blocking):', err.message);
    logEvent('write.fail', String(err && err.message || err).slice(0, 160));
    // #11 — surface the failure: host not installed / share offline / write
    // timeout used to die silently in the console; the doctor believed the
    // report was saved. Same red badge as the oversize path.
    try {
      chrome.action.setBadgeText({ text: '⚠' });
      chrome.action.setBadgeBackgroundColor({ color: '#c62828' });
    } catch (_) {}
  } finally {
    _exportInFlight = false;
  }
}

function stripDebugComment(html) {
  return html.replace(/<!-- NHITW-DEBUG-START[\s\S]*?NHITW-DEBUG-END -->\n?/g, '');
}

function maskPii(s, prefix = 1, suffix = 1) {
  if (s == null) return '';
  const str = String(s);
  if (str.length <= prefix + suffix) return str;
  return str.slice(0, prefix) + '*'.repeat(Math.min(3, str.length - prefix - suffix)) + str.slice(-suffix);
}

function buildOversizeStub(name, id, kb) {
  const esc = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const now = new Date().toLocaleString('zh-TW');
  return `<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>${esc(name)} — 報告過大</title>
<style>body{font-family:"Microsoft JhengHei","PingFang TC",sans-serif;background:#fff3e0;color:#333;padding:24px;margin:0}
h1{color:#c62828;font-size:20px;margin-bottom:12px}
.box{background:#fff;border:2px solid #ed6c02;border-radius:8px;padding:18px;max-width:600px;line-height:1.7;font-size:14px}
.box b{color:#c62828}.box code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:13px}
.note{margin-top:14px;font-size:12px;color:#666}</style></head><body>
<h1>⚠️ 此份病人資料過大，未能完整生成報告</h1>
<div class="box">
  <p><b>病人：</b>${esc(name)}（${esc(id)}）</p>
  <p><b>時間：</b>${esc(now)}</p>
  <p><b>原始 HTML 大小：</b>${kb} KB（超過 Native Messaging 上限 1024 KB）</p>
  <p>請<b>直接在健保雲端原始系統查閱</b>本次資料。</p>
  <p class="note">若此病人經常發生，請聯絡開發者調整擴充功能 — 通常是檢驗紀錄太多年份。</p>
</div></body></html>`;
}

// 定義 API 端點和對應的數據類型
const API_ENDPOINTS = {
  allergy: "medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",
  surgery: "medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",
  discharge: "medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",
  medDays: "medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",
  patientSummary: "medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",  // New endpoint
  chinesemed: "medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",
  // imue0160 = 中醫處置 / 針灸治療 (log_type CHINMED). Confirmed via live
  // Network trace 2026-06-26: GET ?cli_datetime=…&insert_log=true, returns
  // { robject:[{func_date,hosp,icd_code,icd_cname,order_code(D01/D02),
  // cure_cname,diagtreat}] }. Captures pure-acupuncture visits (D02 未開
  // 內服藥) whose diagnoses never appear in imue0090 (中醫用藥).
  acupuncture: "medcloud2.nhi.gov.tw/imu/api/imue0160/imue0160s02/get-data",
  imaging: "medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",
  medication: "medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",
  labdata: "medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"
};

// Add listeners for all API endpoints
Object.entries(API_ENDPOINTS).forEach(([type, endpoint]) => {
  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      if (details.method === "GET" && details.url.includes(endpoint)) {
        if (details.tabId > 0) _activePatientTabId = details.tabId;
        chrome.tabs.sendMessage(details.tabId, {
          action: "apiCallDetected",
          url: details.url,
          type: type
        });
      }
      return { cancel: false };
    },
    { urls: [`https://${endpoint}*`] },
    ["requestBody"]
  );

  chrome.webRequest.onCompleted.addListener(
    function(details) {
      if (details.method === "GET" && details.url.includes(endpoint)) {
        // console.log(`Completed ${type} API request:`, details.url);
        chrome.tabs.sendMessage(details.tabId, {
          action: "apiCallCompleted",
          url: details.url,
          statusCode: details.statusCode,
          type: type
        });
      }
    },
    { urls: [`https://${endpoint}*`] },
    ["responseHeaders"]
  );
});

// 數據類型與對應的 storage 鍵值映射
const DATA_TYPE_TO_STORAGE_KEY = {
  'medication': 'medicationData',
  'labdata': 'labData',
  'chinesemed': 'chinesemedData',
  'acupuncture': 'acupunctureData',
  'imaging': 'imagingData',
  'allergy': 'allergyData',
  'surgery': 'surgeryData',
  'discharge': 'dischargeData',
  'medDays': 'medDaysData',
  'patientSummary': 'patientSummaryData',
  'adultHealthCheck': 'adultHealthCheckData',
  'cancerScreening': 'cancerScreeningData',
  'hbcvdata': 'hbcvData'
};

// 動作與處理函數的映射
const ACTION_HANDLERS = new Map([
  ['openPopup', (message, sender, sendResponse) => {
    chrome.action.openPopup();
    sendResponse({ status: "received" });
  }],
  
  ['userSessionChanged', (message, sender, sendResponse) => {
    // console.log("User session changed, resetting temporary data");
    clearMedicalData();
    // If the new session is a DIFFERENT patient, wipe the cached identity too.
    // clearMedicalData() deliberately preserves IDENTITY_KEYS (so an early
    // saveToken survives a session reset), but on a genuine patient switch
    // that preservation is exactly what stamped the new patient's data with
    // the previous patient's name. Clear it so the incoming patient's
    // saveToken refills it; until then export's mismatch guard holds.
    const newId = (message.userSession || '').startsWith('patient_')
      ? message.userSession.replace('patient_', '') : '';
    const idSwitch = newId && currentSessionData.patientIdFromToken && newId !== currentSessionData.patientIdFromToken;
    // #2: ANY session change (patient_… ↔ token_… ↔ dom_… included) is a
    // patient switch as far as identity is concerned — the old check only
    // caught patient_-prefixed sessions, leaving token_/dom_ patients' stale
    // identity alive across a switch. First-load (no previous session) keeps
    // the early-saveToken identity, as before.
    const prevSession = message._prevUserSession;
    const sessionSwitch = prevSession && message.userSession && message.userSession !== prevSession;
    if (idSwitch || sessionSwitch) {
      currentSessionData.patientName = null;
      currentSessionData.patientIdFromToken = null;
      currentSessionData._identityCapturedSession = null;
    }
    _identityAskedForSession = null; // 新病人要重新問一次
    currentSessionData.currentUserSession = message.userSession;

    // 從 storage 中移除數據
    chrome.storage.local.remove(Object.values(DATA_TYPE_TO_STORAGE_KEY), function() {
      // console.log("Storage data cleared due to user session change");
      chrome.action.setBadgeText({ text: "" });
    });

    sendResponse({ status: "session_reset" });
  }],
  
  ['clearSessionData', (message, sender, sendResponse) => {
    // console.log("Clearing session data");
    flushPendingPatient('清除會話');
    clearMedicalData();
    sendResponse({ status: "cleared" });
  }],
  
  ['getSessionData', (message, sender, sendResponse) => {
    // console.log("Background script received request for session data");
    sendResponse({
      status: "success",
      data: currentSessionData
    });
  }],
  
  ['getDataStatus', (message, sender, sendResponse) => {
    // 獲取存儲的所有數據狀態
    chrome.storage.local.get(Object.values(DATA_TYPE_TO_STORAGE_KEY), (result) => {
      // console.log("STORAGE DATA DEBUG:", result);
      const dataStatus = {};

      // 處理所有數據類型
      const processDataType = (typeKey, storageKey) => {
        const dataObj = result[storageKey];
        // 處理大小寫不一致的情況
        const records = dataObj?.rObject || dataObj?.robject;
        
        if (records && Array.isArray(records)) {
          dataStatus[typeKey] = {
            status: 'fetched',
            count: records.length
          };
        } else {
          dataStatus[typeKey] = { status: 'none', count: 0 };
        }
      };

      // 映射數據類型到 UI 顯示名稱
      const displayNameMap = {
        'medication': 'medication',
        'labdata': 'labData',
        'chinesemed': 'chineseMed',
        'imaging': 'imaging',
        'allergy': 'allergy',
        'surgery': 'surgery',
        'discharge': 'discharge',
        'medDays': 'medDays',
        'patientSummary': 'patientSummary'
      };

      // 處理每個數據類型
      Object.entries(DATA_TYPE_TO_STORAGE_KEY).forEach(([type, storageKey]) => {
        const displayName = displayNameMap[type] || type;
        processDataType(displayName, storageKey);
      });

      sendResponse({ dataStatus });
    });
    return true; // 保持消息通道開放以進行異步響應
  }],
  
  // 使用通用處理函數處理所有數據保存操作
  ['saveMedicationData', saveDataHandler('medication')],
  ['saveLabData', saveDataHandler('labdata')],
  ['saveChineseMedData', saveDataHandler('chinesemed')],
  ['saveAcupunctureData', saveDataHandler('acupuncture')],
  ['saveImagingData', saveDataHandler('imaging')],
  ['saveAllergyData', saveDataHandler('allergy')],
  ['saveSurgeryData', saveDataHandler('surgery')],
  ['saveDischargeData', saveDataHandler('discharge')],
  ['saveMedDaysData', saveDataHandler('medDays')],
  ['savePatientSummaryData', saveDataHandler('patientSummary')],
  ['saveAdultHealthCheckData', saveDataHandler('adultHealthCheck')],
  ['saveCancerScreeningData', saveDataHandler('cancerScreening')],
  ['saveHbcvdata', saveDataHandler('hbcvdata')],
  
  ['saveToken', (message, sender, sendResponse) => {
    // Track which tab "owns" the current patient session so the export's
    // getPatientInfo re-query asks the right place (not chrome.tabs[0]).
    if (sender?.tab?.id) _activePatientTabId = sender.tab.id;
    currentSessionData.token = message.token;
    currentSessionData.currentUserSession = message.userSession || currentSessionData.currentUserSession;
    // Cross-patient data-residue guard: when the new token's patient ID
    // doesn't match the cached one, wipe medical payloads BEFORE adopting
    // the new identity. Without this, the doctor switching from patient X
    // to 仲呈銘 fast can race the content-script's clearSessionData message;
    // the 6-second export debounce then fires with 仲呈銘 identity +
    // patient X's labs/meds/diagnoses still in currentSessionData. We saw
    // exactly this on 2026-06-22 20:20:26 — a 53-year-old male's report
    // contained the prior patient's 結腸瘤追蹤 + N951 停經 diagnoses.
    if (message.patientIdFromToken &&
        currentSessionData.patientIdFromToken &&
        message.patientIdFromToken !== currentSessionData.patientIdFromToken) {
      console.log(`[NHITW Clinic] saveToken patient switched (${maskPii(currentSessionData.patientIdFromToken, 4, 3)} → ${maskPii(message.patientIdFromToken, 4, 3)}) — clearing residual medical data`);
      flushPendingPatient('saveToken換人');
      clearMedicalData();
    }
    // Update (name, id) atomically — never mix a new ID with a stale name.
    // When the doctor switches patients, the new saveToken brings the new ID;
    // we wipe the old name in the same step so a later half-fresh getPatientInfo
    // can't leave us with patient B's ID labelled as patient A's name.
    if (message.patientIdFromToken) {
      currentSessionData.patientIdFromToken = message.patientIdFromToken;
      currentSessionData.patientName = message.patientName || message.patientIdFromToken;
      // Bind this identity to the session it arrived under (#2). Export
      // compares the two: identity captured under a different session is
      // stale and must never be stamped on the current patient's report.
      currentSessionData._identityCapturedSession =
        message.userSession || currentSessionData.currentUserSession || null;
    }
    console.log(`[NHITW Clinic] saveToken from tab ${sender?.tab?.id ?? '?'} - Name: ${maskPii(message.patientName, 1, 1)}, ID: ${maskPii(message.patientIdFromToken, 4, 3)}`);
    scheduleExport();
    sendResponse({ status: "token_saved" });
  }],

  ['checkHostStatus', (message, sender, sendResponse) => {
    try {
      const port = chrome.runtime.connectNative('com.nhitw.host');
      let responded = false;
      port.onMessage.addListener(() => {
        responded = true;
        port.disconnect();
        sendResponse({ success: true, available: true });
      });
      port.onDisconnect.addListener(() => {
        if (!responded) sendResponse({ success: true, available: false });
      });
      port.postMessage({ action: 'read_manifest' });
    } catch (err) {
      sendResponse({ success: true, available: false, error: err.message });
    }
  }],

]);

// 通用數據保存處理函數
function saveDataHandler(type) {
  return function(message, sender, sendResponse) {
    const storageKey = DATA_TYPE_TO_STORAGE_KEY[type];
    if (!storageKey) {
      sendResponse({
        status: "error",
        error: `Invalid data type: ${type}`
      });
      return;
    }

    // console.log(`Background script received ${type} data to save`);
    
    // 更新當前會話數據
    currentSessionData[storageKey] = message.data;
    currentSessionData.currentUserSession = message.userSession || currentSessionData.currentUserSession;
    const _rows = message.data?.rObject || message.data?.robject;
    logEvent('data.' + type,
      (Array.isArray(_rows) ? `${_rows.length} rows` : 'present')
      + (message.fetchMs ? ` (健保回應 ${message.fetchMs}ms)` : ''));
    // 病人頁此刻一定還活著 —— 趁現在把姓名問到手(見 captureIdentityEarly)
    captureIdentityEarly(sender?.tab?.id ?? _activePatientTabId);

    // 保存到 storage
    const storageObj = {
      [storageKey]: message.data,
      currentUserSession: message.userSession || currentSessionData.currentUserSession,
      // Freshness stamp for #9a rehydration — a worker-recycled alarm may only
      // restore from storage when the batch is recent.
      _lastSaveAt: Date.now()
    };

    chrome.storage.local.set(storageObj, function() {
      // console.log(`${type} data saved to storage`);
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });

      // Schedule HTML export (debounced — waits for all data types)
      scheduleExport();

      if (message.data && message.data.rObject && Array.isArray(message.data.rObject)) {
        sendResponse({
          status: "saved",
          recordCount: message.data.rObject.length
        });
      } else {
        sendResponse({
          status: "saved",
          recordCount: 0,
          error: "Invalid data format"
        });
      }
    });
  };
}

// 監聽來自 content script 的訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 檢查是否有會話變更
  // Stash the session as it stood BEFORE this message touched it. The block
  // below adopts message.userSession immediately, so by the time the
  // userSessionChanged handler runs, old === new — which silently disabled the
  // session-based identity wipe (token_/dom_ sessions) and made every
  // session.changed log line print the same value twice (2026-08-05 probe).
  message._prevUserSession = currentSessionData.currentUserSession;
  if (message.userSession && message.userSession !== currentSessionData.currentUserSession) {
    // console.log("User session changed, resetting temporary data");
    // 這裡是 session 真正變更的唯一地點 —— 記錄放這裡才不會漏。之前只在
    // userSessionChanged 訊息裡記,換卡若是由 saveToken/資料訊息帶進來就沒
    // 記錄,「本次讀取耗時」會把上一位病人的資料一起算進去。
    logEvent('session.changed',
      `${maskPii(currentSessionData.currentUserSession || '-', 8, 3)} → ${maskPii(message.userSession, 8, 3)}`);
    // 先把上一位病人寫出去(非同步,不阻擋這則訊息),再清空。
    flushPendingPatient('換卡');
    clearMedicalData();
    currentSessionData.currentUserSession = message.userSession;
  }

  // 查找並執行對應的處理函數
  const handler = ACTION_HANDLERS.get(message.action);
  if (handler) {
    handler(message, sender, sendResponse);
    return true; // 保持消息通道開放以進行異步響應
  }

  sendResponse({ status: "received" });
  return true;
});

// 監聽登出事件（例如通過偵測特定頁面變化）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && (
      changeInfo.url.includes('medcloud2.nhi.gov.tw/imu/login') ||
      changeInfo.url.includes('medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001'))) {
    console.log("Detected navigation to login page, clearing session data");

    // 重置當前會話數據
    Object.keys(currentSessionData).forEach(key => {
      currentSessionData[key] = null;
    });

    // 從 storage 中移除數據
    chrome.storage.local.remove(['medicationData', 'labData', 'currentUserSession'], function() {
      console.log("Storage data cleared due to logout");
      chrome.action.setBadgeText({ text: "" });
    });
  }
});

// 通用數據保存函數
function saveDataToStorage(type, data, userSession) {
  const storageKey = DATA_TYPE_TO_STORAGE_KEY[type.toLowerCase()] || type + 'Data';

  // 更新會話數據
  currentSessionData[storageKey] = data;
  currentSessionData.currentUserSession = userSession || currentSessionData.currentUserSession;

  // 創建 storage 對象
  const storageObj = {
    [storageKey]: data,
    currentUserSession: userSession || currentSessionData.currentUserSession
  };

  // console.log(`Saving ${type} data to storage with key ${storageKey}:`,
  //   data?.rObject ? `${data.rObject.length} records` : 'No records or invalid format');

  return new Promise((resolve) => {
    chrome.storage.local.set(storageObj, function() {
      // console.log(`${type} data saved to storage with key ${storageKey}`);
      chrome.action.setBadgeText({ text: "✓" });
      chrome.action.setBadgeBackgroundColor({ color: "#4CAF50" });

      const recordCount = (data?.rObject && Array.isArray(data.rObject)) ? data.rObject.length : 0;

      resolve({
        status: "saved",
        recordCount: recordCount,
        error: recordCount ? null : "Zero records or invalid format"
      });
    });
  });
}