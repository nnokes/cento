"use strict";
// M11: the corpus as a list of folders ("corpora"), each switched on or off.
// Composing uses every folder that is on, as one corpus. Host-agnostic: the
// engine reads the folders (emi-load) and keeps the list in its settings.
//
//   folder: { path, on, works, meter, modes }   works, meter and modes as
//   last read (null until then), so the corpus window can show folders that
//   are off without reading them.
//
// Combining (combine): the folders that are on, in list order. A chorale in
// more than one folder (corpus-both holds all of corpus) is used once, from
// the first. The corpus has one meter, the first folder's: chorales in
// another meter are left out, and a folder left with none says why. From
// two or more folders, the chorales are put in file-name order, as one
// folder is read: the same chorales make the same corpus (and so the same
// pieces) whichever folders they come from, listed in whatever order.

const SEPARATORS = /[/\\]+/;

function nameOf(path) {
  const parts = String(path).split(SEPARATORS).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : String(path);
}

function clean(path) {
  const text = String(path);
  return text.length > 1 ? text.replace(/[/\\]+$/, "") : text;
}

const count = (v) => (Number.isFinite(v) && v >= 0 ? Math.round(v) : null);

// The list as read from the settings file, made safe; `legacy` is the single
// folder older versions remembered ("corpus").
function normalize(list, legacy = null) {
  const out = [];
  if (Array.isArray(list)) {
    for (const f of list) {
      if (!f || typeof f.path !== "string" || !f.path) continue;
      const path = clean(f.path);
      if (out.some((g) => g.path === path)) continue;
      out.push({
        path,
        on: Boolean(f.on),
        works: count(f.works),
        meter: typeof f.meter === "string" ? f.meter : null,
        modes: typeof f.modes === "string" ? f.modes : null,
      });
    }
  }
  if (!out.length && typeof legacy === "string" && legacy) out.push({ path: clean(legacy), on: true, works: null, meter: null, modes: null });
  return out;
}

// Adds a folder (switched on), or switches it on if it's listed already.
// Returns its index.
function add(list, path) {
  const target = clean(path);
  const at = list.findIndex((f) => f.path === target);
  if (at >= 0) {
    list[at].on = true;
    return at;
  }
  list.push({ path: target, on: true, works: null, meter: null, modes: null });
  return list.length - 1;
}

function check(list, index) {
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0 || i >= list.length) throw new Error(`no folder ${Number(index) + 1} in the list`);
  return i;
}

function remove(list, index) {
  const [gone] = list.splice(check(list, index), 1);
  return gone;
}

function setOn(list, index, on) {
  list[check(list, index)].on = Boolean(Number(on));
}

// Only this folder on.
function only(list, index) {
  const i = check(list, index);
  list.forEach((f, k) => (f.on = k === i));
}

// What a folder holds, from its works as read: { works, meter, modes }.
function summarize(works) {
  const meters = [...new Set(works.map((w) => w.meter.join("/")))];
  const modes = [...new Set(works.map((w) => w.key && w.key.mode).filter(Boolean))].sort();
  return { works: works.length, meter: meters.length ? meters.join(",") : null, modes: modes.length ? modes.join("+") : null };
}

// The corpus from the folders that are on. `read(path)` gives a folder's
// works (or throws). Returns { works, meter, duplicates, used, notes }: used
// lists the folders that gave chorales; notes (Map: index -> text) says why a
// folder that is on gave none, or what of it was left out. Each folder's
// works, meter and modes are updated from what was read.
function combine(list, read) {
  const works = [];
  const seen = new Set();
  let meter = null;
  let duplicates = 0;
  const notes = new Map();
  const used = [];
  list.forEach((folder, index) => {
    if (!folder.on) return;
    let found;
    try {
      found = read(folder.path);
    } catch (e) {
      notes.set(index, "can't read it: " + e.message);
      return;
    }
    Object.assign(folder, summarize(found));
    if (!found.length) {
      notes.set(index, "no chorales in it");
      return;
    }
    let kept = 0;
    let otherMeter = 0;
    let twice = 0;
    for (const work of found) {
      const m = work.meter.join("/");
      if (meter === null) meter = m;
      if (m !== meter) {
        otherMeter++;
        continue;
      }
      if (seen.has(work.id)) {
        twice++;
        continue;
      }
      seen.add(work.id);
      works.push(work);
      kept++;
    }
    duplicates += twice;
    if (kept) used.push(index);
    if (!kept && otherMeter) notes.set(index, `not used: its chorales are in ${folder.meter}, the corpus in ${meter}`);
    else if (!kept && twice) notes.set(index, "not used: every chorale in it is already in a folder above");
    else if (otherMeter || twice) {
      const parts = [];
      if (twice) parts.push(`${twice} already in a folder above`);
      if (otherMeter) parts.push(`${otherMeter} in another meter left out`);
      notes.set(index, parts.join("; "));
    }
  });
  if (used.length > 1) {
    const key = (w) => w.id + ".mid"; // emi-load lists a folder's .mid files by name
    works.sort((a, b) => (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0));
  }
  return { works, meter, duplicates, notes, used };
}

exports.nameOf = nameOf;
exports.normalize = normalize;
exports.add = add;
exports.remove = remove;
exports.setOn = setOn;
exports.only = only;
exports.summarize = summarize;
exports.combine = combine;
