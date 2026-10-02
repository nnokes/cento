// [v8] wrapper: the engine's core script, inside emi.engine. Glue only: the
// logic is in code/lib (the engine) and code/max (Max-only file and Live
// access). Patches load patchers/emi.core.bundle.js.
//
// It holds the *current score* (a loaded chorale, a composed piece or the
// test phrase), queues it for the grid player, draws it in the piano roll,
// exports it, and (in Live) writes it as clips. JS never plays notes itself.
//
// One inlet, one outlet; every output starts with a selector:
//   coll clear | coll store <step> <voice pitch velocity>...   -> [coll ---emi.queue]
//   view clear|note|seam|cadence|done ...                       -> the piano roll
//   status <text...> | error <text...>                          -> the panel's status line
//   setting <name> <value...>                                   -> a control to show a restored value
//
// Messages:
//   loadmidi <path>        read a chorale (+ its .json) and make it current
//   key c|original|0|1     chorales in C major / A minor (default) or as written
//   corpus <folder>        read every chorale in a folder and build the lexicon
//   beats <n>              shortest piece to compose (default 32)
//   form 1 | form 0        compose in the form of a chorale (M3, default) or freely (M2)
//   seed <n>               set the seed; compose with it if a corpus is loaded
//   compose [seed]         compose with the current seed (or this one)
//   next                   add 1 to the seed and compose
//   exportmidi <path>      write the current score as a MIDI file
//   writeclips             write the current score as Live clips (Live only)
//   autoclips 1 | 0        also write clips after every compose (Live only)
//   testclip               write the test phrase as Live clips (Live only)
//   pattern                make the test phrase current
//   clear                  empty the queue
//   remember <name> <value...>  keep a host setting (tempo, output port...) for next time
//   startup all|corpus     read the settings file; "all" restores every setting
//                          (Max version), "corpus" only reloads the last corpus
//                          (Live version: its controls are saved with the set);
//                          then compose with the current seed
//
// Settings live in ml_midi.settings.json next to this patch (emi-settings).
// Nothing is written before startup has read the file, so the values controls
// send while a patch loads can't overwrite what was saved.

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const queue = require("emi-queue");
const ingest = require("emi-ingest");
const lexicon = require("emi-lexicon");
const composer = require("emi-compose");
const forms = require("emi-form");
const files = require("emi-load");
const clips = require("emi-clips");
const settingsFile = require("emi-settings");

let loaded = null; // the last chorale read, in its written key
let keyMode = "c";
let db = null;
let minBeats = 32;
let useForm = true;
let currentSeed = 1;
let autoClips = false;
let current = null; // { score, name }
let settingsPath = null; // known once startup has read the settings
let remembered = {}; // the settings file's contents

function loadmidi(path) {
  attempt(() => {
    loaded = files.loadWork(path);
    showChorale();
  });
}

function key(mode) {
  if (mode === 0 || mode === "c") keyMode = "c";
  else if (mode === 1 || mode === "original") keyMode = "original";
  else {
    outlet(0, "error", "key", "must", "be", "c", "or", "original");
    return;
  }
  save();
  if (loaded && current && current.chorale) showChorale();
}

function corpus(folder) {
  attempt(() => {
    loadCorpus(folder);
    save();
  });
}

function beats(n) {
  minBeats = Math.max(4, Math.min(256, Math.round(n)));
  save();
  outlet(0, "status", "pieces", "of", minBeats + "+", "beats");
}

function form(on) {
  useForm = Boolean(on);
  save();
  if (useForm) outlet(0, "status", "pieces", "in", "the", "form", "of", "a", "chorale");
  else outlet(0, "status", "free", "pieces", "(M2),", minBeats + "+", "beats");
}

function seed(n) {
  currentSeed = clampSeed(n);
  save();
  if (db) composeNow(false);
}

function compose(n) {
  if (n !== undefined) {
    currentSeed = clampSeed(n);
    outlet(0, "setting", "seed", currentSeed);
    save();
  }
  composeNow(false);
}

