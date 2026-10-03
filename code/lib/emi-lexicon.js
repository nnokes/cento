"use strict";
// The lexicon: every grouping of every work, indexed by how it starts, at two
// match levels:
//   L0  exact pitches per voice, including which voices are held over (see
//       entryKey in emi-segment): "67,64,~60,48"
//   L1  the upper voices by pitch class, the bass exactly, held or not:
//       "7,4,0,48". A grouping found this way is moved by octaves, voice by
//       voice, so it starts exactly where the previous beat's voices went; a
//       tie may become a repeated note, or the reverse (emi-form).
//
// db = {
//   version, beatTicks, meter, matchLevels: ["L0", "L1"],
//   mode: "major" | "minor" | "mixed"   (the works' modes; all in C major / A minor)
//   works: [{ id, title, key, transposedBy, groupings, pickup, mode }],
//   groupings: [grouping],            // see emi-segment, plus (M6) tension and
//                                     // speac: { beat, bar, phrase } labels (emi-speac),
//                                     // and (M8) mode: its work's mode; area: its key
//                                     // area ("7:major": G major); accidentals ("6": F#), see areas()
//   lexicon:  { L0 key: [grouping index] },
//   lexicon1: { L1 key: [grouping index] },
//   templates: [{ work, start, count }], // each work's groupings, in order: its form (emi-form)
//   ranges: [[lowest, highest] per voice],
//   openings: [grouping index], finals: [grouping index],
//   signatures: [signature]           // (M7) cadence patterns found in many works (emi-signatures)
// }
//
// M10: works may also be Emily's own, accepted from her output
// (emily-memory): such a work has gen (its generation, 1 or more) and
// variants ([[tick, op]]: notes she varied). Its groupings carry gen, and
// variant (the ops) where a varied note falls in them; db.works entries
// carry gen too. Signatures are found in Bach's works alone, so hers never
// change his; patterns that recur across her own works and aren't Bach's
// are her own signatures (emily: true, ids "esig1", ...).
// Plain JSON, so a database can be saved and loaded later.

const ingest = require("emi-ingest");
const { segment } = require("emi-segment");
const speac = require("emi-speac");
const signatures = require("emi-signatures");
const keys = require("emi-key");

// Keys are lists of voice tokens: "60" (a new note), "~60" (held over) or "r"
// (silent), joined by ",". These parse and rebuild them.
function parseKey(key) {
  return key.split(",").map((t) => (t === "r" ? null : { held: t[0] === "~", pitch: Number(t.replace("~", "")) }));
}

function keyOf(tokens) {
  return tokens.map((t) => (t ? (t.held ? "~" : "") + t.pitch : "r")).join(",");
}

// The L1 key of a list of tokens: upper voices as pitch classes, the bass
// (the last voice) exactly, without the held marks.
function l1Key(tokens) {
  const bass = tokens.length - 1;
  return tokens.map((t, v) => (t ? String(v === bass ? t.pitch : t.pitch % 12) : "r")).join(",");
}

// works: as read (any key); each is moved to C major / A minor first.
function build(works) {
  if (!works.length) throw new Error("no works to build a lexicon from");
  const meters = new Set(works.map((w) => w.meter.join("/")));
  if (meters.size > 1) throw new Error("works must share one meter, found " + [...meters].join(", "));

  const db = {
    version: 3,
    beatTicks: works[0].ppq,
    meter: works[0].meter,
    matchLevels: ["L0", "L1"],
    mode: null,
    works: [],
    groupings: [],
    lexicon: {},
    lexicon1: {},
    templates: [],
    ranges: [],
    openings: [],
    finals: [],
    signatures: [],
  };
  const modes = new Set();
  const normalized = [];
  for (const work of works) {
    const inC = ingest.normalize(work);
    normalized.push(inC);
    modes.add(inC.key.mode);
    const groupings = segment(inC, db.beatTicks);
    for (const g of groupings) g.mode = inC.key.mode; // M8: a mixed corpus composes each piece in one mode
    if (work.gen) {
      for (const g of groupings) {
        g.gen = work.gen;
        const ops = (work.variants || []).filter(([tick]) => tick >= g.index * db.beatTicks && tick < (g.index + 1) * db.beatTicks).map(([, op]) => op);
        if (ops.length) g.variant = ops;
      }
    }
    areas(inC, groupings, db.beatTicks);
    const beatsPerBar = Math.round((db.meter[0] * 4) / db.meter[1]);
    speac.analyze(groupings, beatsPerBar).forEach(({ tension, beat, bar, phrase }, k) => {
      groupings[k].tension = tension;
      groupings[k].speac = { beat, bar, phrase };
    });
    db.works.push({ id: work.id, title: work.title, key: work.key, transposedBy: inC.transposedBy, groupings: groupings.length, pickup: (work.padTicks || 0) > 0, mode: inC.key.mode, gen: work.gen || 0 });
    if (groupings.length) db.templates.push({ work: work.id, start: db.groupings.length, count: groupings.length });
    for (const g of groupings) {
      const i = db.groupings.length;
      db.groupings.push(g);
      (db.lexicon[g.entryKey] = db.lexicon[g.entryKey] || []).push(i);
      const loose = l1Key(parseKey(g.entryKey));
      (db.lexicon1[loose] = db.lexicon1[loose] || []).push(i);
      if (g.opening) db.openings.push(i);
      if (g.final) db.finals.push(i);
      for (const [, pitch, , voice] of g.pieces) {
        const range = (db.ranges[voice - 1] = db.ranges[voice - 1] || [pitch, pitch]);
        range[0] = Math.min(range[0], pitch);
        range[1] = Math.max(range[1], pitch);
      }
    }
  }
  db.mode = modes.size === 1 ? [...modes][0] : "mixed";
  const own = normalized.filter((w, i) => works[i].gen);
  db.signatures = signatures.detect(db, own.length ? normalized.filter((w, i) => !works[i].gen) : normalized);
  if (own.length >= 3) {
    const pattern = (sig) => `${sig.mode}:${sig.voice}:${sig.intervals.join(",")}`;
    const bach = new Set(db.signatures.map(pattern));
    const hers = signatures.detect(db, own).filter((sig) => !bach.has(pattern(sig)));
    hers.forEach((sig, i) => {
      sig.id = "esig" + (i + 1);
      sig.emily = true;
    });
    db.signatures.push(...hers);
  }
  return db;
}

