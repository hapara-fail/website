<script>
  import Search from '@lucide/svelte/icons/search';

  let { posts = [], tags = [] } = $props();

  let searchQuery = $state('');
  let activeTag = $state(null);
  
  function escapeRegex(str) {
    if (!str) return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function countOccurrences(str, substr) {
    let count = 0;
    let pos = 0;
    while ((pos = str.indexOf(substr, pos)) !== -1) {
      count++;
      pos += substr.length;
    }
    return count;
  }

  function scorePost(post, terms) {
    let score = 0;
    const titleLower = (post.title || '').toLowerCase();
    const excerptLower = (post.excerpt || '').toLowerCase();
    const tagLower = (post.tag || '').toLowerCase();
    const authorLower = (post.author || '').toLowerCase();
    const bodyLower = (post.body || '').toLowerCase();

    for (const term of terms) {
      if (!term) continue;
      const wordBoundary = new RegExp('\\b' + escapeRegex(term) + '\\b', 'i');

      if (wordBoundary.test(post.title)) score += 100;
      else if (titleLower.includes(term)) score += 60;

      if (tagLower === term) score += 80;
      else if (tagLower.includes(term)) score += 40;

      if (authorLower.includes(term)) score += 30;

      if (wordBoundary.test(post.excerpt)) score += 50;
      else if (excerptLower.includes(term)) score += 25;

      if (bodyLower.includes(term)) {
        const occurrences = Math.min(countOccurrences(bodyLower, term), 10);
        score += 10 + occurrences * 3;
      }
    }
    return score;
  }

  let terms = $derived(searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean));
  let hasQuery = $derived(terms.length > 0);

  let filteredPosts = $derived(
    posts
      .map((post) => ({
        ...post,
        score: hasQuery ? scorePost(post, terms) : 1,
      }))
      .filter((post) => {
        if (activeTag && post.tag !== activeTag) return false;
        if (hasQuery && post.score <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (hasQuery) {
          return b.score - a.score;
        }
        return 0; // maintain original sorting
      })
  );

  function toggleTag(tag) {
    if (activeTag === tag) {
      activeTag = null;
    } else {
      activeTag = tag;
    }
  }

  function handleKeydown(e) {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      document.getElementById('blog-search')?.focus();
    }
    if (e.key === 'Escape' && document.activeElement?.id === 'blog-search') {
      searchQuery = '';
      activeTag = null;
      document.getElementById('blog-search')?.blur();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="blog-search-wrapper">
  <div class="search-wrapper">
    <Search class="search-icon" size={20} strokeWidth={2} aria-hidden="true" />
    <label for="blog-search" class="visually-hidden">Search</label>
    <input
      type="text"
      id="blog-search"
      class="search-input"
      placeholder="Search posts by title, content, or topic..."
      autocomplete="off"
      bind:value={searchQuery}
    />
  </div>

  <div id="blog-tag-chips" class="category-chips-wrapper">
    {#each tags as tag}
      <button 
        class="category-chip" 
        class:active={activeTag === tag}
        onclick={() => toggleTag(tag)}
      >
        {tag}
      </button>
    {/each}
  </div>
</div>

<div id="blog-grid" class="blog-grid">
  {#each filteredPosts as post, i (post.id)}
    <a 
      href={`/blog/${post.id}`} 
      class="blog-card fade-in" 
      data-post-id={post.id}
      style="animation-delay: {i * 30}ms;"
    >
      <div class="blog-card-tag" style="view-transition-name: tag-{post.id}">
        {post.tag}
      </div>
      <h3 style="view-transition-name: title-{post.id}">{post.title}</h3>
      <p class="excerpt">{post.excerpt}</p>
      <div class="read-more">Read More</div>
    </a>
  {/each}
</div>

{#if filteredPosts.length === 0}
  <div id="blog-no-results" class="no-results fade-in">
    No posts found. Try a different search term.
  </div>
{/if}

<style>
  .search-wrapper {
    position: relative;
    margin-bottom: 20px;
  }

  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border-color);
    padding: 16px 20px 16px 50px;
    border-radius: 12px;
    color: var(--text-primary);
    font-size: 1.1rem;
    font-family: inherit;
    transition: all 0.2s ease;
    outline: none;
  }

  .search-input:focus {
    border-color: var(--accent-1);
    box-shadow: 0 0 0 4px rgba(82, 74, 242, 0.15);
    background: rgba(22, 21, 46, 0.8);
  }

  :global(.search-icon) {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--text-secondary);
    pointer-events: none;
    transition: color 0.2s ease;
  }

  .search-input:focus ~ :global(.search-icon) {
    color: var(--accent-1);
  }

  .category-chips-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 32px;
  }

  .category-chips-wrapper:empty {
    display: none;
  }

  .category-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 99px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    color: var(--text-secondary);
    font-family: inherit;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    white-space: nowrap;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .category-chip:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
    transform: translateY(-1px);
  }

  .category-chip.active {
    background: rgba(82, 74, 242, 0.2);
    border-color: var(--accent-1);
    color: #fff;
  }

  .fade-in {
    animation: fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    .search-input {
      font-size: 1rem;
      padding: 14px 18px 14px 44px;
    }
  }
</style>
