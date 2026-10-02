"use strict";
// Tests the bundled scripts in patchers/, loaded the way [v8] and [v8ui] load
// them, with stand-ins for Max's File, Folder, LiveAPI and mgraphics.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { loadBundle } = require("./max-sim");
const build = require("../tools/build");
const { hello } = require("emi-hello");
const queue = require("emi-queue");
const patterns = require("emi-pattern");
const smf = require("emi-smf");

const Q = 960;
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "emi-"));

// Writes a chorale as tools/export-chorales.py would: <id>.mid + <id>.json.
// chords: [[soprano, alto, tenor, bass, beats]], starting with a pickup on beat 4.
function writeChorale(dir, id, chords, { keySignature = { sf: 0, minor: false }, key = { tonic: "C", mode: "major" } } = {}) {
  let t = 3 * Q;
  const tracks = ["Soprano", "Alto", "Tenor", "Bass"].map((name) => ({ name, channel: 1, notes: [] }));
  for (const [s, a, tn, b, beats] of chords) {
    [s, a, tn, b].forEach((pitch, v) => tracks[v].notes.push({ on: t, pitch, dur: beats * Q, vel: 90 }));
    t += beats * Q;
  }
  const midiPath = path.join(dir, id + ".mid");
  fs.writeFileSync(midiPath, smf.write({ ppq: Q, meter: [4, 4], keySignature, tracks }));
  fs.writeFileSync(
    path.join(dir, id + ".json"),
    JSON.stringify({
      meter: "4/4",
      key,
      parts: ["Soprano", "Alto", "Tenor", "Bass"],
      midi: { ppq: Q, voiceTracks: [1, 2, 3, 4] },
      padQuarters: 3,
      fermatasQuarters: [t / Q - 2],
    }),
  );
  return midiPath;
}

// A short chorale in A major: pickup, two chords, ending.
function writeAMajorChorale() {
  const chords = [[76, 73, 69, 57, 1], [74, 71, 68, 52, 1], [73, 69, 64, 57, 1]];
  return writeChorale(tempDir(), "bwv000", chords, { keySignature: { sf: 3, minor: false }, key: { tonic: "A", mode: "major" } });
}

// A folder of three chorales on the same I-IV-V cycle, so they recombine.
function writeCorpus() {
  const dir = tempDir();
  const [I, IV, V] = [[72, 67, 64, 48], [72, 69, 65, 53], [71, 67, 62, 55]];
  const cycle = [I, IV, V, I, IV, V, I, IV, V].map((c) => [...c, 1]).concat([[...I, 2]]);
  for (const id of ["a", "b", "c"]) writeChorale(dir, id, cycle);
  fs.writeFileSync(path.join(dir, "notes.txt"), "not a MIDI file"); // ignored
  return dir;
}

