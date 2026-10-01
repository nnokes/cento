"use strict";
// Pure helpers for writing scores into Ableton Live clips. Nothing here calls
// the Live API, so all of it can be tested in Node.

const VOICE_TRACK_NAMES = [
  ["soprano", "s"],
  ["alto", "a"],
  ["tenor", "t"],
  ["bass", "b"],
];

// Per voice (index 0 = channel 1), the notes in the format Live's
// add_new_notes expects: start times and durations in beats.
function toLiveNotes(score) {
  const voices = Array.from({ length: score.voices }, () => []);
  for (const [ontime, pitch, duration, channel, velocity] of score.events) {
    if (!(channel >= 1 && channel <= score.voices)) {
      throw new Error(`event at tick ${ontime} has channel ${channel}; expected 1-${score.voices}`);
    }
    voices[channel - 1].push({
      pitch,
      start_time: ontime / score.ppq,
      duration: duration / score.ppq,
      velocity,
    });
  }
  return voices;
}

// Clip length in beats, rounded up to whole bars.
function clipLengthBeats(score) {
  const beatsPerBar = score.meter[0] * (4 / score.meter[1]);
  const beats = score.lengthTicks / score.ppq;
  return Math.max(1, Math.ceil(beats / beatsPerBar)) * beatsPerBar;
}

// Finds the Soprano, Alto, Tenor and Bass tracks by name (case-insensitive;
// "S", "A", "T" and "B" also match). Returns their four track indexes, or null
// unless each voice matches exactly one track.
function findVoiceTracks(trackNames) {
  const normalized = trackNames.map((name) => String(name).trim().toLowerCase());
  const found = [];
  for (const names of VOICE_TRACK_NAMES) {
    const matches = [];
    normalized.forEach((name, index) => {
      if (names.includes(name)) matches.push(index);
    });
    if (matches.length !== 1) return null;
    found.push(matches[0]);
  }
  return found;
}

// LiveAPI get() returns an array of atoms. These turn that into one value or
// one string (track names can contain spaces and may come back quoted).
function liveValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function liveText(value) {
  const text = Array.isArray(value) ? value.join(" ") : String(value);
  return text.replace(/^"(.*)"$/, "$1");
}

exports.toLiveNotes = toLiveNotes;
exports.clipLengthBeats = clipLengthBeats;
exports.findVoiceTracks = findVoiceTracks;
exports.liveValue = liveValue;
exports.liveText = liveText;
