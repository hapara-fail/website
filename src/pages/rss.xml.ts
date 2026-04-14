import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog');
  const sortedPosts = posts.sort(
    (a, b) => b.data.publishedDate.getTime() - a.data.publishedDate.getTime()
  );

  return rss({
    title: 'hapara.fail — The Takedown',
    description:
      'Technical analyses and guides on defeating edtech surveillance. Deep dives into DNS, ChromeOS forensics, and tool breakdowns from hapara.fail.',
    site: context.site!,
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishedDate,
      description: post.data.description,
      link: `/blog/${post.id}`,
      author: post.data.author,
    })),
    customData: '<language>en-us</language>',
  });
}
