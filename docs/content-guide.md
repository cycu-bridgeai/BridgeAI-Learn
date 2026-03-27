# 內容撰寫指南

所有內容存放在 `content/` 目錄下，每篇文章是一個 Markdown 檔案，頂部包含 YAML 格式的 frontmatter。

---

## 部落格文章

**存放位置：** `content/blog/<slug>.md`

### Frontmatter 欄位

```yaml
---
title: 文章標題              # 必填
description: 簡短摘要        # 必填
date: 2026-03-27            # 必填 — YYYY-MM-DD 格式
tags:                       # 選填
  - ai
  - tutorial
thumbnail: /images/thumb.png  # 選填 — 圖片 URL 或路徑
---
```

| 欄位 | 是否必填 | 類型 | 說明 |
|------|----------|------|------|
| `title` | 必填 | string | 文章標題，顯示於卡片與頁面頂部 |
| `description` | 必填 | string | 簡短摘要，顯示於文章卡片 |
| `date` | 必填 | string | 發佈日期，格式為 `YYYY-MM-DD` |
| `tags` | 選填 | string[] | 主題標籤，用於分類與篩選 |
| `thumbnail` | 選填 | string | 封面圖片，以 16:9 比例顯示，建議尺寸 1280×720 或 640×360 |

### 文章內文

在 frontmatter 結束後，以標準 Markdown 撰寫文章內容。

### 範例

```markdown
---
title: AI 入門指南
description: 適合初學者的 AI 概念介紹
date: 2026-03-27
tags:
  - ai
  - 初學者
thumbnail: /images/getting-started.png
---

文章內容從這裡開始...
```

---

## 影片文章

**存放位置：** `content/videos/<slug>.md`

### Frontmatter 欄位

```yaml
---
title: 影片標題              # 必填
description: 簡短摘要        # 必填
date: 2026-03-27            # 必填 — YYYY-MM-DD 格式
youtubeId: aircAruvnKk      # 必填 — YouTube 影片 ID
tags:                       # 選填
  - neural-networks
  - beginners
---
```

| 欄位 | 是否必填 | 類型 | 說明 |
|------|----------|------|------|
| `title` | 必填 | string | 影片標題，顯示於卡片與頁面頂部 |
| `description` | 必填 | string | 簡短摘要，顯示於影片卡片 |
| `date` | 必填 | string | 發佈日期，格式為 `YYYY-MM-DD` |
| `youtubeId` | 必填 | string | YouTube 影片 ID（例如網址 `youtube.com/watch?v=aircAruvnKk` 中的 `aircAruvnKk`）|
| `tags` | 選填 | string[] | 主題標籤，用於分類與篩選 |

> **注意：** 影片縮圖會自動從 YouTube 根據 `youtubeId` 取得，不需要填寫 `thumbnail` 欄位。

### 文章內文

選填。可在 frontmatter 下方補充時間軸、筆記或相關說明。

### 範例

```markdown
---
title: 什麼是神經網路？
description: 3Blue1Brown 的經典視覺化介紹，深度學習最佳入門影片。
date: 2026-03-27
youtubeId: aircAruvnKk
tags:
  - 神經網路
  - 初學者
---

可在此補充影片筆記或相關資源...
```

---

## 快速對照表

| 欄位 | 部落格 | 影片 |
|------|--------|------|
| `title` | 必填 | 必填 |
| `description` | 必填 | 必填 |
| `date` | 必填 | 必填 |
| `youtubeId` | — | 必填 |
| `tags` | 選填 | 選填 |
| `thumbnail` | 選填（建議 16:9，1280×720）| —（自動從 YouTube 取得）|
