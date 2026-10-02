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
    "autoclips", "beats", "clear", "compose", "corpus", "exportmidi", "form", "key", "loadmidi", "need", "next",
    "pattern", "phrases", "remember", "seed", "sigs", "startup", "stream", "testclip", "transpose", "writeclips",
  ]);
  assert.deepEqual(loadBundle("emi.view").handlers(), ["cadence", "clear", "done", "note", "onclick", "onidle", "onidleout", "onresize", "paint", "parallel", "seam", "signature", "source", "speac"]);
  assert.deepEqual(loadBundle("emi.voice").handlers(), ["trackname"]);
});

// Convention: one inlet and one outlet per [v8] wrapper. If a script fails to
// load, [v8] keeps its default single inlet and outlet and Max deletes any
// other cords ("patchcord outlet out of range"), which is what happened in M0.
test("[v8] bundles have one inlet and one outlet; the view has no outlet", () => {
  const counts = (name) => {
    const { context } = loadBundle(name);
    return [context.inlets, context.outlets, context.autowatch];
  };
  assert.deepEqual(counts("emi.hello"), [1, 1, 1]);
  assert.deepEqual(counts("emi.core"), [1, 1, 1]);
  assert.deepEqual(counts("emi.view"), [1, 0, 1]);
  assert.deepEqual(counts("emi.voice"), [1, 1, 1]);
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
  assert.deepEqual(record.settings, { beats: 8, form: true, signatures: true, stream: false, transpose: 0 });
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
    corpus: corpusDir, seed: 5, beats: 8, form: 0, signatures: 1, key: 1, stream: 0, phrases: 8, transpose: 0, host: { bpm: [120], output: [2] },
  });

  const second = engineIn(folder);
  const out = second.send("startup", "all");
  assert.deepEqual(select(out, "setting"), [
    ["seed", 5], ["beats", 8], ["form", 0], ["sigs", 1], ["key", 1], ["stream", 0], ["phrases", 8], ["transpose", 0], ["bpm", 120], ["output", 2],
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

test("view: the SPEAC lane, one block per beat with its letter, under the notes", () => {
  const view = loadBundle("emi.view");
  const g = view.context.mgraphics;
  view.send("clear", 4 * Q, 60, 72, 4 * Q);
  view.send("note", 0, Q, 60, 0);
  for (const [k, label] of ["P", "E", "A", "C"].entries()) view.send("speac", k * Q, label);
  view.send("done");
  g.calls.length = 0;
  view.send("paint");
  assert.deepEqual(g.calls.filter(([name]) => name === "show_text").map(([, text]) => text), ["P", "E", "A", "C"]);
  const [, , noteY, , noteHeight] = g.calls.filter(([name]) => name === "rectangle")[1];
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
  assert.deepEqual(g.calls.filter(([name]) => name === "show_text").map(([, text]) => text), ["soprano 3-2-1", "B 4-5-1"]);
  const rectangles = g.calls.filter(([name]) => name === "rectangle");
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
  const [, x, , w] = g.calls.filter(([name]) => name === "rectangle")[1];
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
  const rectangles = g.calls.filter(([name]) => name === "rectangle");
  assert.equal(rectangles.length, 1 + 3); // background + notes
  const [, x, , w] = rectangles[3];
  assert.ok(Math.abs(x - 180) < 1 && Math.abs(w - 179) < 1, "the last note spans the right half");
  const colors = g.calls.filter(([name]) => name === "set_source_rgba").map((c) => c.slice(1).join(","));
  assert.ok(colors.includes("1,0.6,0.15,0.9"), "an orange seam");
  const triangle = g.calls.filter(([name, cx]) => name === "move_to" && Math.abs(cx - (270 - 4)) < 1);
  assert.equal(triangle.length, 1, "a cadence mark at 3/4 of the width");
});
