/**
 * htmlReportGenerator.js
 * Generates a self-contained HTML report matching the extension's Overview layout.
 */

import { parseReferenceRange } from './labProcessorModules/referenceRangeUtils.js';

export function generateHtmlReport(patientName, patientId, data, patientMeta = {}) {
  const now = new Date();
  const dateStr = formatDateTime(now);

  // Pre-compute ICD codes flagged by the badges so the diagnosis panel can
  // highlight the same codes the badges fired on.
  const acuMatchedCodes = getMatchedAcuCodes(data);
  const cancerMatchedCodes = getMatchedCancerCodes(data);
  const asthmaMatchedCodes = getMatchedAsthmaCodes(data, patientMeta);
  const highlightSets = { acu: acuMatchedCodes, cancer: cancerMatchedCodes, asthma: asthmaMatchedCodes };

  // Build each panel
  const diagnosisHtml = buildDiagnosisPanel(data, highlightSets);
  const labPivotHtml = buildLabPivotPanel(data.labData?.rObject, patientMeta);
  const westMedHtml = buildWestMedPanel(data.medicationData?.rObject, 100);
  const otherWestMedHtml = buildOtherWestMedPanel(data.medicationData?.rObject, 100);
  const chineseMedHtml = buildChineseMedPanel(data.chinesemedData?.rObject);
  const imagingHtml = buildImagingPanel(data.imagingData?.rObject);
  const allergyHtml = buildAllergyPanel(data.allergyData?.rObject);
  const surgeryHtml = buildSurgeryPanel(data.surgeryData?.rObject);
  const dischargeHtml = buildDischargePanel(data.dischargeData?.rObject);
  const adultHealthHtml = buildAdultHealthCheckPanel(data.adultHealthCheckData);
  const cancerScreeningHtml = buildCancerScreeningPanel(data.cancerScreeningData);
  const hbcvHtml = buildHbcvPanel(data.hbcvData);
  const acuBadgeHtml = buildAcupunctureBadge(data);
  const cancerBadgeHtml = buildCancerCareBadge(data);
  const asthmaBadgeHtml = buildAsthmaBadge(data, patientMeta);
  const ckdBadgeHtml = buildCkdBadge(data, patientMeta);
  const patientMetaLine = formatPatientMeta(patientMeta);

  return buildFullHtml(patientName, patientId, dateStr, {
    diagnosisHtml, labPivotHtml, westMedHtml, otherWestMedHtml, chineseMedHtml,
    imagingHtml, allergyHtml, surgeryHtml, dischargeHtml,
    adultHealthHtml, cancerScreeningHtml, hbcvHtml,
    acuBadgeHtml, cancerBadgeHtml, asthmaBadgeHtml, ckdBadgeHtml,
    patientMetaLine
  });
}

// Format patient demographics for the header meta line, e.g.:
//   "40歲 女 民75/08/15"
// Skips parts that aren't available.
function formatPatientMeta(m) {
  if (!m) return '';
  const parts = [];
  if (typeof m.age === 'number' && m.age >= 0) parts.push(`${m.age}歲`);
  if (m.sex) {
    const s = String(m.sex).trim().toUpperCase();
    if (s === 'F' || s === 'FEMALE' || s === '2' || s === '女') parts.push('女');
    else if (s === 'M' || s === 'MALE' || s === '1' || s === '男') parts.push('男');
  }
  // ROC YYYMMDD → 民YYY/MM/DD (leading zeros trimmed on year)
  if (m.birthday && String(m.birthday).length === 7) {
    const b = String(m.birthday);
    const yyy = parseInt(b.substring(0, 3), 10);
    const mm = b.substring(3, 5);
    const dd = b.substring(5, 7);
    if (!isNaN(yyy)) parts.push(`民${yyy}/${mm}/${dd}`);
  }
  return parts.join(' ');
}

