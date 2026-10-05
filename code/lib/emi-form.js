"use strict";
// M3: composing to a form. A *template* is a real chorale's plan, beat by
// beat: where each beat falls in the bar, where its phrases cadence (its
// fermata beats) and on which bass note, where it rests, and where it ends. A
// new piece fills the template's slots with groupings from the lexicon:
//   - the first slot takes a grouping that opened a work, a slot after a rest
//     one that followed a rest, and the last slot one that ended a work;
//   - a cadence slot takes a cadence grouping on the same bass pitch class,
//     and every other slot a non-cadence grouping, so the piece cadences where
//     the template does and nowhere else;
//   - each slot takes a grouping with the template beat's SPEAC label (M6,
//     emi-speac): a preparation where the template prepares, an antecedent
//     where it builds up, and so on;
//   - metre, voice-hooking and the different-source rule as in M2;
//   - (M8) in a corpus of major and minor chorales, each slot takes a
//     grouping of the template's mode, so a piece is all major or all minor.
// The seed picks the template. If it can't be filled, the rules relax one
// step at a time (RELAX below), and only then is the next template tried:
//   0  strict: every hook exact (L0), every SPEAC label matched (skipped
//      when step 1 can keep more signatures, M7)
//   1  every hook exact; SPEAC labels preferred, not required (Cope's "soft
//      constraint"): groupings with the template's label are tried first
//   2  L1 hooks too: a grouping's upper voices move by octaves so each starts
//      exactly where the previous beat's voice went (see emi-lexicon), as long
//      as every voice stays in its range and no voices cross that didn't
//      before; exact hooks still come first
//   3  as 2, and a cadence may stand on any bass note
// On the full corpus 98 pieces in 100 keep exact voice-leading throughout
// (95 without signatures), and 56% of beats keep their template beat's label
// (62% without signatures, 33% by chance without SPEAC).
//
// M7: signatures (emi-signatures). A cadence slot may take a whole
// *signature block*: the beats of a real chorale from a signature's first
// note to its cadence (soprano 3-2-1 over bass 4-5-1, say), kept as they are:
// one work, its labels, no different-source rule inside it. The block's first
// beat hooks to the beat before it like any other, so the search must choose
// that beat with the block in view (Cope's lookahead hooking). Blocks come
// from works other than the template's, and pieces take as many as their
// voice-leading allows: on the full corpus, 91% of cadences.
//
// M8: repetition. 77 of the 142 major chorales repeat a phrase of their
// melody, most often the opening pair (the hymn tune's bar form, A A B).
// Where the template repeats a phrase, the piece repeats its own: the
// search first tries the phrase it already composed there, if that hooks
// exactly to the beat before and can lead on; otherwise it composes the
// phrase afresh (markRepeats, fill).
//
// Before searching, a backward pass over the template finds, for every slot,
// the groupings from which the rest of the template can still be filled, and
// how many signature blocks can still be placed after each. The search only
// enters those, most blocks first, so it rarely backtracks.

const rng = require("emi-rng");
const lexicon = require("emi-lexicon");
const signatures = require("emi-signatures");
const quality = require("emi-quality");
const speac = require("emi-speac");
const { assemble } = require("emi-compose");

// A signature block is *strong* when its strongest soprano or bass
// signature is found in at least this share of the works that the corpus's
// strongest signature is found in (on the 142 major chorales: bass 4-5-1,
// soprano 3-2-1 and bass 5-5-1). See byBlocks in fill.
const STRONG = 0.5;

const RELAX = [
  { level: 0, speac: true, cadenceBass: true },
  { level: 0, speac: "prefer", cadenceBass: true },
  { level: 1, speac: "prefer", cadenceBass: true },
  { level: 1, speac: "prefer", cadenceBass: false },
];

// A template's slots, one per beat from its first sounding beat to its last:
//   { rest: true }                                    a silent beat
//   { beatInBar, cadence, bass, speac, first, afterRest, last, newNotes, mode }
// bass is the pitch class a cadence slot's chord must stand on (null
// elsewhere, and everywhere when cadenceBass is false); speac is the beat
// label a grouping must have (null when speac is false); mode is the
// template's mode in a mixed corpus (null otherwise). newNotes is the
// template's own beat's (0: a held chord); emi-stream splits phrases with it.
// A slot may also be marked needsExit (emi-stream): its grouping must have
// somewhere to go next.
function slotsOf(db, template, { cadenceBass = true, speac = true } = {}) {
  const slots = [];
  const work = db.works.find((w) => w.id === template.work);
  const mode = db.mode === "mixed" && work ? work.mode : null;
  // The template melody's range (M8): pieces keep their soprano within it.
  const sopranoRange = [Infinity, -Infinity];
  for (let k = 0; k < template.count; k++) {
    for (const p of db.groupings[template.start + k].pieces) {
      if (p[3] !== 1) continue;
      sopranoRange[0] = Math.min(sopranoRange[0], p[1]);
      sopranoRange[1] = Math.max(sopranoRange[1], p[1]);
    }
  }
  for (let k = 0; k < template.count; k++) {
    const g = db.groupings[template.start + k];
    if (k > 0) {
      const prev = db.groupings[template.start + k - 1];
      for (let gap = prev.index + 1; gap < g.index; gap++) slots.push({ rest: true });
    }
    slots.push({
      rest: false,
      beatInBar: g.beatInBar,
      cadence: g.cadence,
      bass: cadenceBass && g.cadence && g.bass !== null ? g.bass % 12 : null,
      speac: speac && g.speac ? g.speac.beat : null,
      speacHard: speac !== "prefer",
      first: k === 0,
      afterRest: k > 0 && g.restBefore,
      last: k === template.count - 1,
      newNotes: g.newNotes,
      mode,
      area: g.area || null,
      sopranoRange: sopranoRange[0] <= sopranoRange[1] ? sopranoRange : null,
      accidentals: g.accidentals !== undefined ? g.accidentals : null,
    });
  }
  return slots;
}

