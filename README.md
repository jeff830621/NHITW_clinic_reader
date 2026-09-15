# NHITW 診間報告產生器

**查詢健保雲端的同時，自動幫每位病人產生一頁完整的 HTML 報告，存進診所共享資料夾 —— 診間電腦不用安裝任何東西，點開檔案就能看。**

本專案是 [NHITW Cloud Analyzer（更好的健保雲端 2.0）](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) 的衍生版本，感謝原作者 [leescot](https://github.com/leescot) 及所有貢獻者。

---

## 這個工具解決什麼問題

許多院所的環境是：

- 健保讀卡機和雲端查詢系統在**櫃檯**
- 醫師在**診間**，看不到健保雲端
- 兩邊在同一個區域網路，有共享資料夾

裝好本工具後：櫃檯照常刷卡查雲端 → 報告自動出現在共享資料夾 → 診間雙擊 HTML 就看到病人的診斷、用藥、檢驗（含異常標紅、CKD/氣喘/針灸收案提示）、影像、過敏、四癌篩檢等完整資料。

## 📥 安裝來源

| 元件 | 來源 |
|---|---|
| **擴充套件**（裝在櫃檯的 Edge） | **[Microsoft Edge 附加元件商店](https://microsoftedge.microsoft.com/addons/detail/ffopjenekhkampkfckmbegbglnebhjib)** —— 按「取得」即可，之後自動更新 |
| **共享資料夾主機**（同一台櫃檯電腦） | **[⬇ 主機安裝包 NHITW_clinic_reader_host_latest.zip](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_host_latest.zip)** —— 解壓後雙擊 `install.bat` |

> 診間電腦**什麼都不用下載**。主機安裝包內附 `README.html` 完整圖文教學。

## 🚀 安裝步驟（約 5 分鐘）

**事前準備**：一個櫃檯和診間都開得到的共享資料夾（NAS、伺服器、或任一台電腦分享出來的資料夾都可以），例如 `\\你的伺服器\共享\Chart`。以下都在**櫃檯（讀卡查雲端）的電腦**、用 **Microsoft Edge** 操作。

### 步驟 1：從商店安裝擴充套件

1. 用 Edge 打開 [商店頁面](https://microsoftedge.microsoft.com/addons/detail/ffopjenekhkampkfckmbegbglnebhjib)
2. 按「**取得**」→ 「新增擴充功能」
3. 工具列出現圖示就完成了（找不到的話點工具列的拼圖圖示，把它釘選出來）

### 步驟 2：安裝共享資料夾主機

1. 下載 [主機安裝包](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_host_latest.zip)，解壓縮
2. 雙擊 **`install.bat`**
3. 黑色視窗只問一題：`Enter shared folder path` → **輸入你們院所的共享資料夾路徑**後按 Enter
4. 看到 `Installation complete!` 按任意鍵關閉
5. **完全關閉 Edge 再重新打開**（右上角選單 → 結束，不是只關視窗）

### 步驟 3：開啟自動匯出

1. 點擴充套件圖示 → 設定
2. 找到「**自動匯出 HTML 報告**」→ 打開「**啟用自動匯出**」
3. 點「**檢查連線**」— 顯示正常就大功告成

### 步驟 4：診間怎麼看報告

- 打開共享資料夾 → 進當天日期的資料夾（如 `2026-09-15`）→ `早診`／`午診`／`晚診` → 點病人姓名的 HTML 檔
- 檔名格式：`王小明_20260915_1030.html`
- 建議把共享資料夾捷徑釘在診間電腦桌面

> 報告檔案預設 **40 天後自動清除** —— 天數在擴充套件的設定頁「**資料保留天數**」調整（1–90 天）。

## 🔄 更新版本：不用做任何事

擴充套件由 Edge 商店**自動更新**。只有公告特別提到「主機有更新」時，才需要重新下載主機安裝包、重跑一次 `install.bat`（直接按 Enter，會自動帶入原本的路徑）。

> **原本用「載入未封裝項目」方式安裝的院所**，換到商店版請做一次：商店安裝 → 用最新主機包重跑 `install.bat` → 設定頁重新開啟自動匯出 → 在 `edge://extensions` 移除舊套件（兩個同時開會產出兩份報告）。

<details>
<summary>備用：無法使用 Edge 商店時（例如只能用 Chrome）</summary>

下載 [完整安裝包](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_latest.zip)，解壓後 `chrome://extensions` → 開啟「開發人員模式」→「載入未封裝項目」→ 選裡面的 `dist` 資料夾；主機安裝步驟相同。此方式**不會自動更新**。
</details>

## ❓ 常見問題

| 狀況 | 處理方式 |
|---|---|
| 查了雲端但共享資料夾沒有報告 | 確認步驟 3 的「啟用自動匯出」有打開、「檢查連線」正常；並確認 install.bat 輸入的路徑正確 |
| 擴充套件圖示出現紅色 ⚠ | 上一次匯出失敗：常見原因是共享資料夾斷線、主機未安裝、或報告過大。點開圖示查看，處理後再查一次即可 |
| 有多台讀卡電腦 | 每一台都做步驟 1＋2（步驟 2 輸入同一個共享資料夾路徑） |
| 想移除 | 執行主機資料夾裡的 `uninstall.bat`，並在 `edge://extensions` 移除擴充套件 |

## 技術架構

```
櫃檯 Edge ────► 擴充套件自動產生 HTML ──► Native Host ──► 共享資料夾
                                         (PowerShell)      (SMB)
                                                              │
                                              診間電腦直接開啟 HTML ◄┘
```

- Chrome Extension Manifest V3 + React 19 + MUI 6.5
- PowerShell Native Messaging Host（Windows 內建，零依賴）
- 報告為單一自足 HTML：異常檢驗標紅、參考值、CKD／氣喘／複雜針灸收案提示、可摺疊區塊、可列印、點日期一鍵複製檢驗數據

## 授權

本專案沿用原專案的 [Apache License 2.0](LICENSE) 授權。

## 致謝

- [NHITW Cloud Analyzer React MUI](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI) — 原始專案
- [leescot](https://github.com/leescot) — 原作者
- 所有原始專案的[貢獻者](https://github.com/leescot/NHITW_cloud_analyzer_react_MUI/graphs/contributors)
