"use strict";
// Tests the bundled scripts in patchers/, loaded the way [v8] and [v8ui] load
// them, with stand-ins for Max's File, Folder, LiveAPI and mgraphics.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const { loadBundle } = require("./max-sim");
const build = require("../tools/build");
const { hello } = require("emi-hello");
const queue = require("emi-queue");
const patterns = require("emi-pattern");
const smf = require("emi-smf");

const Q = 960;
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), "emi-"));

// Writes a chorale as tools/export-chorales.py would: <id>.mid + <id>.json.
// chords: [[soprano, alto, tenor, bass, beats]], starting with a pickup on beat 4.
function writeChorale(dir, id, chords, { keySignature = { sf: 0, minor: false }, key = { tonic: "C", mode: "major" }, fermatas = null, meter = [4, 4] } = {}) {
  let t = (meter[0] - 1) * Q; // a one-beat pickup
  const tracks = ["Soprano", "Alto", "Tenor", "Bass"].map((name) => ({ name, channel: 1, notes: [] }));
  for (const [s, a, tn, b, beats] of chords) {
    [s, a, tn, b].forEach((pitch, v) => tracks[v].notes.push({ on: t, pitch, dur: beats * Q, vel: 90 }));
    t += beats * Q;
  }
  const midiPath = path.join(dir, id + ".mid");
  fs.writeFileSync(midiPath, smf.write({ ppq: Q, meter, keySignature, tracks }));
  fs.writeFileSync(
    path.join(dir, id + ".json"),
    JSON.stringify({
      meter: meter.join("/"),
      key,
      parts: ["Soprano", "Alto", "Tenor", "Bass"],
      midi: { ppq: Q, voiceTracks: [1, 2, 3, 4] },
      padQuarters: meter[0] - 1,
      fermatasQuarters: fermatas || [t / Q - 2],
    }),
  );
  return midiPath;
}

// A short chorale in A major: pickup, two chords, ending.
function writeAMajorChorale() {
  const chords = [[76, 73, 69, 57, 1], [74, 71, 68, 52, 1], [73, 69, 64, 57, 1]];
  return writeChorale(tempDir(), "bwv000", chords, { keySignature: { sf: 3, minor: false }, key: { tonic: "A", mode: "major" } });
}

// A folder of three chorales on the same I-IV-V cycle, so they recombine.
function writeCorpus() {
  const dir = tempDir();
  const [I, IV, V] = [[72, 67, 64, 48], [72, 69, 65, 53], [71, 67, 62, 55]];
  const cycle = [I, IV, V, I, IV, V, I, IV, V].map((c) => [...c, 1]).concat([[...I, 2]]);
  for (const id of ["a", "b", "c"]) writeChorale(dir, id, cycle);
  fs.writeFileSync(path.join(dir, "notes.txt"), "not a MIDI file"); // ignored
  return dir;
}

// A fake Live set: tracks with names and clip slots, recording every call.
function fakeLive({ trackNames, ownTrack = 0, slotsPerTrack = 4, filled = [], meter = [4, 4] }) {
  const calls = [];
  const hasClip = new Set(filled);
  const song = { signature_numerator: meter[0], signature_denominator: meter[1] };
  class LiveAPI {
    constructor(p) {
      this.unquotedpath = p === "this_device canonical_parent" ? `live_set tracks ${ownTrack}` : p;
    }
    getcount(property) {
      if (this.unquotedpath === "live_set" && property === "tracks") return trackNames.length;
      if (/^live_set tracks \d+$/.test(this.unquotedpath) && property === "clip_slots") return slotsPerTrack;
      throw new Error(`unexpected getcount ${property} on ${this.unquotedpath}`);
    }
    get(property) {
      if (this.unquotedpath === "live_set" && property in song) return [song[property]];
      const track = this.unquotedpath.match(/^live_set tracks (\d+)$/);
      if (track && property === "name") return [trackNames[Number(track[1])]];
      const slot = this.unquotedpath.match(/^live_set tracks (\d+) clip_slots (\d+)$/);
      if (slot && property === "has_clip") return [hasClip.has(`${slot[1]}:${slot[2]}`) ? 1 : 0];
      throw new Error(`unexpected get ${property} on ${this.unquotedpath}`);
    }
    call(name, ...args) {
      calls.push([this.unquotedpath, name, ...args]);
      const slot = this.unquotedpath.match(/^live_set tracks (\d+) clip_slots (\d+)$/);
      if (slot && name === "create_clip") hasClip.add(`${slot[1]}:${slot[2]}`);
    }
    set(property, value) {
      calls.push([this.unquotedpath, "set", property, value]);
      if (this.unquotedpath === "live_set") song[property] = value;
    }
  }
  return { LiveAPI, calls, song };
}

const select = (out, selector) => out.filter(([, s]) => s === selector).map(([, , ...rest]) => rest);
const lastStatus = (out) => out.filter(([, s]) => s === "status" || s === "error").at(-1).slice(1);

// ---------------------------------------------------------------- all bundles

test("bundles in patchers/ are up to date with code/", () => {
  assert.deepEqual(build.check(), []);
});

test("each bundle exposes exactly its documented messages", () => {
  assert.deepEqual(loadBundle("emi.hello").handlers(), ["bang", "msg_int"]);
  assert.deepEqual(loadBundle("emi.core").handlers(), [
    "abtest", "accept", "autoclips", "beats", "clear", "compose", "corpus", "dislike", "exportmidi", "forget", "form", "key", "like", "loadmidi",
    "mix", "need", "next", "novelty", "pattern", "phrases", "pin", "recalltaste", "remember", "rollback", "seed", "select", "sigs", "snapshot", "startup", "storetaste", "stream",
    "strength", "taste", "temperature", "testclip", "transpose", "unaccept", "unpin", "writeclips",
  ]);
  assert.deepEqual(loadBundle("emi.view").handlers(), [
    "cadence", "clear", "done", "highlight", "note", "onclick", "ondrag", "onidle", "onidleout", "onresize", "paint", "parallel", "playhead", "seam", "selection", "signature", "source", "speac", "variant",
  ]);
  assert.deepEqual(loadBundle("emi.voice").handlers(), ["trackname"]);
  assert.deepEqual(loadBundle("emi.text").handlers(), ["alert", "clear", "onresize", "paint", "text"]);
  assert.deepEqual(loadBundle("emi.taste").handlers(), [
    "clear", "compare", "dislike", "done", "edit", "like", "memory", "onclick", "ondblclick", "ondrag", "onidle", "onidleout", "onresize", "own", "paint", "pair", "rating",
    "snapshot", "strength", "weight", "work",
  ]);
});

// Convention: one inlet and one outlet per [v8] wrapper. If a script fails to
// load, [v8] keeps its default single inlet and outlet and Max deletes any
// other cords ("patchcord outlet out of range"), which is what happened in M0.
test("[v8] bundles have one inlet and one outlet (the view's sends selections, M9)", () => {
  const counts = (name) => {
    const { context } = loadBundle(name);
    return [context.inlets, context.outlets, context.autowatch];
  };
  assert.deepEqual(counts("emi.hello"), [1, 1, 1]);
  assert.deepEqual(counts("emi.core"), [1, 1, 1]);
  assert.deepEqual(counts("emi.view"), [1, 1, 1]);
  assert.deepEqual(counts("emi.voice"), [1, 1, 1]);
  assert.deepEqual(counts("emi.text"), [1, 0, 1]);
  assert.deepEqual(counts("emi.taste"), [1, 1, 1]);
});

// ---------------------------------------------------------------- voice: the track's name picks the voice

test("voice: the track's name sets which emi.voice.N the device receives", () => {
  const voice = loadBundle("emi.voice");
  assert.deepEqual(voice.send("trackname", "Tenor"), [[0, "set", "emi.voice.3"], [0, "show", "Tenor"]]);
  assert.deepEqual(voice.send("trackname", "s"), [[0, "set", "emi.voice.1"], [0, "show", "Soprano"]]);
  // live.observer may send a name with spaces as several atoms, or quoted.
  assert.deepEqual(voice.send("trackname", '"Bass"'), [[0, "set", "emi.voice.4"], [0, "show", "Bass"]]);
  assert.deepEqual(voice.send("trackname", 1, "MIDI"), [[0, "set", "emi.voice.0"], [0, "show", "no", "voice"]]);
});

test("hello: the bundle prints the same values as the Node module", () => {
  const bundle = loadBundle("emi.hello");
  const expected = hello(1);
  assert.deepEqual(bundle.send("bang"), [[0, "hello", "emi", expected.version, "seed", 1, "check", ...expected.check]]);
  assert.deepEqual(bundle.send("msg_int", 99)[0].slice(-4), hello(99).check);
});

// ---------------------------------------------------------------- core: queue and view

test("core: 'pattern' queues every step, draws it, and reports", () => {
  const out = loadBundle("emi.core").send("pattern");
  // The player first stops what's sounding and waits for the next bar.
  assert.deepEqual(out.slice(0, 2), [[0, "restart"], [0, "streamat", 999999]]);
  const coll = select(out, "coll");
  const steps = queue.toSteps(patterns.testChorale());
  assert.deepEqual(coll[0], ["clear"]);
  assert.deepEqual(coll.slice(1), steps.map(({ step, events }) => ["store", step, ...events]));
  const view = select(out, "view");
  assert.deepEqual(view[0], ["clear", 8 * Q, 48, 74, 4 * Q, 0, Q]);
  assert.equal(view.filter(([kind]) => kind === "note").length, 28);
  assert.deepEqual(view.at(-1), ["done"]);
  assert.deepEqual(lastStatus(out), ["status", "test-cadence", "queued"]);
});

