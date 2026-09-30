// 計概專區純函式：單元驗證、分組排序、圖片規則（app、server、scripts、測試共用，不依賴 Nuxt）

export interface CsUnit {
	id: string
	name: string
	order: number
}

export interface CsUnitGroup<T> {
	unit: CsUnit
	posts: T[]
}

export const CS_IMAGE_MAX_BYTES = 500 * 1024

export function validateUnits(units: unknown): string[] {
	if (!Array.isArray(units))
		return ['_units.yml：units 必須是陣列']
	const errors: string[] = []
	const ids = new Set<string>()
	const orders = new Set<number>()
	units.forEach((unit, i) => {
		const where = `_units.yml 第 ${i + 1} 筆`
		if (typeof unit?.id !== 'string' || !unit.id)
			errors.push(`${where}：缺少 id`)
		if (typeof unit?.name !== 'string' || !unit.name)
			errors.push(`${where}：缺少 name`)
		if (typeof unit?.order !== 'number')
			errors.push(`${where}：缺少 order`)
		if (ids.has(unit?.id))
			errors.push(`_units.yml：重複的 id：${unit.id}`)
		if (orders.has(unit?.order))
			errors.push(`_units.yml：重複的 order：${unit.order}`)
		ids.add(unit?.id)
		orders.add(unit?.order)
	})
	return errors
}

export function validateCsDocs(units: CsUnit[], docs: { file: string, unit?: unknown }[]): string[] {
	const ids = new Set(units.map(u => u.id))
	const errors: string[] = []
	for (const doc of docs) {
		if (typeof doc.unit !== 'string' || !doc.unit)
			errors.push(`${doc.file}：缺少 unit`)
		else if (!ids.has(doc.unit))
			errors.push(`${doc.file}：unit「${doc.unit}」不在 _units.yml 內（可用：${[...ids].join('、')}）`)
	}
	return errors
}

export function groupCsByUnit<T extends { unit: string, date: string }>(units: CsUnit[], docs: T[]): CsUnitGroup<T>[] {
	return [...units]
		.sort((a, b) => a.order - b.order)
		.map(unit => ({
			unit,
			posts: docs.filter(d => d.unit === unit.id).sort((a, b) => b.date.localeCompare(a.date)),
		}))
		.filter(group => group.posts.length > 0)
}

export function checkCsImages(files: { name: string, size: number }[]): string[] {
	const errors: string[] = []
	for (const file of files) {
		if (!/\.(webp|svg)$/i.test(file.name))
			errors.push(`public/images/cs/${file.name}：只允許 .webp 或 .svg`)
		else if (/\.webp$/i.test(file.name) && file.size > CS_IMAGE_MAX_BYTES)
			errors.push(`public/images/cs/${file.name}：${Math.ceil(file.size / 1024)}KB，超過 500KB`)
	}
	return errors
}

export function unitNameOf(units: CsUnit[], id: string): string | undefined {
	return units.find(u => u.id === id)?.name
}