export function getReportFilename(patientName, date) {
  const d = date || new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const safeName = patientName.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeName}_${y}${mo}${da}_${h}${mi}.html`;
}

// --- Helpers ---
function formatDateTime(d) {
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function esc(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function parseDate(r) { if(!r) return ''; if(r.includes('T')) return r.split('T')[0]; return r.replace(/\//g,'-'); }
function shortDate(r) {
  const d = parseDate(r);
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[1]}/${parts[2]}`;
  return d;
}
// Full date YYYY/MM/DD — used for lab column headers (user wants years)
function fullDate(r) {
  const d = parseDate(r);
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[0]}/${parts[1]}/${parts[2]}`;
  return d;
}
function parseHosp(r) { return r ? r.split(';')[0].trim() : ''; }

// --- Diagnosis Panel — ALL diagnoses, sorted by most-recent diagnosed date ---
// Per user request: include every diagnosis (no top-N cap), sort by last-seen
// date descending, and show that last date + hospital next to each code.
function buildDiagnosisPanel(data, highlightSets = {}) {
  const DIAG_TRACKING_DAYS = 180;
  const acuSet = highlightSets.acu || new Set();
  const cancerSet = highlightSets.cancer || new Set();
  const asthmaSet = highlightSets.asthma || new Set();
  const matchClass = (code) => {
    const c = String(code || '').trim();
    const cls = [];
    if (acuSet.has(c)) cls.push('diag-acu-match');
    if (cancerSet.has(c)) cls.push('diag-cancer-match');
    if (asthmaSet.has(c)) cls.push('diag-asthma-match');
    return cls.join(' ');
  };

  // code -> { code, name, count, lastDate, lastHosp, lastType }
  const diagMap = {};

  function processItems(items, dateField, hospField, icdCodeField, icdNameField) {
    if (!items) return;
    for (const m of items) {
      const date = m[dateField] || '';
      if (!isWithinDays(date, DIAG_TRACKING_DAYS)) continue;
      const code = m[icdCodeField] || '';
      const name = m[icdNameField] || '';
      if (!code) continue;
      const hospParts = (m[hospField] || '').split(';');
      const hosp = hospParts[0]?.trim() || '';
      const visitType = hospParts[1]?.trim() || '門診';
      const pd = parseDate(date);

      if (!diagMap[code]) diagMap[code] = { code, name, count: 0, lastDate: '', lastHosp: '', lastType: '' };
      const e = diagMap[code];
      e.count++;
      if (!e.name && name) e.name = name;
      if (pd > e.lastDate) { e.lastDate = pd; e.lastHosp = hosp; e.lastType = visitType; }
    }
  }

  processItems(data.medicationData?.rObject, 'PER_DATE', 'HOSP_NAME', 'ICD_CODE', 'ICD_NAME');
  const allMeds = data.medicationData?.rObject || [];
  if (allMeds.length > 0 && !allMeds[0].PER_DATE) {
    processItems(allMeds, 'drug_date', 'hosp', 'icd_code', 'icd_cname');
  }
  processItems(data.chinesemedData?.rObject, 'func_date', 'hosp', 'icd_code', 'icd_cname');

  // Sort by most-recent date desc; tiebreak by frequency
  const list = Object.values(diagMap).sort((a, b) => {
    if (b.lastDate !== a.lastDate) return b.lastDate.localeCompare(a.lastDate);
    return b.count - a.count;
  });
  if (list.length === 0) return '<p class="empty">無診斷紀錄</p>';

  let html = '';
  for (const d of list) {
    let typeTag = '';
    if (d.lastType.includes('急')) typeTag = '<span class="diag-type emergency">急</span>';
    else if (d.lastType.includes('住')) typeTag = '<span class="diag-type inpatient">住</span>';
    const dateStr = d.lastDate ? d.lastDate.replace(/-/g, '/') : '';
    const meta = [dateStr, d.lastHosp].filter(Boolean).join(' ');
    html += `<div class="diag-item ${matchClass(d.code)}">`
      + `<div class="diag-line1">${typeTag}<span class="diag-code">${esc(d.code)}</span> ${esc(d.name)}`
      + `<span class="diag-count">${d.count}次</span></div>`
      + `<div class="diag-line2">${esc(meta)}</div>`
      + `</div>`;
  }
  return html;
}

// --- Lab name aliases: merge English + Chinese variants of the same test ---
// The NHI cloud reports the same item under different names depending on the
// reporting hospital (e.g. "Hb" vs "血色素", "Amylase(B)" vs "血液澱粉脢"),
// which used to produce duplicate rows. Map each known variant to one canonical
// name so they collapse into a single row.
const LAB_ALIAS = [
  ['WBC', ['wbc', '白血球', '白血球計數', 'white blood cell', 'white blood cell count', 'wbc count']],
  ['RBC', ['rbc', '紅血球計數', '紅血球', 'red blood cell', 'red blood cell count', 'rbc count']],
  ['Hb', ['hb', 'hgb', 'hemoglobin', '血色素', '血紅素', '血紅蛋白']],
  ['HCT', ['hct', 'hematocrit', '血球比容值測定', '血容比', '血球容積比', '血比容', '血球比容', '血容積比']],
  ['MCV', ['mcv', '紅血球平均容積', '平均紅血球容積', '平均血球容積']],
  ['MCHC', ['mchc', '紅血球色素濃度', '平均紅血球血色素濃度']],
  ['MCH', ['mch', '紅血球色素', '平均紅血球血色素']],
  ['RDW', ['rdw', 'rdw-cv', 'rdw-sd', '紅血球分佈變異數', '紅血球分布寬度', '紅血球分布變異係數', '紅血球分佈寬度']],
  ['Platelet', ['platelet', 'plt', '血小板', '血小板計數']],
  ['MPV', ['mpv', '平均血小板容積']],
  ['Neutrophil', ['neutrophil', 'neutrophil-segmented', 'segment', 'seg', '嗜中性白血球', '中性球', '節狀核嗜中性白血球']],
  ['Lymphocyte', ['lymphocyte', 'lymph', '淋巴球']],
  ['Monocyte', ['monocyte', 'mono', '單核球']],
  ['Eosinophil', ['eosinophil', 'eo', '嗜伊紅性白血球', '嗜酸性球', '嗜伊紅白血球']],
  ['Basophil', ['basophil', 'baso', '嗜鹼性白血球']],
  ['Glucose', ['glucose', 'sugar', 'ac sugar', 'blood sugar', '葡萄糖', '血糖', '飯前血糖', '空腹血糖', '飯前血糖(ac)']],
  ['Amylase', ['amylase', 'amylase(b)', '血液澱粉脢', '澱粉酶', '澱粉脢']],
  ['Lipase', ['lipase', '解脂脢', '脂肪酶', '脂解酶']],
  ['ALK-P', ['alk-p', 'alkp', 'alp', '鹼性磷酸脢', '鹼性磷酸酶', '鹼性磷酸酵素']],
  ['T-Bil', ['total bilirubin', 't-bil', 'tbil', '總膽紅素', '膽紅素總量', '總膽色素']],
  ['D-Bil', ['direct bilirubin', 'd-bil', 'dbil', '直接膽紅素', '直接膽色素']],
  ['BUN', ['bun', '尿素氮', '血中尿素氮', '尿素氮(bun)']],
  ['Cr', ['cr', 'creatinine', '肌酸酐', '肌酐', '血清肌酸酐', '肌酸肝']],
  ['Na', ['na', 'sodium', '鈉']],
  ['K', ['k', 'potassium', '鉀']],
  ['Cl', ['cl', 'chloride', '氯']],
  ['GOT', ['got', 'ast', 'sgot', '天門冬胺酸轉胺酶', '天門冬胺酸胺基轉移酶']],
  ['GPT', ['gpt', 'alt', 'sgpt', '丙胺酸轉胺酶', '丙胺酸胺基轉移酶']],
  ['CRP', ['crp', 'c反應蛋白', 'c-反應蛋白', 'c 反應蛋白', 'c-reactive protein']],
];
function normalizeLabName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ｃ/g, 'c')                       // fullwidth c (from Ｃ反應蛋白)
    .replace(/（/g, '(').replace(/）/g, ')')   // fullwidth parens
    .replace(/\s+/g, ' ')
    .trim();
}
const LAB_ALIAS_LOOKUP = (() => {
  const m = new Map();
  for (const [canon, aliases] of LAB_ALIAS) {
    for (const a of aliases) m.set(normalizeLabName(a), canon);
  }
  return m;
})();

// Urine-sample tag. Catches the common ways labs label urine analytes
// WITHOUT false-positiving on benign Chinese compounds (尿酸 uric acid,
// 尿素氮 BUN) — those start with 尿 directly, no separator. The Chinese
// "[、，]尿" pattern catches 肌酐、尿 / 肌酸酐，尿 etc. where 尿 is appended
// as a specimen marker after the analyte name.
const URINE_HINT = /\burine\b|\burinary\b|尿液|\(\s*尿\s*\)|（\s*尿\s*）|[、，]\s*尿/i;

// Pull the upper bound out of an NHI consult_value string. Handles:
//   "[0.6][1.3]"  (NHI canonical bracketed format)
//   "0.6-1.3" / "0.6~1.3" / "0.6–1.3"
//   "<200" / "≦7.7" / "＜130"
// Returns null if no numeric upper bound can be parsed.
function parseRefMax(consult) {
  if (!consult) return null;
  const s = String(consult);
  const bracketed = s.match(/\[\s*(-?\d+\.?\d*)\s*\]\s*\[\s*(-?\d+\.?\d*)\s*\]/);
  if (bracketed) { const v = parseFloat(bracketed[2]); return isNaN(v) ? null : v; }
  const range = s.match(/(-?\d+\.?\d*)\s*[-~–]\s*(-?\d+\.?\d*)/);
  if (range) { const v = parseFloat(range[2]); return isNaN(v) ? null : v; }
  const lt = s.match(/[<≦＜]\s*(-?\d+\.?\d*)/);
  if (lt) { const v = parseFloat(lt[1]); return isNaN(v) ? null : v; }
  return null;
}

function canonicalLabName(l) {
  const rawName = l.assay_item_name || l.order_name || '';
  const orderCode = (l.order_code || '').trim();

  // Negative hint: urine-tagged items keep their raw name. Without this,
  // "Creatinine (Urine)" / "Cr(Urine)" get parens-stripped → "creatinine"
  // → "Cr" alias, then eGFR row sees urine Cr values (50-300 mg/dL) and
  // reports stage 5.
  if (URINE_HINT.test(rawName)) return (rawName || orderCode || '?').trim();

  const norm = normalizeLabName(rawName);
  let canon = LAB_ALIAS_LOOKUP.get(norm);
  if (!canon) {
    const noParen = norm.replace(/\(.*?\)/g, '').trim();
    if (noParen) canon = LAB_ALIAS_LOOKUP.get(noParen);
  }

  // Safety net for labs that generically name urine/dialysate Cr just "Cr" or
  // "Creatinine" with no urine tag. Two giveaways:
  //   - assay_value > 15 mg/dL (serum never reaches this even in ESRD)
  //   - consult_value upper bound > 5 mg/dL (serum range is always <2)
  // Isolate these into a distinct row name so itemMap['Cr'] only contains
  // genuine serum Cr, and the eGFR row builder stays clean.
  if (canon === 'Cr') {
    const val = parseFloat(l.assay_value);
    const refMax = parseRefMax(l.consult_value);
    const bogusValue = !isNaN(val) && val > 15;
    const bogusRef = refMax != null && refMax > 5;
    if (bogusValue || bogusRef) {
      console.warn(`[NHITW Clinic] '${rawName}' (${orderCode}) val=${l.assay_value} ref=${l.consult_value} — not serum Cr, isolating`);
      return `${rawName} [${orderCode}|ref ${l.consult_value || '?'}]`;
    }
  }

  if (canon) return canon;
  return (rawName || orderCode || '?').trim();
}

// Fallback units when the NHI lab response omits unit_data for a known test.
// Keyed by canonical name. Used only when item.unit ends up empty.
const DEFAULT_UNITS = {
  // CBC / differential
  Hb:'g/dL', WBC:'/uL', RBC:'10^6/uL', Platelet:'10^3/uL', HCT:'%',
  MCV:'fL', MCH:'pg', MCHC:'g/dL', RDW:'%', MPV:'fL',
  Neutrophil:'%', Lymphocyte:'%', Monocyte:'%', Eosinophil:'%', Basophil:'%',
  // Biochem
  BUN:'mg/dL', Cr:'mg/dL', 'U.A':'mg/dL', Glucose:'mg/dL', HbA1c:'%',
  Alb:'g/dL', 'T-Bil':'mg/dL', 'D-Bil':'mg/dL',
  GOT:'U/L', GPT:'U/L', 'ALK-P':'U/L', Amylase:'U/L', Lipase:'U/L',
  // Lipids
  Chol:'mg/dL', TG:'mg/dL', HDL:'mg/dL', LDL:'mg/dL',
  // Electrolytes
  Na:'mmol/L', K:'mmol/L', Cl:'mmol/L',
  // Inflammation
  CRP:'mg/dL',
  // Kidney
  GFR:'mL/min', UPCR:'mg/g', UACR:'mg/g',
};

// --- Focused Lab Tests (matches extension's labTests.js DEFAULT_LAB_TESTS) ---
const FOCUSED_LAB_TESTS = [
  { orderCode: '08011C', name: 'Hb', enabled: true, subItem: 'Hb' },
  { orderCode: '09002C', name: 'BUN', enabled: true },
  { orderCode: '09015C', name: 'Cr', enabled: true, subItem: 'Cr' },
  { orderCode: '09015C', name: 'GFR', enabled: true, subItem: 'GFR' },
  { orderCode: '09040C', name: 'UPCR', enabled: true },
  { orderCode: '12111C', name: 'UACR', enabled: true },
  { orderCode: '09038C', name: 'Alb', enabled: true },
  { orderCode: '09005C', name: 'Glucose', enabled: true },
  { orderCode: '09006C', name: 'HbA1c', enabled: true },
  { orderCode: '09001C', name: 'Chol', enabled: true },
  { orderCode: '09004C', name: 'TG', enabled: true },
  { orderCode: '09043C', name: 'HDL', enabled: true },
  { orderCode: '09044C', name: 'LDL', enabled: true },
  { orderCode: '09021C', name: 'Na', enabled: true },
  { orderCode: '09022C', name: 'K', enabled: true },
  { orderCode: '09013C', name: 'U.A', enabled: true },
  { orderCode: '09025C', name: 'GOT', enabled: true },
  { orderCode: '09026C', name: 'GPT', enabled: true },
];

// --- Lab Pivot Table — ALL tests within tracking window, newest column leftmost ---
// User asked: don't filter to focused tests, don't slice dates, include year,
// high values in red / low values in green.
function buildLabPivotPanel(items, patientMeta = {}) {
  if (!items || items.length === 0) return '<p class="empty">無檢驗資料</p>';
  const LAB_TRACKING_DAYS = 180;

  // One-time dump of the first record's keys so we can confirm whether NHI
  // ever supplies a dedicated specimen/sample-type field that would be more
  // reliable than parsing 'Urine' out of assay_item_name strings. Look in
  // the browser DevTools console for the [NHITW Clinic][debug] line.
  if (items[0] && typeof console !== 'undefined') {
    console.log('[NHITW Clinic][debug] lab record fields:', Object.keys(items[0]).sort());
    console.log('[NHITW Clinic][debug] sample record:', items[0]);
  }

  const labItems = items.filter(l => {
    const v = l.assay_value;
    if (!v || String(v).trim() === '' || String(v).trim() === '***') return false;
    const date = l.real_inspect_date || l.recipe_date || '';
    return isWithinDays(date, LAB_TRACKING_DAYS);
  });

  if (labItems.length === 0) return '<p class="empty">無檢驗資料</p>';

  const dateSet = new Set();
  const itemMap = {};
  let seq = 0;

  for (const l of labItems) {
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!date) continue;
    const value = String(l.assay_value).trim();
    const ref = l.consult_value || '';
    const code = l.order_code || '';
    const unit = (l.unit_data || '').trim();
    const name = canonicalLabName(l);
    dateSet.add(date);
    if (!itemMap[name]) itemMap[name] = { name, code, unit: '', dates: {}, order: seq++ };
    // Capture the first non-empty unit + reference display we encounter
    if (!itemMap[name].unit && unit) itemMap[name].unit = unit;
    if (!itemMap[name].code && code) itemMap[name].code = code;
    itemMap[name].dates[date] = { value, dir: labDirection(value, ref, code), ref: refDisplay(ref, code) };
  }

  // Synthesize an eGFR(計算) row from Cr + age + sex (CKD-EPI 2021 race-free).
  // The lab's own GFR (09015C) frequently comes back as 0 / empty, so we
  // compute ours alongside it. Cells get CKD-stage badge + color.
  if (itemMap['Cr'] && patientMeta?.age && patientMeta?.sex) {
    const age = patientMeta.age;
    const isFemale = isFemaleSex(patientMeta.sex);
    const egfrRow = { name: 'eGFR(計算)', code: '', unit: 'mL/min/1.73m²', dates: {}, order: -0.5, synthetic: 'egfr' };
    for (const [date, crCell] of Object.entries(itemMap['Cr'].dates)) {
      const scr = parseFloat(crCell.value);
      if (!isNaN(scr) && scr > 0) {
        // Plausibility guard: serum Cr realistically ≤ ~15 mg/dL even in
        // dialysis-dependent ESRD. Anything higher is almost certainly a
        // urine specimen that slipped through the name-level filter
        // (urine Cr is typically 50-300 mg/dL). Skip so we don't synthesize
        // a bogus stage-5 eGFR.
        if (scr > 15) {
          console.warn(`[NHITW Clinic] Skipping eGFR for ${date} — Cr=${scr} not plausible as serum`);
          continue;
        }
        const egfr = computeEgfr(scr, age, isFemale);
        if (egfr != null) {
          const stage = ckdStage(egfr);
          egfrRow.dates[date] = {
            value: egfr.toFixed(1), egfr, stage,
            ref: 'CKD-EPI 2021 ≥60 為正常',
          };
        }
      }
    }
    if (Object.keys(egfrRow.dates).length > 0) itemMap['eGFR(計算)'] = egfrRow;
  }

  // Newest column leftmost
  const dates = [...dateSet].sort((a, b) => b.localeCompare(a));

  // Focused tests first (in defined order), then others by first-seen order.
  // eGFR(計算) slots between Cr and GFR (Cr index + 0.5).
  const focusedOrder = new Map();
  FOCUSED_LAB_TESTS.forEach((t, i) => { if (!focusedOrder.has(t.name)) focusedOrder.set(t.name, i); });
  const crIdx = focusedOrder.get('Cr');
  if (crIdx != null) focusedOrder.set('eGFR(計算)', crIdx + 0.5);
  const rowNames = Object.keys(itemMap).sort((a, b) => {
    const fa = focusedOrder.has(a) ? focusedOrder.get(a) : 1000 + itemMap[a].order;
    const fb = focusedOrder.has(b) ? focusedOrder.get(b) : 1000 + itemMap[b].order;
    return fa - fb;
  });

  if (dates.length === 0 || rowNames.length === 0) return '<p class="empty">無檢驗資料</p>';

  let thead = '<tr><th class="lab-item-col">項目</th>';
  for (const d of dates) thead += `<th class="lab-date-col" data-short="${esc(shortDate(d))}" onclick="copyLabColumn(this)" title="點擊複製此次抽血數據">${esc(fullDate(d))}</th>`;
  thead += '</tr>';

  let tbody = '';
  for (const name of rowNames) {
    const item = itemMap[name];
    const unit = item.unit || DEFAULT_UNITS[name] || '';
    const unitLabel = unit ? `<span class="lab-unit">${esc(unit)}</span>` : '';
    // Strip "(計算)" suffix etc. for the copy payload (clinically eGFR is enough).
    const copyName = name.replace(/\(計算\)/g, '').trim() || name;
    tbody += `<tr data-item="${esc(copyName)}"><td class="lab-item-name" title="${esc(item.code)}">${esc(name)}${unitLabel}</td>`;
    for (const d of dates) {
      const cell = item.dates[d];
      if (cell) {
        if (item.synthetic === 'egfr' && cell.stage) {
          // Color the cell by CKD stage instead of using lab-low (which is green)
          const style = ckdStageStyle(cell.stage);
          const tip = `${cell.stage} · CKD-EPI 2021`;
          tbody += `<td style="${style}" title="${esc(tip)}" data-val="${esc(cell.value)}">${esc(cell.value)}<span class="ckd-stage">${esc(cell.stage)}</span></td>`;
        } else {
          const cls = cell.dir === 'high' ? 'lab-high' : cell.dir === 'low' ? 'lab-low' : '';
          const tip = cell.ref ? `參考值 ${cell.ref}` : '';
          tbody += `<td class="${cls}" title="${esc(tip)}" data-val="${esc(cell.value)}">${esc(cell.value)}</td>`;
        }
      } else {
        tbody += '<td class="no-data">-</td>';
      }
    }
    tbody += '</tr>';
  }

  return `<div class="lab-scroll"><table class="lab-pivot"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>
  <div class="tracking-note">${LAB_TRACKING_DAYS} 天內 · ${rowNames.length} 項 × ${dates.length} 次</div>`;
}

// --- CKD-EPI 2021 (race-free) — ported from the user's ckd-calculator ---
// Detect female from various JWT/UI representations of UserSex.
function isFemaleSex(s) {
  const v = String(s || '').trim().toUpperCase();
  return v === 'F' || v === 'FEMALE' || v === '2' || v === '女';
}
// Inputs: Scr in mg/dL, age in years, isFemale boolean. Returns eGFR or null.
function computeEgfr(scr, age, isFemale) {
  if (!(scr > 0) || !(age > 0)) return null;
  const k = isFemale ? 0.7 : 0.9;
  const ratio = scr / k;
  const A = Math.min(ratio, 1);
  const B = Math.max(ratio, 1);
  if (isFemale) {
    return 142 * Math.pow(A, -0.241) * Math.pow(B, -1.200) * Math.pow(0.9938, age) * 1.012;
  }
  return 142 * Math.pow(A, -0.302) * Math.pow(B, -1.200) * Math.pow(0.9938, age);
}
function ckdStage(egfr) {
  // eGFR ≥ 90 alone isn't CKD diagnosis — call it 正常 instead of G1 to avoid
  // alarming clinicians/patients about a perfectly healthy kidney.
  if (egfr >= 90) return '正常';
  if (egfr >= 60) return 'G2';
  if (egfr >= 45) return 'G3a';
  if (egfr >= 30) return 'G3b';
  if (egfr >= 15) return 'G4';
  return 'G5';
}
// Colour cells by stage: 正常 green; G2 default; G3+ progressively redder
function ckdStageStyle(stage) {
  switch (stage) {
    case '正常': return 'color:#2e7d32;font-weight:bold';
    case 'G3a': return 'color:#f57c00;font-weight:bold';
    case 'G3b': return 'color:#e65100;font-weight:bold';
    case 'G4':  return 'color:#d32f2f;font-weight:bold';
    case 'G5':  return 'color:#922;font-weight:bold';
    default:    return 'font-weight:bold';
  }
}

// Friendly reference range text for the cell tooltip (e.g. "12-16", "<140", ">40")
function refDisplay(refStr, orderCode) {
  const range = labRefRange(refStr, orderCode);
  if (!range) return '';
  if (range.min != null && range.max != null) return `${range.min}-${range.max}`;
  if (range.max != null) return `<${range.max}`;
  if (range.min != null) return `>${range.min}`;
  return '';
}

function checkAbnormal(value, reference, orderCode) {
  return labDirection(value, reference, orderCode) !== null;
}

// Resolve a reference range to { min, max }. Handles the hyphen-range-in-one-
// bracket form "[70-100]" / "[0.4-1.1]" / "[-2-3]" (which the extension's
// parseReferenceRange misses — it only knows "[70][100]" and "[7~25]"), then
// falls back to the robust parser for [min][max], <X, ≧X, etc.
function labRefRange(reference, orderCode) {
  const s = String(reference || '');
  const m = s.match(/\[\s*(-?\d*\.?\d+)\s*[-~]\s*(-?\d*\.?\d+)\s*\]/);
  if (m) {
    const lo = parseFloat(m[1]);
    const hi = parseFloat(m[2]);
    if (!isNaN(lo) && !isNaN(hi)) return { min: lo, max: hi };
  }
  try { return parseReferenceRange(reference, orderCode || null, null); } catch { return null; }
}

// 'high' = above reference max, 'low' = below reference min, null = normal/unknown.
function labDirection(value, reference, orderCode) {
  if (value == null || value === '' || value === '***') return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  const range = labRefRange(reference, orderCode);
  if (!range) return null;
  if (range.max != null && num > range.max) return 'high';
  if (range.min != null && num < range.min) return 'low';
  return null;
}

// --- Acupuncture complexity indication (附表 4.4.2 / 4.4.3 / 4.4.4) ---
// 中度複雜性針灸適應症 (附表 4.4.2)
const ACU_MODERATE_PREFIXES = [
  'G43','G50','G51','G52','G54','G61','G62','G63','G65','G90',
  'M13.0','M15','M20','M21','M66',
  'H02','H04','H05','H10','H20','H25','H26','H52'
];

// 特殊疾病適應症 (附表 4.4.3) — 與「一般疾病」併存可申報中度；與中度併存可升級高度
const ACU_SPECIAL_PREFIXES = [
  'A15','B01','B02','B05','B06','B20','B97.2','B97.3',
  'D65','D66','D67','D68','D69','D70','D82','D83','D84',
  'E04','E05','E06','E10','E11','E13','E15','E28',
  'F90','F95',
  'I20','I21','I22','I23','I24','I25','I26','I27','I28',
  'I42','I50','I71','I73','I74','I80','I82','I89',
  'J44','J45','J93','J96','J98',
  'K72','K74','K80',
  'L10','L11','L12','L40','L51','L52','L89','L94','L97',
  'M33','M34','M35',
  'N18','N19',
  'R64'
];

// 高度複雜性針灸適應症 (附表 4.4.4) — 含使用者補列 I69 (腦中風後遺症)
const ACU_HIGH_PREFIXES = [
  'A80',
  'D32','D33','D48','D49',
  'F02','F03','F04','F05','F09',
  'F20','F21','F22','F23','F24','F25',
  'F30','F31','F32','F33','F34','F35','F36','F37','F38','F39',
  'F80','F82','F84',
  'G11','G12','G20','G21','G35','G36','G40','G45','G46',
  'G70','G71','G80','G81','G82','G83','G91','G93','G94',
  'H30','H31','H33','H34','H35','H36','H40','H42','H43',
  'H46','H47','H49','H50','H51','H53','H54','H55',
  'I60','I61','I62','I63','I65','I66','I67',
  'I69', // 補列 — 腦中風後遺症
  'M45','M62.3','M99',
  'P91',
  'Q11','Q12','Q13','Q14','Q15',
  'S01.9','S04','S06.3','S06.4','S06.5','S06.6',
  'S14','S22','S24','S32','S34',
  'S44','S54','S64','S74','S84','S94'
];

function codeMatchesPrefix(code, prefix) {
  if (!code || !prefix) return false;
  // ICD-10-CM codes vary: "M62.3" vs "M62.30" vs "M6230"; some sources drop
  // dots entirely. Normalize both sides by removing dots and upper-casing.
  // All prefixes we use are ≥3 chars (real ICD category), so plain startsWith
  // can't false-match too short prefixes.
  const c = String(code).replace(/\./g, '').toUpperCase().trim();
  const p = String(prefix).replace(/\./g, '').toUpperCase().trim();
  if (!c || !p) return false;
  return c === p || c.startsWith(p);
}

// C00–C96 惡性腫瘤 (高度)
function isCancerCode(code) {
  const m = code && String(code).toUpperCase().replace(/\./g, '').match(/^C(\d{2})/);
  if (!m) return false;
  const n = parseInt(m[1], 10);
  return n >= 0 && n <= 96;
}

// O10–O16, O20–O29 妊娠 (特殊)
function isPregnancyCode(code) {
  const m = code && String(code).toUpperCase().replace(/\./g, '').match(/^O(\d{2})/);
  if (!m) return false;
  const n = parseInt(m[1], 10);
  return (n >= 10 && n <= 16) || (n >= 20 && n <= 29);
}

function collectAllIcdCodes(data) {
  const codes = new Set();
  // ICD code field aliases seen across NHI APIs (uppercase + lowercase + main +
  // secondary diagnosis). Sweep every record across every dataset against every
  // candidate field name so we never miss codes due to schema variance.
  const ICD_FIELDS = [
    'ICD_CODE', 'icd_code', 'ICD_CODE_1', 'icd_code_1',
    'ICD_CODE_2', 'icd_code_2', 'ICD_CODE_3', 'icd_code_3',
    'ICD_CODE_4', 'icd_code_4', 'ICD_CODE_5', 'icd_code_5',
    'icdCode', 'icdcode', 'ICD10_CODE', 'icd10_code',
    'main_icd', 'sub_icd', 'MAIN_ICD', 'SUB_ICD',
    'DIAG_CODE', 'diag_code'
  ];
  const sweep = (items) => {
    if (!Array.isArray(items)) return;
    for (const m of items) {
      if (!m || typeof m !== 'object') continue;
      for (const f of ICD_FIELDS) {
        const v = m[f];
        if (v) codes.add(String(v).trim());
      }
    }
  };
  sweep(data.medicationData?.rObject);
  sweep(data.chinesemedData?.rObject);
  sweep(data.dischargeData?.rObject);
  sweep(data.surgeryData?.rObject);
  sweep(data.patientSummaryData?.rObject);
  const arr = Array.from(codes).filter(Boolean);
  console.log('[NHITW Clinic] Collected ICD codes for classification:', arr);
  return arr;
}

function classifyAcupunctureCodes(codes) {
  const high = new Set();
  const moderate = new Set();
  const special = new Set();
  for (const code of codes) {
    if (isCancerCode(code) || ACU_HIGH_PREFIXES.some(p => codeMatchesPrefix(code, p))) {
      high.add(code);
    }
    if (ACU_MODERATE_PREFIXES.some(p => codeMatchesPrefix(code, p))) {
      moderate.add(code);
    }
    if (isPregnancyCode(code) || ACU_SPECIAL_PREFIXES.some(p => codeMatchesPrefix(code, p))) {
      special.add(code);
    }
  }
  return { high: [...high], moderate: [...moderate], special: [...special] };
}

function getAcupunctureLevel(matches) {
  // 高度 = 命中 4.4.4 OR (命中 4.4.2 中度 + 命中 4.4.3 特殊)
  if (matches.high.length > 0) return 'high';
  if (matches.moderate.length > 0 && matches.special.length > 0) return 'high';
  // 中度 = 命中 4.4.2 OR 命中 4.4.3 (與一般疾病併存)
  if (matches.moderate.length > 0 || matches.special.length > 0) return 'moderate';
  return null;
}

// Codes that actually contributed to the acupuncture badge (high/moderate +
// special hits that satisfied the threshold). Used by the diagnosis panel to
// highlight the matching rows.
function getMatchedAcuCodes(data) {
  const codes = collectAllIcdCodes(data);
  const matches = classifyAcupunctureCodes(codes);
  const level = getAcupunctureLevel(matches);
  if (!level) return new Set();
  const set = new Set();
  matches.high.forEach(c => set.add(c));
  matches.moderate.forEach(c => set.add(c));
  matches.special.forEach(c => set.add(c));
  return set;
}

function getMatchedCancerCodes(data) {
  const codes = collectAllIcdCodes(data);
  const detected = detectCancerCarePlan(codes);
  const set = new Set();
  for (const d of detected) for (const c of d.hits) set.add(c);
  return set;
}

function buildAcupunctureBadge(data) {
  const codes = collectAllIcdCodes(data);
  const matches = classifyAcupunctureCodes(codes);
  const level = getAcupunctureLevel(matches);
  console.log('[NHITW Clinic] Acupuncture matches:', matches, 'level:', level);
  if (!level) return '';

  let label, hitCodes;
  if (level === 'high') {
    label = '⚡ 高度複雜針灸';
    // Reason: codes that triggered high — either direct 4.4.4 hits, or moderate∩special pair
    if (matches.high.length > 0) {
      hitCodes = matches.high;
    } else {
      hitCodes = [...matches.moderate.map(c => c + '(中)'), ...matches.special.map(c => c + '(特)')];
    }
  } else {
    label = '💉 中度複雜針灸';
    hitCodes = [...matches.moderate, ...matches.special.map(c => c + '(特)')];
  }

  const shown = hitCodes.slice(0, 12).join(', ');
  const more = hitCodes.length > 12 ? `… (+${hitCodes.length - 12})` : '';
  const tooltip = `符合 ICD: ${shown}${more}`;
  return `<span class="acu-badge acu-${level}" title="${esc(tooltip)}">${label}</span>`;
}

// --- 中醫癌症病人加強照護整合方案 (特定癌症病人中醫門診加強照護計畫，適用範圍三) ---
// 每個癌種有兩條路徑：
//   path 1 (primary): 主診斷碼直接命中
//   path 2 (mets + secondary): 主診斷為轉移/續發碼 + 次診斷對應原發部位
// 由於健保 API 回傳是逐筆紀錄、未必標明主/次，這裡採寬鬆判定：
// 只要兩組病人病歷裡同時出現過 mets 與 secondary 任一碼即視為符合 path 2。
const CANCER_CARE_TYPES = [
  {
    name: '乳癌',
    primary: ['C50', 'C79.81'],
    mets: ['C77', 'C78.0', 'C78.1', 'C78.2', 'C78.3', 'C78.7', 'C79.2', 'C79.3', 'C79.5', 'C79.6', 'C79.7'],
    secondary: ['C50', 'Z85.3'],
  },
  {
    name: '肝癌',
    primary: ['C22', 'C23', 'C24'],
    mets: ['C77', 'C78.0', 'C78.1', 'C78.2', 'C78.4', 'C78.5', 'C78.6', 'C78.7', 'C78.8', 'C79.3', 'C79.5', 'C79.7', 'Z94.4'],
    secondary: ['C22', 'C23', 'C24', 'Z85.05'],
  },
  {
    name: '肺癌',
    primary: ['C33', 'C34'],
    mets: ['C77', 'C78.0', 'C78.1', 'C78.2', 'C78.3', 'C78.7', 'C79.3', 'C79.5', 'C79.6', 'C79.7', 'Z94.2'],
    secondary: ['C33', 'C34', 'Z85.1'],
  },
  {
    name: '大腸癌',
    primary: ['C18', 'C19', 'C20', 'C21'],
    mets: ['C77', 'C78.0', 'C78.1', 'C78.2', 'C78.4', 'C78.5', 'C78.6', 'C78.7', 'C78.8', 'C79.0', 'C79.3', 'C79.5', 'C79.6', 'C79.7'],
    secondary: ['C18', 'C19', 'C20', 'C21', 'Z85.04'],
  },
  {
    name: '胃癌',
    primary: ['C16', 'C49.A1', 'C49.A2'],
    mets: ['C77', 'C78.0', 'C78.1', 'C78.2', 'C78.3', 'C78.7', 'C79.2', 'C79.3', 'C79.5', 'C79.6', 'C79.7'],
    secondary: ['C16', 'C49.A1', 'C49.A2', 'Z85.028'],
  },
  { name: '攝護腺癌', primary: ['C61'] },
  { name: '口腔癌', primary: ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07', 'C08', 'C09', 'C10'] },
  { name: '子宮頸癌', primary: ['C53'] },
  { name: '子宮體癌', primary: ['C54'] },
  { name: '甲狀腺癌', primary: ['C73'] },
];

function detectCancerCarePlan(codes) {
  const detected = [];
  for (const type of CANCER_CARE_TYPES) {
    const hits = new Set();
    let matched = false;

    // Path 1: direct primary code hit
    for (const c of codes) {
      if (type.primary.some(p => codeMatchesPrefix(c, p))) {
        hits.add(c);
        matched = true;
      }
    }

    // Path 2: 轉移碼 + 次診斷碼 兼具
    if (type.mets && type.secondary) {
      const metHits = codes.filter(c => type.mets.some(p => codeMatchesPrefix(c, p)));
      const secHits = codes.filter(c => type.secondary.some(p => codeMatchesPrefix(c, p)));
      if (metHits.length > 0 && secHits.length > 0) {
        metHits.forEach(c => hits.add(c));
        secHits.forEach(c => hits.add(c));
        matched = true;
      }
    }

    if (matched) detected.push({ name: type.name, hits: [...hits] });
  }
  return detected;
}

function buildCancerCareBadge(data) {
  const codes = collectAllIcdCodes(data);
  const detected = detectCancerCarePlan(codes);
  console.log('[NHITW Clinic] Cancer-care detected:', detected);
  if (detected.length === 0) return '';

  const names = detected.map(d => d.name).join('、');
  const allHits = [...new Set(detected.flatMap(d => d.hits))];
  const shown = allHits.slice(0, 15).join(', ');
  const more = allHits.length > 15 ? `… (+${allHits.length - 15})` : '';
  const tooltip = `符合中醫癌症加強照護方案：${names}\n命中 ICD: ${shown}${more}`;
  return `<span class="cancer-badge" title="${esc(tooltip)}">🎗 癌症專案（${esc(names)}）</span>`;
}

// --- 中醫氣喘專案 ---
// 規則：(1) 病歷裡有任一氣喘 ICD (J45.x，含 J45.0–J45.9 及其延伸碼)
//       (2) 收案年 − 出生年 < 12（不看月日，年差 12 即不符合）
// J45 是 ICD-10-CM 氣喘大分類，涵蓋過敏性/非過敏性/混合型/輕中重度等所有變體。
function findAsthmaIcdCodes(data) {
  const all = collectAllIcdCodes(data);
  return all.filter(c => codeMatchesPrefix(c, 'J45'));
}
// 年差 = 今年 − 出生 AD 年；patientMeta.birthday 是 ROC YYYMMDD 字串。
// 回傳 null 表示無法判定（沒有出生日）。
function getEnrollmentYearDiff(patientMeta) {
  const birthday = String(patientMeta?.birthday || '');
  if (birthday.length !== 7) return null;
  const rocYear = parseInt(birthday.substring(0, 3), 10);
  if (isNaN(rocYear)) return null;
  const adBirthYear = rocYear + 1911;
  return new Date().getFullYear() - adBirthYear;
}
function getMatchedAsthmaCodes(data, patientMeta = {}) {
  const set = new Set();
  const diff = getEnrollmentYearDiff(patientMeta);
  if (diff === null || diff >= 12) return set;
  for (const c of findAsthmaIcdCodes(data)) set.add(c);
  return set;
}
function buildAsthmaBadge(data, patientMeta = {}) {
  const diff = getEnrollmentYearDiff(patientMeta);
  const codes = findAsthmaIcdCodes(data);
  console.log('[NHITW Clinic] Asthma check: yearDiff=' + diff + ', J45 codes=' + JSON.stringify(codes));
  if (diff === null || diff >= 12 || codes.length === 0) return '';
  const shown = codes.slice(0, 8).join(', ');
  const more = codes.length > 8 ? `… (+${codes.length - 8})` : '';
  const tooltip = `符合中醫氣喘專案：收案年−出生年=${diff} (<12)，曾下氣喘診斷\n命中 ICD: ${shown}${more}`;
  return `<span class="asthma-badge" title="${esc(tooltip)}">🫁 氣喘專案（年差${diff}）</span>`;
}

// --- 中醫慢性腎臟病門診加強照護方案 ---
// eGFR is computed via CKD-EPI 2021 from the latest serum Cr + patient age/sex.
// Proteinuria check piggy-backs on the lab's own reference range (labDirection
// returns 'high' for any UPCR / UACR row above its consult_value upper bound),
// which sidesteps the messy unit issue across labs (some report raw mg/dL urine
// protein, some report mg/g ratio — the lab knows its own thresholds either
// way, so its 'high' flag is the most reliable signal).
function getLatestLabValue(labData, canonical) {
  if (!labData?.rObject) return null;
  let best = null;
  for (const l of labData.rObject) {
    if (canonicalLabName(l) !== canonical) continue;
    const d = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!d) continue;
    if (!best || d > best.date) best = { date: d, value: l.assay_value, code: l.order_code || '', ref: l.consult_value || '' };
  }
  return best;
}
function findAbnormalProteinuria(labData) {
  if (!labData?.rObject) return null;
  // Pick the LATEST UPCR or UACR record per name, then test it
  const latestByName = {};
  for (const l of labData.rObject) {
    const n = canonicalLabName(l);
    if (n !== 'UPCR' && n !== 'UACR') continue;
    const d = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!d) continue;
    if (!latestByName[n] || d > latestByName[n].date) {
      latestByName[n] = { date: d, value: l.assay_value, ref: l.consult_value || '', code: l.order_code || '', name: n };
    }
  }
  for (const rec of Object.values(latestByName)) {
    if (labDirection(rec.value, rec.ref, rec.code) === 'high') return rec;
  }
  return null;
}
function buildCkdBadge(data, patientMeta = {}) {
  const cr = getLatestLabValue(data?.labData, 'Cr');
  if (!cr) return '';
  const scr = parseFloat(cr.value);
  if (!(scr > 0)) return '';
  if (scr > 15) {
    console.warn('[NHITW Clinic] CKD badge: ignoring Cr=' + scr + ' (not plausible as serum)');
    return '';
  }
  const age = patientMeta?.age;
  if (typeof age !== 'number' || age <= 0 || !patientMeta?.sex) return '';
  const isFemale = isFemaleSex(patientMeta.sex);
  const egfr = computeEgfr(scr, age, isFemale);
  console.log('[NHITW Clinic] CKD check: Cr=' + scr + ' (' + cr.date + ') age=' + age + ' female=' + isFemale + ' → eGFR=' + (egfr != null ? egfr.toFixed(1) : 'null'));
  if (egfr == null) return '';
  const stage = ckdStage(egfr);
  if (stage === '正常') return '';

  // <60 (G3a/b/4/5) — eligible regardless of proteinuria
  if (egfr < 60) {
    const tip = `eGFR ${egfr.toFixed(1)} mL/min/1.73m² (${stage})，符合中醫慢性腎臟病門診加強照護計畫\n依據：Cr=${scr} mg/dL @ ${cr.date}\n需主診斷 ICD-10 N18.2-N18.6`;
    return `<span class="ckd-badge ckd-eligible" title="${esc(tip)}">🫘 CKD 收案 (${stage})</span>`;
  }

  // G2 (60-89.9) — needs proteinuria/hematuria
  const prot = findAbnormalProteinuria(data?.labData);
  if (prot) {
    const tip = `eGFR ${egfr.toFixed(1)} (${stage}) + ${prot.name}=${prot.value} 超標 (參考 ${prot.ref || '無'}) @ ${prot.date}\n符合 stage 2 收案條件 — 需主診斷 ICD-10 N18.2-N18.6`;
    return `<span class="ckd-badge ckd-eligible" title="${esc(tip)}">🫘 CKD 收案 (stage 2 + 蛋白尿)</span>`;
  }
  const tip = `eGFR ${egfr.toFixed(1)} (${stage})；stage 2 收案需 UPCR≥150 mg/g、UACR≥30 mg/g（糖尿病）或血尿，請臨床判斷\n依據：Cr=${scr} mg/dL @ ${cr.date}`;
  return `<span class="ckd-badge ckd-watch" title="${esc(tip)}">🫘 CKD 待確認 (stage 2)</span>`;
}

// --- ATC5 Classification (matches extension's medicationGroups.js) ---
const ATC5_GROUPS = {
  NSAID: ['M01AA', 'M01AB', 'M01AC', 'M01AE', 'M01AG', 'M01AH'],
  ACEI: ['C09AA', 'C09BA', 'C09BB', 'C09BX'],
  ARB: ['C09CA', 'C09DA', 'C09DB', 'C09DX'],
  STATIN: ['C10AA', 'C10BA', 'C10BX'],
  SGLT2: ['A10BK', 'A10BD15', 'A10BD16', 'A10BD19', 'A10BD20', 'A10BD21', 'A10BD25', 'A10BD27', 'A10BD29', 'A10BD30'],
  GLP1: ['A10BJ', 'A10AE54', 'A10AE56'],
  '\u6297\u51DD': ['B01A'], // 抗凝
};

const ATC5_COLOR_GROUPS = {
  red: ['\u6297\u51DD', 'NSAID'],    // 抗凝, NSAID
  orange: ['ARB', 'ACEI', 'STATIN'],
  green: ['SGLT2', 'GLP1'],
};

const COLOR_STYLES = {
  red: { bg: '#fde8e8', border: '#e53935', text: '#b71c1c' },
  orange: { bg: '#fff3e0', border: '#fb8c00', text: '#e65100' },
  green: { bg: '#e8f5e9', border: '#43a047', text: '#1b5e20' },
};

function getAtc5Group(atcCode) {
  if (!atcCode) return null;
  for (const [groupName, codes] of Object.entries(ATC5_GROUPS)) {
    if (codes.some(code => code.length === 7 ? atcCode === code : atcCode.startsWith(code))) {
      return groupName;
    }
  }
  return null;
}

function getColorForGroup(groupName) {
  for (const [color, groups] of Object.entries(ATC5_COLOR_GROUPS)) {
    if (groups.includes(groupName)) return color;
  }
  return null;
}

function isWithinDays(dateStr, days) {
  if (!dateStr) return false;
  let d = new Date(dateStr);
  if (isNaN(d.getTime()) && dateStr.includes('/')) {
    d = new Date(dateStr.replace(/\//g, '-'));
  }
  if (isNaN(d.getTime())) return false;
  return (Date.now() - d.getTime()) <= days * 86400000;
}

// --- West Med Panel (matches extension's Important Medications logic) ---
function buildWestMedPanel(items, trackingDays) {
  if (!items || items.length === 0) return '<p class="empty">無西藥紀錄</p>';
  const days = trackingDays || 100;

  // Step 1: Filter meds within tracking period that match ATC5 groups
  const matchedMeds = [];
  for (const m of items) {
    const date = m.PER_DATE || m.drug_date || '';
    if (!isWithinDays(date, days)) continue;

    const atcCode = m.ATC_CODE || m.drug_atc7_code || '';
    const groupName = getAtc5Group(atcCode);
    if (!groupName) continue;

    const colorName = getColorForGroup(groupName);
    if (!colorName) continue;

    matchedMeds.push({
      name: m.MED_DESC || m.MED_ITEM || m.drug_ename || '',
      generic: m.GENERIC_NAME || m.drug_ing_name || '',
      date: parseDate(date),
      hosp: parseHosp(m.HOSP_NAME || m.hosp),
      freq: m.FREQ_DESC || m.drug_fre || '',
      medDays: m.MED_DAYS || m.day || '',
      drugLeft: m.DRUG_LEFT || m.drug_left || '',
      groupName,
      colorName,
    });
  }

  if (matchedMeds.length === 0) return '<p class="empty">無關注西藥紀錄</p>';

  // Step 2: Group by color → group → deduplicate by name
  const colorOrder = ['red', 'orange', 'green'];
  const byColor = {};
  for (const m of matchedMeds) {
    if (!byColor[m.colorName]) byColor[m.colorName] = {};
    if (!byColor[m.colorName][m.groupName]) byColor[m.colorName][m.groupName] = {};
    const key = m.name;
    if (!byColor[m.colorName][m.groupName][key]) {
      byColor[m.colorName][m.groupName][key] = { ...m, prescriptions: [] };
    }
    byColor[m.colorName][m.groupName][key].prescriptions.push({
      date: m.date, hosp: m.hosp, days: m.medDays, drugLeft: m.drugLeft
    });
  }

  // Step 3: Render as table
  let rows = '';
  for (const color of colorOrder) {
    if (!byColor[color]) continue;
    const style = COLOR_STYLES[color];
    for (const [groupName, meds] of Object.entries(byColor[color])) {
      for (const med of Object.values(meds)) {
        // Sort prescriptions newest first
        med.prescriptions.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        const presStr = med.prescriptions.slice(0, 3).map(p =>
          `<span class="med-pres">${esc(shortDate(p.date))} ${esc(p.hosp)}${p.drugLeft && p.drugLeft !== '0' ? ` <span class="drug-left">餘${p.drugLeft}天</span>` : ''}</span>`
        ).join(' ');

        rows += `<tr>
          <td class="atc-badge-cell"><span class="atc-badge" style="background:${style.bg};border-color:${style.border};color:${style.text}">${esc(groupName)}</span></td>
          <td class="med-name-cell">${esc(med.name)}</td>
          <td class="med-pres-cell">${presStr}</td>
        </tr>`;
      }
    }
  }

  return `<table class="important-med-table">
    <tbody>${rows}</tbody>
  </table>
  <div class="tracking-note">${days} 天內</div>`;
}

// --- Other West Med Panel (meds NOT in focused ATC5 groups) ---
function buildOtherWestMedPanel(items, trackingDays) {
  if (!items || items.length === 0) return '<p class="empty">無西藥紀錄</p>';
  const days = trackingDays || 100;

  // Filter meds within tracking period that DON'T match any ATC5 group
  const otherMeds = [];
  for (const m of items) {
    const date = m.PER_DATE || m.drug_date || '';
    if (!isWithinDays(date, days)) continue;

    const atcCode = m.ATC_CODE || m.drug_atc7_code || '';
    const groupName = getAtc5Group(atcCode);
    if (groupName) continue; // Skip focused meds

    otherMeds.push({
      name: m.MED_DESC || m.MED_ITEM || m.drug_ename || '',
      generic: m.GENERIC_NAME || m.drug_ing_name || '',
      date: parseDate(date),
      hosp: parseHosp(m.HOSP_NAME || m.hosp),
      icd: m.ICD_CODE || m.icd_code || '',
      icdName: m.ICD_NAME || m.icd_cname || '',
      freq: m.FREQ_DESC || m.drug_fre || '',
      medDays: m.MED_DAYS || m.day || '',
      drugLeft: m.DRUG_LEFT || m.drug_left || '',
    });
  }

  if (otherMeds.length === 0) return '<p class="empty">無其他西藥紀錄</p>';

  // Group by date + hospital
  const groups = {};
  for (const m of otherMeds) {
    const key = `${m.date}|${m.hosp}`;
    if (!groups[key]) groups[key] = { date: m.date, hosp: m.hosp, icd: m.icd, icdName: m.icdName, meds: [] };
    groups[key].meds.push(m);
  }

  // Sort groups by date descending
  const sortedGroups = Object.values(groups).sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  let html = '';
  for (const g of sortedGroups) {
    html += `<div class="med-group-header">${esc(shortDate(g.date))} ${esc(g.hosp)}`;
    if (g.icd) html += ` <span class="diag-code">${esc(g.icd)}</span>`;
    html += '</div>';
    for (const m of g.meds) {
      const suffix = [m.freq, m.medDays ? m.medDays + '天' : '', m.drugLeft && m.drugLeft !== '0' ? `餘${m.drugLeft}天` : ''].filter(Boolean).join(' ');
      html += `<div class="med-item">${esc(m.name)} <span class="med-detail">${esc(suffix)}</span></div>`;
    }
  }
  html += `<div class="tracking-note">${days} 天內</div>`;
  return html;
}

// --- Chinese Med Panel ---
function buildChineseMedPanel(items) {
  if (!items || items.length === 0) return '<p class="empty">無中藥紀錄</p>';

  const groups = {};
  for (const m of items) {
    const date = parseDate(m.func_date || '');
    const hosp = parseHosp(m.hosp);
    const key = `${date}|${hosp}`;
    if (!groups[key]) groups[key] = { date, hosp, icd: m.icd_code || '', icdName: m.icd_cname || '', meds: [] };
    groups[key].meds.push(m);
  }

  let html = '';
  for (const g of Object.values(groups)) {
    html += `<div class="med-group-header">${esc(shortDate(g.date))} ${esc(g.hosp)}`;
    if (g.icd) html += ` <span class="diag-code">${esc(g.icd)}</span>`;
    html += '</div>';
    for (const m of g.meds) {
      const name = m.drug_perscrn_name || m.cdrug_name || '';
      const qty = m.order_qty || '';
      const freq = m.drug_fre || '';
      const days = m.day || '';
      html += `<div class="med-item">${esc(name)} <span class="med-detail">${esc(qty)} ${esc(freq)} ${days ? days+'天' : ''}</span></div>`;
    }
  }
  return html;
}

// --- Focused Image Tests (matches extension's imageTests.js) ---
const FOCUSED_IMAGE_CODES = new Set([
  '33085B', '33084B',  // MRI
  '33072B', '33070B',  // CT
  '19009C', '19001C',  // Abdominal/Other ultrasound
  '18006C',            // Cardiac echo
  '28016C',            // Endoscopy
]);

// --- Imaging Panel (180-day, focused tests only) ---
function buildImagingPanel(items) {
  if (!items || items.length === 0) return '<p class="empty">無影像資料</p>';
  const IMAGE_TRACKING_DAYS = 180;

  // Filter: within tracking days, matches focused codes
  const filtered = items.filter(i => {
    const date = i.real_inspect_date || i.case_time || i.recipe_date || '';
    if (!isWithinDays(date, IMAGE_TRACKING_DAYS)) return false;
    const code = i.order_code || '';
    return FOCUSED_IMAGE_CODES.has(code);
  });

  if (filtered.length === 0) return `<p class="empty">${IMAGE_TRACKING_DAYS}天內無關注的影像檢查</p>`;

  // Deduplicate: same date + orderName + order_code = 1 entry
  const seen = new Set();
  const deduped = [];
  for (const i of filtered) {
    const date = parseDate(i.real_inspect_date || i.case_time || i.recipe_date || '');
    const name = i.order_name || '';
    const code = i.order_code || '';
    const key = `${date}|${name}|${code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(i);
  }

  // Sort newest first
  deduped.sort((a, b) => {
    const da = parseDate(a.real_inspect_date || a.case_time || a.recipe_date || '');
    const db = parseDate(b.real_inspect_date || b.case_time || b.recipe_date || '');
    return db.localeCompare(da);
  });

  let html = '';
  for (const i of deduped) {
    const date = shortDate(i.real_inspect_date || i.case_time || i.recipe_date || '');
    let name = i.order_name || '';
    // Clean name: remove brackets and semicolons
    name = name.replace(/[[\]]/g, '').replace(/;/g, ' ').trim();
    const hosp = parseHosp(i.hosp);
    const result = i.inspect_result || '';
    html += `<div class="imaging-item">`;
    html += `<div class="imaging-name">${esc(name)}</div>`;
    html += `<div class="imaging-meta">${esc(date)} ${esc(hosp)}</div>`;
    if (result) html += `<div class="imaging-result">${esc(result)}</div>`;
    html += `</div>`;
  }
  html += `<div class="tracking-note">${IMAGE_TRACKING_DAYS} 天內</div>`;
  return html;
}

