export default defineEventHandler(async (event) => {
	return toListResponse(await getCsItems(event), new Date().toISOString())
})
