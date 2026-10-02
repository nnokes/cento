"use strict";
// M8: a blind A/B listening test. Each pair is one of Bach's chorales and a
// piece composed in that chorale's form (the same phrases, cadences and
// length), both in the chorale's own key; Bach is A in half the pairs. A
// listener hears both and says which is Bach; if listeners can't pick Bach
// out more often than guessing would, the recombination passes (PLAN.md, M8).
//
//   test = build(db, { count, seed, signatures })
//     { id, tempo, pairs: [{ key, bars, beatsPerBar, A, B }], answers: [...] }
//   A and B: notes [onset, pitch, duration, voice], onset and duration in beats.
//   answers (one per pair): { bach: "A" | "B", chorale, title, piece, template }
// page(test) (emi-abtest-page) turns it into a self-contained web page.

const rng = require("emi-rng");
const forms = require("emi-form");
const quality = require("emi-quality");

const NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function build(db, { count = 10, seed = 1, signatures = true, tempo = 84 } = {}) {
  const random = rng.create(seed);
  const order = db.templates.map((t) => t.work);
  for (let i = order.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  // Bach is A in half the pairs and B in the other half, in shuffled order,
  // so no run of one side gives anything away.
  const sides = Array.from({ length: count }, (_, i) => i % 2 === 0);
  for (let i = sides.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [sides[i], sides[j]] = [sides[j], sides[i]];
  }
  const sources = quality.corpusLines(db).events;
  const beatsPerBar = Math.round((db.meter[0] * 4) / db.meter[1]);
  const pairs = [];
  const answers = [];
  for (const work of order) {
    if (pairs.length >= count) break;
    const result = forms.compose(db, { seed: seed * 1000 + pairs.length + 1, template: work, signatures });
    if (!result.ok || result.piece.form.overLimit) continue; // this form can't be filled cleanly: another chorale
    const info = db.works.find((w) => w.id === work);
    // Back to the chorale's own key: both move by what normalizing moved it.
    const shift = -(info.transposedBy || 0);
    const chorale = asBeats(sources.get(work), db.beatTicks, shift);
    const piece = asBeats(result.piece.events, db.beatTicks, shift);
    const tonic = (((result.piece.key.tonic + shift) % 12) + 12) % 12;
    const bachFirst = sides[pairs.length];
    pairs.push({
      key: `${NAMES[tonic]} ${result.piece.key.mode}`,
      bars: Math.ceil(Math.max(end(chorale), end(piece)) / beatsPerBar),
      beatsPerBar,
      A: bachFirst ? chorale : piece,
      B: bachFirst ? piece : chorale,
    });
    answers.push({ bach: bachFirst ? "A" : "B", chorale: work, title: info.title || null, piece: result.piece.id, template: work, signatures });
  }
  return { id: `abtest-${seed}-${db.works.length}`, tempo, pairs, answers };
}

// Notes [on, pitch, dur, voice] in ticks, as [onset, pitch, duration, voice]
// in beats from the first note, moved by `shift` semitones.
function asBeats(events, beatTicks, shift) {
  const first = Math.min(...events.map((e) => e[0]));
  const round = (x) => Math.round(x * 1000) / 1000;
  return events
    .map(([on, pitch, dur, voice]) => [round((on - first) / beatTicks), pitch + shift, round(dur / beatTicks), voice])
    .sort((a, b) => a[0] - b[0] || a[3] - b[3]);
}

const end = (notes) => Math.max(...notes.map((n) => n[0] + n[2]));

// The answers, lightly hidden in the page (so a glance at the page source
// doesn't give them away): the JSON's character codes XORed with a key.
function seal(answers, key = 0x5a) {
  return Array.from(JSON.stringify(answers)).map((c) => c.charCodeAt(0) ^ key);
}

function unseal(codes, key = 0x5a) {
  return JSON.parse(codes.map((c) => String.fromCharCode(c ^ key)).join(""));
}

// One-sided binomial test: the chance of k or more right out of n by
// guessing (p = 0.5 each).
function chance(k, n) {
  let total = 0;
  let ways = 1; // n choose j
  for (let j = 0; j <= n; j++) {
    if (j >= k) total += ways;
    ways = (ways * (n - j)) / (j + 1);
  }
  return total / 2 ** n;
}

exports.build = build;
exports.seal = seal;
exports.unseal = unseal;
exports.chance = chance;
