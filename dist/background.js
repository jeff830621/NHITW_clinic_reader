(()=>{var j="com.nhitw.host";function U(t){return new Promise((n,e)=>{try{let a=chrome.runtime.connectNative(j),r=!1;a.onMessage.addListener(s=>{r=!0,a.disconnect(),s.success?n(s):e(new Error(s.message||s.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!r){let s=chrome.runtime.lastError?.message||"Native host disconnected";e(new Error(s))}}),a.postMessage(t)}catch(a){e(new Error(`Native messaging unavailable: ${a.message}`))}})}async function H(t,n,e){return U({action:"write_html",filename:t,content:n,date:e||void 0})}function I(t,n,e){let r=F(new Date),s=z(e),d=R(e.labData?.rObject),o=X(e.medicationData?.rObject,100),i=Z(e.chinesemedData?.rObject),p=V(e.imagingData?.rObject),g=ee(e.allergyData?.rObject),u=te(e.surgeryData?.rObject),l=ae(e.dischargeData?.rObject);return ne(t,n,r,{diagnosisHtml:s,labPivotHtml:d,westMedHtml:o,chineseMedHtml:i,imagingHtml:p,allergyHtml:g,surgeryHtml:u,dischargeHtml:l})}function B(t,n){let e=n||new Date,a=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0"),d=String(e.getHours()).padStart(2,"0"),o=String(e.getMinutes()).padStart(2,"0");return`${t.replace(/[\\/:*?"<>|]/g,"_")}_${a}${r}${s}_${d}${o}.html`}function F(t){return`${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,"0")}/${String(t.getDate()).padStart(2,"0")} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function c(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function D(t){return t?t.includes("T")?t.split("T")[0]:t.replace(/\//g,"-"):""}function $(t){let n=D(t);if(!n)return"";let e=n.split("-");return e.length===3?`${e[1]}/${e[2]}`:n}function S(t){return t?t.split(";")[0].trim():""}function z(t){let e={},a=[],r={},s=[];function d(u,l,f,y,x,A){if(u)for(let b of u){let h=b[l]||"";if(!w(h,180))continue;let v=b[y]||"",C=b[x]||"";if(!v||!C)continue;let k=(b[f]||"").split(";"),T=k[0]?.trim()||"",E=k[1]?.trim()||"\u9580\u8A3A",L=A&&b[A]||"";if(/^Z2[3-7]/.test(v)&&L.startsWith("J07")){s.push({code:v,name:C,date:D(h),hosp:T});continue}E.includes("\u6025\u8A3A")?a.push({code:v,name:C,date:D(h),hosp:T}):E.includes("\u4F4F\u8A3A")||E.includes("\u4F4F\u9662")?r[v]||(r[v]={code:v,name:C,date:D(h),hosp:T}):(e[v]||(e[v]={code:v,name:C,count:0}),e[v].count++)}}d(t.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME","ATC_CODE");let o=t.medicationData?.rObject||[];o.length>0&&!o[0].PER_DATE&&d(o,"drug_date","hosp","icd_code","icd_cname","drug_atc7_code"),d(t.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname",null);let i="",p=Object.values(e).sort((u,l)=>l.count-u.count);if(p.length>0){for(let u of p.slice(0,8))i+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-count">${u.count}</span></div>`;p.length>8&&(i+=`<div class="diag-more">\u9084\u6709 ${p.length-8} \u7B46</div>`)}if(a.length>0){i+='<div class="visit-type-label emergency-label">\u6025\u8A3A</div>';for(let u of a.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-meta">${c(u.date)}</span></div>`}let g=Object.values(r);if(g.length>0){i+='<div class="visit-type-label inpatient-label">\u4F4F\u8A3A</div>';for(let u of g.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)}</div>`}if(s.length>0){i+='<div class="visit-type-label vaccine-label">\u75AB\u82D7</div>';for(let u of s.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-meta">${c(u.date)}</span></div>`}return i||'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>'}var O=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function R(t){if(!t||t.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let n=180,e=new Set(O.filter(l=>l.enabled).map(l=>l.orderCode)),a=t.filter(l=>{let f=l.assay_value;if(!f||f.trim()===""||f.trim()==="***")return!1;let y=l.real_inspect_date||l.recipe_date||"";if(!w(y,n))return!1;let x=l.order_code||"";return e.has(x)});if(a.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let r=new Set,s={};for(let l of a){let f=D(l.real_inspect_date||l.recipe_date||""),y=l.order_code||"",x=l.assay_value||"",A=l.consult_value||"",b=(l.assay_item_name||l.order_name||"").toLowerCase();if(!f)continue;let h=null;if(y==="08011C")if(b.includes("hb")||b.includes("hemoglobin")||b.includes("\u8840\u8272\u7D20"))h="Hb";else continue;else if(y==="09015C")b.includes("gfr")||b.includes("\u814E\u7D72\u7403")?h="GFR":h="Cr";else if(y==="09040C")if(b.includes("upcr")||b.includes("\u86CB\u767D")||b.includes("protein"))h="UPCR";else continue;else if(y==="12111C")if(b.includes("uacr")||b.includes("albumin")||b.includes("\u767D\u86CB\u767D"))h="UACR";else continue;else{let v=O.find(C=>C.orderCode===y&&C.enabled&&!C.subItem);v&&(h=v.name)}h&&(r.add(f),s[h]||(s[h]={name:h,dates:{}}),s[h].dates[f]={value:x,ref:A,isAbnormal:G(x,A)})}let d=[...r].sort().reverse().slice(0,6).reverse(),o=O.filter(l=>l.enabled).map(l=>l.name),i=new Set,p=o.filter(l=>i.has(l)?!1:(i.add(l),s[l]));if(d.length===0||p.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let g='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let l of d)g+=`<th class="lab-date-col">${c($(l))}</th>`;g+="</tr>";let u="";for(let l of p){let f=s[l];u+=`<tr><td class="lab-item-name">${c(l)}</td>`;for(let y of d){let x=f.dates[y];x?u+=`<td class="${x.isAbnormal?"abnormal":""}">${c(x.value)}</td>`:u+='<td class="no-data">\u2014</td>'}u+="</tr>"}return`<table class="lab-pivot"><thead>${g}</thead><tbody>${u}</tbody></table>
  <div class="tracking-note">${n} \u5929\u5167</div>`}function G(t,n){if(!t||!n||t==="***")return!1;let e=parseFloat(t);if(isNaN(e))return!1;let a=n.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a)return e<parseFloat(a[1])||e>parseFloat(a[2]);let r=n.match(/[<≦]\s*([\d.]+)/);if(r)return e>parseFloat(r[1]);let s=n.match(/[>≧]\s*([\d.]+)/);return s?e<parseFloat(s[1]):!1}var W={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},q={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},K={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function Y(t){if(!t)return null;for(let[n,e]of Object.entries(W))if(e.some(a=>a.length===7?t===a:t.startsWith(a)))return n;return null}function J(t){for(let[n,e]of Object.entries(q))if(e.includes(t))return n;return null}function w(t,n){if(!t)return!1;let e=new Date(t);return isNaN(e.getTime())&&t.includes("/")&&(e=new Date(t.replace(/\//g,"-"))),isNaN(e.getTime())?!1:Date.now()-e.getTime()<=n*864e5}function X(t,n){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=n||100,a=[];for(let o of t){let i=o.PER_DATE||o.drug_date||"";if(!w(i,e))continue;let p=o.ATC_CODE||o.drug_atc7_code||"",g=Y(p);if(!g)continue;let u=J(g);u&&a.push({name:o.MED_DESC||o.MED_ITEM||o.drug_ename||"",generic:o.GENERIC_NAME||o.drug_ing_name||"",date:D(i),hosp:S(o.HOSP_NAME||o.hosp),freq:o.FREQ_DESC||o.drug_fre||"",medDays:o.MED_DAYS||o.day||"",drugLeft:o.DRUG_LEFT||o.drug_left||"",groupName:g,colorName:u})}if(a.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let r=["red","orange","green"],s={};for(let o of a){s[o.colorName]||(s[o.colorName]={}),s[o.colorName][o.groupName]||(s[o.colorName][o.groupName]={});let i=o.name;s[o.colorName][o.groupName][i]||(s[o.colorName][o.groupName][i]={...o,prescriptions:[]}),s[o.colorName][o.groupName][i].prescriptions.push({date:o.date,hosp:o.hosp,days:o.medDays,drugLeft:o.drugLeft})}let d="";for(let o of r){if(!s[o])continue;let i=K[o];for(let[p,g]of Object.entries(s[o]))for(let u of Object.values(g)){u.prescriptions.sort((f,y)=>(y.date||"").localeCompare(f.date||""));let l=u.prescriptions.slice(0,3).map(f=>`<span class="med-pres">${c($(f.date))} ${c(f.hosp)}${f.drugLeft&&f.drugLeft!=="0"?` <span class="drug-left">\u9918${f.drugLeft}\u5929</span>`:""}</span>`).join(" ");d+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${i.bg};border-color:${i.border};color:${i.text}">${c(p)}</span></td>
          <td class="med-name-cell">${c(u.name)}</td>
          <td class="med-pres-cell">${l}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${d}</tbody>
  </table>
  <div class="tracking-note">${e} \u5929\u5167</div>`}function Z(t){if(!t||t.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let n={};for(let a of t){let r=D(a.func_date||""),s=S(a.hosp),d=`${r}|${s}`;n[d]||(n[d]={date:r,hosp:s,icd:a.icd_code||"",icdName:a.icd_cname||"",meds:[]}),n[d].meds.push(a)}let e="";for(let a of Object.values(n)){e+=`<div class="med-group-header">${c($(a.date))} ${c(a.hosp)}`,a.icd&&(e+=` <span class="diag-code">${c(a.icd)}</span>`),e+="</div>";for(let r of a.meds){let s=r.drug_perscrn_name||r.cdrug_name||"",d=r.order_qty||"",o=r.drug_fre||"",i=r.day||"";e+=`<div class="med-item">${c(s)} <span class="med-detail">${c(d)} ${c(o)} ${i?i+"\u5929":""}</span></div>`}}return e}var Q=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function V(t){if(!t||t.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let n=180,e=t.filter(d=>{let o=d.real_inspect_date||d.case_time||d.recipe_date||"";if(!w(o,n))return!1;let i=d.order_code||"";return Q.has(i)});if(e.length===0)return`<p class="empty">${n}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let a=new Set,r=[];for(let d of e){let o=D(d.real_inspect_date||d.case_time||d.recipe_date||""),i=d.order_name||"",p=d.order_code||"",g=`${o}|${i}|${p}`;a.has(g)||(a.add(g),r.push(d))}r.sort((d,o)=>{let i=D(d.real_inspect_date||d.case_time||d.recipe_date||"");return D(o.real_inspect_date||o.case_time||o.recipe_date||"").localeCompare(i)});let s="";for(let d of r){let o=$(d.real_inspect_date||d.case_time||d.recipe_date||""),i=d.order_name||"";i=i.replace(/[[\]]/g,"").replace(/;/g," ").trim();let p=S(d.hosp),g=d.inspect_result||"";s+='<div class="imaging-item">',s+=`<div class="imaging-name">${c(i)}</div>`,s+=`<div class="imaging-meta">${c(o)} ${c(p)}</div>`,g&&(s+=`<div class="imaging-result">${c(g)}</div>`),s+="</div>"}return s+=`<div class="tracking-note">${n} \u5929\u5167</div>`,s}function ee(t){if(!t||t.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let n=t.filter(a=>{let r=a.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(n.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let e="";for(let a of n){let r=a.drug_name||"",s=(a.sympton_name||"").replace(/;/g,", ");e+=`<div class="allergy-item"><strong>${c(r)}</strong>${s?` \u2014 ${c(s)}`:""}</div>`}return e}function te(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=$(e.exe_s_date||""),r=S(e.hosp),s=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)} ${c(r)} \u2014 ${c(s)}</div>`}return n}function ae(t){if(!t||t.length===0)return"";let n="";for(let e of t){let a=$(e.in_date||""),r=$(e.out_date||""),s=S(e.hosp),d=e.icd_cname||e.icd_code||"";n+=`<div class="record-item">${c(a)}~${c(r)} ${c(s)} \u2014 ${c(d)}</div>`}return n}function ne(t,n,e,a){let r="";return a.allergyHtml&&!a.allergyHtml.includes("\u7121\u904E\u654F")&&(r+=`<div class="panel"><div class="panel-title">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${a.allergyHtml}</div></div>`),a.surgeryHtml&&(r+=`<div class="panel"><div class="panel-title">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${a.surgeryHtml}</div></div>`),a.dischargeHtml&&(r+=`<div class="panel"><div class="panel-title">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${a.dischargeHtml}</div></div>`),`<!DOCTYPE html>
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
.diag-item { padding:4px 0; border-bottom:1px solid #f5f5f5; font-size:12px; display:flex; align-items:center; gap:6px; }
.diag-item:last-child { border-bottom:none; }
.diag-code { background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:10px; font-weight:600; flex-shrink:0; }
.diag-count { background:#e3f2fd; color:#1565c0; padding:0 5px; border-radius:8px; font-size:10px; font-weight:600; margin-left:auto; flex-shrink:0; }
.diag-meta { color:#999; font-size:10px; margin-left:auto; flex-shrink:0; }
.diag-more { color:#999; font-size:11px; padding:4px 0; text-align:center; }
.visit-type-label { font-size:11px; font-weight:600; padding:4px 8px; margin-top:8px; border-radius:3px; }
.emergency-label { background:#ffebee; color:#c62828; }
.inpatient-label { background:#e8f5e9; color:#2e7d32; }
.vaccine-label { background:#e3f2fd; color:#1565c0; }

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
    ${r}
  </div>
</div>

</body>
</html>`}var m={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},M=!1;function P(){M||(M=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(t=>{t.name==="htmlExport"&&(M=!1,oe().catch(n=>{console.warn("[NHITW Clinic] Export alarm handler error:",n.message)}))});async function oe(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let e=m.patientIdFromToken,a=m.patientName;if(!e){let i=m.currentUserSession;if(!i){console.log("[NHITW Clinic] No session data, skipping export");return}e=i.startsWith("patient_")?i.replace("patient_",""):i}a||(a=e),console.log(`[NHITW Clinic] Export: ID=${e}, Name=${a}`);let r={};for(let[i,p]of Object.entries(m))i!=="token"&&i!=="currentUserSession"&&p&&(r[i]=p);let s=I(a,e,r),d=B(a),o=Math.round(new Blob([s]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${d} (${o}KB, ${Object.keys(r).length} data types)`),o>900){console.warn(`[NHITW Clinic] HTML too large (${o}KB), exceeds Native Messaging limit`);return}await H(d,s),console.log(`[NHITW Clinic] HTML report saved: ${d}`)}catch(t){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",t.message)}}var re={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(re).forEach(([t,n])=>{chrome.webRequest.onBeforeRequest.addListener(function(e){return e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallDetected",url:e.url,type:t}),{cancel:!1}},{urls:[`https://${n}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(e){e.method==="GET"&&e.url.includes(n)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallCompleted",url:e.url,statusCode:e.statusCode,type:t})},{urls:[`https://${n}*`]},["responseHeaders"])});var N={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},se=new Map([["openPopup",(t,n,e)=>{chrome.action.openPopup(),e({status:"received"})}],["userSessionChanged",(t,n,e)=>{Object.keys(m).forEach(a=>{m[a]=null}),m.currentUserSession=t.userSession,chrome.storage.local.remove(Object.values(N),function(){chrome.action.setBadgeText({text:""})}),e({status:"session_reset"})}],["clearSessionData",(t,n,e)=>{Object.keys(m).forEach(a=>{m[a]=null}),e({status:"cleared"})}],["getSessionData",(t,n,e)=>{e({status:"success",data:m})}],["getDataStatus",(t,n,e)=>(chrome.storage.local.get(Object.values(N),a=>{let r={},s=(o,i)=>{let p=a[i],g=p?.rObject||p?.robject;g&&Array.isArray(g)?r[o]={status:"fetched",count:g.length}:r[o]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(N).forEach(([o,i])=>{let p=d[o]||o;s(p,i)}),e({dataStatus:r})}),!0)],["saveMedicationData",_("medication")],["saveLabData",_("labdata")],["saveChineseMedData",_("chinesemed")],["saveImagingData",_("imaging")],["saveAllergyData",_("allergy")],["saveSurgeryData",_("surgery")],["saveDischargeData",_("discharge")],["saveMedDaysData",_("medDays")],["savePatientSummaryData",_("patientSummary")],["saveToken",(t,n,e)=>{m.token=t.token,m.currentUserSession=t.userSession||m.currentUserSession,t.patientName&&(m.patientName=t.patientName),t.patientIdFromToken&&(m.patientIdFromToken=t.patientIdFromToken),console.log(`[NHITW Clinic] saveToken received - Name: ${t.patientName}, ID: ${t.patientIdFromToken}`),P(),e({status:"token_saved"})}],["checkHostStatus",(t,n,e)=>{try{let a=chrome.runtime.connectNative("com.nhitw.host"),r=!1;a.onMessage.addListener(()=>{r=!0,a.disconnect(),e({success:!0,available:!0})}),a.onDisconnect.addListener(()=>{r||e({success:!0,available:!1})}),a.postMessage({action:"read_manifest"})}catch(a){e({success:!0,available:!1,error:a.message})}}]]);function _(t){return function(n,e,a){let r=N[t];if(!r){a({status:"error",error:`Invalid data type: ${t}`});return}m[r]=n.data,m.currentUserSession=n.userSession||m.currentUserSession;let s={[r]:n.data,currentUserSession:n.userSession||m.currentUserSession};chrome.storage.local.set(s,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),P(),n.data&&n.data.rObject&&Array.isArray(n.data.rObject)?a({status:"saved",recordCount:n.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((t,n,e)=>{t.userSession&&t.userSession!==m.currentUserSession&&(Object.keys(m).forEach(r=>{m[r]=null}),m.currentUserSession=t.userSession);let a=se.get(t.action);return a?(a(t,n,e),!0):(e({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((t,n,e)=>{n.url&&(n.url.includes("medcloud2.nhi.gov.tw/imu/login")||n.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(m).forEach(a=>{m[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
