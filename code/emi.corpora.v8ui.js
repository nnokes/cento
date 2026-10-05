// [v8ui] The corpus window's list (M11): every folder of chorales, switched
// on or off. Composing uses every folder that is on, as one corpus. Patches
// load patchers/scripts/emi.corpora.bundle.js.
//
// A row per folder: a box to switch it on or off ("corpuson <n> 0|1" to the
// engine), its name, what it holds (chorales, meter, modes), whether it is
// in use (and if not, why), and two buttons: "only" (just this one on:
// "corpusonly <n>") and "remove" (off the list: "corpusremove <n>"; the
// folder itself stays). Under the rows, the corpus in a line. Resting the
// mouse on a box or button shows what it does (emi-hover); on a name, the
// folder's full path.
//
// The engine sends the whole list whenever it changes:
//   clear <building 1|0>          (building: a change waits for its build)
//   folder <n> <on 1|0> <in use 1|0> <chorales | -1 not read> <meter> <modes> <name> <path> <note...>
//   footer <words...>          (the line under the list; not "summary": Max 9's
//                                 [v8ui] answers that message itself, and fails)
//   done                          (draw it)

autowatch = 1;
inlets = 1;
outlets = 1;

const hover = require("emi-hover");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

const GREEN = [0.45, 0.8, 0.45];
const RED = [0.95, 0.42, 0.35];
const AMBER = [1, 0.75, 0.25];
const TOP = 46; // the first row
const ROW = 40;
const HELP = {
  check: "Switch this folder on or off. Composing uses every folder that is on, as one corpus; the seed shown is composed again with it.",
  only: "only: switch this folder on and every other one off.",
  remove: "remove: take this folder off the list (the folder and its files stay where they are). Add it again with add folder.",
};

let shown = null;
let incoming = null;
let hits = []; // { kind: "check" | "only" | "remove" | "name", n, help, x0, x1, y0, y1 }
let hovered = null; // the hit under the mouse ("kind n"), for its help

function clear(building) {
  incoming = { building: Boolean(Number(building)), folders: [], summary: "" };
}

function folder(n, on, used, works, meter, modes, name, path, ...note) {
  if (!incoming) return;
  incoming.folders.push({
    n: Number(n), on: Boolean(Number(on)), used: Boolean(Number(used)), works: Number(works),
    meter: String(meter), modes: String(modes), name: String(name), path: String(path), note: note.join(" "),
  });
}

function footer(...words) {
  if (incoming) incoming.summary = words.join(" ");
}

function done() {
  if (incoming) shown = incoming;
  incoming = null;
  mgraphics.redraw();
}

function onresize() {
  mgraphics.redraw();
}

// ---- mouse

function onclick(x, y) {
  const hit = hitAt(x, y);
  if (!hit || !shown) return;
  const row = shown.folders.find((f) => f.n === hit.n);
  if (!row) return;
  if (hit.kind === "check") {
    row.on = !row.on; // at once; the engine's answer follows
    mgraphics.redraw();
    outlet(0, "corpuson", hit.n, row.on ? 1 : 0);
  } else if (hit.kind === "only") outlet(0, "corpusonly", hit.n);
  else if (hit.kind === "remove") outlet(0, "corpusremove", hit.n);
}

function onidle(x, y) {
  const hit = hitAt(x, y);
  const key = hit ? hit.kind + " " + hit.n : null;
  if (key !== hovered) {
    hovered = key;
    mgraphics.redraw();
  }
}

function onidleout() {
  if (hovered !== null) {
    hovered = null;
    mgraphics.redraw();
  }
}

function hitAt(x, y) {
  return hits.find((h) => x >= h.x0 && x <= h.x1 && y >= h.y0 && y <= h.y1) || null;
}
hitAt.local = 1;

// ---- drawing

