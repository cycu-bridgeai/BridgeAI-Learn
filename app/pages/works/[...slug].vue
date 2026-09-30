<script setup lang="ts">
const route = useRoute()
const slug = (route.params.slug as string[]).join('/')

const { data: work } = await useAsyncData(`work-${slug}`, () =>
  queryCollection('works').path(`/works/${slug}`).first()
)

if (!work.value) {
  throw createError({ statusCode: 404, statusMessage: 'Work not found' })
}

useSeoMeta({
  title: () => `${work.value?.title} - BridgeAI Learn`,
  description: () => work.value?.description,
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

const config = useRuntimeConfig()

// 取得本地已預先抓取並編譯好的 HTML 內容
const { data: localHtml } = await useAsyncData(`work-html-${slug}`, async () => {
	if (import.meta.server) {
		try {
			const fs = await import('node:fs/promises')
			const path = await import('node:path')
			const filePath = path.join(process.cwd(), 'public', 'works', `${slug}.html`)
			return await fs.readFile(filePath, 'utf-8')
		} catch (err) {
			console.error(`[SSR] 讀取本地 HTML 檔案失敗 (${slug}):`, err)
		}
	}
	const baseURL = config.app.baseURL === '/' ? '' : config.app.baseURL.replace(/\/$/, '')
	return $fetch<string>(`${baseURL}/works/${slug}.html`)
})

const thumbnailSrc = computed(() => {
  const thumbnail = work.value?.thumbnail
  const baseURL = config.app.baseURL === '/'
    ? ''
    : config.app.baseURL.replace(/\/$/, '')

  if (!thumbnail)
    return undefined

  if (/^(?:[a-z]+:)?\/\//i.test(thumbnail) || thumbnail.startsWith('data:'))
    return thumbnail

  if (config.app.baseURL !== '/' && thumbnail.startsWith(config.app.baseURL))
    return thumbnail

  return `${baseURL}${thumbnail.startsWith('/') ? thumbnail : `/${thumbnail}`}`
})

type TocLink = {
  id: string
  text: string
  children?: TocLink[]
}

const tocLinks = computed<TocLink[]>(() => {
  const body = work.value?.body as { toc?: { links?: TocLink[] } } | undefined
  return body?.toc?.links ?? []
})

const hasUpdate = ref(false)
const isUpdating = ref(false)
const latestHtml = ref('')
const latestReadmeContent = ref('')
const errorMessage = ref('')

const githubInfo = computed(() => {
  const url = work.value?.githubUrl
  if (!url) return null
  const cleanedUrl = url.replace(/(\.git)$/, '')
  const parts = cleanedUrl.split('github.com/')
  if (parts.length < 2) return null
  const repoParts = parts[1].split('/')
  return {
    owner: repoParts[0],
    repo: repoParts[1]
  }
})

// 將 HTML 中的相對路徑轉換為 GitHub 上的絕對路徑，解決破圖問題
const formatHtmlContent = (html: string) => {
	if (!html || !githubInfo.value) return html
	const { owner, repo } = githubInfo.value
	const githubRawBase = `https://raw.githubusercontent.com/${owner}/${repo}/main`
	const githubHtmlBase = `https://github.com/${owner}/${repo}/blob/main`

	// 1. 替換相對圖片 src (排除以 http/https/data:/ 開頭的絕對路徑)
	let formatted = html.replace(/(src=")(?!https?:\/\/|data:|\/)([^"]+)(")/g, (match, p1, p2, p3) => {
		return `${p1}${githubRawBase}/${p2}${p3}`
	})

	// 2. 替換相對連結 href (排除以 http/https/#/ 開頭的連結或錨點)
	formatted = formatted.replace(/(href=")(?!https?:\/\/|#|\/)([^"]+)(")/g, (match, p1, p2, p3) => {
		const isImage = /\.(png|jpe?g|gif|svg|webp)$/i.test(p2)
		const base = isImage ? githubRawBase : githubHtmlBase
		return `${p1}${base}/${p2}${p3}`
	})

	return formatted
}

const checkGitHubUpdate = async () => {
  if (!githubInfo.value) return
  try {
    const { owner, repo } = githubInfo.value
    
    // 取得 GitHub API 的 README 資訊
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (res.ok) {
      const data = await res.json()
      const liveSha = data.sha
      const localSha = work.value?.githubSha
      
      // 比對 SHA，若不同則提示有更新
      if (localSha && liveSha !== localSha) {
        hasUpdate.value = true
        
        // 安全地將 base64 解碼為 UTF-8 中文字串
        if (data.encoding === 'base64' && data.content) {
          const binString = atob(data.content.replace(/\s/g, ''))
          const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0)!)
          latestReadmeContent.value = new TextDecoder().decode(bytes)
        }
      }
    }
  } catch (err) {
    console.error('Error checking GitHub README update:', err)
  }
}

const loadLatestContent = async () => {
  if (!latestReadmeContent.value || isUpdating.value) return
  isUpdating.value = true
  errorMessage.value = ''
  
  try {
    const res = await fetch('https://api.github.com/markdown', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: latestReadmeContent.value,
        mode: 'gfm',
        context: githubInfo.value ? `${githubInfo.value.owner}/${githubInfo.value.repo}` : undefined
      })
    })
    
    if (res.ok) {
      const html = await res.text()
      latestHtml.value = html
      hasUpdate.value = false
    } else {
      throw new Error(`GitHub API returned status ${res.status}`)
    }
  } catch (err: any) {
    console.error('Failed to parse markdown via GitHub API:', err)
    errorMessage.value = '無法將最新 README 編譯成 HTML，可能發送頻率已超載，請稍後再試。'
  } finally {
    isUpdating.value = false
  }
}

