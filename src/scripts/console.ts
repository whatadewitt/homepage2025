// The docked terminal in full terminal mode: the site as folders to cd, ls,
// cat and open. Scrollback and history live in sessionStorage, so `open`
// moves to a new page with the terminal still open and the session intact.
// Pages reached any other way (nav, links) are logged as the cd and open
// that would have got you there, so the session reads as your path through
// the site.

import { CONSOLE_KEY } from "../data/themes";
import type { FsDir, FsFile } from "../lib/sitefs";

const root = document.documentElement;
const panel = document.querySelector<HTMLElement>("[data-console]");

if (panel) setup(panel);

function setup(panel: HTMLElement) {
  const q = <T extends HTMLElement>(sel: string) => panel.querySelector<T>(sel)!;
  const launcher = document.querySelector<HTMLButtonElement>("[data-console-launch]")!;
  const title = q("[data-console-title]");
  const scroller = q("[data-console-scroll]");
  const out = q("[data-console-out]");
  const form = q<HTMLFormElement>("[data-console-form]");
  const input = q<HTMLInputElement>("[data-console-input]");
  const promptPath = q("[data-console-prompt] .c-path");

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

  /** cwd is [] for ~ or [folder]. */
  let cwd: string[] = saved.cwd ?? [];

  /** Folder and file for a site path, or null for one that isn't in the fs. */
  function locate(path: string): { dir?: string; file?: string } | null {
    if (path === "/") return {};
    const [, top, file, extra] = path.split("/");
    const dir = ALIASES[top] ?? top;
    if (!FOLDERS.includes(dir) || extra) return null;
    return file ? { dir, file } : { dir };
  }

  interface Node {
    dir?: FsDir;
    file?: FsFile;
  }

  function resolve(arg: string): Node | null {
    const parts = /^[~/]/.test(arg) ? [] : [...cwd];
    for (const seg of arg.replace(/^~/, "").split("/")) {
      if (!seg || seg === ".") continue;
      if (seg === "..") parts.pop();
      else parts.push(seg);
    }
    if (parts.length === 0) return {};
    const dir = fs.find((d) => d.name === (ALIASES[parts[0]] ?? parts[0]));
    if (!dir || parts.length > 2) return null;
    if (parts.length === 1) return { dir };
    const file = dir.files.find((f) => f.name === parts[1].replace(/\.md$/, ""));
    return file ? { dir, file } : null;
  }

  const here = () => (cwd.length ? `~/${cwd[0]}` : "~");

  function syncPrompt() {
    promptPath.textContent = here();
    title.textContent = `visitor@whatadewitt: ${here()}`;
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

  function dirButton(d: FsDir) {
    const b = runButton(`cd ~/${d.name}`, `${d.name}/`);
    b.className = "c-dir";
    return b;
  }

  function fileLink(f: FsFile) {
    const a = document.createElement("a");
    a.className = "c-file";
    a.href = f.href;
    a.textContent = `${f.name}.md`;
    return a;
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
    ["cat <file>", "read a page’s summary"],
    ["open <path>", "go to the page (open . for this folder)"],
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
      if (node.file) return void grid.append(fileLink(node.file));
      if (!node.dir) {
        for (const d of fs) {
          grid.append(dirButton(d));
          if (long) grid.append(span("c-muted", `${d.files.length} items`));
        }
        return;
      }
      for (const f of node.dir.files) {
        grid.append(fileLink(f));
        if (long) grid.append(span("c-muted", f.title));
      }
    },

    cd([target = "~"]) {
      const node = resolve(target);
      if (!node) return void print("c-err", `cd: no such file or directory: ${target}`);
      if (node.file) return void print("c-err", `cd: not a directory: ${target}`);
      cwd = node.dir ? [node.dir.name] : [];
      syncPrompt();
    },

    cat([target]) {
      if (!target) return void print("c-err", "usage: cat <file>");
      const node = resolve(target);
      if (!node) return void print("c-err", `cat: ${target}: No such file or directory`);
      if (!node.file) return void print("c-err", `cat: ${target}: Is a directory`);
      const f = node.file;
      print("c-title", f.title);
      print("c-meta", f.meta);
      if (f.summary) print("", f.summary);
      print("c-muted").append("→ ", runButton(`open ~/${node.dir!.name}/${f.name}`, `open ${f.name}`));
    },

    open([target]) {
      if (!target) return void print("c-err", "usage: open <path>");
      const node = resolve(target);
      if (!node) return void print("c-err", `open: ${target}: No such file or directory`);
      const href = node.file?.href ?? node.dir?.href ?? "/";
      if ((location.pathname.replace(/\/$/, "") || "/") === href) {
        return void print("c-muted", "you’re already here");
      }
      print("c-muted", `opening ${href}…`);
      focusNext = true;
      last = href;
      save();
      location.assign(href);
    },

    pwd() {
      print("", `/home/visitor${cwd.length ? `/${cwd[0]}` : ""}`);
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
    },
  };

  async function run(raw: string) {
    echoCommand(raw);
    const text = raw.trim();
    historyAt = history.length;
    if (text) {
      remember(text);
      const [name, ...args] = text.split(/\s+/);
      if (!Object.hasOwn(commands, name)) {
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
      options = node.dir
        ? node.dir.files.map((f) => `${f.name}.md `)
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

  // --- Open and close --------------------------------------------------------

  const isOpen = () => root.classList.contains("console-open");

  function welcome() {
    print("", "Welcome to whatadewitt.");
    print("c-muted").append("Type ", runButton("help"), " for commands, or ", runButton("ls"), " to look around.");
  }

  function setOpen(open: boolean) {
    root.classList.add("console-anim");
    root.classList.toggle("console-open", open);
    launcher.setAttribute("aria-expanded", String(open));
    if (open) {
      loadFs();
      if (!out.childElementCount) welcome();
      scrollDown();
      input.focus({ preventScroll: true });
    } else if (panel.contains(document.activeElement)) {
      launcher.focus();
    }
    save();
  }

  /** Close for good: the next open starts a fresh screen (history stays). */
  function close() {
    out.replaceChildren();
    setOpen(false);
  }

  // --- Events ----------------------------------------------------------------

  launcher.addEventListener("click", () => setOpen(true));
  q("[data-console-min]").addEventListener("click", () => setOpen(false));
  q("[data-console-close]").addEventListener("click", close);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = input.value;
    input.value = "";
    run(value);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      loadFs().then(complete);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      historyAt = Math.max(0, Math.min(history.length, historyAt + (e.key === "ArrowUp" ? -1 : 1)));
      input.value = history[historyAt] ?? "";
    } else if (e.ctrlKey && e.key === "c" && input.selectionStart === input.selectionEnd) {
      e.preventDefault();
      echoCommand(`${input.value}^C`);
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
    if (cmd) run(cmd).then(() => input.focus({ preventScroll: true }));
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
    const at = locate(page);
    if (!at) {
      typed(`open ${page}`);
      print("c-err", `open: ${page}: No such file or directory`);
      return;
    }
    const target = at.dir ? [at.dir] : [];
    if (target.join() !== cwd.join()) {
      typed(`cd ${!at.dir ? "~" : cwd.length ? `../${at.dir}` : at.dir}`);
      cwd = target;
    }
    typed(`open ${at.file ? `${at.file}.md` : "."}`);
    print("c-muted", `opening ${page}…`);
  }

  // Turning on full terminal brings the terminal up, history and all.
  new MutationObserver(() => {
    if (root.dataset.term === "on") setOpen(true);
    else if (panel.contains(document.activeElement)) {
      document.querySelector<HTMLElement>("[data-term-switch]")?.focus();
    }
  }).observe(root, { attributes: true, attributeFilter: ["data-term"] });

  // --- Restore ---------------------------------------------------------------

  if (saved.out) out.innerHTML = saved.out;
  logVisit();
  syncPrompt();
  if (isOpen()) {
    launcher.setAttribute("aria-expanded", "true");
    loadFs();
    scrollDown();
    if (saved.focus && root.dataset.term === "on") input.focus({ preventScroll: true });
  }
  save();
}