function paint() {
  const [width, height] = size();
  const g = mgraphics;
  g.set_source_rgba(0.12, 0.12, 0.13, 1);
  g.rectangle(0, 0, width, height);
  g.fill();
  g.select_font_face("Arial");
  hits = [];
  g.set_font_size(16);
  g.set_source_rgba(1, 1, 1, 0.95);
  g.move_to(12, 24);
  g.show_text("Corpora");
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.82);
  g.move_to(90, 24);
  g.show_text("Composing uses every folder that is on, as one corpus.");
  if (!shown) return;
  if (shown.building) {
    g.set_source_rgba(AMBER[0], AMBER[1], AMBER[2], 0.95);
    g.move_to(width - 90, 24);
    g.show_text("building...");
  }

  const rows = Math.max(1, Math.floor((height - TOP - 30) / ROW));
  shown.folders.slice(0, rows).forEach((f, i) => paintRow(f, TOP + i * ROW, width));
  if (shown.folders.length > rows) {
    g.set_font_size(11);
    g.set_source_rgba(1, 1, 1, 0.75);
    g.move_to(36, TOP + rows * ROW + 4);
    g.show_text(`and ${shown.folders.length - rows} more (make the window taller to see them)`);
  }

  // The corpus in a line.
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.85);
  g.move_to(12, height - 12);
  g.show_text(shown.summary);

  const hit = hovered === null ? null : hits.find((h) => h.kind + " " + h.n === hovered);
  if (hit && hit.help) hover.drawHelp(g, hit.help, hit, width, height);
}

function paintRow(f, y, width) {
  const g = mgraphics;
  // The box: filled when on.
  const color = f.on && f.used ? GREEN : f.on ? AMBER : [0.6, 0.6, 0.62];
  g.set_source_rgba(color[0], color[1], color[2], 0.95);
  g.set_line_width(1.5);
  g.rectangle_rounded(12, y + 2, 14, 14, 3, 3);
  if (f.on) g.fill();
  else g.stroke();
  hits.push({ kind: "check", n: f.n, help: HELP.check, x0: 8, x1: 30, y0: y - 2, y1: y + 20 });

  // Name, then what it holds and what it gives.
  g.set_font_size(13);
  g.set_source_rgba(1, 1, 1, f.on ? 0.95 : 0.55);
  g.move_to(36, y + 14);
  g.show_text(f.name);
  hits.push({ kind: "name", n: f.n, help: f.path, x0: 36, x1: 36 + f.name.length * 7.5, y0: y, y1: y + 18 });
  const holds = f.works < 0 ? "not read yet (switch it on)" : `${f.works} ${f.works === 1 ? "chorale" : "chorales"} · ${f.meter} · ${f.modes.replace("+", " and ")}`;
  g.set_font_size(11);
  g.set_source_rgba(1, 1, 1, f.on ? 0.65 : 0.4);
  g.move_to(36, y + 30);
  g.show_text(holds);
  if (f.on && !shown.building) {
    const [text, tone] = f.used ? [f.note ? "in use; " + f.note : "in use", GREEN] : [f.note || "not used", AMBER];
    g.set_source_rgba(tone[0], tone[1], tone[2], 0.95);
    g.move_to(36 + holds.length * 5.6 + 16, y + 30);
    g.show_text(text);
  }

  button("only", width - 130, y + 14, f.n);
  button("remove", width - 78, y + 14, f.n, RED);
}
paintRow.local = 1;

function button(kind, x, y, n, color = [1, 1, 1]) {
  const g = mgraphics;
  const w = kind.length * 6 + 12;
  g.set_source_rgba(color[0], color[1], color[2], 0.18);
  g.rectangle_rounded(x, y - 12, w, 16, 6, 6);
  g.fill();
  g.set_font_size(11);
  g.set_source_rgba(color[0], color[1], color[2], 0.95);
  g.move_to(x + 6, y);
  g.show_text(kind);
  hits.push({ kind, n, help: HELP[kind], x0: x, x1: x + w, y0: y - 12, y1: y + 4 });
}
button.local = 1;

function size() {
  if (mgraphics.size) return mgraphics.size;
  const rect = box.rect;
  return [rect[2] - rect[0], rect[3] - rect[1]];
}
size.local = 1;
