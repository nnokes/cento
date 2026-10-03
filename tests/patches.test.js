"use strict";
// Checks the Max patches and devices for mistakes that Max only reports when a
// file is opened. Max writes each object's real inlet and outlet counts into
// the file, so these checks stay valid for patches saved from Max.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// .maxpat files are JSON. An .amxd starts with three chunks: "ampf" (device
// type), "meta", and "ptch". Inside "ptch", an "mx@c" header gives the size of
// the patcher JSON that follows (then "\n\0" and a "dlst" file list).
function readPatcher(file) {
  const data = fs.readFileSync(file);
  if (file.endsWith(".amxd")) {
    assert.equal(data.toString("latin1", 0, 4), "ampf", `${file}: not an .amxd`);
    assert.equal(data.toString("latin1", 24, 28), "ptch", `${file}: unexpected .amxd layout`);
    assert.equal(data.toString("latin1", 32, 36), "mx@c", `${file}: no mx@c header in ptch`);
    const jsonEnd = 32 + data.readUInt32BE(44); // the size counts from the mx@c header
    return JSON.parse(data.toString("utf8", 48, jsonEnd).replace(/\n?\0+$/, "")).patcher;
  }
  return JSON.parse(data.toString("utf8")).patcher;
}

// Every patcher in a file, including [p] subpatchers, with a readable location.
function* patchers(patcher, where) {
  yield [patcher, where];
  for (const { box } of patcher.boxes) {
    if (box.patcher) yield* patchers(box.patcher, `${where} > [${box.text}]`);
  }
}

// Everything Max loads lives in patchers/: patches, devices and bundles.
const files = fs
  .readdirSync(path.join(ROOT, "patchers"))
  .filter((f) => f.endsWith(".maxpat") || f.endsWith(".amxd"))
  .map((f) => path.join("patchers", f));

const firstWord = (box) => (box.text || "").split(/\s+/)[0];

for (const file of files) {
  test(`${file}: cords, [v8] and [receive] rules`, () => {
    const problems = [];
    for (const [patcher, where] of patchers(readPatcher(path.join(ROOT, file)), file)) {
      const boxes = new Map(patcher.boxes.map(({ box }) => [box.id, box]));
      const label = (box) => `[${box.text || box.maxclass}]`;

      for (const { patchline } of patcher.lines) {
        const [srcId, outlet] = patchline.source;
        const [dstId, inlet] = patchline.destination;
        const src = boxes.get(srcId);
        const dst = boxes.get(dstId);
        if (!src || !dst) {
          problems.push(`${where}: cord between missing objects ${srcId} -> ${dstId}`);
          continue;
        }
        if (outlet >= src.numoutlets) problems.push(`${where}: ${label(src)} has no outlet ${outlet}`);
        if (inlet >= dst.numinlets) problems.push(`${where}: ${label(dst)} has no inlet ${inlet}`);
        // Wrappers have one inlet and one outlet (see PLAN.md, section 2).
        if (firstWord(src) === "v8" && outlet > 0) problems.push(`${where}: cord from ${label(src)} outlet ${outlet}`);
        if (firstWord(dst) === "v8" && inlet > 0) problems.push(`${where}: cord into ${label(dst)} inlet ${inlet}`);
        // Only an unnamed [receive] has an inlet.
        const words = (dst.text || "").split(/\s+/);
        if ((words[0] === "receive" || words[0] === "r") && words.length > 1) {
          problems.push(`${where}: cord into named ${label(dst)}, which has no inlet`);
        }
      }

      // Every [v8ui] names an existing bundle in its textfile entry.
      for (const box of boxes.values()) {
        if (box.maxclass !== "v8ui") continue;
        const script = (box.textfile || {}).filename;
        if (!/\.bundle\.js$/.test(script || "") || box.textfile.embed !== 0) problems.push(`${where}: [v8ui] needs textfile {filename: "<name>.bundle.js", embed: 0}`);
        else if (!fs.existsSync(path.join(ROOT, "patchers", script))) problems.push(`${where}: patchers/${script} is missing`);
      }

      // Every [v8] loads a bundle that exists (never code/ directly). Max 9
      // also needs the box's "textfile" entry to name that file; without it,
      // [v8] starts with an empty embedded script ("no function bang").
      for (const box of boxes.values()) {
        if (firstWord(box) !== "v8") continue;
        const script = box.text.split(/\s+/)[1];
        if (!/\.bundle\.js$/.test(script || "")) problems.push(`${where}: ${label(box)} should load a .bundle.js`);
        else if (!fs.existsSync(path.join(ROOT, "patchers", script))) problems.push(`${where}: patchers/${script} is missing`);
        const textfile = box.textfile || {};
        if (textfile.filename !== script || textfile.embed !== 0) {
          problems.push(`${where}: ${label(box)} needs textfile {filename: "${script}", embed: 0}`);
        }
      }

      for (const kind of ["inlet", "outlet"]) {
        const indexes = [...boxes.values()].filter((b) => b.maxclass === kind).map((b) => b.index).sort((a, b) => a - b);
        if (indexes.some((value, i) => value !== i + 1)) problems.push(`${where}: ${kind} indexes ${indexes}`);
      }
    }
    assert.deepEqual(problems, []);
  });
}

