// 驗證 generate 產出的計概專區頁面：Blog 列表排除 cs、tag 頁包含 cs、/cs 有 tag 篩選，CI 部署前執行
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'yaml'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, process.argv[2] ?? '.output/public')
const csDir = path.join(root, 'content/cs')
const errors = []

function check(ok, message) {
	if (!ok)
		errors.push(message)
}

function readPage(rel) {
	const file = path.join(out, rel, 'index.html')
	if (!fs.existsSync(file)) {
		errors.push(`缺頁面：${rel || '/'}/index.html`)
		return ''
	}
	return fs.readFileSync(file, 'utf8')
}

function escapeHtml(text) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

const docs = fs.readdirSync(csDir)
	.filter(file => file.endsWith('.md'))
	.map((file) => {
		const fm = parse(fs.readFileSync(path.join(csDir, file), 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/)[1])
		return { ...fm, date: String(fm.date), slug: file.replace(/\.md$/, ''), html: escapeHtml(fm.title) }
	})

const csPage = readPage('cs')
const blogPage = readPage('blog')
const homePage = readPage('')

for (const doc of docs) {
	check(!blogPage.includes(doc.html), `Blog 列表不應出現 cs 文章：${doc.title}`)
	check(csPage.includes(doc.html), `/cs 缺文章：${doc.title}`)
	check(readPage(`cs/${doc.slug}`).includes(doc.html), `/cs/${doc.slug} 缺標題：${doc.title}`)
	for (const tag of doc.tags ?? [])
		check(readPage(`tags/${tag}`).includes(doc.html), `/tags/${tag} 缺 cs 文章：${doc.title}`)
}

// /cs 的 tag 篩選：每個 tag 至少出現兩次（篩選按鈕＋卡片上的 tag）
for (const tag of new Set(docs.flatMap(doc => doc.tags ?? [])))
	check(csPage.split(`#${escapeHtml(tag)}`).length - 1 >= 2, `/cs 缺 tag 篩選按鈕：#${tag}`)

const newest = [...docs].sort((a, b) => b.date.localeCompare(a.date))[0]
if (newest)
	check(homePage.includes(newest.html), `首頁計概最新缺：${newest.title}`)

if (errors.length > 0) {
	console.error(`計概專區頁面驗證失敗（${errors.length} 項）：\n- ${errors.join('\n- ')}`)
	process.exit(1)
}
console.log(`計概專區頁面驗證通過：${docs.length} 篇`)
