"use strict";
// Golden tests for M6: tension and SPEAC against David Cope's published
// values (Computer Models of Musical Creativity, MIT Press 2006, ch. 7).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const tension = require("emi-tension");
const speac = require("emi-speac");

// The book's eight-beat example (ch. 7), in Cope's event form:
// [ontime ms, pitch, duration ms, channel, velocity], 1000 ms a quarter note.
// Quoted for testing; the values below are the book's.
const BOOK = [
  [0, 45, 1000, 4, 55], [0, 64, 1000, 3, 55], [0, 69, 1000, 2, 55], [0, 73, 1000, 1, 55],
  [1000, 57, 1000, 4, 55], [1000, 64, 1000, 3, 55], [1000, 69, 1000, 2, 55], [1000, 73, 500, 1, 55],
  [1500, 74, 500, 1, 55], [2000, 56, 1000, 4, 55], [2000, 64, 1000, 3, 55], [2000, 71, 1000, 2, 55],
  [2000, 76, 1000, 1, 55], [3000, 57, 1000, 4, 55], [3000, 64, 1000, 3, 55], [3000, 69, 1000, 2, 55],
  [3000, 73, 1000, 1, 55], [4000, 54, 1000, 4, 55], [4000, 64, 500, 3, 55], [4500, 62, 500, 3, 55],
  [4000, 69, 1000, 2, 55], [4000, 69, 1000, 1, 55], [5000, 55, 1000, 4, 55], [5000, 62, 1000, 3, 55],
  [5000, 67, 500, 2, 55], [5500, 66, 500, 2, 55], [5000, 71, 1000, 1, 55], [6000, 57, 1000, 4, 55],
  [6000, 57, 1000, 3, 55], [6000, 64, 1000, 2, 55], [6000, 73, 1000, 1, 55], [7000, 50, 1000, 4, 55],
  [7000, 57, 1000, 3, 55], [7000, 66, 1000, 2, 55], [7000, 74, 1000, 1, 55],
];

const close = (actual, expected, tolerance, label) => {
  assert.equal(actual.length, expected.length, label);
  actual.forEach((a, i) => assert.ok(Math.abs(a - expected[i]) <= tolerance, `${label}[${i}]: ${a} vs ${expected[i]}`));
};

test("tension: interval weights, octaves counted once, the least dissonant chord of a beat", () => {
  const above = (...intervals) => [0, ...intervals];
  assert.equal(tension.vertical(above(10, 16, 19)), 1.0); // m7 .7 + M3 .2 + P5 .1
  assert.equal(tension.vertical(above(7, 16)), 0.3);
  assert.equal(tension.vertical(above(4, 21)), 0.45);
  assert.equal(tension.vertical(above(2, 6, 11)), 2.35);
  assert.equal(tension.vertical([60, 67, 64, 72, 60, 67, 76]), 0.3, "C, E, G: the octaves don't count again");
  assert.equal(tension.vertical([45]), 0);
});

test("tension: metric weights per beat of the bar", () => {
  assert.deepEqual(tension.metricMap(4, 8, 4), [0.2, 0.05, 0.1, 0.05, 0.2, 0.05, 0.1, 0.05]);
  assert.deepEqual(tension.metricMap(1, 5, 6), [0.05, 0.1, 0.15, 0.05, 0.125]);
  assert.deepEqual(tension.metricMap(3, 1, 3), [0.15]);
});

test("tension: roots and root motion", () => {
  assert.deepEqual(tension.approach([45, 57, 64, 57, 62, 55, 57, 50]), [0, 0, 0.1, 0.1, 0.55, 0.1, 0.8, 0.1]);
  assert.deepEqual(tension.approach([25, 13, 83, 74, 19]), [0, 0, 0.7, 0.25, 0.1]);
  assert.equal(tension.rootOf([72]), 72);
  assert.equal(tension.rootOf([48, 64, 67, 72]), 48, "C major, root position");
  assert.equal(tension.rootOf([52, 60, 67]), 60, "C major, first inversion");
});

test("golden: the book example's beats, chords, roots, tensions and labels", () => {
  const beats = tension.copeBeats(BOOK);
  assert.deepEqual(beats.map((b) => b.length), [1, 2, 1, 1, 2, 2, 1, 1], "passing notes make two chords in a beat");
  const verticals = beats.map((b) => Math.min(...b.map((chord) => tension.vertical(chord.map((e) => e[1])))));
  assert.deepEqual(verticals, [0.3, 0.3, 0.5, 0.3, 0.5, 0.3, 0.3, 0.3]);
  const roots = beats.map((b) => tension.rootOf([...new Set(b.flatMap((chord) => chord.map((e) => e[1])))].sort((x, y) => x - y)));
  assert.deepEqual(roots, [45, 57, 64, 57, 62, 55, 57, 50]);

  const weights = tension.copeWeights(BOOK, 4, 8, 4);
  close(weights, [0.56, 0.41, 0.78, 0.51, 1.33, 0.51, 1.26, 0.51], 0.0001, "tensions");
  assert.equal(speac.average(weights), 0.73);
  assert.deepEqual(speac.develop(weights, 0.73), ["P", "E", "S", "E", "A", "C", "A", "C"]);
});

// Cope's analyses of Chopin's Mazurka Op. 33 No. 3 at all four levels, with
// the form his pattern matcher finds (a a b b a a). The music itself isn't in
// this repository: set EMI_SPEAC_REF to a clone of
// github.com/GolzitskyNikolay/SPEAC-analysis to run this test.
const ref = process.env.EMI_SPEAC_REF;
const chopin = ref && path.join(ref, "speac_tests", "speac_chapter_7_tests", "chopin_33_3.py");
const skip = chopin && fs.existsSync(chopin) ? false : "set EMI_SPEAC_REF to a clone of the SPEAC-analysis repo";

test("golden: Chopin Op. 33 No. 3, all four levels of Cope's analysis", { skip }, () => {
  const source = fs.readFileSync(chopin, "utf8");
  const events = JSON.parse(source.slice(source.indexOf("["), source.lastIndexOf("]") + 1));
  const form = [["a", 0], ["a", 24000], ["b", 56000], ["b", 67000], ["a", 96000], ["a", 120000]];
  const levels = speac.copeLevels(events, 3, form);
  const flat = (level) => level.map((x) => [x.labels.join(""), x.average]);
  assert.deepEqual(flat(levels.ursatz), [["S", 1.27]]);
  assert.deepEqual(flat(levels.background), [["PEE", 1.27]]);
  assert.deepEqual(flat(levels.middleground), [["PE", 1.27], ["SE", 1.32], ["PE", 1.23]]);
  assert.deepEqual(flat(levels.foreground), [
    ["PEEEPESEEEAPESAS", 1.22],
    ["PEESEEEEEEEEPESEEPEEESEEA", 1.32],
    ["SEEACSE", 1.15],
    ["PEPESEPESEEASEEEEEEEEPE", 1.49],
    ["PEEEPESEEEAPEEES", 1.22],
    ["PEEEPESEASEEPESEE", 1.24],
  ]);
});
