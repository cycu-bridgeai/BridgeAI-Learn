// 驗證 nuxt generate 產出的靜態 API，CI 部署前執行
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const apiDir = path.join(root, process.argv[2] ?? '.output/public', 'api/v1')
const siteBase = process.env.API_SITE_BASE ?? 'https://cycu-bridgeai.github.io/BridgeAI-Learn'
const errors = []

function check(ok, message) {
	if (!ok)
		errors.push(message)
}

function readJson(rel) {
	const file = path.join(apiDir, rel)
	if (!fs.existsSync(file)) {
		errors.push(`缺檔案：${rel}`)
		return null
	}
	return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function countMarkdown(dir) {
	return fs.readdirSync(path.join(root, 'content', dir), { recursive: true })
		.filter(file => String(file).endsWith('.md'))
		.length
}

function checkItem(item, type, where) {
	check(item.type === type, `${where}: type 應為 ${type}`)
	for (const key of ['slug', 'title', 'description', 'date', 'url'])
		check(typeof item[key] === 'string' && item[key].length > 0, `${where}: ${key} 缺值`)
	check(!String(item.slug).includes('/'), `${where}: slug 不可含 /`)
	check(Array.isArray(item.tags), `${where}: tags 應為陣列`)
	check(String(item.url).startsWith(`${siteBase}/`), `${where}: url 應以 ${siteBase}/ 開頭`)
	check(item.thumbnail === null || /^https:\/\//.test(item.thumbnail), `${where}: thumbnail 應為 https 網址或 null`)
	if (type === 'article' && typeof item.thumbnail === 'string' && item.thumbnail.startsWith(siteBase)) {
		const rel = decodeURI(item.thumbnail.slice(siteBase.length))
		check(fs.existsSync(path.join(root, 'public', rel)), `${where}: 縮圖檔不存在 public${rel}`)
	}
	if (type === 'video') {
		check(typeof item.youtubeId === 'string' && item.youtubeId.length > 0, `${where}: youtubeId 缺值`)
		check(item.youtubeUrl === `https://www.youtube.com/watch?v=${item.youtubeId}`, `${where}: youtubeUrl 錯誤`)
	}
}

function checkList(rel, type, folder, expectedCount) {
	const data = readJson(rel)
	if (!data)
		return []
	check(data.apiVersion === 'v1', `${rel}: apiVersion 應為 v1`)
	check(data.count === data.items.length, `${rel}: count 與 items 長度不符`)
	check(data.count === expectedCount, `${rel}: 應有 ${expectedCount} 筆，實際 ${data.count}`)
	const seen = new Set()
	for (const item of data.items) {
		const where = `${rel}#${item.slug}`
		checkItem(item, type, where)
		check(!seen.has(item.slug), `${rel}: slug 重複 ${item.slug}`)
		seen.add(item.slug)
		const detail = readJson(`${folder}/${item.slug}.json`)
		if (detail)
			check(JSON.stringify(detail.item) === JSON.stringify(item), `${folder}/${item.slug}.json: 與清單內容不一致`)
	}
	return data.items
}

const articles = checkList('articles.json', 'article', 'articles', countMarkdown('blog'))
const videos = checkList('videos.json', 'video', 'videos', countMarkdown('videos'))

const all = readJson('items.json')
if (all) {
	check(all.count === articles.length + videos.length, 'items.json: 筆數應等於文章加影片')
	check(all.count === all.items.length, 'items.json: count 與 items 長度不符')
	const dates = all.items.map(item => item.date)
	check(dates.every((date, i) => i === 0 || dates[i - 1] >= date), 'items.json: 應依日期新到舊排序')
}
check(fs.existsSync(path.join(apiDir, 'index.html')), '缺檔案：index.html')

if (errors.length > 0) {
	console.error(`API 驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log(`API 驗證通過：文章 ${articles.length} 篇、影片 ${videos.length} 部`)
