#!/bin/bash
# Assemble the FULL install package: extension (dist/*) at zip root +
# native-host/ subfolder. Chrome loads the unzipped root folder directly
# (extra native-host/ dir is ignored by the extension loader).
# Usage: scripts/package-full.sh /path/out.zip
set -e
OUT="$1"; [ -z "$OUT" ] && { echo "usage: $0 out.zip"; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
cp -r "$ROOT/dist/." "$STAGE/"
mkdir -p "$STAGE/native-host"
for f in install.bat uninstall.bat nhitw_host.ps1 nhitw_host_launcher.bat test_host.ps1 com.nhitw.host.json config.json; do
  cp "$ROOT/native-host/$f" "$STAGE/native-host/"
done
rm -f "$OUT"; ( cd "$STAGE" && zip -rq "$OUT" . )
rm -rf "$STAGE"
echo "packaged: $OUT"
