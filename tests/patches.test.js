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
// What you open (cento.*) is in patchers/; the parts it's made of in
// patchers/parts/, and the scripts in patchers/scripts/ (Max finds them all
// through its search path: patchers/, with Subfolders ticked).
const FOLDERS = ["patchers", "patchers/parts", "patchers/scripts"];
const files = FOLDERS.flatMap((dir) =>
  fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".maxpat") || f.endsWith(".amxd")).map((f) => path.join(dir, f)));
// A file by name, wherever it is in patchers/.
const locate = (name) => FOLDERS.map((dir) => path.join(ROOT, dir, name)).find((f) => fs.existsSync(f)) || path.join(ROOT, "patchers", name);

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
        else if (!fs.existsSync(path.join(ROOT, "patchers", "scripts", script))) problems.push(`${where}: patchers/scripts/${script} is missing`);
      }

      // Every [v8] loads a bundle that exists (never code/ directly). Max 9
      // also needs the box's "textfile" entry to name that file; without it,
      // [v8] starts with an empty embedded script ("no function bang").
      for (const box of boxes.values()) {
        if (firstWord(box) !== "v8") continue;
        const script = box.text.split(/\s+/)[1];
        if (!/\.bundle\.js$/.test(script || "")) problems.push(`${where}: ${label(box)} should load a .bundle.js`);
        else if (!fs.existsSync(path.join(ROOT, "patchers", "scripts", script))) problems.push(`${where}: patchers/scripts/${script} is missing`);
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
  const patcher = readPatcher(locate(name));
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
    "Max version": ["cento.maxpat", "emi.host.max.maxpat", "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat", "emi.engine.maxpat"],
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
  assert.deepEqual(liveParameters("emily.panel.maxpat").map((p) => p.longname).sort(), ["Accept", "Dislike", "Like", "Temperature"]);
  assert.deepEqual(liveParameters("emi.host.max.maxpat").map((p) => p.longname), ["Play"]);
});

test("live.text toggles and buttons all have their parameter (an off/on range), or they don't toggle", () => {
  let count = 0;
  for (const file of files.filter((f) => f.endsWith(".maxpat"))) {
    for (const [patcher, where] of patchers(readPatcher(path.join(ROOT, file)), file)) {
      for (const { box } of patcher.boxes) {
        if (box.maxclass !== "live.text") continue;
        count++;
        const valueof = (box.saved_attribute_attributes || {}).valueof || {};
        assert.equal(box.parameter_enable, 1, `${where}: ${box.varname}`);
        assert.deepEqual([valueof.parameter_enum, valueof.parameter_mmax], [["off", "on"], 1], `${where}: ${box.varname}`);
      }
    }
  }
  assert.ok(count >= 11, `${count} live.text`); // 11 now
});

test("emily.panel (M9): like and dislike are mappable buttons; temperature is saved and shown when restored", () => {
  const p = patchFile("emily.panel.maxpat");
  const [outlet] = p.find("outlet");
  const control = (name) => [...p.boxes.values()].find((b) => b.varname === name);
  for (const [name, message] of [["Like", "like"], ["Dislike", "dislike"], ["Accept", "accept"]]) {
    const button = control(name);
    assert.equal(button.maxclass, "live.text", name);
    assert.equal(button.mode, 0, `${name} is a button (it sends a bang)`);
    assert.equal(button.saved_attribute_attributes.valueof.parameter_initial_enable, 0, `${name} sends nothing when the patch loads`);
    const [[msg]] = p.from(button.id, 0);
    assert.equal(msg.text, message, name);
    assert.deepEqual(p.from(msg.id).map(([b]) => b.id), [outlet.id], `${name} goes to the engine`);
  }
  const dial = control("Temperature");
  assert.deepEqual([dial.maxclass, dial.orientation], ["live.slider", 1], "temperature is a horizontal slider");
  const range = dial.saved_attribute_attributes.valueof;
  assert.deepEqual([range.parameter_mmin, range.parameter_mmax, range.parameter_initial[0]], [0, 3, 1]);
  const [[pre]] = p.from(dial.id, 0);
  assert.equal(pre.text, "prepend temperature");
  assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id]);
  const [taste] = p.find("taste");
  assert.deepEqual(p.from(taste.id).map(([b]) => b.id), [outlet.id], "taste");
  assert.deepEqual(p.find("forget"), [], "forget is in the pop-up window (M10)");
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
  for (const word of ["like", "dislike", "accept", "taste", "forget"]) {
    const [button] = p.find(word);
    assert.deepEqual(p.from(button.id).map(([b]) => b.id), [outlet.id], word);
  }
  const [title] = [...p.boxes.values()].filter((b) => (b.text || "").startsWith("title "));
  assert.deepEqual(p.from(title.id).map(([b]) => b.text), ["thispatcher"]);
  // The taste pane chooses its own views (tabs): no window buttons for them.
  // Its sliders and buttons (pin, unpin, strength, mix, ...) go to the engine.
  assert.deepEqual([...p.find("edit weights"), ...p.find("memory")], []);
  assert.deepEqual(p.into(taste.id).map(([b]) => b.id), [route.id], "only the engine's emilyview feeds it");
  assert.deepEqual(p.from(taste.id).map(([b]) => b.id), [outlet.id]);
  const [release] = p.find("release all pins");
  const [[t]] = p.from(release.id);
  const [[unpin]] = p.from(t.id);
  assert.equal(unpin.text, "unpin");
  assert.deepEqual(p.from(unpin.id).map(([b]) => b.id), [outlet.id]);
  // Store and recall a whole taste, through file dialogs.
  for (const [dialog, message] of [["savedialog", "prepend storetaste"], ["opendialog", "prepend recalltaste"]]) {
    const [box] = p.find(dialog);
    const [[pre]] = p.from(box.id, 0);
    assert.equal(pre.text, message);
    assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id]);
  }
  // Reload seed: compose the seed shown again (after changing mix, novelty or weights).
  const [reload] = p.find("reload seed");
  const [[rt]] = p.from(reload.id);
  assert.equal(rt.text, "t b");
  const [[compose]] = p.from(rt.id);
  assert.deepEqual([compose.maxclass, compose.text], ["message", "compose"]);
  assert.deepEqual(p.from(compose.id).map(([b]) => b.id), [outlet.id]);
  // The buttons sit in one row, none overlapping, inside the window.
  const row = [...p.boxes.values()].filter((b) => b.presentation && b.maxclass === "message").map((b) => b.presentation_rect).sort((a, b) => a[0] - b[0]);
  assert.ok(row.length >= 9);
  row.slice(1).forEach((r, k) => assert.ok(r[0] >= row[k][0] + row[k][2], `button at ${r[0]} overlaps the one before`));
  assert.ok(row.at(-1)[0] + row.at(-1)[2] <= roll.presentation_rect[0] + roll.presentation_rect[2]);
});

