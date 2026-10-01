"use strict";
// Max-only: reads a corpus MIDI file and its JSON sidecar with Max's File
// object and returns a work (see emi-ingest). Used by the [v8] wrappers in
// both products. Tests replace File with a stand-in backed by Node's fs.

const smf = require("emi-smf");
const ingest = require("emi-ingest");

// Paths come from [opendialog], in Max's form ("Macintosh HD:/path/to/x.mid") or
// as plain absolute paths. Only the end of the path is touched here.
function fileName(path) {
  return String(path).split(/[/\\]/).pop();
}

function workId(path) {
  return fileName(path).replace(/\.midi?$/i, "");
}

function sidecarPath(path) {
  return String(path).replace(/\.midi?$/i, "") + ".json";
}

// All bytes of a file, as numbers 0-255. Reads in chunks: File.readbytes
// returns at most the count asked for.
function readBytes(path) {
  const file = new File(path, "read");
  if (!file.isopen) throw new Error("can't open " + fileName(path));
  const bytes = [];
  try {
    const size = file.eof;
    while (file.position < size) {
      const chunk = file.readbytes(Math.min(1024, size - file.position));
      if (!chunk || chunk.length === 0) break;
      for (let i = 0; i < chunk.length; i++) bytes.push(chunk[i] & 0xff);
    }
  } finally {
    file.close();
  }
  return bytes;
}

function exists(path) {
  const file = new File(path, "read");
  const open = file.isopen;
  if (open) file.close();
  return open;
}

// The sidecar is plain ASCII JSON (json.dumps escapes everything else).
function readSidecar(path) {
  if (!exists(path)) return null;
  return JSON.parse(String.fromCharCode(...readBytes(path)));
}

// path -> work, in the key it was written in.
function loadWork(path) {
  const midi = smf.parse(readBytes(path));
  const sidecar = readSidecar(sidecarPath(path));
  return ingest.fromMidi(midi, { id: workId(path), sidecar });
}

// mode "c": in C major / A minor (the default); "original": as written.
function inKey(work, mode) {
  return mode === "original" ? ingest.original(work) : ingest.normalize(work);
}

exports.workId = workId;
exports.sidecarPath = sidecarPath;
exports.loadWork = loadWork;
exports.inKey = inKey;