// A fake Live set: tracks with names and clip slots, recording every call.
function fakeLive({ trackNames, ownTrack = 0, slotsPerTrack = 4, filled = [] }) {
  const calls = [];
  const hasClip = new Set(filled);
  class LiveAPI {
    constructor(p) {
      this.unquotedpath = p === "this_device canonical_parent" ? `live_set tracks ${ownTrack}` : p;
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

const select = (out, selector) => out.filter(([, s]) => s === selector).map(([, , ...rest]) => rest);
const lastStatus = (out) => out.filter(([, s]) => s === "status" || s === "error").at(-1).slice(1);

// ---------------------------------------------------------------- all bundles

test("bundles in patchers/ are up to date with code/", () => {
  assert.deepEqual(build.check(), []);
});

test("each bundle exposes exactly its documented messages", () => {
  assert.deepEqual(loadBundle("emi.hello").handlers(), ["bang", "msg_int"]);
  assert.deepEqual(loadBundle("emi.core").handlers(), [
    "beats", "clear", "compose", "corpus", "exportmidi", "form", "key", "loadmidi", "pattern", "testclip", "writeclips",
  ]);
  assert.deepEqual(loadBundle("emi.view").handlers(), ["cadence", "clear", "done", "note", "onresize", "paint", "seam"]);
  assert.deepEqual(loadBundle("emi.voice").handlers(), ["trackname"]);
});

// Convention: one inlet and one outlet per [v8] wrapper. If a script fails to
// load, [v8] keeps its default single inlet and outlet and Max deletes any
// other cords ("patchcord outlet out of range"), which is what happened in M0.
test("[v8] bundles have one inlet and one outlet; the view has no outlet", () => {
  const counts = (name) => {
    const { context } = loadBundle(name);
    return [context.inlets, context.outlets, context.autowatch];
  };
  assert.deepEqual(counts("emi.hello"), [1, 1, 1]);
  assert.deepEqual(counts("emi.core"), [1, 1, 1]);
  assert.deepEqual(counts("emi.view"), [1, 0, 1]);
  assert.deepEqual(counts("emi.voice"), [1, 1, 1]);
});

// ---------------------------------------------------------------- voice: the track's name picks the voice

test("voice: the track's name sets which emi.voice.N the device receives", () => {
  const voice = loadBundle("emi.voice");
  assert.deepEqual(voice.send("trackname", "Tenor"), [[0, "set", "emi.voice.3"], [0, "show", "Tenor"]]);
  assert.deepEqual(voice.send("trackname", "s"), [[0, "set", "emi.voice.1"], [0, "show", "Soprano"]]);
  // live.observer may send a name with spaces as several atoms, or quoted.
  assert.deepEqual(voice.send("trackname", '"Bass"'), [[0, "set", "emi.voice.4"], [0, "show", "Bass"]]);
  assert.deepEqual(voice.send("trackname", 1, "MIDI"), [[0, "set", "emi.voice.0"], [0, "show", "no", "voice"]]);
});

test("hello: the bundle prints the same values as the Node module", () => {
  const bundle = loadBundle("emi.hello");
  const expected = hello(1);
  assert.deepEqual(bundle.send("bang"), [[0, "hello", "emi", expected.version, "seed", 1, "check", ...expected.check]]);
  assert.deepEqual(bundle.send("msg_int", 99)[0].slice(-4), hello(99).check);
});

// ---------------------------------------------------------------- core: queue and view

test("core: 'pattern' queues every step, draws it, and reports", () => {
  const out = loadBundle("emi.core").send("pattern");
  const coll = select(out, "coll");
  const steps = queue.toSteps(patterns.testChorale());
  assert.deepEqual(coll[0], ["clear"]);
  assert.deepEqual(coll.slice(1), steps.map(({ step, events }) => ["store", step, ...events]));
  const view = select(out, "view");
  assert.deepEqual(view[0], ["clear", 8 * Q, 48, 74, 4 * Q]);
  assert.equal(view.filter(([kind]) => kind === "note").length, 28);
  assert.deepEqual(view.at(-1), ["done"]);
  assert.deepEqual(lastStatus(out), ["status", "test-cadence", "queued"]);
});

test("core: 'loadmidi' queues a chorale in C; 'key original' requeues it as written", () => {
  const core = loadBundle("emi.core");
  const out = core.send("loadmidi", writeAMajorChorale());
  const stores = select(out, "coll").filter(([kind]) => kind === "store");
  assert.deepEqual(stores[0], ["store", 12, 1, 79, 90, 2, 76, 90, 3, 72, 90, 4, 60, 90]); // +3: A -> C
  assert.deepEqual(lastStatus(out), ["status", "bwv000", "A", "major", "->", "C", "major", "(+3)", "4/4", "2", "bars", "1", "phrases", "queued"]);

  const original = core.send("key", "original");
  assert.deepEqual(select(original, "coll")[1], ["store", 12, 1, 76, 90, 2, 73, 90, 3, 69, 90, 4, 57, 90]);
  assert.equal(lastStatus(core.send("key", "sideways"))[0], "error");
});

test("core: a missing file is an error, not a crash", () => {
  const out = loadBundle("emi.core").send("loadmidi", path.join(os.tmpdir(), "no-such-file.mid"));
  assert.deepEqual(lastStatus(out), ["error", "can't", "open", "no-such-file.mid"]);
});

test("core: 'clear' empties the queue", () => {
  assert.deepEqual(loadBundle("emi.core").send("clear"), [
    [0, "coll", "clear"],
    [0, "status", "queue", "cleared"],
  ]);
});

// ---------------------------------------------------------------- core: corpus and compose

test("core: 'compose' needs a corpus", () => {
  assert.deepEqual(lastStatus(loadBundle("emi.core").send("compose", 1)), ["error", "load", "a", "corpus", "first"]);
});

test("core: 'corpus' reads a folder; 'compose' makes, queues and draws a piece in a chorale's form", () => {
  const core = loadBundle("emi.core");
  const loaded = core.send("corpus", writeCorpus());
  assert.deepEqual(lastStatus(loaded).slice(0, 6), ["status", "corpus", 3, "chorales,", 33, "beats,"]);

  core.send("beats", 8);
  const out = core.send("compose", 3);
  const status = lastStatus(out);
  // e.g. "emi-3: form of b, 1 phrase, 11 beats, 3 chorales"
  assert.deepEqual(status.slice(0, 3), ["status", "emi-3:", "form"]);
  assert.match(status.join(" "), /^status emi-3: form of [abc], 1 phrase, 11 beats, [23] chorales$/);
  assert.ok(select(out, "coll").length > 1);
  const view = select(out, "view");
  assert.ok(view.some(([kind]) => kind === "seam"), "seams between sources");
  assert.equal(view.filter(([kind]) => kind === "cadence").length, 1, "the template's one cadence");
  const colors = new Set(view.filter(([kind]) => kind === "note").map((n) => n[4]));
  assert.ok(colors.size >= 2, "notes colored by source");

  // Same seed, same piece; no seed: the next one.
  assert.deepEqual(core.send("compose", 3), out);
  assert.deepEqual(lastStatus(core.send("compose")).slice(0, 2), ["status", "emi-4:"]);
});

test("core: 'form 0' composes freely, as in M2; 'form 1' goes back to forms", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  assert.deepEqual(lastStatus(core.send("form", 0)), ["status", "free", "pieces", "(M2),", "8+", "beats"]);
  const status = lastStatus(core.send("compose", 3));
  assert.deepEqual([status[1], status[3], status[4]], ["emi-3:", "beats", "from"]);
  assert.ok(status[2] >= 8, "at least 8 beats");
  assert.equal(lastStatus(core.send("form", 1))[1], "pieces");
  assert.equal(lastStatus(core.send("compose", 3))[2], "form");
});

test("core: 'exportmidi' writes the current score as a MIDI file", () => {
  const core = loadBundle("emi.core");
  assert.equal(lastStatus(core.send("exportmidi", path.join(tempDir(), "x.mid")))[0], "error");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 3);
  const target = path.join(tempDir(), "piece"); // ".mid" is added
  assert.deepEqual(lastStatus(core.send("exportmidi", target)), ["status", "exported", "piece.mid"]);
  const midi = smf.parse(fs.readFileSync(target + ".mid"));
  assert.deepEqual(midi.tracks.slice(1).map((t) => t.name), ["Soprano", "Alto", "Tenor", "Bass"]);
  assert.ok(midi.tracks.slice(1).every((t) => t.notes.length > 0));
});

// ---------------------------------------------------------------- core: Live clips

test("core: loading the script doesn't touch the Live API", () => {
  let constructed = 0;
  loadBundle("emi.core", {
    LiveAPI: class {
      constructor() {
        constructed++;
      }
    },
  });
  assert.equal(constructed, 0);
});

test("core: 'writeclips' needs a current score", () => {
  const live = fakeLive({ trackNames: ["EMI"] });
  assert.equal(lastStatus(loadBundle("emi.core", live).send("writeclips"))[0], "error");
  assert.deepEqual(live.calls, []);
});

test("core: 'writeclips' writes the loaded chorale in C, one clip per voice track", () => {
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"], filled: ["2:0"] });
  const core = loadBundle("emi.core", live);
  core.send("loadmidi", writeAMajorChorale());
  assert.deepEqual(lastStatus(core.send("writeclips")), ["status", "wrote", "bwv000", "in", "C", "to", "4", "voice", "tracks"]);
  const creates = live.calls.filter(([, name]) => name === "create_clip").map(([where]) => where);
  assert.deepEqual(creates, [
    "live_set tracks 1 clip_slots 0",
    "live_set tracks 2 clip_slots 1", // slot 0 already has a clip
    "live_set tracks 3 clip_slots 0",
    "live_set tracks 4 clip_slots 0",
  ]);
  // Array.from: arrays made inside the simulated [v8] belong to another realm.
  const bass = live.calls.filter(([, name]) => name === "add_new_notes")[3][2].notes;
  assert.deepEqual(Array.from(bass, (n) => n.pitch), [60, 55, 60]);
});

test("core: 'writeclips' writes a composed piece; 'testclip' writes the test phrase", () => {
  const live = fakeLive({ trackNames: ["Drums", "EMI"], ownTrack: 1, slotsPerTrack: 2 });
  const core = loadBundle("emi.core", live);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 3);
  assert.deepEqual(lastStatus(core.send("writeclips")), ["status", "wrote", "emi-3", "to", "this", "track"]);
  assert.deepEqual(lastStatus(core.send("testclip")), ["status", "wrote", "EMI", "test-cadence", "to", "this", "track"]);
  const error = lastStatus(core.send("testclip")); // both slots now full
  assert.equal(error[0], "error");
  assert.ok(error.join(" ").includes("no empty clip slot"));
});

