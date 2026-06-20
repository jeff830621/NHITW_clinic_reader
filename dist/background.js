(()=>{var fe="com.nhitw.host";function ge(e){return new Promise((a,t)=>{try{let n=chrome.runtime.connectNative(fe),i=!1;n.onMessage.addListener(o=>{i=!0,n.disconnect(),o.success?a(o):t(new Error(o.message||o.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!i){let o=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(o))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function P(e,a,t,n){return ge({action:"write_html",filename:e,content:a,date:t||void 0,session:n||void 0})}var q={"09001C":{min:0,max:200,description:"\u7E3D\u81BD\u56FA\u9187 >200 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"09004C":{min:0,max:150,description:"\u4E09\u9178\u7518\u6CB9\u8102 >150 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"09043C":{min:40,max:null,description:"\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187 <40 mg/dL \u70BA\u7570\u5E38(\u4F4E)"},"09044C":{min:0,max:100,description:"\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187 >100 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"12015C":{min:0,max:1,description:"CRP >1 \u70BA\u7570\u5E38(\u9AD8)"}},me=e=>q.hasOwnProperty(e),V=e=>me(e)?q[e]:null;var he=e=>e?/\[0*\.?0*\]\[0*\.?0*\]/.test(e):!1,I=e=>typeof e=="string"?parseFloat(e):e,be=(e,a)=>!e||!a?!1:a.includes("\u9580\u8AFE")&&new Set(["09001C","09004C","09044C","09043C","12015C"]).has(e),Ce=new Map([["40",{value:40,display:">40"}],["50",{value:50,display:">50"}]]),ye=e=>{if(!e)return null;for(let[a,{value:t}]of Ce.entries())if(e.includes(a))return{min:t,max:null};return null};var ve=new Map([["customRange",(e,a,t)=>be(a,t)?V(a):null],["hdlCholesterol",(e,a)=>a==="09043C"?ye(e):null],["zeroRange",e=>(he(e),null)],["noValueRange",e=>null],["singleBracketLessThan",e=>{let a=e.match(/\[<\s*(\d*\.?\d+)(?:\s*\w+\/?\w*)?\]\[\]/);if(a){let t=parseFloat(a[1]);if(!isNaN(t))return{min:null,max:t}}return null}],["specialNoMin",e=>{let a=/\[(無|NA|-|)\]\[(＜|<)?(\d*\.?\d+)\]/,t=e.match(a);if(t){let n=t[3];if(n)return{min:null,max:parseFloat(n)}}return null}],["singleBracketRange",e=>{let a=e.match(/\[(\d*\.?\d+)~(\d*\.?\d+)\](\[\])?/);if(a){let t=I(a[1]),n=I(a[2]);if(!isNaN(t)&&!isNaN(n))return{min:t,max:n}}return null}],["doubleBracketRange",e=>{let a=e.match(/\[([^[\]]*)\]\[([^[\]]*)\]/);if(a){let t=a[1].trim(),n=a[2].trim(),i=null;if(n&&n!=="")if(n.includes("\uFF1C")||n.includes("<")){let s=n.match(/\d*\.?\d+/);s&&s[0]&&(i=I(s[0]))}else{let s=n.match(/(\d*\.?\d+)/);s&&(i=I(s[0]))}let o=null;if(t&&(t.includes("\uFF1C")||t.includes("<"))){let s=t.match(/\d*\.?\d+/);s&&s[0]&&(i=I(s[0]),o=null)}else if(t&&!["\u7121","NA","-",""].includes(t)){let s=t.match(/(\d*\.?\d+)/);s&&(o=I(s[0]))}if(o!==null||i!==null)return{min:o,max:i}}return null}],["directLessThan",e=>{let a=e.match(/\[<\s*(\d*\.?\d+)(?:\s*\w+\/?\w*)?\]/);if(a){let t=parseFloat(a[1]);if(!isNaN(t))return{min:null,max:t}}return null}],["singleValue",e=>{let a=e.match(/\[(\d*\.?\d+)\]/);if(a){let t=I(a[1]);if(!isNaN(t))return{min:t,max:null}}return null}],["noReference",e=>(e.includes("[\u7121]")||e==="[0][]",null)],["qualitativeTest",e=>(e.match(/\[0\]\[9999\]/),null)]]),Y=(e,a=null,t=null)=>{if(!e)return null;let n=e.trim();for(let[i,o]of ve){let s=o(n,a,t);if(s!==null)return s}return null};function Z(e,a,t,n={}){let o=De(new Date),s=We(t),r=Ke(t),c=Je(t,n),f=Se(t,{acu:s,cancer:r,asthma:c}),h=Ee(t.labData?.rObject,n),u=ot(t.medicationData?.rObject,100),p=st(t.medicationData?.rObject,100),x=it(t.chinesemedData?.rObject),k=lt(t.imagingData?.rObject),N=dt(t.allergyData?.rObject),g=ut(t.surgeryData?.rObject),b=pt(t.dischargeData?.rObject),y=ht(t.adultHealthCheckData),_=bt(t.cancerScreeningData),S=Ct(t.hbcvData),D=Oe(t.acupunctureData),m=qe(t),$=Ye(t),v=Ze(t,n),L=et(t,n),H=xe(n);return yt(e,a,o,{diagnosisHtml:f,labPivotHtml:h,westMedHtml:u,otherWestMedHtml:p,chineseMedHtml:x,imagingHtml:k,allergyHtml:N,surgeryHtml:g,dischargeHtml:b,adultHealthHtml:y,cancerScreeningHtml:_,hbcvHtml:S,acupunctureProbeHtml:D,acuBadgeHtml:m,cancerBadgeHtml:$,asthmaBadgeHtml:v,ckdBadgeHtml:L,patientMetaLine:H})}function xe(e){if(!e)return"";let a=[];if(typeof e.age=="number"&&e.age>=0&&a.push(`${e.age}\u6B72`),e.sex){let t=String(e.sex).trim().toUpperCase();t==="F"||t==="FEMALE"||t==="2"||t==="\u5973"?a.push("\u5973"):(t==="M"||t==="MALE"||t==="1"||t==="\u7537")&&a.push("\u7537")}if(e.birthday&&String(e.birthday).length===7){let t=String(e.birthday),n=parseInt(t.substring(0,3),10),i=t.substring(3,5),o=t.substring(5,7);isNaN(n)||a.push(`\u6C11${n}/${i}/${o}`)}return a.join(" ")}function Q(e,a){let t=a||new Date,n=t.getFullYear(),i=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0"),s=String(t.getHours()).padStart(2,"0"),r=String(t.getMinutes()).padStart(2,"0"),c=String(t.getSeconds()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_").replace(/\s+/g,"_").replace(/^\.+/,"")||"unknown"}_${n}${i}${o}_${s}${r}${c}.html`}function De(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function l(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function w(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function M(e){let a=w(e);if(!a)return"";let t=a.split("-");return t.length===3?`${t[1]}/${t[2]}`:a}function _e(e){let a=w(e);if(!a)return"";let t=a.split("-");return t.length===3?`${t[0]}/${t[1]}/${t[2]}`:a}function $e(e){let a=w(e);if(!a)return"";let t=a.split("-");if(t.length===3){let n=parseInt(t[0],10);if(!isNaN(n))return`${n-1911}/${t[1]}/${t[2]}`}return a}function E(e){return e?e.split(";")[0].trim():""}function Se(e,a={}){let n=a.acu||new Set,i=a.cancer||new Set,o=a.asthma||new Set,s=u=>{let p=String(u||"").trim(),x=[];return n.has(p)&&x.push("diag-acu-match"),i.has(p)&&x.push("diag-cancer-match"),o.has(p)&&x.push("diag-asthma-match"),x.join(" ")},r={};function c(u,p,x,k,N){if(u)for(let g of u){let b=g[p]||"";if(!O(b,180))continue;let y=g[k]||"",_=g[N]||"";if(!y)continue;let S=(g[x]||"").split(";"),D=S[0]?.trim()||"",m=S[1]?.trim()||"\u9580\u8A3A",$=w(b);r[y]||(r[y]={code:y,name:_,visits:new Set,lastDate:"",lastHosp:"",lastType:""});let v=r[y];v.visits.add(`${$}|${D}`),!v.name&&_&&(v.name=_),$>v.lastDate&&(v.lastDate=$,v.lastHosp=D,v.lastType=m)}}c(e.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME");let d=e.medicationData?.rObject||[];d.length>0&&!d[0].PER_DATE&&c(d,"drug_date","hosp","icd_code","icd_cname"),c(e.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname");for(let u of Object.values(r))u.count=u.visits.size;let f=Object.values(r).sort((u,p)=>p.lastDate!==u.lastDate?p.lastDate.localeCompare(u.lastDate):p.count-u.count);if(f.length===0)return'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>';let h="";for(let u of f){let p="";u.lastType.includes("\u6025")?p='<span class="diag-type emergency">\u6025</span>':u.lastType.includes("\u4F4F")&&(p='<span class="diag-type inpatient">\u4F4F</span>');let k=[u.lastDate?u.lastDate.replace(/-/g,"/"):"",u.lastHosp].filter(Boolean).join(" ");h+=`<div class="diag-item ${s(u.code)}"><div class="diag-line1">${p}<span class="diag-code">${l(u.code)}</span> ${l(u.name)}<span class="diag-count">${u.count}\u6B21</span></div><div class="diag-line2">${l(k)}</div></div>`}return h}var we=[["WBC",["wbc","\u767D\u8840\u7403","\u767D\u8840\u7403\u8A08\u6578","white blood cell","white blood cell count","wbc count"]],["RBC",["rbc","\u7D05\u8840\u7403\u8A08\u6578","\u7D05\u8840\u7403","red blood cell","red blood cell count","rbc count"]],["Hb",["hb","hgb","hemoglobin","\u8840\u8272\u7D20","\u8840\u7D05\u7D20","\u8840\u7D05\u86CB\u767D"]],["HCT",["hct","hematocrit","\u8840\u7403\u6BD4\u5BB9\u503C\u6E2C\u5B9A","\u8840\u5BB9\u6BD4","\u8840\u7403\u5BB9\u7A4D\u6BD4","\u8840\u6BD4\u5BB9","\u8840\u7403\u6BD4\u5BB9","\u8840\u5BB9\u7A4D\u6BD4"]],["MCV",["mcv","\u7D05\u8840\u7403\u5E73\u5747\u5BB9\u7A4D","\u5E73\u5747\u7D05\u8840\u7403\u5BB9\u7A4D","\u5E73\u5747\u8840\u7403\u5BB9\u7A4D"]],["MCHC",["mchc","\u7D05\u8840\u7403\u8272\u7D20\u6FC3\u5EA6","\u5E73\u5747\u7D05\u8840\u7403\u8840\u8272\u7D20\u6FC3\u5EA6"]],["MCH",["mch","\u7D05\u8840\u7403\u8272\u7D20","\u5E73\u5747\u7D05\u8840\u7403\u8840\u8272\u7D20"]],["RDW",["rdw","rdw-cv","rdw-sd","\u7D05\u8840\u7403\u5206\u4F48\u8B8A\u7570\u6578","\u7D05\u8840\u7403\u5206\u5E03\u5BEC\u5EA6","\u7D05\u8840\u7403\u5206\u5E03\u8B8A\u7570\u4FC2\u6578","\u7D05\u8840\u7403\u5206\u4F48\u5BEC\u5EA6"]],["Platelet",["platelet","plt","\u8840\u5C0F\u677F","\u8840\u5C0F\u677F\u8A08\u6578"]],["MPV",["mpv","\u5E73\u5747\u8840\u5C0F\u677F\u5BB9\u7A4D"]],["Neutrophil",["neutrophil","neutrophil-segmented","segment","seg","\u55DC\u4E2D\u6027\u767D\u8840\u7403","\u4E2D\u6027\u7403","\u7BC0\u72C0\u6838\u55DC\u4E2D\u6027\u767D\u8840\u7403"]],["Lymphocyte",["lymphocyte","lymph","\u6DCB\u5DF4\u7403"]],["Monocyte",["monocyte","mono","\u55AE\u6838\u7403"]],["Eosinophil",["eosinophil","eo","\u55DC\u4F0A\u7D05\u6027\u767D\u8840\u7403","\u55DC\u9178\u6027\u7403","\u55DC\u4F0A\u7D05\u767D\u8840\u7403"]],["Basophil",["basophil","baso","\u55DC\u9E7C\u6027\u767D\u8840\u7403"]],["Glucose",["glucose","sugar","ac sugar","blood sugar","\u8461\u8404\u7CD6","\u8840\u7CD6","\u98EF\u524D\u8840\u7CD6","\u7A7A\u8179\u8840\u7CD6","\u98EF\u524D\u8840\u7CD6(ac)","glucose ac","glucose (ac)","glucose(ac)","glu.(ac)","glu (ac)","glu(ac)","glu ac","ac glucose"]],["Amylase",["amylase","amylase(b)","\u8840\u6DB2\u6FB1\u7C89\u8122","\u6FB1\u7C89\u9176","\u6FB1\u7C89\u8122"]],["Lipase",["lipase","\u89E3\u8102\u8122","\u8102\u80AA\u9176","\u8102\u89E3\u9176"]],["ALK-P",["alk-p","alkp","alp","\u9E7C\u6027\u78F7\u9178\u8122","\u9E7C\u6027\u78F7\u9178\u9176","\u9E7C\u6027\u78F7\u9178\u9175\u7D20"]],["T-Bil",["total bilirubin","t-bil","tbil","\u7E3D\u81BD\u7D05\u7D20","\u81BD\u7D05\u7D20\u7E3D\u91CF","\u7E3D\u81BD\u8272\u7D20"]],["D-Bil",["direct bilirubin","d-bil","dbil","\u76F4\u63A5\u81BD\u7D05\u7D20","\u76F4\u63A5\u81BD\u8272\u7D20"]],["BUN",["bun","\u5C3F\u7D20\u6C2E","\u8840\u4E2D\u5C3F\u7D20\u6C2E","\u5C3F\u7D20\u6C2E(bun)"]],["Cr",["cr","creatinine","\u808C\u9178\u9150","\u808C\u9150","\u8840\u6E05\u808C\u9178\u9150","\u808C\u9178\u809D"]],["Na",["na","sodium","\u9209"]],["K",["k","potassium","\u9240"]],["Cl",["cl","chloride","\u6C2F"]],["GOT",["got","ast","sgot","s.g.o.t","s.g.o.t (ast)","s.g.o.t. (ast)","\u5929\u9580\u51AC\u80FA\u9178\u8F49\u80FA\u9176","\u5929\u9580\u51AC\u80FA\u9178\u80FA\u57FA\u8F49\u79FB\u9176"]],["GPT",["gpt","alt","sgpt","s.g.p.t","s.g.p.t (alt)","s.g.p.t. (alt)","\u4E19\u80FA\u9178\u8F49\u80FA\u9176","\u4E19\u80FA\u9178\u80FA\u57FA\u8F49\u79FB\u9176"]],["CRP",["crp","c\u53CD\u61C9\u86CB\u767D","c-\u53CD\u61C9\u86CB\u767D","c \u53CD\u61C9\u86CB\u767D","c-reactive protein","crp, c-reactive protein","crp\uFF0Cc-reactive protein"]],["Chol",["chol","cholesterol","total cholesterol","cho","t-cho","t-chol","\u81BD\u56FA\u9187","\u7E3D\u81BD\u56FA\u9187","cholesterol(\u81BD\u56FA\u9187)"]],["TG",["tg","tg, triglycerides","triglyceride","triglycerides","t.g.","\u4E09\u9178\u7518\u6CB9\u8102","\u4E09\u9178\u7518\u6CB9\u916F","tg (\u4E09\u9178\u7518\u6CB9\u8102)"]],["HDL",["hdl","hdl-cholesterol","hdl cholesterol","hdl-c","hdl chol","hdl-cholesterol (\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187)","\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187","\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D","hdl(\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D)"]],["LDL",["ldl","ldl-cholesterol","ldl cholesterol","ldl-c","ldl chol","ldl-cholesterol (\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187)","\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187","\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D","ldl(\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D)"]]];function X(e){return String(e||"").toLowerCase().replace(/ｃ/g,"c").replace(/[－–—]/g,"-").replace(/（/g,"(").replace(/）/g,")").replace(/\s+/g," ").trim()}var J=(()=>{let e=new Map;for(let[a,t]of we)for(let n of t)e.set(X(n),a);return e})(),j=/\burine\b|\burinary\b|尿液|\(\s*尿\s*\)|（\s*尿\s*）|[、，]\s*尿/i,Ae=new Set(["06012C"]);function ke(e){let a=String(e.inspect_mode||"").trim().toUpperCase();if(/尿液|URINE|SPOT|RANDOM URINE/.test(a))return"urine";if(/血液|SERUM|PLASMA|\bBLOOD\b|WHOLE BLOOD/.test(a))return"serum";if(/糞便|STOOL|FECES/.test(a))return"feces";let t=String(e.assay_tp_cname||"");if(/尿液/.test(t))return"urine";if(/糞便/.test(t))return"feces";let n=String(e.order_name||"");return j.test(n)?"urine":/、血|血液|\bblood\b|\bserum\b|\bplasma\b/i.test(n)?"serum":"unknown"}function Ne(e){return!e||/[(（]\s*尿\s*[)）]/.test(e)||j.test(e)?e:`${e}(\u5C3F)`}var Le=/\(\s*\d*\s*[+\-](?:\s*\/\s*[+\-])?\s*\)/;function He(e){let a=String(e??"").trim();return a===""?!1:Le.test(a)||!/\d/.test(a)}function Ie(e){if(!e)return null;let a=String(e),t=a.match(/\[\s*(-?\d+\.?\d*)\s*\]\s*\[\s*(-?\d+\.?\d*)\s*\]/);if(t){let o=parseFloat(t[2]);return isNaN(o)?null:o}let n=a.match(/(-?\d+\.?\d*)\s*[-~–]\s*(-?\d+\.?\d*)/);if(n){let o=parseFloat(n[2]);return isNaN(o)?null:o}let i=a.match(/[<≦＜]\s*(-?\d+\.?\d*)/);if(i){let o=parseFloat(i[1]);return isNaN(o)?null:o}return null}function G(e){let a=e.assay_item_name||e.order_name||"",t=(e.order_code||"").trim(),n=ke(e);n==="unknown"&&j.test(a)&&(n="urine");let i=X(a),o=J.get(i);if(!o){let r=i.replace(/\(.*?\)/g,"").trim();r&&(o=J.get(r))}if(o==="Cr"&&n!=="serum"){let r=parseFloat(e.assay_value),c=Ie(e.consult_value);(!isNaN(r)&&r>15||c!=null&&c>5)&&(n="urine")}if(o==="Glucose"&&(n==="urine"||Ae.has(t)||He(e.assay_value)))return"\u5C3F\u7CD6";let s=o||(a||t||"?").trim();return n==="urine"?Ne(s):s}var Te={Hb:"g/dL",WBC:"/uL",RBC:"10^6/uL",Platelet:"10^3/uL",HCT:"%",MCV:"fL",MCH:"pg",MCHC:"g/dL",RDW:"%",MPV:"fL",Neutrophil:"%",Lymphocyte:"%",Monocyte:"%",Eosinophil:"%",Basophil:"%",BUN:"mg/dL",Cr:"mg/dL","U.A":"mg/dL",Glucose:"mg/dL",HbA1c:"%",Alb:"g/dL","T-Bil":"mg/dL","D-Bil":"mg/dL",GOT:"U/L",GPT:"U/L","ALK-P":"U/L",Amylase:"U/L",Lipase:"U/L",Chol:"mg/dL",TG:"mg/dL",HDL:"mg/dL",LDL:"mg/dL",Na:"mmol/L",K:"mmol/L",Cl:"mmol/L",CRP:"mg/dL",GFR:"mL/min",UPCR:"mg/g",UACR:"mg/g"},Me=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function Ee(e,a={}){if(!e||e.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let t=180,n=Be(e),i=e.filter(g=>{let b=g.assay_value;if(!b||String(b).trim()===""||String(b).trim()==="***")return!1;let y=g.real_inspect_date||g.recipe_date||"";return O(y,t)});if(i.length===0)return`<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>${n}`;let o=new Set,s={},r=0;for(let g of i){let b=w(g.real_inspect_date||g.recipe_date||"");if(!b)continue;let y=String(g.assay_value).trim(),_=g.consult_value||"",S=g.order_code||"",D=(g.unit_data||"").trim(),m=G(g);o.add(b),s[m]||(s[m]={name:m,code:S,unit:"",dates:{},order:r++}),!s[m].unit&&D&&(s[m].unit=D),!s[m].code&&S&&(s[m].code=S);let $={value:y,dir:U(y,_,S),ref:Fe(_,S)},v=s[m].dates[b];if(!v)s[m].dates[b]=$;else{let L=String(v.value||"").trim(),H=String($.value||"").trim();L?!H||L===H||(!v.dir&&$.dir?($.alternates=[L,...(v.alternates||[]).filter(pe=>pe!==H)],s[m].dates[b]=$):(v.alternates=v.alternates||[],v.alternates.includes(H)||v.alternates.push(H))):s[m].dates[b]=$}}if(s.Cr&&a?.age&&a?.sex){let g=a.age,b=ee(a.sex),y={name:"eGFR(\u8A08\u7B97)",code:"",unit:"mL/min/1.73m\xB2",dates:{},order:-.5,synthetic:"egfr"};for(let[_,S]of Object.entries(s.Cr.dates)){let D=parseFloat(S.value);if(!isNaN(D)&&D>0){if(D>15){console.warn(`[NHITW Clinic] Skipping eGFR for ${_} \u2014 Cr=${D} not plausible as serum`);continue}let m=ne(D,g,b);if(m!=null){let $=ae(m);y.dates[_]={value:m.toFixed(1),egfr:m,stage:$,ref:"CKD-EPI 2021 \u226560 \u70BA\u6B63\u5E38"}}}}Object.keys(y.dates).length>0&&(s["eGFR(\u8A08\u7B97)"]=y)}let{upcrByDate:c,uacrByDate:d}=te(e),f=(g,b,y)=>{if(Object.keys(b).length===0)return;let _={};for(let[S,D]of Object.entries(b)){let m=D<10?D.toFixed(1):D.toFixed(0);_[S]={value:m,dir:D>=y?"high":null,ref:`<${y}`}}s[g]={name:g,code:"",unit:"mg/g",dates:_,order:-.4,synthetic:"urine-ratio"}};f("eUPCR(\u8A08\u7B97)",c,150),f("eUACR(\u8A08\u7B97)",d,30);let h=[...o].sort((g,b)=>b.localeCompare(g)),u=new Map;Me.forEach((g,b)=>{u.has(g.name)||u.set(g.name,b)});let p=u.get("Cr");p!=null&&(u.set("eGFR(\u8A08\u7B97)",p+.3),u.set("eUPCR(\u8A08\u7B97)",p+.4),u.set("eUACR(\u8A08\u7B97)",p+.5));let x=Object.keys(s).sort((g,b)=>{let y=u.has(g)?u.get(g):1e3+s[g].order,_=u.has(b)?u.get(b):1e3+s[b].order;return y-_});if(h.length===0||x.length===0)return`<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>${n}`;let k='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let g of h)k+=`<th class="lab-date-col" data-short="${l($e(g))}" onclick="copyLabColumn(this)" title="\u9EDE\u64CA\u8907\u88FD\u6B64\u6B21\u62BD\u8840\u6578\u64DA(\u6C11\u570B\u5E74\u683C\u5F0F)">${l(_e(g))}</th>`;k+="</tr>";let N="";for(let g of x){let b=s[g],y=b.unit||Te[g]||"",_=y?`<span class="lab-unit">${l(y)}</span>`:"",S=g.replace(/\(計算\)/g,"").trim()||g;N+=`<tr data-item="${l(S)}"><td class="lab-item-name" title="\u9EDE\u64CA\u9078\u53D6(\u9AD8\u4EAE\u5217)\u3002\u9EDE\u65E5\u671F\u6B04\u8907\u88FD\u6642\uFF0C\u82E5\u6709\u9078\u53D6\u5247\u53EA\u8907\u88FD\u9078\u7684\uFF1B${l(b.code)}" onclick="toggleLabRow(this)">${l(g)}${_}</td>`;for(let D of h){let m=b.dates[D];if(m)if(b.synthetic==="egfr"&&m.stage){let $=Re(m.stage),v=`${m.stage} \xB7 CKD-EPI 2021`;N+=`<td style="${$}" title="${l(v)}" data-val="${l(m.value)}">${l(m.value)}<span class="ckd-stage">${l(m.stage)}</span></td>`}else{let $=m.dir==="high"?"lab-high":m.dir==="low"?"lab-low":"",v=[];m.ref&&v.push(`\u53C3\u8003\u503C ${m.ref}`),m.alternates?.length&&v.push(`\u540C\u65E5\u53E6: ${m.alternates.join(" / ")}`);let L=m.alternates?.length?`<span class="lab-alt"> /${l(m.alternates.join(" /"))}</span>`:"";N+=`<td class="${$}" title="${l(v.join(" \xB7 "))}" data-val="${l(m.value)}">${l(m.value)}${L}</td>`}else N+='<td class="no-data">-</td>'}N+="</tr>"}return`<div class="lab-toolbar"><span class="lab-tool-hint">\u9EDE\u9805\u76EE\u540D\u7A31\u53EF\u9078\u53D6</span><a class="lab-tool-btn" onclick="selectAllLab(this)">\u5168\u9078</a><span class="lab-tool-sep">\uFF5C</span><a class="lab-tool-btn" onclick="clearLabSelection(this)">\u6E05\u7A7A</a><span class="lab-sel-count">\u672A\u9078\u53D6</span></div><div class="lab-scroll"><table class="lab-pivot"><thead>${k}</thead><tbody>${N}</tbody></table></div>
  <div class="tracking-note">${t} \u5929\u5167 \xB7 ${x.length} \u9805 \xD7 ${h.length} \u6B21</div>${n}`}function Be(e){if(!e||e.length===0)return"";try{let a=new Set;for(let o of e)for(let s of Object.keys(o))a.add(s);let t=e.filter(o=>{let s=`${o.assay_item_name||""} ${o.order_name||""} ${o.assay_tp_cname||""}`;return/creatinine|\bcr\b|e?gfr|urine|尿|肌酐|肌酸酐|腎絲球/i.test(s)||o.order_code==="09015C"}),n={generated:new Date().toISOString(),recordCount:e.length,allFieldKeys:[...a].sort(),sampleRecord:e[0],creatinineRelatedRecords:t};return`
<!-- NHITW-DEBUG-START
${JSON.stringify(n,null,2).replace(/--+/g,o=>o.split("").join("\u200B"))}
NHITW-DEBUG-END -->
`}catch(a){return`
<!-- NHITW-DEBUG error: ${String(a&&a.message||a).replace(/--+/g,"-")} -->
`}}function Oe(e){if(!e)return"";try{let a=e.rObject||e.robject||e,t=Array.isArray(a)?a.length:0,n=new Set;if(Array.isArray(a)){for(let s of a.slice(0,200))if(s&&typeof s=="object")for(let r of Object.keys(s))n.add(r)}let i={generated:new Date().toISOString(),endpoint:"imue0100s02 (\u4E2D\u91AB\u8655\u7F6E / \u91DD\u7078\u6CBB\u7642)",shape:Array.isArray(a)?"array":typeof a,recordCount:t,allFieldKeys:[...n].sort(),firstFiveRecords:Array.isArray(a)?a.slice(0,5):null,rawIfNonArray:Array.isArray(a)?void 0:e};return`
<!-- NHITW-ACU-PROBE-START
${JSON.stringify(i,null,2).replace(/--+/g,s=>s.split("").join("\u200B"))}
NHITW-ACU-PROBE-END -->
`}catch(a){return`
<!-- NHITW-ACU-PROBE error: ${String(a&&a.message||a).replace(/--+/g,"-")} -->
`}}function ee(e){let a=String(e||"").trim().toUpperCase();return a==="F"||a==="FEMALE"||a==="2"||a==="\u5973"}function te(e){if(!Array.isArray(e))return{upcrByDate:{},uacrByDate:{}};let a={},t={},n={};for(let s of e){let r=(s.assay_item_name||"").toString(),c=(s.order_name||"").toString(),d=(s.order_code||"").trim(),f=(s.unit_data||"").toString().toLowerCase().trim(),h=parseFloat(s.assay_value),u=w(s.real_inspect_date||s.recipe_date||"");if(!isFinite(h)||h<=0||!u||/mg\s*\/\s*g/i.test(f))continue;let p=(r+" "+c).toLowerCase();if(d==="09016C"||/urine creatinine|尿.*肌酸酐|肌酸酐.*尿|\bu-?cr\b/i.test(p)){n[u]==null&&(n[u]=h);continue}if((d==="09040C"||/urine protein|尿蛋白/i.test(p))&&/mg\/?dl/i.test(f)&&h<500){a[u]==null&&(a[u]=h);continue}if(/microalbumin|urine albumin|尿微?白蛋白/i.test(p)&&/mg\/?[dl]/i.test(f)){t[u]==null&&(t[u]={value:h,unit:f});continue}}let i={};for(let[s,r]of Object.entries(a)){let c=n[s];c>0&&(i[s]=r*1e3/c)}let o={};for(let[s,r]of Object.entries(t)){let c=n[s];if(!(c>0))continue;let d=/mg\s*\/\s*l\b/i.test(r.unit)&&!/mg\s*\/\s*dl/i.test(r.unit)?r.value/10:r.value;o[s]=d*1e3/c}return{upcrByDate:i,uacrByDate:o}}function ne(e,a,t){if(!(e>0)||!(a>0))return null;let i=e/(t?.7:.9),o=Math.min(i,1),s=Math.max(i,1);return t?142*Math.pow(o,-.241)*Math.pow(s,-1.2)*Math.pow(.9938,a)*1.012:142*Math.pow(o,-.302)*Math.pow(s,-1.2)*Math.pow(.9938,a)}function ae(e){return e>=90?"\u6B63\u5E38":e>=60?"G2":e>=45?"G3a":e>=30?"G3b":e>=15?"G4":"G5"}function Re(e){switch(e){case"\u6B63\u5E38":return"color:#2e7d32;font-weight:bold";case"G3a":return"color:#f57c00;font-weight:bold";case"G3b":return"color:#e65100;font-weight:bold";case"G4":return"color:#d32f2f;font-weight:bold";case"G5":return"color:#922;font-weight:bold";default:return"font-weight:bold"}}function Fe(e,a){let t=re(e,a);return t?t.min!=null&&t.max!=null?`${t.min}-${t.max}`:t.max!=null?`<${t.max}`:t.min!=null?`>${t.min}`:"":""}function re(e,a){let n=String(e||"").match(/\[\s*(-?\d*\.?\d+)\s*[-~]\s*(-?\d*\.?\d+)\s*\]/);if(n){let i=parseFloat(n[1]),o=parseFloat(n[2]);if(!isNaN(i)&&!isNaN(o))return{min:i,max:o}}try{return Y(e,a||null,null)}catch{return null}}function U(e,a,t){if(e==null||e===""||e==="***")return null;let n=parseFloat(e);if(isNaN(n))return null;let i=re(a,t);return i?i.max!=null&&n>i.max?"high":i.min!=null&&n<i.min?"low":null:null}var Pe=["G43","G50","G51","G52","G54","G61","G62","G63","G65","G90","M13.0","M15","M20","M21","M66","H02","H04","H05","H10","H20","H25","H26","H52"],je=["A15","B01","B02","B05","B06","B20","B97.2","B97.3","D65","D66","D67","D68","D69","D70","D82","D83","D84","E04","E05","E06","E10","E11","E13","E15","E28","F90","F95","I20","I21","I22","I23","I24","I25","I26","I27","I28","I42","I50","I71","I73","I74","I80","I82","I89","J44","J45","J93","J96","J98","K72","K74","K80","L10","L11","L12","L40","L51","L52","L89","L94","L97","M33","M34","M35","N18","N19","R64"],Ge=["A80","D32","D33","D48","D49","F02","F03","F04","F05","F09","F20","F21","F22","F23","F24","F25","F30","F31","F32","F33","F34","F35","F36","F37","F38","F39","F80","F82","F84","G11","G12","G20","G21","G35","G36","G40","G45","G46","G70","G71","G80","G81","G82","G83","G91","G93","G94","H30","H31","H33","H34","H35","H36","H40","H42","H43","H46","H47","H49","H50","H51","H53","H54","H55","I60","I61","I62","I63","I65","I66","I67","I69","M45","M62.3","M99","P91","Q11","Q12","Q13","Q14","Q15","S01.9","S04","S06.3","S06.4","S06.5","S06.6","S14","S22","S24","S32","S34","S44","S54","S64","S74","S84","S94"];function T(e,a){if(!e||!a)return!1;let t=String(e).replace(/\./g,"").toUpperCase().trim(),n=String(a).replace(/\./g,"").toUpperCase().trim();return!t||!n?!1:t===n||t.startsWith(n)}function Ue(e){let a=e&&String(e).toUpperCase().replace(/\./g,"").match(/^C(\d{2})/);if(!a)return!1;let t=parseInt(a[1],10);return t>=0&&t<=96}function ze(e){let a=e&&String(e).toUpperCase().replace(/\./g,"").match(/^O(\d{2})/);if(!a)return!1;let t=parseInt(a[1],10);return t>=10&&t<=16||t>=20&&t<=29}function B(e){let a=new Set,t=["ICD_CODE","icd_code","ICD_CODE_1","icd_code_1","ICD_CODE_2","icd_code_2","ICD_CODE_3","icd_code_3","ICD_CODE_4","icd_code_4","ICD_CODE_5","icd_code_5","icdCode","icdcode","ICD10_CODE","icd10_code","main_icd","sub_icd","MAIN_ICD","SUB_ICD","DIAG_CODE","diag_code"],n=o=>{if(Array.isArray(o)){for(let s of o)if(!(!s||typeof s!="object"))for(let r of t){let c=s[r];c&&a.add(String(c).trim())}}};n(e.medicationData?.rObject),n(e.chinesemedData?.rObject),n(e.dischargeData?.rObject),n(e.surgeryData?.rObject),n(e.patientSummaryData?.rObject);let i=Array.from(a).filter(Boolean);return console.log("[NHITW Clinic] Collected ICD codes for classification:",i),i}function oe(e){let a=new Set,t=new Set,n=new Set;for(let i of e)(Ue(i)||Ge.some(o=>T(i,o)))&&a.add(i),Pe.some(o=>T(i,o))&&t.add(i),(ze(i)||je.some(o=>T(i,o)))&&n.add(i);return{high:[...a],moderate:[...t],special:[...n]}}function se(e){return e.high.length>0||e.moderate.length>0&&e.special.length>0?"high":e.moderate.length>0||e.special.length>0?"moderate":null}function We(e){let a=B(e),t=oe(a);if(!se(t))return new Set;let i=new Set;return t.high.forEach(o=>i.add(o)),t.moderate.forEach(o=>i.add(o)),t.special.forEach(o=>i.add(o)),i}function Ke(e){let a=B(e),t=ie(a),n=new Set;for(let i of t)for(let o of i.hits)n.add(o);return n}function qe(e){let a=B(e),t=oe(a),n=se(t);if(console.log("[NHITW Clinic] Acupuncture matches:",t,"level:",n),!n)return"";let i,o;n==="high"?(i="\u26A1 \u9AD8\u5EA6\u8907\u96DC\u91DD\u7078",t.high.length>0?o=t.high:o=[...t.moderate.map(d=>d+"(\u4E2D)"),...t.special.map(d=>d+"(\u7279)")]):(i="\u{1F489} \u4E2D\u5EA6\u8907\u96DC\u91DD\u7078",o=[...t.moderate,...t.special.map(d=>d+"(\u7279)")]);let s=o.slice(0,12).join(", "),r=o.length>12?`\u2026 (+${o.length-12})`:"",c=`\u7B26\u5408 ICD: ${s}${r}`;return`<span class="acu-badge acu-${n}" title="${l(c)}">${i}</span>`}var Ve=[{name:"\u4E73\u764C",primary:["C50","C79.81"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C50","Z85.3"]},{name:"\u809D\u764C",primary:["C22","C23","C24"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.3","C79.5","C79.7","Z94.4"],secondary:["C22","C23","C24","Z85.05"]},{name:"\u80BA\u764C",primary:["C33","C34"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.3","C79.5","C79.6","C79.7","Z94.2"],secondary:["C33","C34","Z85.1"]},{name:"\u5927\u8178\u764C",primary:["C18","C19","C20","C21"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.0","C79.3","C79.5","C79.6","C79.7"],secondary:["C18","C19","C20","C21","Z85.04"]},{name:"\u80C3\u764C",primary:["C16","C49.A1","C49.A2"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C16","C49.A1","C49.A2","Z85.028"]},{name:"\u651D\u8B77\u817A\u764C",primary:["C61"]},{name:"\u53E3\u8154\u764C",primary:["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"]},{name:"\u5B50\u5BAE\u9838\u764C",primary:["C53"]},{name:"\u5B50\u5BAE\u9AD4\u764C",primary:["C54"]},{name:"\u7532\u72C0\u817A\u764C",primary:["C73"]}];function ie(e){let a=[];for(let t of Ve){let n=new Set,i=!1;for(let o of e)t.primary.some(s=>T(o,s))&&(n.add(o),i=!0);if(t.mets&&t.secondary){let o=e.filter(r=>t.mets.some(c=>T(r,c))),s=e.filter(r=>t.secondary.some(c=>T(r,c)));o.length>0&&s.length>0&&(o.forEach(r=>n.add(r)),s.forEach(r=>n.add(r)),i=!0)}i&&a.push({name:t.name,hits:[...n]})}return a}function Ye(e){let a=B(e),t=ie(a);if(console.log("[NHITW Clinic] Cancer-care detected:",t),t.length===0)return"";let n=t.map(c=>c.name).join("\u3001"),i=[...new Set(t.flatMap(c=>c.hits))],o=i.slice(0,15).join(", "),s=i.length>15?`\u2026 (+${i.length-15})`:"",r=`\u7B26\u5408\u4E2D\u91AB\u764C\u75C7\u52A0\u5F37\u7167\u8B77\u65B9\u6848\uFF1A${n}
\u547D\u4E2D ICD: ${o}${s}`;return`<span class="cancer-badge" title="${l(r)}">\u{1F397} \u764C\u75C7\u5C08\u6848\uFF08${l(n)}\uFF09</span>`}function ce(e){return B(e).filter(t=>T(t,"J45"))}function le(e){let a=String(e?.birthday||"");if(a.length!==7)return null;let t=parseInt(a.substring(0,3),10);if(isNaN(t))return null;let n=t+1911;return new Date().getFullYear()-n}function Je(e,a={}){let t=new Set,n=le(a);if(n===null||n>=12)return t;for(let i of ce(e))t.add(i);return t}function Ze(e,a={}){let t=le(a),n=ce(e);if(console.log("[NHITW Clinic] Asthma check: yearDiff="+t+", J45 codes="+JSON.stringify(n)),t===null||t>=12||n.length===0)return"";let i=n.slice(0,8).join(", "),o=n.length>8?`\u2026 (+${n.length-8})`:"",s=`\u7B26\u5408\u4E2D\u91AB\u6C23\u5598\u5C08\u6848\uFF1A\u6536\u6848\u5E74\u2212\u51FA\u751F\u5E74=${t} (<12)\uFF0C\u66FE\u4E0B\u6C23\u5598\u8A3A\u65B7
\u547D\u4E2D ICD: ${i}${o}`;return`<span class="asthma-badge" title="${l(s)}">\u{1FAC1} \u6C23\u5598\u5C08\u6848\uFF08\u5E74\u5DEE${t}\uFF09</span>`}function Qe(e,a){if(!e?.rObject)return null;let t=null;for(let n of e.rObject){if(G(n)!==a)continue;let i=w(n.real_inspect_date||n.recipe_date||"");i&&(!t||i>t.date)&&(t={date:i,value:n.assay_value,code:n.order_code||"",ref:n.consult_value||""})}return t}function Xe(e){if(!e?.rObject)return null;let{upcrByDate:a,uacrByDate:t}=te(e.rObject),n=(s,r,c)=>{let d=null;for(let[f,h]of Object.entries(s))h<r||(!d||f>d.date)&&(d={date:f,value:h.toFixed(0),ref:`<${r}`,code:"",name:c});return d},i=n(a,150,"eUPCR(\u8A08\u7B97)")||n(t,30,"eUACR(\u8A08\u7B97)");if(i)return i;let o={};for(let s of e.rObject){let r=G(s);if(r!=="UPCR"&&r!=="UACR")continue;let c=w(s.real_inspect_date||s.recipe_date||"");c&&(!o[r]||c>o[r].date)&&(o[r]={date:c,value:s.assay_value,ref:s.consult_value||"",code:s.order_code||"",name:r})}for(let s of Object.values(o))if(U(s.value,s.ref,s.code)==="high")return s;return null}function et(e,a={}){let t=Qe(e?.labData,"Cr");if(!t)return"";let n=parseFloat(t.value);if(!(n>0))return"";if(n>15)return console.warn("[NHITW Clinic] CKD badge: ignoring Cr="+n+" (not plausible as serum)"),"";let i=a?.age;if(typeof i!="number"||i<=0||!a?.sex)return"";let o=ee(a.sex),s=ne(n,i,o);if(console.log("[NHITW Clinic] CKD check: Cr="+n+" ("+t.date+") age="+i+" female="+o+" \u2192 eGFR="+(s!=null?s.toFixed(1):"null")),s==null)return"";let r=ae(s);if(r==="\u6B63\u5E38")return"";if(s<60){let f=`eGFR ${s.toFixed(1)} mL/min/1.73m\xB2 (${r})\uFF0C\u7B26\u5408\u4E2D\u91AB\u6162\u6027\u814E\u81DF\u75C5\u9580\u8A3A\u52A0\u5F37\u7167\u8B77\u8A08\u756B
\u4F9D\u64DA\uFF1ACr=${n} mg/dL @ ${t.date}
\u9700\u4E3B\u8A3A\u65B7 ICD-10 N18.2-N18.6`;return`<span class="ckd-badge ckd-eligible" title="${l(f)}">\u{1FAD8} CKD \u6536\u6848 (${r})</span>`}let c=Xe(e?.labData);if(c){let f=`eGFR ${s.toFixed(1)} (${r}) + ${c.name}=${c.value} \u8D85\u6A19 (\u53C3\u8003 ${c.ref||"\u7121"}) @ ${c.date}
\u7B26\u5408 stage 2 \u6536\u6848\u689D\u4EF6 \u2014 \u9700\u4E3B\u8A3A\u65B7 ICD-10 N18.2-N18.6`;return`<span class="ckd-badge ckd-eligible" title="${l(f)}">\u{1FAD8} CKD \u6536\u6848 (stage 2 + \u86CB\u767D\u5C3F)</span>`}let d=`eGFR ${s.toFixed(1)} (${r})\uFF1Bstage 2 \u6536\u6848\u9700 UPCR\u2265150 mg/g\u3001UACR\u226530 mg/g\uFF08\u7CD6\u5C3F\u75C5\uFF09\u6216\u8840\u5C3F\uFF0C\u8ACB\u81E8\u5E8A\u5224\u65B7
\u4F9D\u64DA\uFF1ACr=${n} mg/dL @ ${t.date}`;return`<span class="ckd-badge ckd-watch" title="${l(d)}">\u{1FAD8} CKD \u5F85\u78BA\u8A8D (stage 2)</span>`}var tt={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},nt={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},at={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function de(e){if(!e)return null;for(let[a,t]of Object.entries(tt))if(t.some(n=>n.length===7?e===n:e.startsWith(n)))return a;return null}function rt(e){for(let[a,t]of Object.entries(nt))if(t.includes(e))return a;return null}function O(e,a){if(!e)return!1;let t=new Date(e);return isNaN(t.getTime())&&e.includes("/")&&(t=new Date(e.replace(/\//g,"-"))),isNaN(t.getTime())?!1:Date.now()-t.getTime()<=a*864e5}function ot(e,a){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=a||100,n=[];for(let r of e){let c=r.PER_DATE||r.drug_date||"";if(!O(c,t))continue;let d=r.ATC_CODE||r.drug_atc7_code||"",f=de(d);if(!f)continue;let h=rt(f);h&&n.push({name:r.MED_DESC||r.MED_ITEM||r.drug_ename||"",generic:r.GENERIC_NAME||r.drug_ing_name||"",date:w(c),hosp:E(r.HOSP_NAME||r.hosp),freq:r.FREQ_DESC||r.drug_fre||"",medDays:r.MED_DAYS||r.day||"",drugLeft:r.DRUG_LEFT||r.drug_left||"",groupName:f,colorName:h})}if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let i=["red","orange","green"],o={};for(let r of n){o[r.colorName]||(o[r.colorName]={}),o[r.colorName][r.groupName]||(o[r.colorName][r.groupName]={});let c=r.name;o[r.colorName][r.groupName][c]||(o[r.colorName][r.groupName][c]={...r,prescriptions:[]}),o[r.colorName][r.groupName][c].prescriptions.push({date:r.date,hosp:r.hosp,days:r.medDays,drugLeft:r.drugLeft})}let s="";for(let r of i){if(!o[r])continue;let c=at[r];for(let[d,f]of Object.entries(o[r]))for(let h of Object.values(f)){h.prescriptions.sort((p,x)=>(x.date||"").localeCompare(p.date||""));let u=h.prescriptions.slice(0,3).map(p=>`<span class="med-pres">${l(M(p.date))} ${l(p.hosp)}${p.drugLeft&&p.drugLeft!=="0"?` <span class="drug-left">\u9918${p.drugLeft}\u5929</span>`:""}</span>`).join(" ");s+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${c.bg};border-color:${c.border};color:${c.text}">${l(d)}</span></td>
          <td class="med-name-cell">${l(h.name)}</td>
          <td class="med-pres-cell">${u}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${s}</tbody>
  </table>
  <div class="tracking-note">${t} \u5929\u5167</div>`}function st(e,a){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=a||100,n=[];for(let r of e){let c=r.PER_DATE||r.drug_date||"";if(!O(c,t))continue;let d=r.ATC_CODE||r.drug_atc7_code||"";de(d)||n.push({name:r.MED_DESC||r.MED_ITEM||r.drug_ename||"",generic:r.GENERIC_NAME||r.drug_ing_name||"",date:w(c),hosp:E(r.HOSP_NAME||r.hosp),icd:r.ICD_CODE||r.icd_code||"",icdName:r.ICD_NAME||r.icd_cname||"",freq:r.FREQ_DESC||r.drug_fre||"",medDays:r.MED_DAYS||r.day||"",drugLeft:r.DRUG_LEFT||r.drug_left||""})}if(n.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let i={};for(let r of n){let c=`${r.date}|${r.hosp}`;i[c]||(i[c]={date:r.date,hosp:r.hosp,icd:r.icd,icdName:r.icdName,meds:[]}),i[c].meds.push(r)}let o=Object.values(i).sort((r,c)=>(c.date||"").localeCompare(r.date||"")),s="";for(let r of o){s+=`<div class="med-group-header">${l(M(r.date))} ${l(r.hosp)}`,r.icd&&(s+=` <span class="diag-code">${l(r.icd)}</span>`),s+="</div>";for(let c of r.meds){let d=[c.freq,c.medDays?c.medDays+"\u5929":"",c.drugLeft&&c.drugLeft!=="0"?`\u9918${c.drugLeft}\u5929`:""].filter(Boolean).join(" ");s+=`<div class="med-item">${l(c.name)} <span class="med-detail">${l(d)}</span></div>`}}return s+=`<div class="tracking-note">${t} \u5929\u5167</div>`,s}function it(e){if(!e||e.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let a={};for(let n of e){let i=w(n.func_date||""),o=E(n.hosp),s=`${i}|${o}`;a[s]||(a[s]={date:i,hosp:o,icd:n.icd_code||"",icdName:n.icd_cname||"",meds:[]}),a[s].meds.push(n)}let t="";for(let n of Object.values(a)){t+=`<div class="med-group-header">${l(M(n.date))} ${l(n.hosp)}`,n.icd&&(t+=` <span class="diag-code">${l(n.icd)}</span>`),t+="</div>";let i=new Map;for(let o of n.meds){let s=o.drug_perscrn_name||o.cdrug_name||"",r=parseFloat(o.order_qty)||0,c=o.drug_fre||"",d=o.day||"",f=`${s}|${c}|${d}`,h=i.get(f);h?r>h.qty?(h.alts.push(h.raw),h.qty=r,h.raw=o.order_qty||""):String(o.order_qty||"")!==h.raw&&h.alts.push(o.order_qty||""):i.set(f,{name:s,qty:r,freq:c,days:d,raw:o.order_qty||"",alts:[]})}for(let o of i.values()){let s=o.alts.length?` title="\u540C\u7B46\u8655\u65B9\u53E6\u5B58 qty=${l(o.alts.join(", "))}"`:"",r=o.alts.length?' <span class="med-dup">\u26A0</span>':"";t+=`<div class="med-item"${s}>${l(o.name)} <span class="med-detail">${l(o.raw)} ${l(o.freq)} ${o.days?o.days+"\u5929":""}${r}</span></div>`}}return t}var ct=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function lt(e){if(!e||e.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let a=180,t=e.filter(s=>{let r=s.real_inspect_date||s.case_time||s.recipe_date||"";if(!O(r,a))return!1;let c=s.order_code||"";return ct.has(c)});if(t.length===0)return`<p class="empty">${a}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let n=new Set,i=[];for(let s of t){let r=w(s.real_inspect_date||s.case_time||s.recipe_date||""),c=s.order_name||"",d=s.order_code||"",f=`${r}|${c}|${d}`;n.has(f)||(n.add(f),i.push(s))}i.sort((s,r)=>{let c=w(s.real_inspect_date||s.case_time||s.recipe_date||"");return w(r.real_inspect_date||r.case_time||r.recipe_date||"").localeCompare(c)});let o="";for(let s of i){let r=M(s.real_inspect_date||s.case_time||s.recipe_date||""),c=s.order_name||"";c=c.replace(/[[\]]/g,"").replace(/;/g," ").trim();let d=E(s.hosp),f=s.inspect_result||"";o+='<div class="imaging-item">',o+=`<div class="imaging-name">${l(c)}</div>`,o+=`<div class="imaging-meta">${l(r)} ${l(d)}</div>`,f&&(o+=`<div class="imaging-result">${l(f)}</div>`),o+="</div>"}return o+=`<div class="tracking-note">${a} \u5929\u5167</div>`,o}function dt(e){if(!e||e.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let a=e.filter(n=>{let i=n.drug_name||"";return i&&!i.includes("\u672A\u8A18\u9304")&&i!=="NP"&&i!=="N.P"&&i!=="N.P."&&!i.includes("\u672A\u904E\u654F")});if(a.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let t="";for(let n of a){let i=n.drug_name||"",o=(n.sympton_name||"").replace(/;/g,", ");t+=`<div class="allergy-item"><strong>${l(i)}</strong>${o?` \u2014 ${l(o)}`:""}</div>`}return t}function ut(e){if(!e||e.length===0)return"";let a="";for(let t of e){let n=M(t.exe_s_date||""),i=E(t.hosp),o=t.icd_cname||t.icd_code||"";a+=`<div class="record-item">${l(n)} ${l(i)} \u2014 ${l(o)}</div>`}return a}function pt(e){if(!e||e.length===0)return"";let a="";for(let t of e){let n=M(t.in_date||""),i=M(t.out_date||""),o=E(t.hosp),s=t.icd_cname||t.icd_code||"";a+=`<div class="record-item">${l(n)}~${l(i)} ${l(o)} \u2014 ${l(s)}</div>`}return a}function ft(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.result_data?e:null:null}function gt(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.colorectal||e.oralMucosa||e.mammography||e.papSmears||e.lungCancer?e:null:null}function mt(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.result_data||e.med_data?e:null:null}function ht(e){let a=ft(e);if(!a||!Array.isArray(a.result_data)||a.result_data.length===0)return"";let t=a.result_data[0],n=i=>i==null||i===""?"\u2014":l(String(i));return`<div class="hc-title">${n(t.title||"\u6700\u8FD1\u4E00\u6B21")}</div>
    <div class="hc-row">\u8EAB\u9AD8 <b>${n(t.height)}</b> / \u9AD4\u91CD <b>${n(t.weight)}</b> / BMI <b>${n(t.bmi)}</b> / \u8170\u570D <b>${n(t.waistline)}</b></div>
    <div class="hc-row">\u8840\u58D3 <b>${n(t.base_sbp)}/${n(t.base_ebp)}</b></div>
    <div class="hc-row">Chol <b>${n(t.cho)}</b> / TG <b>${n(t.blod_tg)}</b> / LDL <b>${n(t.ldl)}</b> / HDL <b>${n(t.hdl)}</b> / \u8840\u7CD6 <b>${n(t.s_09005c)}</b></div>
    <div class="hc-row">BUN <b>${n(t.urine_bun)}</b> / Cr <b>${n(t.blod_creat)}</b> / GFR <b>${n(t.egfr)}</b> / \u5C3F\u86CB\u767D <b>${n(t.urine_protein)}</b></div>
    <div class="hc-row">GOT <b>${n(t.sgot)}</b> / GPT <b>${n(t.sgpt)}</b></div>`}function bt(e){let a=gt(e);if(!a)return"";let t=[["colorectal","\u7CDE\u4FBF\u6F5B\u8840"],["oralMucosa","\u53E3\u8154\u9ECF\u819C"],["mammography","\u4E73\u623F\u651D\u5F71"],["papSmears","\u5B50\u5BAE\u9838\u764C"],["lungCancer","\u80BA\u764C\u7BE9\u6AA2"]],n=[];for(let[i,o]of t){let s=a[i]?.subData;if(Array.isArray(s)&&s.length>0){let r=s[0],c=r.result||"\u7121\u8CC7\u6599",d=c==="\u7570\u5E38",f=[r.func_date,r.hosp_abbr].filter(Boolean).join(" ");n.push(`<div class="scr-row ${d?"scr-abnormal":""}"><span class="scr-label">${l(o)}</span><span class="scr-result">${l(c)}</span>${f?`<span class="scr-meta">${l(f)}</span>`:""}</div>`)}}return n.length===0?"":n.join("")}function Ct(e){let a=mt(e);if(!a)return"";let t="";if(Array.isArray(a.result_data)&&a.result_data.length>0){t+='<div class="hbcv-sec">\u6AA2\u9A57\u7D50\u679C</div>';for(let n of a.result_data){let i=U(n.assay_value,n.consult_value,n.order_code),o=i==="high"?"lab-high":i==="low"?"lab-low":"";t+=`<div class="hbcv-row"><span class="hbcv-name">${l(n.assay_item_name||"")}</span> <span class="${o}">${l(n.assay_value||"")}</span> <span class="hbcv-meta">${l(n.real_inspect_date||"")}</span></div>`}}if(Array.isArray(a.med_data)&&a.med_data.length>0){t+='<div class="hbcv-sec">\u6CBB\u7642\u85E5\u7269</div>';for(let n of a.med_data){let i=n.hosp?String(n.hosp).split(";")[0]:"";t+=`<div class="hbcv-row"><span class="hbcv-name">${l(n.drug_ing_name||"")}</span> <span class="hbcv-meta">${l(n.func_date||"")} ${l(i)}</span></div>`}}return t}function yt(e,a,t,n){let i="";return n.allergyHtml&&!n.allergyHtml.includes("\u7121\u904E\u654F")&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${n.allergyHtml}</div></div>`),n.surgeryHtml&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${n.surgeryHtml}</div></div>`),n.adultHealthHtml&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1FA7A} \u6210\u4EBA\u9810\u9632\u4FDD\u5065</div><div class="panel-body">${n.adultHealthHtml}</div></div>`),n.cancerScreeningHtml&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52C} \u56DB\u764C\u7BE9\u6AA2</div><div class="panel-body">${n.cancerScreeningHtml}</div></div>`),n.hbcvHtml&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F9EB} B/C \u809D\u5C08\u5340</div><div class="panel-body">${n.hbcvHtml}</div></div>`),n.dischargeHtml&&(i+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u4F4F\u9662\u7D00\u9304</div><div class="panel-body">${n.dischargeHtml}</div></div>`),`<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${l(e)} \u2014 \u91AB\u7642\u8CC7\u6599\u5831\u544A</title>
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
.asthma-badge { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; background:#0288d1; color:#fff; }
.ckd-badge { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; color:#fff; }
.ckd-badge.ckd-eligible { background:#c62828; }
.ckd-badge.ckd-watch    { background:#ed6c02; }

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
.diag-item { padding:5px 0; border-bottom:1px solid #f5f5f5; font-size:12px; }
.diag-item:last-child { border-bottom:none; }
.diag-line1 { display:flex; align-items:center; gap:6px; }
.diag-line2 { font-size:10px; color:#999; margin-top:1px; margin-left:2px; }
.diag-code { background:#e8f5e9; color:#2e7d32; padding:1px 6px; border-radius:3px; font-size:10px; font-weight:600; flex-shrink:0; }
.diag-count { background:#e3f2fd; color:#1565c0; padding:0 5px; border-radius:8px; font-size:10px; font-weight:600; margin-left:auto; flex-shrink:0; }
.diag-meta { color:#999; font-size:10px; margin-left:auto; flex-shrink:0; }
.diag-more { color:#999; font-size:11px; padding:4px 0; text-align:center; }
.diag-type { font-size:9px; font-weight:700; padding:0 4px; border-radius:3px; flex-shrink:0; }
.diag-type.emergency { background:#ffebee; color:#c62828; }
.diag-type.inpatient { background:#fff3e0; color:#e65100; }
.visit-type-label { font-size:11px; font-weight:600; padding:4px 8px; margin-top:8px; border-radius:3px; }
.emergency-label { background:#ffebee; color:#c62828; }
.inpatient-label { background:#e8f5e9; color:#2e7d32; }
.vaccine-label { background:#e3f2fd; color:#1565c0; }

/* Lab pivot table */
.lab-scroll { overflow-x:auto; max-width:100%; }
.lab-pivot { border-collapse:collapse; font-size:12px; white-space:nowrap; }
.lab-pivot th { background:#f5f7fa; padding:6px 8px; text-align:center; border-bottom:2px solid #dee2e6; font-weight:600; font-size:11px; position:sticky; top:0; }
.lab-pivot th.lab-date-col { cursor:pointer; user-select:none; transition: background 0.15s; }
.lab-pivot th.lab-date-col:hover { background:#e3f2fd; color:#1565c0; }
.lab-pivot th.lab-date-col.copied { background:#a5d6a7 !important; color:#1b5e20; }
.lab-pivot td { padding:5px 8px; text-align:center; border-bottom:1px solid #f0f0f0; }
.lab-pivot .lab-item-name { text-align:left; font-weight:600; white-space:nowrap; position:sticky; left:0; background:#fff; z-index:1; cursor:pointer; user-select:none; transition:background 0.15s; }
.lab-pivot .lab-item-name:hover { background:#fff8e1; }
/* Selected row: yellow accent + sticky item-name cell highlighted distinctly */
.lab-pivot tr.lab-row-selected td { background:#fffde7; }
.lab-pivot tr.lab-row-selected .lab-item-name { background:#fff9c4; border-left:3px solid #fbc02d; padding-left:5px; }
.lab-pivot tr.lab-row-selected:hover .lab-item-name { background:#fff59d; }
/* Toolbar above the pivot table */
.lab-toolbar { padding:6px 12px; border-bottom:1px solid #f0f0f0; font-size:11px; display:flex; align-items:center; gap:8px; background:#fafafa; }
.lab-tool-hint { color:#999; font-size:10px; }
.lab-tool-btn { color:#1565c0; cursor:pointer; text-decoration:none; user-select:none; }
.lab-tool-btn:hover { text-decoration:underline; }
.lab-tool-sep { color:#ccc; }
.lab-sel-count { margin-left:auto; color:#888; font-size:11px; }
.lab-sel-count.lab-sel-active { color:#e65100; font-weight:600; }
.lab-pivot .lab-unit { color:#999; font-weight:400; font-size:10px; margin-left:4px; }
.lab-pivot .lab-alt { color:#999; font-weight:400; font-size:11px; }
.lab-pivot .ckd-stage { display:inline-block; margin-left:4px; padding:1px 5px; border-radius:8px; background:#f5f5f5; color:inherit; font-size:9px; font-weight:600; vertical-align:middle; }
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
.diag-item.diag-asthma-match { background:linear-gradient(90deg, rgba(2,136,209,0.18), transparent); border-left:3px solid #0288d1; padding-left:5px; }

/* Medications */
.med-group-header { font-size:12px; font-weight:600; color:#1565c0; background:#e3f2fd; padding:5px 10px; margin-top:6px; border-radius:4px; }
.med-group-header:first-child { margin-top:0; }
.med-item { padding:3px 0 3px 10px; font-size:12px; border-bottom:1px solid #fafafa; }
.med-detail { color:#888; font-size:11px; }
.med-dup { color:#ed6c02; font-size:10px; cursor:help; }

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

/* Adult Health Check */
.hc-title { font-weight:600; color:#1565c0; font-size:12px; margin-bottom:4px; }
.hc-row { font-size:12px; padding:2px 0; color:#444; }
.hc-row b { color:#1a1a1a; font-weight:600; }

/* Cancer Screening */
.scr-row { display:flex; align-items:center; gap:8px; padding:4px 0; font-size:12px; border-bottom:1px solid #f5f5f5; }
.scr-row:last-child { border-bottom:none; }
.scr-label { font-weight:600; color:#444; min-width:64px; }
.scr-result { color:#2e7d32; font-weight:600; }
.scr-meta { font-size:10px; color:#999; margin-left:auto; }
.scr-row.scr-abnormal .scr-result { color:#d32f2f; }

/* HBCV */
.hbcv-sec { font-weight:600; color:#1565c0; font-size:11px; margin:6px 0 2px; }
.hbcv-sec:first-child { margin-top:0; }
.hbcv-row { display:flex; align-items:center; gap:6px; padding:3px 0; font-size:12px; border-bottom:1px solid #fafafa; }
.hbcv-name { flex:1; }
.hbcv-meta { font-size:10px; color:#999; }

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
    <h1>${l(e)}${n.acuBadgeHtml||""}${n.cancerBadgeHtml||""}${n.asthmaBadgeHtml||""}${n.ckdBadgeHtml||""}</h1>
    <div class="meta">${l(a)}${n.patientMetaLine?" \uFF5C "+l(n.patientMetaLine):""} \uFF5C ${l(t)}</div>
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
    ${i}
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
function findLabPanel(el) {
  // Walk up to the .panel-body that contains the lab toolbar + table.
  var p = el && el.closest ? el.closest('.panel-body') : null;
  return p && p.querySelector('.lab-pivot') ? p : null;
}
function updateLabSelCount(panel) {
  if (!panel) return;
  var n = panel.querySelectorAll('.lab-pivot tbody tr.lab-row-selected').length;
  var counter = panel.querySelector('.lab-sel-count');
  if (counter) {
    counter.textContent = n > 0 ? ('\u5DF2\u9078 ' + n + ' \u9805') : '\u672A\u9078\u53D6';
    counter.classList.toggle('lab-sel-active', n > 0);
  }
}
function toggleLabRow(td) {
  var tr = td.closest('tr');
  if (!tr || !tr.dataset.item) return;
  tr.classList.toggle('lab-row-selected');
  updateLabSelCount(td.closest('.panel-body'));
}
function selectAllLab(btn) {
  var panel = findLabPanel(btn);
  if (!panel) return;
  panel.querySelectorAll('.lab-pivot tbody tr[data-item]').forEach(function(tr) { tr.classList.add('lab-row-selected'); });
  updateLabSelCount(panel);
}
function clearLabSelection(btn) {
  var panel = findLabPanel(btn);
  if (!panel) return;
  panel.querySelectorAll('.lab-pivot tbody tr.lab-row-selected').forEach(function(tr) { tr.classList.remove('lab-row-selected'); });
  updateLabSelCount(panel);
}
function copyLabColumn(th) {
  var idx = th.cellIndex;
  var shortDate = th.dataset.short || '';
  var table = th.closest('table');
  if (!table) return;
  // If the user has highlighted specific rows, only copy those; otherwise
  // copy every row (the unselected default \u2014 no regression from the
  // pre-selection behaviour).
  var selected = table.querySelectorAll('tbody tr.lab-row-selected');
  var rows = selected.length > 0 ? selected : table.querySelectorAll('tbody tr[data-item]');
  var parts = [];
  rows.forEach(function(tr) {
    var item = tr.dataset.item;
    if (!item) return;
    var cell = tr.cells[idx];
    if (!cell) return;
    var val = cell.dataset.val;
    if (val == null || val === '') return;
    parts.push(item + ':' + val);
  });
  if (parts.length === 0) return;
  var text = (shortDate ? shortDate + ' ' : '') + parts.join(' ');
  function flash() {
    th.classList.add('copied');
    setTimeout(function() { th.classList.remove('copied'); }, 900);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(flash, function() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position='fixed'; ta.style.left='-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch(_) {}
      document.body.removeChild(ta);
      flash();
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.left='-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch(_) {}
    document.body.removeChild(ta);
    flash();
  }
}
<\/script>
${n.acupunctureProbeHtml||""}
</body>
</html>`}var C={medicationData:null,labData:null,chinesemedData:null,acupunctureData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,adultHealthCheckData:null,cancerScreeningData:null,hbcvData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},K=-1,vt=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function z(){for(let e of Object.keys(C))vt.has(e)||(C[e]=null)}function xt(e){let a=e||new Date,t=a.getHours()*60+a.getMinutes();return t<780?"\u65E9\u8A3A":t<1070?"\u5348\u8A3A":"\u665A\u8A3A"}var W=!1;function ue(){W||(W=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(W=!1,Dt().catch(a=>{console.warn("[NHITW Clinic] Export alarm handler error:",a.message)}))});async function Dt(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t={age:null,sex:"",birthday:""},n=null,i=K;if(i>0)try{n=await chrome.tabs.sendMessage(i,{action:"getPatientInfo"}),console.log(`[NHITW Clinic] Fresh patient info from tracked tab ${i}:`,n)}catch(p){console.warn(`[NHITW Clinic] Tracked tab ${i} unreachable: ${p.message}, falling back`),i=-1}if(!n)try{let p=await chrome.tabs.query({url:"https://medcloud2.nhi.gov.tw/*"}),x=p.find(k=>k.active)||p[0];x&&(n=await chrome.tabs.sendMessage(x.id,{action:"getPatientInfo"}),console.log(`[NHITW Clinic] Fresh patient info from active fallback tab ${x.id}:`,n))}catch(p){console.warn("[NHITW Clinic] Fallback getPatientInfo also failed:",p.message)}if(n?.id){let p=n.id!==C.patientIdFromToken;C.patientIdFromToken=n.id,n.name?C.patientName=n.name:(p||!C.patientName)&&(C.patientName=n.id),t={age:n.age??null,sex:n.sex||"",birthday:n.birthday||""}}let o=C.patientIdFromToken,s=C.patientName;if(!o){let p=C.currentUserSession;if(!p){console.log("[NHITW Clinic] No session data, skipping export");return}o=p.startsWith("patient_")?p.replace("patient_",""):p}s||(s=o),console.log(`[NHITW Clinic] Export: ID=${F(o,4,3)}, Name=${F(s,1,1)}`);let r={};for(let[p,x]of Object.entries(C))p!=="token"&&p!=="currentUserSession"&&x&&(r[p]=x);let c=Z(s,o,r,t),d=Q(s),f=xt(new Date),h=Math.round(new Blob([c]).size/1024),u=h;if(console.log(`[NHITW Clinic] Generating HTML: ${d} (${u}KB, ${Object.keys(r).length} data types, session=${f})`),u>900&&(c=_t(c),u=Math.round(new Blob([c]).size/1024),u<=900&&console.warn(`[NHITW Clinic] HTML trimmed (${h}KB \u2192 ${u}KB) by dropping debug comment`)),u>900){console.warn(`[NHITW Clinic] HTML too large (${u}KB) \u2014 writing oversize stub instead`);try{chrome.action.setBadgeText({text:"\u26A0"}),chrome.action.setBadgeBackgroundColor({color:"#c62828"})}catch{}c=$t(s,o,h),await P(d,c,void 0,f);return}await P(d,c,void 0,f),console.log(`[NHITW Clinic] HTML report saved: ${f}/${d}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}function _t(e){return e.replace(/<!-- NHITW-DEBUG-START[\s\S]*?NHITW-DEBUG-END -->\n?/g,"")}function F(e,a=1,t=1){if(e==null)return"";let n=String(e);return n.length<=a+t?n:n.slice(0,a)+"*".repeat(Math.min(3,n.length-a-t))+n.slice(-t)}function $t(e,a,t){let n=o=>String(o??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),i=new Date().toLocaleString("zh-TW");return`<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>${n(e)} \u2014 \u5831\u544A\u904E\u5927</title>
<style>body{font-family:"Microsoft JhengHei","PingFang TC",sans-serif;background:#fff3e0;color:#333;padding:24px;margin:0}
h1{color:#c62828;font-size:20px;margin-bottom:12px}
.box{background:#fff;border:2px solid #ed6c02;border-radius:8px;padding:18px;max-width:600px;line-height:1.7;font-size:14px}
.box b{color:#c62828}.box code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:13px}
.note{margin-top:14px;font-size:12px;color:#666}</style></head><body>
<h1>\u26A0\uFE0F \u6B64\u4EFD\u75C5\u4EBA\u8CC7\u6599\u904E\u5927\uFF0C\u672A\u80FD\u5B8C\u6574\u751F\u6210\u5831\u544A</h1>
<div class="box">
  <p><b>\u75C5\u4EBA\uFF1A</b>${n(e)}\uFF08${n(a)}\uFF09</p>
  <p><b>\u6642\u9593\uFF1A</b>${n(i)}</p>
  <p><b>\u539F\u59CB HTML \u5927\u5C0F\uFF1A</b>${t} KB\uFF08\u8D85\u904E Native Messaging \u4E0A\u9650 1024 KB\uFF09</p>
  <p>\u8ACB<b>\u76F4\u63A5\u5728\u5065\u4FDD\u96F2\u7AEF\u539F\u59CB\u7CFB\u7D71\u67E5\u95B1</b>\u672C\u6B21\u8CC7\u6599\u3002</p>
  <p class="note">\u82E5\u6B64\u75C5\u4EBA\u7D93\u5E38\u767C\u751F\uFF0C\u8ACB\u806F\u7D61\u958B\u767C\u8005\u8ABF\u6574\u64F4\u5145\u529F\u80FD \u2014 \u901A\u5E38\u662F\u6AA2\u9A57\u7D00\u9304\u592A\u591A\u5E74\u4EFD\u3002</p>
</div></body></html>`}var St={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",acupuncture:"medcloud2.nhi.gov.tw/imu/api/imue0100/imue0100s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(St).forEach(([e,a])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(a)&&(t.tabId>0&&(K=t.tabId),chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e})),{cancel:!1}},{urls:[`https://${a}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${a}*`]},["responseHeaders"])});var R={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",acupuncture:"acupunctureData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData",adultHealthCheck:"adultHealthCheckData",cancerScreening:"cancerScreeningData",hbcvdata:"hbcvData"},wt=new Map([["openPopup",(e,a,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,a,t)=>{z(),C.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(R),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,a,t)=>{z(),t({status:"cleared"})}],["getSessionData",(e,a,t)=>{t({status:"success",data:C})}],["getDataStatus",(e,a,t)=>(chrome.storage.local.get(Object.values(R),n=>{let i={},o=(r,c)=>{let d=n[c],f=d?.rObject||d?.robject;f&&Array.isArray(f)?i[r]={status:"fetched",count:f.length}:i[r]={status:"none",count:0}},s={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(R).forEach(([r,c])=>{let d=s[r]||r;o(d,c)}),t({dataStatus:i})}),!0)],["saveMedicationData",A("medication")],["saveLabData",A("labdata")],["saveChineseMedData",A("chinesemed")],["saveAcupunctureData",A("acupuncture")],["saveImagingData",A("imaging")],["saveAllergyData",A("allergy")],["saveSurgeryData",A("surgery")],["saveDischargeData",A("discharge")],["saveMedDaysData",A("medDays")],["savePatientSummaryData",A("patientSummary")],["saveAdultHealthCheckData",A("adultHealthCheck")],["saveCancerScreeningData",A("cancerScreening")],["saveHbcvdata",A("hbcvdata")],["saveToken",(e,a,t)=>{a?.tab?.id&&(K=a.tab.id),C.token=e.token,C.currentUserSession=e.userSession||C.currentUserSession,e.patientIdFromToken&&(C.patientIdFromToken=e.patientIdFromToken,C.patientName=e.patientName||e.patientIdFromToken),console.log(`[NHITW Clinic] saveToken from tab ${a?.tab?.id??"?"} - Name: ${F(e.patientName,1,1)}, ID: ${F(e.patientIdFromToken,4,3)}`),ue(),t({status:"token_saved"})}],["checkHostStatus",(e,a,t)=>{try{let n=chrome.runtime.connectNative("com.nhitw.host"),i=!1;n.onMessage.addListener(()=>{i=!0,n.disconnect(),t({success:!0,available:!0})}),n.onDisconnect.addListener(()=>{i||t({success:!0,available:!1})}),n.postMessage({action:"read_manifest"})}catch(n){t({success:!0,available:!1,error:n.message})}}]]);function A(e){return function(a,t,n){let i=R[e];if(!i){n({status:"error",error:`Invalid data type: ${e}`});return}C[i]=a.data,C.currentUserSession=a.userSession||C.currentUserSession;let o={[i]:a.data,currentUserSession:a.userSession||C.currentUserSession};chrome.storage.local.set(o,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),ue(),a.data&&a.data.rObject&&Array.isArray(a.data.rObject)?n({status:"saved",recordCount:a.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,a,t)=>{e.userSession&&e.userSession!==C.currentUserSession&&(z(),C.currentUserSession=e.userSession);let n=wt.get(e.action);return n?(n(e,a,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,a,t)=>{a.url&&(a.url.includes("medcloud2.nhi.gov.tw/imu/login")||a.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(C).forEach(n=>{C[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
