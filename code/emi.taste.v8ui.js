// [v8ui] Emily's taste, large, in the pop-up window (emi.window). Patches
// load patchers/emi.taste.bundle.js.
//
// Four columns: what she likes and dislikes most (a bar per feature, its
// weight from -3 to +3), the last ratings, and the last comparison made with
// "taste" (each feature's share of beats in ten pieces with her taste, and
// without).
//
// Three views, chosen by the tabs at the top right: overview, weights and
// memory. A taste comparison starting shows the overview, where its result
// appears ("comparing <pairs done> <pairs>" while it runs, -1 when it ends).
//
// The weight editor: a slider per musical feature, grouped by kind, from -3 to +3.
// Dragging one pins the feature at that value ("pin <feature> <w>" to the
// engine); double-clicking releases it to what she learned, shown as a thin
// line on its slider ("unpin <feature>"). A strength slider (0..2) scales her
// whole taste ("strength <v>"); double-click it for 1.
//
// The memory (M10): her own works in use (each with "put aside":
// "unaccept <id>"), her snapshots
// (each with "roll back": "rollback <id>"; "keep a snapshot": "snapshot"),
// and sliders for mix (0..0.75: "mix <v>"; double-click for 0.5) and
// novelty (0..1: "novelty <v>"; double-click for 0).
//
// Hover help: resting the mouse on a tab, slider or button shows what it does
// in a box beside it (each musical feature with what it means), as Max's
// hints do for the window's own controls.
//
// The engine sends it all at once, whenever it changes:
//   clear <ratings> <likes> <sessions> <temperature>
//   like <weight> <name...>               (strongest first)
//   dislike <weight> <name...>
//   rating <1|-1> <beats> <what...>       (latest first)
//   compare <first seed> <last seed>
//   pair <% with> <% without> <liked 1|0> <name...>
//   strength <v>
//   weight <kind> <feature> <learned> <pinned 1|0> <in use> <name...>
//   own <works> <beats> <varied> <mix> <novelty> <in use 1|0>
//   work <id> <gen> <beats> <varied> <what...>     (latest first)
//   snapshot <id> <date> <time> <label...>         (latest first)
//   done                                  (draw it)
// and, on its own, comparing <pairs done | -1> <pairs>.

autowatch = 1;
inlets = 1;
outlets = 1;

const hover = require("emi-hover");

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

