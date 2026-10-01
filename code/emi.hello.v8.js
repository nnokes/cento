// [v8] wrapper for the M0 "hello" spike. Glue only: the logic is in code/lib.
// Patches load the bundled copy, patchers/emi.hello.bundle.js (npm run build).
//
// Messages:  bang  -> hello with seed 1
//            int   -> hello with that seed
// Outlet 0:  hello <name> <version> seed <n> check <a> <b> <c> <d>

autowatch = 1;
inlets = 1;
outlets = 1;

const { hello } = require("emi-hello");

function bang() {
  report(1);
}

function msg_int(seed) {
  report(seed);
}

function report(seed) {
  const h = hello(seed);
  outlet(0, "hello", h.name, h.version, "seed", h.seed, "check", ...h.check);
}
report.local = 1;
