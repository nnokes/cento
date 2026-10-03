"use strict";
// M10: variation operators (Tier 2 of the Emily layer, PLAN §7). An
// accepted piece is built from beats already in the corpus, so feeding it
// back adds new forms and joins but no new sounds. For the style to move,
// Emily must make material Bach never wrote: she varies a composed piece
// here, a few notes at a time, and what you accept of it joins her own
// corpus (emily-memory).
//
// Operators, each at one place in one voice (or two):
//   passing tone            a third filled in: a quarter note becomes two
//                           eighths, the second a step of the key between
//   neighbor tone           a repeated note decorated: the step above or
//                           below, as the second eighth
//   chromatic passing tone  a whole step filled in by the half step between
//   anticipation            at a cadence, the soprano's last note arrives an
//                           eighth early
//   suspension              a voice that steps down into a new chord is held
//                           over half a beat, a dissonance against the bass
//                           (4-3, 7-6, 9-8), then resolves
//   simplified line         two eighths (a passing or neighbor note) become
//                           one quarter
//   re-voiced chord         the alto and tenor exchange chord tones, an
//                           octave apart
// A change is kept only if every voice stays in its range, no voices cross,
// and it adds no parallel fifths or octaves. Novelty (0..1) is the chance
// that each phrase (from a cadence to the next) gets one variant: an
// operator (each as likely as another, among those that fit somewhere),
// then a place for it. The seed decides, so a piece is reproducible.
//
//   vary(db, piece, { seed, novelty }) -> { piece, variants: [{ tick, voice, op }] }
// The varied piece has the new notes, and each provenance entry whose beat
// was changed lists its operators (variant: [op]).

const rng = require("emi-rng");
const quality = require("emi-quality");

const OPS = ["passing tone", "neighbor tone", "chromatic passing tone", "anticipation", "suspension", "simplified line", "re-voiced chord"];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const DISSONANT = new Set([1, 2, 5, 10, 11]); // above the bass: what a suspension needs

const byTime = (a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1];

function vary(db, piece, { seed = 1, novelty = 0 } = {}) {
  if (!(novelty > 0) || !piece.events.length) return { piece, variants: [] };
  const random = rng.create((Math.imul(seed, 2654435761) ^ 0x51ed27) >>> 0);
  const beat = piece.ppq;
  let events = piece.events.map((e) => e.slice());
  const groupings = new Map(db.groupings.map((g) => [g.id, g]));
  const keyAt = (tick) => {
    let entry = null;
    for (const p of piece.provenance || []) if (p.tick <= tick) entry = p;
    const g = entry && groupings.get(entry.grouping);
    if (g && g.area) {
      const [tonic, mode] = g.area.split(":");
      return { tonic: Number(tonic), mode };
    }
    return { tonic: piece.key ? piece.key.tonic : 0, mode: piece.key ? piece.key.mode : "major" };
  };
  const variants = [];
  for (const [from, to] of phraseSpans(piece)) {
    if (random.next() >= novelty) continue;
    // An operator first (each as likely as another), then a place for it.
    const all = candidatesIn(events, { from, to, beat, keyAt, fermatas: new Set(piece.fermatas || []) });
    const ops = shuffle(OPS.filter((op) => all.some((c) => c.op === op)), random);
    const candidates = ops.flatMap((op) => shuffle(all.filter((c) => c.op === op), random));
    for (const c of candidates) {
      const next = c.apply(events).sort(byTime);
      if (!valid(db, events, next, c.from - beat, c.to + beat)) continue;
      events = next;
      variants.push({ tick: c.tick, voice: c.voice, op: c.op });
      break;
    }
  }
  if (!variants.length) return { piece, variants };
  const provenance = (piece.provenance || []).map((p) => {
    const here = variants.filter((v) => v.tick >= p.tick && v.tick < p.tick + beat).map((v) => v.op);
    return here.length ? { ...p, variant: here } : p;
  });
  return { piece: { ...piece, events, provenance, variants }, variants };
}

// The piece's phrases, [from, to) in ticks: from its first note to the end
// of each cadence beat.
function phraseSpans(piece) {
  const beat = piece.ppq;
  const start = Math.min(...piece.events.map((e) => e[0]));
  const end = Math.max(...piece.events.map((e) => e[0] + e[2]));
  const cuts = [...new Set(piece.fermatas || [])].sort((a, b) => a - b).map((t) => t + beat).filter((t) => t > start && t < end);
  const spans = [];
  let from = start;
  for (const cut of cuts) {
    spans.push([from, cut]);
    from = cut;
  }
  if (from < end) spans.push([from, end]);
  return spans;
}

function shuffle(list, random) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Whether pitch class pc is in the key ({ tonic, mode }); in minor, the raised
// sixth and seventh too when the line rises.
function inKey(pc, key, rising) {
  const rel = (((pc - key.tonic) % 12) + 12) % 12;
  if (key.mode === "minor") return MINOR.includes(rel) || (rising && (rel === 9 || rel === 11));
  return MAJOR.includes(rel);
}

