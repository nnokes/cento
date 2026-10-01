"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

const smf = require("emi-smf");

// Builds a file by hand: header, then tracks given as raw event bytes (each
// starting with its delta time). "End of track" is appended.
function handMade(format, ppq, tracks) {
  const u32 = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const bytes = [..."MThd"].map((c) => c.charCodeAt(0));
  bytes.push(...u32(6), 0, format, 0, tracks.length, ppq >> 8, ppq & 255);
  for (const events of tracks) {
    const data = [...events, 0x00, 0xff, 0x2f, 0x00];
    bytes.push(...[..."MTrk"].map((c) => c.charCodeAt(0)), ...u32(data.length), ...data);
  }
  return Uint8Array.from(bytes);
}

test("parse: running status, velocity-0 note-offs and meta events", () => {
  const file = handMade(0, 480, [
    [
      0x00, 0xff, 0x03, 0x04, 0x54, 0x65, 0x73, 0x74, // track name "Test"
      0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20, // tempo 500000 us = 120 BPM
      0x00, 0xff, 0x58, 0x04, 0x03, 0x02, 0x18, 0x08, // 3/4
      0x00, 0xff, 0x59, 0x02, 0xfe, 0x01, // 2 flats, minor (G minor)
      0x00, 0x90, 0x3c, 0x64, // C4 on
      0x00, 0x40, 0x50, //       E4 on (running status)
      0x83, 0x60, 0x3c, 0x00, // 480 ticks later: C4 off (vel 0, running status)
      0x00, 0x40, 0x00, //       E4 off
      0x00, 0xc0, 0x05, //       program change (ignored)
      0x00, 0x91, 0x43, 0x50, // G4 on, channel 2
      0x81, 0x70, 0x81, 0x43, 0x40, // 240 ticks later: G4 off (0x80 type)
    ],
  ]);
  const midi = smf.parse(file);
  assert.equal(midi.format, 0);
  assert.equal(midi.ppq, 480);
  assert.equal(midi.tracks[0].name, "Test");
  assert.deepEqual(midi.tempos, [{ tick: 0, usPerQuarter: 500000 }]);
  assert.deepEqual(midi.timeSignatures, [{ tick: 0, num: 3, den: 4 }]);
  assert.deepEqual(midi.keySignatures, [{ tick: 0, sf: -2, minor: true }]);
  assert.deepEqual(midi.tracks[0].notes, [
    { on: 0, pitch: 60, dur: 480, channel: 1, vel: 100 },
    { on: 0, pitch: 64, dur: 480, channel: 1, vel: 80 },
    { on: 480, pitch: 67, dur: 240, channel: 2, vel: 80 },
  ]);
  assert.deepEqual(midi.warnings, []);
});

test("parse: stray note-offs and unfinished notes become warnings", () => {
  const midi = smf.parse(
    handMade(0, 96, [
      [
        0x00, 0x80, 0x30, 0x00, // off without on
        0x00, 0x90, 0x3c, 0x64, // on, never released
        0x60, 0xb0, 0x07, 0x64, // controller 96 ticks later
      ],
    ]),
  );
  assert.equal(midi.warnings.length, 2);
  assert.deepEqual(midi.tracks[0].notes, [{ on: 0, pitch: 60, dur: 96, channel: 1, vel: 100 }]);
});

test("parse: rejects files it can't read", () => {
  assert.throws(() => smf.parse(Uint8Array.from([1, 2, 3, 4])), /not a MIDI file/);
  const smpte = handMade(1, 0, [[]]);
  smpte[12] = 0xe7; // division with the SMPTE bit set
  assert.throws(() => smf.parse(smpte), /SMPTE/);
});

test("write then parse returns the same notes, meter, tempo and key", () => {
  const tracks = [
    {
      name: "Soprano",
      channel: 1,
      notes: [
        { on: 0, pitch: 72, dur: 960, vel: 96 },
        { on: 960, pitch: 72, dur: 960, vel: 96 }, // same pitch, back to back
        { on: 1920, pitch: 71, dur: 480, vel: 90 },
      ],
    },
    {
      name: "Bass",
      channel: 4,
      notes: [
        { on: 0, pitch: 48, dur: 1920, vel: 88 },
        { on: 200000, pitch: 43, dur: 960, vel: 88 }, // multi-byte delta time
      ],
    },
  ];
  const midi = smf.parse(smf.write({ ppq: 960, tempoBpm: 90, meter: [3, 4], keySignature: { sf: 3, minor: false }, tracks }));
  assert.equal(midi.format, 1);
  assert.equal(midi.ppq, 960);
  assert.equal(midi.tracks.length, 3); // conductor + 2
  assert.deepEqual(midi.timeSignatures, [{ tick: 0, num: 3, den: 4 }]);
  assert.equal(Math.round(60000000 / midi.tempos[0].usPerQuarter), 90);
  assert.deepEqual(midi.keySignatures, [{ tick: 0, sf: 3, minor: false }]);
  for (const [i, track] of tracks.entries()) {
    assert.equal(midi.tracks[i + 1].name, track.name);
    assert.deepEqual(
      midi.tracks[i + 1].notes,
      track.notes.map((n) => ({ ...n, channel: track.channel })),
    );
  }
  assert.deepEqual(midi.warnings, []);
});
