// Content script entrypoint.
// Loads the NHI cloud data interceptor (legacyContent.js) which:
//   - Hooks fetch / XHR to capture NHI cloud API responses
//   - Decodes JWT bearer tokens to extract patient name + ID
//   - Forwards captured data + token to background.js via chrome.runtime.sendMessage
import "./legacyContent.js";
