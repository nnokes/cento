"use strict";
// Keys: names, key signatures, estimating a key from notes, and the
// transposition that brings a work to C major or A minor (the common key EMI
// analyzes in).
//
// A key is { tonic: pitch class 0-11, mode: "major" | "minor" }.

const PC_NAMES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const LETTER_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Krumhansl-Kessler key profiles (Krumhansl 1990).
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const mod12 = (n) => ((n % 12) + 12) % 12;

// "A", "F#", "B-" (music21's flat), "Bb", "Eb", "C##" -> pitch class.
function tonicFromName(name) {
  const match = /^([A-Ga-g])([#sb-]*)$/.exec(String(name).trim());
  if (!match) throw new Error("not a note name: " + name);
  let pc = LETTER_PC[match[1].toUpperCase()];
  for (const c of match[2]) pc += c === "#" || c === "s" ? 1 : -1;
  return mod12(pc);
}

function keyName(key) {
  return PC_NAMES[key.tonic] + " " + key.mode;
}

// MIDI key signature (sf = sharps, negative for flats) -> key.
function fromKeySignature({ sf, minor }) {
  const major = mod12(sf * 7);
  return { tonic: minor ? mod12(major + 9) : major, mode: minor ? "minor" : "major" };
}

// Key -> MIDI key signature, using the spelling with the fewest accidentals.
function toKeySignature(key) {
  const major = key.mode === "minor" ? mod12(key.tonic + 3) : key.tonic;
  let best = null;
  for (let sf = -7; sf <= 7; sf++) {
    if (mod12(sf * 7) === major && (best === null || Math.abs(sf) < Math.abs(best))) best = sf;
  }
  return { sf: best, minor: key.mode === "minor" };
}

function correlation(a, b) {
  const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  return da && db ? num / Math.sqrt(da * db) : 0;
}

// Krumhansl-Schmuckler key finding: correlate the duration-weighted
// pitch-class histogram with each of the 24 rotated profiles.
// events: [[ontime, pitch, duration, ...]]
function estimate(events) {
  const histogram = new Array(12).fill(0);
  for (const [, pitch, duration] of events) histogram[mod12(pitch)] += duration;
  let best = null;
  for (const [mode, profile] of [["major", MAJOR_PROFILE], ["minor", MINOR_PROFILE]]) {
    for (let tonic = 0; tonic < 12; tonic++) {
      const rotated = profile.map((_, pc) => profile[mod12(pc - tonic)]);
      const score = correlation(histogram, rotated);
      if (!best || score > best.score) best = { tonic, mode, score };
    }
  }
  return { tonic: best.tonic, mode: best.mode, confidence: best.score };
}

// Semitones that move the key to C major or A minor by the shorter way:
// -6 to +5, so a voice never moves more than a tritone.
function transpositionToCommon(key) {
  const target = key.mode === "minor" ? 9 : 0;
  const up = mod12(target - key.tonic);
  return up >= 6 ? up - 12 : up;
}

exports.PC_NAMES = PC_NAMES;
exports.tonicFromName = tonicFromName;
exports.keyName = keyName;
exports.fromKeySignature = fromKeySignature;
exports.toKeySignature = toKeySignature;
exports.estimate = estimate;
exports.transpositionToCommon = transpositionToCommon;
