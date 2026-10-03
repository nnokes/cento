"use strict";
// Round-trips every chorale in the local corpus. The corpus isn't in the repo
// (see PLAN.md, section 6.1), so this runs only where it exists:
// EMI_CORPUS=<folder>, or ~/Documents/cento/corpus by default (or, if that
// isn't there, ~/Documents/ml_midi/corpus, its name before the rename). In CI it
// skips.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const smf = require("emi-smf");
const ingest = require("emi-ingest");
const keys = require("emi-key");
const queue = require("emi-queue");
const lexicon = require("emi-lexicon");
const composer = require("emi-compose");
const form = require("emi-form");
const emily = require("emily-assoc");
const vary = require("emily-vary");
const emilyMemory = require("emily-memory");
const { checkPiece, checkForm } = require("./piece-rules");

const dir = process.env.EMI_CORPUS || ["cento", "ml_midi"].map((name) => path.join(os.homedir(), "Documents", name, "corpus")).find((d) => fs.existsSync(d)) || path.join(os.homedir(), "Documents", "cento", "corpus");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mid")).sort() : [];
const skip = files.length ? false : `no corpus at ${dir} (run tools/export-chorales.py)`;

function load(file) {
  const sidecarPath = path.join(dir, file.replace(/\.mid$/, ".json"));
  const sidecar = fs.existsSync(sidecarPath) ? JSON.parse(fs.readFileSync(sidecarPath, "utf8")) : null;
  const midi = smf.parse(fs.readFileSync(path.join(dir, file)));
  return { midi, sidecar, work: ingest.fromMidi(midi, { id: file.replace(/\.mid$/, ""), sidecar }) };
}

test(`corpus: ${files.length} files read cleanly, with every note kept`, { skip }, () => {
  for (const file of files) {
    const { midi, sidecar, work } = load(file);
    assert.deepEqual(work.warnings, [], file);
    assert.ok(sidecar, `${file}: no sidecar`);
    const noteCount = sidecar.midi.voiceTracks.reduce((n, i) => n + midi.tracks[i].notes.length, 0);
    assert.equal(work.events.length, noteCount, file);
    assert.equal(work.voices, 4, file);
    assert.ok(work.fermatas.length > 0, `${file}: no fermatas`);
  }
});

test("corpus: MIDI -> work -> MIDI -> work keeps identical notes", { skip }, () => {
  for (const file of files) {
    const { work } = load(file);
    for (const version of [work, ingest.normalize(work)]) {
      const again = ingest.fromMidi(smf.parse(ingest.toMidi(version)), { id: work.id });
      assert.deepEqual(again.events, version.events, file);
    }
  }
});

test("corpus: every chorale normalizes to C major or A minor and queues (quantized as the player does)", { skip }, (t) => {
  for (const file of files) {
    const inC = ingest.normalize(load(file).work);
    assert.equal(inC.key.tonic, inC.key.mode === "minor" ? 9 : 0, file);
    assert.ok(Math.abs(inC.transposedBy) <= 6, file);
    const { work, moved } = ingest.quantize(inC);
    if (moved) t.diagnostic(`${file}: ${moved} notes moved to the 16th grid`);
    assert.doesNotThrow(() => queue.toSteps(work), file);
  }
});

test("corpus: key estimate vs. the sidecar's key (reported, not required)", { skip }, (t) => {
  const disagreements = [];
  for (const file of files) {
    const { work } = load(file);
    const estimate = keys.estimate(work.events);
    if (estimate.tonic !== work.key.tonic || estimate.mode !== work.key.mode) {
      disagreements.push(`${file}: sidecar ${keys.keyName(work.key)}, estimate ${keys.keyName(estimate)}`);
    }
  }
  t.diagnostic(`estimate agrees on ${files.length - disagreements.length} of ${files.length}`);
  for (const line of disagreements) t.diagnostic(line);
});

