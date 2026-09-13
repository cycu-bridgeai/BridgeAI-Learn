export default defineEventHandler(async (event) => {
	const [articles, videos] = await Promise.all([getArticleItems(event), getVideoItems(event)])
	return toListResponse(sortByDateDesc([...articles, ...videos]), new Date().toISOString())
})