// May grouping g fill this slot, leaving aside how it joins its neighbors?
// labels: false for a signature block's grouping, which keeps its own label.
function fits(g, slot, labels = true) {
  if (g.beatInBar !== slot.beatInBar || g.cadence !== slot.cadence) return false;
  if (slot.mode && g.mode !== slot.mode) return false;
  if (slot.bass !== null && (g.bass === null || g.bass % 12 !== slot.bass)) return false;
  if (labels && slot.speac && slot.speacHard !== false && (!g.speac || g.speac.beat !== slot.speac)) return false;
  if (slot.first && !g.opening) return false;
  if (slot.afterRest && !g.restBefore) return false;
  if (slot.last && !g.final) return false;
  return true;
}

// A repeated phrase's beat (M8) fits its slot as its original did: a literal
// repeat, so labels, how phrases start and the cadence's bass don't count
// (Bach sometimes harmonized a repeat afresh).
const fitsRepeat = (g, slot) => fits(g, { ...slot, first: false, afterRest: false, bass: null }, false);

const sourceOk = (from, to) => to.work !== from.work || to.newNotes === 0;

// For each grouping, the groupings that may follow it at L0 and at L1: metre
// and the different-source rule included; repeats, ranges and octaves not.
// Computed once per database.
const graphCache = new WeakMap();
function successors(db) {
  if (graphCache.has(db)) return graphCache.get(db);
  const beatsPerBar = (db.meter[0] * 4) / db.meter[1];
  const graph = (index, keyOf) =>
    db.groupings.map((g) => {
      if (g.destKey === null) return [];
      const next = (g.beatInBar % beatsPerBar) + 1;
      return (index[keyOf(g.destKey)] || []).filter((i) => db.groupings[i].beatInBar === next && sourceOk(g, db.groupings[i]));
    });
  const result = [graph(db.lexicon, (key) => key), graph(db.lexicon1, (key) => lexicon.l1Key(lexicon.parseKey(key)))];
  graphCache.set(db, result);
  return result;
}

// The signature blocks that may end at each cadence slot (M7): those that
// carry a soprano or bass signature, the formulas a listener hears (an inner
// voice's pattern alone isn't kept). A block of L groupings may stand on
// slots s-L+1..s when none of them is silent and each of its groupings fits
// its slot (labels aside). Returns, per slot, the
// groupings that may start, continue or end a block there:
//   pins[s] = { start: Map(i -> the block's strength), inner: Set, end: Map(i -> strength) } | null
// or null when no cadence can take a block. avoid: a work whose blocks are
// left out (the template's own).
function pinsFor(db, slots, avoid = null) {
  const all = signatures.blocks(db);
  if (!all.length) return null;
  const pins = slots.map(() => null);
  const at = (s) => (pins[s] = pins[s] || { start: new Map(), inner: new Set(), end: new Map() });
  let any = false;
  slots.forEach((slot, s) => {
    if (slot.rest || !slot.cadence) return;
    // A repeat starting within three beats: the beats before it must lead
    // into it, so they stay free (M8: a repeat comes before a signature).
    for (let t = s + 1; t <= s + 3 && t < slots.length && !slots[t].rest; t++) if (slots[t].repeat && slots[t].repeat.first) return;
    for (const block of all) {
      if (!block.outer || block.work === avoid || !fits(db.groupings[block.end], slot, false)) continue;
      const first = s - (block.end - block.start);
      if (first < 0) continue;
      let ok = true;
      for (let t = first; t < s && ok; t++) ok = !slots[t].rest && fits(db.groupings[block.start + t - first], slots[t], false);
      if (!ok) continue;
      const starts = at(first).start;
      starts.set(block.start, Math.max(starts.get(block.start) || 0, block.strength));
      for (let t = first + 1; t < s; t++) at(t).inner.add(block.start + t - first);
      const ends = at(s).end;
      ends.set(block.end, Math.max(ends.get(block.end) || 0, block.strength));
      any = true;
    }
  });
  return any ? pins : null;
}

// The backward pass. For every slot s and grouping i, the best score the
// rest of the template can still reach from slot s on with grouping i there,
// or -1 if it can't be filled after it (rest slots have no rows). The score
// counts signature blocks (PIN each) and, below them (M8), beats with their
// template beat's accidentals (where Bach's chorale has an F#, a beat with
// that F#) and beats whose soprano stays within the template melody's range.
// The search follows the best scores, so it prepares modulations beats
// ahead, as the template does, and keeps the melody in its compass:
//   best[s][i]   i hooks to what comes before it (as any grouping, or as the
//                first of a block)
//   free[s][i]   the same, as a grouping outside any block
//   cont[s][i]   i continues the block of the grouping before it (null
//                where no block can be)
//   roles[s]     Map(i -> { start, inner, end }): i as the first, a middle
//                or the last grouping of a block (only where blocks can be)
// next: one of the successor graphs; pins: from pinsFor, or null.
// The score's weights. A signature block outweighs everything else together;
// a strong one (STRONG) scores a little more. Then, per beat: the template
// beat's accidentals, its SPEAC label (where labels are preferred, not
// required), a soprano within the template melody's range, and a small
// seeded random amount, so that each seed has its own best path and
// different seeds give different pieces.
//
// M9: Emily's taste (emily-assoc) adds each beat's taste, a liked
// transition's where two beats join, and a liked signature's where its block
// ends; each at most TASTE_MAX either way, so taste chooses among the valid
// beats and blocks but never outweighs a block. With a taste, a beat's SPEAC
// label counts double (tasteLabel), so taste rarely pulls beats off their
// template beat's labels (on the full corpus, 59% of beats keep them after
// ten ratings, against 61% without a taste; 47% if labels count as before). (Taste is offset by
// TASTE_MAX, so scores stay positive: every way through the template has the
// same number of beats and joins, so the offset changes no choice.) The
// temperature scales the random amounts: 0, none (the best liked path); 1,
// as before M9; higher, more adventurous.
//
// M10: in a corpus with Emily's own music (emily-memory), mix (0..0.75)
// says how much her beats count against Bach's: 0.5 as much, more above
// (up to MIX_POINTS a beat at 0.75), less below. (At mix 0 the engine leaves
// her music out of the corpus altogether.) Her forms move forward or back
// in the same way when the form is chosen.
const PIN = 1 << 20;
const SCORE = { strong: 16, blockChance: 48, accidentals: 16, label: 4, tasteLabel: 8, range: 4, chance: 8 };
const TASTE_MAX = 64;
const MIX_POINTS = 8;
const mixPoints = (mix) => Math.max(-2 * MIX_POINTS, Math.min(2 * MIX_POINTS, Math.round((MIX_POINTS * (mix - 0.5)) / 0.25)));
const clampTaste = (v) => Math.max(-TASTE_MAX, Math.min(TASTE_MAX, v));

