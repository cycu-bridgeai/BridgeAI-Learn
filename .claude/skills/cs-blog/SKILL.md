---
name: cs-blog
description: 把「學生上課卡關點」＋截圖／上課資料做成計概專區文章（content/cs）與縮圖。每篇走需求單→口吻→大綱→實測全文→縮圖→落檔六步，程式碼一律 gcc 13 實測。觸發：使用者說「/cs-blog」「寫計概文章」「這週的卡關點」「學生卡在…幫我寫一篇」，或丟來計概上課截圖要出文時。
---

# /cs-blog：計概卡關點出文

每次對話處理 1–2 篇。**每篇各自**依序走六步，任一步沒過不能往下。設定在 `config.yml`，需求單欄位在 `request.schema.yml`，樣板在 `templates/`，輔助腳本在 `scripts/`（以下路徑都相對於本技能目錄 `.claude/skills/cs-blog/`，指令在 repo 根執行）。

## 鐵則

- **文章內容只能來自需求單 `sources` 與實測結果。** 資料沒寫、沒測過的說法不寫；想補充就先問使用者。
- **上課資料與實測結果矛盾 → 停下問使用者**，列出兩邊說法與實測輸出，不自行裁決。
- 每步需要使用者確認的地方，**等到確認才往下**。
- 不 push、不 merge。commit message 只在使用者審稿通過後提供。

## 步驟 1：需求單

1. 讀 `request.schema.yml` 與 `content/cs/_units.yml`。
2. 把使用者描述整理成 YAML（欄位與允許值照 schema；`voice` 先填 `ta`，步驟 2 再定）：

   ```yaml
   slug: scanf-comma-input
   unit: io
   difficulty: basic
   problem: >
     HW02 PY05 BMI 範例輸入是「168, 62.5」，照課堂的空白分隔寫法讀不到正確值。
   sources:
     - type: homework
       path: <使用者提供的檔案>
       note: HW02 PY05 題目與範例輸入
   voice: ta
   voiceCustom: ""
   audience: students
   tags: [c, scanf]
   ```

3. 自查：`unit` 在 `_units.yml` 內；`slug` 符合 pattern 且 `content/cs/<slug>.md` 不存在；`sources` 至少一項且檔案讀得到。
4. 給使用者看，**確認後**才往下。

## 步驟 2：口吻

每篇都用 `AskUserQuestion` 問，選項順序固定：

1. 助教對學生說話（預設，標 Recommended）
2. 學長姐第一人稱
3. 中性教學
4. 自訂（使用者在 Other 輸入描述 → `voice: custom`、`voiceCustom` 填描述）

把結果寫回需求單。

## 步驟 3：大綱

1. 讀 `sources` 裡的每份資料（上課資料在 `config.yml` 的 `courseMaterials`；PDF 用 Read 的 `pages` 參數讀相關頁）。
2. 照 `templates/outline.md` 填六段：情境開場 → 為什麼（原理＋示意圖）→ 解法（實測程式碼）→ 延伸變形 → 自我檢查 → 還是卡住？
3. 每個論點標出處（哪份資料哪一段，或「待實測」）。
4. 列出已有截圖與缺的截圖。
5. 給使用者看，**核可後**才寫全文。

## 步驟 4：全文

### 4.1 程式碼實測（每一段都要）

1. 程式碼存到 scratchpad：`<scratchpad>/<slug>/NN.c`，輸入存成 `NN.in`（與學生實際會打的內容一致，含空白與逗點）。
2. 執行：

   ```bash
   .claude/skills/cs-blog/scripts/run_c.sh <scratchpad>/<slug>/NN.c <scratchpad>/<slug>/NN.in
   ```

   | exit | 意思 | 處理 |
   |---|---|---|
   | 0 | 通過 | 往下 |
   | 2 | gcc 不是 13 | 停下回報 |
   | 3 | 編譯失敗 | 修程式；若文章本來就要展示編譯錯誤，貼實際錯誤訊息並在文中說明 |
   | 4 | 有 `-Wall -Wextra` 警告 | 修掉，或在文中說明這個警告（例如示範錯誤寫法時） |
   | 5 | 執行非零結束 | 同 3 的判斷 |