test("emi.corpora: the corpus window (M11): its list talks to the engine; add folder and rescan too", () => {
  const p = patchFile("emi.corpora.maxpat");
  const [inlet] = p.find("inlet");
  const [outlet] = p.find("outlet");
  const [route] = p.find("route corpusview");
  assert.deepEqual(p.from(inlet.id).map(([b]) => b.id), [route.id]);
  const [[list]] = p.from(route.id, 0);
  assert.equal(list.filename, "emi.corpora.bundle.js");
  assert.deepEqual(p.from(list.id).map(([b]) => b.id), [outlet.id], "corpuson, corpusonly, corpusremove");
  const [dialog] = p.find("opendialog fold");
  const [[pre]] = p.from(dialog.id, 0);
  assert.equal(pre.text, "prepend corpusadd");
  assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id]);
  const [rescan] = p.find("rescan");
  const [[t]] = p.from(rescan.id);
  const [[message]] = p.from(t.id);
  assert.deepEqual([message.maxclass, message.text], ["message", "corpusrescan"]);
  assert.deepEqual(p.from(message.id).map(([b]) => b.id), [outlet.id]);
  // The panel's corpora button opens it.
  const panel = patchFile("emi.panel.maxpat");
  const [button] = panel.find("corpora");
  assert.deepEqual(panel.from(button.id).map(([b]) => b.text), ["s ---emi.corpora"]);
  assert.deepEqual(panel.find("load corpus"), [], "the window replaces load corpus");
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
  for (const [file, host] of [["cento.maxpat", "emi.host.max.maxpat"], ["emi.brain.maxpat", "emi.host.live.maxpat"]]) {
    const p = patchFile(file);
    const [engine] = p.find("emi.engine");
    const bpatchers = [...p.boxes.values()].filter((b) => b.maxclass === "bpatcher").map((b) => b.name);
    assert.deepEqual(bpatchers, [host, "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat"], file);
    const into = p.into(engine.id).map(([b]) => b.name || b.text).sort();
    assert.deepEqual(into, [host, "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat", "emi.window", "emi.corpora"].sort(), `${file}: the panels, the roll's selections and the windows go to the engine`);
    const from = p.from(engine.id).map(([b]) => b.name || b.text).sort();
    assert.deepEqual(from, [host, "emi.panel.maxpat", "emily.panel.maxpat", "route view", "emi.window", "emi.corpora"].sort(), `${file}: the engine answers them`);
    // The Emily panel's window button opens the pop-up window; the panel's
    // corpora button (M11) opens the corpus window.
    for (const [abstraction, name] of [["emi.window", "---emi.window"], ["emi.corpora", "---emi.corpora"]]) {
      const [window] = p.find(abstraction);
      const [receive] = p.find("r " + name);
      const [[open]] = p.from(receive.id);
      assert.equal(open.text, "open");
      const [[pcontrol]] = p.from(open.id);
      assert.equal(pcontrol.text, "pcontrol");
      assert.deepEqual(p.from(pcontrol.id).map(([b, inlet]) => [b.id, inlet]), [[window.id, 0]], `${file}: ${abstraction}`);
    }
  }
  // The device is exactly as wide as its four panels.
  const device = readPatcher(locate("cento.brain.amxd"));
  const brain = patchFile("emi.brain.maxpat");
  const right = Math.max(...[...brain.boxes.values()].filter((b) => b.presentation_rect).map((b) => b.presentation_rect[0] + b.presentation_rect[2]));
  assert.equal(device.devicewidth, right);
});

// ---------------------------------------------------------------- hover text

