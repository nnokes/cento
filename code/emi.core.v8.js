// [v8] wrapper: the engine's core script, inside emi.engine. Glue only: the
// logic is in code/lib (the engine) and code/max (Max-only file and Live
// access). Patches load patchers/emi.core.bundle.js.
//
// It holds the *current score* (a loaded chorale, a composed piece, a stream
// of phrases or the test phrase), queues it for the grid player, draws it in
// the piano roll, exports it, and (in Live) writes it as clips. JS never plays
// notes itself.
//
// Signatures (M7): a corpus's signatures (emi-signatures) are listed in the
// Max window when it loads; with "sigs 1" (the default) pieces and stream
// phrases keep signature blocks at their cadences, shown as gold bands.
//
// Quality (M8): each composed piece's quotation measures and parallel fifths
// and octaves (emi-quality) go to the Max window; parallels are marked in the
// piano roll (grey: Bach's own, red: new).
//
// Emily (M9, emily-assoc): "like" and "dislike" rate what you hear: the
// beats selected in the piano roll (drag across it; a click clears), or
// else the stream phrase playing (the one before, in its first 1.5 s), or
// else the whole piece. Emily learns which musical features you like and
// composing prefers them among the choices the rules allow; "temperature"
// sets how much chance still plays (0: Emily's favourite choices; 1: as
// before M9; up to 3: more adventurous). Her taste is kept in
// cento.taste.json next to the settings file, and fades a little at each
// startup after a session with ratings. Each piece composed with a taste
// reports in the Max window how it compares with the same seed without one.
//
// Streaming (M5): with "stream 1", compose starts a stream of phrases. Two
// phrases are queued; when the player reaches the start of the last queued
// phrase it sends "need", and the next phrase is composed and queued. Changes
// to transpose, phrases and seed are heard from the next phrase composed.
//
// One inlet, one outlet; every output starts with a selector:
//   coll clear | coll store <step> <voice pitch velocity>...   -> [coll ---emi.queue]
//   restart                    -> the player: notes off; the queue starts again at the next bar
//   later <message>            -> back to this script through [deferlow]: long work in steps
//   streamat <step>            -> the player: send "need" when this step is reached
//   endat <step>               -> the player: send "ended" when this step (the last note-offs) is
//                                 reached, each time (999999: never). The Max version then stops.
//   view clear|note|seam|cadence|speac|signature|parallel|source|done -> the piano roll
//   status <text...> | error <text...>                          -> the panel's status line
//   setting <name> <value...>                                   -> a control to show a restored value
//   meter <numerator> <denominator>                             -> the Max version's transport (M8)
//   emily <text...>                                             -> the Emily panel: her taste in a line, with
//                                                                  only her strongest like and dislike (M9)
//   emilyview clear|like|dislike|rating|compare|pair|strength|weight|done
//             comparing <pairs done|-1> <pairs>                 (a taste comparison's progress)
//   corpusview clear|folder|summary|done                        -> the corpus window (M11): the folders
//                                                                  and what each gives the corpus
//                                                               -> the pop-up window: her taste in full, and
//                                                                  every feature's weight for the editor
//                                                                  (emi.taste; sent whenever it changes)
//
// Messages:
//   loadmidi <path>        read a chorale (+ its .json) and make it current
//   key c|original|0|1     chorales in C major / A minor (default) or as written
//   corpus <folder>        read every chorale in a folder and build the lexicon from it
//                          alone (M11: the folder joins the list of corpora, the only one on)
//   corpusadd <folder>     M11, from the corpus window: add a folder (switched on)
//   corpuson <n> 0|1       switch folder n of the list (from 1) off or on
//   corpusonly <n>         only folder n on
//   corpusremove <n>       take folder n off the list
//   corpusrescan           read the folders again (after adding chorales to one)
//   corpusbuild <id>       (from the engine itself, via later) build the corpus from the
//                          folders that are on, then compose the seed shown
//   beats <n>              shortest piece to compose (default 32)
//   form 1 | form 0        compose in the form of a chorale (M3, default) or freely (M2)
//   sigs 1 | sigs 0        keep signatures at cadences (M7, default) or not
//   seed <n>               set the seed; compose with it if a corpus is loaded
//   compose [seed]         compose with the current seed (or this one)
//   next                   add 1 to the seed and compose
//   stream 1 | stream 0    compose phrase by phrase while playing (M5), or whole pieces
//   phrases <n>            a stream ends after n phrases (0: endless)
//   transpose <n>          semitones (-12..12): at once for a whole piece, from the next phrase in a stream
//   need                   (from the player) queue the stream's next phrase
//   exportmidi <path>      write the current score as a MIDI file (and, for a composed
//                          piece or stream, its provenance as a .json next to it)
//   abtest <path>          write a blind A/B listening test (M8): a web page of 10
//                          pairs, each a chorale and a piece in its form
//   like | dislike         rate the selection, the stream phrase playing, or the piece (M9)
//   select <from> <to>     (from the piano roll) the beats from tick `from` to `to` are
//                          selected for rating; "select" alone clears the selection
//   temperature <0..3>     how much chance plays in composing (M9, default 1)
//   taste                  Emily's taste in the Max window, and how ten pieces compare
//                          with and without it (composed a piece at a time: tastestep)
//   tastestep <id>         (from the engine itself, via later) the comparison's next piece
//   forget                 start a new taste (the old one is kept in cento.taste.backup.json,
//                          and, M10, as a snapshot)
//   pin <feature> <weight> hold a musical feature (f:...) at a weight, -3..3 (the window's
//                          weight editor); unpin <feature> releases it, unpin alone all
//   strength <0..2>        how strongly her taste counts (1: as learned)
//   novelty <0..1>         M10: the chance that each phrase gets a variant (emily-vary)
//   accept                 M10: keep the selection, the stream phrase playing or the piece
//                          as a work of Emily's own (emily-memory); later pieces use it
//   unaccept <id>          put an accepted work aside (it stays in cento.emily.json)
//   mix <0..0.75>          how much her own music counts against Bach's (0: Bach only)
//   snapshot               keep her whole taste as it is now (one is also kept when a
//                          session starts, if it changed, and before a rollback)
//   rollback <id>          make snapshot <id>'s taste hers again, exactly (and so her corpus)
//   storetaste <path>      write her taste (weights, pins, strength, ratings) to a file
//   recalltaste <path>     make a stored taste hers (the one before is kept in the backup)
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
// Settings live in cento.settings.json (emi-settings) in the user's Cento
// folder, ~/Documents/Cento (M12, emi-userfolder), with Emily's files. With
// no Cento folder they stay next to this patch, in patchers/, as before M12;
// the first time the Cento folder is found, the files in patchers/ are
// copied to it. Nothing is written before startup has read the file, so the
// values controls send while a patch loads can't overwrite what was saved.

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
const streams = require("emi-stream");
const { segment } = require("emi-segment");
const speacLabels = require("emi-speac");
const signatureNames = require("emi-signatures");
const quality = require("emi-quality");
const provenanceOf = require("emi-provenance");
const abtests = require("emi-abtest");
const abtestPage = require("emi-abtest-page");
const emily = require("emily-assoc");
const variation = require("emily-vary");
const emilyMemory = require("emily-memory");
const corpora = require("emi-corpora");
const userFolder = require("emi-userfolder");

const NO_STEP = 999999; // "streamat" for "never"
const STEPS_PER_BEAT = 4;
const WINDOW = 4; // phrases of a stream shown in the piano roll
const GRACE_MS = 1500; // a rating this soon after a stream phrase starts is for the one before

let loaded = null; // the last chorale read, in its written key
let keyMode = "c";
let db = null;
let minBeats = 32;
let useForm = true;
let useSignatures = true;
let currentSeed = 1;
let autoClips = false;
let streaming = false;
let phrasesWanted = 8;
let transposeBy = 0;
let current = null; // { base (untransposed, or null for a stream), score, name, chorale }
let flow = null; // the stream being queued: { state, steps, events, provenance, fermatas, name }
let groupingsById = null; // { db, map }: the corpus's groupings by id, for the SPEAC lane
let signaturesById = null; // { db, map }: the corpus's signatures by id, for their names
let settingsPath = null; // known once startup has read the settings
let host = null; // "max" or "live", known from startup ("startup all" or "startup corpus")
let remembered = {}; // the settings file's contents
let memory = emily.create(); // Emily's memory: her taste (M9)
let tasteVersion = 0; // changes with every rating, so the prepared taste is redone
let prepared = null; // { db, version, value }: emily.prepare's result for the current corpus
let tastePath = null; // known once startup has read the settings
let tasteBackupPath = null;
let tasteText = null; // the taste file as last read or written: re-read when it changes
let temperatureValue = 1;
let selection = null; // { from, to }: ticks of the current score selected in the piano roll
let comparison = null; // the last "taste" comparison, for the window: { first, last, result }
let comparing = null; // a "taste" comparison under way, a piece at a time (tastestep)
let comparisons = 0; // comparisons started: each one's id
const COMPARE_PAIRS = 10; // seeds compared, each with her taste and without
// M10: the corpus as read (Bach's works), its database, and the database with
// Emily's own works too (null when she has none in use). db is the one in use.
let bachWorks = null;
let bachDb = null;
let herDb = null;
let builtFor = null; // what herDb was built from: accepted ids and the store
// M11: the corpus is every folder on this list that is switched on
// (emi-corpora). Each folder is read once (until a rescan or a "corpus").
let folders = [];
const folderCache = new Map(); // path -> { works, skipped }
let corpusReport = { used: new Set(), notes: new Map() }; // the last build, by folder path
let corpusBuilds = 0; // changes asked for: each one's build id (the last one builds)
let store = emilyMemory.createStore(); // every work ever accepted (cento.emily.json)
let storePath = null;
let storeText = null;
let snapshots = emilyMemory.createSnapshots(); // cento.snapshots.json
let snapshotsPath = null;
let snapshotsText = null;

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

