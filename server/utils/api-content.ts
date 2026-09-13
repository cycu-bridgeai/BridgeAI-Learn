import type { H3Event } from 'h3'
import { queryCollection } from '@nuxt/content/server'
import { sortByDateDesc, toArticleItem, toSiteBase, toVideoItem } from './api-items'
import type { ApiItem, SiteContext } from './api-items'

function getSiteContext(event: H3Event): SiteContext {
	const config = useRuntimeConfig(event)
	return {
		siteBase: toSiteBase(config.siteOrigin, config.app.baseURL),
		baseURL: config.app.baseURL,
	}
}

export async function getArticleItems(event: H3Event): Promise<ApiItem[]> {
	const site = getSiteContext(event)
	const docs = await queryCollection(event, 'blog')
		.select('path', 'title', 'description', 'date', 'tags', 'thumbnail')
		.all()
	return sortByDateDesc(docs.map(doc => toArticleItem(doc, site)))
}

export async function getVideoItems(event: H3Event): Promise<ApiItem[]> {
	const site = getSiteContext(event)
	const docs = await queryCollection(event, 'videos')
		.select('path', 'title', 'description', 'date', 'tags', 'youtubeId')
		.all()
	return sortByDateDesc(docs.map(doc => toVideoItem(doc, site)))
}
