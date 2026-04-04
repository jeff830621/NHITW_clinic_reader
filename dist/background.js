(()=>{var w="com.nhitw.host";function O(t){return new Promise((n,e)=>{try{let a=chrome.runtime.connectNative(w),o=!1;a.onMessage.addListener(i=>{o=!0,a.disconnect(),i.success?n(i):e(new Error(i.message||i.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!o){let i=chrome.runtime.lastError?.message||"Native host disconnected";e(new Error(i))}}),a.postMessage(t)}catch(a){e(new Error(`Native messaging unavailable: ${a.message}`))}})}async function D(t,n,e){return O({action:"write_html",filename:t,content:n,date:e||void 0})}function _(t,n,e){let o=H(new Date),i=M(e),s=C(e.labData?.rObject),d=N(e.medicationData?.rObject),r=T(e.chinesemedData?.rObject),u=k(e.imagingData?.rObject),g=E(e.allergyData?.rObject),m=I(e.surgeryData?.rObject),h=U(e.dischargeData?.rObject);return P(t,n,o,{diagnosisHtml:i,labPivotHtml:s,westMedHtml:d,chineseMedHtml:r,imagingHtml:u,allergyHtml:g,surgeryHtml:m,dischargeHtml:h})}function $(t,n){let e=n||new Date,a=e.getFullYear(),o=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0"),s=String(e.getHours()).padStart(2,"0"),d=String(e.getMinutes()).padStart(2,"0");return`${t.replace(/[\\/:*?"<>|]/g,"_")}_${a}${o}${i}_${s}${d}.html`}function H(t){return`${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,"0")}/${String(t.getDate()).padStart(2,"0")} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function c(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function v(t){return t?t.includes("T")?t.split("T")[0]:t.replace(/\//g,"-"):""}function f(t){let n=v(t);if(!n)return"";let e=n.split("-");return e.length===3?`${e[1]}/${e[2]}`:n}function b(t){return t?t.split(";")[0].trim():""}function M(t){let n={};function e(i,s){if(!i)return;let d=i.trim();n[d]||(n[d]={code:d,name:s||""}),s&&!n[d].name&&(n[d].name=s)}if(t.medicationData?.rObject)for(let i of t.medicationData.rObject)e(i.ICD_CODE||i.icd_code,i.ICD_NAME||i.icd_cname);if(t.chinesemedData?.rObject)for(let i of t.chinesemedData.rObject)e(i.icd_code,i.icd_cname);if(t.labData?.rObject)for(let i of t.labData.rObject)e(i.icd_code,i.icd_cname);if(t.imagingData?.rObject)for(let i of t.imagingData.rObject)e(i.icd_code,i.icd_cname);let a=Object.values(n);if(a.length===0)return'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>';let o="";for(let i of a)o+=`<div class="diag-item"><span class="diag-code">${c(i.code)}</span> ${c(i.name)}</div>`;return o}function C(t){if(!t||t.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let n=t.filter(r=>{let u=r.assay_value;return u&&u.trim()!==""&&u.trim()!=="***"});if(n.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u7D50\u679C</p>';let e=new Set,a={};for(let r of n){let u=v(r.real_inspect_date||r.recipe_date||""),g=r.assay_item_name||r.order_name||"",m=r.assay_value||"",h=r.consult_value||"";!u||!g||(e.add(u),a[g]||(a[g]={name:g,dates:{}}),a[g].dates[u]={value:m,ref:h,isAbnormal:j(m,h)})}let o=[...e].sort().reverse().slice(0,6).reverse(),i=Object.keys(a);if(o.length===0||i.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u7D50\u679C</p>';let s='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let r of o)s+=`<th class="lab-date-col">${c(f(r))}</th>`;s+="</tr>";let d="";for(let r of i){let u=a[r];d+=`<tr><td class="lab-item-name">${c(r)}</td>`;for(let g of o){let m=u.dates[g];m?d+=`<td class="${m.isAbnormal?"abnormal":""}">${c(m.value)}</td>`:d+='<td class="no-data">\u2014</td>'}d+="</tr>"}return`<table class="lab-pivot"><thead>${s}</thead><tbody>${d}</tbody></table>`}function j(t,n){if(!t||!n||t==="***")return!1;let e=parseFloat(t);if(isNaN(e))return!1;let a=n.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a)return e<parseFloat(a[1])||e>parseFloat(a[2]);let o=n.match(/[<≦]\s*([\d.]+)/);if(o)return e>parseFloat(o[1]);let i=n.match(/[>≧]\s*([\d.]+)/);return i?e<parseFloat(i[1]):!1}function N(t){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let n={};for(let a of t){let o=v(a.PER_DATE||a.drug_date||""),i=b(a.HOSP_NAME||a.hosp),s=`${o}|${i}`;n[s]||(n[s]={date:o,hosp:i,icd:a.ICD_CODE||a.icd_code||"",icdName:a.ICD_NAME||a.icd_cname||"",meds:[]}),n[s].meds.push(a)}let e="";for(let a of Object.values(n)){e+=`<div class="med-group-header">${c(f(a.date))} ${c(a.hosp)}`,a.icd&&(e+=` <span class="diag-code">${c(a.icd)}</span>`),e+="</div>";for(let o of a.meds){let i=o.MED_DESC||o.MED_ITEM||o.drug_ename||"",s=o.FREQ_DESC||o.drug_fre||"",d=o.MED_DAYS||o.day||"";e+=`<div class="med-item">${c(i)} <span class="med-detail">${c(s)} ${d?d+"\u5929":""}</span></div>`}}return e}function T(t){if(!t||t.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let n={};for(let a of t){let o=v(a.func_date||""),i=b(a.hosp),s=`${o}|${i}`;n[s]||(n[s]={date:o,hosp:i,icd:a.icd_code||"",icdName:a.icd_cname||"",meds:[]}),n[s].meds.push(a)}let e="";for(let a of Object.values(n)){e+=`<div class="med-group-header">${c(f(a.date))} ${c(a.hosp)}`,a.icd&&(e+=` <span class="diag-code">${c(a.icd)}</span>`),e+="</div>";for(let o of a.meds){let i=o.drug_perscrn_name||o.cdrug_name||"",s=o.order_qty||"",d=o.drug_fre||"",r=o.day||"";e+=`<div class="med-item">${c(i)} <span class="med-detail">${c(s)} ${c(d)} ${r?r+"\u5929":""}</span></div>`}}return e}function k(t){if(!t||t.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let n="";for(let e of t){let a=f(e.real_inspect_date||e.case_time||e.recipe_date||""),o=e.order_name||"",i=b(e.hosp),s=e.inspect_result||"";n+='<div class="imaging-item">',n+=`<div class="imaging-name">${c(o)}</div>`,n+=`<div class="imaging-meta">${c(a)} ${c(i)}</div>`,s&&(n+=`<div class="imaging-result">${c(s)}</div>`),n+="</div>"}return n}function E(t){if(!t||t.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let n=t.filter(a=>{let o=a.drug_name||"";return o&&!o.includes("\u672A\u8A18\u9304")&&o!=="NP"&&o!=="N.P"&&o!=="N.P."&&!o.includes("\u672A\u904E\u654F")});if(n.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let e="";for(let a of n){let o=a.drug_name||"",i=(a.sympton_name||"").replace(/;/g,", ");e+=`<div class="allergy-item"><strong>${c(o)}</strong>${i?` \u2014 ${c(i)}`:""}</div>`}return e}function I(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=f(e.exe_s_date||""),o=b(e.hosp),i=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)} ${c(o)} \u2014 ${c(i)}</div>`}return n}function U(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=f(e.in_date||""),o=f(e.out_date||""),i=b(e.hosp),s=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)}~${c(o)} ${c(i)} \u2014 ${c(s)}</div>`}return n}function P(t,n,e,a){let o="";return a.allergyHtml&&!a.allergyHtml.includes("\u7121\u904E\u654F")&&(o+=`<div class="panel"><div class="panel-title">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${a.allergyHtml}</div></div>`),a.surgeryHtml&&(o+=`<div class="panel"><div class="panel-title">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${a.surgeryHtml}</div></div>`),a.dischargeHtml&&(o+=`<div class="panel"><div class="panel-title">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${a.dischargeHtml}</div></div>`),`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c(t)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:"Microsoft JhengHei","PingFang TC",sans-serif; background:#f0f2f5; color:#333; font-size:13px; }

.header { background:#1976d2; color:#fff; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:18px; font-weight:600; }
.header .meta { font-size:12px; opacity:0.85; }
.header .actions { display:flex; gap:8px; }
.header .actions a { color:#fff; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:4px; text-decoration:none; font-size:12px; cursor:pointer; }
.header .actions a:hover { background:rgba(255,255,255,0.35); }

.layout { display:grid; grid-template-columns:1fr 1.5fr 1fr; gap:12px; padding:12px; min-height:calc(100vh - 60px); }

.column { display:flex; flex-direction:column; gap:10px; }

.panel { background:#fff; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.08); overflow:hidden; }
.panel-title { font-size:14px; font-weight:600; padding:10px 14px; border-bottom:1px solid #e8e8e8; color:#333; }
.panel-body { padding:10px 14px; }

/* Diagnosis */
.diag-item { padding:4px 0; border-bottom:1px solid #f5f5f5; font-size:13px; }
.diag-item:last-child { border-bottom:none; }
.diag-code { background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:11px; font-weight:600; margin-right:6px; }

/* Lab pivot table */
.lab-pivot { width:100%; border-collapse:collapse; font-size:12px; }
.lab-pivot th { background:#f5f7fa; padding:6px 8px; text-align:center; border-bottom:2px solid #dee2e6; font-weight:600; font-size:11px; }
.lab-pivot td { padding:5px 8px; text-align:center; border-bottom:1px solid #f0f0f0; }
.lab-pivot .lab-item-name { text-align:left; font-weight:600; white-space:nowrap; }
.lab-pivot .lab-item-col { text-align:left; }
.lab-pivot .no-data { color:#ccc; }
.lab-pivot .abnormal { color:#d32f2f; font-weight:bold; }
.lab-pivot tr:hover { background:#f8f9ff; }

/* Medications */
.med-group-header { font-size:12px; font-weight:600; color:#1565c0; background:#e3f2fd; padding:5px 10px; margin-top:6px; border-radius:4px; }
.med-group-header:first-child { margin-top:0; }
.med-item { padding:3px 0 3px 10px; font-size:12px; border-bottom:1px solid #fafafa; }
.med-detail { color:#888; font-size:11px; }

/* Imaging */
.imaging-item { padding:6px 0; border-bottom:1px solid #f5f5f5; }
.imaging-item:last-child { border-bottom:none; }
.imaging-name { font-weight:600; font-size:12px; }
.imaging-meta { font-size:11px; color:#888; margin-top:2px; }
.imaging-result { font-size:11px; color:#555; margin-top:2px; padding:4px 8px; background:#f9f9f9; border-radius:3px; }

/* Allergy */
.allergy-item { padding:4px 0; font-size:12px; }

/* Records */
.record-item { padding:4px 0; font-size:12px; border-bottom:1px solid #f5f5f5; }
.record-item:last-child { border-bottom:none; }

.empty { color:#999; font-size:12px; padding:8px 0; }

@media (max-width:1000px) { .layout { grid-template-columns:1fr; } }
@media print {
  body { background:#fff; }
  .header .actions { display:none; }
  .layout { gap:8px; padding:8px; }
  .panel { box-shadow:none; border:1px solid #ddd; break-inside:avoid; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${c(t)}</h1>
    <div class="meta">${c(n)} \uFF5C ${c(e)}</div>
  </div>
  <div class="actions">
    <a onclick="window.print()">\u5217\u5370</a>
  </div>
</div>

<div class="layout">
  <!-- Left Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title">\u5C31\u91AB\u8A3A\u65B7\u8207\u6536\u6848</div>
      <div class="panel-body">${a.diagnosisHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title">\u95DC\u6CE8\u897F\u85E5</div>
      <div class="panel-body">${a.westMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title">\u4E2D\u85E5\u7528\u85E5</div>
      <div class="panel-body">${a.chineseMedHtml}</div>
    </div>
  </div>

  <!-- Center Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title">\u95DC\u6CE8\u6AA2\u9A57</div>
      <div class="panel-body" style="padding:0;">${a.labPivotHtml}</div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title">\u95DC\u6CE8\u5F71\u50CF</div>
      <div class="panel-body">${a.imagingHtml}</div>
    </div>
    ${o}
  </div>
</div>

</body>
</html>`}var l={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null},x=!1;function S(){x||(x=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(t=>{t.name==="htmlExport"&&(x=!1,A())});async function A(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let e=null,a=null;try{let r=l.token;if(r){r.startsWith("Bearer ")&&(r=r.slice(7));let u=r.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),g=decodeURIComponent(atob(u).split("").map(h=>"%"+("00"+h.charCodeAt(0).toString(16)).slice(-2)).join("")),m=JSON.parse(g);console.log("[NHITW Clinic] JWT payload keys:",Object.keys(m).join(", ")),console.log("[NHITW Clinic] UserID:",m.UserID,"UserName:",m.UserName),m.UserID&&(e=m.UserID),m.UserName&&(a=m.UserName)}}catch(r){console.warn("[NHITW Clinic] Token parsing failed:",r.message)}if(!e){let r=l.currentUserSession;if(!r){console.log("[NHITW Clinic] No session and no token, skipping export");return}r.startsWith("patient_")?e=r.replace("patient_",""):e=r,console.log("[NHITW Clinic] Using session for ID:",e)}a||(a=e),console.log(`[NHITW Clinic] Export: ID=${e}, Name=${a}`);let o={};for(let[r,u]of Object.entries(l))r!=="token"&&r!=="currentUserSession"&&u&&(o[r]=u);let i=_(a,e,o),s=$(a),d=Math.round(new Blob([i]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${s} (${d}KB, ${Object.keys(o).length} data types)`),d>900){console.warn(`[NHITW Clinic] HTML too large (${d}KB), exceeds Native Messaging limit`);return}await D(s,i),console.log(`[NHITW Clinic] HTML report saved: ${s}`)}catch(t){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",t.message)}}var z={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(z).forEach(([t,n])=>{chrome.webRequest.onBeforeRequest.addListener(function(e){return e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallDetected",url:e.url,type:t}),{cancel:!1}},{urls:[`https://${n}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(e){e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallCompleted",url:e.url,statusCode:e.statusCode,type:t})},{urls:[`https://${n}*`]},["responseHeaders"])});var y={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},F=new Map([["openPopup",(t,n,e)=>{chrome.action.openPopup(),e({status:"received"})}],["userSessionChanged",(t,n,e)=>{Object.keys(l).forEach(a=>{l[a]=null}),l.currentUserSession=t.userSession,chrome.storage.local.remove(Object.values(y),function(){chrome.action.setBadgeText({text:""})}),e({status:"session_reset"})}],["clearSessionData",(t,n,e)=>{Object.keys(l).forEach(a=>{l[a]=null}),e({status:"cleared"})}],["getSessionData",(t,n,e)=>{e({status:"success",data:l})}],["getDataStatus",(t,n,e)=>(chrome.storage.local.get(Object.values(y),a=>{let o={},i=(d,r)=>{let u=a[r],g=u?.rObject||u?.robject;g&&Array.isArray(g)?o[d]={status:"fetched",count:g.length}:o[d]={status:"none",count:0}},s={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(y).forEach(([d,r])=>{let u=s[d]||d;i(u,r)}),e({dataStatus:o})}),!0)],["saveMedicationData",p("medication")],["saveLabData",p("labdata")],["saveChineseMedData",p("chinesemed")],["saveImagingData",p("imaging")],["saveAllergyData",p("allergy")],["saveSurgeryData",p("surgery")],["saveDischargeData",p("discharge")],["saveMedDaysData",p("medDays")],["savePatientSummaryData",p("patientSummary")],["saveToken",(t,n,e)=>{l.token=t.token,l.currentUserSession=t.userSession||l.currentUserSession,S(),e({status:"token_saved"})}]]);function p(t){return function(n,e,a){let o=y[t];if(!o){a({status:"error",error:`Invalid data type: ${t}`});return}l[o]=n.data,l.currentUserSession=n.userSession||l.currentUserSession;let i={[o]:n.data,currentUserSession:n.userSession||l.currentUserSession};chrome.storage.local.set(i,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),S(),n.data&&n.data.rObject&&Array.isArray(n.data.rObject)?a({status:"saved",recordCount:n.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((t,n,e)=>{t.userSession&&t.userSession!==l.currentUserSession&&(Object.keys(l).forEach(o=>{l[o]=null}),l.currentUserSession=t.userSession);let a=F.get(t.action);return a?(a(t,n,e),!0):(e({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((t,n,e)=>{n.url&&(n.url.includes("medcloud2.nhi.gov.tw/imu/login")||n.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(l).forEach(a=>{l[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
