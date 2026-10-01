"use strict";
// Corpus ingest: a parsed MIDI file (plus the JSON sidecar written by
// tools/export-chorales.py, when there is one) becomes a *work*, the engine's
// representation of one piece:
//
// {
//   id, title, source,
//   ppq: 960, meter: [num, den], tempoBpm,
//   key: { tonic, mode, from },   // from: "sidecar" | "key signature" | "estimate"
//   transposedBy,                 // semitones applied since reading the file
//   voices, voiceNames,
//   padTicks,                     // silence before a pickup (time 0 is a barline)
//   fermatas: [tick],             // phrase ends
//   lengthTicks,                  // whole bars
//   events: [[ontime, pitch, duration, voice, velocity]],   // Cope's field order
//   warnings: [string]
// }

const keys = require("emi-key");
const smf = require("emi-smf");

const PPQ = 960;
const SATB = ["Soprano", "Alto", "Tenor", "Bass"];

const byTime = (a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1];

function barTicks(meter) {
  return (meter[0] * PPQ * 4) / meter[1];
}

// The notes of each voice: the sidecar's voice tracks if given; otherwise
// every track that has notes; a single track using several channels (a type-0
// file) is split by channel.
function voiceNotes(midi, sidecar) {
  const listed = sidecar && sidecar.midi && sidecar.midi.voiceTracks;
  if (listed) {
    return listed.map((index) => {
      if (!midi.tracks[index]) throw new Error(`sidecar lists track ${index}, but the file has ${midi.tracks.length}`);
      return { name: midi.tracks[index].name, notes: midi.tracks[index].notes };
    });
  }
  const withNotes = midi.tracks.filter((track) => track.notes.length);
  if (withNotes.length === 1) {
    const channels = [...new Set(withNotes[0].notes.map((n) => n.channel))].sort((a, b) => a - b);
    if (channels.length > 1) {
      return channels.map((c) => ({ name: "", notes: withNotes[0].notes.filter((n) => n.channel === c) }));
    }
  }
  return withNotes.map((track) => ({ name: track.name, notes: track.notes }));
}

function fromMidi(midi, { id = "untitled", sidecar = null } = {}) {
  const warnings = [...midi.warnings];

  const scale = PPQ / midi.ppq;
  let rounded = 0;
  const ticks = (t) => {
    const exact = t * scale;
    if (exact !== Math.round(exact)) rounded++;
    return Math.round(exact);
  };

  const voices = voiceNotes(midi, sidecar);
  if (!voices.length) throw new Error("no notes in this MIDI file");
  const events = [];
  voices.forEach((voice, v) => {
    for (const note of voice.notes) {
      const on = ticks(note.on);
      const end = ticks(note.on + note.dur);
      events.push([on, note.pitch, Math.max(1, end - on), v + 1, note.vel]);
    }
  });
  events.sort(byTime);
  if (rounded) warnings.push(`${rounded} times rounded converting ${midi.ppq} to ${PPQ} ticks per quarter`);

  let meter = [4, 4];
  if (sidecar && sidecar.meter) meter = sidecar.meter.split("/").map(Number);
  else if (midi.timeSignatures.length) meter = [midi.timeSignatures[0].num, midi.timeSignatures[0].den];
  if (new Set(midi.timeSignatures.map((ts) => ts.num + "/" + ts.den)).size > 1) {
    warnings.push("the meter changes; using " + meter.join("/"));
  }

  let key;
  if (sidecar && sidecar.key) {
    key = { tonic: keys.tonicFromName(sidecar.key.tonic), mode: sidecar.key.mode, from: "sidecar" };
  } else if (midi.keySignatures.length) {
    key = { ...keys.fromKeySignature(midi.keySignatures[0]), from: "key signature" };
  } else {
    const estimate = keys.estimate(events);
    key = { tonic: estimate.tonic, mode: estimate.mode, from: "estimate" };
  }

  const quarters = (q) => Math.round(q * PPQ);
  const lastEnd = Math.max(...events.map(([on, , duration]) => on + duration));
  const bar = barTicks(meter);
  return {
    id,
    title: (sidecar && sidecar.title) || null,
    source: (sidecar && sidecar.source) || "MIDI file",
    ppq: PPQ,
    meter,
    tempoBpm: midi.tempos.length ? Math.round(6000000000 / midi.tempos[0].usPerQuarter) / 100 : 100,
    key,
    transposedBy: 0,
    voices: voices.length,
    voiceNames: voices.map((voice, i) =>
      (sidecar && sidecar.parts && sidecar.parts[i]) || voice.name || (voices.length === 4 ? SATB[i] : "Voice " + (i + 1)),
    ),
    padTicks: sidecar && sidecar.padQuarters ? quarters(sidecar.padQuarters) : 0,
    fermatas: sidecar && sidecar.fermatasQuarters ? sidecar.fermatasQuarters.map(quarters) : [],
    lengthTicks: Math.ceil(lastEnd / bar) * bar,
    events,
    warnings,
  };
}

// A copy of the work moved by `semitones`; transposedBy keeps the running total.
function transpose(work, semitones) {
  return {
    ...work,
    key: { ...work.key, tonic: (((work.key.tonic + semitones) % 12) + 12) % 12 },
    transposedBy: work.transposedBy + semitones,
    events: work.events.map(([on, pitch, duration, voice, velocity]) => [on, pitch + semitones, duration, voice, velocity]),
  };
}

// In C major or A minor, by the shorter way.
function normalize(work) {
  return transpose(work, keys.transpositionToCommon(work.key));
}

// Back in the key it was read in.
function original(work) {
  return transpose(work, -work.transposedBy);
}

// Moves note starts and ends to the nearest step (a 16th by default). Returns
// the new work and how many events moved.
function quantize(work, stepsPerBeat = 4) {
  const step = work.ppq / stepsPerBeat;
  let moved = 0;
  const events = work.events.map(([on, pitch, duration, voice, velocity]) => {
    const start = Math.round(on / step) * step;
    const end = Math.max(start + step, Math.round((on + duration) / step) * step);
    if (start !== on || end !== on + duration) moved++;
    return [start, pitch, end - start, voice, velocity];
  });
  events.sort(byTime);
  return { work: { ...work, events }, moved };
}

function toMidi(work) {
  return smf.write({
    ppq: work.ppq,
    tempoBpm: work.tempoBpm,
    meter: work.meter,
    keySignature: keys.toKeySignature(work.key),
    tracks: work.voiceNames.map((name, v) => ({
      name,
      channel: v + 1,
      notes: work.events
        .filter((e) => e[3] === v + 1)
        .map(([on, pitch, dur, , vel]) => ({ on, pitch, dur, vel })),
    })),
  });
}

// One line for a status display, e.g.
// "bwv347 A major -> C major (+3) 4/4 18 bars 6 phrases"
function describe(work) {
  const bars = work.lengthTicks / barTicks(work.meter);
  const read = original(work).key;
  const parts = [work.id, keys.keyName(read)];
  if (work.transposedBy) {
    parts.push("->", keys.keyName(work.key), "(" + (work.transposedBy > 0 ? "+" : "") + work.transposedBy + ")");
  }
  parts.push(work.meter.join("/"), bars + " bars", work.fermatas.length + " phrases");
  return parts.join(" ");
}

exports.PPQ = PPQ;
exports.fromMidi = fromMidi;
exports.transpose = transpose;
exports.normalize = normalize;
exports.original = original;
exports.quantize = quantize;
exports.toMidi = toMidi;
exports.describe = describe;
exports.barTicks = barTicks;