// --- Allergy Panel ---
function buildAllergyPanel(items) {
  if (!items || items.length === 0) return '<p class="empty">無過敏紀錄</p>';
  const filtered = items.filter(i => {
    const n = i.drug_name || '';
    return n && !n.includes('未記錄') && n !== 'NP' && n !== 'N.P' && n !== 'N.P.' && !n.includes('未過敏');
  });
  if (filtered.length === 0) return '<p class="empty">無過敏紀錄</p>';

  let html = '';
  for (const a of filtered) {
    const drug = a.drug_name || '';
    const symptom = (a.sympton_name || '').replace(/;/g, ', ');
    html += `<div class="allergy-item"><strong>${esc(drug)}</strong>${symptom ? ` — ${esc(symptom)}` : ''}</div>`;
  }
  return html;
}

// --- Surgery Panel ---
function buildSurgeryPanel(items) {
  if (!items || items.length === 0) return '';
  let html = '';
  for (const s of items) {
    const date = shortDate(s.exe_s_date || '');
    const hosp = parseHosp(s.hosp);
    const name = s.icd_cname || s.icd_code || '';
    html += `<div class="record-item">${esc(date)} ${esc(hosp)} — ${esc(name)}</div>`;
  }
  return html;
}

// --- Discharge Panel ---
function buildDischargePanel(items) {
  if (!items || items.length === 0) return '';
  let html = '';
  for (const d of items) {
    const inD = shortDate(d.in_date || '');
    const outD = shortDate(d.out_date || '');
    const hosp = parseHosp(d.hosp);
    const name = d.icd_cname || d.icd_code || '';
    html += `<div class="record-item">${esc(inD)}~${esc(outD)} ${esc(hosp)} — ${esc(name)}</div>`;
  }
  return html;
}