test("core: 'loadmidi' queues a chorale in C; 'key original' requeues it as written", () => {
  const core = loadBundle("emi.core");
  const out = core.send("loadmidi", writeAMajorChorale());
  const stores = select(out, "coll").filter(([kind]) => kind === "store");
  assert.deepEqual(stores[0], ["store", 12, 1, 79, 90, 2, 76, 90, 3, 72, 90, 4, 60, 90]); // +3: A -> C
  assert.deepEqual(lastStatus(out), ["status", "bwv000", "A", "major", "->", "C", "major", "(+3)", "4/4", "2", "bars", "1", "phrases", "queued"]);

  const original = core.send("key", "original");
  assert.deepEqual(select(original, "coll")[1], ["store", 12, 1, 76, 90, 2, 73, 90, 3, 69, 90, 4, 57, 90]);
  assert.equal(lastStatus(core.send("key", "sideways"))[0], "error");
});

test("core: a missing file is an error, not a crash", () => {
  const out = loadBundle("emi.core").send("loadmidi", path.join(os.tmpdir(), "no-such-file.mid"));
  assert.deepEqual(lastStatus(out), ["error", "can't", "open", "no-such-file.mid"]);
});

test("core: 'clear' empties the queue", () => {
  assert.deepEqual(loadBundle("emi.core").send("clear"), [
    [0, "restart"],
    [0, "streamat", 999999],
    [0, "coll", "clear"],
    [0, "status", "queue", "cleared"],
  ]);
});

// ---------------------------------------------------------------- core: corpus and compose

test("core: 'compose' needs a corpus", () => {
  assert.deepEqual(lastStatus(loadBundle("emi.core").send("compose", 1)), ["error", "load", "a", "corpus", "first"]);
});

test("core: 'corpus' reads a folder; 'compose' makes, queues and draws a piece in a chorale's form", () => {
  const core = loadBundle("emi.core");
  const loaded = core.send("corpus", writeCorpus());
  assert.deepEqual(lastStatus(loaded).slice(0, 7), ["status", "corpus", 3, "chorales", "(major),", 33, "beats,"]);

  core.send("beats", 8);
  const out = core.send("compose", 3);
  const status = lastStatus(out);
  // e.g. "emi-3: form of b, 1 phrase, 11 beats, 3 chorales"
  assert.deepEqual(status.slice(0, 3), ["status", "emi-3:", "form"]);
  assert.match(status.join(" "), /^status emi-3: form of [abc], 1 phrase, 11 beats, [23] chorales, SPEAC \d+%, [01] signatures?$/);
  assert.ok(select(out, "coll").length > 1);
  const view = select(out, "view");
  assert.ok(view.some(([kind]) => kind === "seam"), "seams between sources");
  assert.equal(view.filter(([kind]) => kind === "cadence").length, 1, "the template's one cadence");
  const colors = new Set(view.filter(([kind]) => kind === "note").map((n) => n[4]));
  assert.ok(colors.size >= 2, "notes colored by source");

  // Same seed, same piece; "compose" alone: the current seed; "next": one more.
  assert.deepEqual(core.send("compose", 3), out);
  assert.deepEqual(lastStatus(core.send("compose")).slice(0, 2), ["status", "emi-3:"]);
  const next = core.send("next");
  assert.deepEqual(select(next, "setting"), [["seed", 4]], "the seed box shows the new seed");
  assert.deepEqual(lastStatus(next).slice(0, 2), ["status", "emi-4:"]);
});

test("core: a corpus of major and minor chorales: counted by mode, each piece in one key", () => {
  const dir = writeCorpus();
  const [i, iv, V] = [[69, 64, 60, 45], [69, 65, 62, 50], [68, 64, 59, 52]];
  const cycle = [i, iv, V, i, iv, V, i, iv, V].map((c) => [...c, 1]).concat([[...i, 2]]);
  for (const id of ["m", "n", "o"]) writeChorale(dir, id, cycle, { keySignature: { sf: 0, minor: true }, key: { tonic: "A", mode: "minor" } });
  const core = loadBundle("emi.core");
  assert.deepEqual(lastStatus(core.send("corpus", dir)).slice(0, 7), ["status", "corpus", 6, "chorales", "(3", "major,", "3"]);
  core.send("beats", 8);
  const keys = new Set();
  for (let seed = 1; seed <= 6; seed++) {
    const status = lastStatus(core.send("compose", seed)).join(" ");
    const [, key] = status.match(/form of [a-z] \((C major|A minor)\)/);
    assert.equal(key === "A minor", /form of [mno]/.test(status), status);
    keys.add(key);
  }
  assert.equal(keys.size, 2);
});

// M8: 3/4. Three chorales on a I-IV-V cycle in 3/4.
function write34Corpus() {
  const dir = tempDir();
  const [I, IV, V] = [[72, 67, 64, 48], [72, 69, 65, 53], [71, 67, 62, 55]];
  const cycle = [I, IV, V, I, IV, V, I, IV, V].map((c) => [...c, 1]).concat([[...I, 3]]);
  for (const id of ["a", "b", "c"]) writeChorale(dir, id, cycle, { meter: [3, 4] });
  return dir;
}

test("core: 3/4: pieces in 3/4 bars, and the transport follows the meter", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", write34Corpus());
  core.send("beats", 8);
  const out = core.send("compose", 1);
  assert.match(lastStatus(out).join(" "), /^status emi-1: form of [abc], 1 phrase, 12 beats/);
  assert.deepEqual(select(out, "meter"), [[3, 4]]);
  const [clear] = select(out, "view").filter(([kind]) => kind === "clear");
  assert.deepEqual(clear.slice(4), [3 * Q, 0, Q], "bars of 3 beats");
  for (const [, , ...text] of select(out, "view").filter(([kind]) => kind === "source")) assert.match(text.join(" "), /beat [1-3] /);
  // The queue: step 0 is a barline; the pickup is on beat 3 (step 8).
  const steps = select(out, "coll").filter(([kind]) => kind === "store").map(([, step]) => step);
  assert.equal(steps[0], 8);
});

test("core: 3/4 in Live: the set's time signature follows the corpus, only when it differs", () => {
  const folder = tempDir();
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"] });
  const core = engineIn(folder, live);
  core.send("startup", "corpus"); // the Live version
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 1);
  assert.deepEqual(live.calls.filter(([p]) => p === "live_set"), [], "already 4/4");
  core.send("corpus", write34Corpus());
  core.posted.length = 0;
  core.send("compose", 1);
  assert.deepEqual(live.song, { signature_numerator: 3, signature_denominator: 4 });
  assert.match(core.posted.join(""), /Live's time signature set to 3\/4/);
  live.calls.length = 0;
  core.send("compose", 2);
  assert.deepEqual(live.calls.filter(([p]) => p === "live_set"), [], "no change the second time");
});

test("core: 'seed' sets the seed, and composes once a corpus is loaded", () => {
  const core = loadBundle("emi.core");
  assert.deepEqual(core.send("seed", 7), [], "no corpus yet: just remembered");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  assert.deepEqual(lastStatus(core.send("compose")).slice(0, 2), ["status", "emi-7:"]);
  assert.deepEqual(lastStatus(core.send("seed", 9)).slice(0, 2), ["status", "emi-9:"]);
  assert.deepEqual(core.send("key", 1), [], "0/1 from a toggle work too (quiet: no chorale is current)");
  assert.equal(lastStatus(core.send("key", "sideways"))[0], "error");
});

