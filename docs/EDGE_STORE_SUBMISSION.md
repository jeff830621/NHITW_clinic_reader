# Edge Add-ons 上架指南(一次性手動 + 之後全自動)

## 第一步:註冊開發者帳號(免費,約 10 分鐘)

1. 用你的 Microsoft 帳號登入 https://partner.microsoft.com/dashboard/microsoftedge/public/login
2. 選「個人(Individual)」註冊 Microsoft Edge 程式(免費,不需信用卡)
3. 填顯示名稱(建議:`NHITW Clinic Reader` 或你的診所/個人名義)

## 第二步:首次提交(手動一次,素材照抄下方)

Partner Center → Microsoft Edge → 「建立新的擴充功能」:

1. **上傳套件**:用我提供的 `NHITW_clinic_reader_store_v<版本>.zip`(dist 內容、已去 key、版本日期式)
2. **可用性(Availability)→ 能見度(Visibility)**:選 **「隱藏(Hidden)」** ← 關鍵!只有拿到連結的人能安裝
3. **屬性**:類別選「生產力(Productivity)」;隱私政策網址填:
   `https://github.com/jeff830621/NHITW_clinic_reader/blob/claude/continue-work-Hp1Na/PRIVACY.md`
4. **商店列表(繁體中文)**:文案見下方「商店文案」
5. **審查備註(Notes for certification)**:貼下方「審查員備註」
6. 送出 → 審查通常數個工作天

### 商店文案(可直接貼)

- **名稱**:NHITW 診間報告產生器
- **簡短描述**:查詢健保雲端時,自動將病患資料整理成單頁 HTML 報告,存入診所共享資料夾或下載資料夾,供診間快速檢視。
- **完整描述**:
  ```
  為台灣基層醫事機構設計的診間輔助工具。醫事人員在「健保醫療資訊雲端查詢
  系統」查詢病患資料時,本擴充套件自動將就醫診斷、用藥(西藥/中藥)、檢驗
  (含異常標紅與參考值)、影像報告、過敏、成人預防保健、四癌篩檢等資料,
  整理成一份可離線開啟的單頁 HTML 報告,並依「日期/診次」歸檔到診所共享
  資料夾(需安裝隨附的本機主機程式)或瀏覽器下載資料夾(免安裝)。

  特色:
  ・檢驗數據樞紐表:異常標紅、參考值、一鍵複製整次抽血數據
  ・收案提示:CKD、氣喘、癌症、複雜針灸、孕產等專案自動標示
  ・中藥餘藥天數提醒
  ・所有資料只在本機處理,不上傳任何伺服器(見隱私權政策)

  本工具衍生自 leescot 的「更好的健保雲端 2.0」(Apache 2.0),
  原始碼:https://github.com/jeff830621/NHITW_clinic_reader
  ```

### 審查員備註 / Certification notes(英文,<2000 字,每次提交都必填;可直接貼)

提交頁「Does a tester need credentials…」選 **Yes**(健保卡與醫事憑證無法提供),備註貼下方。
`[VIDEO LINK]` 換成示範影片連結(遮蔽病患資料;YouTube 不公開連結即可),沒有影片就刪掉那句。

