"use strict";
// M8: the blind A/B listening test as one self-contained web page (no files
// beside it, no server). The page plays each pair with a small organ sound
// (Web Audio), takes the listener's choices, and shows the score at the end,
// with the chance of doing as well by guessing (emi-abtest).
//
// A listener first chooses 5 pairs (a random 5 of the test's 10) or all 10,
// with an estimate of the listening time. Each pair can be marked "I know
// this tune": a listener who recognizes one of Bach's hymn tunes knows which
// is Bach without judging the harmony, so results are also scored without
// those pairs.
//
// Published as a claude.ai artifact with the `db` and `user` capabilities
// (see RULES), finished tests are saved where the listener may write, and
// the owner sees every result at the page's #results view, where results a
// listener sent as text can be pasted in. Opened from disk (the A/B button
// in Max), the page works the same without saving.
//
//   page(test, { standalone }) -> HTML text
// standalone: a whole document (to open from disk); otherwise the body only
// (for a host page that adds its own <head>).

const { seal } = require("emi-abtest");

// The db access rules for the published page: each listener writes only
// their own results (results/<their id>); only the owner (and editors) read
// them all, and only they add results pasted from text (pasted/...).
const RULES = [
  { path: "results", read: "admin", write: "admin" },
  { path: "results/{self}", read: "interact", write: "interact" },
  { path: "pasted", read: "admin", write: "admin" },
];

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
[hidden] { display: none !important; }
body { margin: 0; background: var(--paper); color: var(--ink); font: 1rem/1.55 var(--body); }
.sheet { max-width: 46rem; margin: 0 auto; padding-inline: 16px; padding-block: 2.5rem 4rem; display: grid; gap: 2rem; }
header { display: grid; gap: 0.6rem; }
.eyebrow { margin: 0; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
h1 { margin: 0; font: 400 clamp(2.2rem, 7vw, 3.2rem)/1.05 var(--display); text-wrap: balance; }
h2 { margin: 0; font: 400 1.4rem/1.2 var(--display); }
.lede { margin: 0; max-width: 62ch; }
.meta { margin: 0; color: var(--muted); font-size: 0.9rem; font-variant-numeric: tabular-nums; }
.start { display: grid; gap: 0.9rem; }
.sizes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
@media (max-width: 30rem) { .sizes { grid-template-columns: 1fr; } }
.size { display: grid; gap: 0.15rem; justify-items: start; text-align: left; padding: 1rem; border: 1px solid var(--accent); background: var(--card); color: var(--ink); border-radius: 6px; }
.size strong { font: 400 1.5rem/1.1 var(--display); color: var(--accent); }
.size span { color: var(--muted); font-size: 0.92rem; font-variant-numeric: tabular-nums; }
ol.pairs { list-style: none; margin: 0; padding: 0; display: grid; gap: 1rem; }
.pair { background: var(--card); border: 1px solid var(--staff); border-radius: 6px; padding: 1rem; display: grid; gap: 0.85rem; }
.pair-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0.5rem; }
.num { font: 400 1.25rem/1 var(--display); }
.key { color: var(--muted); font-size: 0.88rem; font-variant-numeric: tabular-nums; }
.takes { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
@media (max-width: 34rem) { .takes { grid-template-columns: 1fr; } }
.take { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 0.6rem; min-width: 0; }
button { font: inherit; cursor: pointer; border-radius: 4px; }
button:disabled { cursor: default; opacity: 0.55; }
button:focus-visible, input:focus-visible + span, .known input:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.play { min-width: 6.2rem; padding: 0.45rem 0.8rem; border: 1px solid var(--accent); background: transparent; color: var(--accent); font-weight: 700; }
.play[aria-pressed="true"] { background: var(--accent); color: var(--accent-ink); }
.staff { position: relative; height: 1.6rem; min-width: 0;
  background: repeating-linear-gradient(to bottom, var(--staff) 0 1px, transparent 1px 0.4rem); background-size: 100% 1.61rem; }
.head { position: absolute; top: -0.15rem; bottom: -0.1rem; left: 0; width: 2px; background: var(--accent); opacity: 0; }
.playing .head { opacity: 1; }
.answer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; }
.choice { border: 0; margin: 0; padding: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
.choice legend { float: left; margin-right: 0.25rem; color: var(--muted); font-size: 0.92rem; }
.choice label { position: relative; }
.choice input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.choice span { display: inline-block; padding: 0.3rem 0.9rem; border: 1px solid var(--staff); border-radius: 999px; cursor: pointer; }
.choice input:checked + span { border-color: var(--accent); background: var(--accent); color: var(--accent-ink); }
.known { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--muted); font-size: 0.9rem; cursor: pointer; }
.known input { width: 1rem; height: 1rem; accent-color: var(--accent); }
.results { display: grid; gap: 1rem; border-top: 1px solid var(--staff); padding-top: 1.5rem; }
#result, .board { display: grid; gap: 1rem; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; }
.primary { padding: 0.6rem 1.2rem; border: 0; background: var(--accent); color: var(--accent-ink); font-weight: 700; }
.secondary { padding: 0.55rem 1rem; border: 1px solid var(--staff); background: transparent; color: var(--ink); }
.quiet { padding: 0.2rem 0.5rem; border: 1px solid var(--staff); background: transparent; color: var(--muted); font-size: 0.85rem; }
#answered, .note { color: var(--muted); font-variant-numeric: tabular-nums; }
.note { margin: 0; max-width: 62ch; }
.score { margin: 0; font: 400 clamp(2rem, 6vw, 2.8rem)/1.1 var(--display); font-variant-numeric: tabular-nums; }
.verdict { margin: 0; max-width: 62ch; }
.saved { margin: 0; padding: 0.6rem 0.8rem; border-left: 3px solid var(--accent); background: var(--card); max-width: 62ch; }
.saved:empty { display: none; }
.table-wrap { overflow-x: auto; }
table { border-collapse: collapse; width: 100%; font-size: 0.92rem; font-variant-numeric: tabular-nums; }
th, td { text-align: left; padding: 0.45rem 0.6rem; border-bottom: 1px solid var(--staff); white-space: nowrap; }
th { font-weight: 700; color: var(--muted); font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; }
.right { color: var(--right); font-weight: 700; }
.wrong { color: var(--wrong); font-weight: 700; }
.figures { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 0.75rem; }
.figure { background: var(--card); border: 1px solid var(--staff); border-radius: 6px; padding: 0.8rem 1rem; display: grid; gap: 0.2rem; }
.figure b { font: 400 1.6rem/1.1 var(--display); font-variant-numeric: tabular-nums; }
.figure span { color: var(--muted); font-size: 0.85rem; }
.paste { display: grid; gap: 0.6rem; background: var(--card); border: 1px solid var(--staff); border-radius: 6px; padding: 1rem; }
.paste label { display: grid; gap: 0.3rem; font-size: 0.9rem; color: var(--muted); }
input[type="text"], textarea { width: 100%; font: 0.9rem/1.4 var(--body); background: var(--paper); color: var(--ink); border: 1px solid var(--staff); border-radius: 4px; padding: 0.5rem; }
textarea { min-height: 7rem; font-family: ui-monospace, Menlo, monospace; }
footer { color: var(--muted); font-size: 0.85rem; max-width: 62ch; }
@media (prefers-reduced-motion: reduce) { .head { transition: none; } }
`;

const SCRIPT = `
(function () {
  var test = JSON.parse(document.getElementById("test-data").textContent);
  var sealed = JSON.parse(document.getElementById("test-key").textContent);
  var answers = function () { return JSON.parse(sealed.map(function (c) { return String.fromCharCode(c ^ 0x5a); }).join("")); };
  var store = "ml_midi:" + test.id;
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(store) || "{}") || {}; } catch (e) { saved = {}; }
  // saved: { size, chosen: [pair indexes], picks: {index: "A"|"B"}, known: [indexes], done }
  saved.picks = saved.picks || {};
  saved.known = saved.known || [];
  function keep() { try { localStorage.setItem(store, JSON.stringify(saved)); } catch (e) {} }
  var $ = function (id) { return document.getElementById(id); };
  var lengthOf = function (notes) { var end = 0; notes.forEach(function (n) { end = Math.max(end, n[0] + n[2]); }); return end; };
  var secondsOf = function (pair) { return (lengthOf(pair.A) + lengthOf(pair.B)) * 60 / test.tempo; };
  var minutes = function (s) { return Math.max(1, Math.round(s / 60)); };
  var clock = function (notes) { var s = Math.round(lengthOf(notes) * 60 / test.tempo); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  function chance(k, n) {
    var total = 0, ways = 1;
    for (var j = 0; j <= n; j++) { if (j >= k) total += ways; ways = ways * (n - j) / (j + 1); }
    return total / Math.pow(2, n);
  }
  var pText = function (p) { return p < 0.001 ? "under 0.001" : p.toFixed(3); };
  // The code a listener sends: the test and each pair's pick (* = tune known).
  function codeOf(picks, known) {
    return "code: " + test.id + " " + Object.keys(picks).map(Number).sort(function (a, b) { return a - b; })
      .map(function (i) { return (i + 1) + picks[i] + (known.indexOf(i) >= 0 ? "*" : ""); }).join(" ");
  }
  function score(picks, known, key) {
    var n = 0, right = 0, n2 = 0, right2 = 0;
    Object.keys(picks).forEach(function (k) {
      var ok = picks[k] === key[k].bach;
      n++; if (ok) right++;
      if (known.indexOf(Number(k)) < 0) { n2++; if (ok) right2++; }
    });
    return { n: n, right: right, n2: n2, right2: right2 };
  }

  // ---- capabilities (only on the published page; null elsewhere)
  var use = function (name) { return window.claude && window.claude.use ? window.claude.use(name).catch(function () { return null; }) : Promise.resolve(null); };
  var dbP = use("db"), userP = use("user");

  if (location.hash === "#results") { board(); return; }

  // ---- start: 5 or 10 pairs
  var all = test.pairs.map(function (p, i) { return i; });
  var total = test.pairs.reduce(function (s, p) { return s + secondsOf(p); }, 0);
  $("size-5-time").textContent = "about " + minutes(total / 2) + " minutes of listening";
  $("size-10-time").textContent = "about " + minutes(total) + " minutes of listening";
  function begin(size) {
    if (!saved.chosen) {
      var order = all.slice();
      for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = order[i]; order[i] = order[j]; order[j] = t; }
      saved.chosen = (size >= all.length ? all : order.slice(0, size)).sort(function (a, b) { return a - b; });
      saved.size = saved.chosen.length;
      keep();
    }
    $("start").hidden = true;
    $("test").hidden = false;
    build();
  }
  $("size-5").addEventListener("click", function () { begin(5); });
  $("size-10").addEventListener("click", function () { begin(10); });
  if (saved.chosen) begin(saved.size);

  // ---- the pairs
  var list = $("pairs");
  function build() {
    list.textContent = "";
    saved.chosen.forEach(function (index, k) {
      var pair = test.pairs[index];
      var li = document.createElement("li");
      li.className = "pair";
      li.innerHTML =
        '<div class="pair-head"><span class="num">Pair ' + (k + 1) + '</span><span class="key">' + pair.key + " · " + pair.beatsPerBar + "/4 · " + pair.bars + " bars</span></div>" +
        '<div class="takes">' +
        ["A", "B"].map(function (side) {
          return '<div class="take" id="take-' + index + side + '"><button class="play" type="button" aria-pressed="false" data-pair="' + index + '" data-side="' + side + '">Play ' + side +
            '</button><div class="staff" title="' + clock(pair[side]) + '"><span class="head"></span></div></div>';
        }).join("") +
        "</div>" +
        '<div class="answer"><fieldset class="choice"><legend>Which is Bach?</legend>' +
        ["A", "B"].map(function (side) {
          return '<label><input type="radio" id="choice-' + index + side + '" name="choice-' + index + '" value="' + side + '"' + (saved.picks[index] === side ? " checked" : "") + "><span>" + side + "</span></label>";
        }).join("") +
        '</fieldset><label class="known"><input type="checkbox" id="known-' + index + '" data-pair="' + index + '"' + (saved.known.indexOf(index) >= 0 ? " checked" : "") + "> I know this tune</label></div>";
      list.appendChild(li);
    });
    showCount();
    if (saved.done) reveal();
  }

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
    var take = $("take-" + i + side);
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

  // ---- choices
  function showCount() {
    var n = saved.chosen.filter(function (i) { return saved.picks[i]; }).length;
    $("answered").textContent = n + " of " + saved.chosen.length + " answered";
    $("show").disabled = n < saved.chosen.length || saved.done;
  }
  list.addEventListener("change", function (e) {
    if (saved.done) return;
    var m = /^choice-(\\d+)$/.exec(e.target.name || "");
    if (m) saved.picks[Number(m[1])] = e.target.value;
    if (e.target.id && e.target.id.indexOf("known-") === 0) {
      var i = Number(e.target.dataset.pair);
      saved.known = saved.known.filter(function (k) { return k !== i; });
      if (e.target.checked) saved.known.push(i);
    }
    keep();
    showCount();
  });

  // ---- results
  var report = "";
  $("show").addEventListener("click", function () {
    stop();
    saved.done = true;
    keep();
    reveal();
    save();
  });
  function reveal() {
    var key = answers();
    var picks = {};
    saved.chosen.forEach(function (i) { if (saved.picks[i]) picks[i] = saved.picks[i]; });
    var s = score(picks, saved.known, key);
    Array.prototype.forEach.call(list.querySelectorAll("input"), function (input) { input.disabled = true; });
    $("show").disabled = true;
    $("score").textContent = s.right + " of " + s.n + " right";
    var p = chance(s.right, s.n);
    var text = p < 0.05 ? "You picked Bach out more often than guessing would: the chance of " + s.right + " or more right out of " + s.n + " by guessing is " + pText(p) + "."
      : "Within what guessing gives: the chance of " + s.right + " or more right out of " + s.n + " by guessing is " + pText(p) + ", so you didn't reliably tell these pieces from Bach.";
    if (s.n2 < s.n) text += " Leaving out the " + (s.n - s.n2) + (s.n - s.n2 === 1 ? " tune" : " tunes") + " you knew: " + s.right2 + " of " + s.n2 + " right.";
    $("verdict").textContent = text;
    var rows = saved.chosen.map(function (i, k) {
      var a = key[i], pick = picks[i];
      return "<tr><td>" + (k + 1) + "</td><td>" + a.bach + "</td><td>" + (pick ? '<span class="' + (pick === a.bach ? "right" : "wrong") + '">' + pick + (pick === a.bach ? " ✓" : " ✗") + "</span>" : "–") +
        "</td><td>" + (saved.known.indexOf(i) >= 0 ? "yes" : "") + "</td><td>" + a.chorale + "</td><td>" + a.piece + ", form of " + a.template + "</td></tr>";
    });
    $("reveal").innerHTML = "<table><thead><tr><th>Pair</th><th>Bach</th><th>Your pick</th><th>Tune known</th><th>Bach's chorale</th><th>ml_midi piece</th></tr></thead><tbody>" + rows.join("") + "</tbody></table>";
    report = "Which Is Bach? " + s.right + " of " + s.n + " right (chance by guessing " + pText(p) + ")\\n" + codeOf(picks, saved.known);
    $("result").hidden = false;
  }

  // Saves the finished test where this listener may write; otherwise asks
  // them to send the result code.
  function save() {
    var status = $("save-status");
    if (!window.claude) return; // opened from disk: nothing to save to
    status.textContent = "Saving your result…";
    var fail = function () { status.textContent = "Please copy your result below and send it to the person who shared this test."; };
    Promise.all([dbP, userP]).then(function (got) {
      var db = got[0], user = got[1];
      if (!db || !user) { fail(); return; }
      return user.id().then(function (uid) {
        if (!uid) { fail(); return; }
        var ref = db.doc("results/" + uid);
        var picks = {};
        saved.chosen.forEach(function (i) { if (saved.picks[i]) picks[String(i)] = saved.picks[i]; });
        var run = { test: test.id, at: new Date().toISOString(), size: saved.chosen.length, picks: picks, known: saved.known.slice() };
        return ref.get().then(function (snap) {
          var runs = snap.exists && Array.isArray(snap.data().runs) ? snap.data().runs.slice() : [];
          runs.push(run);
          return ref.set({ runs: runs });
        }).then(function () {
          status.textContent = "Saved. The person who shared this test can see your result.";
        });
      });
    }).catch(fail);
  }

  $("copy").addEventListener("click", function () {
    var done = $("copied");
    var fallback = function () {
      var box = $("report");
      box.hidden = false; box.value = report; box.focus(); box.select();
      done.textContent = "Select and copy the text below.";
    };
    try {
      navigator.clipboard.writeText(report).then(function () { done.textContent = "Copied."; }, fallback);
    } catch (e) { fallback(); }
  });

  // ---- the owner's results view (#results)
  function board() {
    $("start").hidden = true;
    $("board").hidden = false;
    var note = $("board-note");
    Promise.all([dbP, userP]).then(function (got) {
      var db = got[0], user = got[1];
      if (!db || !user) { note.textContent = "Results are collected only on the shared test page, for its owner."; return; }
      return Promise.all([user.isOwner(), user.canEdit()]).then(function (who) {
        if (!who[0] && !who[1]) { note.textContent = "Only the person who shared this test can see its results."; return; }
        note.textContent = "Waiting for results…";
        $("board-body").hidden = false;
        var runs = { saved: [], pasted: [] };
        var draw = function () { render(db, user, runs); };
        db.collection("results").onSnapshot(function (snap) {
          runs.saved = [];
          snap.docs.forEach(function (d) {
            ((d.data() || {}).runs || []).forEach(function (r, k) { runs.saved.push({ who: d.id, doc: "results/" + d.id, k: k, run: r }); });
          });
          draw();
        }, function () { note.textContent = "Results couldn't be loaded. Reload the page to try again."; });
        db.collection("pasted").onSnapshot(function (snap) {
          runs.pasted = snap.docs.map(function (d) { return { name: (d.data() || {}).name || "", doc: "pasted/" + d.id, run: d.data() }; });
          draw();
        }, function () {});
        $("add").addEventListener("click", function () { paste(db); });
      });
    });
  }

  function render(db, user, runs) {
    var key = answers();
    var rows = runs.saved.concat(runs.pasted).filter(function (r) { return r.run && r.run.test === test.id; });
    rows.sort(function (a, b) { return String(a.run.at).localeCompare(String(b.run.at)); });
    var ids = runs.saved.map(function (r) { return r.who; });
    user.profiles(ids).then(function (people) {
      var all = { n: 0, right: 0, n2: 0, right2: 0 };
      var perPair = test.pairs.map(function () { return { n: 0, right: 0, known: 0 }; });
      var body = rows.map(function (r) {
        var picks = r.run.picks || {}, known = (r.run.known || []).map(Number);
        var s = score(picks, known, key);
        all.n += s.n; all.right += s.right; all.n2 += s.n2; all.right2 += s.right2;
        Object.keys(picks).forEach(function (i) { var c = perPair[i]; if (!c) return; c.n++; if (picks[i] === key[i].bach) c.right++; if (known.indexOf(Number(i)) >= 0) c.known++; });
        var name = r.who ? (people[r.who] && people[r.who].name) || "A listener" : r.name || "Pasted result";
        return { name: name, at: String(r.run.at || "").slice(0, 10), s: s, r: r };
      });
      $("board-note").textContent = rows.length ? "" : "No results yet. They appear here as listeners finish the test.";
      $("fig-listeners").textContent = rows.length;
      $("fig-score").textContent = all.n ? all.right + " of " + all.n : "–";
      $("fig-chance").textContent = all.n ? pText(chance(all.right, all.n)) : "–";
      $("fig-unknown").textContent = all.n2 ? all.right2 + " of " + all.n2 + " (" + pText(chance(all.right2, all.n2)) + ")" : "–";
      var verdict = !all.n ? "" : chance(all.right, all.n) < 0.05 ? "So far, listeners pick Bach out more often than guessing would." : "So far, listeners don't reliably tell the pieces from Bach.";
      $("board-verdict").textContent = verdict;
      var tbody = $("runs");
      tbody.textContent = "";
      body.forEach(function (row) {
        var tr = document.createElement("tr");
        [row.name, row.at, row.s.right + " of " + row.s.n, row.s.n - row.s.n2 ? String(row.s.n - row.s.n2) : "", pText(chance(row.s.right, row.s.n))].forEach(function (text) {
          var td = document.createElement("td"); td.textContent = text; tr.appendChild(td);
        });
        var td = document.createElement("td");
        var remove = document.createElement("button");
        remove.type = "button"; remove.className = "quiet"; remove.textContent = "Remove";
        remove.addEventListener("click", function () { drop(db, row.r); });
        td.appendChild(remove); tr.appendChild(td);
        tbody.appendChild(tr);
      });
      var pairs = $("pairs-board");
      pairs.textContent = "";
      perPair.forEach(function (c, i) {
        var tr = document.createElement("tr");
        [String(i + 1), key[i].chorale, String(c.n), c.n ? Math.round(100 * c.right / c.n) + "%" : "–", c.known ? String(c.known) : ""].forEach(function (text) {
          var td = document.createElement("td"); td.textContent = text; tr.appendChild(td);
        });
        pairs.appendChild(tr);
      });
    });
  }

  function drop(db, r) {
    if (r.doc.indexOf("pasted/") === 0) { db.doc(r.doc).delete(); return; }
    var ref = db.doc(r.doc);
    ref.get().then(function (snap) {
      if (!snap.exists) return;
      var runs = (snap.data().runs || []).slice();
      runs.splice(r.k, 1);
      return ref.set({ runs: runs });
    });
  }

  // A result a listener sent as text: its "code:" line.
  function paste(db) {
    var status = $("add-status");
    var text = $("paste-text").value;
    var m = /code:\\s*(\\S+)\\s+([^\\n]+)/.exec(text);
    if (!m) { status.textContent = "No result code found. Paste the whole text the listener sent, including the line that starts with code:."; return; }
    if (m[1] !== test.id) { status.textContent = "That result is from a different test (" + m[1] + ")."; return; }
    var picks = {}, known = [];
    m[2].trim().split(/\\s+/).forEach(function (token) {
      var t = /^(\\d+)([AB])(\\*?)$/.exec(token);
      if (!t) return;
      var i = Number(t[1]) - 1;
      if (i < 0 || i >= test.pairs.length) return;
      picks[String(i)] = t[2];
      if (t[3]) known.push(i);
    });
    if (!Object.keys(picks).length) { status.textContent = "The result code has no answers in it."; return; }
    var name = $("paste-name").value.trim().slice(0, 80);
    status.textContent = "Adding…";
    db.collection("pasted").add({ test: test.id, at: new Date().toISOString(), name: name, size: Object.keys(picks).length, picks: picks, known: known }).then(function () {
      status.textContent = "Added.";
      $("paste-text").value = "";
      $("paste-name").value = "";
    }, function () { status.textContent = "Couldn't add it. Reload the page and try again."; });
  }
})();
`;

function page(test, { standalone = true } = {}) {
  const data = JSON.stringify({ id: test.id, tempo: test.tempo, pairs: test.pairs }).replace(/</g, "\\u003c");
  const key = JSON.stringify(seal(test.answers));
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
    <p class="meta">♩ = ${test.tempo} · organ sound · headphones help</p>
  </header>
  <section class="start" id="start" aria-labelledby="start-title">
    <h2 id="start-title">How many pairs would you like to hear?</h2>
    <div class="sizes">
      <button class="size" type="button" id="size-5"><strong>5 pairs</strong><span id="size-5-time">a few minutes</span><span>chosen at random from the 10</span></button>
      <button class="size" type="button" id="size-10"><strong>10 pairs</strong><span id="size-10-time">a few minutes</span><span>the whole test</span></button>
    </div>
    <p class="note">If you recognize one of the hymn tunes, tick "I know this tune" for that pair: the results are also counted without it.</p>
  </section>
  <section id="test" hidden>
    <ol class="pairs" id="pairs"></ol>
    <section class="results" aria-labelledby="results-title">
      <h2 id="results-title">Results</h2>
      <div class="actions">
        <button class="primary" type="button" id="show" disabled>Show results</button>
        <span id="answered">0 answered</span>
      </div>
      <div id="result" hidden>
        <p class="score" id="score"></p>
        <p class="verdict" id="verdict"></p>
        <p class="saved" id="save-status"></p>
        <div class="table-wrap" id="reveal"></div>
        <div class="actions">
          <button class="secondary" type="button" id="copy">Copy results</button>
          <span id="copied"></span>
        </div>
        <textarea id="report" hidden readonly aria-label="Results as text"></textarea>
      </div>
    </section>
  </section>
  <section class="board" id="board" hidden aria-labelledby="board-title">
    <h2 id="board-title">Listeners' results</h2>
    <p class="note" id="board-note">Loading…</p>
    <div class="board" id="board-body" hidden>
    <div class="figures">
      <div class="figure"><b id="fig-listeners">–</b><span>tests finished</span></div>
      <div class="figure"><b id="fig-score">–</b><span>pairs right, all listeners</span></div>
      <div class="figure"><b id="fig-chance">–</b><span>chance of that by guessing</span></div>
      <div class="figure"><b id="fig-unknown">–</b><span>right without known tunes (chance)</span></div>
    </div>
    <p class="verdict" id="board-verdict"></p>
    <div class="table-wrap"><table><thead><tr><th>Listener</th><th>Date</th><th>Right</th><th>Tunes known</th><th>Chance</th><th></th></tr></thead><tbody id="runs"></tbody></table></div>
    <h2>By pair</h2>
    <div class="table-wrap"><table><thead><tr><th>Pair</th><th>Bach's chorale</th><th>Heard</th><th>Picked Bach</th><th>Tune known</th></tr></thead><tbody id="pairs-board"></tbody></table></div>
    <div class="paste">
      <h2>Add a result sent as text</h2>
      <label>Listener's name<input type="text" id="paste-name" autocomplete="off"></label>
      <label>The text they sent (with its code: line)<textarea id="paste-text"></textarea></label>
      <div class="actions"><button class="primary" type="button" id="add">Add result</button><span class="note" id="add-status"></span></div>
    </div>
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
exports.RULES = RULES;
