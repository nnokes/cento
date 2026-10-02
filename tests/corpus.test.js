"use strict";
// Round-trips every chorale in the local corpus. The corpus isn't in the repo
// (see PLAN.md, section 6.1), so this runs only where it exists:
// EMI_CORPUS=<folder>, or ~/Documents/ml_midi/corpus by default. In CI it
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
const { checkPiece, checkForm } = require("./piece-rules");

const dir = process.env.EMI_CORPUS || path.join(os.homedir(), "Documents", "ml_midi", "corpus");
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
  const steps = [0, 0, 0];
  for (let seed = 1; seed <= seeds; seed++) {
    const result = form.compose(db, { seed });
    if (result.stats.tried.length > 1 || !result.ok) deadEnds++;
    if (!result.ok) continue;
    made++;
    steps[result.stats.relaxed]++;
    relaxedSeams += composer.summary(result.piece).relaxed;
    checkForm(db, result.piece);
    assert.doesNotThrow(() => queue.toSteps(ingest.quantize(result.piece).work));
  }
  t.diagnostic(`composed ${made} of ${seeds}; dead ends ${deadEnds}; strict ${steps[0]}, octave moves ${steps[1]}, any cadence bass ${steps[2]}; ${(relaxedSeams / Math.max(1, made)).toFixed(1)} octave seams per piece`);
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
