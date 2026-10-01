"use strict";
// Standard MIDI File reader and writer. Works on plain byte arrays
// (Uint8Array or arrays of numbers 0-255), so the same code runs in Node and
// in [v8], where Max's File object supplies the bytes.
//
// parse(bytes) -> {
//   format, ppq,
//   tracks: [{ name, notes: [{ on, pitch, dur, channel, vel }] }],   // channel 1-16
//   tempos: [{ tick, usPerQuarter }],
//   timeSignatures: [{ tick, num, den }],
//   keySignatures: [{ tick, sf, minor }],
//   warnings: [string]
// }
//
// write({ ppq, tempoBpm, meter, keySignature, tracks: [{ name, channel, notes }] })
//   -> Uint8Array, a type-1 file: track 0 holds tempo, meter and key; one track
//      per entry in `tracks`.

// ---------------------------------------------------------------- reading

function reader(bytes) {
  let pos = 0;
  const r = {
    get pos() {
      return pos;
    },
    set pos(value) {
      pos = value;
    },
    eof: () => pos >= bytes.length,
    u8() {
      if (pos >= bytes.length) throw new Error("unexpected end of file");
      return bytes[pos++] & 0xff;
    },
    u16() {
      return (r.u8() << 8) | r.u8();
    },
    u32() {
      return ((r.u8() << 24) | (r.u8() << 16) | (r.u8() << 8) | r.u8()) >>> 0;
    },
    text(length) {
      let s = "";
      for (let i = 0; i < length; i++) s += String.fromCharCode(r.u8());
      return s;
    },
    // Variable-length quantity: 7 bits per byte, high bit set on all but the last.
    vlq() {
      let value = 0;
      for (let i = 0; i < 4; i++) {
        const b = r.u8();
        value = (value << 7) | (b & 0x7f);
        if (!(b & 0x80)) return value;
      }
      throw new Error("variable-length number longer than 4 bytes at byte " + pos);
    },
  };
  return r;
}

function parse(bytes) {
  const r = reader(bytes);
  if (r.text(4) !== "MThd") throw new Error("not a MIDI file (no MThd header)");
  const headerLength = r.u32();
  const format = r.u16();
  const trackCount = r.u16();
  const division = r.u16();
  r.pos += headerLength - 6;
  if (division & 0x8000) throw new Error("SMPTE time division is not supported");
  if (format > 1) throw new Error("MIDI file format " + format + " is not supported");

  const result = {
    format,
    ppq: division,
    tracks: [],
    tempos: [],
    timeSignatures: [],
    keySignatures: [],
    warnings: [],
  };

  while (result.tracks.length < trackCount && !r.eof()) {
    const id = r.text(4);
    const length = r.u32();
    const end = r.pos + length;
    if (id === "MTrk") result.tracks.push(parseTrack(r, end, result, result.tracks.length));
    r.pos = end; // skip unknown chunks, and any bytes a track didn't use
  }
  if (result.tracks.length < trackCount) {
    result.warnings.push(`header says ${trackCount} tracks, found ${result.tracks.length}`);
  }
  return result;
}

