# Chrome Web Store 上架指南(未列出 unlisted;一次手動,之後全自動)

> 已提交(2026-09-16)。項目 ID:`dapepocdemfppmbpflflkeaemkjigkag`(已寫入 install.bat `EXT_ID_3`)
> 商店連結:https://chromewebstore.google.com/detail/dapepocdemfppmbpflflkeaemkjigkag

**同一個商店包 zip 同時用於 Edge 與 Chrome**(`NHITW_clinic_reader_store_v<版本>.zip`)。

## 第一步:建立項目、上傳

1. 開發者主控台 https://chrome.google.com/webstore/devconsole → 「新增項目」→ 上傳商店包 zip
2. 上傳後**立刻記下項目 ID**:主控台網址 `…/devconsole/<發佈者ID>/<這串32碼>/edit`,或項目頁左上角
   → **把這串 ID 傳給 Claude**(要寫進 install.bat 的 `EXT_ID_3`,否則 Chrome 商店版連不上共享資料夾)

## 第二步:商店資訊(語言選「中文(繁體)」)

- **標題**:NHITW 診間報告產生器
- **摘要**(132 字內):查詢健保雲端時,自動將病患資料整理成單頁 HTML 報告存入診所共享資料夾,供診間快速檢視。
- **詳細說明**:與 Edge 相同 —— 見 `EDGE_STORE_SUBMISSION.md` 的「商店文案」
- **類別**:生產力工具(Productivity)
- **語言**:中文(繁體)
- **商店圖示**:128×128(`store-logo-128x128.png`)
- **螢幕擷取畫面**:至少 1 張,1280×800 或 640×400(**病患資料務必遮蔽**;拍設定頁最安全)
- **小型宣傳圖塊** 440×280:可選

## 第三步:隱私權(這頁最重要,逐項貼)

**單一用途說明**:見 `EDGE_STORE_SUBMISSION.md` 單一用途描述(同一段)

**權限理由**(每個權限一欄):
| 權限 | 理由 |
|---|---|
| `webRequest` | 觀察健保雲端(medcloud2.nhi.gov.tw)API 回應的抵達時機,以便在該病患資料齊全後產生報告。僅觀察,不修改、不封鎖任何請求。 |
| `storage` | 儲存使用者設定(自動匯出開關、保留天數、藥物分類設定),不含任何病患資料。 |
| `scripting` | 在健保雲端頁面注入本擴充功能的操作介面(僅該網域)。 |
| `clipboardWrite` | 讓醫師一鍵複製檢驗數據到病歷系統。 |
| `nativeMessaging` | 選用模式:透過開源的本機 PowerShell 主機,將報告寫入診所指定的共享資料夾並清除逾期檔案。原始碼:github.com/jeff830621/NHITW_clinic_reader/tree/feat/clinic-reader/native-host |
| `downloads` | 免安裝模式:將報告存入瀏覽器下載資料夾。 |
| `alarms` | 等待該病患各類資料串流完畢後再匯出(去抖動),避免產出不完整的報告。 |
| 主機權限 `medcloud2.nhi.gov.tw` | 本擴充功能唯一運作的網站(健保醫療資訊雲端查詢系統)。 |
| 主機權限 `drugtw.com` | 選用、預設關閉的藥品外觀圖查詢;僅送出藥品代碼,不含病患資料。 |

**遠端程式碼**:否(所有 JS 均打包於套件內)

**資料使用**:勾選「**健康資訊**」、「**個人識別資訊**」(報告含姓名、身分證號、就醫紀錄;僅於使用者裝置上處理、存入使用者指定的資料夾,不傳送至開發者或任何伺服器)。三項認證全部勾選:不販售、不用於核心功能以外用途、不用於信用評估或借貸。

**隱私權政策網址**:https://github.com/jeff830621/NHITW_clinic_reader/blob/feat/clinic-reader/PRIVACY.md

**審查備註**:貼 `docs/certification-notes.txt`(與 Edge 相同)

## 第四步:發布 → 能見度選「未列出」→ 提交審查

