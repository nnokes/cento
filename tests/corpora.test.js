"use strict";
// M11: the corpus as a list of folders, each on or off (emi-corpora).
const test = require("node:test");
const assert = require("node:assert/strict");

const corpora = require("emi-corpora");
const { work, cycle } = require("./synthetic");

test("corpora: a list from the settings file is made safe; the old single folder becomes a list", () => {
  assert.deepEqual(corpora.normalize(null), []);
  assert.deepEqual(corpora.normalize(null, "/music/corpus/"), [{ path: "/music/corpus", on: true, works: null, meter: null, modes: null }]);
  const list = corpora.normalize([
    { path: "/a", on: 1, works: 142, meter: "4/4", modes: "major" },
    { path: "/a/", on: 0 }, // the same folder again
    { path: "", on: 1 },
    null,
    { path: "/b", on: false, works: -3, meter: 7 },
  ], "/ignored");
  assert.deepEqual(list, [
    { path: "/a", on: true, works: 142, meter: "4/4", modes: "major" },
    { path: "/b", on: false, works: null, meter: null, modes: null },
  ]);
  assert.equal(corpora.nameOf("/music/ml_midi/corpus-both/"), "corpus-both");
  assert.equal(corpora.nameOf("C:\\music\\bach"), "bach");
});

test("corpora: add, switch on and off, only one, remove", () => {
  const list = [];
  assert.equal(corpora.add(list, "/a"), 0);
  assert.equal(corpora.add(list, "/b/"), 1);
  assert.deepEqual(list.map((f) => [f.path, f.on]), [["/a", true], ["/b", true]]);
  corpora.setOn(list, 0, 0);
  assert.equal(list[0].on, false);
  assert.equal(corpora.add(list, "/a"), 0, "adding a listed folder switches it on");
  assert.equal(list[0].on, true);
  corpora.only(list, 1);
  assert.deepEqual(list.map((f) => f.on), [false, true]);
  assert.equal(corpora.remove(list, 0).path, "/a");
  assert.deepEqual(list.map((f) => f.path), ["/b"]);
  assert.throws(() => corpora.setOn(list, 3, 1), /no folder 4 in the list/);
  assert.throws(() => corpora.remove(list, -1), /no folder 0 in the list/);
});

test("corpora: combining keeps each chorale once, in one meter, and says what was left out", () => {
  const major = ["a", "b", "c"].map((id) => work(id, cycle));
  const minor = ["d", "e"].map((id) => ({ ...work(id, cycle), key: { tonic: "A", mode: "minor" } }));
  const both = [...major, ...minor];
  const three = ["f", "g"].map((id) => ({ ...work(id, cycle), meter: [3, 4] }));
  const folders = { "/major": major, "/both": both, "/three": three, "/empty": [] };
  const read = (path) => {
    if (!(path in folders)) throw new Error("no such folder");
    return folders[path];
  };
  const list = corpora.normalize([
    { path: "/major", on: true },
    { path: "/both", on: true },
    { path: "/three", on: true },
    { path: "/empty", on: true },
    { path: "/gone", on: true },
    { path: "/off", on: false },
  ]);
  const result = corpora.combine(list, read);
  assert.deepEqual(result.works.map((w) => w.id), ["a", "b", "c", "d", "e"]);
  assert.equal(result.meter, "4/4");
  assert.equal(result.duplicates, 3);
  assert.deepEqual(result.used, [0, 1]);
  assert.deepEqual([...result.notes], [
    [1, "3 already in a folder above"],
    [2, "not used: its chorales are in 3/4, the corpus in 4/4"],
    [3, "no chorales in it"],
    [4, "can't read it: no such folder"],
  ]);
  // Each folder read is summarized; one that is off isn't read.
  assert.deepEqual(list.map((f) => [f.works, f.meter, f.modes]), [
    [3, "4/4", "major"], [5, "4/4", "major+minor"], [2, "3/4", "major"], [0, null, null], [null, null, null], [null, null, null],
  ]);

  // A folder whose every chorale is in a folder above gives nothing.
  const twice = corpora.normalize([{ path: "/both", on: true }, { path: "/major", on: true }]);
  assert.deepEqual([...corpora.combine(twice, read).notes], [[1, "not used: every chorale in it is already in a folder above"]]);
  // The first folder on sets the meter.
  const triple = corpora.normalize([{ path: "/three", on: true }, { path: "/major", on: true }]);
  const r = corpora.combine(triple, read);
  assert.deepEqual([r.meter, r.works.map((w) => w.id)], ["3/4", ["f", "g"]]);
  // From two or more folders, in file-name order, as one folder is read: the
  // same chorales make the same corpus whichever folders they come from.
  const split = { "/one": ["c", "a"].map((id) => work(id, cycle)), "/two": ["b", "a.1", "d"].map((id) => work(id, cycle)) };
  const fromTwo = corpora.combine(corpora.normalize([{ path: "/two", on: true }, { path: "/one", on: true }]), (p) => split[p]);
  assert.deepEqual(fromTwo.works.map((w) => w.id), ["a.1", "a", "b", "c", "d"], "a.1.mid sorts before a.mid");
  const fromOne = corpora.combine(corpora.normalize([{ path: "/one", on: true }]), (p) => split[p]);
  assert.deepEqual(fromOne.works.map((w) => w.id), ["c", "a"], "one folder: as read");
  // None on: no corpus.
  assert.deepEqual(corpora.combine(corpora.normalize([{ path: "/major", on: false }]), read).works, []);
});
