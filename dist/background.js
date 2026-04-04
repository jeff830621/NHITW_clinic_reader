(()=>{var k="com.nhitw.host";function M(e){return new Promise((a,t)=>{try{let n=chrome.runtime.connectNative(k),o=!1;n.onMessage.addListener(s=>{o=!0,n.disconnect(),s.success?a(s):t(new Error(s.message||s.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!o){let s=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(s))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function S(e,a,t){return M({action:"write_html",filename:e,content:a,date:t||void 0})}function _(e,a,t){let o=C(new Date),s=[];return t.medicationData?.rObject?.length&&s.push(A(t.medicationData.rObject)),t.chinesemedData?.rObject?.length&&s.push(j(t.chinesemedData.rObject)),t.labData?.rObject?.length&&s.push(T(t.labData.rObject)),t.imagingData?.rObject?.length&&s.push(N(t.imagingData.rObject)),t.allergyData?.rObject?.length&&s.push(U(t.allergyData.rObject)),t.surgeryData?.rObject?.length&&s.push(H(t.surgeryData.rObject)),t.dischargeData?.rObject?.length&&s.push(I(t.dischargeData.rObject)),t.medDaysData?.rObject?.length&&s.push(P(t.medDaysData.rObject)),s.length===0&&s.push('<div class="section"><h2>\u7121\u8CC7\u6599</h2><p>\u5C1A\u672A\u64F7\u53D6\u5230\u4EFB\u4F55\u91AB\u7642\u8CC7\u6599\u3002</p></div>'),L(e,a,o,s.join(`
`))}function x(e,a){let t=a||new Date,n=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),d=String(t.getHours()).padStart(2,"0"),c=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${n}${o}${s}_${d}${c}.html`}function C(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function r(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function f(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function b(e){return e?e.split(";")[0].trim():""}function A(e){let a=D(e,n=>`${n.PER_DATE||n.drug_date||""}|${b(n.HOSP_NAME||n.hosp)}`),t="";for(let[n,o]of Object.entries(a)){let[s,d]=n.split("|"),c=o[0]?.ICD_CODE||o[0]?.icd_code||"",u=o[0]?.ICD_NAME||o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="6">${r(f(s))} \u2014 ${r(d)} ${c?`(${r(c)} ${r(u)})`:""}</td></tr>`;for(let i of o){let h=i.MED_DESC||i.MED_ITEM||i.drug_ename||"",m=i.GENERIC_NAME||i.drug_ing_name||"",p=i.DOSAGE||i.qty||"",y=i.FREQ_DESC||i.drug_fre||"",E=i.MED_DAYS||i.day||"",O=i.ATC_NAME||i.drug_atc5_name||"";t+=`<tr>
        <td>${r(h)}${m?`<br><span class="sub">${r(m)}</span>`:""}</td>
        <td>${r(p)}</td><td>${r(y)}</td><td>${r(E)}</td>
        <td>${r(O)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u897F\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th><th>\u85E5\u7406\u5206\u985E</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function j(e){let a=D(e,n=>`${n.func_date||""}|${b(n.hosp)}`),t="";for(let[n,o]of Object.entries(a)){let[s,d]=n.split("|"),c=o[0]?.icd_code||"",u=o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="4">${r(f(s))} \u2014 ${r(d)} ${c?`(${r(c)} ${r(u)})`:""}</td></tr>`;for(let i of o){let h=i.drug_perscrn_name||i.cdrug_name||"",m=i.order_qty||"",p=i.drug_fre||"",y=i.day||"";t+=`<tr><td>${r(h)}</td><td>${r(m)}</td><td>${r(p)}</td><td>${r(y)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u4E2D\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function T(e){let a=D(e,n=>`${n.real_inspect_date||n.recipe_date||""}|${b(n.hosp)}`),t="";for(let[n,o]of Object.entries(a)){let[s,d]=n.split("|");t+=`<tr class="group-header"><td colspan="5">${r(f(s))} \u2014 ${r(d)}</td></tr>`;for(let c of o){let u=c.order_name||c.assay_item_name||"",i=c.assay_value||"",h=c.consult_value||"",m=c.unit_data||"",p=F(i,h);t+=`<tr>
        <td>${r(u)}</td>
        <td class="${p?"abnormal":""}">${r(i)}</td>
        <td>${r(h)}</td>
        <td>${r(m)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u6AA2\u9A57\u9805\u76EE</th><th>\u7D50\u679C</th><th>\u53C3\u8003\u503C</th><th>\u55AE\u4F4D</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function N(e){let a="";for(let t of e){let n=t.real_inspect_date||t.case_time||t.recipe_date||"",o=b(t.hosp),s=t.order_name||"",d=t.inspect_result||"",c=t.cure_path_name||"";a+=`<tr><td>${r(f(n))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(c)}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u5F71\u50CF\u6AA2\u67E5 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u6AA2\u67E5\u9805\u76EE</th><th>\u90E8\u4F4D</th><th>\u5831\u544A</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function U(e){let a=e.filter(n=>{let o=n.drug_name||"";return o&&!o.includes("\u672A\u8A18\u9304")&&o!=="NP"&&o!=="N.P"&&o!=="N.P."&&!o.includes("\u672A\u904E\u654F")});if(a.length===0)return`<div class="section">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304</h2>
      <div class="section-body"><p>\u7121\u904E\u654F\u7D00\u9304</p></div></div>`;let t="";for(let n of a){let o=n.upload_d||"",s=n.drug_name||"",d=(n.sympton_name||"").replace(/;/g,", "),c=n.allerg_severity_level||"",u=b(n.hosp);t+=`<tr><td>${r(o)}</td><td>${r(s)}</td><td>${r(d)}</td><td>${r(c)}</td><td>${r(u)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304 (${a.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u85E5\u54C1</th><th>\u75C7\u72C0</th><th>\u56B4\u91CD\u5EA6</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function H(e){let a="";for(let t of e){let n=t.exe_s_date||"",o=b(t.hosp),s=t.icd_code||"",d=t.icd_cname||"";a+=`<tr><td>${r(f(n))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u624B\u8853\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u540D\u7A31</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function I(e){let a="";for(let t of e){let n=t.in_date||"",o=t.out_date||"",s=b(t.hosp),d=t.icd_code||"",c=t.icd_cname||"";a+=`<tr><td>${r(f(n))}</td><td>${r(f(o))}</td><td>${r(s)}</td><td>${r(d)}</td><td>${r(c)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u51FA\u9662\u6458\u8981 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u5165\u9662\u65E5</th><th>\u51FA\u9662\u65E5</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u8A3A\u65B7</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function P(e){let a="";for(let t of e){let n=t.MED_DESC||t.MED_ITEM||t.drug_ename||"",o=t.DRUG_LEFT||t.drug_left||"",s=t.PER_DATE||t.drug_date||"",d=b(t.HOSP_NAME||t.hosp);a+=`<tr><td>${r(n)}</td><td>${r(o)}</td><td>${r(f(s))}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u9918\u85E5\u5929\u6578 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1</th><th>\u9918\u85E5\u5929\u6578</th><th>\u958B\u7ACB\u65E5\u671F</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function D(e,a){let t={};for(let n of e){let o=a(n);t[o]||(t[o]=[]),t[o].push(n)}return t}function F(e,a){if(!e||!a||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let n=a.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(n){let d=parseFloat(n[1]),c=parseFloat(n[2]);return t<d||t>c}let o=a.match(/[<≦]\s*([\d.]+)/);if(o)return t>parseFloat(o[1]);let s=a.match(/[>≧]\s*([\d.]+)/);return s?t<parseFloat(s[1]):!1}function L(e,a,t,n){return`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${r(e)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
  .header { background: #1976d2; color: white; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px; }
  .header h1 { font-size: 24px; margin-bottom: 4px; }
  .header .meta { font-size: 14px; opacity: 0.9; }
  .section { background: white; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
  .section h2 { font-size: 16px; padding: 12px 16px; cursor: pointer; user-select: none; background: #fafafa; border-bottom: 1px solid #eee; }
  .section h2:hover { background: #f0f0f0; }
  .section-body { padding: 0; }
  .section-body.collapsed { display: none; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8f9fa; text-align: left; padding: 8px 12px; border-bottom: 2px solid #dee2e6; font-weight: 600; white-space: nowrap; }
  td { padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:hover { background: #f8f9ff; }
  tr.group-header td { background: #e3f2fd; font-weight: 600; font-size: 13px; color: #1565c0; padding: 8px 12px; }
  .abnormal { color: #d32f2f; font-weight: bold; }
  .sub { color: #888; font-size: 11px; }
  .nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .nav a { background: #1976d2; color: white; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-size: 13px; }
  .nav a:hover { background: #1565c0; }
  p { padding: 12px 16px; color: #666; }
  @media print {
    body { padding: 0; background: white; }
    .header { border-radius: 0; }
    .section { box-shadow: none; break-inside: avoid; }
    .section-body.collapsed { display: block !important; }
    .nav { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>${r(e)}</h1>
  <div class="meta">\u8EAB\u5206\u8B49\u865F\uFF1A${r(a)} \uFF5C \u5831\u544A\u7522\u751F\u6642\u9593\uFF1A${r(t)}</div>
</div>
<div class="nav">
  <a href="#" onclick="expandAll()">\u5168\u90E8\u5C55\u958B</a>
  <a href="#" onclick="collapseAll()">\u5168\u90E8\u6536\u5408</a>
  <a href="#" onclick="window.print()">\u5217\u5370</a>
</div>
${n}
<script>
function toggleSection(h2) {
  const body = h2.nextElementSibling;
  const isCollapsed = body.classList.toggle('collapsed');
  h2.textContent = h2.textContent.replace(/^[\u25B8\u25BE]/, isCollapsed ? '\u25B8' : '\u25BE');
}
function expandAll() {
  document.querySelectorAll('.section-body').forEach(b => b.classList.remove('collapsed'));
  document.querySelectorAll('.section h2').forEach(h => h.textContent = h.textContent.replace(/^\u25B8/, '\u25BE'));
}
function collapseAll() {
  document.querySelectorAll('.section-body').forEach(b => b.classList.add('collapsed'));
  document.querySelectorAll('.section h2').forEach(h => h.textContent = h.textContent.replace(/^\u25BE/, '\u25B8'));
}
// Default: expand all sections
expandAll();
<\/script>
</body>
</html>`}var l={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null},$=!1;function w(){$||($=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&($=!1,q())});async function q(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t=l.currentUserSession;if(!t)return;let n=t;t.startsWith("patient_")&&(n=t.replace("patient_",""));let o=n;try{let i=l.token;if(i){let h=i.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),m=decodeURIComponent(atob(h).split("").map(y=>"%"+("00"+y.charCodeAt(0).toString(16)).slice(-2)).join("")),p=JSON.parse(m);p.UserName&&(o=p.UserName)}}catch{}let s={};for(let[i,h]of Object.entries(l))i!=="token"&&i!=="currentUserSession"&&h&&(s[i]=h);let d=_(o,n,s),c=x(o),u=Math.round(new Blob([d]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${c} (${u}KB, ${Object.keys(s).length} data types)`),u>900){console.warn(`[NHITW Clinic] HTML too large (${u}KB), exceeds Native Messaging limit`);return}await S(c,d),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var B={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(B).forEach(([e,a])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${a}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${a}*`]},["responseHeaders"])});var v={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},R=new Map([["openPopup",(e,a,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,a,t)=>{Object.keys(l).forEach(n=>{l[n]=null}),l.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(v),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,a,t)=>{Object.keys(l).forEach(n=>{l[n]=null}),t({status:"cleared"})}],["getSessionData",(e,a,t)=>{t({status:"success",data:l})}],["getDataStatus",(e,a,t)=>(chrome.storage.local.get(Object.values(v),n=>{let o={},s=(c,u)=>{let i=n[u],h=i?.rObject||i?.robject;h&&Array.isArray(h)?o[c]={status:"fetched",count:h.length}:o[c]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(v).forEach(([c,u])=>{let i=d[c]||c;s(i,u)}),t({dataStatus:o})}),!0)],["saveMedicationData",g("medication")],["saveLabData",g("labdata")],["saveChineseMedData",g("chinesemed")],["saveImagingData",g("imaging")],["saveAllergyData",g("allergy")],["saveSurgeryData",g("surgery")],["saveDischargeData",g("discharge")],["saveMedDaysData",g("medDays")],["savePatientSummaryData",g("patientSummary")],["saveToken",(e,a,t)=>{l.token=e.token,l.currentUserSession=e.userSession||l.currentUserSession,w(),t({status:"token_saved"})}]]);function g(e){return function(a,t,n){let o=v[e];if(!o){n({status:"error",error:`Invalid data type: ${e}`});return}l[o]=a.data,l.currentUserSession=a.userSession||l.currentUserSession;let s={[o]:a.data,currentUserSession:a.userSession||l.currentUserSession};chrome.storage.local.set(s,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),w(),a.data&&a.data.rObject&&Array.isArray(a.data.rObject)?n({status:"saved",recordCount:a.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,a,t)=>{e.userSession&&e.userSession!==l.currentUserSession&&(Object.keys(l).forEach(o=>{l[o]=null}),l.currentUserSession=e.userSession);let n=R.get(e.action);return n?(n(e,a,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,a,t)=>{a.url&&(a.url.includes("medcloud2.nhi.gov.tw/imu/login")||a.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(l).forEach(n=>{l[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