「發布」分頁 → 能見度 **未列出(Unlisted)** → 儲存草稿 → 提交審查。審查通常 1–3 個工作天。

## 第五步:開通自動發佈(一次性,約 15 分鐘)

> 自動發佈用的是 Chrome Web Store API **V2**(`scripts/cws-publish.sh`)。
> 五個 secrets 缺任何一個,workflow 會**略過 Chrome**(Edge 照常),並在 log 的 warning 列出缺哪幾個。

Chrome 用 OAuth,比 Edge 多幾步。**全程用「擁有開發者主控台項目」的那個 Google 帳號**:

1. Google Cloud Console https://console.cloud.google.com → 建立專案(任意名稱)
2. 「API 和服務」→「程式庫」→ 搜尋 **Chrome Web Store API** → 啟用
3. 「OAuth 同意畫面」→ 使用者類型選「外部」→ 填應用程式名稱與 Email → 儲存
4. **同一頁按「發布應用程式」,把發布狀態從「測試」改成「實際運作」**
   (僅自己使用,不需送 Google 驗證。**這步沒做,refresh token 7 天後失效**,自動發佈會在一週後突然壞掉)
5. 「憑證」→ 建立憑證 → **OAuth 用戶端 ID** → 類型「網頁應用程式」→ 已授權的重新導向 URI 填
   `https://developers.google.com/oauthplayground` → 記下 **用戶端 ID** 與 **用戶端密碼**
6. 開 https://developers.google.com/oauthplayground
   - 右上齒輪 → 勾「Use your own OAuth credentials」→ 貼用戶端 ID/密碼
   - 左側 Step 1 最下方的輸入框填 `https://www.googleapis.com/auth/chromewebstore` → Authorize APIs → 登入並同意
     (出現「Google 尚未驗證這個應用程式」→ 進階 → 繼續前往)
   - Step 2 按「Exchange authorization code for tokens」→ 複製 **Refresh token**
7. 找 **發佈者 ID**:開 https://chrome.google.com/webstore/devconsole ,網址會變成
   `…/devconsole/【發佈者 ID】`(點進項目則是 `…/devconsole/【發佈者 ID】/【32 碼項目 ID】/edit`)。只要中間那一串,不含斜線。
8. GitHub → repo → Settings → Secrets and variables → Actions → New repository secret,建五個:

   | Secret 名稱 | 值 |
   |---|---|
   | `CWS_PUBLISHER_ID` | 第 7 步的發佈者 ID |
   | `CWS_EXTENSION_ID` | `dapepocdemfppmbpflflkeaemkjigkag` |
   | `CWS_CLIENT_ID` | 第 5 步的用戶端 ID |
   | `CWS_CLIENT_SECRET` | 第 5 步的用戶端密碼 |
   | `CWS_REFRESH_TOKEN` | 第 6 步的 Refresh token |

9. 完成。之後發版推送 `.github/publish.trigger` 即 Edge + Chrome 同時上傳送審。
   只想補送 Chrome:Actions →「Publish to stores」→ Run workflow → stores 選 `chrome`。

### 失敗時看哪裡

| log 訊息 | 原因與處理 |
|---|---|
| `Chrome 缺少 secrets: …` | 列出的 secret 還沒建,或名稱打錯 |
| `取不到 Google access token` + `invalid_grant` | refresh token 失效 —— 確認第 4 步已發布,重做第 6 步換新的 token |
| `取不到 Google access token` + `invalid_client` | `CWS_CLIENT_ID` / `CWS_CLIENT_SECRET` 貼錯 |
| `Chrome 上傳失敗` + 403 / `PERMISSION_DENIED` | 第 6 步登入的帳號不是項目擁有者,或 `CWS_PUBLISHER_ID` 填錯 |
| `Chrome 上傳失敗` + 版本相關訊息 | 版本號沒有比商店上的大;或前一版仍在審查中,等審完再送 |

> V2 API 不能改能見度 —— 「未列出」維持在開發者主控台的設定。
