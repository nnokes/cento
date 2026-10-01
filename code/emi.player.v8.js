// [v8] wrapper that fills the grid player's queue ahead of playback. Glue
// only: the logic is in code/lib. Patches load javascript/emi.player.bundle.js.
//
// JS never plays notes itself: it writes the queue, and the Max-native grid
// player reads one step per 16th note on the transport.
//
// Messages:  pattern -> queue the hard-coded 4-voice test phrase
//            clear   -> empty the queue
// Outlet 0:  to [coll ---emi.queue]: "clear", "store <step> <voice pitch velocity>..."
// Outlet 1:  status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 2;

const patterns = require("emi-pattern");
const queue = require("emi-queue");

function pattern() {
  try {
    const score = patterns.testChorale();
    const steps = queue.toSteps(score);
    outlet(0, "clear");
    for (const { step, events } of steps) outlet(0, "store", step, ...events);
    outlet(1, "status", "queued", score.name, steps.length, "steps");
  } catch (e) {
    outlet(1, "error", e.message);
  }
}

function clear() {
  outlet(0, "clear");
  outlet(1, "status", "queue", "cleared");
}
