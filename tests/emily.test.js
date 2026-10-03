"use strict";
// M9: Emily's taste (emily-assoc) and how composing uses it (emi-form,
// emi-stream).
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const streams = require("emi-stream");
const emily = require("emily-assoc");
const { checkForm } = require("./piece-rules");
const { Q, work, I, IV, V, phrase, cycle } = require("./synthetic");

// Three identical chorales: every beat can come from any of them, except the
// work of the beat before (the different-source rule).
const same = lexicon.build(["a", "b", "c"].map((id) => work(id, cycle, { fermataAt: [12] })));

const tokens = (...pitches) => pitches.map((pitch) => ({ held: false, pitch }));

test("emily: chords are named from their intervals above the bass, in any inversion", () => {
  assert.equal(emily.chordOf(tokens(72, 67, 64, 48), 48), "major"); // C E G over C
  assert.equal(emily.chordOf(tokens(72, 67, 64, 52), 52), "major"); // over E: first inversion
  assert.equal(emily.chordOf(tokens(72, 64, 60, 55), 55), "major"); // over G: second inversion
  assert.equal(emily.chordOf(tokens(69, 64, 60, 57), 57), "minor"); // A minor
  assert.equal(emily.chordOf(tokens(71, 65, 62, 55), 55), "seventh"); // G7
  assert.equal(emily.chordOf(tokens(71, 67, 62, 53), 53), "seventh"); // G7 over F: third inversion
  assert.equal(emily.chordOf(tokens(71, 65, 62, 59), 59), "diminished"); // B D F
  assert.equal(emily.chordOf(tokens(72, 67, 60, 48), 48), "other"); // an open fifth
  assert.equal(emily.chordOf(tokens(72), null), "other");
});

test("emily: key areas are named from the home key, in major and minor", () => {
  assert.equal(emily.keyArea("0:major", "major"), "home");
  assert.equal(emily.keyArea("7:major", "major"), "dominant");
  assert.equal(emily.keyArea("9:minor", "major"), "relative");
  assert.equal(emily.keyArea("5:major", "major"), "subdominant");
  assert.equal(emily.keyArea("2:minor", "major"), "other");
  assert.equal(emily.keyArea("9:minor", "minor"), "home");
  assert.equal(emily.keyArea("4:major", "minor"), "dominant");
  assert.equal(emily.keyArea("0:major", "minor"), "relative");
  assert.equal(emily.keyArea("2:minor", "minor"), "subdominant");
});

test("emily: each beat has one feature of each musical kind, worked out from its notes", () => {
  // A beat with a suspension (the soprano held over from the beat before,
  // then down a step), 16th notes in the alto (one voice moving within the
  // beat: the soprano's resolution is its only new note), and a leap to the
  // next beat.
  const events = [
    [3 * Q, 72, Q, 1, 90], [3 * Q, 67, Q, 2, 90], [3 * Q, 64, Q, 3, 90], [3 * Q, 48, Q, 4, 90], // the pickup: C major
    [4 * Q - Q / 2, 74, Q, 1, 90], // the soprano's D, held over into beat 1...
    [4 * Q + Q / 2, 72, Q / 2, 1, 90], // ...down a step to C
    [4 * Q, 67, Q / 4, 2, 90], [4 * Q + Q / 4, 65, Q / 4, 2, 90], [4 * Q + Q / 2, 64, Q / 2, 2, 90], // 16ths
    [4 * Q, 60, Q, 3, 90], [4 * Q, 53, Q, 4, 90],
    [5 * Q, 79, 2 * Q, 1, 90], [5 * Q, 71, 2 * Q, 2, 90], [5 * Q, 62, 2 * Q, 3, 90], [5 * Q, 55, 2 * Q, 4, 90], // G: a leap of a 4th up
  ].sort((a, b) => a[0] - b[0] || a[3] - b[3]);
  const piece = { ...work("s", [[...I, 1]], { fermataAt: [6] }), events, lengthTicks: 8 * Q };
  const db = lexicon.build([piece]);
  const beat1 = db.groupings.findIndex((g) => g.index === 4);
  const features = emily.featuresOf(db, beat1);
  for (const f of ["f:susp", "f:16ths", "f:motion:flowing", "f:melody:leap", "f:chord:seventh"]) assert.ok(features.includes(f), `${f} in ${features}`);
  const pickup = emily.featuresOf(db, db.groupings.findIndex((g) => g.index === 3));
  assert.ok(pickup.includes("f:chord:major") && !pickup.includes("f:susp"), String(pickup));
  for (const list of emily.featureTable(db).of) {
    const kinds = list.map((f) => f.split(":")[1]);
    assert.deepEqual(kinds, [...new Set(kinds)], "one of each kind");
  }
});

