(()=>{var R="com.nhitw.host";function U(e){return new Promise((o,t)=>{try{let n=chrome.runtime.connectNative(R),s=!1;n.onMessage.addListener(i=>{s=!0,n.disconnect(),i.success?o(i):t(new Error(i.message||i.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!s){let i=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(i))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function H(e,o,t){return U({action:"write_html",filename:e,content:o,date:t||void 0})}function P(e,o,t){let s=G(new Date),i=z(t),d=q(t.labData?.rObject),a=Q(t.medicationData?.rObject,100),r=Z(t.medicationData?.rObject,100),p=V(t.chinesemedData?.rObject),m=te(t.imagingData?.rObject),u=ae(t.allergyData?.rObject),l=ne(t.surgeryData?.rObject),g=oe(t.dischargeData?.rObject);return re(e,o,s,{diagnosisHtml:i,labPivotHtml:d,westMedHtml:a,otherWestMedHtml:r,chineseMedHtml:p,imagingHtml:m,allergyHtml:u,surgeryHtml:l,dischargeHtml:g})}function L(e,o){let t=o||new Date,n=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),i=String(t.getDate()).padStart(2,"0"),d=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${n}${s}${i}_${d}${a}.html`}function G(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function c(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function x(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function A(e){let o=x(e);if(!o)return"";let t=o.split("-");return t.length===3?`${t[1]}/${t[2]}`:o}function $(e){return e?e.split(";")[0].trim():""}function z(e){let t={},n=[],s={},i=[];function d(u,l,g,y,D,S){if(u)for(let h of u){let b=h[l]||"";if(!N(b,180))continue;let v=h[y]||"",_=h[D]||"";if(!v||!_)continue;let I=(h[g]||"").split(";"),E=I[0]?.trim()||"",T=I[1]?.trim()||"\u9580\u8A3A",F=S&&h[S]||"";if(/^Z2[3-7]/.test(v)&&F.startsWith("J07")){i.push({code:v,name:_,date:x(b),hosp:E});continue}T.includes("\u6025\u8A3A")?n.push({code:v,name:_,date:x(b),hosp:E}):T.includes("\u4F4F\u8A3A")||T.includes("\u4F4F\u9662")?s[v]||(s[v]={code:v,name:_,date:x(b),hosp:E}):(t[v]||(t[v]={code:v,name:_,count:0}),t[v].count++)}}d(e.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME","ATC_CODE");let a=e.medicationData?.rObject||[];a.length>0&&!a[0].PER_DATE&&d(a,"drug_date","hosp","icd_code","icd_cname","drug_atc7_code"),d(e.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname",null);let r="",p=Object.values(t).sort((u,l)=>l.count-u.count);if(p.length>0){for(let u of p.slice(0,8))r+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-count">${u.count}</span></div>`;p.length>8&&(r+=`<div class="diag-more">\u9084\u6709 ${p.length-8} \u7B46</div>`)}if(n.length>0){r+='<div class="visit-type-label emergency-label">\u6025\u8A3A</div>';for(let u of n.slice(0,5))r+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-meta">${c(u.date)}</span></div>`}let m=Object.values(s);if(m.length>0){r+='<div class="visit-type-label inpatient-label">\u4F4F\u8A3A</div>';for(let u of m.slice(0,5))r+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)}</div>`}if(i.length>0){r+='<div class="visit-type-label vaccine-label">\u75AB\u82D7</div>';for(let u of i.slice(0,5))r+=`<div class="diag-item"><span class="diag-code">${c(u.code)}</span> ${c(u.name)} <span class="diag-meta">${c(u.date)}</span></div>`}return r||'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>'}var k=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function q(e){if(!e||e.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let o=180,t=new Set(k.filter(l=>l.enabled).map(l=>l.orderCode)),n=e.filter(l=>{let g=l.assay_value;if(!g||g.trim()===""||g.trim()==="***")return!1;let y=l.real_inspect_date||l.recipe_date||"";if(!N(y,o))return!1;let D=l.order_code||"";return t.has(D)});if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let s=new Set,i={};for(let l of n){let g=x(l.real_inspect_date||l.recipe_date||""),y=l.order_code||"",D=l.assay_value||"",S=l.consult_value||"",h=(l.assay_item_name||l.order_name||"").toLowerCase();if(!g)continue;let b=null;if(y==="08011C")if(h.includes("hb")||h.includes("hemoglobin")||h.includes("\u8840\u8272\u7D20"))b="Hb";else continue;else if(y==="09015C")h.includes("gfr")||h.includes("\u814E\u7D72\u7403")?b="GFR":b="Cr";else if(y==="09040C")if(h.includes("upcr")||h.includes("\u86CB\u767D")||h.includes("protein"))b="UPCR";else continue;else if(y==="12111C")if(h.includes("uacr")||h.includes("albumin")||h.includes("\u767D\u86CB\u767D"))b="UACR";else continue;else{let v=k.find(_=>_.orderCode===y&&_.enabled&&!_.subItem);v&&(b=v.name)}b&&(s.add(g),i[b]||(i[b]={name:b,dates:{}}),i[b].dates[g]={value:D,ref:S,isAbnormal:W(D,S)})}let d=[...s].sort().reverse().slice(0,6).reverse(),a=k.filter(l=>l.enabled).map(l=>l.name),r=new Set,p=a.filter(l=>r.has(l)?!1:(r.add(l),i[l]));if(d.length===0||p.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let m='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let l of d)m+=`<th class="lab-date-col">${c(A(l))}</th>`;m+="</tr>";let u="";for(let l of p){let g=i[l];u+=`<tr><td class="lab-item-name">${c(l)}</td>`;for(let y of d){let D=g.dates[y];D?u+=`<td class="${D.isAbnormal?"abnormal":""}">${c(D.value)}</td>`:u+='<td class="no-data">\u2014</td>'}u+="</tr>"}return`<table class="lab-pivot"><thead>${m}</thead><tbody>${u}</tbody></table>
  <div class="tracking-note">${o} \u5929\u5167</div>`}function W(e,o){if(!e||!o||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let n=o.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(n)return t<parseFloat(n[1])||t>parseFloat(n[2]);let s=o.match(/[<≦]\s*([\d.]+)/);if(s)return t>parseFloat(s[1]);let i=o.match(/[>≧]\s*([\d.]+)/);return i?t<parseFloat(i[1]):!1}var Y={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},K={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},J={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function B(e){if(!e)return null;for(let[o,t]of Object.entries(Y))if(t.some(n=>n.length===7?e===n:e.startsWith(n)))return o;return null}function X(e){for(let[o,t]of Object.entries(K))if(t.includes(e))return o;return null}function N(e,o){if(!e)return!1;let t=new Date(e);return isNaN(t.getTime())&&e.includes("/")&&(t=new Date(e.replace(/\//g,"-"))),isNaN(t.getTime())?!1:Date.now()-t.getTime()<=o*864e5}function Q(e,o){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=o||100,n=[];for(let a of e){let r=a.PER_DATE||a.drug_date||"";if(!N(r,t))continue;let p=a.ATC_CODE||a.drug_atc7_code||"",m=B(p);if(!m)continue;let u=X(m);u&&n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:x(r),hosp:$(a.HOSP_NAME||a.hosp),freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||"",groupName:m,colorName:u})}if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let s=["red","orange","green"],i={};for(let a of n){i[a.colorName]||(i[a.colorName]={}),i[a.colorName][a.groupName]||(i[a.colorName][a.groupName]={});let r=a.name;i[a.colorName][a.groupName][r]||(i[a.colorName][a.groupName][r]={...a,prescriptions:[]}),i[a.colorName][a.groupName][r].prescriptions.push({date:a.date,hosp:a.hosp,days:a.medDays,drugLeft:a.drugLeft})}let d="";for(let a of s){if(!i[a])continue;let r=J[a];for(let[p,m]of Object.entries(i[a]))for(let u of Object.values(m)){u.prescriptions.sort((g,y)=>(y.date||"").localeCompare(g.date||""));let l=u.prescriptions.slice(0,3).map(g=>`<span class="med-pres">${c(A(g.date))} ${c(g.hosp)}${g.drugLeft&&g.drugLeft!=="0"?` <span class="drug-left">\u9918${g.drugLeft}\u5929</span>`:""}</span>`).join(" ");d+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${r.bg};border-color:${r.border};color:${r.text}">${c(p)}</span></td>
          <td class="med-name-cell">${c(u.name)}</td>
          <td class="med-pres-cell">${l}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${d}</tbody>
  </table>
  <div class="tracking-note">${t} \u5929\u5167</div>`}function Z(e,o){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=o||100,n=[];for(let a of e){let r=a.PER_DATE||a.drug_date||"";if(!N(r,t))continue;let p=a.ATC_CODE||a.drug_atc7_code||"";B(p)||n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:x(r),hosp:$(a.HOSP_NAME||a.hosp),icd:a.ICD_CODE||a.icd_code||"",icdName:a.ICD_NAME||a.icd_cname||"",freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||""})}if(n.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let s={};for(let a of n){let r=`${a.date}|${a.hosp}`;s[r]||(s[r]={date:a.date,hosp:a.hosp,icd:a.icd,icdName:a.icdName,meds:[]}),s[r].meds.push(a)}let i=Object.values(s).sort((a,r)=>(r.date||"").localeCompare(a.date||"")),d="";for(let a of i){d+=`<div class="med-group-header">${c(A(a.date))} ${c(a.hosp)}`,a.icd&&(d+=` <span class="diag-code">${c(a.icd)}</span>`),d+="</div>";for(let r of a.meds){let p=[r.freq,r.medDays?r.medDays+"\u5929":"",r.drugLeft&&r.drugLeft!=="0"?`\u9918${r.drugLeft}\u5929`:""].filter(Boolean).join(" ");d+=`<div class="med-item">${c(r.name)} <span class="med-detail">${c(p)}</span></div>`}}return d+=`<div class="tracking-note">${t} \u5929\u5167</div>`,d}function V(e){if(!e||e.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let o={};for(let n of e){let s=x(n.func_date||""),i=$(n.hosp),d=`${s}|${i}`;o[d]||(o[d]={date:s,hosp:i,icd:n.icd_code||"",icdName:n.icd_cname||"",meds:[]}),o[d].meds.push(n)}let t="";for(let n of Object.values(o)){t+=`<div class="med-group-header">${c(A(n.date))} ${c(n.hosp)}`,n.icd&&(t+=` <span class="diag-code">${c(n.icd)}</span>`),t+="</div>";for(let s of n.meds){let i=s.drug_perscrn_name||s.cdrug_name||"",d=s.order_qty||"",a=s.drug_fre||"",r=s.day||"";t+=`<div class="med-item">${c(i)} <span class="med-detail">${c(d)} ${c(a)} ${r?r+"\u5929":""}</span></div>`}}return t}var ee=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function te(e){if(!e||e.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let o=180,t=e.filter(d=>{let a=d.real_inspect_date||d.case_time||d.recipe_date||"";if(!N(a,o))return!1;let r=d.order_code||"";return ee.has(r)});if(t.length===0)return`<p class="empty">${o}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let n=new Set,s=[];for(let d of t){let a=x(d.real_inspect_date||d.case_time||d.recipe_date||""),r=d.order_name||"",p=d.order_code||"",m=`${a}|${r}|${p}`;n.has(m)||(n.add(m),s.push(d))}s.sort((d,a)=>{let r=x(d.real_inspect_date||d.case_time||d.recipe_date||"");return x(a.real_inspect_date||a.case_time||a.recipe_date||"").localeCompare(r)});let i="";for(let d of s){let a=A(d.real_inspect_date||d.case_time||d.recipe_date||""),r=d.order_name||"";r=r.replace(/[[\]]/g,"").replace(/;/g," ").trim();let p=$(d.hosp),m=d.inspect_result||"";i+='<div class="imaging-item">',i+=`<div class="imaging-name">${c(r)}</div>`,i+=`<div class="imaging-meta">${c(a)} ${c(p)}</div>`,m&&(i+=`<div class="imaging-result">${c(m)}</div>`),i+="</div>"}return i+=`<div class="tracking-note">${o} \u5929\u5167</div>`,i}function ae(e){if(!e||e.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let o=e.filter(n=>{let s=n.drug_name||"";return s&&!s.includes("\u672A\u8A18\u9304")&&s!=="NP"&&s!=="N.P"&&s!=="N.P."&&!s.includes("\u672A\u904E\u654F")});if(o.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let t="";for(let n of o){let s=n.drug_name||"",i=(n.sympton_name||"").replace(/;/g,", ");t+=`<div class="allergy-item"><strong>${c(s)}</strong>${i?` \u2014 ${c(i)}`:""}</div>`}return t}function ne(e){if(!e||e.length===0)return"";let o="";for(let t of e){let n=A(t.exe_s_date||""),s=$(t.hosp),i=t.icd_cname||t.icd_code||"";o+=`<div class="record-item">${c(n)} ${c(s)} \u2014 ${c(i)}</div>`}return o}function oe(e){if(!e||e.length===0)return"";let o="";for(let t of e){let n=A(t.in_date||""),s=A(t.out_date||""),i=$(t.hosp),d=t.icd_cname||t.icd_code||"";o+=`<div class="record-item">${c(n)}~${c(s)} ${c(i)} \u2014 ${c(d)}</div>`}return o}function re(e,o,t,n){let s="";return n.allergyHtml&&!n.allergyHtml.includes("\u7121\u904E\u654F")&&(s+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${n.allergyHtml}</div></div>`),n.surgeryHtml&&(s+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${n.surgeryHtml}</div></div>`),n.dischargeHtml&&(s+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${n.dischargeHtml}</div></div>`),`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${c(e)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
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
.panel-title { font-size:14px; font-weight:600; padding:10px 14px; border-bottom:1px solid #e8e8e8; color:#333; cursor:pointer; user-select:none; }
.panel-title:hover { background:#f5f5f5; }
.panel-title::before { content:'\u25BE '; font-size:12px; }
.panel-title.collapsed::before { content:'\u25B8 '; }
.panel-body { padding:10px 14px; }
.panel-body.collapsed { display:none; }

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
  .panel-body.collapsed { display:block !important; }
  .panel-title::before { content:'\u25BE ' !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${c(e)}</h1>
    <div class="meta">${c(o)} \uFF5C ${c(t)}</div>
  </div>
  <div class="actions">
    <a onclick="expandAll()">\u5168\u90E8\u5C55\u958B</a>
    <a onclick="collapseAll()">\u5168\u90E8\u6536\u5408</a>
    <a onclick="window.print()">\u5217\u5370</a>
  </div>
</div>

<div class="layout">
  <!-- Left Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u5C31\u91AB\u8A3A\u65B7\u8207\u6536\u6848</div>
      <div class="panel-body">${n.diagnosisHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u897F\u85E5</div>
      <div class="panel-body">${n.westMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">\u5176\u4ED6\u897F\u85E5</div>
      <div class="panel-body collapsed">${n.otherWestMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">\u4E2D\u85E5\u7528\u85E5</div>
      <div class="panel-body collapsed">${n.chineseMedHtml}</div>
    </div>
  </div>

  <!-- Center Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u6AA2\u9A57</div>
      <div class="panel-body" style="padding:0;">${n.labPivotHtml}</div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u5F71\u50CF</div>
      <div class="panel-body">${n.imagingHtml}</div>
    </div>
    ${s}
  </div>
</div>

<script>
function togglePanel(title) {
  title.classList.toggle('collapsed');
  var body = title.nextElementSibling;
  if (body) body.classList.toggle('collapsed');
}
function expandAll() {
  document.querySelectorAll('.panel-title').forEach(function(t) { t.classList.remove('collapsed'); });
  document.querySelectorAll('.panel-body').forEach(function(b) { b.classList.remove('collapsed'); });
}
function collapseAll() {
  document.querySelectorAll('.panel-title').forEach(function(t) { t.classList.add('collapsed'); });
  document.querySelectorAll('.panel-body').forEach(function(b) { b.classList.add('collapsed'); });
}
<\/script>
</body>
</html>`}var f={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},se=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function M(){for(let e of Object.keys(f))se.has(e)||(f[e]=null)}var O=!1;function j(){O||(O=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(O=!1,ie().catch(o=>{console.warn("[NHITW Clinic] Export alarm handler error:",o.message)}))});async function ie(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t=f.patientIdFromToken,n=f.patientName;if(!t){let r=f.currentUserSession;if(!r){console.log("[NHITW Clinic] No session data, skipping export");return}t=r.startsWith("patient_")?r.replace("patient_",""):r}n||(n=t),console.log(`[NHITW Clinic] Export: ID=${t}, Name=${n}`);let s={};for(let[r,p]of Object.entries(f))r!=="token"&&r!=="currentUserSession"&&p&&(s[r]=p);let i=P(n,t,s),d=L(n),a=Math.round(new Blob([i]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${d} (${a}KB, ${Object.keys(s).length} data types)`),a>900){console.warn(`[NHITW Clinic] HTML too large (${a}KB), exceeds Native Messaging limit`);return}await H(d,i),console.log(`[NHITW Clinic] HTML report saved: ${d}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var de={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(de).forEach(([e,o])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${o}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${o}*`]},["responseHeaders"])});var w={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},ce=new Map([["openPopup",(e,o,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,o,t)=>{M(),f.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(w),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,o,t)=>{M(),t({status:"cleared"})}],["getSessionData",(e,o,t)=>{t({status:"success",data:f})}],["getDataStatus",(e,o,t)=>(chrome.storage.local.get(Object.values(w),n=>{let s={},i=(a,r)=>{let p=n[r],m=p?.rObject||p?.robject;m&&Array.isArray(m)?s[a]={status:"fetched",count:m.length}:s[a]={status:"none",count:0}},d={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(w).forEach(([a,r])=>{let p=d[a]||a;i(p,r)}),t({dataStatus:s})}),!0)],["saveMedicationData",C("medication")],["saveLabData",C("labdata")],["saveChineseMedData",C("chinesemed")],["saveImagingData",C("imaging")],["saveAllergyData",C("allergy")],["saveSurgeryData",C("surgery")],["saveDischargeData",C("discharge")],["saveMedDaysData",C("medDays")],["savePatientSummaryData",C("patientSummary")],["saveToken",(e,o,t)=>{f.token=e.token,f.currentUserSession=e.userSession||f.currentUserSession,e.patientName&&(f.patientName=e.patientName),e.patientIdFromToken&&(f.patientIdFromToken=e.patientIdFromToken),console.log(`[NHITW Clinic] saveToken received - Name: ${e.patientName}, ID: ${e.patientIdFromToken}`),j(),t({status:"token_saved"})}],["checkHostStatus",(e,o,t)=>{try{let n=chrome.runtime.connectNative("com.nhitw.host"),s=!1;n.onMessage.addListener(()=>{s=!0,n.disconnect(),t({success:!0,available:!0})}),n.onDisconnect.addListener(()=>{s||t({success:!0,available:!1})}),n.postMessage({action:"read_manifest"})}catch(n){t({success:!0,available:!1,error:n.message})}}]]);function C(e){return function(o,t,n){let s=w[e];if(!s){n({status:"error",error:`Invalid data type: ${e}`});return}f[s]=o.data,f.currentUserSession=o.userSession||f.currentUserSession;let i={[s]:o.data,currentUserSession:o.userSession||f.currentUserSession};chrome.storage.local.set(i,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),j(),o.data&&o.data.rObject&&Array.isArray(o.data.rObject)?n({status:"saved",recordCount:o.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,o,t)=>{e.userSession&&e.userSession!==f.currentUserSession&&(M(),f.currentUserSession=e.userSession);let n=ce.get(e.action);return n?(n(e,o,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,o,t)=>{o.url&&(o.url.includes("medcloud2.nhi.gov.tw/imu/login")||o.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(f).forEach(n=>{f[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
