"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const { segment } = require("emi-segment");
const lexicon = require("emi-lexicon");
const composer = require("emi-compose");
const { checkPiece } = require("./piece-rules");

const Q = 960;

// A 4-voice work in C from a list of [soprano, alto, tenor, bass, beats] chords,
// starting with a one-beat pickup on beat 4 (time 0 is a barline).
function work(id, chords, { fermataAt = [] } = {}) {
  const events = [];
  let t = 3 * Q;
  for (const [s, a, tn, b, beats] of chords) {
    [s, a, tn, b].forEach((pitch, v) => events.push([t, pitch, beats * Q, v + 1, 90]));
    t += beats * Q;
  }
  return {
    id,
    ppq: Q,
    meter: [4, 4],
    key: { tonic: 0, mode: "major", from: "test" },
    transposedBy: 0,
    voices: 4,
    voiceNames: ["Soprano", "Alto", "Tenor", "Bass"],
    padTicks: 3 * Q,
    fermatas: fermataAt.map((beat) => beat * Q),
    lengthTicks: Math.ceil(t / (4 * Q)) * 4 * Q,
    events,
    warnings: [],
  };
}

const I = [72, 67, 64, 48];
const IV = [72, 69, 65, 53];
const V = [71, 67, 62, 55];
const phrase = (...chords) => chords.map((c) => [...c, 1]);

// Three works on the same I-IV-V cycle with the same voicings, so every
// grouping has a twin in the other works at the same place in the bar and
// recombination always has a choice. (Real chorales are far less regular; the
// corpus test covers those.) Beat 3 is the pickup; the final I falls on beat 12.
const cycle = [...phrase(I, IV, V, I, IV, V, I, IV, V), [...I, 2]];
const corpus = ["a", "b", "c"].map((id) => work(id, cycle, { fermataAt: [12] }));

test("segment: groupings per sounding beat, with ties, destinations and cadences", () => {
  const groupings = segment(corpus[0]);
  assert.equal(groupings.length, 11); // beats 3..13; silent padding beats skipped
  const [first, second] = groupings;
  assert.equal(first.id, "a:3");
  assert.equal(first.beatInBar, 4);
  assert.equal(first.opening, true);
  assert.equal(first.entryKey, "72,67,64,48");
  assert.equal(first.destKey, second.entryKey);
  assert.equal(first.newNotes, 4);

  const final = groupings.at(-1); // second beat of the closing half note
  assert.equal(final.final, true);
  assert.equal(final.cadence, false);
  assert.equal(final.entryKey, "~72,~67,~64,~48");
  assert.equal(final.newNotes, 0);
  assert.equal(final.destKey, null);
  assert.deepEqual(final.pieces[0], [0, 72, Q, 1, 90, 1, 0]); // tied in, not out

  const cadence = groupings.at(-2);
  assert.equal(cadence.cadence, true);
  assert.deepEqual(cadence.pieces[0], [0, 72, Q, 1, 90, 0, 1]); // starts here, tied out
});

test("lexicon: indexes every grouping by how it starts", () => {
  const db = lexicon.build(corpus);
  assert.equal(db.groupings.length, 33);
  assert.equal(db.openings.length, 3);
  assert.equal(db.finals.length, 3);
  for (const [key, indexes] of Object.entries(db.lexicon)) {
    for (const i of indexes) assert.equal(db.groupings[i].entryKey, key);
  }
  const s = lexicon.stats(db);
  assert.equal(s.works, 3);
  assert.ok(s.deadEndShare < 0.5);
  assert.throws(() => lexicon.build([corpus[0], { ...corpus[1], meter: [3, 4] }]), /share one meter/);
});

test("compose: a piece that keeps every rule, the same for the same seed", () => {
  const db = lexicon.build(corpus);
  const result = composer.compose(db, { seed: 3, beats: 8 });
  assert.equal(result.ok, true);
  checkPiece(db, result.piece, 8);
  assert.ok(composer.summary(result.piece).sources >= 2);
  assert.deepEqual(composer.compose(db, { seed: 3, beats: 8 }).piece, result.piece);
  assert.notDeepEqual(
    [5, 6, 7, 8].map((seed) => composer.compose(db, { seed, beats: 8 }).piece.provenance.map((p) => p.work).join()),
    Array(4).fill(result.piece.provenance.map((p) => p.work).join()),
  );
});

test("compose: tied notes across beat lines are joined back into one note", () => {
  const db = lexicon.build(corpus);
  const { piece } = composer.compose(db, { seed: 1, beats: 8 });
  // The closing half note in every voice is one 2-beat note, not two beats.
  const end = Math.max(...piece.events.map((e) => e[0] + e[2]));
  const last = piece.events.filter((e) => e[0] + e[2] === end);
  assert.equal(last.length, 4);
  for (const e of last) assert.equal(e[2], 2 * Q);
});

test("compose: reports failure instead of looping when no ending is reachable", () => {
  const db = lexicon.build(corpus);
  const result = composer.compose(db, { seed: 1, beats: 200, maxBeats: 220, budget: 2000 });
  assert.equal(result.ok, false);
  assert.equal(result.piece, null);
});

