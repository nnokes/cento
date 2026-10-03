"use strict";
// Max-only (M12): finds the user's Cento folder, ~/Documents/Cento. Each
// user's files live there (settings, Emily's taste, her works and
// snapshots), and in the downloads Cento's own chorales too (corpus/): a
// frozen device or an app has no patchers/ folder of its own to write in.
//
// Max's JavaScript can't ask for the home folder, so it's worked out from
// the paths Cento does know, in this order:
//   1. the patch's own folder, if it's in a home folder (a folder in
//      /Users): the repository, or a device in a Live set or Live's User
//      Library
//   2. Max's or Live's own path (max.apppath), the same way
//   3. each folder in /Users, on the volume Max runs from (an app in
//      /Applications): only the user's own Documents folder can be read
//   4. "~", in case Max reads it as the home folder
// The folder must already be there: Max can't make folders, so it comes in
// the download (for development: ~/Documents/cento, as the README says).
// It's seen in the list of Documents (in any case: macOS's disks don't tell
// Cento from cento), or, in case Max lists files only, by a file known to be
// in it (MARKERS: the one the download brings, or the settings).
//
//   find({ patchFolder, appPath, list, exists })  -> { path, how } or null
//     list(folder): the names of the files and folders in a folder ([] if
//     it can't be read); listNames below, with Max's Folder object
//     exists(path): whether a file is there (optional)
//   homeOf(path), volumeOf(path)

const NAME = "cento";
const MARKERS = ["About this folder.txt", "cento.settings.json"];

// The home folder a path is in: "Macintosh HD:", then /Users and a name
// (the volume and the name as Max writes them), or null.
function homeOf(path) {
  const m = /^(.*?[/\\]Users[/\\][^/\\]+)(?=[/\\]|$)/.exec(String(path || ""));
  return m ? m[1] : null;
}

// Max's paths start with the volume: "Macintosh HD:/Applications/..." ->
// "Macintosh HD:"; Windows: "C:/..." -> "C:". A plain "/..." has none.
function volumeOf(path) {
  const m = /^([^/\\:]+:)(?=[/\\])/.exec(String(path || ""));
  return m ? m[1] : null;
}

function find({ patchFolder, appPath, list, exists = () => false }) {
  const tried = new Set();
  const marked = (folder) => MARKERS.some((file) => exists(folder + "/" + file));
  const look = (home, how) => {
    if (!home || tried.has(home)) return null;
    tried.add(home);
    const documents = home + "/Documents";
    const name = list(documents).find((n) => String(n).toLowerCase() === NAME) || (marked(documents + "/Cento") ? "Cento" : null);
    return name ? { path: documents + "/" + name, how } : null;
  };
  const found = look(homeOf(patchFolder), "from the patch's folder") || look(homeOf(appPath), "from Max's own folder");
  if (found) return found;
  // Only with a path in Max's form, so that nothing but Max scans /Users.
  const volume = volumeOf(appPath) || volumeOf(patchFolder);
  if (volume) {
    const users = volume + "/Users";
    for (const name of list(users)) {
      if (String(name).startsWith(".") || name === "Shared") continue;
      const here = look(users + "/" + name, "from the folders in /Users");
      if (here) return here;
    }
  }
  return look("~", "from ~");
}

// The names in a folder, files and folders, with Max's Folder object; []
// if it isn't there or can't be read.
function listNames(path) {
  const names = [];
  let folder;
  try {
    folder = new Folder(path);
    folder.reset();
    while (!folder.end) {
      if (folder.filename) names.push(String(folder.filename));
      folder.next();
    }
  } catch (e) {
    // not there, or not ours to read
  } finally {
    try {
      if (folder) folder.close();
    } catch (e) {
      // already closed
    }
  }
  return names;
}

exports.NAME = NAME;
exports.MARKERS = MARKERS;
exports.find = find;
exports.homeOf = homeOf;
exports.volumeOf = volumeOf;
exports.listNames = listNames;