// 動態載入 KaTeX 資源，實作 LaTeX 數學公式渲染
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css'
    }
  ],
  script: [
    {
      src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js',
      defer: true
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js',
      defer: true,
      onload: () => {
        renderMath()
      }
    }
  ]
})

const renderMath = () => {
  if (typeof window !== 'undefined' && (window as any).renderMathInElement) {
    (window as any).renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\[', display: true}
      ],
      throwOnError: false
    })
  }
}

// 當 HTML 內容變更時，自動重新渲染公式
watch([localHtml, latestHtml], () => {
  nextTick(() => {
    renderMath()
  })
})

onMounted(() => {
  checkGitHubUpdate()
  // 稍微延遲以確保 KaTeX 腳本完全載入
  setTimeout(renderMath, 600)
})
</script>

<template>
  <TocDrawer v-if="work && tocLinks.length" :links="tocLinks" section="works" />

  <article v-if="work" class="section-works relative left-1/2 w-screen -translate-x-1/2 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-[52rem]">
      <main class="min-w-0">
        <SectionButton to="/works" section="works" class="mb-8">
          Back to Works
        </SectionButton>

        <header class="mb-10">
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="px-2.5 py-0.5 bg-section/10 text-section text-xs font-bold rounded-card shrink-0">
               👤 作者: {{ work.author }}
            </span>
          </div>
          
          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight mb-4">{{ work.title }}</h1>
          <p class="text-lg text-ink-muted mb-6 leading-relaxed">{{ work.description }}</p>

          <!-- Integration buttons inside detail page header -->
          <div v-if="work.demoUrl || work.githubUrl" class="flex flex-wrap gap-3 mb-6">
            <a
              v-if="work.demoUrl"
              :href="work.demoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-5 py-2.5 bg-section hover:bg-section/90 text-white font-semibold rounded-card flex items-center gap-2 transition-all hover:scale-105 shadow-md shadow-section/20 active:scale-95 text-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              造訪 Demo 成果網頁
            </a>
            <a
              v-if="work.githubUrl"
              :href="work.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="px-5 py-2.5 bg-surface-muted hover:bg-surface-muted text-ink font-semibold rounded-card flex items-center gap-2 transition-all hover:scale-105 active:scale-95 border border-line text-sm"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              查看 GitHub 程式碼
            </a>
          </div>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-line">
            <time class="text-sm text-ink-muted">{{ formatDate(work.date) }}</time>

            <div v-if="work.tags?.length" class="flex flex-wrap gap-2">
              <TagChip
                v-for="tag in work.tags"
                :key="tag"
                :tag="tag"
                section="works"
              />
            </div>
          </div>

          <img v-if="thumbnailSrc" :src="thumbnailSrc" :alt="work.title" class="w-full rounded-panel object-cover mt-6" />
        </header>

        <!-- Dynamic Update Notification Banner -->
        <div 
          v-if="hasUpdate || isUpdating || errorMessage" 
          class="mb-8 p-4 rounded-card border transition-all duration-300 shadow-sm"
          :class="[
            errorMessage 
              ? 'bg-error/10 border-error/30 text-error' 
              : 'bg-warning/10 border-warning/30 text-warning'
          ]"
        >
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div 
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                :class="[errorMessage ? 'bg-error/10' : 'bg-warning/10']"
              >
                <span v-if="isUpdating" class="animate-spin text-warning">🌀</span>
                <span v-else-if="errorMessage" class="text-error">⚠️</span>
                <span v-else class="animate-pulse">💡</span>
              </div>
							<div>
								<p class="text-sm font-semibold">
									<span v-if="isUpdating">正在取得最新內容...</span>
									<span v-else-if="errorMessage">{{ errorMessage }}</span>
									<span v-else>本作品已在 GitHub 上更新！</span>
								</p>
								<p class="text-xs opacity-80 mt-0.5">
									<span v-if="isUpdating">取得完成後將自動更新頁面內容。</span>
									<span v-else-if="errorMessage">您可以稍後再試，或繼續閱讀目前的版本。</span>
									<span v-else>您可以點擊按鈕，直接在此頁面閱讀最新版說明。</span>
								</p>
							</div>
						</div>
						<div v-if="!isUpdating" class="flex gap-2 shrink-0 self-end sm:self-auto">
							<button
								v-if="hasUpdate"
								@click="loadLatestContent"
								class="px-3.5 py-1.5 bg-warning hover:bg-warning/90 text-white font-bold text-xs rounded-card shadow transition-all active:scale-95 shrink-0"
							>
								閱讀新版
							</button>
							<button 
								@click="hasUpdate = false; errorMessage = ''" 
								class="px-2.5 py-1.5 bg-transparent hover:bg-surface-muted border border-line text-xs font-medium rounded-card shrink-0"
							>
								暫時不用
							</button>
						</div>
          </div>
        </div>

        <div v-if="latestHtml" class="prose prose-gray dark:prose-invert prose-lg max-w-none" v-html="formatHtmlContent(latestHtml)" />
        <div v-else-if="localHtml" class="prose prose-gray dark:prose-invert prose-lg max-w-none" v-html="formatHtmlContent(localHtml)" />
        <div v-else class="prose prose-gray dark:prose-invert prose-lg max-w-none">
          <ContentRenderer :value="work" />
        </div>
      </main>
    </div>
  </article>
</template>