test("emily: a like raises the features a piece has more of than the corpus, and lowers the others", () => {
  const db = same;
  const { share, of } = emily.featureTable(db);
  const memory = emily.create();
  // Only the IV chords' beats: all of them F major chords over F, in a corpus
  // where a third of the beats are.
  const iv = db.groupings.map((g, i) => i).filter((i) => db.groupings[i].bass === 53);
  assert.ok(iv.length > 0 && share.get("f:chord:major") === 1, "every chord is major here");
  const region = { beats: iv, transitions: [[iv[0], iv[1]]], works: ["a"], signatures: [], template: "b" };
  const changes = emily.rate(db, memory, region, 1);
  assert.ok(changes.length > 0);
  const counts = new Map();
  for (const i of iv) for (const f of of[i]) counts.set(f, (counts.get(f) || 0) + 1);
  for (const [f, delta] of changes) {
    const more = (counts.get(f) || 0) / iv.length > share.get(f);
    assert.equal(delta > 0, more, `${f}: ${delta}`);
  }
  assert.equal(memory.weights["g:" + db.groupings[iv[0]].id], emily.LEARN_EXACT, "the beat itself");
  assert.equal(memory.weights[`t:${db.groupings[iv[0]].id}>${db.groupings[iv[1]].id}`], emily.LEARN_EXACT, "the transition");
  assert.equal(memory.weights["w:a"], emily.LEARN_EXACT, "the chorale");
  assert.equal(memory.weights["tpl:b"], emily.LEARN_EXACT, "the form");
  assert.deepEqual([memory.ratings, memory.likes, memory.rated, memory.log.length], [1, 1, 1, 1]);

  // A dislike of the same beats undoes it exactly.
  emily.rate(db, memory, region, -1);
  for (const [name, w] of Object.entries(memory.weights)) assert.ok(Math.abs(w) < 1e-9, `${name} ${w}`);
  assert.deepEqual([memory.ratings, memory.likes], [2, 1]);
});

test("emily: weights stay within the limit; a new session after ratings lets them fade", () => {
  const db = same;
  const memory = emily.create();
  const region = { beats: [0, 1, 2], transitions: [], works: ["a"], signatures: [], template: null };
  for (let k = 0; k < 40; k++) emily.rate(db, memory, region, 1);
  assert.equal(memory.weights["w:a"], emily.LIMIT);
  assert.equal(emily.decay(memory), true);
  assert.ok(Math.abs(memory.weights["w:a"] - emily.LIMIT * (1 - emily.DECAY)) < 1e-9);
  assert.deepEqual([memory.sessions, memory.rated], [1, 0]);
  assert.equal(emily.decay(memory), false, "no ratings since: no fading");
  memory.weights.tiny = 0.021;
  memory.rated = 1;
  emily.decay(memory);
  assert.equal(memory.weights.tiny, undefined, "the smallest are dropped");
});

test("emily: a memory read from a file is checked, and words describe it", () => {
  const memory = emily.normalize({ weights: { "f:susp": 9, "f:16ths": -0.5, bad: "x", worse: NaN }, ratings: 3.2, log: "no" });
  assert.deepEqual(memory.weights, { "f:susp": emily.LIMIT, "f:16ths": -0.5 });
  assert.deepEqual([memory.ratings, memory.likes, memory.log], [3, 0, []]);
  assert.deepEqual(emily.normalize(null), emily.create());
  assert.equal(emily.summary(memory), "3 ratings; likes suspensions; dislikes 16th notes");
  assert.equal(emily.summary(emily.create()), "no ratings yet");
  assert.equal(emily.describeChanges([["f:susp", 0.2], ["f:motion:still", -0.1], ["f:16ths", 0.001]]), "+ suspensions, - block chords");
});

