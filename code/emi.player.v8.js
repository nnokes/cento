// [v8] wrapper that fills the grid player's queue ahead of playback. Glue
// only: the logic is in code/lib. Patches load javascript/emi.player.bundle.js.
//
// JS never plays notes itself: it writes the queue, and the Max-native grid
// player reads one step per 16th note on the transport.
//
// Like every wrapper, this has ONE inlet and ONE outlet: [v8] runs the script
// after the patch has loaded, so cords to a second outlet would be deleted.
// Messages carry a selector instead, and the patch routes them with [route].
//
// Messages:  pattern -> queue the hard-coded 4-voice test phrase
//            clear   -> empty the queue
// Outlet:    coll clear | coll store <step> <voice pitch velocity>...  (to [coll ---emi.queue])
//            status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const queue = require("emi-queue");

function pattern() {
  try {
    const score = patterns.testChorale();
    const steps = queue.toSteps(score);
    outlet(0, "coll", "clear");
    for (const { step, events } of steps) outlet(0, "coll", "store", step, ...events);
    outlet(0, "status", "queued", score.name, steps.length, "steps");
  } catch (e) {
    outlet(0, "error", e.message);
  }
}

function clear() {
  outlet(0, "coll", "clear");
  outlet(0, "status", "queue", "cleared");
}
