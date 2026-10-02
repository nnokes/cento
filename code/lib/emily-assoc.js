"use strict";
// M9: Emily's taste (Tier 1 of the Emily layer, PLAN §7). You rate what you
// hear, like or dislike; Emily keeps an *association network*: a weight for
// each musical feature, learned from your ratings. Composing then prefers
// beats whose features you liked, among the beats the rules allow. The rules
// and the corpus don't change: Emily only changes which of the valid
// choices is made.
//
// Features. Each beat of the corpus (a grouping) has one feature of each
// musical kind, worked out from its notes (featuresOf):
//   f:motion:still|flowing|busy   how many voices move within the beat
//                                 (none: block chords; one; two or more)
//   f:16ths                       16th notes
//   f:susp                        a suspension: an upper voice held over
//                                 from the beat before, then stepping down
//   f:melody:same|step|leap       the soprano's move to the next beat
//   f:chord:major|minor|seventh|diminished|other   the chord on the beat
//   f:chromatic                   notes outside the key
//   f:key:home|dominant|relative|subdominant|other the key area it's in
//   f:register:low|mid|high       the soprano's highest note
//   f:tension:low|mid|high        Cope's tension (thirds of the corpus)
//   f:mode:major|minor            (corpora of both modes only)
// and four kinds that name things exactly:
//   g:<grouping>   that beat;  t:<a>><b>  that beat followed by that one;
//   w:<work>       beats from that chorale;  sig:<id>  that signature;
//   tpl:<work>     pieces in that chorale's form.
//
// Learning (rate). A rating r is +1 (like) or -1 (dislike), of a whole
// piece, a stream phrase or a selection of beats. For each musical
// feature, Emily compares how often the rated beats have it with how often
// the corpus's beats do, as a z-score (so that a long selection counts more
// than a short one, and a rare feature isn't over-read):
//     w <- w + LEARN * r * clip(z, -3, 3) / 3
// so a liked piece with more 16th notes than usual raises f:16ths and lowers
// whatever it has less of. The exact kinds follow PLAN §7's rule: each one
// present in the rated beats gets w <- w + LEARN_EXACT * r. Weights stay
// within ±LIMIT. Between sessions every weight decays toward 0 by DECAY, so
// early opinions don't harden (decay, at startup).
//
// Using it (prepare). A beat's taste is the sum of its features' weights;
// emi-form adds TASTE times that to the beat's score in its search, a
// transition's weight where it joins two beats, a signature's where its
// block ends, and a template's when choosing the form. Temperature (in
// emi-form) scales the random part of the score instead: at 0 Emily picks
// the most liked of the valid choices; at 1, as before M9; higher, more
// adventurous.
//
// On the full corpus, after ten ratings by a listener who likes one feature
// (pieces with more of it than usual liked, the others disliked), new pieces
// have about 1.5 times as much of it as without the taste (tests/corpus).
//
// Memory, as saved (JSON; the engine keeps it in ml_midi.taste.json next to
// the settings file, so both products share it):
//   { version: 1, weights: { feature: w }, ratings, likes, sessions,
//     rated (ratings since the last decay), log: [{ at, piece, rating, beats, what }] }

const lexicon = require("emi-lexicon");
const signatures = require("emi-signatures");

const LEARN = 0.25;
const LEARN_EXACT = 0.2;
const LIMIT = 3;
const DECAY = 0.1;
const TASTE = 4; // score points per unit of taste (emi-form's SCORE: an accidental match is 16, a label 4)
const PRUNE = 0.02; // weights smaller than this are dropped at decay
const LOG = 200; // ratings kept in the log

// In words, for the panel and the Max window.
const NAMES = {
  "f:motion:still": "block chords",
  "f:motion:flowing": "one moving voice",
  "f:motion:busy": "busy voices",
  "f:16ths": "16th notes",
  "f:susp": "suspensions",
  "f:melody:same": "repeated melody notes",
  "f:melody:step": "stepwise melody",
  "f:melody:leap": "melodic leaps",
  "f:chord:major": "major chords",
  "f:chord:minor": "minor chords",
  "f:chord:seventh": "seventh chords",
  "f:chord:diminished": "diminished chords",
  "f:chord:other": "other sonorities",
  "f:chromatic": "chromatic notes",
  "f:key:home": "the home key",
  "f:key:dominant": "the dominant key",
  "f:key:relative": "the relative key",
  "f:key:subdominant": "the subdominant key",
  "f:key:other": "distant keys",
  "f:register:low": "a low melody",
  "f:register:mid": "a middle melody",
  "f:register:high": "a high melody",
  "f:tension:low": "low tension",
  "f:tension:mid": "middling tension",
  "f:tension:high": "high tension",
  "f:mode:major": "major",
  "f:mode:minor": "minor",
};

