"use strict";
// M10: Emily's own music (emily-memory), in the lexicon and the search.
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const vary = require("emily-vary");
const memory = require("emily-memory");
const { Q, work, cycle } = require("./synthetic");

const bach = ["a", "b", "c"].map((id) => work(id, cycle, { fermataAt: [12] }));
const db = lexicon.build(bach);
const varied = (seed) => vary.vary(db, form.compose(db, { seed, beats: 8 }).piece, { seed, novelty: 1 }).piece;

test("memory: a whole piece becomes a work of Emily's own, generation 1, with its variants", () => {
  const piece = varied(1);
  const w = memory.workOf(db, piece, { id: "emily-1", what: "emi-1", at: "now" });
  assert.equal(w.gen, 1, "made of Bach's beats");
  assert.equal(w.events.length, piece.events.length);
  assert.equal(w.padTicks, piece.padTicks, "the pickup keeps its place in the bar");
  assert.deepEqual(w.fermatas, piece.fermatas);
  assert.deepEqual(w.variants, piece.variants.map((v) => [v.tick, v.op]));
  assert.deepEqual([w.id, w.from, w.what, w.key.mode, w.meter], ["emily-1", "emi-1", "emi-1", "major", [4, 4]]);
});

test("memory: beats selected become a work cut at their ticks, starting in its bar as they did", () => {
  const piece = varied(2);
  const from = piece.provenance[2].tick;
  const w = memory.workOf(db, piece, { from, to: from + 3 * Q, id: "emily-2" });
  const end = Math.max(...w.events.map((e) => e[0] + e[2]));
  assert.equal(end - w.padTicks, 3 * Q, "three beats");
  assert.equal(w.padTicks, from % (4 * Q));
  assert.equal(memory.workOf(db, piece, { from: 1e9, to: 2e9, id: "x" }), null, "nothing there");
});

test("lexicon: Emily's works join with their generation and variants; Bach's signatures are his alone", () => {
  const mine = [1, 2, 3].map((seed, k) => memory.workOf(db, varied(seed), { id: "emily-" + (k + 1) }));
  const both = lexicon.build([...bach, ...mine]);
  assert.equal(both.works.length, 6);
  assert.deepEqual(both.works.map((w) => w.gen), [0, 0, 0, 1, 1, 1]);
  const hers = both.groupings.filter((g) => g.gen);
  assert.ok(hers.length > 0 && hers.every((g) => g.work.startsWith("emily-")));
  assert.ok(hers.some((g) => g.variant), "beats with varied notes say so");
  assert.ok(both.groupings.slice(0, db.groupings.length).every((g, i) => g.id === db.groupings[i].id), "Bach's beats keep their places");
  assert.deepEqual(both.signatures.filter((s) => !s.emily).map((s) => [s.voice, s.intervals.join()]), db.signatures.map((s) => [s.voice, s.intervals.join()]));
  const counts = memory.counts(both);
  assert.deepEqual([counts.works, counts.beats > 0, counts.varied > 0, [...counts.gens]], [3, true, true, [[1, 3]]]);
});

test("form: mix sets how much Emily's own beats count against Bach's", () => {
  const mine = [1, 2, 3].map((seed, k) => memory.workOf(db, varied(seed), { id: "emily-" + (k + 1) }));
  const both = lexicon.build([...bach, ...mine]);
  const share = (mix) => {
    let own = 0;
    let all = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const piece = form.compose(both, { seed, beats: 8, mix }).piece;
      const byId = new Map(both.groupings.map((g) => [g.id, g]));
      own += piece.provenance.filter((p) => byId.get(p.grouping).gen).length;
      all += piece.provenance.length;
    }
    return own / all;
  };
  const [low, high] = [share(0.1), share(0.75)];
  assert.ok(high > low + 0.2, `${low} at mix 0.1, ${high} at 0.75`);
  assert.ok(form.compose(both, { seed: 1, beats: 8, mix: 0.5 }).ok);
});

test("memory: usable works match the corpus's meter and modes, and are in use", () => {
  const w = memory.workOf(db, varied(1), { id: "emily-1" });
  const store = { version: 1, works: [w, { ...w, id: "emily-2", meter: [3, 4] }, { ...w, id: "emily-3", key: { tonic: 9, mode: "minor" } }] };
  assert.deepEqual(memory.usable(store, ["emily-1", "emily-2", "emily-3"], bach).map((x) => x.id), ["emily-1"]);
  assert.deepEqual(memory.usable(store, [], bach), []);
  assert.deepEqual(memory.normalizeStore({ works: [w, { id: 3 }, null] }).works.map((x) => x.id), ["emily-1"]);
});