test("every [v8] wrapper source declares one inlet and one outlet", () => {
  for (const file of fs.readdirSync(path.join(ROOT, "code")).filter((f) => f.endsWith(".v8.js"))) {
    const source = fs.readFileSync(path.join(ROOT, "code", file), "utf8");
    assert.match(source, /^inlets = 1;$/m, file);
    assert.match(source, /^outlets = 1;$/m, file);
  }
});

// ---------------------------------------------------------------- Live voice routing
// In M2, Live played the soprano and bass on the wrong tracks: each voice
// device had its own Voice menu (easy to set wrong), and the brain also played
// every written clip's notes through those devices whenever Live's transport
// ran. Now the track's name picks the voice, and the brain plays through the
// voice devices only while its Play toggle is on.

function patchFile(name) {
  const patcher = readPatcher(path.join(ROOT, "patchers", name));
  const boxes = new Map(patcher.boxes.map(({ box }) => [box.id, box]));
  const find = (text) => [...boxes.values()].filter((b) => (b.text || b.maxclass) === text);
  const into = (id, inlet) =>
    patcher.lines.filter(({ patchline: l }) => l.destination[0] === id && (inlet === undefined || l.destination[1] === inlet))
      .map(({ patchline: l }) => [boxes.get(l.source[0]), l.source[1]]);
  const from = (id, outlet) =>
    patcher.lines.filter(({ patchline: l }) => l.source[0] === id && (outlet === undefined || l.source[1] === outlet))
      .map(({ patchline: l }) => [boxes.get(l.destination[0]), l.destination[1]]);
  return { boxes, find, into, from };
}

test("emi.voice: the track's name, not a stored menu, picks the voice", () => {
  const p = patchFile("emi.voice.maxpat");
  assert.equal([...p.boxes.values()].filter((b) => b.parameter_enable || b.maxclass.startsWith("live.menu")).length, 0);
  const [js] = p.find("v8 emi.voice.bundle.js");
  assert.deepEqual(p.into(js.id).map(([b]) => b.text), ["prepend trackname"]);
  const [pre] = p.find("prepend trackname");
  assert.deepEqual(p.into(pre.id).map(([b]) => b.text), ["live.observer"]);
  const [receive] = p.find("receive");
  assert.deepEqual(p.into(receive.id).map(([b, outlet]) => [b.text, outlet]), [["route show", 1]]);
});

