(()=>{var E="com.nhitw.host";function k(e){return new Promise((o,t)=>{try{let a=chrome.runtime.connectNative(E),r=!1;a.onMessage.addListener(n=>{r=!0,a.disconnect(),n.success?o(n):t(new Error(n.message||n.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!r){let n=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(n))}}),a.postMessage(e)}catch(a){t(new Error(`Native messaging unavailable: ${a.message}`))}})}async function $(e,o,t){return k({action:"write_html",filename:e,content:o,date:t||void 0})}function S(e,o,t){let r=j(new Date),n=[];return n.push(M(t)),t.labData?.rObject?.length&&n.push(A(t.labData.rObject)),t.medicationData?.rObject?.length&&n.push(T(t.medicationData.rObject)),t.chinesemedData?.rObject?.length&&n.push(N(t.chinesemedData.rObject)),t.imagingData?.rObject?.length&&n.push(I(t.imagingData.rObject)),t.allergyData?.rObject?.length&&n.push(H(t.allergyData.rObject)),t.surgeryData?.rObject?.length&&n.push(U(t.surgeryData.rObject)),t.dischargeData?.rObject?.length&&n.push(P(t.dischargeData.rObject)),t.medDaysData?.rObject?.length&&n.push(F(t.medDaysData.rObject)),L(e,o,r,n.join(`
`))}function x(e,o){let t=o||new Date,a=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),n=String(t.getDate()).padStart(2,"0"),d=String(t.getHours()).padStart(2,"0"),c=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${a}${r}${n}_${d}${c}.html`}function j(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function s(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function m(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function p(e){return e?e.split(";")[0].trim():""}function D(e,o){let t={};for(let a of e){let r=o(a);t[r]||(t[r]=[]),t[r].push(a)}return t}function C(e,o){if(!e||!o||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let a=o.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a){let d=parseFloat(a[1]),c=parseFloat(a[2]);return t<d||t>c}let r=o.match(/[<≦]\s*([\d.]+)/);if(r)return t>parseFloat(r[1]);let n=o.match(/[>≧]\s*([\d.]+)/);return n?t<parseFloat(n[1]):!1}function M(e){let o={};function t(n,d,c,l){if(!n)return;let i=n.trim();o[i]||(o[i]={code:i,name:d||"",dates:new Set,hospitals:new Set}),d&&!o[i].name&&(o[i].name=d),c&&o[i].dates.add(m(c)),l&&o[i].hospitals.add(p(l))}if(e.medicationData?.rObject)for(let n of e.medicationData.rObject)t(n.ICD_CODE||n.icd_code,n.ICD_NAME||n.icd_cname,n.PER_DATE||n.drug_date,n.HOSP_NAME||n.hosp);if(e.chinesemedData?.rObject)for(let n of e.chinesemedData.rObject)t(n.icd_code,n.icd_cname,n.func_date,n.hosp);if(e.labData?.rObject)for(let n of e.labData.rObject)t(n.icd_code,n.icd_cname,n.real_inspect_date||n.recipe_date,n.hosp);if(e.imagingData?.rObject)for(let n of e.imagingData.rObject)t(n.icd_code,n.icd_cname,n.real_inspect_date||n.case_time||n.recipe_date,n.hosp);let a=Object.values(o);if(a.length===0)return`<div class="section full-width">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u5F80\u8A3A\u65B7</h2>
      <div class="section-body"><p>\u7121\u8A3A\u65B7\u7D00\u9304</p></div></div>`;a.sort((n,d)=>{let c=[...n.dates].sort().pop()||"";return([...d.dates].sort().pop()||"").localeCompare(c)});let r="";for(let n of a){let d=[...n.dates].sort().reverse().join(", "),c=[...n.hospitals].join(", ");r+=`<tr><td><strong>${s(n.code)}</strong></td><td>${s(n.name)}</td><td>${s(d)}</td><td>${s(c)}</td></tr>`}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u5F80\u8A3A\u65B7 (${a.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u8A3A\u65B7\u78BC</th><th>\u8A3A\u65B7\u540D\u7A31</th><th>\u5C31\u8A3A\u65E5\u671F</th><th>\u91AB\u7642\u9662\u6240</th></tr></thead>
      <tbody>${r}</tbody></table>
    </div></div>`}function A(e){let o=e.filter(r=>{let n=r.assay_value;return n&&n.trim()!==""&&n.trim()!=="***"});if(o.length===0)return`<div class="section full-width">
      <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A</h2>
      <div class="section-body"><p>\u7121\u6AA2\u9A57\u7D50\u679C</p></div></div>`;let t=D(o,r=>`${r.real_inspect_date||r.recipe_date||""}|${p(r.hosp)}`),a="";for(let[r,n]of Object.entries(t)){let[d,c]=r.split("|");a+=`<tr class="group-header"><td colspan="4">${s(m(d))} \u2014 ${s(c)}</td></tr>`;for(let l of n){let i=l.assay_item_name||l.order_name||"",h=l.assay_value||"",g=l.consult_value||"",b=l.unit_data||"",y=C(h,g);a+=`<tr>
        <td>${s(i)}</td>
        <td class="${y?"abnormal":""}">${s(h)}</td>
        <td>${s(g)}</td>
        <td>${s(b)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A (${o.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u6AA2\u9A57\u9805\u76EE</th><th>\u7D50\u679C</th><th>\u53C3\u8003\u503C</th><th>\u55AE\u4F4D</th></tr></thead>
      <tbody>${a}</tbody></table>
    </div></div>`}function T(e){let o=D(e,a=>`${a.PER_DATE||a.drug_date||""}|${p(a.HOSP_NAME||a.hosp)}`),t="";for(let[a,r]of Object.entries(o)){let[n,d]=a.split("|"),c=r[0]?.ICD_CODE||r[0]?.icd_code||"",l=r[0]?.ICD_NAME||r[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="5">${s(m(n))} \u2014 ${s(d)} ${c?`(${s(c)} ${s(l)})`:""}</td></tr>`;for(let i of r){let h=i.MED_DESC||i.MED_ITEM||i.drug_ename||"",g=i.GENERIC_NAME||i.drug_ing_name||"",b=i.DOSAGE||i.qty||"",y=i.FREQ_DESC||i.drug_fre||"",O=i.MED_DAYS||i.day||"";t+=`<tr>
        <td>${s(h)}${g?`<br><span class="sub">${s(g)}</span>`:""}</td>
        <td>${s(b)}</td><td>${s(y)}</td><td>${s(O)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u897F\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function N(e){let o=D(e,a=>`${a.func_date||""}|${p(a.hosp)}`),t="";for(let[a,r]of Object.entries(o)){let[n,d]=a.split("|"),c=r[0]?.icd_code||"",l=r[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="4">${s(m(n))} \u2014 ${s(d)} ${c?`(${s(c)} ${s(l)})`:""}</td></tr>`;for(let i of r){let h=i.drug_perscrn_name||i.cdrug_name||"",g=i.order_qty||"",b=i.drug_fre||"",y=i.day||"";t+=`<tr><td>${s(h)}</td><td>${s(g)}</td><td>${s(b)}</td><td>${s(y)}</td></tr>`}}return`<div class="section full-width">
    <h2 onclick="toggleSection(this)">\u25B8 \u4E2D\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function I(e){let o="";for(let t of e){let a=t.real_inspect_date||t.case_time||t.recipe_date||"",r=p(t.hosp),n=t.order_name||"",d=t.inspect_result||"",c=t.cure_path_name||"";o+=`<tr><td>${s(m(a))}</td><td>${s(r)}</td><td>${s(n)}</td><td>${s(c)}</td><td>${s(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u5F71\u50CF\u6AA2\u67E5 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u6AA2\u67E5\u9805\u76EE</th><th>\u90E8\u4F4D</th><th>\u5831\u544A</th></tr></thead>
      <tbody>${o}</tbody></table>
    </div></div>`}function H(e){let o=e.filter(a=>{let r=a.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(o.length===0)return`<div class="section">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304</h2>
      <div class="section-body"><p>\u7121\u904E\u654F\u7D00\u9304</p></div></div>`;let t="";for(let a of o){let r=a.upload_d||"",n=a.drug_name||"",d=(a.sympton_name||"").replace(/;/g,", "),c=a.allerg_severity_level||"",l=p(a.hosp);t+=`<tr><td>${s(r)}</td><td>${s(n)}</td><td>${s(d)}</td><td>${s(c)}</td><td>${s(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304 (${o.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u85E5\u54C1</th><th>\u75C7\u72C0</th><th>\u56B4\u91CD\u5EA6</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function U(e){let o="";for(let t of e){let a=t.exe_s_date||"",r=p(t.hosp),n=t.icd_code||"",d=t.icd_cname||"";o+=`<tr><td>${s(m(a))}</td><td>${s(r)}</td><td>${s(n)}</td><td>${s(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u624B\u8853\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u540D\u7A31</th></tr></thead>
      <tbody>${o}</tbody></table>
    </div></div>`}function P(e){let o="";for(let t of e){let a=t.in_date||"",r=t.out_date||"",n=p(t.hosp),d=t.icd_code||"",c=t.icd_cname||"";o+=`<tr><td>${s(m(a))}</td><td>${s(m(r))}</td><td>${s(n)}</td><td>${s(d)}</td><td>${s(c)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u51FA\u9662\u6458\u8981 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u5165\u9662\u65E5</th><th>\u51FA\u9662\u65E5</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u8A3A\u65B7</th></tr></thead>
      <tbody>${o}</tbody></table>
    </div></div>`}function F(e){let o="";for(let t of e){let a=t.MED_DESC||t.MED_ITEM||t.drug_ename||"",r=t.DRUG_LEFT||t.drug_left||"",n=t.PER_DATE||t.drug_date||"",d=p(t.HOSP_NAME||t.hosp);o+=`<tr><td>${s(a)}</td><td>${s(r)}</td><td>${s(m(n))}</td><td>${s(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u9918\u85E5\u5929\u6578 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1</th><th>\u9918\u85E5\u5929\u6578</th><th>\u958B\u7ACB\u65E5\u671F</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${o}</tbody></table>
    </div></div>`}function L(e,o,t,a){return`<!DOCTYPE html>
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
  <div class="meta">\u8EAB\u5206\u8B49\u865F\uFF1A${s(o)} \uFF5C \u5831\u544A\u7522\u751F\u6642\u9593\uFF1A${s(t)}</div>
</div>
<div class="nav">
  <a onclick="expandAll()">\u5168\u90E8\u5C55\u958B</a>
  <a onclick="collapseAll()">\u5168\u90E8\u6536\u5408</a>
  <a onclick="window.print()">\u5217\u5370</a>
</div>
<div class="grid">
${a}
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
</html>`}var u={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null},_=!1;function w(){_||(_=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(_=!1,B())});async function B(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t=u.currentUserSession;if(!t)return;let a=t;t.startsWith("patient_")&&(a=t.replace("patient_",""));let r=a;try{let i=u.token;if(i){i.startsWith("Bearer ")&&(i=i.slice(7));let h=i.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),g=decodeURIComponent(atob(h).split("").map(y=>"%"+("00"+y.charCodeAt(0).toString(16)).slice(-2)).join("")),b=JSON.parse(g);b.UserName&&(r=b.UserName),console.log(`[NHITW Clinic] Patient name from token: ${r}`)}else console.log("[NHITW Clinic] No token available, using ID as name")}catch(i){console.warn("[NHITW Clinic] Token parsing failed:",i.message)}let n={};for(let[i,h]of Object.entries(u))i!=="token"&&i!=="currentUserSession"&&h&&(n[i]=h);let d=S(r,a,n),c=x(r),l=Math.round(new Blob([d]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${c} (${l}KB, ${Object.keys(n).length} data types)`),l>900){console.warn(`[NHITW Clinic] HTML too large (${l}KB), exceeds Native Messaging limit`);return}await $(c,d),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var q={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(q).forEach(([e,o])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${o}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${o}*`]},["responseHeaders"])});var v={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},R=new Map([["openPopup",(e,o,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,o,t)=>{Object.keys(u).forEach(a=>{u[a]=null}),u.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(v),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,o,t)=>{Object.keys(u).forEach(a=>{u[a]=null}),t({status:"cleared"})}],["getSessionData",(e,o,t)=>{t({status:"success",data:u})}],["getDataStatus",(e,o,t)=>(chrome.storage.local.get(Object.values(v),a=>{let r={},n=(c,l)=>{let i=a[l],h=i?.rObject||i?.robject;h&&Array.isArray(h)?r[c]={status:"fetched",count:h.length}:r[c]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(v).forEach(([c,l])=>{let i=d[c]||c;n(i,l)}),t({dataStatus:r})}),!0)],["saveMedicationData",f("medication")],["saveLabData",f("labdata")],["saveChineseMedData",f("chinesemed")],["saveImagingData",f("imaging")],["saveAllergyData",f("allergy")],["saveSurgeryData",f("surgery")],["saveDischargeData",f("discharge")],["saveMedDaysData",f("medDays")],["savePatientSummaryData",f("patientSummary")],["saveToken",(e,o,t)=>{u.token=e.token,u.currentUserSession=e.userSession||u.currentUserSession,w(),t({status:"token_saved"})}]]);function f(e){return function(o,t,a){let r=v[e];if(!r){a({status:"error",error:`Invalid data type: ${e}`});return}u[r]=o.data,u.currentUserSession=o.userSession||u.currentUserSession;let n={[r]:o.data,currentUserSession:o.userSession||u.currentUserSession};chrome.storage.local.set(n,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),w(),o.data&&o.data.rObject&&Array.isArray(o.data.rObject)?a({status:"saved",recordCount:o.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,o,t)=>{e.userSession&&e.userSession!==u.currentUserSession&&(Object.keys(u).forEach(r=>{u[r]=null}),u.currentUserSession=e.userSession);let a=R.get(e.action);return a?(a(e,o,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,o,t)=>{o.url&&(o.url.includes("medcloud2.nhi.gov.tw/imu/login")||o.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(u).forEach(a=>{u[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
