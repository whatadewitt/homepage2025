// Analytics events, pushed to Google Tag Manager's dataLayer. In GTM one
// trigger catches them all and one GA4 event tag forwards each, with its
// event_params, to Google Analytics; docs/analytics.md has the setup and the
// list of events. Without GTM (local dev, no PUBLIC_GTM_ID) the pushes just
// sit in the array.

type Params = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(event: string, params: Params = {}) {
  const dataLayer = (window.dataLayer ??= []);
  // GTM merges pushes into one data model, so clear the last event's params
  // first; otherwise they'd ride along on the next event.
  dataLayer.push({ event_params: undefined });
  dataLayer.push({ event, event_params: params });
}

// Links and buttons opt in with data-track="<event>" plus data-track-<param>
// attributes, e.g. data-track="share" data-track-network="bluesky".
document.addEventListener("click", (e) => {
  const el = (e.target as Element).closest<HTMLElement>("[data-track]");
  if (!el?.dataset.track) return;
  const params: Params = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key.startsWith("track") && key !== "track" && value !== undefined) {
      params[key.slice(5).toLowerCase()] = value;
    }
  }
  track(el.dataset.track, params);
});
