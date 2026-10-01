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
//   view clear|note|seam|done ...                               -> the piano roll
//   status <text...> | error <text...>                          -> the host's status line
//
// Messages:
//   loadmidi <path>        read a chorale (+ its .json) and make it current
//   key c | key original   chorales in C major / A minor (default) or as written
//   corpus <folder>        read every chorale in a folder and build the lexicon
//   beats <n>              shortest piece to compose (default 32)
//   compose [seed]         compose a piece (seed defaults to the last one + 1)
//   exportmidi <path>      write the current score as a MIDI file
//   writeclips             write the current score as Live clips (Live only)
//   testclip               write the test phrase as Live clips (Live only)
//   pattern                make the test phrase current
//   clear                  empty the queue

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const queue = require("emi-queue");
const ingest = require("emi-ingest");
const lexicon = require("emi-lexicon");
const composer = require("emi-compose");
const files = require("emi-load");
const clips = require("emi-clips");

let loaded = null; // the last chorale read, in its written key
let keyMode = "c";
let db = null;
let minBeats = 32;
let lastSeed = 0;
let current = null; // { score, name }

function loadmidi(path) {
  attempt(() => {
    loaded = files.loadWork(path);
    showChorale();
  });
}

function key(mode) {
  if (mode !== "c" && mode !== "original") {
    outlet(0, "error", "key", "must", "be", "c", "or", "original");
    return;
  }
  keyMode = mode;
  if (loaded && current && current.chorale) showChorale();
}

function corpus(folder) {
  attempt(() => {
    const { works, skipped } = files.loadFolder(folder);
    if (!works.length) throw new Error("no .mid files in " + files.fileName(folder));
    db = lexicon.build(works);
    const s = lexicon.stats(db);
    const words = ["corpus", s.works, "chorales,", s.groupings, "beats,", Math.round(100 * s.deadEndShare) + "%", "dead", "ends"];
    if (skipped.length) words.push("(" + skipped.length, "skipped)");
    outlet(0, "status", ...words);
  });
}

function beats(n) {
  minBeats = Math.max(4, Math.min(256, Math.round(n)));
  outlet(0, "status", "pieces", "of", minBeats + "+", "beats");
}

function compose(seed) {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    const useSeed = seed === undefined ? lastSeed + 1 : Math.round(seed);
    lastSeed = useSeed;
    const result = composer.compose(db, { seed: useSeed, beats: minBeats });
    if (!result.ok) {
      outlet(0, "error", "no", "piece", "for", "seed", useSeed, "with", minBeats + "+", "beats;", "try", "another", "seed", "or", "more", "chorales");
      return;
    }
    const s = composer.summary(result.piece);
    show(result.piece, result.piece.id, false);
    outlet(0, "status", result.piece.id + ":", s.beats, "beats", "from", s.sources, "chorales");
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

// Piano roll: notes colored by source chorale (composed pieces) or by voice.
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
    for (let i = 1; i < prov.length; i++) if (prov[i].work !== prov[i - 1].work) outlet(0, "view", "seam", prov[i].tick);
  }
  outlet(0, "view", "done");
}
draw.local = 1;
