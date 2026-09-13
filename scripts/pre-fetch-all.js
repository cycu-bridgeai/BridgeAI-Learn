import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Colors for console output
const colors = {
	reset: '\x1b[0m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	cyan: '\x1b[36m'
}

async function preFetchAll() {
	const worksDir = path.join(__dirname, '../content/works')
	
	// Create works directory if not exists
	if (!fs.existsSync(worksDir)) {
		console.log(`${colors.yellow}提示: ${worksDir} 目錄不存在，正在自動創建...${colors.reset}`)
		fs.mkdirSync(worksDir, { recursive: true })
		return
	}

	const files = fs.readdirSync(worksDir).filter(file => file.endsWith('.md'))

	if (files.length === 0) {
		console.log(`${colors.cyan}提示: 目前 works 目錄下無任何 md 檔案。${colors.reset}`)
		return
	}

	console.log(`${colors.cyan}=== 啟動學生作品 README 自動抓取與填入作業 ===${colors.reset}`)

	const headers = {
		'User-Agent': 'BridgeAI-Learn-Fetcher-App'
	}
	if (process.env.GITHUB_TOKEN) {
		headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
	}

	for (const file of files) {
		const filePath = path.join(worksDir, file)
		const content = fs.readFileSync(filePath, 'utf-8')

		// Split frontmatter and body
		// A standard markdown file structure:
		// ---
		// yaml frontmatter
		// ---
		// body content
		const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n[\s\S]*)?$/)
		
		if (!match) {
			continue // Skip files without proper frontmatter
		}

		const frontmatterText = match[1]
		const bodyText = (match[2] || '').trim()

		// Parse githubUrl from frontmatter using regex
		const urlMatch = frontmatterText.match(/githubUrl:\s*["']?(https?:\/\/[^\s"']+)["']?/)
		
		if (!urlMatch) {
			continue // Skip files without a githubUrl configured
		}

		const githubUrl = urlMatch[1].trim()

		// Parse repository owner and name
		let owner = ''
		let repo = ''

		try {
			if (githubUrl.includes('github.com')) {
				const cleanedUrl = githubUrl.replace(/(\.git)$/, '')
				const urlParts = cleanedUrl.split('github.com/')[1].split('/')
				owner = urlParts[0]
				repo = urlParts[1]
			} else {
				console.log(`${colors.red}此 URL 格式不支援自動抓取: ${githubUrl}${colors.reset}`)
				continue
			}
		} catch (err) {
			console.log(`${colors.red}解析 ${githubUrl} 失敗: ${err.message}${colors.reset}`)
			continue
		}

		// 檢查本地是否已有預先編譯好的 HTML 檔案
		const htmlFilePath = path.join(__dirname, '../public/works', file.replace(/\.md$/, '.html'))
		const hasLocalHtml = fs.existsSync(htmlFilePath)

		// 檢查本地 md 中的 githubSha
		const shaMatch = frontmatterText.match(/githubSha:\s*["']?([a-zA-Z0-9]+)["']?/)
		const localSha = shaMatch ? shaMatch[1] : ''

		try {
			// Fetch README metadata from GitHub API (contains latest SHA)
			const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
			
			if (readmeRes.ok) {
				const readmeData = await readmeRes.json()
				const liveSha = readmeData.sha || ''

				// 比對 SHA，若一致且本地已有 HTML 檔案，則直接跳過
				if (hasLocalHtml && localSha === liveSha) {
					console.log(`${colors.green}✔ [${file}] 內容與 HTML 一致，跳過更新。${colors.reset}`)
					continue
				}

				console.log(`${colors.yellow}偵測到作品 [${file}] 有更新。正在從 GitHub 載入...${colors.reset}`)

				let readmeContent = ''
				if (readmeData.encoding === 'base64' && readmeData.content) {
					readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8')
				} else {
					readmeContent = readmeData.content || ''
				}

				// 調用 GitHub Markdown API 來取得渲染後的 HTML
				const markdownRes = await fetch('https://api.github.com/markdown', {
					method: 'POST',
					headers: {
						...headers,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						text: readmeContent,
						mode: 'gfm',
						context: `${owner}/${repo}`
					})
				})

				if (!markdownRes.ok) {
					console.log(`${colors.red}✖ 轉譯 Markdown 失敗 (${markdownRes.status})${colors.reset}`)
					continue
				}

				const readmeHtml = await markdownRes.text()

				// 確保 public/works 目錄存在
				const publicWorksDir = path.join(__dirname, '../public/works')
				if (!fs.existsSync(publicWorksDir)) {
					fs.mkdirSync(publicWorksDir, { recursive: true })
				}

				// 移除舊的 readmeLength 欄位，並寫入/更新 githubSha
				let finalFrontmatter = frontmatterText
					.replace(/readmeLength:\s*\d+\r?\n?/, '') // 移除舊的字數紀錄
					.trim()

				if (!finalFrontmatter.includes('githubSha:')) {
					finalFrontmatter = `${finalFrontmatter}\ngithubSha: "${liveSha}"`
				} else {
					finalFrontmatter = finalFrontmatter.replace(/githubSha:\s*["']?[a-zA-Z0-9]+["']?/, `githubSha: "${liveSha}"`)
				}

				// 1. 寫回 md 檔案，但正文部分留空
				const updatedContent = `---\n${finalFrontmatter}\n---`
				fs.writeFileSync(filePath, updatedContent, 'utf-8')

				// 2. 寫入 HTML 到 public 目錄
				fs.writeFileSync(htmlFilePath, readmeHtml.trim(), 'utf-8')
				
				console.log(`${colors.green}✔ [${file}] 成功抓取，HTML 與設定檔已分離寫入！ (SHA: ${liveSha})${colors.reset}`)
			} else {
				console.log(`${colors.red}✖ 抓取失敗 (${readmeRes.status})。請確認 repo 是否為公開、或 URL 是否正確。${colors.reset}`)
			}
		} catch (error) {
			console.log(`${colors.red}✖ 抓取時發生錯誤: ${error.message}${colors.reset}`)
		}
	}

	console.log(`${colors.cyan}=== 自動填入工作已結束 ===${colors.reset}\n`)
}

preFetchAll()
