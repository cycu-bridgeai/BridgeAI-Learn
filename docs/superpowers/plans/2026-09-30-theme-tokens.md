# 全站樣式統一管理（theme tokens）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全站顏色、字型、圓角、光暈、文章排版集中到 `app/assets/css/theme.css`，淺深色各一組，`.vue` 內不再寫死顏色。

**Architecture:** `theme.css` 定義 `R G B` 格式的 CSS 變數與 `.section-*` 主色切換；`tailwind.config.ts` 把變數對應成語意 class；共用元件 `SectionButton`、`TagChip`；`.vue` 的 class 依對照表機械替換（AGY）；測試擋寫死顏色。

**Tech Stack:** Nuxt 4、Tailwind 3（`darkMode: 'class'`）、@tailwindcss/typography、node:test。

Spec：`docs/superpowers/specs/2026-09-30-theme-tokens-design.md`

## Global Constraints

- 不 push、不 merge。
- `.vue`、`content.config.ts`、`tailwind.config.ts` 維持既有 2 空白縮排；新 `.css`／`.ts` 測試檔用 Tab；註解中文。
- 除 `app/assets/css/theme.css` 外，`app/**/*.vue`、`app/assets/css/main.css`、`tailwind.config.ts` 不得有 Tailwind 色名或字面色碼（`rgb(var(--…) / …)` 例外；`white`／`black`／`transparent`／`current` 關鍵字允許）。
- 視覺驗收時交付「視覺確認清單」（頁面網址＋元素＋改前→改後，淺深色分開）。
- 驗證：`pnpm test`、`pnpm run generate`、`node scripts/verify-api.mjs`、`node scripts/verify-cs.mjs`。

## File Structure

| 檔案 | 動作 | 職責 |
|---|---|---|
| `app/assets/css/theme.css` | 新增 | 所有 token 與 `.section-*` |
| `nuxt.config.ts` | 修改 | `css` 先載 theme.css |
| `tailwind.config.ts` | 修改 | 語意色、字型、圓角、光暈、typography 改用變數 |
| `app/assets/css/main.css` | 修改 | 色碼改變數 |
| `tests/theme/no-raw-colors.test.ts` | 新增 | 擋寫死顏色 |
| `app/components/SectionButton.vue`、`TagChip.vue` | 新增 | 共用按鈕、tag |
| `app/components/content/ProseImg.vue` | 修改 | 遮罩色改變數 |
| 其餘 15 個 `.vue` | 修改（AGY） | 依對照表替換 |
| `.claude/skills/cs-blog/SKILL.md` | 修改 | 示意圖／縮圖取色改讀 theme.css |
| `.github/workflows/deploy-main.yml` | 修改 | generate 前加 `pnpm test` |

---

### Task 1: 寫死顏色測試（先紅）

**Files:** Create `tests/theme/no-raw-colors.test.ts`

**Interfaces:** Produces `findRawColors(text: string): string[]`（測試檔內部函式）。

