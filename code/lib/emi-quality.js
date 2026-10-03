"use strict";
// M8: quality reports for composed pieces.
//
// Quotation. Recombination should make new music, not copy old music, so two
// measures check how much of a piece is a source:
//   run     the longest run of beats taken in order from one chorale (a
//           signature block is such a run, on purpose; elsewhere the
//           different-source rule keeps runs short)
//   melody  the longest run of notes in one voice, pitch and rhythm, that
//           also occurs in that voice of one chorale (in C major / A minor).
//           Chorales share melodic formulas, so some overlap is normal;
//           what matters is that it stays short.
// quotes(db, piece) measures both; guard() says whether a piece is within
// the limits (LIMITS).
//
// Parallel fifths and octaves. Two voices moving the same way from a perfect
// fifth (or octave, or unison) to another one. Bach mostly avoids them, so
// they mark bad voice-leading. Voice-hooking carries the motion across seams
// as the source had it, so new ones are rare; parallels(piece) finds them all
// and marks those at seams (between beats from different chorales).

// Quotation limits, from the full corpus (see PLAN.md 4.6, as built in M8).
const LIMITS = { run: 8, melody: 16 };
const GRAM = 4; // notes: shorter matches aren't looked up

// Each voice of each work in the database as a list of notes, rebuilt from
// its groupings (tied pieces joined): voice -> [{ work, notes: [token] }],
// a token being "pitch/duration/gap before" so a match keeps rhythm too.
const linesCache = new WeakMap();
function corpusLines(db) {
  if (linesCache.has(db)) return linesCache.get(db);
  const lines = [[], [], [], []];
  const events = new Map(); // work -> its notes
  for (const template of db.templates) {
    const notes = eventsOfGroupings(db.groupings.slice(template.start, template.start + template.count).map((g) => [g, g.index * db.beatTicks]));
    events.set(template.work, notes);
    for (let v = 1; v <= 4; v++) lines[v - 1].push({ work: template.work, notes: tokens(notes.filter((e) => e[3] === v)) });
  }
  const index = lines.map((works) => {
    const map = new Map();
    works.forEach((line, w) => {
      for (let i = 0; i + GRAM <= line.notes.length; i++) {
        const key = line.notes.slice(i, i + GRAM).join(" ");
        if (!map.has(key)) map.set(key, []);
        map.get(key).push([w, i]);
      }
    });
    return map;
  });
  const result = { lines, index, events };
  linesCache.set(db, result);
  return result;
}

// Notes [on, pitch, dur, voice] from groupings placed at the given ticks,
// with tied pieces joined.
function eventsOfGroupings(list) {
  const events = [];
  const open = {};
  for (const [g, t0] of list) {
    for (const [on, pitch, dur, voice, , tiedIn] of g.pieces) {
      const held = open[voice];
      if (tiedIn && held && held[1] === pitch && held[0] + held[2] === t0 + on) held[2] += dur;
      else {
        const e = [t0 + on, pitch, dur, voice];
        events.push(e);
        open[voice] = e;
      }
    }
  }
  return events.sort((a, b) => a[0] - b[0] || a[3] - b[3]);
}

function tokens(notes) {
  return notes.map((e, i) => `${e[1]}/${e[2]}/${i ? e[0] - (notes[i - 1][0] + notes[i - 1][2]) : 0}`);
}

// The longest match of `line` (tokens) in the corpus lines of one voice:
// { notes, work, at } (at: the index in `line` where it starts).
function longestMatch(corpus, v, line, exclude = null) {
  let best = { notes: 0, work: null, at: -1 };
  for (let i = 0; i + GRAM <= line.length; i++) {
    for (const [w, j] of corpus.index[v].get(line.slice(i, i + GRAM).join(" ")) || []) {
      const source = corpus.lines[v][w];
      if (source.work === exclude) continue;
      let n = GRAM;
      while (i + n < line.length && j + n < source.notes.length && line[i + n] === source.notes[j + n]) n++;
      if (n > best.notes) best = { notes: n, work: source.work, at: i };
    }
  }
  return best;
}

// Quotation measures of a piece (from its events and provenance):
//   { run: { beats, work }, melody: { notes, voice, work } }
// exclude: a work not to compare with (to measure a chorale against the
// others).
function quotes(db, piece, { exclude = null } = {}) {
  const corpus = corpusLines(db);
  let melody = { notes: 0, voice: null, work: null };
  for (let v = 1; v <= 4; v++) {
    const line = tokens(piece.events.filter((e) => e[3] === v));
    const found = longestMatch(corpus, v - 1, line, exclude);
    if (found.notes > melody.notes) melody = { notes: found.notes, voice: v, work: found.work };
  }
  let run = { beats: piece.provenance && piece.provenance.length ? 1 : 0, work: null };
  const prov = piece.provenance || [];
  let length = 1;
  for (let k = 0; k < prov.length; k++) {
    if (k > 0 && prov[k].work === prov[k - 1].work && prov[k].beat === prov[k - 1].beat + 1 && prov[k].tick === prov[k - 1].tick + db.beatTicks) length++;
    else length = 1;
    if (length >= run.beats) run = { beats: length, work: prov[k].work };
  }
  return { run, melody };
}

