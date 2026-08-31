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

### 審查員備註(英文,可直接貼)

```
This extension serves healthcare professionals at Taiwan NHI-contracted
clinics. It only activates on medcloud2.nhi.gov.tw (Taiwan's National
Health Insurance MediCloud system), which requires a physical NHI
smart-card reader and healthcare-provider credentials to log in — so the
site cannot be accessed from outside a Taiwanese clinical environment.

To verify core functionality WITHOUT any credentials or extra software:
open the extension settings → 自動匯出 HTML 報告 → enable the toggle →
choose 匯出方式 = 瀏覽器下載 (browser download mode). In this mode the
extension writes its generated HTML report via the chrome.downloads API;
no Native Messaging host is needed.

The optional Native Messaging host (nativeMessaging permission) is a
small open-source PowerShell script that writes the report into a
clinic-designated shared folder and deletes expired files. Source:
https://github.com/jeff830621/NHITW_clinic_reader/tree/claude/continue-work-Hp1Na/native-host

No data ever leaves the user's machine. No analytics, no remote servers.
A demo video of the full flow (with masked patient data) is available on
request.
```

## 第三步:上架完成後,回報兩個東西給 Claude

1. **商店指派的擴充套件 ID**(商店頁網址最後一段,或 edge://extensions 裡看)
   → 我會把它填進 install.bat 的 `EXT_ID_2`,發新版主機安裝包
2. 商店連結(hidden 模式下的直接安裝連結)→ 放進院所教學

## 第四步:開通全自動發佈(一次性)

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