function next() {
  currentSeed = clampSeed(currentSeed + 1);
  outlet(0, "setting", "seed", currentSeed);
  save();
  composeNow(false);
}

function autoclips(on) {
  autoClips = Boolean(on);
}

function remember(name, ...values) {
  remembered.host = remembered.host || {};
  remembered.host[name] = values;
  save();
}

function startup(mode) {
  const patcher = this && this.patcher; // `this` is the [v8] object
  attempt(() => {
    const folder = settingsFile.folderOf(patcher);
    if (!folder) {
      outlet(0, "error", "this", "patch", "has", "no", "folder,", "so", "settings", "won't", "be", "saved");
      return;
    }
    settingsPath = settingsFile.pathIn(folder);
    remembered = settingsFile.read(settingsPath);
    if (mode !== "corpus") restore();
    if (!remembered.corpus) return;
    try {
      loadCorpus(remembered.corpus);
    } catch (e) {
      outlet(0, "error", "can't", "reload", "the", "last", "corpus", "(" + files.fileName(remembered.corpus) + "):", ...String(e.message).split(" "));
      return;
    }
    composeNow(true);
  });
}

function exportmidi(path) {
  attempt(() => {
    if (!current) throw new Error("nothing to export yet");
    const target = /\.midi?$/i.test(String(path)) ? String(path) : path + ".mid";
    files.writeBytes(target, ingest.toMidi(current.score));
    outlet(0, "status", "exported", files.fileName(target));
  });
}

function writeclips() {
  attempt(() => {
    if (!current) throw new Error("load a chorale or compose a piece first");
    outlet(0, "status", ...clips.writeScore(current.score, current.name).split(" "));
  });
}

function testclip() {
  attempt(() => {
    const score = patterns.testChorale();
    outlet(0, "status", ...clips.writeScore(score, "EMI " + score.name).split(" "));
  });
}

function pattern() {
  attempt(() => {
    const score = patterns.testChorale();
    show(score, score.name, false);
    outlet(0, "status", score.name, "queued");
  });
}

function clear() {
  outlet(0, "coll", "clear");
  outlet(0, "status", "queue", "cleared");
}

// ---- helpers (not messages)

function clampSeed(n) {
  return Math.max(1, Math.min(99999, Math.round(Number(n)) || 1));
}
clampSeed.local = 1;

function loadCorpus(folder) {
  const { works, skipped } = files.loadFolder(folder);
  if (!works.length) throw new Error("no .mid files in " + files.fileName(folder));
  db = lexicon.build(works);
  remembered.corpus = String(folder);
  const s = lexicon.stats(db);
  const words = ["corpus", s.works, "chorales,", s.groupings, "beats,", Math.round(100 * s.deadEndShare) + "%", "dead", "ends"];
  if (skipped.length) words.push("(" + skipped.length, "skipped)");
  outlet(0, "status", ...words);
}
loadCorpus.local = 1;

// Composes with the current seed, shows the piece and reports it. After a
// click (not at startup), also writes clips if autoclips is on.
function composeNow(atStartup) {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    const options = { seed: currentSeed, beats: minBeats };
    const result = useForm ? forms.compose(db, options) : composer.compose(db, options);
    if (!result.ok) {
      if (useForm && !result.stats.tried.length) {
        outlet(0, "error", "no", "chorale", "is", minBeats + "+", "beats", "long;", "lower", "beats");
      } else {
        outlet(0, "error", "no", "piece", "for", "seed", currentSeed, "with", minBeats + "+", "beats;", "try", "another", "seed", "or", "more", "chorales");
      }
      return;
    }
    const piece = result.piece;
    show(piece, piece.id, false);
    let text = describePiece(piece);
    if (autoClips && !atStartup) text += "; " + clips.writeScore(piece, piece.id);
    outlet(0, "status", ...text.split(" "));
  });
}
composeNow.local = 1;

