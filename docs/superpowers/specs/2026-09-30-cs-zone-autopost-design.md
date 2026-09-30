# 計概專區與 `/cs-blog` 自動出文技能 — 設計規格

- 日期：2026-09-30
- 狀態：網站端、兩篇驗收文章與老師課堂影片入口已實作；計概分類方式依 2026-09-30 視覺驗收調整
- 分支：`worktree-cs-zone`（從 `origin/main` 開出）
- 實作順序：網站端 → 技能 → 兩篇驗收文章

## 視覺驗收後的決定（取代下文的單元設計）

使用者確認其餘樣式後，要求移除 `/cs` 標題左側色條，並像 Blog 一樣用 tag 篩選文章。因此 `/cs` 不再依「輸入與輸出」等課程單元分組；`unit`、`unitName`、`csUnits` 與 `_units.yml` 均移除。計概文章及 API 以既有 `tags` 分類，`/cs-blog` 需求單與文章樣板也只使用主題及身份標籤。下文保留原始設計與驗收脈絡，涉及單元的條目以本節為準。

老師課堂影片頻道放在 `/cs` 首頁。往後每篇文章在大綱階段都要檢查是否有對題影片；有則記下影片來源與放置段落，沒有則明記原因。靜態部署直接以上傳 Nuxt 產出的 `.output/public` 作為 Pages artifact；Nuxt 也會生成指向它的 `dist` 連結，但該連結不進版控。

## 1. 目標

1. 部落格新增「計概專區」：獨立的 `cs` collection，依課程單元分組呈現。
2. 新增 repo 內技能 `/cs-blog`：使用者每週提供 1–2 個「學生上課卡關點」＋截圖／上課資料，技能產出一篇經實測的文章與縮圖。
3. 先用技能把流程跑穩；需求單欄位設計成日後可直接搬到 BridgeAI 平台做成表單。

### 非目標

- 不改舊文章、舊縮圖。
- 不做 BridgeAI 平台端表單（只保證需求單欄位可直接對應）。
- 不做 LINE 機器人本身（只提供它要拉的 API）。

## 2. 網站端

### 2.1 Collections（`content.config.ts`）

| collection | type | source | schema |
|---|---|---|---|
| `cs` | `page` | `cs/**/*.md` | 同 blog：`title`、`description`、`date`、`tags?`、`thumbnail?`，另加必填 `unit: z.string()` |
| `csUnits` | `data` | `cs/_units.yml` | `units: z.array({ id, name, order })` |

`blog` 的 source 是 `blog/**/*.md`，本來就抓不到 `content/cs/`，所以 Blog 列表天然不含 cs 文章；仍以測試鎖住（見 §5）。

> 已實測（2026-09-30）：data collection 可正常讀到 `cs/_units.yml`。

### 2.2 單元清單 `content/cs/_units.yml`

由使用者維護。初始內容：

```yaml
units:
  - id: env-setup
    name: 環境建立
    order: 1
  - id: compile-run
    name: 編譯與執行
    order: 2
  - id: basic-syntax
    name: 基本架構與語法
    order: 3
  - id: io
    name: 輸入與輸出
    order: 4
  - id: ipo
    name: 邏輯先行與 IPO
    order: 5
  - id: pseudocode
    name: 虛擬碼到程式
    order: 6
```

### 2.3 建置前驗證（`unit` 不合法 → 建置失敗）

- 純函式放 `shared/utils/cs.ts`（Nuxt 4 會自動匯入 app 與 server；不依賴 Nuxt，可被 app、server、scripts、`node --test` 共用）：
	- `validateUnits(units)`：`id` 唯一、`order` 唯一、欄位齊全。
	- `validateCsDocs(units, docs)`：每篇 `unit` 必須在清單內；回傳錯誤清單（含檔名與不合法的值）。
	- `groupCsByUnit(units, docs)`：依 `order` 分組、組內按 `date` 新到舊、空單元不輸出。
	- `checkCsImages(files)`：`public/images/cs/` 只允許 `.webp`／`.svg`，webp 每張 ≤500KB。
