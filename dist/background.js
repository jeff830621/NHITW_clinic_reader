(()=>{var de="com.nhitw.host";function ue(e){return new Promise((a,t)=>{try{let n=chrome.runtime.connectNative(de),r=!1;n.onMessage.addListener(o=>{r=!0,n.disconnect(),o.success?a(o):t(new Error(o.message||o.error||"Unknown host error"))}),n.onDisconnect.addListener(()=>{if(!r){let o=chrome.runtime.lastError?.message||"Native host disconnected";t(new Error(o))}}),n.postMessage(e)}catch(n){t(new Error(`Native messaging unavailable: ${n.message}`))}})}async function F(e,a,t,n){return ue({action:"write_html",filename:e,content:a,date:t||void 0,session:n||void 0})}var W={"09001C":{min:0,max:200,description:"\u7E3D\u81BD\u56FA\u9187 >200 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"09004C":{min:0,max:150,description:"\u4E09\u9178\u7518\u6CB9\u8102 >150 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"09043C":{min:40,max:null,description:"\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187 <40 mg/dL \u70BA\u7570\u5E38(\u4F4E)"},"09044C":{min:0,max:100,description:"\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187 >100 mg/dL \u70BA\u7570\u5E38(\u9AD8)"},"12015C":{min:0,max:1,description:"CRP >1 \u70BA\u7570\u5E38(\u9AD8)"}},pe=e=>W.hasOwnProperty(e),K=e=>pe(e)?W[e]:null;var fe=e=>e?/\[0*\.?0*\]\[0*\.?0*\]/.test(e):!1,L=e=>typeof e=="string"?parseFloat(e):e,ge=(e,a)=>!e||!a?!1:a.includes("\u9580\u8AFE")&&new Set(["09001C","09004C","09044C","09043C","12015C"]).has(e),me=new Map([["40",{value:40,display:">40"}],["50",{value:50,display:">50"}]]),he=e=>{if(!e)return null;for(let[a,{value:t}]of me.entries())if(e.includes(a))return{min:t,max:null};return null};var be=new Map([["customRange",(e,a,t)=>ge(a,t)?K(a):null],["hdlCholesterol",(e,a)=>a==="09043C"?he(e):null],["zeroRange",e=>(fe(e),null)],["noValueRange",e=>null],["singleBracketLessThan",e=>{let a=e.match(/\[<\s*(\d*\.?\d+)(?:\s*\w+\/?\w*)?\]\[\]/);if(a){let t=parseFloat(a[1]);if(!isNaN(t))return{min:null,max:t}}return null}],["specialNoMin",e=>{let a=/\[(無|NA|-|)\]\[(＜|<)?(\d*\.?\d+)\]/,t=e.match(a);if(t){let n=t[3];if(n)return{min:null,max:parseFloat(n)}}return null}],["singleBracketRange",e=>{let a=e.match(/\[(\d*\.?\d+)~(\d*\.?\d+)\](\[\])?/);if(a){let t=L(a[1]),n=L(a[2]);if(!isNaN(t)&&!isNaN(n))return{min:t,max:n}}return null}],["doubleBracketRange",e=>{let a=e.match(/\[([^[\]]*)\]\[([^[\]]*)\]/);if(a){let t=a[1].trim(),n=a[2].trim(),r=null;if(n&&n!=="")if(n.includes("\uFF1C")||n.includes("<")){let i=n.match(/\d*\.?\d+/);i&&i[0]&&(r=L(i[0]))}else{let i=n.match(/(\d*\.?\d+)/);i&&(r=L(i[0]))}let o=null;if(t&&(t.includes("\uFF1C")||t.includes("<"))){let i=t.match(/\d*\.?\d+/);i&&i[0]&&(r=L(i[0]),o=null)}else if(t&&!["\u7121","NA","-",""].includes(t)){let i=t.match(/(\d*\.?\d+)/);i&&(o=L(i[0]))}if(o!==null||r!==null)return{min:o,max:r}}return null}],["directLessThan",e=>{let a=e.match(/\[<\s*(\d*\.?\d+)(?:\s*\w+\/?\w*)?\]/);if(a){let t=parseFloat(a[1]);if(!isNaN(t))return{min:null,max:t}}return null}],["singleValue",e=>{let a=e.match(/\[(\d*\.?\d+)\]/);if(a){let t=L(a[1]);if(!isNaN(t))return{min:t,max:null}}return null}],["noReference",e=>(e.includes("[\u7121]")||e==="[0][]",null)],["qualitativeTest",e=>(e.match(/\[0\]\[9999\]/),null)]]),q=(e,a=null,t=null)=>{if(!e)return null;let n=e.trim();for(let[r,o]of be){let i=o(n,a,t);if(i!==null)return i}return null};function Y(e,a,t,n={}){let o=ve(new Date),i=Ge(t),s=je(t),c=Ke(t,n),f=De(t,{acu:i,cancer:s,asthma:c}),b=He(t.labData?.rObject,n),m=tt(t.medicationData?.rObject,100),p=nt(t.medicationData?.rObject,100),u=at(t.chinesemedData?.rObject),h=ot(t.imagingData?.rObject),x=st(t.allergyData?.rObject),$=it(t.surgeryData?.rObject),_=ct(t.dischargeData?.rObject),y=pt(t.adultHealthCheckData),g=ft(t.cancerScreeningData),D=gt(t.hbcvData),v=Te(t.acupunctureData),N=Ue(t),A=We(t),k=qe(t,n),O=Je(t,n),le=Ce(n);return mt(e,a,o,{diagnosisHtml:f,labPivotHtml:b,westMedHtml:m,otherWestMedHtml:p,chineseMedHtml:u,imagingHtml:h,allergyHtml:x,surgeryHtml:$,dischargeHtml:_,adultHealthHtml:y,cancerScreeningHtml:g,hbcvHtml:D,acupunctureProbeHtml:v,acuBadgeHtml:N,cancerBadgeHtml:A,asthmaBadgeHtml:k,ckdBadgeHtml:O,patientMetaLine:le})}function Ce(e){if(!e)return"";let a=[];if(typeof e.age=="number"&&e.age>=0&&a.push(`${e.age}\u6B72`),e.sex){let t=String(e.sex).trim().toUpperCase();t==="F"||t==="FEMALE"||t==="2"||t==="\u5973"?a.push("\u5973"):(t==="M"||t==="MALE"||t==="1"||t==="\u7537")&&a.push("\u7537")}if(e.birthday&&String(e.birthday).length===7){let t=String(e.birthday),n=parseInt(t.substring(0,3),10),r=t.substring(3,5),o=t.substring(5,7);isNaN(n)||a.push(`\u6C11${n}/${r}/${o}`)}return a.join(" ")}function J(e,a){let t=a||new Date,n=t.getFullYear(),r=String(t.getMonth()+1).padStart(2,"0"),o=String(t.getDate()).padStart(2,"0"),i=String(t.getHours()).padStart(2,"0"),s=String(t.getMinutes()).padStart(2,"0"),c=String(t.getSeconds()).padStart(2,"0");return`${e.replace(/[\\/:*?"<>|]/g,"_").replace(/\s+/g,"_").replace(/^\.+/,"")||"unknown"}_${n}${r}${o}_${i}${s}${c}.html`}function ve(e){return`${e.getFullYear()}/${String(e.getMonth()+1).padStart(2,"0")}/${String(e.getDate()).padStart(2,"0")} ${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`}function l(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"):""}function S(e){return e?e.includes("T")?e.split("T")[0]:e.replace(/\//g,"-"):""}function I(e){let a=S(e);if(!a)return"";let t=a.split("-");return t.length===3?`${t[1]}/${t[2]}`:a}function ye(e){let a=S(e);if(!a)return"";let t=a.split("-");return t.length===3?`${t[0]}/${t[1]}/${t[2]}`:a}function xe(e){let a=S(e);if(!a)return"";let t=a.split("-");if(t.length===3){let n=parseInt(t[0],10);if(!isNaN(n))return`${n-1911}/${t[1]}/${t[2]}`}return a}function T(e){return e?e.split(";")[0].trim():""}function De(e,a={}){let n=a.acu||new Set,r=a.cancer||new Set,o=a.asthma||new Set,i=m=>{let p=String(m||"").trim(),u=[];return n.has(p)&&u.push("diag-acu-match"),r.has(p)&&u.push("diag-cancer-match"),o.has(p)&&u.push("diag-asthma-match"),u.join(" ")},s={};function c(m,p,u,h,x){if(m)for(let $ of m){let _=$[p]||"";if(!E(_,180))continue;let y=$[h]||"",g=$[x]||"";if(!y)continue;let D=($[u]||"").split(";"),v=D[0]?.trim()||"",N=D[1]?.trim()||"\u9580\u8A3A",A=S(_);s[y]||(s[y]={code:y,name:g,visits:new Set,lastDate:"",lastHosp:"",lastType:""});let k=s[y];k.visits.add(`${A}|${v}`),!k.name&&g&&(k.name=g),A>k.lastDate&&(k.lastDate=A,k.lastHosp=v,k.lastType=N)}}c(e.medicationData?.rObject,"PER_DATE","HOSP_NAME","ICD_CODE","ICD_NAME");let d=e.medicationData?.rObject||[];d.length>0&&!d[0].PER_DATE&&c(d,"drug_date","hosp","icd_code","icd_cname"),c(e.chinesemedData?.rObject,"func_date","hosp","icd_code","icd_cname");for(let m of Object.values(s))m.count=m.visits.size;let f=Object.values(s).sort((m,p)=>p.lastDate!==m.lastDate?p.lastDate.localeCompare(m.lastDate):p.count-m.count);if(f.length===0)return'<p class="empty">\u7121\u8A3A\u65B7\u7D00\u9304</p>';let b="";for(let m of f){let p="";m.lastType.includes("\u6025")?p='<span class="diag-type emergency">\u6025</span>':m.lastType.includes("\u4F4F")&&(p='<span class="diag-type inpatient">\u4F4F</span>');let h=[m.lastDate?m.lastDate.replace(/-/g,"/"):"",m.lastHosp].filter(Boolean).join(" ");b+=`<div class="diag-item ${i(m.code)}"><div class="diag-line1">${p}<span class="diag-code">${l(m.code)}</span> ${l(m.name)}<span class="diag-count">${m.count}\u6B21</span></div><div class="diag-line2">${l(h)}</div></div>`}return b}var $e=[["WBC",["wbc","\u767D\u8840\u7403","\u767D\u8840\u7403\u8A08\u6578","white blood cell","white blood cell count","wbc count"]],["RBC",["rbc","\u7D05\u8840\u7403\u8A08\u6578","\u7D05\u8840\u7403","red blood cell","red blood cell count","rbc count"]],["Hb",["hb","hgb","hemoglobin","\u8840\u8272\u7D20","\u8840\u7D05\u7D20","\u8840\u7D05\u86CB\u767D"]],["HCT",["hct","hematocrit","\u8840\u7403\u6BD4\u5BB9\u503C\u6E2C\u5B9A","\u8840\u5BB9\u6BD4","\u8840\u7403\u5BB9\u7A4D\u6BD4","\u8840\u6BD4\u5BB9","\u8840\u7403\u6BD4\u5BB9","\u8840\u5BB9\u7A4D\u6BD4"]],["MCV",["mcv","\u7D05\u8840\u7403\u5E73\u5747\u5BB9\u7A4D","\u5E73\u5747\u7D05\u8840\u7403\u5BB9\u7A4D","\u5E73\u5747\u8840\u7403\u5BB9\u7A4D"]],["MCHC",["mchc","\u7D05\u8840\u7403\u8272\u7D20\u6FC3\u5EA6","\u5E73\u5747\u7D05\u8840\u7403\u8840\u8272\u7D20\u6FC3\u5EA6"]],["MCH",["mch","\u7D05\u8840\u7403\u8272\u7D20","\u5E73\u5747\u7D05\u8840\u7403\u8840\u8272\u7D20"]],["RDW",["rdw","rdw-cv","rdw-sd","\u7D05\u8840\u7403\u5206\u4F48\u8B8A\u7570\u6578","\u7D05\u8840\u7403\u5206\u5E03\u5BEC\u5EA6","\u7D05\u8840\u7403\u5206\u5E03\u8B8A\u7570\u4FC2\u6578","\u7D05\u8840\u7403\u5206\u4F48\u5BEC\u5EA6"]],["Platelet",["platelet","plt","\u8840\u5C0F\u677F","\u8840\u5C0F\u677F\u8A08\u6578"]],["MPV",["mpv","\u5E73\u5747\u8840\u5C0F\u677F\u5BB9\u7A4D"]],["Neutrophil",["neutrophil","neutrophil-segmented","segment","seg","\u55DC\u4E2D\u6027\u767D\u8840\u7403","\u4E2D\u6027\u7403","\u7BC0\u72C0\u6838\u55DC\u4E2D\u6027\u767D\u8840\u7403"]],["Lymphocyte",["lymphocyte","lymph","\u6DCB\u5DF4\u7403"]],["Monocyte",["monocyte","mono","\u55AE\u6838\u7403"]],["Eosinophil",["eosinophil","eo","\u55DC\u4F0A\u7D05\u6027\u767D\u8840\u7403","\u55DC\u9178\u6027\u7403","\u55DC\u4F0A\u7D05\u767D\u8840\u7403"]],["Basophil",["basophil","baso","\u55DC\u9E7C\u6027\u767D\u8840\u7403"]],["Glucose",["glucose","sugar","ac sugar","blood sugar","\u8461\u8404\u7CD6","\u8840\u7CD6","\u98EF\u524D\u8840\u7CD6","\u7A7A\u8179\u8840\u7CD6","\u98EF\u524D\u8840\u7CD6(ac)","glucose ac","glucose (ac)","glucose(ac)","glu.(ac)","glu (ac)","glu(ac)","glu ac","ac glucose"]],["Amylase",["amylase","amylase(b)","\u8840\u6DB2\u6FB1\u7C89\u8122","\u6FB1\u7C89\u9176","\u6FB1\u7C89\u8122"]],["Lipase",["lipase","\u89E3\u8102\u8122","\u8102\u80AA\u9176","\u8102\u89E3\u9176"]],["ALK-P",["alk-p","alkp","alp","\u9E7C\u6027\u78F7\u9178\u8122","\u9E7C\u6027\u78F7\u9178\u9176","\u9E7C\u6027\u78F7\u9178\u9175\u7D20"]],["T-Bil",["total bilirubin","t-bil","tbil","\u7E3D\u81BD\u7D05\u7D20","\u81BD\u7D05\u7D20\u7E3D\u91CF","\u7E3D\u81BD\u8272\u7D20"]],["D-Bil",["direct bilirubin","d-bil","dbil","\u76F4\u63A5\u81BD\u7D05\u7D20","\u76F4\u63A5\u81BD\u8272\u7D20"]],["BUN",["bun","\u5C3F\u7D20\u6C2E","\u8840\u4E2D\u5C3F\u7D20\u6C2E","\u5C3F\u7D20\u6C2E(bun)"]],["Cr",["cr","creatinine","\u808C\u9178\u9150","\u808C\u9150","\u8840\u6E05\u808C\u9178\u9150","\u808C\u9178\u809D"]],["Na",["na","sodium","\u9209"]],["K",["k","potassium","\u9240"]],["Cl",["cl","chloride","\u6C2F"]],["GOT",["got","ast","sgot","s.g.o.t","s.g.o.t (ast)","s.g.o.t. (ast)","\u5929\u9580\u51AC\u80FA\u9178\u8F49\u80FA\u9176","\u5929\u9580\u51AC\u80FA\u9178\u80FA\u57FA\u8F49\u79FB\u9176"]],["GPT",["gpt","alt","sgpt","s.g.p.t","s.g.p.t (alt)","s.g.p.t. (alt)","\u4E19\u80FA\u9178\u8F49\u80FA\u9176","\u4E19\u80FA\u9178\u80FA\u57FA\u8F49\u79FB\u9176"]],["CRP",["crp","c\u53CD\u61C9\u86CB\u767D","c-\u53CD\u61C9\u86CB\u767D","c \u53CD\u61C9\u86CB\u767D","c-reactive protein","crp, c-reactive protein","crp\uFF0Cc-reactive protein"]],["Chol",["chol","cholesterol","total cholesterol","cho","t-cho","t-chol","\u81BD\u56FA\u9187","\u7E3D\u81BD\u56FA\u9187","cholesterol(\u81BD\u56FA\u9187)"]],["TG",["tg","tg, triglycerides","triglyceride","triglycerides","t.g.","\u4E09\u9178\u7518\u6CB9\u8102","\u4E09\u9178\u7518\u6CB9\u916F","tg (\u4E09\u9178\u7518\u6CB9\u8102)"]],["HDL",["hdl","hdl-cholesterol","hdl cholesterol","hdl-c","hdl chol","hdl-cholesterol (\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187)","\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187","\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D","hdl(\u9AD8\u5BC6\u5EA6\u8102\u86CB\u767D)"]],["LDL",["ldl","ldl-cholesterol","ldl cholesterol","ldl-c","ldl chol","ldl-cholesterol (\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187)","\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D\u81BD\u56FA\u9187","\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D","ldl(\u4F4E\u5BC6\u5EA6\u8102\u86CB\u767D)"]]];function Z(e){return String(e||"").toLowerCase().replace(/ｃ/g,"c").replace(/[－–—]/g,"-").replace(/（/g,"(").replace(/）/g,")").replace(/\s+/g," ").trim()}var V=(()=>{let e=new Map;for(let[a,t]of $e)for(let n of t)e.set(Z(n),a);return e})(),_e=/\burine\b|\burinary\b|尿液|\(\s*尿\s*\)|（\s*尿\s*）|[、，]\s*尿/i,Se=new Set(["06012C"]),we=/\(\s*\d*\s*[+\-](?:\s*\/\s*[+\-])?\s*\)/;function Ae(e){let a=String(e??"").trim();return a===""?!1:we.test(a)||!/\d/.test(a)}function ke(e){if(!e)return null;let a=String(e),t=a.match(/\[\s*(-?\d+\.?\d*)\s*\]\s*\[\s*(-?\d+\.?\d*)\s*\]/);if(t){let o=parseFloat(t[2]);return isNaN(o)?null:o}let n=a.match(/(-?\d+\.?\d*)\s*[-~–]\s*(-?\d+\.?\d*)/);if(n){let o=parseFloat(n[2]);return isNaN(o)?null:o}let r=a.match(/[<≦＜]\s*(-?\d+\.?\d*)/);if(r){let o=parseFloat(r[1]);return isNaN(o)?null:o}return null}function P(e){let a=e.assay_item_name||e.order_name||"",t=(e.order_code||"").trim();if(_e.test(a))return(a||t||"?").trim();let n=Z(a),r=V.get(n);if(!r){let o=n.replace(/\(.*?\)/g,"").trim();o&&(r=V.get(o))}if(r==="Cr"){let o=parseFloat(e.assay_value),i=ke(e.consult_value),s=!isNaN(o)&&o>15,c=i!=null&&i>5;if(s||c)return console.warn(`[NHITW Clinic] '${a}' (${t}) val=${e.assay_value} ref=${e.consult_value} \u2014 not serum Cr, isolating`),`${a} [${t}|ref ${e.consult_value||"?"}]`}return r==="Glucose"&&(Se.has(t)||Ae(e.assay_value))?(console.warn(`[NHITW Clinic] '${a}' (${t}) val='${e.assay_value}' \u2014 urine glucose, isolating to \u5C3F\u7CD6`),"\u5C3F\u7CD6"):r||(a||t||"?").trim()}var Ne={Hb:"g/dL",WBC:"/uL",RBC:"10^6/uL",Platelet:"10^3/uL",HCT:"%",MCV:"fL",MCH:"pg",MCHC:"g/dL",RDW:"%",MPV:"fL",Neutrophil:"%",Lymphocyte:"%",Monocyte:"%",Eosinophil:"%",Basophil:"%",BUN:"mg/dL",Cr:"mg/dL","U.A":"mg/dL",Glucose:"mg/dL",HbA1c:"%",Alb:"g/dL","T-Bil":"mg/dL","D-Bil":"mg/dL",GOT:"U/L",GPT:"U/L","ALK-P":"U/L",Amylase:"U/L",Lipase:"U/L",Chol:"mg/dL",TG:"mg/dL",HDL:"mg/dL",LDL:"mg/dL",Na:"mmol/L",K:"mmol/L",Cl:"mmol/L",CRP:"mg/dL",GFR:"mL/min",UPCR:"mg/g",UACR:"mg/g"},Le=[{orderCode:"08011C",name:"Hb",enabled:!0,subItem:"Hb"},{orderCode:"09002C",name:"BUN",enabled:!0},{orderCode:"09015C",name:"Cr",enabled:!0,subItem:"Cr"},{orderCode:"09015C",name:"GFR",enabled:!0,subItem:"GFR"},{orderCode:"09040C",name:"UPCR",enabled:!0},{orderCode:"12111C",name:"UACR",enabled:!0},{orderCode:"09038C",name:"Alb",enabled:!0},{orderCode:"09005C",name:"Glucose",enabled:!0},{orderCode:"09006C",name:"HbA1c",enabled:!0},{orderCode:"09001C",name:"Chol",enabled:!0},{orderCode:"09004C",name:"TG",enabled:!0},{orderCode:"09043C",name:"HDL",enabled:!0},{orderCode:"09044C",name:"LDL",enabled:!0},{orderCode:"09021C",name:"Na",enabled:!0},{orderCode:"09022C",name:"K",enabled:!0},{orderCode:"09013C",name:"U.A",enabled:!0},{orderCode:"09025C",name:"GOT",enabled:!0},{orderCode:"09026C",name:"GPT",enabled:!0}];function He(e,a={}){if(!e||e.length===0)return'<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>';let t=180,n=Ie(e),r=e.filter(u=>{let h=u.assay_value;if(!h||String(h).trim()===""||String(h).trim()==="***")return!1;let x=u.real_inspect_date||u.recipe_date||"";return E(x,t)});if(r.length===0)return`<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>${n}`;let o=new Set,i={},s=0;for(let u of r){let h=S(u.real_inspect_date||u.recipe_date||"");if(!h)continue;let x=String(u.assay_value).trim(),$=u.consult_value||"",_=u.order_code||"",y=(u.unit_data||"").trim(),g=P(u);o.add(h),i[g]||(i[g]={name:g,code:_,unit:"",dates:{},order:s++}),!i[g].unit&&y&&(i[g].unit=y),!i[g].code&&_&&(i[g].code=_);let D={value:x,dir:G(x,$,_),ref:Ee($,_)},v=i[g].dates[h];if(!v)i[g].dates[h]=D;else{let N=String(v.value||"").trim(),A=String(D.value||"").trim();N?!A||N===A||(!v.dir&&D.dir?(D.alternates=[N,...(v.alternates||[]).filter(O=>O!==A)],i[g].dates[h]=D):(v.alternates=v.alternates||[],v.alternates.includes(A)||v.alternates.push(A))):i[g].dates[h]=D}}if(i.Cr&&a?.age&&a?.sex){let u=a.age,h=Q(a.sex),x={name:"eGFR(\u8A08\u7B97)",code:"",unit:"mL/min/1.73m\xB2",dates:{},order:-.5,synthetic:"egfr"};for(let[$,_]of Object.entries(i.Cr.dates)){let y=parseFloat(_.value);if(!isNaN(y)&&y>0){if(y>15){console.warn(`[NHITW Clinic] Skipping eGFR for ${$} \u2014 Cr=${y} not plausible as serum`);continue}let g=X(y,u,h);if(g!=null){let D=ee(g);x.dates[$]={value:g.toFixed(1),egfr:g,stage:D,ref:"CKD-EPI 2021 \u226560 \u70BA\u6B63\u5E38"}}}}Object.keys(x.dates).length>0&&(i["eGFR(\u8A08\u7B97)"]=x)}let c=[...o].sort((u,h)=>h.localeCompare(u)),d=new Map;Le.forEach((u,h)=>{d.has(u.name)||d.set(u.name,h)});let f=d.get("Cr");f!=null&&d.set("eGFR(\u8A08\u7B97)",f+.5);let b=Object.keys(i).sort((u,h)=>{let x=d.has(u)?d.get(u):1e3+i[u].order,$=d.has(h)?d.get(h):1e3+i[h].order;return x-$});if(c.length===0||b.length===0)return`<p class="empty">\u7121\u6AA2\u9A57\u8CC7\u6599</p>${n}`;let m='<tr><th class="lab-item-col">\u9805\u76EE</th>';for(let u of c)m+=`<th class="lab-date-col" data-short="${l(xe(u))}" onclick="copyLabColumn(this)" title="\u9EDE\u64CA\u8907\u88FD\u6B64\u6B21\u62BD\u8840\u6578\u64DA(\u6C11\u570B\u5E74\u683C\u5F0F)">${l(ye(u))}</th>`;m+="</tr>";let p="";for(let u of b){let h=i[u],x=h.unit||Ne[u]||"",$=x?`<span class="lab-unit">${l(x)}</span>`:"",_=u.replace(/\(計算\)/g,"").trim()||u;p+=`<tr data-item="${l(_)}"><td class="lab-item-name" title="\u9EDE\u64CA\u9078\u53D6(\u9AD8\u4EAE\u5217)\u3002\u9EDE\u65E5\u671F\u6B04\u8907\u88FD\u6642\uFF0C\u82E5\u6709\u9078\u53D6\u5247\u53EA\u8907\u88FD\u9078\u7684\uFF1B${l(h.code)}" onclick="toggleLabRow(this)">${l(u)}${$}</td>`;for(let y of c){let g=h.dates[y];if(g)if(h.synthetic==="egfr"&&g.stage){let D=Me(g.stage),v=`${g.stage} \xB7 CKD-EPI 2021`;p+=`<td style="${D}" title="${l(v)}" data-val="${l(g.value)}">${l(g.value)}<span class="ckd-stage">${l(g.stage)}</span></td>`}else{let D=g.dir==="high"?"lab-high":g.dir==="low"?"lab-low":"",v=[];g.ref&&v.push(`\u53C3\u8003\u503C ${g.ref}`),g.alternates?.length&&v.push(`\u540C\u65E5\u53E6: ${g.alternates.join(" / ")}`);let N=g.alternates?.length?`<span class="lab-alt"> /${l(g.alternates.join(" /"))}</span>`:"";p+=`<td class="${D}" title="${l(v.join(" \xB7 "))}" data-val="${l(g.value)}">${l(g.value)}${N}</td>`}else p+='<td class="no-data">-</td>'}p+="</tr>"}return`<div class="lab-toolbar"><span class="lab-tool-hint">\u9EDE\u9805\u76EE\u540D\u7A31\u53EF\u9078\u53D6</span><a class="lab-tool-btn" onclick="selectAllLab(this)">\u5168\u9078</a><span class="lab-tool-sep">\uFF5C</span><a class="lab-tool-btn" onclick="clearLabSelection(this)">\u6E05\u7A7A</a><span class="lab-sel-count">\u672A\u9078\u53D6</span></div><div class="lab-scroll"><table class="lab-pivot"><thead>${m}</thead><tbody>${p}</tbody></table></div>
  <div class="tracking-note">${t} \u5929\u5167 \xB7 ${b.length} \u9805 \xD7 ${c.length} \u6B21</div>${n}`}function Ie(e){if(!e||e.length===0)return"";try{let a=new Set;for(let o of e)for(let i of Object.keys(o))a.add(i);let t=e.filter(o=>{let i=`${o.assay_item_name||""} ${o.order_name||""} ${o.assay_tp_cname||""}`;return/creatinine|\bcr\b|e?gfr|urine|尿|肌酐|肌酸酐|腎絲球/i.test(i)||o.order_code==="09015C"}),n={generated:new Date().toISOString(),recordCount:e.length,allFieldKeys:[...a].sort(),sampleRecord:e[0],creatinineRelatedRecords:t};return`
<!-- NHITW-DEBUG-START
${JSON.stringify(n,null,2).replace(/--+/g,o=>o.split("").join("\u200B"))}
NHITW-DEBUG-END -->
`}catch(a){return`
<!-- NHITW-DEBUG error: ${String(a&&a.message||a).replace(/--+/g,"-")} -->
`}}function Te(e){if(!e)return"";try{let a=e.rObject||e.robject||e,t=Array.isArray(a)?a.length:0,n=new Set;if(Array.isArray(a)){for(let i of a.slice(0,200))if(i&&typeof i=="object")for(let s of Object.keys(i))n.add(s)}let r={generated:new Date().toISOString(),endpoint:"imue0100s02 (\u4E2D\u91AB\u8655\u7F6E / \u91DD\u7078\u6CBB\u7642)",shape:Array.isArray(a)?"array":typeof a,recordCount:t,allFieldKeys:[...n].sort(),firstFiveRecords:Array.isArray(a)?a.slice(0,5):null,rawIfNonArray:Array.isArray(a)?void 0:e};return`
<!-- NHITW-ACU-PROBE-START
${JSON.stringify(r,null,2).replace(/--+/g,i=>i.split("").join("\u200B"))}
NHITW-ACU-PROBE-END -->
`}catch(a){return`
<!-- NHITW-ACU-PROBE error: ${String(a&&a.message||a).replace(/--+/g,"-")} -->
`}}function Q(e){let a=String(e||"").trim().toUpperCase();return a==="F"||a==="FEMALE"||a==="2"||a==="\u5973"}function X(e,a,t){if(!(e>0)||!(a>0))return null;let r=e/(t?.7:.9),o=Math.min(r,1),i=Math.max(r,1);return t?142*Math.pow(o,-.241)*Math.pow(i,-1.2)*Math.pow(.9938,a)*1.012:142*Math.pow(o,-.302)*Math.pow(i,-1.2)*Math.pow(.9938,a)}function ee(e){return e>=90?"\u6B63\u5E38":e>=60?"G2":e>=45?"G3a":e>=30?"G3b":e>=15?"G4":"G5"}function Me(e){switch(e){case"\u6B63\u5E38":return"color:#2e7d32;font-weight:bold";case"G3a":return"color:#f57c00;font-weight:bold";case"G3b":return"color:#e65100;font-weight:bold";case"G4":return"color:#d32f2f;font-weight:bold";case"G5":return"color:#922;font-weight:bold";default:return"font-weight:bold"}}function Ee(e,a){let t=te(e,a);return t?t.min!=null&&t.max!=null?`${t.min}-${t.max}`:t.max!=null?`<${t.max}`:t.min!=null?`>${t.min}`:"":""}function te(e,a){let n=String(e||"").match(/\[\s*(-?\d*\.?\d+)\s*[-~]\s*(-?\d*\.?\d+)\s*\]/);if(n){let r=parseFloat(n[1]),o=parseFloat(n[2]);if(!isNaN(r)&&!isNaN(o))return{min:r,max:o}}try{return q(e,a||null,null)}catch{return null}}function G(e,a,t){if(e==null||e===""||e==="***")return null;let n=parseFloat(e);if(isNaN(n))return null;let r=te(a,t);return r?r.max!=null&&n>r.max?"high":r.min!=null&&n<r.min?"low":null:null}var Be=["G43","G50","G51","G52","G54","G61","G62","G63","G65","G90","M13.0","M15","M20","M21","M66","H02","H04","H05","H10","H20","H25","H26","H52"],Re=["A15","B01","B02","B05","B06","B20","B97.2","B97.3","D65","D66","D67","D68","D69","D70","D82","D83","D84","E04","E05","E06","E10","E11","E13","E15","E28","F90","F95","I20","I21","I22","I23","I24","I25","I26","I27","I28","I42","I50","I71","I73","I74","I80","I82","I89","J44","J45","J93","J96","J98","K72","K74","K80","L10","L11","L12","L40","L51","L52","L89","L94","L97","M33","M34","M35","N18","N19","R64"],Oe=["A80","D32","D33","D48","D49","F02","F03","F04","F05","F09","F20","F21","F22","F23","F24","F25","F30","F31","F32","F33","F34","F35","F36","F37","F38","F39","F80","F82","F84","G11","G12","G20","G21","G35","G36","G40","G45","G46","G70","G71","G80","G81","G82","G83","G91","G93","G94","H30","H31","H33","H34","H35","H36","H40","H42","H43","H46","H47","H49","H50","H51","H53","H54","H55","I60","I61","I62","I63","I65","I66","I67","I69","M45","M62.3","M99","P91","Q11","Q12","Q13","Q14","Q15","S01.9","S04","S06.3","S06.4","S06.5","S06.6","S14","S22","S24","S32","S34","S44","S54","S64","S74","S84","S94"];function H(e,a){if(!e||!a)return!1;let t=String(e).replace(/\./g,"").toUpperCase().trim(),n=String(a).replace(/\./g,"").toUpperCase().trim();return!t||!n?!1:t===n||t.startsWith(n)}function Fe(e){let a=e&&String(e).toUpperCase().replace(/\./g,"").match(/^C(\d{2})/);if(!a)return!1;let t=parseInt(a[1],10);return t>=0&&t<=96}function Pe(e){let a=e&&String(e).toUpperCase().replace(/\./g,"").match(/^O(\d{2})/);if(!a)return!1;let t=parseInt(a[1],10);return t>=10&&t<=16||t>=20&&t<=29}function M(e){let a=new Set,t=["ICD_CODE","icd_code","ICD_CODE_1","icd_code_1","ICD_CODE_2","icd_code_2","ICD_CODE_3","icd_code_3","ICD_CODE_4","icd_code_4","ICD_CODE_5","icd_code_5","icdCode","icdcode","ICD10_CODE","icd10_code","main_icd","sub_icd","MAIN_ICD","SUB_ICD","DIAG_CODE","diag_code"],n=o=>{if(Array.isArray(o)){for(let i of o)if(!(!i||typeof i!="object"))for(let s of t){let c=i[s];c&&a.add(String(c).trim())}}};n(e.medicationData?.rObject),n(e.chinesemedData?.rObject),n(e.dischargeData?.rObject),n(e.surgeryData?.rObject),n(e.patientSummaryData?.rObject);let r=Array.from(a).filter(Boolean);return console.log("[NHITW Clinic] Collected ICD codes for classification:",r),r}function ne(e){let a=new Set,t=new Set,n=new Set;for(let r of e)(Fe(r)||Oe.some(o=>H(r,o)))&&a.add(r),Be.some(o=>H(r,o))&&t.add(r),(Pe(r)||Re.some(o=>H(r,o)))&&n.add(r);return{high:[...a],moderate:[...t],special:[...n]}}function ae(e){return e.high.length>0||e.moderate.length>0&&e.special.length>0?"high":e.moderate.length>0||e.special.length>0?"moderate":null}function Ge(e){let a=M(e),t=ne(a);if(!ae(t))return new Set;let r=new Set;return t.high.forEach(o=>r.add(o)),t.moderate.forEach(o=>r.add(o)),t.special.forEach(o=>r.add(o)),r}function je(e){let a=M(e),t=re(a),n=new Set;for(let r of t)for(let o of r.hits)n.add(o);return n}function Ue(e){let a=M(e),t=ne(a),n=ae(t);if(console.log("[NHITW Clinic] Acupuncture matches:",t,"level:",n),!n)return"";let r,o;n==="high"?(r="\u26A1 \u9AD8\u5EA6\u8907\u96DC\u91DD\u7078",t.high.length>0?o=t.high:o=[...t.moderate.map(d=>d+"(\u4E2D)"),...t.special.map(d=>d+"(\u7279)")]):(r="\u{1F489} \u4E2D\u5EA6\u8907\u96DC\u91DD\u7078",o=[...t.moderate,...t.special.map(d=>d+"(\u7279)")]);let i=o.slice(0,12).join(", "),s=o.length>12?`\u2026 (+${o.length-12})`:"",c=`\u7B26\u5408 ICD: ${i}${s}`;return`<span class="acu-badge acu-${n}" title="${l(c)}">${r}</span>`}var ze=[{name:"\u4E73\u764C",primary:["C50","C79.81"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C50","Z85.3"]},{name:"\u809D\u764C",primary:["C22","C23","C24"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.3","C79.5","C79.7","Z94.4"],secondary:["C22","C23","C24","Z85.05"]},{name:"\u80BA\u764C",primary:["C33","C34"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.3","C79.5","C79.6","C79.7","Z94.2"],secondary:["C33","C34","Z85.1"]},{name:"\u5927\u8178\u764C",primary:["C18","C19","C20","C21"],mets:["C77","C78.0","C78.1","C78.2","C78.4","C78.5","C78.6","C78.7","C78.8","C79.0","C79.3","C79.5","C79.6","C79.7"],secondary:["C18","C19","C20","C21","Z85.04"]},{name:"\u80C3\u764C",primary:["C16","C49.A1","C49.A2"],mets:["C77","C78.0","C78.1","C78.2","C78.3","C78.7","C79.2","C79.3","C79.5","C79.6","C79.7"],secondary:["C16","C49.A1","C49.A2","Z85.028"]},{name:"\u651D\u8B77\u817A\u764C",primary:["C61"]},{name:"\u53E3\u8154\u764C",primary:["C01","C02","C03","C04","C05","C06","C07","C08","C09","C10"]},{name:"\u5B50\u5BAE\u9838\u764C",primary:["C53"]},{name:"\u5B50\u5BAE\u9AD4\u764C",primary:["C54"]},{name:"\u7532\u72C0\u817A\u764C",primary:["C73"]}];function re(e){let a=[];for(let t of ze){let n=new Set,r=!1;for(let o of e)t.primary.some(i=>H(o,i))&&(n.add(o),r=!0);if(t.mets&&t.secondary){let o=e.filter(s=>t.mets.some(c=>H(s,c))),i=e.filter(s=>t.secondary.some(c=>H(s,c)));o.length>0&&i.length>0&&(o.forEach(s=>n.add(s)),i.forEach(s=>n.add(s)),r=!0)}r&&a.push({name:t.name,hits:[...n]})}return a}function We(e){let a=M(e),t=re(a);if(console.log("[NHITW Clinic] Cancer-care detected:",t),t.length===0)return"";let n=t.map(c=>c.name).join("\u3001"),r=[...new Set(t.flatMap(c=>c.hits))],o=r.slice(0,15).join(", "),i=r.length>15?`\u2026 (+${r.length-15})`:"",s=`\u7B26\u5408\u4E2D\u91AB\u764C\u75C7\u52A0\u5F37\u7167\u8B77\u65B9\u6848\uFF1A${n}
\u547D\u4E2D ICD: ${o}${i}`;return`<span class="cancer-badge" title="${l(s)}">\u{1F397} \u764C\u75C7\u5C08\u6848\uFF08${l(n)}\uFF09</span>`}function oe(e){return M(e).filter(t=>H(t,"J45"))}function se(e){let a=String(e?.birthday||"");if(a.length!==7)return null;let t=parseInt(a.substring(0,3),10);if(isNaN(t))return null;let n=t+1911;return new Date().getFullYear()-n}function Ke(e,a={}){let t=new Set,n=se(a);if(n===null||n>=12)return t;for(let r of oe(e))t.add(r);return t}function qe(e,a={}){let t=se(a),n=oe(e);if(console.log("[NHITW Clinic] Asthma check: yearDiff="+t+", J45 codes="+JSON.stringify(n)),t===null||t>=12||n.length===0)return"";let r=n.slice(0,8).join(", "),o=n.length>8?`\u2026 (+${n.length-8})`:"",i=`\u7B26\u5408\u4E2D\u91AB\u6C23\u5598\u5C08\u6848\uFF1A\u6536\u6848\u5E74\u2212\u51FA\u751F\u5E74=${t} (<12)\uFF0C\u66FE\u4E0B\u6C23\u5598\u8A3A\u65B7
\u547D\u4E2D ICD: ${r}${o}`;return`<span class="asthma-badge" title="${l(i)}">\u{1FAC1} \u6C23\u5598\u5C08\u6848\uFF08\u5E74\u5DEE${t}\uFF09</span>`}function Ve(e,a){if(!e?.rObject)return null;let t=null;for(let n of e.rObject){if(P(n)!==a)continue;let r=S(n.real_inspect_date||n.recipe_date||"");r&&(!t||r>t.date)&&(t={date:r,value:n.assay_value,code:n.order_code||"",ref:n.consult_value||""})}return t}function Ye(e){if(!e?.rObject)return null;let a={};for(let t of e.rObject){let n=P(t);if(n!=="UPCR"&&n!=="UACR")continue;let r=S(t.real_inspect_date||t.recipe_date||"");r&&(!a[n]||r>a[n].date)&&(a[n]={date:r,value:t.assay_value,ref:t.consult_value||"",code:t.order_code||"",name:n})}for(let t of Object.values(a))if(G(t.value,t.ref,t.code)==="high")return t;return null}function Je(e,a={}){let t=Ve(e?.labData,"Cr");if(!t)return"";let n=parseFloat(t.value);if(!(n>0))return"";if(n>15)return console.warn("[NHITW Clinic] CKD badge: ignoring Cr="+n+" (not plausible as serum)"),"";let r=a?.age;if(typeof r!="number"||r<=0||!a?.sex)return"";let o=Q(a.sex),i=X(n,r,o);if(console.log("[NHITW Clinic] CKD check: Cr="+n+" ("+t.date+") age="+r+" female="+o+" \u2192 eGFR="+(i!=null?i.toFixed(1):"null")),i==null)return"";let s=ee(i);if(s==="\u6B63\u5E38")return"";if(i<60){let f=`eGFR ${i.toFixed(1)} mL/min/1.73m\xB2 (${s})\uFF0C\u7B26\u5408\u4E2D\u91AB\u6162\u6027\u814E\u81DF\u75C5\u9580\u8A3A\u52A0\u5F37\u7167\u8B77\u8A08\u756B
\u4F9D\u64DA\uFF1ACr=${n} mg/dL @ ${t.date}
\u9700\u4E3B\u8A3A\u65B7 ICD-10 N18.2-N18.6`;return`<span class="ckd-badge ckd-eligible" title="${l(f)}">\u{1FAD8} CKD \u6536\u6848 (${s})</span>`}let c=Ye(e?.labData);if(c){let f=`eGFR ${i.toFixed(1)} (${s}) + ${c.name}=${c.value} \u8D85\u6A19 (\u53C3\u8003 ${c.ref||"\u7121"}) @ ${c.date}
\u7B26\u5408 stage 2 \u6536\u6848\u689D\u4EF6 \u2014 \u9700\u4E3B\u8A3A\u65B7 ICD-10 N18.2-N18.6`;return`<span class="ckd-badge ckd-eligible" title="${l(f)}">\u{1FAD8} CKD \u6536\u6848 (stage 2 + \u86CB\u767D\u5C3F)</span>`}let d=`eGFR ${i.toFixed(1)} (${s})\uFF1Bstage 2 \u6536\u6848\u9700 UPCR\u2265150 mg/g\u3001UACR\u226530 mg/g\uFF08\u7CD6\u5C3F\u75C5\uFF09\u6216\u8840\u5C3F\uFF0C\u8ACB\u81E8\u5E8A\u5224\u65B7
\u4F9D\u64DA\uFF1ACr=${n} mg/dL @ ${t.date}`;return`<span class="ckd-badge ckd-watch" title="${l(d)}">\u{1FAD8} CKD \u5F85\u78BA\u8A8D (stage 2)</span>`}var Ze={NSAID:["M01AA","M01AB","M01AC","M01AE","M01AG","M01AH"],ACEI:["C09AA","C09BA","C09BB","C09BX"],ARB:["C09CA","C09DA","C09DB","C09DX"],STATIN:["C10AA","C10BA","C10BX"],SGLT2:["A10BK","A10BD15","A10BD16","A10BD19","A10BD20","A10BD21","A10BD25","A10BD27","A10BD29","A10BD30"],GLP1:["A10BJ","A10AE54","A10AE56"],\u6297\u51DD:["B01A"]},Qe={red:["\u6297\u51DD","NSAID"],orange:["ARB","ACEI","STATIN"],green:["SGLT2","GLP1"]},Xe={red:{bg:"#fde8e8",border:"#e53935",text:"#b71c1c"},orange:{bg:"#fff3e0",border:"#fb8c00",text:"#e65100"},green:{bg:"#e8f5e9",border:"#43a047",text:"#1b5e20"}};function ie(e){if(!e)return null;for(let[a,t]of Object.entries(Ze))if(t.some(n=>n.length===7?e===n:e.startsWith(n)))return a;return null}function et(e){for(let[a,t]of Object.entries(Qe))if(t.includes(e))return a;return null}function E(e,a){if(!e)return!1;let t=new Date(e);return isNaN(t.getTime())&&e.includes("/")&&(t=new Date(e.replace(/\//g,"-"))),isNaN(t.getTime())?!1:Date.now()-t.getTime()<=a*864e5}function tt(e,a){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=a||100,n=[];for(let s of e){let c=s.PER_DATE||s.drug_date||"";if(!E(c,t))continue;let d=s.ATC_CODE||s.drug_atc7_code||"",f=ie(d);if(!f)continue;let b=et(f);b&&n.push({name:s.MED_DESC||s.MED_ITEM||s.drug_ename||"",generic:s.GENERIC_NAME||s.drug_ing_name||"",date:S(c),hosp:T(s.HOSP_NAME||s.hosp),freq:s.FREQ_DESC||s.drug_fre||"",medDays:s.MED_DAYS||s.day||"",drugLeft:s.DRUG_LEFT||s.drug_left||"",groupName:f,colorName:b})}if(n.length===0)return'<p class="empty">\u7121\u95DC\u6CE8\u897F\u85E5\u7D00\u9304</p>';let r=["red","orange","green"],o={};for(let s of n){o[s.colorName]||(o[s.colorName]={}),o[s.colorName][s.groupName]||(o[s.colorName][s.groupName]={});let c=s.name;o[s.colorName][s.groupName][c]||(o[s.colorName][s.groupName][c]={...s,prescriptions:[]}),o[s.colorName][s.groupName][c].prescriptions.push({date:s.date,hosp:s.hosp,days:s.medDays,drugLeft:s.drugLeft})}let i="";for(let s of r){if(!o[s])continue;let c=Xe[s];for(let[d,f]of Object.entries(o[s]))for(let b of Object.values(f)){b.prescriptions.sort((p,u)=>(u.date||"").localeCompare(p.date||""));let m=b.prescriptions.slice(0,3).map(p=>`<span class="med-pres">${l(I(p.date))} ${l(p.hosp)}${p.drugLeft&&p.drugLeft!=="0"?` <span class="drug-left">\u9918${p.drugLeft}\u5929</span>`:""}</span>`).join(" ");i+=`<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${c.bg};border-color:${c.border};color:${c.text}">${l(d)}</span></td>
          <td class="med-name-cell">${l(b.name)}</td>
          <td class="med-pres-cell">${m}</td>
        </tr>`}}return`<table class="important-med-table">
    <tbody>${i}</tbody>
  </table>
  <div class="tracking-note">${t} \u5929\u5167</div>`}function nt(e,a){if(!e||e.length===0)return'<p class="empty">\u7121\u897F\u85E5\u7D00\u9304</p>';let t=a||100,n=[];for(let s of e){let c=s.PER_DATE||s.drug_date||"";if(!E(c,t))continue;let d=s.ATC_CODE||s.drug_atc7_code||"";ie(d)||n.push({name:s.MED_DESC||s.MED_ITEM||s.drug_ename||"",generic:s.GENERIC_NAME||s.drug_ing_name||"",date:S(c),hosp:T(s.HOSP_NAME||s.hosp),icd:s.ICD_CODE||s.icd_code||"",icdName:s.ICD_NAME||s.icd_cname||"",freq:s.FREQ_DESC||s.drug_fre||"",medDays:s.MED_DAYS||s.day||"",drugLeft:s.DRUG_LEFT||s.drug_left||""})}if(n.length===0)return'<p class="empty">\u7121\u5176\u4ED6\u897F\u85E5\u7D00\u9304</p>';let r={};for(let s of n){let c=`${s.date}|${s.hosp}`;r[c]||(r[c]={date:s.date,hosp:s.hosp,icd:s.icd,icdName:s.icdName,meds:[]}),r[c].meds.push(s)}let o=Object.values(r).sort((s,c)=>(c.date||"").localeCompare(s.date||"")),i="";for(let s of o){i+=`<div class="med-group-header">${l(I(s.date))} ${l(s.hosp)}`,s.icd&&(i+=` <span class="diag-code">${l(s.icd)}</span>`),i+="</div>";for(let c of s.meds){let d=[c.freq,c.medDays?c.medDays+"\u5929":"",c.drugLeft&&c.drugLeft!=="0"?`\u9918${c.drugLeft}\u5929`:""].filter(Boolean).join(" ");i+=`<div class="med-item">${l(c.name)} <span class="med-detail">${l(d)}</span></div>`}}return i+=`<div class="tracking-note">${t} \u5929\u5167</div>`,i}function at(e){if(!e||e.length===0)return'<p class="empty">\u7121\u4E2D\u85E5\u7D00\u9304</p>';let a={};for(let n of e){let r=S(n.func_date||""),o=T(n.hosp),i=`${r}|${o}`;a[i]||(a[i]={date:r,hosp:o,icd:n.icd_code||"",icdName:n.icd_cname||"",meds:[]}),a[i].meds.push(n)}let t="";for(let n of Object.values(a)){t+=`<div class="med-group-header">${l(I(n.date))} ${l(n.hosp)}`,n.icd&&(t+=` <span class="diag-code">${l(n.icd)}</span>`),t+="</div>";let r=new Map;for(let o of n.meds){let i=o.drug_perscrn_name||o.cdrug_name||"",s=parseFloat(o.order_qty)||0,c=o.drug_fre||"",d=o.day||"",f=`${i}|${c}|${d}`,b=r.get(f);b?s>b.qty?(b.alts.push(b.raw),b.qty=s,b.raw=o.order_qty||""):String(o.order_qty||"")!==b.raw&&b.alts.push(o.order_qty||""):r.set(f,{name:i,qty:s,freq:c,days:d,raw:o.order_qty||"",alts:[]})}for(let o of r.values()){let i=o.alts.length?` title="\u540C\u7B46\u8655\u65B9\u53E6\u5B58 qty=${l(o.alts.join(", "))}"`:"",s=o.alts.length?' <span class="med-dup">\u26A0</span>':"";t+=`<div class="med-item"${i}>${l(o.name)} <span class="med-detail">${l(o.raw)} ${l(o.freq)} ${o.days?o.days+"\u5929":""}${s}</span></div>`}}return t}var rt=new Set(["33085B","33084B","33072B","33070B","19009C","19001C","18006C","28016C"]);function ot(e){if(!e||e.length===0)return'<p class="empty">\u7121\u5F71\u50CF\u8CC7\u6599</p>';let a=180,t=e.filter(i=>{let s=i.real_inspect_date||i.case_time||i.recipe_date||"";if(!E(s,a))return!1;let c=i.order_code||"";return rt.has(c)});if(t.length===0)return`<p class="empty">${a}\u5929\u5167\u7121\u95DC\u6CE8\u7684\u5F71\u50CF\u6AA2\u67E5</p>`;let n=new Set,r=[];for(let i of t){let s=S(i.real_inspect_date||i.case_time||i.recipe_date||""),c=i.order_name||"",d=i.order_code||"",f=`${s}|${c}|${d}`;n.has(f)||(n.add(f),r.push(i))}r.sort((i,s)=>{let c=S(i.real_inspect_date||i.case_time||i.recipe_date||"");return S(s.real_inspect_date||s.case_time||s.recipe_date||"").localeCompare(c)});let o="";for(let i of r){let s=I(i.real_inspect_date||i.case_time||i.recipe_date||""),c=i.order_name||"";c=c.replace(/[[\]]/g,"").replace(/;/g," ").trim();let d=T(i.hosp),f=i.inspect_result||"";o+='<div class="imaging-item">',o+=`<div class="imaging-name">${l(c)}</div>`,o+=`<div class="imaging-meta">${l(s)} ${l(d)}</div>`,f&&(o+=`<div class="imaging-result">${l(f)}</div>`),o+="</div>"}return o+=`<div class="tracking-note">${a} \u5929\u5167</div>`,o}function st(e){if(!e||e.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let a=e.filter(n=>{let r=n.drug_name||"";return r&&!r.includes("\u672A\u8A18\u9304")&&r!=="NP"&&r!=="N.P"&&r!=="N.P."&&!r.includes("\u672A\u904E\u654F")});if(a.length===0)return'<p class="empty">\u7121\u904E\u654F\u7D00\u9304</p>';let t="";for(let n of a){let r=n.drug_name||"",o=(n.sympton_name||"").replace(/;/g,", ");t+=`<div class="allergy-item"><strong>${l(r)}</strong>${o?` \u2014 ${l(o)}`:""}</div>`}return t}function it(e){if(!e||e.length===0)return"";let a="";for(let t of e){let n=I(t.exe_s_date||""),r=T(t.hosp),o=t.icd_cname||t.icd_code||"";a+=`<div class="record-item">${l(n)} ${l(r)} \u2014 ${l(o)}</div>`}return a}function ct(e){if(!e||e.length===0)return"";let a="";for(let t of e){let n=I(t.in_date||""),r=I(t.out_date||""),o=T(t.hosp),i=t.icd_cname||t.icd_code||"";a+=`<div class="record-item">${l(n)}~${l(r)} ${l(o)} \u2014 ${l(i)}</div>`}return a}function lt(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.result_data?e:null:null}function dt(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.colorectal||e.oralMucosa||e.mammography||e.papSmears||e.lungCancer?e:null:null}function ut(e){return e?Array.isArray(e.rObject)&&e.rObject[0]?e.rObject[0]:e.originalData?.robject?e.originalData.robject:e.result_data||e.med_data?e:null:null}function pt(e){let a=lt(e);if(!a||!Array.isArray(a.result_data)||a.result_data.length===0)return"";let t=a.result_data[0],n=r=>r==null||r===""?"\u2014":l(String(r));return`<div class="hc-title">${n(t.title||"\u6700\u8FD1\u4E00\u6B21")}</div>
    <div class="hc-row">\u8EAB\u9AD8 <b>${n(t.height)}</b> / \u9AD4\u91CD <b>${n(t.weight)}</b> / BMI <b>${n(t.bmi)}</b> / \u8170\u570D <b>${n(t.waistline)}</b></div>
    <div class="hc-row">\u8840\u58D3 <b>${n(t.base_sbp)}/${n(t.base_ebp)}</b></div>
    <div class="hc-row">Chol <b>${n(t.cho)}</b> / TG <b>${n(t.blod_tg)}</b> / LDL <b>${n(t.ldl)}</b> / HDL <b>${n(t.hdl)}</b> / \u8840\u7CD6 <b>${n(t.s_09005c)}</b></div>
    <div class="hc-row">BUN <b>${n(t.urine_bun)}</b> / Cr <b>${n(t.blod_creat)}</b> / GFR <b>${n(t.egfr)}</b> / \u5C3F\u86CB\u767D <b>${n(t.urine_protein)}</b></div>
    <div class="hc-row">GOT <b>${n(t.sgot)}</b> / GPT <b>${n(t.sgpt)}</b></div>`}function ft(e){let a=dt(e);if(!a)return"";let t=[["colorectal","\u7CDE\u4FBF\u6F5B\u8840"],["oralMucosa","\u53E3\u8154\u9ECF\u819C"],["mammography","\u4E73\u623F\u651D\u5F71"],["papSmears","\u5B50\u5BAE\u9838\u764C"],["lungCancer","\u80BA\u764C\u7BE9\u6AA2"]],n=[];for(let[r,o]of t){let i=a[r]?.subData;if(Array.isArray(i)&&i.length>0){let s=i[0],c=s.result||"\u7121\u8CC7\u6599",d=c==="\u7570\u5E38",f=[s.func_date,s.hosp_abbr].filter(Boolean).join(" ");n.push(`<div class="scr-row ${d?"scr-abnormal":""}"><span class="scr-label">${l(o)}</span><span class="scr-result">${l(c)}</span>${f?`<span class="scr-meta">${l(f)}</span>`:""}</div>`)}}return n.length===0?"":n.join("")}function gt(e){let a=ut(e);if(!a)return"";let t="";if(Array.isArray(a.result_data)&&a.result_data.length>0){t+='<div class="hbcv-sec">\u6AA2\u9A57\u7D50\u679C</div>';for(let n of a.result_data){let r=G(n.assay_value,n.consult_value,n.order_code),o=r==="high"?"lab-high":r==="low"?"lab-low":"";t+=`<div class="hbcv-row"><span class="hbcv-name">${l(n.assay_item_name||"")}</span> <span class="${o}">${l(n.assay_value||"")}</span> <span class="hbcv-meta">${l(n.real_inspect_date||"")}</span></div>`}}if(Array.isArray(a.med_data)&&a.med_data.length>0){t+='<div class="hbcv-sec">\u6CBB\u7642\u85E5\u7269</div>';for(let n of a.med_data){let r=n.hosp?String(n.hosp).split(";")[0]:"";t+=`<div class="hbcv-row"><span class="hbcv-name">${l(n.drug_ing_name||"")}</span> <span class="hbcv-meta">${l(n.func_date||"")} ${l(r)}</span></div>`}}return t}function mt(e,a,t,n){let r="";return n.allergyHtml&&!n.allergyHtml.includes("\u7121\u904E\u654F")&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u26A0 \u904E\u654F\u7D00\u9304</div><div class="panel-body">${n.allergyHtml}</div></div>`),n.surgeryHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52A} \u624B\u8853\u7D00\u9304</div><div class="panel-body">${n.surgeryHtml}</div></div>`),n.adultHealthHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1FA7A} \u6210\u4EBA\u9810\u9632\u4FDD\u5065</div><div class="panel-body">${n.adultHealthHtml}</div></div>`),n.cancerScreeningHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F52C} \u56DB\u764C\u7BE9\u6AA2</div><div class="panel-body">${n.cancerScreeningHtml}</div></div>`),n.hbcvHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F9EB} B/C \u809D\u5C08\u5340</div><div class="panel-body">${n.hbcvHtml}</div></div>`),n.dischargeHtml&&(r+=`<div class="panel"><div class="panel-title" onclick="togglePanel(this)">\u{1F3E5} \u4F4F\u9662\u7D00\u9304</div><div class="panel-body">${n.dischargeHtml}</div></div>`),`<!DOCTYPE html>
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
</html>`}var C={medicationData:null,labData:null,chinesemedData:null,acupunctureData:null,imagingData:null,allergyData:null,surgeryData:null,dischargeData:null,medDaysData:null,patientSummaryData:null,adultHealthCheckData:null,cancerScreeningData:null,hbcvData:null,token:null,currentUserSession:null,patientName:null,patientIdFromToken:null},z=-1,ht=new Set(["token","currentUserSession","patientName","patientIdFromToken"]);function j(){for(let e of Object.keys(C))ht.has(e)||(C[e]=null)}function bt(e){let a=e||new Date,t=a.getHours()*60+a.getMinutes();return t<780?"\u65E9\u8A3A":t<1070?"\u5348\u8A3A":"\u665A\u8A3A"}var U=!1;function ce(){U||(U=!0,chrome.alarms.create("htmlExport",{delayInMinutes:.1}))}chrome.alarms.onAlarm.addListener(e=>{e.name==="htmlExport"&&(U=!1,Ct().catch(a=>{console.warn("[NHITW Clinic] Export alarm handler error:",a.message)}))});async function Ct(){try{if(!((await chrome.storage.sync.get("sharedFolder")).sharedFolder||{}).enabled)return;let t={age:null,sex:"",birthday:""},n=null,r=z;if(r>0)try{n=await chrome.tabs.sendMessage(r,{action:"getPatientInfo"}),console.log(`[NHITW Clinic] Fresh patient info from tracked tab ${r}:`,n)}catch(p){console.warn(`[NHITW Clinic] Tracked tab ${r} unreachable: ${p.message}, falling back`),r=-1}if(!n)try{let p=await chrome.tabs.query({url:"https://medcloud2.nhi.gov.tw/*"}),u=p.find(h=>h.active)||p[0];u&&(n=await chrome.tabs.sendMessage(u.id,{action:"getPatientInfo"}),console.log(`[NHITW Clinic] Fresh patient info from active fallback tab ${u.id}:`,n))}catch(p){console.warn("[NHITW Clinic] Fallback getPatientInfo also failed:",p.message)}if(n?.id){let p=n.id!==C.patientIdFromToken;C.patientIdFromToken=n.id,n.name?C.patientName=n.name:(p||!C.patientName)&&(C.patientName=n.id),t={age:n.age??null,sex:n.sex||"",birthday:n.birthday||""}}let o=C.patientIdFromToken,i=C.patientName;if(!o){let p=C.currentUserSession;if(!p){console.log("[NHITW Clinic] No session data, skipping export");return}o=p.startsWith("patient_")?p.replace("patient_",""):p}i||(i=o),console.log(`[NHITW Clinic] Export: ID=${R(o,4,3)}, Name=${R(i,1,1)}`);let s={};for(let[p,u]of Object.entries(C))p!=="token"&&p!=="currentUserSession"&&u&&(s[p]=u);let c=Y(i,o,s,t),d=J(i),f=bt(new Date),b=Math.round(new Blob([c]).size/1024),m=b;if(console.log(`[NHITW Clinic] Generating HTML: ${d} (${m}KB, ${Object.keys(s).length} data types, session=${f})`),m>900&&(c=vt(c),m=Math.round(new Blob([c]).size/1024),m<=900&&console.warn(`[NHITW Clinic] HTML trimmed (${b}KB \u2192 ${m}KB) by dropping debug comment`)),m>900){console.warn(`[NHITW Clinic] HTML too large (${m}KB) \u2014 writing oversize stub instead`);try{chrome.action.setBadgeText({text:"\u26A0"}),chrome.action.setBadgeBackgroundColor({color:"#c62828"})}catch{}c=yt(i,o,b),await F(d,c,void 0,f);return}await F(d,c,void 0,f),console.log(`[NHITW Clinic] HTML report saved: ${f}/${d}`)}catch(e){console.warn("[NHITW Clinic] Auto-export failed (non-blocking):",e.message)}}function vt(e){return e.replace(/<!-- NHITW-DEBUG-START[\s\S]*?NHITW-DEBUG-END -->\n?/g,"")}function R(e,a=1,t=1){if(e==null)return"";let n=String(e);return n.length<=a+t?n:n.slice(0,a)+"*".repeat(Math.min(3,n.length-a-t))+n.slice(-t)}function yt(e,a,t){let n=o=>String(o??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),r=new Date().toLocaleString("zh-TW");return`<!DOCTYPE html><html lang="zh-TW"><head><meta charset="UTF-8"><title>${n(e)} \u2014 \u5831\u544A\u904E\u5927</title>
<style>body{font-family:"Microsoft JhengHei","PingFang TC",sans-serif;background:#fff3e0;color:#333;padding:24px;margin:0}
h1{color:#c62828;font-size:20px;margin-bottom:12px}
.box{background:#fff;border:2px solid #ed6c02;border-radius:8px;padding:18px;max-width:600px;line-height:1.7;font-size:14px}
.box b{color:#c62828}.box code{background:#f5f5f5;padding:2px 6px;border-radius:3px;font-size:13px}
.note{margin-top:14px;font-size:12px;color:#666}</style></head><body>
<h1>\u26A0\uFE0F \u6B64\u4EFD\u75C5\u4EBA\u8CC7\u6599\u904E\u5927\uFF0C\u672A\u80FD\u5B8C\u6574\u751F\u6210\u5831\u544A</h1>
<div class="box">
  <p><b>\u75C5\u4EBA\uFF1A</b>${n(e)}\uFF08${n(a)}\uFF09</p>
  <p><b>\u6642\u9593\uFF1A</b>${n(r)}</p>
  <p><b>\u539F\u59CB HTML \u5927\u5C0F\uFF1A</b>${t} KB\uFF08\u8D85\u904E Native Messaging \u4E0A\u9650 1024 KB\uFF09</p>
  <p>\u8ACB<b>\u76F4\u63A5\u5728\u5065\u4FDD\u96F2\u7AEF\u539F\u59CB\u7CFB\u7D71\u67E5\u95B1</b>\u672C\u6B21\u8CC7\u6599\u3002</p>
  <p class="note">\u82E5\u6B64\u75C5\u4EBA\u7D93\u5E38\u767C\u751F\uFF0C\u8ACB\u806F\u7D61\u958B\u767C\u8005\u8ABF\u6574\u64F4\u5145\u529F\u80FD \u2014 \u901A\u5E38\u662F\u6AA2\u9A57\u7D00\u9304\u592A\u591A\u5E74\u4EFD\u3002</p>
</div></body></html>`}var xt={allergy:"medcloud2.nhi.gov.tw/imu/api/imue0040/imue0040s02/get-data",surgery:"medcloud2.nhi.gov.tw/imu/api/imue0020/imue0020s02/get-data",discharge:"medcloud2.nhi.gov.tw/imu/api/imue0070/imue0070s02/get-data",medDays:"medcloud2.nhi.gov.tw/imu/api/imue0120/imue0120s01/pres-med-day",patientSummary:"medcloud2.nhi.gov.tw/imu/api/imue2000/imue2000s01/get-summary",chinesemed:"medcloud2.nhi.gov.tw/imu/api/imue0090/imue0090s02/get-data",acupuncture:"medcloud2.nhi.gov.tw/imu/api/imue0100/imue0100s02/get-data",imaging:"medcloud2.nhi.gov.tw/imu/api/imue0130/imue0130s02/get-data",medication:"medcloud2.nhi.gov.tw/imu/api/imue0008/imue0008s02/get-data",labdata:"medcloud2.nhi.gov.tw/imu/api/imue0060/imue0060s02/get-data"};Object.entries(xt).forEach(([e,a])=>{chrome.webRequest.onBeforeRequest.addListener(function(t){return t.method==="GET"&&t.url.includes(a)&&(t.tabId>0&&(z=t.tabId),chrome.tabs.sendMessage(t.tabId,{action:"apiCallDetected",url:t.url,type:e})),{cancel:!1}},{urls:[`https://${a}*`]},["requestBody"]),chrome.webRequest.onCompleted.addListener(function(t){t.method==="GET"&&t.url.includes(a)&&chrome.tabs.sendMessage(t.tabId,{action:"apiCallCompleted",url:t.url,statusCode:t.statusCode,type:e})},{urls:[`https://${a}*`]},["responseHeaders"])});var B={medication:"medicationData",labdata:"labData",chinesemed:"chinesemedData",acupuncture:"acupunctureData",imaging:"imagingData",allergy:"allergyData",surgery:"surgeryData",discharge:"dischargeData",medDays:"medDaysData",patientSummary:"patientSummaryData",adultHealthCheck:"adultHealthCheckData",cancerScreening:"cancerScreeningData",hbcvdata:"hbcvData"},Dt=new Map([["openPopup",(e,a,t)=>{chrome.action.openPopup(),t({status:"received"})}],["userSessionChanged",(e,a,t)=>{j(),C.currentUserSession=e.userSession,chrome.storage.local.remove(Object.values(B),function(){chrome.action.setBadgeText({text:""})}),t({status:"session_reset"})}],["clearSessionData",(e,a,t)=>{j(),t({status:"cleared"})}],["getSessionData",(e,a,t)=>{t({status:"success",data:C})}],["getDataStatus",(e,a,t)=>(chrome.storage.local.get(Object.values(B),n=>{let r={},o=(s,c)=>{let d=n[c],f=d?.rObject||d?.robject;f&&Array.isArray(f)?r[s]={status:"fetched",count:f.length}:r[s]={status:"none",count:0}},i={medication:"medication",labdata:"labData",chinesemed:"chineseMed",imaging:"imaging",allergy:"allergy",surgery:"surgery",discharge:"discharge",medDays:"medDays",patientSummary:"patientSummary"};Object.entries(B).forEach(([s,c])=>{let d=i[s]||s;o(d,c)}),t({dataStatus:r})}),!0)],["saveMedicationData",w("medication")],["saveLabData",w("labdata")],["saveChineseMedData",w("chinesemed")],["saveAcupunctureData",w("acupuncture")],["saveImagingData",w("imaging")],["saveAllergyData",w("allergy")],["saveSurgeryData",w("surgery")],["saveDischargeData",w("discharge")],["saveMedDaysData",w("medDays")],["savePatientSummaryData",w("patientSummary")],["saveAdultHealthCheckData",w("adultHealthCheck")],["saveCancerScreeningData",w("cancerScreening")],["saveHbcvdata",w("hbcvdata")],["saveToken",(e,a,t)=>{a?.tab?.id&&(z=a.tab.id),C.token=e.token,C.currentUserSession=e.userSession||C.currentUserSession,e.patientIdFromToken&&(C.patientIdFromToken=e.patientIdFromToken,C.patientName=e.patientName||e.patientIdFromToken),console.log(`[NHITW Clinic] saveToken from tab ${a?.tab?.id??"?"} - Name: ${R(e.patientName,1,1)}, ID: ${R(e.patientIdFromToken,4,3)}`),ce(),t({status:"token_saved"})}],["checkHostStatus",(e,a,t)=>{try{let n=chrome.runtime.connectNative("com.nhitw.host"),r=!1;n.onMessage.addListener(()=>{r=!0,n.disconnect(),t({success:!0,available:!0})}),n.onDisconnect.addListener(()=>{r||t({success:!0,available:!1})}),n.postMessage({action:"read_manifest"})}catch(n){t({success:!0,available:!1,error:n.message})}}]]);function w(e){return function(a,t,n){let r=B[e];if(!r){n({status:"error",error:`Invalid data type: ${e}`});return}C[r]=a.data,C.currentUserSession=a.userSession||C.currentUserSession;let o={[r]:a.data,currentUserSession:a.userSession||C.currentUserSession};chrome.storage.local.set(o,function(){chrome.action.setBadgeText({text:"\u2713"}),chrome.action.setBadgeBackgroundColor({color:"#4CAF50"}),ce(),a.data&&a.data.rObject&&Array.isArray(a.data.rObject)?n({status:"saved",recordCount:a.data.rObject.length}):n({status:"saved",recordCount:0,error:"Invalid data format"})})}}chrome.runtime.onMessage.addListener((e,a,t)=>{e.userSession&&e.userSession!==C.currentUserSession&&(j(),C.currentUserSession=e.userSession);let n=Dt.get(e.action);return n?(n(e,a,t),!0):(t({status:"received"}),!0)});chrome.tabs.onUpdated.addListener((e,a,t)=>{a.url&&(a.url.includes("medcloud2.nhi.gov.tw/imu/login")||a.url.includes("medcloud2.nhi.gov.tw/imu/IMUE1000/IMUE0001"))&&(console.log("Detected navigation to login page, clearing session data"),Object.keys(C).forEach(n=>{C[n]=null}),chrome.storage.local.remove(["medicationData","labData","currentUserSession"],function(){console.log("Storage data cleared due to logout"),chrome.action.setBadgeText({text:""})}))});})();