test("emi.host.live: voices reach the voice devices only through the Play gate", () => {
  const p = patchFile("emi.host.live.maxpat");
  const [route] = p.find("route voice");
  const voiceOut = p.from(route.id, 0);
  assert.equal(voiceOut.length, 1);
  const [[gate, inlet]] = voiceOut;
  assert.deepEqual([gate.text, inlet], ["gate 1", 1]);
  // The gate's control comes from the Play toggle (via [t i i]).
  const [[trigger]] = p.into(gate.id, 0);
  assert.equal(trigger.text, "t i i");
  assert.deepEqual(p.into(trigger.id).map(([b]) => [b.maxclass, b.varname]), [["live.text", "Play Through Voices"]]);
  // Turning Play off stops the player (note-offs) before the gate closes:
  // [t i i] fires right to left, and its right outlet goes to [sel 0] -> stop.
  const [[sel]] = p.from(trigger.id, 1);
  assert.equal(sel.text, "sel 0");
  assert.deepEqual(p.from(sel.id, 0).map(([b]) => b.text), ["stop"]);
  // Every [send emi.voice.N] and the brain's own [midiformat] are downstream of the gate.
  const reached = new Set();
  const walk = (id) => {
    for (const [b] of p.from(id)) {
      if (!reached.has(b.id)) {
        reached.add(b.id);
        walk(b.id);
      }
    }
  };
  walk(gate.id);
  for (const text of ["send emi.voice.1", "send emi.voice.2", "send emi.voice.3", "send emi.voice.4", "midiformat"]) {
    assert.ok(p.find(text).every((b) => reached.has(b.id)), text);
  }
});

// ---------------------------------------------------------------- M4: shared panel and settings

const liveParameters = (name) =>
  [...patchFile(name).boxes.values()]
    .filter((b) => b.maxclass.startsWith("live.") && b.parameter_enable)
    .map((b) => ({ varname: b.varname, longname: b.saved_attribute_attributes.valueof.parameter_longname }));

test("live.* parameters: named, and unique within each product", () => {
  const products = {
    "Max version": ["ml_midi.maxpat", "emi.host.max.maxpat", "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat", "emi.engine.maxpat"],
    "emi.brain": ["emi.brain.maxpat", "emi.host.live.maxpat", "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat", "emi.engine.maxpat"],
  };
  for (const [product, names] of Object.entries(products)) {
    const params = names.flatMap(liveParameters);
    for (const { varname, longname } of params) assert.equal(varname, longname, `${product}: ${varname}`);
    const longnames = params.map((p) => p.longname);
    assert.deepEqual([...new Set(longnames)], longnames, `${product}: duplicate parameter names`);
  }
  assert.deepEqual(liveParameters("emi.panel.maxpat").map((p) => p.longname).sort(), ["Beats", "Form", "Original Key", "Phrases", "Seed", "Signatures", "Stream", "Transpose"]);
  assert.deepEqual(liveParameters("emi.host.live.maxpat").map((p) => p.longname).sort(), ["All Voices Here", "Clips On Compose", "Play Through Voices"]);
  assert.deepEqual(liveParameters("emily.panel.maxpat").map((p) => p.longname).sort(), ["Dislike", "Like", "Temperature"]);
});

test("emily.panel (M9): like and dislike are mappable buttons; temperature is saved and shown when restored", () => {
  const p = patchFile("emily.panel.maxpat");
  const [outlet] = p.find("outlet");
  const control = (name) => [...p.boxes.values()].find((b) => b.varname === name);
  for (const [name, message] of [["Like", "like"], ["Dislike", "dislike"]]) {
    const button = control(name);
    assert.equal(button.maxclass, "live.text", name);
    assert.equal(button.mode, 0, `${name} is a button (it sends a bang)`);
    assert.equal(button.saved_attribute_attributes.valueof.parameter_initial_enable, 0, `${name} sends nothing when the patch loads`);
    const [[msg]] = p.from(button.id, 0);
    assert.equal(msg.text, message, name);
    assert.deepEqual(p.from(msg.id).map(([b]) => b.id), [outlet.id], `${name} goes to the engine`);
  }
  const dial = control("Temperature");
  assert.equal(dial.maxclass, "live.dial");
  const range = dial.saved_attribute_attributes.valueof;
  assert.deepEqual([range.parameter_mmin, range.parameter_mmax, range.parameter_initial[0]], [0, 3, 1]);
  const [[pre]] = p.from(dial.id, 0);
  assert.equal(pre.text, "prepend temperature");
  assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id]);
  for (const word of ["taste", "forget"]) {
    const [msg] = p.find(word);
    assert.deepEqual(p.from(msg.id).map(([b]) => b.id), [outlet.id], word);
  }
  const [route] = p.find("route emily setting");
  const [[setText]] = p.from(route.id, 0);
  assert.equal(setText.text, "prepend text");
  const [[text]] = p.from(setText.id);
  assert.equal(text.filename, "emi.text.bundle.js", "emily <text> shows in the panel, as written");
  const [[settings]] = p.from(route.id, 1);
  assert.equal(settings.text, "route temperature");
  const [[set]] = p.from(settings.id, 0);
  assert.equal(set.text, "prepend set");
  assert.deepEqual(p.from(set.id).map(([b]) => b.id), [dial.id], "a restored temperature is shown, not sent back");
});

