#!/bin/bash
# 產出「商店上架用」zip:dist 內容在 zip 根層、manifest 去掉 key 欄位。
# (key 只用來固定「未封裝安裝」的 ID;商店有自己的簽章與 ID,包著 key 會被
#  商店拒收或造成混淆。院所用的完整包 package-full.sh 不受影響、保留 key。)
set -e
OUT="$1"; [ -z "$OUT" ] && { echo "usage: $0 out.zip"; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
cp -r "$ROOT/dist/." "$STAGE/"
python3 - "$STAGE/manifest.json" <<'PY'
import json, sys
p = sys.argv[1]
m = json.load(open(p, encoding='utf-8'))
m.pop('key', None)
json.dump(m, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
PY
rm -f "$OUT"; ( cd "$STAGE" && zip -rq "$OUT" . )
rm -rf "$STAGE"
echo "store package: $OUT (version $(python3 -c "import json;print(json.load(open('$ROOT/dist/manifest.json'))['version'])"))"