// --- Adult Health Check / Cancer Screening / HBCV data unwrappers ---
// The same payload arrives in different shapes depending on whether it came
// through the normalized rObject path, the legacy originalData path, or as a
// raw direct object. Mirror Overview_*.jsx logic so we accept all of them.
function unwrapAdult(raw) {
  if (!raw) return null;
  if (Array.isArray(raw.rObject) && raw.rObject[0]) return raw.rObject[0];
  if (raw.originalData?.robject) return raw.originalData.robject;
  if (raw.result_data) return raw;
  return null;
}
function unwrapCancer(raw) {
  if (!raw) return null;
  if (Array.isArray(raw.rObject) && raw.rObject[0]) return raw.rObject[0];
  if (raw.originalData?.robject) return raw.originalData.robject;
  if (raw.colorectal || raw.oralMucosa || raw.mammography || raw.papSmears || raw.lungCancer) return raw;
  return null;
}
function unwrapHbcv(raw) {
  if (!raw) return null;
  if (Array.isArray(raw.rObject) && raw.rObject[0]) return raw.rObject[0];
  if (raw.originalData?.robject) return raw.originalData.robject;
  if (raw.result_data || raw.med_data) return raw;
  return null;
}

function buildAdultHealthCheckPanel(raw) {
  const d = unwrapAdult(raw);
  if (!d || !Array.isArray(d.result_data) || d.result_data.length === 0) return '';
  const latest = d.result_data[0];
  const v = (x) => (x === undefined || x === null || x === '') ? '—' : esc(String(x));
  return `<div class="hc-title">${v(latest.title || '最近一次')}</div>
    <div class="hc-row">身高 <b>${v(latest.height)}</b> / 體重 <b>${v(latest.weight)}</b> / BMI <b>${v(latest.bmi)}</b> / 腰圍 <b>${v(latest.waistline)}</b></div>
    <div class="hc-row">血壓 <b>${v(latest.base_sbp)}/${v(latest.base_ebp)}</b></div>
    <div class="hc-row">Chol <b>${v(latest.cho)}</b> / TG <b>${v(latest.blod_tg)}</b> / LDL <b>${v(latest.ldl)}</b> / HDL <b>${v(latest.hdl)}</b> / 血糖 <b>${v(latest.s_09005c)}</b></div>
    <div class="hc-row">BUN <b>${v(latest.urine_bun)}</b> / Cr <b>${v(latest.blod_creat)}</b> / GFR <b>${v(latest.egfr)}</b> / 尿蛋白 <b>${v(latest.urine_protein)}</b></div>
    <div class="hc-row">GOT <b>${v(latest.sgot)}</b> / GPT <b>${v(latest.sgpt)}</b></div>`;
}

