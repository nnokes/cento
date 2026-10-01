// [v8] wrapper that writes scores into Live clips through the Live API.
// Live version only. Glue only: the logic is in code/lib. Patches load
// javascript/emi.clips.bundle.js.
//
// The Live API is only used in response to a message (a click), never while
// the device is loading. [v8] runs its script after the patch has loaded, so a
// load-time message like a "ready" from [live.thisdevice] would arrive before
// the script exists.
//
// Messages:  testclip -> write the test phrase: one clip per voice into the
//                       Soprano/Alto/Tenor/Bass tracks if all four exist,
//                       otherwise all voices into one clip on this track
// Outlet 0:  status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const live = require("emi-live");

function testclip() {
  try {
    const score = patterns.testChorale();
    const voices = live.toLiveNotes(score);
    const length = live.clipLengthBeats(score);
    const name = "EMI " + score.name;
    const tracks = live.findVoiceTracks(trackNames());
    if (tracks) {
      tracks.forEach((track, voice) => writeClip("live_set tracks " + track, voices[voice], length, name));
      outlet(0, "status", "test", "clip", "written", "to", "4", "voice", "tracks");
    } else {
      const ownTrack = liveApi("this_device canonical_parent").unquotedpath;
      writeClip(ownTrack, voices.flat(), length, name);
      outlet(0, "status", "test", "clip", "written", "to", "this", "track");
    }
  } catch (e) {
    outlet(0, "error", e.message);
  }
}

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
