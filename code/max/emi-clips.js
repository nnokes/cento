"use strict";
// Max-only (Live version): writes a score into Live clips through the Live
// API. Called only in response to a message (a click), never in a script's
// top-level code: the Live API isn't available while a device is loading.
//
// writeScore(score, name) -> status text. One clip per voice into the
// Soprano/Alto/Tenor/Bass tracks if all four exist, otherwise all voices into
// one clip on the device's own track.

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

exports.writeScore = writeScore;
