import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string().optional(),
    featuredImage: z.string().optional(),
    featuredImageAlt: z.string().optional(),
  }),
});

const portfolio = defineCollection({
  type: 'content',
  // Type-check frontmatter using a schema
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    link: z.string().optional(),
    order: z.number().optional(),
  }),
});

export const collections = { blog, portfolio };