"use strict";
// M6: Cope's tension measure, the input to SPEAC (David Cope, Computer Models
// of Musical Creativity, MIT Press 2006, ch. 7). Re-implemented from the
// book's description; tests/speac.test.js checks it against the book's
// published values.
//
// The tension of a beat is the sum of four parts:
//   vertical  the chord's dissonance: every pitch class's interval above the
//             bass (only its lowest octave counts), weighted (WEIGHTS) and
//             summed. A beat with several chords (passing notes) takes the
//             lowest sum.
//   metric    the beat's place in the bar: (beat number x 0.1) / METRIC weight
//   duration  0.1 x (the beat's length in whole notes) + 0.1 x vertical
//   approach  how far the chord's root moved from the previous beat's root,
//             weighted like an interval (0 for the first beat)
//
// Cope's code works in 32-bit floats and rounds in particular places;
// copeWeights() follows it, so the book's numbers come out exactly.
// Events in Cope's form: [ontime ms, pitch, duration ms, channel, velocity],
// 1000 ms a quarter note.

// Interval weights, by semitones mod 12 (unison/octave 0 ... major 7th .9).
const WEIGHTS = [0, 1, 0.8, 0.225, 0.2, 0.55, 0.65, 0.1, 0.275, 0.25, 0.7, 0.9];
const weight = (semitones) => WEIGHTS[((semitones % 12) + 12) % 12];

// Metric weights per beat, by beats per bar.
const METRIC = { 2: [2, 2], 3: [2, 2, 2], 4: [2, 2, 6, 2], 6: [2, 2, 2, 8, 4, 3], 9: [2, 2, 2, 8, 4, 3, 14, 8, 4] };

// Root strength of each interval (mod 12), strongest first, and which of its
// two notes is the root: the lower one ("low") or the upper one ("up").
const ROOTS = [
  [7, "low"], [5, "up"], [4, "low"], [8, "up"], [3, "low"], [9, "up"],
  [2, "up"], [10, "low"], [1, "up"], [11, "low"], [0, "low"], [6, "up"],
];

const f32 = Math.fround;
const mod12 = (n) => ((n % 12) + 12) % 12;

// Round half to even, as Lisp and Python do.
function roundEven(x) {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
}

const round2 = (x) => roundEven(x * 100) / 100;

// The dissonance of one chord (a list of pitches).
function vertical(pitches) {
  const kept = [];
  for (const p of [...pitches].sort((a, b) => a - b)) {
    if (!kept.some((k) => mod12(k - p) === 0)) kept.push(p);
  }
  let sum = 0;
  for (const p of kept.slice(1)) sum += weight(p - kept[0]);
  return round2(sum);
}

// A beat made of several chords counts its least dissonant one.
const beatVertical = (chords) => Math.min(...chords.map(vertical));

function metric(beatInBar, beatsPerBar) {
  const k = (METRIC[beatsPerBar] || METRIC[4])[beatInBar - 1];
  return Number(((beatInBar * 0.1) / k).toPrecision(3));
}

// Metric tensions for `count` beats from beat `start` of the bar.
function metricMap(start, count, beatsPerBar) {
  const out = [];
  for (let i = 0, beat = start; i < count; i++, beat = beat === beatsPerBar ? 1 : beat + 1) {
    out.push(metric(beat, beatsPerBar));
  }
  return out;
}

// 0.1 x (length / a whole note) + 0.1 x vertical, rounded to hundredths.
function duration(lengthMs, verticalTension) {
  return f32(f32(0.01) * Math.round(lengthMs / 400 + verticalTension * 10 + 1e-9));
}

// Cope's root finder. `pitches`: the beat's distinct pitches, low to high.
// It finds the strongest root interval among all the intervals in the chord,
// then the first two notes forming it, scanning the chord's pairs in Cope's
// order (including the joins between pairs, as his code does).
function rootOf(pitches) {
  if (pitches.length === 1) return pitches[0];
  const intervals = new Set([0]);
  for (let i = 0; i < pitches.length - 1; i++) {
    for (let j = i; j < pitches.length; j++) intervals.add(mod12(pitches[j] - pitches[i]));
  }
  const [interval, which] = ROOTS.find(([iv]) => intervals.has(iv));
  const pairs = [];
  for (let i = 0; i < pitches.length - 1; i++) for (let j = i; j < pitches.length; j++) pairs.push(pitches[i], pitches[j]);
  for (let k = 0; k < pairs.length - 1; k++) {
    if (mod12(pairs[k + 1] - pairs[k]) === interval) {
      const [low, high] = [pairs[k], pairs[k + 1]].sort((a, b) => a - b);
      return which === "low" ? low : high;
    }
  }
  return pitches[0];
}

// Root motion weights: 0 for the first beat, then the interval between roots.
function approach(roots) {
  return roots.map((root, i) => (i === 0 ? 0 : weight(Math.abs(root - roots[i - 1]))));
}

// ---- Cope's own beats (for checking against the book)

