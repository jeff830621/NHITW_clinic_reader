#!/bin/bash
# Assemble the FULL install package, everything wrapped in a top-level
# NHITW_clinic_reader/ folder:
#   NHITW_clinic_reader/dist/         extension (Chrome loads THIS subfolder)
#   NHITW_clinic_reader/native-host/  host installer
#   NHITW_clinic_reader/README.html   doctor-facing install & self-update guide
# Usage: scripts/package-full.sh /path/out.zip
set -e
OUT="$1"; [ -z "$OUT" ] && { echo "usage: $0 out.zip"; exit 1; }
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="$(mktemp -d)"
mkdir -p "$STAGE/NHITW_clinic_reader/dist" "$STAGE/NHITW_clinic_reader/native-host"
cp -r "$ROOT/dist/." "$STAGE/NHITW_clinic_reader/dist/"
for f in install.bat uninstall.bat nhitw_host.ps1 nhitw_host_launcher.bat test_host.ps1 com.nhitw.host.json config.json; do
  cp "$ROOT/native-host/$f" "$STAGE/NHITW_clinic_reader/native-host/"
done
cp "$ROOT/packaging/README.html" "$STAGE/NHITW_clinic_reader/README.html"
rm -f "$OUT"; ( cd "$STAGE" && zip -rq "$OUT" NHITW_clinic_reader )
rm -rf "$STAGE"
echo "packaged: $OUT"