function describePiece(piece) {
  const s = composer.summary(piece);
  if (!piece.form) return `${piece.id}: ${s.beats} beats from ${s.sources} chorales`;
  const phrases = piece.form.phrases + (piece.form.phrases === 1 ? " phrase" : " phrases");
  let text = `${piece.id}: form of ${piece.form.template}, ${phrases}, ${piece.form.beats} beats, ${s.sources} chorales`;
  const relaxed = [];
  if (s.relaxed) relaxed.push(s.relaxed + (s.relaxed === 1 ? " octave move" : " octave moves"));
  if (piece.form.relaxed === 2) relaxed.push("any cadence bass");
  if (relaxed.length) text += " (" + relaxed.join(", ") + ")";
  return text;
}
describePiece.local = 1;

// Applies the saved settings to the engine and shows them on the controls
// (Max version). Host settings go back to the host as they were remembered.
function restore() {
  if (remembered.seed !== undefined) currentSeed = clampSeed(remembered.seed);
  if (remembered.beats !== undefined) minBeats = Math.max(4, Math.min(256, Math.round(remembered.beats)));
  if (remembered.form !== undefined) useForm = Boolean(remembered.form);
  if (remembered.key !== undefined) keyMode = remembered.key ? "original" : "c";
  outlet(0, "setting", "seed", currentSeed);
  outlet(0, "setting", "beats", minBeats);
  outlet(0, "setting", "form", useForm ? 1 : 0);
  outlet(0, "setting", "key", keyMode === "original" ? 1 : 0);
  for (const [name, values] of Object.entries(remembered.host || {})) {
    if (Array.isArray(values)) outlet(0, "setting", name, ...values);
  }
}
restore.local = 1;

// Writes the settings file (once startup has read it).
function save() {
  if (!settingsPath) return;
  remembered.seed = currentSeed;
  remembered.beats = minBeats;
  remembered.form = useForm ? 1 : 0;
  remembered.key = keyMode === "original" ? 1 : 0;
  try {
    settingsFile.write(settingsPath, remembered);
  } catch (e) {
    settingsPath = null;
    outlet(0, "error", "can't", "save", "settings:", ...String(e.message).split(" "));
  }
}
save.local = 1;

function attempt(action) {
  try {
    action();
  } catch (e) {
    outlet(0, "error", ...String(e.message).split(" "));
  }
}
attempt.local = 1;

function showChorale() {
  const work = files.inKey(loaded, keyMode);
  show(work, work.id + (work.transposedBy ? " in C" : ""), true);
  outlet(0, "status", ...ingest.describe(work).split(" "), "queued");
}
showChorale.local = 1;

// Makes a score current: queue it and draw it.
function show(score, name, chorale) {
  const { work } = ingest.quantize(score);
  current = { score: work, name, chorale };
  const steps = queue.toSteps(work);
  outlet(0, "coll", "clear");
  for (const { step, events } of steps) outlet(0, "coll", "store", step, ...events);
  draw(work);
}
show.local = 1;

// Piano roll: notes colored by source chorale (composed pieces) or by voice;
// seams where the source changes (level 1: voices moved by octaves); a mark
// at each cadence (fermata).
function draw(score) {
  const pitches = score.events.map((e) => e[1]);
  const barTicks = (score.meter[0] * score.ppq * 4) / score.meter[1];
  outlet(0, "view", "clear", score.lengthTicks, Math.min(...pitches), Math.max(...pitches), barTicks);
  const prov = score.provenance || null;
  const sources = prov ? [...new Set(prov.map((p) => p.work))] : [];
  const colorAt = (tick, voice) => {
    if (!prov) return voice - 1;
    let i = prov.length - 1;
    while (i > 0 && prov[i].tick > tick) i--;
    return sources.indexOf(prov[i].work);
  };
  for (const [on, pitch, dur, voice] of score.events) outlet(0, "view", "note", on, dur, pitch, colorAt(on, voice));
  if (prov) {
    for (let i = 1; i < prov.length; i++) {
      if (prov[i].work !== prov[i - 1].work || prov[i].level > 0) outlet(0, "view", "seam", prov[i].tick, prov[i].level || 0);
    }
  }
  for (const tick of score.fermatas || []) outlet(0, "view", "cadence", tick);
  outlet(0, "view", "done");
}
draw.local = 1;
