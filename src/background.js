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

async function readEventLog() {
  try {
    const store = await chrome.storage.session.get(EVENT_LOG_KEY);
    return Array.isArray(store[EVENT_LOG_KEY]) ? store[EVENT_LOG_KEY] : [];
  } catch (_) { return []; }
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

async function autoExportToSharedFolder() {
  if (_exportInFlight) {
    console.log('[NHITW Clinic] Export already in flight — skipping concurrent run');
    logEvent('skip.inFlight');
    return;
  }
  _exportInFlight = true;
  try {
    const settings = await chrome.storage.sync.get('sharedFolder');
    const sharedFolder = settings.sharedFolder || {};
    if (!sharedFolder.enabled) { logEvent('skip.disabled'); return; }

    // #9a — MV3 worker restarts wipe module state while the chrome.alarm
    // survives, so this can run with an empty currentSessionData even though
    // every payload sits in chrome.storage.local (saveDataHandler persists
    // them). Rehydrate when memory is empty AND the stored batch is fresh
    // (<10 min) — stale batches stay ignored so a browser-restart alarm can't
    // re-export yesterday's patient.
    const memoryHasData = Object.entries(currentSessionData).some(([k, v]) => {
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
          if (stored[key] && !currentSessionData[key]) { currentSessionData[key] = stored[key]; restored++; }
        }
        if (!currentSessionData.currentUserSession && stored.currentUserSession) {
          currentSessionData.currentUserSession = stored.currentUserSession;
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
    let targetTabId = _activePatientTabId;
    if (targetTabId > 0) {
      try {
        fresh = await chrome.tabs.sendMessage(targetTabId, { action: 'getPatientInfo' });
        console.log(`[NHITW Clinic] Fresh patient info from tracked tab ${targetTabId}:`, fresh);
      } catch (e) {
        console.warn(`[NHITW Clinic] Tracked tab ${targetTabId} unreachable: ${e.message}, falling back`);
        targetTabId = -1;
      }
    }
    if (!fresh) {
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
    // Atomic update: (name, id) move together. Only trust fresh if it has an
    // id — empty responses leave the cached saveToken value intact.
    if (fresh?.id) {
      const switched = fresh.id !== currentSessionData.patientIdFromToken;
      currentSessionData.patientIdFromToken = fresh.id;
      // Only overwrite the cached name when getPatientInfo actually returned
      // one. Some hospitals' JWT omits UserName, so getPatientInfo's
      // JWT-only decode comes back nameless even though saveToken's DOM
      // fallback had already captured the real name. Downgrading a good name
      // to the bare ID here is what regressed filenames back to ID numbers —
      // so keep the existing name unless the patient genuinely changed or we
      // never had a name to begin with.
      if (fresh.name) {
        currentSessionData.patientName = fresh.name;
      } else if (switched || !currentSessionData.patientName) {
        currentSessionData.patientName = fresh.id;
      }
      // Fresh identity is read from the CURRENT tab right now → bind it to the
      // current session (#2), same as the saveToken path.
      currentSessionData._identityCapturedSession = currentSessionData.currentUserSession || null;
      patientMeta = { age: fresh.age ?? null, sex: fresh.sex || '', birthday: fresh.birthday || '' };
    }

    let patientId = currentSessionData.patientIdFromToken;
    let patientName = currentSessionData.patientName;

    // SAFETY — identity/session consistency. The medical payloads are fetched
    // against currentUserSession (the patient currently loaded). If the cached
    // identity (name/id) belongs to a DIFFERENT patient than the session, a
    // patient switch left stale identity behind and exporting now would stamp
    // one patient's records with another's name (陳淑媚 2026-06-29: patient
    // F127375002's 眼科 data was about to be exported under 陳淑媚 R220136259).
    // Defer the export — the new patient's saveToken will sync identity to the
    // session shortly, then the next alarm exports correctly.
    const userSession = currentSessionData.currentUserSession || '';
    if (userSession.startsWith('patient_')) {
      const sessionId = userSession.replace('patient_', '');
      if (sessionId && patientId && sessionId !== patientId) {
        console.warn(`[NHITW Clinic] identity/session mismatch (id=${maskPii(patientId, 4, 3)} vs session=${maskPii(sessionId, 4, 3)}) — deferring export until they sync`);
        logEvent('skip.identityMismatch', `id=${maskPii(patientId, 4, 3)} session=${maskPii(sessionId, 4, 3)}`);
        return;
      }
    }
    // #2 general form — covers token_/dom_ sessions the ID check above can't
    // verify: identity captured under a DIFFERENT session than the current one
    // is stale. Deferring can't help here (there's no ID to sync against), so
    // drop the identity and continue — the fallback naming below produces an
    // anonymous-but-correctly-scoped report instead of one with the wrong name.
    const capturedUnder = currentSessionData._identityCapturedSession;
    if (patientId && capturedUnder && userSession && capturedUnder !== userSession) {
      console.warn(`[NHITW Clinic] identity was captured under a different session (${maskPii(capturedUnder, 8, 3)} ≠ ${maskPii(userSession, 8, 3)}) — dropping stale identity, exporting with fallback naming`);
      currentSessionData.patientName = null;
      currentSessionData.patientIdFromToken = null;
      currentSessionData._identityCapturedSession = null;
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
    for (const [k, v] of Object.entries(currentSessionData)) {
      if (IDENTITY_KEYS.has(k)) continue;
      const arr = v?.rObject;
      dataAtExport[k] = Array.isArray(arr) ? arr.length : (v == null ? 0 : 'present');
    }

    patientMeta._exportLog = await readEventLog();
    patientMeta._identityProbe = {
      generatedAt: new Date().toISOString(),
      resolvedName: maskPii(patientName, 1, 1),
      resolvedId: maskPii(patientId, 4, 3),
      nameSource: patientName === patientId ? 'fallback_to_id' : (currentSessionData.patientName ? 'cache' : 'fresh'),
      activeTabId: _activePatientTabId,
      dataAtExport,
      cached: {
        name: maskPii(currentSessionData.patientName || '', 1, 1),
        id: maskPii(currentSessionData.patientIdFromToken || '', 4, 3),
        session: currentSessionData.currentUserSession || null,
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
    for (const [key, value] of Object.entries(currentSessionData)) {
      if (key !== 'token' && key !== 'currentUserSession' && value) {
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
    let html = generateHtmlReport(patientName, patientId, exportData, patientMeta);
    const filename = getReportFilename(patientName);
    const session = getClinicSession(new Date());
    const originalKB = Math.round(new Blob([html]).size / 1024);
    let sizeKB = originalKB;
    console.log(`[NHITW Clinic] Generating HTML: ${filename} (${sizeKB}KB, ${Object.keys(exportData).length} data types, session=${session})`);

    // Native Messaging is hard-capped near 1 MB per message. The embedded
    // <!--NHITW-DEBUG--> JSON is large (full lab records); strip it first as
    // a cheap recovery before falling back to a placeholder.
    if (sizeKB > 900) {
      html = stripDebugComment(html);
      sizeKB = Math.round(new Blob([html]).size / 1024);
      if (sizeKB <= 900) {
        console.warn(`[NHITW Clinic] HTML trimmed (${originalKB}KB → ${sizeKB}KB) by dropping debug comment`);
      }
    }

    if (sizeKB > 900) {
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
    await writeHtml(filename, html, undefined, session, sharedFolder.retentionDays || 40);
    logEvent('write.ok', `${sizeKB}KB in ${Date.now() - writeStart}ms`);
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
    const sessionSwitch = currentSessionData.currentUserSession &&
      message.userSession && message.userSession !== currentSessionData.currentUserSession;
    logEvent('session.changed', `${maskPii(currentSessionData.currentUserSession || '-', 8, 3)} → ${maskPii(message.userSession || '-', 8, 3)}`);
    if (idSwitch || sessionSwitch) {
      currentSessionData.patientName = null;
      currentSessionData.patientIdFromToken = null;
      currentSessionData._identityCapturedSession = null;
    }
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
    logEvent('data.' + type, Array.isArray(_rows) ? `${_rows.length} rows` : 'present');

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
  if (message.userSession && message.userSession !== currentSessionData.currentUserSession) {
    // console.log("User session changed, resetting temporary data");
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