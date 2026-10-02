"use strict";
// M8: quotation measures, the quotation guard and parallel fifths/octaves.
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const ingest = require("emi-ingest");
const form = require("emi-form");
const quality = require("emi-quality");
const { work, I, IV, V, phrase, cycle, Q } = require("./synthetic");

const II = [74, 69, 65, 50];
const VI = [69, 64, 60, 57];
const other = [...phrase(I, VI, II, V, I, VI, II, V, I), [...I, 2]];

test("quotes: a chorale quotes itself whole, and another only where they agree", () => {
  const a = work("a", cycle, { fermataAt: [12] });
  const b = work("b", other, { fermataAt: [12] });
  const db = lexicon.build([a, b]);
  const piece = { ...ingest.normalize(a), provenance: null };
  const self = quality.quotes(db, piece);
  assert.equal(self.melody.notes, 10, "every note of a voice");
  assert.equal(self.melody.work, "a");
  const others = quality.quotes(db, piece, { exclude: "a" });
  assert.ok(others.melody.notes < 10);
  assert.notEqual(others.melody.work, "a");
});

test("quotes: the longest run of beats in order from one chorale", () => {
  const db = lexicon.build([work("a", cycle, { fermataAt: [12] }), work("b", other, { fermataAt: [12] })]);
  const at = (k, w, beat) => ({ tick: k * Q, work: w, beat });
  const piece = { events: [], ppq: Q, provenance: [at(0, "a", 3), at(1, "a", 4), at(2, "b", 5), at(3, "b", 6), at(4, "b", 7), at(5, "a", 8)] };
  assert.deepEqual(quality.quotes(db, piece).run, { beats: 3, work: "b" });
});

test("guard: a piece that copies its sources is put aside; the least quoting is kept if all do", () => {
  // Three identical works of 22 beats: whatever is chosen, every voice is a
  // whole quote, longer than the limit.
  const long = [...Array.from({ length: 7 }, () => phrase(I, IV, V)).flat(), [...I, 2]];
  const db = lexicon.build(["a", "b", "c"].map((id) => work(id, long, { fermataAt: [24] })));
  const result = form.compose(db, { seed: 1, beats: 8 });
  assert.equal(result.ok, true);
  assert.equal(result.piece.form.overLimit, true);
  assert.ok(result.stats.guarded >= 1);
  assert.ok(result.piece.form.quotes.melody > quality.LIMITS.melody);
  const unguarded = form.compose(db, { seed: 1, beats: 8, guard: false });
  assert.equal(unguarded.piece.form.overLimit, undefined);
  assert.equal(unguarded.stats.guarded, 0);
});

// Two-voice examples (soprano and bass; alto and tenor hold a note).
function twoVoices(soprano, bass) {
  const events = [];
  const add = (notes, voice) => {
    let t = 0;
    for (const [pitch, beats] of notes) {
      if (pitch !== null) events.push([t, pitch, beats * Q, voice, 90]);
      t += beats * Q;
    }
  };
  add(soprano, 1);
  add(bass, 4);
  return { events: events.sort((x, y) => x[0] - y[0]), ppq: Q, provenance: null };
}

test("parallels: fifths and octaves in similar motion, and nothing else", () => {
  const found = (s, b) => quality.parallels(twoVoices(s, b)).map((p) => `${p.interval} ${p.voices.join("-")} at ${p.tick / Q}`);
  assert.deepEqual(found([[67, 1], [69, 1]], [[60, 1], [62, 1]]), ["5ths 1-4 at 1"], "G/C to A/D");
  assert.deepEqual(found([[72, 1], [74, 1]], [[48, 1], [50, 1]]), ["8ves 1-4 at 1"], "two octaves apart counts too");
  assert.deepEqual(found([[67, 1], [62, 1]], [[60, 1], [67, 1]]), [], "contrary motion");
  assert.deepEqual(found([[67, 1], [67, 1]], [[60, 1], [62, 1]]), [], "one voice stays");
  assert.deepEqual(found([[67, 1], [79, 1]], [[60, 1], [72, 1]]), [], "both leap an octave: the same notes");
  assert.deepEqual(found([[67, 1], [null, 1], [69, 1]], [[60, 1], [null, 1], [62, 1]]), [], "after a rest");
  assert.deepEqual(found([[67, 1], [69, 1]], [[60, 1], [63, 1]]), [], "a fifth to a sixth");
});

test("parallels: those a source chorale has are Bach's own (inherited)", () => {
  // A work with parallel fifths from beat 1 to beat 2 (soprano and bass).
  const chords = [[67, 64, 60, 48, 1], [69, 65, 62, 50, 1], [67, 64, 60, 48, 2]];
  const db = lexicon.build(["a", "b", "c"].map((id) => work(id, chords, { fermataAt: [5] })));
  const source = { ...ingest.normalize(work("a", chords, { fermataAt: [5] })) };
  // The piece is work a itself, beat for beat (pickup at beat 3).
  source.provenance = [3, 4, 5, 6].map((beat) => ({ tick: beat * Q, work: "a", beat, grouping: "a:" + beat, level: 0 }));
  const found = quality.parallels(source, { db });
  assert.ok(found.length >= 1);
  assert.ok(found.every((p) => p.inherited), "in the source too");
  assert.ok(found.every((p) => !p.seam));
  // The same notes said to come from c's beats 4-5 after a's beat 3: a seam,
  // but c has the same motion, so still Bach's own.
  source.provenance = [{ ...source.provenance[0] }, ...[4, 5, 6].map((beat) => ({ tick: beat * Q, work: "c", beat, grouping: "c:" + beat, level: 0 }))];
  const again = quality.parallels(source, { db });
  assert.ok(again.some((p) => p.seam) || again.every((p) => p.inherited));
  assert.ok(again.every((p) => p.inherited));
});
