"use strict";
// Turns a score into the grid player's queue: one entry per step (a 16th note
// by default) holding a flat list of [voice, pitch, velocity] triples, where
// velocity 0 means note-off.
//
// Within a step, note-offs come before note-ons, so a repeated pitch is
// released before it is struck again. Note-offs are explicit events rather
// than durations, so a tempo change mid-note can't leave a note hanging.

function toSteps(score, stepsPerBeat = 4) {
  const ticksPerStep = score.ppq / stepsPerBeat;
  if (!Number.isInteger(ticksPerStep)) {
    throw new Error(`ppq ${score.ppq} does not divide into ${stepsPerBeat} steps per beat`);
  }

  const offs = new Map();
  const ons = new Map();
  const add = (map, step, triple) => {
    if (!map.has(step)) map.set(step, []);
    map.get(step).push(...triple);
  };

  for (const [ontime, pitch, duration, channel, velocity] of score.events) {
    if (!(duration > 0)) throw new Error(`event at tick ${ontime} has duration ${duration}`);
    if (!(velocity >= 1 && velocity <= 127)) {
      throw new Error(`event at tick ${ontime} has velocity ${velocity} (must be 1-127)`);
    }
    const start = ontime / ticksPerStep;
    const end = (ontime + duration) / ticksPerStep;
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
      throw new Error(`event at tick ${ontime} (duration ${duration}) is off the ${stepsPerBeat}-per-beat grid`);
    }
    add(ons, start, [channel, pitch, velocity]);
    add(offs, end, [channel, pitch, 0]);
  }

  const steps = [...new Set([...offs.keys(), ...ons.keys()])].sort((a, b) => a - b);
  return steps.map((step) => ({
    step,
    events: [...(offs.get(step) || []), ...(ons.get(step) || [])],
  }));
}

exports.toSteps = toSteps;
