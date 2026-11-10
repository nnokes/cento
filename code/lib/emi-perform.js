"use strict";
// A performance layer for playback (after v0.1.0: docs/review.md, A). As
// written, a score plays every note at one velocity and holds a fermata
// chord for exactly its written length. This shapes a score for the player
// the way singers would, without changing the score itself (export and
// clips stay as written):
//
//   fermatas      the chord under each fermata is held longer (as long again,
//                 up to a beat more; the last chord of all as long again
//                 outright), then a breath, an eighth rest, before the next
//                 phrase. Everything after it moves later by as much.
//   dynamics      each phrase swells and settles: a velocity from the beat's
//                 place in its phrase (an arch) and from its harmonic tension
//                 against the phrase's (the chord's dissonance and the root's
//                 motion, from emi-tension; not its metric part, which rises
//                 on weak beats), the soprano a little louder, the inner
//                 voices softer, beat 1 accented.
//   articulation  a note followed by the same pitch in its voice is lifted (a
//                 16th shorter), so the repeat is heard as a new note.
//
//   perform(score, { stepsPerBeat, final, fermatas, dynamics, articulation })
//     -> { score, holds }
// score: the performed score (events moved and reshaped; fermatas and
// lengthTicks moved with them). holds, in the score's own ticks, one per
// held chord: [endTick, extraTicks, holdTicks]: where the chord ends as
// written, by how much everything after it moves (the hold and the breath),
// and by how much its own notes are held. final: the score's last fermata
// is the end of the music (a whole piece), not a phrase of a stream.
//
//   stretch(holds, tick)        a written tick as performed (an onset)
//   tickOf(holds, performed)    a performed tick as written: inside a hold,
//                               the held chord's end (the piano roll's playhead)
// The player's queue is a grid of 16ths (emi-queue), so every hold and
// breath is a whole number of steps.

const { segment } = require("emi-segment");
const tension = require("emi-tension");

const HOLD = 1; // a fermata chord is held longer by this share of its length...
const MAX_HOLD_BEATS = 1; // ...but by at most this, except the last chord of all
const BREATH_STEPS = 2; // an eighth note before the next phrase
const BASE = 80; // velocity: the middle of a phrase's range
const ARCH = 10; // added at the middle of a phrase, nothing at its ends
const TENSION = 8; // added for the phrase's tensest beat, taken off for its calmest
const ACCENT = 3; // added on beat 1
const VOICE = [6, -3, -3, 2]; // soprano, alto, tenor, bass

function perform(score, { stepsPerBeat = 4, final = true, fermatas = true, dynamics = true, articulation = true } = {}) {
  const beat = score.ppq;
  const tps = beat / stepsPerBeat;
  const holds = fermatas ? holdsOf(score, tps, final) : [];
  const vel = dynamics ? velocities(score) : null;
  const events = score.events.map(([on, pitch, dur, voice, v]) => {
    const velocity = vel ? clamp(Math.round((vel.get(Math.floor(on / beat)) || BASE) + (VOICE[voice - 1] || 0))) : v;
    return [stretch(holds, on), pitch, stretchOff(holds, on + dur) - stretch(holds, on), voice, velocity];
  });
  if (articulation) lift(events, beat, tps);
  events.sort((a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1]);
  return {
    score: {
      ...score,
      events,
      fermatas: (score.fermatas || []).map((f) => stretch(holds, f)),
      lengthTicks: stretchOff(holds, score.lengthTicks),
    },
    holds,
  };
}

const clamp = (v) => Math.max(1, Math.min(127, v));