// M8: each grouping's accidentals (its notes outside the scale) and key
// area, the key its music is in around it (two
// bars, from the beat before the grouping's bar to the beat after the next),
// by Krumhansl-Schmuckler key finding: "7:major" for G major, in the work's
// C major / A minor. Where a chorale modulates (to G with its F#, to A minor
// with its G#), its beats carry the new key and its accidentals; forms
// prefer beats with the template's accidentals, then its key area
// (emi-form), so pieces modulate where their templates do.
function areas(work, groupings, beatTicks) {
  const reach = 4 * beatTicks;
  // The notes by onset, so each beat looks only at the notes near it, not at
  // every note of the work: a note starting more than the longest note's
  // length before the window can't reach into it. The same notes, so the
  // same keys (the key estimate only sums durations).
  const notes = work.events.slice().sort((a, b) => a[0] - b[0]);
  const longest = notes.reduce((most, e) => Math.max(most, e[2]), 0);
  for (const g of groupings) {
    const from = g.index * beatTicks - reach;
    const to = (g.index + 1) * beatTicks + reach;
    const window = [];
    let lo = 0;
    let hi = notes.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (notes[mid][0] < from - longest) lo = mid + 1;
      else hi = mid;
    }
    for (let k = lo; k < notes.length && notes[k][0] < to; k++) {
      const [on, pitch, dur] = notes[k];
      const start = Math.max(on, from);
      const end = Math.min(on + dur, to);
      if (end > start) window.push([start, pitch, end - start]);
    }
    const key = keys.estimate(window);
    g.area = key.tonic + ":" + key.mode;
    // Its own notes outside the work's scale (C major, or A natural minor):
    // "6" for an F#, "6,8" for F# and G#; "" for none.
    const scale = work.key.mode === "minor" ? MINOR_SCALE : MAJOR_SCALE;
    g.accidentals = [...new Set(g.pieces.map((p) => p[1] % 12).filter((pc) => !scale.has(pc)))].sort((a, b) => a - b).join(",");
  }
}
const MAJOR_SCALE = new Set([0, 2, 4, 5, 7, 9, 11]);
const MINOR_SCALE = new Set([9, 11, 0, 2, 4, 5, 7]);

// For each grouping that has a continuation: how many groupings from OTHER
// works start where it goes, at L0 and at L1. Zero means a dead end for the
// different-source rule (unless the next beat is a pure continuation).
function stats(db) {
  let withDest = 0;
  let deadEnds = 0;
  let deadEnds1 = 0;
  let choices = 0;
  for (const g of db.groupings) {
    if (g.destKey === null) continue;
    withDest++;
    const others = (list) => (list || []).filter((i) => db.groupings[i].work !== g.work).length;
    const exact = others(db.lexicon[g.destKey]);
    if (exact === 0) deadEnds++;
    if (others(db.lexicon1[l1Key(parseKey(g.destKey))]) === 0) deadEnds1++;
    choices += exact;
  }
  return {
    works: db.works.length,
    groupings: db.groupings.length,
    keys: Object.keys(db.lexicon).length,
    deadEndShare: withDest ? deadEnds / withDest : 0,
    deadEndShareL1: withDest ? deadEnds1 / withDest : 0,
    meanChoices: withDest ? choices / withDest : 0,
  };
}

exports.build = build;
exports.stats = stats;
exports.parseKey = parseKey;
exports.keyOf = keyOf;
exports.l1Key = l1Key;
