---
title: Bridge AI 智慧教學平台與 iLearning2.0 整合操作指南
description: 一步步完成 LTI 申請、系統綁定，讓 AI 教學與自動評測無縫進入你的課程
date: 2026-03-30
youtubeId: I71-u7ZOn-Q
tags:
  - lti
  - ilearning
---

這份指南介紹專為程式課程打造的「Bridge AI 智慧教學平台」，該平台能夠與現有的 iLearning2.0 系統無縫整合，提供自動化的線上評測以及 AI 教學服務。

整個流程分為三個階段，從申請參數、系統綁定到加入課程，跟著步驟走就能完成設定。

---

## <span style="color:#2c3e50;">第一步：申請 LTI 參數</span>

### <span style="color:#2980b9;">1. 註冊與申請</span>

前往 <span style="color:#e67e22; font-weight:bold;">Bridge AI 首頁</span>，點擊右上角的「**申請 LTI**」按鈕，即可開啟申請流程。

### <span style="color:#2980b9;">2. 填寫申請資料</span>

在申請表單中填寫您的 <span style="color:#27ae60; font-weight:bold;">系所名稱</span> 與 <span style="color:#27ae60; font-weight:bold;">教師信箱</span>，送出後等待審核。

### <span style="color:#2980b9;">3. 收取專屬參數</span>

審核通過後，系統會將一組 <span style="color:#8e44ad; font-weight:bold;">專屬 LTI 參數</span> 寄至您的信箱，其中包含：

- **一組網址**
- **兩組密鑰**

> 收到信後請先保留此畫面，下一步會用到。

---

## <span style="color:#2c3e50;">第二步：於 iLearning2.0 進行系統綁定</span>

### <span style="color:#2980b9;">1. 新增外部工具</span>

回到 iLearning2.0 的課程頁面，依序點選 <span style="color:#d35400; font-weight:bold;">「更多」→「LTI External Tools」→「新增工具」</span>。

### <span style="color:#2980b9;">2. 輸入 LTI 參數</span>

輸入工具名稱，並將剛才收到的 <span style="color:#2980b9; font-weight:bold;">網址與兩組密鑰</span> 依序貼入對應的欄位中。

### <span style="color:#2980b9;">3. 設定啟用容器</span>

將「**預設啟用容器**」選項更改為 <span style="color:#e67e22; font-weight:bold;">「新視窗」</span>，確保平台能正確開啟。

### <span style="color:#2980b9;">4. 服務與隱私權設定</span>

這一步很重要，直接影響成績同步是否正常：

- **服務設定**：勾選最下方的選項
- **隱私權設定**：將所有選項都改為 <span style="color:#e74c3c; font-weight:bold;">「永遠」</span>，以確保師生的帳號與成績能夠正確同步

### <span style="color:#2980b9;">5. 完成綁定</span>

設定確認無誤後點選「**儲存**」，即完成系統綁定。

---

## <span style="color:#2c3e50;">第三步：將平台加入課程與後續管理</span>

### <span style="color:#2980b9;">1. 在課程中新增活動</span>

在課程區塊點選 <kbd>+</kbd>，選擇「**新增活動或資源**」，找到 <span style="color:#8e44ad; font-weight:bold;">Bridge AI</span> 並輸入名稱後儲存，即可將其作為工具加入課程。

### <span style="color:#2980b9;">2. 自動登入與名單同步</span>

往後只需點擊該課程連結，系統便會 <span style="color:#16a085; font-weight:bold;">自動帶您登入平台並同步課程名單</span>，無需額外操作。

### <span style="color:#2980b9;">3. 課程管理</span>

登入後，教師便可以在 Bridge AI 平台上完成相關的課程設定、作業管理等所有工作。

---

## <span style="color:#2c3e50;">完成了！</span>

整個 LTI 整合流程到這裡就完成了。從申請到上線，通常只需要等待審核通過就能開始使用。

如果在設定過程中遇到問題，最常見的狀況是「隱私權設定」沒有全部設為「永遠」，導致成績無法同步——記得回去檢查一下那個步驟。