const GREEN = [0.45, 0.8, 0.45];
const RED = [0.95, 0.42, 0.35];
const LIMIT = 3; // weights stay within -3..+3 (emily-assoc)
const ROW = 20;
const AMBER = [1, 0.75, 0.25];
// Text on the dark pane: the main text near white, secondary text a light
// grey that still reads easily (0.4-0.6 was too faint), never dimmer than 0.7.
const SOFT = 0.82;
const FAINT = 0.7;
const STEP = 0.1; // a pinned weight's resolution
const PURPLE = [0.75, 0.45, 1];
// The sliders other than the weights: their range, step, value on a
// double-click, and hover help.
const SLIDERS = {
  strength: {
    min: 0, max: 2, step: 0.05, reset: 1,
    help: "strength: how much her whole taste counts when composing. 0: not at all; 1: as she learned it; 2: twice as much. Double-click for 1.",
  },
  mix: {
    min: 0, max: 0.75, step: 0.05, reset: 0.5,
    help: "mix: how much the works in her notebook (the ones you kept) count against Bach's when composing. 0: Bach only; 0.75: mostly hers. Double-click for 0.5.",
  },
  novelty: {
    min: 0, max: 1, step: 0.05, reset: 0,
    help: "novelty: the chance that each phrase gets a variant of her own: a passing tone, a neighbour note, a suspension, a re-voiced chord... 0: never; 1: every phrase. Double-click for 0.",
  },
};
// What each musical feature means (emily-assoc's f: kinds), for hover help.
const FEATURES = {
  "f:motion:still": "beats where no voice moves within the beat: block chords",
  "f:motion:flowing": "beats where one voice moves within the beat while the others hold",
  "f:motion:busy": "beats where two or more voices move within the beat",
  "f:16ths": "beats with 16th notes",
  "f:susp": "suspensions: an upper voice held over from the beat before, then stepping down",
  "f:melody:same": "the soprano repeats its note into the next beat",
  "f:melody:step": "the soprano moves by step to the next beat",
  "f:melody:leap": "the soprano leaps to the next beat",
  "f:register:low": "the soprano in the lowest third of the corpus's range",
  "f:register:mid": "the soprano in the middle third of the corpus's range",
  "f:register:high": "the soprano in the highest third of the corpus's range",
  "f:chord:major": "a major chord on the beat",
  "f:chord:minor": "a minor chord on the beat",
  "f:chord:seventh": "a seventh chord on the beat",
  "f:chord:diminished": "a diminished chord on the beat",
  "f:chord:other": "no plain chord on the beat: open fifths, unisons and the like",
  "f:chromatic": "notes outside the key",
  "f:key:home": "beats in the piece's home key",
  "f:key:dominant": "beats in the dominant key (a fifth above home)",
  "f:key:relative": "beats in the relative major or minor",
  "f:key:subdominant": "beats in the subdominant key (a fifth below home)",
  "f:key:other": "beats in more distant keys",
  "f:tension:low": "the calmest third of the corpus's beats (Cope's tension)",
  "f:tension:mid": "the middle third of the corpus's beats by tension",
  "f:tension:high": "the tensest third of the corpus's beats",
  "f:mode:major": "pieces in a major key",
  "f:mode:minor": "pieces in a minor key",
};
// The views, as tabs at the top right: name, hover help.
const TABS = [
  ["overview", "overview: what she likes and dislikes most, her latest ratings, and the last taste comparison."],
  ["weights", "weights: a slider per musical feature, to pin her weight for it, and strength."],
  ["memory", "memory: her notebook, snapshots of her taste to roll back to, and the mix and novelty sliders."],
];
// The drawn buttons' hover help, by message.
const BUTTONS = {
  unaccept: "put aside: stop composing from this work of hers. It stays in her memory file: roll back to a snapshot from when it was in use to bring it back.",
  rollback: "roll back: make this snapshot's taste hers again, exactly: weights, pins, sliders, and which of her works are in use. The taste she has now is kept as a snapshot first.",
  snapshot: "keep a snapshot: keep her whole taste as it is now, to roll back to later.",
};

let shown = null;
let incoming = null;
let mode = "overview"; // or "weights" (the editor) or "memory" (M10)
// The sliders and buttons as last drawn: { kind: "weight" | "slider" | "button",
// feature (a weight's), name (a slider's), message (a button's), help, x0, x1, y0, y1 }
let hits = [];
let dragging = null; // the slider being dragged (its hit)
let hovered = null; // the slider or button under the mouse (its key), for its help
let progress = null; // a taste comparison under way: [pairs done, pairs]

function clear(ratings, likes, sessions, temperature) {
  incoming = { ratings, likes, sessions, temperature, liked: [], disliked: [], recent: [], compare: null, pairs: [], strength: 1, weights: [], own: null, works: [], snapshots: [] };
}

function own(works, beats, varied, mix, novelty, inUse) {
  if (incoming) incoming.own = { works, beats, varied, mix, novelty, inUse: Boolean(inUse) };
}

function work(id, gen, beats, varied, ...what) {
  if (incoming) incoming.works.push({ id: String(id), gen, beats, varied, what: what.join(" ") });
}

function snapshot(id, date, time, ...label) {
  if (incoming) incoming.snapshots.push({ id, when: `${date} ${time}`, label: label.join(" ") });
}

function strength(v) {
  if (incoming) incoming.strength = v;
}

function weight(kind, feature, learned, pinned, value, ...name) {
  if (incoming) incoming.weights.push({ kind: String(kind), feature: String(feature), learned, pinned: Boolean(pinned), value, name: name.join(" ") });
}

