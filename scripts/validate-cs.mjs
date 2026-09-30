// 建置前驗證計概專區：public/images/cs/ 只允許 webp／svg，webp 每張 ≤500KB
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkCsImages } from '../shared/utils/cs.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const imgDir = path.join(root, 'public/images/cs')
const errors = []

if (fs.existsSync(imgDir)) {
	const files = fs.readdirSync(imgDir).map(name => ({ name, size: fs.statSync(path.join(imgDir, name)).size }))
	errors.push(...checkCsImages(files))
}

if (errors.length > 0) {
	console.error(`計概專區驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log('計概專區驗證通過')