function buildCancerScreeningPanel(raw) {
  const d = unwrapCancer(raw);
  if (!d) return '';
  const types = [
    ['colorectal', '糞便潛血'],
    ['oralMucosa', '口腔黏膜'],
    ['mammography', '乳房攝影'],
    ['papSmears', '子宮頸癌'],
    ['lungCancer', '肺癌篩檢'],
  ];
  const rows = [];
  for (const [key, label] of types) {
    const sub = d[key]?.subData;
    if (Array.isArray(sub) && sub.length > 0) {
      const last = sub[0];
      const result = last.result || '無資料';
      const abnormal = result === '異常';
      const meta = [last.func_date, last.hosp_abbr].filter(Boolean).join(' ');
      rows.push(`<div class="scr-row ${abnormal ? 'scr-abnormal' : ''}"><span class="scr-label">${esc(label)}</span><span class="scr-result">${esc(result)}</span>${meta ? `<span class="scr-meta">${esc(meta)}</span>` : ''}</div>`);
    }
  }
  if (rows.length === 0) return '';
  return rows.join('');
}

function buildHbcvPanel(raw) {
  const d = unwrapHbcv(raw);
  if (!d) return '';
  let html = '';
  if (Array.isArray(d.result_data) && d.result_data.length > 0) {
    html += '<div class="hbcv-sec">檢驗結果</div>';
    for (const r of d.result_data) {
      const dir = labDirection(r.assay_value, r.consult_value, r.order_code);
      const cls = dir === 'high' ? 'lab-high' : dir === 'low' ? 'lab-low' : '';
      html += `<div class="hbcv-row"><span class="hbcv-name">${esc(r.assay_item_name || '')}</span> <span class="${cls}">${esc(r.assay_value || '')}</span> <span class="hbcv-meta">${esc(r.real_inspect_date || '')}</span></div>`;
    }
  }
  if (Array.isArray(d.med_data) && d.med_data.length > 0) {
    html += '<div class="hbcv-sec">治療藥物</div>';
    for (const m of d.med_data) {
      const hosp = m.hosp ? String(m.hosp).split(';')[0] : '';
      html += `<div class="hbcv-row"><span class="hbcv-name">${esc(m.drug_ing_name || '')}</span> <span class="hbcv-meta">${esc(m.func_date || '')} ${esc(hosp)}</span></div>`;
    }
  }
  return html;
}

