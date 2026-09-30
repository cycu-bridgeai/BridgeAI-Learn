<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

onMounted(() => {
  // Check localStorage for theme preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else {
    // Use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    if (prefersDark) {
      document.documentElement.classList.add('dark')
    }
  }
})

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>

<template>
  <div class="min-h-screen bg-page transition-colors duration-300 flex flex-col">
    <header class="bg-header border-b border-line sticky top-0 z-40 transition-colors duration-300">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg sm:text-xl font-bold text-ink hover:text-section transition-colors">
          BridgeAI Learn
        </NuxtLink>
        <nav class="flex items-center gap-4 sm:gap-6 text-sm font-medium text-ink-muted">
          <NuxtLink to="/blog" class="hidden sm:inline hover:text-section transition-colors" active-class="text-section">
            Blog
          </NuxtLink>
          <NuxtLink to="/cs" class="hidden sm:inline hover:text-section transition-colors" active-class="text-section">
            計概
          </NuxtLink>
          <NuxtLink to="/videos" class="hidden sm:inline hover:text-section transition-colors" active-class="text-section">
            Videos
          </NuxtLink>
          <NuxtLink to="/works" class="hidden sm:inline hover:text-section transition-colors" active-class="text-section">
            Works
          </NuxtLink>
          <!-- Theme toggle button -->
          <button 
            @click="toggleTheme"
            class="p-2 rounded-card hover:bg-surface-muted transition-colors duration-200"
            :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
          >
            <svg v-if="isDark" class="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg v-else class="w-5 h-5 text-ink" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.121l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM7 11a1 1 0 100-2H5a1 1 0 100 2h2zm-4.536.464a1 1 0 001.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM17 17a1 1 0 100-2h-2a1 1 0 100 2h2z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300">
      <slot />
    </main>

    <footer class="border-t border-line bg-header mt-auto transition-colors duration-300">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-ink-muted">
        © {{ new Date().getFullYear() }} BridgeAI Learn
      </div>
    </footer>
  </div>
</template>