// A taste comparison's progress; when one starts, the overview shows it.
function comparing(done, pairs) {
  progress = done < 0 ? null : [done, pairs];
  if (done === 0) show("overview");
  else mgraphics.redraw();
}

function show(view) {
  mode = view;
  dragging = null;
  hovered = null;
  mgraphics.redraw();
}
show.local = 1;

function like(weight, ...name) {
  if (incoming) incoming.liked.push([weight, name.join(" ")]);
}

function dislike(weight, ...name) {
  if (incoming) incoming.disliked.push([weight, name.join(" ")]);
}

function rating(r, beats, ...what) {
  if (incoming) incoming.recent.push([r, beats, what.join(" ")]);
}

function compare(first, last) {
  if (incoming) incoming.compare = [first, last];
}

function pair(withTaste, without, liked, ...name) {
  if (incoming) incoming.pairs.push([withTaste, without, liked, name.join(" ")]);
}

function done() {
  if (incoming) shown = incoming;
  incoming = null;
  mgraphics.redraw();
}

function onresize() {
  mgraphics.redraw();
}

// ---- the weight editor: mouse

function onclick(x, y) {
  const hit = hitAt(x, y);
  if (hit && hit.kind === "tab") {
    show(hit.name);
    return;
  }
  if (mode === "overview" || !shown) return;
  if (hit && hit.kind === "button") {
    outlet(0, ...hit.message);
    return;
  }
  dragging = hit;
  if (dragging) moveTo(x);
}

function ondrag(x, y, button) {
  if (dragging) moveTo(x);
  if (!button) dragging = null;
}

function ondblclick(x, y) {
  if (mode === "overview" || !shown) return;
  const hit = hitAt(x, y);
  dragging = null;
  if (!hit || hit.kind === "button" || hit.kind === "tab") return;
  if (hit.kind === "slider") {
    setSlider(hit.name, SLIDERS[hit.name].reset);
    outlet(0, hit.name, SLIDERS[hit.name].reset);
  } else {
    const row = shown.weights.find((w) => w.feature === hit.feature);
    if (row) {
      row.pinned = false;
      row.value = row.learned;
    }
    outlet(0, "unpin", hit.feature);
  }
  mgraphics.redraw();
}

function hitAt(x, y) {
  return hits.find((h) => x >= h.x0 - 6 && x <= h.x1 + 6 && y >= h.y0 && y <= h.y1) || null;
}
hitAt.local = 1;

// ---- hover help

function onidle(x, y) {
  const hit = hitAt(x, y);
  const key = hit ? keyOf(hit) : null;
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

function keyOf(hit) {
  return hit.kind + " " + (hit.feature || hit.name || hit.message.join(" "));
}
keyOf.local = 1;

// The hovered control's help (emi-hover), unless a slider is being dragged.
function paintHelp(width, height) {
  const hit = hovered === null ? null : hits.find((h) => keyOf(h) === hovered);
  if (!hit || !hit.help || dragging) return;
  hover.drawHelp(mgraphics, hit.help, hit, width, height);
}
paintHelp.local = 1;

function sliderValue(name) {
  if (name === "strength") return Number(shown.strength);
  return shown.own ? Number(shown.own[name]) : 0;
}
sliderValue.local = 1;

function setSlider(name, v) {
  if (name === "strength") shown.strength = v;
  else if (shown.own) shown.own[name] = v;
}
setSlider.local = 1;

// The dragged slider follows the mouse; the engine hears each new value.
function moveTo(x) {
  const h = dragging;
  const share = Math.max(0, Math.min(1, (x - h.x0) / (h.x1 - h.x0)));
  if (h.kind === "slider") {
    const range = SLIDERS[h.name];
    const v = Math.round(Math.round((range.min + share * (range.max - range.min)) / range.step) * range.step * 100) / 100;
    if (v === sliderValue(h.name)) return;
    setSlider(h.name, v);
    outlet(0, h.name, v);
  } else {
    const v = Math.round((share * 2 * LIMIT - LIMIT) / STEP) * STEP;
    const value = Math.round(v * 100) / 100;
    const row = shown.weights.find((w) => w.feature === h.feature);
    if (!row || (row.pinned && row.value === value)) return;
    row.pinned = true;
    row.value = value;
    outlet(0, "pin", h.feature, value);
  }
  mgraphics.redraw();
}
moveTo.local = 1;

function paint() {
  const [width, height] = size();
  const g = mgraphics;
  g.set_source_rgba(0.12, 0.12, 0.13, 1);
  g.rectangle(0, 0, width, height);
  g.fill();
  g.select_font_face("Arial");
  hits = [];
  paintTabs(width);
  if (mode === "weights") paintEditor(width, height);
  else if (mode === "memory") paintMemory(width, height);
  else paintOverview(width, height);
  paintHelp(width, height);
}

// A view's title, and a line of lighter text just after it: where the title
// ends, however long it is (a fixed place made them collide when the titles
// grew, with Magdalena's name).
function titleLine(title, text) {
  const g = mgraphics;
  g.set_font_size(16);
  g.set_source_rgba(1, 1, 1, 0.95);
  g.move_to(12, 24);
  g.show_text(title);
  if (!text) return;
  const measured = g.text_measure ? g.text_measure(title) : null;
  const width = Array.isArray(measured) && measured[0] > 0 ? measured[0] : title.length * 9;
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, SOFT);
  g.move_to(Math.round(12 + width + 18), 24);
  g.show_text(text);
}
titleLine.local = 1;

