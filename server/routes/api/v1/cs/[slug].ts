export default defineEventHandler(async (event) => {
	const slug = parseSlugParam(getRouterParam(event, 'slug'))
	const item = slug ? (await getCsItems(event)).find(i => i.slug === slug) : undefined
	if (!item)
		throw createError({ statusCode: 404, statusMessage: 'Cs article not found' })
	return toItemResponse(item, new Date().toISOString())
})
