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
//   - metre, voice-hooking and the different-source rule as in M2.
// The seed picks the template. If it can't be filled, the rules relax one
// step at a time (RELAX below), and only then is the next template tried:
//   0  strict: every hook exact (L0), every SPEAC label matched
//   1  every hook exact; SPEAC labels preferred, not required (Cope's "soft
//      constraint"): groupings with the template's label are tried first
//   2  L1 hooks too: a grouping's upper voices move by octaves so each starts
//      exactly where the previous beat's voice went (see emi-lexicon), as long
//      as every voice stays in its range and no voices cross that didn't
//      before; exact hooks still come first
//   3  as 2, and a cadence may stand on any bass note
// On the full corpus about 95 pieces in 100 keep exact voice-leading
// throughout, and 62% of beats keep their template beat's label (33% by
// chance, without SPEAC).
//
// Before searching, a backward pass over the template finds, for every slot,
// the groupings from which the rest of the template can still be filled. The
// search only enters those, so it rarely backtracks.

const rng = require("emi-rng");
const lexicon = require("emi-lexicon");
const { assemble } = require("emi-compose");

const RELAX = [
  { level: 0, speac: true, cadenceBass: true },
  { level: 0, speac: "prefer", cadenceBass: true },
  { level: 1, speac: "prefer", cadenceBass: true },
  { level: 1, speac: "prefer", cadenceBass: false },
];

// A template's slots, one per beat from its first sounding beat to its last:
//   { rest: true }                                    a silent beat
//   { beatInBar, cadence, bass, speac, first, afterRest, last, newNotes }
// bass is the pitch class a cadence slot's chord must stand on (null
// elsewhere, and everywhere when cadenceBass is false); speac is the beat
// label a grouping must have (null when speac is false). newNotes is the
// template's own beat's (0: a held chord); emi-stream splits phrases with it.
// A slot may also be marked needsExit (emi-stream): its grouping must have
// somewhere to go next.
function slotsOf(db, template, { cadenceBass = true, speac = true } = {}) {
  const slots = [];
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
    });
  }
  return slots;
}

