export default defineEventHandler(async (event) => {
	const slug = parseSlugParam(getRouterParam(event, 'slug'))
	const item = slug ? (await getVideoItems(event)).find(i => i.slug === slug) : undefined
	if (!item)
		throw createError({ statusCode: 404, statusMessage: 'Video not found' })
	return toItemResponse(item, new Date().toISOString())
})
