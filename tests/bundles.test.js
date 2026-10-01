"use strict";
// Tests the bundled scripts in patchers/, loaded the way [v8] loads them.
const test = require("node:test");
const assert = require("node:assert/strict");

const { loadBundle } = require("./max-sim");
const build = require("../tools/build");
const { hello } = require("emi-hello");
const queue = require("emi-queue");
const patterns = require("emi-pattern");
const smf = require("emi-smf");
const fs = require("fs");
const os = require("os");
const path = require("path");

// A tiny chorale in A major with a sidecar, written to a temp folder, as
// tools/export-chorales.py would write it.
function writeChorale() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "emi-"));
  const chords = [[76, 73, 69, 57], [74, 71, 68, 52], [73, 69, 64, 57]];
  const tracks = ["Soprano", "Alto", "Tenor", "Bass"].map((name, v) => ({
    name,
    channel: 1,
    notes: chords.map((chord, i) => ({ on: (3 + i) * 960, pitch: chord[v], dur: 960, vel: 90 })),
  }));
  const midiPath = path.join(dir, "bwv000.mid");
  fs.writeFileSync(midiPath, smf.write({ ppq: 960, meter: [4, 4], keySignature: { sf: 3, minor: false }, tracks }));
  fs.writeFileSync(
    path.join(dir, "bwv000.json"),
    JSON.stringify({
      meter: "4/4",
      key: { tonic: "A", mode: "major" },
      parts: ["Soprano", "Alto", "Tenor", "Bass"],
      midi: { ppq: 960, voiceTracks: [1, 2, 3, 4] },
      padQuarters: 3,
      fermatasQuarters: [5],
    }),
  );
  return midiPath;
}

test("bundles in patchers/ are up to date with code/", () => {
  assert.deepEqual(build.check(), []);
});

test("each bundle exposes exactly its documented messages", () => {
  assert.deepEqual(loadBundle("emi.hello").handlers(), ["bang", "msg_int"]);
  assert.deepEqual(loadBundle("emi.player").handlers(), ["clear", "key", "loadmidi", "pattern"]);
  assert.deepEqual(loadBundle("emi.clips", { LiveAPI: class {} }).handlers(), ["key", "loadmidi", "testclip", "writeclips"]);
});

// Convention: one inlet and one outlet per wrapper. If a script fails to load,
// [v8] keeps its default single inlet and outlet and Max deletes any other
// cords ("patchcord outlet out of range"), which is what happened in M0.
test("every bundle has exactly one inlet and one outlet", () => {
  for (const name of ["emi.hello", "emi.player", "emi.clips"]) {
    const { context } = loadBundle(name);
    assert.deepEqual([context.inlets, context.outlets, context.autowatch], [1, 1, 1], name);
  }
});

test("hello: the bundle prints the same values as the Node module", () => {
  const bundle = loadBundle("emi.hello");
  const expected = hello(1);
  assert.deepEqual(bundle.send("bang"), [[0, "hello", "emi", expected.version, "seed", 1, "check", ...expected.check]]);
  assert.deepEqual(bundle.send("msg_int", 99)[0].slice(-4), hello(99).check);
});

test("player: 'pattern' clears the coll, then stores every step in order", () => {
  const out = loadBundle("emi.player").send("pattern");
  assert.ok(out.every(([index]) => index === 0));
  const toColl = out.filter(([, selector]) => selector === "coll").map(([, , ...atoms]) => atoms);
  const status = out.filter(([, selector]) => selector !== "coll").map(([, ...atoms]) => atoms);

  const steps = queue.toSteps(patterns.testChorale());
  assert.deepEqual(toColl[0], ["clear"]);
  assert.deepEqual(
    toColl.slice(1),
    steps.map(({ step, events }) => ["store", step, ...events]),
  );
  assert.deepEqual(status, [["status", "test-cadence", "queued"]]);
});

test("player: 'loadmidi' reads a chorale and queues it in C; 'key original' requeues it", () => {
  const bundle = loadBundle("emi.player");
  const out = bundle.send("loadmidi", writeChorale());
  const stores = out.filter(([, a, b]) => a === "coll" && b === "store");
  assert.equal(stores.length, 4); // steps 12, 16, 20 (on/off) and 24 (offs)
  assert.deepEqual(stores[0], [0, "coll", "store", 12, 1, 79, 90, 2, 76, 90, 3, 72, 90, 4, 60, 90]); // +3: A -> C
  assert.deepEqual(out.at(-1), [0, "status", "bwv000", "A", "major", "->", "C", "major", "(+3)", "4/4", "2", "bars", "1", "phrases", "queued"]);

  const original = bundle.send("key", "original");
  assert.deepEqual(original.find(([, a, b]) => a === "coll" && b === "store"), [0, "coll", "store", 12, 1, 76, 90, 2, 73, 90, 3, 69, 90, 4, 57, 90]);
  assert.equal(bundle.send("key", "sideways")[0][1], "error");
});

