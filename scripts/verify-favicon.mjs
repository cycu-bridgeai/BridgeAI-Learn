// 驗證靜態頁面在 GitHub Pages 子路徑下能找到分頁圖示。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const out = path.join(root, '.output/public')
const baseURL = (process.env.NUXT_APP_BASE_URL || '/BridgeAI-Learn/').replace(/\/?$/, '/')
const expectedHref = `${baseURL}favicon.ico`

if (!fs.existsSync(path.join(out, 'favicon.ico'))) {
  console.error('缺少產出的 favicon.ico')
  process.exit(1)
}

for (const route of ['', 'cs/c-setup-troubleshooting']) {
  const page = path.join(out, route, 'index.html')
  const html = fs.readFileSync(page, 'utf8')
  const iconTag = [...html.matchAll(/<link\b[^>]*>/g)]
    .map(match => match[0])
    .find(tag => /\brel="icon"/.test(tag))
  const href = iconTag?.match(/\bhref="([^"]+)"/)?.[1]
  if (href !== expectedHref) {
    console.error(`${route || '首頁'} 的 favicon 應連到 ${expectedHref}，實際為 ${href || '未宣告'}`)
    process.exit(1)
  }
}

console.log(`Favicon 驗證通過：${expectedHref}`)
