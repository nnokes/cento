"use strict";
// M8: the blind A/B listening test as one self-contained web page (no files
// beside it, no server). The page plays each pair with a small organ sound
// (Web Audio), takes the listener's choices, and shows the score at the end,
// with the chance of doing as well by guessing (emi-abtest).
//
//   page(test, { standalone }) -> HTML text
// standalone: a whole document (to open from disk); otherwise the body only
// (for a host page that adds its own <head>).

const { seal } = require("emi-abtest");

const STYLE = `
:root {
  /* One column of numbered pairs, like a hymnal's numbered verses; the
     results sheet closes it. Playback progress runs along a five-line staff. */
  --paper: #eef1ee;
  --card: #f8faf8;
  --ink: #1b2425;
  --muted: #59696a;
  --staff: #b8c4c1;
  --accent: #1f5c6a;
  --accent-ink: #f4f8f8;
  --right: #2e7a4f;
  --wrong: #a8432f;
  --display: "Young Serif", "Iowan Old Style", "Palatino Linotype", Georgia, serif;
  --body: "Atkinson Hyperlegible", "Segoe UI", system-ui, -apple-system, sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --paper: #121718; --card: #1a2122; --ink: #e3eae7; --muted: #94a4a1; --staff: #34413f;
    --accent: #79bdc8; --accent-ink: #0f1a1c; --right: #74c290; --wrong: #e58a73; color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --paper: #121718; --card: #1a2122; --ink: #e3eae7; --muted: #94a4a1; --staff: #34413f;
  --accent: #79bdc8; --accent-ink: #0f1a1c; --right: #74c290; --wrong: #e58a73; color-scheme: dark;
}
* { box-sizing: border-box; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 1rem/1.55 var(--body); }
.sheet { max-width: 46rem; margin: 0 auto; padding-inline: 16px; padding-block: 2.5rem 4rem; display: grid; gap: 2rem; }
header { display: grid; gap: 0.6rem; }
.eyebrow { margin: 0; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(2.2rem, 7vw, 3.2rem)/1.05 var(--display); text-wrap: balance; }
.lede { margin: 0; max-width: 62ch; }
.meta { margin: 0; color: var(--muted); font-size: 0.9rem; font-variant-numeric: tabular-nums; }
ol.pairs { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.pair { background: var(--card); border: 1px solid var(--staff); border-radius: 6px; padding: 1rem; display: grid; gap: 0.85rem; }
.pair-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.num { font: 400 1.25rem/1 var(--display); }
.key { color: var(--muted); font-size: 0.88rem; font-variant-numeric: tabular-nums; }
.takes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
@media (max-width: 34rem) { .takes { grid-template-columns: 1fr; } }
.take { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 0.6rem; min-width: 0; }
button { font: inherit; cursor: pointer; border-radius: 4px; }
button:focus-visible, input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; }
.play { min-width: 6.2rem; padding: 0.45rem 0.8rem; border: 1px solid var(--accent); background: transparent; color: var(--accent); font-weight: 700; }
.play[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }
.staff { position: relative; height: 1.6rem; min-width: 0;
  background: repeating-linear-gradient(to bottom, var(--staff) 0 1px, transparent 1px 0.4rem); background-size: 100% 1.61rem; }
.head { position: absolute; top: -0.15rem; bottom: -0.1rem; left: 0; width: 2px; background: var(--accent); opacity: 0; }
.playing .head { opacity: 1; }
.choice { border: 0; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.choice legend { float: left; margin-right: 0.25rem; color: var(--muted); font-size: 0.92rem; }
.choice label { position: relative; }
.choice input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.choice span { display: inline-block; padding: 0.3rem 0.9rem; border: 1px solid var(--staff); border-radius: 999px; cursor: pointer; }
.choice input:checked + span { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }
.results { display: grid; gap: 1rem; border-top: 1px solid var(--staff); padding-top: 1.5rem; }
.results h2 { margin: 0; }
#result { display: grid; gap: 1rem; }
#result[hidden] { display: none; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; }
.primary { padding: 0.6rem 1.2rem; border: 0; background: var(--accent); color: var(--accent-ink); font-weight: 700; }
.secondary { padding: 0.55rem 1rem; border: 1px solid var(--staff); background: transparent; color: var(--ink); }
#answered { color: var(--muted); font-variant-numeric: tabular-nums; }
.score { margin: 0; font: 400 clamp(2rem, 6vw, 2.8rem)/1.1 var(--display); font-variant-numeric: tabular-nums; }
.verdict { margin: 0; max-width: 62ch; }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 0.92rem; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--staff); white-space: nowrap; }
th { font-weight: 700; color: var(--muted); font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; }
.right { color: var(--right); font-weight: 700; }
.wrong { color: var(--wrong); font-weight: 700; }
#copied { color: var(--muted); }
textarea { width: 100%; min-height: 8rem; font: 0.85rem/1.4 ui-monospace, Menlo, monospace; background: var(--card); color: var(--ink); border: 1px solid var(--staff); border-radius: 4px; padding: 0.5rem; }
footer { color: var(--muted); font-size: 0.85rem; max-width: 62ch; }
@media (prefers-reduced-motion: reduce) { .head { transition: none; } }
`;