test("core: signatures: listed when a corpus loads, kept at cadences, drawn as bands; 'sigs 0' turns them off", () => {
  const core = loadBundle("emi.core");
  const loaded = lastStatus(core.send("corpus", writeCorpus()));
  assert.equal(loaded.at(-1), "signatures");
  const count = loaded.at(-2);
  assert.ok(count > 0);
  const list = core.posted.join("");
  assert.match(list, new RegExp(`^ml_midi: ${count} signatures in 3 chorales`));
  assert.match(list, /sig1: (soprano|alto|tenor|bass) [-#b0-9]+ \(3\)/);

  core.send("beats", 8);
  core.posted.length = 0;
  const out = core.send("compose", 3);
  assert.match(lastStatus(out).join(" "), /, 1 signature$/);
  const bands = select(out, "view").filter(([kind]) => kind === "signature");
  assert.equal(bands.length, 1);
  const [, start, end, ...name] = bands[0];
  assert.ok(end > start);
  assert.match(name.join(" "), /^(soprano|bass) [-#b0-9]+$/);
  const cadence = select(out, "view").find(([kind]) => kind === "cadence")[1];
  assert.equal(end - 960, cadence, "the band ends with the cadence's beat");
  const [blockLine, qualityLine] = core.posted.join("").split("\n");
  assert.match(blockLine, /^emi-3: (soprano|bass) [-#b0-9]+( \+ (soprano|bass) [-#b0-9]+)? at the cadence in bar \d+ \(beat \d\), from [abc]$/);
  assert.match(qualityLine, /^emi-3: longest quote \d+ notes \((soprano|alto|tenor|bass), as in [abc]\), \d+ beats in a row from [abc]; (no parallel 5ths or 8ves|parallel 5ths\/8ves: \d+, all Bach's own)$/);

  assert.deepEqual(lastStatus(core.send("sigs", 0)), ["status", "no", "signatures", "(as", "in", "M6)"]);
  const plain = core.send("compose", 3);
  assert.match(lastStatus(plain).join(" "), /, 0 signatures$/);
  assert.equal(select(plain, "view").filter(([kind]) => kind === "signature").length, 0);
  assert.deepEqual(lastStatus(core.send("sigs", 1)), ["status", "signatures", "kept", "at", "cadences"]);
});

test("core: the SPEAC lane: a chorale's own labels, and a piece's labels from its sources", () => {
  const core = loadBundle("emi.core");
  const chorale = core.send("loadmidi", writeAMajorChorale());
  const labels = select(chorale, "view").filter(([kind]) => kind === "speac");
  assert.equal(labels.length, 3, "one per beat of the chorale (its three chords)");
  for (const [, , label] of labels) assert.match(label, /^[SPEAC]$/);

  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const out = core.send("compose", 3);
  const lane = select(out, "view").filter(([kind]) => kind === "speac");
  assert.equal(lane.length, 11, "one per beat of the piece");
});

test("core: 'form 0' composes freely, as in M2; 'form 1' goes back to forms", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  assert.deepEqual(lastStatus(core.send("form", 0)), ["status", "free", "pieces", "(M2),", "8+", "beats"]);
  const status = lastStatus(core.send("compose", 3));
  assert.deepEqual([status[1], status[3], status[4]], ["emi-3:", "beats", "from"]);
  assert.ok(status[2] >= 8, "at least 8 beats");
  assert.equal(lastStatus(core.send("form", 1))[1], "pieces");
  assert.equal(lastStatus(core.send("compose", 3))[2], "form");
});

test("core: 'exportmidi' writes the current score as a MIDI file, and a piece's provenance next to it", () => {
  const core = loadBundle("emi.core");
  assert.equal(lastStatus(core.send("exportmidi", path.join(tempDir(), "x.mid")))[0], "error");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 3);
  const target = path.join(tempDir(), "piece"); // ".mid" is added
  assert.deepEqual(lastStatus(core.send("exportmidi", target)), ["status", "exported", "piece.mid", "and", "piece.json"]);
  const midi = smf.parse(fs.readFileSync(target + ".mid"));
  assert.deepEqual(midi.tracks.slice(1).map((t) => t.name), ["Soprano", "Alto", "Tenor", "Bass"]);
  assert.ok(midi.tracks.slice(1).every((t) => t.notes.length > 0));

  const record = JSON.parse(fs.readFileSync(target + ".json", "utf8"));
  assert.equal(record.piece, "emi-3");
  assert.equal(record.seed, 3);
  assert.deepEqual(record.settings, { beats: 8, form: true, signatures: true, stream: false, transpose: 0, temperature: 1, tasteRatings: 0 });
  assert.equal(record.beats.length, 11, "one entry per beat");
  for (const beat of record.beats) {
    assert.match(beat.grouping, /^[abc]:\d+$/);
    assert.ok(beat.bar >= 0 && beat.beat >= 1 && beat.beat <= 4);
    assert.match(beat.speac, /^[SPEAC]$/);
  }
  assert.ok(record.quotes.melody.notes > 0);
  assert.deepEqual(record.quotes.limits, { run: 8, melody: 16 });

  // A loaded chorale has no provenance: just the .mid.
  core.send("loadmidi", writeAMajorChorale());
  assert.deepEqual(lastStatus(core.send("exportmidi", path.join(tempDir(), "chorale.mid"))), ["status", "exported", "chorale.mid"]);
});

test("core: the provenance view: each beat's source, or a chorale's bar and beat", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const sources = select(core.send("compose", 3), "view").filter(([kind]) => kind === "source");
  assert.equal(sources.length, 11);
  for (const [, , ...text] of sources) assert.match(text.join(" "), /^[abc], bar \d+ beat [1-4] · [SPEAC]/);

  const chorale = select(core.send("loadmidi", writeAMajorChorale()), "view").filter(([kind]) => kind === "source");
  assert.equal(chorale.length, 3);
  assert.match(chorale[0].slice(2).join(" "), /^bar \d+ beat [1-4] · [SPEAC]$/);
});

test("core: 'abtest' writes a listening test page from the loaded corpus", () => {
  const core = loadBundle("emi.core");
  assert.equal(lastStatus(core.send("abtest", path.join(tempDir(), "t")))[0], "error", "needs a corpus");
  core.send("corpus", writeCorpus());
  const target = path.join(tempDir(), "listen"); // ".html" is added
  assert.deepEqual(lastStatus(core.send("abtest", target)), ["status", "wrote", "listen.html:", 3, "pairs;", "open", "it", "in", "a", "web", "browser"]);
  const html = fs.readFileSync(target + ".html", "utf8");
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<title>Which Is Bach\?<\/title>/);
});

// ---------------------------------------------------------------- core: streams

// Five chorales with two phrases each (cadences on beats 6 and 12), so a
// stream has room to walk.
function writeStreamCorpus() {
  const dir = tempDir();
  const [I, IV, V] = [[72, 67, 64, 48], [72, 69, 65, 53], [71, 67, 62, 55]];
  const cycle = [I, IV, V, I, IV, V, I, IV, V].map((c) => [...c, 1]).concat([[...I, 2]]);
  for (const id of ["a", "b", "c", "d", "e"]) writeChorale(dir, id, cycle, { fermatas: [6, 12] });
  return dir;
}

// The queue as the player would end up with it: the last store per step.
function queueOf(...outputs) {
  const steps = new Map();
  for (const out of outputs) {
    for (const [kind, step, ...events] of select(out, "coll")) {
      if (kind === "clear") steps.clear();
      else steps.set(step, events);
    }
  }
  return steps;
}

// Plays a queue step by step: every note-off must end a sounding note, no
// note may start twice, and nothing may be left sounding at the end.
function assertPlaysCleanly(steps) {
  const sounding = new Set();
  for (const step of [...steps.keys()].sort((a, b) => a - b)) {
    const events = steps.get(step);
    for (let i = 0; i < events.length; i += 3) {
      const [voice, pitch, velocity] = events.slice(i, i + 3);
      const note = voice + ":" + pitch;
      if (velocity === 0) assert.ok(sounding.delete(note), `step ${step}: note-off for ${note}, which isn't sounding`);
      else {
        assert.ok(!sounding.has(note), `step ${step}: ${note} struck while still sounding`);
        sounding.add(note);
      }
    }
  }
  assert.deepEqual([...sounding], [], "notes left sounding");
}

const thresholds = (out) => select(out, "streamat").map(([step]) => step);

test("stream: compose queues two phrases; 'need' adds the next, until the last", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeStreamCorpus());
  core.send("stream", 1);
  core.send("phrases", 3);
  const start = core.send("compose", 4);
  assert.deepEqual(start.filter(([, kind]) => kind !== "setting")[0], [0, "restart"], "the player starts the stream on the next bar");
  assert.match(lastStatus(start).join(" "), /^status emi-4 stream: phrase 2 of 3 queued \([a-e] phrase 2(, signature [a-z]+ [-#b0-9]+)?\)$/);
  const [first, second] = thresholds(start);
  assert.ok(second > first, "'need' comes when the second phrase starts");

  // Phrase 3 should end the stream. If no final phrase fits there, an
  // ordinary one is queued and the ending is tried again next time.
  const more = [];
  do more.push(core.send("need"));
  while (!lastStatus(more.at(-1)).includes("last)") && more.length < 6);
  const status = lastStatus(more.at(-1)).join(" ");
  assert.match(status, /^status emi-4 stream: phrase \d+ of 3 queued \(.*, the last\)$/);
  assert.ok(Number(status.match(/phrase (\d+) of/)[1]) >= 3);
  assert.deepEqual(thresholds(more.at(-1)), [999999], "nothing more to ask for");
  assert.deepEqual(core.send("need"), [[0, "streamat", 999999]]);
  assertPlaysCleanly(queueOf(start, ...more));
  assert.ok(more.flatMap((out) => select(out, "coll")).every(([kind]) => kind === "store"), "appending never clears the queue");
});

test("stream: phrase joins keep note-offs before note-ons, endlessly", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeStreamCorpus());
  core.send("stream", 1);
  core.send("phrases", 0);
  const outputs = [core.send("compose", 2)];
  for (let k = 0; k < 4; k++) outputs.push(core.send("need"));
  assert.match(lastStatus(outputs.at(-1)).join(" "), /^status emi-2 stream: phrase 6 queued/);
  assertPlaysCleanly(queueOf(...outputs));
});

test("stream: transpose is heard from the next phrase; whole pieces are requeued at once", () => {
  const plain = loadBundle("emi.core");
  const moved = loadBundle("emi.core");
  for (const core of [plain, moved]) {
    core.send("corpus", writeStreamCorpus());
    core.send("stream", 1);
    core.send("phrases", 0);
    core.send("compose", 3);
  }
  assert.deepEqual(lastStatus(moved.send("transpose", 2)), ["status", "transpose", "+2", "from", "the", "next", "phrase"]);
  const pitches = (out) => select(out, "coll").flatMap(([, , ...events]) => events.filter((_, i) => i % 3 === 1));
  const a = pitches(plain.send("need"));
  const b = pitches(moved.send("need"));
  assert.deepEqual(b, a.map((p) => p + 2));

  const whole = loadBundle("emi.core");
  whole.send("corpus", writeCorpus());
  whole.send("beats", 8);
  const before = pitches(whole.send("compose", 3));
  const after = whole.send("transpose", -1);
  assert.deepEqual(after[0], [0, "restart"]);
  assert.deepEqual(pitches(after), before.map((p) => p - 1));
});

test("stream: turning stream off stops asking for phrases", () => {
  const core = loadBundle("emi.core");
  core.send("corpus", writeStreamCorpus());
  core.send("stream", 1);
  core.send("compose", 1);
  core.send("stream", 0);
  assert.deepEqual(core.send("need"), [[0, "streamat", 999999]]);
});

// ---------------------------------------------------------------- core: settings

// An engine whose patch is saved in `folder`, as [v8] sees it (this.patcher).
function engineIn(folder, options) {
  const core = loadBundle("emi.core", options);
  core.context.patcher = { filepath: path.join(folder, "emi.engine.maxpat"), parentpatcher: null };
  return core;
}
const settingsIn = (folder) => JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.settings.json"), "utf8"));

test("settings: nothing is saved before startup, or when the patch has no folder", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("seed", 5);
  core.send("beats", 16);
  assert.equal(fs.existsSync(path.join(folder, "ml_midi.settings.json")), false);
  const unsaved = loadBundle("emi.core");
  assert.equal(lastStatus(unsaved.send("startup", "all"))[0], "error");
});

test("settings: the Max version restores every setting, reloads the corpus and composes", () => {
  const folder = tempDir();
  const corpusDir = writeCorpus();
  const first = engineIn(folder);
  first.send("startup", "all"); // no settings yet
  first.send("corpus", corpusDir);
  first.send("seed", 5);
  first.send("beats", 8);
  first.send("form", 0);
  first.send("key", "original");
  first.send("remember", "bpm", 120);
  first.send("remember", "output", 2);
  assert.deepEqual(settingsIn(folder), {
    corpus: corpusDir, seed: 5, beats: 8, form: 0, signatures: 1, key: 1, stream: 0, phrases: 8, transpose: 0, temperature: 1, host: { bpm: [120], output: [2] },
  });

  const second = engineIn(folder);
  const out = second.send("startup", "all");
  assert.deepEqual(select(out, "setting"), [
    ["seed", 5], ["beats", 8], ["form", 0], ["sigs", 1], ["key", 1], ["stream", 0], ["phrases", 8], ["transpose", 0], ["temperature", 1], ["bpm", 120], ["output", 2],
  ]);
  const status = lastStatus(out);
  assert.deepEqual([status[1], status[3]], ["emi-5:", "beats"], "composed seed 5 freely (form off)");
  assert.ok(select(out, "coll").length > 1, "and queued it");
});

test("settings: the Live version keeps the set's values and only reloads the corpus", () => {
  const folder = tempDir();
  const first = engineIn(folder);
  first.send("startup", "all");
  first.send("corpus", writeCorpus());
  first.send("seed", 5);
  const saved = fs.readFileSync(path.join(folder, "ml_midi.settings.json"), "utf8");

  const live = engineIn(folder, fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"] }));
  live.send("seed", 3); // the set's saved values arrive while the device loads...
  live.send("beats", 8);
  live.send("autoclips", 1);
  assert.equal(fs.readFileSync(path.join(folder, "ml_midi.settings.json"), "utf8"), saved, "...and don't overwrite the file");
  const out = live.send("startup", "corpus");
  assert.deepEqual(select(out, "setting"), [], "controls keep the set's values");
  assert.deepEqual(lastStatus(out).slice(0, 3), ["status", "emi-3:", "form"]);
  assert.ok(!lastStatus(out).join(" ").includes("wrote"), "no clips written at startup");
});

test("settings: a corpus that has gone missing is reported, not fatal", () => {
  const folder = tempDir();
  fs.writeFileSync(path.join(folder, "ml_midi.settings.json"), JSON.stringify({ corpus: path.join(folder, "gone"), seed: 2 }));
  const out = engineIn(folder).send("startup", "all");
  assert.deepEqual(select(out, "setting")[0], ["seed", 2]);
  assert.match(lastStatus(out).join(" "), /^error can't reload the last corpus \(gone\):/);
});

// ---------------------------------------------------------------- core: Live clips

test("core: loading the script doesn't touch the Live API", () => {
  let constructed = 0;
  loadBundle("emi.core", {
    LiveAPI: class {
      constructor() {
        constructed++;
      }
    },
  });
  assert.equal(constructed, 0);
});

test("core: 'writeclips' needs a current score", () => {
  const live = fakeLive({ trackNames: ["EMI"] });
  assert.equal(lastStatus(loadBundle("emi.core", live).send("writeclips"))[0], "error");
  assert.deepEqual(live.calls, []);
});

test("core: 'writeclips' writes the loaded chorale in C, one clip per voice track", () => {
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"], filled: ["2:0"] });
  const core = loadBundle("emi.core", live);
  core.send("loadmidi", writeAMajorChorale());
  assert.deepEqual(lastStatus(core.send("writeclips")), ["status", "wrote", "bwv000", "in", "C", "to", "4", "voice", "tracks"]);
  const creates = live.calls.filter(([, name]) => name === "create_clip").map(([where]) => where);
  assert.deepEqual(creates, [
    "live_set tracks 1 clip_slots 0",
    "live_set tracks 2 clip_slots 1", // slot 0 already has a clip
    "live_set tracks 3 clip_slots 0",
    "live_set tracks 4 clip_slots 0",
  ]);
  // Array.from: arrays made inside the simulated [v8] belong to another realm.
  const bass = live.calls.filter(([, name]) => name === "add_new_notes")[3][2].notes;
  assert.deepEqual(Array.from(bass, (n) => n.pitch), [60, 55, 60]);
});

test("core: with 'autoclips 1', every compose also writes clips", () => {
  const live = fakeLive({ trackNames: ["EMI", "Soprano", "Alto", "Tenor", "Bass"] });
  const core = loadBundle("emi.core", live);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("autoclips", 1);
  assert.match(lastStatus(core.send("compose", 3)).join(" "), /^status emi-3: .*; wrote emi-3 to 4 voice tracks$/);
  assert.equal(live.calls.filter(([, name]) => name === "create_clip").length, 4);
  core.send("autoclips", 0);
  core.send("next");
  assert.equal(live.calls.filter(([, name]) => name === "create_clip").length, 4, "off again: no more clips");
});

test("core: 'writeclips' writes a composed piece; 'testclip' writes the test phrase", () => {
  const live = fakeLive({ trackNames: ["Drums", "EMI"], ownTrack: 1, slotsPerTrack: 2 });
  const core = loadBundle("emi.core", live);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 3);
  assert.deepEqual(lastStatus(core.send("writeclips")), ["status", "wrote", "emi-3", "to", "this", "track"]);
  assert.deepEqual(lastStatus(core.send("testclip")), ["status", "wrote", "EMI", "test-cadence", "to", "this", "track"]);
  const error = lastStatus(core.send("testclip")); // both slots now full
  assert.equal(error[0], "error");
  assert.ok(error.join(" ").includes("no empty clip slot"));
});

// ---------------------------------------------------------------- view

// What a roll drew, leaving out its bar numbers and C labels (and the C
// lines, 1 px high): the texts, and the rectangles.
const isLabel = (text) => /^\d+$/.test(text) || /^[A-G]#?-?\d+$/.test(text);
const texts = (g) => g.calls.filter(([name]) => name === "show_text").map(([, text]) => text).filter((text) => !isLabel(text));
const boxes = (g) => g.calls.filter(([name, , , , h]) => name === "rectangle" && h !== 1);

test("view: the SPEAC lane, one block per beat with its letter, under the notes", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q);
  view.send("note", 0, Q, 60, 0);
  for (const [k, label] of ["P", "E", "A", "C"].entries()) view.send("speac", k * Q, label);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  assert.deepEqual(texts(g), ["P", "E", "A", "C"]);
  const [, , noteY, , noteHeight] = boxes(g)[1];
  assert.ok(noteY + noteHeight <= 169 - 12, "notes stay above the lane");
});

test("view: a signature block is a band behind the notes, with its name (shortened where narrow)", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 8 * Q, 60, 72, 4 * Q);
  view.send("note", 0, Q, 60, 0);
  view.send("signature", Q, 4 * Q, "soprano", "3-2-1"); // 3 beats: 135 px
  view.send("signature", 6 * Q, 7 * Q, "bass", "4-5-1"); // 1 beat: 45 px
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  assert.deepEqual(texts(g), ["soprano 3-2-1", "B 4-5-1"]);
  const rectangles = boxes(g);
  const [, x, , w, h] = rectangles[1];
  assert.ok(Math.abs(x - 45) < 1 && Math.abs(w - 135) < 1 && h === 169, "the first band, over the whole roll");
  const noteAt = g.calls.findIndex((c) => c[0] === "rectangle" && Math.abs(c[1]) < 1 && c[3] < 50);
  const bandAt = g.calls.findIndex((c) => c === rectangles[1]);
  assert.ok(bandAt < noteAt, "bands are drawn first, behind the notes");
});