test("player: a missing file is an error, not a crash", () => {
  const out = loadBundle("emi.player").send("loadmidi", path.join(os.tmpdir(), "no-such-file.mid"));
  assert.deepEqual(out.map(([, selector]) => selector), ["error"]);
  assert.match(String(out[0][2]), /can't open no-such-file\.mid/);
});

test("player: 'clear' empties the coll", () => {
  assert.deepEqual(loadBundle("emi.player").send("clear"), [
    [0, "coll", "clear"],
    [0, "status", "queue", "cleared"],
  ]);
});

// A fake Live set: tracks with names and clip slots, recording every call.
function fakeLive({ trackNames, ownTrack = 0, slotsPerTrack = 4, filled = [] }) {
  const calls = [];
  const hasClip = new Set(filled);
  class LiveAPI {
    constructor(path) {
      this.unquotedpath = path === "this_device canonical_parent" ? `live_set tracks ${ownTrack}` : path;
    }
    getcount(property) {
      if (this.unquotedpath === "live_set" && property === "tracks") return trackNames.length;
      if (/^live_set tracks \d+$/.test(this.unquotedpath) && property === "clip_slots") return slotsPerTrack;
      throw new Error(`unexpected getcount ${property} on ${this.unquotedpath}`);
    }
    get(property) {
      const track = this.unquotedpath.match(/^live_set tracks (\d+)$/);
      if (track && property === "name") return [trackNames[Number(track[1])]];
      const slot = this.unquotedpath.match(/^live_set tracks (\d+) clip_slots (\d+)$/);
      if (slot && property === "has_clip") return [hasClip.has(`${slot[1]}:${slot[2]}`) ? 1 : 0];
      throw new Error(`unexpected get ${property} on ${this.unquotedpath}`);
    }
    call(name, ...args) {
      calls.push([this.unquotedpath, name, ...args]);
      const slot = this.unquotedpath.match(/^live_set tracks (\d+) clip_slots (\d+)$/);
      if (slot && name === "create_clip") hasClip.add(`${slot[1]}:${slot[2]}`);
    }
    set(property, value) {
      calls.push([this.unquotedpath, "set", property, value]);
    }
  }
  return { LiveAPI, calls };
}

test("clips: loading the script doesn't touch the Live API", () => {
  let constructed = 0;
  loadBundle("emi.clips", {
    LiveAPI: class {
      constructor() {
        constructed++;
      }
    },
  });
  assert.equal(constructed, 0);
});

test("clips: writes one 2-bar clip per voice into the S/A/T/B tracks", () => {
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"], filled: ["2:0"] });
  const bundle = loadBundle("emi.clips", live);
  const out = bundle.send("testclip");
  assert.equal(out[0][1], "status");

  const creates = live.calls.filter(([, name]) => name === "create_clip");
  assert.deepEqual(creates, [
    ["live_set tracks 1 clip_slots 0", "create_clip", 8],
    ["live_set tracks 2 clip_slots 1", "create_clip", 8], // slot 0 already has a clip
    ["live_set tracks 3 clip_slots 0", "create_clip", 8],
    ["live_set tracks 4 clip_slots 0", "create_clip", 8],
  ]);
  const notes = live.calls.filter(([, name]) => name === "add_new_notes");
  assert.equal(notes.length, 4);
  // Array.from: arrays made inside the simulated [v8] context belong to
  // another JS realm, which deepEqual treats as a different type.
  assert.deepEqual(
    Array.from(notes[0][2].notes, (n) => n.pitch),
    [72, 72, 71, 72, 74, 71, 72],
  );
  assert.deepEqual(notes[3][0], "live_set tracks 4 clip_slots 0 clip");
});

test("clips: without voice tracks, writes all voices into this track", () => {
  const live = fakeLive({ trackNames: ["Drums", "EMI"], ownTrack: 1 });
  const bundle = loadBundle("emi.clips", live);
  bundle.send("testclip");
  const notes = live.calls.filter(([, name]) => name === "add_new_notes");
  assert.equal(notes.length, 1);
  assert.equal(notes[0][0], "live_set tracks 1 clip_slots 0 clip");
  assert.equal(notes[0][2].notes.length, 28);
});

test("clips: reports an error when the track has no empty slot", () => {
  const live = fakeLive({ trackNames: ["EMI"], slotsPerTrack: 1, filled: ["0:0"] });
  const bundle = loadBundle("emi.clips", live);
  const out = bundle.send("testclip");
  assert.deepEqual(out[0].slice(0, 2), [0, "error"]);
  assert.match(String(out[0][2]), /no empty clip slot/);
});

test("clips: 'writeclips' needs a loaded chorale", () => {
  const live = fakeLive({ trackNames: ["EMI"] });
  const out = loadBundle("emi.clips", live).send("writeclips");
  assert.equal(out[0][1], "error");
  assert.deepEqual(live.calls, []);
});

test("clips: 'loadmidi' then 'writeclips' writes the chorale in C into the voice tracks", () => {
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"] });
  const bundle = loadBundle("emi.clips", live);
  bundle.send("loadmidi", writeChorale());
  const out = bundle.send("writeclips");
  assert.deepEqual(out.at(-1), [0, "status", "wrote", "bwv000", "in", "C", "to", "4", "voice", "tracks"]);
  const names = live.calls.filter(([, name, property]) => name === "set" && property === "name").map((c) => c[3]);
  assert.deepEqual(names, ["bwv000 in C", "bwv000 in C", "bwv000 in C", "bwv000 in C"]);
  const bass = live.calls.filter(([, name]) => name === "add_new_notes")[3][2].notes;
  assert.deepEqual(Array.from(bass, (n) => n.pitch), [60, 55, 60]); // A major bass, moved to C

  bundle.send("key", "original");
  bundle.send("writeclips");
  const lastName = live.calls.filter(([, name, property]) => name === "set" && property === "name").at(-1)[3];
  assert.equal(lastName, "bwv000");
});
