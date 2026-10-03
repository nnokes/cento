"use strict";
// M5: composing phrase by phrase, so music can play while it is being
// composed ("streaming").
//
// Each chorale's form (emi-form's template) is split into *phrase templates*:
// one phrase start through its cadence, plus the held or silent beats after it.
// A stream walks through one chorale's phrases in order, then another
// chorale's (chosen by the seed), so it inherits real chorales' tonal plans.
// In a corpus of major and minor chorales (M8), a stream keeps to the mode of
// the chorale it starts with.
//
// Every phrase is filled like a whole form (emi-form: the same rules and the
// same relaxation steps, and (M7) a signature block at its cadence where one
// fits), and its first beat joins the previous phrase's last beat by
// voice-hooking, so phrases flow into each other. (M8) A phrase that quotes a
// chorale for too long, with the two before it, is put aside.
//
// Where the next phrase's first beat doesn't follow on in the bar (after a
// change of chorale, say), silent beats fill the gap and the phrase starts
// like one after a rest. If no phrase can be filled, the stream takes a
// breath (one silent beat) and starts a fresh phrase; it counts these
// fallbacks.
//
//   stream = start({ seed })
//   next(db, stream, { seed, last, signatures }) -> { ok, phrase }
//     phrase: { number, work, index, count, startBeat, endBeat, startTick,
//               endTick, slots, placed, piece, relaxed, gap, fallback,
//               signatures (how many blocks it has) }
// `seed` may change between calls: each phrase is drawn from its own seed and
// number, so a stream is reproducible and a new seed is heard from the next
// phrase. `last: true` makes the phrase a final one (it ends on a chorale's
// last chord) and finishes the stream. If no phrase can be placed, next()
// returns ok: false and leaves the stream as it was (a caller can then ask
// for an ordinary phrase and try the ending again after it).
//
// M9: next() also takes Emily's taste and the temperature (see emi-form's
// compose): they steer each phrase's beats, and which chorale a stream moves
// on to.

const rng = require("emi-rng");
const form = require("emi-form");
const { assemble } = require("emi-compose");
const quality = require("emi-quality");

const KEEP_USED = 64; // phrases whose groupings may not be used again

// Every chorale's form, split into phrases. Slots are emi-form's; the first
// slot of each phrase is neither "first" nor "after a rest" (the stream
// decides), and no slot is "last" (only the stream's final phrase ends a
// piece). Computed once per database.
const cache = new WeakMap();
function phraseTemplates(db) {
  if (cache.has(db)) return cache.get(db);
  const works = db.templates.map((template) => {
    const phrases = [];
    let current = [];
    let afterCadence = false;
    for (const slot of form.slotsOf(db, template)) {
      if (afterCadence && !slot.rest && slot.newNotes > 0) {
        phrases.push(current);
        current = [];
        afterCadence = false;
      }
      current.push(slot);
      if (!slot.rest && slot.cadence) afterCadence = true;
    }
    if (current.length) phrases.push(current);
    const tidy = (slots) => slots.map((slot, i) => (slot.rest ? slot : { ...slot, first: false, last: false, afterRest: i === 0 ? false : slot.afterRest }));
    const work = db.works.find((w) => w.id === template.work);
    return { work: template.work, mode: work ? work.mode : null, phrases: phrases.map(tidy) };
  });
  cache.set(db, works);
  return works;
}

function start({ seed = 1 } = {}) {
  return {
    seed,
    phrases: [],
    nextBeat: 0, // where the next phrase starts, in beats from the stream's first beat
    offsetBeats: null, // where the stream's first beat falls in its bar (0 = on the barline)
    offsetTicks: null,
    last: null, // the last placed grouping, { index, shift }
    endsInRest: false,
    walk: null, // { w, p }: the work and phrase last used
    mode: null, // the mode of its first phrase's chorale: a stream stays in it (M8)
    used: new Set(),
    usedByPhrase: [],
    fallbacks: 0,
    finished: false,
  };
}

const phraseSeed = (seed, number) => (Math.imul(seed, 7919) + Math.imul(number, 104729)) >>> 0 || 1;

