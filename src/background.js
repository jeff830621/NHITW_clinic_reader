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
const IDENTITY_KEYS = new Set(['token', 'currentUserSession', 'patientName', 'patientIdFromToken']);

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
let _exportPending = false;

function scheduleExport() {
  if (!_exportPending) {
    _exportPending = true;
    // Use chrome.alarms for MV3 Service Worker reliability (min 1 second with delayInMinutes hack)
    // Fallback: just use setTimeout but also set an alarm as backup
    chrome.alarms.create('htmlExport', { delayInMinutes: 0.1 }); // ~6 seconds
  }
}

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'htmlExport') {
    _exportPending = false;
    autoExportToSharedFolder().catch(err => {
      console.warn('[NHITW Clinic] Export alarm handler error:', err.message);
    });
  }
});

async function autoExportToSharedFolder() {
  try {
    const settings = await chrome.storage.sync.get('sharedFolder');
    const sharedFolder = settings.sharedFolder || {};
    if (!sharedFolder.enabled) return;

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
      patientMeta = { age: fresh.age ?? null, sex: fresh.sex || '', birthday: fresh.birthday || '' };
    }

    let patientId = currentSessionData.patientIdFromToken;
    let patientName = currentSessionData.patientName;

    // Fallback ID: extract from currentUserSession (format: "patient_A123456789")
    if (!patientId) {
      const session = currentSessionData.currentUserSession;
      if (!session) {
        console.log('[NHITW Clinic] No session data, skipping export');
        return;
      }
      patientId = session.startsWith('patient_') ? session.replace('patient_', '') : session;
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
      await writeHtml(filename, html, undefined, session);
      return;
    }

    await writeHtml(filename, html, undefined, session);
    console.log(`[NHITW Clinic] HTML report saved: ${session}/${filename}`);
  } catch (err) {
    console.warn('[NHITW Clinic] Auto-export failed (non-blocking):', err.message);
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
  // imue0100 = 中醫處置 / 針灸治療. Captures visits where the doctor only
  // did acupuncture and prescribed no Chinese herbs — those rows are
  // missing from imue0090 (中醫用藥) entirely. Endpoint exact path inferred
  // from original upstream commented-out scaffolding; if NHI returns 404
  // the listener just stays silent (no side effects).
  acupuncture: "medcloud2.nhi.gov.tw/imu/api/imue0100/imue0100s02/get-data",
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

    // 保存到 storage
    const storageObj = {
      [storageKey]: message.data,
      currentUserSession: message.userSession || currentSessionData.currentUserSession
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