// ---------------------------------------------------------------- view

test("view: draws one rectangle per note, plus bar lines and seams", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("paint");
  assert.ok(g.calls.some(([name, text]) => name === "show_text" && /load a chorale/.test(text)));

  g.calls.length = 0;
  view.send("clear", 4 * Q, 60, 72, 4 * Q);
  view.send("note", 0, Q, 60, 0);
  view.send("note", Q, Q, 64, 1);
  view.send("note", 2 * Q, 2 * Q, 72, 13); // colors wrap around the palette
  view.send("seam", Q);
  view.send("seam", 2 * Q, 1); // voices moved by octaves: drawn in orange
  view.send("cadence", 3 * Q);
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 0, "nothing drawn before 'done'");
  view.send("done");
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 1);

  g.calls.length = 0;
  view.send("paint");
  const rectangles = g.calls.filter(([name]) => name === "rectangle");
  assert.equal(rectangles.length, 1 + 3); // background + notes
  const [, x, , w] = rectangles[3];
  assert.ok(Math.abs(x - 180) < 1 && Math.abs(w - 179) < 1, "the last note spans the right half");
  const colors = g.calls.filter(([name]) => name === "set_source_rgba").map((c) => c.slice(1).join(","));
  assert.ok(colors.includes("1,0.6,0.15,0.9"), "an orange seam");
  const triangle = g.calls.filter(([name, cx]) => name === "move_to" && Math.abs(cx - (270 - 4)) < 1);
  assert.equal(triangle.length, 1, "a cadence mark at 3/4 of the width");
});