// The overview: likes, dislikes, ratings, and the last comparison.
function paintOverview(width, height) {
  const g = mgraphics;
  // The title line.
  if (!shown) {
    titleLine("Magdalena: the user's taste", "");
    return;
  }
  const parts = [shown.ratings + (shown.ratings === 1 ? " rating" : " ratings")];
  if (shown.ratings) parts[0] += ` (${shown.likes} liked, ${shown.ratings - shown.likes} disliked)`;
  if (shown.sessions) parts.push(shown.sessions + (shown.sessions === 1 ? " earlier session" : " earlier sessions"));
  const pins = shown.weights.filter((w) => w.pinned).length;
  if (pins) parts.push(pins + (pins === 1 ? " feature pinned" : " features pinned"));
  if (Number(shown.strength) !== 1) parts.push("strength " + Number(shown.strength).toFixed(2));
  parts.push("temperature " + Number(shown.temperature).toFixed(2));
  titleLine("Magdalena: the user's taste", parts.join("  ·  "));

  if (!shown.ratings) {
    g.set_font_size(13);
    g.set_source_rgba(1, 1, 1, 0.7);
    g.move_to(12, 60);
    g.show_text("No ratings yet. Like or dislike a piece, a stream phrase, or beats you drag across in the roll above.");
    return;
  }

  const column = (width - 24) / 4;
  const top = 50;
  const header = (k, text) => {
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.85);
    g.move_to(12 + k * column, top);
    g.show_text(text);
  };
  const rows = Math.max(1, Math.floor((height - top - 10) / ROW));

  // Likes and dislikes: a bar per feature, as long as its weight.
  [["Likes", shown.liked, GREEN], ["Dislikes", shown.disliked, RED]].forEach(([title, list, color], k) => {
    header(k, title);
    const x0 = 12 + k * column;
    const barLeft = x0 + 140;
    const barRoom = column - 140 - 50;
    list.slice(0, rows).forEach(([weight, name], i) => {
      const y = top + 8 + i * ROW;
      g.set_font_size(12);
      g.set_source_rgba(1, 1, 1, 0.8);
      g.move_to(x0, y + 12);
      g.show_text(name);
      g.set_source_rgba(color[0], color[1], color[2], 0.85);
      g.rectangle(barLeft, y + 3, Math.max(2, (Math.abs(weight) / LIMIT) * barRoom), 11);
      g.fill();
      g.set_source_rgba(1, 1, 1, SOFT);
      g.move_to(barLeft + Math.max(2, (Math.abs(weight) / LIMIT) * barRoom) + 5, y + 12);
      g.show_text((weight > 0 ? "+" : "") + Number(weight).toFixed(2));
    });
    if (!list.length) {
      g.set_font_size(12);
      g.set_source_rgba(1, 1, 1, FAINT);
      g.move_to(x0, top + 20);
      g.show_text("none yet");
    }
  });

  // The last ratings, latest first.
  header(2, "Last ratings");
  shown.recent.slice(0, rows).forEach(([r, beats, what], i) => {
    const y = top + 8 + i * ROW;
    const color = r > 0 ? GREEN : RED;
    g.set_font_size(12);
    g.set_source_rgba(color[0], color[1], color[2], 0.95);
    g.move_to(12 + 2 * column, y + 12);
    g.show_text(r > 0 ? "liked" : "disliked");
    g.set_source_rgba(1, 1, 1, 0.75);
    g.move_to(12 + 2 * column + 58, y + 12);
    g.show_text(`${what} (${beats} beats)`);
  });

  // The last comparison: two bars per feature, with her taste (bright) and
  // without (dim). While one is under way, how far it has got.
  const x3 = 12 + 3 * column;
  if (progress) {
    const [done, pairs] = progress;
    header(3, "Comparing...");
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.75);
    g.move_to(x3, top + 20);
    g.show_text(`${done} of ${pairs} seeds, with her taste and without`);
    sliderTrack(x3, x3 + column - 40, top + 36);
    g.set_source_rgba(AMBER[0], AMBER[1], AMBER[2], 0.9);
    g.rectangle(x3, top + 34, Math.max(2, (done / pairs) * (column - 40)), 4);
    g.fill();
    return;
  }
  if (!shown.compare) {
    header(3, "Compared");
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, FAINT);
    g.move_to(x3, top + 20);
    g.show_text("click taste to compare ten pieces");
    g.move_to(x3, top + 20 + ROW);
    g.show_text("with her taste and without");
    return;
  }
  header(3, `Seeds ${shown.compare[0]}-${shown.compare[1]}: with her taste (without)`);
  const barLeft = x3 + 140;
  const barRoom = column - 140 - 70;
  shown.pairs.slice(0, rows).forEach(([withTaste, without, liked, name], i) => {
    const y = top + 8 + i * ROW;
    const color = liked ? GREEN : RED;
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.8);
    g.move_to(x3, y + 12);
    g.show_text(name);
    g.set_source_rgba(color[0], color[1], color[2], 0.9);
    g.rectangle(barLeft, y + 2, Math.max(1, (withTaste / 100) * barRoom), 7);
    g.fill();
    g.set_source_rgba(color[0], color[1], color[2], 0.35);
    g.rectangle(barLeft, y + 10, Math.max(1, (without / 100) * barRoom), 5);
    g.fill();
    g.set_source_rgba(1, 1, 1, SOFT);
    g.move_to(barLeft + barRoom + 6, y + 12);
    g.show_text(`${withTaste}% (${without}%)`);
  });
}
paintOverview.local = 1;

