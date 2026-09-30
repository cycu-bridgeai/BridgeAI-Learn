import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

// 全站顏色只能定義在 app/assets/css/theme.css，其他檔案一律用語意 class 或 CSS 變數
const root = path.resolve(import.meta.dirname, '../..')
const PALETTE = /\b(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|[1-9]00|950)\b/g
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const RGB = /rgba?\((?!var\()[^)]*\)/g

function findRawColors(text: string): string[] {
	return [...text.matchAll(PALETTE), ...text.matchAll(HEX), ...text.matchAll(RGB)].map(m => m[0])
}

function targets(): string[] {
	const vue = fs.readdirSync(path.join(root, 'app'), { recursive: true })
		.map(String)
		.filter(f => f.endsWith('.vue'))
		.map(f => path.join('app', f))
	return [...vue, 'app/assets/css/main.css', 'tailwind.config.ts']
}

test('findRawColors 抓色名、色碼，放過 rgb(var())', () => {
	assert.deepEqual(findRawColors('text-blue-600 dark:bg-gray-900/40'), ['blue-600', 'gray-900'])
	assert.deepEqual(findRawColors('color: #fff; background: rgba(0,0,0,.5)'), ['#fff', 'rgba(0,0,0,.5)'])
	assert.deepEqual(findRawColors("'rgb(var(--color-ink) / <alpha-value>)' text-white bg-section/10"), [])
})

test('除 theme.css 外不得寫死顏色', () => {
	const offenders = targets()
		.map(file => ({ file, hits: findRawColors(fs.readFileSync(path.join(root, file), 'utf8')) }))
		.filter(r => r.hits.length > 0)
		.map(r => `${r.file}（${r.hits.length}）：${[...new Set(r.hits)].slice(0, 5).join(', ')}`)
	assert.deepEqual(offenders, [])
})