// With exact matching (M2), a small corpus can't reach an ending in 32 beats
// from most places: 20 chorales compose about 1 seed in 7. Every piece that is
// composed must keep the rules; with 100+ chorales, every seed must compose.
test("corpus: composed pieces keep every rule (voice-hooking, metre, sources, form)", { skip }, (t) => {
  const db = lexicon.build(files.map((file) => load(file).work));
  const s = lexicon.stats(db);
  t.diagnostic(`${s.works} chorales, ${s.groupings} beats, dead ends ${(100 * s.deadEndShare).toFixed(1)}%`);
  let made = 0;
  for (let seed = 1; seed <= 20; seed++) {
    const result = composer.compose(db, { seed, beats: 32 });
    if (!result.ok) continue;
    made++;
    checkPiece(db, result.piece, 32);
    assert.doesNotThrow(() => queue.toSteps(ingest.quantize(result.piece).work));
    const again = ingest.fromMidi(smf.parse(ingest.toMidi(result.piece)), { id: result.piece.id });
    assert.deepEqual(again.events, result.piece.events);
  }
  t.diagnostic(`composed ${made} of 20 seeds`);
  if (files.length >= 100) assert.equal(made, 20, `only ${made} of 20 seeds composed a piece`);
});

// M3: pieces in the form of a chorale. A dead end is a seed whose chorale's
// form can't be filled even with every relaxation, so the composer moves on to
// another chorale's form. With 100+ chorales that must stay under 5%, and
// every seed must compose.
test("corpus: pieces keep their chorale's form; under 5% dead ends", { skip }, (t) => {
  const db = lexicon.build(files.map((file) => load(file).work));
  const s = lexicon.stats(db);
  t.diagnostic(`dead-end groupings: L0 ${(100 * s.deadEndShare).toFixed(1)}%, L1 ${(100 * s.deadEndShareL1).toFixed(1)}%`);
  const seeds = 100;
  let made = 0;
  let deadEnds = 0;
  let relaxedSeams = 0;
  let labelsKept = 0;
  const steps = [0, 0, 0, 0];
  for (let seed = 1; seed <= seeds; seed++) {
    const result = form.compose(db, { seed });
    if (result.stats.tried.length - result.stats.guarded > 1 || !result.ok) deadEnds++;
    if (!result.ok) continue;
    made++;
    steps[result.stats.relaxed]++;
    relaxedSeams += composer.summary(result.piece).relaxed;
    labelsKept += result.piece.form.speac;
    checkForm(db, result.piece);
    assert.doesNotThrow(() => queue.toSteps(ingest.quantize(result.piece).work));
  }
  t.diagnostic(`composed ${made} of ${seeds}; dead ends ${deadEnds}; strict ${steps[0]}, SPEAC preferred ${steps[1]}, octave moves ${steps[2]}, any cadence bass ${steps[3]}; ${(relaxedSeams / Math.max(1, made)).toFixed(1)} octave seams per piece; SPEAC labels kept ${Math.round((100 * labelsKept) / Math.max(1, made))}%`);
  if (files.length >= 100) {
    assert.equal(made, seeds);
    assert.ok(deadEnds < 0.05 * seeds, `${deadEnds} dead ends in ${seeds} seeds`);
  }
});

// M5: streams of phrases, endless and with a final phrase. Every phrase keeps
// the rules; a stream may take a breath (a silent beat) where no phrase can
// join, but rarely.
test("corpus: streams of 24 phrases keep the rules, with few breaths", { skip }, (t) => {
  const streams = require("emi-stream");
  const { checkStream } = require("./piece-rules");
  const db = lexicon.build(files.map((file) => load(file).work));
  let phrases = 0;
  let breaths = 0;
  for (const seed of [1, 2, 3]) {
    const stream = streams.start({ seed });
    for (let k = 1; k <= 24; k++) {
      const { ok } = streams.next(db, stream, { last: k === 24 });
      if (!ok) break;
      phrases++;
    }
    checkStream(db, stream);
    breaths += stream.fallbacks;
  }
  t.diagnostic(`${phrases} of 72 phrases composed, ${breaths} breaths`);
  if (files.length >= 100) {
    assert.equal(phrases, 72);
    assert.ok(breaths <= 0.1 * phrases, `${breaths} breaths in ${phrases} phrases`);
  }
});

