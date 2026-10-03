"use strict";
// M10: Emily's memory (Tier 2 of the Emily layer, PLAN §7). Music you
// *accept* (a piece, a stream phrase, or beats you select) becomes a work of
// her own, and the next corpus she composes from has it alongside Bach's:
// its beats, the joins between them, its form, and the notes she varied
// (emily-vary) are all new material. A work built from her own earlier
// works is a generation later: gen = 1 + the highest generation of the beats
// it is made of (Bach's beats are generation 0).
//
//   accepted file (the engine keeps it in ml_midi.emily.json next to the
//   taste): { version: 1, works: [work] }, every work ever accepted, in
//   order; her taste (emily-assoc's memory.accepted) lists the ones in use,
//   so a rollback can take works out and put them back exactly.
//   work: as emi-ingest makes them, plus { gen, from (the piece it came
//   from), what (in words), at, variants: [[tick, op]] }
//
// Snapshots: her whole taste (emily-assoc's memory: weights, pins, strength,
// ratings, novelty, mix, and which of her works are in use) at a moment.
// The engine takes one when a session starts (if anything changed since the
// last), when you ask, and before a rollback; a rollback makes a snapshot's
// taste hers again, exactly, and so her corpus too (the works it lists).
//   snapshots file (ml_midi.snapshots.json):
//   { version: 1, next, list: [{ id, at, label, memory }] }, the last KEEP

const KEEP = 30; // snapshots kept

function createSnapshots() {
  return { version: 1, next: 1, list: [] };
}

function normalizeSnapshots(file) {
  const out = createSnapshots();
  if (file && Array.isArray(file.list)) out.list = file.list.filter((s) => s && Number.isFinite(s.id) && s.memory && typeof s.memory === "object");
  out.next = Math.max(1, Number.isFinite(file && file.next) ? file.next : 1, ...out.list.map((s) => s.id + 1));
  return out;
}

// Adds a snapshot of memory (a deep copy) unless `onlyIfChanged` and the
// latest has the same taste; returns it, or null.
function snapshot(snapshots, memory, { label = "", at = null, onlyIfChanged = false } = {}) {
  const copy = JSON.parse(JSON.stringify(memory));
  const latest = snapshots.list[snapshots.list.length - 1];
  if (onlyIfChanged && latest && JSON.stringify(latest.memory) === JSON.stringify(copy)) return null;
  const entry = { id: snapshots.next++, at, label, memory: copy };
  snapshots.list.push(entry);
  if (snapshots.list.length > KEEP) snapshots.list.splice(0, snapshots.list.length - KEEP);
  return entry;
}

// The taste in snapshot `id` (a deep copy), or null.
function recall(snapshots, id) {
  const found = snapshots.list.find((s) => s.id === Number(id));
  return found ? JSON.parse(JSON.stringify(found.memory)) : null;
}

function createStore() {
  return { version: 1, works: [] };
}

function normalizeStore(store) {
  const out = createStore();
  if (store && Array.isArray(store.works)) out.works = store.works.filter((w) => w && typeof w.id === "string" && Array.isArray(w.events));
  return out;
}

// A region of a composed score (ticks from..to) as a work of Emily's own.
// score: untransposed, with provenance (and variants, if varied); db: the
// corpus it was composed from (for the generations of its beats).
function workOf(db, score, { from = -Infinity, to = Infinity, id, what = null, at = null } = {}) {
  const beat = score.ppq;
  const barTicks = (score.meter[0] * beat * 4) / score.meter[1];
  const notes = score.events.filter((e) => e[0] < to && e[0] + e[2] > from);
  if (!notes.length) return null;
  const first = Math.max(from, Math.min(...notes.map((e) => e[0])));
  const last = Math.min(to, Math.max(...notes.map((e) => e[0] + e[2])));
  const start = Math.floor(first / barTicks) * barTicks; // time 0 is a barline
  const events = notes
    .map(([on, pitch, dur, voice, vel]) => {
      const a = Math.max(on, first);
      const b = Math.min(on + dur, last);
      return [a - start, pitch, b - a, voice, vel];
    })
    .filter((e) => e[2] > 0);
  const inside = (tick) => tick >= first && tick < last;
  const gens = new Map(db.groupings.map((g) => [g.id, g.gen || 0]));
  const used = (score.provenance || []).filter((p) => inside(p.tick));
  const gen = 1 + Math.max(0, ...used.map((p) => gens.get(p.grouping) || 0));
  return {
    id,
    title: what,
    gen,
    from: score.id || null,
    what,
    at,
    ppq: beat,
    meter: score.meter.slice(),
    key: { tonic: score.key.tonic, mode: score.key.mode, from: "Emily" },
    transposedBy: 0,
    voices: 4,
    voiceNames: ["Soprano", "Alto", "Tenor", "Bass"],
    padTicks: first - start,
    fermatas: (score.fermatas || []).filter(inside).map((t) => t - start),
    lengthTicks: Math.ceil((last - start) / barTicks) * barTicks,
    events,
    warnings: [],
    variants: (score.variants || []).filter((v) => inside(v.tick)).map((v) => [v.tick - start, v.op]),
  };
}

// The works of hers that can join a corpus of these works: in use, in the
// same meter, and in a mode the corpus has.
function usable(store, accepted, corpusWorks) {
  if (!corpusWorks.length) return [];
  const meter = corpusWorks[0].meter.join("/");
  const modes = new Set(corpusWorks.map((w) => w.key && w.key.mode).filter(Boolean));
  const inUse = new Set(accepted);
  return store.works.filter((w) => inUse.has(w.id) && w.meter.join("/") === meter && (!modes.size || modes.has(w.key.mode)));
}

// Her works in a database, in numbers: { works, beats, varied, gens: Map(gen -> works) }.
function counts(db) {
  const own = db.works.filter((w) => w.gen);
  const gens = new Map();
  for (const w of own) gens.set(w.gen, (gens.get(w.gen) || 0) + 1);
  const beats = db.groupings.filter((g) => g.gen);
  return { works: own.length, beats: beats.length, varied: beats.filter((g) => g.variant).length, gens };
}

exports.KEEP = KEEP;
exports.createSnapshots = createSnapshots;
exports.normalizeSnapshots = normalizeSnapshots;
exports.snapshot = snapshot;
exports.recall = recall;
exports.createStore = createStore;
exports.normalizeStore = normalizeStore;
exports.workOf = workOf;
exports.usable = usable;
exports.counts = counts;
