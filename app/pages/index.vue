<script setup lang="ts">
const { data: latestPosts } = await useAsyncData('home-blog', () =>
  queryCollection('blog').order('date', 'DESC').limit(3).all()
)

const { data: latestCs } = await useAsyncData('home-cs', () =>
  queryCollection('cs').order('date', 'DESC').limit(3).all()
)

const { data: latestVideos } = await useAsyncData('home-videos', () =>
  queryCollection('videos').order('date', 'DESC').limit(3).all()
)

const { data: latestWorks } = await useAsyncData('home-works', () =>
  queryCollection('works').order('date', 'DESC').limit(3).all()
)
</script>

<template>
  <div>
    <!-- Hero Section with Enhanced Background and Animations -->
    <section class="relative py-12 sm:py-20 lg:py-24 px-4 overflow-hidden bg-page transition-colors duration-300">
      <!-- Gradient Background -->
      <div class="absolute inset-0 -z-10">
        <div class="absolute inset-0 bg-gradient-to-br from-blog/10 via-works/10 to-videos/10 transition-colors duration-300" />
        <!-- Animated subtle circles -->
        <div class="absolute top-10 right-10 w-40 sm:w-72 h-40 sm:h-72 bg-blog/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div class="absolute -bottom-8 left-20 w-40 sm:w-72 h-40 sm:h-72 bg-works/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style="animation-delay: 2s" />
      </div>

      <!-- Decorative SVG Elements -->
      <div class="absolute top-0 left-0 w-20 sm:w-40 h-20 sm:h-40 opacity-10 dark:opacity-20 text-ink">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="1" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" stroke-width="1" />
        </svg>
      </div>
      <div class="absolute bottom-0 right-0 w-20 sm:w-40 h-20 sm:h-40 opacity-10 dark:opacity-20 text-ink">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dots)" />
        </svg>
      </div>

      <!-- Main Content -->
      <div class="relative text-center max-w-3xl mx-auto">
        <!-- Animated Title -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-ink mb-4 sm:mb-6 animate-fadeInUp transition-colors duration-300">
          BridgeAI Learn
        </h1>

        <!-- Animated Subtitle -->
        <p class="text-base sm:text-lg lg:text-xl text-ink-muted max-w-2xl mx-auto mb-6 sm:mb-8 leading-relaxed animate-fadeInUp animation-delay-200 transition-colors duration-300">
          Tutorials, articles, and videos on AI concepts and practical learning.
        </p>

		<!-- Animated Buttons -->
		<div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 animate-fadeInUp animation-delay-400">
			<NuxtLink 
				to="/blog" 
				class="section-blog px-6 sm:px-8 py-2.5 sm:py-3.5 bg-surface text-ink font-semibold rounded-card border-2 border-line hover:border-section hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95 text-sm sm:text-base"
			>
				Read Blog
			</NuxtLink>
			<NuxtLink 
				to="/videos" 
				class="section-videos px-6 sm:px-8 py-2.5 sm:py-3.5 bg-surface text-ink font-semibold rounded-card border-2 border-line hover:border-section hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95 text-sm sm:text-base"
			>
				Watch Videos
			</NuxtLink>
			<NuxtLink 
				to="/works" 
				class="section-works px-6 sm:px-8 py-2.5 sm:py-3.5 bg-surface text-ink font-semibold rounded-card border-2 border-line hover:border-section hover:shadow-glow hover:scale-105 transition-all duration-300 active:scale-95 text-sm sm:text-base"
			>
				View Works
			</NuxtLink>
		</div>
      </div>

      <!-- Decorative bottom line with subtle animation -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blog to-transparent opacity-30 dark:opacity-20" />
    </section>

    <!-- Latest Posts - Bento Grid Style -->
    <section v-if="latestPosts?.length" class="section-blog mb-10 sm:mb-14 bg-page py-6 sm:py-0 mt-10 sm:mt-16">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-ink transition-colors duration-300">Latest Articles</h2>
        <SectionButton to="/blog" section="blog">View all →</SectionButton>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <PostCard v-for="post in latestPosts" :key="post.path" :post="post" />
      </div>
    </section>

    <!-- Divider -->
    <div v-if="latestCs?.length" class="my-12 sm:my-16">
      <div class="h-1 bg-gradient-to-r from-transparent via-line to-transparent rounded" />
    </div>

    <!-- Latest CS -->
    <section v-if="latestCs?.length" class="section-cs bg-page py-6 sm:py-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-ink transition-colors duration-300">計概最新</h2>
        <SectionButton to="/cs" section="cs">View all →</SectionButton>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <PostCard v-for="post in latestCs" :key="post.path" :post="post" section="cs" />
      </div>
    </section>

    <!-- Divider -->
    <div class="my-12 sm:my-16">
      <div class="h-1 bg-gradient-to-r from-transparent via-line to-transparent rounded" />
    </div>

    <!-- Latest Videos -->
    <section v-if="latestVideos?.length" class="section-videos bg-page py-6 sm:py-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-ink transition-colors duration-300">Latest Videos</h2>
        <SectionButton to="/videos" section="videos">View all →</SectionButton>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <VideoCard v-for="video in latestVideos" :key="video.path" :video="video" />
      </div>
    </section>

    <!-- Divider -->
    <div v-if="latestWorks?.length" class="my-12 sm:my-16">
      <div class="h-1 bg-gradient-to-r from-transparent via-line to-transparent rounded" />
    </div>

    <!-- Latest Works -->
    <section v-if="latestWorks?.length" class="section-works bg-page py-6 sm:py-0">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl sm:text-2xl font-bold text-ink transition-colors duration-300">Latest Student Works</h2>
        <SectionButton to="/works" section="works">View all →</SectionButton>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <WorkCard v-for="work in latestWorks" :key="work.path" :work="work" />
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}
</style>
