"use strict";
// M2: naive recombination. Chains beat groupings from the lexicon so that:
//   - voice-hooking: each grouping starts exactly where the previous one's
//     voices went in its original work (entryKey == previous destKey, L0);
//   - metre: beat 1 follows beat 4, and so on (beatInBar);
//   - different-source rule: consecutive groupings come from different works,
//     except a pure continuation (no new notes: a held chord) may follow its
//     own work;
//   - form: start on a grouping that opened a work, end on a work's final
//     grouping, after at least `beats` beats (and at most `maxBeats`).
// The search is depth-first with a seeded shuffle and a budget, so the same
// seed and database always give the same piece. It never enters a branch that
// can't reach an ending in time: distances to the nearest ending are computed
// once per database (see toEnd).

const rng = require("emi-rng");

const beatsPerBarOf = (db) => (db.meter[0] * 4) / db.meter[1];

// The groupings that may follow grouping `last` (ignoring repeats).
function followers(db, last) {
  if (last.destKey === null) return [];
  const nextBeat = (last.beatInBar % beatsPerBarOf(db)) + 1;
  return (db.lexicon[last.destKey] || []).filter((i) => {
    const g = db.groupings[i];
    return g.beatInBar === nextBeat && (g.work !== last.work || g.newNotes === 0);
  });
}

// toEnd[i]: the fewest groupings that must follow grouping i before a final
// one (0 for a final grouping, Infinity if no ending is reachable). Computed
// backwards from the finals, once per database.
const distanceCache = new WeakMap();
function toEnd(db) {
  if (distanceCache.has(db)) return distanceCache.get(db);
  const n = db.groupings.length;
  const before = Array.from({ length: n }, () => []);
  db.groupings.forEach((g, i) => {
    for (const j of followers(db, g)) before[j].push(i);
  });
  const dist = new Array(n).fill(Infinity);
  const queue = [];
  for (const i of db.finals) {
    dist[i] = 0;
    queue.push(i);
  }
  for (let head = 0; head < queue.length; head++) {
    const j = queue[head];
    for (const i of before[j]) {
      if (dist[i] === Infinity) {
        dist[i] = dist[j] + 1;
        queue.push(i);
      }
    }
  }
  distanceCache.set(db, dist);
  return dist;
}

function compose(db, { seed = 1, beats = 32, maxBeats = beats + 16, budget = 50000 } = {}) {
  const random = rng.create(seed);
  const dist = toEnd(db);
  const shuffle = (list) => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = random.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const chain = [];
  const used = new Set();
  let steps = 0;
  let backtracks = 0;

  const candidates = (last) => {
    // Only groupings from which an ending is still reachable within maxBeats.
    const fits = followers(db, last).filter((i) => !used.has(i) && chain.length + 1 + dist[i] <= maxBeats);
    const shuffled = shuffle(fits);
    // Once long enough, head for the nearest ending.
    if (chain.length + 1 >= beats) shuffled.sort((a, b) => dist[a] - dist[b]);
    return shuffled;
  };

  const extend = () => {
    if (++steps > budget) return false;
    const last = db.groupings[chain[chain.length - 1]];
    if (last.final) return chain.length >= beats;
    if (chain.length >= maxBeats) return false;
    for (const i of candidates(last)) {
      chain.push(i);
      used.add(i);
      if (extend()) return true;
      chain.pop();
      used.delete(i);
      backtracks++;
      if (steps > budget) return false;
    }
    return false;
  };

  for (const start of shuffle(db.openings.filter((i) => dist[i] + 1 <= maxBeats))) {
    chain.push(start);
    used.add(start);
    if (extend()) {
      const placed = chain.map((index, beat) => ({ index, beat, shift: null, level: 0 }));
      return { ok: true, piece: assemble(db, placed, { seed, source: "EMI recombination (M2, L0)" }), stats: { steps, backtracks } };
    }
    chain.pop();
    used.delete(start);
    if (steps > budget) break;
  }
  return { ok: false, piece: null, stats: { steps, backtracks } };
}

// Places groupings at the given beats (counted from the piece's first beat),
// moves each voice by its shift (octaves, at match level L1), and joins notes
// that were split at beat lines (tiedOut, then tiedIn on the same pitch in the
// next beat) back into one note. A tied note with nothing to join is cut at
// the beat line, or starts there as a new note.
//   placed: [{ index, beat, shift: [semitones per voice] | null, level: 0 | 1,
//             block?, signatures? }]   (M7: a signature block, see emi-form)
// offsetTicks: where beat 0 falls; by default, the first grouping keeps its
// place in the bar (a pickup on beat 4 starts three beats into bar 1).
function assemble(db, placed, { seed, source, form = null, offsetTicks = null }) {
  const beat = db.beatTicks;
  const first = db.groupings[placed[0].index];
  const offset = offsetTicks !== null ? offsetTicks : (first.beatInBar - 1) * beat;
  const barTicks = (db.meter[0] * beat * 4) / db.meter[1];
  const events = [];
  let open = {}; // voice -> event still tied over from the previous beat
  let lastBeat = null;
  const provenance = [];
  const fermatas = [];

  for (const { index, beat: at, shift, level = 0, block, signatures } of placed) {
    const g = db.groupings[index];
    const t0 = offset + at * beat;
    if (lastBeat === null || at !== lastBeat + 1) open = {};
    const entry = { tick: t0, work: g.work, beat: g.index, grouping: g.id, level };
    if (shift && shift.some((v) => v !== 0)) entry.shift = shift;
    if (block) entry.block = block;
    if (signatures) entry.signatures = signatures;
    provenance.push(entry);
    if (g.cadence) fermatas.push(t0);
    const tiedOver = {};
    for (const [on, sourcePitch, dur, voice, vel, tiedIn, tiedOut] of g.pieces) {
      const pitch = sourcePitch + (shift ? shift[voice - 1] : 0);
      const held = open[voice];
      let event;
      if (tiedIn && held && held[1] === pitch && held[0] + held[2] === t0 + on) {
        held[2] += dur;
        event = held;
      } else {
        event = [t0 + on, pitch, dur, voice, vel];
        events.push(event);
      }
      if (tiedOut) tiedOver[voice] = event;
    }
    open = tiedOver;
    lastBeat = at;
  }

  events.sort((a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1]);
  const end = offset + (placed[placed.length - 1].beat + 1) * beat;
  return {
    id: "emi-" + seed,
    title: null,
    source,
    seed,
    ppq: beat,
    meter: db.meter,
    tempoBpm: 100,
    key: db.mode === "minor" ? { tonic: 9, mode: "minor", from: "composed" } : { tonic: 0, mode: "major", from: "composed" },
    transposedBy: 0,
    voices: 4,
    voiceNames: ["Soprano", "Alto", "Tenor", "Bass"],
    padTicks: offset,
    fermatas,
    lengthTicks: Math.ceil(end / barTicks) * barTicks,
    events,
    provenance,
    form,
    warnings: [],
  };
}

// Facts about a composed piece, for status lines and tests.
function summary(piece) {
  const works = piece.provenance.map((p) => p.work);
  let longestRun = 1;
  let run = 1;
  for (let i = 1; i < works.length; i++) {
    run = works[i] === works[i - 1] ? run + 1 : 1;
    longestRun = Math.max(longestRun, run);
  }
  const relaxed = piece.provenance.filter((p) => p.level > 0).length;
  return { beats: works.length, sources: new Set(works).size, longestRun, relaxed };
}

exports.compose = compose;
exports.toEnd = toEnd;
exports.assemble = assemble;
exports.summary = summary;
