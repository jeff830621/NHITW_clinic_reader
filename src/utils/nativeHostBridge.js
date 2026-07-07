/**
 * nativeHostBridge.js
 * Bridges Chrome extension ↔ PowerShell Native Messaging Host.
 * Each call opens a new native connection (one-shot pattern).
 */

const HOST_NAME = "com.nhitw.host";

function sendNativeMessage(message) {
  return new Promise((resolve, reject) => {
    try {
      const port = chrome.runtime.connectNative(HOST_NAME);
      let responded = false;

      // A hung host (share offline mid-write, AV lock) used to leave this
      // promise pending forever — the export wedged with no error and the open
      // port kept the worker alive. Bound it.
      const timer = setTimeout(() => {
        if (!responded) {
          responded = true;
          try { port.disconnect(); } catch (_) {}
          reject(new Error("NATIVE_HOST_TIMEOUT: 主機 20 秒未回應（共享資料夾離線或檔案被鎖定？）"));
        }
      }, 20000);

      port.onMessage.addListener((response) => {
        if (responded) return;
        responded = true;
        clearTimeout(timer);
        port.disconnect();
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message || response.error || "Unknown host error"));
        }
      });

      port.onDisconnect.addListener(() => {
        if (!responded) {
          responded = true;
          clearTimeout(timer);
          const error = chrome.runtime.lastError?.message || "Native host disconnected";
          reject(new Error(error));
        }
      });

      port.postMessage(message);
    } catch (err) {
      reject(new Error(`Native messaging unavailable: ${err.message}`));
    }
  });
}

export async function writePatient(patientId, name, data, date) {
  return sendNativeMessage({
    action: "write_patient",
    patient_id: patientId,
    name: name,
    data: data,
    date: date || undefined,
  });
}

export async function readManifest(date) {
  return sendNativeMessage({
    action: "read_manifest",
    date: date || undefined,
  });
}

export async function readPatient(filename, date) {
  return sendNativeMessage({
    action: "read_patient",
    filename: filename,
    date: date || undefined,
  });
}

/**
 * Write an HTML report file to the shared folder.
 * @param {string} filename - basename only (e.g. "王小明_20260525_1030.html")
 * @param {string} content  - full HTML
 * @param {string} [date]   - "yyyy-MM-dd" date folder; defaults to host today
 * @param {string} [session] - "早診"/"午診"/"晚診" subfolder under date folder
 */
export async function writeHtml(filename, content, date, session) {
  return sendNativeMessage({
    action: "write_html",
    filename: filename,
    content: content,
    date: date || undefined,
    session: session || undefined,
  });
}

export async function searchPatient(query) {
  return sendNativeMessage({
    action: "search_patient",
    query: query,
  });
}

export async function cleanup(retentionDays) {
  return sendNativeMessage({
    action: "cleanup",
    retentionDays: retentionDays || undefined,
  });
}

export async function isHostAvailable() {
  try {
    await readManifest();
    return true;
  } catch {
    return false;
  }
}
