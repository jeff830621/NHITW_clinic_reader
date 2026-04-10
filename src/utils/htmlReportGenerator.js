/**
 * htmlReportGenerator.js
 * Generates a self-contained HTML report matching the extension's Overview layout.
 */

export function generateHtmlReport(patientName, patientId, data) {
  const now = new Date();
  const dateStr = formatDateTime(now);

  // Build each panel
  const diagnosisHtml = buildDiagnosisPanel(data);
  const labPivotHtml = buildLabPivotPanel(data.labData?.rObject);
  const westMedHtml = buildWestMedPanel(data.medicationData?.rObject, 100);
  const chineseMedHtml = buildChineseMedPanel(data.chinesemedData?.rObject);
  const imagingHtml = buildImagingPanel(data.imagingData?.rObject);
  const allergyHtml = buildAllergyPanel(data.allergyData?.rObject);
  const surgeryHtml = buildSurgeryPanel(data.surgeryData?.rObject);
  const dischargeHtml = buildDischargePanel(data.dischargeData?.rObject);

  return buildFullHtml(patientName, patientId, dateStr, {
    diagnosisHtml, labPivotHtml, westMedHtml, chineseMedHtml,
    imagingHtml, allergyHtml, surgeryHtml, dischargeHtml
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
function parseHosp(r) { return r ? r.split(';')[0].trim() : ''; }

// --- Diagnosis Panel (180-day, grouped by visit type, sorted by frequency) ---
function buildDiagnosisPanel(data) {
  const DIAG_TRACKING_DAYS = 180;
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
      html += `<div class="diag-item"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-count">${d.count}</span></div>`;
    }
    if (opList.length > 8) html += `<div class="diag-more">還有 ${opList.length - 8} 筆</div>`;
  }

  // Emergency
  if (emergency.length > 0) {
    html += '<div class="visit-type-label emergency-label">急診</div>';
    for (const d of emergency.slice(0, 5)) {
      html += `<div class="diag-item"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-meta">${esc(d.date)}</span></div>`;
    }
  }

  // Inpatient
  const ipList = Object.values(inpatient);
  if (ipList.length > 0) {
    html += '<div class="visit-type-label inpatient-label">住診</div>';
    for (const d of ipList.slice(0, 5)) {
      html += `<div class="diag-item"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)}</div>`;
    }
  }

  // Vaccine
  if (vaccine.length > 0) {
    html += '<div class="visit-type-label vaccine-label">疫苗</div>';
    for (const d of vaccine.slice(0, 5)) {
      html += `<div class="diag-item"><span class="diag-code">${esc(d.code)}</span> ${esc(d.name)} <span class="diag-meta">${esc(d.date)}</span></div>`;
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

// --- Lab Pivot Table (90-day, focused tests only, dates as columns) ---
function buildLabPivotPanel(items) {
  if (!items || items.length === 0) return '<p class="empty">無檢驗資料</p>';
  const LAB_TRACKING_DAYS = 180;

  // Build set of enabled order codes
  const enabledCodes = new Set(FOCUSED_LAB_TESTS.filter(t => t.enabled).map(t => t.orderCode));

  // Filter: within tracking days, has result, matches focused codes
  const labItems = items.filter(l => {
    const v = l.assay_value;
    if (!v || v.trim() === '' || v.trim() === '***') return false;
    const date = l.real_inspect_date || l.recipe_date || '';
    if (!isWithinDays(date, LAB_TRACKING_DAYS)) return false;
    const code = l.order_code || '';
    return enabledCodes.has(code);
  });

  if (labItems.length === 0) return '<p class="empty">無關注檢驗結果</p>';

  // Map each lab item to its display name from FOCUSED_LAB_TESTS
  // Handle special cases: 08011C splits into WBC/Hb/Platelet, 09015C into Cr/GFR
  const dateSet = new Set();
  // displayName -> { dates: { date: { value, ref, isAbnormal } } }
  const itemMap = {};

  for (const l of labItems) {
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    const code = l.order_code || '';
    const value = l.assay_value || '';
    const ref = l.consult_value || '';
    const itemName = (l.assay_item_name || l.order_name || '').toLowerCase();
    if (!date) continue;

    // Determine display name based on order code and item name
    let displayName = null;

    if (code === '08011C') {
      // CBC: determine sub-item
      if (itemName.includes('hb') || itemName.includes('hemoglobin') || itemName.includes('血色素')) displayName = 'Hb';
      else continue; // Skip WBC, Platelet (disabled by default)
    } else if (code === '09015C') {
      // Cr & GFR: determine which
      if (itemName.includes('gfr') || itemName.includes('腎絲球')) displayName = 'GFR';
      else displayName = 'Cr';
    } else if (code === '09040C') {
      if (itemName.includes('upcr') || itemName.includes('蛋白') || itemName.includes('protein')) displayName = 'UPCR';
      else continue;
    } else if (code === '12111C') {
      if (itemName.includes('uacr') || itemName.includes('albumin') || itemName.includes('白蛋白')) displayName = 'UACR';
      else continue;
    } else {
      // Direct match
      const match = FOCUSED_LAB_TESTS.find(t => t.orderCode === code && t.enabled && !t.subItem);
      if (match) displayName = match.name;
    }

    if (!displayName) continue;

    dateSet.add(date);
    if (!itemMap[displayName]) itemMap[displayName] = { name: displayName, dates: {} };
    // Keep latest value per date (in case of duplicates)
    itemMap[displayName].dates[date] = {
      value,
      ref,
      isAbnormal: checkAbnormal(value, ref)
    };
  }

  // Sort dates newest first, take up to 6
  const dates = [...dateSet].sort().reverse().slice(0, 6).reverse();

  // Order rows by FOCUSED_LAB_TESTS order
  const orderedNames = FOCUSED_LAB_TESTS.filter(t => t.enabled).map(t => t.name);
  // Deduplicate (Cr and GFR both from 09015C)
  const seenNames = new Set();
  const uniqueOrderedNames = orderedNames.filter(n => {
    if (seenNames.has(n)) return false;
    seenNames.add(n);
    return itemMap[n]; // only include if we have data
  });

  if (dates.length === 0 || uniqueOrderedNames.length === 0) return '<p class="empty">無關注檢驗結果</p>';

  // Build header
  let thead = '<tr><th class="lab-item-col">項目</th>';
  for (const d of dates) thead += `<th class="lab-date-col">${esc(shortDate(d))}</th>`;
  thead += '</tr>';

  // Build rows in focused order
  let tbody = '';
  for (const name of uniqueOrderedNames) {
    const item = itemMap[name];
    tbody += `<tr><td class="lab-item-name">${esc(name)}</td>`;
    for (const d of dates) {
      const cell = item.dates[d];
      if (cell) {
        tbody += `<td class="${cell.isAbnormal ? 'abnormal' : ''}">${esc(cell.value)}</td>`;
      } else {
        tbody += '<td class="no-data">\u2014</td>';
      }
    }
    tbody += '</tr>';
  }

  return `<table class="lab-pivot"><thead>${thead}</thead><tbody>${tbody}</tbody></table>
  <div class="tracking-note">${LAB_TRACKING_DAYS} 天內</div>`;
}

function checkAbnormal(value, reference) {
  if (!value || !reference || value === '***') return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  const rangeMatch = reference.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);
  if (rangeMatch) return num < parseFloat(rangeMatch[1]) || num > parseFloat(rangeMatch[2]);
  const ltMatch = reference.match(/[<≦]\s*([\d.]+)/);
  if (ltMatch) return num > parseFloat(ltMatch[1]);
  const gtMatch = reference.match(/[>≧]\s*([\d.]+)/);
  if (gtMatch) return num < parseFloat(gtMatch[1]);
  return false;
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
  .panel-title::before { content:'▾ ' !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${esc(name)}</h1>
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
