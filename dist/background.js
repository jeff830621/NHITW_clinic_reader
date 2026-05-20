(()=>{var R="com.nhitw.host";function z(t){return new Promise((o,e)=>{try{let n=chrome.runtime.connectNative(R),r=!1;n.onMessage.addListener(s=>{r=!0,n.disconnect(),s.success?o(s):e(new Error(s.message||s.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!r){let s=chrome.runtime.lastError?.message||"Native host disconnected";e(new Error(s))}}),n.postMessage(t)}catch(n){e(new Error(`Native messaging unavailable: ${n.message}`))}})}async function F(t,o,e){return z({action:"write_html",filename:t,content:o,date:e||void 0})}function P(t,o,e){let r=W(new Date),s=q(e),c=K(e.labData?.rObject),a=le(e.medicationData?.rObject,100),i=ue(e.medicationData?.rObject,100),l=pe(e.chinesemedData?.rObject),m=ge(e.imagingData?.rObject),p=fe(e.allergyData?.rObject),u=he(e.surgeryData?.rObject),f=be(e.dischargeData?.rObject),C=ae(e),y=re(e);return Ce(t,o,r,{diagnosisHtml:s,labPivotHtml:c,westMedHtml:a,otherWestMedHtml:i,chineseMedHtml:l,imagingHtml:m,allergyHtml:p,surgeryHtml:u,dischargeHtml:f,acuBadgeHtml:C,cancerBadgeHtml:y})}function G(t,o){let e=o||new Date,n=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),s=String(e.getDate()).padStart(2,"0"),c=String(e.getHours()).padStart(2,"0"),a=String(e.getMinutes()).padStart(2,"0");return`${t.replace(/[\\/:*?"<>|]/g,"_")}_${n}${r}${s}_${c}${a}.html`}function W(t){return`${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,"0")}/${String(t.getDate()).padStart(2,"0")} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function d(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function D(t){return t?t.includes("T")?t.split("T")[0]:t.replace(/\//g,"-"):""}function S(t){let o=D(t);if(!o)return"";let e=o.split("-");return e.length===3?`${e[1]}/${e[2]}`:o}function $(t){return t?t.split(";")[0].trim():""}function q(t){let e={},n=[],r={},s=[];function c(p,u,f,C,y,I){if(p)for(let h of p){let b=h[u]||"";if(!E(b,180))continue;let v=h[C]||"",_=h[y]||"";if(!v||!_)continue;let O=(h[f]||"").split(";"),N=O[0]?.trim()||"",H=O[1]?.trim()||"\u9580\u8A3A",U=I&&h[I]||"";if(/^Z2[3-7]/.test(v)&&U.startsWith("J07")){s.push({code:v,name:_,date:D(b),hosp:N});continue}H.includes("\u6025\u8A3A")?n.push({code:v,name:_,date:D(b),hosp:N}):H.includes("\u4F4F\u8A3A")||H.includes("\u4F4F\u9662")?r[v]||(r[v]={code:v,name:_,date:D(b),hosp:N}):(e[v]||(e[v]={code:v,name:_,count:0}),e[v].count++)}}c(t.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME","ATC_CODE");let a=t.medicationData?.rObject||[];a.length>0&&!a[0].PER_DATE&&c(a,"drug_date","hosp","icd_code","icd_cname","drug_atc7_code"),c(t.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname",null);let i="",l=Object.values(e).sort((p,u)=>u.count-p.count);if(l.length>0){for(let p of l.slice(0,8))i+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-count">${p.count}</span></div>`;l.length>8&&(i+=`<div class="diag-more">\u9084\u6709 ${l.length-8} \u7B46</div>`)}if(n.length>0){i+='<div class="visit-type-label emergency-label">\u6025\u8A3A</div>';for(let p of n.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}let m=Object.values(r);if(m.length>0){i+='<div class="visit-type-label inpatient-label">\u4F4F\u8A3A</div>';for(let p of m.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)}</div>`}if(s.length>0){i+='<div class="visit-type-label vaccine-label">\u75AB\u82D7</div>';for(let p of s.slice(0,5))i+=`<div class="diag-item"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}return i||'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>'}var M=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function K(t){if(!t||t.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let o=180,e=new Set(M.filter(u=>u.enabled).map(u=>u.orderCode)),n=t.filter(u=>{let f=u.assay_value;if(!f||f.trim()===""||f.trim()==="***")return!1;let C=u.real_inspect_date||u.recipe_date||"";if(!E(C,o))return!1;let y=u.order_code||"";return e.has(y)});if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let r=new Set,s={};for(let u of n){let f=D(u.real_inspect_date||u.recipe_date||""),C=u.order_code||"",y=u.assay_value||"",I=u.consult_value||"",h=(u.assay_item_name||u.order_name||"").toLowerCase();if(!f)continue;let b=null;if(C==="08011C")if(h.includes("hb")||h.includes("hemoglobin")||h.includes("\u8840\u8272\u7D20"))b="Hb";else continue;else if(C==="09015C")h.includes("gfr")||h.includes("\u814E\u7D72\u7403")?b="GFR":b="Cr";else if(C==="09040C")if(h.includes("upcr")||h.includes("\u86CB\u767D")||h.includes("protein"))b="UPCR";else continue;else if(C==="12111C")if(h.includes("uacr")||h.includes("albumin")||h.includes("\u767D\u86CB\u767D"))b="UACR";else continue;else{let v=M.find(_=>_.orderCode===C&&_.enabled&&!_.subItem);v&&(b=v.name)}b&&(r.add(f),s[b]||(s[b]={name:b,dates:{}}),s[b].dates[f]={value:y,ref:I,isAbnormal:Y(y,I)})}let c=[...r].sort().reverse().slice(0,6).reverse(),a=M.filter(u=>u.enabled).map(u=>u.name),i=new Set,l=a.filter(u=>i.has(u)?!1:(i.add(u),s[u]));if(c.length===0||l.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u6AA2\u9A57\u7D50\u679C</p>';let m='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let u of c)m+=`<th class="lab-date-col">${d(S(u))}</th>`;m+="</tr>";let p="";for(let u of l){let f=s[u];p+=`<tr><td class="lab-item-name">${d(u)}</td>`;for(let C of c){let y=f.dates[C];y?p+=`<td class="${y.isAbnormal?"abnormal":""}">${d(y.value)}</td>`:p+='<td class="no-data">\u2014</td>'}p+="</tr>"}return`<table class="lab-pivot"><thead>${m}</thead><tbody>${p}</tbody></table>
  <div class="tracking-note">${o} \u5929\u5167</div>`}function Y(t,o){if(!t||!o||t==="***")return!1;let e=parseFloat(t);if(isNaN(e))return!1;let n=o.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(n)return e<parseFloat(n[1])||e>parseFloat(n[2]);let r=o.match(/[<≦]\s*([\d.]+)/);if(r)return e>parseFloat(r[1]);let s=o.match(/[>≧]\s*([\d.]+)/);return s?e<parseFloat(s[1]):!1}var Z=["G43","G50","G51","G52","G54","G61","G62","G63","G65","G90","M13.0","M15","M20","M21","M66","H02","H04","H05","H10","H20","H25","H26","H52"],J=["A15","B01","B02","B05","B06","B20","B97.2","B97.3","D65","D66","D67","D68","D69","D70","D82","D83","D84","E04","E05","E06","E10","E11","E13","E15","E28","F90","F95","I20","I21","I22","I23","I24","I25","I26","I27","I28","I42","I50","I71","I73","I74","I80","I82","I89","J44","J45","J93","J96","J98","K72","K74","K80","L10","L11","L12","L40","L51","L52","L89","L94","L97","M33","M34","M35","N18","N19","R64"],Q=["A80","D32","D33","D48","D49","F02","F03","F04","F05","F09","F20","F21","F22","F23","F24","F25","F30","F31","F32","F33","F34","F35","F36","F37","F38","F39","F80","F82","F84","G11","G12","G20","G21","G35","G36","G40","G45","G46","G70","G71","G80","G81","G82","G83","G91","G93","G94","H30","H31","H33","H34","H35","H36","H40","H42","H43","H46","H47","H49","H50","H51","H53","H54","H55","I60","I61","I62","I63","I65","I66","I67","I69","M45","M62.3","M99","P91","Q11","Q12","Q13","Q14","Q15","S01.9","S04","S06.3","S06.4","S06.5","S06.6","S14","S22","S24","S32","S34","S44","S54","S64","S74","S84","S94"];function A(t,o){if(!t||!o)return!1;let e=String(t).replace(/\./g,"").toUpperCase().trim(),n=String(o).replace(/\./g,"").toUpperCase().trim();return!e||!n?!1:e===n||e.startsWith(n)}function X(t){let o=t&&String(t).toUpperCase().replace(/\./g,"").match(/^C(\d{2})/);if(!o)return!1;let e=parseInt(o[1],10);return e>=0&&e<=96}function V(t){let o=t&&String(t).toUpperCase().replace(/\./g,"").match(/^O(\d{2})/);if(!o)return!1;let e=parseInt(o[1],10);return e>=10&&e<=16||e>=20&&e<=29}function L(t){let o=new Set,e=["ICD_CODE","icd_code","ICD_CODE_1","icd_code_1","ICD_CODE_2","icd_code_2","ICD_CODE_3","icd_code_3","ICD_CODE_4","icd_code_4","ICD_CODE_5","icd_code_5","icdCode","icdcode","ICD10_CODE","icd10_code","main_icd","sub_icd","MAIN_ICD","SUB_ICD","DIAG_CODE","diag_code"],n=s=>{if(Array.isArray(s)){for(let c of s)if(!(!c||typeof c!="object"))for(let a of e){let i=c[a];i&&o.add(String(i).trim())}}};n(t.medicationData?.rObject),n(t.chinesemedData?.rObject),n(t.dischargeData?.rObject),n(t.surgeryData?.rObject),n(t.patientSummaryData?.rObject);let r=Array.from(o).filter(Boolean);return console.log("[NHITW Clinic] Collected ICD codes for classification:",r),r}function ee(t){let o=new Set,e=new Set,n=new Set;for(let r of t)(X(r)||Q.some(s=>A(r,s)))&&o.add(r),Z.some(s=>A(r,s))&&e.add(r),(V(r)||J.some(s=>A(r,s)))&&n.add(r);return{high:[...o],moderate:[...e],special:[...n]}}function te(t){return t.high.length>0||t.moderate.length>0&&t.special.length>0?"high":t.moderate.length>0||t.special.length>0?"moderate":null}function ae(t){let o=L(t),e=ee(o),n=te(e);if(console.log("[NHITW Clinic] Acupuncture matches:",e,"level:",n),!n)return"";let r,s;n==="high"?(r="\u26A1 \u9AD8\u5EA6\u8907\u96DC\u91DD\u7078",e.high.length>0?s=e.high:s=[...e.moderate.map(l=>l+"(\u4E2D)"),...e.special.map(l=>l+"(\u7279)")]):(r="\u{1F489} \u4E2D\u5EA6\u8907\u96DC\u91DD\u7078",s=[...e.moderate,...e.special.map(l=>l+"(\u7279)")]);let c=s.slice(0,12).join(", "),a=s.length>12?`\u2026 (+${s.length-12})`:"",i=`\u7B26\u5408 ICD: ${c}${a}`;return`<span class="acu-badge acu-${n}" title="${d(i)}">${r}</span>`}var ne=[{name:"\u4E73\u764C",primary:["C50","C79.81"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C50","Z85.3"]},{name:"\u809D\u764C",primary:["C22","C23","C24"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.3","C79.5","C79.7","Z94.4"],secondary:["C22","C23","C24","Z85.05"]},{name:"\u80BA\u764C",primary:["C33","C34"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.3","C79.5","C79.6","C79.7","Z94.2"],secondary:["C33","C34","Z85.1"]},{name:"\u5927\u8178\u764C",primary:["C18","C19","C20","C21"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.0","C79.3","C79.5","C79.6","C79.7"],secondary:["C18","C19","C20","C21","Z85.04"]},{name:"\u80C3\u764C",primary:["C16","C49.A1","C49.A2"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C16","C49.A1","C49.A2","Z85.028"]},{name:"\u651D\u8B77\u817A\u764C",primary:["C61"]},{name:"\u53E3\u8154\u764C",primary:["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"]},{name:"\u5B50\u5BAE\u9838\u764C",primary:["C53"]},{name:"\u5B50\u5BAE\u9AD4\u764C",primary:["C54"]},{name:"\u7532\u72C0\u817A\u764C",primary:["C73"]}];function oe(t){let o=[];for(let e of ne){let n=new Set,r=!1;for(let s of t)e.primary.some(c=>A(s,c))&&(n.add(s),r=!0);if(e.mets&&e.secondary){let s=t.filter(a=>e.mets.some(i=>A(a,i))),c=t.filter(a=>e.secondary.some(i=>A(a,i)));s.length>0&&c.length>0&&(s.forEach(a=>n.add(a)),c.forEach(a=>n.add(a)),r=!0)}r&&o.push({name:e.name,hits:[...n]})}return o}function re(t){let o=L(t),e=oe(o);if(console.log("[NHITW Clinic] Cancer-care detected:",e),e.length===0)return"";let n=e.map(i=>i.name).join("\u3001"),r=[...new Set(e.flatMap(i=>i.hits))],s=r.slice(0,15).join(", "),c=r.length>15?`\u2026 (+${r.length-15})`:"",a=`\u7B26\u5408\u4E2D\u91AB\u764C\u75C7\u52A0\u5F37\u7167\u8B77\u65B9\u6848\uFF1A${n}
\u547D\u4E2D ICD: ${s}${c}`;return`<span class="cancer-badge" title="${d(a)}">\u{1F397} \u764C\u75C7\u5C08\u6848\uFF08${d(n)}\uFF09</span>`}var ie={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},se={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},ce={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function B(t){if(!t)return null;for(let[o,e]of Object.entries(ie))if(e.some(n=>n.length===7?t===n:t.startsWith(n)))return o;return null}function de(t){for(let[o,e]of Object.entries(se))if(e.includes(t))return o;return null}function E(t,o){if(!t)return!1;let e=new Date(t);return isNaN(e.getTime())&&t.includes("/")&&(e=new Date(t.replace(/\//g,"-"))),isNaN(e.getTime())?!1:Date.now()-e.getTime()<=o*864e5}function le(t,o){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=o||100,n=[];for(let a of t){let i=a.PER_DATE||a.drug_date||"";if(!E(i,e))continue;let l=a.ATC_CODE||a.drug_atc7_code||"",m=B(l);if(!m)continue;let p=de(m);p&&n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:D(i),hosp:$(a.HOSP_NAME||a.hosp),freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||"",groupName:m,colorName:p})}if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let r=["red","orange","green"],s={};for(let a of n){s[a.colorName]||(s[a.colorName]={}),s[a.colorName][a.groupName]||(s[a.colorName][a.groupName]={});let i=a.name;s[a.colorName][a.groupName][i]||(s[a.colorName][a.groupName][i]={...a,prescriptions:[]}),s[a.colorName][a.groupName][i].prescriptions.push({date:a.date,hosp:a.hosp,days:a.medDays,drugLeft:a.drugLeft})}let c="";for(let a of r){if(!s[a])continue;let i=ce[a];for(let[l,m]of Object.entries(s[a]))for(let p of Object.values(m)){p.prescriptions.sort((f,C)=>(C.date||"").localeCompare(f.date||""));let u=p.prescriptions.slice(0,3).map(f=>`<span class="med-pres">${d(S(f.date))} ${d(f.hosp)}${f.drugLeft&&f.drugLeft!=="0"?` <span class="drug-left">\u9918${f.drugLeft}\u5929</span>`:""}</span>`).join(" ");c+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${i.bg};border-color:${i.border};color:${i.text}">${d(l)}</span></td>
          <td class="med-name-cell">${d(p.name)}</td>
          <td class="med-pres-cell">${u}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${c}</tbody>
  </table>
  <div class="tracking-note">${e} \u5929\u5167</div>`}function ue(t,o){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=o||100,n=[];for(let a of t){let i=a.PER_DATE||a.drug_date||"";if(!E(i,e))continue;let l=a.ATC_CODE||a.drug_atc7_code||"";B(l)||n.push({name:a.MED_DESC||a.MED_ITEM||a.drug_ename||"",generic:a.GENERIC_NAME||a.drug_ing_name||"",date:D(i),hosp:$(a.HOSP_NAME||a.hosp),icd:a.ICD_CODE||a.icd_code||"",icdName:a.ICD_NAME||a.icd_cname||"",freq:a.FREQ_DESC||a.drug_fre||"",medDays:a.MED_DAYS||a.day||"",drugLeft:a.DRUG_LEFT||a.drug_left||""})}if(n.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let r={};for(let a of n){let i=`${a.date}|${a.hosp}`;r[i]||(r[i]={date:a.date,hosp:a.hosp,icd:a.icd,icdName:a.icdName,meds:[]}),r[i].meds.push(a)}let s=Object.values(r).sort((a,i)=>(i.date||"").localeCompare(a.date||"")),c="";for(let a of s){c+=`<div class="med-group-header">${d(S(a.date))} ${d(a.hosp)}`,a.icd&&(c+=` <span class="diag-code">${d(a.icd)}</span>`),c+="</div>";for(let i of a.meds){let l=[i.freq,i.medDays?i.medDays+"\u5929":"",i.drugLeft&&i.drugLeft!=="0"?`\u9918${i.drugLeft}\u5929`:""].filter(Boolean).join(" ");c+=`<div class="med-item">${d(i.name)} <span class="med-detail">${d(l)}</span></div>`}}return c+=`<div class="tracking-note">${e} \u5929\u5167</div>`,c}function pe(t){if(!t||t.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let o={};for(let n of t){let r=D(n.func_date||""),s=$(n.hosp),c=`${r}|${s}`;o[c]||(o[c]={date:r,hosp:s,icd:n.icd_code||"",icdName:n.icd_cname||"",meds:[]}),o[c].meds.push(n)}let e="";for(let n of Object.values(o)){e+=`<div class="med-group-header">${d(S(n.date))} ${d(n.hosp)}`,n.icd&&(e+=` <span class="diag-code">${d(n.icd)}</span>`),e+="</div>";for(let r of n.meds){let s=r.drug_perscrn_name||r.cdrug_name||"",c=r.order_qty||"",a=r.drug_fre||"",i=r.day||"";e+=`<div class="med-item">${d(s)} <span class="med-detail">${d(c)} ${d(a)} ${i?i+"\u5929":""}</span></div>`}}return e}var me=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function ge(t){if(!t||t.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let o=180,e=t.filter(c=>{let a=c.real_inspect_date||c.case_time||c.recipe_date||"";if(!E(a,o))return!1;let i=c.order_code||"";return me.has(i)});if(e.length===0)return`<p class="empty">${o}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let n=new Set,r=[];for(let c of e){let a=D(c.real_inspect_date||c.case_time||c.recipe_date||""),i=c.order_name||"",l=c.order_code||"",m=`${a}|${i}|${l}`;n.has(m)||(n.add(m),r.push(c))}r.sort((c,a)=>{let i=D(c.real_inspect_date||c.case_time||c.recipe_date||"");return D(a.real_inspect_date||a.case_time||a.recipe_date||"").localeCompare(i)});let s="";for(let c of r){let a=S(c.real_inspect_date||c.case_time||c.recipe_date||""),i=c.order_name||"";i=i.replace(/[[\]]/g,"").replace(/;/g," ").trim();let l=$(c.hosp),m=c.inspect_result||"";s+='<div class="imaging-item">',s+=`<div class="imaging-name">${d(i)}</div>`,s+=`<div class="imaging-meta">${d(a)} ${d(l)}</div>`,m&&(s+=`<div class="imaging-result">${d(m)}</div>`),s+="</div>"}return s+=`<div class="tracking-note">${o} \u5929\u5167</div>`,s}function fe(t){if(!t||t.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let o=t.filter(n=>{let r=n.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(o.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let e="";for(let n of o){let r=n.drug_name||"",s=(n.sympton_name||"").replace(/;/g,", ");e+=`<div class="allergy-item"><strong>${d(r)}</strong>${s?` \u2014 ${d(s)}`:""}</div>`}return e}function he(t){if(!t||t.length===0)return"";let o="";for(let e of t){let n=S(e.exe_s_date||""),r=$(e.hosp),s=e.icd_cname||e.icd_code||"";o+=`<div class="record-item">${d(n)} ${d(r)} \u2014 ${d(s)}</div>`}return o}function be(t){if(!t||t.length===0)return"";let o="";for(let e of t){let n=S(e.in_date||""),r=S(e.out_date||""),s=$(e.hosp),c=e.icd_cname||e.icd_code||"";o+=`<div class="record-item">${d(n)}~${d(r)} ${d(s)} \u2014 ${d(c)}</div>`}return o}function Ce(t,o,e,n){let r="";return n.allergyHtml&&!n.allergyHtml.includes("\u7121\u904E\u654F")&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${n.allergyHtml}</div></div>`),n.surgeryHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${n.surgeryHtml}</div></div>`),n.dischargeHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${n.dischargeHtml}</div></div>`),`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${d(t)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
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
.cancer-badge { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; background:#7b1fa2; color:#fff; }

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
    <h1>${d(t)}${n.acuBadgeHtml||""}${n.cancerBadgeHtml||""}</h1>
    <div class="meta">${d(o)} \uFF5C ${d(e)}</div>
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
</html>`}var g={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},ve=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function T(){for(let t of Object.keys(g))ve.has(t)||(g[t]=null)}var k=!1;function j(){k||(k=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(t=>{t.name==="htmlExport"&&(k=!1,ye().catch(o=>{console.warn("[NHITW Clinic] Export alarm handler error:",o.message)}))});async function ye(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;try{let i=await chrome.tabs.query({url:"https://medcloud2.nhi.gov.tw/*"});if(i.length>0){let l=await chrome.tabs.sendMessage(i[0].id,{action:"getPatientInfo"});l?.name&&(g.patientName=l.name),l?.id&&(g.patientIdFromToken=l.id),console.log("[NHITW Clinic] Fresh patient info from tab:",l)}}catch(i){console.warn("[NHITW Clinic] Failed to get fresh patient info:",i.message)}let e=g.patientIdFromToken,n=g.patientName;if(!e){let i=g.currentUserSession;if(!i){console.log("[NHITW Clinic] No session data, skipping export");return}e=i.startsWith("patient_")?i.replace("patient_",""):i}n||(n=e),console.log(`[NHITW Clinic] Export: ID=${e}, Name=${n}`);let r={};for(let[i,l]of Object.entries(g))i!=="token"&&i!=="currentUserSession"&&l&&(r[i]=l);let s=P(n,e,r),c=G(n),a=Math.round(new Blob([s]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${c} (${a}KB, ${Object.keys(r).length} data types)`),a>900){console.warn(`[NHITW Clinic] HTML too large (${a}KB), exceeds Native Messaging limit`);return}await F(c,s),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(t){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",t.message)}}var De={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(De).forEach(([t,o])=>{chrome.webRequest.onBeforeRequest.addListener(function(e){return e.method==="GET"&&e.url.includes(o)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallDetected",url:e.url,type:t}),{cancel:!1}},{urls:[`https://${o}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(e){e.method==="GET"&&e.url.includes(o)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallCompleted",url:e.url,statusCode:e.statusCode,type:t})},{urls:[`https://${o}*`]},["responseHeaders"])});var w={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},_e=new Map([["openPopup",(t,o,e)=>{chrome.action.openPopup(),e({status:"received"})}],["userSessionChanged",(t,o,e)=>{T(),g.currentUserSession=t.userSession,chrome.storage.local.remove(Object.values(w),function(){chrome.action.setBadgeText({text:""})}),e({status:"session_reset"})}],["clearSessionData",(t,o,e)=>{T(),e({status:"cleared"})}],["getSessionData",(t,o,e)=>{e({status:"success",data:g})}],["getDataStatus",(t,o,e)=>(chrome.storage.local.get(Object.values(w),n=>{let r={},s=(a,i)=>{let l=n[i],m=l?.rObject||l?.robject;m&&Array.isArray(m)?r[a]={status:"fetched",count:m.length}:r[a]={status:"none",count:0}},c={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(w).forEach(([a,i])=>{let l=c[a]||a;s(l,i)}),e({dataStatus:r})}),!0)],["saveMedicationData",x("medication")],["saveLabData",x("labdata")],["saveChineseMedData",x("chinesemed")],["saveImagingData",x("imaging")],["saveAllergyData",x("allergy")],["saveSurgeryData",x("surgery")],["saveDischargeData",x("discharge")],["saveMedDaysData",x("medDays")],["savePatientSummaryData",x("patientSummary")],["saveToken",(t,o,e)=>{g.token=t.token,g.currentUserSession=t.userSession||g.currentUserSession,t.patientName&&(g.patientName=t.patientName),t.patientIdFromToken&&(g.patientIdFromToken=t.patientIdFromToken),console.log(`[NHITW Clinic] saveToken received - Name: ${t.patientName}, ID: ${t.patientIdFromToken}`),j(),e({status:"token_saved"})}],["checkHostStatus",(t,o,e)=>{try{let n=chrome.runtime.connectNative("com.nhitw.host"),r=!1;n.onMessage.addListener(()=>{r=!0,n.disconnect(),e({success:!0,available:!0})}),n.onDisconnect.addListener(()=>{r||e({success:!0,available:!1})}),n.postMessage({action:"read_manifest"})}catch(n){e({success:!0,available:!1,error:n.message})}}]]);function x(t){return function(o,e,n){let r=w[t];if(!r){n({status:"error",error:`Invalid data type: ${t}`});return}g[r]=o.data,g.currentUserSession=o.userSession||g.currentUserSession;let s={[r]:o.data,currentUserSession:o.userSession||g.currentUserSession};chrome.storage.local.set(s,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),j(),o.data&&o.data.rObject&&Array.isArray(o.data.rObject)?n({status:"saved",recordCount:o.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((t,o,e)=>{t.userSession&&t.userSession!==g.currentUserSession&&(T(),g.currentUserSession=t.userSession);let n=_e.get(t.action);return n?(n(t,o,e),!0):(e({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((t,o,e)=>{o.url&&(o.url.includes("medcloud2.nhi.gov.tw/imu/login")||o.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(g).forEach(n=>{g[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
