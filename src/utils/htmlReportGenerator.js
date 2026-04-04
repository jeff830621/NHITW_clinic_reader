/**
 * htmlReportGenerator.js
 * Generates a self-contained HTML report from patient data.
 * The HTML includes inline CSS/JS, no external dependencies.
 */

export function generateHtmlReport(patientName, patientId, data) {
  const now = new Date();
  const dateStr = formatDateTime(now);

  const sections = [];

  // 1. 過往診斷（從西藥+中藥+檢驗的 ICD code 彙整）
  sections.push(buildDiagnosisSection(data));

  // 2. 檢驗報告
  if (data.labData?.rObject?.length) {
    sections.push(buildLabSection(data.labData.rObject));
  }

  // 3. 西藥用藥紀錄
  if (data.medicationData?.rObject?.length) {
    sections.push(buildMedicationSection(data.medicationData.rObject));
  }

  // 4. 中藥用藥紀錄
  if (data.chinesemedData?.rObject?.length) {
    sections.push(buildChineseMedSection(data.chinesemedData.rObject));
  }

  // 5. 影像檢查
  if (data.imagingData?.rObject?.length) {
    sections.push(buildImagingSection(data.imagingData.rObject));
  }

  // 6. 過敏紀錄
  if (data.allergyData?.rObject?.length) {
    sections.push(buildAllergySection(data.allergyData.rObject));
  }

  // 7. 手術紀錄
  if (data.surgeryData?.rObject?.length) {
    sections.push(buildSurgerySection(data.surgeryData.rObject));
  }

  // 8. 出院摘要
  if (data.dischargeData?.rObject?.length) {
    sections.push(buildDischargeSection(data.dischargeData.rObject));
  }

  // 9. 餘藥天數
  if (data.medDaysData?.rObject?.length) {
    sections.push(buildMedDaysSection(data.medDaysData.rObject));
  }

  return buildFullHtml(patientName, patientId, dateStr, sections.join('\n'));
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
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function esc(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseDate(raw) {
  if (!raw) return '';
  if (raw.includes('T')) return raw.split('T')[0];
  return raw.replace(/\//g, '-');
}

function parseHosp(raw) {
  if (!raw) return '';
  return raw.split(';')[0].trim();
}

function groupBy(arr, keyFn) {
  const map = {};
  for (const item of arr) {
    const key = keyFn(item);
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

function checkAbnormal(value, reference) {
  if (!value || !reference || value === '***') return false;
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  const rangeMatch = reference.match(/([\d.]+)\s*[-~]\s*([\d.]+)/);
  if (rangeMatch) {
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return num < low || num > high;
  }
  const ltMatch = reference.match(/[<≦]\s*([\d.]+)/);
  if (ltMatch) return num > parseFloat(ltMatch[1]);
  const gtMatch = reference.match(/[>≧]\s*([\d.]+)/);
  if (gtMatch) return num < parseFloat(gtMatch[1]);
  return false;
}

// --- Section: 過往診斷 ---

function buildDiagnosisSection(data) {
  // Collect all ICD codes from medications, chinese meds, lab, imaging
  const diagMap = {}; // key: "ICD_CODE" => { code, name, dates: Set, hospitals: Set }

  function addDiag(code, name, date, hosp) {
    if (!code) return;
    const key = code.trim();
    if (!diagMap[key]) {
      diagMap[key] = { code: key, name: name || '', dates: new Set(), hospitals: new Set() };
    }
    if (name && !diagMap[key].name) diagMap[key].name = name;
    if (date) diagMap[key].dates.add(parseDate(date));
    if (hosp) diagMap[key].hospitals.add(parseHosp(hosp));
  }

  // From western medications
  if (data.medicationData?.rObject) {
    for (const m of data.medicationData.rObject) {
      addDiag(m.ICD_CODE || m.icd_code, m.ICD_NAME || m.icd_cname, m.PER_DATE || m.drug_date, m.HOSP_NAME || m.hosp);
    }
  }
  // From chinese medicine
  if (data.chinesemedData?.rObject) {
    for (const m of data.chinesemedData.rObject) {
      addDiag(m.icd_code, m.icd_cname, m.func_date, m.hosp);
    }
  }
  // From lab data
  if (data.labData?.rObject) {
    for (const l of data.labData.rObject) {
      addDiag(l.icd_code, l.icd_cname, l.real_inspect_date || l.recipe_date, l.hosp);
    }
  }
  // From imaging
  if (data.imagingData?.rObject) {
    for (const i of data.imagingData.rObject) {
      addDiag(i.icd_code, i.icd_cname, i.real_inspect_date || i.case_time || i.recipe_date, i.hosp);
    }
  }

  const diagList = Object.values(diagMap);
  if (diagList.length === 0) {
    return `<div class="section">
      <h2 onclick="toggleSection(this)">▸ 過往診斷</h2>
      <div class="section-body"><p>無診斷紀錄</p></div></div>`;
  }

  // Sort by most recent date descending
  diagList.sort((a, b) => {
    const da = [...a.dates].sort().pop() || '';
    const db = [...b.dates].sort().pop() || '';
    return db.localeCompare(da);
  });

  let rows = '';
  for (const d of diagList) {
    const dates = [...d.dates].sort().reverse().join(', ');
    const hosps = [...d.hospitals].join(', ');
    rows += `<tr><td><strong>${esc(d.code)}</strong></td><td>${esc(d.name)}</td><td>${esc(dates)}</td><td>${esc(hosps)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 過往診斷 (${diagList.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>診斷碼</th><th>診斷名稱</th><th>就診日期</th><th>醫療院所</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 檢驗報告 ---

function buildLabSection(items) {
  // Only include items that have actual test results (assay_value exists and is not empty/***)
  const labItems = items.filter(l => {
    const val = l.assay_value;
    return val && val.trim() !== '' && val.trim() !== '***';
  });

  if (labItems.length === 0) {
    return `<div class="section">
      <h2 onclick="toggleSection(this)">▸ 檢驗報告</h2>
      <div class="section-body"><p>無檢驗結果</p></div></div>`;
  }

  const groups = groupBy(labItems, i => `${i.real_inspect_date || i.recipe_date || ''}|${parseHosp(i.hosp)}`);

  let rows = '';
  for (const [key, labs] of Object.entries(groups)) {
    const [date, hosp] = key.split('|');
    rows += `<tr class="group-header"><td colspan="4">${esc(parseDate(date))} — ${esc(hosp)}</td></tr>`;
    for (const l of labs) {
      const name = l.assay_item_name || l.order_name || '';
      const value = l.assay_value || '';
      const ref = l.consult_value || '';
      const unit = l.unit_data || '';
      const isAbnormal = checkAbnormal(value, ref);
      rows += `<tr>
        <td>${esc(name)}</td>
        <td class="${isAbnormal ? 'abnormal' : ''}">${esc(value)}</td>
        <td>${esc(ref)}</td>
        <td>${esc(unit)}</td></tr>`;
    }
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 檢驗報告 (${labItems.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>檢驗項目</th><th>結果</th><th>參考值</th><th>單位</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 西藥 ---

function buildMedicationSection(items) {
  const groups = groupBy(items, i => `${i.PER_DATE || i.drug_date || ''}|${parseHosp(i.HOSP_NAME || i.hosp)}`);

  let rows = '';
  for (const [key, meds] of Object.entries(groups)) {
    const [date, hosp] = key.split('|');
    const icd = meds[0]?.ICD_CODE || meds[0]?.icd_code || '';
    const icdName = meds[0]?.ICD_NAME || meds[0]?.icd_cname || '';
    rows += `<tr class="group-header"><td colspan="5">${esc(parseDate(date))} — ${esc(hosp)} ${icd ? `(${esc(icd)} ${esc(icdName)})` : ''}</td></tr>`;
    for (const m of meds) {
      const name = m.MED_DESC || m.MED_ITEM || m.drug_ename || '';
      const generic = m.GENERIC_NAME || m.drug_ing_name || '';
      const dosage = m.DOSAGE || m.qty || '';
      const freq = m.FREQ_DESC || m.drug_fre || '';
      const days = m.MED_DAYS || m.day || '';
      rows += `<tr>
        <td>${esc(name)}${generic ? `<br><span class="sub">${esc(generic)}</span>` : ''}</td>
        <td>${esc(dosage)}</td><td>${esc(freq)}</td><td>${esc(days)}</td></tr>`;
    }
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 西藥用藥紀錄 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>藥品名稱</th><th>劑量</th><th>頻率</th><th>天數</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 中藥 ---

function buildChineseMedSection(items) {
  const groups = groupBy(items, i => `${i.func_date || ''}|${parseHosp(i.hosp)}`);

  let rows = '';
  for (const [key, meds] of Object.entries(groups)) {
    const [date, hosp] = key.split('|');
    const icd = meds[0]?.icd_code || '';
    const icdName = meds[0]?.icd_cname || '';
    rows += `<tr class="group-header"><td colspan="4">${esc(parseDate(date))} — ${esc(hosp)} ${icd ? `(${esc(icd)} ${esc(icdName)})` : ''}</td></tr>`;
    for (const m of meds) {
      const name = m.drug_perscrn_name || m.cdrug_name || '';
      const qty = m.order_qty || '';
      const freq = m.drug_fre || '';
      const days = m.day || '';
      rows += `<tr><td>${esc(name)}</td><td>${esc(qty)}</td><td>${esc(freq)}</td><td>${esc(days)}</td></tr>`;
    }
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 中藥用藥紀錄 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>藥品名稱</th><th>劑量</th><th>頻率</th><th>天數</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 影像 ---

function buildImagingSection(items) {
  let rows = '';
  for (const i of items) {
    const date = i.real_inspect_date || i.case_time || i.recipe_date || '';
    const hosp = parseHosp(i.hosp);
    const name = i.order_name || '';
    const result = i.inspect_result || '';
    const site = i.cure_path_name || '';
    rows += `<tr><td>${esc(parseDate(date))}</td><td>${esc(hosp)}</td><td>${esc(name)}</td><td>${esc(site)}</td><td>${esc(result)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 影像檢查 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>日期</th><th>醫院</th><th>檢查項目</th><th>部位</th><th>報告</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 過敏 ---

function buildAllergySection(items) {
  const filtered = items.filter(i => {
    const name = i.drug_name || '';
    return name && !name.includes('未記錄') && name !== 'NP' && name !== 'N.P' && name !== 'N.P.' && !name.includes('未過敏');
  });

  if (filtered.length === 0) {
    return `<div class="section">
      <h2 onclick="toggleSection(this)">▸ 過敏紀錄</h2>
      <div class="section-body"><p>無過敏紀錄</p></div></div>`;
  }

  let rows = '';
  for (const a of filtered) {
    const date = a.upload_d || '';
    const drug = a.drug_name || '';
    const symptom = (a.sympton_name || '').replace(/;/g, ', ');
    const severity = a.allerg_severity_level || '';
    const hosp = parseHosp(a.hosp);
    rows += `<tr><td>${esc(date)}</td><td>${esc(drug)}</td><td>${esc(symptom)}</td><td>${esc(severity)}</td><td>${esc(hosp)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 過敏紀錄 (${filtered.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>日期</th><th>藥品</th><th>症狀</th><th>嚴重度</th><th>醫院</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 手術 ---

function buildSurgerySection(items) {
  let rows = '';
  for (const s of items) {
    const date = s.exe_s_date || '';
    const hosp = parseHosp(s.hosp);
    const icd = s.icd_code || '';
    const name = s.icd_cname || '';
    rows += `<tr><td>${esc(parseDate(date))}</td><td>${esc(hosp)}</td><td>${esc(icd)}</td><td>${esc(name)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 手術紀錄 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>日期</th><th>醫院</th><th>代碼</th><th>名稱</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 出院 ---

function buildDischargeSection(items) {
  let rows = '';
  for (const d of items) {
    const inDate = d.in_date || '';
    const outDate = d.out_date || '';
    const hosp = parseHosp(d.hosp);
    const icd = d.icd_code || '';
    const name = d.icd_cname || '';
    rows += `<tr><td>${esc(parseDate(inDate))}</td><td>${esc(parseDate(outDate))}</td><td>${esc(hosp)}</td><td>${esc(icd)}</td><td>${esc(name)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 出院摘要 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>入院日</th><th>出院日</th><th>醫院</th><th>代碼</th><th>診斷</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Section: 餘藥 ---

function buildMedDaysSection(items) {
  let rows = '';
  for (const m of items) {
    const name = m.MED_DESC || m.MED_ITEM || m.drug_ename || '';
    const left = m.DRUG_LEFT || m.drug_left || '';
    const date = m.PER_DATE || m.drug_date || '';
    const hosp = parseHosp(m.HOSP_NAME || m.hosp);
    rows += `<tr><td>${esc(name)}</td><td>${esc(left)}</td><td>${esc(parseDate(date))}</td><td>${esc(hosp)}</td></tr>`;
  }

  return `<div class="section">
    <h2 onclick="toggleSection(this)">▸ 餘藥天數 (${items.length})</h2>
    <div class="section-body">
      <table><thead><tr><th>藥品</th><th>餘藥天數</th><th>開立日期</th><th>醫院</th></tr></thead>
      <tbody>${rows}</tbody></table>
    </div></div>`;
}

// --- Full HTML ---

function buildFullHtml(name, id, dateStr, sectionsHtml) {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(name)} — 醫療資料報告</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Microsoft JhengHei", "PingFang TC", sans-serif; background: #f5f5f5; color: #333; padding: 20px; }
  .header { background: #1976d2; color: white; padding: 20px 24px; border-radius: 8px; margin-bottom: 20px; }
  .header h1 { font-size: 24px; margin-bottom: 4px; }
  .header .meta { font-size: 14px; opacity: 0.9; }
  .section { background: white; border-radius: 8px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
  .section h2 { font-size: 16px; padding: 12px 16px; cursor: pointer; user-select: none; background: #fafafa; border-bottom: 1px solid #eee; }
  .section h2:hover { background: #f0f0f0; }
  .section-body { padding: 0; }
  .section-body.collapsed { display: none; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8f9fa; text-align: left; padding: 8px 12px; border-bottom: 2px solid #dee2e6; font-weight: 600; white-space: nowrap; }
  td { padding: 6px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
  tr:hover { background: #f8f9ff; }
  tr.group-header td { background: #e3f2fd; font-weight: 600; font-size: 13px; color: #1565c0; padding: 8px 12px; }
  .abnormal { color: #d32f2f; font-weight: bold; }
  .sub { color: #888; font-size: 11px; }
  .nav { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .nav a { background: #1976d2; color: white; padding: 6px 14px; border-radius: 4px; text-decoration: none; font-size: 13px; cursor: pointer; }
  .nav a:hover { background: #1565c0; }
  p { padding: 12px 16px; color: #666; }
  @media print {
    body { padding: 0; background: white; }
    .header { border-radius: 0; }
    .section { box-shadow: none; break-inside: avoid; }
    .section-body.collapsed { display: block !important; }
    .nav { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <h1>${esc(name)}</h1>
  <div class="meta">身分證號：${esc(id)} ｜ 報告產生時間：${esc(dateStr)}</div>
</div>
<div class="nav">
  <a onclick="expandAll()">全部展開</a>
  <a onclick="collapseAll()">全部收合</a>
  <a onclick="window.print()">列印</a>
</div>
${sectionsHtml}
<script>
function toggleSection(h2) {
  var body = h2.nextElementSibling;
  var isCollapsed = body.classList.toggle('collapsed');
  h2.textContent = h2.textContent.replace(/^[▸▾]/, isCollapsed ? '▸' : '▾');
}
function expandAll() {
  document.querySelectorAll('.section-body').forEach(function(b) { b.classList.remove('collapsed'); });
  document.querySelectorAll('.section h2').forEach(function(h) { h.textContent = h.textContent.replace(/^▸/, '▾'); });
}
function collapseAll() {
  document.querySelectorAll('.section-body').forEach(function(b) { b.classList.add('collapsed'); });
  document.querySelectorAll('.section h2').forEach(function(h) { h.textContent = h.textContent.replace(/^▾/, '▸'); });
}
expandAll();
</script>
</body>
</html>`;
}
