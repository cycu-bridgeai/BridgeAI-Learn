// 計概專區純函式：圖片規則（app、server、scripts、測試共用，不依賴 Nuxt）

export const CS_IMAGE_MAX_BYTES = 500 * 1024

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