function next(db, stream, { seed = stream.seed, last = false, relax = form.RELAX.length - 1, budget = 20000, tries = 12, signatures = true, guard = true, taste = null, temperature = 1, mix = null } = {}) {
  if (stream.finished) return { ok: false, phrase: null };
  const number = stream.phrases.length + 1;
  const random = rng.create(phraseSeed(seed, number));
  const counters = { steps: 0, backtracks: 0 };
  const before = { nextBeat: stream.nextBeat, endsInRest: stream.endsInRest };
  const prefs = taste || temperature !== 1 || mix !== null ? { taste, temperature, mix } : null;
  for (const fallback of [false, true]) {
    if (fallback) {
      // A breath: one silent beat, then a fresh phrase start.
      stream.nextBeat += 1;
      stream.endsInRest = true;
    }
    for (const choice of choices(db, stream, random, last, prefs).slice(0, tries)) {
      const attempt = place(db, stream, choice, { random, last, relax, budget, counters, signatures, noise: phraseSeed(seed, number), prefs });
      if (attempt && guard && quotesTooMuch(db, stream, attempt)) {
        for (const p of attempt.placed) stream.used.delete(p.index); // put aside: another phrase
        continue;
      }
      if (attempt) {
        if (fallback) stream.fallbacks++;
        return { ok: true, phrase: commit(db, stream, choice, attempt, { seed, number, last, fallback }) };
      }
    }
  }
  Object.assign(stream, before); // nothing placed: the stream is as it was
  return { ok: false, phrase: null };
}

const beatsPerBar = (db) => (db.meter[0] * 4) / db.meter[1];

// M8: the quotation guard for streams. A phrase that, with the two phrases
// before it, quotes one chorale's voice for more than the limit (emi-quality)
// is put aside like one that can't be placed.
function quotesTooMuch(db, stream, { placed }) {
  const at = placed.map((p) => ({ ...p, beat: stream.nextBeat + p.beat }));
  const offsetTicks = stream.offsetTicks !== null ? stream.offsetTicks : 0;
  const phrase = assemble(db, at, { seed: 0, source: "", offsetTicks });
  const before = stream.phrases.slice(-2).flatMap((p) => p.piece.events);
  const events = [...before, ...phrase.events].sort((a, b) => a[0] - b[0] || a[3] - b[3]);
  return quality.quotes(db, { events, provenance: [], ppq: db.beatTicks }).melody.notes > quality.LIMITS.melody;
}

// Silent beats needed before a phrase whose first beat falls on `beatInBar`.
function gapBefore(db, stream, beatInBar) {
  if (stream.offsetBeats === null) return 0;
  const bpb = beatsPerBar(db);
  const here = ((stream.offsetBeats + stream.nextBeat) % bpb) + 1;
  return (beatInBar - here + bpb) % bpb;
}

