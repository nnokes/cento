"use strict";
// Hard-coded 4-voice test phrase for the M0 playback and clip-writing spikes.
//
// Scores use Cope's event field order: [ontime, pitch, duration, channel, velocity].
// Channel is the voice: 1 soprano, 2 alto, 3 tenor, 4 bass. Times are ticks at
// 960 per quarter note.

const PPQ = 960;

// C major, one chord per beat, final chord a half note: I IV V I | ii6 V I.
// The repeated soprano C and alto G check that a note-off is sent before the
// same pitch is struck again.
const CHORDS = [
  // soprano, alto, tenor, bass, beats
  [72, 67, 64, 48, 1], // I
  [72, 69, 65, 53, 1], // IV
  [71, 67, 62, 55, 1], // V
  [72, 67, 64, 48, 1], // I
  [74, 69, 65, 53, 1], // ii6
  [71, 67, 62, 55, 1], // V
  [72, 67, 64, 48, 2], // I
];

const VELOCITY = [96, 80, 80, 88];

function testChorale() {
  const events = [];
  let ontime = 0;
  for (const chord of CHORDS) {
    const duration = chord[4] * PPQ;
    for (let voice = 0; voice < 4; voice++) {
      events.push([ontime, chord[voice], duration, voice + 1, VELOCITY[voice]]);
    }
    ontime += duration;
  }
  return { name: "test-cadence", ppq: PPQ, meter: [4, 4], voices: 4, lengthTicks: ontime, events };
}

exports.PPQ = PPQ;
exports.testChorale = testChorale;