// Every control a player sees has hover text: "hint" (Max's tooltip) and
// "annotation" with "annotation_name" (Max's Clue window, Live's Info View),
// the same text docs/controls.md gives.
test("every visible control has hover text, and docs/controls.md gives the same", () => {
  const doc = fs.readFileSync(path.join(ROOT, "docs", "controls.md"), "utf8");
  const rows = new Set(doc.split("\n").filter((l) => l.startsWith("| **")));
  let controls = 0;
  for (const file of files.filter((f) => f.endsWith(".maxpat"))) {
    for (const [patcher, where] of patchers(readPatcher(path.join(ROOT, file)), file)) {
      for (const { box } of patcher.boxes) {
        if (!box.presentation || ["comment", "panel", "bpatcher"].includes(box.maxclass)) continue;
        const name = `${where}: ${box.maxclass} ${box.varname || box.text}`;
        assert.ok(box.hint && box.hint.length > 20, `${name}: a hint`);
        assert.equal(box.annotation, box.hint, `${name}: the same text for the Clue window and Live's Info View`);
        assert.ok(box.annotation_name, `${name}: a name for the Info View`);
        assert.ok(rows.has(`| **${box.annotation_name}** | ${box.hint} |`), `${name}: in docs/controls.md`);
        controls++;
      }
    }
  }
  assert.ok(controls >= 55, `${controls} controls`); // 55 now
  // The taste report button, in both places, says what it does.
  for (const file of ["emily.panel.maxpat", "emi.window.maxpat"]) {
    const [taste] = patchFile(file).find("taste report");
    assert.match(taste.hint, /^Report Magdalena's taste: .*It changes nothing\.$/);
  }
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
  const engine = readPatcher(locate("emi.engine.maxpat"));
  const player = engine.boxes.map(({ box }) => box).find((b) => b.text === "p grid-player").patcher;
  const boxes = new Map(player.boxes.map(({ box }) => [box.id, box]));
  const find = (text) => [...boxes.values()].filter((b) => (b.text || b.maxclass) === text);
  const from = (id, outlet) =>
    player.lines.filter(({ patchline: l }) => l.source[0] === id && (outlet === undefined || l.source[1] === outlet))
      .map(({ patchline: l }) => [boxes.get(l.destination[0]), l.destination[1]]);
  return { boxes, find, from };
}

// Runs the [p grid-player] as Max would, message by message, for the objects
// it uses. An outlet's connections fire right to left (by the destination's
// position), and [t] fires its outlets right to left. tick(step) is the
// transport at that step (16ths from bar 1 in 4/4) on a metro tick; it
// records the steps read from the queue, the playhead sent and the note-offs.
function simulatePlayer() {
  const { boxes } = playerPatch();
  const player = readPatcher(locate("emi.engine.maxpat")).boxes.map(({ box }) => box).find((b) => b.text === "p grid-player").patcher;
  const wires = new Map();
  for (const { patchline: l } of player.lines) {
    const key = `${l.source[0]}:${l.source[1]}`;
    if (!wires.has(key)) wires.set(key, []);
    wires.get(key).push([l.destination[0], l.destination[1]]);
  }
  for (const list of wires.values()) {
    list.sort((a, b) => boxes.get(b[0]).patching_rect[0] - boxes.get(a[0]).patching_rect[0] || boxes.get(b[0]).patching_rect[1] - boxes.get(a[0]).patching_rect[1]);
  }
  const state = new Map(); // box id -> stored inlet values and the like
  const record = { reads: [], playhead: [], flushes: 0, need: 0, ended: 0 };
  const out = (id, outlet, value) => {
    for (const [to, inlet] of wires.get(`${id}:${outlet}`) || []) receive(to, inlet, value);
  };
  const args = (b) => b.text.split(" ").slice(1).map(Number);
  const stored = (b, inlet) => {
    const s = state.get(b.id) || { in: args(b) };
    state.set(b.id, s);
    return s;
  };
  function receive(id, inlet, value) {
    const b = boxes.get(id);
    const text = b.text || "";
    const [name] = text.split(" ");
    if (b.maxclass === "message") return out(id, 0, Number(b.text));
    if (b.maxclass === "outlet") {
      if (/^need/.test(b.comment)) record.need++;
      if (/^ended/.test(b.comment)) record.ended++;
      return;
    }
    if (name === "t") {
      const types = text.split(" ").slice(1);
      for (let k = types.length - 1; k >= 0; k--) out(id, k, types[k] === "b" ? "bang" : value);
      return;
    }
    if (["-", "+", "!=", "==", "<", "maximum"].includes(name)) {
      const s = stored(b);
      if (inlet === 1) return void (s.in[0] = value);
      const r = s.in[0];
      const result = { "-": value - r, "+": value + r, "!=": Number(value !== r), "==": Number(value === r), "<": Number(value < r), maximum: Math.max(value, r) }[name];
      return out(id, 0, result);
    }
    if (name === "sel") {
      const k = args(b).indexOf(value);
      return out(id, k >= 0 ? k : args(b).length, k >= 0 ? "bang" : value);
    }
    if (name === "gate") {
      const s = state.get(id) || { open: args(b)[1] };
      state.set(id, s);
      if (inlet === 0) return void (s.open = value);
      if (s.open) out(id, s.open - 1, value);
      return;
    }
    if (name === "change") {
      const s = state.get(id) || { last: args(b)[0] };
      state.set(id, s);
      if (value !== s.last) out(id, 0, (s.last = value));
      return;
    }
    if (name === "expr") {
      const s = state.get(id) || { in: [0, 0, 0, 0, 0] };
      state.set(id, s);
      if (Array.isArray(value)) value.forEach((v, k) => (s.in[k] = v));
      else s.in[inlet] = value;
      if (inlet === 0) out(id, 0, maxExpr(text, s.in));
      return;
    }
    if (name === "pack") {
      const s = state.get(id) || { in: args(b) };
      state.set(id, s);
      s.in[inlet] = value;
      if (inlet === 0) out(id, 0, s.in.slice());
      return;
    }
    if (text === "prepend view playhead") return void record.playhead.push(value);
    if (text === "coll ---emi.queue") return void record.reads.push(value);
    if (text === "flush") return void record.flushes++;
    if (b.maxclass === "inlet") return out(id, 0, value);
    throw new Error(`the simulation doesn't know [${text || b.maxclass}]`);
  }
  const inlets = [...boxes.values()].filter((b) => b.maxclass === "inlet");
  const [transport] = [...boxes.values()].filter((b) => b.text === "transport");
  return {
    record,
    send(comment, value = "bang") {
      receive(inlets.find((b) => b.comment.startsWith(comment)).id, 0, value);
    },
    // [transport] answers right to left: time signature, then units, beats, bars.
    tick(step) {
      out(transport.id, 6, 4);
      out(transport.id, 5, 4);
      out(transport.id, 2, (step % 4) * 120);
      out(transport.id, 1, Math.floor((step % 16) / 4) + 1);
      out(transport.id, 0, Math.floor(step / 16) + 1);
    },
    ticks(from, to) {
      for (let s = from; s <= to; s++) this.tick(s);
    },
  };
}

const range = (from, to) => Array.from({ length: to - from + 1 }, (_, k) => from + k);

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
  // Stop and restart send note-offs.
  const [flushAll] = p.find("t b").filter((b) => p.from(b.id).filter(([to]) => to.text === "flush").length === 4);
  assert.ok(flushAll, "one [t b] reaches all four [flush]es");
  // A jump (a step that isn't the last + 1) resets the lead, so a transport
  // starting at bar 1 starts the queue at bar 1 even after a restart. It
  // doesn't send note-offs: a playing queue plays straight on (below).
  const [split] = p.find("t i i i");
  const [[diff, diffInlet]] = p.from(split.id, 2);
  assert.deepEqual([diff.text, diffInlet], ["- 0", 0], "this step...");
  assert.deepEqual(p.from(split.id, 1).map(([b, inlet]) => [b.id, inlet]), [[diff.id, 1]], "...minus the last");
  const [[jumped]] = p.from(diff.id).filter(([b]) => b.text === "!= 1");
  const [[sel]] = p.from(jumped.id);
  assert.equal(sel.text, "sel 1");
  const targets = p.from(sel.id, 0).map(([b]) => b);
  assert.ok(!targets.some((b) => b.id === flushAll.id), "a jump sends no note-offs");
  const [[gate]] = p.from(p.find("t i i").find((b) => p.from(b.id, 1).some(([to]) => to.text === "gate 1 1")).id, 1);
  const [[lead]] = p.from(gate.id);
  assert.equal(lead.text, "+ 0");
  assert.ok(targets.some((b) => b.maxclass === "message" && b.text === "0" && p.from(b.id).some(([to, inlet]) => to.id === lead.id && inlet === 1)), "a jump sets lead 0");

  // A jump while the queue plays moves its origin by (jump - 1), so the queue
  // goes on to its next step: the piece never jumps back with the transport
  // (Ableton Link realigning Max's transport, a moved playhead). The origin
  // the gate finds (play, stop, restart) is kept the same way, and comes
  // later in the tick, so it wins.
  const [[shift]] = p.from(diff.id).filter(([b]) => b.text === "- 1");
  const [[moved]] = p.from(shift.id);
  assert.equal(moved.text, "sel 0", "no jump: nothing");
  const [[sum, sumInlet]] = p.from(moved.id, 1);
  assert.deepEqual([sum.text, sumInlet], ["+ 0", 0], "jump - 1 + the origin");
  const [[keep]] = p.from(sum.id);
  assert.equal(keep.text, "t i i");
  const [originT] = p.find("t b i");
  assert.deepEqual(p.from(originT.id, 1).map(([b, inlet]) => [b.id, inlet]), [[keep.id, 0]], "the origin found");
  assert.deepEqual(p.from(keep.id, 1).map(([b, inlet]) => [b.id, inlet]), [[sum.id, 1]], "kept for the next jump");
  const [[relative, relInlet]] = p.from(keep.id, 0);
  assert.deepEqual([relative.text, relInlet], ["- 0", 1], "step - origin = the step in the queue");
  // The jump path fires first (the [t i i i]'s right outlet), the gate's after.
  assert.deepEqual(p.from(split.id, 0).map(([b]) => b.text), ["t i i"]);
  for (const comment of ["stop (bang): note-offs for sounding notes", "restart (bang): note-offs; the queue starts again at the bar after this one"]) {
    const [inlet] = [...p.boxes.values()].filter((b) => b.maxclass === "inlet" && b.comment === comment);
    const trigger = p.from(inlet.id).map(([b]) => b).find((b) => (b.text || "").startsWith("t "));
    assert.ok(p.from(trigger.id).some(([to]) => to.id === flushAll.id), comment);
  }
});

