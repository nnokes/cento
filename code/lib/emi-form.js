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
//   - metre, voice-hooking and the different-source rule as in M2.
// The seed picks the template. If it can't be filled, the rules relax one
// step at a time (RELAX below), and only then is the next template tried:
//   0  strict: every hook exact (L0)
//   1  L1 hooks too: a grouping's upper voices move by octaves so each starts
//      exactly where the previous beat's voice went (see emi-lexicon), as long
//      as every voice stays in its range and no voices cross that didn't
//      before; exact hooks still come first
//   2  as 1, and a cadence may stand on any bass note
//
// Before searching, a backward pass over the template finds, for every slot,
// the groupings from which the rest of the template can still be filled. The
// search only enters those, so it rarely backtracks.

const rng = require("emi-rng");
const lexicon = require("emi-lexicon");
const { assemble } = require("emi-compose");

const RELAX = [
  { level: 0, cadenceBass: true },
  { level: 1, cadenceBass: true },
  { level: 1, cadenceBass: false },
];

// A template's slots, one per beat from its first sounding beat to its last:
//   { rest: true }                                    a silent beat
//   { beatInBar, cadence, bass, first, afterRest, last }
// bass is the pitch class a cadence slot's chord must stand on (null
// elsewhere, and everywhere when cadenceBass is false).
function slotsOf(db, template, { cadenceBass = true } = {}) {
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
      first: k === 0,
      afterRest: k > 0 && g.restBefore,
      last: k === template.count - 1,
    });
  }
  return slots;
}

// May grouping g fill this slot, leaving aside how it joins its neighbours?
function fits(g, slot) {
  if (g.beatInBar !== slot.beatInBar || g.cadence !== slot.cadence) return false;
  if (slot.bass !== null && (g.bass === null || g.bass % 12 !== slot.bass)) return false;
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
function fill(db, slots, { random, level, budget, counters }) {
  const graphs = successors(db);
  const ok = feasible(db, slots, graphs[level]);
  const ok0 = level > 0 ? feasible(db, slots, graphs[0]) : ok;
  const at = slots.map((slot, s) => s).filter((s) => !slots[s].rest); // the slots to fill
  if (!ok[at[0]].some((v, i) => v && db.groupings[i].opening)) return null; // can't be filled at all

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
  const used = new Set();

  // Hooks that keep every voice where its source had it come first: exact
  // hooks, then L1 hooks that move no voice (a tie becomes a repeated note or
  // the reverse). Among those, the ones from which the template can be
  // finished with exact hooks come first. Hooks that move voices come last.
  const candidates = (k) => {
    const s = at[k];
    const free = (i) => ok[s][i] && !used.has(i);
    const prev = k > 0 ? placed[k - 1] : null;
    if (!prev || at[k - 1] !== s - 1) {
      // The first slot, or the first after a rest: nothing to hook to.
      const pool = (k === 0 ? db.openings : restStarts).filter(free);
      return [...shuffle(pool.filter((i) => ok0[s][i])), ...shuffle(pool.filter((i) => !ok0[s][i]))].map((index) => ({ index, shift: null, level: 0 }));
    }
    const from = db.groupings[prev.index];
    const target = shiftedDestination(from, prev.shift);
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
    return [...exactFirst(exact, 0), ...exactFirst(unmoved, 1), ...rest(exact, 0), ...rest(unmoved, 1), ...shuffle(moved)];
  };

  const extend = (k) => {
    if (k === at.length) return true;
    if (++counters.steps > budget) return false;
    for (const c of candidates(k)) {
      placed.push({ ...c, beat: at[k] });
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
      const piece = assemble(db, placed, {
        seed,
        source: `EMI recombination (M3, form of ${template.work})`,
        form: { template: template.work, phrases: cadences, beats: slots.length, rests: slots.length - placed.length, relaxed: step },
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
