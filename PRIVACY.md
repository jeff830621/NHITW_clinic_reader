# NHITW 診間報告產生器 — 隱私權政策

最後更新:2026-08-31

## 一句話總結

本擴充套件**不會將任何資料上傳到任何伺服器**。所有資料只在使用者的電腦上處理,並存放到使用者自己指定的位置。

## 處理哪些資料

本擴充套件在醫事人員於「健保醫療資訊雲端查詢系統」(medcloud2.nhi.gov.tw)查詢病患資料時,讀取該次查詢回傳的內容(就醫診斷、用藥、檢驗、影像報告等),整理成一份 HTML 報告檔案。

這些資料屬於病患的健康資料,僅供醫事機構內部醫療業務使用。

## 資料流向

- 報告檔案寫入**使用者自行指定**的本機或區域網路共享資料夾(經 Native Messaging 本機主機程式),或存入瀏覽器的下載資料夾 —— 由使用者在設定中選擇。
- 除上述使用者指定位置外,**資料不會傳送到任何遠端伺服器**;開發者無法存取任何病患資料。
- 擴充套件設定(如自動匯出開關、保留天數)儲存於瀏覽器的同步儲存空間,其中不含病患資料。
- 報告檔案預設保留 40 天後由本機主機程式自動刪除(天數可由使用者調整,1–90 天)。

## 不做的事

- 不上傳、不回傳、不分析、不追蹤任何資料
- 不含任何廣告或第三方分析工具
- 不讀取 medcloud2.nhi.gov.tw 與 drugtw.com(藥品圖片查詢,選用功能)以外的任何網站

## 法規

病患健康資料之蒐集、處理與利用,由使用本工具之醫事機構依《醫療法》《個人資料保護法》等相關法規負保管之責。本工具僅為機構內部之資料呈現輔助工具。

## 開放原始碼

完整原始碼公開於 https://github.com/jeff830621/NHITW_clinic_reader ,歡迎檢視。

## 聯絡

問題回報:https://github.com/jeff830621/NHITW_clinic_reader/issues

---

# Privacy Policy (English summary)

This extension processes data entirely on the user's machine. When a healthcare
professional queries the Taiwan NHI MediCloud system (medcloud2.nhi.gov.tw), the
extension renders the returned data into an HTML report and writes it to a
folder the user designates (via a local Native Messaging host) or to the
browser's download folder. **No data is ever transmitted to any remote
server.** The developer has no access to any patient data. No ads, no
analytics, no tracking. Source code: https://github.com/jeff830621/NHITW_clinic_reader
