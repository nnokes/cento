"use strict";
// M10: Emily's variation operators (emily-vary).
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const quality = require("emi-quality");
const vary = require("emily-vary");
const { Q, work, cycle } = require("./synthetic");

const db = lexicon.build(["a", "b", "c"].map((id) => work(id, cycle, { fermataAt: [12] })));
const piece = (seed = 1) => form.compose(db, { seed, beats: 8 }).piece;

// Every voice in its range, no voices crossing, no new parallels.
function assertSound(original, varied) {
  for (const [, pitch, , voice] of varied.events) {
    const [low, high] = db.ranges[voice - 1];
    assert.ok(pitch >= low && pitch <= high, `voice ${voice}: ${pitch} outside ${low}-${high}`);
  }
  for (const t of new Set(varied.events.map((e) => e[0]))) {
    const at = [1, 2, 3, 4].map((v) => varied.events.find((e) => e[3] === v && e[0] <= t && t < e[0] + e[2]));
    for (let v = 0; v < 3; v++) if (at[v] && at[v + 1]) assert.ok(at[v][1] >= at[v + 1][1], `voices ${v + 1} and ${v + 2} cross at ${t}`);
  }
  const fresh = (p) => quality.parallels(p, { db }).filter((x) => !x.inherited).length;
  assert.ok(fresh(varied) <= fresh(original), "no new parallels");
}

test("vary: at novelty 0 nothing changes", () => {
  const p = piece();
  const result = vary.vary(db, p, { seed: 1, novelty: 0 });
  assert.equal(result.piece, p);
  assert.deepEqual(result.variants, []);
});

test("vary: at novelty 1 each phrase gets a variant where one fits, sound and reproducible", () => {
  for (const seed of [1, 2, 3, 4, 5]) {
    const p = piece(seed);
    const { piece: varied, variants } = vary.vary(db, p, { seed, novelty: 1 });
    const phrases = vary.phraseSpans(p).length;
    assert.ok(variants.length >= 1 && variants.length <= phrases, `seed ${seed}: at most one per phrase (where one fits)`);
    for (const v of variants) assert.ok(vary.OPS.includes(v.op), v.op);
    assertSound(p, varied);
    assert.deepEqual(vary.vary(db, p, { seed, novelty: 1 }).piece.events, varied.events, "the same seed, the same variants");
    // Each varied beat says how in its provenance.
    const marked = varied.provenance.filter((e) => e.variant);
    assert.ok(marked.length >= 1);
    assert.deepEqual(varied.variants, variants);
    assert.equal(varied.events.length >= p.events.length - variants.length, true);
  }
});

test("vary: each operator, where it fits", () => {
  const p = piece(1);
  const keyAt = () => ({ tonic: 0, mode: "major" });
  const all = vary.candidatesIn(p.events, { from: 0, to: p.lengthTicks, beat: Q, keyAt, fermatas: new Set(p.fermatas) });
  const ops = new Set(all.map((c) => c.op));
  // The synthetic chorales move I-IV-V in block chords: thirds, steps and
  // repeated notes, so these fit.
  for (const op of ["passing tone", "neighbor tone", "chromatic passing tone", "re-voiced chord"]) assert.ok(ops.has(op), op);
  const passing = all.find((c) => c.op === "passing tone");
  const after = passing.apply(p.events);
  const split = after.filter((e) => e[3] === passing.voice && e[0] >= passing.tick && e[0] < passing.tick + Q);
  assert.deepEqual(split.map((e) => e[2]), [Q / 2, Q / 2], "a quarter becomes two eighths");
  const [first, second] = split;
  const next = after.find((e) => e[3] === passing.voice && e[0] === passing.tick + Q);
  assert.ok(Math.abs(second[1] - first[1]) <= 2 && Math.abs(next[1] - second[1]) <= 2, "by step both ways");
});

test("vary: a change that crosses voices or leaves a range is not kept", () => {
  const p = piece(1);
  const [alto] = p.events.filter((e) => e[3] === 2);
  const crossed = p.events.map((e) => (e === alto ? [e[0], e[1] + 12, e[2], e[3], e[4]] : e));
  assert.equal(vary.valid(db, p.events, crossed, alto[0] - Q, alto[0] + 2 * Q), false);
  assert.equal(vary.valid(db, p.events, p.events, 0, p.lengthTicks), true);
});
