# 計概專區與 `/cs-blog` 技能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 部落格新增 `cs` 計概專區（單元分組、tag／首頁／API 整合、建置前單元驗證），並建立 repo 內 `/cs-blog` 出文技能。

**Architecture:** 單元邏輯集中在 `shared/utils/cs.ts` 純函式（Nuxt 4 自動匯入 app／server，`node --test` 與建置腳本可直接 import）。建置前由 `scripts/validate-cs.mjs` 擋不合法 `unit` 與圖片；generate 後由 `scripts/verify-cs.mjs` 檢查產出頁。API 在既有 `/api/v1` 旁加 `cs.json`、`cs/<slug>.json`。

**Tech Stack:** Nuxt 4.4、@nuxt/content 3.12（page＋data collection）、Tailwind 3、Node 22（型別剝除跑 `.ts` 測試）、`yaml` 2.x、Pillow、gcc 13。

Spec：`docs/superpowers/specs/2026-09-30-cs-zone-autopost-design.md`

## Global Constraints

- 不 push、不 merge；不碰主工作目錄 `Nick_dev` 的改動。
- 縮排跟隨檔案既有風格（`.ts` API／scripts 用 Tab；`content.config.ts`、`.vue` 既有 2 空白）；註解中文，密度跟隨既有程式碼。
- 新圖只放 `public/images/cs/`，僅允許 `.webp`／`.svg`，webp 每張 ≤ 500KB（`500 * 1024` bytes）。舊文章、舊圖不動。
- Blog 列表不得出現 cs 文章。
- 單元 id：`env-setup`、`compile-run`、`basic-syntax`、`io`、`ipo`、`pseudocode`。
- UI 視覺交 AGY（`agy-delegate`，不帶 `--yolo`），Claude 只寫查詢與邏輯、驗收邏輯。
- 驗證指令：`pnpm test`、`pnpm run generate`、`node scripts/verify-api.mjs`、`node scripts/verify-cs.mjs`。

## File Structure

| 檔案 | 動作 | 職責 |
|---|---|---|
| `shared/utils/cs.ts` | 新增 | 單元驗證、分組排序、圖片規則、單元名稱查詢 |
| `tests/cs/cs.test.ts` | 新增 | 上列純函式測試 |
| `content.config.ts` | 修改 | `cs`、`csUnits` collections |
| `content/cs/_units.yml` | 新增 | 單元清單 |
| `content/cs/fixture-cs-demo.md` | 新增（暫時） | 開發用 fixture，驗收文章上線時刪除 |
| `scripts/validate-cs.mjs` | 新增 | 建置前驗證 |
| `scripts/verify-cs.mjs` | 新增 | generate 後驗證產出頁 |
| `package.json` | 修改 | `dev`／`build`／`generate` 串驗證；`yaml` devDependency |
| `.github/workflows/deploy-main.yml` | 修改 | Node 22；加跑 `verify-cs.mjs` |
| `server/utils/api-items.ts` | 修改 | `'cs'` type、`toCsItem`、目錄頁計概區塊 |
| `server/utils/api-content.ts` | 修改 | `getCsItems` |
| `server/routes/api/v1/cs.json.ts`、`cs/[slug].ts` | 新增 | cs 端點 |
| `server/routes/api/v1/items.json.ts`、`index.ts` | 修改 | 納入 cs |
| `scripts/verify-api.mjs`、`docs/API.md` | 修改 | cs 端點驗證與文件 |
| `app/components/ArticleView.vue` | 新增 | 從 blog 內頁抽出的共用文章版型 |
| `app/pages/blog/[...slug].vue` | 修改 | 改用 `ArticleView` |
| `app/pages/cs/index.vue`、`app/pages/cs/[...slug].vue` | 新增 | 專區列表、文章頁 |
| `app/pages/index.vue`、`app/layouts/default.vue` | 修改 | 計概最新區塊、導覽列 |
| `app/composables/useTags.ts`、`app/pages/tags/[tag].vue` | 修改 | tag 納入 cs |
| `.gitignore` | 修改 | `.claude/*`＋`!.claude/skills/` |
| `.claude/skills/cs-blog/**` | 新增 | 技能本體、設定、樣板、輔助腳本 |

---

### Task 1: 計概純函式 `shared/utils/cs.ts`

**Files:**
- Create: `shared/utils/cs.ts`
- Test: `tests/cs/cs.test.ts`

