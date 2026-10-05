"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const lexicon = require("emi-lexicon");
const form = require("emi-form");
const composer = require("emi-compose");
const { checkForm } = require("./piece-rules");
const { Q, work, I, IV, V, phrase, cycle } = require("./synthetic");

// Three works on the same cycle: every beat has twins in the other works.
const same = ["a", "b", "c"].map((id) => work(id, cycle, { fermataAt: [12] }));

// Two phrases with a silent beat between them (beat 7), as 32 of the 142
// chorales have after some cadences.
const twoPhrases = [...phrase(I, IV, V), [...I, 1], ["rest", 1], ...phrase(V, I, IV, V), [...I, 2]];
const resting = ["d", "e", "f"].map((id) => work(id, twoPhrases, { fermataAt: [6, 12] }));

// The same cycle with the soprano an octave higher: X and Y never join
// exactly, only with octave moves (L1).
const high = (chord) => [chord[0] + 12, ...chord.slice(1)];
const octaves = [work("x", cycle, { fermataAt: [12] }), work("y", cycle.map((c) => [...high(c.slice(0, 4)), c[4]]), { fermataAt: [12] })];

test("lexicon: keys parse and rebuild; L1 keys drop octaves above the bass and the held marks", () => {
  const tokens = lexicon.parseKey("~72,67,r,48");
  assert.deepEqual(tokens, [{ held: true, pitch: 72 }, { held: false, pitch: 67 }, null, { held: false, pitch: 48 }]);
  assert.equal(lexicon.keyOf(tokens), "~72,67,r,48");
  assert.equal(lexicon.l1Key(tokens), "0,7,r,48");
  assert.equal(lexicon.l1Key(lexicon.parseKey("84,55,r,~48")), "0,7,r,48");
  assert.notEqual(lexicon.l1Key(lexicon.parseKey("72,67,r,36")), "0,7,r,48"); // the bass is exact
});

test("lexicon: L1 index, templates and voice ranges", () => {
  const db = lexicon.build(octaves);
  for (const [key, indexes] of Object.entries(db.lexicon1)) {
    for (const i of indexes) assert.equal(lexicon.l1Key(lexicon.parseKey(db.groupings[i].entryKey)), key);
  }
  assert.deepEqual(db.templates, [{ work: "x", start: 0, count: 11 }, { work: "y", start: 11, count: 11 }]);
  assert.deepEqual(db.ranges, [[71, 84], [67, 69], [62, 65], [48, 55]]);
  const s = lexicon.stats(db);
  assert.ok(s.deadEndShareL1 < s.deadEndShare); // X and Y only meet at L1
});

test("form: a template's slots carry metre, cadences with their bass, rests, first and last", () => {
  const db = lexicon.build(resting);
  const slots = form.slotsOf(db, db.templates[0]);
  assert.equal(slots.length, 11); // beats 3..13, the rest included
  assert.deepEqual(slots.map((s) => (s.rest ? "rest" : s.beatInBar)), [4, 1, 2, 3, "rest", 1, 2, 3, 4, 1, 2]);
  assert.deepEqual(slots.map((s) => !s.rest && s.cadence), [false, false, false, true, false, false, false, false, false, true, false]);
  assert.equal(slots[3].bass, 0); // the cadence stands on C
  assert.equal(slots[0].first, true);
  assert.equal(slots[5].afterRest, true);
  assert.equal(slots[10].last, true);
  assert.equal(form.slotsOf(db, db.templates[0], { cadenceBass: false })[3].bass, null);
  assert.equal(form.templateBeats(db, db.templates[0]), 11);
});

test("form: a strict piece follows its template exactly, the same for the same seed", () => {
  const db = lexicon.build(same);
  const result = form.compose(db, { seed: 3, beats: 8 });
  assert.equal(result.ok, true);
  assert.equal(result.piece.form.relaxed, 0);
  assert.equal(result.piece.form.speac, 1, "a strict piece keeps every SPEAC label of its template");
  assert.deepEqual(result.stats.tried, [result.piece.form.template]);
  checkForm(db, result.piece);
  assert.ok(composer.summary(result.piece).sources >= 2);
  assert.deepEqual(form.compose(db, { seed: 3, beats: 8 }).piece, result.piece);
  // The final I is one half note in every voice, as in the template.
  const end = Math.max(...result.piece.events.map((e) => e[0] + e[2]));
  for (const e of result.piece.events.filter((e) => e[0] + e[2] === end)) assert.equal(e[2], 2 * Q);
});

test("form: a rest in the template is a rest in the piece", () => {
  const db = lexicon.build(resting);
  const { ok, piece } = form.compose(db, { seed: 2, beats: 8 });
  assert.equal(ok, true);
  checkForm(db, piece);
  assert.equal(piece.form.rests, 1);
  const restTick = piece.provenance[0].tick + 4 * Q;
  assert.equal(piece.events.filter((e) => e[0] < restTick + Q && e[0] + e[2] > restTick).length, 0);
  assert.deepEqual(piece.fermatas, [piece.provenance[0].tick + 3 * Q, piece.provenance[0].tick + 9 * Q]);
});

