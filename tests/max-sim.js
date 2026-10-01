"use strict";
// A minimal stand-in for the [v8] object, so tests can load a bundle the way
// Max does: as a plain script in its own global scope, with no require(),
// module or exports. If a bundle accidentally depends on any of those, loading
// it here fails.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");

// Max calls a script's global functions by message name, except functions
// marked with .local = 1.
const MAX_GLOBALS = new Set(["outlet", "post", "error", "LiveAPI", "console"]);

function loadBundle(name, { LiveAPI } = {}) {
  const file = path.join(ROOT, "patchers", name + ".bundle.js");
  const sent = [];
  const context = {
    outlet: (index, ...atoms) => sent.push([index, ...atoms.flat()]),
    post: () => {},
    error: () => {},
    LiveAPI,
    console,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });

  return {
    context,
    // Sends a message to the script and returns what came out of its outlets.
    send(message, ...args) {
      if (typeof context[message] !== "function" || context[message].local === 1) {
        throw new Error(`${name}: no message handler for "${message}"`);
      }
      sent.length = 0;
      context[message](...args);
      return sent.slice();
    },
    // The global functions Max would accept as messages.
    handlers() {
      return Object.keys(context)
        .filter((key) => typeof context[key] === "function" && !MAX_GLOBALS.has(key))
        .filter((key) => context[key].local !== 1)
        .sort();
    },
  };
}

module.exports = { loadBundle };
