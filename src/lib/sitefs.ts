// The site as folders and files for the terminal (scripts/console.ts), served
// as /fs.json. Folder names match the paths the pages print: ~/dew-drops,
// ~/projects, ~/talks.

import { getPosts, formatPostDate } from "./posts";
import { getProjects, getTalks, isoDate } from "./entries";

/** A post, project or talk: a folder in the terminal. README.md holds the
 * summary (plus a project's write-up); a talk's notes are notes.md, matching
 * the prompts on their pages. */
export interface FsPage {
  /** Slug. */
  name: string;
  href: string;
  title: string;
  /** Date, tag or event: one short mono line. */
  meta: string;
  summary: string;
  /** A project's write-up: the markdown under `$ cat README.md`. */
  readme?: string;
  /** A talk's notes: the markdown under `$ cat notes.md`. */
  notes?: string;
}

export interface FsDir {
  name: string;
  href: string;
  pages: FsPage[];
}

/** Markdown as `cat` would print it, minus HTML comments (drafting notes). */
function source(body: string | undefined) {
  const text = (body ?? "").replace(/<!--[\s\S]*?-->/g, "").replace(/\n{3,}/g, "\n\n").trim();
  return text || undefined;
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
        readme: source(p.body),
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
        notes: source(t.body),
      })),
    },
  ];
}