test("emi.panel: each saved control sends its message, and shows restored values without sending", () => {
  const p = patchFile("emi.panel.maxpat");
  const [outlet] = p.find("outlet");
  const [settings] = p.find("route seed beats form key stream phrases transpose sigs");
  ["Seed", "Beats", "Form", "Original Key", "Stream", "Phrases", "Transpose", "Signatures"].forEach((name, k) => {
    const control = [...p.boxes.values()].find((b) => b.varname === name);
    const message = { Seed: "seed", Beats: "beats", Form: "form", "Original Key": "key", Stream: "stream", Phrases: "phrases", Transpose: "transpose", Signatures: "sigs" }[name];
    const [[pre]] = p.from(control.id, 0);
    assert.equal(pre.text, `prepend ${message}`, name);
    assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id], `${name} goes to the engine`);
    const [[set]] = p.from(settings.id, k);
    assert.equal(set.text, "prepend set", name);
    assert.deepEqual(p.from(set.id).map(([b]) => b.id), [control.id], `setting ${message} reaches ${name}`);
  });
});

// A message box shows "melody\," and "10" in quotes; the status boxes draw
// the text as the engine wrote it.
test("emily.panel: the window button sends to the top patch's pop-up window", () => {
  const p = patchFile("emily.panel.maxpat");
  const [button] = p.find("window");
  assert.ok(button.presentation_rect, "shown on the panel");
  assert.deepEqual(p.from(button.id).map(([b]) => b.text), ["s ---emi.window"]);
});

test("emi.window: a large piano roll and Emily's taste, fed by the engine; selections and ratings go back", () => {
  const p = patchFile("emi.window.maxpat");
  const [inlet] = p.find("inlet");
  const [outlet] = p.find("outlet");
  const [route] = p.find("route view emilyview");
  assert.deepEqual(p.from(inlet.id).map(([b]) => b.id), [route.id]);
  const [[roll]] = p.from(route.id, 0);
  const [[taste]] = p.from(route.id, 1);
  assert.deepEqual([roll.filename, taste.filename], ["emi.view.bundle.js", "emi.taste.bundle.js"]);
  assert.ok(roll.presentation_rect[2] >= 1000 && roll.presentation_rect[3] >= 400, "the roll is large");
  assert.deepEqual(p.from(roll.id).map(([b]) => b.id), [outlet.id], "selections go to the engine");
  for (const word of ["like", "dislike", "taste"]) {
    const [button] = p.find(word);
    assert.deepEqual(p.from(button.id).map(([b]) => b.id), [outlet.id], word);
  }
  const [title] = [...p.boxes.values()].filter((b) => (b.text || "").startsWith("title "));
  assert.deepEqual(p.from(title.id).map(([b]) => b.text), ["thispatcher"]);
});

test("emi.panel: the status line shows status and errors in a text box ([v8ui] emi.text)", () => {
  const p = patchFile("emi.panel.maxpat");
  const [route] = p.find("route status error setting");
  const [[status]] = p.from(route.id, 0);
  const [[error]] = p.from(route.id, 1);
  assert.deepEqual([status.text, error.text], ["prepend text", "prepend alert"]);
  const [[box]] = p.from(status.id);
  assert.deepEqual([box.maxclass, box.filename], ["v8ui", "emi.text.bundle.js"]);
  assert.deepEqual(p.from(error.id).map(([b]) => b.id), [box.id]);
  assert.equal([...p.boxes.values()].filter((b) => b.maxclass === "message" && b.text === "").length, 0, "no empty message box left as a display");
});

