"use strict";
// emi-userfolder (M12): finding ~/Documents/Cento from the paths Max knows,
// on a pretend disk (a map of folders to the names in them).
const test = require("node:test");
const assert = require("node:assert/strict");
const { find, homeOf, volumeOf, listNames } = require("emi-userfolder");

const disk = (folders) => (path) => folders[path] || [];
// Paths as Max writes them on a Mac. Built from pieces, so that the check
// for personal paths (tools/check-paths.js) doesn't take them for real ones.
const HD = "Macintosh HD:";
const USERS = HD + "/" + "Users";
const ANN = USERS + "/ann";

test("user folder: home and volume from Max's paths", () => {
  assert.equal(homeOf(ANN + "/Documents/GitHub/cento/patchers"), ANN);
  assert.equal(homeOf("/" + "Users/ann"), "/" + "Users/ann");
  assert.equal(homeOf("C:/" + "Users/ann/Documents/cento/patchers"), "C:/" + "Users/ann");
  assert.equal(homeOf(HD + "/Applications/Cento.app/Contents/Resources"), null);
  assert.equal(homeOf(null), null);
  assert.equal(volumeOf(HD + "/Applications/Max.app"), HD);
  assert.equal(volumeOf("C:/Program Files/Cycling '74"), "C:");
  assert.equal(volumeOf("/tmp/emi-1/patchers"), null);
});

test("user folder: found beside the patch's home (the repository, or a device in the User Library)", () => {
  const list = disk({ [ANN + "/Documents"]: ["GitHub", "cento", "Max 9"] });
  assert.deepEqual(find({ patchFolder: ANN + "/Documents/GitHub/cento/patchers", appPath: HD + "/Applications/Max.app", list }), {
    path: ANN + "/Documents/cento",
    how: "from the patch's folder",
  });
  // A device in Live's User Library, Live in /Applications.
  const user = find({ patchFolder: ANN + "/Music/Ableton/User Library/Presets", appPath: HD + "/Applications/Ableton Live 12 Suite.app", list });
  assert.equal(user.path, ANN + "/Documents/cento");
});

test("user folder: an app in /Applications finds it through /Users (other people's Documents can't be read)", () => {
  const list = disk({
    [USERS]: [".localized", "Shared", "bob", "ann"],
    [USERS + "/Shared/Documents"]: ["Cento"], // skipped: not anyone's own
    [ANN + "/Documents"]: ["Cento"],
  });
  assert.deepEqual(find({ patchFolder: HD + "/Applications/Cento.app/Contents/Resources/C74/patchers", appPath: HD + "/Applications/Cento.app", list }), {
    path: ANN + "/Documents/Cento",
    how: "from the folders in /Users",
  });
});

test("user folder: Max's own folder, then ~; none when there's no Cento folder", () => {
  const app = disk({ [ANN + "/Documents"]: ["Cento"] });
  assert.equal(find({ patchFolder: "/somewhere/patchers", appPath: ANN + "/Applications/Max.app", list: app }).how, "from Max's own folder");
  const tilde = disk({ "~/Documents": ["cento"] });
  assert.deepEqual(find({ patchFolder: "/somewhere/patchers", appPath: null, list: tilde }), { path: "~/Documents/cento", how: "from ~" });
  const none = disk({ [USERS]: ["ann"], [ANN + "/Documents"]: ["GitHub", "Max 9"] });
  assert.equal(find({ patchFolder: ANN + "/Documents/GitHub/cento/patchers", appPath: HD + "/Applications/Max.app", list: none }), null);
});

test("user folder: if Max lists files only, the file the download brings (or the settings) shows it", () => {
  const files = new Set([ANN + "/Documents/Cento/About this folder.txt"]);
  const list = disk({ [ANN + "/Documents"]: [] }); // no folders listed
  assert.deepEqual(find({ patchFolder: ANN + "/Music/x", appPath: null, list, exists: (p) => files.has(p) }), {
    path: ANN + "/Documents/Cento",
    how: "from the patch's folder",
  });
  assert.equal(find({ patchFolder: ANN + "/Music/x", appPath: null, list }), null);
});

test("user folder: a plain path (no volume, no Max) never scans /Users", () => {
  const asked = [];
  find({ patchFolder: "/tmp/emi-1/patchers", appPath: null, list: (p) => (asked.push(p), []) });
  assert.deepEqual(asked, ["~/Documents"]);
});

test("user folder: says where it looked, for the Max window", () => {
  const looked = [];
  const list = disk({ [ANN + "/Documents"]: ["GitHub", "Max 9"] });
  assert.equal(find({ patchFolder: ANN + "/Documents/GitHub/cento/patchers", appPath: null, list, looked }), null);
  assert.deepEqual(looked, [ANN + "/Documents (2 names)", "~/Documents (0 names)"]);
});

test("user folder: Max's Folder lists files unless asked for folders, so both are asked for", () => {
  // As Max's Folder seemed to behave on a Mac: files only, unless its
  // typelist is ["fold"].
  global.Folder = class {
    constructor(path) {
      this.path = path;
      this.typelist = [];
    }
    reset() {
      this.names = this.path !== "Docs" ? [] : this.typelist.includes("fold") ? ["Cento", "GitHub"] : ["notes.txt"];
      this.i = 0;
    }
    get end() {
      return this.i >= this.names.length;
    }
    get filename() {
      return this.names[this.i];
    }
    next() {
      this.i++;
    }
    close() {}
  };
  try {
    assert.deepEqual(listNames("Docs"), ["notes.txt", "Cento", "GitHub"]);
    assert.deepEqual(listNames("nowhere"), []);
  } finally {
    delete global.Folder;
  }
});
