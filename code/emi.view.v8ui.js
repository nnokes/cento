// [v8ui] piano roll for the engine's current score, inside emi.view. Patches
// load patchers/emi.view.bundle.js.
//
// Notes are colored by source chorale for composed pieces (by voice for a
// single chorale); thin lines mark bars, bright lines mark seams, where the
// source changes. The engine sends one score as:
//   clear <lengthTicks> <lowPitch> <highPitch> <barTicks>
//   note <on> <dur> <pitch> <color>      (one per note)
//   seam <tick>                          (one per change of source)
//   done                                 (draw it)

autowatch = 1;
inlets = 1;
outlets = 0;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

// Twelve colors that stay apart on a dark background; they repeat after 12.
const PALETTE = [
  [0.95, 0.55, 0.35], [0.35, 0.7, 0.95], [0.6, 0.85, 0.4], [0.95, 0.8, 0.3],
  [0.75, 0.5, 0.95], [0.3, 0.85, 0.75], [0.95, 0.45, 0.6], [0.55, 0.6, 0.95],
  [0.85, 0.65, 0.45], [0.45, 0.9, 0.55], [0.9, 0.4, 0.4], [0.7, 0.75, 0.8],
];

let shown = null; // the score being drawn
let incoming = null; // the score being received

function clear(lengthTicks, low, high, barTicks) {
  incoming = { lengthTicks, low, high, barTicks, notes: [], seams: [] };
}

function note(on, dur, pitch, color) {
  if (incoming) incoming.notes.push([on, dur, pitch, color]);
}

function seam(tick) {
  if (incoming) incoming.seams.push(tick);
}

function done() {
  if (incoming) shown = incoming;
  incoming = null;
  mgraphics.redraw();
}

function onresize() {
  mgraphics.redraw();
}

function paint() {
  const [width, height] = size();
  const g = mgraphics;
  g.set_source_rgba(0.12, 0.12, 0.13, 1);
  g.rectangle(0, 0, width, height);
  g.fill();
  if (!shown || shown.lengthTicks <= 0) {
    g.set_source_rgba(0.6, 0.6, 0.6, 1);
    g.select_font_face("Arial");
    g.set_font_size(11);
    g.move_to(8, 18);
    g.show_text("load a chorale or compose a piece");
    return;
  }

  const rows = shown.high - shown.low + 3; // one empty row above and below
  const rowHeight = height / rows;
  const x = (tick) => (tick / shown.lengthTicks) * width;
  const y = (pitch) => (shown.high + 1 - pitch) * rowHeight;

  g.set_line_width(1);
  g.set_source_rgba(1, 1, 1, 0.08);
  for (let t = 0; t <= shown.lengthTicks; t += shown.barTicks) {
    g.move_to(Math.round(x(t)) + 0.5, 0);
    g.line_to(Math.round(x(t)) + 0.5, height);
  }
  g.stroke();

  for (const [on, dur, pitch, color] of shown.notes) {
    const [r, gr, b] = PALETTE[((color % PALETTE.length) + PALETTE.length) % PALETTE.length];
    g.set_source_rgba(r, gr, b, 0.9);
    g.rectangle(x(on), y(pitch), Math.max(1, x(on + dur) - x(on) - 1), Math.max(1, rowHeight - 1));
    g.fill();
  }

  g.set_source_rgba(1, 1, 1, 0.35);
  for (const tick of shown.seams) {
    g.move_to(Math.round(x(tick)) + 0.5, 0);
    g.line_to(Math.round(x(tick)) + 0.5, height);
  }
  g.stroke();
}

function size() {
  if (mgraphics.size) return mgraphics.size;
  const rect = box.rect;
  return [rect[2] - rect[0], rect[3] - rect[1]];
}
size.local = 1;
