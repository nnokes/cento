"use strict";
// Max-only (Live version): writes a score into Live clips through the Live
// API. Called only in response to a message (a click), never in a script's
// top-level code: the Live API isn't available while a device is loading.
//
// writeScore(score, name) -> status text. One clip per voice into the
// Soprano/Alto/Tenor/Bass tracks if all four exist, otherwise all voices into
// one clip on the device's own track. setMeter(n, d): the set's time
// signature.

const live = require("emi-live");

function liveApi(path) {
  return new LiveAPI(path);
}

function trackNames() {
  const count = liveApi("live_set").getcount("tracks");
  const names = [];
  for (let i = 0; i < count; i++) names.push(live.liveText(liveApi("live_set tracks " + i).get("name")));
  return names;
}

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

function writeScore(score, name) {
  const voices = live.toLiveNotes(score);
  const length = live.clipLengthBeats(score);
  const tracks = voices.length === 4 ? live.findVoiceTracks(trackNames()) : null;
  if (tracks) {
    tracks.forEach((track, voice) => writeClip("live_set tracks " + track, voices[voice], length, name));
    return "wrote " + name + " to 4 voice tracks";
  }
  const ownTrack = liveApi("this_device canonical_parent").unquotedpath;
  writeClip(ownTrack, voices.flat(), length, name);
  return "wrote " + name + " to this track";
}

// Sets the Live set's time signature to a score's meter (M8: 3/4 corpora),
// if it isn't already. Returns true if it changed it.
function setMeter(numerator, denominator) {
  const song = liveApi("live_set");
  const current = [song.get("signature_numerator"), song.get("signature_denominator")].map((v) => Number(live.liveValue(v)));
  if (current[0] === numerator && current[1] === denominator) return false;
  song.set("signature_numerator", numerator);
  song.set("signature_denominator", denominator);
  return true;
}

exports.writeScore = writeScore;
exports.setMeter = setMeter;
