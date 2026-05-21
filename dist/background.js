(()=>{var J="com.nhitw.host";function Q(t){return new Promise((o,e)=>{try{let a=chrome.runtime.connectNative(J),r=!1;a.onMessage.addListener(i=>{r=!0,a.disconnect(),i.success?o(i):e(new Error(i.message||i.error||"Unknown host error"))}),a.onDisconnect.addListener(()=>{if(!r){let i=chrome.runtime.lastError?.message||"Native host disconnected";e(new Error(i))}}),a.postMessage(t)}catch(a){e(new Error(`Native messaging unavailable: ${a.message}`))}})}async function L(t,o,e){return Q({action:"write_html",filename:t,content:o,date:e||void 0})}function j(t,o,e){let r=X(new Date),i=ce(e),c=de(e),s=ee(e,{acu:i,cancer:c}),u=te(e.labData?.rObject),f=be(e.medicationData?.rObject,100),b=Ce(e.medicationData?.rObject,100),l=ve(e.chinesemedData?.rObject),m=xe(e.imagingData?.rObject),g=De(e.allergyData?.rObject),p=_e(e.surgeryData?.rObject),C=Se(e.dischargeData?.rObject),D=le(e),k=pe(e);return $e(t,o,r,{diagnosisHtml:s,labPivotHtml:u,westMedHtml:f,otherWestMedHtml:b,chineseMedHtml:l,imagingHtml:m,allergyHtml:g,surgeryHtml:p,dischargeHtml:C,acuBadgeHtml:D,cancerBadgeHtml:k})}function U(t,o){let e=o||new Date,a=e.getFullYear(),r=String(e.getMonth()+1).padStart(2,"0"),i=String(e.getDate()).padStart(2,"0"),c=String(e.getHours()).padStart(2,"0"),n=String(e.getMinutes()).padStart(2,"0");return`${t.replace(/[\\/:*?"<>|]/g,"_")}_${a}${r}${i}_${c}${n}.html`}function X(t){return`${t.getFullYear()}/${String(t.getMonth()+1).padStart(2,"0")}/${String(t.getDate()).padStart(2,"0")} ${String(t.getHours()).padStart(2,"0")}:${String(t.getMinutes()).padStart(2,"0")}`}function d(t){return t?String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function v(t){return t?t.includes("T")?t.split("T")[0]:t.replace(/\//g,"-"):""}function _(t){let o=v(t);if(!o)return"";let e=o.split("-");return e.length===3?`${e[1]}/${e[2]}`:o}function V(t){let o=v(t);if(!o)return"";let e=o.split("-");return e.length===3?`${e[0]}/${e[1]}/${e[2]}`:o}function $(t){return t?t.split(";")[0].trim():""}function ee(t,o={}){let a=o.acu||new Set,r=o.cancer||new Set,i=p=>{let C=String(p||"").trim(),D=[];return a.has(C)&&D.push("diag-acu-match"),r.has(C)&&D.push("diag-cancer-match"),D.join(" ")},c={},n=[],s={},u=[];function f(p,C,D,k,Y,P){if(p)for(let A of p){let I=A[C]||"";if(!w(I,180))continue;let y=A[k]||"",E=A[Y]||"";if(!y||!E)continue;let G=(A[D]||"").split(";"),M=G[0]?.trim()||"",T=G[1]?.trim()||"\u9580\u8A3A",Z=P&&A[P]||"";if(/^Z2[3-7]/.test(y)&&Z.startsWith("J07")){u.push({code:y,name:E,date:v(I),hosp:M});continue}T.includes("\u6025\u8A3A")?n.push({code:y,name:E,date:v(I),hosp:M}):T.includes("\u4F4F\u8A3A")||T.includes("\u4F4F\u9662")?s[y]||(s[y]={code:y,name:E,date:v(I),hosp:M}):(c[y]||(c[y]={code:y,name:E,count:0}),c[y].count++)}}f(t.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME","ATC_CODE");let b=t.medicationData?.rObject||[];b.length>0&&!b[0].PER_DATE&&f(b,"drug_date","hosp","icd_code","icd_cname","drug_atc7_code"),f(t.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname",null);let l="",m=Object.values(c).sort((p,C)=>C.count-p.count);if(m.length>0){for(let p of m.slice(0,8))l+=`<div class="diag-item ${i(p.code)}"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-count">${p.count}</span></div>`;m.length>8&&(l+=`<div class="diag-more">\u9084\u6709 ${m.length-8} \u7B46</div>`)}if(n.length>0){l+='<div class="visit-type-label emergency-label">\u6025\u8A3A</div>';for(let p of n.slice(0,5))l+=`<div class="diag-item ${i(p.code)}"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}let g=Object.values(s);if(g.length>0){l+='<div class="visit-type-label inpatient-label">\u4F4F\u8A3A</div>';for(let p of g.slice(0,5))l+=`<div class="diag-item ${i(p.code)}"><span class="diag-code">${d(p.code)}</span> ${d(p.name)}</div>`}if(u.length>0){l+='<div class="visit-type-label vaccine-label">\u75AB\u82D7</div>';for(let p of u.slice(0,5))l+=`<div class="diag-item ${i(p.code)}"><span class="diag-code">${d(p.code)}</span> ${d(p.name)} <span class="diag-meta">${d(p.date)}</span></div>`}return l||'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>'}var B=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function te(t){if(!t||t.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let o=180,e=t.filter(l=>{let m=l.assay_value;if(!m||String(m).trim()===""||String(m).trim()==="***")return!1;let g=l.real_inspect_date||l.recipe_date||"";return w(g,o)});if(e.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';function a(l){let m=l.order_code||"",g=(l.assay_item_name||l.order_name||"").toLowerCase();if(m==="08011C"){if(g.includes("hb")||g.includes("hemoglobin")||g.includes("\u8840\u8272\u7D20"))return"Hb";if(g.includes("wbc")||g.includes("\u767D\u8840\u7403"))return"WBC";if(g.includes("plt")||g.includes("platelet")||g.includes("\u8840\u5C0F\u677F"))return"Platelet"}if(m==="09015C")return g.includes("gfr")||g.includes("\u814E\u7D72\u7403")?"GFR":"Cr";if(m==="09040C"&&(g.includes("upcr")||g.includes("protein")))return"UPCR";if(m==="12111C"&&(g.includes("uacr")||g.includes("albumin")))return"UACR";let p=B.find(C=>C.orderCode===m&&!C.subItem);return p?p.name:l.assay_item_name||l.order_name||m||"?"}let r=new Set,i={},c=0;for(let l of e){let m=v(l.real_inspect_date||l.recipe_date||"");if(!m)continue;let g=String(l.assay_value).trim(),p=l.consult_value||"",C=a(l);r.add(m),i[C]||(i[C]={name:C,code:l.order_code||"",dates:{},order:c++}),i[C].dates[m]={value:g,ref:p,dir:ne(g,p)}}let n=[...r].sort((l,m)=>m.localeCompare(l)),s=new Map;B.forEach((l,m)=>{s.has(l.name)||s.set(l.name,m)});let u=Object.keys(i).sort((l,m)=>{let g=s.has(l)?s.get(l):1e3+i[l].order,p=s.has(m)?s.get(m):1e3+i[m].order;return g-p});if(n.length===0||u.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let f='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let l of n)f+=`<th class="lab-date-col">${d(V(l))}</th>`;f+="</tr>";let b="";for(let l of u){let m=i[l];b+=`<tr><td class="lab-item-name" title="${d(m.code)}">${d(l)}</td>`;for(let g of n){let p=m.dates[g];if(p){let C=p.dir==="high"?"lab-high":p.dir==="low"?"lab-low":"";b+=`<td class="${C}" title="${d(p.ref)}">${d(p.value)}</td>`}else b+='<td class="no-data">-</td>'}b+="</tr>"}return`<div class="lab-scroll"><table class="lab-pivot"><thead>${f}</thead><tbody>${b}</tbody></table></div>
  <div class="tracking-note">${o} \u5929\u5167 \xB7 ${u.length} \u9805 \xD7 ${n.length} \u6B21</div>`}function ne(t,o){if(!t||!o||t==="***")return null;let e=parseFloat(t);if(isNaN(e))return null;let a=o.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);if(a){let c=parseFloat(a[1]),n=parseFloat(a[2]);return e>n?"high":e<c?"low":null}let r=o.match(/[<≦]\s*([\d.]+)/);if(r)return e>parseFloat(r[1])?"high":null;let i=o.match(/[>≧]\s*([\d.]+)/);return i&&e<parseFloat(i[1])?"low":null}var ae=["G43","G50","G51","G52","G54","G61","G62","G63","G65","G90","M13.0","M15","M20","M21","M66","H02","H04","H05","H10","H20","H25","H26","H52"],oe=["A15","B01","B02","B05","B06","B20","B97.2","B97.3","D65","D66","D67","D68","D69","D70","D82","D83","D84","E04","E05","E06","E10","E11","E13","E15","E28","F90","F95","I20","I21","I22","I23","I24","I25","I26","I27","I28","I42","I50","I71","I73","I74","I80","I82","I89","J44","J45","J93","J96","J98","K72","K74","K80","L10","L11","L12","L40","L51","L52","L89","L94","L97","M33","M34","M35","N18","N19","R64"],re=["A80","D32","D33","D48","D49","F02","F03","F04","F05","F09","F20","F21","F22","F23","F24","F25","F30","F31","F32","F33","F34","F35","F36","F37","F38","F39","F80","F82","F84","G11","G12","G20","G21","G35","G36","G40","G45","G46","G70","G71","G80","G81","G82","G83","G91","G93","G94","H30","H31","H33","H34","H35","H36","H40","H42","H43","H46","H47","H49","H50","H51","H53","H54","H55","I60","I61","I62","I63","I65","I66","I67","I69","M45","M62.3","M99","P91","Q11","Q12","Q13","Q14","Q15","S01.9","S04","S06.3","S06.4","S06.5","S06.6","S14","S22","S24","S32","S34","S44","S54","S64","S74","S84","S94"];function S(t,o){if(!t||!o)return!1;let e=String(t).replace(/\./g,"").toUpperCase().trim(),a=String(o).replace(/\./g,"").toUpperCase().trim();return!e||!a?!1:e===a||e.startsWith(a)}function ie(t){let o=t&&String(t).toUpperCase().replace(/\./g,"").match(/^C(\d{2})/);if(!o)return!1;let e=parseInt(o[1],10);return e>=0&&e<=96}function se(t){let o=t&&String(t).toUpperCase().replace(/\./g,"").match(/^O(\d{2})/);if(!o)return!1;let e=parseInt(o[1],10);return e>=10&&e<=16||e>=20&&e<=29}function N(t){let o=new Set,e=["ICD_CODE","icd_code","ICD_CODE_1","icd_code_1","ICD_CODE_2","icd_code_2","ICD_CODE_3","icd_code_3","ICD_CODE_4","icd_code_4","ICD_CODE_5","icd_code_5","icdCode","icdcode","ICD10_CODE","icd10_code","main_icd","sub_icd","MAIN_ICD","SUB_ICD","DIAG_CODE","diag_code"],a=i=>{if(Array.isArray(i)){for(let c of i)if(!(!c||typeof c!="object"))for(let n of e){let s=c[n];s&&o.add(String(s).trim())}}};a(t.medicationData?.rObject),a(t.chinesemedData?.rObject),a(t.dischargeData?.rObject),a(t.surgeryData?.rObject),a(t.patientSummaryData?.rObject);let r=Array.from(o).filter(Boolean);return console.log("[NHITW Clinic] Collected ICD codes for classification:",r),r}function R(t){let o=new Set,e=new Set,a=new Set;for(let r of t)(ie(r)||re.some(i=>S(r,i)))&&o.add(r),ae.some(i=>S(r,i))&&e.add(r),(se(r)||oe.some(i=>S(r,i)))&&a.add(r);return{high:[...o],moderate:[...e],special:[...a]}}function z(t){return t.high.length>0||t.moderate.length>0&&t.special.length>0?"high":t.moderate.length>0||t.special.length>0?"moderate":null}function ce(t){let o=N(t),e=R(o);if(!z(e))return new Set;let r=new Set;return e.high.forEach(i=>r.add(i)),e.moderate.forEach(i=>r.add(i)),e.special.forEach(i=>r.add(i)),r}function de(t){let o=N(t),e=W(o),a=new Set;for(let r of e)for(let i of r.hits)a.add(i);return a}function le(t){let o=N(t),e=R(o),a=z(e);if(console.log("[NHITW Clinic] Acupuncture matches:",e,"level:",a),!a)return"";let r,i;a==="high"?(r="\u26A1 \u9AD8\u5EA6\u8907\u96DC\u91DD\u7078",e.high.length>0?i=e.high:i=[...e.moderate.map(u=>u+"(\u4E2D)"),...e.special.map(u=>u+"(\u7279)")]):(r="\u{1F489} \u4E2D\u5EA6\u8907\u96DC\u91DD\u7078",i=[...e.moderate,...e.special.map(u=>u+"(\u7279)")]);let c=i.slice(0,12).join(", "),n=i.length>12?`\u2026 (+${i.length-12})`:"",s=`\u7B26\u5408 ICD: ${c}${n}`;return`<span class="acu-badge acu-${a}" title="${d(s)}">${r}</span>`}var ue=[{name:"\u4E73\u764C",primary:["C50","C79.81"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C50","Z85.3"]},{name:"\u809D\u764C",primary:["C22","C23","C24"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.3","C79.5","C79.7","Z94.4"],secondary:["C22","C23","C24","Z85.05"]},{name:"\u80BA\u764C",primary:["C33","C34"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.3","C79.5","C79.6","C79.7","Z94.2"],secondary:["C33","C34","Z85.1"]},{name:"\u5927\u8178\u764C",primary:["C18","C19","C20","C21"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.0","C79.3","C79.5","C79.6","C79.7"],secondary:["C18","C19","C20","C21","Z85.04"]},{name:"\u80C3\u764C",primary:["C16","C49.A1","C49.A2"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C16","C49.A1","C49.A2","Z85.028"]},{name:"\u651D\u8B77\u817A\u764C",primary:["C61"]},{name:"\u53E3\u8154\u764C",primary:["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"]},{name:"\u5B50\u5BAE\u9838\u764C",primary:["C53"]},{name:"\u5B50\u5BAE\u9AD4\u764C",primary:["C54"]},{name:"\u7532\u72C0\u817A\u764C",primary:["C73"]}];function W(t){let o=[];for(let e of ue){let a=new Set,r=!1;for(let i of t)e.primary.some(c=>S(i,c))&&(a.add(i),r=!0);if(e.mets&&e.secondary){let i=t.filter(n=>e.mets.some(s=>S(n,s))),c=t.filter(n=>e.secondary.some(s=>S(n,s)));i.length>0&&c.length>0&&(i.forEach(n=>a.add(n)),c.forEach(n=>a.add(n)),r=!0)}r&&o.push({name:e.name,hits:[...a]})}return o}function pe(t){let o=N(t),e=W(o);if(console.log("[NHITW Clinic] Cancer-care detected:",e),e.length===0)return"";let a=e.map(s=>s.name).join("\u3001"),r=[...new Set(e.flatMap(s=>s.hits))],i=r.slice(0,15).join(", "),c=r.length>15?`\u2026 (+${r.length-15})`:"",n=`\u7B26\u5408\u4E2D\u91AB\u764C\u75C7\u52A0\u5F37\u7167\u8B77\u65B9\u6848\uFF1A${a}
\u547D\u4E2D ICD: ${i}${c}`;return`<span class="cancer-badge" title="${d(n)}">\u{1F397} \u764C\u75C7\u5C08\u6848\uFF08${d(a)}\uFF09</span>`}var me={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},ge={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},fe={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function q(t){if(!t)return null;for(let[o,e]of Object.entries(me))if(e.some(a=>a.length===7?t===a:t.startsWith(a)))return o;return null}function he(t){for(let[o,e]of Object.entries(ge))if(e.includes(t))return o;return null}function w(t,o){if(!t)return!1;let e=new Date(t);return isNaN(e.getTime())&&t.includes("/")&&(e=new Date(t.replace(/\//g,"-"))),isNaN(e.getTime())?!1:Date.now()-e.getTime()<=o*864e5}function be(t,o){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=o||100,a=[];for(let n of t){let s=n.PER_DATE||n.drug_date||"";if(!w(s,e))continue;let u=n.ATC_CODE||n.drug_atc7_code||"",f=q(u);if(!f)continue;let b=he(f);b&&a.push({name:n.MED_DESC||n.MED_ITEM||n.drug_ename||"",generic:n.GENERIC_NAME||n.drug_ing_name||"",date:v(s),hosp:$(n.HOSP_NAME||n.hosp),freq:n.FREQ_DESC||n.drug_fre||"",medDays:n.MED_DAYS||n.day||"",drugLeft:n.DRUG_LEFT||n.drug_left||"",groupName:f,colorName:b})}if(a.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let r=["red","orange","green"],i={};for(let n of a){i[n.colorName]||(i[n.colorName]={}),i[n.colorName][n.groupName]||(i[n.colorName][n.groupName]={});let s=n.name;i[n.colorName][n.groupName][s]||(i[n.colorName][n.groupName][s]={...n,prescriptions:[]}),i[n.colorName][n.groupName][s].prescriptions.push({date:n.date,hosp:n.hosp,days:n.medDays,drugLeft:n.drugLeft})}let c="";for(let n of r){if(!i[n])continue;let s=fe[n];for(let[u,f]of Object.entries(i[n]))for(let b of Object.values(f)){b.prescriptions.sort((m,g)=>(g.date||"").localeCompare(m.date||""));let l=b.prescriptions.slice(0,3).map(m=>`<span class="med-pres">${d(_(m.date))} ${d(m.hosp)}${m.drugLeft&&m.drugLeft!=="0"?` <span class="drug-left">\u9918${m.drugLeft}\u5929</span>`:""}</span>`).join(" ");c+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${s.bg};border-color:${s.border};color:${s.text}">${d(u)}</span></td>
          <td class="med-name-cell">${d(b.name)}</td>
          <td class="med-pres-cell">${l}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${c}</tbody>
  </table>
  <div class="tracking-note">${e} \u5929\u5167</div>`}function Ce(t,o){if(!t||t.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let e=o||100,a=[];for(let n of t){let s=n.PER_DATE||n.drug_date||"";if(!w(s,e))continue;let u=n.ATC_CODE||n.drug_atc7_code||"";q(u)||a.push({name:n.MED_DESC||n.MED_ITEM||n.drug_ename||"",generic:n.GENERIC_NAME||n.drug_ing_name||"",date:v(s),hosp:$(n.HOSP_NAME||n.hosp),icd:n.ICD_CODE||n.icd_code||"",icdName:n.ICD_NAME||n.icd_cname||"",freq:n.FREQ_DESC||n.drug_fre||"",medDays:n.MED_DAYS||n.day||"",drugLeft:n.DRUG_LEFT||n.drug_left||""})}if(a.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let r={};for(let n of a){let s=`${n.date}|${n.hosp}`;r[s]||(r[s]={date:n.date,hosp:n.hosp,icd:n.icd,icdName:n.icdName,meds:[]}),r[s].meds.push(n)}let i=Object.values(r).sort((n,s)=>(s.date||"").localeCompare(n.date||"")),c="";for(let n of i){c+=`<div class="med-group-header">${d(_(n.date))} ${d(n.hosp)}`,n.icd&&(c+=` <span class="diag-code">${d(n.icd)}</span>`),c+="</div>";for(let s of n.meds){let u=[s.freq,s.medDays?s.medDays+"\u5929":"",s.drugLeft&&s.drugLeft!=="0"?`\u9918${s.drugLeft}\u5929`:""].filter(Boolean).join(" ");c+=`<div class="med-item">${d(s.name)} <span class="med-detail">${d(u)}</span></div>`}}return c+=`<div class="tracking-note">${e} \u5929\u5167</div>`,c}function ve(t){if(!t||t.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let o={};for(let a of t){let r=v(a.func_date||""),i=$(a.hosp),c=`${r}|${i}`;o[c]||(o[c]={date:r,hosp:i,icd:a.icd_code||"",icdName:a.icd_cname||"",meds:[]}),o[c].meds.push(a)}let e="";for(let a of Object.values(o)){e+=`<div class="med-group-header">${d(_(a.date))} ${d(a.hosp)}`,a.icd&&(e+=` <span class="diag-code">${d(a.icd)}</span>`),e+="</div>";for(let r of a.meds){let i=r.drug_perscrn_name||r.cdrug_name||"",c=r.order_qty||"",n=r.drug_fre||"",s=r.day||"";e+=`<div class="med-item">${d(i)} <span class="med-detail">${d(c)} ${d(n)} ${s?s+"\u5929":""}</span></div>`}}return e}var ye=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function xe(t){if(!t||t.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let o=180,e=t.filter(c=>{let n=c.real_inspect_date||c.case_time||c.recipe_date||"";if(!w(n,o))return!1;let s=c.order_code||"";return ye.has(s)});if(e.length===0)return`<p class="empty">${o}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let a=new Set,r=[];for(let c of e){let n=v(c.real_inspect_date||c.case_time||c.recipe_date||""),s=c.order_name||"",u=c.order_code||"",f=`${n}|${s}|${u}`;a.has(f)||(a.add(f),r.push(c))}r.sort((c,n)=>{let s=v(c.real_inspect_date||c.case_time||c.recipe_date||"");return v(n.real_inspect_date||n.case_time||n.recipe_date||"").localeCompare(s)});let i="";for(let c of r){let n=_(c.real_inspect_date||c.case_time||c.recipe_date||""),s=c.order_name||"";s=s.replace(/[[\]]/g,"").replace(/;/g," ").trim();let u=$(c.hosp),f=c.inspect_result||"";i+='<div class="imaging-item">',i+=`<div class="imaging-name">${d(s)}</div>`,i+=`<div class="imaging-meta">${d(n)} ${d(u)}</div>`,f&&(i+=`<div class="imaging-result">${d(f)}</div>`),i+="</div>"}return i+=`<div class="tracking-note">${o} \u5929\u5167</div>`,i}function De(t){if(!t||t.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let o=t.filter(a=>{let r=a.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(o.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let e="";for(let a of o){let r=a.drug_name||"",i=(a.sympton_name||"").replace(/;/g,", ");e+=`<div class="allergy-item"><strong>${d(r)}</strong>${i?` \u2014 ${d(i)}`:""}</div>`}return e}function _e(t){if(!t||t.length===0)return"";let o="";for(let e of t){let a=_(e.exe_s_date||""),r=$(e.hosp),i=e.icd_cname||e.icd_code||"";o+=`<div class="record-item">${d(a)} ${d(r)} \u2014 ${d(i)}</div>`}return o}function Se(t){if(!t||t.length===0)return"";let o="";for(let e of t){let a=_(e.in_date||""),r=_(e.out_date||""),i=$(e.hosp),c=e.icd_cname||e.icd_code||"";o+=`<div class="record-item">${d(a)}~${d(r)} ${d(i)} \u2014 ${d(c)}</div>`}return o}function $e(t,o,e,a){let r="";return a.allergyHtml&&!a.allergyHtml.includes("\u7121\u904E\u654F")&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${a.allergyHtml}</div></div>`),a.surgeryHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${a.surgeryHtml}</div></div>`),a.dischargeHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u51FA\u9662\u6458\u8981</div><div class="panel-body">${a.dischargeHtml}</div></div>`),`<!DOCTYPE html>
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
.lab-scroll { overflow-x:auto; max-width:100%; }
.lab-pivot { border-collapse:collapse; font-size:12px; white-space:nowrap; }
.lab-pivot th { background:#f5f7fa; padding:6px 8px; text-align:center; border-bottom:2px solid #dee2e6; font-weight:600; font-size:11px; position:sticky; top:0; }
.lab-pivot td { padding:5px 8px; text-align:center; border-bottom:1px solid #f0f0f0; }
.lab-pivot .lab-item-name { text-align:left; font-weight:600; white-space:nowrap; position:sticky; left:0; background:#fff; z-index:1; }
.lab-pivot .lab-item-col { text-align:left; position:sticky; left:0; background:#f5f7fa; z-index:2; }
.lab-pivot .no-data { color:#ccc; }
.lab-pivot .lab-high { color:#d32f2f; font-weight:bold; }
.lab-pivot .lab-low { color:#2e7d32; font-weight:bold; }
.lab-pivot .abnormal { color:#d32f2f; font-weight:bold; } /* legacy fallback */
.lab-pivot tr:hover { background:#f8f9ff; }
.lab-pivot tr:hover .lab-item-name { background:#f8f9ff; }
/* Diagnosis codes flagged by acupuncture / cancer badges */
.diag-item.diag-acu-match { background:linear-gradient(90deg, rgba(245,124,0,0.18), transparent); border-left:3px solid #f57c00; padding-left:5px; }
.diag-item.diag-cancer-match { background:linear-gradient(90deg, rgba(123,31,162,0.15), transparent); border-left:3px solid #7b1fa2; padding-left:5px; }
.diag-item.diag-acu-match.diag-cancer-match { border-left:3px solid #d32f2f; background:linear-gradient(90deg, rgba(245,124,0,0.18), rgba(123,31,162,0.15)); }

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

.clinic-credit { position:fixed; bottom:6px; right:10px; font-size:10px; color:#888; background:rgba(255,255,255,0.85); padding:2px 7px; border-radius:3px; pointer-events:none; z-index:100; letter-spacing:0.5px; }

@media (max-width:1000px) { .layout { grid-template-columns:1fr; } }
@media print {
  body { background:#fff; }
  .header .actions { display:none; }
  .layout { gap:8px; padding:8px; }
  .panel { box-shadow:none; border:1px solid #ddd; break-inside:avoid; }
  .panel-body.collapsed { display:block !important; }
  .clinic-credit { position:fixed; bottom:4px; right:6px; background:transparent; color:#666; }
  .panel-title::before { content:'\u25BE ' !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${d(t)}${a.acuBadgeHtml||""}${a.cancerBadgeHtml||""}</h1>
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
      <div class="panel-body">${a.diagnosisHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u897F\u85E5</div>
      <div class="panel-body">${a.westMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">\u5176\u4ED6\u897F\u85E5</div>
      <div class="panel-body collapsed">${a.otherWestMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">\u4E2D\u85E5\u7528\u85E5</div>
      <div class="panel-body collapsed">${a.chineseMedHtml}</div>
    </div>
  </div>

  <!-- Center Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u6AA2\u9A57</div>
      <div class="panel-body" style="padding:0;">${a.labPivotHtml}</div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">\u95DC\u6CE8\u5F71\u50CF</div>
      <div class="panel-body">${a.imagingHtml}</div>
    </div>
    ${r}
  </div>
</div>

<div class="clinic-credit">\u516B\u5FB7\u4EC1\u5FB7\u98A8\u6FA4\u3000\u738B\u6587\u6D32\u91AB\u5E2B</div>

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
</html>`}var h={medicationData:null,labData:null,chinesemedData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},Ae=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function O(){for(let t of Object.keys(h))Ae.has(t)||(h[t]=null)}var F=!1;function K(){F||(F=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(t=>{t.name==="htmlExport"&&(F=!1,Ee().catch(o=>{console.warn("[NHITW Clinic] Export alarm handler error:",o.message)}))});async function Ee(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;try{let s=await chrome.tabs.query({url:"https://medcloud2.nhi.gov.tw/*"});if(s.length>0){let u=await chrome.tabs.sendMessage(s[0].id,{action:"getPatientInfo"});u?.name&&(h.patientName=u.name),u?.id&&(h.patientIdFromToken=u.id),console.log("[NHITW Clinic] Fresh patient info from tab:",u)}}catch(s){console.warn("[NHITW Clinic] Failed to get fresh patient info:",s.message)}let e=h.patientIdFromToken,a=h.patientName;if(!e){let s=h.currentUserSession;if(!s){console.log("[NHITW Clinic] No session data, skipping export");return}e=s.startsWith("patient_")?s.replace("patient_",""):s}a||(a=e),console.log(`[NHITW Clinic] Export: ID=${e}, Name=${a}`);let r={};for(let[s,u]of Object.entries(h))s!=="token"&&s!=="currentUserSession"&&u&&(r[s]=u);let i=j(a,e,r),c=U(a),n=Math.round(new Blob([i]).size/1024);if(console.log(`[NHITW Clinic] Generating HTML: ${c} (${n}KB, ${Object.keys(r).length} data types)`),n>900){console.warn(`[NHITW Clinic] HTML too large (${n}KB), exceeds Native Messaging limit`);return}await L(c,i),console.log(`[NHITW Clinic] HTML report saved: ${c}`)}catch(t){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",t.message)}}var we={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(we).forEach(([t,o])=>{chrome.webRequest.onBeforeRequest.addListener(function(e){return e.method==="GET"&&e.url.includes(o)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallDetected",url:e.url,type:t}),{cancel:!1}},{urls:[`https://${o}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(e){e.method==="GET"&&e.url.includes(o)&&chrome.tabs.sendMessage(e.tabId,{action:"apiCallCompleted",url:e.url,statusCode:e.statusCode,type:t})},{urls:[`https://${o}*`]},["responseHeaders"])});var H={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData"},Ie=new Map([["openPopup",(t,o,e)=>{chrome.action.openPopup(),e({status:"received"})}],["userSessionChanged",(t,o,e)=>{O(),h.currentUserSession=t.userSession,chrome.storage.local.remove(Object.values(H),function(){chrome.action.setBadgeText({text:""})}),e({status:"session_reset"})}],["clearSessionData",(t,o,e)=>{O(),e({status:"cleared"})}],["getSessionData",(t,o,e)=>{e({status:"success",data:h})}],["getDataStatus",(t,o,e)=>(chrome.storage.local.get(Object.values(H),a=>{let r={},i=(n,s)=>{let u=a[s],f=u?.rObject||u?.robject;f&&Array.isArray(f)?r[n]={status:"fetched",count:f.length}:r[n]={status:"none",count:0}},c={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(H).forEach(([n,s])=>{let u=c[n]||n;i(u,s)}),e({dataStatus:r})}),!0)],["saveMedicationData",x("medication")],["saveLabData",x("labdata")],["saveChineseMedData",x("chinesemed")],["saveImagingData",x("imaging")],["saveAllergyData",x("allergy")],["saveSurgeryData",x("surgery")],["saveDischargeData",x("discharge")],["saveMedDaysData",x("medDays")],["savePatientSummaryData",x("patientSummary")],["saveToken",(t,o,e)=>{h.token=t.token,h.currentUserSession=t.userSession||h.currentUserSession,t.patientName&&(h.patientName=t.patientName),t.patientIdFromToken&&(h.patientIdFromToken=t.patientIdFromToken),console.log(`[NHITW Clinic] saveToken received - Name: ${t.patientName}, ID: ${t.patientIdFromToken}`),K(),e({status:"token_saved"})}],["checkHostStatus",(t,o,e)=>{try{let a=chrome.runtime.connectNative("com.nhitw.host"),r=!1;a.onMessage.addListener(()=>{r=!0,a.disconnect(),e({success:!0,available:!0})}),a.onDisconnect.addListener(()=>{r||e({success:!0,available:!1})}),a.postMessage({action:"read_manifest"})}catch(a){e({success:!0,available:!1,error:a.message})}}]]);function x(t){return function(o,e,a){let r=H[t];if(!r){a({status:"error",error:`Invalid data type: ${t}`});return}h[r]=o.data,h.currentUserSession=o.userSession||h.currentUserSession;let i={[r]:o.data,currentUserSession:o.userSession||h.currentUserSession};chrome.storage.local.set(i,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),K(),o.data&&o.data.rObject&&Array.isArray(o.data.rObject)?a({status:"saved",recordCount:o.data.rObject.length}):a({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((t,o,e)=>{t.userSession&&t.userSession!==h.currentUserSession&&(O(),h.currentUserSession=t.userSession);let a=Ie.get(t.action);return a?(a(t,o,e),!0):(e({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((t,o,e)=>{o.url&&(o.url.includes("medcloud2.nhi.gov.tw/imu/login")||o.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(h).forEach(a=>{h[a]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