test("view: parallel fifths and octaves are carets above the lane, red when new", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q);
  view.send("parallel", Q, 0);
  view.send("parallel", 2 * Q, 1);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  const colors = g.calls.filter(([name]) => name === "set_source_rgba").map(([, r, gr]) => [r, gr]);
  assert.ok(colors.some(([r, gr]) => r === 1 && gr === 0.25), "red for a new one");
  const tips = g.calls.filter(([name, x, y]) => name === "line_to" && y === 169 - 8).map(([, x]) => x);
  assert.deepEqual(tips, [90, 180], "one caret at each tick");
});

test("view: the beat under the mouse lights up, with where it came from", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q);
  view.send("source", 0, "a,", "bar", "1", "beat", "1");
  view.send("source", Q, "b,", "bar", "3", "beat", "2", "·", "P");
  view.send("done");
  g.calls.length = 0;
  view.send("onidle", 100, 50); // 360 px for 4 beats: x 100 is beat 2
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 1);
  view.send("paint");
  assert.ok(g.calls.some(([name, text]) => name === "show_text" && text === "b, bar 3 beat 2 · P"));
  g.calls.length = 0;
  view.send("onidle", 110, 60); // the same beat: no redraw
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 0);
  view.send("onidleout");
  view.send("paint");
  assert.ok(!g.calls.some(([name, text]) => name === "show_text" && /bar 3/.test(text)));
});

