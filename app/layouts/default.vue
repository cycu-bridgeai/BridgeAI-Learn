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
  <div class="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex flex-col">
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          BridgeAI Learn
        </NuxtLink>
        <nav class="flex items-center gap-4 sm:gap-6 text-sm font-medium text-gray-600 dark:text-gray-200">
          <NuxtLink to="/blog" class="hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors" active-class="text-blue-600 dark:text-blue-400">
            Blog
          </NuxtLink>
          <NuxtLink to="/videos" class="hidden sm:inline hover:text-blue-600 dark:hover:text-blue-400 transition-colors" active-class="text-blue-600 dark:text-blue-400">
            Videos
          </NuxtLink>
          <!-- Theme toggle button -->
          <button 
            @click="toggleTheme"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
          >
            <svg v-if="isDark" class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.121l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM7 11a1 1 0 100-2H5a1 1 0 100 2h2zm-4.536.464a1 1 0 001.414-1.414l-.707-.707a1 1 0 10-1.414 1.414l.707.707zM17 17a1 1 0 100-2h-2a1 1 0 100 2h2z" clip-rule="evenodd" />
            </svg>
          </button>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-colors duration-300">
      <slot />
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto transition-colors duration-300">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
        © {{ new Date().getFullYear() }} BridgeAI Learn
      </div>
    </footer>
  </div>
</template>