// The tabs at the top right: the view shown is lit.
function paintTabs(width) {
  const g = mgraphics;
  g.set_font_size(11);
  let x = width - 12 - TABS.reduce((sum, [name]) => sum + name.length * 6 + 18, 0);
  for (const [name, help] of TABS) {
    const w = name.length * 6 + 12;
    const on = name === mode;
    g.set_source_rgba(1, 1, 1, on ? 0.85 : 0.12);
    g.rectangle_rounded(x, 10, w, 18, 6, 6);
    g.fill();
    g.set_source_rgba(on ? 0.1 : 1, on ? 0.1 : 1, on ? 0.12 : 1, on ? 1 : 0.75);
    g.move_to(x + 6, 23);
    g.show_text(name);
    hits.push({ kind: "tab", name, help, x0: x, x1: x + w, y0: 10, y1: 28 });
    x += w + 6;
  }
}
paintTabs.local = 1;

// The weight editor: a column per kind of feature, a slider per feature.
function paintEditor(width, height) {
  const g = mgraphics;
  titleLine("Edit Magdalena's weights", "Drag a slider to pin a feature there (amber). Double-click to release it to what she learned (the thin line).");
  if (!shown) return;

  // Strength: 0..2, top right.
  namedSlider("strength", "strength", width - 230, width - 70, 46);

  const kinds = [];
  for (const w of shown.weights) if (!kinds.includes(w.kind)) kinds.push(w.kind);
  const column = (width - 24) / Math.max(1, kinds.length);
  const top = 72;
  kinds.forEach((kind, k) => {
    const x0 = 12 + k * column;
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.85);
    g.move_to(x0, top);
    g.show_text(kind);
    shown.weights.filter((w) => w.kind === kind).forEach((w, i) => {
      const y = top + 18 + i * 24;
      const t0 = x0 + 112;
      const t1 = x0 + column - 52;
      g.set_font_size(11);
      g.set_source_rgba(1, 1, 1, w.pinned ? 0.95 : 0.7);
      g.move_to(x0, y + 4);
      g.show_text(w.name);
      sliderTrack(t0, t1, y);
      const at = (v) => t0 + ((Number(v) + LIMIT) / (2 * LIMIT)) * (t1 - t0);
      g.set_source_rgba(1, 1, 1, 0.25);
      g.rectangle(at(0), y - 4, 1, 8); // zero
      g.fill();
      g.set_source_rgba(1, 1, 1, 0.85);
      g.rectangle(at(w.learned) - 0.5, y - 7, 2, 14); // what she learned
      g.fill();
      const color = w.pinned ? AMBER : w.value > 0 ? GREEN : w.value < 0 ? RED : [0.6, 0.6, 0.62];
      handle(at(w.value), y, color, w.pinned);
      g.set_font_size(11);
      g.set_source_rgba(1, 1, 1, w.pinned ? 0.95 : 0.6);
      g.move_to(t1 + 8, y + 4);
      g.show_text((w.value > 0 ? "+" : "") + Number(w.value).toFixed(1));
      const help = `${w.name}: ${FEATURES[w.feature] || w.name}. Drag to pin her weight for it (-3: she avoids it, +3: she seeks it); double-click to release it to what she learned (the thin line).`;
      hits.push({ kind: "weight", feature: w.feature, help, x0: t0, x1: t1, y0: y - 10, y1: y + 10 });
    });
  });
}
paintEditor.local = 1;