- `scripts/validate-cs.mjs`：讀 `content/cs/_units.yml`（用 `yaml` 套件，已在 lockfile 內，改為明確宣告 devDependency）與各篇 frontmatter，呼叫上述函式；有錯就印出並 `exit 1`。
- `package.json` 的 `dev`、`build`、`generate` 直接串 `node scripts/validate-cs.mjs && nuxt …`（CI 跑的是 `pnpm run generate`，目前 `prebuild` 不會被觸發；pre-script 行為又隨 pnpm 版本設定而異，直接串接最穩）。
- 部署 workflow 在 `verify-api` 之後加跑 `node scripts/verify-cs.mjs`（§5）。
- 部署 workflow（`deploy-main.yml`）的 Node 由 20 升到 22：驗證腳本要直接 import `shared/utils/cs.ts`，需要 Node 22 的型別剝除；Node 20 也已於 2026-04 停止維護。本機已是 v22.20。

### 2.4 頁面

| 頁面 | 內容 | 負責 |
|---|---|---|
| 導覽列 `layouts/default.vue` | Blog 後面加「計概」→ `/cs` | AGY |
| `/cs`（`pages/cs/index.vue`） | 查 `csUnits`＋`cs`，用 `groupCsByUnit` 分組；每組標題為單元名稱，卡片沿用 `PostCard` | 查詢：Claude／版面：AGY |
| `/cs/[...slug]` | 文章頁，版型沿用 blog 內頁；返回鈕改為「回計概專區」；標頭多一個單元標籤 | 抽共用元件：Claude／樣式微調：AGY |
| 首頁 `pages/index.vue` | 「Latest Articles」之後新增「計概最新」區塊：最新 3 篇＋「View all →」連 `/cs` | 查詢：Claude／版面：AGY |
| tag 頁＋`useTags` | `collectTags`、`getContentByTag` 加入 `cs`；tag 頁合併時 type 為 `cs`，用 `PostCard` 顯示 | Claude |
| Blog 列表 | 不動（天然排除 cs） | — |

文章頁共用：把 `pages/blog/[...slug].vue` 的版型抽成 `components/ArticleView.vue`（props：文章物件、返回連結與文字、選填單元名稱），blog 與 cs 兩頁共用。抽出後 blog 內頁外觀必須不變。

### 2.5 靜態 API（給 LINE 機器人拉文章）

沿用 `/api/v1` 的做法，新增獨立端點，不併入 `articles`（避免與 blog 的 slug 相撞）：

| 端點 | 說明 |
|---|---|
| `cs.json` | 計概文章清單，日期新到舊 |
| `cs/<slug>.json` | 單篇計概文章 |
| `items.json` | 既有端點，加入 cs 文章 |
| `index`（目錄頁） | 加「計概」區塊，讓預渲染器爬到每個 `cs/<slug>.json` |

- `ApiItem.type` 增加 `'cs'`，並多兩個選填欄位 `unit`（id）、`unitName`（中文名稱）。
- 新增 `toCsItem(doc, site, units)` 純函式與對應測試；`scripts/verify-api.mjs` 補檢查 cs 端點。
- 更新 `docs/API.md`。

### 2.6 圖片

- 目錄：`public/images/cs/`，舊圖不動。
- 命名：
	- 縮圖：`<slug>-thumb.webp`，1600×900
	- 截圖：`<slug>-shot-<nn>.webp`（`nn` 從 01 起）
	- 示意圖：`<slug>-diagram-<nn>.svg`
- 縮圖與截圖一律用 Pillow 轉 webp，每張 ≤500KB（從 quality 85 往下降，必要時等比縮小，直到符合）。
- `checkCsImages` 在建置前把關。

## 3. `/cs-blog` 技能

位置：`.claude/skills/cs-blog/`，進版控。`.gitignore` 改為忽略 `.claude/*` 但保留 `!.claude/skills/`（worktree 目錄 `.claude/worktrees/` 等不可進版控）。

