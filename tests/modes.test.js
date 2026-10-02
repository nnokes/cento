"use strict";
// M8: minor mode. A corpus may hold major and minor chorales; each piece and
// each stream stays in one mode, and signatures are found per mode.
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const streams = require("emi-stream");
const signatures = require("emi-signatures");
const { checkForm, checkStream } = require("./piece-rules");
const { work, I, IV, V, phrase } = require("./synthetic");

// A minor: i, iv, V and a cadence with the soprano C-B-A (b3-2-1).
const i = [69, 64, 60, 45];
const iv = [69, 65, 62, 50];
const V7 = [68, 64, 59, 52];
const minorWork = (id) => ({
  ...work(id, [...phrase(i, iv, V7, i, iv, V7, i, iv), [72, 64, 57, 53, 1], [71, 64, 56, 52, 1], [...i, 2]], { fermataAt: [13] }),
  key: { tonic: 9, mode: "minor", from: "test" },
});
const majorWork = (id) => work(id, [...phrase(I, IV, V, I, IV, V, I, IV, V), [...I, 2]], { fermataAt: [12] });
const corpus = [...["a", "b", "c", "d"].map(majorWork), ...["m", "n", "o", "p"].map(minorWork)];

test("modes: a mixed corpus says so, and every grouping knows its mode", () => {
  const db = lexicon.build(corpus);
  assert.equal(db.mode, "mixed");
  assert.deepEqual(db.works.map((w) => w.mode), ["major", "major", "major", "major", "minor", "minor", "minor", "minor"]);
  for (const g of db.groupings) assert.equal(g.mode, db.works.find((w) => w.id === g.work).mode);
});

test("modes: each piece is all major or all minor, in its template's mode and key", () => {
  const db = lexicon.build(corpus);
  const seen = new Set();
  for (let seed = 1; seed <= 12; seed++) {
    const result = form.compose(db, { seed, beats: 8 });
    assert.equal(result.ok, true, `seed ${seed}`);
    const piece = result.piece;
    checkForm(db, piece);
    const mode = db.works.find((w) => w.id === piece.form.template).mode;
    const modes = new Set(piece.provenance.map((p) => db.works.find((w) => w.id === p.work).mode));
    assert.deepEqual([...modes], [mode], `seed ${seed}: one mode`);
    assert.deepEqual(piece.key, mode === "minor" ? { tonic: 9, mode: "minor", from: "composed" } : { tonic: 0, mode: "major", from: "composed" });
    seen.add(mode);
  }
  assert.deepEqual([...seen].sort(), ["major", "minor"], "the seed picks either");
});

test("modes: signatures are found per mode and named in it", () => {
  const db = lexicon.build(corpus);
  const minor = db.signatures.filter((s) => s.mode === "minor").map((s) => signatures.describe(s));
  assert.ok(minor.includes("soprano b3-2-1"), minor.join(", "));
  for (const s of db.signatures) {
    const modes = new Set(s.occurrences.map((o) => db.works.find((w) => w.id === o.work).mode));
    assert.deepEqual([...modes], [s.mode]);
  }
});

test("modes: a stream keeps to the mode of its first chorale", () => {
  const db = lexicon.build(corpus);
  for (const seed of [1, 2, 3, 4]) {
    const stream = streams.start({ seed });
    for (let k = 1; k <= 2; k++) assert.equal(streams.next(db, stream).ok, true, `seed ${seed}, phrase ${k}`); // one phrase per chorale here
    checkStream(db, stream);
    const modes = new Set(stream.phrases.flatMap((p) => p.placed.map((x) => db.groupings[x.index].mode)));
    assert.deepEqual([...modes], [stream.mode], `seed ${seed}`);
  }
});

test("modes: a one-mode corpus composes as before (no mode on its slots)", () => {
  const db = lexicon.build(corpus.slice(0, 4));
  assert.equal(db.mode, "major");
  assert.ok(form.slotsOf(db, db.templates[0]).every((slot) => slot.rest || slot.mode === null));
});