// M7: signatures. Bach's best-known cadence formulas, the soprano's 3-2-1
// (b3-2-1 in minor) and the bass's 4-5-1, are among the strongest; pieces
// keep signature blocks at most of their cadences, and those formulas among
// them.
test("corpus: Bach's cadence formulas are signatures and turn up at cadences", { skip }, (t) => {
  const signatures = require("emi-signatures");
  const db = lexicon.build(files.map((file) => load(file).work));
  const name = (id) => signatures.describe(db.signatures.find((s) => s.id === id), db.mode);
  const top = db.signatures.slice(0, 8).map((s) => `${signatures.describe(s, db.mode)} (${s.works})`);
  t.diagnostic(`${db.signatures.length} signatures; strongest: ${top.join(", ")}`);
  const soprano = db.mode === "minor" ? "soprano b3-2-1" : "soprano 3-2-1";
  let cadences = 0;
  let pinned = 0;
  const heard = new Map();
  for (let seed = 1; seed <= 20; seed++) {
    const result = form.compose(db, { seed });
    if (!result.ok) continue;
    cadences += result.piece.fermatas.length;
    pinned += result.piece.form.signatures;
    for (const p of result.piece.provenance) for (const id of p.signatures || []) heard.set(name(id), (heard.get(name(id)) || 0) + 1);
  }
  t.diagnostic(`signature blocks at ${pinned} of ${cadences} cadences; ${soprano} in ${heard.get(soprano) || 0}, bass 4-5-1 in ${heard.get("bass 4-5-1") || 0}`);
  if (files.length >= 100) {
    const strongest = db.signatures.slice(0, 8).map((s) => signatures.describe(s, db.mode));
    assert.ok(strongest.includes(soprano), strongest.join(", "));
    assert.ok(strongest.includes("bass 4-5-1"), strongest.join(", "));
    // At least 70%: a cadence just before a repeated phrase (M8) is left free
    // so the phrase before can lead into the repeat.
    assert.ok(pinned >= 0.7 * cadences, `blocks at only ${pinned} of ${cadences} cadences`);
    assert.ok(heard.get(soprano) >= 10 && heard.get("bass 4-5-1") >= 10, "the formulas turn up in pieces");
  }
});

test("corpus: stream phrases keep signature blocks at their cadences", { skip }, (t) => {
  const streams = require("emi-stream");
  const db = lexicon.build(files.map((file) => load(file).work));
  let phrases = 0;
  let pinned = 0;
  for (const seed of [1, 2, 3]) {
    const stream = streams.start({ seed });
    for (let k = 1; k <= 24; k++) {
      const { ok, phrase } = streams.next(db, stream);
      if (!ok) break;
      phrases++;
      pinned += phrase.signatures;
    }
  }
  t.diagnostic(`${pinned} of ${phrases} phrases cadence on a signature block`);
  if (files.length >= 100) assert.ok(pinned >= 0.6 * phrases, `only ${pinned} of ${phrases}`);
});

// M8: quotation and voice-leading. Pieces stay within the quotation limits
// (emi-quality), and their parallel fifths and octaves are Bach's own: voice-
// hooking carries every seam's motion over from a source, so none are new.
test("corpus: pieces stay within the quotation limits, with no new parallel 5ths or 8ves", { skip }, (t) => {
  const quality = require("emi-quality");
  const db = lexicon.build(files.map((file) => load(file).work));
  let longest = 0;
  let overLimit = 0;
  let own = 0;
  let fresh = 0;
  for (let seed = 1; seed <= 30; seed++) {
    const result = form.compose(db, { seed });
    if (!result.ok) continue;
    if (result.piece.form.overLimit) overLimit++;
    else {
      const q = quality.quotes(db, result.piece);
      assert.ok(q.melody.notes <= quality.LIMITS.melody && q.run.beats <= quality.LIMITS.run, `seed ${seed}`);
      longest = Math.max(longest, q.melody.notes);
    }
    const found = quality.parallels(result.piece, { db });
    own += found.filter((p) => p.inherited).length;
    fresh += found.filter((p) => !p.inherited).length;
  }
  t.diagnostic(`30 pieces: longest melody quote ${longest} notes, ${overLimit} over the limit; parallel 5ths/8ves: ${own} Bach's own, ${fresh} new`);
  if (files.length >= 100) {
    assert.equal(overLimit, 0);
    assert.equal(fresh, 0);
  }
});

