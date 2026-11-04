// The site as folders and files for the terminal (scripts/console.ts), served
// as /fs.json. Folder names match the paths the pages print: ~/dew-drops,
// ~/projects, ~/talks.

import { getPosts, formatPostDate } from "./posts";
import { getProjects, getTalks, isoDate } from "./entries";

/** A post, project or talk: a folder in the terminal, with its summary as
 * README.md inside. */
export interface FsPage {
  /** Slug. */
  name: string;
  href: string;
  title: string;
  /** Date, tag or event: one short mono line. */
  meta: string;
  summary: string;
}

export interface FsDir {
  name: string;
  href: string;
  pages: FsPage[];
}

export async function siteFs(): Promise<FsDir[]> {
  const [projects, talks] = await Promise.all([getProjects(), getTalks()]);
  return [
    {
      name: "dew-drops",
      href: "/dew-drops",
      pages: getPosts().map((p) => ({
        name: p.slug,
        href: `/dew-drops/${p.slug}`,
        title: p.frontmatter.title,
        meta: formatPostDate(p.frontmatter.date),
        summary: p.frontmatter.excerpt ?? "",
      })),
    },
    {
      name: "projects",
      href: "/projects",
      pages: projects.map((p) => ({
        name: p.id,
        href: `/projects/${p.id}`,
        title: p.data.title,
        meta: p.data.tag,
        summary: p.data.summary,
      })),
    },
    {
      name: "talks",
      href: "/speaking",
      pages: talks.map((t) => ({
        name: t.id,
        href: `/speaking/${t.id}`,
        title: t.data.title,
        meta: `${t.data.event} · ${isoDate(t.data.date)}`,
        summary: t.data.summary,
      })),
    },
  ];
}