// Each grouping's lowest and highest soprano note (computed once per database).
const sopranoCache = new WeakMap();
function sopranoOf(db) {
  if (!sopranoCache.has(db)) {
    const low = new Int16Array(db.groupings.length).fill(999);
    const high = new Int16Array(db.groupings.length).fill(-999);
    db.groupings.forEach((g, i) => {
      for (const p of g.pieces) {
        if (p[3] !== 1) continue;
        low[i] = Math.min(low[i], p[1]);
        high[i] = Math.max(high[i], p[1]);
      }
    });
    sopranoCache.set(db, { low, high });
  }
  return sopranoCache.get(db);
}

function feasible(db, slots, next, pins = null, noise = 0, { taste = null, temperature = 1, mix = null } = {}) {
  const n = db.groupings.length;
  const hers = mix === null ? 0 : mixPoints(mix); // Emily's own beats, against Bach's (offset by 2 * MIX_POINTS)
  const beatTaste = taste ? taste.beat : null;
  const edges = taste ? taste.edges : null;
  const blockEnd = taste ? taste.blockEnd : null;
  const soprano = sopranoOf(db);
  const strongest = db.signatures && db.signatures.length ? db.signatures[0].works : 0;
  const plan = { best: [], free: [], cont: [], roles: [] };
  let later = null; // the best row of the next non-rest slot
  let laterCont = null;
  let laterMost = -1;
  let restBetween = false;
  for (let s = slots.length - 1; s >= 0; s--) {
    const slot = slots[s];
    if (slot.rest) {
      restBetween = true;
      continue;
    }
    // The most blocks after slot s, with i at s and the next slot hooked to it.
    const open = (i) => {
      if (slot.needsExit && !next[i].length) return -1;
      if (!later) return 0;
      if (restBetween) return laterMost;
      let most = -1;
      const liked = edges && edges.get(i);
      if (liked) {
        for (const j of next[i]) if (later[j] >= 0) most = Math.max(most, later[j] + TASTE_MAX + clampTaste(liked.get(j) || 0));
        return most;
      }
      for (const j of next[i]) if (later[j] > most) most = later[j];
      return most >= 0 && edges ? most + TASTE_MAX : most;
    };
    // What a beat scores here (see SCORE).
    const color = slot.accidentals ? slot.accidentals : null;
    const range = slot.sopranoRange || null;
    const label = slot.speac && slot.speacHard === false ? slot.speac : null;
    const labelPoints = beatTaste ? SCORE.tasteLabel : SCORE.label;
    const inRange = (i) => !range || (soprano.low[i] >= range[0] && soprano.high[i] <= range[1]);
    // 0 to SCORE.chance - 1 at temperature 1.
    const chance = (i) => (noise ? Math.floor((((Math.imul(noise ^ Math.imul(s + 1, 0x9e3779b1), 0x85ebca6b) ^ Math.imul(i + 1, 0xc2b2ae35)) >>> 0) * SCORE.chance * temperature) / 4294967296) : 0);
    // Which block a cadence takes varies with the seed too.
    const blockChance = (i) => (noise ? Math.floor((((Math.imul(noise ^ 0x5bd1e995, Math.imul(i + 1, 0x27d4eb2f)) ^ Math.imul(s + 7, 0x165667b1)) >>> 0) % (SCORE.blockChance + 1)) * temperature) : 0);
    const reward = (i) => {
      const g = db.groupings[i];
      const liked = beatTaste ? TASTE_MAX + clampTaste(beatTaste[i]) : 0;
      const own = mix === null ? 0 : 2 * MIX_POINTS + (g.gen ? hers : 0);
      return own + (color !== null && g.accidentals === color ? SCORE.accidentals : 0) + (label && g.speac && g.speac.beat === label ? labelPoints : 0) + (inRange(i) ? SCORE.range : 0) + chance(i) + liked;
    };
    const plus = (v, i) => (v < 0 ? -1 : v + reward(i));
    const free = new Int32Array(n).fill(-1);
    for (let i = 0; i < n; i++) if (fits(db.groupings[i], slot)) free[i] = plus(open(i), i);
    let best = free;
    let cont = null;
    if (pins && pins[s]) {
      const roles = new Map();
      const role = (i) => roles.get(i) || roles.set(i, { start: -1, inner: -1, end: -1 }).get(i);
      const onward = (i) => (laterCont && laterCont[i + 1] !== undefined ? laterCont[i + 1] : -1);
      for (const i of pins[s].start.keys()) role(i).start = plus(onward(i), i);
      for (const i of pins[s].inner) role(i).inner = plus(onward(i), i);
      for (const [i, strength] of pins[s].end) {
        const most = open(i);
        const liked = blockEnd ? clampTaste(blockEnd.get(i) || 0) : 0;
        role(i).end = most < 0 ? -1 : most + PIN + (strength >= STRONG * strongest ? SCORE.strong : 0) + blockChance(i) + liked + reward(i);
      }
      best = free.slice();
      cont = new Int32Array(n).fill(-1);
      for (const [i, r] of roles) {
        best[i] = Math.max(best[i], r.start);
        cont[i] = Math.max(r.inner, r.end);
      }
      plan.roles[s] = roles;
    }
    plan.best[s] = best;
    plan.free[s] = free;
    plan.cont[s] = cont;
    later = best;
    laterCont = cont;
    laterMost = -1;
    for (let i = 0; i < n; i++) if (best[i] > laterMost) laterMost = best[i];
    restBetween = false;
  }
  return plan;
}

