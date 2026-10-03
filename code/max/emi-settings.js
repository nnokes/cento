"use strict";
// Max-only: remembers settings between sessions in one small JSON file,
// cento.settings.json, in the folder of the engine's patch (patchers/; the
// file is git-ignored). Both products use the same file, so the corpora
// carry over between them.
//
//   folderOf(patcher)  the folder of the nearest saved patcher (the [v8]'s own
//                      patcher, then its parents), or null
//   pathIn(folder)     the settings file in that folder
//   read(path)         the settings, or {} if there are none or they're unreadable
//   write(path, settings)
//
// Emily's taste (M9) is kept the same way, in cento.taste.json in the same
// folder (also git-ignored), so it carries over between the products too:
//   tastePathIn(folder), backupPathIn(folder) (what "forget" sets aside)
// and (M10) the music Emily has accepted, in cento.emily.json, and her
// snapshots, in cento.snapshots.json:
//   emilyPathIn(folder), snapshotsPathIn(folder)
//
// The project was called ml_midi until after M11. migrate(folder) copies
// files with the old names (ml_midi.settings.json, ...) to the new ones the
// first time, so nothing is lost; the old files stay as they are.

const files = require("emi-load");

const NAME = "cento";
const LEGACY = "ml_midi"; // the name before Cento
const FILE_NAME = NAME + ".settings.json";
const TASTE_NAME = NAME + ".taste.json";
const BACKUP_NAME = NAME + ".taste.backup.json";
const EMILY_NAME = NAME + ".emily.json";
const SNAPSHOTS_NAME = NAME + ".snapshots.json";
const ALL = [FILE_NAME, TASTE_NAME, BACKUP_NAME, EMILY_NAME, SNAPSHOTS_NAME];

function folderOf(patcher) {
  for (let p = patcher; p; p = p.parentpatcher) {
    const path = p.filepath ? String(p.filepath) : "";
    const cut = path.lastIndexOf("/");
    if (cut > 0) return path.slice(0, cut);
  }
  return null;
}

function pathIn(folder) {
  return folder + "/" + FILE_NAME;
}

function tastePathIn(folder) {
  return folder + "/" + TASTE_NAME;
}

function backupPathIn(folder) {
  return folder + "/" + BACKUP_NAME;
}

function emilyPathIn(folder) {
  return folder + "/" + EMILY_NAME;
}

function snapshotsPathIn(folder) {
  return folder + "/" + SNAPSHOTS_NAME;
}

// Copies each file still under its old name (ml_midi.*) to its new name, if
// the new one isn't there yet. Returns the new names written.
function migrate(folder) {
  const copied = [];
  for (const name of ALL) {
    const from = folder + "/" + LEGACY + name.slice(NAME.length);
    const to = folder + "/" + name;
    try {
      if (!files.exists(to) && files.exists(from)) {
        files.writeText(to, files.readText(from));
        copied.push(name);
      }
    } catch (e) {
      // left under its old name
    }
  }
  return copied;
}

function read(path) {
  try {
    if (!files.exists(path)) return {};
    const settings = JSON.parse(files.readText(path));
    return settings && typeof settings === "object" && !Array.isArray(settings) ? settings : {};
  } catch (e) {
    return {};
  }
}

function write(path, settings) {
  files.writeText(path, JSON.stringify(settings, null, 2) + "\n");
}

exports.FILE_NAME = FILE_NAME;
exports.folderOf = folderOf;
exports.pathIn = pathIn;
exports.TASTE_NAME = TASTE_NAME;
exports.BACKUP_NAME = BACKUP_NAME;
exports.tastePathIn = tastePathIn;
exports.backupPathIn = backupPathIn;
exports.EMILY_NAME = EMILY_NAME;
exports.emilyPathIn = emilyPathIn;
exports.SNAPSHOTS_NAME = SNAPSHOTS_NAME;
exports.snapshotsPathIn = snapshotsPathIn;
exports.migrate = migrate;
exports.LEGACY = LEGACY;
exports.read = read;
exports.write = write;
