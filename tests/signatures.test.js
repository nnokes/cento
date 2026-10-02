"use strict";
// M7: signatures, found in the corpus and kept whole at cadences.
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const streams = require("emi-stream");
const signatures = require("emi-signatures");
const { checkForm, checkStream } = require("./piece-rules");
const { work, I, IV, V, phrase } = require("./synthetic");

// A cadence with the soprano going E D C (3-2-1) over the bass F G C
// (4-5-1), one beat each, the C under a fermata.
const A = [76, 72, 69, 53];
const B = [74, 71, 67, 55];
const C = [72, 67, 64, 48];
// Another cadence, soprano C B C (1-7-1), in only two works: not enough to
// be a signature.
const B2 = [71, 67, 62, 55];

// Two phrases: a pickup and eight beats, then the cadence (beats 12-14), the
// final half note (15-16).
const body = phrase(I, IV, V, I, IV, V, I, IV, V);
const withSignature = [...body, ...phrase(A, B), [...C, 2]];
const withOther = [...body, ...phrase(C, B2), [...C, 2]];
const corpus = [
  ...["a", "b", "c", "d"].map((id) => work(id, withSignature, { fermataAt: [14] })),
  ...["e", "f"].map((id) => work(id, withOther, { fermataAt: [14] })),
];

test("signatures: cadence patterns found in enough works, named in scale degrees", () => {
  const db = lexicon.build(corpus);
  const names = db.signatures.map((s) => signatures.describe(s, db.mode));
  assert.ok(names.includes("soprano 3-2-1"), names.join(", "));
  assert.ok(names.includes("bass 4-5-1"), names.join(", "));
  assert.ok(!names.includes("soprano 1-7-1"), "two works aren't enough");
  const sop = db.signatures.find((s) => signatures.describe(s) === "soprano 3-2-1");
  assert.equal(sop.works, 4);
  assert.deepEqual(sop.intervals, [-2, -2]);
  assert.equal(sop.voice, 1);
  for (const o of sop.occurrences) {
    assert.equal(o.beats, 3, "from the E's beat to the cadence");
    assert.ok(db.groupings[o.end].cadence);
    assert.equal(db.groupings[o.start].work, o.work);
  }
  assert.deepEqual(db.signatures.map((s) => s.id), db.signatures.map((s, i) => "sig" + (i + 1)), "strongest first");
});

test("signatures: in A minor, degrees count from A", () => {
  assert.equal(signatures.describe({ voice: 1, intervals: [-1, -2], finalPc: 9 }, "minor"), "soprano b3-2-1");
  assert.equal(signatures.describe({ voice: 4, intervals: [2, -7], finalPc: 9 }, "minor"), "bass 4-5-1");
});

test("signatures: each block once, with the signatures it carries, the soprano's first", () => {
  const db = lexicon.build(corpus);
  const blocks = signatures.blocks(db);
  const keys = blocks.map((b) => b.start + "-" + b.end);
  assert.equal(new Set(keys).size, keys.length);
  const block = blocks.find((b) => b.work === "a" && b.end - b.start === 2);
  const first = db.signatures.find((s) => s.id === block.sigs[0]);
  assert.equal(signatures.describe(first), "soprano 3-2-1");
  assert.ok(block.sigs.some((id) => signatures.describe(db.signatures.find((s) => s.id === id)) === "bass 4-5-1"));
  assert.equal(block.outer, true);
  assert.equal(signatures.blockAt(db, block.start, block.end), block);
});

test("signatures: a piece keeps a signature block whole at its cadence", () => {
  const db = lexicon.build(corpus);
  for (const seed of [1, 2, 3, 4, 5]) {
    const result = form.compose(db, { seed, beats: 8 });
    assert.equal(result.ok, true);
    const piece = result.piece;
    checkForm(db, piece);
    assert.equal(piece.form.signatures, 1, `seed ${seed}: the cadence has a block`);
    const inBlock = piece.provenance.filter((p) => p.block);
    assert.ok(inBlock.length >= 2);
    const last = inBlock[inBlock.length - 1];
    assert.ok(piece.fermatas.includes(last.tick), "the block ends on the cadence");
    assert.notEqual(inBlock[0].work, piece.form.template, "not the template's own cadence");
    assert.ok(last.signatures.length > 0);
  }
});

test("signatures: off, or with nothing to pin, pieces are as without them", () => {
  const db = lexicon.build(corpus);
  const off = form.compose(db, { seed: 2, beats: 8, signatures: false });
  assert.equal(off.piece.form.signatures, 0);
  assert.ok(off.piece.provenance.every((p) => !p.block && !p.signatures));

  // Too few works for any signature: the same piece either way.
  const few = lexicon.build(corpus.slice(0, 2));
  assert.equal(few.signatures.length, 0);
  const a = form.compose(few, { seed: 2, beats: 8 });
  const b = form.compose(few, { seed: 2, beats: 8, signatures: false });
  assert.deepEqual(a.piece.events, b.piece.events);
  assert.deepEqual(a.piece.provenance, b.piece.provenance);
});

test("signatures: a stream's phrases keep blocks at their cadences", () => {
  const db = lexicon.build(corpus);
  const stream = streams.start({ seed: 3 });
  let pinned = 0;
  for (let k = 1; k <= 3; k++) {
    const { ok, phrase } = streams.next(db, stream);
    assert.equal(ok, true, `phrase ${k}`);
    pinned += phrase.signatures;
  }
  checkStream(db, stream);
  assert.ok(pinned >= 1, "some phrase cadences on a signature");
});