**Interfaces:**
- Produces:
	- `interface CsUnit { id: string, name: string, order: number }`
	- `interface CsUnitGroup<T> { unit: CsUnit, posts: T[] }`
	- `const CS_IMAGE_MAX_BYTES = 500 * 1024`
	- `validateUnits(units: unknown): string[]`
	- `validateCsDocs(units: CsUnit[], docs: { file: string, unit?: unknown }[]): string[]`
	- `groupCsByUnit<T extends { unit: string, date: string }>(units: CsUnit[], docs: T[]): CsUnitGroup<T>[]`
	- `checkCsImages(files: { name: string, size: number }[]): string[]`
	- `unitNameOf(units: CsUnit[], id: string): string | undefined`

- [ ] **Step 1: 寫失敗測試** `tests/cs/cs.test.ts`

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
	CS_IMAGE_MAX_BYTES,
	checkCsImages,
	groupCsByUnit,
	unitNameOf,
	validateCsDocs,
	validateUnits,
} from '../../shared/utils/cs.ts'
import type { CsUnit } from '../../shared/utils/cs.ts'

const units: CsUnit[] = [
	{ id: 'io', name: '輸入與輸出', order: 4 },
	{ id: 'env-setup', name: '環境建立', order: 1 },
	{ id: 'ipo', name: '邏輯先行與 IPO', order: 5 },
]

test('validateUnits 接受合法清單', () => {
	assert.deepEqual(validateUnits(units), [])
})

test('validateUnits 擋非陣列、缺欄位、重複 id 與 order', () => {
	assert.equal(validateUnits(undefined).length, 1)
	assert.match(validateUnits([{ id: 'io', name: '輸入與輸出' }])[0], /order/)
	assert.match(validateUnits([...units, { id: 'io', name: 'x', order: 9 }]).join(), /重複的 id：io/)
	assert.match(validateUnits([...units, { id: 'new', name: 'x', order: 4 }]).join(), /重複的 order：4/)
})

test('validateCsDocs 擋不在清單內或缺少的 unit', () => {
	assert.deepEqual(validateCsDocs(units, [{ file: 'a.md', unit: 'io' }]), [])
	const errors = validateCsDocs(units, [{ file: 'b.md', unit: 'nope' }, { file: 'c.md' }])
	assert.equal(errors.length, 2)
	assert.match(errors[0], /b\.md.*nope/)
	assert.match(errors[1], /c\.md.*缺少 unit/)
})

test('groupCsByUnit 依 order 分組、組內新到舊、略過空單元', () => {
	const docs = [
		{ unit: 'io', date: '2026-10-01', title: 'io-old' },
		{ unit: 'env-setup', date: '2026-10-05', title: 'env' },
		{ unit: 'io', date: '2026-10-08', title: 'io-new' },
	]
	const groups = groupCsByUnit(units, docs)
	assert.deepEqual(groups.map(g => g.unit.id), ['env-setup', 'io'])
	assert.deepEqual(groups[1].posts.map(p => p.title), ['io-new', 'io-old'])
})

test('groupCsByUnit 不改原陣列', () => {
	const docs = [{ unit: 'io', date: '2026-01-01' }, { unit: 'io', date: '2026-02-01' }]
	groupCsByUnit(units, docs)
	assert.deepEqual(docs.map(d => d.date), ['2026-01-01', '2026-02-01'])
})

test('checkCsImages 只允許 webp／svg，webp 不可超過上限', () => {
	assert.deepEqual(checkCsImages([
		{ name: 'a-thumb.webp', size: CS_IMAGE_MAX_BYTES },
		{ name: 'a-diagram-01.svg', size: CS_IMAGE_MAX_BYTES * 3 },
	]), [])
	const errors = checkCsImages([
		{ name: 'b.png', size: 10 },
		{ name: 'c.webp', size: CS_IMAGE_MAX_BYTES + 1 },
	])
	assert.equal(errors.length, 2)
	assert.match(errors[0], /b\.png/)
	assert.match(errors[1], /c\.webp/)
})

