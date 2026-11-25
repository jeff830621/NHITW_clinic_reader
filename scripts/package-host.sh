#!/bin/bash
# 主機安裝包(僅 native-host + 教學),檔案在 zip 根層 —— 與歷來 host 包版面一致。
set -e
OUT="$1"; [ -z "$OUT" ] && { echo "usage: $0 out.zip"; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
for f in install.bat uninstall.bat nhitw_host.ps1 nhitw_host_launcher.bat test_host.ps1 com.nhitw.host.json config.json; do
  cp "$ROOT/native-host/$f" "$STAGE/"
done
cp "$ROOT/packaging/README.html" "$STAGE/README.html"
rm -f "$OUT"; ( cd "$STAGE" && zip -rq "$OUT" . )
rm -rf "$STAGE"
echo "host package: $OUT"
