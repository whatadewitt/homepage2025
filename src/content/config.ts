import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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

// Fields shared by talks and projects: both render with EntryLayout.
// `slides` is a PDF in /public or a Google Slides link (both embed); any other
// URL is shown as a link. `video` embeds YouTube or Vimeo.
const entry = {
  title: z.string(),
  /** One or two sentences for lists and the top of the page. */
  summary: z.string(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  /** CSS object-position for the page image, e.g. "top" or "50% 65%". */
  imagePosition: z.string().optional(),
  slides: z.string().optional(),
  video: z.string().url().optional(),
};

// One markdown file per talk in src/content/talks/. Files starting with "_"
// are ignored (see _template.md). The body holds your notes.
const talks = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/talks' }),
  schema: z.object({
    ...entry,
    event: z.string(),
    date: z.coerce.date(),
    location: z.string().optional(),
  }),
});

// One markdown file per project in src/content/projects/. The body is the
// write-up shown on the project's page.
const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: z.object({
    ...entry,
    /** Short mono tag, e.g. "open source" or "game · 2026". */
    tag: z.string(),
    /** One line for the homepage card. */
    blurb: z.string(),
    /** Lower comes first. */
    order: z.number().default(99),
    /** Live site or docs. */
    link: z.string().url().optional(),
    /** Source repo. */
    source: z.string().url().optional(),
    /** Slug of a related Dew Drops post. */
    post: z.string().optional(),
    /** Image for the /projects list, if `image` doesn't crop well there. */
    thumbnail: z.string().optional(),
    /** CSS object-position for the list image, e.g. "top" or "50% 20%". */
    thumbnailPosition: z.string().optional(),
  }),
});

export const collections = { blog, talks, projects };