// ---- M11: the corpus window. Each change is saved and shown at once; the
// corpus is built on the next turn (later -> corpusbuild), so the window
// answers first, and only the last of several quick changes builds.

function corpusadd(folder) {
  changeCorpora(() => corpora.add(folders, String(folder)));
}

function corpuson(n, on) {
  changeCorpora(() => corpora.setOn(folders, Number(n) - 1, on));
}

function corpusonly(n) {
  changeCorpora(() => corpora.only(folders, Number(n) - 1));
}

function corpusremove(n) {
  changeCorpora(() => folderCache.delete(corpora.remove(folders, Number(n) - 1).path));
}

function corpusrescan() {
  changeCorpora(() => folderCache.clear());
}

function corpusbuild(id) {
  if (id !== corpusBuilds) return; // a later change builds instead
  attempt(() => {
    try {
      if (buildCorpus() === "built") composeNow(false);
    } finally {
      save();
      showCorpora(false);
    }
  });
}

function changeCorpora(change) {
  attempt(() => {
    change();
    save();
    showCorpora(true);
    outlet(0, "status", "corpora", "changed:", "building", "the", "corpus...");
    outlet(0, "later", "corpusbuild", ++corpusBuilds);
  });
}
changeCorpora.local = 1;

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

function sigs(on) {
  useSignatures = Boolean(on);
  save();
  if (useSignatures) outlet(0, "status", "signatures", "kept", "at", "cadences");
  else outlet(0, "status", "no", "signatures", "(as", "in", "M6)");
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

function stream(on) {
  streaming = Boolean(on);
  save();
  if (streaming) outlet(0, "status", "phrase", "by", "phrase:", "compose", "starts", "a", "stream");
  else outlet(0, "status", "whole", "pieces");
}

function phrases(n) {
  phrasesWanted = Math.max(0, Math.min(64, Math.round(n)));
  save();
  if (phrasesWanted) outlet(0, "status", "streams", "end", "after", phrasesWanted, "phrases");
  else outlet(0, "status", "streams", "are", "endless");
}

function transpose(n) {
  transposeBy = Math.max(-12, Math.min(12, Math.round(n)));
  save();
  if (flow) outlet(0, "status", "transpose", signed(transposeBy), "from", "the", "next", "phrase");
  else if (current && current.base) show(current.base, current.name, current.chorale);
}

function need() {
  attempt(() => {
    if (!streaming || !flow || flow.state.finished) {
      outlet(0, "streamat", NO_STEP);
      return;
    }
    flow.playing = flow.state.phrases.length; // the last queued phrase has started
    flow.since = Date.now();
    appendPhrase();
  });
}

function remember(name, ...values) {
  remembered.host = remembered.host || {};
  remembered.host[name] = values;
  save();
}

function startup(mode) {
  const patcher = this && this.patcher; // `this` is the [v8] object
  host = mode === "corpus" ? "live" : "max";
  attempt(() => {
    const patchers = settingsFile.folderOf(patcher);
    if (!patchers) {
      outlet(0, "error", "this", "patch", "has", "no", "folder,", "so", "settings", "won't", "be", "saved");
      return;
    }
    // Files saved before the project was renamed (ml_midi.*.json) carry over.
    const carried = settingsFile.migrate(patchers);
    if (carried.length) post(`cento: carried over from ${settingsFile.LEGACY}.*: ${carried.join(", ")}\n`);
    const folder = dataFolder(patchers);
    settingsPath = settingsFile.pathIn(folder);
    remembered = settingsFile.read(settingsPath);
    folders = corpora.normalize(remembered.corpora, remembered.corpus); // before anything saves
    // A corpus folder under ~/Documents/ml_midi that was renamed to cento.
    const moved = corpora.followRename(folders, hasChorales);
    if (moved) post(`cento: ${moved} corpus ${moved === 1 ? "folder" : "folders"} found under the new name (Documents/cento)\n`);
    // Cento's own chorales (corpus/, in the Cento folder or next to
    // patchers/): listed once, the first time; the first switched on if
    // there's no other corpus.
    const offered = remembered.bundled ? 0 : offerBundled([folder, parentOf(patchers)]);
    if (moved || offered) {
      remembered.corpora = folders.map((f) => ({ ...f })); // the file as read, with the list as now
      try {
        settingsFile.write(settingsPath, remembered);
      } catch (e) {
        // written with the next change
      }
    }
    if (mode !== "corpus") restore();
    loadTaste(folder);
    const on = folders.filter((f) => f.on);
    if (!on.length) {
      showCorpora(false);
      return;
    }
    let built = false;
    try {
      built = buildCorpus();
    } finally {
      showCorpora(false);
    }
    if (!built) {
      const why = corpusReport.notes.get(on[0].path) || "no chorales in it";
      outlet(0, "error", "can't", "reload", "the", "last", "corpus", "(" + on.map((f) => corpora.nameOf(f.path)).join(", ") + "):", ...why.split(" "));
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
    if (!current.score.provenance || !db) {
      outlet(0, "status", "exported", files.fileName(target));
      return;
    }
    const sidecar = target.replace(/\.midi?$/i, ".json");
    const settings = { beats: minBeats, form: useForm, signatures: useSignatures, stream: Boolean(flow), transpose: transposeBy, temperature: temperatureValue, tasteRatings: memory.ratings };
    files.writeText(sidecar, JSON.stringify(provenanceOf.record(db, current.score, settings), null, 1) + "\n");
    outlet(0, "status", "exported", files.fileName(target), "and", files.fileName(sidecar));
  });
}

function abtest(path) {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    const target = /\.html?$/i.test(String(path)) ? String(path) : path + ".html";
    const test = abtests.build(db, { seed: currentSeed, signatures: useSignatures });
    if (!test.pairs.length) throw new Error("no chorale's form could be filled for the test; try more chorales");
    files.writeText(target, abtestPage.page(test));
    outlet(0, "status", "wrote", files.fileName(target) + ":", test.pairs.length, "pairs;", "open", "it", "in", "a", "web", "browser");
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
  flow = null;
  outlet(0, "restart");
  outlet(0, "streamat", NO_STEP);
  outlet(0, "endat", NO_STEP);
  outlet(0, "coll", "clear");
  outlet(0, "status", "queue", "cleared");
}

function like() {
  rateNow(1);
}

function dislike() {
  rateNow(-1);
}

// Both piano rolls (the panels' and the window's) show the selection, made in either.
function select(from, to) {
  if (from === undefined || to === undefined || !(Number(to) > Number(from)) || !current) {
    selection = null;
    outlet(0, "view", "highlight");
    return;
  }
  selection = { from: Number(from), to: Number(to) };
  outlet(0, "view", "highlight", selection.from, selection.to);
  const beats = Math.round((selection.to - selection.from) / current.score.ppq);
  outlet(0, "status", "selected", ...barsOf(current.score, selection.from, selection.to).split(" "), "(" + beats, beats === 1 ? "beat):" : "beats):", "like", "or", "dislike", "rates", "them");
}

function temperature(t) {
  temperatureValue = Math.max(0, Math.min(3, Math.round(Number(t) * 100) / 100 || 0));
  save();
  const words = temperatureValue === 0 ? "only Emily's favourite choices" : temperatureValue < 1 ? "less chance, more taste" : temperatureValue === 1 ? "as before Emily" : "more adventurous";
  outlet(0, "status", "temperature", temperatureValue.toFixed(2) + ":", ...words.split(" "), "(from", "the", "next", "piece", "or", "phrase)");
  showTaste();
}

function forget() {
  attempt(() => {
    syncTaste();
    const was = memory.ratings;
    takeSnapshot("before forgetting", true); // M10: a rollback can bring it back
    if (tastePath) files.writeText(tasteBackupPath, JSON.stringify(memory) + "\n");
    memory = emily.create();
    tasteVersion++;
    comparison = null;
    saveTaste();
    outlet(0, "emily", ...emily.summary(memory, 1).split(" "));
    showTaste();
    outlet(0, "status", "Emily", "forgot", "her", "taste", "(" + was, "ratings,", "kept", "in", settingsFile.BACKUP_NAME + ")");
  });
}

function pin(feature, weight) {
  attempt(() => {
    syncTaste();
    const value = emily.pin(memory, String(feature), weight);
    if (value === null) throw new Error("not a feature: " + feature);
    const learned = memory.weights[String(feature)] || 0;
    changedTaste();
    outlet(0, "status", ...`Emily: ${emily.nameOf(String(feature))} pinned at ${signedWeight(value)} (she learned ${signedWeight(learned)})`.split(" "));
  });
}

function unpin(feature) {
  attempt(() => {
    syncTaste();
    if (feature === undefined) {
      const count = emily.unpin(memory);
      changedTaste();
      outlet(0, "status", ...(count ? `Emily: ${count} ${count === 1 ? "pin" : "pins"} released; she uses what she learned` : "Emily: no pins to release").split(" "));
      return;
    }
    const name = String(feature);
    if (!emily.unpin(memory, name)) return;
    changedTaste();
    outlet(0, "status", ...`Emily: ${emily.nameOf(name)} released (back to ${signedWeight(memory.weights[name] || 0)}, what she learned)`.split(" "));
  });
}

function strength(value) {
  attempt(() => {
    syncTaste();
    const v = emily.setStrength(memory, value);
    changedTaste();
    const words = v === 0 ? "no taste" : v === 1 ? "as learned" : v < 1 ? "weaker than learned" : "stronger than learned";
    outlet(0, "status", ...`Emily's taste at strength ${v.toFixed(2)}: ${words} (from the next piece or phrase)`.split(" "));
  });
}

function novelty(value) {
  attempt(() => {
    syncTaste();
    const v = emily.setNovelty(memory, value);
    changedTaste();
    const words = v === 0 ? "no variants" : v === 1 ? "a variant in every phrase" : `a variant in about ${Math.round(v * 100)}% of phrases`;
    outlet(0, "status", ...`novelty ${v.toFixed(2)}: ${words} (from the next piece or phrase)`.split(" "));
  });
}

function accept() {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    if (!current || !current.score.provenance) throw new Error("Emily keeps composed music: compose a piece first");
    syncTaste();
    syncStore();
    const target = ratingTarget();
    const id = "emily-" + (store.works.length + 1);
    const work = emilyMemory.workOf(db, sourceScore(), { from: target.from, to: target.to, id, what: target.what, at: new Date().toISOString() });
    if (!work) throw new Error("nothing composed there to keep");
    store.works.push(work);
    saveStore();
    memory.accepted.push(id);
    if (memory.mix === 0) emily.setMix(memory, 0.5); // she can't use it at 0
    changedTaste();
    ensureCorpus();
    const beats = Math.round(work.events.reduce((end, e) => Math.max(end, e[0] + e[2]), 0) / work.ppq - work.padTicks / work.ppq);
    const varied = work.variants.length ? `, ${work.variants.length} varied` : "";
    const counted = herDb ? emilyMemory.counts(herDb).works : 0;
    outlet(0, "status", ...`accepted ${target.what} as ${id} (generation ${work.gen}, ${beats} beats${varied}); Emily has ${counted} ${counted === 1 ? "work" : "works"} of her own`.split(" "));
    const own = ownLine();
    if (own) post(own + "\n");
  });
}

