import {assert} from './lib/chai.js';

import {
  generateHtmlReport,
  getProjectTags,
  getReportFilename,
} from './src/utils/htmlReportGenerator.js';

// 檢驗日期一律用「幾天前」動態產生 —— CKD 只採計 180 天內的檢驗,寫死日期
// 的測試過半年就會自己壞掉。
function daysAgo(n) {
  const d = new Date(Date.now() - n * 86400000);
  const p = (v) => String(v).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}

// 民國 YYYMMDD 生日字串,讓「今年 − 出生年」剛好等於 yearDiff。
function rocBirthday(yearDiff) {
  const roc = new Date().getFullYear() - yearDiff - 1911;
  return `${String(roc).padStart(3, '0')}0101`;
}

const ADULT_MALE = { age: 60, sex: 'M', birthday: rocBirthday(60) };
const CHILD = { age: 8, sex: 'M', birthday: rocBirthday(8) };

function icd(...codes) {
  return {
    medicationData: {
      rObject: codes.map(code => ({ icd_code: code, icd_cname: '測試診斷', drug_date: daysAgo(10) })),
    },
  };
}

function serumCr(value, date = daysAgo(10)) {
  return {
    order_code: '09015C', order_name: '肌酸酐、血', assay_item_name: 'Creatinine',
    assay_value: String(value), consult_value: '[0.6][1.3]', real_inspect_date: date,
  };
}

// 參考值用健保雲端的括號格式 [下限][上限]。
function uacr(value, date = daysAgo(10)) {
  return {
    order_code: '12111C', order_name: '微白蛋白', assay_item_name: 'UACR',
    assay_value: String(value), consult_value: '[][30]', real_inspect_date: date,
  };
}

function upcr(value, date = daysAgo(10)) {
  return {
    order_code: '09040C', order_name: '尿蛋白/肌酸酐比值', assay_item_name: 'UPCR',
    assay_value: String(value), consult_value: '[][150]', real_inspect_date: date,
  };
}

function labs(...rows) {
  return { labData: { rObject: rows } };
}

describe('utils/htmlReportGenerator', function () {
  describe('.getProjectTags', function () {
    it('should return an empty string when there is no data', function () {
      assert.strictEqual(getProjectTags({}, {}), '');
      assert.strictEqual(getProjectTags({}), '');
    });

    it('should tag 癌 for a cancer-care diagnosis', function () {
      assert.strictEqual(getProjectTags(icd('C50.911'), ADULT_MALE), '癌');
    });

    it('should tag 孕 for an obstetric / infertility diagnosis', function () {
      assert.strictEqual(getProjectTags(icd('N97.0'), ADULT_MALE), '孕');
    });

    it('should tag 喘 for asthma in a child under 12 (by year difference)', function () {
      assert.strictEqual(getProjectTags(icd('J45.20'), CHILD), '喘');
    });

    it('should not tag 喘 for asthma in an adult', function () {
      assert.strictEqual(getProjectTags(icd('J45.20'), ADULT_MALE), '');
    });

    it('should tag 腎 when eGFR < 60', function () {
      assert.strictEqual(getProjectTags(labs(serumCr(2.0)), ADULT_MALE), '腎');
    });

    it('should not tag 腎 for stage 2 without UPCR/UACR evidence (CKD 待確認)', function () {
      const data = labs(serumCr(1.1));
      assert.include(generateHtmlReport('測試', 'A123456789', data, ADULT_MALE), 'CKD 待確認');
      assert.strictEqual(getProjectTags(data, ADULT_MALE), '');
    });

    it('should tag 腎 for stage 2 with an abnormal UACR', function () {
      assert.strictEqual(getProjectTags(labs(serumCr(1.1), uacr(120)), ADULT_MALE), '腎');
    });

    it('should tag 腎 for stage 2 with an abnormal UPCR', function () {
      assert.strictEqual(getProjectTags(labs(serumCr(1.1), upcr(300)), ADULT_MALE), '腎');
    });

    it('should not tag 腎 for stage 2 when UACR/UPCR are within range', function () {
      assert.strictEqual(getProjectTags(labs(serumCr(1.1), uacr(12), upcr(80)), ADULT_MALE), '');
    });

    it('should not tag 腎 when the only labs are older than 180 days', function () {
      assert.strictEqual(getProjectTags(labs(serumCr(2.0, daysAgo(200))), ADULT_MALE), '');
    });

    it('should not tag complex-acupuncture indications (中高複)', function () {
      const data = icd('I69.351', 'M54.5');
      assert.include(generateHtmlReport('測試', 'A123456789', data, ADULT_MALE), '複雜針灸</span>');
      assert.strictEqual(getProjectTags(data, ADULT_MALE), '');
    });

    it('should join every matched project in the fixed order 腎癌孕喘', function () {
      const data = { ...icd('J45.909', 'O09.90', 'C22.0'), ...labs(serumCr(2.0)) };
      assert.strictEqual(getProjectTags(data, CHILD), '腎癌孕喘');
    });

    it('should agree with the badges shown on the report', function () {
      const data = { ...icd('J45.909', 'O09.90', 'C22.0'), ...labs(serumCr(2.0)) };
      const html = generateHtmlReport('測試', 'A123456789', data, CHILD);
      assert.include(html, 'CKD 收案');
      assert.include(html, '癌症專案（');
      assert.include(html, '孕產專案</span>');
      assert.include(html, '氣喘專案</span>');
    });
  });

  describe('.getReportFilename', function () {
    const at = new Date(2026, 10, 24, 8, 56, 34);

    it('should keep the plain filename when no project matches', function () {
      assert.strictEqual(getReportFilename('王小明', at), '王小明_20261124_085634.html');
      assert.strictEqual(getReportFilename('王小明', at, ''), '王小明_20261124_085634.html');
    });

    it('should append the project tags right before the extension', function () {
      assert.strictEqual(getReportFilename('王小明', at, '腎癌孕喘'), '王小明_20261124_085634腎癌孕喘.html');
      assert.strictEqual(getReportFilename('王小明', at, '喘'), '王小明_20261124_085634喘.html');
    });

    it('should strip characters Windows forbids from the tags', function () {
      assert.strictEqual(getReportFilename('王小明', at, '腎/..\\癌'), '王小明_20261124_085634腎..癌.html');
    });
  });
});
