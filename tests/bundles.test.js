"use strict";
// Tests the bundled scripts in javascript/, loaded the way [v8] loads them.
const test = require("node:test");
const assert = require("node:assert/strict");

const { loadBundle } = require("./max-sim");
const build = require("../tools/build");
const { hello } = require("emi-hello");
const queue = require("emi-queue");
const patterns = require("emi-pattern");

test("bundles in javascript/ are up to date with code/", () => {
  assert.deepEqual(build.check(), []);
});

test("each bundle exposes exactly its documented messages", () => {
  assert.deepEqual(loadBundle("emi.hello").handlers(), ["bang", "msg_int"]);
  assert.deepEqual(loadBundle("emi.player").handlers(), ["clear", "pattern"]);
  assert.deepEqual(loadBundle("emi.clips", { LiveAPI: class {} }).handlers(), ["testclip"]);
});

// [v8] runs its script after the patch has loaded, so Max connects the cords
// while the object still has its default single inlet and outlet. Cords to any
// other inlet or outlet get deleted ("patchcord outlet out of range").
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
  assert.deepEqual(status, [["status", "queued", "test-cadence", steps.length, "steps"]]);
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