function unaccept(id) {
  attempt(() => {
    syncTaste();
    const before = memory.accepted.length;
    memory.accepted = memory.accepted.filter((a) => a !== String(id));
    if (memory.accepted.length === before) throw new Error(`${id} isn't one of Emily's works in use`);
    changedTaste();
    ensureCorpus();
    outlet(0, "status", ...`${id} put aside: Emily no longer uses it (it stays in ${settingsFile.EMILY_NAME})`.split(" "));
  });
}

function mix(value) {
  attempt(() => {
    syncTaste();
    const v = emily.setMix(memory, value);
    changedTaste();
    ensureCorpus();
    const words = v === 0 ? "Bach only" : v === 0.5 ? "her own music counts as much as Bach's" : v < 0.5 ? "her own music counts less than Bach's" : "her own music counts more than Bach's";
    const none = memory.accepted.length ? "" : "; she has no music of her own yet: accept some";
    outlet(0, "status", ...`mix ${v.toFixed(2)}: ${words} (from the next piece or phrase)${none}`.split(" "));
  });
}

function snapshot() {
  attempt(() => {
    syncTaste();
    const entry = takeSnapshot("kept by hand", false);
    outlet(0, "status", ...`snapshot #${entry.id} kept: ${tasteCounts()}`.split(" "));
    showTaste();
  });
}

function rollback(id) {
  attempt(() => {
    syncTaste();
    syncSnapshots();
    const restored = emilyMemory.recall(snapshots, id);
    if (!restored) throw new Error(`no snapshot #${id}`);
    const was = takeSnapshot(`before rolling back to #${id}`, false);
    memory = emily.normalize(restored);
    changedTaste();
    ensureCorpus();
    const found = snapshots.list.find((s) => s.id === Number(id));
    outlet(0, "status", ...`rolled back to snapshot #${id} (${whenOf(found.at)}): ${tasteCounts()}; what was before is snapshot #${was.id}`.split(" "));
  });
}

function storetaste(path) {
  attempt(() => {
    syncTaste();
    const target = /\.json$/i.test(String(path)) ? String(path) : path + ".json";
    files.writeText(target, JSON.stringify(memory, null, 1) + "\n");
    outlet(0, "status", ...`stored Emily's taste in ${files.fileName(target)} (${tasteCounts()})`.split(" "));
  });
}

function recalltaste(path) {
  attempt(() => {
    const stored = settingsFile.read(String(path));
    if (!stored.weights && !stored.pins && stored.ratings === undefined) throw new Error(files.fileName(path) + " isn't a stored taste");
    syncTaste();
    takeSnapshot("before recalling " + files.fileName(path), true); // M10: a rollback can bring it back
    if (tasteBackupPath) files.writeText(tasteBackupPath, JSON.stringify(memory) + "\n");
    memory = emily.normalize(stored);
    changedTaste();
    const backup = tasteBackupPath ? `; the one before is in ${settingsFile.BACKUP_NAME}` : "";
    outlet(0, "status", ...`recalled Emily's taste from ${files.fileName(path)} (${tasteCounts()})${backup}`.split(" "));
  });
}

// Emily's taste in the Max window, and ten pieces (from the current seed)
// composed with and without it, compared.
function taste() {
  attempt(() => {
    syncTaste();
    const earlier = memory.sessions ? `; ${memory.sessions} earlier ${memory.sessions === 1 ? "session" : "sessions"}` : "";
    post(`cento: Emily's taste: ${emily.summary(memory, 6)}${earlier}\n`);
    const { likes, dislikes } = emily.opinions(memory, 8, 0.05);
    if (likes.length) post("  likes: " + likes.map(([f, w]) => `${emily.nameOf(f)} +${w.toFixed(2)}`).join(", ") + "\n");
    if (dislikes.length) post("  dislikes: " + dislikes.map(([f, w]) => `${emily.nameOf(f)} ${w.toFixed(2)}`).join(", ") + "\n");
    if (!db || !useForm || !memory.ratings) {
      outlet(0, "status", ...("Emily: " + emily.summary(memory)).split(" "));
      return;
    }
    // Twenty pieces take a few seconds: composed one at a time, each on its
    // own turn of Max's low-priority queue (later -> [deferlow] -> tastestep),
    // so the patch stays responsive and the window shows the progress.
    comparing = {
      id: ++comparisons, first: currentSeed, k: 0, pairs: [], db, version: tasteVersion, taste: tasteNow(), temperature: temperatureValue,
      options: { beats: minBeats, signatures: useSignatures }, likes, dislikes,
    };
    outlet(0, "emilyview", "comparing", 0, COMPARE_PAIRS);
    outlet(0, "status", ...`Emily: comparing ${COMPARE_PAIRS} pieces with her taste and without...`.split(" "));
    outlet(0, "later", "tastestep", comparing.id);
  });
}

// One piece of the comparison "taste" started (with her taste, then the
// same seed without); the last one reports. A rating, a change to her
// taste or a new corpus makes the comparison stale: it stops. Clicking taste
// again starts a new one (the old one's next step is then ignored).
function tastestep(id) {
  const job = comparing;
  if (!job || job.id !== id) return; // a comparison since replaced by another
  attempt(() => {
    try {
      compareStep(job);
    } finally {
      // Stopped, failed or finished: the window's progress goes.
      if (comparing === job && !job.scheduled) {
        comparing = null;
        outlet(0, "emilyview", "comparing", -1, COMPARE_PAIRS);
      }
    }
  });
}