test("startup: Max restores everything after loading; Live only reloads the corpus once the device is ready", () => {
  const chain = (file, first, message) => {
    const p = patchFile(file);
    const starts = p.find(first).filter((b) => p.from(b.id, 0).some(([to]) => to.text === "deferlow"));
    assert.equal(starts.length, 1, `${file}: one [${first}] starts the engine`);
    const [[defer]] = p.from(starts[0].id, 0).filter(([b]) => b.text === "deferlow");
    const [[msg]] = p.from(defer.id);
    assert.equal(msg.text, message, file);
    assert.deepEqual(p.from(msg.id).map(([b]) => b.maxclass), ["outlet"], file);
  };
  chain("emi.host.max.maxpat", "loadbang", "startup all");
  chain("emi.host.live.maxpat", "live.thisdevice", "startup corpus");
});

test("top patches: host panel, shared panel, Emily's panel and piano roll, all wired to one engine", () => {
  for (const [file, host] of [["ml_midi.maxpat", "emi.host.max.maxpat"], ["emi.brain.maxpat", "emi.host.live.maxpat"]]) {
    const p = patchFile(file);
    const [engine] = p.find("emi.engine");
    const bpatchers = [...p.boxes.values()].filter((b) => b.maxclass === "bpatcher").map((b) => b.name);
    assert.deepEqual(bpatchers, [host, "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat"], file);
    const into = p.into(engine.id).map(([b]) => b.name || b.text).sort();
    assert.deepEqual(into, [host, "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat", "emi.window"].sort(), `${file}: the panels, the roll's selections and the window go to the engine`);
    const from = p.from(engine.id).map(([b]) => b.name || b.text).sort();
    assert.deepEqual(from, [host, "emi.panel.maxpat", "emily.panel.maxpat", "route view", "emi.window"].sort(), `${file}: the engine answers them`);
    // The Emily panel's window button opens the pop-up window.
    const [window] = p.find("emi.window");
    const [receive] = p.find("r ---emi.window");
    const [[open]] = p.from(receive.id);
    assert.equal(open.text, "open");
    const [[pcontrol]] = p.from(open.id);
    assert.equal(pcontrol.text, "pcontrol");
    assert.deepEqual(p.from(pcontrol.id).map(([b, inlet]) => [b.id, inlet]), [[window.id, 0]], file);
  }
  // The device is exactly as wide as its four panels.
  const device = readPatcher(path.join(ROOT, "patchers", "emi.brain.amxd"));
  const brain = patchFile("emi.brain.maxpat");
  const right = Math.max(...[...brain.boxes.values()].filter((b) => b.presentation_rect).map((b) => b.presentation_rect[0] + b.presentation_rect[2]));
  assert.equal(device.devicewidth, right);
});

// ---------------------------------------------------------------- M5: the player and streaming

// Evaluates a Max [expr] such as "expr ($i1 - 1) * $i4 + int(($f3 + 60.) / 120.)"
// with inlet values `args` ($i1 = args[0]), as Max does: integers stay
// integers, so dividing two of them truncates.
function maxExpr(text, args) {
  const tokens = text.replace(/^expr\s+/, "").match(/\$[if]\d+|\d+\.\d*|\d+|int|[()+\-*/]/g);
  let k = 0;
  const value = (v, float) => ({ v, float });
  const primary = () => {
    const t = tokens[k++];
    if (t === "(") {
      const v = sum();
      k++; // ")"
      return v;
    }
    if (t === "int") {
      k++; // "("
      const v = sum();
      k++;
      return value(Math.trunc(v.v), false);
    }
    if (t[0] === "$") return value(t[1] === "f" ? args[Number(t.slice(2)) - 1] : Math.trunc(args[Number(t.slice(2)) - 1]), t[1] === "f");
    return value(Number(t), t.includes("."));
  };
  const product = () => {
    let a = primary();
    while (tokens[k] === "*" || tokens[k] === "/") {
      const op = tokens[k++];
      const b = primary();
      const float = a.float || b.float;
      a = value(op === "*" ? a.v * b.v : float ? a.v / b.v : Math.trunc(a.v / b.v), float);
    }
    return a;
  };
  const sum = () => {
    let a = product();
    while (tokens[k] === "+" || tokens[k] === "-") {
      const op = tokens[k++];
      const b = product();
      a = value(op === "+" ? a.v + b.v : a.v - b.v, a.float || b.float);
    }
    return a;
  };
  return sum().v;
}

