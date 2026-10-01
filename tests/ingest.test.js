"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const keys = require("emi-key");
const smf = require("emi-smf");
const ingest = require("emi-ingest");
const patterns = require("emi-pattern");

// A small 4-voice file in A major at 480 ticks per quarter, with a pickup.
function sampleMidi({ ppq = 480, keySignature = { sf: 3, minor: false } } = {}) {
  const q = ppq;
  const chords = [
    [76, 73, 69, 57], // pickup: A major
    [74, 71, 68, 52], // E major
    [73, 69, 64, 57], // A major (half note)
  ];
  const starts = [3 * q, 4 * q, 5 * q];
  const durs = [q, q, 2 * q];
  const tracks = ["Soprano", "Alto", "Tenor", "Bass"].map((name, v) => ({
    name,
    channel: 1,
    notes: chords.map((chord, i) => ({ on: starts[i], pitch: chord[v], dur: durs[i], vel: 90 })),
  }));
  return smf.write({ ppq, tempoBpm: 80, meter: [4, 4], keySignature, tracks });
}

const sidecar = {
  source: "test",
  title: "Sample",
  parts: ["Soprano", "Alto", "Tenor", "Bass"],
  meter: "4/4",
  key: { tonic: "A", mode: "major" },
  midi: { ppq: 480, voiceTracks: [1, 2, 3, 4] },
  padQuarters: 3,
  fermatasQuarters: [7],
};

test("key names, including music21's flat spelling", () => {
  assert.equal(keys.tonicFromName("A"), 9);
  assert.equal(keys.tonicFromName("F#"), 6);
  assert.equal(keys.tonicFromName("B-"), 10);
  assert.equal(keys.tonicFromName("Bb"), 10);
  assert.equal(keys.tonicFromName("E-"), 3);
  assert.equal(keys.tonicFromName("C##"), 2);
  assert.throws(() => keys.tonicFromName("H"), /not a note name/);
  assert.equal(keys.keyName({ tonic: 10, mode: "major" }), "Bb major");
});

test("key signatures both ways", () => {
  assert.deepEqual(keys.fromKeySignature({ sf: 3, minor: false }), { tonic: 9, mode: "major" });
  assert.deepEqual(keys.fromKeySignature({ sf: -2, minor: true }), { tonic: 7, mode: "minor" });
  assert.deepEqual(keys.fromKeySignature({ sf: 0, minor: true }), { tonic: 9, mode: "minor" });
  assert.deepEqual(keys.toKeySignature({ tonic: 10, mode: "major" }), { sf: -2, minor: false });
  assert.deepEqual(keys.toKeySignature({ tonic: 4, mode: "minor" }), { sf: 1, minor: true });
  for (let tonic = 0; tonic < 12; tonic++) {
    for (const mode of ["major", "minor"]) {
      assert.deepEqual(keys.fromKeySignature(keys.toKeySignature({ tonic, mode })), { tonic, mode });
    }
  }
});

test("transposition to C major or A minor takes the shorter way", () => {
  const t = (tonic, mode) => keys.transpositionToCommon({ tonic, mode });
  assert.equal(t(0, "major"), 0);
  assert.equal(t(9, "major"), 3); // A -> C: up a minor third
  assert.equal(t(2, "major"), -2); // D -> C
  assert.equal(t(6, "major"), -6); // F#: a tritone either way, go down
  assert.equal(t(7, "major"), 5); // G -> C: up a fourth
  assert.equal(t(4, "minor"), 5); // E minor -> A minor
  assert.equal(t(2, "minor"), -5); // D minor -> A minor
});

test("key estimate: a C major and an A minor progression", () => {
  const chords = (list) =>
    list.flatMap((chord, i) => chord.map((pitch) => [i * 960, pitch, 960, 1, 90]));
  // I IV V I in C
  const cMajor = chords([[48, 64, 67, 72], [53, 65, 69, 72], [43, 62, 67, 71], [48, 64, 67, 72]]);
  assert.deepEqual(
    (({ tonic, mode }) => ({ tonic, mode }))(keys.estimate(cMajor)),
    { tonic: 0, mode: "major" },
  );
  // i iv V i in A minor (with G#)
  const aMinor = chords([[45, 64, 69, 72], [50, 65, 69, 74], [40, 64, 68, 71], [45, 64, 69, 72]]);
  assert.deepEqual(
    (({ tonic, mode }) => ({ tonic, mode }))(keys.estimate(aMinor)),
    { tonic: 9, mode: "minor" },
  );
});