function compareStep(job) {
  job.scheduled = false;
  syncTaste();
  if (job.version !== tasteVersion || job.db !== db) {
    outlet(0, "status", ...`Emily: comparison stopped (her taste or the corpus changed); click taste again`.split(" "));
    return;
  }
  const pair = Math.floor(job.k / 2);
  const options = { ...job.options, seed: clampSeed(job.first + pair) };
  const result = job.k % 2 === 0 ? forms.compose(job.db, { ...options, taste: job.taste, temperature: job.temperature }) : forms.compose(job.db, options);
  (job.pairs[pair] = job.pairs[pair] || []).push(result);
  job.k++;
  if (job.k < 2 * COMPARE_PAIRS) {
    if (job.k % 2 === 0) outlet(0, "emilyview", "comparing", job.k / 2, COMPARE_PAIRS);
    job.scheduled = true;
    outlet(0, "later", "tastestep", job.id);
    return;
  }
  comparing = null;
  outlet(0, "emilyview", "comparing", -1, COMPARE_PAIRS);
  const done = job.pairs.filter(([a, b]) => a.ok && b.ok);
  if (!done.length) throw new Error("no pieces to compare; try another seed");
  const compared = emily.compare(db, memory, done.map(([a]) => a.piece), done.map(([, b]) => b.piece));
  const last = clampSeed(job.first + COMPARE_PAIRS - 1);
  comparison = { first: job.first, last, result: compared };
  showTaste();
  post(`  seeds ${job.first}-${last}, with her taste and without: ${comparisonText(compared)}\n`);
  // The panel's status line: the most liked and most disliked features only.
  const top = [job.likes[0], job.dislikes[0]].filter(Boolean).map(([f]) => compared.features.find(([g]) => g === f)).filter(Boolean);
  const words = top.map(([f, a, b], k) => `${emily.nameOf(f)} ${Math.round(100 * a)}%${k === 0 ? " of beats" : ""} (${Math.round(100 * b)}%${k === 0 ? " without her taste" : ""})`);
  const text = words.length ? words.join(", ") : comparisonText(compared);
  outlet(0, "status", ...(`Emily, seeds ${job.first}-${last}: ${text}; more in the Max window`).split(" "));
}
compareStep.local = 1;

// ---- helpers (not messages)

// Rates what is being heard (see like): learns, saves, and says what Emily learned.
function rateNow(r) {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    if (!current || !current.score.provenance) throw new Error("Emily learns from composed music: compose a piece first");
    const target = ratingTarget();
    syncTaste();
    const region = emily.regionOf(db, current.score, target.from, target.to);
    if (!region.beats.length) throw new Error("nothing composed there to rate");
    const changes = emily.rate(db, memory, region, r, { piece: current.name, what: target.what, at: new Date().toISOString() });
    tasteVersion++;
    comparison = null; // made before this rating
    saveTaste();
    const learned = emily.describeChanges(changes);
    const beats = region.beats.length + (region.beats.length === 1 ? " beat" : " beats");
    const text = `${r > 0 ? "liked" : "disliked"} ${target.what} (${beats})${learned ? ": " + learned : ""}; ${memory.ratings} ${memory.ratings === 1 ? "rating" : "ratings"}`;
    outlet(0, "status", ...text.split(" "));
    outlet(0, "emily", ...emily.summary(memory, 1).split(" "));
    showTaste();
    post(`cento: Emily ${text}\n`);
  });
}
rateNow.local = 1;

// What a rating is for: the selection, or the stream phrase playing (the
// one before it in its first moments), or the whole piece.
function ratingTarget() {
  const score = current.score;
  if (selection) return { from: selection.from, to: selection.to, what: `${barsOf(score, selection.from, selection.to)} of ${current.name}` };
  if (flow && flow.state.phrases.length) {
    let number = Math.min(flow.playing || 1, flow.state.phrases.length);
    if (number > 1 && Date.now() - (flow.since || 0) < GRACE_MS) number--;
    const phrase = flow.state.phrases[number - 1];
    return { from: phrase.startTick, to: phrase.endTick, what: `phrase ${number} of ${current.name}` };
  }
  return { from: -Infinity, to: Infinity, what: current.name };
}
ratingTarget.local = 1;

// "bars 3-5" (or "bar 3") for the ticks from..to of a score.
function barsOf(score, from, to) {
  const barTicks = (score.meter[0] * score.ppq * 4) / score.meter[1];
  const first = Math.floor(from / barTicks) + 1;
  const last = Math.floor((to - 1) / barTicks) + 1;
  return first === last ? `bar ${first}` : `bars ${first}-${last}`;
}
barsOf.local = 1;

// The corpus in use (M10): with her own works in use when there are any and
// mix is above 0, rebuilt when what she has accepted changes; Bach's alone
// otherwise.
// Cento's own corpus folders (corpus/ in the repository: corpus/README.md).
const BUNDLED = ["bach-figured-bass", "bach-figured-bass-3-4"];

function hasChorales(path) {
  try {
    return files.listMidi(path).length > 0;
  } catch (e) {
    return false;
  }
}
hasChorales.local = 1;

function parentOf(path) {
  return path.slice(0, path.lastIndexOf("/"));
}
parentOf.local = 1;

// The folder for the settings and Emily's files (M12): the user's Cento
// folder, ~/Documents/Cento, if it can be found; the files in patchers/
// are copied to it the first time. Else patchers/, as before.
function dataFolder(patchers) {
  let appPath = null;
  try {
    appPath = typeof max !== "undefined" && max.apppath ? String(max.apppath) : null;
  } catch (e) {
    // not known
  }
  const looked = [];
  const found = userFolder.find({ patchFolder: patchers, appPath, list: userFolder.listNames, exists: files.exists, looked });
  if (!found) {
    post(`cento: no Cento folder found, so your files stay in patchers/ (looked in ${looked.join(", ") || "no Documents folder"})\n`);
    if (!settingsFile.isCheckout(patchers)) {
      post(`cento: no Cento folder in Documents: put the Cento folder from the download in your Documents folder, then open Cento again\n`);
      outlet(0, "error", "no", "Cento", "folder", "in", "Documents:", "put", "it", "there", "and", "open", "Cento", "again");
    }
    return patchers;
  }
  const carried = settingsFile.carryOver(patchers, found.path);
  post(`cento: your Cento folder is ${found.path} (found ${found.how})\n`);
  if (carried.length) post(`cento: copied to your Cento folder from patchers/: ${carried.join(", ")}\n`);
  return found.path;
}
dataFolder.local = 1;

// Lists Cento's own folders (once: remembered.bundled, set when they were
// found), off, or the first one on if the list was empty. Each is looked for
// in corpus/ in the first of `roots` that has it. Returns how many were
// listed.
function offerBundled(roots) {
  const empty = !folders.length;
  let listed = 0;
  for (const [k, name] of BUNDLED.entries()) {
    const path = roots.map((root) => root + "/corpus/" + name).find(hasChorales);
    if (!path || folders.some((f) => f.path === path)) continue;
    const index = corpora.add(folders, path);
    folders[index].on = empty && k === 0;
    listed++;
  }
  if (listed) remembered.bundled = 1; // not offered again, even if taken off the list
  if (listed) post(`cento: Cento's own chorales are in the corpus window${empty ? " (Bach Chorales Figured Bass, switched on)" : ""}\n`);
  return listed;
}
offerBundled.local = 1;

// Builds the corpus from the folders that are on (emi-corpora) and reports
// it: "built", "same" (the same chorales as the corpus in use: nothing to
// build or compose again), or false when they give none (no corpus then).
function buildCorpus() {
  const result = corpora.combine(folders, (path) => {
    if (!folderCache.has(path)) folderCache.set(path, files.loadFolder(path));
    return folderCache.get(path).works;
  });
  corpusReport = {
    used: new Set(result.used.map((i) => folders[i].path)),
    notes: new Map([...result.notes].map(([i, note]) => [folders[i].path, note])),
  };
  if (!result.works.length) {
    bachWorks = null;
    bachDb = null;
    herDb = null;
    db = null;
    builtFor = null;
    outlet(0, "status", "no", "corpus:", "switch", "a", "folder", "on", "in", "corpora");
    return false;
  }
  if (bachDb && bachWorks && bachWorks.length === result.works.length && bachWorks.every((w, i) => w === result.works[i])) {
    outlet(0, "status", "corpus", "unchanged:", bachWorks.length, "chorales");
    return "same";
  }
  bachWorks = result.works;
  bachDb = lexicon.build(result.works);
  db = bachDb;
  builtFor = null;
  remembered.corpus = folders.find((f) => corpusReport.used.has(f.path)).path; // for older versions
  const s = lexicon.stats(bachDb);
  const counted = (m) => db.works.filter((w) => w.mode === m).length;
  const mode = db.mode === "mixed" ? `${counted("major")} major, ${counted("minor")} minor` : db.mode;
  const words = ["corpus", s.works, "chorales", ...("(" + mode + "),").split(" "), s.groupings, "beats,", Math.round(100 * s.deadEndShare) + "%", "dead", "ends,", db.signatures.length, "signatures"];
  if (corpusReport.used.size > 1) words.push("from", corpusReport.used.size, "folders");
  const skipped = folders.filter((f) => corpusReport.used.has(f.path)).reduce((n, f) => n + folderCache.get(f.path).skipped.length, 0);
  if (skipped) words.push("(" + skipped, "skipped)");
  outlet(0, "status", ...words);
  listSignatures();
  ensureCorpus();
  const own = ownLine();
  if (own) post(own + "\n");
  return "built";
}
buildCorpus.local = 1;