// feasible() for these slots at a match level, computed once for the same
// slots, level, pins and preferences (compose asks the same question while
// choosing a relaxation step and while filling). prefs: { taste,
// temperature } (M9), or null.
const planCache = new WeakMap();
function planFor(db, slots, level, pins, noise = 0, prefs = null) {
  if (!planCache.has(slots)) planCache.set(slots, []);
  const taste = prefs ? prefs.taste || null : null;
  const temperature = prefs && prefs.temperature !== undefined ? prefs.temperature : 1;
  const mix = prefs && typeof prefs.mix === "number" ? prefs.mix : null;
  const known = planCache.get(slots).find((p) => p.db === db && p.level === level && p.pins === pins && p.noise === noise && p.taste === taste && p.temperature === temperature && p.mix === mix);
  if (known) return known.plan;
  const plan = feasible(db, slots, successors(db)[level], pins, noise, { taste, temperature, mix });
  planCache.get(slots).push({ db, level, pins, noise, taste, temperature, mix, plan });
  return plan;
}

// The pitches a grouping's voices go to next, after its voices were moved.
function shiftedDestination(g, shift) {
  return lexicon.parseKey(g.destKey).map((t, v) => (t ? { held: t.held, pitch: t.pitch + (shift ? shift[v] : 0) } : null));
}

// The octave moves that make grouping h start on `target`, voice by voice.
function shiftTo(target, h) {
  return lexicon.parseKey(h.entryKey).map((t, v) => (t && target[v] ? target[v].pitch - t.pitch : 0));
}

// Whether grouping g, its voices moved by `shift`, stays in every voice's
// range and crosses no neighboring voices that didn't cross before.
function voicesFit(db, g, shift) {
  for (const [, pitch, , voice] of g.pieces) {
    const [low, high] = db.ranges[voice - 1];
    const moved = pitch + shift[voice - 1];
    if (moved < low || moved > high) return false;
  }
  for (const upper of g.pieces) {
    for (const lower of g.pieces) {
      if (lower[3] !== upper[3] + 1) continue;
      if (upper[0] >= lower[0] + lower[2] || lower[0] >= upper[0] + upper[2]) continue; // not together
      const before = upper[1] - lower[1];
      const after = upper[1] + shift[upper[3] - 1] - (lower[1] + shift[lower[3] - 1]);
      if (before >= 0 && after < 0) return false;
    }
  }
  return true;
}

