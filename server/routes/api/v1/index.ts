export default defineEventHandler(async (event) => {
	const [articles, videos] = await Promise.all([getArticleItems(event), getVideoItems(event)])
	setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
	return renderBrowsePage(articles, videos)
})
