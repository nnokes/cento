// [v8] wrapper that writes scores into Live clips through the Live API.
// Live version only. Glue only: the logic is in code/lib. Patches load
// javascript/emi.clips.bundle.js.
//
// The Live API must not be used before the device has finished loading, so
// [live.thisdevice] sends "ready" first.
//
// Messages:  ready    -> allow Live API calls
//            testclip -> write the test phrase: one clip per voice into the
//                       Soprano/Alto/Tenor/Bass tracks if all four exist,
//                       otherwise all voices into one clip on this track
// Outlet 0:  status <text...> | error <text...>

autowatch = 1;
inlets = 1;
outlets = 1;

const patterns = require("emi-pattern");
const live = require("emi-live");

let isReady = false;

function ready() {
  isReady = true;
  outlet(0, "status", "live", "api", "ready");
}

function testclip() {
  if (!isReady) {
    outlet(0, "error", "device", "not", "ready", "yet");
    return;
  }
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