const SCRIPT = `
(function () {
  var test = JSON.parse(document.getElementById("test-data").textContent);
  var sealed = JSON.parse(document.getElementById("test-key").textContent);
  var store = "ml_midi:" + test.id;
  var choices = {};
  try { choices = JSON.parse(localStorage.getItem(store) || "{}") || {}; } catch (e) { choices = {}; }

  var list = document.getElementById("pairs");
  test.pairs.forEach(function (pair, i) {
    var li = document.createElement("li");
    li.className = "pair";
    li.id = "pair-" + (i + 1);
    var length = function (notes) { var end = 0; notes.forEach(function (n) { end = Math.max(end, n[0] + n[2]); }); return end; };
    var seconds = function (notes) { var s = Math.round(length(notes) * 60 / test.tempo); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
    li.innerHTML =
      '<div class="pair-head"><span class="num">Pair ' + (i + 1) + '</span><span class="key">' + pair.key + " · " + pair.beatsPerBar + "/4 · " + pair.bars + " bars</span></div>" +
      '<div class="takes">' +
      ["A", "B"].map(function (side) {
        return '<div class="take" id="take-' + (i + 1) + side + '"><button class="play" type="button" aria-pressed="false" data-pair="' + i + '" data-side="' + side + '">Play ' + side +
          '</button><div class="staff" title="' + seconds(pair[side]) + '"><span class="head"></span></div></div>';
      }).join("") +
      "</div>" +
      '<fieldset class="choice"><legend>Which is Bach?</legend>' +
      ["A", "B"].map(function (side) {
        return '<label><input type="radio" id="choice-' + (i + 1) + side + '" name="choice-' + (i + 1) + '" value="' + side + '"' + (choices[i] === side ? " checked" : "") + "><span>" + side + "</span></label>";
      }).join("") +
      "</fieldset>";
    list.appendChild(li);
  });

  // ---- sound: a small organ, one oscillator per note
  var ctx = null, wave = null, current = null;
  function audio() {
    if (!ctx) {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      var real = new Float32Array([0, 1, 0.42, 0.24, 0.12, 0.06, 0.03]);
      wave = ctx.createPeriodicWave(real, new Float32Array(real.length));
    }
    return ctx;
  }
  function stop() {
    if (!current) return;
    var now = ctx.currentTime;
    current.master.gain.setTargetAtTime(0, now, 0.03);
    current.nodes.forEach(function (o) { try { o.stop(now + 0.15); } catch (e) {} });
    cancelAnimationFrame(current.frame);
    current.button.setAttribute("aria-pressed", "false");
    current.button.textContent = "Play " + current.side;
    current.take.classList.remove("playing");
    current = null;
  }
  function play(button) {
    var i = Number(button.dataset.pair), side = button.dataset.side;
    var same = current && current.button === button;
    stop();
    if (same) return;
    var c = audio();
    if (c.state === "suspended") c.resume();
    var notes = test.pairs[i][side];
    var beat = 60 / test.tempo;
    var t0 = c.currentTime + 0.1;
    var master = c.createGain();
    master.gain.value = 0.8;
    master.connect(c.destination);
    var pans = [-0.35, -0.12, 0.12, 0.35];
    var nodes = [], end = 0;
    notes.forEach(function (n) {
      var start = t0 + n[0] * beat, stopAt = start + n[2] * beat;
      end = Math.max(end, stopAt);
      var osc = c.createOscillator();
      osc.setPeriodicWave(wave);
      osc.frequency.value = 440 * Math.pow(2, (n[1] - 69) / 12);
      var g = c.createGain();
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.1, start + 0.03);
      g.gain.setValueAtTime(0.1, Math.max(start + 0.03, stopAt - 0.07));
      g.gain.linearRampToValueAtTime(0, stopAt);
      var out = g;
      if (c.createStereoPanner) { var pan = c.createStereoPanner(); pan.pan.value = pans[n[3] - 1] || 0; g.connect(pan); out = pan; }
      osc.connect(g);
      out.connect(master);
      osc.start(start);
      osc.stop(stopAt + 0.05);
      nodes.push(osc);
    });
    var take = document.getElementById("take-" + (i + 1) + side);
    var head = take.querySelector(".head");
    button.setAttribute("aria-pressed", "true");
    button.textContent = "Stop";
    take.classList.add("playing");
    current = { button: button, side: side, take: take, master: master, nodes: nodes, frame: 0 };
    var tick = function () {
      if (!current || current.button !== button) return;
      var f = Math.min(1, Math.max(0, (c.currentTime - t0) / (end - t0)));
      head.style.left = "calc(" + (f * 100) + "% - 1px)";
      if (c.currentTime > end + 0.2) { stop(); return; }
      current.frame = requestAnimationFrame(tick);
    };
    tick();
  }
  list.addEventListener("click", function (e) {
    var button = e.target.closest("button.play");
    if (button) play(button);
  });

  // ---- choices and results
  var answeredText = document.getElementById("answered");
  function count() { return Object.keys(choices).length; }
  function showCount() { answeredText.textContent = count() + " of " + test.pairs.length + " answered"; }
  list.addEventListener("change", function (e) {
    var m = /^choice-(\\d+)$/.exec(e.target.name || "");
    if (!m) return;
    choices[Number(m[1]) - 1] = e.target.value;
    try { localStorage.setItem(store, JSON.stringify(choices)); } catch (err) {}
    showCount();
  });
  showCount();

  function chance(k, n) {
    var total = 0, ways = 1;
    for (var j = 0; j <= n; j++) { if (j >= k) total += ways; ways = ways * (n - j) / (j + 1); }
    return total / Math.pow(2, n);
  }
  var report = "";
  document.getElementById("show").addEventListener("click", function () {
    stop();
    var answers = JSON.parse(sealed.map(function (c) { return String.fromCharCode(c ^ 0x5a); }).join(""));
    var n = 0, right = 0, rows = [];
    answers.forEach(function (a, i) {
      var pick = choices[i] || null;
      if (pick) { n++; if (pick === a.bach) right++; }
      rows.push("<tr><td>" + (i + 1) + "</td><td>" + a.bach + "</td><td>" + (pick ? '<span class="' + (pick === a.bach ? "right" : "wrong") + '">' + pick + (pick === a.bach ? " ✓" : " ✗") + "</span>" : "–") +
        "</td><td>" + a.chorale + "</td><td>" + a.piece + ", form of " + a.template + "</td></tr>");
    });
    var p = n ? chance(right, n) : 1;
    var pText = p < 0.001 ? "under 0.001" : p.toFixed(3);
    document.getElementById("score").textContent = right + " of " + n + " right";
    document.getElementById("verdict").textContent = !n ? "Answer some pairs first." :
      p < 0.05 ? "You picked Bach out more often than guessing would: the chance of " + right + " or more right out of " + n + " by guessing is " + pText + "." :
      "Within what guessing gives: the chance of " + right + " or more right out of " + n + " by guessing is " + pText + ", so these pieces weren't reliably told apart from Bach.";
    document.getElementById("reveal").innerHTML = "<table><thead><tr><th>Pair</th><th>Bach</th><th>Your pick</th><th>Bach's chorale</th><th>ml_midi piece</th></tr></thead><tbody>" + rows.join("") + "</tbody></table>";
    report = test.id + ": " + right + " of " + n + " right (chance by guessing " + pText + ")\\n" +
      answers.map(function (a, i) { return "pair " + (i + 1) + ": Bach " + a.bach + " (" + a.chorale + "), picked " + (choices[i] || "-"); }).join("\\n");
    document.getElementById("result").hidden = false;
  });
  document.getElementById("copy").addEventListener("click", function () {
    var done = document.getElementById("copied");
    var fallback = function () {
      var box = document.getElementById("report");
      box.hidden = false; box.value = report; box.focus(); box.select();
      done.textContent = "Select and copy the text below.";
    };
    try {
      navigator.clipboard.writeText(report).then(function () { done.textContent = "Copied."; }, fallback);
    } catch (e) { fallback(); }
  });
})();
`;

