"use strict";
// emi-perform: a score shaped for the player: fermata chords held, a breath
// before each next phrase, velocities that swell and settle, repeated notes
// lifted. The written score is left alone.
const test = require("node:test");
const assert = require("node:assert/strict");
const perform = require("emi-perform");
const queue = require("emi-queue");

const Q = 960;
const TPS = Q / 4; // ticks per step: a 16th

// Two phrases of block chords in 4/4, a fermata on the last beat of each.
// The soprano repeats its C on beats 1 and 2 (for the lift); the second
// phrase's chords change more (for the tension).
function twoPhrases({ fermatas = [3 * Q, 7 * Q], lengthTicks = 8 * Q } = {}) {
  const chords = [
    [72, 67, 64, 48], [72, 65, 60, 53], [71, 67, 62, 55], [72, 67, 64, 48], // I IV V I
    [69, 65, 60, 53], [74, 71, 65, 55], [71, 68, 62, 52], [72, 67, 64, 48], // IV V7 V/vi... I
  ];
  const events = [];
  chords.forEach((chord, b) => chord.forEach((pitch, v) => events.push([b * Q, pitch, Q, v + 1, 90])));
  return { id: "two", ppq: Q, meter: [4, 4], voices: 4, lengthTicks, fermatas, events };
}

const onsetsOf = (score, voice) => score.events.filter((e) => e[3] === voice).map((e) => e[0]);
const noteAt = (score, voice, on) => score.events.find((e) => e[3] === voice && e[0] === on);

test("perform: a fermata chord is held as long again, then a breath; the last chord of all is held with no breath", () => {
  const { score, holds } = perform.perform(twoPhrases());
  // The first chord ends at 4Q as written: held one beat, then an eighth's breath.
  assert.deepEqual(holds, [[4 * Q, 1.5 * Q, Q], [8 * Q, Q, Q]]);
  assert.deepEqual(onsetsOf(score, 1), [0, Q, 2 * Q, 3 * Q, 5.5 * Q, 6.5 * Q, 7.5 * Q, 8.5 * Q], "the second phrase starts a beat and a half later");
  assert.equal(noteAt(score, 1, 3 * Q)[2], 2 * Q, "the held chord's notes last twice as long");
  assert.equal(noteAt(score, 4, 3 * Q)[2], 2 * Q);
  assert.equal(noteAt(score, 1, 8.5 * Q)[2], 2 * Q, "the last chord too");
  assert.deepEqual(score.fermatas, [3 * Q, 8.5 * Q]);
  assert.equal(score.lengthTicks, 10.5 * Q);
  assert.equal(twoPhrases().events.find((e) => e[0] === 3 * Q)[2], Q, "the written score is left alone");
});

test("perform: a long chord's hold is capped at a beat; a stream phrase's last fermata gets the breath too", () => {
  // A half-note cadence chord: held one beat more (not two).
  const long = twoPhrases({ lengthTicks: 9 * Q });
  for (const e of long.events) if (e[0] === 7 * Q) e[2] = 2 * Q;
  const whole = perform.perform(long);
  assert.deepEqual(whole.holds[1], [9 * Q, 2 * Q, 2 * Q], "the last chord of all: as long again, uncapped");
  const phrase = perform.perform(long, { final: false });
  assert.deepEqual(phrase.holds[1], [9 * Q, 1.5 * Q, Q], "in a stream: capped, and a breath before the next phrase");
});

test("perform: stretch and tickOf are inverses; inside a hold the playhead sits at the held chord's end", () => {
  const { holds } = perform.perform(twoPhrases());
  for (const t of [0, Q, 3 * Q, 4 * Q, 5 * Q, 7 * Q]) assert.equal(perform.tickOf(holds, perform.stretch(holds, t)), t, `tick ${t / Q}`);
  assert.equal(perform.stretch(holds, 4 * Q), 5.5 * Q);
  assert.equal(perform.tickOf(holds, 4 * Q + TPS), 4 * Q, "during the hold");
  assert.equal(perform.tickOf(holds, 5 * Q + TPS), 4 * Q, "during the breath");
  assert.equal(perform.tickOf(holds, 5.5 * Q), 4 * Q, "the next phrase's first tick");
  assert.equal(perform.tickOf(holds, 9 * Q), 7.5 * Q, "inside the last chord, before its hold");
  assert.equal(perform.tickOf(holds, 9.5 * Q + TPS), 8 * Q, "the last hold");
  assert.deepEqual(perform.tickOf([], 7 * Q), 7 * Q);
});

test("perform: velocities swell toward the middle of a phrase, accent beat 1, and set the voices apart", () => {
  const { score } = perform.perform(twoPhrases());
  for (const e of score.events) assert.ok(e[4] >= 1 && e[4] <= 127);
  const soprano = (on) => noteAt(score, 1, on)[4];
  const alto = (on) => noteAt(score, 2, on)[4];
  assert.equal(soprano(0) - alto(0), perform.VOICE[0] - perform.VOICE[1], "the soprano above the alto by the voice offsets");
  // Beat 1 of bar 2 (the second phrase's first beat) is accented over a beat with the same arch position.
  const perBeat = perform.velocities(twoPhrases());
  assert.ok(perBeat.get(4) > perBeat.get(7) - 20, "sane range");
  // The arch: the middle beats of a phrase are louder than its ends, tension aside.
  const flat = twoPhrases();
  for (const e of flat.events) e[1] = [72, 67, 64, 48][e[3] - 1]; // one chord throughout: the tension is flat
  const arch = perform.velocities(flat);
  assert.ok(arch.get(1) > arch.get(3) && arch.get(2) > arch.get(3), "middle over the cadence");
  assert.equal(arch.get(4) - arch.get(7), 3, "beat 1's accent is all that sets the phrase's ends apart");
});

test("perform: a repeated pitch is lifted a 16th, but not across a breath", () => {
  const { score } = perform.perform(twoPhrases());
  assert.equal(noteAt(score, 1, 0)[2], Q - TPS, "C to C: lifted");
  assert.equal(noteAt(score, 1, Q)[2], Q, "C to B: not");
  assert.equal(noteAt(score, 4, 2 * Q)[2], Q, "G to C: not");
  // The held chord's C runs into the next phrase's... A: no lift; and a
  // chord held into a breath is never lifted.
  assert.equal(noteAt(score, 4, 3 * Q)[2], 2 * Q);
});

test("perform: each part can be switched off; everything stays on the 16th grid for the queue", () => {
  const written = twoPhrases();
  const off = perform.perform(written, { fermatas: false, dynamics: false, articulation: false });
  assert.deepEqual(off.score.events, written.events);
  assert.deepEqual(off.holds, []);
  const quiet = perform.perform(written, { dynamics: false });
  assert.ok(quiet.score.events.every((e) => e[4] === 90));
  const steps = queue.toSteps(perform.perform(written).score);
  assert.equal(steps.at(-1).step, 42, "10.5 beats of 4 steps");
  const noFermatas = perform.perform({ ...written, fermatas: undefined });
  assert.deepEqual(noFermatas.holds, []);
  assert.equal(noFermatas.score.lengthTicks, 8 * Q);
});