// Fills one template's slots. Returns the placed groupings, or null:
//   [{ index, beat, shift, level, order, block?, signatures? }]
// Groupings of a signature block share `block` (the id of its first
// grouping); its last one lists the block's `signatures`.
//   prev: the grouping placed just before slot 0 ({ index, shift }), which
//         slot 0 hooks to unless it is the first slot or follows a rest
//   used: groupings already used (shared across a stream's phrases); the
//         ones placed here are added to it
//   pins: signature blocks that may stand at cadences (pinsFor), or null
//   prefs: Emily's taste and the temperature (M9; see planFor), or null
function fill(db, slots, { random, level, budget, counters, prev = null, used = new Set(), pins = null, noise = 0, prefs = null }) {
  const plan = planFor(db, slots, level, pins, noise, prefs);
  const plan0 = level > 0 ? planFor(db, slots, 0, pins, noise, prefs) : plan;
  const graph = successors(db)[level];
  const at = slots.map((slot, s) => s).filter((s) => !slots[s].rest); // the slots to fill
  if (!at.length || !plan.best[at[0]].some((v) => v >= 0)) return null; // can't be filled at all

  const shuffle = (list) => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = random.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const restStarts = db.groupings.map((g, i) => i).filter((i) => db.groupings[i].restBefore);
  const placed = [];
  const strongest = db.signatures && db.signatures.length ? db.signatures[0].works : 0;

  // Hooks that keep every voice where its source had it come first: exact
  // hooks, then L1 hooks that move no voice (a tie becomes a repeated note or
  // the reverse). Among those, the ones from which the template can be
  // finished with exact hooks come first. Hooks that move voices come last.
  // Then (M7) the candidates that leave room for the most signature blocks
  // come first, those that move voices still last.
  const candidates = (k) => {
    const s = at[k];
    const slot = slots[s];
    if (slot.repeat) {
      // Inside a repeated phrase whose first beat was a copy: the next copy.
      const last = placed[k - 1];
      if (!slot.repeat.first && last && last.role === "copy" && last.phrase === slot.repeat.phrase) return [copyOf(slot)];
      if (slot.repeat.first) {
        const copy = copyOf(slot);
        if (copy && canRepeat(k, slot.repeat.phrase)) return [copy, ...fresh(k)];
      }
    }
    return fresh(k);
  };

  // The phrase composed at the slot this one repeats, as a candidate here.
  const copyOf = (slot) => {
    const original = bySlot.get(slot.repeat.of);
    return original ? { index: original.index, shift: original.shift, level: original.level, role: "copy", phrase: slot.repeat.phrase } : null;
  };

  // Whether the phrase starting at at[k] can repeat the one already composed:
  // every beat fits its slot, the first hooks exactly to the beat before it,
  // and the last can lead on to what follows.
  const canRepeat = (k, phrase) => {
    const span = [];
    for (let t = k; t < at.length && slots[at[t]].repeat && slots[at[t]].repeat.phrase === phrase; t++) span.push(at[t]);
    const copies = span.map((s) => bySlot.get(slots[s].repeat.of));
    if (copies.some((c) => !c)) return false;
    if (span.some((s, i) => !fitsRepeat(db.groupings[copies[i].index], slots[s]))) return false;
    const first = db.groupings[copies[0].index];
    const before = k > 0 && at[k - 1] === span[0] - 1 ? placed[k - 1] : !slots[span[0]].first && !slots[span[0]].afterRest && span[0] === 0 ? prev : null;
    if (before) {
      const from = db.groupings[before.index];
      const entry = lexicon.parseKey(first.entryKey).map((t, v) => (t ? { held: t.held, pitch: t.pitch + (copies[0].shift ? copies[0].shift[v] : 0) } : null));
      if (lexicon.keyOf(shiftedDestination(from, before.shift)) !== lexicon.keyOf(entry) || !sourceOk(from, first)) return false;
    }
    const end = span[span.length - 1];
    const lastIndex = copies[copies.length - 1].index;
    const after = end + 1;
    if (slots[end].needsExit && !graph[lastIndex].length) return false;
    if (after < slots.length && !slots[after].rest) {
      if (!graph[lastIndex].some((j) => plan.best[after][j] >= 0)) return false;
    }
    return true;
  };

  const fresh = (k) => {
    const s = at[k];
    const slot = slots[s];
    const free = (i) => plan.best[s][i] >= 0 && !used.has(i);
    const ok0 = (i) => plan0.best[s][i] >= 0;
    let before = null; // the placed grouping this slot hooks to
    if (k > 0) before = at[k - 1] === s - 1 ? placed[k - 1] : null;
    else if (!slot.first && !slot.afterRest && s === 0) before = prev;
    if (before && (before.role === "start" || before.role === "inner")) {
      // Inside a signature block: its next grouping, moved as its first was.
      const index = before.index + 1;
      const r = plan.roles[s] && plan.roles[s].get(index);
      if (!r || used.has(index) || (before.shift && !voicesFit(db, db.groupings[index], before.shift))) return [];
      const roles = [
        { role: "end", value: r.end },
        { role: "inner", value: r.inner },
      ].filter((c) => c.value >= 0);
      return roles.sort((a, b) => b.value - a.value).map((c) => ({ index, shift: before.shift, level: before.level, ...c }));
    }
    if (!before) {
      // The first slot, or the first after a rest: nothing to hook to.
      const pool = (slot.first ? db.openings : restStarts).filter(free);
      return towardRepeat(byBlocks(preferLabel([...shuffle(pool.filter(ok0)), ...shuffle(pool.filter((i) => !ok0(i)))].map((index) => ({ index, shift: null, level: 0 })), s), s), s);
    }
    const from = db.groupings[before.index];
    const target = shiftedDestination(from, before.shift);
    const exact = (db.lexicon[lexicon.keyOf(target)] || []).filter((i) => free(i) && sourceOk(from, db.groupings[i]));
    const unmoved = []; // L1, no voice moved
    const moved = [];
    if (level >= 1) {
      const isExact = new Set(exact);
      for (const i of db.lexicon1[lexicon.l1Key(target)] || []) {
        if (isExact.has(i) || !free(i) || !sourceOk(from, db.groupings[i])) continue;
        const shift = shiftTo(target, db.groupings[i]);
        if (shift.every((v) => v === 0)) unmoved.push(i);
        else if (voicesFit(db, db.groupings[i], shift)) moved.push({ index: i, shift, level: 1 });
      }
    }
    const asIs = (level) => (index) => ({ index, shift: null, level });
    const exactFirst = (list, level) => [
      ...shuffle(list.filter(ok0)).map(asIs(level)),
    ];
    const rest = (list, level) => shuffle(list.filter((i) => !ok0(i))).map(asIs(level));
    const all = [...exactFirst(exact, 0), ...exactFirst(unmoved, 1), ...rest(exact, 0), ...rest(unmoved, 1), ...shuffle(moved)];
    return towardRepeat(byBlocks(preferLabel(all, s), s), s);
  };

  // Within each kind of hook (exact hooks still before L1 ones, and hooks
  // that move voices last), so that voice-leading stays as exact as without
  // them, three preferences: (M8) groupings with the template beat's
  // accidentals (an F# where it has an F#), then from its key area, so the
  // piece modulates where the template does; then, with a preferred (not
  // required) SPEAC label, those with the label.
  function preferLabel(list, s) {
    const want = slots[s].speac;
    const { area, accidentals } = slots[s];
    const labels = want && slots[s].speacHard === false;
    if (!labels && !area && accidentals === null) return list;
    const rank = (c) => {
      const g = db.groupings[c.index];
      return (accidentals !== null && accidentals !== undefined && g.accidentals !== accidentals ? 4 : 0) + (area && g.area !== area ? 2 : 0) + (labels && !(g.speac && g.speac.beat === want) ? 1 : 0);
    };
    const ordered = (group) => group.map((c, i) => [rank(c), i, c]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, , c]) => c);
    const out = [];
    for (const level of [0, 1]) out.push(...ordered(list.filter((c) => c.level === level && !c.shift)));
    return [...out, ...ordered(list.filter((c) => c.shift))];
  }

  // Lookahead for a repeat (M8): when a repeated phrase starts at slot r and
  // the phrase it repeats is already composed, the beat before r must lead
  // exactly into the copy's first beat. Candidates whose last beat before r
  // does so come first: the beat at r - 1 itself, or a signature block that
  // ends there.
  function towardRepeat(list, s) {
    if (repeatFrom.has(s)) {
      // The beat a repeat will copy first: one from which the repeat can be
      // reached again comes first (checked for the first 24 candidates).
      const head = list.slice(0, 24);
      const yes = head.filter((c) => c.role === "free" && reachable(c, s));
      if (yes.length) return [...yes, ...list.filter((c) => !yes.includes(c))];
      return list;
    }
    for (const [r, rows] of towardCopy) {
      if (s < r && rows.has(s)) {
        // On the way to a repeat: groupings from which the copy can still be
        // reached come first; a signature block if its last grouping can.
        const row = rows.get(s);
        const ok = (c) => {
          if (c.role === "free") return row[c.index] === 1;
          if (c.role !== "start") return true;
          for (let e = s + 1; e < r && e <= s + 8; e++) {
            const end = c.index + (e - s);
            if (pins && pins[e] && pins[e].end.has(end)) return !rows.has(e) || rows.get(e)[end] === 1;
          }
          return true;
        };
        const yes = list.filter(ok);
        if (yes.length) return [...yes, ...list.filter((c) => !ok(c))];
      }
    }
    let r = s + 1;
    while (r < slots.length && r - s <= 8 && !(slots[r].repeat && slots[r].repeat.first)) r++;
    if (r >= slots.length || !slots[r].repeat || !slots[r].repeat.first) return list;
    for (let t = s + 1; t < r; t++) if (slots[t].rest) return list; // a rest before it: nothing to hook
    const original = bySlot.get(slots[r].repeat.of);
    if (!original) return list;
    const first = db.groupings[original.index];
    const entry = lexicon.keyOf(lexicon.parseKey(first.entryKey).map((t, v) => (t ? { held: t.held, pitch: t.pitch + (original.shift ? original.shift[v] : 0) } : null)));
    const leads = (c) => {
      let last = null;
      if (c.role === "free" && s === r - 1) last = c.index;
      else if (c.role === "start" && pins && pins[r - 1] && pins[r - 1].end.has(c.index + (r - 1 - s))) last = c.index + (r - 1 - s);
      if (last === null) return false;
      const g = db.groupings[last];
      return g.destKey !== null && lexicon.keyOf(shiftedDestination(g, c.shift)) === entry && sourceOk(g, first);
    };
    const yes = list.filter(leads);
    return yes.length ? [...yes, ...list.filter((c) => !leads(c))] : list;
  }

  // Each candidate as a grouping on its own and, where it may, as the first
  // of a signature block; then those leaving room for the most blocks first.
  // Among those, a strong block (STRONG) starts as soon as it can, the
  // strongest first; a weaker one only where nothing else would lead to a
  // block, so it is as short as it can be, leaving more to recombination.
  // With that, pieces use Bach's formulas about as often as he does (soprano
  // 3-2-1 at 18% of cadences, against his 20%; bass 4-5-1 at 18%, against
  // 21%). The sort is stable, so with no blocks in view the order is as
  // above.
  function byBlocks(list, s) {
    const roles = plan.roles[s];
    const out = [];
    for (const c of list) {
      if (plan.free[s][c.index] >= 0) out.push({ ...c, role: "free", value: plan.free[s][c.index] });
      const r = roles && roles.get(c.index);
      if (r && r.start >= 0) out.push({ ...c, role: "start", value: r.start });
    }
    const strength = (c) => (c.role === "start" ? pins[s].start.get(c.index) : STRONG * strongest);
    const rank = out.map((c, i) => [c.shift ? 1 : 0, -c.value, -strength(c), i]);
    return rank.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2] || a[3] - b[3]).map((r) => out[r[3]]);
  }

  // Plans toward repeats (M8). Once the beat a repeated phrase will copy
  // first is placed, a backward pass finds, for each slot before the repeat
  // (back to a rest or the original), the groupings from which the copy can
  // still be reached by exact hooks; the search tries those first.
  const repeatFrom = new Map(); // slot of an original first beat -> [repeat start slots]
  slots.forEach((slot, r) => {
    if (slot.repeat && slot.repeat.first) repeatFrom.set(slot.repeat.of, [...(repeatFrom.get(slot.repeat.of) || []), r]);
  });
  const towardCopy = new Map(); // repeat start slot -> Map(slot -> Uint8Array)
  const feasibleCache = new Map();
  const feasibleAt = (s) => {
    if (!feasibleCache.has(s)) {
      const list = [];
      plan.best[s].forEach((v, i) => v >= 0 && list.push(i));
      feasibleCache.set(s, list);
    }
    return feasibleCache.get(s);
  };
  const reachCopy = (r, original) => {
    const rows = new Map();
    let later = new Uint8Array(db.groupings.length);
    later[original.index] = 1;
    for (let s = r - 1; s > slots[r].repeat.of && !slots[s].rest; s--) {
      const row = new Uint8Array(db.groupings.length);
      let any = false;
      for (const i of feasibleAt(s)) {
        if (graph[i].some((j) => later[j])) {
          row[i] = 1;
          any = true;
        }
      }
      if (!any) break;
      rows.set(s, row);
      later = row;
    }
    return rows;
  };
  // Whether, with grouping c at the slot a repeat will copy first, the copy
  // can be reached again at the repeat (every slot between has a way on).
  const reachable = (c, s) =>
    (repeatFrom.get(s) || []).every((r) => {
      if (r === s + 1) return true;
      const rows = reachCopy(r, c);
      return rows.has(s + 1) && graph[c.index].some((j) => rows.get(s + 1)[j]);
    });
  const bySlot = new Map(); // slot -> its placed grouping
  const extend = (k) => {
    if (k === at.length) return true;
    if (++counters.steps > budget) return false;
    for (const c of candidates(k)) {
      const entry = { ...c, beat: at[k], order: k };
      placed.push(entry);
      bySlot.set(at[k], entry);
      if (c.role !== "copy") used.add(c.index); // a repeat uses its original's groupings again
      const targets = repeatFrom.get(at[k]) || [];
      for (const r of targets) towardCopy.set(r, reachCopy(r, entry));
      if (extend(k + 1)) return true;
      for (const r of targets) towardCopy.delete(r);
      placed.pop();
      bySlot.delete(at[k]);
      if (c.role !== "copy") used.delete(c.index);
      counters.backtracks++;
      if (counters.steps > budget) return false;
    }
    return false;
  };
  if (!extend(0)) return null;

  let block = null;
  const out = new Map(); // slot -> output entry
  return placed.map(({ role, value, phrase, ...p }) => {
    let entry;
    if (role === "copy") {
      // A repeat: marked with the slot it repeats, and in the same blocks.
      const original = out.get(slots[p.beat].repeat.of);
      entry = { ...p, repeat: slots[p.beat].repeat.of };
      if (original.block) entry.block = original.block;
      if (original.signatures) entry.signatures = original.signatures;
    } else {
      if (role === "start") block = { id: db.groupings[p.index].id, start: p.index };
      entry = role === "free" ? p : { ...p, block: block.id };
      if (role === "end") {
        const found = signatures.blockAt(db, block.start, p.index);
        entry.signatures = found ? found.sigs : [];
      }
    }
    out.set(p.beat, entry);
    return entry;
  });
}

