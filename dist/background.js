(()=>{var N="com.nhitw.host";function C(t){return new Promise((n,e)=>{try{let a=chrome.runtime.connectNative(N),i=!1;a.onMessage.addListener(r=>{i=!0,a.disconnect(),r.success?n(r):e(new Error(r.message||r.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!i){let r=chrome.runtime.lastError?.message||"Native host disconnected";e(new Error(r))}}),a.postMessage(t)}catch(a){e(new Error(`Native messaging unavailable: ${a.message}`))}})}async function _(t,n,e){return C({action:"write_html",filename:t,content:n,date:e||void 0})}function S(t,n,e){let i=O(new Date),r=T(e),d=M(e.labData?.rObject),o=U(e.medicationData?.rObject,100),s=L(e.chinesemedData?.rObject),l=z(e.imagingData?.rObject),p=F(e.allergyData?.rObject),u=R(e.surgeryData?.rObject),f=W(e.dischargeData?.rObject);return G(t,n,i,{diagnosisHtml:r,labPivotHtml:d,westMedHtml:o,chineseMedHtml:s,imagingHtml:l,allergyHtml:p,surgeryHtml:u,dischargeHtml:f})}function $(t,n){let e=n||new Date,a=e.getFullYear(),i=String(e.getMonth()+1).padStart(2,"0"),r=String(e.getDate()).padStart(2,"0"),d=String(e.getHours()).padStart(2,"0"),o=String(e.getMinutes()).padStart(2,"0");return`${t.replace(/[\\/:*?"<>|]/g,"_")}_${a}${i}${r}_${d}${o}.html`}function O(t){return`${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,"0")}/${String(t.getDate()).padStart(2,"0")} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function c(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function y(t){return t?t.includes("T")?t.split("T")[0]:t.replace(/\//g,"-"):""}function b(t){let n=y(t);if(!n)return"";let e=n.split("-");return e.length===3?`${e[1]}/${e[2]}`:n}function v(t){return t?t.split(";")[0].trim():""}function T(t){let n={};function e(r,d){if(!r)return;let o=r.trim();n[o]||(n[o]={code:o,name:d||""}),d&&!n[o].name&&(n[o].name=d)}if(t.medicationData?.rObject)for(let r of t.medicationData.rObject)e(r.ICD_CODE||r.icd_code,r.ICD_NAME||r.icd_cname);if(t.chinesemedData?.rObject)for(let r of t.chinesemedData.rObject)e(r.icd_code,r.icd_cname);if(t.labData?.rObject)for(let r of t.labData.rObject)e(r.icd_code,r.icd_cname);if(t.imagingData?.rObject)for(let r of t.imagingData.rObject)e(r.icd_code,r.icd_cname);let a=Object.values(n);if(a.length===0)return'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>';let i="";for(let r of a)i+=`<div class="diag-item"><span class="diag-code">${c(r.code)}</span> ${c(r.name)}</div>`;return i}function M(t){if(!t||t.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let n=t.filter(s=>{let l=s.assay_value;return l&&l.trim()!==""&&l.trim()!=="***"});if(n.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u7D50\u679C</p>';let e=new Set,a={};for(let s of n){let l=y(s.real_inspect_date||s.recipe_date||""),p=s.assay_item_name||s.order_name||"",u=s.assay_value||"",f=s.consult_value||"";!l||!p||(e.add(l),a[p]||(a[p]={name:p,dates:{}}),a[p].dates[l]={value:u,ref:f,isAbnormal:E(u,f)})}let i=[...e].sort().reverse().slice(0,6).reverse(),r=Object.keys(a);if(i.length===0||r.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u7D50\u679C</p>';let d='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let s of i)d+=`<th class="lab-date-col">${c(b(s))}</th>`;d+="</tr>";let o="";for(let s of r){let l=a[s];o+=`<tr><td class="lab-item-name">${c(s)}</td>`;for(let p of i){let u=l.dates[p];u?o+=`<td class="${u.isAbnormal?"abnormal":""}">${c(u.value)}</td>`:o+='<td class="no-data">\u2014</td>'}o+="</tr>"}return`<table class="lab-pivot"><thead>${d}</thead><tbody>${o}</tbody></table>`}function E(t,n){if(!t||!n||t==="***")return!1;let e=parseFloat(t);if(isNaN(e))return!1;let a=n.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a)return e<parseFloat(a[1])||e>parseFloat(a[2]);let i=n.match(/[<≦]\s*([\d.]+)/);if(i)return e>parseFloat(i[1]);let r=n.match(/[>≧]\s*([\d.]+)/);return r?e<parseFloat(r[1]):!1}var H={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},j={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},k={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function I(t){if(!t)return null;for(let[n,e]of Object.entries(H))if(e.some(a=>a.length===7?t===a:t.startsWith(a)))return n;return null}function B(t){for(let[n,e]of Object.entries(j))if(e.includes(t))return n;return null}function P(t,n){if(!t)return!1;let e=new Date(t);return isNaN(e.getTime())&&t.includes("/")&&(e=new Date(t.replace(/\//g,"-"))),isNaN(e.getTime())?!1:Date.now()-e.getTime()<=n*864e5}function U(t,n){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=n||100,a=[];for(let o of t){let s=o.PER_DATE||o.drug_date||"";if(!P(s,e))continue;let l=o.ATC_CODE||o.drug_atc7_code||"",p=I(l);if(!p)continue;let u=B(p);u&&a.push({name:o.MED_DESC||o.MED_ITEM||o.drug_ename||"",generic:o.GENERIC_NAME||o.drug_ing_name||"",date:y(s),hosp:v(o.HOSP_NAME||o.hosp),freq:o.FREQ_DESC||o.drug_fre||"",medDays:o.MED_DAYS||o.day||"",drugLeft:o.DRUG_LEFT||o.drug_left||"",groupName:p,colorName:u})}if(a.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let i=["red","orange","green"],r={};for(let o of a){r[o.colorName]||(r[o.colorName]={}),r[o.colorName][o.groupName]||(r[o.colorName][o.groupName]={});let s=o.name;r[o.colorName][o.groupName][s]||(r[o.colorName][o.groupName][s]={...o,prescriptions:[]}),r[o.colorName][o.groupName][s].prescriptions.push({date:o.date,hosp:o.hosp,days:o.medDays,drugLeft:o.drugLeft})}let d="";for(let o of i){if(!r[o])continue;let s=k[o];for(let[l,p]of Object.entries(r[o]))for(let u of Object.values(p)){u.prescriptions.sort((h,A)=>(A.date||"").localeCompare(h.date||""));let f=u.prescriptions.slice(0,3).map(h=>`<span class="med-pres">${c(b(h.date))} ${c(h.hosp)}${h.drugLeft&&h.drugLeft!=="0"?` <span class="drug-left">\u9918${h.drugLeft}\u5929</span>`:""}</span>`).join(" ");d+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${s.bg};border-color:${s.border};color:${s.text}">${c(l)}</span></td>
          <td class="med-name-cell">${c(u.name)}</td>
          <td class="med-pres-cell">${f}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${d}</tbody>
  </table>
  <div class="tracking-note">${e} \u5929\u5167</div>`}function L(t){if(!t||t.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let n={};for(let a of t){let i=y(a.func_date||""),r=v(a.hosp),d=`${i}|${r}`;n[d]||(n[d]={date:i,hosp:r,icd:a.icd_code||"",icdName:a.icd_cname||"",meds:[]}),n[d].meds.push(a)}let e="";for(let a of Object.values(n)){e+=`<div class="med-group-header">${c(b(a.date))} ${c(a.hosp)}`,a.icd&&(e+=` <span class="diag-code">${c(a.icd)}</span>`),e+="</div>";for(let i of a.meds){let r=i.drug_perscrn_name||i.cdrug_name||"",d=i.order_qty||"",o=i.drug_fre||"",s=i.day||"";e+=`<div class="med-item">${c(r)} <span class="med-detail">${c(d)} ${c(o)} ${s?s+"\u5929":""}</span></div>`}}return e}function z(t){if(!t||t.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let n="";for(let e of t){let a=b(e.real_inspect_date||e.case_time||e.recipe_date||""),i=e.order_name||"",r=v(e.hosp),d=e.inspect_result||"";n+='<div class="imaging-item">',n+=`<div class="imaging-name">${c(i)}</div>`,n+=`<div class="imaging-meta">${c(a)} ${c(r)}</div>`,d&&(n+=`<div class="imaging-result">${c(d)}</div>`),n+="</div>"}return n}function F(t){if(!t||t.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let n=t.filter(a=>{let i=a.drug_name||"";return i&&!i.includes("\u672A\u8A18\u9304")&&i!=="NP"&&i!=="N.P"&&i!=="N.P."&&!i.includes("\u672A\u904E\u654F")});if(n.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let e="";for(let a of n){let i=a.drug_name||"",r=(a.sympton_name||"").replace(/;/g,", ");e+=`<div class="allergy-item"><strong>${c(i)}</strong>${r?` \u2014 ${c(r)}`:""}</div>`}return e}function R(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=b(e.exe_s_date||""),i=v(e.hosp),r=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)} ${c(i)} \u2014 ${c(r)}</div>`}return n}function W(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=b(e.in_date||""),i=b(e.out_date||""),r=v(e.hosp),d=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)}~${c(i)} ${c(r)} \u2014 ${c(d)}</div>`}return n}function G(t,n,e,a){let i="";return a.allergyHtml&&!a.allergyHtml.includes("\u7121\u904E\u654F")&&(i+=`<div class="panel"><div class="panel-title">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${a.allergyHtml}</div></div>`),a.surgeryHtml&&(i+=`<div class="panel"><div class="panel-title">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${a.surgeryHtml}</div></div>`),a.dischargeHtml&&(i+=`<div class="panel"><div class="panel-title">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${a.dischargeHtml}</div></div>`),`<!DOCTYPE html>
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

/* Important Medications Table */
.important-med-table { width:100%; border-collapse:collapse; font-size:12px; }
.important-med-table td { padding:5px 8px; border-bottom:1px solid #f0f0f0; vertical-align:middle; }
.important-med-table tr:hover { background:#f8f9ff; }
.atc-badge-cell { width:60px; text-align:center; }
.atc-badge { display:inline-block; padding:2px 8px; border-radius:12px; font-size:11px; font-weight:600; border:1px solid; white-space:nowrap; }
.med-name-cell { font-weight:500; }
.med-pres-cell { font-size:11px; color:#666; }
.med-pres { display:inline-block; margin-right:8px; padding:1px 6px; border:1px solid #ddd; border-radius:3px; font-size:10px; }
.drug-left { color:#e65100; font-weight:600; }
.tracking-note { font-size:10px; color:#999; text-align:right; padding:4px 8px; }

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
    ${i}
  </div>
</div>

</body>
</html>`}var m={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null},D=!1;function w(){D||(D=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(t=>{t.name==="htmlExport"&&(D=!1,q())});async function q(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let e=null,a=null;try{let s=m.token;if(s){s.startsWith("Bearer ")&&(s=s.slice(7));let l=s.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"),p=decodeURIComponent(atob(l).split("").map(f=>"%"+("00"+f.charCodeAt(0).toString(16)).slice(-2)).join("")),u=JSON.parse(p);console.log("[NHITW Clinic] JWT payload keys:",Object.keys(u).join(", ")),console.log("[NHITW Clinic] UserID:",u.UserID,"UserName:",u.UserName),u.UserID&&(e=u.UserID),u.UserName&&(a=u.UserName)}}catch(s){console.warn("[NHITW Clinic] Token parsing failed:",s.message)}if(!e){let s=m.currentUserSession;if(!s){console.log("[NHITW Clinic] No session and no token, skipping export");return}s.startsWith("patient_")?e=s.replace("patient_",""):e=s,console.log("[NHITW Clinic] Using session for ID:",e)}a||(a=e),console.log(`[NHITW Clinic] Export: ID=${e}, Name=${a}`);let i={};for(let[s,l]of Object.entries(m))s!=="token"&&s!=="currentUserSession"&&l&&(i[s]=l);let r=S(a,e,i),d=$(a),o=Math.round(new Blob([r]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${d} (${o}KB, ${Object.keys(i).length} data types)`),o>900){console.warn(`[NHITW Clinic] HTML too large (${o}KB), exceeds Native Messaging limit`);return}await _(d,r),console.log(`[NHITW Clinic] HTML report saved: ${d}`)}catch(t){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",t.message)}}var Y={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(Y).forEach(([t,n])=>{chrome.webRequest.onBeforeRequest.addListener(function(e){return e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallDetected",url:e.url,type:t}),{cancel:!1}},{urls:[`https://${n}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(e){e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallCompleted",url:e.url,statusCode:e.statusCode,type:t})},{urls:[`https://${n}*`]},["responseHeaders"])});var x={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},K=new Map([["openPopup",(t,n,e)=>{chrome.action.openPopup(),e({status:"received"})}],["userSessionChanged",(t,n,e)=>{Object.keys(m).forEach(a=>{m[a]=null}),m.currentUserSession=t.userSession,chrome.storage.local.remove(Object.values(x),function(){chrome.action.setBadgeText({text:""})}),e({status:"session_reset"})}],["clearSessionData",(t,n,e)=>{Object.keys(m).forEach(a=>{m[a]=null}),e({status:"cleared"})}],["getSessionData",(t,n,e)=>{e({status:"success",data:m})}],["getDataStatus",(t,n,e)=>(chrome.storage.local.get(Object.values(x),a=>{let i={},r=(o,s)=>{let l=a[s],p=l?.rObject||l?.robject;p&&Array.isArray(p)?i[o]={status:"fetched",count:p.length}:i[o]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(x).forEach(([o,s])=>{let l=d[o]||o;r(l,s)}),e({dataStatus:i})}),!0)],["saveMedicationData",g("medication")],["saveLabData",g("labdata")],["saveChineseMedData",g("chinesemed")],["saveImagingData",g("imaging")],["saveAllergyData",g("allergy")],["saveSurgeryData",g("surgery")],["saveDischargeData",g("discharge")],["saveMedDaysData",g("medDays")],["savePatientSummaryData",g("patientSummary")],["saveToken",(t,n,e)=>{m.token=t.token,m.currentUserSession=t.userSession||m.currentUserSession,w(),e({status:"token_saved"})}]]);function g(t){return function(n,e,a){let i=x[t];if(!i){a({status:"error",error:`Invalid data type: ${t}`});return}m[i]=n.data,m.currentUserSession=n.userSession||m.currentUserSession;let r={[i]:n.data,currentUserSession:n.userSession||m.currentUserSession};chrome.storage.local.set(r,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),w(),n.data&&n.data.rObject&&Array.isArray(n.data.rObject)?a({status:"saved",recordCount:n.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((t,n,e)=>{t.userSession&&t.userSession!==m.currentUserSession&&(Object.keys(m).forEach(i=>{m[i]=null}),m.currentUserSession=t.userSession);let a=K.get(t.action);return a?(a(t,n,e),!0):(e({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((t,n,e)=>{n.url&&(n.url.includes("medcloud2.nhi.gov.tw/imu/login")||n.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(m).forEach(a=>{m[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
