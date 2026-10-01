// [v8] wrapper that writes scores into Live clips through the Live API.
// Live version only. Glue only: the logic is in code/lib and code/max. Patches
// load patchers/emi.clips.bundle.js.
//
// The Live API is only used in response to a message (a click), never in the
// script's top-level code: the Live API isn't available while a device is
// still loading.
//
// Messages:  loadmidi <path>       -> read a chorale (+ its .json sidecar)
//            key c | key original  -> write it in C major / A minor (default) or as written
//            writeclips            -> write the loaded chorale
//            testclip              -> write the hard-coded test phrase
// Both write one clip per voice into the Soprano/Alto/Tenor/Bass tracks if all
// four exist, otherwise all voices into one clip on this track.
// Outlet 0:  status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const live = require("emi-live");
const loader = require("emi-load");

let loaded = null;
let keyMode = "c";

function loadmidi(path) {
  try {
    loaded = loader.loadWork(path);
    outlet(0, "status", "clips:", "loaded", loaded.id);
  } catch (e) {
    outlet(0, "error", e.message);
  }
}

function key(mode) {
  if (mode === "c" || mode === "original") keyMode = mode;
}

function writeclips() {
  if (!loaded) {
    outlet(0, "error", "load", "a", "chorale", "first");
    return;
  }
  const work = loader.inKey(loaded, keyMode);
  writeScore(work, work.id + (work.transposedBy ? " in C" : ""));
}

function testclip() {
  const score = patterns.testChorale();
  writeScore(score, "EMI " + score.name);
}

function writeScore(score, name) {
  try {
    const voices = live.toLiveNotes(score);
    const length = live.clipLengthBeats(score);
    const tracks = voices.length === 4 ? live.findVoiceTracks(trackNames()) : null;
    if (tracks) {
      tracks.forEach((track, voice) => writeClip("live_set tracks " + track, voices[voice], length, name));
      outlet(0, "status", "wrote", ...name.split(" "), "to", "4", "voice", "tracks");
    } else {
      const ownTrack = liveApi("this_device canonical_parent").unquotedpath;
      writeClip(ownTrack, voices.flat(), length, name);
      outlet(0, "status", "wrote", ...name.split(" "), "to", "this", "track");
    }
  } catch (e) {
    outlet(0, "error", e.message);
  }
}
writeScore.local = 1;

function liveApi(path) {
  return new LiveAPI(path);
}
liveApi.local = 1;

function trackNames() {
  const count = liveApi("live_set").getcount("tracks");
  const names = [];
  for (let i = 0; i < count; i++) names.push(live.liveText(liveApi("live_set tracks " + i).get("name")));
  return names;
}
trackNames.local = 1;

// Writes notes into the first empty clip slot of a track.
function writeClip(trackPath, notes, lengthBeats, name) {
  const slots = liveApi(trackPath).getcount("clip_slots");
  for (let s = 0; s < slots; s++) {
    const slotPath = trackPath + " clip_slots " + s;
    const slot = liveApi(slotPath);
    if (Number(live.liveValue(slot.get("has_clip"))) === 0) {
      slot.call("create_clip", lengthBeats);
      const clip = liveApi(slotPath + " clip");
      clip.call("add_new_notes", { notes });
      clip.set("name", name);
      return;
    }
  }
  throw new Error("no empty clip slot on " + trackPath);
}
writeClip.local = 1;
