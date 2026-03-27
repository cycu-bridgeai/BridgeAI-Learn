<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-lg font-bold text-gray-900 hover:text-blue-600 transition-colors">
          BridgeAI Learn
        </NuxtLink>
        <nav class="flex items-center gap-6 text-sm font-medium text-gray-600">
          <NuxtLink to="/blog" class="hover:text-blue-600 transition-colors" active-class="text-blue-600">
            Blog
          </NuxtLink>
          <NuxtLink to="/videos" class="hover:text-blue-600 transition-colors" active-class="text-blue-600">
            Videos
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-10">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white mt-auto">
      <div class="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
        © {{ new Date().getFullYear() }} BridgeAI Learn
      </div>
    </footer>
  </div>
</template>