// --- Full HTML ---
function buildFullHtml(name, id, dateStr, panels) {
  // Build optional small sections for right column
  let rightExtra = '';
  if (panels.allergyHtml && !panels.allergyHtml.includes('無過敏')) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">⚠ 過敏紀錄</div><div class="panel-body">${panels.allergyHtml}</div></div>`;
  }
  if (panels.surgeryHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🔪 手術紀錄</div><div class="panel-body">${panels.surgeryHtml}</div></div>`;
  }
  if (panels.dischargeHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🏥 出院摘要</div><div class="panel-body">${panels.dischargeHtml}</div></div>`;
  }
  if (panels.adultHealthHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🩺 成人預防保健</div><div class="panel-body">${panels.adultHealthHtml}</div></div>`;
  }
  if (panels.cancerScreeningHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🔬 四癌篩檢</div><div class="panel-body">${panels.cancerScreeningHtml}</div></div>`;
  }
  if (panels.hbcvHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🧫 B/C 肝專區</div><div class="panel-body">${panels.hbcvHtml}</div></div>`;
  }

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(name)} — 醫療資料報告</title>
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
.panel-title::before { content:'▾ '; font-size:12px; }
.panel-title.collapsed::before { content:'▸ '; }
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
.lab-pivot .lab-item-name { text-align:left; font-weight:600; white-space:nowrap; position:sticky; left:0; background:#fff; z-index:1; }
.lab-pivot .lab-unit { color:#999; font-weight:400; font-size:10px; margin-left:4px; }
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
  .panel-title::before { content:'▾ ' !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${esc(name)}${panels.acuBadgeHtml || ''}${panels.cancerBadgeHtml || ''}${panels.asthmaBadgeHtml || ''}${panels.ckdBadgeHtml || ''}</h1>
    <div class="meta">${esc(id)}${panels.patientMetaLine ? ' ｜ ' + esc(panels.patientMetaLine) : ''} ｜ ${esc(dateStr)}</div>
  </div>
  <div class="actions">
    <a onclick="expandAll()">全部展開</a>
    <a onclick="collapseAll()">全部收合</a>
    <a onclick="window.print()">列印</a>
  </div>
</div>

<div class="layout">
  <!-- Left Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">就醫診斷與收案</div>
      <div class="panel-body">${panels.diagnosisHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">關注西藥</div>
      <div class="panel-body">${panels.westMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">其他西藥</div>
      <div class="panel-body collapsed">${panels.otherWestMedHtml}</div>
    </div>
    <div class="panel">
      <div class="panel-title collapsed" onclick="togglePanel(this)">中藥用藥</div>
      <div class="panel-body collapsed">${panels.chineseMedHtml}</div>
    </div>
  </div>

  <!-- Center Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">關注檢驗</div>
      <div class="panel-body" style="padding:0;">${panels.labPivotHtml}</div>
    </div>
  </div>

  <!-- Right Column -->
  <div class="column">
    <div class="panel">
      <div class="panel-title" onclick="togglePanel(this)">關注影像</div>
      <div class="panel-body">${panels.imagingHtml}</div>
    </div>
    ${rightExtra}
  </div>
</div>

<div class="clinic-credit">八德仁德風澤　王文洲醫師</div>

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
function copyLabColumn(th) {
  var idx = th.cellIndex;
  var shortDate = th.dataset.short || '';
  var table = th.closest('table');
  if (!table) return;
  var parts = [];
  table.querySelectorAll('tbody tr').forEach(function(tr) {
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
</script>
</body>
</html>`;
}
