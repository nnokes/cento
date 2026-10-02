// [v8] wrapper inside emi.voice, the device on each voice track in Live. Glue
// only: the naming rule is in code/lib/emi-live.js, shared with clip writing,
// so a track's clips and the notes its device receives always agree. Patches
// load patchers/emi.voice.bundle.js.
//
// The track's name picks the voice: Soprano, Alto, Tenor or Bass (or S, A, T,
// B; any case). Renaming the track switches the voice.
//
// Messages:  trackname <name...>   from [live.observer] on the track's name
// Outlet 0:  set emi.voice.<n>      -> [receive]; n is 0 when the name matches
//                                      no voice (nothing is sent there)
//            show <text...>         -> the device's label

autowatch = 1;
inlets = 1;
outlets = 1;

const live = require("emi-live");

const VOICE_NAMES = ["Soprano", "Alto", "Tenor", "Bass"];

function trackname(...atoms) {
  const voice = live.voiceOfTrack(live.liveText(atoms));
  outlet(0, "set", "emi.voice." + voice);
  if (voice) outlet(0, "show", VOICE_NAMES[voice - 1]);
  else outlet(0, "show", "no", "voice");
}