function create() {
  return { version: 1, weights: {}, ratings: 0, likes: 0, sessions: 0, rated: 0, log: [] };
}

// A memory as read from a file, made safe to use (unknown or broken parts
// are dropped).
function normalize(memory) {
  const out = create();
  if (!memory || typeof memory !== "object") return out;
  if (memory.weights && typeof memory.weights === "object") {
    for (const [name, w] of Object.entries(memory.weights)) if (typeof w === "number" && Number.isFinite(w)) out.weights[name] = clamp(w);
  }
  for (const key of ["ratings", "likes", "sessions", "rated"]) if (Number.isFinite(memory[key])) out[key] = Math.max(0, Math.round(memory[key]));
  if (Array.isArray(memory.log)) out.log = memory.log.slice(-LOG);
  return out;
}

const clamp = (w) => Math.max(-LIMIT, Math.min(LIMIT, w));

// ---- features

// Where a key area ("7:major": G major, in the work's C major / A minor)
// stands from the home key.
function keyArea(area, mode) {
  if (!area) return "other";
  const [tonic, quality] = area.split(":");
  const t = Number(tonic);
  const rel = mode === "minor" ? (t - 9 + 12) % 12 : t;
  if (mode === "minor") {
    if (rel === 0 && quality === "minor") return "home";
    if (rel === 7) return "dominant";
    if (rel === 3 && quality === "major") return "relative";
    if (rel === 5 && quality === "minor") return "subdominant";
    return "other";
  }
  if (rel === 0 && quality === "major") return "home";
  if (rel === 7 && quality === "major") return "dominant";
  if (rel === 9 && quality === "minor") return "relative";
  if (rel === 5 && quality === "major") return "subdominant";
  return "other";
}

// The chord on the beat's first moment, from its intervals above the bass
// (in semitones, within the octave). Triads in any inversion; a seventh (or
// a second, a seventh chord's third inversion) makes a seventh chord.
function chordOf(tokens, bass) {
  if (bass === null) return "other";
  const rel = new Set(tokens.filter(Boolean).map((t) => (((t.pitch - bass) % 12) + 12) % 12));
  const has = (...list) => list.every((i) => rel.has(i));
  if (has(10) || has(11) || has(2) || has(3, 6, 8) || has(3, 5, 9)) return "seventh";
  if (has(3, 6) || has(3, 9) || has(6, 9)) return "diminished";
  if (has(4, 7) || has(3, 8) || has(5, 9)) return "major";
  if (has(3, 7) || has(4, 9) || has(5, 8)) return "minor";
  if (rel.size <= 2 && (has(4) || has(8))) return "major"; // an incomplete chord
  if (rel.size <= 2 && (has(3) || has(9))) return "minor";
  return "other";
}

