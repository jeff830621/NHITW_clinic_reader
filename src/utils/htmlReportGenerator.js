/**
 * htmlReportGenerator.js
 * Generates a self-contained HTML report matching the extension's Overview layout.
 */

export function generateHtmlReport(patientName, patientId, data) {
  const now = new Date();
  const dateStr = formatDateTime(now);

  // Pre-compute ICD codes flagged by the badges so the diagnosis panel can
  // highlight the same codes the badges fired on.
  const acuMatchedCodes = getMatchedAcuCodes(data);
  const cancerMatchedCodes = getMatchedCancerCodes(data);
  const highlightSets = { acu: acuMatchedCodes, cancer: cancerMatchedCodes };

  // Build each panel
  const diagnosisHtml = buildDiagnosisPanel(data, highlightSets);
  const labPivotHtml = buildLabPivotPanel(data.labData?.rObject);
  const westMedHtml = buildWestMedPanel(data.medicationData?.rObject, 100);
  const otherWestMedHtml = buildOtherWestMedPanel(data.medicationData?.rObject, 100);
  const chineseMedHtml = buildChineseMedPanel(data.chinesemedData?.rObject);
  const imagingHtml = buildImagingPanel(data.imagingData?.rObject);
  const allergyHtml = buildAllergyPanel(data.allergyData?.rObject);
  const surgeryHtml = buildSurgeryPanel(data.surgeryData?.rObject);
  const dischargeHtml = buildDischargePanel(data.dischargeData?.rObject);
  const acuBadgeHtml = buildAcupunctureBadge(data);
  const cancerBadgeHtml = buildCancerCareBadge(data);

  return buildFullHtml(patientName, patientId, dateStr, {
    diagnosisHtml, labPivotHtml, westMedHtml, otherWestMedHtml, chineseMedHtml,
    imagingHtml, allergyHtml, surgeryHtml, dischargeHtml, acuBadgeHtml, cancerBadgeHtml
  });
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

// --- Diagnosis Panel (180-day, grouped by visit type, sorted by frequency) ---
function buildDiagnosisPanel(data, highlightSets = {}) {
  const DIAG_TRACKING_DAYS = 180;
  const acuSet = highlightSets.acu || new Set();
  const cancerSet = highlightSets.cancer || new Set();
  // Returns CSS class names to apply to a diag-item based on its ICD code
  const matchClass = (code) => {
    const c = String(code || '').trim();
    const cls = [];
    if (acuSet.has(c)) cls.push('diag-acu-match');
    if (cancerSet.has(c)) cls.push('diag-cancer-match');
    return cls.join(' ');
  };
  // Collect from western + chinese meds (they have visit type info via hosp field)
  const outpatient = {}; // code -> { code, name, count }
  const emergency = [];
  const inpatient = {};  // code -> first record
  const vaccine = [];

  function processItems(items, dateField, hospField, icdCodeField, icdNameField, atcField) {
    if (!items) return;
    for (const m of items) {
      const date = m[dateField] || '';
      if (!isWithinDays(date, DIAG_TRACKING_DAYS)) continue;
      const code = m[icdCodeField] || '';
      const name = m[icdNameField] || '';
      if (!code || !name) continue;
      const hospRaw = m[hospField] || '';
      const hospParts = hospRaw.split(';');
      const hosp = hospParts[0]?.trim() || '';
      const visitType = hospParts[1]?.trim() || '門診';

      // Check for vaccine: ICD Z23-Z27 + ATC J07
      const atcCode = atcField ? (m[atcField] || '') : '';
      if (/^Z2[3-7]/.test(code) && atcCode.startsWith('J07')) {
        vaccine.push({ code, name, date: parseDate(date), hosp });
        continue;
      }

      if (visitType.includes('急診')) {
        emergency.push({ code, name, date: parseDate(date), hosp });
      } else if (visitType.includes('住診') || visitType.includes('住院')) {
        if (!inpatient[code]) inpatient[code] = { code, name, date: parseDate(date), hosp };
      } else {
        // 門診
        if (!outpatient[code]) outpatient[code] = { code, name, count: 0 };
        outpatient[code].count++;
      }
    }
  }

  processItems(data.medicationData?.rObject, 'PER_DATE', 'HOSP_NAME', 'ICD_CODE', 'ICD_NAME', 'ATC_CODE');
  // Fallback field names
  const allMeds = data.medicationData?.rObject || [];
  if (allMeds.length > 0 && !allMeds[0].PER_DATE) {
    processItems(allMeds, 'drug_date', 'hosp', 'icd_code', 'icd_cname', 'drug_atc7_code');
  }
  processItems(data.chinesemedData?.rObject, 'func_date', 'hosp', 'icd_code', 'icd_cname', null);

  // Build HTML
  let html = '';

  // Outpatient (sorted by frequency desc)
  const opList = Object.values(outpatient).sort((a, b) => b.count - a.count);
  if (opList.length > 0) {
    for (const d of opList.slice(0, 8)) {
      html += `<div class="diag-item ${matchClass(d.code)}"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-count">${d.count}</span></div>`;
    }
    if (opList.length > 8) html += `<div class="diag-more">還有 ${opList.length - 8} 筆</div>`;
  }

  // Emergency
  if (emergency.length > 0) {
    html += '<div class="visit-type-label emergency-label">急診</div>';
    for (const d of emergency.slice(0, 5)) {
      html += `<div class="diag-item ${matchClass(d.code)}"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-meta">${esc(d.date)}</span></div>`;
    }
  }

  // Inpatient
  const ipList = Object.values(inpatient);
  if (ipList.length > 0) {
    html += '<div class="visit-type-label inpatient-label">住診</div>';
    for (const d of ipList.slice(0, 5)) {
      html += `<div class="diag-item ${matchClass(d.code)}"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)}</div>`;
    }
  }

  // Vaccine
  if (vaccine.length > 0) {
    html += '<div class="visit-type-label vaccine-label">疫苗</div>';
    for (const d of vaccine.slice(0, 5)) {
      html += `<div class="diag-item ${matchClass(d.code)}"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-meta">${esc(d.date)}</span></div>`;
    }
  }

  if (!html) return '<p class="empty">無診斷紀錄</p>';
  return html;
}

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
function buildLabPivotPanel(items) {
  if (!items || items.length === 0) return '<p class="empty">無檢驗資料</p>';
  const LAB_TRACKING_DAYS = 180;

  const labItems = items.filter(l => {
    const v = l.assay_value;
    if (!v || String(v).trim() === '' || String(v).trim() === '***') return false;
    const date = l.real_inspect_date || l.recipe_date || '';
    return isWithinDays(date, LAB_TRACKING_DAYS);
  });

  if (labItems.length === 0) return '<p class="empty">無檢驗資料</p>';

  // Collapse known multi-item codes (CBC sub-items, Cr+GFR pair) into their
  // short FOCUSED names; everything else uses assay_item_name as-is.
  function getDisplayName(l) {
    const code = l.order_code || '';
    const raw = (l.assay_item_name || l.order_name || '').toLowerCase();
    if (code === '08011C') {
      if (raw.includes('hb') || raw.includes('hemoglobin') || raw.includes('血色素')) return 'Hb';
      if (raw.includes('wbc') || raw.includes('白血球')) return 'WBC';
      if (raw.includes('plt') || raw.includes('platelet') || raw.includes('血小板')) return 'Platelet';
    }
    if (code === '09015C') {
      if (raw.includes('gfr') || raw.includes('腎絲球')) return 'GFR';
      return 'Cr';
    }
    if (code === '09040C' && (raw.includes('upcr') || raw.includes('protein'))) return 'UPCR';
    if (code === '12111C' && (raw.includes('uacr') || raw.includes('albumin'))) return 'UACR';
    const focused = FOCUSED_LAB_TESTS.find(t => t.orderCode === code && !t.subItem);
    if (focused) return focused.name;
    return l.assay_item_name || l.order_name || code || '?';
  }

  const dateSet = new Set();
  const itemMap = {};
  let seq = 0;

  for (const l of labItems) {
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!date) continue;
    const value = String(l.assay_value).trim();
    const ref = l.consult_value || '';
    const name = getDisplayName(l);
    dateSet.add(date);
    if (!itemMap[name]) itemMap[name] = { name, code: l.order_code || '', dates: {}, order: seq++ };
    itemMap[name].dates[date] = { value, ref, dir: checkAbnormalDirection(value, ref) };
  }

  // Newest column leftmost
  const dates = [...dateSet].sort((a, b) => b.localeCompare(a));

  // Focused tests first (in defined order), then others by first-seen order
  const focusedOrder = new Map();
  FOCUSED_LAB_TESTS.forEach((t, i) => { if (!focusedOrder.has(t.name)) focusedOrder.set(t.name, i); });
  const rowNames = Object.keys(itemMap).sort((a, b) => {
    const fa = focusedOrder.has(a) ? focusedOrder.get(a) : 1000 + itemMap[a].order;
    const fb = focusedOrder.has(b) ? focusedOrder.get(b) : 1000 + itemMap[b].order;
    return fa - fb;
  });

  if (dates.length === 0 || rowNames.length === 0) return '<p class="empty">無檢驗資料</p>';

  let thead = '<tr><th class="lab-item-col">項目</th>';
  for (const d of dates) thead += `<th class="lab-date-col">${esc(fullDate(d))}</th>`;
  thead += '</tr>';

  let tbody = '';
  for (const name of rowNames) {
    const item = itemMap[name];
    tbody += `<tr><td class="lab-item-name" title="${esc(item.code)}">${esc(name)}</td>`;
    for (const d of dates) {
      const cell = item.dates[d];
      if (cell) {
        const cls = cell.dir === 'high' ? 'lab-high' : cell.dir === 'low' ? 'lab-low' : '';
        tbody += `<td class="${cls}" title="${esc(cell.ref)}">${esc(cell.value)}</td>`;
      } else {
        tbody += '<td class="no-data">-</td>';
      }
    }
    tbody += '</tr>';
  }

  return `<div class="lab-scroll"><table class="lab-pivot"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>
  <div class="tracking-note">${LAB_TRACKING_DAYS} 天內 · ${rowNames.length} 項 × ${dates.length} 次</div>`;
}

