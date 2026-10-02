"use strict";
// Tiny made-up chorales for the compose tests. Not a test file (no .test.js).

const Q = 960;

// A 4-voice work in C from a list of chords, starting with a one-beat pickup
// on beat 4 (time 0 is a barline). Each chord is [soprano, alto, tenor, bass,
// beats]; ["rest", beats] is silence in every voice. fermataAt: beat numbers
// counted from time 0 (the pickup is beat 3).
function work(id, chords, { fermataAt = [] } = {}) {
  const events = [];
  let t = 3 * Q;
  for (const chord of chords) {
    const beats = chord[chord.length - 1];
    if (chord[0] !== "rest") chord.slice(0, 4).forEach((pitch, v) => events.push([t, pitch, beats * Q, v + 1, 90]));
    t += beats * Q;
  }
  return {
    id,
    ppq: Q,
    meter: [4, 4],
    key: { tonic: 0, mode: "major", from: "test" },
    transposedBy: 0,
    voices: 4,
    voiceNames: ["Soprano", "Alto", "Tenor", "Bass"],
    padTicks: 3 * Q,
    fermatas: fermataAt.map((beat) => beat * Q),
    lengthTicks: Math.ceil(t / (4 * Q)) * 4 * Q,
    events,
    warnings: [],
  };
}

const I = [72, 67, 64, 48];
const IV = [72, 69, 65, 53];
const V = [71, 67, 62, 55];
const phrase = (...chords) => chords.map((c) => [...c, 1]);

// The pickup is beat 3; the final I (a half note) starts on beat 12.
const cycle = [...phrase(I, IV, V, I, IV, V, I, IV, V), [...I, 2]];

module.exports = { Q, work, I, IV, V, phrase, cycle };