function parseTrack(r, end, result, index) {
  const track = { name: "", notes: [] };
  const open = new Map(); // "channel:pitch" -> [{ on, vel }] (first in, first out)
  let tick = 0;
  let status = 0;

  const noteOff = (channel, pitch) => {
    const stack = open.get(channel + ":" + pitch);
    if (!stack || stack.length === 0) {
      result.warnings.push(`track ${index}: note-off without note-on (pitch ${pitch}, tick ${tick})`);
      return;
    }
    const start = stack.shift();
    track.notes.push({ on: start.on, pitch, dur: tick - start.on, channel, vel: start.vel });
  };

  while (r.pos < end) {
    tick += r.vlq();
    let byte = r.u8();
    if (byte < 0x80) {
      // Running status: reuse the previous status byte; this byte is data.
      if (!status) throw new Error(`track ${index}: data byte without a status byte`);
      r.pos -= 1;
      byte = status;
    }

    if (byte === 0xff) {
      const type = r.u8();
      const length = r.vlq();
      const dataStart = r.pos;
      if (type === 0x03 && !track.name) track.name = r.text(length);
      else if (type === 0x51 && length === 3) {
        result.tempos.push({ tick, usPerQuarter: (r.u8() << 16) | (r.u8() << 8) | r.u8() });
      } else if (type === 0x58 && length >= 2) {
        result.timeSignatures.push({ tick, num: r.u8(), den: 2 ** r.u8() });
      } else if (type === 0x59 && length === 2) {
        const sf = r.u8();
        result.keySignatures.push({ tick, sf: sf > 127 ? sf - 256 : sf, minor: r.u8() === 1 });
      } else if (type === 0x2f) {
        break;
      }
      r.pos = dataStart + length;
      continue;
    }
    if (byte === 0xf0 || byte === 0xf7) {
      r.pos += r.vlq(); // system exclusive: skip
      continue;
    }

    status = byte;
    const kind = byte & 0xf0;
    const channel = (byte & 0x0f) + 1;
    if (kind === 0x80) {
      const pitch = r.u8();
      r.u8();
      noteOff(channel, pitch);
    } else if (kind === 0x90) {
      const pitch = r.u8();
      const vel = r.u8();
      if (vel === 0) noteOff(channel, pitch);
      else {
        const key = channel + ":" + pitch;
        if (!open.has(key)) open.set(key, []);
        open.get(key).push({ on: tick, vel });
      }
    } else if (kind === 0xc0 || kind === 0xd0) {
      r.u8(); // program change, channel pressure
    } else {
      r.u8(); // aftertouch, controller, pitch bend
      r.u8();
    }
  }

  // Notes still sounding at the end of the track end there.
  for (const [key, stack] of open) {
    for (const start of stack) {
      const [channel, pitch] = key.split(":").map(Number);
      result.warnings.push(`track ${index}: note without note-off (pitch ${pitch}, tick ${start.on})`);
      track.notes.push({ on: start.on, pitch, dur: Math.max(1, tick - start.on), channel, vel: start.vel });
    }
  }
  track.notes.sort((a, b) => a.on - b.on || a.pitch - b.pitch);
  return track;
}

// ---------------------------------------------------------------- writing

function vlqBytes(value) {
  const out = [value & 0x7f];
  value >>>= 7;
  while (value > 0) {
    out.unshift((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  return out;
}

function u32Bytes(value) {
  return [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
}

function textBytes(text) {
  return Array.from(text, (c) => c.charCodeAt(0) & 0x7f);
}

// events: [{ tick, bytes }] in any order; returns an MTrk chunk.
function trackChunk(events) {
  const sorted = events
    .map((event, i) => ({ ...event, i }))
    .sort((a, b) => a.tick - b.tick || (a.order || 0) - (b.order || 0) || a.i - b.i);
  const data = [];
  let last = 0;
  for (const event of sorted) {
    data.push(...vlqBytes(event.tick - last), ...event.bytes);
    last = event.tick;
  }
  data.push(0x00, 0xff, 0x2f, 0x00);
  return [...textBytes("MTrk"), ...u32Bytes(data.length), ...data];
}

function meta(type, payload) {
  return [0xff, type, ...vlqBytes(payload.length), ...payload];
}

function write({ ppq, tempoBpm = 100, meter = [4, 4], keySignature = null, tracks }) {
  const conductor = [
    { tick: 0, bytes: meta(0x58, [meter[0], Math.round(Math.log2(meter[1])), 24, 8]) },
    { tick: 0, bytes: meta(0x51, [...u32Bytes(Math.round(60000000 / tempoBpm))].slice(1)) },
  ];
  if (keySignature) {
    conductor.push({ tick: 0, bytes: meta(0x59, [keySignature.sf & 0xff, keySignature.minor ? 1 : 0]) });
  }

  const chunks = [trackChunk(conductor)];
  for (const track of tracks) {
    const status = (track.channel - 1) & 0x0f;
    const events = [];
    if (track.name) events.push({ tick: 0, order: -1, bytes: meta(0x03, textBytes(track.name)) });
    for (const note of track.notes) {
      // At the same tick, note-offs (order 0) come before note-ons (order 1).
      events.push({ tick: note.on, order: 1, bytes: [0x90 | status, note.pitch, note.vel] });
      events.push({ tick: note.on + note.dur, order: 0, bytes: [0x80 | status, note.pitch, 0] });
    }
    chunks.push(trackChunk(events));
  }

  const header = [...textBytes("MThd"), ...u32Bytes(6), 0, 1, (chunks.length >> 8) & 0xff, chunks.length & 0xff, (ppq >> 8) & 0xff, ppq & 0xff];
  const out = header.concat(...chunks);
  return Uint8Array.from(out);
}

exports.parse = parse;
exports.write = write;