test("grid player, simulated: the queue starts on a barline and plays straight on through transport jumps", () => {
  // Max's Play: play, then the transport starts where it was (bar 2, beat 2).
  let p = simulatePlayer();
  p.send("play");
  p.ticks(20, 40);
  assert.deepEqual(p.record.reads, range(-12, 8), "the queue starts at bar 3 (step 32)");
  assert.deepEqual(p.record.playhead.slice(0, 2), [-1, 0], "the playhead shows from step 0");

  // Live: the transport starts at bar 1 with no play message (stop came
  // before, or the device just loaded). The queue starts at once.
  p = simulatePlayer();
  p.send("restart"); // a piece composed while stopped
  p.ticks(0, 10);
  assert.deepEqual(p.record.reads, range(0, 10), "a jump finds the barline at or after, even after a restart");

  // The false start: the transport jumps back while the piece plays (Link
  // realigning Max's transport, Live's position settling at its start). The
  // queue plays on, with no note-offs cutting it.
  p = simulatePlayer();
  p.send("stop");
  const flushes = p.record.flushes;
  p.ticks(0, 5);
  p.ticks(0, 3); // back to bar 1
  p.ticks(0, 9); // and again
  p.ticks(40, 42); // and ahead
  assert.deepEqual(p.record.reads, range(0, 22), "never back to the beginning, never ahead");
  assert.equal(p.record.flushes, flushes, "no note-offs on a jump");
  assert.deepEqual(p.record.playhead, [-1, ...range(0, 22)]);

  // Stop: note-offs and the playhead hidden; Play again (Max's transport goes
  // on from where it stopped) starts the queue at the next barline.
  p.send("stop");
  assert.ok(p.record.flushes > flushes, "stop sends note-offs");
  assert.equal(p.record.playhead.at(-1), -1);
  p.send("play");
  p.ticks(43, 50);
  assert.deepEqual(p.record.reads.slice(-8), range(-5, 2), "from bar 4 (step 48)");

  // A restart while playing: the new queue starts at the bar after this one,
  // and a jump while it waits doesn't change how long it waits.
  p = simulatePlayer();
  p.ticks(0, 37);
  p.send("restart");
  p.ticks(38, 40);
  p.ticks(20, 30);
  assert.deepEqual(p.record.reads.slice(-14), range(-10, 3), "the bar after 37 is 48: 10 steps to wait, then on");

  // need: once, when the queue reaches the threshold.
  p = simulatePlayer();
  p.send("streamat", 6);
  p.ticks(0, 8);
  p.ticks(0, 8);
  assert.equal(p.record.need, 1);

  // ended: when the queue reaches the piece's last step, and again each time
  // it is played again (Max's Play after the piece stopped itself).
  p = simulatePlayer();
  p.send("endat", 20);
  p.ticks(0, 19);
  assert.equal(p.record.ended, 0);
  p.tick(20);
  assert.equal(p.record.ended, 1, "at the last step");
  p.ticks(21, 30);
  assert.equal(p.record.ended, 1, "once");
  p.send("stop");
  p.send("play");
  p.ticks(31, 52); // the queue starts again at bar 3 (step 32): its step 20 is step 52
  assert.equal(p.record.ended, 2, "played again, ended again");
  p.send("endat", 999999);
  p.send("restart");
  p.ticks(53, 120);
  assert.equal(p.record.ended, 2, "never");
});