test("form: when exact hooks run out, voices move by octaves and still join exactly", () => {
  const db = lexicon.build(octaves);
  assert.equal(form.compose(db, { seed: 1, beats: 8, relax: 0 }).ok, false); // strict: impossible
  const { ok, piece, stats } = form.compose(db, { seed: 1, beats: 8 });
  assert.equal(ok, true);
  assert.equal(form.RELAX[stats.relaxed].level, 1, "solved by octave moves (L1)");
  checkForm(db, piece);
  assert.ok(piece.provenance.some((p) => p.shift), "some voices moved");
  assert.ok(composer.summary(piece).relaxed > 0);
  // The soprano never leaps more than a step between beats: every seam joined.
  const soprano = piece.events.filter((e) => e[3] === 1).map((e) => e[1]);
  for (let i = 1; i < soprano.length; i++) assert.ok(Math.abs(soprano[i] - soprano[i - 1]) <= 2, soprano.join(" "));
});

test("form: reports failure when no template is long enough", () => {
  const db = lexicon.build(same);
  const result = form.compose(db, { seed: 1, beats: 100 });
  assert.equal(result.ok, false);
  assert.deepEqual(result.stats.tried, []);
});

test("form: a corpus records its mode, and minor pieces are labeled A minor", () => {
  const major = lexicon.build(same);
  assert.equal(major.mode, "major");
  assert.deepEqual(form.compose(major, { seed: 1, beats: 8 }).piece.key, { tonic: 0, mode: "major", from: "composed" });
  // The same music, called A minor: it is already in A minor, so nothing moves.
  const minor = lexicon.build(same.map((w) => ({ ...w, key: { tonic: 9, mode: "minor", from: "test" } })));
  assert.equal(minor.mode, "minor");
  assert.deepEqual(form.compose(minor, { seed: 1, beats: 8 }).piece.key, { tonic: 9, mode: "minor", from: "composed" });
  assert.equal(lexicon.build([same[0], { ...same[1], key: { tonic: 9, mode: "minor", from: "test" } }]).mode, "mixed");
});

test("lexicon: every grouping carries its tension and its beat, bar and phrase labels (M6)", () => {
  const db = lexicon.build(resting);
  for (const g of db.groupings) {
    assert.ok(g.tension > 0, g.id);
    for (const level of ["beat", "bar", "phrase"]) assert.match(g.speac[level], /^[SPEAC]$/, `${g.id} ${level}`);
  }
  // Two phrases per work (cadences on beats 6 and 12): phrase labels change between them at most once.
  const labels = db.groupings.filter((g) => g.work === "d").map((g) => g.speac.phrase);
  assert.ok(new Set(labels).size <= 2);
});

// M8: repetition. Bar form: the first phrase's melody comes back as the
// second, then a closing phrase. Where the template repeats, so does the piece.
test("form: a repeated phrase in the template is repeated in the piece (bar form)", () => {
  const II = [74, 69, 65, 50];
  const VI = [69, 64, 60, 57];
  const a = [...phrase(I, IV, V), [...I, 1]]; // 4 beats: pickup .. cadence
  const b = [...phrase(I, VI, II, V), [...I, 2]]; // the closing phrase
  const works = ["p", "q", "r", "s", "t"].map((id) => work(id, [...a, ...a, ...b], { fermataAt: [6, 10, 15] }));
  const db = lexicon.build(works);
  const slots = form.markRepeats(db, db.templates[0], form.slotsOf(db, db.templates[0]));
  assert.deepEqual(slots.map((s) => (s.repeat ? s.repeat.of : null)), [null, null, null, null, 0, 1, 2, 3, null, null, null, null, null, null]);
  assert.equal(slots[4].repeat.first, true);
  let repeated = 0;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    const result = form.compose(db, { seed, beats: 8 });
    assert.equal(result.ok, true);
    checkForm(db, result.piece);
    const prov = result.piece.provenance;
    if (prov.some((p) => p.repeat !== undefined)) {
      repeated++;
      for (let k = 0; k < 4; k++) assert.equal(prov[4 + k].grouping, prov[k].grouping, `seed ${seed}: beat ${k} repeated`);
    }
  }
  assert.ok(repeated >= 4, `only ${repeated} of 6 pieces repeat`);
  const plain = form.compose(db, { seed: 1, beats: 8, repeats: false });
  assert.ok(plain.piece.provenance.every((p) => p.repeat === undefined));
});

test("lexicon: each grouping's accidentals and key area (M8)", () => {
  const D7 = [72, 66, 62, 50]; // F# in C major: on the way to G
  const G = [71, 67, 62, 43];
  const db = lexicon.build(["a", "b", "c"].map((id) => work(id, [...phrase(I, IV, D7, G, D7), [...G, 2]], { fermataAt: [8] })));
  const of = (index) => db.groupings.find((g) => g.work === "a" && g.index === index);
  assert.equal(of(3).accidentals, "");
  assert.equal(of(5).accidentals, "6", "F#");
  assert.match(of(7).area, /^7:major$/, "the end is in G");
  const slots = form.slotsOf(db, db.templates[0]);
  assert.equal(slots[2].accidentals, "6");
  assert.deepEqual(slots[0].sopranoRange, [71, 72]);
});
