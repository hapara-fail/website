import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    publishedDate: z.coerce.date(),
    modifiedDate: z.coerce.date(),
    tag: z.string(),
    excerpt: z.string(),
    credits: z.string().optional(),
  }),
});

export const collections = { blog };