// Splits events at every entrance and exit, and groups the resulting chords
// into beats: a chord whose notes are held into the next one belongs with it.
// Returns beats, each a list of chords, each a list of events (held ones
// marked "*").
function copeBeats(events) {
  const lex = (a, b) => {
    for (let i = 0; i < 5; i++) if (a[i] !== b[i]) return a[i] - b[i];
    return 0;
  };
  // Cope's triplet fix: a note ending 1 ms before or after the next note in
  // its channel is made to end exactly there.
  let pending = [];
  for (let channel = 1; channel <= 16; channel++) {
    const notes = events.filter((e) => e[3] === channel).map((e) => e.slice(0, 5));
    notes.forEach((e, i) => {
      const next = notes[i + 1];
      if (next && Math.abs(e[0] + e[2] - next[0]) === 1) e[2] -= e[0] + e[2] - next[0];
    });
    pending.push(...notes);
  }
  pending.sort(lex);

  const chords = [];
  while (pending.length) {
    const start = pending[0][0];
    const together = pending.filter((e) => e[0] === start);
    const byChannel = together.map((e, i) => [e, i]).sort((a, b) => a[0][3] - b[0][3] || a[1] - b[1]).map(([e]) => e);
    const next = pending.find((e) => e[0] !== start);
    let until;
    if (!chords.length) until = next ? next[0] : start + pending[0][2];
    else {
      const end = start + Math.min(...together.map((e) => e[2]));
      until = !next ? end : Math.min(end, next[0]);
    }
    chords.push(byChannel.map((e) => (e[0] + e[2] > until ? [e[0], e[1], until - e[0], e[3], e[4], "*"] : e.slice())));
    const rest = byChannel.map((e) => [until, e[1], e[2] - (until - e[0]), e[3], e[4]]).filter((e) => e[2] !== 0);
    pending = pending.filter((e) => !together.includes(e)).concat(rest).sort(lex);
  }

  const beats = [];
  chords.forEach((chord, i) => {
    const held = i > 0 && chords[i - 1].some((e) => e.length === 6);
    if (held) beats[beats.length - 1].push(chord);
    else beats.push([chord]);
  });
  return beats;
}

// Cope's run-the-speac-weightings: one tension per beat of `events`.
// startBeat: where the first beat falls in the bar; totalBeats: how many
// metric beats to count (Cope lists the shorter of his beats and these).
function copeWeights(events, startBeat, totalBeats, beatsPerBar) {
  const beats = copeBeats(events);
  const verticals = beats.map((beat) => beatVertical(beat.map((chord) => chord.map((e) => e[1]))));
  const metrics = metricMap(startBeat, totalBeats, beatsPerBar);
  const onsets = beats.map((beat) => beat[0][0][0]);
  const lengths = onsets.length < 2 ? [0] : onsets.slice(1).map((t, i) => t - onsets[i]);
  if (onsets.length >= 2) lengths.push(lengths[lengths.length - 1]);
  const durations = lengths.map((length, i) => duration(length, verticals[i]));
  const roots = beats.map((beat) => rootOf([...new Set(beat.flatMap((chord) => chord.map((e) => e[1])))].sort((a, b) => a - b)));
  const approaches = approach(roots);
  const n = Math.min(verticals.length, metrics.length, durations.length, approaches.length);
  const out = [];
  for (let i = 0; i < n; i++) out.push(f32(f32(f32(f32(verticals[i]) + f32(metrics[i])) + f32(durations[i])) + f32(approaches[i])));
  return out;
}

// ---- The engine's beats (emi-segment groupings)

// Tension of each grouping of one work, in order. A grouping's chords are the
// notes sounding at each moment a note starts within the beat.
function tensionsOf(groupings, beatsPerBar, beatMs = 1000) {
  let previousRoot = null;
  return groupings.map((g) => {
    const onsets = [...new Set(g.pieces.map((p) => p[0]))].sort((a, b) => a - b);
    const chords = onsets.map((t) => g.pieces.filter((p) => p[0] <= t && t < p[0] + p[2]).map((p) => p[1]));
    const v = beatVertical(chords);
    const root = rootOf([...new Set(g.pieces.map((p) => p[1]))].sort((a, b) => a - b));
    const a = previousRoot === null ? 0 : weight(Math.abs(root - previousRoot));
    previousRoot = root;
    const total = f32(f32(f32(f32(v) + f32(metric(g.beatInBar, beatsPerBar))) + duration(beatMs, v)) + f32(a));
    return { tension: round2(total), vertical: v, root };
  });
}

exports.WEIGHTS = WEIGHTS;
exports.roundEven = roundEven;
exports.round2 = round2;
exports.vertical = vertical;
exports.metric = metric;
exports.metricMap = metricMap;
exports.duration = duration;
exports.rootOf = rootOf;
exports.approach = approach;
exports.copeBeats = copeBeats;
exports.copeWeights = copeWeights;
exports.tensionsOf = tensionsOf;
