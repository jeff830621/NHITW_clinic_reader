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

## 📥 下載（一個檔案搞定）

**[⬇ 下載完整安裝包 NHITW_clinic_reader_latest.zip](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_latest.zip)**

一個 zip 內含擴充套件（解壓後的資料夾本身）與共享資料夾主機（`native-host` 子資料夾），裝在櫃檯（讀卡查雲端）的電腦。

> 診間電腦**什麼都不用下載**。（僅需更新主機時可單獨下載 [host 安裝包](https://github.com/jeff830621/NHITW_clinic_reader/raw/release/releases/NHITW_clinic_reader_host_latest.zip)）

## 🚀 安裝步驟（約 10 分鐘）

**事前準備**：一個櫃檯和診間都開得到的共享資料夾（NAS、伺服器、或任一台電腦分享出來的資料夾都可以），例如 `\\你的伺服器\共享\Chart`。

### 步驟 1：安裝擴充套件（櫃檯電腦）

1. 下載上面的完整安裝包，解壓縮到一個**固定位置**（例如 `C:\nhitw-extension`）— 之後這個資料夾不能刪
2. 打開 Chrome，網址列輸入 `chrome://extensions`（Edge 輸入 `edge://extensions`）
3. 打開右上角的「**開發人員模式**」
4. 點「**載入未封裝項目**」→ 選剛剛解壓縮的資料夾（`manifest.json` 所在的那層）
5. 清單出現「NHITW 診間報告產生器」就完成了

> 不用抄擴充套件 ID —— 所有院所載入後的 ID 都相同，下一步的安裝程式已內建。

### 步驟 2：安裝共享資料夾主機（同一台櫃檯電腦）

1. 進入剛剛解壓的資料夾裡的 **`native-host`** 子資料夾
2. 雙擊 **`install.bat`**
3. 黑色視窗會問兩個問題：
   - `Enter shared folder path`：**輸入你們院所的共享資料夾路徑**（例如 `\\你的伺服器\共享\Chart`）後按 Enter
   - `Enter Chrome extension ID`：**直接按 Enter**（預設值就是正確的）
4. 看到 `Installation complete!` 按任意鍵關閉
5. **完全關閉 Chrome 再重新打開**（右上角選單 → 結束，不是只關視窗）

### 步驟 3：開啟自動匯出

1. 點擴充套件圖示 → 設定
2. 找到「**自動匯出 HTML 報告**」→ 打開「**啟用自動匯出**」
3. 點「**檢查連線**」— 顯示正常就大功告成

### 步驟 4：診間怎麼看報告

- 打開共享資料夾 → 進當天日期的資料夾（如 `2026-07-08`）→ `早診`／`午診`／`晚診` → 點病人姓名的 HTML 檔
- 檔名格式：`王小明_20260708_1030.html`
- 建議把共享資料夾捷徑釘在診間電腦桌面

> 報告檔案預設 **40 天後自動清除** —— 天數在擴充套件的設定頁「**資料保留天數**」調整（1–90 天）。

## 🔄 更新版本

1. 下載新的完整安裝包，解壓縮**覆蓋原本的資料夾**
2. 回到 `chrome://extensions` 按該套件的「重新整理 ↻」圖示
3. 若通知有提到「主機更新」，再進 `native-host` 重跑一次 `install.bat`（很少發生）

## ❓ 常見問題

| 狀況 | 處理方式 |
|---|---|
| 查了雲端但共享資料夾沒有報告 | 確認步驟 3 的「啟用自動匯出」有打開、「檢查連線」正常；並確認 install.bat 輸入的路徑正確 |
| 擴充套件圖示出現紅色 ⚠ | 上一次匯出失敗：常見原因是共享資料夾斷線、主機未安裝、或報告過大。點開圖示查看，處理後再查一次即可 |
| 有多台讀卡電腦 | 每一台都做步驟 1＋2（步驟 2 輸入同一個共享資料夾路徑） |
| 想移除 | 執行主機資料夾裡的 `uninstall.bat`，並在 `chrome://extensions` 移除擴充套件 |

## 技術架構

```
櫃檯 Chrome ──► 擴充套件自動產生 HTML ──► Native Host ──► 共享資料夾
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