// One grouping's musical features (the f: kinds).
function musicalFeatures(db, g, cuts) {
  const out = [];
  const onsets = new Map();
  for (const p of g.pieces) if (!p[5]) onsets.set(p[3], (onsets.get(p[3]) || 0) + 1);
  const moving = [...onsets.values()].filter((n) => n > 1).length;
  out.push(moving === 0 ? "f:motion:still" : moving === 1 ? "f:motion:flowing" : "f:motion:busy");
  if (g.pieces.some((p) => !p[5] && !p[6] && p[2] > 0 && p[2] < db.beatTicks / 2)) out.push("f:16ths");
  const entry = lexicon.parseKey(g.entryKey);
  for (let v = 0; v < entry.length - 1; v++) {
    if (!entry[v] || !entry[v].held) continue;
    const notes = g.pieces.filter((p) => p[3] === v + 1).sort((a, b) => a[0] - b[0]);
    if (notes.length > 1 && notes[1][1] - notes[0][1] < 0 && notes[1][1] - notes[0][1] >= -2) {
      out.push("f:susp");
      break;
    }
  }
  const soprano = g.pieces.filter((p) => p[3] === 1).sort((a, b) => a[0] - b[0]);
  if (g.destKey !== null && soprano.length) {
    const to = lexicon.parseKey(g.destKey)[0];
    if (to) {
      const step = Math.abs(to.pitch - soprano[soprano.length - 1][1]);
      out.push(step === 0 ? "f:melody:same" : step <= 2 ? "f:melody:step" : "f:melody:leap");
    }
  }
  out.push("f:chord:" + chordOf(entry, g.bass));
  if (g.accidentals) out.push("f:chromatic");
  out.push("f:key:" + keyArea(g.area, g.mode));
  if (soprano.length) {
    const top = Math.max(...soprano.map((p) => p[1]));
    out.push(top >= cuts.register[1] ? "f:register:high" : top >= cuts.register[0] ? "f:register:mid" : "f:register:low");
  }
  if (typeof g.tension === "number") out.push(g.tension >= cuts.tension[1] ? "f:tension:high" : g.tension >= cuts.tension[0] ? "f:tension:mid" : "f:tension:low");
  if (db.mode === "mixed" && g.mode) out.push("f:mode:" + g.mode);
  return out;
}

// The thirds of a list of numbers: [lower cut, upper cut].
function thirds(values) {
  const sorted = values.filter((v) => typeof v === "number").sort((a, b) => a - b);
  if (!sorted.length) return [0, 0];
  return [sorted[Math.floor(sorted.length / 3)], sorted[Math.floor((2 * sorted.length) / 3)]];
}

// Every grouping's musical features, and how often each occurs in the
// corpus (its share of beats). Computed once per database.
const featureCache = new WeakMap();
function featureTable(db) {
  if (featureCache.has(db)) return featureCache.get(db);
  const tops = db.groupings.map((g) => Math.max(-1, ...g.pieces.filter((p) => p[3] === 1).map((p) => p[1]))).filter((p) => p >= 0);
  const cuts = { tension: thirds(db.groupings.map((g) => g.tension)), register: thirds(tops) };
  const of = db.groupings.map((g) => musicalFeatures(db, g, cuts));
  const counts = new Map();
  for (const list of of) for (const f of list) counts.set(f, (counts.get(f) || 0) + 1);
  const share = new Map([...counts].map(([f, n]) => [f, n / db.groupings.length]));
  const table = { of, share, cuts };
  featureCache.set(db, table);
  return table;
}

function featuresOf(db, i) {
  return featureTable(db).of[i];
}

// ---- learning

// The beats of a composed piece or stream (its provenance) between two
// ticks, as a region to rate: { beats: [grouping index], transitions:
// [[a, b]], works, signatures, template }.
function regionOf(db, piece, from = -Infinity, to = Infinity) {
  const index = indexOf(db);
  const entries = (piece.provenance || []).filter((p) => p.tick >= from && p.tick < to && index.has(p.grouping));
  const beats = entries.map((p) => index.get(p.grouping));
  const transitions = [];
  for (let k = 1; k < entries.length; k++) {
    if (entries[k].tick - entries[k - 1].tick === db.beatTicks) transitions.push([beats[k - 1], beats[k]]);
  }
  const sigs = [...new Set(entries.flatMap((p) => p.signatures || []))];
  const whole = from === -Infinity && to === Infinity;
  const template = piece.form && piece.form.template && whole ? piece.form.template : null;
  return { beats, transitions, works: [...new Set(entries.map((p) => p.work))], signatures: sigs, template };
}

const indexCache = new WeakMap();
function indexOf(db) {
  if (!indexCache.has(db)) indexCache.set(db, new Map(db.groupings.map((g, i) => [g.id, i])));
  return indexCache.get(db);
}

