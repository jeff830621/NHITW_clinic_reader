# NHITW 診間閱讀器

本專案是 [NHITW Cloud Analyzer (更好的健保雲端 2.0)](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) 的衍生版本，新增**共享資料夾橋接功能**，讓診間醫師能查看櫃檯擷取的健保雲端病患資料。

感謝原作者 [leescot](https://github.com/leescot) 及所有貢獻者開發了這個優秀的工具。

## 為什麼需要這個 Fork

在許多診所環境中：
- 健保讀卡機和雲端查詢系統在**櫃檯**
- 醫師在**診間**無法直接存取健保雲端
- 但兩端在同一區域網路，有 Windows 共享資料夾

本專案讓擴充套件多了兩種運作模式，透過共享資料夾自動同步資料，醫師不必離開診間就能查看完整的病患醫療紀錄。

## 新增功能

- **櫃檯擷取模式**：原始擴充套件功能 + 自動將病患資料匯出到共享資料夾
- **診間閱讀模式**：從共享資料夾載入病患資料，用同一套 UI 完整顯示
- **病患列表**：依日期瀏覽今日已查詢的病患，支援搜尋
- **PowerShell Native Messaging Host**：橋接 Chrome 與本地檔案系統，Windows 內建零依賴
- **一鍵安裝腳本**：`install.bat` 自動完成所有設定

所有原始功能（西藥、中藥、檢驗、影像、過敏、手術、出院摘要等 13+ 種資料類型）完整保留。

## 安裝步驟

### 1. 建置擴充套件

```bash
git clone https://github.com/jeff830621/NHITW_clinic_reader.git
cd NHITW_clinic_reader
git checkout feat/clinic-reader
npm install
npm run build
```

### 2. 載入擴充套件

1. 開啟 Chrome → `chrome://extensions` → 開發者模式
2. 點擊「載入未封裝項目」→ 選擇 `dist/` 資料夾
3. 記下擴充套件 ID

### 3. 安裝 Native Messaging Host

在**櫃檯**和**診間**電腦都要執行：

1. 找到 `native-host` 資料夾
2. 執行 `install.bat`
3. 輸入共享資料夾路徑（兩台電腦必須一致，例如 `\\SERVER\shared\nhitw-data`）
4. 輸入擴充套件 ID
5. 重新啟動 Chrome

### 4. 設定角色

1. 點擊擴充套件圖示 → 設定 → 滾動到「共享資料夾設定」
2. 啟用功能並選擇角色：
   - 櫃檯電腦 → **櫃檯模式**
   - 診間電腦 → **診間模式**

### 5. 開始使用

- **櫃檯**：照常查詢健保雲端，資料自動匯出
- **診間**：點擊設定中的「開啟診間閱讀器」，從列表選擇病患

## 技術架構

```
櫃檯 Chrome ──► Native Host ──► 共享資料夾 ◄── Native Host ◄── 診間 Chrome
  (擷取模式)    (PowerShell)      (SMB)       (PowerShell)     (閱讀模式)
```

- Chrome Extension Manifest V3 + React 19 + MUI 6.5
- PowerShell Native Messaging Host（Windows 內建）
- Windows SMB 共享資料夾同步

## 解除安裝

執行 `native-host\uninstall.bat` 移除 Native Messaging Host。

## 授權

本專案沿用原專案的 [Apache License 2.0](LICENSE) 授權。

## 致謝

- [NHITW Cloud Analyzer React MUI](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) — 原始專案
- [leescot](https://github.com/leescot) — 原作者
- 所有原始專案的[貢獻者](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI/graphs/contributors)
