"use strict";
// M7: signatures (David Cope, Computer Models of Musical Creativity, ch. 7;
// Experiments in Musical Intelligence). A signature is a short melodic
// pattern, the intervals of a few notes in one voice, that recurs across
// many works of a style: in Bach's chorales, mostly the way voices move into
// a cadence (the soprano's 3-2-1, the bass's 4-5-1). Kept whole in new music,
// signatures make it sound like its style.
//
// Detection works per voice on intervals, so a pattern is the same in any
// key. A pattern ending on a cadence (fermata) chord in at least `minWorks`
// different works (by default 5% of the works, and at least 3) is a
// signature. Major and minor works are counted apart (M8: a corpus may have
// both), so each signature belongs to one mode. Each occurrence is a block of consecutive
// groupings of its work, from the beat of the pattern's first note to the
// cadence beat; composing pins whole blocks at cadences (emi-form).
//
//   signatures = detect(db, works, { notes, minWorks })
//   [{ id, voice, intervals, finalPc, mode, works, occurrences: [{ work, start, end, beats }] }]
// sorted strongest (most works) first; start and end index db.groupings.
// describe(signature, mode) names it in scale degrees, e.g. "soprano 3-2-1".
// blocks(db) lists each block once, with the signatures it carries.

const VOICES = ["soprano", "alto", "tenor", "bass"];
const DEGREES = { 0: "1", 1: "b2", 2: "2", 3: "b3", 4: "3", 5: "4", 6: "#4", 7: "5", 8: "b6", 9: "6", 10: "b7", 11: "7" };

// works: the works the lexicon was built from, in C major / A minor, with
// db.templates in the same order (one per work with groupings).
function detect(db, works, { notes = 3, minWorks = null } = {}) {
  const inMode = new Map(); // mode -> how many works
  for (const work of works) inMode.set(work.key.mode, (inMode.get(work.key.mode) || 0) + 1);
  const threshold = (mode) => (minWorks !== null ? minWorks : Math.max(3, Math.ceil(inMode.get(mode) * 0.05)));
  const byKey = new Map();
  works.forEach((work) => {
    const mode = work.key.mode;
    const template = db.templates.find((t) => t.work === work.id);
    if (!template) return;
    const groupings = db.groupings.slice(template.start, template.start + template.count);
    const dbIndexOfBeat = new Map(groupings.map((g, k) => [g.index, template.start + k]));
    for (let voice = 1; voice <= 4; voice++) {
      const line = work.events.filter((e) => e[3] === voice);
      groupings.forEach((g, k) => {
        if (!g.cadence) return;
        const at = g.index * db.beatTicks;
        const last = line.findIndex((e) => e[0] <= at && at < e[0] + e[2]);
        if (last < notes - 1) return;
        const pattern = line.slice(last - notes + 1, last + 1);
        const startBeat = Math.floor(pattern[0][0] / db.beatTicks);
        const start = dbIndexOfBeat.get(startBeat);
        const end = template.start + k;
        if (start === undefined || end - start !== g.index - startBeat) return; // a silent beat inside
        const intervals = pattern.slice(1).map((e, i) => e[1] - pattern[i][1]);
        if (intervals.every((step) => step === 0)) return; // a repeated note is no pattern
        const key = mode + ":" + voice + ":" + intervals.join(",");
        if (!byKey.has(key)) byKey.set(key, { mode, voice, intervals, occurrences: [], finals: new Map() });
        const entry = byKey.get(key);
        entry.occurrences.push({ work: work.id, start, end, beats: end - start + 1 });
        const pc = pattern[pattern.length - 1][1] % 12;
        entry.finals.set(pc, (entry.finals.get(pc) || 0) + 1);
      });
    }
  });
  const signatures = [];
  for (const entry of byKey.values()) {
    const workCount = new Set(entry.occurrences.map((o) => o.work)).size;
    if (workCount < threshold(entry.mode)) continue;
    const finalPc = [...entry.finals.entries()].sort((a, b) => b[1] - a[1])[0][0];
    signatures.push({ voice: entry.voice, intervals: entry.intervals, finalPc, mode: entry.mode, works: workCount, occurrences: entry.occurrences });
  }
  signatures.sort((a, b) => b.works - a.works || a.voice - b.voice || a.intervals.join().localeCompare(b.intervals.join()));
  signatures.forEach((s, i) => (s.id = "sig" + (i + 1)));
  return signatures;
}

// "soprano 3-2-1": the pattern's notes as scale degrees of C major (or A
// minor: the signature's own mode, or else `mode`), ending on its most
// common final note.
function describe(signature, mode = "major") {
  const tonic = (signature.mode || mode) === "minor" ? 9 : 0;
  const pcs = [signature.finalPc];
  for (let i = signature.intervals.length - 1; i >= 0; i--) pcs.unshift(pcs[0] - signature.intervals[i]);
  return VOICES[signature.voice - 1] + " " + pcs.map((pc) => DEGREES[(((pc - tonic) % 12) + 12) % 12]).join("-");
}

// Every signature block of a database once (several voices' signatures often
// end on the same cadence over the same beats), with the signatures it
// carries: [{ work, start, end, sigs: [id], outer, strength }]. The outer
// voices' signatures come first (the soprano's and the bass's: what a
// listener hears first), the strongest first, then the inner voices';
// outer: it carries a soprano or bass signature; strength: in how many works
// the strongest of those occurs.
// Computed once per database.
const blockCache = new WeakMap();
function blocks(db) {
  if (blockCache.has(db)) return blockCache.get(db);
  const byRange = new Map();
  for (const signature of db.signatures || []) {
    for (const o of signature.occurrences) {
      const key = o.start + "-" + o.end;
      if (!byRange.has(key)) byRange.set(key, { work: o.work, start: o.start, end: o.end, sigs: [] });
      const block = byRange.get(key);
      if (!block.sigs.includes(signature.id)) block.sigs.push(signature.id);
    }
  }
  const isOuter = (sig) => sig.voice === 1 || sig.voice === 4;
  const rank = new Map((db.signatures || []).map((sig, i) => [sig.id, (isOuter(sig) ? 0 : 100000) + i])); // signatures are strongest first
  const list = [...byRange.values()].sort((a, b) => a.start - b.start || a.end - b.end);
  const byId = new Map((db.signatures || []).map((sig) => [sig.id, sig]));
  for (const block of list) {
    block.sigs.sort((a, b) => rank.get(a) - rank.get(b));
    const outer = block.sigs.map((id) => byId.get(id)).filter(isOuter);
    block.outer = outer.length > 0;
    block.strength = Math.max(0, ...outer.map((sig) => sig.works));
  }
  blockCache.set(db, list);
  return list;
}

// The block that runs from grouping `start` to grouping `end`, or null.
function blockAt(db, start, end) {
  return blocks(db).find((b) => b.start === start && b.end === end) || null;
}

exports.detect = detect;
exports.blocks = blocks;
exports.blockAt = blockAt;
exports.describe = describe;
exports.VOICES = VOICES;