// Learns from one rating (r: 1 like, -1 dislike) of a region. Returns the
// musical features that moved most: [[feature, change]], largest first.
function rate(db, memory, region, r, { piece = null, what = null, at = null } = {}) {
  const n = region.beats.length;
  if (!n) return [];
  const { of, share } = featureTable(db);
  const counts = new Map();
  for (const i of region.beats) for (const f of of[i]) counts.set(f, (counts.get(f) || 0) + 1);
  const changes = [];
  const add = (name, delta) => {
    const w = clamp((memory.weights[name] || 0) + delta);
    if (w === 0) delete memory.weights[name];
    else memory.weights[name] = w;
  };
  for (const [f, mean] of share) {
    if (mean <= 0 || mean >= 1) continue;
    const x = (counts.get(f) || 0) / n;
    const z = Math.max(-3, Math.min(3, (x - mean) / Math.sqrt((mean * (1 - mean)) / n)));
    const delta = (LEARN * r * z) / 3;
    add(f, delta);
    changes.push([f, delta]);
  }
  for (const i of new Set(region.beats)) add("g:" + db.groupings[i].id, LEARN_EXACT * r);
  for (const [a, b] of region.transitions) add(`t:${db.groupings[a].id}>${db.groupings[b].id}`, LEARN_EXACT * r);
  for (const work of region.works) add("w:" + work, LEARN_EXACT * r);
  for (const id of region.signatures) add("sig:" + id, LEARN_EXACT * r);
  if (region.template) add("tpl:" + region.template, LEARN_EXACT * r);
  memory.ratings++;
  if (r > 0) memory.likes++;
  memory.rated++;
  memory.log.push({ at, piece, rating: r, beats: n, what });
  if (memory.log.length > LOG) memory.log.splice(0, memory.log.length - LOG);
  return changes.sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
}

// A new session: if anything was rated since the last one, every weight
// moves DECAY of the way toward 0 (and the smallest are dropped). Returns
// whether it decayed.
function decay(memory) {
  if (!memory.rated) return false;
  for (const [name, w] of Object.entries(memory.weights)) {
    const next = w * (1 - DECAY);
    if (Math.abs(next) < PRUNE) delete memory.weights[name];
    else memory.weights[name] = next;
  }
  memory.rated = 0;
  memory.sessions++;
  return true;
}

// ---- using it

// What emi-form needs, in its score points (null when Emily has no opinions):
//   beat: Int32Array, each grouping's taste
//   edges: Map(a -> Map(b -> points)), transitions
//   blockEnd: Map(end grouping -> points), a signature block's signatures
//   templates: Map(work -> weight), the form's weight (with its mode's)
function prepare(db, memory) {
  const weights = memory && memory.weights ? memory.weights : {};
  const names = Object.keys(weights);
  if (!names.length) return null;
  const { of } = featureTable(db);
  const index = indexOf(db);
  const beat = new Int32Array(db.groupings.length);
  let any = false;
  db.groupings.forEach((g, i) => {
    let sum = (weights["g:" + g.id] || 0) + (weights["w:" + g.work] || 0);
    for (const f of of[i]) sum += weights[f] || 0;
    beat[i] = Math.round(TASTE * sum);
    if (beat[i]) any = true;
  });
  const edges = new Map();
  for (const name of names) {
    if (!name.startsWith("t:")) continue;
    const [a, b] = name.slice(2).split(">").map((id) => index.get(id));
    if (a === undefined || b === undefined) continue;
    const points = Math.round(TASTE * weights[name]);
    if (!points) continue;
    if (!edges.has(a)) edges.set(a, new Map());
    edges.get(a).set(b, points);
  }
  const blockEnd = new Map();
  for (const block of signatures.blocks(db)) {
    const points = Math.round(TASTE * block.sigs.reduce((sum, id) => sum + (weights["sig:" + id] || 0), 0));
    if (points && (!blockEnd.has(block.end) || Math.abs(points) > Math.abs(blockEnd.get(block.end)))) blockEnd.set(block.end, points);
  }
  const templates = new Map();
  for (const work of db.works) {
    const w = (weights["tpl:" + work.id] || 0) + (db.mode === "mixed" ? weights["f:mode:" + work.mode] || 0 : 0);
    if (w) templates.set(work.id, w);
  }
  if (!any && !edges.size && !blockEnd.size && !templates.size) return null;
  return { beat, edges: edges.size ? edges : null, blockEnd: blockEnd.size ? blockEnd : null, templates: templates.size ? templates : null };
}

