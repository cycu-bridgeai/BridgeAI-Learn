export default defineEventHandler(async (event) => {
	return toListResponse(await getArticleItems(event), new Date().toISOString())
})