test("view: a start tick shows only the end of a long score (a stream's last phrases)", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 8 * Q, 60, 72, 4 * Q, 4 * Q); // ticks 4Q..8Q: the second bar
  view.send("note", 4 * Q, 2 * Q, 60, 0);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  const [, x, , w] = boxes(g)[1];
  assert.ok(Math.abs(x) < 1 && Math.abs(w - 179) < 1, "the note fills the left half");
});

test("view: draws one rectangle per note, plus bar lines and seams", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("paint");
  assert.ok(g.calls.some(([name, text]) => name === "show_text" && /load a chorale/.test(text)));

  g.calls.length = 0;
  view.send("clear", 4 * Q, 60, 72, 4 * Q);
  view.send("note", 0, Q, 60, 0);
  view.send("note", Q, Q, 64, 1);
  view.send("note", 2 * Q, 2 * Q, 72, 13); // colors wrap around the palette
  view.send("seam", Q);
  view.send("seam", 2 * Q, 1); // voices moved by octaves: drawn in orange
  view.send("cadence", 3 * Q);
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 0, "nothing drawn before 'done'");
  view.send("done");
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 1);

  g.calls.length = 0;
  view.send("paint");
  const rectangles = boxes(g);
  assert.equal(rectangles.length, 1 + 3); // background + notes
  const [, x, , w] = rectangles[3];
  assert.ok(Math.abs(x - 180) < 1 && Math.abs(w - 179) < 1, "the last note spans the right half");
  const colors = g.calls.filter(([name]) => name === "set_source_rgba").map((c) => c.slice(1).join(","));
  assert.ok(colors.includes("1,0.6,0.15,0.9"), "an orange seam");
  const triangle = g.calls.filter(([name, cx]) => name === "move_to" && Math.abs(cx - (270 - 4)) < 1);
  assert.equal(triangle.length, 1, "a cadence mark at 3/4 of the width");
});

test("view: bars are numbered and each C is named, in larger letters in the window's roll", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 8 * Q, 55, 74, 4 * Q, 0, Q); // two bars, G3 to D5
  view.send("note", 0, Q, 60, 0);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  const labels = g.calls.filter(([name]) => name === "show_text").map(([, text]) => text);
  assert.deepEqual(labels, ["C4", "C5", "1", "2"]);
  const sizes = () => g.calls.filter(([name]) => name === "set_font_size").map(([, n]) => n);
  assert.deepEqual(sizes().slice(0, 2), [8, 8]);

  g.size = [1160, 430]; // the window
  g.calls.length = 0;
  view.send("paint");
  assert.deepEqual(sizes().slice(0, 2), [11, 12]);
});

test("view: a selection made in the other roll is shown at once ('highlight')", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q);
  view.send("done");
  const blue = () => g.calls.some(([name, r, gr, b, a]) => name === "set_source_rgba" && r === 0.35 && a === 0.22);
  g.calls.length = 0;
  view.send("highlight", Q, 3 * Q);
  assert.ok(g.calls.some(([name]) => name === "redraw"));
  view.send("paint");
  assert.ok(blue());
  view.send("highlight");
  g.calls.length = 0;
  view.send("paint");
  assert.ok(!blue());
});

// ---------------------------------------------------------------- core: Emily (M9)

const tasteIn = (folder) => JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.taste.json"), "utf8"));
// A clock the test sets (Date.now inside the script).
function setClock(core, now) {
  core.context.Date = class extends Date {
    static now() {
      return now;
    }
  };
}

test("emily: like and dislike learn from the piece or the beats selected, and the taste is saved", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  const started = core.send("startup", "all");
  assert.deepEqual(select(started, "emily"), [["no", "ratings", "yet"]], "the Emily panel shows her taste");
  assert.deepEqual(lastStatus(core.send("like")), ["error", "load", "a", "corpus", "first"]);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const composed = core.send("compose", 1);
  const ticks = select(composed, "view").filter(([kind]) => kind === "source").map(([, tick]) => tick);

  let out = core.send("like");
  assert.match(lastStatus(out).join(" "), new RegExp(`^status liked emi-1 \\(${ticks.length} beats\\)(: .*)?; 1 rating$`));
  assert.match(select(out, "emily")[0].join(" "), /^1 rating/);
  assert.equal(tasteIn(folder).ratings, 1, "saved next to the settings");
  assert.ok(["a", "b", "c"].some((work) => tasteIn(folder).weights["tpl:" + work]), "the whole piece: its form too");

  // Two beats selected in the piano roll.
  out = core.send("select", ticks[1], ticks[3]);
  assert.match(lastStatus(out).join(" "), /^status selected bars? [-0-9]+ \(2 beats\): like or dislike rates them$/);
  out = core.send("dislike");
  assert.match(lastStatus(out).join(" "), /^status disliked bars? [-0-9]+ of emi-1 \(2 beats\)/);
  assert.equal(tasteIn(folder).ratings, 2);
  core.send("select"); // a click clears it
  assert.match(lastStatus(core.send("like")).join(" "), /^status liked emi-1 \(/);

  // A new piece clears the selection; a selection is redrawn with the piece.
  core.send("select", ticks[1], ticks[3]);
  const again = core.send("compose", 1);
  assert.deepEqual(select(again, "view").filter(([kind]) => kind === "selection"), []);
  core.send("select", ticks[1], ticks[3]);
  assert.match(lastStatus(core.send("like")).join(" "), /of emi-1 \(2 beats\)/);
});

test("emily: a chorale isn't rated; composing with a taste is compared with the same seed without", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("loadmidi", writeAMajorChorale());
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("loadmidi", writeAMajorChorale());
  assert.match(lastStatus(core.send("like")).join(" "), /^error Emily learns from composed music: compose a piece first$/);
  core.send("compose", 1);
  core.send("like");
  core.posted.length = 0;
  core.send("compose", 2);
  assert.ok(core.posted.some((line) => /^emi-2: her taste [-+]\d\.\d\d a beat \([-+]\d\.\d\d without\)/.test(line)), core.posted.join(""));
});

test("emily: in a stream, like rates the phrase playing (the one before in its first moments)", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeStreamCorpus());
  core.send("stream", 1);
  core.send("phrases", 0);
  setClock(core, 1000);
  core.send("compose", 4);
  setClock(core, 9000);
  assert.match(lastStatus(core.send("like")).join(" "), /^status liked phrase 1 of emi-4 \(/);
  core.send("need"); // phrase 2 starts playing
  setClock(core, 9500);
  assert.match(lastStatus(core.send("like")).join(" "), /^status liked phrase 1 of emi-4 \(/, "just after it started: the one before");
  setClock(core, 12000);
  assert.match(lastStatus(core.send("dislike")).join(" "), /^status disliked phrase 2 of emi-4 \(/);
  assert.equal(tasteIn(folder).log.at(-1).what, "phrase 2 of emi-4");
});

test("emily: temperature is clamped, saved and restored", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  assert.deepEqual(lastStatus(core.send("temperature", 0.5)).slice(0, 7), ["status", "temperature", "0.50:", "less", "chance,", "more", "taste"]);
  assert.equal(settingsIn(folder).temperature, 0.5);
  assert.deepEqual(lastStatus(core.send("temperature", 7)).slice(0, 4), ["status", "temperature", "3.00:", "more"]);
  assert.deepEqual(lastStatus(core.send("temperature", 0)).slice(0, 5), ["status", "temperature", "0.00:", "only", "Emily's"]);
  core.send("temperature", 1.5);
  const restored = engineIn(folder).send("startup", "all");
  assert.deepEqual(select(restored, "setting").find(([name]) => name === "temperature"), ["temperature", 1.5]);
});

