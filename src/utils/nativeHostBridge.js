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

      port.onMessage.addListener((response) => {
        responded = true;
        port.disconnect();
        if (response.success) {
          resolve(response);
        } else {
          reject(new Error(response.message || response.error || "Unknown host error"));
        }
      });

      port.onDisconnect.addListener(() => {
        if (!responded) {
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
