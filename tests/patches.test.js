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

const files = [
  ...fs.readdirSync(path.join(ROOT, "patchers")).filter((f) => f.endsWith(".maxpat")).map((f) => path.join("patchers", f)),
  ...fs.readdirSync(path.join(ROOT, "devices")).filter((f) => f.endsWith(".amxd")).map((f) => path.join("devices", f)),
];

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

      // Every [v8] loads a bundle that exists (never code/ directly). Max 9
      // also needs the box's "textfile" entry to name that file; without it,
      // [v8] starts with an empty embedded script ("no function bang").
      for (const box of boxes.values()) {
        if (firstWord(box) !== "v8") continue;
        const script = box.text.split(/\s+/)[1];
        if (!/\.bundle\.js$/.test(script || "")) problems.push(`${where}: ${label(box)} should load a .bundle.js`);
        else if (!fs.existsSync(path.join(ROOT, "javascript", script))) problems.push(`${where}: javascript/${script} is missing`);
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