// Whether a piece's quotation measures are within the limits.
function guard(db, piece, limits = LIMITS) {
  const q = quotes(db, piece);
  return { ok: q.run.beats <= limits.run && q.melody.notes <= limits.melody, quotes: q };
}

// Parallel fifths and octaves in a piece: [{ tick, from, voices: [a, b],
// interval: "5ths" | "8ves", seam, inherited }]. tick: where the second
// interval starts; from: where the first one does. seam: the two are in beats
// that don't follow each other in one chorale. inherited: a source chorale
// has the same motion at that point (Bach's own parallels), so only the
// others are new. seam and inherited need the piece's provenance, and
// inherited the database it came from.
function parallels(piece, { db = null } = {}) {
  const beatTicks = piece.ppq;
  const found = parallelsIn(piece.events);
  const prov = piece.provenance || [];
  const entryAt = (t) => {
    let found = null;
    for (const p of prov) if (p.tick <= t && t < p.tick + beatTicks) found = p;
    return found;
  };
  const isSeam = (t0, t1) => {
    const [a, b] = [entryAt(t0), entryAt(t1)];
    if (!a || !b || a === b) return false;
    return !(a.work === b.work && b.beat === a.beat + (b.tick - a.tick) / beatTicks);
  };
  // Does the source of entry p (its voices moved by its shift) have this
  // parallel, at the same place relative to the beat?
  const sourceHas = (p, par) => {
    if (!db || !p) return false;
    const notes = corpusLines(db).events.get(p.work);
    if (!notes) return false;
    const offset = p.beat * beatTicks - p.tick;
    const shifted = notes.map(([on, pitch, dur, voice]) => [on - offset, pitch + (p.shift ? p.shift[voice - 1] : 0), dur, voice]);
    return parallelsIn(shifted, [par.from, par.tick]).some((q) => q.voices[0] === par.voices[0] && q.voices[1] === par.voices[1]);
  };
  for (const par of found) {
    par.seam = isSeam(par.from, par.tick);
    // Any beat from the first chord to the second may hold the motion in its
    // source (a held chord's source has the chord before it too).
    const spanning = prov.filter((p) => p.tick + beatTicks > par.from && p.tick <= par.tick);
    par.inherited = spanning.some((p) => sourceHas(p, par));
  }
  return found;
}

// Parallels among notes [on, pitch, dur, voice]: between each two
// consecutive onset times (or only between the two given times).
function parallelsIn(events, only = null) {
  const times = only || [...new Set(events.map((e) => e[0]))].sort((a, b) => a - b);
  const byVoice = [1, 2, 3, 4].map((v) => events.filter((e) => e[3] === v));
  const sounding = (v, t) => {
    for (const e of byVoice[v - 1]) if (e[0] <= t && t < e[0] + e[2]) return e;
    return null;
  };
  const found = [];
  for (let k = 1; k < times.length; k++) {
    const [t0, t1] = [times[k - 1], times[k]];
    const notes0 = [1, 2, 3, 4].map((v) => sounding(v, t0));
    const notes1 = [1, 2, 3, 4].map((v) => sounding(v, t1));
    for (let a = 1; a <= 4; a++) {
      for (let b = a + 1; b <= 4; b++) {
        const [a0, a1, b0, b1] = [notes0[a - 1], notes1[a - 1], notes0[b - 1], notes1[b - 1]];
        if (!a0 || !a1 || !b0 || !b1 || a0 === a1 || b0 === b1) continue; // both voices must move...
        if (a0[0] + a0[2] < a1[0] || b0[0] + b0[2] < b1[0]) continue; // ...straight on, not after a rest
        const [pa0, pa1, pb0, pb1] = [a0[1], a1[1], b0[1], b1[1]];
        if (pa0 % 12 === pa1 % 12 || pb0 % 12 === pb1 % 12) continue; // ...to other notes, not by octaves
        if (Math.sign(pa1 - pa0) !== Math.sign(pb1 - pb0)) continue; // ...the same way
        const i0 = Math.abs(pa0 - pb0) % 12;
        const i1 = Math.abs(pa1 - pb1) % 12;
        if (i0 !== i1 || (i0 !== 7 && i0 !== 0)) continue;
        found.push({ tick: t1, from: t0, voices: [a, b], interval: i0 === 7 ? "5ths" : "8ves" });
      }
    }
  }
  return found;
}

exports.LIMITS = LIMITS;
exports.quotes = quotes;
exports.guard = guard;
exports.parallels = parallels;
exports.parallelsIn = parallelsIn;
exports.corpusLines = corpusLines;
exports.eventsOfGroupings = eventsOfGroupings;