3. 文中貼 `=== 輸出 ===` 之後的**實際輸出，一字不改**；輸入與輸出分開兩個 `text` 區塊（見 `templates/article.md`）。
4. 文中描述（例如「b 會讀到 0」）必須與實際輸出相符，不符就不能往下。
5. 示範「錯誤寫法」時，錯誤結果也要是實測出來的。

### 4.2 示意圖

用 `diagram-design` 技能畫 SVG，存成 `public/images/cs/<slug>-diagram-NN.svg`，文中 `![圖說](/images/cs/<slug>-diagram-NN.svg)`。

### 4.3 截圖

- 使用者附的截圖：

  ```bash
  python3 .claude/skills/cs-blog/scripts/to_webp.py <原圖> public/images/cs/<slug>-shot-NN.webp
  ```

  依出現順序編號（01 起）。
- 缺圖：在該位置放佔位註解，並在回覆最後附「截圖清單」表（檔名／要截什麼／怎麼重現）：

  ```markdown
  <!-- TODO-SCREENSHOT: <slug>-shot-02 | 要截什麼 | 怎麼重現 -->
  ```

### 4.4 寫作

- 照 `templates/article.md` 的結構與步驟 2 選的口吻。
- 「還是卡住？」段落用 `config.yml` 的 `assistantUrl` 與 `assistantGuide`。
- 身份 tag 依 `audience` 自動補上（`students`／`teachers`／兩者）。

## 步驟 5：縮圖

1. 寫派工 prompt（英文）到 scratchpad，重點：
   - 16:9，1600×900；風格比照 `config.yml` 的 `thumbnailStyleRefs`（請它先看這兩張圖）：中文大標題＋與主題相關的插圖。
   - 圖上**只能有**這段中文標題（逐字給出），不要其他文字。
   - 輸出存到 `<scratchpad>/<slug>/thumb-raw.png`，回報檔案路徑。
2. 派給 AGY（`worker-frontend` 角色；規範見 `agy-dispatch` 技能，不帶 `--yolo`）：

   ```bash
   cat ~/.claude/agy-roles/worker-frontend.md <scratchpad>/<slug>/thumb-prompt.md > <scratchpad>/<slug>/thumb-full.md
   agy-delegate --dir "$PWD" --timeout 15m - < <scratchpad>/<slug>/thumb-full.md
   ```

3. Claude 用 Read 讀圖，逐字比對圖上文字與標題。有錯字、多字、缺字 → 退回重生（prompt 註明上一版錯在哪），**最多 3 次**；第 3 次仍錯 → 停下，把三張圖給使用者決定。
4. 轉檔：

   ```bash
   python3 .claude/skills/cs-blog/scripts/to_webp.py <scratchpad>/<slug>/thumb-raw.png public/images/cs/<slug>-thumb.webp --size 1600x900
   ```

## 步驟 6：落檔

1. 寫入 `content/cs/<slug>.md`（frontmatter 含 `unit` 與 `thumbnail: /images/cs/<slug>-thumb.webp`）。
2. 檢查 tags 含身份標籤（學生視角必含 `students`，本 repo `CLAUDE.md` 規則）。
3. 跑驗證，**全部要過**：

   ```bash
   pnpm run generate
   node scripts/verify-api.mjs
   node scripts/verify-cs.mjs
   ```

   `generate` 會先跑 `scripts/validate-cs.mjs`：`unit` 不合法、`public/images/cs/` 有非 webp／svg 或超過 500KB 的圖，建置直接失敗。
4. 若 `content/cs/fixture-cs-demo.md` 還在，刪掉（開發用 fixture）。
5. 檢查佔位：

   ```bash
   grep -n "TODO-SCREENSHOT" content/cs/<slug>.md
   ```

   有結果 → **不能 commit**，把截圖清單交給使用者，等補圖後回到 4.3。
6. 請使用者審稿。通過後先呼叫 `sync-docs`，再提供 commit message（只給訊息，不自行 push）。

## 停止條件總表

| 情況 | 處理 |
|---|---|
| 上課資料與實測結果矛盾 | 停，列兩邊說法＋實測輸出，問使用者 |
| 縮圖重生 3 次仍有錯字 | 停，交使用者決定 |
| 文章含 `TODO-SCREENSHOT` | 不可 commit |
| `pnpm run generate` 失敗或 `unit` 不合法 | 不能往下 |
| `verify-api`／`verify-cs` 失敗 | 不能往下 |
