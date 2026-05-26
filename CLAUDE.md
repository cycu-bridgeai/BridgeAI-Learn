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
