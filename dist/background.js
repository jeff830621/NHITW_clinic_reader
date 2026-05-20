(()=>{var R="com.nhitw.host";function U(e){return new Promise((o,t)=>{try{let n=chrome.runtime.connectNative(R),r=!1;n.onMessage.addListener(i=>{r=!0,n.disconnect(),i.success?o(i):t(new Error(i.message||i.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!r){let i=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(i))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function F(e,o,t){return U({action:"write_html",filename:e,content:o,date:t||void 0})}function G(e,o,t){let r=z(new Date),i=W(t),c=q(t.labData?.rObject),a=se(t.medicationData?.rObject,100),s=ce(t.medicationData?.rObject,100),l=de(t.chinesemedData?.rObject),m=ue(t.imagingData?.rObject),p=pe(t.allergyData?.rObject),u=me(t.surgeryData?.rObject),f=ge(t.dischargeData?.rObject),v=ae(t);return fe(e,o,r,{diagnosisHtml:i,labPivotHtml:c,westMedHtml:a,otherWestMedHtml:s,chineseMedHtml:l,imagingHtml:m,allergyHtml:p,surgeryHtml:u,dischargeHtml:f,acuBadgeHtml:v})}function L(e,o){let t=o||new Date,n=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),i=String(t.getDate()).padStart(2,"0"),c=String(t.getHours()).padStart(2,"0"),a=String(t.getMinutes()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_")}_${n}${r}${i}_${c}${a}.html`}function z(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function d(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function D(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function S(e){let o=D(e);if(!o)return"";let t=o.split("-");return t.length===3?`${t[1]}/${t[2]}`:o}function A(e){return e?e.split(";")[0].trim():""}function W(e){let t={},n=[],r={},i=[];function c(p,u,f,v,x,$){if(p)for(let h of p){let b=h[u]||"";if(!E(b,180))continue;let y=h[v]||"",_=h[x]||"";if(!y||!_)continue;let O=(h[f]||"").split(";"),w=O[0]?.trim()||"",N=O[1]?.trim()||"\u9580\u8A3A",j=$&&h[$]||"";if(/^Z2[3-7]/.test(y)&&j.startsWith("J07")){i.push({code:y,name:_,date:D(b),hosp:w});continue}N.includes("\u6025\u8A3A")?n.push({code:y,name:_,date:D(b),hosp:w}):N.includes("\u4F4F\u8A3A")||N.includes("\u4F4F\u9662")?r[y]||(r[y]={code:y,name:_,date:D(b),hosp:w}):(t[y]||(t[y]={code:y,name:_,count:0}),t[y].count++)}}c(e.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME","ATC_CODE");let a=e.medicationData?.rObject||[];a.length>0&&!a[0].PER_DATE&&c(a,"drug_date","hosp","icd_code","icd_cname","drug_atc7_code"),c(e.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname",null);let s="",l=Object.values(t).sort((p,u)=>u.count-p.count);if(l.length>0){for(let p of l.slice(0,8))s+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-count">${p.count}</span></div>`;l.length>8&&(s+=`<div class="diag-more">\u9084\u6709 ${l.length-8} \u7B46</div>`)}if(n.length>0){s+='<div class="visit-type-label emergency-label">\u6025\u8A3A</div>';for(let p of n.slice(0,5))s+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}let m=Object.values(r);if(m.length>0){s+='<div class="visit-type-label inpatient-label">\u4F4F\u8A3A</div>';for(let p of m.slice(0,5))s+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)}</div>`}if(i.length>0){s+='<div class="visit-type-label vaccine-label">\u75AB\u82D7</div>';for(let p of i.slice(0,5))s+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}return s||'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>'}var H=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function q(e){if(!e||e.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let o=180,t=new Set(H.filter(u=>u.enabled).map(u=>u.orderCode)),n=e.filter(u=>{let f=u.assay_value;if(!f||f.trim()===""||f.trim()==="***")return!1;let v=u.real_inspect_date||u.recipe_date||"";if(!E(v,o))return!1;let x=u.order_code||"";return t.has(x)});if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let r=new Set,i={};for(let u of n){let f=D(u.real_inspect_date||u.recipe_date||""),v=u.order_code||"",x=u.assay_value||"",$=u.consult_value||"",h=(u.assay_item_name||u.order_name||"").toLowerCase();if(!f)continue;let b=null;if(v==="08011C")if(h.includes("hb")||h.includes("hemoglobin")||h.includes("\u8840\u8272\u7D20"))b="Hb";else continue;else if(v==="09015C")h.includes("gfr")||h.includes("\u814E\u7D72\u7403")?b="GFR":b="Cr";else if(v==="09040C")if(h.includes("upcr")||h.includes("\u86CB\u767D")||h.includes("protein"))b="UPCR";else continue;else if(v==="12111C")if(h.includes("uacr")||h.includes("albumin")||h.includes("\u767D\u86CB\u767D"))b="UACR";else continue;else{let y=H.find(_=>_.orderCode===v&&_.enabled&&!_.subItem);y&&(b=y.name)}b&&(r.add(f),i[b]||(i[b]={name:b,dates:{}}),i[b].dates[f]={value:x,ref:$,isAbnormal:K(x,$)})}let c=[...r].sort().reverse().slice(0,6).reverse(),a=H.filter(u=>u.enabled).map(u=>u.name),s=new Set,l=a.filter(u=>s.has(u)?!1:(s.add(u),i[u]));if(c.length===0||l.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let m='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let u of c)m+=`<th class="lab-date-col">${d(S(u))}</th>`;m+="</tr>";let p="";for(let u of l){let f=i[u];p+=`<tr><td class="lab-item-name">${d(u)}</td>`;for(let v of c){let x=f.dates[v];x?p+=`<td class="${x.isAbnormal?"abnormal":""}">${d(x.value)}</td>`:p+='<td class="no-data">\u2014</td>'}p+="</tr>"}return`<table class="lab-pivot"><thead>${m}</thead><tbody>${p}</tbody></table>
  <div class="tracking-note">${o} \u5929\u5167</div>`}function K(e,o){if(!e||!o||e==="***")return!1;let t=parseFloat(e);if(isNaN(t))return!1;let n=o.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(n)return t<parseFloat(n[1])||t>parseFloat(n[2]);let r=o.match(/[<≦]\s*([\d.]+)/);if(r)return t>parseFloat(r[1]);let i=o.match(/[>≧]\s*([\d.]+)/);return i?t<parseFloat(i[1]):!1}var Y=["G43","G50","G51","G52","G54","G61","G62","G63","G65","G90","M13.0","M15","M20","M21","M66","H02","H04","H05","H10","H20","H25","H26","H52"],J=["A15","B01","B02","B05","B06","B20","B97.2","B97.3","D65","D66","D67","D68","D69","D70","D82","D83","D84","E04","E05","E06","E10","E11","E13","E15","E28","F90","F95","I20","I21","I22","I23","I24","I25","I26","I27","I28","I42","I50","I71","I73","I74","I80","I82","I89","J44","J45","J93","J96","J98","K72","K74","K80","L10","L11","L12","L40","L51","L52","L89","L94","L97","M33","M34","M35","N18","N19","R64"],Q=["A80","D32","D33","D48","D49","F02","F03","F04","F05","F09","F20","F21","F22","F23","F24","F25","F30","F31","F32","F33","F34","F35","F36","F37","F38","F39","F80","F82","F84","G11","G12","G20","G21","G35","G36","G40","G45","G46","G70","G71","G80","G81","G82","G83","G91","G93","G94","H30","H31","H33","H34","H35","H36","H40","H42","H43","H46","H47","H49","H50","H51","H53","H54","H55","I60","I61","I62","I63","I65","I66","I67","I69","M45","M62.3","M99","P91","Q11","Q12","Q13","Q14","Q15","S01.9","S04","S06.3","S06.4","S06.5","S06.6","S14","S22","S24","S32","S34","S44","S54","S64","S74","S84","S94"];function M(e,o){return!e||!o?!1:e===o?!0:e.startsWith(o+".")}function X(e){let o=e&&e.match(/^C(\d{2})/);if(!o)return!1;let t=parseInt(o[1],10);return t>=0&&t<=96}function Z(e){let o=e&&e.match(/^O(\d{2})/);if(!o)return!1;let t=parseInt(o[1],10);return t>=10&&t<=16||t>=20&&t<=29}function V(e){let o=new Set,t=(n,r)=>{if(n)for(let i of n){let c=i[r];c&&o.add(String(c).trim())}};return t(e.medicationData?.rObject,"ICD_CODE"),t(e.medicationData?.rObject,"icd_code"),t(e.chinesemedData?.rObject,"icd_code"),t(e.dischargeData?.rObject,"icd_code"),t(e.surgeryData?.rObject,"icd_code"),Array.from(o).filter(Boolean)}function ee(e){let o=new Set,t=new Set,n=new Set;for(let r of e)(X(r)||Q.some(i=>M(r,i)))&&o.add(r),Y.some(i=>M(r,i))&&t.add(r),(Z(r)||J.some(i=>M(r,i)))&&n.add(r);return{high:[...o],moderate:[...t],special:[...n]}}function te(e){return e.high.length>0||e.moderate.length>0&&e.special.length>0?"high":e.moderate.length>0||e.special.length>0?"moderate":null}function ae(e){let o=V(e),t=ee(o),n=te(t);if(!n)return"";let r,i;n==="high"?(r="\u26A1 \u9AD8\u5EA6\u8907\u96DC\u91DD\u7078",t.high.length>0?i=t.high:i=[...t.moderate.map(l=>l+"(\u4E2D)"),...t.special.map(l=>l+"(\u7279)")]):(r="\u{1F489} \u4E2D\u5EA6\u8907\u96DC\u91DD\u7078",i=[...t.moderate,...t.special.map(l=>l+"(\u7279)")]);let c=i.slice(0,12).join(", "),a=i.length>12?`\u2026 (+${i.length-12})`:"",s=`\u7B26\u5408 ICD: ${c}${a}`;return`<span class="acu-badge acu-${n}" title="${d(s)}">${r}</span>`}var ne={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},oe={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},re={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function P(e){if(!e)return null;for(let[o,t]of Object.entries(ne))if(t.some(n=>n.length===7?e===n:e.startsWith(n)))return o;return null}function ie(e){for(let[o,t]of Object.entries(oe))if(t.includes(e))return o;return null}function E(e,o){if(!e)return!1;let t=new Date(e);return isNaN(t.getTime())&&e.includes("/")&&(t=new Date(e.replace(/\//g,"-"))),isNaN(t.getTime())?!1:Date.now()-t.getTime()<=o*864e5}function se(e,o){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=o||100,n=[];for(let a of e){let s=a.PER_DATE||a.drug_date||"";if(!E(s,t))continue;let l=a.ATC_CODE||a.drug_atc7_code||"",m=P(l);if(!m)continue;let p=ie(m);p&&n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:D(s),hosp:A(a.HOSP_NAME||a.hosp),freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||"",groupName:m,colorName:p})}if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let r=["red","orange","green"],i={};for(let a of n){i[a.colorName]||(i[a.colorName]={}),i[a.colorName][a.groupName]||(i[a.colorName][a.groupName]={});let s=a.name;i[a.colorName][a.groupName][s]||(i[a.colorName][a.groupName][s]={...a,prescriptions:[]}),i[a.colorName][a.groupName][s].prescriptions.push({date:a.date,hosp:a.hosp,days:a.medDays,drugLeft:a.drugLeft})}let c="";for(let a of r){if(!i[a])continue;let s=re[a];for(let[l,m]of Object.entries(i[a]))for(let p of Object.values(m)){p.prescriptions.sort((f,v)=>(v.date||"").localeCompare(f.date||""));let u=p.prescriptions.slice(0,3).map(f=>`<span class="med-pres">${d(S(f.date))} ${d(f.hosp)}${f.drugLeft&&f.drugLeft!=="0"?` <span class="drug-left">\u9918${f.drugLeft}\u5929</span>`:""}</span>`).join(" ");c+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${s.bg};border-color:${s.border};color:${s.text}">${d(l)}</span></td>
          <td class="med-name-cell">${d(p.name)}</td>
          <td class="med-pres-cell">${u}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${c}</tbody>
  </table>
  <div class="tracking-note">${t} \u5929\u5167</div>`}function ce(e,o){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=o||100,n=[];for(let a of e){let s=a.PER_DATE||a.drug_date||"";if(!E(s,t))continue;let l=a.ATC_CODE||a.drug_atc7_code||"";P(l)||n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:D(s),hosp:A(a.HOSP_NAME||a.hosp),icd:a.ICD_CODE||a.icd_code||"",icdName:a.ICD_NAME||a.icd_cname||"",freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||""})}if(n.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let r={};for(let a of n){let s=`${a.date}|${a.hosp}`;r[s]||(r[s]={date:a.date,hosp:a.hosp,icd:a.icd,icdName:a.icdName,meds:[]}),r[s].meds.push(a)}let i=Object.values(r).sort((a,s)=>(s.date||"").localeCompare(a.date||"")),c="";for(let a of i){c+=`<div class="med-group-header">${d(S(a.date))} ${d(a.hosp)}`,a.icd&&(c+=` <span class="diag-code">${d(a.icd)}</span>`),c+="</div>";for(let s of a.meds){let l=[s.freq,s.medDays?s.medDays+"\u5929":"",s.drugLeft&&s.drugLeft!=="0"?`\u9918${s.drugLeft}\u5929`:""].filter(Boolean).join(" ");c+=`<div class="med-item">${d(s.name)} <span class="med-detail">${d(l)}</span></div>`}}return c+=`<div class="tracking-note">${t} \u5929\u5167</div>`,c}function de(e){if(!e||e.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let o={};for(let n of e){let r=D(n.func_date||""),i=A(n.hosp),c=`${r}|${i}`;o[c]||(o[c]={date:r,hosp:i,icd:n.icd_code||"",icdName:n.icd_cname||"",meds:[]}),o[c].meds.push(n)}let t="";for(let n of Object.values(o)){t+=`<div class="med-group-header">${d(S(n.date))} ${d(n.hosp)}`,n.icd&&(t+=` <span class="diag-code">${d(n.icd)}</span>`),t+="</div>";for(let r of n.meds){let i=r.drug_perscrn_name||r.cdrug_name||"",c=r.order_qty||"",a=r.drug_fre||"",s=r.day||"";t+=`<div class="med-item">${d(i)} <span class="med-detail">${d(c)} ${d(a)} ${s?s+"\u5929":""}</span></div>`}}return t}var le=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function ue(e){if(!e||e.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let o=180,t=e.filter(c=>{let a=c.real_inspect_date||c.case_time||c.recipe_date||"";if(!E(a,o))return!1;let s=c.order_code||"";return le.has(s)});if(t.length===0)return`<p class="empty">${o}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let n=new Set,r=[];for(let c of t){let a=D(c.real_inspect_date||c.case_time||c.recipe_date||""),s=c.order_name||"",l=c.order_code||"",m=`${a}|${s}|${l}`;n.has(m)||(n.add(m),r.push(c))}r.sort((c,a)=>{let s=D(c.real_inspect_date||c.case_time||c.recipe_date||"");return D(a.real_inspect_date||a.case_time||a.recipe_date||"").localeCompare(s)});let i="";for(let c of r){let a=S(c.real_inspect_date||c.case_time||c.recipe_date||""),s=c.order_name||"";s=s.replace(/[[\]]/g,"").replace(/;/g," ").trim();let l=A(c.hosp),m=c.inspect_result||"";i+='<div class="imaging-item">',i+=`<div class="imaging-name">${d(s)}</div>`,i+=`<div class="imaging-meta">${d(a)} ${d(l)}</div>`,m&&(i+=`<div class="imaging-result">${d(m)}</div>`),i+="</div>"}return i+=`<div class="tracking-note">${o} \u5929\u5167</div>`,i}function pe(e){if(!e||e.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let o=e.filter(n=>{let r=n.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(o.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let t="";for(let n of o){let r=n.drug_name||"",i=(n.sympton_name||"").replace(/;/g,", ");t+=`<div class="allergy-item"><strong>${d(r)}</strong>${i?` \u2014 ${d(i)}`:""}</div>`}return t}function me(e){if(!e||e.length===0)return"";let o="";for(let t of e){let n=S(t.exe_s_date||""),r=A(t.hosp),i=t.icd_cname||t.icd_code||"";o+=`<div class="record-item">${d(n)} ${d(r)} \u2014 ${d(i)}</div>`}return o}function ge(e){if(!e||e.length===0)return"";let o="";for(let t of e){let n=S(t.in_date||""),r=S(t.out_date||""),i=A(t.hosp),c=t.icd_cname||t.icd_code||"";o+=`<div class="record-item">${d(n)}~${d(r)} ${d(i)} \u2014 ${d(c)}</div>`}return o}function fe(e,o,t,n){let r="";return n.allergyHtml&&!n.allergyHtml.includes("\u7121\u904E\u654F")&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${n.allergyHtml}</div></div>`),n.surgeryHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${n.surgeryHtml}</div></div>`),n.dischargeHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${n.dischargeHtml}</div></div>`),`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d(e)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:"Microsoft JhengHei","PingFang TC",sans-serif; background:#f0f2f5; color:#333; font-size:13px; }

.header { background:#1976d2; color:#fff; padding:12px 20px; display:flex; justify-content:space-between; align-items:center; }
.header h1 { font-size:18px; font-weight:600; }
.header .meta { font-size:12px; opacity:0.85; }
.header .actions { display:flex; gap:8px; }
.header .actions a { color:#fff; background:rgba(255,255,255,0.2); padding:4px 12px; border-radius:4px; text-decoration:none; font-size:12px; cursor:pointer; }
.header .actions a:hover { background:rgba(255,255,255,0.35); }

.acu-badge { display:inline-block; margin-left:10px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; }
.acu-badge.acu-high { background:#d32f2f; color:#fff; box-shadow:0 0 0 2px rgba(255,255,255,0.3); }
.acu-badge.acu-moderate { background:#f57c00; color:#fff; }

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
    <h1>${d(e)}${n.acuBadgeHtml||""}</h1>
    <div class="meta">${d(o)} \uFF5C ${d(t)}</div>
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
    ${r}
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
</html>`}var g={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},he=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function T(){for(let e of Object.keys(g))he.has(e)||(g[e]=null)}var k=!1;function B(){k||(k=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(k=!1,be().catch(o=>{console.warn("[NHITW Clinic] Export alarm handler error:",o.message)}))});async function be(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;try{let s=await chrome.tabs.query({url:"https://medcloud2.nhi.gov.tw/*"});if(s.length>0){let l=await chrome.tabs.sendMessage(s[0].id,{action:"getPatientInfo"});l?.name&&(g.patientName=l.name),l?.id&&(g.patientIdFromToken=l.id),console.log("[NHITW Clinic] Fresh patient info from tab:",l)}}catch(s){console.warn("[NHITW Clinic] Failed to get fresh patient info:",s.message)}let t=g.patientIdFromToken,n=g.patientName;if(!t){let s=g.currentUserSession;if(!s){console.log("[NHITW Clinic] No session data, skipping export");return}t=s.startsWith("patient_")?s.replace("patient_",""):s}n||(n=t),console.log(`[NHITW Clinic] Export: ID=${t}, Name=${n}`);let r={};for(let[s,l]of Object.entries(g))s!=="token"&&s!=="currentUserSession"&&l&&(r[s]=l);let i=G(n,t,r),c=L(n),a=Math.round(new Blob([i]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${c} (${a}KB, ${Object.keys(r).length} data types)`),a>900){console.warn(`[NHITW Clinic] HTML too large (${a}KB), exceeds Native Messaging limit`);return}await F(c,i),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}var ve={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(ve).forEach(([e,o])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e}),{cancel:!1}},{urls:[`https://${o}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(o)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${o}*`]},["responseHeaders"])});var I={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},ye=new Map([["openPopup",(e,o,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,o,t)=>{T(),g.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(I),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,o,t)=>{T(),t({status:"cleared"})}],["getSessionData",(e,o,t)=>{t({status:"success",data:g})}],["getDataStatus",(e,o,t)=>(chrome.storage.local.get(Object.values(I),n=>{let r={},i=(a,s)=>{let l=n[s],m=l?.rObject||l?.robject;m&&Array.isArray(m)?r[a]={status:"fetched",count:m.length}:r[a]={status:"none",count:0}},c={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(I).forEach(([a,s])=>{let l=c[a]||a;i(l,s)}),t({dataStatus:r})}),!0)],["saveMedicationData",C("medication")],["saveLabData",C("labdata")],["saveChineseMedData",C("chinesemed")],["saveImagingData",C("imaging")],["saveAllergyData",C("allergy")],["saveSurgeryData",C("surgery")],["saveDischargeData",C("discharge")],["saveMedDaysData",C("medDays")],["savePatientSummaryData",C("patientSummary")],["saveToken",(e,o,t)=>{g.token=e.token,g.currentUserSession=e.userSession||g.currentUserSession,e.patientName&&(g.patientName=e.patientName),e.patientIdFromToken&&(g.patientIdFromToken=e.patientIdFromToken),console.log(`[NHITW Clinic] saveToken received - Name: ${e.patientName}, ID: ${e.patientIdFromToken}`),B(),t({status:"token_saved"})}],["checkHostStatus",(e,o,t)=>{try{let n=chrome.runtime.connectNative("com.nhitw.host"),r=!1;n.onMessage.addListener(()=>{r=!0,n.disconnect(),t({success:!0,available:!0})}),n.onDisconnect.addListener(()=>{r||t({success:!0,available:!1})}),n.postMessage({action:"read_manifest"})}catch(n){t({success:!0,available:!1,error:n.message})}}]]);function C(e){return function(o,t,n){let r=I[e];if(!r){n({status:"error",error:`Invalid data type: ${e}`});return}g[r]=o.data,g.currentUserSession=o.userSession||g.currentUserSession;let i={[r]:o.data,currentUserSession:o.userSession||g.currentUserSession};chrome.storage.local.set(i,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),B(),o.data&&o.data.rObject&&Array.isArray(o.data.rObject)?n({status:"saved",recordCount:o.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,o,t)=>{e.userSession&&e.userSession!==g.currentUserSession&&(T(),g.currentUserSession=e.userSession);let n=ye.get(e.action);return n?(n(e,o,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,o,t)=>{o.url&&(o.url.includes("medcloud2.nhi.gov.tw/imu/login")||o.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(g).forEach(n=>{g[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