// The held chords: for each fermata, the notes sounding in its beat make the
// chord; it ends where the first of the next notes starts (or where its own
// notes end, if that's sooner: a rest may follow).
function holdsOf(score, tps, final) {
  const beat = score.ppq;
  const onsets = [...new Set(score.events.map((e) => e[0]))].sort((a, b) => a - b);
  const fermatas = [...new Set(score.fermatas || [])].sort((a, b) => a - b);
  const holds = [];
  fermatas.forEach((f, k) => {
    const sounding = score.events.filter((e) => e[0] < f + beat && e[0] + e[2] > f);
    if (!sounding.length) return;
    const next = onsets.find((t) => t >= f + beat);
    let end = Math.max(...sounding.map((e) => e[0] + e[2]));
    if (next !== undefined) end = Math.min(end, next);
    if (holds.some((h) => h[0] === end)) return;
    const last = final && k === fermatas.length - 1 && next === undefined;
    let hold = Math.round(((end - f) * HOLD) / tps) * tps;
    if (!last) hold = Math.min(hold, MAX_HOLD_BEATS * beat);
    hold = Math.max(hold, tps);
    const breath = last ? 0 : BREATH_STEPS * tps;
    holds.push([end, hold + breath, hold]);
  });
  return holds;
}

// An onset, as performed: moved by every hold before it.
function stretch(holds, tick) {
  let moved = 0;
  for (const [end, extra] of holds) if (end <= tick) moved += extra;
  return tick + moved;
}

// A note-off, as performed: a note ending where a chord is held is held with
// it (not through the breath); one ending later moves by the whole extra.
function stretchOff(holds, tick) {
  let moved = 0;
  for (const [end, extra, hold] of holds) {
    if (end < tick) moved += extra;
    else if (end === tick) moved += hold;
  }
  return tick + moved;
}

// A performed tick, as written. Inside a hold or breath: the held chord's end.
function tickOf(holds, performed) {
  let moved = 0;
  for (const [end, extra] of holds) {
    if (performed < end + moved) break;
    if (performed < end + moved + extra) return end;
    moved += extra;
  }
  return performed - moved;
}

// A velocity per beat (before the voice offsets), from the beat's place in
// its phrase and its harmonic tension against the phrase's. Phrases end at
// fermatas.
function velocities(score) {
  const beat = score.ppq;
  const beatsPerBar = Math.round((score.meter[0] * 4) / score.meter[1]);
  const groupings = segment({ ...score, id: score.id || "score", fermatas: score.fermatas || [] }, beat);
  const parts = tension.tensionsOf(groupings, beatsPerBar);
  const approaches = tension.approach(parts.map((t) => t.root));
  const tensions = parts.map((t, k) => t.vertical + approaches[k]);
  const cadences = new Set((score.fermatas || []).map((f) => Math.floor(f / beat)));
  const phrases = [];
  let phrase = [];
  groupings.forEach((g, k) => {
    phrase.push(k);
    if (cadences.has(g.index)) {
      phrases.push(phrase);
      phrase = [];
    }
  });
  if (phrase.length) phrases.push(phrase);
  const out = new Map();
  for (const members of phrases) {
    const mean = members.reduce((sum, k) => sum + tensions[k], 0) / members.length;
    const spread = Math.max(0.1, ...members.map((k) => Math.abs(tensions[k] - mean)));
    members.forEach((k, n) => {
      const pos = members.length > 1 ? n / (members.length - 1) : 0.5;
      const z = Math.max(-1, Math.min(1, (tensions[k] - mean) / spread));
      out.set(groupings[k].index, BASE + ARCH * Math.sin(Math.PI * pos) + TENSION * z + (groupings[k].beatInBar === 1 ? ACCENT : 0));
    });
  }
  return out;
}

// A note a quarter or longer that runs straight into the same pitch in its
// voice ends a 16th early.
function lift(events, beat, tps) {
  for (let v = 1; v <= 4; v++) {
    const line = events.filter((e) => e[3] === v).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k + 1 < line.length; k++) {
      const [a, b] = [line[k], line[k + 1]];
      if (a[0] + a[2] === b[0] && a[1] === b[1] && a[2] >= beat) a[2] -= tps;
    }
  }
}

exports.perform = perform;
exports.holdsOf = holdsOf;
exports.stretch = stretch;
exports.stretchOff = stretchOff;
exports.tickOf = tickOf;
exports.velocities = velocities;
exports.BASE = BASE;
exports.VOICE = VOICE;
