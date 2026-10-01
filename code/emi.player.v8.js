// [v8] wrapper that fills the grid player's queue ahead of playback. Glue
// only: the logic is in code/lib and code/max. Patches load
// patchers/emi.player.bundle.js.
//
// JS never plays notes itself: it writes the queue, and the Max-native grid
// player reads one step per 16th note on the transport.
//
// Like every wrapper, this has one inlet and one outlet. Output messages carry
// a selector, and the patch routes them with [route]. (If a script ever fails
// to load, [v8] keeps one inlet and one outlet, so no cords are lost.)
//
// Messages:  loadmidi <path>       -> read a chorale (+ its .json sidecar) and queue it
//            key c | key original  -> play the loaded chorale in C major / A minor
//                                     (the default) or in its written key
//            pattern               -> queue the hard-coded 4-voice test phrase
//            clear                 -> empty the queue
// Outlet:    coll clear | coll store <step> <voice pitch velocity>...  (to [coll ---emi.queue])
//            status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const queue = require("emi-queue");
const ingest = require("emi-ingest");
const loader = require("emi-load");

let loaded = null; // the last chorale read, in its written key
let keyMode = "c";

function loadmidi(path) {
  try {
    loaded = loader.loadWork(path);
    queueWork(loader.inKey(loaded, keyMode));
  } catch (e) {
    outlet(0, "error", e.message);
  }
}

function key(mode) {
  if (mode !== "c" && mode !== "original") {
    outlet(0, "error", "key", "must", "be", "c", "or", "original");
    return;
  }
  keyMode = mode;
  if (loaded) queueWork(loader.inKey(loaded, keyMode));
}

function pattern() {
  try {
    queueWork(patterns.testChorale());
  } catch (e) {
    outlet(0, "error", e.message);
  }
}

function clear() {
  outlet(0, "coll", "clear");
  outlet(0, "status", "queue", "cleared");
}

function queueWork(work) {
  const { work: onGrid, moved } = ingest.quantize(work);
  const steps = queue.toSteps(onGrid);
  outlet(0, "coll", "clear");
  for (const { step, events } of steps) outlet(0, "coll", "store", step, ...events);
  const name = onGrid.key ? ingest.describe(onGrid) : onGrid.name;
  const note = moved ? ["quantized", moved] : [];
  outlet(0, "status", ...name.split(" "), "queued", ...note);
}
queueWork.local = 1;
