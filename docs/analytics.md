# Analytics

The site loads Google Tag Manager on every page when `PUBLIC_GTM_ID` is set
(the deploy sets it from the `GTM_ID` secret). Page views come from whatever
GA4 tag the container already has; every page is a real page load.

On top of that, the site pushes its own events to `dataLayer` through
`track()` in `src/scripts/track.ts`. Each push looks like:

```js
{ event: "slide_change", event_params: { talk: "font-donts", slide: 4 } }
```

GTM catches them all with one trigger and forwards each to GA4 with one tag.

## Events

| Event | Params | When |
| --- | --- | --- |
| `theme_change` | `theme` | A theme is picked from the menu |
| `terminal_mode` | `state` (on/off) | The "go terminal" switch is flipped |
| `terminal_open` / `terminal_hide` | | The docked terminal is raised or lowered |
| `terminal_command` | `command`, `input` (typed/tapped) | A command runs. Only the command name, never its arguments; anything that isn't a command is `unknown` |
| `easter_egg` | `name` (claude/doom/sudo) | An easter egg is found |
| `doom_end` | `seconds`, `result` (quit/error) | A game of Doom ends |
| `slide_change` | `talk`, `slide` | A deck settles on a new slide |
| `deck_complete` | `talk`, `slides` | A deck reaches its last slide (once per page view) |
| `slides_download` | `talk` | "download pdf" is clicked |
| `cta_click` | `label` | A button (`Button.astro`) is clicked, e.g. "Book me to speak" |
| `share` | `network` | A share link or "copy link" on a post is clicked |

Links and buttons can opt in without code: `data-track="<event>"` plus
`data-track-<param>="<value>"` attributes.

GA4's enhanced measurement (turn it on in GA4 under Admin → Data streams)
already covers outbound links, file downloads and scroll depth, so the site
doesn't send those.

## GTM setup

`docs/gtm-site-events.json` is a container import with:

- **GA4 Measurement ID**: a constant variable. Set it to your GA4
  measurement ID (`G-…`) after importing.
- **DLV - event_params.\***: a data layer variable per event param.
- **CE - site events**: a custom event trigger matching the events above.
- **GA4 - site events**: a GA4 event tag that sends `{{Event}}` as the event
  name with every param.

To import it:

1. In GTM, Admin → Import Container, choose `docs/gtm-site-events.json`.
2. Pick your workspace, then **Merge** and **Rename conflicting tags,
   triggers, and variables**, so nothing already in the container changes.
3. Open the **GA4 Measurement ID** variable and replace `G-XXXXXXXXXX`.
4. Preview: open the site in Tag Assistant, flip "go terminal", run `ls`,
   and check that **GA4 - site events** fires for `terminal_mode` and
   `terminal_command`.
5. Submit and publish.

If you add an event to the site, add it to the trigger's regex in GTM too;
if it has a new param, add a data layer variable and a row on the tag.

## GA4 setup

GA4 only shows event params in reports once they're registered: Admin →
Custom definitions → Create custom dimension (event scope) for `theme`,
`state`, `command`, `input`, `name`, `result`, `talk`, `label` and `network`,
and custom metrics for `seconds`, `slide` and `slides`. The events
themselves show up in Reports → Engagement → Events without this.
