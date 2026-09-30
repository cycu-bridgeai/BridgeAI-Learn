export default defineEventHandler(async (event) => {
	const [articles, videos, cs] = await Promise.all([getArticleItems(event), getVideoItems(event), getCsItems(event)])
	return toListResponse(sortByDateDesc([...articles, ...videos, ...cs]), new Date().toISOString())
})
