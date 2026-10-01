"use strict";
// Cuts a work into beat-long *groupings*, the units EMI recombines.
//
// A note that crosses a beat line is split into pieces flagged tiedIn /
// tiedOut, so the assembler can join them again. Each grouping records:
//
//   id, work, index           "bwv347:12", source work, beat number in the work
//   beatInBar                 1-based (time 0 is a barline: export pads pickups)
//   pieces                    [[on, pitch, dur, voice, vel, tiedIn, tiedOut]], on/dur within the beat
//   entryKey                  what each voice sounds at the start of the beat:
//                             "60" a new note, "~60" held over, "r" silent; joined by ","
//   destKey                   the next grouping's entryKey (null at the end of the work):
//                             where this beat's voices go next in the original
//   newNotes                  how many notes start inside this beat (0: pure continuation)
//   opening, cadence, final   first sounding beat; a fermata starts here; last beat of the work
//
// Groupings are only made for beats with sound; silent padding beats are skipped.

function segment(work, beatTicks = work.ppq) {
  const barTicks = (work.meter[0] * work.ppq * 4) / work.meter[1];
  const beatsPerBar = Math.round(barTicks / beatTicks);
  const beatCount = Math.ceil(work.lengthTicks / beatTicks);
  const fermataBeats = new Set(work.fermatas.map((tick) => Math.floor(tick / beatTicks)));

  const beats = [];
  for (let b = 0; b < beatCount; b++) {
    const start = b * beatTicks;
    const end = start + beatTicks;
    const pieces = [];
    const entry = new Array(work.voices).fill("r");
    for (const [on, pitch, dur, voice, vel] of work.events) {
      const off = on + dur;
      if (off <= start || on >= end) continue;
      const tiedIn = on < start;
      const tiedOut = off > end;
      const from = Math.max(on, start);
      pieces.push([from - start, pitch, Math.min(off, end) - from, voice, vel, tiedIn ? 1 : 0, tiedOut ? 1 : 0]);
      if (on <= start) entry[voice - 1] = (tiedIn ? "~" : "") + pitch;
    }
    pieces.sort((a, b2) => a[0] - b2[0] || a[3] - b2[3]);
    beats.push({
      index: b,
      beatInBar: (b % beatsPerBar) + 1,
      pieces,
      entryKey: entry.join(","),
      newNotes: pieces.filter((p) => !p[5]).length,
    });
  }

  const sounding = beats.filter((beat) => beat.pieces.length > 0);
  const last = sounding.length ? sounding[sounding.length - 1].index : -1;
  return sounding.map((beat, i) => {
    const next = beats[beat.index + 1];
    return {
      id: work.id + ":" + beat.index,
      work: work.id,
      index: beat.index,
      beatInBar: beat.beatInBar,
      pieces: beat.pieces,
      entryKey: beat.entryKey,
      destKey: next && next.pieces.length ? next.entryKey : null,
      newNotes: beat.newNotes,
      opening: i === 0,
      cadence: fermataBeats.has(beat.index),
      final: beat.index === last,
    };
  });
}

exports.segment = segment;
