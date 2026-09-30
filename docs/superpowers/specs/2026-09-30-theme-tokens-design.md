# 全站樣式統一管理（theme tokens）— 設計規格

- 日期：2026-09-30
- 狀態：待使用者審閱
- 分支：`worktree-cs-zone`（接在計概專區之後）
- 前置：計概專區 spec `2026-09-30-cs-zone-autopost-design.md`

## 1. 目標

使用者只改**一個 CSS 檔**（`app/assets/css/theme.css`），全站的顏色、字型、圓角、光暈、文章排版與示意圖配色就跟著變，淺色／深色模式各一組值。

### 範圍（使用者勾選）

1. 各區主色＋文字／背景色
2. 字型
3. 卡片／按鈕樣式
4. 文章排版與示意圖配色

### 外觀原則

「順便修不一致」：整體外觀維持現狀，但把不一致的地方統一：

| 項目 | 現況 | 統一為 |
|---|---|---|
| 圓角 | `rounded`、`-lg`、`-xl`、`-2xl`、`sm:rounded-2xl` 混用 | 三級：`rounded-chip`（tag）、`rounded-card`（按鈕、卡片）、`rounded-panel`（縮圖、大區塊） |
| hover 光暈 | 15px 與 20px 兩種 | 一律 `--glow`（15px，透明度 0.4） |
| 淺色底 | `bg-blue-50`／`dark:bg-blue-900/30` 等各自寫 | 主色 10% 透明度（`bg-section/10`），淺深色共用 |
| 按鈕 | 同一樣式在 12 處各抄一份 | `SectionButton` 元件 |

基準：遷移前全站約 496 處寫死顏色（Tailwind 色名＋色碼），分布在 16 個 `.vue`、`main.css`、`tailwind.config.ts`。

### 非目標

- 不改版面結構、不重新設計視覺風格。
- 不動 `content/` 內容與 `works` 從 GitHub 同步來的 README 內文。
- 不做調色 UI。

## 2. `theme.css`

位置：`app/assets/css/theme.css`，在 `nuxt.config.ts` 的 `css` 中排在 `main.css` 之前。每個變數附中文註解。色值用 `R G B` 三個數字（空白分隔），讓 Tailwind 能加透明度。

### 2.1 變數清單（初始值＝現況）

| 變數 | 用途 | 淺色 | 深色 |
|---|---|---|---|
| `--color-page` | 頁面背景 | 255 255 255 | 17 24 39 |
| `--color-surface` | 卡片背景 | 255 255 255 | 3 7 18 |
| `--color-surface-muted` | 次要背景：表格斑馬紋、引用、程式碼底 | 248 250 252 | 31 41 55 |
| `--color-header` | 導覽列、頁尾背景 | 255 255 255 | 31 41 55 |
| `--color-ink` | 主要文字 | 17 24 39 | 255 255 255 |
| `--color-ink-muted` | 次要文字（說明、日期） | 107 114 128 | 156 163 175 |
| `--color-line` | 邊線 | 229 231 235 | 55 65 81 |
| `--color-blog` | Blog 主色 | 37 99 235 | 96 165 250 |
| `--color-cs` | 計概主色 | 5 150 105 | 52 211 153 |
| `--color-videos` | Videos 主色 | 220 38 38 | 248 113 113 |
| `--color-works` | Works 主色 | 147 51 234 | 192 132 252 |
| `--color-neutral` | 中性按鈕（Back to Home） | 107 114 128 | 156 163 175 |
| `--color-success` | 示意圖、提示：成功 | 5 150 105 | 52 211 153 |
| `--color-error` | 示意圖、提示：錯誤 | 220 38 38 | 248 113 113 |
| `--color-prose-h2` | 文章 h2 | 30 41 59 | 241 245 249 |
| `--color-prose-h3` | 文章 h3 | 37 99 235 | 96 165 250 |
| `--color-prose-strong` | 文章粗體 | 5 150 105 | 16 185 129 |
| `--color-prose-img-border` | 文章圖片外框 | 17 17 17 | 85 85 85 |
| `--color-overlay` | 圖片放大遮罩 | 0 0 0 | 0 0 0 |
| `--font-sans` | 內文字型 | `Inter, ui-sans-serif, system-ui, sans-serif` | 同 |
| `--font-mono` | 程式碼字型 | `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace` | 同 |
| `--radius-chip` | tag | 9999px | 同 |
| `--radius-card` | 按鈕、卡片 | 0.5rem | 同 |
| `--radius-panel` | 縮圖、大區塊 | 1rem | 同 |
| `--glow` | hover 光暈大小 | `0 0 15px` | 同 |

深色值放在 `.dark { … }`（沿用現有 `darkMode: 'class'`）。

### 2.2 區塊主色切換