- [ ] **Step 1: 寫測試**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '../..')
const PALETTE = /\b(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const RGB = /rgba?\((?!var\()[^)]*\)/g

function findRawColors(text: string): string[] {
	return [...text.matchAll(PALETTE), ...text.matchAll(HEX), ...text.matchAll(RGB)].map(m => m[0])
}

function targets(): string[] {
	const vue = fs.readdirSync(path.join(root, 'app'), { recursive: true })
		.map(String)
		.filter(f => f.endsWith('.vue'))
		.map(f => path.join('app', f))
	return [...vue, 'app/assets/css/main.css', 'tailwind.config.ts']
}

test('findRawColors 抓色名、色碼，放過 rgb(var())', () => {
	assert.deepEqual(findRawColors('text-blue-600 dark:bg-gray-900/40'), ['blue-600', 'gray-900'])
	assert.deepEqual(findRawColors('color: #fff; background: rgba(0,0,0,.5)'), ['#fff', 'rgba(0,0,0,.5)'])
	assert.deepEqual(findRawColors("'rgb(var(--color-ink) / <alpha-value>)' text-white bg-section/10"), [])
})

test('除 theme.css 外不得寫死顏色', () => {
	const offenders = targets()
		.map(file => ({ file, hits: findRawColors(fs.readFileSync(path.join(root, file), 'utf8')) }))
		.filter(r => r.hits.length > 0)
		.map(r => `${r.file}（${r.hits.length}）：${[...new Set(r.hits)].slice(0, 5).join(', ')}`)
	assert.deepEqual(offenders, [])
})
```

- [ ] **Step 2: 跑** `pnpm test` → 第一個測試 PASS；第二個 FAIL，列出約 18 個檔案。記下清單作為遷移基準。

- [ ] **Step 3: Commit**（紅燈測試先進版控，註明 WIP）

```bash
git add tests/theme/no-raw-colors.test.ts
git commit -m "test(theme): 擋寫死顏色（目前紅燈，遷移後轉綠）"
```

---

### Task 2: theme.css、Tailwind 對應、main.css、typography

**Files:** Create `app/assets/css/theme.css`；Modify `nuxt.config.ts`、`tailwind.config.ts`、`app/assets/css/main.css`

**Interfaces:** Produces Tailwind classes：`bg-page`、`bg-surface`、`bg-surface-muted`、`bg-header`、`text-ink`、`text-ink-muted`、`border-line`、`*-section`、`*-blog`、`*-cs`、`*-videos`、`*-works`、`*-success`、`*-error`、`*-warning`、`*-overlay`（皆支援 `/NN` 透明度）；`rounded-chip`／`rounded-card`／`rounded-panel`；`shadow-glow`；`font-sans`／`font-mono`。

- [ ] **Step 1: `theme.css`**

```css
/* 全站樣式設定：改這裡，整個網站跟著變。色值格式為「R G B」三個數字。 */
:root {
	/* ── 基本色 ── */
	--color-page: 255 255 255;          /* 頁面背景 */
	--color-surface: 255 255 255;       /* 卡片背景 */
	--color-surface-muted: 248 250 252; /* 次要背景：表格斑馬紋、引用、程式碼、中性按鈕 */
	--color-header: 255 255 255;        /* 導覽列、頁尾背景 */
	--color-ink: 17 24 39;              /* 主要文字 */
	--color-ink-muted: 107 114 128;     /* 次要文字：說明、日期 */
	--color-line: 229 231 235;          /* 邊線、分隔線 */

	/* ── 各區主色 ── */
	--color-blog: 37 99 235;            /* Blog 藍 */
	--color-cs: 5 150 105;              /* 計概 綠 */
	--color-videos: 220 38 38;          /* Videos 紅 */
	--color-works: 147 51 234;          /* Works 紫 */
	--color-neutral: 107 114 128;       /* 中性按鈕（Back to Home） */

	/* ── 狀態色（示意圖、提示框） ── */
	--color-success: 5 150 105;
	--color-error: 220 38 38;
	--color-warning: 217 119 6;

	/* ── 文章排版 ── */
	--color-prose-h2: 30 41 59;
	--color-prose-h3: 37 99 235;
	--color-prose-strong: 5 150 105;
	--color-prose-img-border: 17 17 17;
	--color-overlay: 0 0 0;             /* 圖片放大時的遮罩 */

	/* ── 字型 ── */
	--font-sans: Inter, ui-sans-serif, system-ui, sans-serif;
	--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;

	/* ── 圓角與光暈 ── */
	--radius-chip: 9999px;              /* tag */
	--radius-card: 0.5rem;              /* 按鈕、卡片 */
	--radius-panel: 1rem;               /* 縮圖、大區塊 */
	--glow: 0 0 15px;                   /* hover 光暈大小（透明度固定 0.4） */

	/* 沒掛 section-* 時的預設主色 */
	--color-section: var(--color-blog);
}

.dark {
	--color-page: 17 24 39;
	--color-surface: 3 7 18;
	--color-surface-muted: 31 41 55;
	--color-header: 31 41 55;
	--color-ink: 255 255 255;
	--color-ink-muted: 156 163 175;
	--color-line: 55 65 81;

	--color-blog: 96 165 250;
	--color-cs: 52 211 153;
	--color-videos: 248 113 113;
	--color-works: 192 132 252;
	--color-neutral: 156 163 175;

	--color-success: 52 211 153;
	--color-error: 248 113 113;
	--color-warning: 251 191 36;

	--color-prose-h2: 241 245 249;
	--color-prose-h3: 96 165 250;
	--color-prose-strong: 16 185 129;
	--color-prose-img-border: 85 85 85;

	--color-section: var(--color-blog);
}

/* 區塊主色切換：元件掛上其中一個 class，內部的 *-section 就吃到該區顏色 */
.section-blog { --color-section: var(--color-blog); }
.section-cs { --color-section: var(--color-cs); }
.section-videos { --color-section: var(--color-videos); }
.section-works { --color-section: var(--color-works); }
.section-neutral { --color-section: var(--color-neutral); }
```

- [ ] **Step 2: `nuxt.config.ts`**：`css: ['~/assets/css/theme.css', '~/assets/css/main.css']`

- [ ] **Step 3: `tailwind.config.ts`**：`theme.extend` 改為（保留 animation／keyframes；刪 `dark-bg` 等三個未使用色）：

```ts
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      colors: Object.fromEntries(
        ['page', 'surface', 'surface-muted', 'header', 'ink', 'ink-muted', 'line', 'section',
          'blog', 'cs', 'videos', 'works', 'success', 'error', 'warning', 'overlay']
          .map(name => [name, `rgb(var(--color-${name}) / <alpha-value>)`]),
      ),
      borderRadius: {
        chip: 'var(--radius-chip)',
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
      },
      boxShadow: {
        glow: 'var(--glow) rgb(var(--color-section) / 0.4)',
      },
```

typography `DEFAULT.css` 顏色改：h2 `rgb(var(--color-prose-h2))`、h3 `rgb(var(--color-prose-h3))`、strong `rgb(var(--color-prose-strong))`、kbd 背景 `rgb(var(--color-surface-muted))`／邊框 `1px solid rgb(var(--color-line))`／字型 `var(--font-mono)`、blockquote 背景 `rgb(var(--color-surface-muted))`、code 背景 `rgb(var(--color-surface-muted))`；刪 `'.dark code'`；`invert` 區塊整段刪除（深色由變數切換）。確認 `prose-invert` 仍在 `ArticleView` 使用時不會蓋掉變數色：invert 刪除後 `dark:prose-invert` 只剩 typography 內建的灰階反轉，h2/h3/strong/code 由 DEFAULT 的變數決定。

- [ ] **Step 4: `main.css`**：
  - `.prose img` 邊框 → `rgb(var(--color-prose-img-border))`，刪 `.dark .prose img`
  - blockquote 背景 → `rgb(var(--color-surface-muted))`，刪 `.dark .prose blockquote` 的背景（保留 `color: inherit`）
  - 表格 `#e2e8f0`／`#374151` → `rgb(var(--color-line))`；`th` 與斑馬紋 `#f8fafc`／`#1f2937`／`rgba(31,41,55,.4)` → `rgb(var(--color-surface-muted))`，刪對應 `.dark` 規則

- [ ] **Step 5: 驗證**：`pnpm run generate` 成功；`pnpm test` 的清單不再含 `main.css`、`tailwind.config.ts`。產出 CSS 抽查：`grep -o "rgb(var(--color-prose-h3))" .output/public/_nuxt/*.css | head -1` 有結果。

- [ ] **Step 6: Commit** `feat(theme): theme.css 與 Tailwind 語意色、文章排版改用變數`

---

### Task 3: SectionButton、TagChip、ProseImg

**Files:** Create `app/components/SectionButton.vue`、`app/components/TagChip.vue`；Modify `app/components/content/ProseImg.vue`

**Interfaces:**
- `<SectionButton to="/cs" section="cs" size="sm">View all →</SectionButton>`；`section` 預設 `neutral`，`size` 預設 `sm`；外部 class（如 `mb-4`）自動附加。
- `<TagChip :tag="tag" section="cs" />`；`section` 預設 `blog`。

- [ ] **Step 1: `SectionButton.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  to: string
  section?: 'blog' | 'cs' | 'videos' | 'works' | 'neutral'
  size?: 'sm' | 'md'
}>(), { section: 'neutral', size: 'sm' })
</script>

<template>
  <NuxtLink
    :to="to"
    :class="[
      `section-${section}`,
      'inline-flex items-center gap-1.5 rounded-card bg-section/10 font-semibold text-section transition-all duration-300 hover:scale-105 hover:shadow-glow',
      size === 'sm' ? 'px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm' : 'px-6 py-2.5 text-sm sm:px-8 sm:py-3.5 sm:text-base',
    ]"
  >
    <slot />
  </NuxtLink>
</template>
```

- [ ] **Step 2: `TagChip.vue`**

```vue
<script setup lang="ts">
withDefaults(defineProps<{
  tag: string
  section?: 'blog' | 'cs' | 'videos' | 'works'
}>(), { section: 'blog' })
</script>

<template>
  <NuxtLink
    :to="`/tags/${tag}`"
    :class="[
      `section-${section}`,
      'relative z-20 rounded-chip bg-section/10 px-2 py-0.5 text-[10px] font-semibold text-section transition-colors hover:bg-section/20 sm:text-xs',
    ]"
  >
    #{{ tag }}
  </NuxtLink>
</template>
```

- [ ] **Step 3: `ProseImg.vue`**：
  - `rgba(0, 0, 0, 0.84)` → `rgb(var(--color-overlay) / 0.84)`
  - `rgba(0, 0, 0, 0.6)` → `rgb(var(--color-overlay) / 0.6)`
  - 提示文字 `color: rgba(255, 255, 255, 0.45)` → `color: white; opacity: 0.45`（`white` 為允許的關鍵字）

- [ ] **Step 4: 驗證**：`pnpm run generate` 成功（元件尚未被使用也要能編譯）；測試清單不再含 `ProseImg.vue`。

- [ ] **Step 5: Commit** `feat(theme): SectionButton、TagChip 共用元件`

---

### Task 4: `.vue` 顏色遷移（AGY）

**Files:** `app/layouts/default.vue`、`app/components/{ArticleView,PostCard,VideoCard,WorkCard,Sidebar}.vue`、`app/pages/index.vue`、`app/pages/{blog,cs,videos,works}/index.vue`、`app/pages/{blog,cs,videos,works}/[...slug].vue`、`app/pages/tags/[tag].vue`

- [ ] **Step 1: 寫派工 prompt**（英文，接 `worker-frontend` 手冊），內容包含：
  - 下方對照表全文（事實，不要自行重新搜尋）。
  - 區塊歸屬：Blog 頁與 `PostCard`（`section` prop 預設 blog）＝blog；`/cs`、首頁計概區、tag 頁 cs 項目、`ArticleView` 單元標籤＝cs；Videos 頁與 `VideoCard`＝videos；Works 頁與 `WorkCard`＝works。在該區最外層元素加 `section-xxx`。
  - `PostCard` 新增 prop `section?: 'blog' | 'cs'`（預設 `'blog'`），根元素加 `` `section-${section}` ``；`/cs` 頁、首頁計概最新、tag 頁 `type === 'cs'` 的 `PostCard` 傳 `section="cs"`。
  - 所有「`inline-flex items-center gap-1.5 … rounded-lg hover:scale-105`」按鈕改 `SectionButton`（保留原本的 `mb-*` 當 class）；首頁 hero 的三顆白底大按鈕不改元件，只換色：`bg-surface text-ink border-2 border-line hover:border-section hover:shadow-glow`，並各自加 `section-blog`／`section-videos`／`section-works`。
  - 所有 `#tag` 連結改 `TagChip`（依所在區塊傳 section）。
  - Nick_dev 兩個改動：三張卡片底部改為 `<div class="mt-auto pt-4 border-t border-line flex flex-wrap items-center gap-2 pointer-events-auto">`，內含 `<time class="text-xs text-ink-muted mr-1 shrink-0">` 與直接並列的 `TagChip`（刪掉 tag 外層 div）；header `z-10` → `z-40`。
  - 圓角：tag → `rounded-chip`；按鈕、卡片、一般框 → `rounded-card`（取代 `rounded-lg`、`rounded-xl`、`rounded`、`sm:rounded-2xl`）；縮圖、YouTube 嵌入、大區塊 → `rounded-panel`（取代 `rounded-2xl`）。`rounded-full` 用在圓點／頭像時保留，用在 tag 時改 `rounded-chip`；`rounded-r` 保留。
  - 所有 `hover:shadow-[…rgba…]` → `hover:shadow-glow`。
  - 刪除因變數化而多餘的 `dark:` 顏色 class；不相關的 `dark:` 非顏色 class（如 `dark:prose-invert`、`dark:drop-shadow-*`）保留。
  - 不改 `<script>` 邏輯（`PostCard` 的 section prop 例外）、不改文字、不動其他檔案。
  - 若有顏色無法對應，**停下列出**，不要自己發明。
  - 驗收（必須全過，貼實際輸出）：`pnpm test` 顯示 fail 0；`pnpm run generate`；`node scripts/verify-api.mjs` 印 `API 驗證通過：文章 9 篇、影片 2 部、計概 1 篇`；`node scripts/verify-cs.mjs` 印 `計概專區頁面驗證通過：1 篇`。不准改測試或腳本來讓它過。
  - 報告寫到 `docs/agy_results/2026-09-30-theme-migration.md`：每個檔案改了什麼、所有「刻意造成的外觀差異」列表（供使用者視覺確認）。

**對照表**

| 原本（含對應 `dark:`） | 改為 |
|---|---|
| `text-gray-900`、`text-gray-800`、`dark:text-white`、`dark:text-gray-50` | `text-ink` |
| `text-gray-700`／`600`／`500`／`400`／`300`、`dark:text-gray-200`／`300`／`400`／`500`／`600` | `text-ink-muted` |
| 版面根 `bg-white` ＋ `dark:bg-gray-900` | `bg-page` |
| 卡片 `bg-white` ＋ `dark:bg-gray-950` | `bg-surface` |
| header／footer `bg-white` ＋ `dark:bg-gray-800` | `bg-header` |
| `bg-gray-50`／`100`、`dark:bg-gray-700`／`800`、`dark:bg-gray-900/40` | `bg-surface-muted` |
| `hover:bg-gray-100`／`200`、`dark:hover:bg-gray-700`／`800` | `hover:bg-surface-muted` |
| `bg-white/95` ＋ `dark:bg-gray-900/95` | `bg-page/95` |
| `border-gray-50`／`100`／`200`／`300`、`dark:border-gray-600`／`700`／`800` | `border-line` |
| `via-gray-300` ＋ `dark:via-gray-600` | `via-line` |
| `shadow-gray-900/10`、`dark:shadow-black/30` | `shadow-ink/10` |
| 主色文字 `text-{blue,red,purple,emerald}-600`／`700` ＋ `dark:text-*-300`／`400` | `text-section` |
| 主色淺底 `bg-*-50`、`bg-*-100` ＋ `dark:bg-*-900/30`／`40`／`50` | `bg-section/10` |
| `hover:bg-*-100` ＋ `dark:hover:bg-*-800`、`dark:hover:bg-*-800/50` | `hover:bg-section/20` |
| 實心 `bg-*-600` ＋ `hover:bg-*-700`（含 `dark:bg-red-700`） | `bg-section hover:bg-section/90 text-white` |
| `hover:text-*-600`／`700` ＋ `dark:hover:text-*-300`／`400`、`group-hover:text-*` | `hover:text-section`（group 版 `group-hover:text-section`） |
| `hover:border-*-400`、`dark:hover:border-*-500` | `hover:border-section` |
| `border-emerald-200/50` ＋ `dark:border-emerald-800/50` | `border-section/30` |
| `focus-visible:outline-blue-500` | `focus-visible:outline-section` |
| 卡片無縮圖漸層（`from-*-50 … to-*-100` 與 dark 版，含 indigo／violet／cyan／fuchsia／pink／rose） | `from-section/10 to-section/20`（刪掉按標題挑色的陣列，改固定字串） |
| 首頁 hero 背景 `from-blue-50 via-purple-50 to-pink-50` 與 dark 版 | `from-blog/10 via-works/10 to-videos/10` |
| 首頁光斑 `bg-blue-200`／`dark:bg-blue-900/40`、`bg-purple-200`／`dark:bg-purple-900/40` | `bg-blog/20`、`bg-works/20` |
| 首頁底線 `via-blue-400` ＋ `dark:via-blue-600` | `via-blog` |
| `amber-*`（提醒框） | `bg-warning/10`、`text-warning`、`border-warning/30`、實心 `bg-warning hover:bg-warning/90 text-white` |
| `rose-*`（錯誤框） | `bg-error/10`、`text-error`、`border-error/30` |
| 月亮圖示 `text-yellow-500` | `text-warning` |
| 太陽圖示 `text-gray-700` | `text-ink` |

- [ ] **Step 2: 派工**

```bash
cat ~/.claude/agy-roles/worker-frontend.md <scratchpad>/agy-theme.md > <scratchpad>/agy-theme.full.md
agy-delegate --dir "$PWD" --timeout 30m - < <scratchpad>/agy-theme.full.md > <scratchpad>/agy-theme.out 2> <scratchpad>/agy-theme.err
```

- [ ] **Step 3: Claude 收件驗收**（收件檢查清單）：`git diff --stat` 只含上列檔案；`git diff` 抽查 `<script>` 只有 `PostCard` section prop 與漸層陣列變動；自己重跑 `pnpm test`（fail 0）、generate、兩個 verify；反向驗證：暫時在 `Sidebar.vue` 加 `text-blue-600` → `pnpm test` 紅 → 移除。

- [ ] **Step 4: Commit** `refactor(theme): 全站 .vue 改用語意色與共用元件`

---

### Task 5: 技能取色、CI、token 生效抽查

**Files:** Modify `.claude/skills/cs-blog/SKILL.md`、`.claude/skills/cs-blog/config.yml`、`.github/workflows/deploy-main.yml`

- [ ] **Step 1: SKILL.md §4.2** 改為：示意圖（只畫不含程式碼的概念圖）配色讀 `app/assets/css/theme.css` 的淺色值（`R G B` 轉 hex）：背景 `--color-surface`、文字 `--color-ink`、次要 `--color-ink-muted`、邊線 `--color-line`、重點 `--color-cs`、成功 `--color-success`、錯誤 `--color-error`；註明「改了 theme.css 後，已發布的示意圖需重畫」。§5 縮圖 prompt 主色改寫「取 `--color-cs` 的淺色值」。`config.yml` 加 `themeFile: app/assets/css/theme.css`。

- [ ] **Step 2: CI**：`Install dependencies` 之後、`Static HTML export` 之前加

```yaml
      - name: Unit tests
        run: pnpm test
```

- [ ] **Step 3: token 生效抽查**：把 `--color-cs` 淺色暫改 `220 38 38`，generate 後 `grep -c "220 38 38" .output/public/_nuxt/*.css` ≥ 1，且 `/cs` 頁的 class 仍為 `text-section`（顏色由變數決定）→ 改回、重新 generate。

- [ ] **Step 4: 全部驗證**：`pnpm test`、generate、verify-api、verify-cs。

- [ ] **Step 5: Commit** `chore(theme): 技能取色改讀 theme.css，CI 加跑單元測試`

---

### Task 6: 視覺確認（使用者）

- [ ] 開預覽站 `pnpm exec nuxt dev --port 3021`。
- [ ] 依 AGY 報告的「外觀差異」＋ spec §1「統一為」表，整理**視覺確認清單**交使用者：每項＝網址＋元素＋改前→改後，淺色、深色各一輪；至少涵蓋首頁（hero、四個區塊按鈕、卡片）、`/blog`、`/cs`、`/videos`、`/works`、一篇 blog 文章（引用、表格、程式碼、tag）、一篇 cs 文章、一個 works 內頁（提醒／錯誤框）、tag 頁。
- [ ] 使用者確認後：sync-docs，更新 spec 狀態，提醒使用者主目錄 Nick_dev 那 4 檔的未提交改動已納入，可捨棄（捨棄前取得同意）；大改動後詢問是否重跑 `/graphify`。
