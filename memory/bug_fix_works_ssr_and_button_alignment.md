# Bug Fix: Works Detail Page SSR and Card Button Alignment

## 1. 問題描述 (Symptoms)
- **問題一 (SSR)**：在學生作品詳細頁面重新整理網頁時，頁面內容在伺服器端渲染 (SSR) 後僅剩下標題、縮圖與簡介，主體文章內容 (html) 完全消失不見。
- **問題二 (按鈕垂直對齊)**：在作品列表頁面，當兩張作品卡片並排時，如果其中一張卡片的標籤折成多行，會導致該卡片的按鈕被往上頂，使得兩邊卡片的按鈕在垂直位置上一高一低，無法水平對齊。

## 2. 根本原因 (Root Cause)
- **原因一 (SSR)**：
  詳細頁面 ([app/pages/works/[...slug].vue](file:///mnt/c/Users/pjw92/Desktop/BridgeAI/BridgeAI-Learn/app/pages/works/[...slug].vue)) 使用了 `useAsyncData` 配合 `$fetch` 來取得 `public/works/[slug].html` 靜態檔案。
  在瀏覽器端導航時，因為有實際的 host 協定可以發送 HTTP 請求，能順利取回資源。但在伺服器端 (SSR) 執行時，Nitro 內部沒有完整的主機資訊且不支援對 `public/` 資源的內部 API 請求，導致 `$fetch` 拋出 404/FetchError，使資料在伺服器端變為 `null`，並被寫入 payload 快取中，使客戶端 hydration 時直接套用 null。
- **原因二 (按鈕垂直對齊)**：
  在 [app/components/WorkCard.vue](file:///mnt/c/Users/pjw92/Desktop/BridgeAI/BridgeAI-Learn/app/components/WorkCard.vue) 中，原先的佈局結構是把「標籤區域」排在按鈕的下方，且使用了 `mt-auto`。
  當其中一張卡片標籤折行變高時，便會往上推按鈕，導致兩邊的按鈕在垂直高度上失去對齊。此外，無邊框的 Demo 按鈕與有 1px 邊框的 GitHub 按鈕在 `items-center` 排版下，也因邊框有無而產生 1~2px 的細微高度差距。

## 3. 修復方式 (Resolution)
- **修復一 (SSR & 相對路徑)**：
  在 [app/pages/works/[...slug].vue](file:///mnt/c/Users/pjw92/Desktop/BridgeAI/BridgeAI-Learn/app/pages/works/[...slug].vue) 的 `useAsyncData` 中引入 `import.meta.server`。
  在伺服器端 (SSR) 直接利用 `node:fs/promises` 與 `process.cwd()` 自本地硬碟讀取預先編譯好的靜態 HTML 檔，不再通過本機網路請求；客戶端則依舊利用 `$fetch` 作為 fallback。
  同時寫了 `formatHtmlContent` 函數，在渲染前動態使用正規表示法將 HTML 中所有相對路徑的資源 (如圖片與連結) 替換為 GitHub 對應 branch 的絕對網址，一併解決了 GitHub Markdown API 沒轉換到的相對圖片破圖問題。
- **修復二 (按鈕垂直對齊)**：
  在 [app/components/WorkCard.vue](file:///mnt/c/Users/pjw92/Desktop/BridgeAI/BridgeAI-Learn/app/components/WorkCard.vue) 中：
  1. 將版面結構順序對調，**把「標籤與日期區域」置於按鈕上方**，而將**「操作按鈕」置於卡片最底部**，在按鈕上方加一條細線分割 (`border-t pt-4`)。如此按鈕下方沒有變動高度的內容，藉由 `mt-auto` 能夠永久垂直對齊在卡片最底端。
  2. 將按鈕外層 flex 容器改為 `items-stretch`。
  3. 為 Demo 按鈕補上 `border border-transparent` 透明邊框，使兩者 Box Model 規格與 Padding 高度計算完全對等。

## 4. 未來規劃/計劃撰寫時的注意點 (Lessons Learned & Best Practices)
- **Nitro SSR 載入本機資源**：在 Nuxt 3 專案中，SSR 階段應避免使用 `$fetch` 請求本機 `public/` 的靜態檔案，在伺服器端環境下應優先採用 `node:fs` 進行本地檔案讀取以增進效能與確保穩定性。
- **卡片式佈局按鈕垂直對齊**：多卡片並排且卡片具備 `h-full` 時，最底部的操作按鈕下方不應放置容易因字數/標籤數折行而變高變動的內容。應將變動內容放於按鈕上方，按鈕單獨放於最底部配合 `mt-auto` 做 Y 軸對齊。
- **Box Model 與對稱邊框**：Flex 項目若要維持高度絕對一致，應確保兩者都有相同的 `border` 寬度設定（例如其中一個設 `border border-transparent`），並配合外層容器的 `items-stretch` 進行高度拉伸。