function page(test, { standalone = true } = {}) {
  const data = JSON.stringify({ id: test.id, tempo: test.tempo, pairs: test.pairs }).replace(/</g, "\\u003c");
  const key = JSON.stringify(seal(test.answers));
  const minutes = Math.round(test.pairs.reduce((sum, p) => sum + Math.max(...[...p.A, ...p.B].map((n) => n[0] + n[2])) * 2, 0) * (60 / test.tempo) / 60);
  const head = `<title>Which Is Bach?</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Young+Serif&display=swap">
<style>${STYLE}</style>`;
  const body = `<main class="sheet">
  <header>
    <p class="eyebrow">Blind listening test · ml_midi</p>
    <h1>Which is Bach?</h1>
    <p class="lede">Each pair is one chorale harmonized by J. S. Bach and one piece that ml_midi recombined from his chorales, after David Cope's EMI. Both have the same form and key. Play both, then choose the one you think Bach wrote. The answers stay hidden until you ask for the results.</p>
    <p class="meta">${test.pairs.length} pairs · ♩ = ${test.tempo} · organ sound · about ${minutes} minutes to hear everything</p>
  </header>
  <ol class="pairs" id="pairs"></ol>
  <section class="results" aria-labelledby="results-title">
    <h2 id="results-title" class="num">Results</h2>
    <div class="actions">
      <button class="primary" type="button" id="show">Show results</button>
      <span id="answered">0 answered</span>
    </div>
    <div id="result" hidden>
      <p class="score" id="score"></p>
      <p class="verdict" id="verdict"></p>
      <div class="table-wrap" id="reveal"></div>
      <div class="actions">
        <button class="secondary" type="button" id="copy">Copy results</button>
        <span id="copied"></span>
      </div>
      <textarea id="report" hidden readonly aria-label="Results as text"></textarea>
    </div>
  </section>
  <footer>Your choices are kept in this browser until you finish. Pieces are played without the pauses singers take at fermatas, Bach's and ml_midi's alike.</footer>
</main>
<script type="application/json" id="test-data">${data}</script>
<script type="application/json" id="test-key">${key}</script>
<script>${SCRIPT}</script>`;
  if (!standalone) return head + "\n" + body;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>
${body}
</body>
</html>
`;
}

exports.page = page;