test('unitNameOf 找不到回傳 undefined', () => {
	assert.equal(unitNameOf(units, 'io'), '輸入與輸出')
	assert.equal(unitNameOf(units, 'x'), undefined)
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `pnpm test`
Expected: FAIL，`Cannot find module .../shared/utils/cs.ts`

- [ ] **Step 3: 實作** `shared/utils/cs.ts`

```ts
// 計概專區純函式：單元驗證、分組排序、圖片規則（app、server、scripts、測試共用，不依賴 Nuxt）

export interface CsUnit {
	id: string
	name: string
	order: number
}

export interface CsUnitGroup<T> {
	unit: CsUnit
	posts: T[]
}

export const CS_IMAGE_MAX_BYTES = 500 * 1024

export function validateUnits(units: unknown): string[] {
	if (!Array.isArray(units))
		return ['_units.yml：units 必須是陣列']
	const errors: string[] = []
	const ids = new Set<string>()
	const orders = new Set<number>()
	units.forEach((unit, i) => {
		const where = `_units.yml 第 ${i + 1} 筆`
		if (typeof unit?.id !== 'string' || !unit.id)
			errors.push(`${where}：缺少 id`)
		if (typeof unit?.name !== 'string' || !unit.name)
			errors.push(`${where}：缺少 name`)
		if (typeof unit?.order !== 'number')
			errors.push(`${where}：缺少 order`)
		if (ids.has(unit?.id))
			errors.push(`_units.yml：重複的 id：${unit.id}`)
		if (orders.has(unit?.order))
			errors.push(`_units.yml：重複的 order：${unit.order}`)
		ids.add(unit?.id)
		orders.add(unit?.order)
	})
	return errors
}

export function validateCsDocs(units: CsUnit[], docs: { file: string, unit?: unknown }[]): string[] {
	const ids = new Set(units.map(u => u.id))
	const errors: string[] = []
	for (const doc of docs) {
		if (typeof doc.unit !== 'string' || !doc.unit)
			errors.push(`${doc.file}：缺少 unit`)
		else if (!ids.has(doc.unit))
			errors.push(`${doc.file}：unit「${doc.unit}」不在 _units.yml 內（可用：${[...ids].join('、')}）`)
	}
	return errors
}

export function groupCsByUnit<T extends { unit: string, date: string }>(units: CsUnit[], docs: T[]): CsUnitGroup<T>[] {
	return [...units]
		.sort((a, b) => a.order - b.order)
		.map(unit => ({
			unit,
			posts: docs.filter(d => d.unit === unit.id).sort((a, b) => b.date.localeCompare(a.date)),
		}))
		.filter(group => group.posts.length > 0)
}

export function checkCsImages(files: { name: string, size: number }[]): string[] {
	const errors: string[] = []
	for (const file of files) {
		if (!/\.(webp|svg)$/i.test(file.name))
			errors.push(`public/images/cs/${file.name}：只允許 .webp 或 .svg`)
		else if (/\.webp$/i.test(file.name) && file.size > CS_IMAGE_MAX_BYTES)
			errors.push(`public/images/cs/${file.name}：${Math.ceil(file.size / 1024)}KB，超過 500KB`)
	}
	return errors
}

export function unitNameOf(units: CsUnit[], id: string): string | undefined {
	return units.find(u => u.id === id)?.name
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `pnpm test`
Expected: 全部 PASS（原 9 個＋新 7 個）

- [ ] **Step 5: Commit**

```bash
git add shared/utils/cs.ts tests/cs/cs.test.ts
git commit -m "feat(cs): 計概專區單元驗證與分組純函式"
```

---

### Task 2: Collections、單元清單、建置前驗證、CI

**Files:**
- Modify: `content.config.ts`
- Create: `content/cs/_units.yml`、`content/cs/fixture-cs-demo.md`、`scripts/validate-cs.mjs`
- Modify: `package.json`、`.github/workflows/deploy-main.yml`

**Interfaces:**
- Consumes: Task 1 的 `validateUnits`、`validateCsDocs`、`checkCsImages`
- Produces: collection `cs`（欄位含 `unit: string`）、`csUnits`（單筆，`units: CsUnit[]`）

- [ ] **Step 1: `content.config.ts` 加 collections**（放在 `videos` 後）

```ts
    cs: defineCollection({
      type: 'page',
      source: 'cs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.string(),
        unit: z.string(),
        tags: z.array(z.string()).optional(),
        thumbnail: z.string().optional(),
      }),
    }),
    csUnits: defineCollection({
      type: 'data',
      source: 'cs/_units.yml',
      schema: z.object({
        units: z.array(z.object({ id: z.string(), name: z.string(), order: z.number() })),
      }),
    }),
