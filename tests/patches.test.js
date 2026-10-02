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
  const [route] = p.find("route voice status error");
  const voiceOut = p.from(route.id, 0);
  assert.equal(voiceOut.length, 1);
  const [[gate, inlet]] = voiceOut;
  assert.deepEqual([gate.text, inlet], ["gate 1", 1]);
  // The gate's control comes from the Play toggle (via [t i i]).
  const [[trigger]] = p.into(gate.id, 0);
  assert.equal(trigger.text, "t i i");
  assert.deepEqual(p.into(trigger.id).map(([b]) => b.maxclass), ["toggle"]);
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