// How well a piece's beats fit the taste: the mean of their taste, in
// weight units (0: no opinion).
function fit(db, memory, piece) {
  const region = regionOf(db, piece);
  if (!region.beats.length) return 0;
  const { of } = featureTable(db);
  const weights = memory.weights;
  let sum = 0;
  for (const i of region.beats) {
    const g = db.groupings[i];
    sum += (weights["g:" + g.id] || 0) + (weights["w:" + g.work] || 0);
    for (const f of of[i]) sum += weights[f] || 0;
  }
  return sum / region.beats.length;
}

// How often each musical feature occurs in a piece's beats: Map(f -> share).
function shares(db, piece) {
  const region = regionOf(db, piece);
  const { of } = featureTable(db);
  const counts = new Map();
  for (const i of region.beats) for (const f of of[i]) counts.set(f, (counts.get(f) || 0) + 1);
  return new Map([...counts].map(([f, c]) => [f, c / Math.max(1, region.beats.length)]));
}

// The musical features Emily likes and dislikes most: { likes: [[f, w]],
// dislikes: [[f, w]] }, strongest first, at most `count` of each.
function opinions(memory, count = 3, threshold = 0.1) {
  const musical = Object.entries(memory.weights).filter(([f]) => f.startsWith("f:"));
  const likes = musical.filter(([, w]) => w >= threshold).sort((a, b) => b[1] - a[1]).slice(0, count);
  const dislikes = musical.filter(([, w]) => w <= -threshold).sort((a, b) => a[1] - b[1]).slice(0, count);
  return { likes, dislikes };
}

const nameOf = (f) => NAMES[f] || f;

// What a rating taught, in words: "+ suspensions, + seventh chords, - block
// chords" (the features that moved most, at most `count`).
function describeChanges(changes, count = 3) {
  return changes
    .filter(([, delta]) => Math.abs(delta) >= 0.01)
    .slice(0, count)
    .map(([f, delta]) => (delta > 0 ? "+ " : "- ") + nameOf(f))
    .join(", ");
}

// Emily's taste in a line: "12 ratings; likes suspensions, seventh chords;
// dislikes block chords".
function summary(memory, count = 2) {
  if (!memory.ratings) return "no ratings yet";
  const { likes, dislikes } = opinions(memory, count);
  const parts = [memory.ratings + (memory.ratings === 1 ? " rating" : " ratings")];
  if (likes.length) parts.push("likes " + likes.map(([f]) => nameOf(f)).join(", "));
  if (dislikes.length) parts.push("dislikes " + dislikes.map(([f]) => nameOf(f)).join(", "));
  return parts.join("; ");
}

// Pieces composed with the taste and the same seeds without it, compared:
// { fit: [with, without], features: [[f, share with, share without]] } for
// the features Emily likes and dislikes most (mean shares over the pieces).
function compare(db, memory, withTaste, without, count = 3) {
  const mean = (list, f) => list.reduce((sum, value) => sum + f(value), 0) / Math.max(1, list.length);
  const { likes, dislikes } = opinions(memory, count);
  const all = [...likes, ...dislikes].map(([f]) => f);
  const sharesWith = withTaste.map((p) => shares(db, p));
  const sharesWithout = without.map((p) => shares(db, p));
  return {
    fit: [mean(withTaste, (p) => fit(db, memory, p)), mean(without, (p) => fit(db, memory, p))],
    features: all.map((f) => [f, mean(sharesWith, (m) => m.get(f) || 0), mean(sharesWithout, (m) => m.get(f) || 0)]),
  };
}

exports.LEARN = LEARN;
exports.LEARN_EXACT = LEARN_EXACT;
exports.LIMIT = LIMIT;
exports.DECAY = DECAY;
exports.TASTE = TASTE;
exports.NAMES = NAMES;
exports.create = create;
exports.normalize = normalize;
exports.featuresOf = featuresOf;
exports.featureTable = featureTable;
exports.chordOf = chordOf;
exports.keyArea = keyArea;
exports.regionOf = regionOf;
exports.rate = rate;
exports.decay = decay;
exports.prepare = prepare;
exports.fit = fit;
exports.shares = shares;
exports.opinions = opinions;
exports.nameOf = nameOf;
exports.describeChanges = describeChanges;
exports.summary = summary;
exports.compare = compare;