```

- [ ] **Step 2: `content/cs/_units.yml`** — 內容照 spec §2.2 六個單元。

- [ ] **Step 3: fixture `content/cs/fixture-cs-demo.md`**

```markdown
---
title: 計概專區測試文章
description: 開發用 fixture，驗收文章上線時刪除
date: 2026-09-30
unit: io
tags:
  - students
---

開發用 fixture。
```

- [ ] **Step 4: `pnpm add -D yaml`**，確認 `package.json` devDependencies 出現 `yaml`。

- [ ] **Step 5: `scripts/validate-cs.mjs`**

```js
// 建置前驗證計概專區：unit 必須在 _units.yml 內、圖片須為 webp／svg 且 ≤500KB
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { checkCsImages, validateCsDocs, validateUnits } from '../shared/utils/cs.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const csDir = path.join(root, 'content/cs')
const imgDir = path.join(root, 'public/images/cs')
const unitsFile = path.join(csDir, '_units.yml')
const errors = []

function readFrontmatter(file) {
	const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
	return match ? (parse(match[1]) ?? {}) : {}
}

if (!fs.existsSync(unitsFile)) {
	errors.push('缺檔案：content/cs/_units.yml')
}
else {
	const units = parse(fs.readFileSync(unitsFile, 'utf8'))?.units
	errors.push(...validateUnits(units))
	if (errors.length === 0) {
		const docs = fs.readdirSync(csDir, { recursive: true })
			.map(String)
			.filter(file => file.endsWith('.md'))
			.map(file => ({ file: `content/cs/${file}`, unit: readFrontmatter(path.join(csDir, file)).unit }))
		errors.push(...validateCsDocs(units, docs))
	}
}

if (fs.existsSync(imgDir)) {
	const files = fs.readdirSync(imgDir).map(name => ({ name, size: fs.statSync(path.join(imgDir, name)).size }))
	errors.push(...checkCsImages(files))
}

