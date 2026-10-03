// [v8ui] Emily's taste, large, in the pop-up window (emi.window). Patches
// load patchers/emi.taste.bundle.js.
//
// Four columns: what she likes and dislikes most (a bar per feature, its
// weight from -3 to +3), the last ratings, and the last comparison made with
// "taste" (each feature's share of beats in ten pieces with her taste, and
// without).
//
// "edit" (the window's "edit weights" button) switches to the weight
// editor: a slider per musical feature, grouped by kind, from -3 to +3.
// Dragging one pins the feature at that value ("pin <feature> <w>" to the
// engine); double-clicking releases it to what she learned, shown as a thin
// line on its slider ("unpin <feature>"). A strength slider (0..2) scales her
// whole taste ("strength <v>"); double-click it for 1. "edit" again goes
// back. The engine sends it all at once, whenever it changes:
//   clear <ratings> <likes> <sessions> <temperature>
//   like <weight> <name...>               (strongest first)
//   dislike <weight> <name...>
//   rating <1|-1> <beats> <what...>       (latest first)
//   compare <first seed> <last seed>
//   pair <% with> <% without> <liked 1|0> <name...>
//   strength <v>
//   weight <kind> <feature> <learned> <pinned 1|0> <in use> <name...>
//   done                                  (draw it)

autowatch = 1;
inlets = 1;
outlets = 1;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

const GREEN = [0.45, 0.8, 0.45];
const RED = [0.95, 0.42, 0.35];
const LIMIT = 3; // weights stay within -3..+3 (emily-assoc)
const ROW = 20;
const AMBER = [1, 0.75, 0.25];
const STEP = 0.1; // a pinned weight's resolution
const MAX_STRENGTH = 2;

let shown = null;
let incoming = null;
let editing = false;
let hits = []; // the sliders as last drawn: { kind: "weight" | "strength", feature, x0, x1, y0, y1 }
let dragging = null; // the slider being dragged (its hit)

function clear(ratings, likes, sessions, temperature) {
  incoming = { ratings, likes, sessions, temperature, liked: [], disliked: [], recent: [], compare: null, pairs: [], strength: 1, weights: [] };
}

function strength(v) {
  if (incoming) incoming.strength = v;
}

function weight(kind, feature, learned, pinned, value, ...name) {
  if (incoming) incoming.weights.push({ kind: String(kind), feature: String(feature), learned, pinned: Boolean(pinned), value, name: name.join(" ") });
}

function edit() {
  editing = !editing;
  dragging = null;
  mgraphics.redraw();
}

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
  if (!editing || !shown) return;
  dragging = hitAt(x, y);
  if (dragging) moveTo(x);
}

function ondrag(x, y, button) {
  if (dragging) moveTo(x);
  if (!button) dragging = null;
}

function ondblclick(x, y) {
  if (!editing || !shown) return;
  const hit = hitAt(x, y);
  dragging = null;
  if (!hit) return;
  if (hit.kind === "strength") {
    shown.strength = 1;
    outlet(0, "strength", 1);
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

// The dragged slider follows the mouse; the engine hears each new value.
function moveTo(x) {
  const h = dragging;
  const share = Math.max(0, Math.min(1, (x - h.x0) / (h.x1 - h.x0)));
  if (h.kind === "strength") {
    const v = Math.round(share * MAX_STRENGTH * 20) / 20;
    if (v === shown.strength) return;
    shown.strength = v;
    outlet(0, "strength", v);
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
  if (editing) {
    paintEditor(width, height);
    return;
  }

  // The title line.
  g.set_font_size(16);
  g.set_source_rgba(1, 1, 1, 0.95);
  g.move_to(12, 24);
  g.show_text("Emily's taste");
  if (!shown) return;
  const parts = [shown.ratings + (shown.ratings === 1 ? " rating" : " ratings")];
  if (shown.ratings) parts[0] += ` (${shown.likes} liked, ${shown.ratings - shown.likes} disliked)`;
  if (shown.sessions) parts.push(shown.sessions + (shown.sessions === 1 ? " earlier session" : " earlier sessions"));
  const pins = shown.weights.filter((w) => w.pinned).length;
  if (pins) parts.push(pins + (pins === 1 ? " feature pinned" : " features pinned"));
  if (Number(shown.strength) !== 1) parts.push("strength " + Number(shown.strength).toFixed(2));
  parts.push("temperature " + Number(shown.temperature).toFixed(2));
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.6);
  g.move_to(130, 24);
  g.show_text(parts.join("  ·  "));

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
      g.set_source_rgba(1, 1, 1, 0.6);
      g.move_to(barLeft + Math.max(2, (Math.abs(weight) / LIMIT) * barRoom) + 5, y + 12);
      g.show_text((weight > 0 ? "+" : "") + Number(weight).toFixed(2));
    });
    if (!list.length) {
      g.set_font_size(12);
      g.set_source_rgba(1, 1, 1, 0.4);
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
  // without (dim).
  const x3 = 12 + 3 * column;
  if (!shown.compare) {
    header(3, "Compared");
    g.set_font_size(12);
    g.set_source_rgba(1, 1, 1, 0.4);
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
    g.set_source_rgba(1, 1, 1, 0.65);
    g.move_to(barLeft + barRoom + 6, y + 12);
    g.show_text(`${withTaste}% (${without}%)`);
  });
}

// The weight editor: a column per kind of feature, a slider per feature.
function paintEditor(width, height) {
  const g = mgraphics;
  g.set_font_size(16);
  g.set_source_rgba(1, 1, 1, 0.95);
  g.move_to(12, 24);
  g.show_text("Edit Emily's weights");
  g.set_font_size(12);
  g.set_source_rgba(1, 1, 1, 0.6);
  g.move_to(175, 24);
  g.show_text("Drag a slider to pin a feature there (amber). Double-click to release it to what she learned (the thin line).");
  if (!shown) return;

  // Strength: 0..2, top right.
  const sx0 = width - 230;
  const sx1 = width - 70;
  g.set_source_rgba(1, 1, 1, 0.8);
  g.move_to(sx0 - 58, 50);
  g.show_text("strength");
  sliderTrack(sx0, sx1, 46);
  const sx = sx0 + (Number(shown.strength) / MAX_STRENGTH) * (sx1 - sx0);
  g.set_source_rgba(1, 1, 1, 0.5);
  g.rectangle(sx0 + (sx1 - sx0) / 2, 41, 1, 10);
  g.fill();
  handle(sx, 46, Number(shown.strength) === 1 ? [0.75, 0.75, 0.78] : AMBER, true);
  g.set_source_rgba(1, 1, 1, 0.8);
  g.move_to(sx1 + 8, 50);
  g.show_text(Number(shown.strength).toFixed(2));
  hits.push({ kind: "strength", feature: null, x0: sx0, x1: sx1, y0: 36, y1: 56 });

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
      hits.push({ kind: "weight", feature: w.feature, x0: t0, x1: t1, y0: y - 10, y1: y + 10 });
    });
  });
}
paintEditor.local = 1;

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