```
.claude/skills/cs-blog/
├── SKILL.md              流程與停止條件
├── config.yml            課程資料路徑、AI 助教連結、gcc 版本、縮圖風格參考圖
├── request.schema.yml    需求單欄位定義（日後直接對應平台表單）
└── templates/
    ├── outline.md        六段大綱樣板
    └── article.md        全文樣板（含 frontmatter）
```

`config.yml` 初始值：

```yaml
courseMaterials: /mnt/c/Users/pjw92/Desktop/計概課程資料/
assistantUrl: https://bridgeai.jywglady.org      # BridgeAI 平台正式站（取自平台 repo 的 FRONTEND_BASE_URL）
assistantGuide: /blog/ai-guidance                # 本站 AI 助教使用說明
gccMajor: 13
thumbnailStyleRefs:
  - public/images/system_intro_thumbnail.png
  - public/images/exams_thumbnail.png
```

每次對話處理 1–2 篇，每篇依序走以下六步。任一步未通過就不能往下。

### 步驟 1：需求單

把使用者描述整理成 YAML，使用者確認後才往下。

```yaml
slug: scanf-comma-input          # 英文 kebab-case，同時是檔名與 API slug
unit: io                         # 必須在 _units.yml 內
difficulty: basic                # intro｜basic｜advanced（入門／基礎／進階）
problem: >                       # 學生卡關點，一兩句話
  HW02 PY05 BMI 範例輸入是「168, 62.5」，照課堂的空白分隔寫法讀不到正確值。
sources:                         # 文章內容唯一可用的依據
  - type: course                 # course｜homework｜screenshot｜note
    path: 環境建立.md
    note: 第 3 節 PATH
voice: ta                        # ta｜senior｜neutral｜custom（步驟 2 決定）
voiceCustom: ""                  # voice=custom 時必填
audience: students               # students｜teachers｜both → 決定身份 tag
tags: [c, scanf]                 # 身份 tag 由 audience 自動補上，不用手填
```

欄位全部是單值或清單，無巢狀邏輯，可直接對應平台表單元件（下拉、文字、多檔上傳）。

### 步驟 2：口吻

每篇都用選擇題問使用者（`AskUserQuestion`），預設第一個：

1. 助教對學生說話（預設）
2. 學長姐第一人稱
3. 中性教學
4. 自訂（使用者輸入描述）

### 步驟 3：大綱

固定六段，先給使用者看、核可後才寫全文：

1. **情境開場**：真實題目或錯誤訊息
2. **為什麼**：原理＋示意圖
3. **解法**：實測過的程式碼
4. **延伸變形**
5. **自我檢查**：清單或小練習
6. **還是卡住？**：連到 BridgeAI AI 助教（`assistantUrl`），並附本站使用說明（`assistantGuide`）

### 步驟 4：全文

- **程式碼實測**：每段程式碼存到暫存目錄，先確認 `gcc -dumpversion` 主版本為 13，再用課程建議的標準指令 `gcc -Wall -Wextra -std=c11 <name>.c -o <name>`（`環境建立.md` §4.2）編譯，警告需修掉或在文中說明。用真實輸入（stdin 檔）執行，文中貼實際輸出，輸入與輸出分開標示。編譯失敗、出現未說明的警告、或輸出與文中描述不符，就不能往下。
- **示意圖**：用 `diagram-design` 技能畫 SVG，存成 `<slug>-diagram-<nn>.svg`。
- **截圖**：使用者附的截圖轉 webp、依 §2.6 命名後放進 `public/images/cs/`。缺圖時先放佔位標記，並附截圖清單：

	```markdown
	<!-- TODO-SCREENSHOT: <slug>-shot-02 | 要截什麼 | 怎麼重現 -->
	```

- **內容來源**：只能來自需求單 `sources` 與實測結果，不得自行補充資料以外的說法。

### 步驟 5：縮圖

1. 派 AGY 生成（`agy-delegate`，風格比照 `thumbnailStyleRefs`：中文標題＋插圖，16:9）。
2. Claude 讀圖核對圖上中文字與標題是否一致；有錯字就退回重生，最多 3 次；仍失敗就停下交使用者決定。
3. 用 Pillow 轉成 `<slug>-thumb.webp`（1600×900，≤500KB）。

