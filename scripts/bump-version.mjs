// 把 manifest 版本設成台灣日期式(YYYY.M.D),同日再發自動加第四段。
// 商店(Edge/Chrome)只接受「嚴格遞增」的版本 —— 舊的 25.1201.3 固定不動
// 是上不了商店的根本原因之一。
import { readFileSync, writeFileSync } from 'node:fs';

const p = 'public/manifest.json';
const m = JSON.parse(readFileSync(p, 'utf8'));
const tw = new Date(Date.now() + 8 * 3600 * 1000); // UTC+8
const today = `${tw.getUTCFullYear()}.${tw.getUTCMonth() + 1}.${tw.getUTCDate()}`;

let next;
if (m.version === today || m.version.startsWith(today + '.')) {
  const seg = m.version.split('.');
  next = seg.length === 3 ? `${today}.1` : `${today}.${parseInt(seg[3], 10) + 1}`;
} else {
  next = today;
}
m.version = next;
writeFileSync(p, JSON.stringify(m, null, 2) + '\n');
console.log(`version → ${next}`);
