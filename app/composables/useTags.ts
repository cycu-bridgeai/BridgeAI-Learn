/**
 * useTags Composable
 * 
 * Aggregates and manages tags from blog and video collections.
 * Provides methods for collecting all unique tags and filtering content by tag.
 */

export const useTags = () => {
  /**
   * Collect all unique tags from both blog and video collections
   * @returns {Promise<string[]>} Array of unique tags sorted alphabetically
   */
  const collectTags = async (): Promise<string[]> => {
    const [blogs, videos, works] = await Promise.all([
      queryCollection('blog').all(),
      queryCollection('videos').all(),
      queryCollection('works').all(),
    ])

    // Aggregate all tags into a Set for deduplication
    const tagsSet = new Set<string>()
    
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => tagsSet.add(tag))
      }
    })

    videos.forEach(video => {
      if (video.tags && Array.isArray(video.tags)) {
        video.tags.forEach(tag => tagsSet.add(tag))
      }
    })

    works.forEach(work => {
      if (work.tags && Array.isArray(work.tags)) {
        work.tags.forEach(tag => tagsSet.add(tag))
      }
    })

    // Convert to sorted array
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b))
  }

  /**
   * Filter content (blogs + videos + works) by a specific tag
   * @param {string} tag - The tag to filter by
   * @returns {Promise<Object>} Object containing filtered blogs, videos, works, and total count
   */
  const getContentByTag = async (tag: string) => {
    // Fetch all content from both collections
    const [allBlogs, allVideos, allWorks] = await Promise.all([
      queryCollection('blog').order('date', 'DESC').all(),
      queryCollection('videos').order('date', 'DESC').all(),
      queryCollection('works').order('date', 'DESC').all(),
    ])

    // Filter by tag locally (safer approach for tag arrays)
    const blogs = allBlogs.filter(blog => 
      blog.tags && Array.isArray(blog.tags) && blog.tags.includes(tag)
    )
    
    const videos = allVideos.filter(video => 
      video.tags && Array.isArray(video.tags) && video.tags.includes(tag)
    )

    const works = allWorks.filter(work => 
      work.tags && Array.isArray(work.tags) && work.tags.includes(tag)
    )

    return {
      blogs,
      videos,
      works,
      total: blogs.length + videos.length + works.length,
    }
  }

  return {
    collectTags,
    getContentByTag,
  }
}