// The template's repeated phrases (M8): every slot of a phrase whose melody
// repeats an earlier phrase's gets repeat: { of: the slot it repeats, phrase,
// first }. Phrases end at cadences (emi-speac's phrasesOf); two are the same
// when their soprano notes, rhythm and silent beats are.
function markRepeats(db, template, slots) {
  const gs = db.groupings.slice(template.start, template.start + template.count);
  const slotOf = [];
  let s = 0;
  gs.forEach((g, k) => {
    if (k > 0) s += g.index - gs[k - 1].index - 1;
    slotOf.push(s++);
  });
  const phrases = speac.phrasesOf(gs);
  const shape = (phrase) => {
    const first = gs[phrase[0]].index;
    return phrase
      .map((k) => {
        const g = gs[k];
        const notes = g.pieces.filter((p) => p[3] === 1).map((p) => `${p[0]}:${p[1]}:${p[2]}:${p[5]}`);
        return `${g.index - first}|${g.beatInBar}|${notes.join(",")}`;
      })
      .join(" ");
  };
  const shapes = phrases.map(shape);
  phrases.forEach((phrase, k) => {
    const j = shapes.findIndex((other, i) => i < k && other === shapes[k]);
    if (j < 0) return;
    phrase.forEach((g, i) => {
      slots[slotOf[g]] = { ...slots[slotOf[g]], repeat: { of: slotOf[phrases[j][i]], phrase: k, first: i === 0 } };
    });
  });
  return slots;
}

