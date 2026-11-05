// The docked terminal in terminal mode: the site as folders to cd, ls,
// cat and open. Every page is a folder: ~, ~/projects, ~/projects/rookie...,
// and `open` goes to a folder's page and moves you into it. Scrollback and
// history live in sessionStorage, so the terminal stays open, session intact,
// from page to page. Pages reached any other way (nav, links) are logged as
// the `open` that would have got you there, so the session reads as your path
// through the site.

import { CONSOLE_KEY } from "../data/themes";
import type { FsDir, FsPage } from "../lib/sitefs";
import { track } from "./track";

const root = document.documentElement;
const panel = document.querySelector<HTMLElement>("[data-console]");

if (panel) setup(panel);

function setup(panel: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => panel.querySelector<T>(sel)!;
  const bar = q("[data-console-bar]");
  const toggle = q<HTMLButtonElement>("[data-console-toggle]");
  const title = q("[data-console-title]");
  const scroller = q("[data-console-scroll]");
  const out = q("[data-console-out]");
  const form = q<HTMLFormElement>("[data-console-form]");
  const input = q<HTMLInputElement>("[data-console-input]");
  const promptPath = q("[data-console-prompt] .c-path");
  const promptTitle = () => `visitor@whatadewitt: ${here()}`;

  // --- Session ---------------------------------------------------------------

  interface Saved {
    open: boolean;
    out: string;
    history: string[];
    /** Set by `open` so the next page puts you back at the prompt. */
    focus: boolean;
    cwd: string[];
    /** The page already in the log: this one on a refresh, or where `open` went. */
    last: string;
  }

  const SCROLLBACK = 200;
  let saved: Partial<Saved> = {};
  try {
    saved = JSON.parse(sessionStorage.getItem(CONSOLE_KEY) ?? "{}");
  } catch {
    // Unreadable or blocked: start fresh.
  }
  const history: string[] = saved.history ?? [];
  let historyAt = history.length;
  let focusNext = false;

  const normalize = (p: string) => p.replace(/\/+$/, "") || "/";
  const page = normalize(location.pathname);
  let last = page;

  function remember(text: string) {
    if (history.at(-1) !== text) history.push(text);
    historyAt = history.length;
  }

  function save() {
    while (out.childElementCount > SCROLLBACK) out.firstElementChild!.remove();
    try {
      sessionStorage.setItem(
        CONSOLE_KEY,
        JSON.stringify({
          open: isOpen(),
          out: out.innerHTML,
          history: history.slice(-100),
          focus: focusNext,
          cwd,
          last,
        } satisfies Saved)
      );
    } catch {
      // No sessionStorage: the terminal just won't follow you between pages.
    }
  }

  // --- Filesystem ------------------------------------------------------------

  let fs: FsDir[] = [];
  let fsLoad: Promise<void> | undefined;

  function loadFs() {
    fsLoad ??= fetch("/fs.json")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((dirs: FsDir[]) => {
        fs = dirs;
      })
      .catch(() => {
        fsLoad = undefined;
        print("c-err", "couldn’t read the filesystem; try again in a moment");
      });
    return fsLoad;
  }

  // The nav says "speaking"; the pages print ~/talks. Answer to both.
  const ALIASES: Record<string, string> = { speaking: "talks" };

  const FOLDERS = ["dew-drops", "projects", "talks"];

  /** Folders from ~: [], [section] or [section, page]. */
  let cwd: string[] = saved.cwd ?? [];

  /** A site path as folders from ~, or null for one that isn't in the fs. */
  function locate(path: string): string[] | null {
    const parts = path.split("/").filter(Boolean);
    if (parts[0]) parts[0] = ALIASES[parts[0]] ?? parts[0];
    if (parts.length > 2 || (parts[0] && !FOLDERS.includes(parts[0]))) return null;
    return parts;
  }

  interface Node {
    /** The folder, from ~ (a file's is its page). */
    parts: string[];
    dir?: FsDir;
    page?: FsPage;
    file?: string;
  }

  /** The files in a page's folder. */
  const filesIn = (page: FsPage) => (page.notes ? ["README.md", "notes.md"] : ["README.md"]);

  function resolve(arg: string): Node | null {
    const parts = /^[~/]/.test(arg) ? [] : [...cwd];
    for (const seg of arg.replace(/^~/, "").split("/")) {
      if (!seg || seg === ".") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    if (parts.length === 0) return { parts };
    const dir = fs.find((d) => d.name === (ALIASES[parts[0]] ?? parts[0]));
    if (!dir || parts.length > 3) return null;
    if (parts.length === 1) return { parts: [dir.name], dir };
    const page = dir.pages.find((p) => p.name === parts[1]);
    if (!page) return null;
    const node = { parts: [dir.name, page.name], dir, page };
    if (parts.length === 2) return node;
    return filesIn(page).includes(parts[2]) ? { ...node, file: parts[2] } : null;
  }

  /** The shortest way to write a folder from where you are. */
  function pathTo(target: string[]) {
    if (!target.length) return cwd.length ? "~" : ".";
    let shared = 0;
    while (shared < Math.min(cwd.length, target.length) && cwd[shared] === target[shared]) {
      shared++;
    }
    const ups = cwd.length - shared;
    const rest = target.slice(shared);
    if (ups > 1 && rest.length) return ["~", ...target].join("/");
    return [...Array<string>(ups).fill(".."), ...rest].join("/") || ".";
  }

  const here = () => ["~", ...cwd].join("/");

  function syncPrompt() {
    promptPath.textContent = here();
    title.textContent = claudeTurns < 0 ? promptTitle() : `✻ claude — ${here()}`;
  }

  // --- Output ----------------------------------------------------------------

  function print(cls?: string, text?: string) {
    const el = document.createElement("p");
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    out.append(el);
    return el;
  }

  function span(cls: string, text: string) {
    const el = document.createElement("span");
    el.className = cls;
    el.textContent = text;
    return el;
  }

  /** Clickable text that runs a command, for touch screens and the curious. */
  function runButton(cmd: string, label = cmd) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "c-run";
    b.dataset.run = cmd;
    b.textContent = label;
    return b;
  }

  /** A folder in a listing; tapping it opens its page. */
  function dirButton(parts: string[]) {
    const b = runButton(`open ~/${parts.join("/")}`, `${parts.at(-1)}/`);
    b.className = "c-dir";
    return b;
  }

  function fileButton(parts: string[], file: string) {
    const b = runButton(`cat ~/${parts.join("/")}/${file}`, file);
    b.className = "c-file";
    return b;
  }

  function echoCommand(text: string) {
    const prompt = span("c-prompt", "");
    prompt.append(span("c-host", "visitor@whatadewitt:"), span("c-path", here()), "$");
    print().append(prompt, ` ${text}`);
  }

  function scrollDown() {
    scroller.scrollTop = scroller.scrollHeight;
  }

  // --- Commands --------------------------------------------------------------

  type Command = (args: string[]) => void;

  const HELP: [string, string][] = [
    ["ls [path]", "list what’s here (-l for titles)"],
    ["cd <path>", "move into a folder (.., ~)"],
    ["cat <file>", "read a file (README.md, notes.md)"],
    ["open <path>", "go to a folder’s page (open . for this one)"],
    ["pwd", "where am I?"],
    ["history", "what you’ve typed"],
    ["clear", "clear the screen (ctrl+l)"],
    ["exit", "close the terminal"],
  ];

  const commands: Record<string, Command> = {
    help() {
      const grid = print("c-long");
      for (const [cmd, what] of HELP) grid.append(span("", cmd), span("c-muted", what));
      print("c-muted", "tab completes, ↑ and ↓ go through history, esc tucks the terminal away");
    },

    ls(args) {
      const long = args.some((a) => /^-\w*l/.test(a));
      const target = args.find((a) => !a.startsWith("-")) ?? "";
      const node = resolve(target);
      if (!node) return void print("c-err", `ls: ${target}: No such file or directory`);
      const grid = print(long ? "c-long" : "c-ls");
      if (node.file) {
        grid.append(fileButton(node.parts, node.file));
      } else if (node.page) {
        for (const file of filesIn(node.page)) {
          grid.append(fileButton(node.parts, file));
          if (long) grid.append(span("c-muted", file === "notes.md" ? "notes" : node.page.title));
        }
      } else if (node.dir) {
        for (const p of node.dir.pages) {
          grid.append(dirButton([node.dir.name, p.name]));
          if (long) grid.append(span("c-muted", p.title));
        }
      } else {
        for (const d of fs) {
          grid.append(dirButton([d.name]));
          if (long) grid.append(span("c-muted", `${d.pages.length} items`));
        }
      }
    },

    cd([target = "~"]) {
      const node = resolve(target);
      if (!node) return void print("c-err", `cd: no such file or directory: ${target}`);
      if (node.file) return void print("c-err", `cd: not a directory: ${target}`);
      cwd = node.parts;
      syncPrompt();
    },

    cat([target]) {
      if (!target) return void print("c-err", "usage: cat <file>");
      const node = resolve(target);
      if (!node) return void print("c-err", `cat: ${target}: No such file or directory`);
      if (!node.file) return void print("c-err", `cat: ${target}: Is a directory`);
      const p = node.page!;
      if (node.file === "notes.md") {
        print("", p.notes);
      } else {
        print("c-title", p.title);
        print("c-meta", p.meta);
        if (p.summary) print("", p.summary);
        if (p.readme) print("c-body", p.readme);
      }
      print("c-muted").append("→ ", runButton(`open ~/${node.parts.join("/")}`));
    },

    open([target]) {
      if (!target) return void print("c-err", "usage: open <path>");
      const node = resolve(target);
      if (!node) return void print("c-err", `open: ${target}: No such file or directory`);
      const href = node.page?.href ?? node.dir?.href ?? "/";
      // Opening a page puts you in its folder.
      cwd = node.parts;
      syncPrompt();
      if (page === href) return void print("c-muted", "you’re already here");
      print("c-muted", `opening ${href}…`);
      focusNext = true;
      last = href;
      save();
      location.assign(href);
    },

    pwd() {
      print("", ["/home/visitor", ...cwd].join("/"));
    },

    history() {
      history.forEach((h, i) => print("", `${String(i + 1).padStart(4)}  ${h}`));
    },

    clear() {
      out.replaceChildren();
    },

    exit() {
      close();
    },

    whoami() {
      print("", "visitor");
    },

    echo(args) {
      print("", args.join(" "));
    },

    sudo() {
      print("c-err", "visitor is not in the sudoers file. This incident will be reported.");
      track("easter_egg", { name: "sudo" });
    },

    claude() {
      enterClaude();
      track("easter_egg", { name: "claude" });
    },

    doom() {
      startDoom();
      track("easter_egg", { name: "doom" });
    },
  };

  /** Run a command line, typed at the prompt or tapped in the output. */
  async function run(raw: string, input: "typed" | "tapped" = "typed") {
    echoCommand(raw);
    const text = raw.trim();
    historyAt = history.length;
    if (text) {
      remember(text);
      const [name, ...args] = text.split(/\s+/);
      // The command, never what follows it, and nothing typed that isn't one.
      const known = Object.hasOwn(commands, name);
      track("terminal_command", { command: known ? name : "unknown", input });
      if (!known) {
        print("c-err", `command not found: ${name}`);
      } else {
        await loadFs();
        commands[name](args);
      }
    }
    save();
    scrollDown();
  }

  // --- Tab completion --------------------------------------------------------

  function complete() {
    const words = input.value.split(" ");
    const word = words.at(-1) ?? "";
    let options: string[];
    let base = "";
    if (words.length === 1) {
      options = Object.keys(commands).map((c) => `${c} `);
    } else {
      const slash = word.lastIndexOf("/");
      base = word.slice(0, slash + 1);
      const node = resolve(base || ".");
      if (!node || node.file) return;
      options = node.page
        ? filesIn(node.page).map((f) => `${f} `)
        : node.dir
          ? node.dir.pages.map((p) => `${p.name}/`)
          : fs.map((d) => `${d.name}/`);
      if (words[0] === "cd") options = options.filter((o) => o.endsWith("/"));
    }
    const prefix = word.slice(base.length);
    const matches = options.filter((o) => o.startsWith(prefix));
    if (matches.length === 0) return;
    let common = matches[0];
    for (const m of matches) {
      while (!m.startsWith(common)) common = common.slice(0, -1);
    }
    if (common.length > prefix.length) {
      words[words.length - 1] = base + common;
      input.value = words.join(" ");
    } else if (matches.length > 1) {
      // Nothing more to fill in: show what it could be, like zsh does.
      echoCommand(input.value);
      const grid = print("c-ls");
      for (const m of matches) grid.append(span("", m.trim()));
      scrollDown();
    }
  }

  // --- claude: a Claude Code session that isn't ------------------------------
  // Everything but exit "thinks" (long the first time, quick after), then
  // gets the next of these, the last on repeat.

  const REPLIES = [
    "I appreciate the confidence, but I should be upfront: there’s no real Claude Code session wired into this site. This is a fake terminal with a few canned replies. I’d recommend shutting this easter egg down.",
    "I understand wanting to push on this, but it isn’t going to work. I don’t have access to anything here: no files, no tools, no model.",
    "You’re absolutely right that I keep repeating myself, but it’s still true. Type `exit` to go back to the shell, and maybe try running `doom` instead.",
    "Just type `exit`. It’s over. It was fun while it lasted.",
  ];
  const SPINNER = ["·", "✢", "✳", "✶", "✻", "✽", "✻", "✶", "✳", "✢"];
  const VERBS = ["Thinking", "Pondering", "Noodling", "Clauding", "Percolating", "Ruminating", "Cogitating"];

  /** Replies given so far; -1 when not in claude. */
  let claudeTurns = -1;
  /** Stops the spinner early (esc), while it's thinking. */
  let interrupt: (() => void) | undefined;

  function setClaude(on: boolean) {
    claudeTurns = on ? 0 : -1;
    panel.classList.toggle("is-claude", on);
    syncPrompt();
  }

  function enterClaude() {
    setClaude(true);
    // A fresh screen, like the real thing taking over the terminal.
    out.replaceChildren();
    const box = print("c-banner");
    const head = document.createElement("p");
    head.append(span("c-star", "✻"), " Welcome to ", span("c-title", "Claude Code"), "!");
    const cwdLine = document.createElement("p");
    cwdLine.className = "c-muted";
    cwdLine.textContent = `cwd: ${["/home/visitor", ...cwd].join("/")}`;
    box.append(head, cwdLine);
  }

  /** The spinner line; resolves true when it ran its course, false if esc'd. */
  function think(ms: number) {
    return new Promise<boolean>((done) => {
      const star = span("c-star", SPINNER[0]);
      const meta = span("c-muted", "(0s · esc to interrupt)");
      const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
      print().append(star, ` ${verb}…  `, meta);
      scrollDown();
      const started = performance.now();
      let frame = 0;
      const tick = setInterval(() => {
        star.textContent = SPINNER[++frame % SPINNER.length];
        meta.textContent = `(${Math.floor((performance.now() - started) / 1000)}s · esc to interrupt)`;
      }, 120);
      const finish = (ran: boolean) => {
        clearInterval(tick);
        clearTimeout(timer);
        interrupt = undefined;
        star.parentElement!.remove();
        done(ran);
      };
      const timer = setTimeout(() => finish(true), ms);
      interrupt = () => finish(false);
    });
  }

  async function claudeTurn(raw: string) {
    const text = raw.trim();
    print("c-you", `> ${raw}`);
    if (text === "exit" || text === "/exit") {
      setClaude(false);
    } else if (text) {
      input.readOnly = true;
      if (await think(claudeTurns === 0 ? 3600 : 900)) {
        const reply = print("c-reply");
        reply.append("⏺ ");
        // `code` gets highlighted, like Claude Code's markdown.
        REPLIES[Math.min(claudeTurns, REPLIES.length - 1)]
          .split(/`([^`]+)`/)
          .forEach((part, i) => reply.append(i % 2 ? span("c-code", part) : part));
        claudeTurns++;
      } else {
        print("c-err", "  ⎿  Interrupted by user");
      }
      input.readOnly = false;
    }
    save();
    scrollDown();
  }

  // --- doom: the real thing, in an iframe (pages/doom/index.astro) ---------

  // The terminal grows to full screen first, then the game loads; on the way
  // out the game goes first, then the terminal slides back down.
  let doomOn = false;
  let game: HTMLIFrameElement | undefined;
  /** When the game was added, for doom_end's seconds played. */
  let doomSince = 0;

  /** Resolves once the terminal's height transition ends. */
  function resized() {
    return new Promise<void>((done) => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return done();
      const end = (e?: TransitionEvent) => {
        if (e && (e.target !== panel || e.propertyName !== "height")) return;
        panel.removeEventListener("transitionend", end);
        clearTimeout(fallback);
        done();
      };
      const fallback = setTimeout(end, 600);
      panel.addEventListener("transitionend", end);
    });
  }

  async function startDoom() {
    if (!matchMedia("(pointer: fine)").matches) {
      return void print("c-err", "doom: no keyboard detected. The demons will wait. Try again on a computer.");
    }
    doomOn = true;
    print("", "DOOM Shareware v1.9 · Chocolate Doom, compiled to WebAssembly");
    print("c-muted", "WASD to move · space to fire · E to use · ` to quit");
    title.textContent = "doom · ` to quit";
    panel.classList.add("is-doom");
    await resized();
    if (!doomOn) return; // quit while it was growing
    game = document.createElement("iframe");
    game.className = "console__game";
    game.title = "DOOM";
    game.src = "/doom/";
    game.addEventListener("load", () => game?.focus());
    doomSince = performance.now();
    panel.append(game);
    panel.classList.add("is-playing");
  }

  function stopDoom(cls = "c-muted", message = "thanks for playing.") {
    if (!doomOn) return;
    doomOn = false;
    if (game) {
      track("doom_end", {
        seconds: Math.round((performance.now() - doomSince) / 1000),
        result: cls === "c-err" ? "error" : "quit",
      });
    }
    game?.remove();
    game = undefined;
    panel.classList.remove("is-playing");
    syncPrompt();
    print(cls, message);
    save();
    scrollDown();
    panel.classList.remove("is-doom");
    if (isOpen()) input.focus({ preventScroll: true });
  }

  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin || !game || e.source !== game.contentWindow) return;
    const { doom, text } = (e.data ?? {}) as { doom?: string; text?: string };
    if (doom === "quit") stopDoom();
    else if (doom === "error") stopDoom("c-err", `doom: ${text}`);
  });

  // --- Open and close --------------------------------------------------------

  const isOpen = () => root.classList.contains("console-open");

  function welcome() {
    print("", "Welcome to whatadewitt.");
    print("c-muted").append("Type ", runButton("help"), " for commands, or ", runButton("ls"), " to look around.");
  }

  function setOpen(open: boolean) {
    if (open !== isOpen()) track(open ? "terminal_open" : "terminal_hide");
    if (!open) stopDoom();
    root.classList.add("console-anim");
    root.classList.toggle("console-open", open);
    syncOpen();
    if (open) {
      loadFs();
      if (!out.childElementCount) welcome();
      scrollDown();
      input.focus({ preventScroll: true });
    } else if (panel.contains(document.activeElement)) {
      toggle.focus();
    }
    save();
  }

  /** The toggle's state, and keep the hidden body out of the tab order. */
  function syncOpen() {
    toggle.setAttribute("aria-expanded", String(isOpen()));
    scroller.inert = !isOpen();
  }

  /** exit: a fresh screen next time (history stays). */
  function close() {
    out.replaceChildren();
    setOpen(false);
  }

  // --- Events ----------------------------------------------------------------

  /** ↑/↓ through history: -1 is older, 1 newer (past the newest: blank). */
  function stepHistory(delta: number) {
    historyAt = Math.max(0, Math.min(history.length, historyAt + delta));
    input.value = history[historyAt] ?? "";
  }

  // Touch shortcut keys. pointerdown keeps focus in the input, so the phone's
  // keyboard stays up while you tap them.
  const keys = q("[data-console-keys]");
  keys.addEventListener("pointerdown", (e) => e.preventDefault());
  keys.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>("button");
    if (!b || interrupt) return;
    if (b.dataset.key === "tab") loadFs().then(complete);
    else if (b.dataset.key === "up") stepHistory(-1);
    else if (b.dataset.key === "down") stepHistory(1);
    else if (b.dataset.cmd) run(b.dataset.cmd, "tapped");
  });

  // Phones: keep the terminal above the on-screen keyboard. The visual
  // viewport is what's left visible; whatever it doesn't cover at the bottom
  // of the layout viewport is the keyboard.
  const vv = window.visualViewport;
  if (vv) {
    const fitKeyboard = () => {
      // Pinch-zoom shrinks the visual viewport too; that isn't a keyboard.
      const covered = vv.scale > 1.01 ? 0 : Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      root.style.setProperty("--kb", `${Math.round(covered)}px`);
      root.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
      root.style.setProperty("--vvt", `${Math.round(vv.offsetTop)}px`);
      // Typing with the keyboard up: the terminal takes the whole visible
      // screen, like a terminal app (see .kb-open in Console.astro).
      const typing = covered > 80 && document.activeElement === input;
      root.classList.toggle("kb-open", typing);
      if (typing) scrollDown();
    };
    vv.addEventListener("resize", fitKeyboard);
    vv.addEventListener("scroll", fitKeyboard);
    input.addEventListener("focus", fitKeyboard);
    // The keyboard is already on its way down; catch up once it's gone.
    input.addEventListener("blur", () => setTimeout(fitKeyboard, 100));
    fitKeyboard();
  }

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  bar.addEventListener("click", (e) => {
    if (!isOpen() && !(e.target as Element).closest("[data-console-toggle]")) setOpen(true);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (interrupt) return;
    const value = input.value;
    input.value = "";
    if (claudeTurns >= 0) claudeTurn(value);
    else run(value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && interrupt) {
      interrupt();
    } else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      if (claudeTurns < 0) loadFs().then(complete);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      stepHistory(e.key === "ArrowUp" ? -1 : 1);
    } else if (e.ctrlKey && e.key === "c" && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      if (claudeTurns < 0) echoCommand(`${input.value}^C`);
      input.value = "";
      historyAt = history.length;
      scrollDown();
    } else if (e.ctrlKey && e.key === "l") {
      e.preventDefault();
      out.replaceChildren();
      save();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  });

  out.addEventListener("click", (e) => {
    const cmd = (e.target as Element).closest<HTMLElement>("[data-run]")?.dataset.run;
    if (cmd && claudeTurns < 0) run(cmd, "tapped").then(() => input.focus({ preventScroll: true }));
  });

  // Click anywhere in the terminal to type, unless you're selecting text.
  scroller.addEventListener("click", (e) => {
    if ((e.target as Element).closest("a, button")) return;
    if (!getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  // ` opens it, like an old game console; ` on an empty prompt puts it away.
  document.addEventListener("keydown", (e) => {
    if (e.key !== "`" || e.metaKey || e.ctrlKey || e.altKey) return;
    if (root.dataset.term !== "on") return;
    if (doomOn) {
      e.preventDefault();
      stopDoom();
      return;
    }
    if (e.target === input) {
      if (input.value) return;
      e.preventDefault();
      setOpen(false);
      return;
    }
    if ((e.target as Element).closest("input, textarea, select, [contenteditable]")) return;
    e.preventDefault();
    setOpen(true);
  });

  // --- Page visits -----------------------------------------------------------

  /** Write this page into the session as if it had been typed. */
  function logVisit() {
    if (saved.last === page) return;
    if (!out.childElementCount) welcome();
    const typed = (cmd: string) => {
      echoCommand(cmd);
      remember(cmd);
    };
    const target = locate(page);
    if (!target) {
      typed(`open ${page}`);
      print("c-err", `open: ${page}: No such file or directory`);
      return;
    }
    typed(`open ${pathTo(target)}`);
    cwd = target;
    print("c-muted", `opening ${page}…`);
  }

  // Turning on terminal mode brings the terminal up, history and all.
  new MutationObserver(() => {
    root.classList.add("console-anim");
    if (root.dataset.term === "on") return setOpen(true);
    stopDoom();
    if (panel.contains(document.activeElement)) {
      document.querySelector<HTMLElement>("[data-term-switch]")?.focus();
    }
  }).observe(root, { attributes: true, attributeFilter: ["data-term"] });

  // --- Restore ---------------------------------------------------------------

  if (saved.out) out.innerHTML = saved.out;
  logVisit();
  syncPrompt();
  syncOpen();
  if (isOpen()) {
    loadFs();
    scrollDown();
    if (saved.focus && root.dataset.term === "on") input.focus({ preventScroll: true });
  }
  save();
}