test("emi.host.live: Live's stop reaches the player, its (late) play doesn't", () => {
  // Live's is_playing arrives on the main thread, often after the transport
  // has started and the player has begun the piece: a play then would start
  // it again at the next bar.
  const p = patchFile("emi.host.live.maxpat");
  const [observer] = p.find("live.observer");
  const [[sel]] = p.from(observer.id);
  assert.equal(sel.text, "sel 0");
  assert.deepEqual(p.from(sel.id, 0).map(([b]) => b.text), ["stop"]);
  assert.deepEqual(p.from(sel.id, 1), []);
  assert.deepEqual(p.find("play"), [], "no play message in the Live host");
});

test("grid player: the step in the queue goes to the piano rolls as a playhead, hidden when stopped", () => {
  const p = playerPatch();
  const [relative] = p.find("- 0").filter((b) => p.from(b.id).some(([to]) => to.text === "t i i"));
  const [clamp] = p.find("maximum -1");
  assert.ok(p.from(relative.id).some(([to]) => to.id === clamp.id), "the step in the queue (negative before it starts: -1)");
  const [[change]] = p.from(clamp.id);
  assert.equal(change.text, "change -2", "only changes");
  const [[prepend]] = p.from(change.id, 0);
  assert.equal(prepend.text, "prepend view playhead");
  const [[outlet]] = p.from(prepend.id);
  assert.equal(outlet.maxclass, "outlet");
  const [stop] = [...p.boxes.values()].filter((b) => b.maxclass === "inlet" && /^stop/.test(b.comment));
  const hide = p.from(stop.id).map(([b]) => b).find((b) => b.maxclass === "message");
  assert.equal(hide.text, "-1");
  assert.deepEqual(p.from(hide.id).map(([b]) => b.id), [change.id]);
  // In emi.engine, the player's third outlet goes out with everything else.
  const engine = patchFile("emi.engine.maxpat");
  const [player] = engine.find("p grid-player");
  const [out] = engine.find("outlet");
  assert.deepEqual(engine.from(player.id, 2).map(([b]) => b.id), [out.id]);
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
  const [route] = p.find("route voice setting meter ended");
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

test("emi.host.max: one play/stop button, green for play, red for stop; it goes back to play when the piece ends", () => {
  const p = patchFile("emi.host.max.maxpat");
  const [play] = [...p.boxes.values()].filter((b) => b.varname === "Play");
  assert.equal(play.maxclass, "live.text");
  assert.deepEqual([play.mode, play.text, play.texton], [1, "play", "stop"], "a toggle: play when off, stop when on");
  // Without its parameter (an off/on enum) a live.text never turns on: it
  // stayed "play" in Max. Not restored at load: it starts off.
  assert.equal(play.parameter_enable, 1);
  const param = play.saved_attribute_attributes.valueof;
  assert.deepEqual([param.parameter_enum, param.parameter_mmax, param.parameter_initial_enable], [["off", "on"], 1, 0]);
  const green = play.activebgcolor;
  const red = play.activebgoncolor;
  assert.ok(green[1] > green[0] && green[1] > green[2], "green when off (play)");
  assert.ok(red[0] > red[1] && red[0] > red[2], "red when on (stop)");
  assert.deepEqual([play.bgcolor, play.bgoncolor], [green, red]);
  assert.deepEqual(p.find("toggle").filter((b) => b.varname === "Play"), []);
  assert.deepEqual(p.from(play.id).map(([b]) => b.text), ["sel 1 0"]);
  // "ended" from the engine: 0 into the button, as clicking stop would.
  const [route] = p.find("route voice setting meter ended");
  const [[zero]] = p.from(route.id, 3);
  assert.deepEqual([zero.maxclass, zero.text], ["message", "0"]);
  assert.deepEqual(p.from(zero.id).map(([b, inlet]) => [b.id, inlet]), [[play.id, 0]]);
});

test("emi.host.max: the engine's meter sets the transport's time signature (M8: 3/4)", () => {
  const p = patchFile("emi.host.max.maxpat");
  const [route] = p.find("route voice setting meter ended");
  const [[pre]] = p.from(route.id, 2);
  assert.equal(pre.text, "prepend timesig");
  assert.deepEqual(p.from(pre.id).map(([b, inlet]) => [b.text, inlet]), [["transport", 0]]);
});

test("emi.engine: the core feeds the queue and the player, and 'need' comes back on the main thread", () => {
  const p = patchFile("emi.engine.maxpat");
  const [core] = p.find("v8 emi.core.bundle.js");
  const [route] = p.find("route coll restart streamat later endat");
  assert.deepEqual(p.from(core.id).map(([b]) => b.text), ["route coll restart streamat later endat"]);
  const [player] = p.find("p grid-player");
  assert.deepEqual(p.from(route.id, 1).map(([b, inlet]) => [b.text, inlet]), [["p grid-player", 2]]);
  assert.deepEqual(p.from(route.id, 2).map(([b, inlet]) => [b.text, inlet]), [["p grid-player", 3]]);
  const [[defer]] = p.from(player.id, 1);
  assert.equal(defer.text, "deferlow");
  const [[need]] = p.from(defer.id);
  assert.equal(need.text, "need");
  assert.deepEqual(p.from(need.id).map(([b]) => b.id), [core.id]);
  // later <message> comes back to the core through [deferlow]: long work
  // (taste's comparison) a step at a time, the patch responsive in between.
  const [[later]] = p.from(route.id, 3);
  assert.equal(later.text, "deferlow");
  assert.deepEqual(p.from(later.id).map(([b, inlet]) => [b.id, inlet]), [[core.id, 0]]);
  // endat goes to the player; its "ended" comes back out on the main thread.
  assert.deepEqual(p.from(route.id, 4).map(([b, inlet]) => [b.text, inlet]), [["p grid-player", 4]]);
  const [[deferEnd]] = p.from(player.id, 3);
  assert.equal(deferEnd.text, "deferlow");
  const [[ended]] = p.from(deferEnd.id);
  assert.deepEqual([ended.maxclass, ended.text], ["message", "ended"]);
  // Everything else goes out.
  const [out] = p.find("outlet");
  assert.deepEqual(p.from(ended.id).map(([b]) => b.id), [out.id]);
  assert.ok(p.from(route.id, 5).some(([b]) => b.id === out.id));
});

// ---------------------------------------------------------------- the GUI redesign (M12)

// Each panel and small window: everything shown fits inside it, and nothing
// covers anything else.
test("layout: every panel's controls fit inside it, none overlapping", () => {
  const sizes = { "emi.host.max.maxpat": [232, 169], "emi.host.live.maxpat": [170, 169], "emi.panel.maxpat": [300, 169], "emily.panel.maxpat": [130, 169], "emi.instruments.maxpat": [330, 170] };
  for (const [file, [width, height]] of Object.entries(sizes)) {
    const shown = [...patchFile(file).boxes.values()].filter((b) => b.presentation_rect && b.maxclass !== "panel");
    for (const b of shown) {
      const [x, y, w, h] = b.presentation_rect;
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height, `${file}: ${b.varname || b.text} at ${b.presentation_rect} is outside ${width} x ${height}`);
    }
    shown.forEach((a, i) => shown.slice(i + 1).forEach((b) => {
      const [ax, ay, aw, ah] = a.presentation_rect;
      const [bx, by, bw, bh] = b.presentation_rect;
      const overlap = ax < bx + bw && bx < ax + aw && ay < by + bh && by < ay + ah;
      assert.ok(!overlap, `${file}: ${a.varname || a.text} and ${b.varname || b.text} overlap`);
    }));
  }
});

test("layout: the composing panel starts with compose, the main action; each panel has its heading", () => {
  const p = patchFile("emi.panel.maxpat");
  const [compose] = p.find("compose");
  const shownControls = [...p.boxes.values()].filter((b) => b.presentation_rect && !["comment", "panel"].includes(b.maxclass));
  const top = Math.min(...shownControls.map((b) => b.presentation_rect[1]));
  assert.equal(compose.presentation_rect[1], top, "compose is in the top row");
  assert.equal(compose.presentation_rect[0], 6, "at its left");
  assert.equal(compose.fontface, 1, "in bold");
  assert.deepEqual(compose.textcolor, [1, 1, 1, 1]);
  // Every button shown has the same look (a fill colour), and every
  // on/off switch turns amber when on.
  for (const file of ["emi.panel.maxpat", "emily.panel.maxpat", "emi.host.max.maxpat", "emi.host.live.maxpat", "emi.window.maxpat", "emi.corpora.maxpat", "emi.instruments.maxpat"]) {
    for (const b of patchFile(file).boxes.values()) {
      if (!b.presentation_rect) continue;
      if (b.maxclass === "message") assert.equal(b.bgfillcolor_type, "color", `${file}: ${b.text}`);
      if (b.maxclass === "live.text" && b.mode === 1 && b.varname !== "Play") assert.deepEqual(b.bgoncolor, [0.96, 0.7, 0.33, 1], `${file}: ${b.varname}`);
    }
  }
  for (const [file, word] of [["emi.host.max.maxpat", "PLAY"], ["emi.host.live.maxpat", "CLIPS AND VOICES"], ["emi.panel.maxpat", "COMPOSE"], ["emily.panel.maxpat", "MAGDALENA"]]) {
    const [heading] = patchFile(file).find(word);
    assert.deepEqual(heading.presentation_rect.slice(0, 2), [6, 1], `${file}: ${word} at the top left`);
  }
});

test("tools menu: the less-used tools, then back to its title", () => {
  const p = patchFile("emi.panel.maxpat");
  const [outlet] = p.find("outlet");
  const menu = [...p.boxes.values()].find((b) => b.varname === "Tools");
  assert.equal(menu.maxclass, "umenu");
  assert.deepEqual(menu.items.filter((i) => i !== ","), ["tools", "load a chorale…", "play the test phrase", "stop and clear the queue"]);
  const [[pick]] = p.from(menu.id, 0);
  assert.equal(pick.text, "t b i");
  const [[back]] = p.from(pick.id, 0);
  assert.equal(back.text, "set 0");
  assert.deepEqual(p.from(back.id).map(([b]) => b.id), [menu.id], "the menu shows its title again");
  const [[sel]] = p.from(pick.id, 1);
  assert.equal(sel.text, "sel 1 2 3");
  // Item 1: the file dialog, then loadmidi (in the key original key says).
  const [[dialog]] = p.from(sel.id, 0);
  assert.equal(dialog.text, "opendialog");
  const [[pre]] = p.from(dialog.id, 0);
  assert.equal(pre.text, "prepend loadmidi");
  assert.deepEqual(p.from(pre.id).map(([b]) => b.id), [outlet.id]);
  for (const [k, word] of [[1, "pattern"], [2, "clear"]]) {
    const [[m]] = p.from(sel.id, k);
    assert.equal(m.text, word);
    assert.deepEqual(p.from(m.id).map(([b]) => b.id), [outlet.id]);
  }
  for (const gone of ["load chorale", "pattern", "clear"]) {
    assert.ok(p.find(gone).every((b) => !b.presentation_rect), `${gone} isn't on the panel any more`);
  }
});

test("plug-in instruments: their own window, opened by set up; each choice reaches the vst~ objects", () => {
  const w = patchFile("emi.instruments.maxpat");
  const [outlet] = w.find("outlet");
  for (const [k] of ["soprano", "alto", "tenor", "bass"].entries()) {
    for (const [word, label] of [["plug", "choose…"], ["open", "show editor"]]) {
      const button = [...w.boxes.values()].find((b) => b.varname === `${word} ${k + 1}`);
      assert.equal(button.text, label);
      const [[t]] = w.from(button.id);
      const [[command]] = w.from(t.id);
      assert.equal(command.text, `${word} ${k + 1}`);
      assert.deepEqual(w.from(command.id).map(([b]) => b.id), [outlet.id]);
    }
  }
  const host = patchFile("emi.host.max.maxpat");
  const [setup] = host.find("set up…");
  assert.ok(setup.presentation_rect);
  const [[t]] = host.from(setup.id);
  const [[open]] = host.from(t.id);
  assert.equal(open.text, "open");
  const [[pcontrol]] = host.from(open.id);
  assert.equal(pcontrol.text, "pcontrol");
  const [[win]] = host.from(pcontrol.id);
  assert.equal(win.text, "emi.instruments");
  const [[instruments, inlet]] = host.from(win.id);
  assert.deepEqual([instruments.text, inlet], ["p instruments", 1]);
  assert.deepEqual([...host.boxes.values()].filter((b) => /^(plug|open) \d$/.test(b.text || "") && b.presentation_rect), [], "no plug/open buttons on the panel");
});

test("plain names on the panels; Live's parameters keep theirs (mappings and automation still find them)", () => {
  const panel = patchFile("emi.panel.maxpat");
  const label = (p, varname) => [...p.boxes.values()].find((b) => b.varname === varname).text;
  assert.deepEqual(["Form", "Signatures", "Stream"].map((v) => label(panel, v)), ["chorale form", "signatures", "stream"]);
  assert.ok(panel.find("corpora")[0].presentation_rect);
  assert.ok(panel.find("listening test…")[0].presentation_rect);
  const emily = patchFile("emily.panel.maxpat");
  assert.equal(label(emily, "Accept"), "keep");
  const dial = [...emily.boxes.values()].find((b) => b.varname === "Temperature");
  assert.deepEqual([dial.saved_attribute_attributes.valueof.parameter_longname, dial.saved_attribute_attributes.valueof.parameter_shortname], ["Temperature", "temperature"]);
  const [report] = emily.find("taste report");
  const [[t]] = emily.from(report.id);
  const [[taste]] = emily.from(t.id);
  assert.equal(taste.text, "taste");
  const live = patchFile("emi.host.live.maxpat");
  for (const [shown, command] of [["write clips", "writeclips"], ["test clips", "testclip"]]) {
    const [button] = live.find(shown);
    const [[bang]] = live.from(button.id);
    const [[m]] = live.from(bang.id);
    assert.equal(m.text, command);
  }
});

test("the panels' piano roll is narrower (260 px): the pop-up window has the large one", () => {
  const view = patchFile("emi.view.maxpat");
  const roll = [...view.boxes.values()].find((b) => b.varname === "Piano roll");
  assert.equal(roll.presentation_rect[2], 260);
  const device = readPatcher(locate("cento.brain.amxd"));
  assert.equal(device.devicewidth, 170 + 8 + 300 + 8 + 130 + 8 + 260);
});

test("Magdalena: her panel says what she is (the user's taste); the pop-up window explains her", () => {
  const panel = patchFile("emily.panel.maxpat");
  const [subtitle] = panel.find("user's taste");
  assert.ok(subtitle.presentation_rect, "beside the heading");
  const w = patchFile("emi.window.maxpat");
  const [explain] = w.find("explain Magdalena");
  assert.ok(explain.presentation_rect && /Anna Magdalena Bach/.test(explain.hint));
  const [[t]] = w.from(explain.id);
  const [[open]] = w.from(t.id);
  assert.equal(open.text, "open");
  const [[pcontrol]] = w.from(open.id);
  assert.equal(pcontrol.text, "pcontrol");
  const [[about]] = w.from(pcontrol.id);
  assert.equal(about.text, "emi.magdalena");
  const a = patchFile("emi.magdalena.maxpat");
  const text = [...a.boxes.values()].filter((b) => b.maxclass === "comment" && b.presentation_rect).map((b) => b.text).join(" ");
  for (const words of ["learns the user's taste", "like and dislike", "temperature sets how much chance still plays", "keep writes what you're hearing into Magdalena's notebook", "Anna Magdalena Bach (1701–1760)", "isn't affiliated with David Cope"]) {
    assert.ok(text.includes(words), words);
  }
  const shown = [...a.boxes.values()].filter((b) => b.presentation_rect).map((b) => b.presentation_rect);
  shown.slice(1).forEach((r, k) => assert.ok(r[1] >= shown[k][1] + shown[k][3], "paragraphs one under another"));
  const [title] = [...a.boxes.values()].filter((b) => (b.text || "").startsWith("title "));
  assert.equal(title.text, "title Cento: about Magdalena");
  // Nowhere on a panel or window is she still called Emily.
  for (const file of files.filter((f) => f.endsWith(".maxpat"))) {
    for (const [patcher] of patchers(readPatcher(path.join(ROOT, file)), file)) {
      for (const { box } of patcher.boxes) {
        if (!box.presentation_rect) continue;
        for (const field of ["text", "hint", "annotation_name"]) assert.ok(!/\bEmily\b(?! Howell)/.test(box[field] || ""), `${file}: ${box[field]}`);
      }
    }
  }
});

test("sections: each part of the strip sits on a solid colour of its own, with light text on it", () => {
  const colours = new Map();
  for (const [file, width] of [["emi.host.max.maxpat", 232], ["emi.host.live.maxpat", 170], ["emi.panel.maxpat", 300], ["emily.panel.maxpat", 130]]) {
    const p = readPatcher(locate(file));
    const back = p.boxes[0].box;
    assert.equal(back.maxclass, "panel", `${file}: the first box (the back) is a [panel]`);
    assert.deepEqual(back.presentation_rect, [0, 0, width, 169], file);
    assert.equal(back.ignoreclick, 1, `${file}: clicks pass through it`);
    colours.set(file, back.bgfillcolor_color.join(","));
    for (const { box } of p.boxes) {
      if (box.maxclass !== "comment" || !box.presentation_rect) continue;
      const [r, g, b] = box.textcolor;
      assert.ok(Math.min(r, g, b) >= 0.8, `${file}: "${box.text}" is light enough to read on the dark colour`);
    }
  }
  assert.equal(colours.get("emi.host.max.maxpat"), colours.get("emi.host.live.maxpat"), "the left panel: the same colour in both versions");
  assert.equal(new Set([colours.get("emi.host.max.maxpat"), colours.get("emi.panel.maxpat"), colours.get("emily.panel.maxpat")]).size, 3, "three colours for three jobs");
});

test("patchers/: only what you open on top; the parts and the scripts in their own folders", () => {
  assert.deepEqual(fs.readdirSync(path.join(ROOT, "patchers")).filter((f) => !f.startsWith(".")).sort(), ["cento.brain.amxd", "cento.maxpat", "cento.voice.amxd", "parts", "scripts"]);
  assert.ok(fs.readdirSync(path.join(ROOT, "patchers", "parts")).every((f) => f.endsWith(".maxpat")));
  assert.ok(fs.readdirSync(path.join(ROOT, "patchers", "scripts")).every((f) => f.endsWith(".bundle.js")));
});