test("emily: prepare turns weights into the search's points; none without opinions", () => {
  const db = same;
  assert.equal(emily.prepare(db, emily.create()), null);
  const memory = emily.create();
  memory.weights["w:a"] = 1;
  memory.weights["f:chord:major"] = 0.5;
  memory.weights[`t:${db.groupings[0].id}>${db.groupings[1].id}`] = -1;
  memory.weights["tpl:c"] = 2;
  const taste = emily.prepare(db, memory);
  const a = db.groupings.findIndex((g) => g.work === "a");
  const b = db.groupings.findIndex((g) => g.work === "b");
  assert.equal(taste.beat[a], Math.round(emily.TASTE * 1.5));
  assert.equal(taste.beat[b], Math.round(emily.TASTE * 0.5));
  assert.equal(taste.edges.get(0).get(1), -emily.TASTE);
  assert.deepEqual([...taste.templates], [["c", 2]]);
});

test("form: with no taste, composing is exactly as before M9 (temperature 1)", () => {
  for (const seed of [1, 2, 3]) {
    const plain = form.compose(same, { seed, beats: 8 });
    const options = form.compose(same, { seed, beats: 8, taste: null, temperature: 1 });
    assert.deepEqual(options.piece.provenance, plain.piece.provenance, `seed ${seed}`);
  }
});

test("form: a taste for one chorale's beats brings more of them, within the rules", () => {
  const memory = emily.create();
  memory.weights["w:a"] = 2;
  const taste = emily.prepare(same, memory);
  const fromA = (piece) => piece.provenance.filter((p) => p.work === "a").length / piece.provenance.length;
  let plain = 0;
  let liked = 0;
  for (let seed = 1; seed <= 8; seed++) {
    plain += fromA(form.compose(same, { seed, beats: 8 }).piece);
    const result = form.compose(same, { seed, beats: 8, taste });
    assert.ok(result.ok);
    checkForm(same, result.piece); // every rule kept
    liked += fromA(result.piece);
  }
  assert.ok(liked / 8 >= 0.45 && liked > plain, `${liked / 8} of beats from a (without the taste ${plain / 8})`);
});

test("form: temperature 0 leaves only taste; high temperatures let chance back in", () => {
  const memory = emily.create();
  memory.weights["w:a"] = 2;
  const taste = emily.prepare(same, memory);
  const fromA = (temperature) => {
    let n = 0;
    for (let seed = 1; seed <= 8; seed++) {
      const piece = form.compose(same, { seed, beats: 8, taste, temperature }).piece;
      n += piece.provenance.filter((p) => p.work === "a").length / piece.provenance.length;
    }
    return n / 8;
  };
  assert.ok(fromA(0) >= fromA(3), `${fromA(0)} at 0, ${fromA(3)} at 3`);
  // Without a taste, temperature 0 removes the seeded randomness from the
  // search (the seed still shuffles equal choices).
  assert.ok(form.compose(same, { seed: 4, beats: 8, temperature: 0 }).ok);
});

test("form: liked forms come first in the seeded order (byTaste)", () => {
  const list = ["p", "q", "r", "s"];
  assert.deepEqual(form.byTaste(list, () => 0), list, "no taste: the seeded order");
  assert.deepEqual(form.byTaste(list, (x) => (x === "s" ? 1 : 0), 0), ["s", "p", "q", "r"]);
  assert.deepEqual(form.byTaste(list, (x) => (x === "p" ? -1 : 0), 0), ["q", "r", "s", "p"]);
  assert.equal(form.byTaste(list, (x) => (x === "s" ? 3 : 0), 1)[0], "s", "a strong liking wins at temperature 1");
  assert.deepEqual(form.byTaste(list, (x) => (x === "s" ? 0.05 : 0), 1), list, "a slight one doesn't");
});

test("stream: phrases follow the taste too", () => {
  // Two phrases per chorale (as in stream.test.js), so a stream can go on.
  const twoPhrases = [...phrase(I, IV, V, I, IV, V, I, IV, V), [...I, 2]];
  const db = lexicon.build(["a", "b", "c", "d", "e"].map((id) => work(id, twoPhrases, { fermataAt: [6, 12] })));
  const memory = emily.create();
  memory.weights["w:b"] = 2;
  const fromB = (taste) => {
    const stream = streams.start({ seed: 2 });
    let n = 0;
    let beats = 0;
    for (let k = 0; k < 4; k++) {
      const { ok, phrase: made } = streams.next(db, stream, { taste });
      assert.ok(ok);
      n += made.placed.filter((p) => db.groupings[p.index].work === "b").length;
      beats += made.placed.length;
    }
    return n / beats;
  };
  const liked = fromB(emily.prepare(db, memory));
  assert.ok(liked > fromB(null) && liked >= 0.3, `${liked} of beats from b, ${fromB(null)} without the taste`);
});

