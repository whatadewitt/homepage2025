// Dew Drops posts, newest first. Files starting with "_" are templates.

import type { MarkdownInstance } from "astro";

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  featuredImagePosition?: string;
}

export type Post = MarkdownInstance<PostFrontmatter> & { slug: string };

export function getPosts(): Post[] {
  const modules = import.meta.glob<MarkdownInstance<PostFrontmatter>>(
    "../content/blog/*.md",
    { eager: true }
  );

  return Object.entries(modules)
    .map(([file, post]) => ({
      ...post,
      slug: file.split("/").pop()!.replace(/\.md$/, ""),
    }))
    .filter((post) => !post.slug.startsWith("_"))
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

/** Parse "YYYY-MM-DD" as a local date (avoids off-by-one from UTC parsing). */
export function postDate(date: string) {
  const [year, month, day] = date.split("-").map((n) => parseInt(n));
  return new Date(year, month - 1, day);
}

export function formatPostDate(date: string) {
  return postDate(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
