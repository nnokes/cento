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

test("corpus: every chorale normalizes to C major or A minor and queues on the 16th grid", { skip }, () => {
  for (const file of files) {
    const inC = ingest.normalize(load(file).work);
    assert.equal(inC.key.tonic, inC.key.mode === "minor" ? 9 : 0, file);
    assert.ok(Math.abs(inC.transposedBy) <= 6, file);
    assert.doesNotThrow(() => queue.toSteps(inC), file);
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
