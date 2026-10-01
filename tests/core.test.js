"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const rng = require("emi-rng");
const { hello } = require("emi-hello");
const { VERSION } = require("emi-version");
const patterns = require("emi-pattern");
const queue = require("emi-queue");
const live = require("emi-live");

// Pinned output of hello(1). If this changes, the RNG changed, and every
// seed-reproducible piece changes with it. (627 is also the first value of
// standard mulberry32 for seed 1: 0.6270...)
const HELLO_SEED_1 = [627, 2, 527, 981];

test("rng: same seed, same sequence; different seed, different sequence", () => {
  const a = rng.create(42);
  const b = rng.create(42);
  const c = rng.create(43);
  const seqA = Array.from({ length: 20 }, () => a.next());
  const seqB = Array.from({ length: 20 }, () => b.next());
  const seqC = Array.from({ length: 20 }, () => c.next());
  assert.deepEqual(seqA, seqB);
  assert.notDeepEqual(seqA, seqC);
  for (const x of seqA) assert.ok(x >= 0 && x < 1);
});

test("rng: int(n) stays in range and pick() returns list members", () => {
  const r = rng.create(7);
  for (let i = 0; i < 1000; i++) {
    const n = r.int(5);
    assert.ok(Number.isInteger(n) && n >= 0 && n < 5);
  }
  const list = ["S", "A", "T", "B"];
  for (let i = 0; i < 100; i++) assert.ok(list.includes(r.pick(list)));
  assert.throws(() => rng.create("x"), /seed must be a number/);
});

test("hello: pinned values, so every environment must print exactly these", () => {
  assert.deepEqual(hello(1), { name: "emi", version: VERSION, seed: 1, check: HELLO_SEED_1 });
});

test("version matches package.json", () => {
  assert.equal(VERSION, require("../package.json").version);
});

test("test pattern: four voices in SATB order, all on the 16th grid", () => {
  const score = patterns.testChorale();
  assert.equal(score.voices, 4);
  assert.equal(score.events.length, 7 * 4);
  assert.equal(score.lengthTicks, 8 * score.ppq);
  // At every onset, soprano > alto > tenor > bass.
  const byOnset = new Map();
  for (const [on, pitch, , channel] of score.events) {
    if (!byOnset.has(on)) byOnset.set(on, []);
    byOnset.get(on)[channel - 1] = pitch;
  }
  for (const [s, a, t, b] of byOnset.values()) assert.ok(s > a && a > t && t > b);
});

test("queue: note-offs come before note-ons in the same step", () => {
  const steps = queue.toSteps(patterns.testChorale());
  // Beat 2 (step 4): all four chord-1 notes end, all four chord-2 notes start.
  const step4 = steps.find((s) => s.step === 4).events;
  const triples = [];
  for (let i = 0; i < step4.length; i += 3) triples.push(step4.slice(i, i + 3));
  const firstOn = triples.findIndex(([, , velocity]) => velocity > 0);
  assert.equal(firstOn, 4);
  assert.ok(triples.slice(0, 4).every(([, , velocity]) => velocity === 0));
  // The soprano C5 is repeated: released, then struck again.
  assert.deepEqual(triples[0], [1, 72, 0]);
  assert.deepEqual(triples[4], [1, 72, 96]);
});

test("queue: every note-on has a matching note-off; the last step is the end", () => {
  const steps = queue.toSteps(patterns.testChorale());
  const sounding = new Map();
  for (const { events } of steps) {
    for (let i = 0; i < events.length; i += 3) {
      const key = events[i] + ":" + events[i + 1];
      sounding.set(key, (sounding.get(key) || 0) + (events[i + 2] > 0 ? 1 : -1));
      assert.ok(sounding.get(key) >= 0, `note-off without note-on for ${key}`);
    }
  }
  for (const [key, count] of sounding) assert.equal(count, 0, `stuck note ${key}`);
  assert.equal(steps.at(-1).step, 32);
});

test("queue: rejects off-grid, zero-length and silent notes", () => {
  const score = (events) => ({ ppq: 960, events });
  assert.throws(() => queue.toSteps(score([[100, 60, 960, 1, 90]])), /off the 4-per-beat grid/);
  assert.throws(() => queue.toSteps(score([[0, 60, 0, 1, 90]])), /duration 0/);
  assert.throws(() => queue.toSteps(score([[0, 60, 960, 1, 0]])), /velocity 0/);
});

test("live: notes per voice in beats, clip length in whole bars", () => {
  const score = patterns.testChorale();
  const voices = live.toLiveNotes(score);
  assert.equal(voices.length, 4);
  assert.deepEqual(voices[3][0], { pitch: 48, start_time: 0, duration: 1, velocity: 88 });
  assert.deepEqual(voices[0].at(-1), { pitch: 72, start_time: 6, duration: 2, velocity: 96 });
  assert.equal(live.clipLengthBeats(score), 8);
  assert.equal(live.clipLengthBeats({ ...score, lengthTicks: 9 * 960 }), 12);
  assert.equal(live.clipLengthBeats({ ...score, meter: [3, 4], lengthTicks: 4 * 960 }), 6);
});

test("live: voice tracks are found by name, only when unambiguous", () => {
  assert.deepEqual(live.findVoiceTracks(["EMI", "Soprano", "Alto", "Tenor", "Bass"]), [1, 2, 3, 4]);
  assert.deepEqual(live.findVoiceTracks(["b", "T", " a ", "S"]), [3, 2, 1, 0]);
  assert.equal(live.findVoiceTracks(["Soprano", "Alto", "Tenor"]), null);
  assert.equal(live.findVoiceTracks(["Soprano", "Soprano", "Alto", "Tenor", "Bass"]), null);
});

test("live: LiveAPI values and quoted names are unwrapped", () => {
  assert.equal(live.liveValue([1]), 1);
  assert.equal(live.liveValue(0), 0);
  assert.equal(live.liveText(['"Bass Voice"']), "Bass Voice");
  assert.equal(live.liveText(["Bass", "Voice"]), "Bass Voice");
});