// The corpus window (emi.corpora): each folder, on or off, what it holds and
// what it gives the corpus; then the corpus in a line. `building`: a change
// is waiting for its build.
function showCorpora(building) {
  outlet(0, "corpusview", "clear", building ? 1 : 0);
  folders.forEach((f, i) => {
    const note = building ? "" : corpusReport.notes.get(f.path) || "";
    const used = !building && corpusReport.used.has(f.path) ? 1 : 0;
    outlet(0, "corpusview", "folder", i + 1, f.on ? 1 : 0, used, f.works === null ? -1 : f.works, f.meter || "?", f.modes || "?", corpora.nameOf(f.path), f.path, ...(note ? note.split(" ") : []));
  });
  let summary;
  if (building) summary = "Building the corpus...";
  else if (!folders.length) summary = "No folders yet: click add folder and choose a folder of chorales (MIDI files).";
  else if (!db || !bachDb) summary = "No corpus: switch a folder on.";
  else {
    const counted = (m) => bachDb.works.filter((w) => w.mode === m).length;
    const mode = bachDb.mode === "mixed" ? `${counted("major")} major, ${counted("minor")} minor` : bachDb.mode;
    const n = corpusReport.used.size;
    summary = `In use: ${bachDb.works.length} chorales (${mode}) from ${n} ${n === 1 ? "folder" : "folders"}, in ${bachDb.meter.join("/")}: ${bachDb.groupings.length} beats, ${bachDb.signatures.length} signatures.`;
  }
  outlet(0, "corpusview", "footer", ...summary.split(" ")); // not "summary": see emi.corpora.v8ui.js
  outlet(0, "corpusview", "done");
}
showCorpora.local = 1;

function ensureCorpus() {
  if (!bachWorks) return;
  syncTaste();
  syncStore();
  const key = memory.accepted.join(",") + "|" + store.works.length;
  if (key !== builtFor) {
    builtFor = key;
    const mine = emilyMemory.usable(store, memory.accepted, bachWorks);
    herDb = mine.length ? lexicon.build([...bachWorks, ...mine]) : null;
  }
  const next = herDb && memory.mix > 0 ? herDb : bachDb;
  if (next !== db) db = next;
}
ensureCorpus.local = 1;

// Emily's mix, when the corpus in use has her own works (null otherwise).
function mixNow() {
  return herDb && db === herDb ? memory.mix : null;
}
mixNow.local = 1;

// How many beats of a piece are Emily's own, and how many of those carry
// notes she varied: { beats, varied }.
function ownBeats(piece) {
  if (!herDb || db !== herDb || !piece.provenance) return { beats: 0, varied: 0 };
  if (!groupingsById || groupingsById.db !== db) groupingsById = { db, map: new Map(db.groupings.map((g) => [g.id, g])) };
  const own = piece.provenance.map((p) => groupingsById.map.get(p.grouping) || {}).filter((g) => g.gen);
  return { beats: own.length, varied: own.filter((g) => g.variant).length };
}
ownBeats.local = 1;

// "cento: Emily's own music: 3 works (generation 1: 2, generation 2: 1), 160 beats, 12 varied; 1 signature of her own"
function ownLine() {
  if (!herDb) return null;
  const c = emilyMemory.counts(herDb);
  const gens = [...c.gens].sort((a, b) => a[0] - b[0]).map(([g, n]) => `generation ${g}: ${n}`).join(", ");
  const sigs = herDb.signatures.filter((sig) => sig.emily).length;
  let text = `cento: Emily's own music: ${c.works} ${c.works === 1 ? "work" : "works"} (${gens}), ${c.beats} beats, ${c.varied} varied`;
  if (sigs) text += `; ${sigs} ${sigs === 1 ? "signature" : "signatures"} of her own`;
  if (db !== herDb) text += "; not in use at mix 0";
  return text;
}
ownLine.local = 1;

// The music now current, untransposed, with its provenance and variants:
// the piece, or the whole stream so far.
function sourceScore() {
  if (flow && flow.state.phrases.length) {
    const phrases = flow.state.phrases;
    return {
      ...phrases[0].piece,
      id: flow.name,
      events: phrases.flatMap((p) => p.piece.events),
      provenance: phrases.flatMap((p) => p.piece.provenance),
      fermatas: phrases.flatMap((p) => p.piece.fermatas),
      variants: phrases.flatMap((p) => p.piece.variants || []),
    };
  }
  return current.base || current.score;
}
sourceScore.local = 1;

// The accepted works file: read when it changes (the other product may have
// accepted something), written after each acceptance.
function syncStore() {
  if (!storePath) return;
  let text = "";
  try {
    text = files.exists(storePath) ? files.readText(storePath) : "";
  } catch (e) {
    return;
  }
  if (text === storeText) return;
  storeText = text;
  try {
    store = emilyMemory.normalizeStore(text ? JSON.parse(text) : null);
  } catch (e) {
    store = emilyMemory.createStore();
  }
}
syncStore.local = 1;

function saveStore() {
  if (!storePath) return;
  const text = JSON.stringify(store) + "\n";
  try {
    files.writeText(storePath, text);
    storeText = text;
  } catch (e) {
    outlet(0, "error", "can't", "save", "Emily's", "music:", ...String(e.message).split(" "));
  }
}
saveStore.local = 1;

// A composed piece or phrase with Emily's variants (M10), as often as her
// novelty asks (none at 0).
function varied(piece, seed) {
  if (!memory.novelty || !db) return piece;
  return variation.vary(db, piece, { seed, novelty: memory.novelty }).piece;
}
varied.local = 1;

// "emi-3: varied: anticipation (bar 3, soprano), suspension (bar 4, alto)"
function variantLine(piece) {
  const barTicks = (piece.meter[0] * piece.ppq * 4) / piece.meter[1];
  const voices = ["soprano", "alto", "tenor", "bass"];
  return `${piece.id}: varied: ` + piece.variants.map((v) => `${v.op} (bar ${Math.floor(v.tick / barTicks) + 1}, ${voices[v.voice - 1]})`).join(", ");
}
variantLine.local = 1;

// Emily's taste, prepared for the current corpus (null: no opinions yet).
function tasteNow() {
  if (!db) return null;
  syncTaste();
  if (!prepared || prepared.db !== db || prepared.version !== tasteVersion) prepared = { db, version: tasteVersion, value: emily.prepare(db, memory) };
  return prepared.value;
}
tasteNow.local = 1;

// Reads Emily's memory at startup; a new session after one with ratings
// lets her taste fade a little (emily-assoc's decay).
function loadTaste(folder) {
  tastePath = settingsFile.tastePathIn(folder);
  tasteBackupPath = settingsFile.backupPathIn(folder);
  tasteText = null;
  storePath = settingsFile.emilyPathIn(folder);
  storeText = null;
  syncStore();
  snapshotsPath = settingsFile.snapshotsPathIn(folder);
  snapshotsText = null;
  syncSnapshots();
  syncTaste();
  if (emily.decay(memory)) saveTaste();
  if (memory.ratings || memory.accepted.length) takeSnapshot("session start", true);
  outlet(0, "emily", ...emily.summary(memory, 1).split(" "));
  showTaste();
}
loadTaste.local = 1;

// The file is the taste's true copy: if the other product (open at the
// same time) has rated since, its ratings are read in before composing or
// rating here.
function syncTaste() {
  if (!tastePath) return;
  let text = "";
  try {
    text = files.exists(tastePath) ? files.readText(tastePath) : "";
  } catch (e) {
    return;
  }
  if (text === tasteText) return;
  tasteText = text;
  try {
    memory = emily.normalize(text ? JSON.parse(text) : null);
  } catch (e) {
    memory = emily.create();
  }
  tasteVersion++;
  comparison = null;
}
syncTaste.local = 1;