// May grouping g fill this slot, leaving aside how it joins its neighbours?
function fits(g, slot) {
  if (g.beatInBar !== slot.beatInBar || g.cadence !== slot.cadence) return false;
  if (slot.bass !== null && (g.bass === null || g.bass % 12 !== slot.bass)) return false;
  if (slot.speac && slot.speacHard !== false && (!g.speac || g.speac.beat !== slot.speac)) return false;
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

// ok[s][i] = 1: grouping i may fill slot s, and the rest of the template can
// still be filled after it through `next` (one of the successor graphs).
// Computed backwards from the last slot. Rest slots have no row.
function feasible(db, slots, next) {
  const n = db.groupings.length;
  const ok = new Array(slots.length).fill(null);
  let later = null; // the row of the next non-rest slot
  let laterAny = true;
  let restBetween = false;
  for (let s = slots.length - 1; s >= 0; s--) {
    if (slots[s].rest) {
      restBetween = true;
      continue;
    }
    const row = new Uint8Array(n);
    let any = false;
    for (let i = 0; i < n; i++) {
      if (!fits(db.groupings[i], slots[s])) continue;
      if (slots[s].needsExit && !next[i].length) continue;
      if (later && (restBetween ? !laterAny : !next[i].some((j) => later[j]))) continue;
      row[i] = 1;
      any = true;
    }
    ok[s] = row;
    later = row;
    laterAny = any;
    restBetween = false;
  }
  return ok;
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

// Fills one template's slots. Returns the placed groupings, or null.
//   prev: the grouping placed just before slot 0 ({ index, shift }), which
//         slot 0 hooks to unless it is the first slot or follows a rest
//   used: groupings already used (shared across a stream's phrases); the
//         ones placed here are added to it
function fill(db, slots, { random, level, budget, counters, prev = null, used = new Set() }) {
  const graphs = successors(db);
  const ok = feasible(db, slots, graphs[level]);
  const ok0 = level > 0 ? feasible(db, slots, graphs[0]) : ok;
  const at = slots.map((slot, s) => s).filter((s) => !slots[s].rest); // the slots to fill
  if (!at.length || !ok[at[0]].some((v) => v)) return null; // can't be filled at all

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

  // Hooks that keep every voice where its source had it come first: exact
  // hooks, then L1 hooks that move no voice (a tie becomes a repeated note or
  // the reverse). Among those, the ones from which the template can be
  // finished with exact hooks come first. Hooks that move voices come last.
  const candidates = (k) => {
    const s = at[k];
    const slot = slots[s];
    const free = (i) => ok[s][i] && !used.has(i);
    let before = null; // the placed grouping this slot hooks to
    if (k > 0) before = at[k - 1] === s - 1 ? placed[k - 1] : null;
    else if (!slot.first && !slot.afterRest && s === 0) before = prev;
    if (!before) {
      // The first slot, or the first after a rest: nothing to hook to.
      const pool = (slot.first ? db.openings : restStarts).filter(free);
      return preferLabel([...shuffle(pool.filter((i) => ok0[s][i])), ...shuffle(pool.filter((i) => !ok0[s][i]))].map((index) => ({ index, shift: null, level: 0 })), s);
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
      ...shuffle(list.filter((i) => ok0[s][i])).map(asIs(level)),
    ];
    const rest = (list, level) => shuffle(list.filter((i) => !ok0[s][i])).map(asIs(level));
    const all = [...exactFirst(exact, 0), ...exactFirst(unmoved, 1), ...rest(exact, 0), ...rest(unmoved, 1), ...shuffle(moved)];
    return preferLabel(all, s);
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
  return extend(0) ? placed : null;
}

// A template's length in beats, rests included.
function templateBeats(db, template) {
  const first = db.groupings[template.start];
  const last = db.groupings[template.start + template.count - 1];
  return last.index - first.index + 1;
}

// Composes a piece in the form of a chorale from the corpus, chosen by the
// seed among those at least `beats` long. relax: how far the rules may relax
// (an index into RELAX; 0 = strict only).
function compose(db, { seed = 1, beats = 32, relax = RELAX.length - 1, budget = 20000, maxTemplates = 10 } = {}) {
  const random = rng.create(seed);
  const templates = db.templates.filter((t) => templateBeats(db, t) >= beats);
  for (let i = templates.length - 1; i > 0; i--) {
    const j = random.int(i + 1);
    [templates[i], templates[j]] = [templates[j], templates[i]];
  }
  const tried = [];
  const counters = { steps: 0, backtracks: 0 };
  for (const template of templates.slice(0, maxTemplates)) {
    tried.push(template.work);
    for (let step = 0; step <= relax; step++) {
      const slots = slotsOf(db, template, RELAX[step]);
      const placed = fill(db, slots, { random, level: RELAX[step].level, budget: counters.steps + budget, counters });
      if (!placed) continue;
      const cadences = slots.filter((slot) => slot.cadence).length;
      const matched = placed.filter((p) => {
        const g = db.groupings[p.index];
        return g.speac && g.speac.beat === db.groupings[template.start + p.order].speac.beat;
      }).length;
      const piece = assemble(db, placed, {
        seed,
        source: `EMI recombination (M6, form of ${template.work})`,
        form: { template: template.work, phrases: cadences, beats: slots.length, rests: slots.length - placed.length, relaxed: step, speac: matched / placed.length },
      });
      return { ok: true, piece, stats: { tried, relaxed: step, steps: counters.steps, backtracks: counters.backtracks } };
    }
  }
  return { ok: false, piece: null, stats: { tried, relaxed: null, steps: counters.steps, backtracks: counters.backtracks } };
}

exports.compose = compose;
exports.RELAX = RELAX;
exports.slotsOf = slotsOf;
exports.fits = fits;
exports.feasible = feasible;
exports.successors = successors;
exports.templateBeats = templateBeats;
exports.fill = fill;