test("emily: a region is the beats of a piece between two ticks, with its form only when whole", () => {
  const piece = form.compose(same, { seed: 1, beats: 8 }).piece;
  const whole = emily.regionOf(same, piece);
  assert.equal(whole.beats.length, piece.provenance.length);
  assert.equal(whole.template, piece.form.template);
  assert.equal(whole.transitions.length, piece.provenance.length - 1, "consecutive beats");
  const first = piece.provenance[0].tick;
  const part = emily.regionOf(same, piece, first, first + 2 * Q);
  assert.equal(part.beats.length, 2);
  assert.equal(part.template, null);
  const fit = emily.fit(same, { weights: { "f:chord:major": 1 } }, piece);
  assert.equal(fit, 1, "every beat is a major chord");
  const shares = emily.shares(same, piece);
  assert.equal(shares.get("f:chord:major"), 1);
});

test("emily: pieces with and without a taste, compared on its strongest features", () => {
  const memory = emily.create();
  memory.weights["w:a"] = 2;
  memory.weights["f:melody:same"] = 1;
  memory.weights["f:melody:step"] = -1;
  const taste = emily.prepare(same, memory);
  const withTaste = [1, 2].map((seed) => form.compose(same, { seed, beats: 8, taste }).piece);
  const without = [1, 2].map((seed) => form.compose(same, { seed, beats: 8 }).piece);
  const result = emily.compare(same, memory, withTaste, without);
  assert.ok(result.fit[0] >= result.fit[1]);
  assert.deepEqual(result.features.map(([f]) => f), ["f:melody:same", "f:melody:step"]);
  for (const [, a, b] of result.features) assert.ok(a >= 0 && a <= 1 && b >= 0 && b <= 1);
});

test("emily: pins hold a feature at your value, under any rating or fading; strength scales the taste", () => {
  const db = same;
  const memory = emily.create();
  memory.weights["f:chord:major"] = 0.5;
  assert.equal(emily.pin(memory, "f:chord:major", 2), 2);
  assert.equal(emily.pin(memory, "f:no-such", 1), null);
  assert.equal(emily.pin(memory, "f:16ths", 9), emily.LIMIT, "within the limit");
  assert.deepEqual(emily.effective(memory)["f:chord:major"], 2);
  const a = db.groupings.findIndex((g) => g.work === "a");
  assert.equal(emily.prepare(db, memory).beat[a], Math.round(emily.TASTE * 2), "composing uses the pin");

  // A rating teaches the learned weight underneath; decay fades only that.
  const region = { beats: [0, 1, 2], transitions: [], works: [], signatures: [], template: null };
  emily.rate(db, memory, region, -1);
  memory.weights["f:chord:major"] = 0.5;
  emily.decay(memory);
  assert.equal(memory.pins["f:chord:major"], 2);
  assert.equal(memory.weights["f:chord:major"], 0.45);

  // Strength: 0 is no taste at all; 2 doubles it.
  memory.weights = { "f:chord:major": memory.weights["f:chord:major"] }; // only this one learned
  emily.setStrength(memory, 0);
  assert.equal(emily.prepare(db, memory), null);
  emily.setStrength(memory, 5);
  assert.equal(memory.strength, emily.MAX_STRENGTH);
  assert.equal(emily.prepare(db, memory).beat[a], Math.round(emily.TASTE * 2 * 2));

  // Releasing brings back what she learned.
  assert.equal(emily.unpin(memory, "f:chord:major"), 1);
  assert.equal(emily.effective(memory)["f:chord:major"], 0.45);
  assert.equal(emily.unpin(memory), 1, "the other pin");
  assert.deepEqual(memory.pins, {});

  // Saved and read back.
  emily.pin(memory, "f:susp", -1);
  const again = emily.normalize(JSON.parse(JSON.stringify(memory)));
  assert.deepEqual([again.pins, again.strength], [{ "f:susp": -1 }, emily.MAX_STRENGTH]);
  assert.deepEqual(emily.normalize({ pins: { "g:x": 1, "f:susp": "a" }, strength: -1 }).pins, {}, "only musical features, as numbers");
});

test("emily: the weight editor's groups cover every musical feature once", () => {
  const listed = emily.GROUPS.flatMap(([, features]) => features);
  assert.deepEqual([...listed].sort(), Object.keys(emily.NAMES).sort());
});