test("emily: a startup after a session with ratings lets the taste fade; forget keeps a backup", () => {
  const folder = tempDir();
  fs.writeFileSync(path.join(folder, "ml_midi.taste.json"), JSON.stringify({ weights: { "f:susp": 1, "f:16ths": -0.5 }, ratings: 4, likes: 3, rated: 2 }));
  const core = engineIn(folder);
  const out = core.send("startup", "all");
  assert.deepEqual(select(out, "emily"), [["4", "ratings;", "likes", "suspensions;", "dislikes", "16th", "notes"]]);
  const faded = tasteIn(folder);
  assert.deepEqual([faded.weights["f:susp"], faded.weights["f:16ths"], faded.sessions, faded.rated], [0.9, -0.45, 1, 0]);
  engineIn(folder).send("startup", "all");
  assert.equal(tasteIn(folder).weights["f:susp"], 0.9, "no ratings since: no fading");

  const forgot = core.send("forget");
  assert.deepEqual(lastStatus(forgot), ["status", "Emily", "forgot", "her", "taste", "(4", "ratings,", "kept", "in", "ml_midi.taste.backup.json)"]);
  assert.deepEqual(select(forgot, "emily"), [["no", "ratings", "yet"]]);
  assert.equal(tasteIn(folder).ratings, 0);
  const backup = JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.taste.backup.json"), "utf8"));
  assert.equal(backup.weights["f:susp"], 0.9);
});

test("emily: 'taste' lists her opinions and compares ten pieces with and without them", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  assert.deepEqual(lastStatus(core.send("taste")), ["status", "Emily:", "no", "ratings", "yet"]);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  for (const seed of [1, 2, 3]) {
    core.send("compose", seed);
    core.send(seed === 2 ? "dislike" : "like");
  }
  core.posted.length = 0;
  const out = core.send("taste");
  assert.match(core.posted[0], /^ml_midi: Emily's taste: 3 ratings/);
  assert.ok(core.posted.some((line) => /^ {2}seeds 3-12, with her taste and without: her taste /.test(line)), core.posted.join(""));
  assert.match(lastStatus(out).join(" "), /^status Emily, seeds 3-12: her taste [-+]\d\.\d\d a beat/);
});

// ---------------------------------------------------------------- view: selecting beats (M9)

test("view: dragging across the roll selects whole beats and tells the engine; a click clears", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q); // 90 px a beat
  view.send("done");
  assert.deepEqual(view.send("onclick", 10, 50), [], "nothing was selected");
  assert.deepEqual(view.send("ondrag", 200, 50, 1), [[0, "select", 0, 3 * Q]], "beats 1-3");
  assert.deepEqual(view.send("ondrag", 210, 50, 1), [], "the same beats: nothing new");
  assert.deepEqual(view.send("ondrag", 210, 50, 0), [], "released");
  g.calls.length = 0;
  view.send("paint");
  const blue = g.calls.findIndex(([name, r, gr, b, a]) => name === "set_source_rgba" && r === 0.35 && gr === 0.6 && b === 1 && a === 0.22);
  assert.ok(blue >= 0, "a blue band");
  const [, x, , w] = g.calls.slice(blue).find(([name]) => name === "rectangle");
  assert.deepEqual([x, w], [0, 270]);
  assert.deepEqual(view.send("onclick", 300, 50), [[0, "select"]], "a click clears it");

  // The engine sends the selection again when it redraws (a stream's next phrase).
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q);
  view.send("selection", Q, 2 * Q);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  assert.ok(g.calls.some(([name, r, gr, b, a]) => name === "set_source_rgba" && r === 0.35 && a === 0.22));
});

test("emily: both products open at once share one taste: each reads the other's ratings", () => {
  const folder = tempDir();
  const corpusDir = writeCorpus();
  const [max, live] = [engineIn(folder), engineIn(folder)];
  for (const core of [max, live]) {
    core.send("startup", "all");
    core.send("corpus", corpusDir);
    core.send("beats", 8);
    core.send("compose", 1);
  }
  max.send("like");
  assert.match(lastStatus(live.send("dislike")).join(" "), /; 2 ratings$/, "the Live version counts the Max version's like");
  assert.match(lastStatus(max.send("like")).join(" "), /; 3 ratings$/);
  assert.equal(tasteIn(folder).ratings, 3);
});

// ---------------------------------------------------------------- the status boxes

test("text box: draws the words as written (no backslashes, no quoted numbers), wrapped and fitted", () => {
  const box = loadBundle("emi.text");
  const g = box.context.mgraphics;
  g.size = [288, 55]; // as in the panel
  const lines = () => g.calls.filter(([name]) => name === "show_text").map(([, text]) => text);
  box.send("text", "liked", "emi-28", "(60", "beats):", "+", "a", "high", "melody,", "-", "a", "low", "melody;", "10", "ratings");
  g.calls.length = 0;
  box.send("paint");
  assert.equal(lines().join(" "), "liked emi-28 (60 beats): + a high melody, - a low melody; 10 ratings");
  assert.ok(lines().length >= 2, "wrapped to the box's width");
  const sizes = g.calls.filter(([name]) => name === "set_font_size").map(([, n]) => n);
  assert.equal(sizes.at(-1), 12, "short enough for the largest size");

  // Too long for 12 px: the font shrinks; far too long: cut with "...".
  box.send("text", ...Array.from({ length: 60 }, (_, k) => "word" + k));
  g.calls.length = 0;
  box.send("paint");
  assert.ok(g.calls.filter(([name]) => name === "set_font_size").at(-1)[1] < 12);
  box.send("text", ...Array.from({ length: 400 }, (_, k) => "word" + k));
  g.calls.length = 0;
  box.send("paint");
  assert.match(lines().at(-1), / \.\.\.$/);

  // An error: "error:" first, in red.
  box.send("alert", "load", "a", "corpus", "first");
  g.calls.length = 0;
  box.send("paint");
  assert.deepEqual(lines(), ["error: load a corpus first"]);
  assert.ok(g.calls.some(([name, r, gr]) => name === "set_source_rgba" && r === 1 && gr === 0.45));
  box.send("clear");
  g.calls.length = 0;
  box.send("paint");
  assert.deepEqual(lines(), []);
});

// ---------------------------------------------------------------- the pop-up window

test("emily: the window gets her taste in full whenever it changes, and selections show in both rolls", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  const window = (out) => select(out, "emilyview");
  const started = core.send("startup", "all");
  const first = window(started);
  assert.deepEqual([first[0], first[1], first.at(-1)], [["clear", 0, 0, 0, 1], ["strength", 1], ["done"]], "no ratings yet");
  const weights = first.filter(([kind]) => kind === "weight");
  assert.equal(weights.length, 25, "every musical feature (mode only in a corpus of both modes)");
  assert.deepEqual(weights[0], ["weight", "Motion", "f:motion:still", 0, 0, 0, "block", "chords"]);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const composed = core.send("compose", 1);
  const ticks = select(composed, "view").filter(([kind]) => kind === "source").map(([, tick]) => tick);

  let out = core.send("like");
  const rows = window(out);
  assert.deepEqual(rows[0], ["clear", 1, 1, 0, 1]);
  assert.deepEqual(rows.find(([kind]) => kind === "rating"), ["rating", 1, ticks.length, "emi-1"]);
  assert.deepEqual(rows.at(-1), ["done"]);

  out = core.send("taste");
  const compared = window(out);
  assert.deepEqual(compared.find(([kind]) => kind === "compare"), ["compare", 1, 10]);
  out = core.send("dislike");
  assert.ok(!window(out).some(([kind]) => kind === "compare"), "a comparison made before a rating is dropped");
  assert.deepEqual(window(out).filter(([kind]) => kind === "rating").map(([, r, , ...what]) => [r, what.join(" ")]), [[-1, "emi-1"], [1, "emi-1"]], "latest first");
  assert.deepEqual(window(core.send("temperature", 2))[0], ["clear", 2, 1, 0, 2]);

  // A selection made in either roll is drawn in both.
  assert.deepEqual(select(core.send("select", ticks[1], ticks[3]), "view"), [["highlight", ticks[1], ticks[3]]]);
  assert.deepEqual(select(core.send("select"), "view"), [["highlight"]]);
});

test("taste view: likes and dislikes as bars, the last ratings, and the last comparison", () => {
  const view = loadBundle("emi.taste");
  const g = view.context.mgraphics;
  g.size = [1160, 210];
  const lines = () => g.calls.filter(([name]) => name === "show_text").map(([, text]) => text);
  view.send("clear", 0, 0, 0, 1);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  assert.ok(lines().some((text) => /^No ratings yet/.test(text)));

  view.send("clear", 12, 9, 1, 1.5);
  view.send("like", 2.1, "a", "high", "melody");
  view.send("dislike", -1.75, "a", "low", "melody");
  view.send("rating", 1, 60, "emi-28");
  view.send("rating", -1, 8, "bars", "2-3", "of", "emi-1");
  view.send("compare", 1, 10);
  view.send("pair", 83, 54, 1, "a", "high", "melody");
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  const text = lines();
  assert.ok(text.includes("12 ratings (9 liked, 3 disliked)  ·  1 earlier session  ·  temperature 1.50"), text.join(" | "));
  for (const expected of ["a high melody", "+2.10", "a low melody", "-1.75", "emi-28 (60 beats)", "bars 2-3 of emi-1 (8 beats)", "Seeds 1-10: with her taste (without)", "83% (54%)"]) {
    assert.ok(text.includes(expected), expected);
  }
  // The like's bar is 2.1 / 3 of the room for bars.
  const bars = g.calls.filter(([name, , , , h]) => name === "rectangle" && h === 11);
  assert.equal(bars.length, 2);
  assert.ok(bars[0][3] > bars[1][3], "a longer bar for the stronger weight");
});

// ---------------------------------------------------------------- the weight editor

