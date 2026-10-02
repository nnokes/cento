"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const streams = require("emi-stream");
const { checkStream } = require("./piece-rules");
const { work, I, IV, V, phrase } = require("./synthetic");

// Two phrases per work: a cadence on beat 6, then the final half note (12-13).
// Five works: a stream uses each grouping only once, so it needs room.
const twoPhrases = [...phrase(I, IV, V, I, IV, V, I, IV, V), [...I, 2]];
const corpus = ["a", "b", "c", "d", "e"].map((id) => work(id, twoPhrases, { fermataAt: [6, 12] }));

test("stream: each chorale's form splits into phrases at its cadences", () => {
  const db = lexicon.build(corpus);
  const works = streams.phraseTemplates(db);
  assert.deepEqual(works.map((w) => w.work), ["a", "b", "c", "d", "e"]);
  const [first, second] = works[0].phrases;
  assert.deepEqual(first.map((s) => s.beatInBar), [4, 1, 2, 3]); // pickup .. cadence on beat 6
  assert.equal(first[3].cadence, true);
  assert.deepEqual(second.map((s) => s.beatInBar), [4, 1, 2, 3, 4, 1, 2]); // .. the held final chord
  for (const p of [first, second]) {
    assert.equal(p[0].first, false);
    assert.equal(p[0].afterRest, false);
    assert.ok(p.every((s) => !s.last), "the stream decides which phrase ends a piece");
  }
});

test("stream: phrases join each other, walk a chorale's form, and the last one ends the piece", () => {
  const db = lexicon.build(corpus);
  const stream = streams.start({ seed: 4 });
  const made = [];
  for (let k = 1; k <= 4; k++) {
    const { ok, phrase } = streams.next(db, stream, { last: k === 4 });
    assert.equal(ok, true, `phrase ${k}`);
    made.push(phrase);
  }
  checkStream(db, stream);
  assert.equal(made[0].index, 1, "a stream starts with a chorale's first phrase");
  assert.deepEqual([made[1].work, made[1].index], [made[0].work, 2], "then that chorale's next phrase");
  assert.equal(made[2].index, 1, "then another chorale's first phrase...");
  assert.equal(made[2].gap, 1, "...after one silent beat, since its pickup falls on beat 4");
  assert.deepEqual([made[3].work, made[3].index, made[3].gap], [made[2].work, 2, 0], "its last phrase, joined");
  assert.equal(made[3].final, true);
  assert.equal(stream.finished, true);
  assert.deepEqual(streams.next(db, stream), { ok: false, phrase: null });
  assert.equal(made[0].piece.provenance[0].tick, 3 * 960, "the first pickup sits on beat 4 of bar 1");
});

test("stream: the same seed gives the same phrases; a new seed is heard from the next phrase", () => {
  const db = lexicon.build(corpus);
  const groupings = (stream) => stream.phrases.map((p) => p.placed.map((x) => x.index).join());
  const run = (seeds) => {
    const stream = streams.start({ seed: seeds[0] });
    seeds.forEach((seed) => streams.next(db, stream, { seed }));
    return groupings(stream);
  };
  assert.deepEqual(run([1, 1, 1, 1]), run([1, 1, 1, 1]));
  const changed = run([1, 1, 9, 9]);
  assert.deepEqual(changed.slice(0, 2), run([1, 1, 1, 1]).slice(0, 2));
  assert.notDeepEqual(run([1, 1, 9, 9, 9, 9]), run([1, 1, 1, 1, 1, 1]));
});

test("stream: when no phrase fits, nothing changes, so an ordinary phrase can follow instead", () => {
  const db = lexicon.build(corpus);
  const stream = streams.start({ seed: 4 });
  for (let k = 1; k <= 4; k++) streams.next(db, stream);
  const state = { nextBeat: stream.nextBeat, phrases: stream.phrases.length, used: stream.used.size };
  // No final phrase can follow here (see the test above: only the walk's own last phrase can).
  const failed = streams.next(db, stream, { last: true, tries: 1, relax: 0 });
  if (!failed.ok) {
    assert.deepEqual({ nextBeat: stream.nextBeat, phrases: stream.phrases.length, used: stream.used.size }, state);
  }
  assert.equal(streams.next(db, stream).ok, true);
  checkStream(db, stream);
});