// The most signature blocks a fill of these slots can place, at this match
// level (-1: the slots can't be filled).
function mostBlocks(db, slots, level, pins, noise = 0, prefs = null) {
  const plan = planFor(db, slots, level, pins, noise, prefs);
  const first = slots.findIndex((slot) => !slot.rest);
  let most = -1;
  if (first >= 0) for (const v of plan.best[first]) if (v > most) most = v;
  return most < 0 ? -1 : Math.floor(most / PIN);
}

// Signatures come before strict SPEAC labels: a relaxation step is skipped
// when the next one, with the same voice-leading and cadence rules and only
// its labels preferred instead of required, can place more blocks.
// slotsAt(step) gives the slots for a step, pinsAt(slots) their pins (both
// remembered: see memo); noise as for fill, so the passes are shared.
function labelsGiveWay(db, step, slotsAt, pinsAt, noise = 0, prefs = null) {
  const [here, looser] = [RELAX[step], RELAX[step + 1]];
  if (!looser || here.speac !== true || looser.level !== here.level || looser.cadenceBass !== here.cadenceBass) return false;
  const strict = slotsAt(step);
  const loose = slotsAt(step + 1);
  const pinsStrict = pinsAt(strict);
  if (!pinsStrict) return false;
  return mostBlocks(db, loose, looser.level, pinsAt(loose), noise, prefs) > mostBlocks(db, strict, here.level, pinsStrict, noise, prefs);
}

// A function's results remembered by argument, so the same slots and pins
// (and the plans cached on them) are reused across relaxation steps.
function memo(f) {
  const known = new Map();
  return (x) => (known.has(x) ? known.get(x) : known.set(x, f(x)).get(x));
}

// A template's length in beats, rests included.
function templateBeats(db, template) {
  const first = db.groupings[template.start];
  const last = db.groupings[template.start + template.count - 1];
  return last.index - first.index + 1;
}

