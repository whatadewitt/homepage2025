// Talks and projects: sorting and embed helpers shared by their pages.

import { getCollection } from "astro:content";

export async function getTalks() {
  const talks = await getCollection("talks");
  return talks.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** A talk's slide images, made by scripts/talk-slides.py. */
export interface Deck {
  /** Size of the largest image; all slides in a deck share it. */
  width: number;
  height: number;
  widths: number[];
  pdf: string;
  /** One per slide, in order. */
  alts: string[];
}

const decks = import.meta.glob<Deck>("../data/slides/*.json", {
  eager: true,
  import: "default",
});

export function getDeck(slug: string): Deck | undefined {
  return decks[`../data/slides/${slug}.json`];
}

export async function getProjects() {
  const projects = await getCollection("projects");
  return projects.sort((a, b) => a.data.order - b.data.order);
}

/** "YYYY-MM-DD" for a talk date (frontmatter dates are UTC midnight). */
export function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** An embeddable URL for slides: a PDF, or a Google Slides deck. */
export function slidesEmbed(url: string): string | null {
  if (/\.pdf($|[?#])/i.test(url)) return url;
  const google = url.match(/docs\.google\.com\/presentation\/d\/([\w-]+)/);
  if (google) return `https://docs.google.com/presentation/d/${google[1]}/embed`;
  return null;
}

/** An embeddable URL for a YouTube or Vimeo video. */
export function videoEmbed(url: string): string | null {
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}
