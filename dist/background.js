(()=>{var A=Object.defineProperty;var x=(e,n)=>()=>(e&&(n=e(e=0)),n);var w=(e,n)=>{for(var t in n)A(e,t,{get:n[t],enumerable:!0})};var v={};w(v,{cleanup:()=>H,isHostAvailable:()=>I,readManifest:()=>E,readPatient:()=>N,searchPatient:()=>U,writeHtml:()=>P,writePatient:()=>T});function y(e){return new Promise((n,t)=>{try{let a=chrome.runtime.connectNative(j),o=!1;a.onMessage.addListener(s=>{o=!0,a.disconnect(),s.success?n(s):t(new Error(s.message||s.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!o){let s=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(s))}}),a.postMessage(e)}catch(a){t(new Error(`Native messaging unavailable: ${a.message}`))}})}async function T(e,n,t,a){return y({action:"write_patient",patient_id:e,name:n,data:t,date:a||void 0})}async function E(e){return y({action:"read_manifest",date:e||void 0})}async function N(e,n){return y({action:"read_patient",filename:e,date:n||void 0})}async function P(e,n,t){return y({action:"write_html",filename:e,content:n,date:t||void 0})}async function U(e){return y({action:"search_patient",query:e})}async function H(e){return y({action:"cleanup",retentionDays:e||void 0})}async function I(){try{return await E(),!0}catch{return!1}}var j,D=x(()=>{j="com.nhitw.host"});var k={};w(k,{generateHtmlReport:()=>F,getReportFilename:()=>q});function F(e,n,t){let o=L(new Date),s=[];return t.medicationData?.rObject?.length&&s.push(B(t.medicationData.rObject)),t.chinesemedData?.rObject?.length&&s.push(z(t.chinesemedData.rObject)),t.labData?.rObject?.length&&s.push(R(t.labData.rObject)),t.imagingData?.rObject?.length&&s.push(G(t.imagingData.rObject)),t.allergyData?.rObject?.length&&s.push(W(t.allergyData.rObject)),t.surgeryData?.rObject?.length&&s.push(Y(t.surgeryData.rObject)),t.dischargeData?.rObject?.length&&s.push(J(t.dischargeData.rObject)),t.medDaysData?.rObject?.length&&s.push(K(t.medDaysData.rObject)),s.length===0&&s.push('<div class="section"><h2>\u7121\u8CC7\u6599</h2><p>\u5C1A\u672A\u64F7\u53D6\u5230\u4EFB\u4F55\u91AB\u7642\u8CC7\u6599\u3002</p></div>'),Z(e,n,o,s.join(`
`))}function q(e,n){let t=n||new Date,a=t.getFullYear(),o=String(t.getMonth()+1).padStart(2,"0"),s=String(t.getDate()).padStart(2,"0"),l=String(t.getHours()).padStart(2,"0"),i=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${a}${o}${s}_${l}${i}.html`}function L(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function r(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function p(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function f(e){return e?e.split(";")[0].trim():""}function B(e){let n=_(e,a=>`${a.PER_DATE||a.drug_date||""}|${f(a.HOSP_NAME||a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,l]=a.split("|"),i=o[0]?.ICD_CODE||o[0]?.icd_code||"",d=o[0]?.ICD_NAME||o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="6">${r(p(s))} \u2014 ${r(l)} ${i?`(${r(i)} ${r(d)})`:""}</td></tr>`;for(let c of o){let h=c.MED_DESC||c.MED_ITEM||c.drug_ename||"",g=c.GENERIC_NAME||c.drug_ing_name||"",b=c.DOSAGE||c.qty||"",$=c.FREQ_DESC||c.drug_fre||"",C=c.MED_DAYS||c.day||"",M=c.ATC_NAME||c.drug_atc5_name||"";t+=`<tr>
        <td>${r(h)}${g?`<br><span class="sub">${r(g)}</span>`:""}</td>
        <td>${r(b)}</td><td>${r($)}</td><td>${r(C)}</td>
        <td>${r(M)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u897F\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th><th>\u85E5\u7406\u5206\u985E</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function z(e){let n=_(e,a=>`${a.func_date||""}|${f(a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,l]=a.split("|"),i=o[0]?.icd_code||"",d=o[0]?.icd_cname||"";t+=`<tr class="group-header"><td colspan="4">${r(p(s))} \u2014 ${r(l)} ${i?`(${r(i)} ${r(d)})`:""}</td></tr>`;for(let c of o){let h=c.drug_perscrn_name||c.cdrug_name||"",g=c.order_qty||"",b=c.drug_fre||"",$=c.day||"";t+=`<tr><td>${r(h)}</td><td>${r(g)}</td><td>${r(b)}</td><td>${r($)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u4E2D\u85E5\u7528\u85E5\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1\u540D\u7A31</th><th>\u5291\u91CF</th><th>\u983B\u7387</th><th>\u5929\u6578</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function R(e){let n=_(e,a=>`${a.real_inspect_date||a.recipe_date||""}|${f(a.hosp)}`),t="";for(let[a,o]of Object.entries(n)){let[s,l]=a.split("|");t+=`<tr class="group-header"><td colspan="5">${r(p(s))} \u2014 ${r(l)}</td></tr>`;for(let i of o){let d=i.order_name||i.assay_item_name||"",c=i.assay_value||"",h=i.consult_value||"",g=i.unit_data||"",b=Q(c,h);t+=`<tr>
        <td>${r(d)}</td>
        <td class="${b?"abnormal":""}">${r(c)}</td>
        <td>${r(h)}</td>
        <td>${r(g)}</td></tr>`}}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u6AA2\u9A57\u5831\u544A (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u6AA2\u9A57\u9805\u76EE</th><th>\u7D50\u679C</th><th>\u53C3\u8003\u503C</th><th>\u55AE\u4F4D</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function G(e){let n="";for(let t of e){let a=t.real_inspect_date||t.case_time||t.recipe_date||"",o=f(t.hosp),s=t.order_name||"",l=t.inspect_result||"",i=t.cure_path_name||"";n+=`<tr><td>${r(p(a))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(i)}</td><td>${r(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u5F71\u50CF\u6AA2\u67E5 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u6AA2\u67E5\u9805\u76EE</th><th>\u90E8\u4F4D</th><th>\u5831\u544A</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function W(e){let n=e.filter(a=>{let o=a.drug_name||"";return o&&!o.includes("\u672A\u8A18\u9304")&&o!=="NP"&&o!=="N.P"&&o!=="N.P."&&!o.includes("\u672A\u904E\u654F")});if(n.length===0)return`<div class="section">
      <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304</h2>
      <div class="section-body"><p>\u7121\u904E\u654F\u7D00\u9304</p></div></div>`;let t="";for(let a of n){let o=a.upload_d||"",s=a.drug_name||"",l=(a.sympton_name||"").replace(/;/g,", "),i=a.allerg_severity_level||"",d=f(a.hosp);t+=`<tr><td>${r(o)}</td><td>${r(s)}</td><td>${r(l)}</td><td>${r(i)}</td><td>${r(d)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u904E\u654F\u7D00\u9304 (${n.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u85E5\u54C1</th><th>\u75C7\u72C0</th><th>\u56B4\u91CD\u5EA6</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${t}</tbody></table>
    </div></div>`}function Y(e){let n="";for(let t of e){let a=t.exe_s_date||"",o=f(t.hosp),s=t.icd_code||"",l=t.icd_cname||"";n+=`<tr><td>${r(p(a))}</td><td>${r(o)}</td><td>${r(s)}</td><td>${r(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u624B\u8853\u7D00\u9304 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u65E5\u671F</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u540D\u7A31</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function J(e){let n="";for(let t of e){let a=t.in_date||"",o=t.out_date||"",s=f(t.hosp),l=t.icd_code||"",i=t.icd_cname||"";n+=`<tr><td>${r(p(a))}</td><td>${r(p(o))}</td><td>${r(s)}</td><td>${r(l)}</td><td>${r(i)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u51FA\u9662\u6458\u8981 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u5165\u9662\u65E5</th><th>\u51FA\u9662\u65E5</th><th>\u91AB\u9662</th><th>\u4EE3\u78BC</th><th>\u8A3A\u65B7</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function K(e){let n="";for(let t of e){let a=t.MED_DESC||t.MED_ITEM||t.drug_ename||"",o=t.DRUG_LEFT||t.drug_left||"",s=t.PER_DATE||t.drug_date||"",l=f(t.HOSP_NAME||t.hosp);n+=`<tr><td>${r(a)}</td><td>${r(o)}</td><td>${r(p(s))}</td><td>${r(l)}</td></tr>`}return`<div class="section">
    <h2 onclick="toggleSection(this)">\u25B8 \u9918\u85E5\u5929\u6578 (${e.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>\u85E5\u54C1</th><th>\u9918\u85E5\u5929\u6578</th><th>\u958B\u7ACB\u65E5\u671F</th><th>\u91AB\u9662</th></tr></thead>
      <tbody>${n}</tbody></table>
    </div></div>`}function _(e,n){let t={};for(let a of e){let o=n(a);t[o]||(t[o]=[]),t[o].push(a)}return t}function Q(e,n){if(!e||!n||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let a=n.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a){let l=parseFloat(a[1]),i=parseFloat(a[2]);return t<l||t>i}let o=n.match(/[<≦]\s*([\d.]+)/);if(o)return t>parseFloat(o[1]);let s=n.match(/[>≧]\s*([\d.]+)/);return s?t<parseFloat(s[1]):!1}function Z(e,n,t,a){return`<!DOCTYPE html>
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
</html>`}var O=x(()=>{});var u={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null};async function V(){try{let n=(await chrome.storage.sync.get("sharedFolder")).sharedFolder||{};if(!n.enabled||n.role!=="capture")return;let t=u.currentUserSession;if(!t)return;let a=t;t.startsWith("patient_")&&(a=t.replace("patient_",""));let o=a;try{let d=u.token;if(d){let c=d.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),h=decodeURIComponent(atob(c).split("").map(b=>"%"+("00"+b.charCodeAt(0).toString(16)).slice(-2)).join("")),g=JSON.parse(h);g.UserName&&(o=g.UserName)}}catch{}let s={};for(let[d,c]of Object.entries(u))d!=="token"&&d!=="currentUserSession"&&c&&(s[d]=c);let{writePatient:l,writeHtml:i}=await Promise.resolve().then(()=>(D(),v));await l(a,o,s),console.log(`[NHITW Clinic] Exported patient ${a} to shared folder`);try{let{generateHtmlReport:d,getReportFilename:c}=await Promise.resolve().then(()=>(O(),k)),h=d(o,a,s),g=c(o);await i(g,h),console.log(`[NHITW Clinic] HTML report saved: ${g}`)}catch(d){console.warn("[NHITW Clinic] HTML report generation failed (non-blocking):",d.message)}}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var X={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(X).forEach(([e,n])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(n)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${n}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(n)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${n}*`]},["responseHeaders"])});var S={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},tt=new Map([["openPopup",(e,n,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,n,t)=>{Object.keys(u).forEach(a=>{u[a]=null}),u.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(S),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,n,t)=>{Object.keys(u).forEach(a=>{u[a]=null}),t({status:"cleared"})}],["getSessionData",(e,n,t)=>{t({status:"success",data:u})}],["getDataStatus",(e,n,t)=>(chrome.storage.local.get(Object.values(S),a=>{let o={},s=(i,d)=>{let c=a[d],h=c?.rObject||c?.robject;h&&Array.isArray(h)?o[i]={status:"fetched",count:h.length}:o[i]={status:"none",count:0}},l={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(S).forEach(([i,d])=>{let c=l[i]||i;s(c,d)}),t({dataStatus:o})}),!0)],["saveMedicationData",m("medication")],["saveLabData",m("labdata")],["saveChineseMedData",m("chinesemed")],["saveImagingData",m("imaging")],["saveAllergyData",m("allergy")],["saveSurgeryData",m("surgery")],["saveDischargeData",m("discharge")],["saveMedDaysData",m("medDays")],["savePatientSummaryData",m("patientSummary")],["saveToken",(e,n,t)=>{u.token=e.token,u.currentUserSession=e.userSession||u.currentUserSession,t({status:"token_saved"})}],["readManifest",async(e,n,t)=>{try{let{readManifest:a}=await Promise.resolve().then(()=>(D(),v)),o=await a(e.date);t(o)}catch(a){t({success:!1,error:a.message})}}],["readPatient",async(e,n,t)=>{try{let{readPatient:a}=await Promise.resolve().then(()=>(D(),v)),o=await a(e.filename,e.date);t(o)}catch(a){t({success:!1,error:a.message})}}],["searchPatient",async(e,n,t)=>{try{let{searchPatient:a}=await Promise.resolve().then(()=>(D(),v)),o=await a(e.query);t(o)}catch(a){t({success:!1,error:a.message})}}],["checkHostStatus",async(e,n,t)=>{try{let{isHostAvailable:a}=await Promise.resolve().then(()=>(D(),v)),o=await a();t({success:!0,available:o})}catch(a){t({success:!1,available:!1,error:a.message})}}]]);function m(e){return function(n,t,a){let o=S[e];if(!o){a({status:"error",error:`Invalid data type: ${e}`});return}u[o]=n.data,u.currentUserSession=n.userSession||u.currentUserSession;let s={[o]:n.data,currentUserSession:n.userSession||u.currentUserSession};chrome.storage.local.set(s,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),V(),n.data&&n.data.rObject&&Array.isArray(n.data.rObject)?a({status:"saved",recordCount:n.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,n,t)=>{e.userSession&&e.userSession!==u.currentUserSession&&(Object.keys(u).forEach(o=>{u[o]=null}),u.currentUserSession=e.userSession);let a=tt.get(e.action);return a?(a(e,n,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,n,t)=>{n.url&&(n.url.includes("medcloud2.nhi.gov.tw/imu/login")||n.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(u).forEach(a=>{u[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