function checkAbnormal(value, reference) {
  return checkAbnormalDirection(value, reference) !== null;
}

// 'high' = value above reference upper bound, 'low' = below lower bound, null = normal/unknown
function checkAbnormalDirection(value, reference) {
  if (!value || !reference || value === '***') return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  const rangeMatch = reference.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    if (num > high) return 'high';
    if (num < low) return 'low';
    return null;
  }
  const ltMatch = reference.match(/[<≦]\s*([\d.]+)/); // upper-bound reference
  if (ltMatch) return num > parseFloat(ltMatch[1]) ? 'high' : null;
  const gtMatch = reference.match(/[>≧]\s*([\d.]+)/); // lower-bound reference
  if (gtMatch) return num < parseFloat(gtMatch[1]) ? 'low' : null;
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

@media (max-width:1000px) { .layout { grid-template-columns:1fr; } }
@media print {
  body { background:#fff; }
  .header .actions { display:none; }
  .layout { gap:8px; padding:8px; }
  .panel { box-shadow:none; border:1px solid #ddd; break-inside:avoid; }
  .panel-body.collapsed { display:block !important; }
  .panel-title::before { content:'▾ ' !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${esc(name)}${panels.acuBadgeHtml || ''}${panels.cancerBadgeHtml || ''}</h1>
    <div class="meta">${esc(id)} ｜ ${esc(dateStr)}</div>
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
</script>
</body>
</html>`;
}
