#!/bin/bash
# 把商店包 zip 上傳到 Chrome Web Store 並送審(Chrome Web Store API V2)。
# 由 .github/workflows/publish-stores.yml 的 chrome job 呼叫;也可在本機手動跑。
#
#   用法: scripts/cws-publish.sh path/to/store.zip
#   環境變數(全部必填):
#     CWS_PUBLISHER_ID   開發者主控台網址 /devconsole/【這段】/… 的發佈者 ID
#     CWS_EXTENSION_ID   商店的 32 碼項目 ID
#     CWS_CLIENT_ID / CWS_CLIENT_SECRET / CWS_REFRESH_TOKEN   Google OAuth 憑證
#
# API 規格來源:https://chromewebstore.googleapis.com/$discovery/rest?version=v2
set -euo pipefail

ZIP="${1:-}"
[ -n "$ZIP" ] && [ -f "$ZIP" ] || { echo "::error::找不到商店包 zip: '$ZIP'"; exit 1; }

API="${CWS_API:-https://chromewebstore.googleapis.com}"
TOKEN_URL="${CWS_TOKEN_URL:-https://oauth2.googleapis.com/token}"

trim() { printf '%s' "${1:-}" | tr -d '[:space:]'; }
PUB=$(trim "${CWS_PUBLISHER_ID:-}")
EXT=$(trim "${CWS_EXTENSION_ID:-}")
CID=$(trim "${CWS_CLIENT_ID:-}")
SEC=$(trim "${CWS_CLIENT_SECRET:-}")
REF=$(trim "${CWS_REFRESH_TOKEN:-}")
for v in "$PUB" "$CID" "$SEC" "$REF"; do [ -n "$v" ] && echo "::add-mask::$v"; done

MISSING=""
[ -n "$PUB" ] || MISSING="$MISSING CWS_PUBLISHER_ID"
[ -n "$EXT" ] || MISSING="$MISSING CWS_EXTENSION_ID"
[ -n "$CID" ] || MISSING="$MISSING CWS_CLIENT_ID"
[ -n "$SEC" ] || MISSING="$MISSING CWS_CLIENT_SECRET"
[ -n "$REF" ] || MISSING="$MISSING CWS_REFRESH_TOKEN"
[ -z "$MISSING" ] || { echo "::error::缺少 secrets:$MISSING"; exit 1; }

echo "$EXT" | grep -Eq '^[a-p]{32}$' \
  || { echo "::error::CWS_EXTENSION_ID 應為 Chrome 商店的 32 碼小寫字母 ID(目前長度 ${#EXT})"; exit 1; }
echo "$PUB" | grep -Eq '^[A-Za-z0-9._-]+$' \
  || { echo "::error::CWS_PUBLISHER_ID 格式不對 —— 只填開發者主控台網址 /devconsole/【這段】/ 的那一串,不要含斜線或整個網址"; exit 1; }

ITEM="publishers/$PUB/items/$EXT"
VER=$(unzip -p "$ZIP" manifest.json | jq -r '.version')
echo "📦 $ZIP (version $VER) → $EXT"

# ── 1. 用 refresh token 換 access token ─────────────────────────────
RESP=$(curl -sS -X POST "$TOKEN_URL" \
  --data-urlencode "client_id=$CID" --data-urlencode "client_secret=$SEC" \
  --data-urlencode "refresh_token=$REF" --data-urlencode "grant_type=refresh_token")
TOKEN=$(echo "$RESP" | jq -r '.access_token // empty' 2>/dev/null || true)
if [ -z "$TOKEN" ]; then
  echo "::error::取不到 Google access token —— refresh token 失效(OAuth 同意畫面仍為「測試」狀態時 7 天過期)或 Client ID/Secret 不匹配"
  echo "$RESP" | jq -r '"\(.error // "?"): \(.error_description // "")"' 2>/dev/null || true
  exit 1
fi
echo "::add-mask::$TOKEN"
AUTH="Authorization: Bearer $TOKEN"

# 把 Google 的錯誤 JSON 印成一行人看得懂的訊息
explain() {
  echo "$1" | jq -r 'if .error then "API 錯誤 \(.error.code // "") \(.error.status // ""): \(.error.message // "")" else . end' 2>/dev/null || echo "$1"
}

# ── 2. 上傳套件 ─────────────────────────────────────────────────────
R=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/zip" \
  --data-binary "@$ZIP" "$API/upload/v2/$ITEM:upload")
STATE=$(echo "$R" | jq -r '.uploadState // empty' 2>/dev/null || true)
echo "upload: ${STATE:-（無 uploadState）}"

if [ "$STATE" = "IN_PROGRESS" ]; then
  for _ in $(seq 1 40); do
    sleep "${CWS_POLL_SECONDS:-15}"
    S=$(curl -sS -H "$AUTH" "$API/v2/$ITEM:fetchStatus")
    STATE=$(echo "$S" | jq -r '.lastAsyncUploadState // empty' 2>/dev/null || true)
    echo "upload: ${STATE:-?}"
    [ "$STATE" = "IN_PROGRESS" ] || break
  done
fi

if [ "$STATE" != "SUCCEEDED" ]; then
  echo "::error::Chrome 上傳失敗(狀態:${STATE:-無})—— 常見原因:版本號沒有比商店上的大(商店要求嚴格遞增)、前一版還在審查中、或 CWS_PUBLISHER_ID / CWS_EXTENSION_ID 填錯"
  explain "$R"
  exit 1
fi

# ── 3. 送審(能見度不變;V2 API 不能改能見度) ───────────────────────
R=$(curl -sS -X POST -H "$AUTH" -H "Content-Type: application/json" -d '{}' "$API/v2/$ITEM:publish")
STATE=$(echo "$R" | jq -r '.state // empty' 2>/dev/null || true)
echo "publish: ${STATE:-（無 state）}"
echo "$R" | jq -r '.warningInfo.warnings[]? | "::warning::\(.reason): \(.description)"' 2>/dev/null || true

case "$STATE" in
  PENDING_REVIEW) echo "✅ Chrome 已送審 v$VER(審查通常 1–3 個工作天)" ;;
  PUBLISHED|PUBLISHED_TO_TESTERS|STAGED) echo "✅ Chrome v$VER 狀態:$STATE" ;;
  *) echo "::error::Chrome 送審被拒(狀態:${STATE:-無})"; explain "$R"; exit 1 ;;
esac