// The [p grid-player] subpatcher inside emi.engine, with the same helpers.
function playerPatch() {
  const engine = readPatcher(path.join(ROOT, "patchers", "emi.engine.maxpat"));
  const player = engine.boxes.map(({ box }) => box).find((b) => b.text === "p grid-player").patcher;
  const boxes = new Map(player.boxes.map(({ box }) => [box.id, box]));
  const find = (text) => [...boxes.values()].filter((b) => (b.text || b.maxclass) === text);
  const from = (id, outlet) =>
    player.lines.filter(({ patchline: l }) => l.source[0] === id && (outlet === undefined || l.source[1] === outlet))
      .map(({ patchline: l }) => [boxes.get(l.destination[0]), l.destination[1]]);
  return { boxes, find, from };
}

test("grid player: the step comes from the transport's position, and the queue starts on a barline", () => {
  const p = playerPatch();
  const [metro] = p.find("metro 16n @quantize 16n @active 1");
  assert.deepEqual(p.from(metro.id).map(([b]) => b.text), ["transport"]);
  const [transport] = p.find("transport");
  assert.deepEqual(p.from(transport.id).map(([b, inlet]) => [b.text, inlet]).sort(), [
    ["expr $i1 * $i2", 0], ["expr 16 / $i1", 0], ["pack 0 0 0.", 0], ["pack 0 0 0.", 1], ["pack 0 0 0.", 2],
  ]);
  assert.deepEqual(p.from(transport.id, 5).map(([b]) => b.text), ["expr $i1 * $i2"], "numerator");
  assert.deepEqual(p.from(transport.id, 6).map(([b]) => b.text), ["expr 16 / $i1"], "denominator");

  // M8: steps per bar follow the time signature. Evaluate the player's own
  // expressions (as Max's [expr] does: integer division for integers).
  const [toStep] = p.find("expr ($i1 - 1) * $i4 + ($i2 - 1) * $i5 + int(($f3 + 60.) / 120.)");
  const [toBar] = p.find("expr (($i1 + $i2 - 1) / $i2) * $i2");
  const [perBeat] = p.find("expr 16 / $i1");
  const [perBar] = p.find("expr $i1 * $i2");
  assert.deepEqual(p.from(perBeat.id).map(([b, inlet]) => [b.id, inlet]).sort(), [[perBar.id, 1], [toStep.id, 4]].sort());
  assert.deepEqual(p.from(perBar.id).map(([b, inlet]) => [b.id, inlet]).sort(), [[toBar.id, 1], [toStep.id, 3]].sort());
  for (const [num, den, bars, beats, units, step, origin] of [
    [4, 4, 1, 1, 0, 0, 0], [4, 4, 2, 3, 240, 26, 32], [3, 4, 2, 1, 0, 12, 12], [3, 4, 2, 2, 125, 17, 24], [6, 8, 2, 4, 0, 18, 24],
  ]) {
    const spBeat = maxExpr(perBeat.text, [den]);
    const spBar = maxExpr(perBar.text, [num, spBeat]);
    const at = maxExpr(toStep.text, [bars, beats, units, spBar, spBeat]);
    assert.equal(at, step, `${num}/${den} bar ${bars} beat ${beats} units ${units}`);
    assert.equal(maxExpr(toBar.text, [at, spBar]), origin, `${num}/${den}: the next barline`);
  }
  // Every way in that changes where the queue starts also sends note-offs.
  const [flushAll] = p.find("t b").filter((b) => p.from(b.id).filter(([to]) => to.text === "flush").length === 4);
  assert.ok(flushAll, "one [t b] reaches all four [flush]es");
  // A jump also resets the lead, so Play from bar 1 starts at bar 1 even after a restart.
  const [sel] = p.find("sel 1");
  const targets = p.from(sel.id, 0).map(([b]) => b);
  assert.ok(targets.some((b) => b.id === flushAll.id), "a jump sends note-offs");
  const lead = p.find("+ 0")[0];
  assert.ok(targets.some((b) => b.maxclass === "message" && b.text === "0" && p.from(b.id).some(([to, inlet]) => to.id === lead.id && inlet === 1)), "a jump sets lead 0");
  for (const comment of ["stop (bang): note-offs for sounding notes", "restart (bang): note-offs; the queue starts again at the bar after this one"]) {
    const [inlet] = [...p.boxes.values()].filter((b) => b.maxclass === "inlet" && b.comment === comment);
    const [[trigger]] = p.from(inlet.id);
    assert.ok(p.from(trigger.id).some(([to]) => to.id === flushAll.id), comment);
  }
});