// Emily's taste in full, for the pop-up window (emi.taste): her strongest
// likes and dislikes, her last ratings, and the last comparison (which goes
// stale, and is dropped, once she learns something new).
function showTaste() {
  const { likes, dislikes } = emily.opinions(memory, 8, 0.05);
  const words = (text) => String(text).split(" ");
  outlet(0, "emilyview", "clear", memory.ratings, memory.likes, memory.sessions, temperatureValue);
  for (const [f, w] of likes) outlet(0, "emilyview", "like", Math.round(w * 100) / 100, ...words(emily.nameOf(f)));
  for (const [f, w] of dislikes) outlet(0, "emilyview", "dislike", Math.round(w * 100) / 100, ...words(emily.nameOf(f)));
  for (const entry of memory.log.slice(-8).reverse()) {
    outlet(0, "emilyview", "rating", entry.rating > 0 ? 1 : -1, entry.beats || 0, ...words(entry.what || entry.piece || "a piece"));
  }
  // Every feature's weight, for the editor: learned, pinned, and in use.
  outlet(0, "emilyview", "strength", memory.strength);
  for (const [kind, features] of emily.GROUPS) {
    if (kind === "Mode" && !(db && db.mode === "mixed")) continue;
    for (const f of features) {
      const learned = Math.round((memory.weights[f] || 0) * 100) / 100;
      const pinned = memory.pins && f in memory.pins;
      outlet(0, "emilyview", "weight", kind, f, learned, pinned ? 1 : 0, pinned ? memory.pins[f] : learned, ...words(emily.nameOf(f)));
    }
  }
  // Her memory (M10): her own works in use, latest first, and her snapshots.
  const counted = herDb ? emilyMemory.counts(herDb) : { works: 0, beats: 0, varied: 0 };
  outlet(0, "emilyview", "own", counted.works, counted.beats, counted.varied, memory.mix, memory.novelty, herDb && db === herDb ? 1 : 0);
  const byId = new Map(store.works.map((w) => [w.id, w]));
  for (const id of memory.accepted.slice().reverse()) {
    const w = byId.get(id);
    if (!w) continue;
    const beats = Math.round((Math.max(0, ...w.events.map((e) => e[0] + e[2])) - w.padTicks) / w.ppq);
    outlet(0, "emilyview", "work", w.id, w.gen, beats, (w.variants || []).length, ...words(w.what || w.from || ""));
  }
  for (const snap of snapshots.list.slice(-10).reverse()) {
    outlet(0, "emilyview", "snapshot", snap.id, ...words(whenOf(snap.at)), ...words(`${snap.label}: ${tasteCounts(snap.memory)}`));
  }
  if (comparison) {
    outlet(0, "emilyview", "compare", comparison.first, comparison.last);
    const liked = new Set(likes.map(([f]) => f));
    for (const [f, a, b] of comparison.result.features) {
      outlet(0, "emilyview", "pair", Math.round(100 * a), Math.round(100 * b), liked.has(f) ? 1 : 0, ...words(emily.nameOf(f)));
    }
  }
  outlet(0, "emilyview", "done");
}
showTaste.local = 1;

function saveTaste() {
  if (!tastePath) return;
  const text = JSON.stringify(memory) + "\n";
  try {
    files.writeText(tastePath, text);
    tasteText = text;
  } catch (e) {
    outlet(0, "error", "can't", "save", "Emily's", "taste:", ...String(e.message).split(" "));
  }
}
saveTaste.local = 1;

// After a pin, a release, a strength or a recalled taste: composing uses it
// from the next piece, it is saved, and both panels show it.
function changedTaste() {
  tasteVersion++;
  comparison = null;
  saveTaste();
  outlet(0, "emily", ...emily.summary(memory, 1).split(" "));
  showTaste();
}
changedTaste.local = 1;

function signedWeight(w) {
  return (w > 0 ? "+" : w < 0 ? "-" : "") + Math.abs(w).toFixed(2);
}
signedWeight.local = 1;

// "12 ratings, 3 pins, strength 1.50, 2 works of her own"
function tasteCounts(m = memory) {
  const pins = Object.keys(m.pins || {}).length;
  const parts = [m.ratings + (m.ratings === 1 ? " rating" : " ratings")];
  if (pins) parts.push(pins + (pins === 1 ? " pin" : " pins"));
  if (m.strength !== 1) parts.push("strength " + m.strength.toFixed(2));
  const works = (m.accepted || []).length;
  if (works) parts.push(works + (works === 1 ? " work of her own" : " works of her own"));
  return parts.join(", ");
}

// Keeps a snapshot of her taste (M10); with onlyIfChanged, only if it
// differs from the last one. Returns it (or null).
function takeSnapshot(label, onlyIfChanged) {
  syncSnapshots();
  const entry = emilyMemory.snapshot(snapshots, memory, { label, at: new Date().toISOString(), onlyIfChanged });
  if (entry) saveSnapshots();
  return entry;
}
takeSnapshot.local = 1;

// "2026-10-03 14:12" from an ISO time.
function whenOf(at) {
  return at ? String(at).slice(0, 16).replace("T", " ") : "?";
}
whenOf.local = 1;

function syncSnapshots() {
  if (!snapshotsPath) return;
  let text = "";
  try {
    text = files.exists(snapshotsPath) ? files.readText(snapshotsPath) : "";
  } catch (e) {
    return;
  }
  if (text === snapshotsText) return;
  snapshotsText = text;
  try {
    snapshots = emilyMemory.normalizeSnapshots(text ? JSON.parse(text) : null);
  } catch (e) {
    snapshots = emilyMemory.createSnapshots();
  }
}
syncSnapshots.local = 1;

function saveSnapshots() {
  if (!snapshotsPath) return;
  const text = JSON.stringify(snapshots) + "\n";
  try {
    files.writeText(snapshotsPath, text);
    snapshotsText = text;
  } catch (e) {
    outlet(0, "error", "can't", "save", "Emily's", "snapshots:", ...String(e.message).split(" "));
  }
}
saveSnapshots.local = 1;
tasteCounts.local = 1;

// "her taste +0.41 a beat (+0.05 without); suspensions 11% of beats (5%), ..."
function comparisonText(result) {
  const signedFit = (v) => (v >= 0 ? "+" : "") + v.toFixed(2);
  const parts = [`her taste ${signedFit(result.fit[0])} a beat (${signedFit(result.fit[1])} without)`];
  result.features.forEach(([f, a, b], k) => parts.push(`${emily.nameOf(f)} ${Math.round(100 * a)}%${k === 0 ? " of beats" : ""} (${Math.round(100 * b)}%)`));
  return parts.join("; ");
}
comparisonText.local = 1;

// For the Max window, after a piece composed with a taste: how it compares
// with the same seed composed without one.
function tasteLine(piece, options) {
  const plain = forms.compose(db, options);
  if (!plain.ok) return null;
  return `${piece.id}: ${comparisonText(emily.compare(db, memory, [piece], [plain.piece], 2))}`;
}
tasteLine.local = 1;

function clampSeed(n) {
  return Math.max(1, Math.min(99999, Math.round(Number(n)) || 1));
}
clampSeed.local = 1;

// "corpus <folder>": that folder alone, read afresh. A folder with no
// chorales changes nothing (the corpus in use stays).
function loadCorpus(folder) {
  const found = files.loadFolder(String(folder));
  if (!found.works.length) throw new Error("no .mid files in " + files.fileName(folder));
  const index = corpora.add(folders, String(folder));
  corpora.only(folders, index);
  folderCache.set(folders[index].path, found);
  buildCorpus();
  showCorpora(false);
}
loadCorpus.local = 1;

// Composes with the current seed, shows the piece and reports it. After a
// click (not at startup), also writes clips if autoclips is on. In stream
// mode, starts a stream instead.
function composeNow(atStartup) {
  attempt(() => {
    if (!db) throw new Error("load a corpus first");
    ensureCorpus();
    if (streaming) {
      startStream();
      return;
    }
    const options = { seed: currentSeed, beats: minBeats, signatures: useSignatures };
    const liked = useForm ? tasteNow() : null;
    const result = useForm ? forms.compose(db, { ...options, taste: liked, temperature: temperatureValue, mix: mixNow() }) : composer.compose(db, options);
    if (!result.ok) {
      if (useForm && !result.stats.tried.length) {
        outlet(0, "error", "no", "chorale", "is", minBeats + "+", "beats", "long;", "lower", "beats");
      } else {
        outlet(0, "error", "no", "piece", "for", "seed", currentSeed, "with", minBeats + "+", "beats;", "try", "another", "seed", "or", "more", "chorales");
      }
      return;
    }
    const piece = varied(result.piece, currentSeed);
    show(piece, piece.id, false);
    let text = describePiece(piece);
    if (autoClips && !atStartup) text += "; " + clips.writeScore(piece, piece.id);
    outlet(0, "status", ...text.split(" "));
    for (const line of signatureLines(piece)) post(line + "\n");
    post(qualityLine(piece) + "\n");
    if (piece.variants && piece.variants.length) post(variantLine(piece) + "\n");
    if (liked) {
      const line = tasteLine(piece, options);
      if (line) post(line + "\n");
    }
  });
}
composeNow.local = 1;

// A new stream: the queue is emptied and the first two phrases queued.
function startStream() {
  flow = {
    state: streams.start({ seed: currentSeed }),
    steps: new Map(),
    events: [],
    provenance: [],
    fermatas: [],
    name: "emi-" + currentSeed,
    playing: 1, // the phrase playing (M9: what "like" rates)
    since: Date.now(),
  };
  current = null;
  selection = null;
  outlet(0, "restart");
  outlet(0, "endat", NO_STEP); // set when its last phrase is queued
  followMeter(db.meter);
  outlet(0, "coll", "clear");
  if (appendPhrase() && !flow.state.finished) appendPhrase();
}
startStream.local = 1;