test("fromMidi with a sidecar: voices, 960 ticks, pickup, fermatas, key", () => {
  const work = ingest.fromMidi(smf.parse(sampleMidi()), { id: "sample", sidecar });
  assert.equal(work.ppq, 960);
  assert.equal(work.voices, 4);
  assert.deepEqual(work.voiceNames, ["Soprano", "Alto", "Tenor", "Bass"]);
  assert.deepEqual(work.meter, [4, 4]);
  assert.equal(work.tempoBpm, 80);
  assert.deepEqual(work.key, { tonic: 9, mode: "major", from: "sidecar" });
  assert.equal(work.padTicks, 2880);
  assert.deepEqual(work.fermatas, [6720]);
  assert.equal(work.lengthTicks, 2 * 3840); // 7 beats, rounded up to 2 bars
  // Sorted by time, then voice: the soprano's pickup comes first.
  assert.deepEqual(work.events[0], [2880, 76, 960, 1, 90]); // ticks doubled from 480 ppq
  assert.deepEqual(work.events.find((e) => e[3] === 4), [2880, 57, 960, 4, 90]);
  assert.equal(work.events.length, 12);
  assert.deepEqual(work.warnings, []);
  assert.equal(work.title, "Sample");
});

test("fromMidi without a sidecar: key from the key signature, or estimated", () => {
  const fromSignature = ingest.fromMidi(smf.parse(sampleMidi()), { id: "x" });
  assert.deepEqual(fromSignature.key, { tonic: 9, mode: "major", from: "key signature" });
  assert.equal(fromSignature.padTicks, 0);

  const estimated = ingest.fromMidi(smf.parse(sampleMidi({ keySignature: null })), { id: "x" });
  assert.equal(estimated.key.from, "estimate");
});

test("fromMidi splits a single multi-channel track into voices", () => {
  const notes = [1, 2, 3].map((channel) => ({ on: 0, pitch: 60 + channel, dur: 960, vel: 90 }));
  const bytes = smf.write({
    ppq: 960,
    tracks: [{ name: "all", channel: 1, notes: [] }].concat(
      notes.map((n, i) => ({ name: "", channel: i + 1, notes: [n] })),
    ),
  });
  // Merge the three note tracks into one, as in a type-0 file.
  const midi = smf.parse(bytes);
  const merged = { ...midi, tracks: [{ name: "", notes: midi.tracks.flatMap((t) => t.notes) }] };
  const work = ingest.fromMidi(merged);
  assert.equal(work.voices, 3);
  assert.deepEqual(work.events.map((e) => [e[1], e[3]]), [[61, 1], [62, 2], [63, 3]]);
});

test("normalize moves to C major and original moves back", () => {
  const work = ingest.fromMidi(smf.parse(sampleMidi()), { id: "sample", sidecar });
  const inC = ingest.normalize(work);
  assert.equal(inC.transposedBy, 3);
  assert.deepEqual([inC.key.tonic, inC.key.mode], [0, "major"]);
  assert.equal(inC.events.find((e) => e[3] === 4)[1], 60); // bass A3 -> C4
  assert.deepEqual(ingest.normalize(inC).events, inC.events); // already there
  const back = ingest.original(inC);
  assert.equal(back.transposedBy, 0);
  assert.deepEqual(back.events, work.events);
  assert.equal(ingest.describe(inC), "sample A major -> C major (+3) 4/4 2 bars 1 phrases");
});

test("quantize snaps to the 16th grid and never leaves a zero-length note", () => {
  const work = { ...patterns.testChorale(), events: [[100, 60, 300, 1, 90], [960, 62, 10, 1, 90], [1920, 64, 960, 1, 90]] };
  const { work: q, moved } = ingest.quantize(work);
  assert.equal(moved, 2);
  assert.deepEqual(q.events, [[0, 60, 480, 1, 90], [960, 62, 240, 1, 90], [1920, 64, 960, 1, 90]]);
});

test("round trip: work -> MIDI -> work keeps every note", () => {
  const work = ingest.fromMidi(smf.parse(sampleMidi()), { id: "sample", sidecar });
  for (const version of [work, ingest.normalize(work)]) {
    const again = ingest.fromMidi(smf.parse(ingest.toMidi(version)), { id: "sample" });
    assert.deepEqual(again.events, version.events);
    assert.deepEqual(again.meter, version.meter);
    assert.equal(again.tempoBpm, version.tempoBpm);
    assert.deepEqual([again.key.tonic, again.key.mode], [version.key.tonic, version.key.mode]);
    assert.deepEqual(again.voiceNames, version.voiceNames);
  }
});
