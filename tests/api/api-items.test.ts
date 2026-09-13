import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
	API_VERSION,
	parseSlugParam,
	renderBrowsePage,
	slugFromPath,
	sortByDateDesc,
	toAbsoluteUrl,
	toArticleItem,
	toItemResponse,
	toListResponse,
	toSiteBase,
	toVideoItem,
} from '../../server/utils/api-items.ts'
import type { ApiItem, SiteContext } from '../../server/utils/api-items.ts'

const site: SiteContext = {
	siteBase: 'https://cycu-bridgeai.github.io/BridgeAI-Learn',
	baseURL: '/BridgeAI-Learn/',
}

test('toSiteBase 合併 origin 與 baseURL，去掉結尾斜線', () => {
	assert.equal(toSiteBase('https://example.com/', '/BridgeAI-Learn/'), 'https://example.com/BridgeAI-Learn')
	assert.equal(toSiteBase('https://example.com', '/'), 'https://example.com')
})

test('slugFromPath 取最後一段', () => {
	assert.equal(slugFromPath('/blog/playground'), 'playground')
	assert.equal(slugFromPath('/videos/lti_registration/'), 'lti_registration')
})

test('toAbsoluteUrl 處理中文、已含 baseURL、外部網址', () => {
	assert.equal(
		toAbsoluteUrl(site, '/images/練習場.png'),
		'https://cycu-bridgeai.github.io/BridgeAI-Learn/images/%E7%B7%B4%E7%BF%92%E5%A0%B4.png',
	)
	assert.equal(
		toAbsoluteUrl(site, '/BridgeAI-Learn/images/a.png'),
		'https://cycu-bridgeai.github.io/BridgeAI-Learn/images/a.png',
	)
	assert.equal(toAbsoluteUrl(site, 'images/a.png'), 'https://cycu-bridgeai.github.io/BridgeAI-Learn/images/a.png')
	assert.equal(toAbsoluteUrl(site, 'https://cdn.example.com/x.png'), 'https://cdn.example.com/x.png')
})

test('toArticleItem 轉換欄位，缺縮圖與 tags 時給預設值', () => {
	const full = toArticleItem({
		path: '/blog/playground',
		title: '練習場',
		description: '摘要',
		date: '2026-05-11',
		tags: ['students'],
		thumbnail: '/images/練習場.png',
	}, site)
	assert.deepEqual(full, {
		type: 'article',
		slug: 'playground',
		title: '練習場',
		description: '摘要',
		date: '2026-05-11',
		tags: ['students'],
		thumbnail: 'https://cycu-bridgeai.github.io/BridgeAI-Learn/images/%E7%B7%B4%E7%BF%92%E5%A0%B4.png',
		url: 'https://cycu-bridgeai.github.io/BridgeAI-Learn/blog/playground',
	})

	const bare = toArticleItem({ path: '/blog/x', title: 't', description: 'd', date: '2026-01-01' }, site)
	assert.equal(bare.thumbnail, null)
	assert.deepEqual(bare.tags, [])
})

test('toVideoItem 產生 YouTube 縮圖與觀看網址', () => {
	assert.deepEqual(toVideoItem({
		path: '/videos/intro-neural-networks',
		title: 'NN',
		description: 'd',
		date: '2026-03-25',
		youtubeId: 'aircAruvnKk',
	}, site), {
		type: 'video',
		slug: 'intro-neural-networks',
		title: 'NN',
		description: 'd',
		date: '2026-03-25',
		tags: [],
		thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg',
		url: 'https://cycu-bridgeai.github.io/BridgeAI-Learn/videos/intro-neural-networks',
		youtubeId: 'aircAruvnKk',
		youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
	})
})

function item(slug: string, date: string): ApiItem {
	return { type: 'article', slug, title: slug, description: '', date, tags: [], thumbnail: null, url: '' }
}

test('sortByDateDesc 新到舊，同日依 slug，且不改原陣列', () => {
	const input = [item('b', '2026-01-01'), item('c', '2026-05-01'), item('a', '2026-01-01')]
	assert.deepEqual(sortByDateDesc(input).map(i => i.slug), ['c', 'a', 'b'])
	assert.deepEqual(input.map(i => i.slug), ['b', 'c', 'a'])
})

test('parseSlugParam 只接受 <slug>.json', () => {
	assert.equal(parseSlugParam('playground.json'), 'playground')
	assert.equal(parseSlugParam('playground'), null)
	assert.equal(parseSlugParam('.json'), null)
	assert.equal(parseSlugParam(undefined), null)
})

test('toListResponse / toItemResponse 包裝格式', () => {
	const items = [item('a', '2026-01-01')]
	assert.deepEqual(toListResponse(items, '2026-09-13T00:00:00.000Z'), {
		apiVersion: API_VERSION,
		generatedAt: '2026-09-13T00:00:00.000Z',
		count: 1,
		items,
	})
	assert.deepEqual(toItemResponse(items[0], 'T'), { apiVersion: 'v1', generatedAt: 'T', item: items[0] })
})

test('renderBrowsePage 連到每個 JSON 並跳脫標題', () => {
	const html = renderBrowsePage(
		[{ ...item('playground', '2026-05-11'), title: '<b>練習場</b>' }],
		[{ ...item('intro-neural-networks', '2026-03-25'), type: 'video' }],
	)
	assert.match(html, /href="items\.json"/)
	assert.match(html, /href="articles\.json"/)
	assert.match(html, /href="videos\.json"/)
	assert.match(html, /href="articles\/playground\.json"/)
	assert.match(html, /href="videos\/intro-neural-networks\.json"/)
	assert.match(html, /&lt;b&gt;練習場&lt;\/b&gt;/)
	assert.doesNotMatch(html, /<b>練習場/)
})
