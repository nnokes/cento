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
// Before searching, a backward pass over the template finds, for every slot,
// the groupings from which the rest of the template can still be filled, and
// how many signature blocks can still be placed after each. The search only
// enters those, most blocks first, so it rarely backtracks.

const rng = require("emi-rng");
const lexicon = require("emi-lexicon");
const signatures = require("emi-signatures");
const quality = require("emi-quality");
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
    });
  }
  return slots;
}

// May grouping g fill this slot, leaving aside how it joins its neighbours?
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
//   pins[s] = { start: Map(i -> the block's strength), inner: Set, end: Set } | null
// or null when no cadence can take a block. avoid: a work whose blocks are
// left out (the template's own).
function pinsFor(db, slots, avoid = null) {
  const all = signatures.blocks(db);
  if (!all.length) return null;
  const pins = slots.map(() => null);
  const at = (s) => (pins[s] = pins[s] || { start: new Map(), inner: new Set(), end: new Set() });
  let any = false;
  slots.forEach((slot, s) => {
    if (slot.rest || !slot.cadence) return;
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
      at(s).end.add(block.end);
      any = true;
    }
  });
  return any ? pins : null;
}

// The backward pass. For every slot s and grouping i, the most signature
// blocks that can still be placed from slot s on with grouping i there, or -1
// if the rest of the template can't be filled after it (rest slots have no
// rows):
//   best[s][i]   i hooks to what comes before it (as any grouping, or as the
//                first of a block)
//   free[s][i]   the same, as a grouping outside any block
//   cont[s][i]   i continues the block of the grouping before it (null
//                where no block can be)
//   roles[s]     Map(i -> { start, inner, end }): i as the first, a middle
//                or the last grouping of a block (only where blocks can be)
// next: one of the successor graphs; pins: from pinsFor, or null.
function feasible(db, slots, next, pins = null) {
  const n = db.groupings.length;
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
      for (const j of next[i]) if (later[j] > most) most = later[j];
      return most;
    };
    const free = new Int16Array(n).fill(-1);
    for (let i = 0; i < n; i++) if (fits(db.groupings[i], slot)) free[i] = open(i);
    let best = free;
    let cont = null;
    if (pins && pins[s]) {
      const roles = new Map();
      const role = (i) => roles.get(i) || roles.set(i, { start: -1, inner: -1, end: -1 }).get(i);
      const onward = (i) => (laterCont && laterCont[i + 1] !== undefined ? laterCont[i + 1] : -1);
      for (const i of pins[s].start.keys()) role(i).start = onward(i);
      for (const i of pins[s].inner) role(i).inner = onward(i);
      for (const i of pins[s].end) {
        const most = open(i);
        role(i).end = most < 0 ? -1 : most + 1;
      }
      best = free.slice();
      cont = new Int16Array(n).fill(-1);
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
// slots, level and pins (compose asks the same question while choosing a
// relaxation step and while filling).
const planCache = new WeakMap();
function planFor(db, slots, level, pins) {
  if (!planCache.has(slots)) planCache.set(slots, []);
  const known = planCache.get(slots).find((p) => p.db === db && p.level === level && p.pins === pins);
  if (known) return known.plan;
  const plan = feasible(db, slots, successors(db)[level], pins);
  planCache.get(slots).push({ db, level, pins, plan });
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
// range and crosses no neighbouring voices that didn't cross before.
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
function fill(db, slots, { random, level, budget, counters, prev = null, used = new Set(), pins = null }) {
  const plan = planFor(db, slots, level, pins);
  const plan0 = level > 0 ? planFor(db, slots, 0, pins) : plan;
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
      return byBlocks(preferLabel([...shuffle(pool.filter(ok0)), ...shuffle(pool.filter((i) => !ok0(i)))].map((index) => ({ index, shift: null, level: 0 })), s), s);
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
    return byBlocks(preferLabel(all, s), s);
  };

  // With a preferred (not required) SPEAC label, the groupings that have it
  // come first within each kind of hook (exact hooks still before L1 ones,
  // and hooks that move voices last), so voice-leading stays as exact as
  // without labels.
  function preferLabel(list, s) {
    const want = slots[s].speac;
    if (!want || slots[s].speacHard !== false) return list;
    const has = (c) => db.groupings[c.index].speac && db.groupings[c.index].speac.beat === want;
    const out = [];
    for (const level of [0, 1]) {
      const group = list.filter((c) => c.level === level && !c.shift);
      out.push(...group.filter(has), ...group.filter((c) => !has(c)));
    }
    const moved = list.filter((c) => c.shift);
    return [...out, ...moved.filter(has), ...moved.filter((c) => !has(c))];
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

  const extend = (k) => {
    if (k === at.length) return true;
    if (++counters.steps > budget) return false;
    for (const c of candidates(k)) {
      placed.push({ ...c, beat: at[k], order: k });
      used.add(c.index);
      if (extend(k + 1)) return true;
      placed.pop();
      used.delete(c.index);
      counters.backtracks++;
      if (counters.steps > budget) return false;
    }
    return false;
  };
  if (!extend(0)) return null;

  let block = null;
  return placed.map(({ role, value, ...p }) => {
    if (role === "start") block = { id: db.groupings[p.index].id, start: p.index };
    if (role === "free") return p;
    const out = { ...p, block: block.id };
    if (role === "end") {
      const found = signatures.blockAt(db, block.start, p.index);
      out.signatures = found ? found.sigs : [];
    }
    return out;
  });
}

// The most signature blocks a fill of these slots can place, at this match
// level (-1: the slots can't be filled).
function mostBlocks(db, slots, level, pins) {
  const plan = planFor(db, slots, level, pins);
  const first = slots.findIndex((slot) => !slot.rest);
  let most = -1;
  if (first >= 0) for (const v of plan.best[first]) if (v > most) most = v;
  return most;
}

// Signatures come before strict SPEAC labels: a relaxation step is skipped
// when the next one, with the same voice-leading and cadence rules and only
// its labels preferred instead of required, can place more blocks.
// slotsAt(step) gives the slots for a step, pinsAt(slots) their pins (both
// remembered: see memo).
function labelsGiveWay(db, step, slotsAt, pinsAt) {
  const [here, looser] = [RELAX[step], RELAX[step + 1]];
  if (!looser || here.speac !== true || looser.level !== here.level || looser.cadenceBass !== here.cadenceBass) return false;
  const strict = slotsAt(step);
  const loose = slotsAt(step + 1);
  const pinsStrict = pinsAt(strict);
  if (!pinsStrict) return false;
  return mostBlocks(db, loose, looser.level, pinsAt(loose)) > mostBlocks(db, strict, here.level, pinsStrict);
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
function compose(db, { seed = 1, beats = 32, relax = RELAX.length - 1, budget = 20000, maxTemplates = 10, signatures = true, guard = true, template: only = null } = {}) {
  const random = rng.create(seed);
  const templates = db.templates.filter((t) => (only ? t.work === only : templateBeats(db, t) >= beats));
  for (let i = templates.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [templates[i], templates[j]] = [templates[j], templates[i]];
  }
  const tried = [];
  const counters = { steps: 0, backtracks: 0 };
  let quoting = null; // the piece put aside that quotes least: { piece, step }
  let guarded = 0; // pieces put aside
  const stats = (relaxed) => ({ tried, relaxed, steps: counters.steps, backtracks: counters.backtracks, guarded });
  for (const template of templates.slice(0, maxTemplates)) {
    tried.push(template.work);
    const slotsAt = memo((step) => slotsOf(db, template, RELAX[step]));
    const pinsAt = memo((slots) => (signatures ? pinsFor(db, slots, template.work) : null));
    for (let step = 0; step <= relax; step++) {
      if (step < relax && labelsGiveWay(db, step, slotsAt, pinsAt)) continue;
      const slots = slotsAt(step);
      const pins = pinsAt(slots);
      const placed = fill(db, slots, { random, level: RELAX[step].level, budget: counters.steps + budget, counters, pins });
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

exports.compose = compose;
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