test("emily: pins, strength, release, and a stored taste recalled (with the one before kept)", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 1);
  core.send("like");
  let out = core.send("pin", "f:16ths", 1.5);
  assert.match(lastStatus(out).join(" "), /^status Emily: 16th notes pinned at \+1\.50 \(she learned [-+]?\d\.\d\d\)$/);
  assert.deepEqual(tasteIn(folder).pins, { "f:16ths": 1.5 });
  const row = select(out, "emilyview").find(([kind, , f]) => kind === "weight" && f === "f:16ths");
  assert.deepEqual(row.slice(0, 6), ["weight", "Motion", "f:16ths", row[3], 1, 1.5]);
  assert.match(lastStatus(core.send("pin", "f:nonsense", 1)).join(" "), /^error not a feature: f:nonsense$/);
  assert.match(lastStatus(core.send("strength", 1.5)).join(" "), /^status Emily's taste at strength 1\.50: stronger than learned/);
  assert.equal(tasteIn(folder).strength, 1.5);

  // A rating teaches what she learned, not the pin.
  core.send("dislike");
  assert.equal(tasteIn(folder).pins["f:16ths"], 1.5);

  // Store, change, recall.
  const stored = path.join(folder, "busy");
  assert.match(lastStatus(core.send("storetaste", stored)).join(" "), /^status stored Emily's taste in busy\.json \(2 ratings, 1 pin, strength 1\.50\)$/);
  core.send("unpin");
  core.send("strength", 1);
  core.send("like");
  assert.deepEqual(tasteIn(folder).pins, {});
  out = core.send("recalltaste", stored + ".json");
  assert.match(lastStatus(out).join(" "), /^status recalled Emily's taste from busy\.json \(2 ratings, 1 pin, strength 1\.50\); the one before is in ml_midi\.taste\.backup\.json$/);
  assert.deepEqual([tasteIn(folder).pins, tasteIn(folder).strength, tasteIn(folder).ratings], [{ "f:16ths": 1.5 }, 1.5, 2]);
  assert.equal(JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.taste.backup.json"), "utf8")).ratings, 3);
  assert.match(lastStatus(core.send("recalltaste", path.join(folder, "ml_midi.settings.json"))).join(" "), /^error ml_midi\.settings\.json isn't a stored taste$/);

  // Releasing one pin; then all.
  assert.match(lastStatus(core.send("unpin", "f:16ths")).join(" "), /^status Emily: 16th notes released \(back to [-+]?\d\.\d\d, what she learned\)$/);
  assert.match(lastStatus(core.send("unpin")).join(" "), /^status Emily: no pins to release$/);
});

test("taste view: 'edit' shows a slider per feature; dragging pins, double-clicking releases", () => {
  const view = loadBundle("emi.taste");
  const g = view.context.mgraphics;
  g.size = [1160, 250];
  view.send("clear", 3, 2, 0, 1);
  view.send("strength", 1);
  view.send("weight", "Motion", "f:motion:still", 0.4, 0, 0.4, "block", "chords");
  view.send("weight", "Motion", "f:16ths", -0.2, 0, -0.2, "16th", "notes");
  view.send("weight", "Melody", "f:melody:leap", 0, 0, 0, "melodic", "leaps");
  view.send("done");
  view.send("edit", "weights");
  g.calls.length = 0;
  view.send("paint");
  const text = g.calls.filter(([name]) => name === "show_text").map(([, t]) => t);
  for (const expected of ["Edit Emily's weights", "Motion", "Melody", "block chords", "16th notes", "+0.4", "-0.2", "strength", "1.00"]) assert.ok(text.includes(expected), expected);

  // The 16th notes slider: column 0 (568 px wide), second row.
  const t0 = 12 + 112;
  const t1 = 12 + (1160 - 24) / 2 - 52;
  const y = 72 + 18 + 24;
  const out = [view.send("onclick", t1, y), view.send("ondrag", t1, y, 1), view.send("ondrag", t1, y, 0)].flat();
  assert.deepEqual(out, [[0, "pin", "f:16ths", 3]], "dragged to the right end: +3, sent once");
  assert.deepEqual(view.send("onclick", (t0 + t1) / 2, y), [[0, "pin", "f:16ths", 0]]);
  assert.deepEqual(view.send("ondblclick", (t0 + t1) / 2, y), [[0, "unpin", "f:16ths"]]);
  assert.deepEqual(view.send("onclick", 5, 5), [], "nothing there");

  // Strength: top right, 0..2.
  const sx1 = 1160 - 70;
  assert.deepEqual(view.send("onclick", sx1, 46), [[0, "strength", 2]]);
  assert.deepEqual(view.send("ondblclick", sx1, 46), [[0, "strength", 1]]);

  // "edit" again: back to the overview; clicks do nothing there.
  view.send("edit", "weights");
  assert.deepEqual(view.send("onclick", t1, y), []);
});

test("taste view: hovering over a slider or button shows what it does", () => {
  const view = loadBundle("emi.taste");
  const g = view.context.mgraphics;
  g.size = [1160, 250];
  view.send("clear", 3, 2, 0, 1);
  view.send("strength", 1);
  view.send("weight", "Motion", "f:motion:still", 0.4, 0, 0.4, "block", "chords");
  view.send("weight", "Motion", "f:16ths", -0.2, 0, -0.2, "16th", "notes");
  view.send("own", 1, 8, 2, 0.5, 0.25, 1);
  view.send("work", "emily-1", 1, 8, 2, "seed", "3");
  view.send("snapshot", 4, "2026-10-03", "10:00", "session", "start");
  view.send("done");
  const helpShown = () => {
    g.calls.length = 0;
    view.send("paint");
    return g.calls.filter(([name]) => name === "show_text").map(([, t]) => t).join(" ");
  };
  // In the overview there is nothing to explain.
  view.send("onidle", 200, 100);
  assert.doesNotMatch(helpShown(), /Drag to pin/);

  view.send("edit", "weights");
  helpShown(); // drawn, as Max does after a change, before the mouse moves
  const t0 = 12 + 112;
  const t1 = 12 + (1160 - 24) / 2 - 52;
  view.send("onidle", (t0 + t1) / 2, 72 + 18 + 24);
  let text = helpShown();
  assert.match(text, /16th notes: beats with 16th notes\. Drag to pin her weight/);
  assert.match(text, /double-click to release it/);
  view.send("onidle", 1160 - 150, 46);
  assert.match(helpShown(), /strength: how much her whole taste counts/);
  view.send("onidleout");
  assert.doesNotMatch(helpShown(), /strength: how much/);

  view.send("memory");
  helpShown();
  view.send("onidle", 1160 - 150, 24);
  assert.match(helpShown(), /novelty: the chance that each phrase gets a variant/);
  view.send("onidle", 1160 - 450, 24);
  assert.match(helpShown(), /mix: how much her own works/);
  // The buttons: put aside, keep a snapshot, roll back.
  const column = (1160 - 24) / 2;
  view.send("onidle", 12 + column - 80, 58 + 8 + 20 - 6 - 4);
  assert.match(helpShown(), /put aside: stop composing from this work/);
  view.send("onidle", 12 + column + 180, 58 - 4);
  assert.match(helpShown(), /keep a snapshot: keep her whole taste/);
  view.send("onidle", 12 + column + column - 80, 58 + 8 + 20 - 6 - 4);
  text = helpShown();
  assert.match(text, /roll back: make this snapshot's taste hers again/);
  // Wrapped to fit: no line wider than the box allows.
  const lines = g.calls.filter(([name]) => name === "show_text").map(([, t]) => t).filter((t) => /roll back|snapshot first|exactly/.test(t));
  assert.ok(lines.length >= 2 && lines.every((l) => l.length <= 93), lines.join(" | "));
});

test("taste view: every musical feature Emily knows has hover help; docs/controls.md gives the rest", () => {
  const emily = require("emily-assoc");
  const source = fs.readFileSync(path.join(__dirname, "..", "code", "emi.taste.v8ui.js"), "utf8");
  for (const feature of Object.keys(emily.NAMES)) assert.ok(source.includes(`"${feature}": "`), feature);
  // The sliders' and buttons' help ("name: what it does") is in the docs' table.
  const doc = fs.readFileSync(path.join(__dirname, "..", "docs", "controls.md"), "utf8");
  const helps = [...source.matchAll(/(?:help: |^  [a-z]+: )"([a-z ]+): ([^"]+)"/gm)];
  assert.equal(helps.length, 6, "strength, mix, novelty; put aside, roll back, keep a snapshot");
  for (const [, name, text] of helps) {
    assert.ok(doc.includes(`| **${name}** | ${text[0].toUpperCase()}${text.slice(1)} |`), name);
  }
});

// ---------------------------------------------------------------- M10: variants

test("emily: novelty varies pieces and stream phrases; variants are marked and named", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const plain = lastStatus(core.send("compose", 1)).join(" ");
  assert.doesNotMatch(plain, /variant/);
  assert.match(lastStatus(core.send("novelty", 1)).join(" "), /^status novelty 1\.00: a variant in every phrase/);
  assert.equal(tasteIn(folder).novelty, 1);
  core.posted.length = 0;
  const out = core.send("compose", 1);
  assert.match(lastStatus(out).join(" "), /, 1 variant$|, \d variants$/);
  assert.ok(core.posted.some((line) => /^emi-1: varied: [a-z -]+ \(bar \d+, (soprano|alto|tenor|bass)\)/.test(line)), core.posted.join(""));
  const view = select(out, "view");
  const marks = view.filter(([kind]) => kind === "variant");
  assert.ok(marks.length >= 1);
  const sources = view.filter(([kind]) => kind === "source").map(([, tick, ...text]) => [tick, text.join(" ")]);
  assert.ok(sources.some(([tick, text]) => tick === marks[0][1] && / · varied: /.test(text)), "the hover box names it");

  core.send("stream", 1);
  core.send("phrases", 0);
  const stream = core.send("compose", 2);
  assert.ok(select(stream, "status").some((words) => words.join(" ").includes(", varied: ")));
  core.send("novelty", 0);
  assert.doesNotMatch(lastStatus(core.send("need")).join(" "), /varied/);
});

// ---------------------------------------------------------------- M10: accept and mix

test("emily: accept keeps a piece as her own; mix uses it; mix 0 is Bach alone, as before", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  assert.match(lastStatus(core.send("accept")).join(" "), /^error load a corpus first$/);
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  const before = lastStatus(core.send("compose", 2)).join(" ");
  core.send("novelty", 1);
  core.send("compose", 1);
  const accepted = lastStatus(core.send("accept")).join(" ");
  assert.match(accepted, /^status accepted emi-1 as emily-1 \(generation 1, \d+ beats, \d+ varied\); Emily has 1 work of her own$/);
  const stored = JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.emily.json"), "utf8"));
  assert.deepEqual(stored.works.map((w) => [w.id, w.gen, w.from]), [["emily-1", 1, "emi-1"]]);
  assert.deepEqual([tasteIn(folder).accepted, tasteIn(folder).mix], [["emily-1"], 0.5]);

  core.send("novelty", 0);
  core.send("mix", 0.75);
  const own = [2, 3, 4, 5].map((seed) => lastStatus(core.send("compose", seed)).join(" "));
  assert.ok(own.some((s) => /of Emily's own beats?/.test(s)), own.join("\n"));
  assert.match(lastStatus(core.send("mix", 0)).join(" "), /^status mix 0\.00: Bach only/);
  assert.equal(lastStatus(core.send("compose", 2)).join(" "), before, "mix 0: exactly as before she had music of her own");

  assert.match(lastStatus(core.send("unaccept", "emily-1")).join(" "), /^status emily-1 put aside: Emily no longer uses it/);
  assert.deepEqual(tasteIn(folder).accepted, []);
  assert.match(lastStatus(core.send("unaccept", "emily-1")).join(" "), /^error emily-1 isn't one of Emily's works in use$/);
});

test("emily: accepting a stream phrase keeps that phrase", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeStreamCorpus());
  core.send("stream", 1);
  core.send("phrases", 0);
  core.send("compose", 4);
  assert.match(lastStatus(core.send("accept")).join(" "), /^status accepted phrase 1 of emi-4 as emily-1 \(generation 1, \d+ beats\); Emily has 1 work of her own$/);
});

// ---------------------------------------------------------------- M10: snapshots and rollback

test("emily: a rollback restores an earlier taste exactly, her own music included", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("novelty", 1);
  core.send("compose", 1);
  core.send("like");
  core.send("accept");
  core.send("mix", 0.75);
  const kept = lastStatus(core.send("snapshot")).join(" ");
  assert.match(kept, /^status snapshot #1 kept: 1 rating, 1 work of her own$/);
  const tasteThen = tasteIn(folder);
  const pieceThen = lastStatus(core.send("compose", 3)).join(" ");

  // Later: more ratings, another work, a pin, a different mix.
  core.send("compose", 2);
  core.send("dislike");
  core.send("accept");
  core.send("pin", "f:16ths", 2);
  core.send("mix", 0.25);
  assert.notDeepEqual(tasteIn(folder), tasteThen);

  const out = core.send("rollback", 1);
  assert.match(lastStatus(out).join(" "), /^status rolled back to snapshot #1 \([-0-9]+ [0-9:]+\): 1 rating, 1 work of her own; what was before is snapshot #2$/);
  assert.deepEqual(tasteIn(folder), tasteThen, "her taste, exactly");
  assert.equal(lastStatus(core.send("compose", 3)).join(" "), pieceThen, "and so the same piece for the same seed");
  // The rollback can itself be undone.
  core.send("rollback", 2);
  assert.deepEqual(tasteIn(folder).accepted, ["emily-1", "emily-2"]);
  assert.match(lastStatus(core.send("rollback", 99)).join(" "), /^error no snapshot #99$/);

  // The window lists her works and snapshots, latest first.
  const rows = select(core.send("snapshot"), "emilyview");
  assert.equal(rows.find(([kind]) => kind === "own")[1], 2, "two works of her own");
  assert.deepEqual(rows.filter(([kind]) => kind === "work").map(([, id]) => id), ["emily-2", "emily-1"]);
  assert.deepEqual(rows.filter(([kind]) => kind === "snapshot").map(([, id]) => id), [4, 3, 2, 1]);
});

test("emily: a snapshot is kept when a session starts, if her taste changed", () => {
  const folder = tempDir();
  const core = engineIn(folder);
  core.send("startup", "all");
  core.send("corpus", writeCorpus());
  core.send("beats", 8);
  core.send("compose", 1);
  core.send("like");
  const snapshots = () => JSON.parse(fs.readFileSync(path.join(folder, "ml_midi.snapshots.json"), "utf8")).list.map((s) => s.label);
  engineIn(folder).send("startup", "all");
  assert.deepEqual(snapshots(), ["session start"]);
  engineIn(folder).send("startup", "all");
  assert.deepEqual(snapshots(), ["session start"], "nothing changed: no new one");
});

test("taste view: the memory view lists her works and snapshots; its buttons and sliders talk to the engine", () => {
  const view = loadBundle("emi.taste");
  const g = view.context.mgraphics;
  g.size = [1160, 250];
  view.send("clear", 2, 1, 0, 1);
  view.send("own", 2, 120, 6, 0.5, 0.25, 1);
  view.send("work", "emily-2", 2, 56, 3, "emi-12");
  view.send("work", "emily-1", 1, 64, 5, "emi-11");
  view.send("snapshot", 3, "2026-10-03", "14:12", "kept", "by", "hand:", "2", "ratings");
  view.send("done");
  view.send("memory");
  g.calls.length = 0;
  view.send("paint");
  const text = g.calls.filter(([name]) => name === "show_text").map(([, t]) => t);
  for (const expected of ["Emily's memory", "emily-2", "generation 2 · 56 beats · 3 varied · from emi-12", "#3", "2026-10-03 14:12 · kept by hand: 2 ratings", "put aside", "roll back", "keep a snapshot", "0.50", "0.25"]) {
    assert.ok(text.includes(expected), expected);
  }
  // Click each button: find where it was drawn.
  const at = (label) => g.calls.find(([name, t]) => name === "show_text" && t === label);
  const index = (label) => g.calls.indexOf(at(label));
  const position = (label) => {
    const moves = g.calls.slice(0, index(label)).filter(([name]) => name === "move_to");
    return moves[moves.length - 1].slice(1);
  };
  const [rx, ry] = position("roll back");
  assert.deepEqual(view.send("onclick", rx + 4, ry - 4), [[0, "rollback", 3]]);
  const [ax, ay] = position("put aside");
  assert.deepEqual(view.send("onclick", ax + 4, ay - 4), [[0, "unaccept", "emily-2"]]);
  const [kx, ky] = position("keep a snapshot");
  assert.deepEqual(view.send("onclick", kx + 4, ky - 4), [[0, "snapshot"]]);
  // Novelty: top right, 0..1; mix to its left, 0..0.75.
  assert.deepEqual(view.send("onclick", 1160 - 70, 24), [[0, "novelty", 1]]);
  assert.deepEqual(view.send("ondblclick", 1160 - 70, 24), [[0, "novelty", 0]]);
  assert.deepEqual(view.send("onclick", 1160 - 380, 24), [[0, "mix", 0.75]]);
  assert.deepEqual(view.send("ondblclick", 1160 - 380, 24), [[0, "mix", 0.5]]);
  view.send("memory");
  assert.deepEqual(view.send("onclick", 1160 - 70, 24), [], "back to the overview");
});

// ---------------------------------------------------------------- the playhead

test("view: the playhead is a line where the player is; it moves with the steps and hides at -1", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q); // 4 beats, 90 px each
  view.send("done");
  const line = () => {
    g.calls.length = 0;
    view.send("paint");
    const k = g.calls.findIndex(([name, r, gr, b]) => name === "set_source_rgba" && r === 1 && gr === 0.92 && b === 0.55);
    return k < 0 ? null : g.calls.slice(k).find(([name]) => name === "move_to")[1];
  };
  assert.equal(line(), null, "not playing");
  g.calls.length = 0;
  view.send("playhead", 8); // step 8: beat 3 (16ths)
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 1);
  assert.equal(line(), 180.5);
  g.calls.length = 0;
  view.send("playhead", 8);
  assert.equal(g.calls.filter(([name]) => name === "redraw").length, 0, "the same step: no redraw");
  view.send("playhead", 9);
  assert.equal(line(), 203.5);
  view.send("clear", 4 * Q, 60, 72, 4 * Q, 0, Q); // a stream's next phrase: the playhead stays
  view.send("done");
  assert.equal(line(), 203.5);
  view.send("playhead", -1);
  assert.equal(line(), null, "stopped");
});
