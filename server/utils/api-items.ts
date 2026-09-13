// API 資料轉換的純函式，不依賴 Nuxt，可直接用 node --test 測試

export const API_VERSION = 'v1'

export interface ApiItem {
	type: 'article' | 'video'
	slug: string
	title: string
	description: string
	date: string
	tags: string[]
	thumbnail: string | null
	url: string
	youtubeId?: string
	youtubeUrl?: string
}

export interface ArticleDoc {
	path: string
	title: string
	description: string
	date: string
	tags?: string[]
	thumbnail?: string
}

export interface VideoDoc {
	path: string
	title: string
	description: string
	date: string
	youtubeId: string
	tags?: string[]
}

export interface SiteContext {
	siteBase: string
	baseURL: string
}

export interface ApiListResponse {
	apiVersion: string
	generatedAt: string
	count: number
	items: ApiItem[]
}

export interface ApiItemResponse {
	apiVersion: string
	generatedAt: string
	item: ApiItem
}

export function toSiteBase(origin: string, baseURL: string): string {
	const base = baseURL === '/' ? '' : baseURL.replace(/\/$/, '')
	return `${origin.replace(/\/$/, '')}${base}`
}

export function slugFromPath(path: string): string {
	return path.split('/').filter(Boolean).pop() ?? ''
}

export function toAbsoluteUrl(site: SiteContext, target: string): string {
	if (/^https?:\/\//i.test(target))
		return target
	let path = target.startsWith('/') ? target : `/${target}`
	// frontmatter 可能已帶 baseURL，避免重複
	if (site.baseURL !== '/' && path.startsWith(site.baseURL))
		path = path.slice(site.baseURL.length - 1)
	return encodeURI(`${site.siteBase}${path}`)
}

export function toArticleItem(doc: ArticleDoc, site: SiteContext): ApiItem {
	return {
		type: 'article',
		slug: slugFromPath(doc.path),
		title: doc.title,
		description: doc.description,
		date: doc.date,
		tags: doc.tags ?? [],
		thumbnail: doc.thumbnail ? toAbsoluteUrl(site, doc.thumbnail) : null,
		url: toAbsoluteUrl(site, doc.path),
	}
}

export function toVideoItem(doc: VideoDoc, site: SiteContext): ApiItem {
	return {
		type: 'video',
		slug: slugFromPath(doc.path),
		title: doc.title,
		description: doc.description,
		date: doc.date,
		tags: doc.tags ?? [],
		thumbnail: `https://img.youtube.com/vi/${doc.youtubeId}/hqdefault.jpg`,
		url: toAbsoluteUrl(site, doc.path),
		youtubeId: doc.youtubeId,
		youtubeUrl: `https://www.youtube.com/watch?v=${doc.youtubeId}`,
	}
}

export function sortByDateDesc(items: ApiItem[]): ApiItem[] {
	return [...items].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug))
}

export function parseSlugParam(param: string | undefined): string | null {
	const match = param?.match(/^([^/]+)\.json$/)
	return match ? match[1] : null
}

export function toListResponse(items: ApiItem[], generatedAt: string): ApiListResponse {
	return { apiVersion: API_VERSION, generatedAt, count: items.length, items }
}

export function toItemResponse(item: ApiItem, generatedAt: string): ApiItemResponse {
	return { apiVersion: API_VERSION, generatedAt, item }
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function renderSection(heading: string, folder: string, items: ApiItem[]): string {
	const rows = items
		.map(item => `<li><a href="${folder}/${escapeHtml(item.slug)}.json">${escapeHtml(item.slug)}.json</a> — ${escapeHtml(item.title)}</li>`)
		.join('\n')
	return `<h2>${heading}（${items.length}）</h2>\n<ul>\n${rows}\n</ul>`
}

// 目錄頁的連結同時讓 Nitro 預渲染器爬到每個單筆 JSON
export function renderBrowsePage(articles: ApiItem[], videos: ApiItem[]): string {
	return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BridgeAI Learn API ${API_VERSION}</title>
</head>
<body>
<h1>BridgeAI Learn API ${API_VERSION}</h1>
<ul>
<li><a href="items.json">items.json</a> — 全部文章與影片</li>
<li><a href="articles.json">articles.json</a> — 文章清單</li>
<li><a href="videos.json">videos.json</a> — 影片清單</li>
</ul>
${renderSection('文章', 'articles', articles)}
${renderSection('影片', 'videos', videos)}
</body>
</html>
`
}
