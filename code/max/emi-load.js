"use strict";
// Max-only file access: reads a corpus MIDI file and its JSON sidecar with
// Max's File object and returns a work (see emi-ingest), lists the MIDI files
// in a folder with Max's Folder object, and writes MIDI files. Used by the
// [v8] wrappers in both products. Tests replace File and Folder with
// stand-ins backed by Node's fs.

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

// The .mid files in a folder, as full paths, sorted by name.
function listMidi(folderPath) {
  const folder = new Folder(folderPath);
  const names = [];
  try {
    folder.reset();
    while (!folder.end) {
      if (/\.midi?$/i.test(String(folder.filename))) names.push(String(folder.filename));
      folder.next();
    }
  } finally {
    folder.close();
  }
  const base = String(folderPath).replace(/[/\\]+$/, "");
  return names.sort().map((name) => base + "/" + name);
}

// Every chorale in a folder, as works. Files that can't be read are skipped and
// reported in `skipped`.
function loadFolder(folderPath) {
  const works = [];
  const skipped = [];
  for (const path of listMidi(folderPath)) {
    try {
      works.push(loadWork(path));
    } catch (e) {
      skipped.push(fileName(path) + ": " + e.message);
    }
  }
  return { works, skipped };
}

function writeBytes(path, bytes) {
  const file = new File(path, "write", "Midi");
  if (!file.isopen) throw new Error("can't write " + fileName(path));
  try {
    const list = Array.from(bytes);
    for (let i = 0; i < list.length; i += 1024) file.writebytes(list.slice(i, i + 1024));
    file.eof = file.position; // cut off the rest if the file was longer before
  } finally {
    file.close();
  }
}

// mode "c": in C major / A minor (the default); "original": as written.
function inKey(work, mode) {
  return mode === "original" ? ingest.original(work) : ingest.normalize(work);
}

exports.workId = workId;
exports.fileName = fileName;
exports.listMidi = listMidi;
exports.loadFolder = loadFolder;
exports.writeBytes = writeBytes;
exports.sidecarPath = sidecarPath;
exports.loadWork = loadWork;
exports.inKey = inKey;
