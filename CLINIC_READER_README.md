# NHITW 診間閱讀器

基於 [NHITW Cloud Analyzer React MUI](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) 的 fork，新增共享資料夾功能，讓診間醫師能查看櫃檯擷取的病患醫療資料。

## 安裝步驟

### 1. 安裝擴充套件

1. 下載或 clone 此專案
2. 執行 `npm install && npm run build`
3. 開啟 Chrome → `chrome://extensions` → 開發者模式
4. 點擊「載入未封裝項目」→ 選擇 `dist/` 資料夾
5. 記下擴充套件 ID（例如 `abcdefghijklmnop...`）

### 2. 安裝 Native Messaging Host

在**櫃檯電腦**和**診間電腦**都要執行：

1. 找到專案目錄中的 `native-host` 資料夾
2. 以系統管理員身份執行 `install.bat`
3. 輸入共享資料夾路徑（兩台電腦必須使用同一個路徑，例如 `\\SERVER\shared\nhitw-data`）
4. 輸入步驟 1 記下的擴充套件 ID
5. 重新啟動 Chrome

### 3. 設定擴充套件

1. 點擊擴充套件圖示 → 設定
2. 滾動到最下方「共享資料夾設定」區塊
3. 啟用共享資料夾功能
4. 選擇角色：
   - 櫃檯電腦 → **櫃檯模式**
   - 診間電腦 → **診間模式**
5. 點擊「檢查連線」確認 Native Host 正常運作

### 4. 使用方式

**櫃檯：**
- 照常使用健保雲端查詢，擴充套件會自動將資料匯出到共享資料夾

**診間：**
- 點擊擴充套件圖示 → 設定 → 「開啟診間閱讀器」
- 或直接前往 `chrome-extension://YOUR_EXTENSION_ID/reader.html`
- 從左側列表選擇病患即可查看完整醫療資料
- 支援依日期瀏覽、搜尋病患 ID 或姓名

## 資料涵蓋範圍

完整 13+ 種資料類型：西藥、中藥、檢驗、影像、過敏、手術、出院摘要、成人健檢、癌症篩檢、B/C肝、餘藥天數、病患摘要。

## 共享資料夾結構

```
\\SERVER\shared\nhitw-data\
  ├── 2026-04-03\           (按日期)
  │   ├── manifest.json     (病患索引)
  │   └── A123456789_xxx.json (病患資料)
  └── 2026-04-02\
      └── ...
```

- 預設保留 7 天，超過自動清理
- 同一病患當天重複查詢會覆寫舊檔

## 解除安裝

執行 `native-host\uninstall.bat` 移除 Native Messaging Host。

## 技術架構

- Chrome Extension (Manifest V3) + React 19 + MUI 6.5
- PowerShell Native Messaging Host（Windows 內建，零依賴）
- 資料透過 Windows 共享資料夾（SMB）同步
