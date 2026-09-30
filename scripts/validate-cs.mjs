// 建置前驗證計概專區：unit 必須在 _units.yml 內、圖片須為 webp／svg 且 ≤500KB
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'
import { checkCsImages, validateCsDocs, validateUnits } from '../shared/utils/cs.ts'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const csDir = path.join(root, 'content/cs')
const imgDir = path.join(root, 'public/images/cs')
const unitsFile = path.join(csDir, '_units.yml')
const errors = []

function readFrontmatter(file) {
	const match = fs.readFileSync(file, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)
	return match ? (parse(match[1]) ?? {}) : {}
}

if (!fs.existsSync(unitsFile)) {
	errors.push('缺檔案：content/cs/_units.yml')
}
else {
	const units = parse(fs.readFileSync(unitsFile, 'utf8'))?.units
	errors.push(...validateUnits(units))
	if (errors.length === 0) {
		const docs = fs.readdirSync(csDir, { recursive: true })
			.map(String)
			.filter(file => file.endsWith('.md'))
			.map(file => ({ file: `content/cs/${file}`, unit: readFrontmatter(path.join(csDir, file)).unit }))
		errors.push(...validateCsDocs(units, docs))
	}
}

if (fs.existsSync(imgDir)) {
	const files = fs.readdirSync(imgDir).map(name => ({ name, size: fs.statSync(path.join(imgDir, name)).size }))
	errors.push(...checkCsImages(files))
}

if (errors.length > 0) {
	console.error(`計概專區驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log('計概專區驗證通過')