if (errors.length > 0) {
	console.error(`計概專區驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log('計概專區驗證通過')
```

- [ ] **Step 6: `package.json` scripts**

```json
    "build": "node scripts/validate-cs.mjs && nuxt build",
    "dev": "node scripts/validate-cs.mjs && nuxt dev",
    "generate": "node scripts/validate-cs.mjs && nuxt generate",
```

- [ ] **Step 7: 驗證失敗路徑**：把 fixture 的 `unit` 暫改 `nope`，跑 `pnpm run generate`。
Expected: exit 1，印出 `content/cs/fixture-cs-demo.md：unit「nope」不在 _units.yml 內`。改回 `io`。

- [ ] **Step 8: 驗證成功路徑**：`pnpm run generate` exit 0，且 `.output/public/cs/fixture-cs-demo/` 尚不存在（頁面還沒做）不影響建置。

- [ ] **Step 9: CI** `deploy-main.yml`：`node-version: "22"`；在 `Verify static API` 後加

```yaml
      - name: Verify cs zone
        run: node scripts/verify-cs.mjs
```

（`verify-cs.mjs` 於 Task 5 建立；Task 5 完成前不 push，不影響。）

- [ ] **Step 10: Commit**

```bash
git add content.config.ts content/cs package.json pnpm-lock.yaml scripts/validate-cs.mjs .github/workflows/deploy-main.yml
git commit -m "feat(cs): cs collection、單元清單與建置前驗證"
```

（`pnpm-lock.yaml` 在 `.gitignore` 內，若 add 不進去就略過。）

---

### Task 3: 靜態 API cs 端點

**Files:**
- Modify: `server/utils/api-items.ts`、`server/utils/api-content.ts`、`server/routes/api/v1/items.json.ts`、`server/routes/api/v1/index.ts`、`scripts/verify-api.mjs`、`docs/API.md`
- Create: `server/routes/api/v1/cs.json.ts`、`server/routes/api/v1/cs/[slug].ts`
- Test: `tests/api/api-items.test.ts`

**Interfaces:**
- Consumes: `unitNameOf`（Task 1，server 端自動匯入）
- Produces: `toCsItem(doc: CsArticleDoc, site: SiteContext, unitName: string): ApiItem`；`renderBrowsePage(articles, videos, cs = [])`；`getCsItems(event): Promise<ApiItem[]>`

- [ ] **Step 1: 失敗測試**（加在 `tests/api/api-items.test.ts`，並在 import 補 `toCsItem`）

```ts
test('toCsItem 帶 unit 與 unitName，type 為 cs', () => {
	assert.deepEqual(toCsItem({
		path: '/cs/scanf-comma-input',
		title: 'scanf 讀逗點',
		description: 'd',
		date: '2026-10-01',
		tags: ['students'],
		thumbnail: '/images/cs/scanf-comma-input-thumb.webp',
		unit: 'io',
	}, site, '輸入與輸出'), {
		type: 'cs',
		slug: 'scanf-comma-input',
		title: 'scanf 讀逗點',
		description: 'd',
		date: '2026-10-01',
		tags: ['students'],
		thumbnail: 'https://cycu-bridgeai.github.io/BridgeAI-Learn/images/cs/scanf-comma-input-thumb.webp',
		url: 'https://cycu-bridgeai.github.io/BridgeAI-Learn/cs/scanf-comma-input',
		unit: 'io',
		unitName: '輸入與輸出',
	})
})

test('renderBrowsePage 有計概區塊與 cs.json 連結', () => {
	const html = renderBrowsePage([], [], [{ ...item('scanf-comma-input', '2026-10-01'), type: 'cs' }])
	assert.match(html, /href="cs\.json"/)
	assert.match(html, /href="cs\/scanf-comma-input\.json"/)
	assert.match(html, /計概（1）/)
})
```

- [ ] **Step 2: `pnpm test`** → FAIL（`toCsItem` 未匯出）

- [ ] **Step 3: 實作 `api-items.ts`**

```ts
// ApiItem
	type: 'article' | 'video' | 'cs'
	// …既有欄位
	unit?: string
	unitName?: string

export interface CsArticleDoc extends ArticleDoc {
	unit: string
}

export function toCsItem(doc: CsArticleDoc, site: SiteContext, unitName: string): ApiItem {
	return { ...toArticleItem(doc, site), type: 'cs', unit: doc.unit, unitName }
}
```

`renderBrowsePage(articles: ApiItem[], videos: ApiItem[], cs: ApiItem[] = [])`：清單加 `<li><a href="cs.json">cs.json</a> — 計概文章清單</li>`，影片區塊後加 `${renderSection('計概', 'cs', cs)}`；`items.json` 說明改「全部文章、影片與計概文章」。

- [ ] **Step 4: `api-content.ts` 加 `getCsItems`**

```ts
export async function getCsItems(event: H3Event): Promise<ApiItem[]> {
	const site = getSiteContext(event)
	const [unitsDoc, docs] = await Promise.all([
		queryCollection(event, 'csUnits').first(),
		queryCollection(event, 'cs')
			.select('path', 'title', 'description', 'date', 'tags', 'thumbnail', 'unit')
			.all(),
	])
	const units = unitsDoc?.units ?? []
	return sortByDateDesc(docs.map(doc => toCsItem(doc, site, unitNameOf(units, doc.unit) ?? doc.unit)))
}
```

- [ ] **Step 5: 路由**

`server/routes/api/v1/cs.json.ts`：
```ts
export default defineEventHandler(async (event) => {
	return toListResponse(await getCsItems(event), new Date().toISOString())
})
```
`server/routes/api/v1/cs/[slug].ts`：
```ts
export default defineEventHandler(async (event) => {
	const slug = parseSlugParam(getRouterParam(event, 'slug'))
	const item = slug ? (await getCsItems(event)).find(i => i.slug === slug) : undefined
	if (!item)
		throw createError({ statusCode: 404, statusMessage: 'Cs article not found' })
	return toItemResponse(item, new Date().toISOString())
})
```
`items.json.ts`、`index.ts`：`Promise.all` 加 `getCsItems(event)`，合併進 `sortByDateDesc([...articles, ...videos, ...cs])`／`renderBrowsePage(articles, videos, cs)`。

- [ ] **Step 6: `verify-api.mjs`**：`checkItem` 的縮圖檔存在檢查改為 `type === 'article' || type === 'cs'`；加

```js
	if (type === 'cs') {
		check(typeof item.unit === 'string' && item.unit.length > 0, `${where}: unit 缺值`)
		check(typeof item.unitName === 'string' && item.unitName.length > 0, `${where}: unitName 缺值`)
	}
```
並新增 `const cs = checkList('cs.json', 'cs', 'cs', countMarkdown('cs'))`；items 筆數改 `articles.length + videos.length + cs.length`；最後訊息加計概篇數。

- [ ] **Step 7: 驗證**：`pnpm test` 全過；`pnpm run generate && node scripts/verify-api.mjs` → `API 驗證通過：文章 9 篇、影片 2 部、計概 1 篇`；`.output/public/api/v1/cs/fixture-cs-demo.json` 存在且 `unitName` 為「輸入與輸出」。

- [ ] **Step 8: `docs/API.md`**：端點表加 `cs.json`、`cs/<slug>.json`；Item 欄位表加 `type` 可為 `cs`、`unit`、`unitName`（僅 cs）。

- [ ] **Step 9: Commit**

```bash
git add server scripts/verify-api.mjs tests/api docs/API.md
git commit -m "feat(api): 靜態 API 新增計概文章端點"
```

---

### Task 4: 頁面邏輯（ArticleView 抽取、/cs、首頁、tag、導覽）

**Files:**
- Create: `app/components/ArticleView.vue`、`app/pages/cs/index.vue`、`app/pages/cs/[...slug].vue`
- Modify: `app/pages/blog/[...slug].vue`、`app/pages/index.vue`、`app/layouts/default.vue`、`app/composables/useTags.ts`、`app/pages/tags/[tag].vue`

**Interfaces:**
- Consumes: `groupCsByUnit`、`unitNameOf`（自動匯入）；collections `cs`、`csUnits`
- Produces: `<ArticleView :post back-to back-label :unit-name?>`

- [ ] **Step 1: 抽 `ArticleView.vue`**：把 `blog/[...slug].vue` 的 `formatDate`、`thumbnailSrc`、`tocLinks`、整段 template 原樣搬入。props：

```ts
const props = defineProps<{
	post: { title: string, description: string, date: string, tags?: string[], thumbnail?: string, body?: unknown }
	backTo: string
	backLabel: string
	unitName?: string
}>()
```
template 裡 `post.` 改 `props.post.`（template 內可直接用 `post`）；返回鈕 `to="/blog"` → `:to="backTo"`，文字 → `{{ backLabel }}`；標題上方加：

```vue
<NuxtLink v-if="unitName" :to="backTo" class="inline-block mb-3 px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full">
  {{ unitName }}
</NuxtLink>
```

- [ ] **Step 2: blog 內頁改用元件**

```vue
<template>
  <ArticleView v-if="post" :post="post" back-to="/blog" back-label="Back to Blog" />
</template>
```
script 保留查詢、404、`useSeoMeta`，其餘移除。

- [ ] **Step 3: `/cs/[...slug].vue`**

```vue
<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data } = await useAsyncData(`cs-${slug}`, async () => {
  const [post, unitsDoc] = await Promise.all([
    queryCollection('cs').path(`/cs/${slug}`).first(),
    queryCollection('csUnits').first(),
  ])
  return { post, unitName: post ? unitNameOf(unitsDoc?.units ?? [], post.unit) : undefined }
})

if (!data.value?.post) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: () => `${data.value?.post?.title} - BridgeAI Learn`,
  description: () => data.value?.post?.description,
})
</script>

<template>
  <ArticleView v-if="data?.post" :post="data.post" back-to="/cs" back-label="回計概專區" :unit-name="data.unitName" />
</template>
```

- [ ] **Step 4: `/cs/index.vue`**

```vue
<script setup lang="ts">
useSeoMeta({ title: '計概專區 — BridgeAI Learn' })

const { data: groups } = await useAsyncData('cs-list', async () => {
  const [unitsDoc, posts] = await Promise.all([
    queryCollection('csUnits').first(),
    queryCollection('cs').all(),
  ])
  return groupCsByUnit(unitsDoc?.units ?? [], posts)
})
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">計概專區</h1>
    <p class="text-gray-500 dark:text-gray-400 mb-8">依課程單元整理的上課卡關點。</p>
    <section v-for="group in groups" :key="group.unit.id" class="mb-10">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ group.unit.name }}</h2>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <PostCard v-for="post in group.posts" :key="post.path" :post="post" />
      </div>
    </section>
    <p v-if="!groups?.length" class="text-gray-400 dark:text-gray-500">尚無文章。</p>
  </div>
</template>
```

- [ ] **Step 5: 首頁**：script 加

```ts
const { data: latestCs } = await useAsyncData('home-cs', () =>
  queryCollection('cs').order('date', 'DESC').limit(3).all()
)
```
在 Latest Articles `</section>` 後加一個 divider＋`<section v-if="latestCs?.length">`，結構照 Latest Articles（標題「計概最新」、View all → `/cs`、`PostCard`）。

- [ ] **Step 6: 導覽列**：Blog 連結後加 `<NuxtLink to="/cs" …同 class…>計概</NuxtLink>`。

- [ ] **Step 7: `useTags`**：`collectTags`、`getContentByTag` 的 `Promise.all` 加 `queryCollection('cs')…`；回傳多 `cs`，`total` 加上 `cs.length`；`collectTags` 同步納入 cs tags。tag 頁 `combined` 加 `...tagContent.value.cs.map(c => ({ ...c, type: 'cs' }))`，模板 `PostCard v-if="item.type === 'blog' || item.type === 'cs'"`。

- [ ] **Step 8: 驗證**：`pnpm run generate` 成功；`.output/public/cs/index.html`、`cs/fixture-cs-demo/index.html` 存在；`blog/index.html` 不含「計概專區測試文章」；`tags/students/index.html` 含之；blog 內頁（`blog/playground/index.html`）仍含「Back to Blog」與文章目錄。

- [ ] **Step 9: Commit**

```bash
git add app
git commit -m "feat(cs): 計概專區頁面、首頁區塊、tag 與導覽整合"
```

---

### Task 5: generate 後驗證 `scripts/verify-cs.mjs`

**Files:**
- Create: `scripts/verify-cs.mjs`

- [ ] **Step 1: 實作**

```js
// 驗證 generate 產出的計概專區頁面：Blog 列表排除 cs、tag 頁包含 cs、/cs 依單元順序分組
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { groupCsByUnit } from '../shared/utils/cs.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, process.argv[2] ?? '.output/public')
const csDir = path.join(root, 'content/cs')
const errors = []

function check(ok, message) {
	if (!ok)
		errors.push(message)
}

function readPage(rel) {
	const file = path.join(out, rel, 'index.html')
	if (!fs.existsSync(file)) {
		errors.push(`缺頁面：${rel}/index.html`)
		return ''
	}
	return fs.readFileSync(file, 'utf8')
}

function escapeHtml(text) {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const units = parse(fs.readFileSync(path.join(csDir, '_units.yml'), 'utf8')).units
const docs = fs.readdirSync(csDir)
	.filter(file => file.endsWith('.md'))
	.map((file) => {
		const fm = parse(fs.readFileSync(path.join(csDir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])
		return { ...fm, date: String(fm.date), slug: file.replace(/\.md$/, ''), html: escapeHtml(fm.title) }
	})

const csPage = readPage('cs')
const blogPage = readPage('blog')
const homePage = readPage('')

for (const doc of docs) {
	check(!blogPage.includes(doc.html), `Blog 列表不應出現 cs 文章：${doc.title}`)
	check(csPage.includes(doc.html), `/cs 缺文章：${doc.title}`)
	readPage(`cs/${doc.slug}`)
	for (const tag of doc.tags ?? [])
		check(readPage(`tags/${tag}`).includes(doc.html), `/tags/${tag} 缺 cs 文章：${doc.title}`)
}

const positions = groupCsByUnit(units, docs).map(g => csPage.indexOf(`>${escapeHtml(g.unit.name)}<`))
check(positions.every(p => p >= 0), '/cs 缺單元標題')
check(positions.every((p, i) => i === 0 || positions[i - 1] < p), '/cs 單元順序與 _units.yml 不符')

const newest = [...docs].sort((a, b) => b.date.localeCompare(a.date))[0]
if (newest)
	check(homePage.includes(newest.html), `首頁計概最新缺：${newest.title}`)

if (errors.length > 0) {
	console.error(`計概專區頁面驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log(`計概專區頁面驗證通過：${docs.length} 篇`)
```

- [ ] **Step 2: 跑** `node scripts/verify-cs.mjs` → `計概專區頁面驗證通過：1 篇`

- [ ] **Step 3: 反向驗證**：暫時把 fixture 複製一份到 `content/blog/`，generate 後跑 → 應報「Blog 列表不應出現 cs 文章」。刪掉複本、重新 generate。

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-cs.mjs
git commit -m "test(cs): generate 後驗證計概專區頁面"
```

---

### Task 6: UI 視覺（AGY）

**Files:** `app/layouts/default.vue`、`app/pages/cs/index.vue`、`app/pages/index.vue`（計概最新區塊）、`app/components/ArticleView.vue`（單元標籤）

- [ ] **Step 1: 派工 prompt**（英文，接角色手冊）：

```
cat ~/.claude/agy-roles/worker-frontend.md <prompt.md> | agy-delegate --dir "$PWD" -
```

prompt 要點：
- Scope ONLY: nav item "計概" in default.vue; /cs index page layout (unit section headers, count badge, empty state); home "計概最新" section; unit badge in ArticleView.
- Match existing visual language (blue/purple accent cards, dark mode variants, `hover:shadow-[…]` glow, rounded-lg buttons). Use a distinct accent for cs (e.g. emerald) consistent with how Blog=blue, Videos=red, Works=purple.
- Do NOT change script blocks, queries, props, or any file outside the list. Keep Chinese strings as-is. 2-space indent in .vue.
- Must pass: `pnpm run generate && node scripts/verify-cs.mjs && node scripts/verify-api.mjs`.

- [ ] **Step 2: Claude 驗收**：`git diff --stat` 只動上述 4 檔；script 區塊無變化；三個驗證指令全過。視覺交使用者確認。

- [ ] **Step 3: Commit**

```bash
git add app
git commit -m "style(cs): 計概專區版面與導覽樣式"
```

---

### Task 7: `/cs-blog` 技能

**Files:**
- Modify: `.gitignore`（加 `.claude/*`、`!.claude/skills/`）
- Create: `.claude/skills/cs-blog/SKILL.md`、`config.yml`、`request.schema.yml`、`templates/outline.md`、`templates/article.md`、`scripts/run_c.sh`、`scripts/to_webp.py`

- [ ] **Step 1: `scripts/run_c.sh`**：參數 `<file.c> [input-file]`；檢查 `gcc -dumpversion` 主版本 = 13；`gcc file.c -o prog`（課堂指令）＋`gcc -Wall -Wextra -fsyntax-only file.c`（警告另列）；有 input 則 `./prog < input`，印出分隔的「編譯／警告／輸出／exit code」。
- [ ] **Step 2: `scripts/to_webp.py`**：`to_webp.py <src> <dst.webp> [--size 1600x900]`；有 `--size` 時 cover 裁切到該尺寸；quality 從 85 每次降 5 到 50，仍超過 500KB 就等比縮 0.9 重試；印出最終尺寸與 KB；超標則 exit 1。
- [ ] **Step 3: 自測腳本**：`run_c.sh` 跑一支 `scanf("%d", &n)` 程式餵 `42`，輸出 `42`；`to_webp.py` 轉 `public/images/system_intro_thumbnail.png` 到 scratch，確認 ≤500KB、1600×900。
- [ ] **Step 4: `config.yml`、`request.schema.yml`、樣板**：內容照 spec §3（config 值、需求單欄位與允許值、六段大綱、article frontmatter）。
- [ ] **Step 5: `SKILL.md`**：frontmatter（name `cs-blog`，description 含觸發詞「計概文章」「卡關點」「/cs-blog」），內文照 spec §3 六步＋停止條件，每步寫明具體指令（`run_c.sh`、`to_webp.py`、`agy-delegate` 縮圖 prompt 範本、`pnpm run generate`、`verify-api`、`verify-cs`、`grep TODO-SCREENSHOT`）。
- [ ] **Step 6: 確認 `git check-ignore .claude/skills/cs-blog/SKILL.md` 無輸出、`.claude/worktrees` 仍被忽略。**
- [ ] **Step 7: Commit**

```bash
git add .gitignore .claude/skills/cs-blog
git commit -m "feat(skill): 新增 /cs-blog 計概出文技能"
```

---

### Task 8: 驗收文章（需使用者素材）

- [ ] 向使用者索取：HW02 PY05 題目原文；環境漏裝情境的 Windows 截圖。
- [ ] 依 `/cs-blog` 技能流程寫 `scanf-comma-input`（io）與環境漏裝（env-setup）兩篇。
- [ ] 刪除 `content/cs/fixture-cs-demo.md`；三個驗證指令全過；使用者審稿後才給 commit message。