test("emi.host.max: nothing plays until Play is on, even if Max's transport is already running", () => {
  const p = patchFile("emi.host.max.maxpat");
  const [transport] = p.find("transport");
  const [outlet] = p.find("outlet");
  const [playGate] = p.find("gate 1 0");
  // When the patch opens, the transport is stopped (it is global to Max, and
  // may have been left running by a patch closed while playing).
  const stops = p.find("loadbang").flatMap((lb) => p.from(lb.id).map(([b]) => b)).filter((b) => b.text === "0");
  assert.equal(stops.length, 1);
  assert.deepEqual(p.from(stops[0].id).map(([b, inlet]) => [b.id, inlet]), [[transport.id, 0]]);
  // Voices reach the outputs only through the play gate.
  const [route] = p.find("route voice setting meter");
  assert.deepEqual(p.from(route.id, 0).map(([b, inlet]) => [b.id, inlet]), [[playGate.id, 1]]);
  assert.deepEqual(p.from(playGate.id).map(([b, inlet]) => [b.text, inlet]), [["gate 2 1", 1]]);
  // Play: open the gate, tell the engine, start the transport (right to left).
  // Stop: stop the transport, tell the engine (its note-offs still pass), close the gate.
  const [sel] = p.find("sel 1 0");
  const steps = (outletIndex) => {
    const [[t]] = p.from(sel.id, outletIndex);
    return [2, 1, 0].map((k) => {
      const [[msg]] = p.from(t.id, k);
      const [[to, inlet]] = p.from(msg.id);
      return [msg.text, to.id === playGate.id ? "play gate" : to.id === transport.id ? "transport" : to.id === outlet.id ? "engine" : to.text, inlet];
    });
  };
  assert.deepEqual(steps(0), [["1", "play gate", 0], ["play", "engine", 0], ["1", "transport", 0]]);
  assert.deepEqual(steps(1), [["0", "transport", 0], ["stop", "engine", 0], ["0", "play gate", 0]]);
});

test("emi.host.max: the engine's meter sets the transport's time signature (M8: 3/4)", () => {
  const p = patchFile("emi.host.max.maxpat");
  const [route] = p.find("route voice setting meter");
  const [[pre]] = p.from(route.id, 2);
  assert.equal(pre.text, "prepend timesig");
  assert.deepEqual(p.from(pre.id).map(([b, inlet]) => [b.text, inlet]), [["transport", 0]]);
});

test("emi.engine: the core feeds the queue and the player, and 'need' comes back on the main thread", () => {
  const p = patchFile("emi.engine.maxpat");
  const [core] = p.find("v8 emi.core.bundle.js");
  const [route] = p.find("route coll restart streamat");
  assert.deepEqual(p.from(core.id).map(([b]) => b.text), ["route coll restart streamat"]);
  const [player] = p.find("p grid-player");
  assert.deepEqual(p.from(route.id, 1).map(([b, inlet]) => [b.text, inlet]), [["p grid-player", 2]]);
  assert.deepEqual(p.from(route.id, 2).map(([b, inlet]) => [b.text, inlet]), [["p grid-player", 3]]);
  const [[defer]] = p.from(player.id, 1);
  assert.equal(defer.text, "deferlow");
  const [[need]] = p.from(defer.id);
  assert.equal(need.text, "need");
  assert.deepEqual(p.from(need.id).map(([b]) => b.id), [core.id]);
});