// Every way an operator could change the notes between from and to.
function candidatesIn(events, { from, to, beat, keyAt, fermatas }) {
  const half = beat / 2;
  const out = [];
  const voices = [1, 2, 3, 4].map((v) => events.filter((e) => e[3] === v).sort(byTime));
  const at = (v, t) => voices[v - 1].find((e) => e[0] <= t && t < e[0] + e[2]) || null;
  const replace = (list, old, ...fresh) => [...list.filter((e) => e !== old), ...fresh];
  const onBeat = (e) => e[0] % beat === 0;
  for (let v = 1; v <= 4; v++) {
    const line = voices[v - 1];
    for (let k = 0; k + 1 < line.length; k++) {
      const [a, b] = [line[k], line[k + 1]];
      if (a[0] < from || b[0] >= to || a[0] + a[2] !== b[0]) continue; // within the phrase, and joined
      const quarter = onBeat(a) && a[2] === beat;
      const step = b[1] - a[1];
      const split = (pitch, op) => ({
        op, voice: v, tick: a[0], from: a[0], to: b[0],
        apply: (list) => replace(list, a, [a[0], a[1], half, v, a[4]], [a[0] + half, pitch, half, v, a[4]]),
      });
      if (quarter && Math.abs(step) >= 3 && Math.abs(step) <= 4) {
        const key = keyAt(a[0]);
        const between = [];
        for (let p = Math.min(a[1], b[1]) + 1; p < Math.max(a[1], b[1]); p++) if (inKey(p % 12, key, step > 0)) between.push(p);
        if (between.length === 1) out.push(split(between[0], "passing tone"));
      }
      if (quarter && step === 0) {
        const key = keyAt(a[0]);
        for (const dir of [1, -1]) {
          for (const size of [1, 2]) {
            const p = a[1] + dir * size;
            if (inKey(p % 12, key, dir > 0)) {
              out.push(split(p, "neighbor tone"));
              break;
            }
          }
        }
      }
      if (quarter && Math.abs(step) === 2) out.push(split(a[1] + Math.sign(step), "chromatic passing tone"));
      if (quarter && v === 1 && fermatas.has(b[0]) && step !== 0 && Math.abs(step) <= 4) out.push(split(b[1], "anticipation"));
      if (quarter && v <= 3 && (step === -1 || step === -2) && onBeat(b) && b[2] >= beat) {
        const bass = at(4, b[0]);
        const changes = [1, 2, 3, 4].some((w) => w !== v && voices[w - 1].some((e) => e[0] === b[0]));
        if (bass && changes && DISSONANT.has((((a[1] - bass[1]) % 12) + 12) % 12)) {
          out.push({
            op: "suspension", voice: v, tick: b[0], from: a[0], to: b[0] + b[2],
            apply: (list) => replace(list.filter((e) => e !== b), a, [a[0], a[1], beat + half, v, a[4]], [b[0] + half, b[1], b[2] - half, v, b[4]]),
          });
        }
      }
      // Two eighths in a beat, the second a step from both its neighbors: one quarter.
      if (k + 2 < line.length && onBeat(a) && a[2] === half && b[2] === half && line[k + 2][0] === b[0] + half) {
        const c = line[k + 2];
        if (Math.abs(step) <= 2 && Math.abs(c[1] - b[1]) <= 2 && step !== 0) {
          out.push({
            op: "simplified line", voice: v, tick: a[0], from: a[0], to: c[0],
            apply: (list) => replace(list.filter((e) => e !== b), a, [a[0], a[1], beat, v, a[4]]),
          });
        }
      }
    }
  }
  // Re-voiced chords: the alto takes the tenor's note an octave up and the
  // tenor the alto's an octave down, where both start together on a beat.
  for (const alto of voices[1]) {
    if (alto[0] < from || alto[0] >= to || !onBeat(alto)) continue;
    const tenor = voices[2].find((e) => e[0] === alto[0] && e[2] === alto[2]);
    if (!tenor || alto[1] - tenor[1] === 12 || alto[1] === tenor[1]) continue;
    const up = tenor[1] + 12;
    const down = alto[1] - 12;
    out.push({
      op: "re-voiced chord", voice: 2, tick: alto[0], from: alto[0], to: alto[0] + alto[2],
      apply: (list) => replace(replace(list, alto, [alto[0], up, alto[2], 2, alto[4]]), tenor, [tenor[0], down, tenor[2], 3, tenor[4]]),
    });
  }
  return out;
}

// A changed passage is kept if every voice stays in its range, no voices
// cross, no leap is wider than an octave, and it has no parallel fifths or
// octaves that the notes before it didn't (between from and to).
function valid(db, before, after, from, to) {
  const near = (list) => list.filter((e) => e[0] + e[2] > from && e[0] < to);
  const changed = near(after);
  for (const [, pitch, , voice] of changed) {
    const range = db.ranges[voice - 1];
    if (range && (pitch < range[0] || pitch > range[1])) return false;
  }
  const times = [...new Set(changed.map((e) => e[0]))];
  for (const t of times) {
    const sounding = [1, 2, 3, 4].map((v) => changed.find((e) => e[3] === v && e[0] <= t && t < e[0] + e[2]));
    for (let v = 0; v < 3; v++) if (sounding[v] && sounding[v + 1] && sounding[v][1] < sounding[v + 1][1]) return false;
  }
  for (let v = 1; v <= 4; v++) {
    const line = changed.filter((e) => e[3] === v).sort(byTime);
    for (let k = 1; k < line.length; k++) if (Math.abs(line[k][1] - line[k - 1][1]) > 12) return false;
  }
  const key = (p) => `${p.from}:${p.tick}:${p.voices}:${p.interval}`;
  const had = new Set(quality.parallelsIn(near(before)).map(key));
  return quality.parallelsIn(changed).every((p) => had.has(key(p)));
}

exports.OPS = OPS;
exports.vary = vary;
exports.phraseSpans = phraseSpans;
exports.candidatesIn = candidatesIn;
exports.valid = valid;
