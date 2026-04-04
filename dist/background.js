(()=>{var E="com.nhitw.host";function k(e){return new Promise((a,t)=>{try{let n=chrome.runtime.connectNative(E),r=!1;n.onMessage.addListener(o=>{r=!0,n.disconnect(),o.success?a(o):t(new Error(o.message||o.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!r){let o=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(o))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function $(e,a,t){return k({action:"write_html",filename:e,content:a,date:t||void 0})}function S(e,a,t){let r=j(new Date),o=[];return o.push(M(t)),t.labData?.rObject?.length&&o.push(N(t.labData.rObject)),t.medicationData?.rObject?.length&&o.push(T(t.medicationData.rObject)),t.chinesemedData?.rObject?.length&&o.push(A(t.chinesemedData.rObject)),t.imagingData?.rObject?.length&&o.push(I(t.imagingData.rObject)),t.allergyData?.rObject?.length&&o.push(U(t.allergyData.rObject)),t.surgeryData?.rObject?.length&&o.push(H(t.surgeryData.rObject)),t.dischargeData?.rObject?.length&&o.push(P(t.dischargeData.rObject)),t.medDaysData?.rObject?.length&&o.push(F(t.medDaysData.rObject)),L(e,a,r,o.join(`
`))}function x(e,a){let t=a||new Date,n=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0"),l=String(t.getHours()).padStart(2,"0"),d=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${n}${r}${o}_${l}${d}.html`}function j(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function s(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function p(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function m(e){return e?e.split(";")[0].trim():""}function D(e,a){let t={};for(let n of e){let r=a(n);t[r]||(t[r]=[]),t[r].push(n)}return t}function C(e,a){if(!e||!a||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let n=a.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(n){let l=parseFloat(n[1]),d=parseFloat(n[2]);return t<l||t>d}let r=a.match(/[<≦]\s*([\d.]+)/);if(r)return t>parseFloat(r[1]);let o=a.match(/[>≧]\s*([\d.]+)/);return o?t<parseFloat(o[1]):!1}function M(e){let a={};function t(o,l,d,i){if(!o)return;let c=o.trim();a[c]||(a[c]={code:c,name:l||"",dates:new Set,hospitals:new Set}),l&&!a[c].name&&(a[c].name=l),d&&a[c].dates.add(p(d)),i&&a[c].hospitals.add(m(i))}if(e.medicationData?.rObject)for(let o of e.medicationData.rObject)t(o.ICD_CODE||o.icd_code,o.ICD_NAME||o.icd_cname,o.PER_DATE||o.drug_date,o.HOSP_NAME||o.hosp);if(e.chinesemedData?.rObject)for(let o of e.chinesemedData.rObject)t(o.icd_code,o.icd_cname,o.func_date,o.hosp);if(e.labData?.rObject)for(let o of e.labData.rObject)t(o.icd_code,o.icd_cname,o.real_inspect_date||o.recipe_date,o.hosp);if(e.imagingData?.rObject)for(let o of e.imagingData.rObject)t(o.icd_code,o.icd_cname,o.real_inspect_date||o.case_time||o.recipe_date,o.hosp);let n=Object.values(a);if(n.length===0)return`<div class="section full-width">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u5F80\u8A3A\u65B7</h2>
      <div class="section-body"><p>\u7121\u8A3A\u65B7\u7D00\u9304</p></div></div>`;n.sort((o,l)=>{let d=[...o.dates].sort().pop()||"";return([...l.dates].sort().pop()||"").localeCompare(d)});let r="";for(let o of n){let l=[...o.dates].sort().reverse().join(", "),d=[...o.hospitals].join(", ");r+=`<tr><td><strong>${s(o.code)}</strong></td><td>${s(o.name)}</td><td>${s(l)}</td><td>${s(d)}</td></tr>`}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u5F80\u8A3A\u65B7 (${n.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u8A3A\u65B7\u78BC</th><th>\u8A3A\u65B7\u540D\u7A31</th><th>\u5C31\u8A3A\u65E5\u671F</th><th>\u91AB\u7642\u9662\u6240</th></tr></thead>
      <tbody>${r}</tbody></table>
    </div></div>`}function N(e){let a=e.filter(r=>{let o=r.assay_value;return o&&o.trim()!==""&&o.trim()!=="***"});if(a.length===0)return`<div class="section full-width">
      <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A</h2>
      <div class="section-body"><p>\u7121\u6AA2\u9A57\u7D50\u679C</p></div></div>`;let t=D(a,r=>`${r.real_inspect_date||r.recipe_date||""}|${m(r.hosp)}`),n="";for(let[r,o]of Object.entries(t)){let[l,d]=r.split("|");n+=`<tr class="group-header"><td colspan="4">${s(p(l))} \u2014 ${s(d)}</td></tr>`;for(let i of o){let c=i.assay_item_name||i.order_name||"",g=i.assay_value||"",h=i.consult_value||"",b=i.unit_data||"",y=C(g,h);n+=`<tr>
        <td>${s(c)}</td>
        <td class="${y?"abnormal":""}">${s(g)}</td>
        <td>${s(h)}</td>
        <td>${s(b)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A (${a.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u6AA2\u9A57\u9805\u76EE</th><th>\u7D50\u679C</th><th>\u53C3\u8003\u503C</th><th>\u55AE\u4F4D</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function T(e){let a=D(e,n=>`${n.PER_DATE||n.drug_date||""}|${m(n.HOSP_NAME||n.hosp)}`),t="";for(let[n,r]of Object.entries(a)){let[o,l]=n.split("|"),d=r[0]?.ICD_CODE||r[0]?.icd_code||"",i=r[0]?.ICD_NAME||r[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="5">${s(p(o))} \u2014 ${s(l)} ${d?`(${s(d)} ${s(i)})`:""}</td></tr>`;for(let c of r){let g=c.MED_DESC||c.MED_ITEM||c.drug_ename||"",h=c.GENERIC_NAME||c.drug_ing_name||"",b=c.DOSAGE||c.qty||"",y=c.FREQ_DESC||c.drug_fre||"",O=c.MED_DAYS||c.day||"";t+=`<tr>
        <td>${s(g)}${h?`<br><span class="sub">${s(h)}</span>`:""}</td>
        <td>${s(b)}</td><td>${s(y)}</td><td>${s(O)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u897F\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function A(e){let a=D(e,n=>`${n.func_date||""}|${m(n.hosp)}`),t="";for(let[n,r]of Object.entries(a)){let[o,l]=n.split("|"),d=r[0]?.icd_code||"",i=r[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="4">${s(p(o))} \u2014 ${s(l)} ${d?`(${s(d)} ${s(i)})`:""}</td></tr>`;for(let c of r){let g=c.drug_perscrn_name||c.cdrug_name||"",h=c.order_qty||"",b=c.drug_fre||"",y=c.day||"";t+=`<tr><td>${s(g)}</td><td>${s(h)}</td><td>${s(b)}</td><td>${s(y)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u4E2D\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function I(e){let a="";for(let t of e){let n=t.real_inspect_date||t.case_time||t.recipe_date||"",r=m(t.hosp),o=t.order_name||"",l=t.inspect_result||"",d=t.cure_path_name||"";a+=`<tr><td>${s(p(n))}</td><td>${s(r)}</td><td>${s(o)}</td><td>${s(d)}</td><td>${s(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u5F71\u50CF\u6AA2\u67E5 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u6AA2\u67E5\u9805\u76EE</th><th>\u90E8\u4F4D</th><th>\u5831\u544A</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function U(e){let a=e.filter(n=>{let r=n.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(a.length===0)return`<div class="section">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304</h2>
      <div class="section-body"><p>\u7121\u904E\u654F\u7D00\u9304</p></div></div>`;let t="";for(let n of a){let r=n.upload_d||"",o=n.drug_name||"",l=(n.sympton_name||"").replace(/;/g,", "),d=n.allerg_severity_level||"",i=m(n.hosp);t+=`<tr><td>${s(r)}</td><td>${s(o)}</td><td>${s(l)}</td><td>${s(d)}</td><td>${s(i)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304 (${a.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u85E5\u54C1</th><th>\u75C7\u72C0</th><th>\u56B4\u91CD\u5EA6</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function H(e){let a="";for(let t of e){let n=t.exe_s_date||"",r=m(t.hosp),o=t.icd_code||"",l=t.icd_cname||"";a+=`<tr><td>${s(p(n))}</td><td>${s(r)}</td><td>${s(o)}</td><td>${s(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u624B\u8853\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u540D\u7A31</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function P(e){let a="";for(let t of e){let n=t.in_date||"",r=t.out_date||"",o=m(t.hosp),l=t.icd_code||"",d=t.icd_cname||"";a+=`<tr><td>${s(p(n))}</td><td>${s(p(r))}</td><td>${s(o)}</td><td>${s(l)}</td><td>${s(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u51FA\u9662\u6458\u8981 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u5165\u9662\u65E5</th><th>\u51FA\u9662\u65E5</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u8A3A\u65B7</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function F(e){let a="";for(let t of e){let n=t.MED_DESC||t.MED_ITEM||t.drug_ename||"",r=t.DRUG_LEFT||t.drug_left||"",o=t.PER_DATE||t.drug_date||"",l=m(t.HOSP_NAME||t.hosp);a+=`<tr><td>${s(n)}</td><td>${s(r)}</td><td>${s(p(o))}</td><td>${s(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u9918\u85E5\u5929\u6578 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1</th><th>\u9918\u85E5\u5929\u6578</th><th>\u958B\u7ACB\u65E5\u671F</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function L(e,a,t,n){return`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${s(e)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; background: #f5f5f5; color: #333; padding: 16px; }
  .header { background: #1976d2; color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 12px; }
  .header h1 { font-size: 22px; margin-bottom: 2px; }
  .header .meta { font-size: 13px; opacity: 0.9; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .section { background: white; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
  .section.full-width { grid-column: 1 / -1; }
  .section h2 { font-size: 14px; padding: 8px 12px; cursor: pointer; user-select: none; background: #fafafa; border-bottom: 1px solid #eee; margin: 0; }
  .section h2:hover { background: #f0f0f0; }
  .section-body { padding: 0; }
  .section-body.collapsed { display: none; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #f8f9fa; text-align: left; padding: 5px 8px; border-bottom: 2px solid #dee2e6; font-weight: 600; white-space: nowrap; }
  td { padding: 4px 8px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:hover { background: #f8f9ff; }
  tr.group-header td { background: #e3f2fd; font-weight: 600; font-size: 12px; color: #1565c0; padding: 6px 8px; }
  .abnormal { color: #d32f2f; font-weight: bold; }
  .sub { color: #888; font-size: 10px; }
  .nav { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .nav a { background: #1976d2; color: white; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px; cursor: pointer; }
  .nav a:hover { background: #1565c0; }
  p { padding: 8px 12px; color: #666; font-size: 12px; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  @media print {
    body { padding: 0; background: white; }
    .header { border-radius: 0; }
    .grid { grid-template-columns: 1fr 1fr; gap: 8px; }
    .section { box-shadow: none; break-inside: avoid; }
    .section-body.collapsed { display: block !important; }
    .nav { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>${s(e)}</h1>
  <div class="meta">\u8EAB\u5206\u8B49\u865F\uFF1A${s(a)} \uFF5C \u5831\u544A\u7522\u751F\u6642\u9593\uFF1A${s(t)}</div>
</div>
<div class="nav">
  <a onclick="expandAll()">\u5168\u90E8\u5C55\u958B</a>
  <a onclick="collapseAll()">\u5168\u90E8\u6536\u5408</a>
  <a onclick="window.print()">\u5217\u5370</a>
</div>
<div class="grid">
${n}
</div>
<script>
function toggleSection(h2) {
  var body = h2.nextElementSibling;
  var isCollapsed = body.classList.toggle('collapsed');
  h2.textContent = h2.textContent.replace(/^[\u25B8\u25BE]/, isCollapsed ? '\u25B8' : '\u25BE');
}
function expandAll() {
  document.querySelectorAll('.section-body').forEach(function(b) { b.classList.remove('collapsed'); });
  document.querySelectorAll('.section h2').forEach(function(h) { h.textContent = h.textContent.replace(/^\u25B8/, '\u25BE'); });
}
function collapseAll() {
  document.querySelectorAll('.section-body').forEach(function(b) { b.classList.add('collapsed'); });
  document.querySelectorAll('.section h2').forEach(function(h) { h.textContent = h.textContent.replace(/^\u25BE/, '\u25B8'); });
}
expandAll();
<\/script>
</body>
</html>`}var u={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null},_=!1;function w(){_||(_=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(_=!1,B())});async function B(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t=null,n=null;try{let i=u.token;if(i){i.startsWith("Bearer ")&&(i=i.slice(7));let c=i.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),g=decodeURIComponent(atob(c).split("").map(b=>"%"+("00"+b.charCodeAt(0).toString(16)).slice(-2)).join("")),h=JSON.parse(g);console.log("[NHITW Clinic] JWT payload keys:",Object.keys(h).join(", ")),console.log("[NHITW Clinic] UserID:",h.UserID,"UserName:",h.UserName),h.UserID&&(t=h.UserID),h.UserName&&(n=h.UserName)}}catch(i){console.warn("[NHITW Clinic] Token parsing failed:",i.message)}if(!t){let i=u.currentUserSession;if(!i){console.log("[NHITW Clinic] No session and no token, skipping export");return}i.startsWith("patient_")?t=i.replace("patient_",""):t=i,console.log("[NHITW Clinic] Using session for ID:",t)}n||(n=t),console.log(`[NHITW Clinic] Export: ID=${t}, Name=${n}`);let r={};for(let[i,c]of Object.entries(u))i!=="token"&&i!=="currentUserSession"&&c&&(r[i]=c);let o=S(n,t,r),l=x(n),d=Math.round(new Blob([o]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${l} (${d}KB, ${Object.keys(r).length} data types)`),d>900){console.warn(`[NHITW Clinic] HTML too large (${d}KB), exceeds Native Messaging limit`);return}await $(l,o),console.log(`[NHITW Clinic] HTML report saved: ${l}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var q={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(q).forEach(([e,a])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${a}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${a}*`]},["responseHeaders"])});var v={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},W=new Map([["openPopup",(e,a,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,a,t)=>{Object.keys(u).forEach(n=>{u[n]=null}),u.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(v),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,a,t)=>{Object.keys(u).forEach(n=>{u[n]=null}),t({status:"cleared"})}],["getSessionData",(e,a,t)=>{t({status:"success",data:u})}],["getDataStatus",(e,a,t)=>(chrome.storage.local.get(Object.values(v),n=>{let r={},o=(d,i)=>{let c=n[i],g=c?.rObject||c?.robject;g&&Array.isArray(g)?r[d]={status:"fetched",count:g.length}:r[d]={status:"none",count:0}},l={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(v).forEach(([d,i])=>{let c=l[d]||d;o(c,i)}),t({dataStatus:r})}),!0)],["saveMedicationData",f("medication")],["saveLabData",f("labdata")],["saveChineseMedData",f("chinesemed")],["saveImagingData",f("imaging")],["saveAllergyData",f("allergy")],["saveSurgeryData",f("surgery")],["saveDischargeData",f("discharge")],["saveMedDaysData",f("medDays")],["savePatientSummaryData",f("patientSummary")],["saveToken",(e,a,t)=>{u.token=e.token,u.currentUserSession=e.userSession||u.currentUserSession,w(),t({status:"token_saved"})}]]);function f(e){return function(a,t,n){let r=v[e];if(!r){n({status:"error",error:`Invalid data type: ${e}`});return}u[r]=a.data,u.currentUserSession=a.userSession||u.currentUserSession;let o={[r]:a.data,currentUserSession:a.userSession||u.currentUserSession};chrome.storage.local.set(o,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),w(),a.data&&a.data.rObject&&Array.isArray(a.data.rObject)?n({status:"saved",recordCount:a.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,a,t)=>{e.userSession&&e.userSession!==u.currentUserSession&&(Object.keys(u).forEach(r=>{u[r]=null}),u.currentUserSession=e.userSession);let n=W.get(e.action);return n?(n(e,a,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,a,t)=>{a.url&&(a.url.includes("medcloud2.nhi.gov.tw/imu/login")||a.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(u).forEach(n=>{u[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