```css
:root           { --color-section: var(--color-blog); }  /* 沒掛 section-* 時的預設 */
.section-blog   { --color-section: var(--color-blog); }
.section-cs     { --color-section: var(--color-cs); }
.section-videos { --color-section: var(--color-videos); }
.section-works  { --color-section: var(--color-works); }
.section-neutral{ --color-section: var(--color-neutral); }
```

元件掛上 `section-*` class，內部用 `text-section`、`bg-section/10`、`border-section`、`shadow-glow` 即吃到該區主色。

## 3. Tailwind 對應（`tailwind.config.ts`）

- `theme.extend.colors`：`page`、`surface`、`surface-muted`、`header`、`ink`、`ink-muted`、`line`、`section`、`success`、`error`、`overlay`，值為 `rgb(var(--color-xxx) / <alpha-value>)`。
- `fontFamily.sans`／`mono` → `var(--font-sans)`／`var(--font-mono)`。
- `borderRadius`：新增 `chip`／`card`／`panel` → 對應變數（不覆寫 Tailwind 預設級距）。
- `boxShadow.glow` → `var(--glow) rgb(var(--color-section) / 0.4)`。
- `typography` 設定的色碼全部改用變數；`invert` 區塊因深色值已由變數切換，只保留非顏色設定或刪除。

## 4. 元件

| 元件 | 動作 | 介面 |
|---|---|---|
| `SectionButton.vue` | 新增 | props：`to: string`、`section?: 'blog' \| 'cs' \| 'videos' \| 'works' \| 'neutral'`（預設 `neutral`）、`size?: 'sm' \| 'md'`；預設 slot 為按鈕文字 |
| `TagChip.vue` | 新增 | props：`tag: string`、`section?: …`（預設 `blog`）；連到 `/tags/<tag>` |
| `PostCard.vue` | 修改 | 新增 prop `section?: 'blog' \| 'cs'`（預設 `blog`）；`/cs`、首頁計概最新、tag 頁的 cs 項目傳 `cs` |
| `VideoCard.vue`、`WorkCard.vue` | 修改 | 顏色改語意 class；保留各自特有內容 |
| `ArticleView.vue`、`Sidebar.vue`、`layouts/default.vue`、各 `pages/**` | 修改 | 顏色改語意 class，按鈕改 `SectionButton`，tag 改 `TagChip` |
| `ProseImg.vue` | 修改 | 遮罩色改 `--color-overlay` |

納入主目錄 `Nick_dev` 未提交的兩個改動：

1. 三張卡片底部：拿掉 tag 外層 `div`，日期與 tag 同一層 `flex flex-wrap items-center gap-2`，日期 `mr-1`。
2. `layouts/default.vue` header：`z-10` → `z-40`。

完成後主目錄這 4 檔的未提交改動即可捨棄（捨棄前再問使用者）。

## 5. 文章排版與示意圖

- `main.css` 的表格、引用、圖片外框色碼改用變數。
- `/cs-blog` 技能 §4.2：示意圖（僅限不含程式碼的概念圖）配色從 `theme.css` 取**淺色值**換算 hex；技能中註明「改了 theme.css 主色後，舊示意圖需重畫」。
- 縮圖 prompt 的主色也從 `theme.css` 的 `--color-cs` 取。

## 6. 分工

| 工作 | 負責 |
|---|---|
| `theme.css`、Tailwind 對應、`SectionButton`／`TagChip`、檢查測試、`main.css`、typography | Claude |
| 16 個 `.vue` 的 class 替換（依本 spec 的對照表） | AGY（`worker-frontend`），Claude 驗收 |
| 淺色／深色畫面確認 | 使用者 |

## 7. 驗證

1. **無寫死顏色測試**（TDD，先紅後綠）：`tests/theme/no-raw-colors.test.ts` 掃 `app/**/*.vue`、`app/assets/css/main.css`、`tailwind.config.ts`：
   - 不得出現 Tailwind 色名（`(slate|gray|…|rose)-(50|100…950)`）。
   - 不得出現 `#hex`、`rgb(`／`rgba(` 字面色碼；例外只有 `rgb(var(--…) / …)` 形式。
   - `theme.css` 不在掃描範圍。`white`、`black`、`transparent`、`current` 關鍵字允許。
2. `pnpm run generate`、`verify-api`、`verify-cs`、`pnpm test` 全過。
3. 反向驗證：在任一 `.vue` 暫時加 `text-blue-600`，測試必須紅。
4. 改一個變數（例如 `--color-cs`）後 generate，產出 CSS 中對應色值改變（抽查一處）。
5. 使用者在預覽站確認淺色、深色各頁。
6. CI：`deploy-main.yml` 在 generate 前加 `pnpm test`。

## 8. 約束

- 不 push、不 merge。
- `.vue` 既有縮排（2 空白）維持；新檔 `.ts`／`.css` 用 Tab；註解中文。