// A slider for a setting (SLIDERS), with its label to the left and its value
// to the right; a mark at its double-click value.
function namedSlider(name, label, x0, x1, y) {
  const g = mgraphics;
  const range = SLIDERS[name];
  const value = sliderValue(name);
  const at = (v) => x0 + ((v - range.min) / (range.max - range.min)) * (x1 - x0);
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.8);
  g.move_to(x0 - 8 - label.length * 6.2, y + 4);
  g.show_text(label);
  sliderTrack(x0, x1, y);
  g.set_source_rgba(1, 1, 1, 0.5);
  g.rectangle(at(range.reset), y - 5, 1, 10);
  g.fill();
  handle(at(value), y, value === range.reset ? [0.75, 0.75, 0.78] : AMBER, true);
  g.set_source_rgba(1, 1, 1, 0.8);
  g.move_to(x1 + 8, y + 4);
  g.show_text(value.toFixed(2));
  hits.push({ kind: "slider", name, help: range.help, x0, x1, y0: y - 10, y1: y + 10 });
}
namedSlider.local = 1;

// A small drawn button: text in a rounded box; clicking sends `message`.
function button(text, x, y, message, color = [1, 1, 1]) {
  const g = mgraphics;
  g.set_font_size(11);
  const w = text.length * 6 + 12;
  g.set_source_rgba(color[0], color[1], color[2], 0.18);
  g.rectangle_rounded(x, y - 12, w, 16, 6, 6);
  g.fill();
  g.set_source_rgba(color[0], color[1], color[2], 0.95);
  g.move_to(x + 6, y);
  g.show_text(text);
  hits.push({ kind: "button", message, help: BUTTONS[message[0]], x0: x, x1: x + w, y0: y - 12, y1: y + 4 });
  return w;
}
button.local = 1;