```
IMPORTANT: no test credentials can exist for this extension.

It only activates on https://medcloud2.nhi.gov.tw (Taiwan National Health Insurance "MediCloud"). Login requires a physical healthcare-provider smart card, the patient's physical NHI card, and government-issued medical-institution credentials. These are legally non-transferable, so a demo account cannot be created. On any other site the extension is inert.

WHAT TESTERS CAN VERIFY WITHOUT CREDENTIALS
1. Install, click the toolbar icon: popup with 4 tabs (設定/資料/關於/雲端).
2. 設定 tab > "自動匯出 HTML 報告": switch 啟用自動匯出 ON, choose 匯出方式 = 瀏覽器下載 (browser download). Zero-setup mode: reports go via chrome.downloads to the download folder under NHITW_reports/. No native host needed.
3. 關於 tab: attribution, privacy policy, source links.

WHAT IT DOES: when a clinician queries a patient on MediCloud, it compiles the returned diagnoses, medications, lab results and imaging reports into ONE self-contained HTML report and saves it to the clinic's folder, so the consulting-room PC (no MediCloud access) can read it. Demo video, masked patient data: [VIDEO LINK]

PERMISSIONS
- nativeMessaging: optional mode writing the report to a clinic shared folder via a small open-source PowerShell host (github.com/jeff830621/NHITW_clinic_reader/tree/feat/clinic-reader/native-host). Not needed in download mode.
- downloads: the browser-download mode above.
- webRequest (observe only), scripting, storage, alarms, clipboardWrite: detect MediCloud API responses, inject UI on that site only, keep settings, debounce export, copy lab values.
- Host drugtw.com: optional drug-image lookup, OFF by default; sends a drug code only, never patient data.

PRIVACY: all data stays on the user's machine; nothing is sent to the developer or any server; no analytics. Policy: github.com/jeff830621/NHITW_clinic_reader/blob/feat/clinic-reader/PRIVACY.md
Full source: github.com/jeff830621/NHITW_clinic_reader
```

## 第三步:上架完成 ✅(2026-09-15)

- 商店連結:https://microsoftedge.microsoft.com/addons/detail/ffopjenekhkampkfckmbegbglnebhjib
- 商店指派的擴充套件 ID:`ffopjenekhkampkfckmbegbglnebhjib`(已寫入 install.bat 的 `EXT_ID_2`)
- 舊未封裝 ID `kilmdgbkklopaopdfahekedadkmfpfhk` 仍保留在 `EXT_ID_1`,兩者並行,院所可逐家遷移

## (原第三步)上架完成後,回報兩個東西給 Claude

1. **商店指派的擴充套件 ID**(商店頁網址最後一段,或 edge://extensions 裡看)
   → 我會把它填進 install.bat 的 `EXT_ID_2`,發新版主機安裝包
2. 商店連結(hidden 模式下的直接安裝連結)→ 放進院所教學

## 第四步:開通全自動發佈 ✅(2026-09-15 已完成並實測成功)

自動線已通:GitHub Actions run #3 上傳 v2026.9.15 → 微軟處理成功 → 送審成功
(submission 1152921505701897209)。之後的發版流程(由 Claude 一個指令完成):

1. `node scripts/bump-version.mjs && npm run build`
2. `bash scripts/package-store.sh` → 商店包放上 release 分支 `releases/`
3. 把檔名寫進 `.github/edge-publish.trigger` 並推送工作分支 → Actions 自動上傳、送審
4. 微軟審核通過 → 各院所 Edge 自動更新

> ⚠️ 設定 secrets 時的兩個坑(第一次都踩到了,workflow 已加防呆):
> - **Product ID ≠ 商店擴充套件 ID**。Product ID 是 Partner Center 產品頁網址
>   `/microsoftedge/【這段】/packages/` 裡的 36 碼 GUID;商店網址最後那 32 碼是擴充套件 ID,不是它。
> - 貼值時容易夾帶換行;workflow 現在會自動修剪並檢查格式。

### (原始設定步驟,保留備查)

1. Partner Center → Publish API 頁 → **Create API credentials**
   → 得到 Client ID 與 API key
2. 到 GitHub repo → Settings → Secrets and variables → Actions → New repository secret,建三個:
   - `EDGE_PRODUCT_ID`(Partner Center 產品頁網址裡的 GUID)
   - `EDGE_CLIENT_ID`
   - `EDGE_API_KEY`
3. 完成。之後每次發版:release 分支收到新的 store zip 時,GitHub Actions
   自動上傳並發佈到 Edge Add-ons;各院所的 Edge 會自動更新。

## 院所遷移(上架後一次性)

每台電腦:1) 移除舊的未封裝擴充套件 2) 點商店連結安裝 3) 重跑新版
install.bat(白名單含新 ID)4) 設定頁重新開啟自動匯出(換 ID 設定會歸零,
保留天數如非 40 也要重設)。
