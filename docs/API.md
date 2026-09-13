# BridgeAI Learn 內容 API（v1）

唯讀、公開、免金鑰。提供部落格文章與影片的摘要和縮圖，給 LINE 機器人等外部程式使用。

- Base URL：`https://cycu-bridgeai.github.io/BridgeAI-Learn/api/v1/`
- 用瀏覽器打開 Base URL 會看到目錄頁，可以直接點每一篇查看內容。
- 允許跨網域呼叫（CORS `*`）。

## 端點

| 端點 | 說明 |
|---|---|
| `items.json` | 全部文章與影片，依日期新到舊 |
| `articles.json` | 文章清單 |
| `articles/<slug>.json` | 指定一篇文章 |
| `videos.json` | 影片清單 |
| `videos/<slug>.json` | 指定一部影片 |

## 回應格式

清單：

```json
{
  "apiVersion": "v1",
  "generatedAt": "2026-09-13T08:00:00.000Z",
  "count": 9,
  "items": [ /* Item */ ]
}
```

單筆（`articles/playground.json`）：

```json
{
  "apiVersion": "v1",
  "generatedAt": "2026-09-13T08:00:00.000Z",
  "item": {
    "type": "article",
    "slug": "playground",
    "title": "不想開 IDE？BridgeAI 練習場讓你直接在瀏覽器跑程式",
    "description": "從學生視角介紹練習場——切語言、自訂輸入、AI 虛擬碼助手，測試想法最省事的地方",
    "date": "2026-05-11",
    "tags": ["playground", "guide", "students"],
    "thumbnail": "https://cycu-bridgeai.github.io/BridgeAI-Learn/images/%E7%B7%B4%E7%BF%92%E5%A0%B4.png",
    "url": "https://cycu-bridgeai.github.io/BridgeAI-Learn/blog/playground"
  }
}
```

影片會多兩個欄位：

```json
{
  "type": "video",
  "slug": "intro-neural-networks",
  "thumbnail": "https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg",
  "youtubeId": "aircAruvnKk",
  "youtubeUrl": "https://www.youtube.com/watch?v=aircAruvnKk"
}
```

### Item 欄位

| 欄位 | 型別 | 說明 |
|---|---|---|
| `type` | `"article"` \| `"video"` | |
| `slug` | string | 組單筆網址用 |
| `title` | string | 標題 |
| `description` | string | 摘要 |
| `date` | string | `YYYY-MM-DD` |
| `tags` | string[] | 可能為空陣列；`students` / `teachers` 表示目標讀者 |
| `thumbnail` | string \| null | 完整 https 網址 |
| `url` | string | 網站上的頁面 |
| `youtubeId` / `youtubeUrl` | string | 僅影片 |

## 使用範例

```js
const BASE = 'https://cycu-bridgeai.github.io/BridgeAI-Learn/api/v1'

// 列出全部，自己挑
const { items } = await (await fetch(`${BASE}/items.json`)).json()
const forStudents = items.filter(item => item.tags.includes('students'))

// 指定某一篇
const res = await fetch(`${BASE}/articles/playground.json`)
if (!res.ok)
	throw new Error('找不到這篇')
const { item } = await res.json()
```

命令列手動查看：

```bash
curl -s https://cycu-bridgeai.github.io/BridgeAI-Learn/api/v1/articles.json
```

## 注意事項

- **更新時機**：網站重新部署時才會更新（main 有新 commit 後約數分鐘）。
- **不存在的 slug**：回 HTTP 404（內容是網站的 404 頁面，不是 JSON），請先檢查 `res.ok`。
- **不支援查詢參數**：搜尋、篩選請抓清單後在自己的程式裡做。
- **相容性承諾**：`v1` 內只會新增欄位，不會改名或刪除；要破壞相容時會開 `v2`。
- slug 可能與原始檔名大小寫不同（例如 `lti_registration`），請一律以 API 回傳的 `slug` 為準。