// Composes a piece in the form of a chorale from the corpus, chosen by the
// seed among those at least `beats` long. relax: how far the rules may relax
// (an index into RELAX; 0 = strict only). signatures: false composes without
// signature blocks (as in M6).
//
// M8: a piece that quotes a source for too long (emi-quality's guard: more
// than 16 notes of one voice, or more than 8 beats in a row from one
// chorale) is put aside and the next template tried. This happens when a
// chorale's tune has other harmonizations in the corpus: their beats fit its
// form well and bring back its melody. If every template tried quotes too
// much, the piece that quotes least is returned, marked over the limit.
// guard: false skips the check. template: compose in this chorale's form
// only (the listening test pairs a chorale with a piece in its form).
// repeats: false composes repeated phrases afresh (as before M8).
//
// M9: taste (from emily-assoc's prepare, or null) and temperature (default
// 1) are Emily's: they steer the search toward liked beats (see SCORE), and
// the choice of form toward liked forms (byTaste).
function compose(db, { seed = 1, beats = 32, relax = RELAX.length - 1, budget = 20000, maxTemplates = 10, signatures = true, guard = true, template: only = null, repeats = true, taste = null, temperature = 1, mix = null } = {}) {
  const random = rng.create(seed);
  const prefs = taste || temperature !== 1 || mix !== null ? { taste, temperature, mix } : null;
  let templates = db.templates.filter((t) => (only ? t.work === only : templateBeats(db, t) >= beats));
  for (let i = templates.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [templates[i], templates[j]] = [templates[j], templates[i]];
  }
  if ((taste && taste.templates) || mix !== null) templates = byTaste(templates, (t) => formWeight(db, t.work, taste, mix), temperature);
  const tried = [];
  const counters = { steps: 0, backtracks: 0 };
  let quoting = null; // the piece put aside that quotes least: { piece, step }
  let guarded = 0; // pieces put aside
  const stats = (relaxed) => ({ tried, relaxed, steps: counters.steps, backtracks: counters.backtracks, guarded });
  for (const template of templates.slice(0, maxTemplates)) {
    tried.push(template.work);
    const slotsAt = memo((step) => (repeats ? markRepeats(db, template, slotsOf(db, template, RELAX[step])) : slotsOf(db, template, RELAX[step])));
    const pinsAt = memo((slots) => (signatures ? pinsFor(db, slots, template.work) : null));
    for (let step = 0; step <= relax; step++) {
      if (step < relax && labelsGiveWay(db, step, slotsAt, pinsAt, seed, prefs)) continue;
      const slots = slotsAt(step);
      const pins = pinsAt(slots);
      const placed = fill(db, slots, { random, level: RELAX[step].level, budget: counters.steps + budget, counters, pins, noise: seed, prefs });
      if (!placed) continue;
      const cadences = slots.filter((slot) => slot.cadence).length;
      const matched = placed.filter((p) => {
        const g = db.groupings[p.index];
        return g.speac && g.speac.beat === db.groupings[template.start + p.order].speac.beat;
      }).length;
      const piece = assemble(db, placed, {
        seed,
        source: `EMI recombination (M8, form of ${template.work})`,
        form: { template: template.work, phrases: cadences, beats: slots.length, rests: slots.length - placed.length, relaxed: step, speac: matched / placed.length, signatures: placed.filter((p) => p.signatures).length },
      });
      const check = quality.guard(db, piece);
      piece.form.quotes = { run: check.quotes.run.beats, melody: check.quotes.melody.notes };
      if (guard && !check.ok) {
        guarded++;
        if (!quoting || check.quotes.melody.notes < quoting.piece.form.quotes.melody) quoting = { piece, step };
        break; // the next template
      }
      return { ok: true, piece, stats: stats(step) };
    }
  }
  if (quoting) {
    quoting.piece.form.overLimit = true;
    return { ok: true, piece: quoting.piece, stats: stats(quoting.step) };
  }
  return { ok: false, piece: null, stats: stats(null) };
}

// How much a form is liked (M9: Emily's taste) and, for one of her own
// works (M10), how much her music counts (mix).
const genCache = new WeakMap();
function formWeight(db, work, taste, mix) {
  if (!genCache.has(db)) genCache.set(db, new Map(db.works.map((w) => [w.id, w.gen || 0])));
  const own = mix !== null && genCache.get(db).get(work) ? (4 * (mix - 0.5)) : 0;
  return (taste && taste.templates ? taste.templates.get(work) || 0 : 0) + own;
}

// A list in its seeded order, reordered by taste (M9): liked items move
// forward, disliked ones back, by how much depending on the temperature. The
// list's order stands for a random draw (the first item drew the highest
// number); each item's taste is added to its draw, as a Gumbel variable,
// so the result is a draw in which an item's chance of coming first grows
// as exp(weight / temperature). With no taste, the order is unchanged; at
// temperature 0, liked items come first and disliked ones last, in their
// seeded order.
function byTaste(list, weightOf, temperature = 1) {
  const n = list.length;
  const keyed = list.map((item, k) => {
    const draw = -Math.log(-Math.log(1 - (k + 0.5) / n));
    const w = weightOf(item);
    return [temperature > 0 ? draw + w / temperature : draw + Math.sign(w) * 1e9, k, item];
  });
  return keyed.sort((a, b) => b[0] - a[0] || a[1] - b[1]).map(([, , item]) => item);
}

exports.compose = compose;
exports.byTaste = byTaste;
exports.formWeight = formWeight;
exports.MIX_POINTS = MIX_POINTS;
exports.planFor = planFor;
exports.TASTE_MAX = TASTE_MAX;
exports.RELAX = RELAX;
exports.slotsOf = slotsOf;
exports.fits = fits;
exports.feasible = feasible;
exports.successors = successors;
exports.templateBeats = templateBeats;
exports.fill = fill;
exports.pinsFor = pinsFor;
exports.labelsGiveWay = labelsGiveWay;
exports.memo = memo;
exports.markRepeats = markRepeats;
