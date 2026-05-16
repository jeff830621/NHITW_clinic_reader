# NHITW 診間報告產生器

本專案是 [NHITW Cloud Analyzer (更好的健保雲端 2.0)](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) 的衍生版本，新增**自動匯出 HTML 報告**功能。

感謝原作者 [leescot](https://github.com/leescot) 及所有貢獻者開發了這個優秀的工具。

## 為什麼需要這個 Fork

在許多診所環境中：
- 健保讀卡機和雲端查詢系統在**櫃檯**
- 醫師在**診間**無法直接存取健保雲端
- 但兩端在同一區域網路，有 Windows 共享資料夾

本專案讓擴充套件在查詢健保雲端時，自動產生一份完整的 HTML 病患報告，存到共享資料夾。醫師在診間**雙擊 HTML 檔就能看到所有資料**，不需要安裝任何軟體。

## 功能

- **自動匯出**：查詢健保雲端後自動產生 HTML 報告到共享資料夾
- **完整資料**：涵蓋全部 13+ 種資料類型（西藥、中藥、檢驗、影像、過敏、手術、出院摘要等）
- **檢驗異常標紅**：超出參考值的檢驗數據自動標紅
- **可摺疊區塊**：每個資料類型可展開/收合
- **可列印**：列印時自動展開所有區塊
- **零安裝診間端**：診間電腦不需要安裝任何東西，直接開 HTML 檔

## 安裝步驟（僅櫃檯電腦）

### 1. 載入擴充套件

**下載已 build 好的擴充套件 ZIP：**

- [最新版（直接下載）](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_latest.zip)
- [v25.1201.3 (2026-05-16)](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_cloud_analyzer_v25.1201.3-20260516.zip)

下載後步驟：

1. 解壓縮 ZIP（會得到一個資料夾，裡面包含 `manifest.json` 等檔案）
2. 開啟 Chrome → `chrome://extensions` → 開發者模式
3. 點擊「載入未封裝項目」→ **選擇解壓後的資料夾（不是裡面的 dist 子資料夾）**
4. 記下擴充套件 ID

### 2. 安裝 Native Messaging Host

#### 多台電腦快速部署（建議）

如果要裝多台同設定的電腦：

1. 解壓 ZIP 後，先用記事本打開 `native-host\install.bat`
2. 找到 `DEPLOY CONFIG` 區塊，這一行：
   ```
   set "DEFAULT_SHARED_FOLDER=\\kt-server\kthis\Chart"
   ```
   如果你的共享資料夾路徑不同，改成你的路徑（否則不用動）
3. 存檔。整個 `native-host` 資料夾就成了你的部署包
4. 在每台電腦上：把整個資料夾複製過去 → 雙擊 `install.bat` → 一路按 Enter → 完成

每台電腦只要重啟 Chrome / Edge 即可生效。擴充套件 ID 已透過 manifest key 鎖定，不會隨重裝改變，所以不需要每台都重新填 ID。

#### 單台手動安裝

1. 雙擊 `native-host\install.bat`
2. 輸入共享資料夾路徑（或按 Enter 用預設）
3. 確認後自動完成註冊

### 3. 啟用功能

1. 點擊擴充套件圖示 → 設定
2. 滾動到「自動匯出 HTML 報告」
3. 開啟「啟用自動匯出」
4. 點擊「檢查連線」確認 Native Host 正常

### 4. 使用方式

- **櫃檯**：照常查詢健保雲端，HTML 報告自動產生
- **診間**：從共享資料夾打開病患的 HTML 檔案即可

報告檔名格式：`王小明_20260404_1030.html`

## 技術架構

```
櫃檯 Chrome ──► 擴充套件自動產生 HTML ──► Native Host ──► 共享資料夾
                                         (PowerShell)      (SMB)
                                                              │
                                              診間電腦直接開啟 HTML ◄┘
```

- Chrome Extension Manifest V3 + React 19 + MUI 6.5
- PowerShell Native Messaging Host（Windows 內建，零依賴）

## 解除安裝

執行 `native-host\uninstall.bat` 移除 Native Messaging Host。

## 授權

本專案沿用原專案的 [Apache License 2.0](LICENSE) 授權。

## 致謝

- [NHITW Cloud Analyzer React MUI](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) — 原始專案
- [leescot](https://github.com/leescot) — 原作者
- 所有原始專案的[貢獻者](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI/graphs/contributors)