// Composes the stream's next phrase and queues it after the others. The
// player is asked to send "need" when this phrase starts playing.
function appendPhrase() {
  const state = flow.state;
  const number = state.phrases.length + 1;
  const last = phrasesWanted > 0 && number >= phrasesWanted;
  ensureCorpus();
  const options = { seed: currentSeed, signatures: useSignatures, taste: tasteNow(), temperature: temperatureValue, mix: mixNow() };
  let result = streams.next(db, state, { ...options, last });
  if (!result.ok && last) result = streams.next(db, state, options); // end later instead
  if (!result.ok) {
    outlet(0, "streamat", NO_STEP);
    if (flow.steps.size) outlet(0, "endat", Math.max(...flow.steps.keys())); // it ends where the queue does
    outlet(0, "error", "the", "stream", "ran", "out", "after", "phrase", number - 1 + ";", "try", "another", "seed", "or", "more", "chorales");
    return null;
  }
  const phrase = result.phrase;
  phrase.piece = varied(phrase.piece, (Math.imul(currentSeed, 1000) + number) >>> 0);
  const shown = transposed(ingest.quantize(phrase.piece).work, transposeBy);
  const changed = [];
  for (const { step, events } of queue.toSteps(shown, STEPS_PER_BEAT)) {
    flow.steps.set(step, mergeStep(flow.steps.get(step) || [], events));
    changed.push(step);
  }
  for (const step of changed) outlet(0, "coll", "store", step, ...flow.steps.get(step));
  flow.events.push(...shown.events);
  flow.provenance.push(...shown.provenance);
  flow.fermatas.push(...shown.fermatas);
  current = { base: null, score: streamScore(shown, phrase.endTick), name: flow.name, chorale: false };
  const ticksPerStep = db.beatTicks / STEPS_PER_BEAT;
  outlet(0, "streamat", state.finished ? NO_STEP : phrase.startTick / ticksPerStep);
  if (state.finished) outlet(0, "endat", Math.max(...flow.steps.keys()));
  const from = state.phrases[Math.max(0, state.phrases.length - WINDOW)].startTick;
  draw(current.score, from, phrase.endTick);
  let text = `${flow.name} stream: phrase ${number}${phrasesWanted ? " of " + phrasesWanted : ""} queued (${phrase.work} phrase ${phrase.index}`;
  if (db.mode === "mixed") text += state.mode === "minor" ? ", A minor" : ", C major";
  const names = blocksOf(phrase.piece.provenance, db.beatTicks).map((b) => b.name);
  if (names.length) text += ", signature " + names.join(" and ");
  if (phrase.fallback) text += ", after a breath";
  if (phrase.piece.variants && phrase.piece.variants.length) text += ", varied: " + [...new Set(phrase.piece.variants.map((v) => v.op))].join(" and ");
  if (phrase.final) text += ", the last";
  if (transposeBy) text += ", transposed " + signed(transposeBy);
  outlet(0, "status", ...(text + ")").split(" "));
  return phrase;
}
appendPhrase.local = 1;

// The stream so far, as one score (for the piano roll, export and clips).
function streamScore(phraseScore, endTick) {
  const barTicks = (db.meter[0] * db.beatTicks * 4) / db.meter[1];
  const events = flow.events.slice().sort((a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1]);
  return {
    ...phraseScore,
    id: flow.name,
    source: "EMI stream (M5)",
    events,
    provenance: flow.provenance.slice(),
    fermatas: flow.fermatas.slice(),
    lengthTicks: Math.ceil(endTick / barTicks) * barTicks,
    form: null,
  };
}
streamScore.local = 1;

// Two queue entries for one step, as one: note-offs first, then note-ons.
function mergeStep(a, b) {
  const triples = [];
  for (const list of [a, b]) for (let i = 0; i < list.length; i += 3) triples.push(list.slice(i, i + 3));
  return [...triples.filter((t) => t[2] === 0), ...triples.filter((t) => t[2] > 0)].flat();
}
mergeStep.local = 1;

function transposed(score, by) {
  if (!by) return score;
  const clamp = (p) => Math.max(0, Math.min(127, p + by));
  return { ...score, events: score.events.map(([on, pitch, dur, voice, vel]) => [on, clamp(pitch), dur, voice, vel]) };
}
transposed.local = 1;

function signed(n) {
  return (n > 0 ? "+" : "") + n;
}
signed.local = 1;

function describePiece(piece) {
  const s = composer.summary(piece);
  if (!piece.form) return `${piece.id}: ${s.beats} beats from ${s.sources} chorales`;
  const phrases = piece.form.phrases + (piece.form.phrases === 1 ? " phrase" : " phrases");
  const key = db && db.mode === "mixed" ? (piece.key.mode === "minor" ? " (A minor)" : " (C major)") : "";
  let text = `${piece.id}: form of ${piece.form.template}${key}, ${phrases}, ${piece.form.beats} beats, ${s.sources} chorales`;
  text += ", SPEAC " + Math.round(100 * piece.form.speac) + "%";
  if (piece.form.signatures !== undefined) text += ", " + piece.form.signatures + (piece.form.signatures === 1 ? " signature" : " signatures");
  if (piece.variants && piece.variants.length) text += ", " + piece.variants.length + (piece.variants.length === 1 ? " variant" : " variants");
  const own = ownBeats(piece);
  if (own.beats) text += `, ${own.beats} of Emily's own ${own.beats === 1 ? "beat" : "beats"}` + (own.varied ? ` (${own.varied} with her variants)` : "");
  const relaxed = [];
  if (s.relaxed) relaxed.push(s.relaxed + (s.relaxed === 1 ? " octave move" : " octave moves"));
  if (piece.form.relaxed === 3) relaxed.push("any cadence bass");
  if (piece.form.overLimit) relaxed.push("quotes over the limit");
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
  if (remembered.signatures !== undefined) useSignatures = Boolean(remembered.signatures);
  if (remembered.key !== undefined) keyMode = remembered.key ? "original" : "c";
  if (remembered.stream !== undefined) streaming = Boolean(remembered.stream);
  if (remembered.phrases !== undefined) phrasesWanted = Math.max(0, Math.min(64, Math.round(remembered.phrases)));
  if (remembered.transpose !== undefined) transposeBy = Math.max(-12, Math.min(12, Math.round(remembered.transpose)));
  if (remembered.temperature !== undefined) temperatureValue = Math.max(0, Math.min(3, Number(remembered.temperature) || 0));
  outlet(0, "setting", "seed", currentSeed);
  outlet(0, "setting", "beats", minBeats);
  outlet(0, "setting", "form", useForm ? 1 : 0);
  outlet(0, "setting", "sigs", useSignatures ? 1 : 0);
  outlet(0, "setting", "key", keyMode === "original" ? 1 : 0);
  outlet(0, "setting", "stream", streaming ? 1 : 0);
  outlet(0, "setting", "phrases", phrasesWanted);
  outlet(0, "setting", "transpose", transposeBy);
  outlet(0, "setting", "temperature", temperatureValue);
  for (const [name, values] of Object.entries(remembered.host || {})) {
    if (Array.isArray(values)) outlet(0, "setting", name, ...values);
  }
}
restore.local = 1;

