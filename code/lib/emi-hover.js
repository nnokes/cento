"use strict";
// Hover help drawn inside a [v8ui] (the window's taste pane, the corpus
// list): a box beside the control under the mouse, saying what it does.
// `g` is the view's mgraphics, passed in, so this stays free of Max.

const CHAR = 6; // px per character at 11 px, near enough

// Words into lines of at most `chars` characters (a longer word on its own).
function wrap(text, chars) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(" ")) {
    if (line && line.length + 1 + word.length > chars) {
      lines.push(line);
      line = word;
    } else line = line ? line + " " + word : word;
  }
  if (line) lines.push(line);
  return lines;
}

// The help for a control at { x0, x1, y0, y1 }: in a box below it (above
// it, near the bottom), wrapped to fit the view.
function drawHelp(g, help, at, width, height) {
  const lines = wrap(help, Math.floor(Math.min(560, width - 24) / CHAR));
  const w = Math.max(...lines.map((l) => l.length)) * CHAR + 16;
  const h = lines.length * 15 + 8;
  const x = Math.max(6, Math.min(width - w - 6, at.x0));
  const y = at.y1 + 4 + h <= height - 4 ? at.y1 + 4 : Math.max(4, at.y0 - h - 4);
  g.set_source_rgba(0.04, 0.04, 0.05, 0.96);
  g.rectangle_rounded(x, y, w, h, 6, 6);
  g.fill();
  g.set_source_rgba(1, 1, 1, 0.3);
  g.set_line_width(1);
  g.rectangle_rounded(x, y, w, h, 6, 6);
  g.stroke();
  g.set_font_size(11);
  g.set_source_rgba(1, 1, 1, 0.95);
  lines.forEach((line, k) => {
    g.move_to(x + 8, y + 15 + k * 15);
    g.show_text(line);
  });
}

exports.wrap = wrap;
exports.drawHelp = drawHelp;
