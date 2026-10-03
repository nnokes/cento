"use strict";
// M8: provenance, where every beat of a composed piece came from, in words
// (for the piano roll's hover view) and as a record (written next to an
// exported .mid, so a piece can be traced and, later, rated beat by beat).
//
// Bars and beats are counted as in printed scores: a chorale's pickup is bar
// 0, its first full bar bar 1.

const signatures = require("emi-signatures");
const quality = require("emi-quality");

const VOICES = ["soprano", "alto", "tenor", "bass"];

const beatsPerBar = (db) => Math.round((db.meter[0] * 4) / db.meter[1]);

// Where grouping g sits in its chorale: { bar, beat }.
function placeOf(db, g) {
  const work = db.works.find((w) => w.id === g.work);
  const bpb = beatsPerBar(db);
  return { bar: Math.floor(g.index / bpb) + (work && work.pickup ? 0 : 1), beat: (g.index % bpb) + 1 };
}

// One provenance entry in words, e.g.
// "bwv260, bar 4 beat 2 · P · octaves moved · signature soprano 3-2-1".
function describeBeat(db, entry, groupings = new Map(db.groupings.map((g) => [g.id, g]))) {
  const g = groupings.get(entry.grouping);
  if (!g) return entry.work;
  const { bar, beat } = placeOf(db, g);
  const parts = [`${g.work}, bar ${bar} beat ${beat}`];
  if (g.speac) parts.push(g.speac.beat);
  if (entry.shift && entry.shift.some((v) => v !== 0)) {
    const moved = entry.shift.map((v, i) => (v ? `${VOICES[i]} ${v > 0 ? "up" : "down"} ${Math.abs(v / 12)} oct.` : null)).filter(Boolean);
    parts.push(moved.join(", "));
  }
  if (entry.block) parts.push("signature block");
  if (entry.signatures && entry.signatures.length) parts.push(nameOf(db, entry.signatures[0]));
  if (entry.variant && entry.variant.length) parts.push("varied: " + entry.variant.join(", ")); // M10 (emily-vary)
  if (g.gen) parts.push("Emily's own, generation " + g.gen + (g.variant ? " (her " + g.variant.join(", ") + ")" : "")); // M10 (emily-memory)
  return parts.join(" · ");
}

function nameOf(db, id) {
  const found = (db.signatures || []).find((s) => s.id === id);
  return found ? signatures.describe(found, db.mode) : id;
}

// The record of a composed piece, as written next to its .mid:
//   { piece, source, seed, key, meter, ppq, form, settings, corpus,
//     quotes, parallels, beats: [{ tick, grouping, work, bar, beat, speac,
//     level, shift?, block?, signatures? }] }
function record(db, piece, settings = {}) {
  const groupings = new Map(db.groupings.map((g) => [g.id, g]));
  const q = quality.quotes(db, piece);
  const found = quality.parallels(piece, { db });
  return {
    piece: piece.id,
    source: piece.source,
    seed: piece.seed,
    key: piece.key,
    meter: piece.meter,
    ppq: piece.ppq,
    form: piece.form,
    settings,
    corpus: { works: db.works.length, mode: db.mode, version: db.version, signatures: (db.signatures || []).length },
    quotes: {
      melody: { notes: q.melody.notes, voice: VOICES[q.melody.voice - 1] || null, work: q.melody.work },
      run: { beats: q.run.beats, work: q.run.work },
      limits: quality.LIMITS,
    },
    parallels: found.map((p) => ({ tick: p.tick, from: p.from, voices: p.voices.map((v) => VOICES[v - 1]), interval: p.interval, new: !p.inherited })),
    beats: (piece.provenance || []).map((entry) => {
      const g = groupings.get(entry.grouping);
      const out = { tick: entry.tick, grouping: entry.grouping, work: entry.work };
      if (g) Object.assign(out, placeOf(db, g), { speac: g.speac ? g.speac.beat : null });
      out.level = entry.level || 0;
      if (entry.shift) out.shift = entry.shift;
      if (entry.block) out.block = entry.block;
      if (entry.signatures) out.signatures = entry.signatures.map((id) => nameOf(db, id));
      if (entry.variant) out.variant = entry.variant;
      return out;
    }),
  };
}

exports.placeOf = placeOf;
exports.describeBeat = describeBeat;
exports.record = record;
