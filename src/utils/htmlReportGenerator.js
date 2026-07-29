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
  const obstMatchedCodes = getMatchedObstetricCodes(data);
  const asthmaMatchedCodes = getMatchedAsthmaCodes(data, patientMeta);
  const highlightSets = { acu: acuMatchedCodes, cancer: cancerMatchedCodes, asthma: asthmaMatchedCodes, obst: obstMatchedCodes };

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
  // Acupuncture (imue0100) is freshly enabled. We don't render a visible
  // panel yet because we don't know the response shape — embed a hidden
  // HTML-comment probe instead so the doctor can send us a generated
  // file and we'll know how to wire ICDs into the diagnosis panel.
  const acupunctureProbeHtml = buildAcupunctureProbeComment(data.acupunctureData);
  // Identity probe — emitted on every report regardless of whether labs are
  // present (the previous probe rode along with the lab debug, which left
  // pure-中藥 patients like 孟卉妍 untraced when the filename downgraded to
  // their ID. Always-on so the next mis-named export carries diagnosis info).
  const identityProbeHtml = buildIdentityProbeComment(patientMeta && patientMeta._identityProbe);
  const acuBadgeHtml = buildAcupunctureBadge(data);
  const cancerBadgeHtml = buildCancerCareBadge(data);
  const asthmaBadgeHtml = buildAsthmaBadge(data, patientMeta);
  const ckdBadgeHtml = buildCkdBadge(data, patientMeta);
  const obstBadgeHtml = buildObstetricBadge(data);
  const patientMetaLine = formatPatientMeta(patientMeta);

  // 中藥餘藥晶片 — 面板預設收合,標題必須自帶提示才「鮮豔可見」。
  const cmLeft = cmMaxDaysLeft(data.chinesemedData?.rObject);
  const cmLeftChipHtml = cmLeft > 0 ? ` <span class="cm-left">💊 餘${cmLeft}天</span>` : '';

  // 專案提醒列 — 只要對應 badge/晶片亮起就顯示在標題下方(明顯可見,不必
  // 滑鼠移上去)。申報/收案的行政要件在收案當下最容易漏,直接寫在版面上。
  const projectNotes = [];
  if (acuBadgeHtml) projectNotes.push('⚠ 複雜針灸：申報時主訴應有其診斷相關病情變化敘述');
  if (asthmaBadgeHtml) projectNotes.push('⚠ 氣喘專案：需有西醫氣喘診斷書才能收案');
  if (cancerBadgeHtml) projectNotes.push('⚠ 癌症專案：需在重大傷病卡有效期間、以重大傷病身分就醫才能收案');
  if (obstBadgeHtml) projectNotes.push('🤰 孕產專案：病患近一年曾於西醫院所看過孕產相關問題，可依患者目前是否尚有其需求，評估是否可收孕產專案');
  if (cmLeft > 0) projectNotes.push('💊 餘藥提醒：病患尚有中藥處方未服用完畢，建議參酌前次處方，衡量是否要提早開藥');
  const projectNotesHtml = projectNotes.length
    ? `<div class="project-notes">${projectNotes.map(n => `<span class="project-note">${esc(n)}</span>`).join('')}</div>`
    : '';

  return buildFullHtml(patientName, patientId, dateStr, {
    diagnosisHtml, labPivotHtml, westMedHtml, otherWestMedHtml, chineseMedHtml,
    imagingHtml, allergyHtml, surgeryHtml, dischargeHtml,
    adultHealthHtml, cancerScreeningHtml, hbcvHtml, acupunctureProbeHtml,
    identityProbeHtml,
    acuBadgeHtml, cancerBadgeHtml, asthmaBadgeHtml, ckdBadgeHtml, obstBadgeHtml,
    patientMetaLine, projectNotesHtml, cmLeftChipHtml
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
  // Seconds: two same-name patients (王小明 etc.) queried within the same
  // minute would otherwise overwrite each other's report.
  const se = String(d.getSeconds()).padStart(2, '0');
  // Strip path separators + chars Windows forbids; leading dots stripped too
  // so a name like '...' can't masquerade as a relative path even after the
  // native host's Join-Path. Compact whitespace to a single underscore.
  const safeName = patientName.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_').replace(/^\.+/, '');
  const finalName = safeName || 'unknown';
  return `${finalName}_${y}${mo}${da}_${h}${mi}${se}.html`;
}

// --- Helpers ---
function formatDateTime(d) {
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}
function esc(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
// Normalize any NHI date variant to ISO 'YYYY-MM-DD'. Handles ISO datetimes
// ('2025-12-09T00:00:00'), space datetimes ('2025-12-09 08:30'), slashes, AND
// ROC 民國年 ('114/12/09' → 2025-12-09) — some hospitals ship ROC dates, which
// previously parsed as year 114 AD and silently fell outside every tracking
// window (imaging/meds from those hospitals vanished from the report).
function parseDate(r) {
  if (!r) return '';
  let s = String(r).trim().split(/[T ]/)[0].replace(/\//g, '-');
  const m = s.match(/^(\d{2,4})-(\d{1,2})-(\d{1,2})$/);
  if (!m) return s;
  let y = parseInt(m[1], 10);
  if (m[1].length <= 3) y += 1911; // ROC year
  return `${y}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}
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
// ROC short date YYY/MM/DD — used as the clipboard prefix when copying a
// lab column, since ROC year (民國) is the standard charting convention.
// Visible table headers keep showing the Western year for readability.
function rocShortDate(r) {
  const d = parseDate(r);
  if (!d) return '';
  const parts = d.split('-');
  if (parts.length === 3) {
    const adYear = parseInt(parts[0], 10);
    if (!isNaN(adYear)) {
      const rocYear = adYear - 1911;
      return `${rocYear}/${parts[1]}/${parts[2]}`;
    }
  }
  return d;
}
function parseHosp(r) { return r ? r.split(';')[0].trim() : ''; }

// --- Diagnosis Panel — ALL diagnoses, sorted by most-recent diagnosed date ---
// Per user request: include every diagnosis (no top-N cap), sort by last-seen
// date descending, and show that last date + hospital next to each code.
function buildDiagnosisPanel(data, highlightSets = {}) {
  // Full year, matching the lab window. (Tried 3y on 2026-07-07, rolled back
  // same day: visit counts got inflated by stale history and the collapsed
  // tail grew noisy — 1y is the clinically useful horizon.) The 8 most-recent
  // diagnoses stay open; older ones collapse by default (see render below) so
  // a sparse 針傷/中醫 history still reaches back the full year without the
  // western drug list washing the panel out.
  const DIAG_TRACKING_DAYS = 365;
  const acuSet = highlightSets.acu || new Set();
  const cancerSet = highlightSets.cancer || new Set();
  const asthmaSet = highlightSets.asthma || new Set();
  const obstSet = highlightSets.obst || new Set();
  const matchClass = (code) => {
    const c = String(code || '').trim();
    const cls = [];
    if (acuSet.has(c)) cls.push('diag-acu-match');
    if (cancerSet.has(c)) cls.push('diag-cancer-match');
    if (asthmaSet.has(c)) cls.push('diag-asthma-match');
    if (obstSet.has(c)) cls.push('diag-obst-match');
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

      if (!diagMap[code]) diagMap[code] = { code, name, visits: new Set(), lastDate: '', lastHosp: '', lastType: '' };
      const e = diagMap[code];
      // Count distinct visits, not raw records — medication data is one row
      // per drug line, so a single visit with 9 drugs must still count as 1.
      e.visits.add(`${pd}|${hosp}`);
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
  // Acupuncture (imue0160): each row is one 針灸 visit carrying its own ICD —
  // this is the ONLY place a pure-acupuncture (D02 未開內服藥) diagnosis
  // appears, since those visits write no row to imue0090 (中醫用藥). Without
  // this the diagnosis panel silently dropped them (the original complaint).
  processItems(data.acupunctureData?.rObject || data.acupunctureData?.robject, 'func_date', 'hosp', 'icd_code', 'icd_cname');

  for (const e of Object.values(diagMap)) e.count = e.visits.size;

  // Sort by most-recent date desc; tiebreak by frequency
  const list = Object.values(diagMap).sort((a, b) => {
    if (b.lastDate !== a.lastDate) return b.lastDate.localeCompare(a.lastDate);
    return b.count - a.count;
  });
  if (list.length === 0) return '<p class="empty">無診斷紀錄</p>';

  const renderItem = (d) => {
    let typeTag = '';
    if (d.lastType.includes('急')) typeTag = '<span class="diag-type emergency">急</span>';
    else if (d.lastType.includes('住')) typeTag = '<span class="diag-type inpatient">住</span>';
    const dateStr = d.lastDate ? d.lastDate.replace(/-/g, '/') : '';
    const meta = [dateStr, d.lastHosp].filter(Boolean).join(' ');
    // Some hospitals leave icd_cname blank (or fill it with the code itself),
    // which rendered an ugly 'F329 F329'. Drop the name when it's empty or
    // just repeats the code.
    const nameStr = (d.name && d.name.trim() && d.name.trim() !== String(d.code).trim()) ? esc(d.name) : '';
    // 次數是按鈕:點擊展開這個診斷的每次就醫(院所+日期),新→舊。visits
    // 的 key 是 `date|hosp`,直接拆回來排序即可。
    const visitList = [...d.visits].map(v => {
      const i = v.indexOf('|');
      return { date: v.slice(0, i), hosp: v.slice(i + 1) };
    }).sort((a, b) => b.date.localeCompare(a.date));
    const visitsHtml = visitList.map(v =>
      `<div>${esc(v.date.replace(/-/g, '/'))} ${esc(v.hosp)}</div>`).join('');
    return `<div class="diag-item ${matchClass(d.code)}">`
      + `<div class="diag-line1">${typeTag}<span class="diag-code">${esc(d.code)}</span> ${nameStr}`
      + `<span class="diag-count" onclick="toggleDiagVisits(this)" title="點擊顯示各次就醫的院所與日期">${d.count}次</span></div>`
      + `<div class="diag-line2">${esc(meta)}</div>`
      + `<div class="diag-visits" style="display:none">${visitsHtml}</div>`
      + `</div>`;
  };

  // The 8 most-recent diagnoses stay open; the older remainder collapses behind
  // a toggle (預設收合) so a full year of history doesn't flood the panel.
  const DIAG_VISIBLE = 8;
  let html = list.slice(0, DIAG_VISIBLE).map(renderItem).join('');
  const older = list.slice(DIAG_VISIBLE);
  if (older.length > 0) {
    html += `<div class="diag-more-toggle" onclick="toggleDiagMore(this)" data-n="${older.length}">+ 顯示較早診斷 (${older.length} 筆)</div>`
      + `<div class="diag-more-list" style="display:none">${older.map(renderItem).join('')}</div>`;
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
  ['Glucose', ['glucose', 'sugar', 'ac sugar', 'blood sugar', '葡萄糖', '血糖', '飯前血糖', '空腹血糖', '禁食血糖', '禁食血糖(ac)', '血液及體液葡萄糖', '飯前血糖(ac)', '飯前葡萄糖', '飯前葡萄糖(ac)', 'glucose ac', 'glucose (ac)', 'glucose(ac)', 'glu.(ac)', 'glu (ac)', 'glu(ac)', 'glu ac', 'ac glucose']],
  ['Glucose PC', ['glucose pc', 'glucose (pc)', 'glucose(pc)', 'glu.(pc)', 'glu (pc)', 'glu(pc)', 'glu pc', 'pc sugar', 'pc glucose', 'glucose post cibum', 'glucose-pc', 'glucose-post cibum', '飯後血糖', '餐後血糖', '飯後葡萄糖', '飯後葡萄糖(pc)', 'glucose-post cibum, pc']],
  ['HbA1c', ['hba1c', 'hb-a1c', 'hb a1c', 'a1c', 'hemoglobin a1c', '糖化血色素', '糖化血紅素', '醣化血色素', '醣化血紅素']],
  ['Microalbumin', ['microalbumin', 'microalb', 'micro albumin', 'micro-albumin', '微量白蛋白', '尿微量白蛋白', 'urine microalbumin', '微白蛋白', '微白蛋白(免疫比濁法)', '尿微白蛋白']],
  ['Urine creatinine', ['urine creatinine', 'urine cr', 'u-cr', 'u cr', '尿肌酸酐', '尿肌酐', '肌酸酐,尿', '肌酐,尿', '肌酐、尿']],
  // Ratios — kept un-suffixed by canonicalLabName so the CKD proteinuria
  // check matches them exactly.
  ['UPCR', ['upcr', 'u-pcr', 'upc', 'urine protein/creatinine ratio', 'urine protein creatinine ratio', 'protein/creatinine ratio', '尿蛋白/肌酸酐比值', '尿蛋白肌酸酐比值', '尿蛋白/肌酐比值', '蛋白/肌酸酐比值', '尿液蛋白質/肌酸酐比值']],
  ['UACR', ['uacr', 'u-acr', 'acr', 'albumin/creatinine ratio', 'urine albumin/creatinine ratio', '尿液微白蛋白/肌酸酐比值', '微白蛋白/肌酸酐比值', '白蛋白/肌酸酐比值', '尿白蛋白/肌酐比值', '尿液白蛋白/肌酸酐比值', '微量白蛋白/肌酸酐比值']],
  ['Amylase', ['amylase', 'amylase(b)', '血液澱粉脢', '澱粉酶', '澱粉脢']],
  ['Lipase', ['lipase', '解脂脢', '脂肪酶', '脂解酶']],
  ['ALK-P', ['alk-p', 'alkp', 'alp', '鹼性磷酸脢', '鹼性磷酸酶', '鹼性磷酸酵素']],
  ['T-Bil', ['total bilirubin', 't-bil', 'tbil', '總膽紅素', '膽紅素總量', '總膽色素']],
  ['D-Bil', ['direct bilirubin', 'd-bil', 'dbil', '直接膽紅素', '直接膽色素']],
  ['BUN', ['bun', '尿素氮', '血中尿素氮', '尿素氮(bun)']],
  ['Cr', ['cr', 'creatinine', 'blood creatinine', 'creatinine(b)', 'creatinine (b)', 'cre', 'cre(b)', 'crtn', 'serum creatinine', '肌酸酐', '肌酐', '血清肌酸酐', '肌酸肝', '血中肌酸酐', '肌酸酐、血', '肌酸酐,血']],
  ['Na', ['na', 'sodium', '鈉']],
  ['K', ['k', 'potassium', '鉀']],
  ['Cl', ['cl', 'chloride', '氯']],
  ['GOT', ['got', 'ast', 'sgot', 'ast/sgot', 'sgot/ast', 's.g.o.t', 's.g.o.t (ast)', 's.g.o.t. (ast)', 's-got', 's-got/ast', 'ast/got', 'got/ast', 'ast (got)', 'got (ast)', '天門冬胺酸轉胺酶', '天門冬胺酸胺基轉移酶', '血清麩胺酸苯醋酸轉氨基', '血清麩胺酸苯醋酸轉氨基酶', '麩胺酸苯醋酸轉氨基', '麩胺酸苯醋酸轉氨基酶']],
  ['GPT', ['gpt', 'alt', 'sgpt', 'alt/sgpt', 'sgpt/alt', 's.g.p.t', 's.g.p.t (alt)', 's.g.p.t. (alt)', 's-gpt', 's-gpt/alt', 'alt/gpt', 'gpt/alt', 'alt (gpt)', 'gpt (alt)', '丙胺酸轉胺酶', '丙胺酸胺基轉移酶', '血清麩胺酸丙酮酸轉氨基', '血清麩胺酸丙酮酸轉氨基酶', '麩胺酸丙酮酸轉氨基', '麩胺酸丙酮酸轉氨基酶']],
  ['U.A', ['u.a', 'ua', 'uric acid', 'uric acid(blood)', '尿酸', '血清尿酸', '血液尿酸']],
  ['GFR', ['gfr', 'egfr', 'e-gfr', 'estimated gfr', 'estimated-gfr', 'egfr-ckd-epi', 'egfr ckd-epi', 'egfr (ckd-epi)', 'egfr-mdrd', 'egfr (mdrd)', '腎絲球過濾率', '腎絲球過濾率(新)', '腎絲球過濾率;(egfr-ckd-epi)', '腎絲球過濾率(新);(egfr-ckd-epi)', '腎絲球過濾率(egfr)']],
  // Thyroid — long Chinese names dominate the leftmost sticky column,
  // squeezing the data columns. Map each to the standard short form a
  // clinician actually uses at a glance.
  ['TSH', ['tsh', 'tsh (eia/lia)', 'thyroid stimulating hormone', '甲狀腺刺激素', '甲狀腺促素', '促甲狀腺素', '甲狀腺刺激素免疫分析']],
  ['Free T4', ['free t4', 'ft4', 'free thyroxine', 'free t4 (eia/lia)', '游離甲狀腺素', '游離甲狀腺素免疫分析', '游離四碘甲狀腺素']],
  ['T3', ['t3', 'triiodothyronine', 'total t3', '三碘甲狀腺素', '三碘甲狀腺素免疫分析']],
  ['Free T3', ['free t3', 'ft3', '游離三碘甲狀腺素']],
  ['T4', ['t4', 'thyroxine', 'total t4', '甲狀腺素']],
  ['Anti-TPO', ['anti-tpo', 'anti tpo', 'anti-tpo ab', 'tpo ab', 'tpo antibody', '甲狀腺過氧化酶抗體', '抗甲狀腺過氧化酶抗體', '甲狀腺過氧化酵素抗體']],
  ['ATA', ['ata', 'anti-tg', 'anti tg', 'anti-thyroglobulin', 'thyroglobulin antibody', '甲狀腺球蛋白抗體', '抗甲狀腺球蛋白抗體']],
  ['CRP', ['crp', 'c反應蛋白', 'c-反應蛋白', 'c 反應蛋白', 'c-reactive protein', 'crp, c-reactive protein', 'crp，c-reactive protein']],
  // Lipid panel — hospitals report these under many variant names. Without
  // these aliases the report shows duplicate rows ('Chol' vs 'Cholesterol'
  // vs '膽固醇', 'LDL' vs 'LDL-cholesterol' vs 'LDL-cholesterol (低密度脂蛋白
  // 膽固醇)', 'HDL' vs 'HDL-cholesterol' vs '高密度脂蛋白膽固醇'…).
  ['Chol', ['chol', 'cholesterol', 'total cholesterol', 't-cholesterol', 'total-cholesterol', 'tc', 'cho', 't-cho', 't-chol', '膽固醇', '總膽固醇', 'cholesterol(膽固醇)']],
  ['TG', ['tg', 'tg, triglycerides', 'triglyceride', 'triglycerides', 't.g.', '三酸甘油脂', '三酸甘油酯', 'tg (三酸甘油脂)']],
  ['HDL', ['hdl', 'hdl-cho', '高密度膽固醇', 'hdl-cholesterol', 'hdl cholesterol', 'hdl-c', 'hdl chol', 'hdl-cholesterol (高密度脂蛋白膽固醇)', '高密度脂蛋白膽固醇', '高密度脂蛋白', 'hdl(高密度脂蛋白)']],
  ['LDL', ['ldl', 'ldl-cho', '低密度膽固醇', 'ldl-cholesterol', 'ldl cholesterol', 'ldl-c', 'ldl chol', 'ldl-cholesterol (低密度脂蛋白膽固醇)', '低密度脂蛋白膽固醇', '低密度脂蛋白', 'ldl(低密度脂蛋白)']],
  // Serology / tumor markers — long Chinese names dominate the sticky item
  // column; map to the short form a clinician reads at a glance.
  ['AFP', ['afp', 'alpha-fetoprotein', 'α-fetoprotein', 'a-fetoprotein', 'α-胎兒蛋白檢驗', 'α-胎兒蛋白', 'a-胎兒蛋白檢驗', '甲型胎兒蛋白', '甲種胎兒蛋白', '胎兒蛋白']],
  ['HBsAg', ['hbsag', 'hbs-ag', 'hbs ag', 'hbv surface antigen', 'b型肝炎表面抗原', 'b型肝炎表面抗原檢查', 'b肝表面抗原']],
  ['Anti-HCV', ['anti-hcv', 'anti hcv', 'hcv ab', 'hcv-ab', 'hcv antibody', 'c型肝炎病毒抗體', 'c型肝炎病毒抗體檢查', 'c型肝炎抗體', 'c肝抗體']],
  // Vital signs that ride in on some labdata feeds.
  ['SBP', ['sbp', 'systolic', 'systolic bp', 'systolic blood pressure', '收縮壓']],
  ['DBP', ['dbp', 'diastolic', 'diastolic bp', 'diastolic blood pressure', '舒張壓']],
];
function normalizeLabName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ｃ/g, 'c')                       // fullwidth c (from Ｃ反應蛋白)
    .replace(/脢/g, '酶')                       // 脢 = 酶/酵素 variant, so e.g.
                                               //   血清麩胺酸苯醋酸轉氨基脢 → …酶 (GOT/GPT)
    .replace(/[·‧∙・･]/g, '、')                 // CJK middle-dots → 、 specimen separator
                                               //   (肌酸酐‧血 → 肌酸酐、血 = serum Cr)
    .replace(/[－–—]/g, '-')                   // fullwidth/EN/EM dashes → ascii hyphen
                                               //   (HDL－cholesterol vs HDL-cholesterol)
    .replace(/\s*-\s*/g, '-')                  // collapse spaces around hyphen
                                               //   (α - 胎兒蛋白 → α-胎兒蛋白)
    .replace(/([一-鿿])-([一-鿿])/g, '$1$2') // drop hyphen BETWEEN CJK
                                               //   (高密度脂蛋白-膽固醇 → …膽固醇 = HDL)
    .replace(/（/g, '(').replace(/）/g, ')')   // fullwidth parens
    .replace(/[?？]+\s*$/, '')                 // strip trailing ? (display truncation,
                                               //   e.g. 「血清麩胺酸苯醋酸轉氨基?」)
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

// Some hospitals (notably 衛生所 systems) drop the raw NHI order code into
// the assay_item_name field instead of an analyte name — so '09005C' shows
// up alongside 'Glucose' as a sibling row even though they're the SAME
// measurement. ORDER_CODE_NAME translates the code string back to the
// canonical name so the alias pipeline can merge them. Urine variants
// (e.g. 09016C) still get the (尿) suffix appended by appendUrineMark via
// the specimen detector — we only resolve the analyte identity here.
const ORDER_CODE_NAME = {
  // CBC
  '08011C': 'Hb',
  // Renal / metabolic
  '09002C': 'BUN',
  '09015C': 'Cr',
  '09016C': 'Urine creatinine',  // urine Cr; (尿) suffix added by specimenOf
  '09013C': 'U.A',
  // Glucose
  '09005C': 'Glucose',
  '09140C': 'Glucose PC',         // 餐後 / Post Cibum
  '09006C': 'HbA1c',
  // Liver / enzymes
  '09025C': 'GOT',
  '09026C': 'GPT',
  '09027C': 'ALK-P',
  '09029C': 'T-Bil',
  '09030C': 'D-Bil',
  '09031C': 'γ-GT',
  '09032C': 'CPK',
  // Lipids
  '09001C': 'Chol',
  '09004C': 'TG',
  '09043C': 'HDL',
  '09044C': 'LDL',
  // Electrolytes
  '09021C': 'Na',
  '09022C': 'K',
  // Inflammation / proteinuria
  '12015C': 'CRP',
  '12111C': 'Microalbumin',       // (尿) appended automatically
  '09040C': 'UPCR',
  '09038C': 'Alb',
};

// Urine-sample tag. Catches the common ways labs label urine analytes
// WITHOUT false-positiving on benign Chinese compounds (尿酸 uric acid,
// 尿素氮 BUN) — those start with 尿 directly, no separator. The Chinese
// "[、，]尿" pattern catches 肌酐、尿 / 肌酸酐，尿 etc. where 尿 is appended
// as a specimen marker after the analyte name.
const URINE_HINT = /\burine\b|\burinary\b|尿液|\(\s*尿\s*\)|（\s*尿\s*）|[、，]\s*尿/i;

// NHI urinalysis dipstick panel order codes: 06012C 尿液常規, 06013C 尿生化試紙
// (蛋白/糖/微白蛋白 皆為半定量). Glucose-named items here are urine glucose,
// never blood; and every reading is a 試紙 grade, so these codes are likewise
// barred from any computed value (eGFR / eUPCR / eUACR) — see isDipstickUrinalysis.
const URINALYSIS_ORDER_CODES = new Set(['06012C', '06013C']);

// Read the specimen type straight from NHI's metadata — we used to only
// parse the assay_item_name string, which missed plenty of cases where the
// item is named generically ("Protein", "Glucose") but inspect_mode says
// "尿液". Reading the structured fields first cleans up almost every
// blood-vs-urine mix-up we'd been patching around.
// NHI order codes that ALWAYS describe a urine measurement, regardless of
// how a given hospital labels inspect_mode / order_name. Lets us pin urine
// specimen identity even when the raw fields are sparse (e.g. inspect_mode
// just says "採集").
const URINE_ORDER_CODES = new Set([
  '09016C', // Urine creatinine
  '09040C', // UPCR
  '12111C', // Microalbumin (UACR component)
]);

function specimenOf(l) {
  // Authoritative: NHI order codes that describe specifically-urine
  // analytes. Anchor on these first so a sparse inspect_mode (e.g. "採集",
  // "N") doesn't strand the row as specimen='unknown'.
  const code = String(l.order_code || '').trim();
  if (URINE_ORDER_CODES.has(code)) return 'urine';

  const mode = String(l.inspect_mode || '').trim().toUpperCase();
  if (/尿液|URINE|SPOT|RANDOM URINE/.test(mode)) return 'urine';
  if (/血液|SERUM|PLASMA|\bBLOOD\b|WHOLE BLOOD/.test(mode)) return 'serum';
  if (/糞便|STOOL|FECES/.test(mode)) return 'feces';

  const tp = String(l.assay_tp_cname || '');
  if (/尿液/.test(tp)) return 'urine';
  if (/糞便/.test(tp)) return 'feces';

  const order = String(l.order_name || '');
  if (URINE_HINT.test(order)) return 'urine';
  if (/、血|血液|\bblood\b|\bserum\b|\bplasma\b/i.test(order)) return 'serum';

  return 'unknown';
}

// Append (尿) to a canonical name so a urine variant doesn't visually
// collide with the blood version of the same analyte. Idempotent — if the
// name already advertises urine in any form, leaves it alone.
function appendUrineMark(name) {
  if (!name) return name;
  if (/[(（]\s*尿\s*[)）]/.test(name)) return name;
  if (URINE_HINT.test(name)) return name;
  return `${name}(尿)`;
}

// Urine dipstick semi-quantitative marker: "(3+)", "(+)", "(+/-)", "(-)".
// Blood chemistry values never carry these — they're a reliable "this is a
// urine dipstick result" signal even when the value also has a number
// (e.g. "500 (3+)").
const DIPSTICK_MARKER = /\(\s*\d*\s*[+\-](?:\s*\/\s*[+\-])?\s*\)/;
// A value that is a urine dipstick reading: a +/- marker, or no digit at all
// ("Negative" / "Trace" / "－").
function isUrineDipstickValue(v) {
  const s = String(v == null ? '' : v).trim();
  if (s === '') return false;
  return DIPSTICK_MARKER.test(s) || !/\d/.test(s);
}

// 試紙尿檢 (urine dipstick / 半定量 urinalysis). Per clinic rule these graded
// readings must NEVER feed a computed value — eGFR, eUPCR/eUACR — because
// "100" / "30" / "1+ (30)" are bracket estimates, not precise concentrations.
// They still display in the lab panel; they're only barred from the math. A row
// is dipstick when: it rides a urinalysis panel code (06012C/06013C), it's
// flagged 半定量, or its value is itself a dipstick grade ("500(3+)", "Trace").
function isDipstickUrinalysis(l) {
  const code = (l.order_code || '').trim();
  if (URINALYSIS_ORDER_CODES.has(code)) return true;
  const name = (l.assay_item_name || '') + (l.order_name || '');
  if (/半定量/.test(name)) return true;
  return isUrineDipstickValue(l.assay_value);
}

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

  // PRIMARY signal: NHI's structured specimen fields (inspect_mode,
  // assay_tp_cname, order_name's 「、血」/「尿蛋白」 conventions). Falls
  // back to scanning the analyte name itself only when NHI didn't tell us.
  let specimen = specimenOf(l);
  if (specimen === 'unknown' && URINE_HINT.test(rawName)) specimen = 'urine';

  // Resolve to the canonical analyte name via aliases (Cr/BUN/HbA1c/...).
  const norm = normalizeLabName(rawName);
  let canon = LAB_ALIAS_LOOKUP.get(norm);
  if (!canon) {
    // Analyte-changing qualifiers: when the parenthetical itself distinguishes
    // a DIFFERENT test — Glucose(2hPC), T4(Free), Cholesterol(HDL) — stripping
    // it would merge two analytes into one row (a 飯後 180 rendering as red
    // fasting Glucose). Bail on the fallback for those; an unmerged extra row
    // is safe, a false merge is not. (audit finding #7)
    const parenContents = [];
    norm.replace(/[(\[]([^)\]]*)[)\]]/g, (_, c) => { parenContents.push(String(c).trim()); return ''; });
    const ANALYTE_QUALIFIER = /^(pc|pp|2\s*h(\s*pc)?|飯後|餐後|post\s*cibum|postprandial|free|f-?t[34]|hdl|ldl|direct|indirect|直接|間接)$/i;
    if (!parenContents.some(c => ANALYTE_QUALIFIER.test(c))) {
      // Strip parens AND any trailing/leading separator detritus (空格, 半形/全形
      // 分號逗號頓號冒號) so e.g. '腎絲球過濾率(新) ;(eGFR-CKD-EPI)' → after
      // paren-strip → '腎絲球過濾率 ;' → matches the alias '腎絲球過濾率'.
      const strip = (t) => t.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/^[\s;,，、:：]+|[\s;,，、:：]+$/g, '').trim();
      const noParen = strip(norm);
      if (noParen) canon = LAB_ALIAS_LOOKUP.get(noParen);
      // Mixed-language names ('Cholesterol 膽固醇', 'ALT/SGPT 肝酵素',
      // 'Glucose AC飯前血糖(NaF)', 'Microalb 微白蛋白 (Urine)') — full-string
      // lookup can never match, so try the Latin half then the Chinese half
      // separately. Runs under the same analyte-qualifier guard above, so
      // 'T4(Free) 游離甲狀腺素'-style names still refuse to merge into T4.
      if (!canon) {
        const latinOnly = strip(norm.replace(/[一-鿿]/g, ''));
        if (latinOnly && latinOnly !== noParen) canon = LAB_ALIAS_LOOKUP.get(latinOnly);
      }
      if (!canon) {
        const cjkOnly = strip(norm.replace(/[^一-鿿()（）[\]]/g, ''));
        if (cjkOnly && cjkOnly !== noParen) canon = LAB_ALIAS_LOOKUP.get(cjkOnly);
      }
    }
  }
  // Fallback: 衛生所 / 區域醫院 sometimes ship the raw NHI order code as
  // the assay_item_name (so we see '09005C' as a sibling of 'Glucose').
  // Translate the code only when rawName IS that bare code — otherwise we'd
  // collapse legitimately distinct sub-items that share an order_code into
  // their parent. 劉志明 2026-06-23 case: '腎絲球過濾率(新);(eGFR-CKD-EPI)'
  // and 'GFR' both ride under 09015C, so the unguarded fallback was
  // dumping every eGFR value into the Cr row (Cr cell ended up showing
  // '26.4 / 25.29 / 2.53' where 25.29 was actually GFR).
  if (!canon && orderCode && ORDER_CODE_NAME[orderCode]) {
    const trimmedRaw = (rawName || '').trim().toUpperCase();
    const isBareOrderCode = /^\d{5}[A-Z]$/.test(trimmedRaw);
    if (isBareOrderCode && trimmedRaw === orderCode.toUpperCase()) {
      canon = ORDER_CODE_NAME[orderCode];
    }
  }

  // Plausibility backup for the rare lab that reports urine Cr generically
  // ("Cr" with no specimen field). Serum Cr maxes around ~15 mg/dL even in
  // ESRD and its reference upper bound is always <2; anything larger is
  // urine concentration leaking in.
  if (canon === 'Cr' && specimen !== 'serum') {
    const val = parseFloat(l.assay_value);
    const refMax = parseRefMax(l.consult_value);
    if ((!isNaN(val) && val > 15) || (refMax != null && refMax > 5)) {
      specimen = 'urine';
    }
  }

  // Urine glucose: keep the Chinese idiom 尿糖 (clearer than Glucose(尿) for
  // dipstick semi-quant results like 500(3+)).
  if (canon === 'Glucose' &&
      (specimen === 'urine' || URINALYSIS_ORDER_CODES.has(orderCode) || isUrineDipstickValue(l.assay_value))) {
    return '尿糖';
  }

  const baseName = canon || (rawName || orderCode || '?').trim();
  // UPCR/UACR are ratios — inherently urine, never collide with a blood
  // version. Suffixing them '(尿)' broke the CKD proteinuria check, which
  // matches the exact canonical 'UPCR'/'UACR'. Return them bare.
  if (baseName === 'UPCR' || baseName === 'UACR') return baseName;
  return specimen === 'urine' ? appendUrineMark(baseName) : baseName;
}

// Fallback units when the NHI lab response omits unit_data for a known test.
// Keyed by canonical name. Used only when item.unit ends up empty.
const DEFAULT_UNITS = {
  // CBC / differential
  Hb:'g/dL', WBC:'/uL', RBC:'10^6/uL', Platelet:'10^3/uL', HCT:'%',
  MCV:'fL', MCH:'pg', MCHC:'g/dL', RDW:'%', MPV:'fL',
  Neutrophil:'%', Lymphocyte:'%', Monocyte:'%', Eosinophil:'%', Basophil:'%',
  // Biochem
  BUN:'mg/dL', Cr:'mg/dL', 'U.A':'mg/dL', Glucose:'mg/dL', 'Glucose PC':'mg/dL', HbA1c:'%', 'γ-GT':'U/L', CPK:'U/L', Microalbumin:'mg/L', 'Urine creatinine':'mg/dL', GFR:'mL/min/1.73m²',
  // Thyroid
  TSH:'μIU/mL', 'Free T4':'ng/dL', 'Free T3':'pg/mL', T3:'ng/mL', T4:'μg/dL', 'Anti-TPO':'IU/mL', ATA:'IU/mL',
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
  { orderCode: '09140C', name: 'Glucose PC', enabled: true },
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
  const LAB_TRACKING_DAYS = 365;   // fetch a full year
  const LAB_RECENT_DAYS = 180;     // columns older than this collapse by default
  // Resolve patient sex once for sex-specific reference ranges (M:.. F:..).
  // null when unknown → those rows fall back to the generic parser.
  const sexHint = patientMeta?.sex ? isFemaleSex(patientMeta.sex) : null;

  // Debug payload is embedded as an HTML comment at the end of this panel
  // (see buildLabDebugComment). It rides along inside the generated file so
  // the clinic can just send us the HTML — no need to keep DevTools open
  // while inserting the health card. Zero visual impact.
  const debugComment = buildLabDebugComment(items);

  const labItems = items.filter(l => {
    const v = l.assay_value;
    if (!v || String(v).trim() === '' || String(v).trim() === '***') return false;
    const date = l.real_inspect_date || l.recipe_date || '';
    return isWithinDays(date, LAB_TRACKING_DAYS);
  });

  if (labItems.length === 0) return `<p class="empty">無檢驗資料</p>${debugComment}`;

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
    const newCell = { value, dir: labDirection(value, ref, code, sexHint), ref: refDisplay(ref, code, sexHint) };
    const existing = itemMap[name].dates[date];
    if (!existing) {
      itemMap[name].dates[date] = newCell;
    } else {
      // Same-date collision (e.g. A 院 AM + B 院 PM same day). Don't silently
      // overwrite — preserve both. Prefer the abnormal reading as the
      // 'primary' shown in the cell + used for eGFR / row direction, and
      // stash the other(s) as alternates rendered alongside.
      const existV = String(existing.value || '').trim();
      const newV = String(newCell.value || '').trim();
      if (!existV) { itemMap[name].dates[date] = newCell; }
      else if (!newV || existV === newV) { /* nothing new, skip */ }
      else {
        // Choose which is "primary" — abnormal beats normal.
        const swap = !existing.dir && newCell.dir;
        if (swap) {
          newCell.alternates = [existV, ...(existing.alternates || []).filter(v => v !== newV)];
          itemMap[name].dates[date] = newCell;
        } else {
          existing.alternates = existing.alternates || [];
          if (!existing.alternates.includes(newV)) existing.alternates.push(newV);
        }
      }
    }
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

  // Synthesize eUPCR(計算) / eUACR(計算) when the lab only reports the raw
  // urine components (urine protein + urine creatinine in mg/dL) without a
  // pre-computed ratio. Without this rows like "Urine protein 4.50 mg/dL"
  // are clinically opaque — the doctor would have to compute the ratio in
  // their head to know if it crosses the 150 mg/g proteinuria threshold.
  const { upcrByDate, uacrByDate } = computeUrineRatios(items);
  const addSynthRatio = (rowName, byDate, threshold) => {
    if (Object.keys(byDate).length === 0) return;
    const dates = {};
    for (const [date, ratio] of Object.entries(byDate)) {
      const r = ratio < 10 ? ratio.toFixed(1) : ratio.toFixed(0);
      dates[date] = { value: r, dir: ratio >= threshold ? 'high' : null, ref: `<${threshold}` };
    }
    itemMap[rowName] = { name: rowName, code: '', unit: 'mg/g', dates, order: -0.4, synthetic: 'urine-ratio' };
  };
  addSynthRatio('eUPCR(計算)', upcrByDate, 150);
  addSynthRatio('eUACR(計算)', uacrByDate, 30);

  // Newest column leftmost
  const dates = [...dateSet].sort((a, b) => b.localeCompare(a));
  // Date columns older than LAB_RECENT_DAYS collapse by default (one-year
  // window can sprout many columns; keep the page tidy, expand on demand).
  const archivedDates = new Set(dates.filter(d => !isWithinDays(d, LAB_RECENT_DAYS)));
  const archivedCount = archivedDates.size;
  const colCls = (d) => archivedDates.has(d) ? ' lab-col-archived' : '';

  // Focused tests first (in defined order), then others by first-seen order.
  // eGFR(計算) slots between Cr and GFR; eUPCR/eUACR follow eGFR so the
  // whole renal panel is clustered together.
  const focusedOrder = new Map();
  FOCUSED_LAB_TESTS.forEach((t, i) => { if (!focusedOrder.has(t.name)) focusedOrder.set(t.name, i); });
  const crIdx = focusedOrder.get('Cr');
  if (crIdx != null) {
    focusedOrder.set('eGFR(計算)', crIdx + 0.3);
    focusedOrder.set('eUPCR(計算)', crIdx + 0.4);
    focusedOrder.set('eUACR(計算)', crIdx + 0.5);
  }
  const rowNames = Object.keys(itemMap).sort((a, b) => {
    const fa = focusedOrder.has(a) ? focusedOrder.get(a) : 1000 + itemMap[a].order;
    const fb = focusedOrder.has(b) ? focusedOrder.get(b) : 1000 + itemMap[b].order;
    return fa - fb;
  });

  if (dates.length === 0 || rowNames.length === 0) return `<p class="empty">無檢驗資料</p>${debugComment}`;

  let thead = '<tr><th class="lab-item-col">項目</th>';
  for (const d of dates) thead += `<th class="lab-date-col${colCls(d)}" data-short="${esc(rocShortDate(d))}" onclick="copyLabColumn(this)" title="點擊複製此次抽血數據(民國年格式)">${esc(fullDate(d))}</th>`;
  thead += '</tr>';

  let tbody = '';
  for (const name of rowNames) {
    const item = itemMap[name];
    const unit = item.unit || DEFAULT_UNITS[name] || '';
    const unitLabel = unit ? `<span class="lab-unit">${esc(unit)}</span>` : '';
    // Strip "(計算)" suffix etc. for the copy payload (clinically eGFR is enough).
    const copyName = name.replace(/\(計算\)/g, '').trim() || name;
    tbody += `<tr data-item="${esc(copyName)}"><td class="lab-item-name" title="點擊選取(高亮列)。點日期欄複製時，若有選取則只複製選的；${esc(item.code)}" onclick="toggleLabRow(this)">${esc(name)}${unitLabel}</td>`;
    for (const d of dates) {
      const arch = colCls(d);
      const cell = item.dates[d];
      if (cell) {
        if (item.synthetic === 'egfr' && cell.stage) {
          // Color the cell by CKD stage instead of using lab-low (which is green)
          const style = ckdStageStyle(cell.stage);
          const tip = `${cell.stage} · CKD-EPI 2021`;
          tbody += `<td class="${arch.trim()}" style="${style}" title="${esc(tip)}" data-val="${esc(cell.value)}">${esc(cell.value)}<span class="ckd-stage">${esc(cell.stage)}</span></td>`;
        } else {
          const cls = cell.dir === 'high' ? 'lab-high' : cell.dir === 'low' ? 'lab-low' : '';
          const tipParts = [];
          if (cell.ref) tipParts.push(`參考值 ${cell.ref}`);
          if (cell.alternates?.length) tipParts.push(`同日另: ${cell.alternates.join(' / ')}`);
          const altHtml = cell.alternates?.length
            ? `<span class="lab-alt"> /${esc(cell.alternates.join(' /'))}</span>`
            : '';
          tbody += `<td class="${cls}${arch}" title="${esc(tipParts.join(' · '))}" data-val="${esc(cell.value)}">${esc(cell.value)}${altHtml}</td>`;
        }
      } else {
        tbody += `<td class="no-data${arch}">-</td>`;
      }
    }
    tbody += '</tr>';
  }

  const archivedToggle = archivedCount > 0
    ? `<span class="lab-tool-sep">｜</span><a class="lab-tool-btn lab-archive-btn" data-n="${archivedCount}" onclick="toggleArchivedCols(this)">+ 顯示半年前 (${archivedCount}次)</a>`
    : '';
  const recentCount = dates.length - archivedCount;
  return `<div class="lab-toolbar"><span class="lab-tool-hint">點項目名稱可選取</span><a class="lab-tool-btn" onclick="selectAllLab(this)">全選</a><span class="lab-tool-sep">｜</span><a class="lab-tool-btn" onclick="clearLabSelection(this)">清空</a>${archivedToggle}<span class="lab-sel-count">未選取</span></div><div class="lab-scroll"><table class="lab-pivot"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>
  <div class="tracking-note">一年內 · ${rowNames.length} 項 · 近半年 ${recentCount} 次${archivedCount ? `(另 ${archivedCount} 次半年前已折疊)` : ''}</div>${debugComment}`;
}

// Build a hidden HTML comment carrying the raw lab fields so the clinic can
// send us the generated file instead of reading the DevTools console. We dump
// the union of every field key (to spot a possible specimen/sample-type field
// NHI might supply) plus full records related to creatinine / eGFR / urine —
// the data we need to keep the Cr → eGFR pipeline honest. Nothing renders.
function buildLabDebugComment(items) {
  if (!items || items.length === 0) return '';
  try {
    const keySet = new Set();
    for (const l of items) for (const k of Object.keys(l)) keySet.add(k);
    const relevant = items.filter(l => {
      const n = `${l.assay_item_name || ''} ${l.order_name || ''} ${l.assay_tp_cname || ''}`;
      return /creatinine|\bcr\b|e?gfr|urine|尿|肌酐|肌酸酐|腎絲球/i.test(n) || l.order_code === '09015C';
    });
    const payload = {
      generated: new Date().toISOString(),
      recordCount: items.length,
      allFieldKeys: [...keySet].sort(),
      sampleRecord: items[0],
      creatinineRelatedRecords: relevant,
    };
    // HTML comments may not contain "--"; neutralise so data can't break out.
    const json = JSON.stringify(payload, null, 2).replace(/--+/g, m => m.split('').join('​'));
    return `\n<!-- NHITW-DEBUG-START\n${json}\nNHITW-DEBUG-END -->\n`;
  } catch (e) {
    return `\n<!-- NHITW-DEBUG error: ${String(e && e.message || e).replace(/--+/g, '-')} -->\n`;
  }
}

// Probe for the freshly-enabled imue0100 (中醫處置 / 針灸治療) endpoint.
// We don't know the response shape yet — dump the whole thing into a hidden
// comment so the doctor can send the file and we'll know what fields to map
// into the diagnosis panel. Zero visual impact; same -- neutralisation as
// the lab debug above.
function buildAcupunctureProbeComment(rawData) {
  // ALWAYS emit something — distinguishing 'never fetched' (rawData null)
  // from 'fetched but empty' (rObject=[]) from 'has records' is exactly what
  // we need to diagnose ‘為什麼針灸沒抓到’ cases like 張寶玉 2026-06-26.
  try {
    let state = 'no_data_received';     // saveAcupunctureData never fired
    let items = null;
    if (rawData != null) {
      items = rawData.rObject || rawData.robject || (Array.isArray(rawData) ? rawData : null);
      state = Array.isArray(items)
        ? (items.length === 0 ? 'fetched_but_empty' : 'has_records')
        : 'unknown_shape';
    }
    const sampleCount = Array.isArray(items) ? items.length : 0;
    const keySet = new Set();
    if (Array.isArray(items)) {
      for (const r of items.slice(0, 200)) {
        if (r && typeof r === 'object') for (const k of Object.keys(r)) keySet.add(k);
      }
    }
    const payload = {
      generated: new Date().toISOString(),
      endpoint: 'imue0160s02 (中醫處置 / 針灸治療)',
      state,
      shape: Array.isArray(items) ? 'array' : typeof items,
      recordCount: sampleCount,
      allFieldKeys: [...keySet].sort(),
      firstFiveRecords: Array.isArray(items) ? items.slice(0, 5) : null,
      rawIfNonArray: items == null && rawData != null ? rawData : undefined,
    };
    const json = JSON.stringify(payload, null, 2).replace(/--+/g, m => m.split('').join('​'));
    return `\n<!-- NHITW-ACU-PROBE-START\n${json}\nNHITW-ACU-PROBE-END -->\n`;
  } catch (e) {
    return `\n<!-- NHITW-ACU-PROBE error: ${String(e && e.message || e).replace(/--+/g, '-')} -->\n`;
  }
}

// Hidden probe for the patient-identity pipeline. Background.js fills the
// patientMeta._identityProbe bag with masked values + structural debug from
// the legacyContent getPatientInfo handler. Emitted as an HTML comment so it
// has zero visual impact; lets us inspect WHY a particular export lost the
// patient name (JWT lacked UserName? DOM scrape regex missed? sessionStorage
// had no token at all?) without making the doctor open DevTools.
function buildIdentityProbeComment(probe) {
  if (!probe) return '';
  try {
    const json = JSON.stringify(probe, null, 2).replace(/--+/g, m => m.split('').join('​'));
    return `\n<!-- NHITW-IDENTITY-PROBE-START\n${json}\nNHITW-IDENTITY-PROBE-END -->\n`;
  } catch (e) {
    return `\n<!-- NHITW-IDENTITY-PROBE error: ${String(e && e.message || e).replace(/--+/g, '-')} -->\n`;
  }
}

// --- CKD-EPI 2021 (race-free) — ported from the user's ckd-calculator ---
// Detect female from various JWT/UI representations of UserSex.
function isFemaleSex(s) {
  const v = String(s || '').trim().toUpperCase();
  return v === 'F' || v === 'FEMALE' || v === '2' || v === '女';
}
// Compute UPCR / UACR from raw urine concentrations when the lab didn't
// pre-compute the ratio. Some labs only report the components (urine
// protein + urine creatinine in mg/dL each) — the doctor would have to
// divide them manually to know if proteinuria crosses the clinical
// threshold. Returns { upcrByDate, uacrByDate } each keyed by ISO date.
//   UPCR (mg/g) = urine_protein_mg/dL × 1000 / urine_creatinine_mg/dL
//   UACR (mg/g) = urine_albumin_mg/dL × 1000 / urine_creatinine_mg/dL
// (Albumin reported in mg/L gets divided by 10 to standardise to mg/dL.)
// Convert any lab concentration to mg/dL so UPCR/UACR ratios come out in the
// standard mg/g regardless of how a given hospital reported the components.
// Returns null for units we don't recognise (caller then skips that row
// rather than guessing). molarMassMgPerMmol enables molar units (mmol/L,
// umol/L) — pass creatinine's 113.12; leave undefined for proteins/albumin
// (macromolecules aren't reported molar).
//   1 ug/mL = 1 mg/L = 0.1 mg/dL;  1 g/L = 100 mg/dL;  1 mg/L = 0.1 mg/dL
function concToMgDl(value, unit, molarMassMgPerMmol) {
  if (!isFinite(value)) return null;
  // normalise: lowercase, drop spaces, µ→u, strip a trailing '.'
  const u = String(unit || '').toLowerCase().replace(/\s+/g, '').replace(/µ/g, 'u').replace(/\.$/, '');
  const massTable = {
    'mg/dl': 1, 'mgdl': 1,
    'mg/l': 0.1,
    'g/dl': 1000, 'gm/dl': 1000,
    'g/l': 100,
    'mg/ml': 100,
    'ug/ml': 0.1, 'mcg/ml': 0.1,           // = mg/L
    'ug/dl': 0.001, 'mcg/dl': 0.001,
    'ug/l': 0.0001, 'mcg/l': 0.0001,
    'ng/ml': 0.0001,
    'ng/dl': 0.000001,
  };
  if (massTable[u] != null) return value * massTable[u];
  if (molarMassMgPerMmol) {
    if (u === 'mmol/l') return value * molarMassMgPerMmol / 10;      // mg/L → mg/dL
    if (u === 'umol/l') return value * molarMassMgPerMmol / 10000;   // ug/L-scale → mg/dL
  }
  return null; // unrecognised unit
}

function computeUrineRatios(rObject) {
  if (!Array.isArray(rObject)) return { upcrByDate: {}, uacrByDate: {} };
  const CR_MW = 113.12;          // creatinine mg per mmol (for molar units)
  const proteinByDate = {};      // all values standardised to mg/dL
  const albuminByDate = {};
  const ucrByDate = {};
  for (const l of rObject) {
    const name = (l.assay_item_name || '').toString();
    const orderName = (l.order_name || '').toString();
    const code = (l.order_code || '').trim();
    const unit = (l.unit_data || '').toString().trim();
    const val = parseFloat(l.assay_value);
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!isFinite(val) || val <= 0 || !date) continue;
    // Pre-computed ratios (mg/g) flow through the canonical pipeline, not here.
    if (/mg\s*\/\s*g/i.test(unit)) continue;
    // 試紙尿檢 never feeds a computed ratio (clinic rule): dipstick grades like
    // "1+ (30)" / "100" are estimates, not the precise concentrations a ratio
    // needs — using them yields a spurious eUACR that can false-trigger CKD.
    if (isDipstickUrinalysis(l)) continue;
    const joined = (name + ' ' + orderName).toLowerCase();
    // Urine creatinine (molar units supported via CR_MW)
    if (code === '09016C' || /urine creatinine|尿.*肌酸酐|肌酸酐.*尿|肌酐.*尿|尿.*肌酐|\bu-?cr\b/i.test(joined)) {
      const mgdl = concToMgDl(val, unit, CR_MW);
      if (mgdl != null && ucrByDate[date] == null) ucrByDate[date] = mgdl;
      continue;
    }
    // Raw urine microalbumin (concentration — mg/g ratios already skipped)
    if (code === '12111C' || /microalbumin|urine albumin|尿微?白蛋白|微白蛋白/i.test(joined)) {
      const mgdl = concToMgDl(val, unit);
      if (mgdl != null && albuminByDate[date] == null) albuminByDate[date] = mgdl;
      continue;
    }
    // Raw urine protein. Plausibility: concentration < 500 mg/dL (even
    // nephrotic-range is well under that; guards against a ratio slipping in).
    if (code === '09040C' || /urine protein|尿蛋白/i.test(joined)) {
      const mgdl = concToMgDl(val, unit);
      if (mgdl != null && mgdl < 500 && proteinByDate[date] == null) proteinByDate[date] = mgdl;
      continue;
    }
  }
  const upcrByDate = {};
  for (const [date, p] of Object.entries(proteinByDate)) {
    const ucr = ucrByDate[date];
    if (ucr > 0) upcrByDate[date] = p * 1000 / ucr;   // mg/g
  }
  const uacrByDate = {};
  for (const [date, a] of Object.entries(albuminByDate)) {
    const ucr = ucrByDate[date];
    if (ucr > 0) uacrByDate[date] = a * 1000 / ucr;   // mg/g
  }
  return { upcrByDate, uacrByDate };
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
// Sex-specific reference ranges, e.g. "[(M:0.7-1.2 F:0.5-0.9)][]" /
// "[男:0.5~0.9 女:...]". Engages ONLY when both an M and F sub-range are
// present AND we know the patient's sex; otherwise returns null so the
// generic parser runs (which would otherwise grab the male range by
// position, mis-flagging female Cr/UA/Hb). isFemale: true/false to choose,
// null/undefined to skip.
function parseSexSpecificRange(reference, isFemale) {
  if (isFemale == null) return null;
  const s = String(reference || '');
  const grab = (re) => {
    const m = s.match(re);
    if (!m) return null;
    const lo = parseFloat(m[1]), hi = parseFloat(m[2]);
    return (isNaN(lo) || isNaN(hi)) ? null : { min: lo, max: hi };
  };
  const male = grab(/[M男][:：\s]*(-?\d*\.?\d+)\s*[-~～]\s*(-?\d*\.?\d+)/);
  const female = grab(/[F女][:：\s]*(-?\d*\.?\d+)\s*[-~～]\s*(-?\d*\.?\d+)/);
  if (!male || !female) return null;
  return isFemale ? female : male;
}

function refDisplay(refStr, orderCode, isFemale) {
  const range = labRefRange(refStr, orderCode, isFemale);
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
function labRefRange(reference, orderCode, isFemale) {
  const range = labRefRangeRaw(reference, orderCode, isFemale);
  // Reversed bounds — some labs write the UPPER bound first ('[130][0]' for
  // LDL, meaning <130). Parsed verbatim that became min=130/max=0: the
  // tooltip showed '130-0' and every value >0 got red-flagged high (梁信盛
  // 2026-07-24: LDL 69 marked high). Swap so display and direction both read
  // the range the lab actually meant.
  if (range && range.min != null && range.max != null &&
      isFinite(range.min) && isFinite(range.max) && range.min > range.max) {
    return { ...range, min: range.max, max: range.min };
  }
  return range;
}

function labRefRangeRaw(reference, orderCode, isFemale) {
  // Sex-specific ranges first — only fires when both M+F present and sex known.
  const sexed = parseSexSpecificRange(reference, isFemale);
  if (sexed) return sexed;
  const s = String(reference || '');
  // Allow non-`]` content after the upper bound (most often a unit suffix
  // like '15-37 U/L'). Without this the regex fails, falls through to
  // parseReferenceRange's doubleBracketRange, which then strips only the
  // FIRST numeric token from each bracket — so '[15-37 U/L][15-37 U/L]'
  // ends up parsed as min=15 max=15 and the tooltip shows the bogus
  // '15-15' (王云 thyroid panel 2026/06/04 case).
  const m = s.match(/\[\s*(-?\d*\.?\d+)\s*[-~]\s*(-?\d*\.?\d+)[^\]]*\]/);
  if (m) {
    const lo = parseFloat(m[1]);
    const hi = parseFloat(m[2]);
    if (!isNaN(lo) && !isNaN(hi)) return { min: lo, max: hi };
  }
  try { return parseReferenceRange(reference, orderCode || null, null); } catch { return null; }
}

// 'high' = above reference max, 'low' = below reference min, null = normal/unknown.
function labDirection(value, reference, orderCode, isFemale) {
  if (value == null || value === '' || value === '***') return null;
  const num = parseFloat(value);
  if (isNaN(num)) return null;
  const range = labRefRange(reference, orderCode, isFemale);
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
  // S04 只有「S04.0 視神經及神經徑之損傷」(S0401–S0404) 列入高度 — 整個
  // 'S04' 會把 S04.5 顏面神經損傷等誤判為高度(邱乾仁 2026-07-25 案例,
  // 附表確認 S04.5 不在高度清單;其 G51 仍符合中度)。
  'S01.9','S04.0','S06.3','S06.4','S06.5','S06.6',
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
  // Pure-acupuncture visits (imue0160, 未開內服藥) carry their ICD ONLY here —
  // without this sweep a stroke patient treated exclusively with 針灸 never
  // lights the 高度複雜針灸 / cancer / asthma badges.
  sweep(data.acupunctureData?.rObject || data.acupunctureData?.robject);
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

// --- 孕產專案 ---
// 過往診斷命中任一即提示(依診所圈選之範圍):
//   N96 習慣性流產 / N97 女性不孕症 / N98 人工受孕相關併發症
//   N46 男性不孕症(含 N460 無精症、N461 寡精症、N468/N469)
//   O00–O48 妊娠相關:流產後果之妊娠、高危險妊娠監測、妊娠高血壓蛋白尿浮腫、
//            與妊娠相關之母體異常、胎兒/羊膜腔/分娩問題之母體照護
//   (O60 以後之產程/分娩/產褥期不在圈選範圍,不列入)
const OBSTETRIC_PREFIXES = ['N96', 'N97', 'N98', 'N46'];
function getMatchedObstetricCodes(data) {
  const set = new Set();
  for (const c of collectAllIcdCodes(data)) {
    if (OBSTETRIC_PREFIXES.some(p => codeMatchesPrefix(c, p))) { set.add(c); continue; }
    const m = /^O(\d{2})/.exec(String(c).replace(/\./g, '').toUpperCase().trim());
    if (m && parseInt(m[1], 10) <= 48) set.add(c);
  }
  return set;
}

function buildObstetricBadge(data) {
  const codes = [...getMatchedObstetricCodes(data)];
  console.log('[NHITW Clinic] Obstetric matches:', codes);
  if (codes.length === 0) return '';
  const shown = codes.slice(0, 12).join(', ');
  const more = codes.length > 12 ? `… (+${codes.length - 12})` : '';
  const tooltip = `孕產/不孕相關診斷:${shown}${more}\n範圍:N96 習慣性流產、N97 女性不孕、N98 人工受孕併發症、N46 男性不孕、O00–O48 妊娠相關`;
  return `<span class="obst-badge" title="${esc(tooltip)}">🤰 孕產專案</span>`;
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
  const tooltip = `符合 ICD: ${shown}${more}\n⚠ 申報複雜針時，主訴應有其診斷相關病情變化敘述`;
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
  const tooltip = `符合中醫癌症加強照護方案：${names}\n命中 ICD: ${shown}${more}\n⚠ 需在重大傷病卡有效期間、以重大傷病身分就醫才能收案`;
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
  const tooltip = `符合中醫氣喘專案：收案年−出生年=${diff} (<12)，曾下氣喘診斷\n命中 ICD: ${shown}${more}\n⚠ 需有西醫氣喘診斷書才能收案`;
  return `<span class="asthma-badge" title="${esc(tooltip)}">🫁 氣喘專案</span>`;
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

  // CKD enrolment may ONLY consider the most recent relevant draw — an older
  // abnormal proteinuria result must never resurrect once a newer (normal) one
  // exists (只看最近1次相關的抽血數據). So gather every proteinuria data point
  // with its date + abnormal flag, then judge solely by the latest draw.
  const points = [];   // { date, high, value, ref, code, name }

  // Synthesised ratios from raw components (dipstick already excluded upstream)
  // — catches labs that report only the parts, not a pre-computed UPCR/UACR.
  const { upcrByDate, uacrByDate } = computeUrineRatios(labData.rObject);
  for (const [date, ratio] of Object.entries(upcrByDate)) {
    points.push({ date, high: ratio >= 150, value: ratio.toFixed(0), ref: '<150', code: '', name: 'eUPCR(計算)' });
  }
  for (const [date, ratio] of Object.entries(uacrByDate)) {
    points.push({ date, high: ratio >= 30, value: ratio.toFixed(0), ref: '<30', code: '', name: 'eUACR(計算)' });
  }

  // Below-detection quantitative components ("0", "<4"): the ratio loop above
  // must skip them (no number to divide), but the draw itself IS the newest
  // proteinuria evidence — essentially none. Without a normal anchor point
  // here, the latest-draw rule would fall back to an OLDER abnormal ratio and
  // resurrect 先前的 data (audit finding #6).
  for (const l of labData.rObject) {
    if (isDipstickUrinalysis(l)) continue;
    const raw = String(l.assay_value == null ? '' : l.assay_value).trim();
    const belowDetect = /^[<＜]\s*\d/.test(raw) || parseFloat(raw) === 0;
    if (!belowDetect) continue;
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!date) continue;
    const code = (l.order_code || '').trim();
    const joined = ((l.assay_item_name || '') + ' ' + (l.order_name || '')).toLowerCase();
    if (code === '12111C' || /microalbumin|urine albumin|尿微?白蛋白|微白蛋白/i.test(joined)) {
      points.push({ date, high: false, value: raw, ref: '<30', code, name: 'eUACR(計算)' });
    } else if (code === '09040C' || /urine protein|尿蛋白/i.test(joined)) {
      points.push({ date, high: false, value: raw, ref: '<150', code, name: 'eUPCR(計算)' });
    }
  }

  // Lab-reported UPCR/UACR rows (試紙尿檢 excluded — a 半定量 ratio like
  // "微白蛋白/肌酐酸比值(半定量) 1+ (30)" must never count as a real UACR).
  for (const l of labData.rObject) {
    if (isDipstickUrinalysis(l)) continue;
    // Defensive: strip a trailing (尿) suffix in case any path re-introduces it.
    const n = canonicalLabName(l).replace(/[(（]\s*尿\s*[)）]\s*$/, '');
    if (n !== 'UPCR' && n !== 'UACR') continue;
    const date = parseDate(l.real_inspect_date || l.recipe_date || '');
    if (!date) continue;
    points.push({
      date, high: labDirection(l.assay_value, l.consult_value, l.order_code) === 'high',
      value: l.assay_value, ref: l.consult_value || '', code: l.order_code || '', name: n,
    });
  }

  if (points.length === 0) return null;

  // Anchor on the last date a proteinuria marker was actually measured. A more
  // recent NON-proteinuria panel (e.g. a lone serum Cr) doesn't reset it. If the
  // latest such draw is abnormal → proteinuria; if normal → none (older abnormal
  // values are 先前的 data and are ignored). Synth points precede canonical ones
  // so the computed ratio keeps its historical precedence on a tie.
  const latestDate = points.reduce((m, p) => (p.date > m ? p.date : m), '');
  const onLatest = points.filter(p => p.date === latestDate);
  return onLatest.find(p => p.high) || null;
}
// Lab-reported eGFR: trust a plain number; ignore fuzzy '>60 (100 僅供參考)'
// text — that carries little information, so a CKD-EPI computation from
// serum Cr is sharper in that case.
function parseLabGfr(v) {
  const s = String(v == null ? '' : v).trim();
  if (s === '') return null;
  if (/[<>＜＞≧≦≥≤]/.test(s)) return null;
  const m = s.match(/-?\d+\.?\d*/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return isNaN(n) ? null : n;
}
function buildCkdBadge(data, patientMeta = {}) {
  const cr = getLatestLabValue(data?.labData, 'Cr');
  const labGfrRec = getLatestLabValue(data?.labData, 'GFR');
  const labGfr = labGfrRec ? parseLabGfr(labGfrRec.value) : null;

  const age = patientMeta?.age;
  const hasAgeSex = (typeof age === 'number' && age > 0 && !!patientMeta?.sex);
  const isFemale = patientMeta?.sex ? isFemaleSex(patientMeta.sex) : false;

  // Decide the eGFR used for staging. Only the most recent renal draw counts
  // (只看最近1次相關的抽血數據): the lab-filed eGFR is authoritative and wins on
  // a tie, so we use it UNLESS a strictly newer serum Cr exists — a stale lab
  // eGFR must not override a fresher Cr. If the Cr path can't produce a value
  // (implausible, or no age/sex to compute), fall back to the lab eGFR.
  let egfr = null, basis = '', basisDate = '';
  const labGfrUsable = labGfr != null && labGfr > 0;
  const useCr = cr && (!labGfrUsable || cr.date > labGfrRec.date);
  if (useCr) {
    const scr = parseFloat(cr.value);
    if (scr > 15) {
      console.warn('[NHITW Clinic] CKD badge: ignoring Cr=' + scr + ' (not plausible as serum)');
    } else if (scr > 0 && hasAgeSex) {
      egfr = computeEgfr(scr, age, isFemale);
      basis = `Cr=${scr} mg/dL（CKD-EPI 計算）`;
      basisDate = cr.date;
    }
  }
  if (egfr == null && labGfrUsable) {
    egfr = labGfr;
    basis = `Lab eGFR ${labGfr} mL/min/1.73m²（檢驗報告認列）`;
    basisDate = labGfrRec.date;
  }
  console.log('[NHITW Clinic] CKD check: labGFR=' + labGfr + ' Cr=' + (cr?.value ?? 'none') + ' → eGFR=' + (egfr != null ? egfr.toFixed(1) : 'null') + ' (' + (basis || 'no basis') + ')');
  if (egfr == null) return '';
  const stage = ckdStage(egfr);
  if (stage === '正常') return '';

  // <60 (G3a/b/4/5) — eligible regardless of proteinuria
  if (egfr < 60) {
    const tip = `eGFR ${egfr.toFixed(1)} mL/min/1.73m² (${stage})，符合中醫慢性腎臟病門診加強照護計畫\n依據：${basis} @ ${basisDate}\n需主診斷 ICD-10 N18.2-N18.6`;
    return `<span class="ckd-badge ckd-eligible" title="${esc(tip)}">🫘 CKD 收案 (${stage})</span>`;
  }

  // G2 (60-89.9) — needs proteinuria/hematuria
  const prot = findAbnormalProteinuria(data?.labData);
  if (prot) {
    const tip = `eGFR ${egfr.toFixed(1)} (${stage}) + ${prot.name}=${prot.value} 超標 (參考 ${prot.ref || '無'}) @ ${prot.date}\n符合 stage 2 收案條件 — 需主診斷 ICD-10 N18.2-N18.6\n依據：${basis}`;
    return `<span class="ckd-badge ckd-eligible" title="${esc(tip)}">🫘 CKD 收案 (stage 2 + 蛋白尿)</span>`;
  }
  const tip = `eGFR ${egfr.toFixed(1)} (${stage})；stage 2 收案需 UPCR≥150 mg/g、UACR≥30 mg/g（糖尿病）或血尿，請臨床判斷\n依據：${basis} @ ${basisDate}`;
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
  // Route through parseDate so ROC 民國年 dates land in the right century —
  // new Date('114/12/09') is a VALID year-114 date, so the old NaN fallback
  // never caught it and the record silently failed every window check.
  let d = new Date(parseDate(String(dateStr)));
  if (isNaN(d.getTime())) d = new Date(String(dateStr));
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
          `<span class="med-pres">${esc(shortDate(p.date))} ${esc(p.hosp)}${p.drugLeft && p.drugLeft !== '0' ? ` <span class="drug-left">餘${esc(p.drugLeft)}天</span>` : ''}</span>`
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
// 中藥餘藥天數:就診日服第 1 天,餘藥 = func_date + day − 今天(0 = 已服完)。
function cmDaysLeft(dateStr, day) {
  const d = parseInt(day, 10);
  if (!dateStr || !isFinite(d) || d <= 0) return 0;
  const start = new Date(dateStr);
  if (isNaN(start.getTime())) return 0;
  const left = Math.ceil((start.getTime() + d * 86400000 - Date.now()) / 86400000);
  return left > 0 ? left : 0;
}
// 全部中藥就診中最大的餘藥天數 — 掛在面板標題上,收合狀態也看得到。
function cmMaxDaysLeft(items) {
  if (!Array.isArray(items)) return 0;
  let max = 0;
  for (const m of items) {
    const left = cmDaysLeft(parseDate(m.func_date || ''), m.day);
    if (left > max) max = left;
  }
  return max;
}

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
    // 餘藥天數 — 鮮豔標示這次就診的藥還剩幾天(取該次處方中最大天數)
    const groupLeft = Math.max(0, ...g.meds.map(m => cmDaysLeft(g.date, m.day)));
    if (groupLeft > 0) html += ` <span class="cm-left">💊 餘${groupLeft}天</span>`;
    html += '</div>';
    // Dedupe within a visit: NHI sometimes returns the same prescription
    // twice (correction + original 申報, batch-packet splits, etc.) which
    // previously showed up as 「薏苡仁湯 42 TID 7天 / 薏苡仁湯 35 TID 7天」
    // on the same date. Treat (drug name, freq, days) as identity — if a
    // dup exists, keep the row with the larger qty and stash the other in
    // a tooltip so nothing's silently lost.
    const byKey = new Map();
    for (const m of g.meds) {
      const name = m.drug_perscrn_name || m.cdrug_name || '';
      const qty = parseFloat(m.order_qty) || 0;
      const freq = m.drug_fre || '';
      const days = m.day || '';
      const k = `${name}|${freq}|${days}`;
      const prev = byKey.get(k);
      if (!prev) {
        byKey.set(k, { name, qty, freq, days, raw: m.order_qty || '', alts: [] });
      } else if (qty > prev.qty) {
        prev.alts.push(prev.raw);
        prev.qty = qty;
        prev.raw = m.order_qty || '';
      } else if (String(m.order_qty || '') !== prev.raw) {
        prev.alts.push(m.order_qty || '');
      }
    }
    for (const r of byKey.values()) {
      const altTip = r.alts.length ? ` title="同筆處方另存 qty=${esc(r.alts.join(', '))}"` : '';
      const altMark = r.alts.length ? ` <span class="med-dup">⚠</span>` : '';
      html += `<div class="med-item"${altTip}>${esc(r.name)} <span class="med-detail">${esc(r.raw)} ${esc(r.freq)} ${r.days ? esc(r.days)+'天' : ''}${altMark}</span></div>`;
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
  // Right-column ordering: clinically actionable / day-to-day items first
  // (allergy, surgery, prevention/screening), then 住院 history at the bottom.
  // The doctor cares about "what is this patient on today" before "what was
  // s/he hospitalized for in the past".
  let rightExtra = '';
  if (panels.allergyHtml && !panels.allergyHtml.includes('無過敏')) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">⚠ 過敏紀錄</div><div class="panel-body">${panels.allergyHtml}</div></div>`;
  }
  if (panels.surgeryHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🔪 手術紀錄</div><div class="panel-body">${panels.surgeryHtml}</div></div>`;
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
  if (panels.dischargeHtml) {
    rightExtra += `<div class="panel"><div class="panel-title" onclick="togglePanel(this)">🏥 住院紀錄</div><div class="panel-body">${panels.dischargeHtml}</div></div>`;
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
.obst-badge { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; background:#ad1457; color:#fff; }
.ckd-badge { display:inline-block; margin-left:8px; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; vertical-align:middle; cursor:help; color:#fff; }
.ckd-badge.ckd-eligible { background:#c62828; }
.ckd-badge.ckd-watch    { background:#ed6c02; }

/* 專案提醒列 — badge 亮起時直接顯示在標題下,不必 hover */
.project-notes { background:#fff8e1; border-bottom:2px solid #f9a825; padding:7px 20px; display:flex; flex-wrap:wrap; gap:6px 22px; }
.project-note { font-size:13px; font-weight:600; color:#7a5c00; }

/* 中藥餘藥天數 — 鮮豔晶片,收合的面板標題上也會出現 */
.cm-left { display:inline-block; margin-left:6px; padding:1px 9px; border-radius:10px; background:#e91e63; color:#fff; font-size:11px; font-weight:700; vertical-align:middle; }

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
.diag-count { background:#e3f2fd; color:#1565c0; padding:0 5px; border-radius:8px; font-size:10px; font-weight:600; margin-left:auto; flex-shrink:0; cursor:pointer; user-select:none; }
.diag-count:hover { background:#1565c0; color:#fff; }
.diag-visits { font-size:10px; color:#777; margin:2px 0 2px 10px; border-left:2px solid #90caf9; padding-left:7px; }
.diag-visits div { padding:1px 0; }
.diag-meta { color:#999; font-size:10px; margin-left:auto; flex-shrink:0; }
.diag-more { color:#999; font-size:11px; padding:4px 0; text-align:center; }
.diag-more-toggle { color:#8a6d3b; font-size:11px; padding:5px 0; text-align:center; cursor:pointer; user-select:none; border-top:1px dashed #eee; }
.diag-more-toggle:hover { text-decoration:underline; }
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
/* Columns older than half a year — hidden until the doctor expands them */
.lab-pivot .lab-col-archived { display:none; }
.lab-pivot.show-archived .lab-col-archived { display:table-cell; }
.lab-archive-btn { color:#8a6d3b; }
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
.diag-item.diag-obst-match { background:linear-gradient(90deg, rgba(173,20,87,0.15), transparent); border-left:3px solid #ad1457; padding-left:5px; }

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
  .panel-title::before { content:'▾ ' !important; }
  /* 列印 = 完整病歷:收合的較早診斷與半年前檢驗欄一律展開;切換鈕不印 */
  .diag-more-list { display:block !important; }
  .lab-pivot .lab-col-archived { display:table-cell !important; }
  .diag-more-toggle, .lab-toolbar { display:none !important; }
}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>${esc(name)}${panels.acuBadgeHtml || ''}${panels.cancerBadgeHtml || ''}${panels.asthmaBadgeHtml || ''}${panels.ckdBadgeHtml || ''}${panels.obstBadgeHtml || ''}</h1>
    <div class="meta">${esc(id)}${panels.patientMetaLine ? ' ｜ ' + esc(panels.patientMetaLine) : ''} ｜ ${esc(dateStr)}</div>
  </div>
  <div class="actions">
    <a onclick="expandAll()">全部展開</a>
    <a onclick="collapseAll()">全部收合</a>
    <a onclick="window.print()">列印</a>
  </div>
</div>
${panels.projectNotesHtml || ''}
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
      <div class="panel-title collapsed" onclick="togglePanel(this)">中藥用藥${panels.cmLeftChipHtml || ''}</div>
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
function toggleDiagVisits(el) {
  var item = el.closest('.diag-item');
  var list = item ? item.querySelector('.diag-visits') : null;
  if (!list) return;
  list.style.display = list.style.display === 'none' ? 'block' : 'none';
}
function toggleDiagMore(btn) {
  var list = btn.nextElementSibling;
  if (!list) return;
  var hidden = list.style.display === 'none';
  list.style.display = hidden ? 'block' : 'none';
  var n = btn.dataset.n || '';
  btn.textContent = (hidden ? '− 收合較早診斷 (' : '+ 顯示較早診斷 (') + n + ' 筆)';
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
    counter.textContent = n > 0 ? ('已選 ' + n + ' 項') : '未選取';
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
function toggleArchivedCols(btn) {
  var panel = btn.closest('.panel-body');
  var table = panel ? panel.querySelector('.lab-pivot') : null;
  if (!table) return;
  var showing = table.classList.toggle('show-archived');
  var n = btn.dataset.n || '';
  btn.textContent = showing ? ('− 收合半年前 (' + n + '次)') : ('+ 顯示半年前 (' + n + '次)');
}
function copyLabColumn(th) {
  var idx = th.cellIndex;
  var shortDate = th.dataset.short || '';
  var table = th.closest('table');
  if (!table) return;
  // If the user has highlighted specific rows, only copy those; otherwise
  // copy every row (the unselected default — no regression from the
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
</script>
${panels.acupunctureProbeHtml || ''}${panels.identityProbeHtml || ''}
</body>
</html>`;
}
