// [v8ui] Emily's taste, large, in the pop-up window (emi.window). Patches
// load patchers/emi.taste.bundle.js.
//
// Four columns: what she likes and dislikes most (a bar per feature, its
// weight from -3 to +3), the last ratings, and the last comparison made with
// "taste" (each feature's share of beats in ten pieces with her taste, and
// without). The engine sends it all at once, whenever it changes:
//   clear <ratings> <likes> <sessions> <temperature>
//   like <weight> <name...>               (strongest first)
//   dislike <weight> <name...>
//   rating <1|-1> <beats> <what...>       (latest first)
//   compare <first seed> <last seed>
//   pair <% with> <% without> <liked 1|0> <name...>
//   done                                  (draw it)

autowatch = 1;
inlets = 1;
outlets = 0;

mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;

const GREEN = [0.45, 0.8, 0.45];
const RED = [0.95, 0.42, 0.35];
const LIMIT = 3; // weights stay within -3..+3 (emily-assoc)
const ROW = 20;

let shown = null;
let incoming = null;

function clear(ratings, likes, sessions, temperature) {
  incoming = { ratings, likes, sessions, temperature, liked: [], disliked: [], recent: [], compare: null, pairs: [] };
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

function paint() {
  const [width, height] = size();
  const g = mgraphics;
  g.set_source_rgba(0.12, 0.12, 0.13, 1);
  g.rectangle(0, 0, width, height);
  g.fill();
  g.select_font_face("Arial");

  // The title line.
  g.set_font_size(16);
  g.set_source_rgba(1, 1, 1, 0.95);
  g.move_to(12, 24);
  g.show_text("Emily's taste");
  if (!shown) return;
  const parts = [shown.ratings + (shown.ratings === 1 ? " rating" : " ratings")];
  if (shown.ratings) parts[0] += ` (${shown.likes} liked, ${shown.ratings - shown.likes} disliked)`;
  if (shown.sessions) parts.push(shown.sessions + (shown.sessions === 1 ? " earlier session" : " earlier sessions"));
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

function size() {
  if (mgraphics.size) return mgraphics.size;
  const rect = box.rect;
  return [rect[2] - rect[0], rect[3] - rect[1]];
}
size.local = 1;
