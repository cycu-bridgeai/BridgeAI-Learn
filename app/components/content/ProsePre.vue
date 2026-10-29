<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		code?: string
		language?: string | null
		filename?: string | null
		highlights?: number[]
		meta?: string | null
		class?: string | null
	}>(),
	{
		code: '',
		language: null,
		filename: null,
		highlights: () => [],
		meta: null,
		class: null,
	},
)

// 複製狀態：'idle' | 'copied' | 'error'
const copyStatus = ref<'idle' | 'copied' | 'error'>('idle')
let resetTimer: ReturnType<typeof setTimeout> | null = null

const label = computed(() => {
	if (copyStatus.value === 'copied') return '已複製'
	if (copyStatus.value === 'error') return '複製失敗'
	return '複製'
})

// 複製原始程式碼本身；只去掉解析時補上的結尾換行，縮排照原樣（空格或 Tab 都不轉換）
function getSourceCode(raw: string): string {
	return raw.endsWith('\n') ? raw.slice(0, -1) : raw
}

async function copy() {
	try {
		if (navigator?.clipboard?.writeText) {
			const textToCopy = getSourceCode(props.code)
			await navigator.clipboard.writeText(textToCopy)
			copyStatus.value = 'copied'
		} else {
			copyStatus.value = 'error'
		}
	} catch {
		copyStatus.value = 'error'
	}

	if (resetTimer) clearTimeout(resetTimer)
	resetTimer = setTimeout(() => {
		copyStatus.value = 'idle'
	}, 2000)
}

onUnmounted(() => {
	if (resetTimer) clearTimeout(resetTimer)
})
</script>

<template>
	<div class="prose-pre-wrapper">
		<button
			type="button"
			class="copy-btn"
			:class="{
				'is-copied': copyStatus === 'copied',
				'is-error': copyStatus === 'error',
			}"
			:aria-label="label"
			@click="copy"
		>
			{{ label }}
		</button>
		<pre :class="$props.class"><slot /></pre>
	</div>
</template>

<style scoped>
.prose-pre-wrapper {
	position: relative;
	margin-top: 1.7142857em;
	margin-bottom: 1.7142857em;
}

/* 覆寫 pre 的預設 margin 並預留頂部空間，避免按鈕遮擋首行程式碼 */
.prose-pre-wrapper pre {
	margin: 0;
	padding-top: 2.75rem;
}

.copy-btn {
	position: absolute;
	top: 0.5rem;
	right: 0.5rem;
	z-index: 5;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-family: var(--font-sans);
	font-size: 0.75rem;
	line-height: 1rem;
	padding: 0.25rem 0.5rem;
	border-radius: var(--radius-card);
	border: 1px solid rgb(var(--color-code-line));
	background-color: rgb(var(--color-code-surface));
	color: rgb(var(--color-code-ink));
	cursor: pointer;
	user-select: none;
	transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.copy-btn:hover {
	background-color: rgb(var(--color-line) / 0.5);
}

.copy-btn:focus-visible {
	outline: 2px solid rgb(var(--color-cs));
	outline-offset: 2px;
}

.copy-btn.is-copied {
	border-color: rgb(var(--color-success));
	color: rgb(var(--color-success));
}

.copy-btn.is-error {
	border-color: rgb(var(--color-error));
	color: rgb(var(--color-error));
}

@media (prefers-reduced-motion: reduce) {
	.copy-btn {
		transition: none;
	}
}

</style>