// Writes the settings file (once startup has read it).
function save() {
  if (!settingsPath) return;
  remembered.corpora = folders.map((f) => ({ ...f }));
  remembered.seed = currentSeed;
  remembered.beats = minBeats;
  remembered.form = useForm ? 1 : 0;
  remembered.signatures = useSignatures ? 1 : 0;
  remembered.key = keyMode === "original" ? 1 : 0;
  remembered.stream = streaming ? 1 : 0;
  remembered.phrases = phrasesWanted;
  remembered.transpose = transposeBy;
  remembered.temperature = temperatureValue;
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

// Makes a score current: queue it (transposed) and draw it. The player is told
// to start it again at the next bar, so composing while playing never leaves
// notes hanging and the new music starts on a bar line.
function show(score, name, chorale) {
  flow = null;
  selection = null;
  const { work } = ingest.quantize(score);
  const shown = transposed(work, transposeBy);
  current = { base: work, score: shown, name, chorale };
  outlet(0, "restart");
  outlet(0, "streamat", NO_STEP);
  followMeter(shown.meter);
  outlet(0, "coll", "clear");
  const steps = queue.toSteps(shown, STEPS_PER_BEAT);
  for (const { step, events } of steps) outlet(0, "coll", "store", step, ...events);
  outlet(0, "endat", steps.length ? Math.max(...steps.map(({ step }) => step)) : NO_STEP);
  draw(shown);
}

// The transport follows the music's meter (M8: 3/4), so the player starts it
// on a barline of its own bars. The Max version's adapter sets its transport
// from "meter"; in Live, the set's time signature is changed here, if needed.
function followMeter(meter) {
  outlet(0, "meter", meter[0], meter[1]);
  if (host !== "live") return;
  try {
    if (clips.setMeter(meter[0], meter[1])) post(`cento: Live's time signature set to ${meter[0]}/${meter[1]}\n`);
  } catch (e) {
    outlet(0, "error", "can't", "set", "Live's", "time", "signature:", ...String(e.message).split(" "));
  }
}
followMeter.local = 1;
show.local = 1;

// A signature's name ("soprano 3-2-1"), or its id if the corpus has changed.
function signatureName(id) {
  if (!db) return id;
  if (!signaturesById || signaturesById.db !== db) signaturesById = { db, map: new Map(db.signatures.map((sig) => [sig.id, sig])) };
  const found = signaturesById.map.get(id);
  return found ? signatureNames.describe(found, db.mode) : id;
}
signatureName.local = 1;

// The signature blocks in a provenance list: [{ start, end, name, outer, work }],
// end the tick after the block's last beat; named after its strongest
// soprano or bass signature (see emi-signatures); outer: all of its soprano
// and bass signatures' names.
function blocksOf(provenance, beatTicks) {
  const blocks = [];
  for (let k = 0; k < provenance.length; k++) {
    const p = provenance[k];
    if (!p.block) continue;
    const previous = blocks[blocks.length - 1];
    if (previous && previous.id === p.block && previous.end === p.tick) previous.end = p.tick + beatTicks;
    else blocks.push({ id: p.block, start: p.tick, end: p.tick + beatTicks, work: p.work, sigs: [] });
    if (p.signatures) blocks[blocks.length - 1].sigs = p.signatures;
  }
  return blocks.map((b) => {
    const names = b.sigs.map(signatureName);
    const outer = names.filter((name) => /^(soprano|bass) /.test(name));
    return { start: b.start, end: b.end, work: b.work, name: names[0] || "signature", outer: outer.length ? outer : names.slice(0, 1) };
  });
}
blocksOf.local = 1;

// The corpus's signatures, strongest first, in the Max window.
function listSignatures() {
  const list = db.signatures;
  post(`cento: ${list.length} signatures in ${db.works.length} chorales, strongest first (in how many chorales):\n`);
  const inMode = (sig) => (db.mode === "mixed" ? `, ${sig.mode}` : "");
  for (const sig of list.slice(0, 16)) post(`  ${sig.id}: ${signatureNames.describe(sig, db.mode)} (${sig.works}${inMode(sig)})\n`);
  if (list.length > 16) post(`  ... and ${list.length - 16} more\n`);
}
listSignatures.local = 1;

// Where a piece keeps its signatures, for the Max window: one line per block.
function signatureLines(piece) {
  const barTicks = (piece.meter[0] * piece.ppq * 4) / piece.meter[1];
  return blocksOf(piece.provenance || [], piece.ppq).map((b) => {
    const cadence = b.end - piece.ppq; // the block's last beat
    const bar = Math.floor(cadence / barTicks) + 1;
    const beat = Math.floor((cadence % barTicks) / piece.ppq) + 1;
    return `${piece.id}: ${b.outer.join(" + ")} at the cadence in bar ${bar} (beat ${beat}), from ${b.work}`;
  });
}
signatureLines.local = 1;

// A piece's quotation measures and parallels, for the Max window.
function qualityLine(piece) {
  const q = quality.quotes(db, piece);
  const voice = ["soprano", "alto", "tenor", "bass"][q.melody.voice - 1];
  let text = `${piece.id}: longest quote ${q.melody.notes} notes (${voice}, as in ${q.melody.work}), ${q.run.beats} beats in a row from ${q.run.work}`;
  const found = quality.parallels(piece, { db });
  const fresh = found.filter((p) => !p.inherited).length;
  if (!found.length) text += "; no parallel 5ths or 8ves";
  else if (!fresh) text += `; parallel 5ths/8ves: ${found.length}, all Bach's own`;
  else text += `; parallel 5ths/8ves: ${found.length}, ${fresh} new`;
  return text;
}
qualityLine.local = 1;

// Parallel fifths and octaves between ticks from and to: [tick, new (0/1)].
// A chorale's are all Bach's own; a piece's are checked against its sources.
function parallelsFor(score, from, to) {
  try {
    const events = score.events.filter((e) => e[0] + e[2] > from && e[0] < to);
    const provenance = score.provenance ? score.provenance.filter((p) => p.tick + score.ppq > from && p.tick < to) : null;
    const found = quality.parallels({ events, provenance, ppq: score.ppq }, { db: provenance ? db : null });
    return found.map((p) => [p.tick, provenance && !p.inherited ? 1 : 0]);
  } catch (e) {
    return [];
  }
}
parallelsFor.local = 1;

// What the piano roll shows when the mouse is over a beat, as [tick, text]:
// for a composed piece, where the beat came from; for a chorale, its bar and
// beat.
function sourcesFor(score) {
  try {
    if (score.provenance && db) {
      if (!groupingsById || groupingsById.db !== db) groupingsById = { db, map: new Map(db.groupings.map((g) => [g.id, g])) };
      return score.provenance.map((p) => [p.tick, provenanceOf.describeBeat(db, p, groupingsById.map)]);
    }
    const barTicks = (score.meter[0] * score.ppq * 4) / score.meter[1];
    const pickup = (score.padTicks || 0) > 0;
    const labels = new Map(labelsFor(score));
    const out = [];
    for (let tick = 0; tick < score.lengthTicks; tick += score.ppq) {
      if (!score.events.some((e) => e[0] < tick + score.ppq && e[0] + e[2] > tick)) continue;
      const bar = Math.floor(tick / barTicks) + (pickup ? 0 : 1);
      const beat = Math.floor((tick % barTicks) / score.ppq) + 1;
      out.push([tick, `bar ${bar} beat ${beat}` + (labels.has(tick) ? " · " + labels.get(tick) : "")]);
    }
    return out;
  } catch (e) {
    return [];
  }
}
sourcesFor.local = 1;

// The SPEAC lane: one beat label per beat, as [tick, label]. A composed
// piece shows the labels its beats bring from their chorales; a chorale (or
// the test phrase) is analysed itself.
function labelsFor(score) {
  try {
    if (score.provenance && db) {
      if (!groupingsById || groupingsById.db !== db) groupingsById = { db, map: new Map(db.groupings.map((g) => [g.id, g])) };
      return score.provenance
        .map((p) => [p.tick, groupingsById.map.get(p.grouping)])
        .filter(([, g]) => g && g.speac)
        .map(([tick, g]) => [tick, g.speac.beat]);
    }
    const beatsPerBar = Math.round((score.meter[0] * 4) / score.meter[1]);
    const groupings = segment({ ...score, id: score.id || "score", fermatas: score.fermatas || [] }, score.ppq);
    return speacLabels.analyze(groupings, beatsPerBar).map((a, k) => [groupings[k].index * score.ppq, a.beat]);
  } catch (e) {
    return [];
  }
}
labelsFor.local = 1;

// Piano roll: notes colored by source chorale (composed pieces) or by voice;
// seams where the source changes (level 1: voices moved by octaves); a mark
// at each cadence (fermata); the SPEAC lane. from/to: the ticks shown (a
// stream shows its last few phrases).
function draw(score, from = 0, to = score.lengthTicks) {
  const events = score.events.filter((e) => e[0] + e[2] > from && e[0] < to);
  const pitches = (events.length ? events : score.events).map((e) => e[1]);
  const barTicks = (score.meter[0] * score.ppq * 4) / score.meter[1];
  outlet(0, "view", "clear", to, Math.min(...pitches), Math.max(...pitches), barTicks, from, score.ppq);
  const prov = score.provenance || null;
  const sources = prov ? [...new Set(prov.map((p) => p.work))] : [];
  const colorAt = (tick, voice) => {
    if (!prov) return voice - 1;
    let i = prov.length - 1;
    while (i > 0 && prov[i].tick > tick) i--;
    return sources.indexOf(prov[i].work);
  };
  for (const [on, pitch, dur, voice] of events) outlet(0, "view", "note", on, dur, pitch, colorAt(on, voice));
  if (prov) {
    for (let i = 1; i < prov.length; i++) {
      if (prov[i].tick < from || prov[i].tick >= to) continue;
      if (prov[i].work !== prov[i - 1].work || prov[i].level > 0) outlet(0, "view", "seam", prov[i].tick, prov[i].level || 0);
    }
  }
  for (const tick of score.fermatas || []) if (tick >= from && tick < to) outlet(0, "view", "cadence", tick);
  for (const [tick, label] of labelsFor(score)) if (tick >= from && tick < to) outlet(0, "view", "speac", tick, label);
  for (const b of blocksOf(prov || [], score.ppq)) {
    if (b.end > from && b.start < to) outlet(0, "view", "signature", b.start, b.end, ...b.name.split(" "));
  }
  for (const [tick, fresh] of parallelsFor(score, from, to)) if (tick >= from && tick < to) outlet(0, "view", "parallel", tick, fresh);
  for (const [tick, text] of sourcesFor(score)) if (tick >= from && tick < to) outlet(0, "view", "source", tick, ...text.split(" "));
  for (const p of prov || []) if (p.variant && p.tick >= from && p.tick < to) outlet(0, "view", "variant", p.tick, ...p.variant.join(", ").split(" "));
  if (selection && selection.to > from && selection.from < to) outlet(0, "view", "selection", selection.from, selection.to);
  outlet(0, "view", "done");
}
draw.local = 1;
