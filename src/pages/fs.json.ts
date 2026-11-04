// The terminal's filesystem; fetched the first time it opens.
import type { APIRoute } from "astro";
import { siteFs } from "../lib/sitefs";

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await siteFs()), {
    headers: { "Content-Type": "application/json" },
  });
