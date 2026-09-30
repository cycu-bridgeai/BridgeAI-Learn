# BridgeAI-Learn 專案規範

## Blog 文章 Tag 規範

每篇新的 blog 文章合併前，需確認 frontmatter 中的 `tags` 已包含身份標籤：

- 學生視角文章 → 必須加 `students`
- 老師視角文章 → 必須加 `teachers`
- 同時涵蓋兩者 → `students` 和 `teachers` 都加

**範例：**
```yaml
tags:
  - guide
  - students   # 學生視角文章必須有
```

缺少身份標籤會導致 blog index 的 filter chip 無法正確篩選。

## BridgeAI 平台功能查證

撰寫或修改平台功能說明時，先查同一工作區的 `BridgeAI-main` 專案源碼；以目前的頁面、元件與 API 實作確認入口、啟用條件、觸發條件及介面用語。部落格舊文、截圖與公開網站可作補充，不能取代源碼查證。若源碼與實際部署畫面不一致，明確標示尚未驗證的部分。
