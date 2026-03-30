# 🚀 BridgeAI Learn

一個現代化的 AI 學習平台，提供精選的部落格文章和 YouTube 教學影片，幫助開發者系統性地學習 AI 和機器學習概念。

## 🌐 線上訪問

- **主站**：[BridgeAI Learn](https://cycu-bridgeai.github.io/BridgeAI-Learn/)
- **開發環境**：`http://localhost:3011/BridgeAI-Learn/`
- **自動部署**：GitHub Actions (推送到 main 時自動部署)

---

## 📋 功能特性

### ✨ 核心功能
- 📝 **部落格系統**：AI 學習教程和深度解析
- 🎬 **影片集合**：精選 YouTube 教學影片
- 🌓 **暗黑模式**：全站支持亮色/暗黑切換 (系統偏好 + 手動切換)
- 📱 **響應式設計**：完美適配手機、平板、桌面
- ⚡ **快速性能**：Nuxt 4 + Vite + Tailwind CSS

### 🎨 UI/UX 特色
- 動態卡片設計（部落格藍色系、影片紅色系）
- 彩色漸變背景（無縮圖卡片自動生成）
- 流暢的頁面動畫和過渡效果
- 優化的排版和易讀的字體設定

---

## 📁 項目結構

```
BridgeAI-Learn/
├── app/
│   ├── components/              # 可重用組件
│   │   ├── PostCard.vue         # 部落格卡片
│   │   ├── VideoCard.vue        # 影片卡片
│   │   └── content/
│   │       └── YoutubeEmbed.vue  # YouTube 嵌入播放器
│   ├── layouts/
│   │   └── default.vue          # 全域佈局（導航 + 頁腳）
│   └── pages/
│       ├── index.vue            # 首頁
│       ├── blog/
│       │   ├── index.vue        # 部落格列表
│       │   └── [...slug].vue    # 部落格詳細頁
│       └── videos/
│           ├── index.vue        # 影片列表
│           └── [...slug].vue    # 影片詳細頁
├── content/
│   ├── blog/                    # 部落格 Markdown 檔案
│   │   └── pseudo-code.md
│   └── videos/                  # 影片 Markdown 檔案
│       └── intro-neural-networks.md
├── public/                      # 靜態資源
├── tailwind.config.ts           # Tailwind 配置
├── nuxt.config.ts              # Nuxt 配置
├── tsconfig.json               # TypeScript 配置
└── package.json                # 依賴管理
```

---

## 🛣️ 路由結構

| 頁面 | 路由 | 檔案 |
|------|------|------|
| **首頁** | `/` | `app/pages/index.vue` |
| **部落格列表** | `/blog` | `app/pages/blog/index.vue` |
| **部落格詳細** | `/blog/[文章]` | `app/pages/blog/[...slug].vue` |
| **影片列表** | `/videos` | `app/pages/videos/index.vue` |
| **影片詳細** | `/videos/[影片]` | `app/pages/videos/[...slug].vue` |

---

## 🚀 快速開始

### 環境要求
- **Node.js**：≥ 18.0
- **pnpm**：≥ 8.0（推薦）或 npm/yarn

### 安裝依賴
```bash
pnpm install
```

### 啟動開發伺服器
```bash
pnpm dev
```
訪問 `http://localhost:3011/BridgeAI-Learn/`

### 構建生產版本
```bash
pnpm build
```

### 預覽生產版本
```bash
pnpm preview
```

---

## 📝 新增內容指南

### 新增部落格文章

1. **建立檔案**
   ```bash
   content/blog/[你的檔案名].md
   ```

2. **填寫內容** (使用此模板)
   ```markdown
   ---
   title: 文章標題
   description: 一句話簡介（顯示在卡片上）
   date: 2026-03-30
   tags:
     - tag1
     - tag2
   thumbnail: https://example.com/image.jpg  # 可選
   ---

   # 你的文章內容

   Markdown 格式的完整文章...
   ```

3. **自動更新**
   - 儲存檔案後，開發伺服器會自動偵測
   - 自動出現在 `/blog` 列表頁
   - 自動建立 `/blog/[你的檔案名]` 詳細頁

### 新增影片

1. **建立檔案**
   ```bash
   content/videos/[你的檔案名].md
   ```

2. **填寫內容** (使用此模板)
   ```markdown
   ---
   title: 影片標題
   description: 影片簡介
   date: 2026-03-30
   youtubeId: [YouTube 影片 ID]
   tags:
     - tag1
     - tag2
   ---

   ## 關於此影片

   影片說明和重點...

   ## 你將學到什麼

   - 重點 1
   - 重點 2
   ```

3. **取得 YouTube ID**
   - 影片 URL：`https://www.youtube.com/watch?v=aircAruvnKk`
   - YouTube ID：`aircAruvnKk` (watch?v= 後面)

### Front Matter 欄位說明

#### 共通欄位
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `title` | String | ✅ | 顯示在卡片和詳細頁 |
| `description` | String | ✅ | 顯示在卡片下方 |
| `date` | Date | ✅ | 排序和日期顯示 (YYYY-MM-DD) |
| `tags` | Array | ✅ | 內容分類 |

#### 部落格特有
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `thumbnail` | String | ❌ | 卡片封面圖片 URL |

#### 影片特有
| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `youtubeId` | String | ✅ | YouTube 影片 ID |

---

## 🎨 暗黑模式

### 功能
- ✅ 全站支持亮色/暗黑切換
- ✅ 按鈕位置：導航欄右上角（太陽/月亮圖標）
- ✅ 自動檢測系統偏好設定
- ✅ 選擇儲存到 localStorage

### 技術棧
- **Tailwind CSS**: `darkMode: 'class'`
- **控制中心**: `app/layouts/default.vue`
- **所有頁面和組件**都有 `dark:` 類別支持

---

## 🛠️ 技術棧

- **框架**: Nuxt 4.4.2 + Vue 3.5.31
- **CSS**: Tailwind CSS 3
- **內容管理**: Nuxt Content (Markdown)
- **開發工具**: Vite, TypeScript
- **套件管理**: pnpm

---

## 📦 主要依賴

```json
{
  "dependencies": {
    "nuxt": "^4.4.2",
    "vue": "^3.5.31",
    "@nuxt/content": "^2.13.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.4.3",
    "typescript": "^5"
  }
}
```

---

## 📚 部落格內容建議

推薦涵蓋的主題：
- AI/ML 基礎概念
- 深度學習算法詳解
- 實戰項目教程
- 工具和框架使用指南
- 最佳實踐和技巧

---

## 🎓 學習資源

- [Nuxt Documentation](https://nuxt.com)
- [Vue 3 Guide](https://vuejs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Nuxt Content](https://content.nuxt.com)

---

##  聯繫方式

有問題或建議？歡迎提交 Issue 或 Pull Request！