// Her memory (M10): her own works, her snapshots, mix and novelty.
function paintMemory(width, height) {
  const g = mgraphics;
  if (!shown || !shown.own) {
    titleLine("Magdalena's memory", "");
    return;
  }
  const o = shown.own;
  const summary = o.works
    ? `Her notebook: ${o.works} ${o.works === 1 ? "work" : "works"}, ${o.beats} beats, ${o.varied} with notes she varied${o.inUse ? "" : " (not in use at mix 0)"}`
    : "Her notebook is empty: keep a piece, a stream phrase, or beats you select.";
  titleLine("Magdalena's memory", summary);
  // On the second line, as strength is in the editor (the tabs are on the first).
  namedSlider("mix", "mix", width - 520, width - 380, 46);
  namedSlider("novelty", "novelty", width - 230, width - 70, 46);

  const column = (width - 24) / 2;
  const top = 72;
  const rows = Math.max(1, Math.floor((height - top - 10) / ROW));
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.85);
  g.move_to(12, top);
  g.show_text("Her notebook (latest first)");
  shown.works.slice(0, rows).forEach((w, i) => {
    const y = top + 8 + (i + 1) * ROW - 6;
    g.set_font_size(12);
    g.set_source_rgba(PURPLE[0], PURPLE[1], PURPLE[2], 0.95);
    g.move_to(12, y);
    g.show_text(w.id);
    g.set_source_rgba(1, 1, 1, 0.75);
    g.move_to(80, y);
    g.show_text(`generation ${w.gen} · ${w.beats} beats${w.varied ? ` · ${w.varied} varied` : ""} · from ${w.what}`);
    button("put aside", 12 + column - 90, y, ["unaccept", w.id], RED);
  });
  if (!shown.works.length) {
    g.set_source_rgba(1, 1, 1, FAINT);
    g.move_to(12, top + 22);
    g.show_text("none yet");
  }

  const x0 = 12 + column;
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.85);
  g.move_to(x0, top);
  g.show_text("Snapshots (latest first)");
  button("keep a snapshot", x0 + 170, top, ["snapshot"], AMBER);
  shown.snapshots.slice(0, rows).forEach((snap, i) => {
    const y = top + 8 + (i + 1) * ROW - 6;
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.9);
    g.move_to(x0, y);
    g.show_text(`#${snap.id}`);
    g.set_source_rgba(1, 1, 1, SOFT);
    g.move_to(x0 + 36, y);
    g.show_text(`${snap.when} · ${snap.label}`);
    button("roll back", x0 + column - 90, y, ["rollback", snap.id], GREEN);
  });
  if (!shown.snapshots.length) {
    g.set_source_rgba(1, 1, 1, FAINT);
    g.move_to(x0, top + 22);
    g.show_text("none yet: one is kept each time a session starts");
  }
}
paintMemory.local = 1;

function sliderTrack(x0, x1, y) {
  mgraphics.set_source_rgba(1, 1, 1, 0.15);
  mgraphics.rectangle(x0, y - 1, x1 - x0, 2);
  mgraphics.fill();
}
sliderTrack.local = 1;

function handle(x, y, color, filled) {
  const g = mgraphics;
  g.set_source_rgba(color[0], color[1], color[2], filled ? 1 : 0.85);
  g.ellipse(x - 5, y - 5, 10, 10);
  if (filled) g.fill();
  else {
    g.set_line_width(1.5);
    g.stroke();
  }
}
handle.local = 1;

function size() {
  if (mgraphics.size) return mgraphics.size;
  const rect = box.rect;
  return [rect[2] - rect[0], rect[3] - rect[1]];
}
size.local = 1;
