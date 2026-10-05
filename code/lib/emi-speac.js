"use strict";
// M6: SPEAC labels (David Cope, Computer Models of Musical Creativity, ch. 7).
// Every beat is labeled by its tension (emi-tension) compared with its
// neighbors and its phrase:
//   S statement    P preparation    E extension    A antecedent    C consequent
//
// Cope's rules, checked in this order for each tension w ("≈": within 0.2):
//   w ≈ the previous one                -> E
//   w ≈ the next one                    -> P (E if the previous label was P)
//   w ≈ the average                     -> S (E if the previous label was S)
//   w ≈ the largest                     -> A (E if the previous label was A)
//   after an A, w ≈ the smallest        -> C
//   otherwise                           -> S (E if the previous label was S)
//
// The labels apply at three levels for a chorale:
//   beat    each beat among the beats of its phrase (Cope's foreground)
//   bar     each bar (its beats' average) among the bars of its phrase
//   phrase  each phrase (its beats' average) among the phrases of the work
// Phrases end at cadences (fermatas), with the held or silent beats after
// them, as in emi-stream.

const tension = require("emi-tension");

const f32 = Math.fround;

function almost(a, b, allowance = 0.2) {
  if (a === null || a === undefined || b === null || b === undefined) return false;
  return Math.abs(f32(f32(a) - f32(b))) < allowance;
}

// Cope's develop-speac: one label per weight.
function develop(weights, average, largest = Math.max(...weights), smallest = Math.min(...weights)) {
  const labels = [];
  let previous = null;
  weights.forEach((w, i) => {
    const before = i > 0 ? weights[i - 1] : null;
    const after = i + 1 < weights.length ? weights[i + 1] : null;
    let label;
    if (almost(w, before)) {
      label = "E";
      previous = "E";
    } else if (almost(w, after)) {
      label = previous === "P" ? "E" : "P";
      previous = label;
    } else if (almost(w, average)) {
      label = previous === "S" ? "E" : "S";
      previous = "S";
    } else if (almost(w, largest)) {
      label = previous === "A" ? "E" : "A";
      previous = label;
    } else if (previous === "A" && almost(w, smallest)) {
      label = "C";
      previous = "C";
    } else {
      label = previous === "S" ? "E" : "S";
      previous = "S";
    }
    labels.push(label);
  });
  return labels;
}

// Cope's average of a list of tensions, cut to hundredths (his published
// averages are truncated, not rounded: 1.2253 is 1.22).
function average(weights) {
  let sum = 0;
  for (const w of weights) sum += w;
  return Math.floor((sum / weights.length) * 100 + 1e-9) / 100;
}

// Cope's do-speac-on-phrases for one phrase of his events: its labels and
// its average tension.
function copePhrase(events, beatsPerBar) {
  const startBeat = (tension.roundEven(events[0][0] / 1000) % beatsPerBar) + 1;
  const last = events[events.length - 1];
  const beats = tension.roundEven((last[0] + last[2] - events[0][0]) / 1000);
  const weights = tension.copeWeights(events, startBeat, beats, beatsPerBar);
  const avg = average(weights);
  return { labels: develop(weights, avg), average: avg, weights };
}

// Cope's four levels for a piece of his events, given its form: a list of
// [letter, start ms] phrases (from his form analysis). Returns
// { ursatz, background, middleground, foreground }, each a list of
// { labels, average }: the foreground has one per phrase, the middleground
// one per run of phrases with the same letter.
function copeLevels(events, beatsPerBar, form) {
  const foreground = [];
  let rest = events.slice();
  form.forEach(([, start], i) => {
    const end = i + 1 < form.length ? form[i + 1][1] : Infinity;
    foreground.push(copePhrase(rest.filter((e) => e[0] < end), beatsPerBar));
    rest = rest.filter((e) => e[0] >= end);
  });
  const level = (weights) => {
    const avg = average(weights);
    return { labels: develop(weights, avg), average: avg };
  };
  const middleground = [];
  for (let i = 0; i < form.length; ) {
    let j = i;
    while (j < form.length && form[j][0] === form[i][0]) j++;
    middleground.push(level(foreground.slice(i, j).map((p) => p.average)));
    i = j;
  }
  const background = level(middleground.map((m) => m.average));
  const ursatz = level([background.average]);
  return { ursatz: [ursatz], background: [background], middleground, foreground: foreground.map(({ labels, average: avg }) => ({ labels, average: avg })) };
}

// A work's groupings split into phrases (lists of indexes into `groupings`):
// a phrase ends after a cadence beat and the held or silent beats after it.
function phrasesOf(groupings) {
  const phrases = [];
  let current = [];
  let afterCadence = false;
  groupings.forEach((g, i) => {
    if (afterCadence && g.newNotes > 0) {
      phrases.push(current);
      current = [];
      afterCadence = false;
    }
    current.push(i);
    if (g.cadence) afterCadence = true;
  });
  if (current.length) phrases.push(current);
  return phrases;
}

// Tension and three-level labels for every grouping of one work (in C), in
// order: [{ tension, beat, bar, phrase }].
function analyze(groupings, beatsPerBar) {
  const tensions = tension.tensionsOf(groupings, beatsPerBar).map((t) => t.tension);
  const out = tensions.map((t) => ({ tension: t, beat: "S", bar: "S", phrase: "S" }));
  const phrases = phrasesOf(groupings);
  const phraseWeights = [];
  for (const phrase of phrases) {
    const weights = phrase.map((i) => tensions[i]);
    develop(weights, average(weights)).forEach((label, k) => (out[phrase[k]].beat = label));

    const bars = [];
    for (const i of phrase) {
      const bar = Math.floor(groupings[i].index / beatsPerBar);
      if (!bars.length || bars[bars.length - 1].bar !== bar) bars.push({ bar, members: [] });
      bars[bars.length - 1].members.push(i);
    }
    const barWeights = bars.map((b) => average(b.members.map((i) => tensions[i])));
    develop(barWeights, average(barWeights)).forEach((label, k) => {
      for (const i of bars[k].members) out[i].bar = label;
    });
    phraseWeights.push(average(weights));
  }
  develop(phraseWeights, average(phraseWeights)).forEach((label, k) => {
    for (const i of phrases[k]) out[i].phrase = label;
  });
  return out;
}

exports.develop = develop;
exports.average = average;
exports.copePhrase = copePhrase;
exports.copeLevels = copeLevels;
exports.phrasesOf = phrasesOf;
exports.analyze = analyze;
