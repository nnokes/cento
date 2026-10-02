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
const MAX_GLOBALS = new Set(["outlet", "post", "error", "LiveAPI", "File", "Folder", "mgraphics", "box", "console"]);

// Stand-in for Max's File object, backed by Node's fs. Like Max's, readbytes
// returns at most the count asked for; a file opened for "write" is written to
// disk on close, up to eof.
class FsFile {
  constructor(filePath, access = "read") {
    this.path = filePath;
    this.access = access;
    this.position = 0;
    if (access === "write") {
      this.data = Buffer.alloc(0);
      this.eof = 0;
      this.isopen = true;
      return;
    }
    try {
      this.data = fs.readFileSync(filePath);
      this.eof = this.data.length;
      this.isopen = true;
    } catch {
      this.eof = 0;
      this.isopen = false;
    }
  }
  readbytes(count) {
    const chunk = Array.from(this.data.subarray(this.position, this.position + count));
    this.position += chunk.length;
    return chunk;
  }
  writebytes(bytes) {
    this.data = Buffer.concat([this.data.subarray(0, this.position), Buffer.from(bytes)]);
    this.position = this.data.length;
    this.eof = Math.max(this.eof, this.position);
  }
  close() {
    if (this.isopen && this.access === "write") fs.writeFileSync(this.path, this.data.subarray(0, this.eof));
    this.isopen = false;
  }
}

// Stand-in for Max's Folder object: lists the files in a folder.
class FsFolder {
  constructor(folderPath) {
    this.names = fs.readdirSync(folderPath);
    this.index = 0;
  }
  reset() {
    this.index = 0;
  }
  get end() {
    return this.index >= this.names.length;
  }
  get filename() {
    return this.names[this.index];
  }
  next() {
    this.index++;
  }
  close() {}
}

// Stand-in for [v8ui]'s mgraphics: records every drawing call.
function recordingGraphics(width = 360, height = 169) {
  const calls = [];
  const target = { size: [width, height], calls };
  return new Proxy(target, {
    get(obj, prop) {
      if (prop in obj) return obj[prop];
      return (...args) => calls.push([prop, ...args]);
    },
    set(obj, prop, value) {
      obj[prop] = value;
      return true;
    },
  });
}

function loadBundle(name, { LiveAPI, File = FsFile, Folder = FsFolder, mgraphics = recordingGraphics() } = {}) {
  const file = path.join(ROOT, "patchers", name + ".bundle.js");
  const sent = [];
  const posted = []; // what the script printed in the Max window
  const context = {
    outlet: (index, ...atoms) => sent.push([index, ...atoms.flat()]),
    post: (...atoms) => posted.push(atoms.join(" ")),
    error: () => {},
    LiveAPI,
    File,
    Folder,
    mgraphics,
    console,
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });

  return {
    context,
    posted,
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