// The phrase templates to try, best first: the walk's next phrase (the same
// chorale's next phrase, or the first phrase of another chorale), then
// others, those that need no silent gap first. A stream's first phrase is a
// chorale's first phrase; a final phrase is a chorale's last. Liked
// chorales' forms move forward (M9, emi-form's byTaste).
function choices(db, stream, random, last, prefs = null) {
  const works = phraseTemplates(db).filter((w) => w.phrases.length);
  const shuffled = (list) => {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = random.int(i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const entry = (w, p) => ({ w, p, work: works[w].work, count: works[w].phrases.length, slots: works[w].phrases[p] });
  const byGap = (list) => {
    const gap = (c) => (gapBefore(db, stream, c.slots[0].beatInBar) > 0 ? 1 : 0);
    return list.map((c, i) => [gap(c), i, c]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([, , c]) => c);
  };
  let indexes = shuffled(works.map((w, i) => i)).filter((w) => !stream.mode || works[w].mode === stream.mode);
  if (prefs && ((prefs.taste && prefs.taste.templates) || prefs.mix !== null)) {
    indexes = form.byTaste(indexes, (w) => form.formWeight(db, works[w].work, prefs.taste, prefs.mix), prefs.temperature);
  }

  if (!stream.phrases.length) return indexes.map((w) => entry(w, 0));
  const walk = stream.walk;
  const following = walk.p + 1 < works[walk.w].phrases.length ? entry(walk.w, walk.p + 1) : null;
  if (last) {
    const finals = indexes.map((w) => entry(w, works[w].phrases.length - 1));
    const first = following && following.p === following.count - 1 ? [following] : [];
    return [...first, ...byGap(finals.filter((c) => !first.includes(c)))];
  }
  const first = following || entry(indexes.find((w) => w !== walk.w) ?? indexes[0], 0);
  const others = indexes.map((w) => entry(w, random.int(works[w].phrases.length)));
  return [first, ...byGap(others)];
}

// The template's slots as this phrase needs them: silent beats for any gap,
// how the first beat starts, and how the last one ends.
function prepare(db, stream, choice, { last, cadenceBass, speac }) {
  const slots = choice.slots.map((slot) => (slot.rest ? slot : { ...slot, bass: cadenceBass ? slot.bass : null, speac: speac ? slot.speac : null, speacHard: speac !== "prefer" }));
  const gap = gapBefore(db, stream, slots[0].beatInBar);
  const canHook = stream.last !== null && !stream.endsInRest && db.groupings[stream.last.index].destKey !== null;
  slots[0] = {
    ...slots[0],
    first: stream.offsetBeats === null,
    afterRest: stream.offsetBeats !== null && (gap > 0 || !canHook),
  };
  let end = slots.length - 1;
  while (slots[end].rest) end--;
  if (last) slots[end] = { ...slots[end], last: true };
  else if (end === slots.length - 1) slots[end] = { ...slots[end], needsExit: true };
  return [...Array.from({ length: gap }, () => ({ rest: true })), ...slots];
}

function place(db, stream, choice, { random, last, relax, budget, counters, signatures, noise, prefs = null }) {
  const slotsAt = form.memo((step) => prepare(db, stream, choice, { last, ...form.RELAX[step] }));
  const pinsAt = form.memo((slots) => (signatures ? form.pinsFor(db, slots, choice.work) : null));
  for (let step = 0; step <= relax; step++) {
    if (step < relax && form.labelsGiveWay(db, step, slotsAt, pinsAt, noise, prefs)) continue;
    const { level } = form.RELAX[step];
    const slots = slotsAt(step);
    const placed = form.fill(db, slots, {
      random,
      level,
      budget: counters.steps + budget,
      counters,
      prev: stream.last,
      used: stream.used,
      pins: pinsAt(slots),
      noise,
      prefs,
    });
    if (placed) return { slots, placed, relaxed: step };
  }
  return null;
}

function commit(db, stream, choice, { slots, placed, relaxed }, { seed, number, last, fallback }) {
  const startBeat = stream.nextBeat;
  if (stream.offsetBeats === null) {
    const first = slots.find((slot) => !slot.rest);
    stream.offsetBeats = first.beatInBar - 1;
    stream.offsetTicks = stream.offsetBeats * db.beatTicks;
  }
  const at = placed.map((p) => ({ ...p, beat: startBeat + p.beat }));
  const cadences = slots.filter((slot) => !slot.rest && slot.cadence).length;
  const piece = assemble(db, at, {
    seed,
    source: `EMI stream (M7), phrase ${number}, from ${choice.work}`,
    offsetTicks: stream.offsetTicks,
    form: { template: choice.work, phrase: choice.p + 1, phrases: cadences, beats: slots.length, rests: slots.length - placed.length, relaxed },
  });
  const endBeat = startBeat + slots.length;
  const phrase = {
    number,
    work: choice.work,
    index: choice.p + 1,
    count: choice.count,
    startBeat,
    endBeat,
    startTick: stream.offsetTicks + startBeat * db.beatTicks,
    endTick: stream.offsetTicks + endBeat * db.beatTicks,
    slots,
    placed: at,
    piece,
    relaxed,
    gap: slots.findIndex((slot) => !slot.rest),
    fallback,
    final: last,
    signatures: at.filter((p) => p.signatures).length,
  };
  stream.phrases.push(phrase);
  stream.nextBeat = endBeat;
  stream.last = { index: placed[placed.length - 1].index, shift: placed[placed.length - 1].shift };
  stream.endsInRest = slots[slots.length - 1].rest;
  stream.walk = { w: choice.w, p: choice.p };
  if (!stream.mode) stream.mode = db.works.find((w) => w.id === choice.work).mode;
  stream.usedByPhrase.push(placed.map((p) => p.index));
  if (stream.usedByPhrase.length > KEEP_USED) for (const i of stream.usedByPhrase.shift()) stream.used.delete(i);
  if (last) stream.finished = true;
  return phrase;
}

exports.start = start;
exports.next = next;
exports.phraseTemplates = phraseTemplates;
