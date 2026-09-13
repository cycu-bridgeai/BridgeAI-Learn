export default defineEventHandler(async (event) => {
	return toListResponse(await getVideoItems(event), new Date().toISOString())
})
