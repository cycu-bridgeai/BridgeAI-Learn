# 優秀作品專區 (Works) 維護指南

本專案已建置「全自動預抓取機制」（Build-time Pre-fetch）。
管理員僅需手動建立「純設定 YAML」的作品 Markdown，系統在本地啟動 (`pnpm run dev`) 或打包部署 (`pnpm run build`) 前就會自動到 GitHub 爬取最新 README 並填入。

---

## 1. 快速新增一個作品

請在 [content/works/](content/works/) 目錄下手動新增一個以 `.md` 結尾的檔案（例如 `my-project.md`），填入以下欄位，且**內文保持完全空白**：

```yaml
---
title: "作品名稱"
description: "作品的一句話簡短特色介紹"
date: "2026-06-02"
author: "學生名字或組別"
githubUrl: "https://github.com/學生組織/儲存庫名稱"
tags:
  - web
  - students
---
```

儲存檔案後，您不需要手動下載 README，直接執行：
```bash
pnpm run dev
```
這樣系統便會一秒抓完並寫回該 `.md` 檔案，本地即可預覽完美內容！

---

## 2. 自動化運作與排程架構

*   **自動預抓化核心**：[scripts/pre-fetch-all.js](scripts/pre-fetch-all.js)
    *   負責在編譯前自動解析 `content/works/` 內的所有檔案。
    *   一旦辨識到含有 `githubUrl` 但**內文為空**的檔案（或使用 `--update` 參數強制更新時，內容有變更的檔案），就會自動透過 API 將其對應之 README.md 內容拉回並蓋寫存入。
*   **本機指令集成**：[package.json](package.json)
    已經將 `predev` 與 `prebuild` 掛載至這套爬蟲工具中，本機編譯時會自動處理。
*   **雲端定時同步 (免本機操作)**：[.github/workflows/sync-readme.yml](.github/workflows/sync-readme.yml)
    *   每天**台灣時間凌晨 03:00** 自動在雲端執行腳本。
    *   管理員只需在本地建立只含 `frontmatter` 的空白作品 md 檔案並 `push`，時間到雲端會自動抓取、`commit` 並推回 `main` 分支觸發部署。
    *   也可以在 GitHub Actions 頁面手動點擊 **Run workflow** 立即同步。

---

## 3. 全站 Tag 整合

作品中使用的 `tags` 會經由 [app/composables/useTags.ts](app/composables/useTags.ts) 自動搜集。當讀者點擊 [app/pages/tags/[tag].vue](app/pages/tags/[tag].vue) 彙整頁時，系統會自動在「學生優秀作品」列表與影片、文章等模組同步展現过滤。