### 步驟 6：落檔

1. 寫入 `content/cs/<slug>.md`（frontmatter 含 `unit`、`thumbnail: /images/cs/<slug>-thumb.webp`）。
2. 檢查 `tags` 含身份標籤（本 repo `CLAUDE.md` 規則；學生視角必含 `students`）。
3. 跑 `pnpm run generate`＋`node scripts/verify-api.mjs`＋`node scripts/verify-cs.mjs`（§5）。
4. 使用者審稿通過後，才提供 commit message。

### 停止條件（停下來問使用者）

| 情況 | 處理 |
|---|---|
| 上課資料與實測結果矛盾 | 停下，列出兩邊說法與實測輸出 |
| 縮圖重生 3 次仍有錯字 | 停下，交使用者決定 |
| 文章含 `TODO-SCREENSHOT` | 不可 commit |
| build 失敗或 `unit` 不合法 | 不能往下 |

## 4. 驗收文章

### 4.1 scanf 讀逗點分隔輸入（`io`）

- 情境：HW02 PY05 BMI 範例輸入 `168, 62.5`；課堂教的是空白分隔。
- 至少涵蓋三種情況（皆須實測）：
	1. 逗點分隔 `168,62.5`
	2. 逗點前多一個空白 `168 ,62.5`
	3. 整數與浮點數混用（如 `%d` 與 `%f` 搭配）
- 題目原文來源：需使用者提供 HW02 PY05 題目（需求單 `sources`）。

### 4.2 環境漏裝套件（`env-setup`）

- 依 `環境建立.md` 的 GCC、PATH、VS Code 擴充套件三步驟，推出各種漏裝情境與對應症狀。
- Windows 截圖由使用者提供；未提供前以 `TODO-SCREENSHOT` 佔位，不可 commit。

## 5. 測試與驗收（TDD）

| 項目 | 測試方式 |
|---|---|
| `unit` 驗證 | `tests/cs/cs.test.ts`：合法、不存在的 unit、缺 unit、`_units.yml` 重複 id／order |
| `/cs` 分組排序 | `groupCsByUnit` 單元測試：依 order 分組、組內日期新到舊、空單元不輸出 |
| 圖片規則 | `checkCsImages` 單元測試：非 webp／svg、超過 500KB |
| API | `tests/api/api-items.test.ts` 補 `toCsItem`、目錄頁含計概區塊 |
| Blog 列表排除 cs | `scripts/verify-cs.mjs`（generate 後跑）：`/blog/` 產出頁不含任何 cs 標題 |
| tag 頁包含 cs | 同上：`/tags/students/` 產出頁含 cs 文章標題 |
| `/cs` 分組 | 同上：`/cs/` 產出頁的單元標題順序符合 `_units.yml` |
| 建置失敗 | 放一篇 `unit: nope` 的暫存檔，`pnpm run generate` 必須失敗（驗完移除） |

`verify-cs.mjs` 需要至少一篇 cs 文章才有意義；網站端階段先放一篇 fixture（`content/cs/` 內、標 `students`），驗收文章上線前移除。

## 6. 分工

| 項目 | 負責 |
|---|---|
| collection、驗證、查詢、API、測試、`ArticleView` 抽取 | Claude |
| 導覽列、`/cs` 版面、首頁區塊版面、單元標籤樣式 | AGY（Claude 定邊界與驗收，視覺由使用者確認） |
| 縮圖生成 | AGY |

## 7. 約束

- 不 push、不 merge（main 一 push 就自動部署）。
- 不碰主工作目錄 `Nick_dev` 的未提交改動。
- 縮排 Tab；註解中文，密度跟隨既有程式碼。

## 狀態紀錄

- 2026-09-30 後續修正：網站端、`/cs-blog` 技能完成；驗收文章 1（`scanf-comma-input`）完成。審稿後新增寫作規則：白話、資訊密集、程式碼與題目不用圖片（見 SKILL.md §4.4）。（commit 待補 hash）
