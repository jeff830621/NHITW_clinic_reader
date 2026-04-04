(()=>{var E="com.nhitw.host";function O(e){return new Promise((n,t)=>{try{let a=chrome.runtime.connectNative(E),o=!1;a.onMessage.addListener(s=>{o=!0,a.disconnect(),s.success?n(s):t(new Error(s.message||s.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!o){let s=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(s))}}),a.postMessage(e)}catch(a){t(new Error(`Native messaging unavailable: ${a.message}`))}})}async function S(e,n,t){return O({action:"write_html",filename:e,content:n,date:t||void 0})}function $(e,n,t){let o=k(new Date),s=[];return t.medicationData?.rObject?.length&&s.push(A(t.medicationData.rObject)),t.chinesemedData?.rObject?.length&&s.push(C(t.chinesemedData.rObject)),t.labData?.rObject?.length&&s.push(j(t.labData.rObject)),t.imagingData?.rObject?.length&&s.push(M(t.imagingData.rObject)),t.allergyData?.rObject?.length&&s.push(T(t.allergyData.rObject)),t.surgeryData?.rObject?.length&&s.push(N(t.surgeryData.rObject)),t.dischargeData?.rObject?.length&&s.push(U(t.dischargeData.rObject)),t.medDaysData?.rObject?.length&&s.push(F(t.medDaysData.rObject)),s.length===0&&s.push('<div class="section"><h2>\u7121\u8CC7\u6599</h2><p>\u5C1A\u672A\u64F7\u53D6\u5230\u4EFB\u4F55\u91AB\u7642\u8CC7\u6599\u3002</p></div>'),H(e,n,o,s.join(`
`))}function _(e,n){let t=n||new Date,a=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),d=String(t.getHours()).padStart(2,"0"),c=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${a}${o}${s}_${d}${c}.html`}function k(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function r(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function m(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function f(e){return e?e.split(";")[0].trim():""}function A(e){let n=D(e,a=>`${a.PER_DATE||a.drug_date||""}|${f(a.HOSP_NAME||a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,d]=a.split("|"),c=o[0]?.ICD_CODE||o[0]?.icd_code||"",u=o[0]?.ICD_NAME||o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="6">${r(m(s))} \u2014 ${r(d)} ${c?`(${r(c)} ${r(u)})`:""}</td></tr>`;for(let i of o){let h=i.MED_DESC||i.MED_ITEM||i.drug_ename||"",g=i.GENERIC_NAME||i.drug_ing_name||"",b=i.DOSAGE||i.qty||"",v=i.FREQ_DESC||i.drug_fre||"",x=i.MED_DAYS||i.day||"",w=i.ATC_NAME||i.drug_atc5_name||"";t+=`<tr>
        <td>${r(h)}${g?`<br><span class="sub">${r(g)}</span>`:""}</td>
        <td>${r(b)}</td><td>${r(v)}</td><td>${r(x)}</td>
        <td>${r(w)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u897F\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th><th>\u85E5\u7406\u5206\u985E</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function C(e){let n=D(e,a=>`${a.func_date||""}|${f(a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,d]=a.split("|"),c=o[0]?.icd_code||"",u=o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="4">${r(m(s))} \u2014 ${r(d)} ${c?`(${r(c)} ${r(u)})`:""}</td></tr>`;for(let i of o){let h=i.drug_perscrn_name||i.cdrug_name||"",g=i.order_qty||"",b=i.drug_fre||"",v=i.day||"";t+=`<tr><td>${r(h)}</td><td>${r(g)}</td><td>${r(b)}</td><td>${r(v)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u4E2D\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function j(e){let n=D(e,a=>`${a.real_inspect_date||a.recipe_date||""}|${f(a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,d]=a.split("|");t+=`<tr class="group-header"><td colspan="5">${r(m(s))} \u2014 ${r(d)}</td></tr>`;for(let c of o){let u=c.order_name||c.assay_item_name||"",i=c.assay_value||"",h=c.consult_value||"",g=c.unit_data||"",b=P(i,h);t+=`<tr>
        <td>${r(u)}</td>
        <td class="${b?"abnormal":""}">${r(i)}</td>
        <td>${r(h)}</td>
        <td>${r(g)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u6AA2\u9A57\u9805\u76EE</th><th>\u7D50\u679C</th><th>\u53C3\u8003\u503C</th><th>\u55AE\u4F4D</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function M(e){let n="";for(let t of e){let a=t.real_inspect_date||t.case_time||t.recipe_date||"",o=f(t.hosp),s=t.order_name||"",d=t.inspect_result||"",c=t.cure_path_name||"";n+=`<tr><td>${r(m(a))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(c)}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u5F71\u50CF\u6AA2\u67E5 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u6AA2\u67E5\u9805\u76EE</th><th>\u90E8\u4F4D</th><th>\u5831\u544A</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function T(e){let n=e.filter(a=>{let o=a.drug_name||"";return o&&!o.includes("\u672A\u8A18\u9304")&&o!=="NP"&&o!=="N.P"&&o!=="N.P."&&!o.includes("\u672A\u904E\u654F")});if(n.length===0)return`<div class="section">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304</h2>
      <div class="section-body"><p>\u7121\u904E\u654F\u7D00\u9304</p></div></div>`;let t="";for(let a of n){let o=a.upload_d||"",s=a.drug_name||"",d=(a.sympton_name||"").replace(/;/g,", "),c=a.allerg_severity_level||"",u=f(a.hosp);t+=`<tr><td>${r(o)}</td><td>${r(s)}</td><td>${r(d)}</td><td>${r(c)}</td><td>${r(u)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304 (${n.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u85E5\u54C1</th><th>\u75C7\u72C0</th><th>\u56B4\u91CD\u5EA6</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function N(e){let n="";for(let t of e){let a=t.exe_s_date||"",o=f(t.hosp),s=t.icd_code||"",d=t.icd_cname||"";n+=`<tr><td>${r(m(a))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u624B\u8853\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u540D\u7A31</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function U(e){let n="";for(let t of e){let a=t.in_date||"",o=t.out_date||"",s=f(t.hosp),d=t.icd_code||"",c=t.icd_cname||"";n+=`<tr><td>${r(m(a))}</td><td>${r(m(o))}</td><td>${r(s)}</td><td>${r(d)}</td><td>${r(c)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u51FA\u9662\u6458\u8981 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u5165\u9662\u65E5</th><th>\u51FA\u9662\u65E5</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u8A3A\u65B7</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function F(e){let n="";for(let t of e){let a=t.MED_DESC||t.MED_ITEM||t.drug_ename||"",o=t.DRUG_LEFT||t.drug_left||"",s=t.PER_DATE||t.drug_date||"",d=f(t.HOSP_NAME||t.hosp);n+=`<tr><td>${r(a)}</td><td>${r(o)}</td><td>${r(m(s))}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u9918\u85E5\u5929\u6578 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1</th><th>\u9918\u85E5\u5929\u6578</th><th>\u958B\u7ACB\u65E5\u671F</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function D(e,n){let t={};for(let a of e){let o=n(a);t[o]||(t[o]=[]),t[o].push(a)}return t}function P(e,n){if(!e||!n||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let a=n.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a){let d=parseFloat(a[1]),c=parseFloat(a[2]);return t<d||t>c}let o=n.match(/[<≦]\s*([\d.]+)/);if(o)return t>parseFloat(o[1]);let s=n.match(/[>≧]\s*([\d.]+)/);return s?t<parseFloat(s[1]):!1}function H(e,n,t,a){return`<!DOCTYPE html>
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
  <div class="meta">\u8EAB\u5206\u8B49\u865F\uFF1A${r(n)} \uFF5C \u5831\u544A\u7522\u751F\u6642\u9593\uFF1A${r(t)}</div>
</div>
<div class="nav">
  <a href="#" onclick="expandAll()">\u5168\u90E8\u5C55\u958B</a>
  <a href="#" onclick="collapseAll()">\u5168\u90E8\u6536\u5408</a>
  <a href="#" onclick="window.print()">\u5217\u5370</a>
</div>
${a}
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
</html>`}var l={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null};async function I(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t=l.currentUserSession;if(!t)return;let a=t;t.startsWith("patient_")&&(a=t.replace("patient_",""));let o=a;try{let u=l.token;if(u){let i=u.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),h=decodeURIComponent(atob(i).split("").map(b=>"%"+("00"+b.charCodeAt(0).toString(16)).slice(-2)).join("")),g=JSON.parse(h);g.UserName&&(o=g.UserName)}}catch{}let s={};for(let[u,i]of Object.entries(l))u!=="token"&&u!=="currentUserSession"&&i&&(s[u]=i);let d=$(o,a,s),c=_(o);await S(c,d),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var q={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(q).forEach(([e,n])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(n)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${n}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(n)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${n}*`]},["responseHeaders"])});var y={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},L=new Map([["openPopup",(e,n,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,n,t)=>{Object.keys(l).forEach(a=>{l[a]=null}),l.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(y),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,n,t)=>{Object.keys(l).forEach(a=>{l[a]=null}),t({status:"cleared"})}],["getSessionData",(e,n,t)=>{t({status:"success",data:l})}],["getDataStatus",(e,n,t)=>(chrome.storage.local.get(Object.values(y),a=>{let o={},s=(c,u)=>{let i=a[u],h=i?.rObject||i?.robject;h&&Array.isArray(h)?o[c]={status:"fetched",count:h.length}:o[c]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(y).forEach(([c,u])=>{let i=d[c]||c;s(i,u)}),t({dataStatus:o})}),!0)],["saveMedicationData",p("medication")],["saveLabData",p("labdata")],["saveChineseMedData",p("chinesemed")],["saveImagingData",p("imaging")],["saveAllergyData",p("allergy")],["saveSurgeryData",p("surgery")],["saveDischargeData",p("discharge")],["saveMedDaysData",p("medDays")],["savePatientSummaryData",p("patientSummary")],["saveToken",(e,n,t)=>{l.token=e.token,l.currentUserSession=e.userSession||l.currentUserSession,t({status:"token_saved"})}]]);function p(e){return function(n,t,a){let o=y[e];if(!o){a({status:"error",error:`Invalid data type: ${e}`});return}l[o]=n.data,l.currentUserSession=n.userSession||l.currentUserSession;let s={[o]:n.data,currentUserSession:n.userSession||l.currentUserSession};chrome.storage.local.set(s,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),I(),n.data&&n.data.rObject&&Array.isArray(n.data.rObject)?a({status:"saved",recordCount:n.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,n,t)=>{e.userSession&&e.userSession!==l.currentUserSession&&(Object.keys(l).forEach(o=>{l[o]=null}),l.currentUserSession=e.userSession);let a=L.get(e.action);return a?(a(e,n,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,n,t)=>{n.url&&(n.url.includes("medcloud2.nhi.gov.tw/imu/login")||n.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(l).forEach(a=>{l[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