// M9's "done when": after about ten ratings, output shifts toward the liked
// features. A simulated listener likes one feature: each of ten pieces
// (seeds 1000-1009, composed with the taste so far) is liked if it has more
// of the feature than usual (the mean of ten untrained pieces), disliked
// otherwise. Then 24 new seeds are composed with and without the taste.
test("corpus: after ten ratings, new pieces have more of what the listener liked (M9)", { skip: skip || (files.length < 100 ? "needs the full corpus" : false) }, (t) => {
  const db = lexicon.build(files.map((file) => load(file).work));
  const shareOf = (piece, feature) => emily.shares(db, piece).get(feature) || 0;
  const plain = new Map();
  const untrained = (seed) => plain.get(seed) || plain.set(seed, form.compose(db, { seed }).piece).get(seed);
  const listen = (feature, sign) => {
    let usual = 0;
    for (let seed = 500; seed < 510; seed++) usual += shareOf(untrained(seed), feature) / 10;
    const memory = emily.create();
    for (let k = 0; k < 10; k++) {
      const piece = form.compose(db, { seed: 1000 + k, taste: emily.prepare(db, memory) }).piece;
      emily.rate(db, memory, emily.regionOf(db, piece), shareOf(piece, feature) > usual ? sign : -sign);
    }
    const taste = emily.prepare(db, memory);
    let before = 0;
    let after = 0;
    let speac = 0;
    for (let seed = 1; seed <= 24; seed++) {
      before += shareOf(untrained(seed), feature) / 24;
      const piece = form.compose(db, { seed, taste }).piece;
      after += shareOf(piece, feature) / 24;
      speac += piece.form.speac / 24;
    }
    t.diagnostic(`${sign > 0 ? "likes" : "dislikes"} ${emily.nameOf(feature)}: ${(100 * before).toFixed(1)}% of beats untrained, ${(100 * after).toFixed(1)}% with the taste (SPEAC labels kept ${(100 * speac).toFixed(0)}%)`);
    return after / before;
  };
  assert.ok(listen("f:16ths", 1) >= 1.25, "16th notes");
  assert.ok(listen("f:melody:leap", 1) >= 1.25, "melodic leaps");
  assert.ok(listen("f:register:high", 1) >= 1.25, "a high melody");
  assert.ok(listen("f:register:low", -1) <= 0.8, "fewer low melodies");
});

// M10's "done when": accepted variants appear in later output, and a
// rollback restores an earlier taste exactly. Five pieces (seeds 1001-1005)
// are varied at novelty 1 and accepted; then 20 new seeds are composed from
// Bach's chorales and her works.
test("corpus: accepted variants appear in later pieces; rolling back gives the same pieces exactly (M10)", { skip: skip || (files.length < 100 ? "needs the full corpus" : false) }, (t) => {
  const bach = files.map((file) => load(file).work);
  const db = lexicon.build(bach);
  const accepted = [];
  for (let k = 0; k < 5; k++) {
    const seed = 1001 + k;
    const piece = vary.vary(db, form.compose(db, { seed }).piece, { seed, novelty: 1 }).piece;
    accepted.push(emilyMemory.workOf(db, piece, { id: "emily-" + (k + 1), what: piece.id }));
  }
  const both = lexicon.build([...bach, ...accepted]);
  const byId = new Map(both.groupings.map((g) => [g.id, g]));
  for (const mix of [0.5, 0.75]) {
    let own = 0;
    let varied = 0;
    let withVariants = 0;
    let beats = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const piece = form.compose(both, { seed, mix }).piece;
      const used = piece.provenance.map((p) => byId.get(p.grouping));
      own += used.filter((g) => g.gen).length;
      const v = used.filter((g) => g.gen && g.variant).length;
      varied += v;
      if (v) withVariants++;
      beats += used.length;
    }
    t.diagnostic(`mix ${mix}: ${Math.round((100 * own) / beats)}% of beats are Emily's own; ${varied} beats carry notes she varied, in ${withVariants} of 20 pieces`);
    assert.ok(withVariants >= 10, `mix ${mix}: her variants in ${withVariants} of 20 pieces`);
  }
  // Rolling back to the first three works: exactly what those three give.
  const three = lexicon.build([...bach, ...accepted.slice(0, 3)]);
  const before = form.compose(three, { seed: 7, mix: 0.5 }).piece;
  const again = lexicon.build([...bach, ...accepted.slice(0, 3)]);
  assert.deepEqual(form.compose(again, { seed: 7, mix: 0.5 }).piece.events, before.events);
});
