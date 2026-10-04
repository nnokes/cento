"""Writes every patch and device in patchers/ (the .maxpat files and the two .amxd
devices) and docs/controls.md.

This script is the master copy of the patches: change a patch here, run it,
and commit both. A change made in Max is lost the next time this runs unless
it is made here too. CI runs it with --check.

    python3 tools/maxgen.py           # write the patches
    python3 tools/maxgen.py --check   # exit 1 if any written file would change

Python's standard library only. Development only: it isn't part of what ships.
"""
import json
import struct
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CHECK = "--check" in sys.argv[1:]
STALE = []  # --check: the files that would change
APPVERSION = {"major": 9, "minor": 0, "revision": 7, "architecture": "x64", "modernui": 1}


class Patch:
    def __init__(self, rect=(80, 80, 900, 620), presentation=False, devicewidth=None):
        self.rect = rect
        self.presentation = presentation
        self.devicewidth = devicewidth
        self.boxes = []
        self.lines = []
        self.n = 0

    def _add(self, box):
        self.n += 1
        box["id"] = f"obj-{self.n}"
        self.boxes.append({"box": box})
        return box["id"]

    def _place(self, box, x, y, w, h, pres):
        box["patching_rect"] = [float(x), float(y), float(w), float(h)]
        if pres is not None:
            box["presentation"] = 1
            box["presentation_rect"] = [float(v) for v in pres]
        return box

    def obj(self, text, x, y, ins, outs, outtypes=None, w=None, pres=None, **extra):
        w = w or max(40, 7 * len(text) + 14)
        box = {
            "maxclass": "newobj",
            "text": text,
            "numinlets": ins,
            "numoutlets": outs,
            "outlettype": outtypes if outtypes is not None else [""] * outs,
        }
        if text.startswith("v8 "):
            box["textfile"] = {"filename": text.split()[1], "flags": 0, "embed": 0, "autowatch": 1}
        box.update(extra)
        return self._add(self._place(box, x, y, w, 22, pres))

    def sub(self, text, x, y, patch, ins, outs, w=None):
        """A [p name] subpatcher."""
        return self.obj(text, x, y, ins, outs, w=w, patcher=patch.patcher_dict())

    def msg(self, text, x, y, w=None, pres=None, **extra):
        w = w or max(30, 7 * len(text) + 16)
        box = {"maxclass": "message", "text": text, "numinlets": 2, "numoutlets": 1, "outlettype": [""]}
        box.update(extra)
        return self._add(self._place(box, x, y, w, 22, pres))

    def comment(self, text, x, y, w=None, h=20, pres=None, **extra):
        w = w or max(30, 6.5 * len(text) + 10)
        box = {"maxclass": "comment", "text": text, "numinlets": 1, "numoutlets": 0}
        box.update(extra)
        return self._add(self._place(box, x, y, w, h, pres))

    def ui(self, maxclass, x, y, w, h, ins, outs, outtypes, pres=None, **extra):
        box = {"maxclass": maxclass, "numinlets": ins, "numoutlets": outs, "outlettype": outtypes}
        box.update(extra)
        return self._add(self._place(box, x, y, w, h, pres))

    def inlet(self, x, y, comment, index):
        box = {"maxclass": "inlet", "comment": comment, "index": index, "numinlets": 0,
               "numoutlets": 1, "outlettype": [""]}
        return self._add(self._place(box, x, y, 30, 30, None))

    def outlet(self, x, y, comment, index):
        box = {"maxclass": "outlet", "comment": comment, "index": index, "numinlets": 1, "numoutlets": 0}
        return self._add(self._place(box, x, y, 30, 30, None))

    def bpatcher(self, name, x, y, w, h, ins, outs, pres=None):
        box = {
            "maxclass": "bpatcher", "name": name, "numinlets": ins, "numoutlets": outs,
            "outlettype": [""] * outs, "offset": [0.0, 0.0], "viewvisibility": 1,
            "bgmode": 0, "border": 0, "clickthrough": 0, "enablehscroll": 0,
            "enablevscroll": 0, "lockeddragscroll": 0,
        }
        return self._add(self._place(box, x, y, w, h, pres))

    def connect(self, src, outlet, dst, inlet):
        self.lines.append({"patchline": {"source": [src, outlet], "destination": [dst, inlet]}})

    def patcher_dict(self):
        p = {
            "fileversion": 1,
            "appversion": APPVERSION,
            "classnamespace": "box",
            "rect": [float(v) for v in self.rect],
            "openinpresentation": 1 if self.presentation else 0,
            "default_fontsize": 12.0,
            "default_fontface": 0,
            "default_fontname": "Arial",
            "gridonopen": 1,
            "gridsize": [15.0, 15.0],
            "gridsnaponopen": 1,
            "objectsnaponopen": 1,
            "statusbarvisible": 2,
            "toolbarvisible": 1,
            "boxes": self.boxes,
            "lines": self.lines,
        }
        if self.devicewidth is not None:
            p["devicewidth"] = float(self.devicewidth)
        return p

    def to_json(self, extra=None):
        p = self.patcher_dict()
        if extra:
            p.update(extra)
        return json.dumps({"patcher": p}, indent="\t", ensure_ascii=True) + "\n"


def write(path, data):
    """Writes text or bytes to a file in the repo (with --check, only compares)."""
    full = REPO / path
    raw = data if isinstance(data, bytes) else data.encode("utf-8")
    if CHECK:
        if not full.exists() or full.read_bytes() != raw:
            STALE.append(path)
        return
    full.parent.mkdir(parents=True, exist_ok=True)
    full.write_bytes(raw)
    print("wrote", path)


# ---------------------------------------------------------------- hover help
# Every control a player sees gets hover text: "hint" is Max's tooltip (a
# yellow box after a moment's rest), "annotation" with "annotation_name" is
# what Max's Clue window and Live's Info View show. One table, by patch and
# by the control's varname (or a message box's text); docs/controls.md is
# written from it too.
MAP = " Map it to a key or a MIDI note (Cmd+K or Cmd+M in Live)."
VOICES = ["soprano", "alto", "tenor", "bass"]
RATE = "the beats you selected in the piano roll, or else the stream phrase playing, or else the whole piece"
LIKE = (f"Tell Magdalena you like what you're hearing: {RATE}. She learns which musical features it has, "
        "and prefers them when she composes.")
DISLIKE = (f"Tell Magdalena you don't like what you're hearing: {RATE}. She learns to avoid its musical "
           "features.")
ACCEPT = (f"Keep what you're hearing in Magdalena's notebook: {RATE}. She composes from it alongside "
          "Bach from then on (how much: mix, in the pop-up window's memory tab).")
TASTE = ("Report Magdalena's taste: what she likes and dislikes most, in the Max window, and ten pieces "
         "composed with and without her taste, compared feature by feature. The pop-up window shows its "
         "progress (it composes a piece at a time, so you can go on playing) and the result. It changes "
         "nothing.")
ROLL = ("Colours: the chorale each beat came from. Bright lines: seams between beats; gold bands: "
        "signatures; red marks: new parallel fifths or octaves; purple dots: notes Magdalena varied; yellow "
        "line: the playhead. Drag across beats to select them for like, dislike and accept (a click "
        "clears); hover over a beat to see where it came from, and over the SPEAC lane's letters (along "
        "the bottom) for what each means.")
HELP = {
    "emi.host.max": {
        "Play": ("Play / stop", "play (green): starts Max's transport and plays the current piece (or stream) "
                 "through the output below, from the next barline; the button turns red and says stop. stop: "
                 "stops the transport and silences held notes. When a piece (or a stream with a set number of "
                 "phrases) ends, it stops by itself and says play again."),
        "BPM": ("Tempo", "Tempo in beats per minute (20 to 300) for Max's transport. Drag or type. "
                "Remembered for next time."),
        "Audio": ("Audio", "Audio on or off (Max's DSP). Needed only for plug-in instruments: the MIDI "
                  "output plays without it."),
        "Output": ("Output", "The MIDI port the four voices go to, one channel each: 1 soprano, 2 alto, "
                   "3 tenor, 4 bass. AU DLS Synth 1 is the Mac's own instruments. Remembered for next time."),
        "Plug-in Instruments": ("plug-in instruments", "On: the voices play through four plug-in instruments "
                                "inside Max (choose them with set up) instead of the MIDI port. Turn audio on "
                                "(the speaker) to hear them. Remembered for next time."),
        "Set Up": ("set up", "Open the plug-in instruments window: choose the AU or VST3 instrument that "
                   "plays each voice, and show its editor."),
        "More Features": ("more features", "Open the more features window: the blind listening test, "
                          "loading a single chorale, and the test phrase."),
    },
    "emi.extras": {
        "Listening Test": ("listening test", "Write a blind listening test: a web page of 10 pairs, each a "
                           "Bach chorale and a piece composed in its form, in random order. Can listeners "
                           "tell which is Bach?"),
        "Load A Chorale": ("load a chorale", "Load one chorale (a MIDI file): it plays as written and is "
                           "drawn in the piano roll, in C major or A minor, or in its own key with original "
                           "key on."),
        "Original Key": ("original key", "On: a chorale you load (load a chorale) keeps its own key. Off: it "
                         "is moved to C major or A minor (the default). Only for loaded chorales."),
        "Test Phrase": ("play the test phrase", "Play a built-in phrase (no chorales needed), to check that "
                        "the voices sound."),
        "Clear Queue": ("stop and clear the queue", "What is playing stops at once, and nothing is left "
                        "queued to play."),
    },
    "emi.instruments": {
        **{f"Choose {k + 1}": (f"choose ({VOICES[k]})", f"Choose the AU or VST3 instrument that plays the "
                               f"{VOICES[k]} (voice {k + 1}) when plug-in instruments is on.") for k in range(4)},
        **{f"Show Editor {k + 1}": (f"show editor ({VOICES[k]})", f"Show the editor window of the "
                                    f"{VOICES[k]}'s plug-in instrument.") for k in range(4)},
    },
    "emi.host.live": {
        "Write Clips": ("write clips", "Write the current piece as MIDI clips, one per voice, in the first "
                        "empty clip slot of the Soprano, Alto, Tenor and Bass tracks. Edit them in Live like "
                        "any clip." + MAP),
        "Test Clips": ("test clips", "Write a short test phrase as clips on the voice tracks: a quick check "
                       "that the tracks are named and set up."),
        "Clips On Compose": ("clips on compose", "On: every piece composed is also written as clips (as "
                             "write clips does), so nothing you like is lost."),
        "Play Through Voices": ("play through voices", "On: while Live plays, the piece plays through the "
                                "cento.voice devices on the voice tracks. Turn it off to hear only clips you "
                                "wrote (otherwise each note sounds twice)."),
        "All Voices Here": ("all voices on this track", "On: all four voices also come out of this track, to hear "
                            "the whole piece on this track's instrument."),
    },
    "emi.panel": {
        "Compose": ("compose", "Compose a piece with the seed shown (with stream on: start a stream). "
                    "While playing, the new music starts at the next bar." + MAP),
        "Seed": ("seed", "The random seed: the same seed, chorales, settings and taste always give the same "
                 "piece. Changing it composes at once (once chorales are loaded)."),
        "Next": ("next", "Add 1 to the seed and compose: the quickest way to hear another piece." + MAP),
        "Export MIDI": ("export midi", "Save the current piece as a MIDI file. For a composed piece or "
                        "stream, a .json of where every beat came from is saved next to it."),
        "Corpora": ("corpora", "Open the corpus window: the folders of chorales (MIDI files) to "
                    "compose from, each switched on or off. Composing uses every folder that is on, as "
                    "one corpus; they are loaded by themselves next time."),
        "Beats": ("beats", "The shortest piece to compose, in beats (4 to 256). With chorale form on, only "
                  "chorales at least this long lend their form."),
        "Form": ("chorale form", "On: each piece takes the form of a real chorale: its phrases and cadences "
                 "fall in the same places. Off: beats are joined freely, with no phrase plan."),
        "Stream": ("stream", "On: compose starts a stream, composed a phrase at a time while it plays, "
                   "for as many phrases as phrases says. Off: compose makes a whole piece."),
        "Phrases": ("phrases", "How many phrases a stream plays before it ends (0: endless)."),
        "Transpose": ("transpose", "Transpose the music by semitones (-12 to 12): a piece at once, a "
                      "stream from its next phrase."),
        "Signatures": ("signatures", "On: Bach's signatures (cadence formulas found in several chorales) "
                       "are kept whole at cadences, shown as gold bands in the piano roll. Off: cadences "
                       "are recombined like any other beats."),
        "Status": ("Status", "What the engine just did, or what went wrong."),
    },
    "top": {
        "Window": ("window", "Open the pop-up window: a large piano roll and Magdalena's taste in full, "
                   "where you can edit her weights and see her memory (and read who she is)."),
    },
    "emily.panel": {
        "Like": ("Like", LIKE + MAP),
        "Dislike": ("Dislike", DISLIKE + MAP),
        "Temperature": ("temperature", "How much chance still plays when composing. 0: only Magdalena's "
                        "favourite choices; 1: as if she weren't there (the default); up to 3: more "
                        "adventurous."),
        "Accept": ("keep", ACCEPT + MAP),
        "Magdalena": ("Magdalena", "Magdalena in a line: how many ratings she has had, and what she likes "
                      "and dislikes most. Her full report, and who she is: the pop-up window (\u2197, top right)."),
    },
    "emi.window": {
        "Piano roll": ("Piano roll", "The current piece, large. " + ROLL),
        "Taste": ("Magdalena's taste", "The user's taste, as Magdalena has learned it, in three views, chosen by the tabs at its top right: "
                  "overview (what she likes and dislikes most, her latest ratings, the last taste "
                  "comparison), weights and memory. Hover over a tab, slider or button for what it does."),
        "Window Like": ("like", LIKE),
        "Window Dislike": ("dislike", DISLIKE),
        "Window Keep": ("keep", ACCEPT),
        "Taste Report": ("taste report", TASTE),
        "Reload Seed": ("reload seed", "Compose the seed shown again, with Magdalena's taste, mix and novelty "
                        "as they are now, to hear and see what your changes did. With stream on, the stream "
                        "starts again."),
        "Release All Pins": ("release all pins", "Release every pinned weight: each goes back to what "
                             "Magdalena learned from your ratings."),
        "Store Taste": ("store taste", "Save Magdalena's whole taste (weights, pins, strength, ratings) to a "
                        "file you choose."),
        "Recall Taste": ("recall taste", "Load a taste saved with store taste and make it hers. The taste "
                         "it replaces is kept as a backup and as a snapshot."),
        "Forget": ("forget", "Start a new taste from nothing. The old one is kept as a backup and as a "
                   "snapshot, so you can roll back to it."),
        "Explain Magdalena": ("explain Magdalena", "Who Magdalena is and what she does: she learns the "
                              "user's taste, keeps a notebook of the music you keep, and is named after Anna "
                              "Magdalena Bach."),
    },
    "emi.corpora": {
        "Corpora": ("Corpora", "Every folder of chorales on the list: switch one on or off with its box, "
                    "use it alone (only), or take it off the list (remove). Composing uses every folder that "
                    "is on, as one corpus, and the seed shown is composed again with it. A chorale in two "
                    "folders counts once; the corpus has one meter (the first folder's). Hover over a name for "
                    "its folder's full path."),
        "Add Folder": ("add folder", "Choose a folder of chorales (MIDI files, as tools/export-chorales.py "
                       "writes them, e.g. Documents/Cento/corpus-both). It joins the list, switched on."),
        "Rescan": ("rescan", "Read every folder again, after adding or removing chorales in one. (Folders are "
                   "read once, when first switched on.)"),
    },
    "emi.view": {
        "Piano roll": ("Piano roll", "The current piece. " + ROLL + " For a large one: the window "
                       "button (\u2197) at the top right."),
    },
    "emi.voice": {
        "Voice": ("Voice", "The voice this device plays, from its track's name: Soprano, Alto, Tenor or "
                  "Bass. Rename the track to change it."),
    },
}
ANNOTATED = set()


def annotate(name, p):
    """Sets the hover text of every visible control in p from HELP[name]."""
    table = HELP[name]
    used = set()
    for entry in p.boxes:
        b = entry["box"]
        if not b.get("presentation") or b["maxclass"] in ("comment", "panel", "bpatcher"):
            continue
        key = b.get("varname") or b.get("text")
        if key not in table:
            raise KeyError(f"{name}: no hover text for {b['maxclass']} {key!r}")
        title, text = table[key]
        b["hint"] = text
        b["annotation"] = text
        b["annotation_name"] = title
        used.add(key)
    unused = set(table) - used
    if unused:
        raise KeyError(f"{name}: hover text for no control: {sorted(unused)}")
    ANNOTATED.add(name)
    return p


def controls_doc():
    """docs/controls.md: every control's hover text, by panel."""
    sections = [
        ("top", "Both versions: the row of section names along the top (the button at its right)"),
        ("emi.host.max", "Max version: transport and output (left panel of `cento.maxpat`)"),
        ("emi.host.live", "Live version: clips and voices (left panel of the cento.brain device)"),
        ("emi.panel", "Composing (both versions)"),
        ("emily.panel", "Magdalena: the user's taste (both versions)"),
        ("emi.view", "Piano roll (both versions)"),
        ("emi.instruments", "The plug-in instruments window (Max version: set up, in the left panel)"),
        ("emi.extras", "The more features window (Max version: more features, in the left panel)"),
        ("emi.window", "The pop-up window (both versions: Magdalena's panel, window)"),
        ("emi.corpora", "The corpus window (both versions: the panel's corpora button)"),
        ("emi.voice", "The cento.voice device (Live)"),
    ]
    out = ["# Controls", "",
           "What every control does: the same text you see when you hover over it. In Max, rest the mouse "
           "on a control for a moment and its hint appears (or open Window > Clue Window). In Live, the "
           "text appears in the Info View (View > Info, or the ? button at the bottom left).", "",
           "This page is written from the same table as the hover text (the patch generator), so they "
           "agree; `tests/patches.test.js` checks it.", ""]
    for name, heading in sections:
        out += [f"## {heading}", "", "| Control | What it does |", "| --- | --- |"]
        for title, text in HELP[name].values():
            out.append(f"| **{title}** | {text} |")
        out.append("")
    out += ["## In the pop-up window's taste pane", "",
            "These are drawn by the window's taste pane (`code/emi.taste.v8ui.js`), so their help is drawn "
            "there too: rest the mouse on a slider or button and a box beside it says what it does. Each "
            "weight slider also says what its musical feature means (for example, *suspensions: an upper "
            "voice held over from the beat before, then stepping down*).", "",
            "| Control | What it does |", "| --- | --- |",
            "| **overview** (tab) | What she likes and dislikes most, her latest ratings, and the last taste "
            "comparison. |",
            "| **weights** (tab) | A slider per musical feature, to pin her weight for it, and strength. |",
            "| **memory** (tab) | Her notebook, snapshots of her taste to roll back to, and the mix and "
            "novelty sliders. |",
            "| **a feature's slider** | Drag to pin Magdalena's weight for that feature (-3: she avoids it, +3: "
            "she seeks it); double-click to release it to what she learned (the thin line). |",
            "| **strength** | How much her whole taste counts when composing. 0: not at all; 1: as she learned "
            "it; 2: twice as much. Double-click for 1. |",
            "| **mix** | How much the works in her notebook (the ones you kept) count against Bach's when "
            "composing. 0: Bach only; 0.75: mostly hers. Double-click for 0.5. |",
            "| **novelty** | The chance that each phrase gets a variant of her own: a passing tone, a "
            "neighbour note, a suspension, a re-voiced chord... 0: never; 1: every phrase. Double-click for 0. |",
            "| **put aside** | Stop composing from this work of hers. It stays in her memory file: roll back to "
            "a snapshot from when it was in use to bring it back. |",
            "| **keep a snapshot** | Keep her whole taste as it is now, to roll back to later. |",
            "| **roll back** | Make this snapshot's taste hers again, exactly: weights, pins, sliders, and "
            "which of her works are in use. The taste she has now is kept as a snapshot first. |", "",
            "## In the corpus window's list", "",
            "Drawn by `code/emi.corpora.v8ui.js`, with its help drawn the same way.", "",
            "| Control | What it does |", "| --- | --- |",
            "| **a folder's box** | Switch this folder on or off. Composing uses every folder that is on, as one "
            "corpus; the seed shown is composed again with it. |",
            "| **only** | Switch this folder on and every other one off. |",
            "| **remove** | Take this folder off the list (the folder and its files stay where they are). Add it "
            "again with add folder. |",
            "| **a folder's name** | Hover over it for the folder's full path. |", ""]
    return "\n".join(out)


# ---------------------------------------------------------------- emi.engine
def grid_player():
    p = Patch(rect=(120, 120, 1100, 720))
    p.comment("Grid player: one step per 16th note while the transport runs (Max's, or Live's inside "
              "M4L). The step comes from the transport's position, so the queue (step 0 = a barline) "
              "starts on the next bar after Play and stays in time through tempo changes. Reads "
              "[coll ---emi.queue]; outputs voice <n> <pitch> <velocity>, and need when the stream's last queued phrase starts, and where it is for the piano rolls' "
              "playhead. Steps per bar follow the transport's time signature (16 in 4/4, 12 in 3/4). Once the "
              "queue has started it plays straight on, a step per tick: if the transport jumps (Link, a moved "
              "playhead), the origin moves with it, so the piece doesn't jump back.",
              20, 10, w=1040, h=48, linecount=3)
    play = p.inlet(20, 70, "play (bang, Max's Play): start the queue at the next bar", 1)
    stop = p.inlet(160, 70, "stop (bang): note-offs for sounding notes", 2)
    restart = p.inlet(300, 70, "restart (bang): note-offs; the queue starts again at the bar after this one", 3)
    threshold = p.inlet(900, 70, "streamat <step>: send need when the queue reaches it", 4)
    end_at = p.inlet(1150, 70, "endat <step>: send ended each time the queue reaches it (999999: never)", 5)

    # Where the transport is, as a step (16ths from the start of bar 1)
    metro = p.obj("metro 16n @quantize 16n @active 1", 520, 70, 2, 1, ["bang"])
    transport = p.obj("transport", 520, 105, 2, 9)
    p.connect(metro, 0, transport, 0)
    pk = p.obj("pack 0 0 0.", 520, 140, 3, 1, w=90)
    for k in range(3):
        p.connect(transport, k, pk, k)
    to_step = p.obj("expr ($i1 - 1) * $i4 + ($i2 - 1) * $i5 + int(($f3 + 60.) / 120.)", 520, 175, 5, 1, w=330)
    p.connect(pk, 0, to_step, 0)
    p.comment("bars beats units -> step", 860, 140, w=160)
    # Steps per bar and per beat, from the time signature. The transport's
    # outlets fire right to left, so these are set before bars arrives.
    per_beat = p.obj("expr 16 / $i1", 760, 70, 1, 1, w=90)
    per_bar = p.obj("expr $i1 * $i2", 860, 70, 2, 1, w=90)
    p.connect(transport, 6, per_beat, 0)
    p.connect(per_beat, 0, per_bar, 1)
    p.connect(per_beat, 0, to_step, 4)
    p.connect(transport, 5, per_bar, 0)
    p.connect(per_bar, 0, to_step, 3)
    p.comment("time signature -> steps per beat, per bar", 960, 70, w=130, h=34, linecount=2)
    split = p.obj("t i i i", 520, 210, 1, 3, ["int", "int", "int"], w=60)
    p.connect(to_step, 0, split, 0)

    # A jump (not the next step): the transport moved (Play from a stopped
    # transport, a moved playhead, or Ableton Link realigning Max's transport).
    diff = p.obj("- 0", 700, 245, 2, 1, ["int"], w=40)
    p.connect(split, 2, diff, 0)
    p.connect(split, 1, diff, 1)
    jumped = p.obj("!= 1", 700, 280, 2, 1, ["int"], w=40)
    p.connect(diff, 0, jumped, 0)
    sel_jump = p.obj("sel 1", 700, 315, 2, 2, ["bang", ""], w=45)
    p.connect(jumped, 0, sel_jump, 0)
    flush_all = p.obj("t b", 700, 350, 1, 1, ["bang"], w=35)
    # The origin moves by the jump, so the queue goes on to its next step:
    # a playing piece never jumps back or ahead with the transport.
    shift = p.obj("- 1", 860, 280, 2, 1, ["int"], w=40)
    p.connect(diff, 0, shift, 0)
    moved = p.obj("sel 0", 860, 315, 2, 2, ["bang", ""], w=45)
    p.connect(shift, 0, moved, 0)
    origin_sum = p.obj("+ 0", 860, 385, 2, 1, ["int"], w=40)
    p.connect(moved, 1, origin_sum, 0)
    p.comment("a jump: the origin follows it, so the piece plays on", 910, 315, w=170, h=34, linecount=2)

    # The origin: the first barline at or after the step (after it, on a restart)
    anchor_t = p.obj("t i i", 520, 245, 1, 2, ["int", "int"], w=45)
    p.connect(split, 0, anchor_t, 0)
    gate = p.obj("gate 1 1", 300, 280, 2, 1, w=60)
    p.connect(anchor_t, 1, gate, 1)
    lead = p.obj("+ 0", 300, 315, 2, 1, ["int"], w=40)
    p.connect(gate, 0, lead, 0)
    to_bar = p.obj("expr (($i1 + $i2 - 1) / $i2) * $i2", 300, 350, 2, 1, w=190)
    p.connect(lead, 0, to_bar, 0)
    p.connect(per_bar, 0, to_bar, 1)
    origin_t = p.obj("t b i", 300, 385, 1, 2, ["bang", "int"], w=45)
    p.connect(to_bar, 0, origin_t, 0)
    close = p.msg("0", 300, 420, w=30)
    p.connect(origin_t, 0, close, 0)
    p.connect(close, 0, gate, 0)
    p.comment("gate open = find the origin on the next step; lead 1 = strictly after", 20, 350, w=270, h=34, linecount=2)

    relative = p.obj("- 0", 520, 420, 2, 1, ["int"], w=40)
    p.connect(anchor_t, 0, relative, 0)
    # The origin, found or moved: kept (for the next jump), then used.
    origin_set = p.obj("t i i", 860, 420, 1, 2, ["int", "int"], w=45)
    p.connect(origin_t, 1, origin_set, 0)
    p.connect(origin_sum, 0, origin_set, 0)
    p.connect(origin_set, 1, origin_sum, 1)
    p.connect(origin_set, 0, relative, 1)
    p.comment("step in the queue", 570, 420, w=120)
    rel_t = p.obj("t i i", 520, 455, 1, 2, ["int", "int"], w=45)
    p.connect(relative, 0, rel_t, 0)

    # The playhead: the step in the queue, for the piano rolls; -1 (hidden)
    # before the queue starts (after a restart, until the next barline) and
    # on stop. Only changes are sent.
    clamp = p.obj("maximum -1", 1060, 455, 2, 1, ["int"], w=80)
    p.connect(relative, 0, clamp, 0)
    changed = p.obj("change -2", 1060, 490, 1, 3, ["", "int", "int"], w=70)
    p.connect(clamp, 0, changed, 0)
    hide = p.msg("-1", 1150, 455, w=30)
    p.connect(stop, 0, hide, 0)
    p.connect(hide, 0, changed, 0)
    to_view = p.obj("prepend view playhead", 1060, 525, 2, 1, w=140)
    p.connect(changed, 0, to_view, 0)
    playhead = p.outlet(1060, 650, "view playhead <step>: where the queue is, for the piano rolls (-1: hidden)", 3)
    p.connect(to_view, 0, playhead, 0)

    # play / stop / restart
    open_gate = p.msg("1", 20, 245, w=30)
    lead0 = p.msg("0", 60, 245, w=30)
    lead1 = p.msg("1", 100, 245, w=30)
    p.connect(open_gate, 0, gate, 0)
    p.connect(lead0, 0, lead, 1)
    p.connect(lead1, 0, lead, 1)
    # A jump sets lead 0, so a transport starting somewhere new (Live's Play,
    # which isn't sent to the player) begins the queue at the next barline at
    # or after the step, even after a restart.
    p.connect(sel_jump, 0, lead0, 0)
    play_t = p.obj("t b b", 20, 140, 1, 2, ["bang", "bang"], w=45)
    p.connect(play, 0, play_t, 0)
    p.connect(play_t, 1, lead0, 0)
    p.connect(play_t, 0, open_gate, 0)
    stop_t = p.obj("t b b b", 160, 140, 1, 3, ["bang", "bang", "bang"], w=60)
    p.connect(stop, 0, stop_t, 0)
    p.connect(stop_t, 2, flush_all, 0)
    p.connect(stop_t, 1, lead0, 0)
    p.connect(stop_t, 0, open_gate, 0)
    restart_t = p.obj("t b b b", 300, 140, 1, 3, ["bang", "bang", "bang"], w=60)
    p.connect(restart, 0, restart_t, 0)
    p.connect(restart_t, 2, flush_all, 0)
    p.connect(restart_t, 1, lead1, 0)
    p.connect(restart_t, 0, open_gate, 0)

    # need: once, when the queue reaches the threshold
    reached = p.obj("< 999999", 900, 455, 2, 1, ["int"], w=70)
    p.connect(threshold, 0, reached, 1)
    p.connect(rel_t, 1, reached, 0)
    sel_need = p.obj("sel 0", 900, 490, 2, 2, ["bang", ""], w=45)
    p.connect(reached, 0, sel_need, 0)
    need_t = p.obj("t b b", 900, 525, 1, 2, ["bang", "bang"], w=45)
    p.connect(sel_need, 0, need_t, 0)
    never = p.msg("999999", 980, 560, w=60)
    p.connect(need_t, 1, never, 0)
    p.connect(never, 0, reached, 1)
    need = p.outlet(900, 650, "need (bang): queue the stream's next phrase", 2)
    p.connect(need_t, 0, need, 0)
    p.comment("step >= threshold: need, then never again until a new threshold", 980, 490, w=200, h=34, linecount=2)

    # ended: each time the queue reaches the piece's last step (its last
    # note-offs), so a piece played again ends again. The Max version stops.
    at_end = p.obj("== 999999", 1150, 455, 2, 1, ["int"], w=75)
    p.connect(end_at, 0, at_end, 1)
    p.connect(rel_t, 1, at_end, 0)
    sel_end = p.obj("sel 1", 1150, 490, 2, 2, ["bang", ""], w=45)
    p.connect(at_end, 0, sel_end, 0)
    ended = p.outlet(1150, 650, "ended (bang): the queue reached the end of the piece", 4)
    p.connect(sel_end, 0, ended, 0)
    p.comment("step = the last step: ended", 1230, 490, w=150)

    # The queue: step -> voice pitch velocity triples, note-offs first
    coll = p.obj("coll ---emi.queue", 520, 490, 1, 4, ["", "", "", "bang"])
    p.connect(rel_t, 0, coll, 0)
    it = p.obj("zl.iter 3", 520, 525, 2, 2)
    p.connect(coll, 0, it, 0)
    route = p.obj("route 1 2 3 4", 520, 560, 2, 5)
    p.connect(it, 0, route, 0)
    out = p.outlet(20, 650, "voice <n> <pitch> <velocity>", 1)
    p.comment("[flush] remembers sounding notes, so stop and restart can release them", 20, 560,
              w=420)
    for k in range(4):
        x = 20 + k * 180
        fl = p.obj("flush", x, 590, 2, 2, ["int", "int"], w=45)
        pk2 = p.obj("pack 0 0", x, 615, 2, 1, w=60)
        pre = p.obj(f"prepend voice {k + 1}", x + 65, 615, 2, 1, w=95)
        p.connect(route, k, fl, 0)
        p.connect(fl, 0, pk2, 0)
        p.connect(fl, 1, pk2, 1)
        p.connect(pk2, 0, pre, 0)
        p.connect(pre, 0, out, 0)
        p.connect(flush_all, 0, fl, 0)
    return p


def engine():
    p = Patch(rect=(60, 60, 1000, 560))
    p.comment("emi.engine: host-agnostic. Talks only through this inlet/outlet; "
              "the host adapter (emi.host.max or emi.host.live) owns ports, transport and UI. "
              "Every [v8] has one inlet and one outlet (its script runs after the patch loads).",
              20, 10, w=900, h=34, linecount=2)
    inl = p.inlet(20, 55, "from host adapter: play, stop, hello [seed], and everything emi.core handles", 1)
    route = p.obj("route hello play stop", 20, 100, 2, 4)
    p.connect(inl, 0, route, 0)

    hello = p.obj("v8 emi.hello.bundle.js", 20, 150, 1, 1)
    hello_pre = p.obj("prepend status", 20, 185, 2, 1)
    p.connect(route, 0, hello, 0)
    p.connect(hello, 0, hello_pre, 0)

    core = p.obj("v8 emi.core.bundle.js", 420, 150, 1, 1)
    p.comment("everything else: loadmidi, corpus, compose, stream, need, ... (see code/emi.core.v8.js)",
              590, 150, w=330, h=34, linecount=2)
    p.connect(route, 3, core, 0)
    core_route = p.obj("route coll restart streamat later endat", 420, 185, 2, 6, w=250)
    p.comment("to the queue and the player; status, error, view, setting pass through", 640, 185, w=330)
    p.connect(core, 0, core_route, 0)
    coll = p.obj("coll ---emi.queue", 420, 220, 1, 4, ["", "", "", "bang"])
    p.comment("the queue; the grid player reads the same coll by name", 560, 220, w=330)
    p.connect(core_route, 0, coll, 0)

    gp = p.sub("p grid-player", 200, 290, grid_player(), 5, 4, w=110)
    p.connect(route, 1, gp, 0)
    p.connect(route, 2, gp, 1)
    p.connect(core_route, 1, gp, 2)
    p.connect(core_route, 2, gp, 3)
    p.connect(core_route, 4, gp, 4)  # endat
    # ended: the piece is over (the Max version stops; Live ignores it).
    defer_end = p.obj("deferlow", 200, 330, 1, 1, w=65)
    ended = p.msg("ended", 200, 365, w=50)
    p.connect(gp, 3, defer_end, 0)
    p.connect(defer_end, 0, ended, 0)
    defer_need = p.obj("deferlow", 420, 330, 1, 1, w=65)
    need = p.msg("need", 420, 365, w=40)
    p.connect(gp, 1, defer_need, 0)
    p.connect(defer_need, 0, need, 0)
    p.connect(need, 0, core, 0)
    p.comment("need comes from the scheduler thread: compose on the main thread", 500, 330, w=330)

    out = p.outlet(20, 420, "to host, panel and view: voice <n> <pitch> <velocity> | status ... | error ... | "
                   "view ... | setting ...", 1)
    p.connect(hello_pre, 0, out, 0)
    p.connect(core_route, 5, out, 0)
    # later <message>: long work in steps (taste's comparison), each step on
    # its own turn of the low-priority queue, so the patch stays responsive.
    defer_later = p.obj("deferlow", 640, 260, 1, 1, w=65)
    p.connect(core_route, 3, defer_later, 0)
    p.connect(defer_later, 0, core, 0)
    p.comment("later: back to the script, after whatever else is waiting", 715, 260, w=330)
    p.connect(gp, 0, out, 0)
    p.connect(gp, 2, out, 0)  # view playhead <step>
    p.connect(ended, 0, out, 0)
    return p


# ---------------------------------------------------------------- emi.host.max
def midi_out():
    p = Patch(rect=(140, 140, 640, 360))
    notes = p.inlet(20, 20, "voice <n> <pitch> <velocity> (voice prefix removed)", 1)
    port = p.inlet(400, 20, "MIDI output port name", 2)
    route = p.obj("route 1 2 3 4", 20, 70, 2, 5)
    p.connect(notes, 0, route, 0)
    pre = p.obj("prepend port", 400, 70, 2, 1)
    p.connect(port, 0, pre, 0)
    for k in range(4):
        no = p.obj(f"noteout {k + 1}", 20 + k * 110, 140, 3, 0, [], w=75)
        p.connect(route, k, no, 0)
        p.connect(pre, 0, no, 0)
    p.comment("one MIDI channel per voice: 1 soprano, 2 alto, 3 tenor, 4 bass", 20, 180, w=440)
    return p


def instruments():
    p = Patch(rect=(160, 160, 760, 460))
    notes = p.inlet(20, 20, "voice <n> <pitch> <velocity> (voice prefix removed)", 1)
    ctl = p.inlet(420, 20, "plug <n> | open <n>", 2)
    route = p.obj("route 1 2 3 4", 20, 70, 2, 5)
    p.connect(notes, 0, route, 0)
    croute = p.obj("route plug open", 420, 70, 2, 3)
    p.connect(ctl, 0, croute, 0)
    sel_plug = p.obj("sel 1 2 3 4", 420, 105, 1, 5, ["bang"] * 4 + [""])
    sel_open = p.obj("sel 1 2 3 4", 560, 105, 1, 5, ["bang"] * 4 + [""])
    p.connect(croute, 0, sel_plug, 0)
    p.connect(croute, 1, sel_open, 0)
    dac = p.obj("dac~ 1 2", 20, 330, 2, 0, [], w=60)
    for k in range(4):
        x = 20 + k * 180
        pre = p.obj("prepend midievent 144", x, 150, 2, 1, w=140)
        plug = p.msg("plug", x, 185, w=40)
        opn = p.msg("open", x + 50, 185, w=40)
        vst = p.obj("vst~ 2 2", x, 230, 2, 8, ["signal", "signal", "", "", "", "", "", ""], w=60)
        p.connect(route, k, pre, 0)
        p.connect(pre, 0, vst, 0)
        p.connect(sel_plug, k, plug, 0)
        p.connect(sel_open, k, opn, 0)
        p.connect(plug, 0, vst, 0)
        p.connect(opn, 0, vst, 0)
        p.connect(vst, 0, dac, 0)
        p.connect(vst, 1, dac, 1)
    p.comment("plug: choose an AU/VST3 instrument for that voice; open: show its editor. "
              "Note-on with velocity 0 is note-off.", 20, 270, w=700)
    return p


# ---------------------------------------------------------------- the look (GUI redesign, M12)
# One look per kind of control, in every panel, all in Live's own look
# (live.text): the main action (compose) strong blue, one-shot buttons light
# blue, on/off switches warm grey that turn amber when on, Magdalena's rating
# buttons warm. A row along the top names each section, centred above it.
DARK_TEXT = [0.08, 0.08, 0.09, 1.0]
LIGHT_TEXT = [1.0, 1.0, 1.0, 1.0]
MAIN_BG = [0.24, 0.44, 0.71, 1.0]
MAIN_ON = [0.16, 0.31, 0.52, 1.0]
BUTTON_BG = [0.80, 0.85, 0.93, 1.0]
BUTTON_ON = [0.60, 0.69, 0.84, 1.0]
TOGGLE_OFF = [0.84, 0.82, 0.78, 1.0]
TOGGLE_ON = [0.96, 0.70, 0.33, 1.0]
EMILY_BG = [0.96, 0.84, 0.70, 1.0]
EMILY_ON = [0.91, 0.62, 0.36, 1.0]
HEADING = [0.95, 0.95, 0.93, 1.0]   # headings and labels: light, on the dark section colours
SOFT_TEXT = [0.84, 0.84, 0.82, 1.0]  # notes and subtitles: lighter grey still reads easily
# Each section of the strip sits on a solid colour of its own (a [panel]
# behind everything), so the parts read apart: playing, composing, Magdalena.
PLAY_BG = [0.16, 0.27, 0.20, 1.0]
COMPOSE_BG = [0.15, 0.21, 0.31, 1.0]
MAGDALENA_BG = [0.32, 0.20, 0.15, 1.0]
# The row of section names along the top of the strip, above the sections.
HEADER_BG = [0.11, 0.11, 0.12, 1.0]
HEADER_H = 20
WINDOW_SIZE = 18  # the square window button, in the row of names
PANEL_H = 169 - HEADER_H  # each section's height below the row (Live devices are 169 px high)
LABEL_SIZE = 10.0  # labels, and the text on buttons and switches


def live_text_look(bg, on, text=DARK_TEXT, text_on=None):
    text_on = text_on or text
    return {"bgcolor": bg, "activebgcolor": bg, "bgoncolor": on, "activebgoncolor": on,
            "textcolor": text, "activetextcolor": text, "textoncolor": text_on, "activetextoncolor": text_on}


BUTTON = live_text_look(BUTTON_BG, BUTTON_ON)
MAIN = live_text_look(MAIN_BG, MAIN_ON, LIGHT_TEXT)
WARM = live_text_look(EMILY_BG, EMILY_ON)
TOGGLE = live_text_look(TOGGLE_OFF, TOGGLE_ON)


def solid(p, color, pres):
    """A solid [panel] (it ignores clicks), first in the patch, so it's behind everything."""
    box = {"maxclass": "panel", "numinlets": 1, "numoutlets": 0, "mode": 0, "border": 0, "rounded": 0,
           "bgcolor": color, "bgfillcolor_type": "color", "bgfillcolor_color": color,
           "ignoreclick": 1, "background": 1}
    pid = p._add(p._place(box, 1250, 5, 40, 30, pres))
    p.boxes.insert(0, p.boxes.pop())
    return pid


def section(p, color, w, h=PANEL_H):
    """A solid background for a whole panel, and light text for its labels."""
    pid = solid(p, color, (0, 0, w, h))
    for entry in p.boxes:
        b = entry["box"]
        if b["maxclass"] == "comment" and b.get("presentation") and "textcolor" not in b:
            b["textcolor"] = HEADING
    return pid


def label(p, text, x, y, pres, w=None):
    """A control's name beside it, in the labels' size."""
    return p.comment(text, x, y, w=w, pres=pres, fontsize=LABEL_SIZE)


def button(p, name, text, x, y, pres, look=BUTTON, mappable=False, fontsize=LABEL_SIZE):
    """A button in Live's own look (a live.text in button mode): it sends a
    bang when clicked. live.* objects are always parameters, named name: the
    mappable ones (compose, next, like...) show in Live's mapping and
    automation; the others are hidden there (and not saved with the set)."""
    valueof = {
        "parameter_enum": ["off", "on"],
        "parameter_longname": name,
        "parameter_shortname": text,
        "parameter_type": 2,
        "parameter_mmax": 1,
        "parameter_initial": [0],
        "parameter_initial_enable": 0,
    }
    if not mappable:
        valueof["parameter_invisible"] = 2
    return p.ui("live.text", x, y, pres[2], pres[3], 1, 2, ["", ""], pres=pres, parameter_enable=1,
                varname=name, mode=0, text=text, texton=text, fontsize=fontsize, **look,
                saved_attribute_attributes={"valueof": valueof})


def labelled(p, name, text, command, x, y, pres, target, look=BUTTON, mappable=False, fontsize=LABEL_SIZE):
    """A button labelled for people that sends the engine's own word: the
    button bangs a hidden message box (the command)."""
    b = button(p, name, text, x, y, pres, look, mappable, fontsize)
    t = p.obj("t b", x, y + 30, 1, 1, ["bang"], w=35)
    c = p.msg(command, x, y + 60)
    p.connect(b, 0, t, 0)
    p.connect(t, 0, c, 0)
    p.connect(c, 0, target, 0)
    return b


def dialog_button(p, name, text, x, y, pres, dialog, prefix, targets, look=BUTTON):
    """A button that opens a file dialog and sends '<prefix> <path>'."""
    b = button(p, name, text, x, y, pres, look)
    tb = p.obj("t b", x, y + 30, 1, 1, ["bang"], w=35)
    d = p.obj(dialog, x, y + 60, 1, 2, ["", "bang"], w=110)
    pre = p.obj("prepend " + prefix, x, y + 90, 2, 1, w=120)
    p.connect(b, 0, tb, 0)
    p.connect(tb, 0, d, 0)
    p.connect(d, 0, pre, 0)
    for target, inlet in targets:
        p.connect(pre, 0, target, inlet)
    return b


def opener(p, name, text, x, y, pres, abstraction, look=BUTTON):
    """A button that opens a window of its own (an abstraction, through
    [pcontrol]); returns the abstraction, to wire it."""
    b = button(p, name, text, x, y, pres, look)
    t = p.obj("t b", x, y + 30, 1, 1, ["bang"], w=35)
    o = p.msg("open", x, y + 60, w=40)
    pc = p.obj("pcontrol", x + 50, y + 60, 1, 1, w=60)
    window = p.obj(abstraction, x, y + 95, 1, 1, w=110)
    p.connect(b, 0, t, 0)
    p.connect(t, 0, o, 0)
    p.connect(o, 0, pc, 0)
    p.connect(pc, 0, window, 0)
    return window


def live_numbox(p, name, x, y, pres, minimum, maximum, initial):
    """An integer live.numbox: a parameter, so Live saves it with the set."""
    return p.ui(
        "live.numbox", x, y, 56, 15, 1, 2, ["", "float"], pres=pres,
        parameter_enable=1, varname=name,
        saved_attribute_attributes={"valueof": {
            "parameter_longname": name,
            "parameter_shortname": name,
            "parameter_type": 1,
            "parameter_mmin": minimum,
            "parameter_mmax": maximum,
            "parameter_initial": [initial],
            "parameter_initial_enable": 1,
            "parameter_unitstyle": 0,
        }},
    )


def live_toggle(p, name, text, x, y, pres, initial=0, initial_enable=1):
    """A live.text toggle showing its label: a parameter, saved with the set."""
    return p.ui(
        "live.text", x, y, 100, 20, 1, 2, ["", ""], pres=pres,
        parameter_enable=1, varname=name, mode=1, text=text, texton=text, fontsize=LABEL_SIZE, **TOGGLE,
        saved_attribute_attributes={"valueof": {
            "parameter_enum": ["off", "on"],
            "parameter_longname": name,
            "parameter_shortname": name,
            "parameter_type": 2,
            "parameter_mmax": 1,
            "parameter_initial": [initial],
            "parameter_initial_enable": initial_enable,
        }},
    )


def text_box(p, x, y, w, h, pres, varname):
    """A status box ([v8ui] emi.text): draws text as written, without the
    backslashes and quotes a message box adds."""
    return p._add(p._place({
        "maxclass": "v8ui", "filename": "emi.text.bundle.js", "varname": varname,
        "textfile": {"filename": "emi.text.bundle.js", "flags": 0, "embed": 0, "autowatch": 1},
        "numinlets": 1, "numoutlets": 0, "outlettype": [], "parameter_enable": 0, "border": 0,
    }, x, y, w, h, pres))


# ---------------------------------------------------------------- emi.panel (shared)
def panel():
    W = PANEL_W
    p = Patch(rect=(60, 60, 1240, 760), presentation=True)
    p.comment("emi.panel: the composing controls, shared by both products (Max version and Live device), in "
              "the order you use them (GUI redesign, M12): compose first, then which chorales and how long, "
              "then streams. The less-used tools are in the Max version's more features window "
              "(emi.extras). Seed, beats, form, stream, phrases, transpose and signatures are live.* "
              f"parameters: Live saves them with the set; the Max version restores them from the settings "
              f"file. Panel {W} x {PANEL_H} px, below the strip's row of section names.",
              20, 5, w=1000, h=48, linecount=3)
    inl = p.inlet(20, 60, "from emi.engine: status, error, setting", 1)
    out = p.outlet(20, 720, "to emi.engine", 1)
    targets = [(out, 0)]
    send = lambda obj: p.connect(obj, 0, out, 0)

    # Row 1: compose (the main action), seed, next, export midi
    labelled(p, "Compose", "compose", "compose", 660, 300, (6, 6, 76, 24), out, look=MAIN, mappable=True,
             fontsize=12.0)
    label(p, "seed", 740, 270, (86, 9, 30, 18), w=40)
    seed = live_numbox(p, "Seed", 740, 300, (116, 9, 50, 18), 1, 99999, 1)
    seed_pre = p.obj("prepend seed", 740, 335, 2, 1, w=90)
    p.connect(seed, 0, seed_pre, 0)
    send(seed_pre)
    labelled(p, "Next", "next", "next", 860, 300, (172, 8, 44, 20), out, mappable=True)
    p.comment("seed: composes when changed (once a corpus is loaded); compose: the shown seed again; "
              "next: seed + 1", 660, 400, w=330, h=34, linecount=2)
    dialog_button(p, "Export MIDI", "export midi", 1000, 300, (220, 8, 74, 20), "savedialog", "exportmidi",
                  targets)

    # Row 2: corpora (the corpus window, emi.corpora in the top patch:
    # folders of chorales, each on or off), beats, chorale form. [send]
    # with "---": unique to each device in Live.
    corpora_button = button(p, "Corpora", "corpora", 20, 100, (6, 36, 76, 20))
    corpora_t = p.obj("t b", 20, 130, 1, 1, ["bang"], w=35)
    to_corpora = p.obj("s ---emi.corpora", 20, 160, 1, 0, [], w=110)
    p.connect(corpora_button, 0, corpora_t, 0)
    p.connect(corpora_t, 0, to_corpora, 0)
    p.comment("corpora: open the corpus window (folders of chorales, each on or off)", 150, 160, w=230,
              h=34, linecount=2)
    label(p, "beats", 540, 70, (86, 37, 34, 18), w=40)
    beats = live_numbox(p, "Beats", 540, 100, (120, 37, 46, 18), 4, 256, 32)
    beats_pre = p.obj("prepend beats", 540, 135, 2, 1, w=95)
    p.connect(beats, 0, beats_pre, 0)
    send(beats_pre)
    form = live_toggle(p, "Form", "chorale form", 420, 100, (172, 36, 122, 20), initial=1)
    form_pre = p.obj("prepend form", 420, 135, 2, 1, w=90)
    p.connect(form, 0, form_pre, 0)
    send(form_pre)

    # Row 3: stream, phrases, transpose (M5), signatures (M7)
    stream = live_toggle(p, "Stream", "stream", 20, 470, (6, 62, 52, 20))
    stream_pre = p.obj("prepend stream", 20, 505, 2, 1, w=100)
    p.connect(stream, 0, stream_pre, 0)
    send(stream_pre)
    label(p, "phrases", 140, 440, (62, 63, 42, 18), w=50)
    phrases = live_numbox(p, "Phrases", 140, 470, (104, 63, 30, 18), 0, 64, 8)
    phrases_pre = p.obj("prepend phrases", 140, 505, 2, 1, w=105)
    p.connect(phrases, 0, phrases_pre, 0)
    send(phrases_pre)
    label(p, "transpose", 270, 440, (138, 63, 54, 18), w=60)
    transpose = live_numbox(p, "Transpose", 270, 470, (192, 63, 32, 18), -12, 12, 0)
    transpose_pre = p.obj("prepend transpose", 270, 505, 2, 1, w=115)
    p.connect(transpose, 0, transpose_pre, 0)
    send(transpose_pre)
    p.comment("stream: compose plays phrase by phrase (phrases 0 = endless); transpose: at once for a piece, "
              "from the next phrase in a stream", 400, 470, w=330, h=34, linecount=2)
    sigs = live_toggle(p, "Signatures", "signatures", 760, 470, (228, 62, 66, 20), initial=1)
    sigs_pre = p.obj("prepend sigs", 760, 505, 2, 1, w=90)
    p.connect(sigs, 0, sigs_pre, 0)
    send(sigs_pre)
    p.comment("signatures: keep Bach's cadence formulas whole at cadences", 870, 470, w=250, h=34, linecount=2)

    # From the engine: the status line, and restored or changed settings
    route = p.obj("route status error setting", 20, 560, 2, 4, w=170)
    p.connect(inl, 0, route, 0)
    set_status = p.obj("prepend text", 20, 600, 2, 1)
    set_error = p.obj("prepend alert", 150, 600, 2, 1, w=100)
    p.connect(route, 0, set_status, 0)
    p.connect(route, 1, set_error, 0)
    status = text_box(p, 20, 640, W - 12, 52, (6, 88, W - 12, 55), "Status")
    p.connect(set_status, 0, status, 0)
    p.connect(set_error, 0, status, 0)
    controls = p.obj("route seed beats form stream phrases transpose sigs", 420, 560, 2, 8, w=330)
    p.connect(route, 2, controls, 0)
    p.comment("setting <name> <value>: show it without sending it back", 800, 560, w=330)
    for k, control in enumerate([seed, beats, form, stream, phrases, transpose, sigs]):
        pre = p.obj("prepend set", 420 + k * 95, 640, 2, 1, w=80)
        p.connect(controls, k, pre, 0)
        p.connect(pre, 0, control, 0)
    section(p, COMPOSE_BG, W)
    return p


# ---------------------------------------------------------------- emily.panel (shared, M9)
def emily_panel():
    W = EMILY_W
    p = Patch(rect=(80, 80, 1000, 620), presentation=True)
    p.comment("emily.panel: Magdalena's taste (M9), shared by both products. like and dislike rate the beats selected "
              "in the piano roll, or the stream phrase playing, or the piece; temperature sets how much chance "
              "still plays; keep (accept) keeps what is playing as music of her own (M10). like, dislike, keep "
              "and temperature are live.* parameters, so they can be MIDI- or key-mapped. "
              f"Panel {W} x {PANEL_H} px.", 20, 5, w=900, h=48, linecount=3)
    inl = p.inlet(20, 60, "from emi.engine: emily, setting", 1)
    out = p.outlet(20, 560, "to emi.engine", 1)

    # What she is, under her name (the name is in the strip's row of names).
    p.comment("user's taste", 140, 100, w=80, pres=(0, 2, W, 16), fontsize=LABEL_SIZE, textcolor=SOFT_TEXT,
              textjustification=1)
    labelled(p, "Like", "like", "like", 20, 140, (6, 19, 57, 24), out, look=WARM, mappable=True, fontsize=11.0)
    labelled(p, "Dislike", "dislike", "dislike", 120, 140, (67, 19, 57, 24), out, look=WARM, mappable=True,
             fontsize=11.0)
    # M10: accept keeps what is playing as music of her own (mappable, like
    # like and dislike), shown as "keep"; forget is in the pop-up window.
    labelled(p, "Accept", "keep", "accept", 220, 140, (6, 46, 118, 20), out, look=WARM, mappable=True)
    # (The pop-up window, a large piano roll and her taste in full, opens
    # from the square button at the strip's top right, in the top patch.)
    # Temperature: how much chance still plays. A horizontal slider across
    # the panel, tall enough for its name (above) and value (below).
    temp = p.ui(
        "live.slider", 340, 140, 118, 46, 1, 2, ["", "float"], pres=(6, 68, 118, 46),
        parameter_enable=1, varname="Temperature", orientation=1, showname=1, shownumber=1,
        textcolor=HEADING,
        saved_attribute_attributes={"valueof": {
            "parameter_longname": "Temperature",
            "parameter_shortname": "temperature",
            "parameter_type": 0,
            "parameter_mmin": 0.0,
            "parameter_mmax": 3.0,
            "parameter_initial": [1.0],
            "parameter_initial_enable": 1,
            "parameter_unitstyle": 1,
        }},
    )
    temp_pre = p.obj("prepend temperature", 340, 200, 2, 1, w=130)
    p.connect(temp, 0, temp_pre, 0)
    p.connect(temp_pre, 0, out, 0)
    p.comment("temperature: 0 Magdalena's favourite choices only, 1 as before Magdalena, 3 adventurous. "
              "keep: accept (M10). Her full taste report: the pop-up window.",
              520, 220, w=330, h=48, linecount=3)

    route = p.obj("route emily setting", 20, 300, 2, 3, w=120)
    p.connect(inl, 0, route, 0)
    set_text = p.obj("prepend text", 20, 340, 2, 1)
    p.connect(route, 0, set_text, 0)
    text = text_box(p, 20, 380, W - 12, 44, (6, 116, W - 12, 30), "Magdalena")
    p.connect(set_text, 0, text, 0)
    controls = p.obj("route temperature", 200, 340, 2, 2, w=110)
    p.connect(route, 1, controls, 0)
    set_temp = p.obj("prepend set", 200, 380, 2, 1)
    p.connect(controls, 0, set_temp, 0)
    p.connect(set_temp, 0, temp, 0)
    p.comment("setting temperature <t>: show a restored value without sending it back", 330, 380, w=300)
    section(p, MAGDALENA_BG, W)
    return p


# ---------------------------------------------------------------- emi.host.max
GREEN_ON = [0.30, 0.69, 0.36, 1.0]
RED_ON = [0.86, 0.29, 0.25, 1.0]


def host_max():
    p = Patch(rect=(40, 40, 1300, 760), presentation=True)
    p.comment("emi.host.max: the Max version's adapter: transport, MIDI ports, vst~ instruments, the more "
              f"features window, and startup (restores the settings file). Panel {HOST_MAX_W} x {PANEL_H} px.",
              20, 5, w=900)
    inl = p.inlet(20, 30, "from emi.engine", 1)
    out = p.outlet(20, 720, "to emi.engine", 1)

    # Play/stop: green "play" when stopped, red "stop" while playing. It goes
    # back to play by itself when the piece ends ("ended" from the engine).
    # A live.text toggle needs its parameter (an off/on enum) to toggle at
    # all; it starts off and isn't restored (no initial value).
    play = p.ui("live.text", 150, 70, 58, 20, 1, 2, ["", ""], pres=(6, 6, 80, 26), parameter_enable=1,
                varname="Play", mode=1, text="play", texton="stop", fontsize=12.0,
                bgcolor=GREEN_ON, activebgcolor=GREEN_ON, bgoncolor=RED_ON, activebgoncolor=RED_ON,
                textcolor=DARK_TEXT, activetextcolor=DARK_TEXT, activetextoncolor=LIGHT_TEXT,
                saved_attribute_attributes={"valueof": {
                    "parameter_enum": ["off", "on"],
                    "parameter_longname": "Play",
                    "parameter_shortname": "play",
                    "parameter_type": 2,
                    "parameter_mmax": 1,
                    "parameter_initial": [0],
                    "parameter_initial_enable": 0,
                }})
    tempo = p.ui("number", 230, 70, 50, 22, 1, 2, ["", "bang"], pres=(92, 9, 44, 20),
                 minimum=20, maximum=300, parameter_enable=0, varname="BPM")
    label(p, "bpm", 285, 70, (138, 10, 30, 18), w=40)
    lb = p.obj("loadbang", 330, 30, 1, 1, ["bang"])
    init_tempo = p.msg("100", 330, 70, w=40)
    p.connect(lb, 0, init_tempo, 0)
    p.connect(init_tempo, 0, tempo, 0)
    transport = p.obj("transport", 270, 230, 2, 9)
    pre_tempo = p.obj("prepend tempo", 230, 110, 2, 1)
    p.connect(tempo, 0, pre_tempo, 0)
    p.connect(pre_tempo, 0, transport, 0)
    sel = p.obj("sel 1 0", 150, 110, 1, 3, ["bang", "bang", ""], w=55)
    p.connect(play, 0, sel, 0)
    t_on = p.obj("t b b b", 100, 145, 1, 3, ["bang", "bang", "bang"], w=60)
    t_off = p.obj("t b b b", 170, 145, 1, 3, ["bang", "bang", "bang"], w=60)
    p.connect(sel, 0, t_on, 0)
    p.connect(sel, 1, t_off, 0)
    m_play = p.msg("play", 60, 180, w=40)
    m_start = p.msg("1", 110, 180, w=30)
    m_stop_t = p.msg("0", 170, 180, w=30)
    m_stop = p.msg("stop", 210, 180, w=40)
    # Play lets voices out (play_gate below) only while Play is on: Max's
    # transport is global, so it may already be running when this patch opens
    # (left running by a patch closed while playing, or started by Link).
    m_open = p.msg("1", 20, 180, w=30)
    m_close = p.msg("0", 250, 180, w=30)
    p.connect(t_on, 2, m_open, 0)   # play: let voices out, tell the engine, then start the transport
    p.connect(t_on, 1, m_play, 0)
    p.connect(t_on, 0, m_start, 0)
    p.connect(t_off, 2, m_stop_t, 0)  # stop: stop the transport, tell the engine (its note-offs
    p.connect(t_off, 1, m_stop, 0)    # still pass), then keep voices in
    p.connect(t_off, 0, m_close, 0)
    p.connect(m_start, 0, transport, 0)
    p.connect(m_stop_t, 0, transport, 0)
    p.connect(m_play, 0, out, 0)
    p.connect(m_stop, 0, out, 0)
    # When the patch opens: the transport stops, so it agrees with Play (off).
    stop_at_load = p.msg("0", 380, 70, w=30)
    p.connect(lb, 0, stop_at_load, 0)
    p.connect(stop_at_load, 0, transport, 0)
    p.comment("at load: transport stopped, as Play shows", 420, 70, w=150, h=34, linecount=2)
    p.ui("ezdac~", 720, 70, 32, 32, 2, 0, [], pres=(196, 4, 30, 30), varname="Audio")

    # Output selection, and plug-in instruments (vst~): the switch here, the
    # instruments themselves in a window of their own (emi.instruments).
    p.comment("Output", 20, 300, w=50, pres=(6, 41, 46, 18), fontsize=LABEL_SIZE)
    lb2 = p.obj("loadbang", 80, 270, 1, 1, ["bang"])
    midiinfo = p.obj("midiinfo", 80, 300, 2, 2)
    menu = p.ui("umenu", 80, 335, 170, 22, 1, 3, ["int", "", ""], pres=(52, 40, 174, 20),
                parameter_enable=0, items=[], varname="Output")
    p.connect(lb2, 0, midiinfo, 0)
    p.connect(midiinfo, 0, menu, 0)
    # Not restored by Max at load (no initial value): the settings file does it.
    use_vst = live_toggle(p, "Plug-in Instruments", "plug-in instruments", 300, 300, (6, 66, 144, 20),
                          initial_enable=0)
    plus = p.obj("+ 1", 300, 335, 2, 1, ["int"], w=40)
    p.connect(use_vst, 0, plus, 0)
    instruments_window_obj = opener(p, "Set Up", "set up…", 560, 560, (154, 66, 72, 20), "emi.instruments")
    p.comment("set up: the plug-in instruments window (plug <n>, open <n>)", 680, 655, w=250)
    # More features (Max version only): the listening test and the less-used
    # tools, in a window of their own (emi.extras); what they send goes to
    # the engine, and a restored original key reaches its switch.
    extras = opener(p, "More Features", "more features…", 950, 560, (6, 96, 110, 20), "emi.extras")
    p.connect(extras, 0, out, 0)
    p.comment("more features: listening test, load a chorale (original key), test phrase, clear", 1070, 655,
              w=220, h=34, linecount=2)

    route = p.obj("route voice setting meter ended", 20, 400, 2, 5, w=210)
    p.connect(inl, 0, route, 0)
    # The piece is over: the button goes back to play, which stops the
    # transport and tells the engine, as clicking it would.
    to_play = p.msg("0", 700, 400, w=30)
    p.connect(route, 3, to_play, 0)
    p.connect(to_play, 0, play, 0)
    p.comment("ended: back to play", 740, 400, w=130)
    # The music's meter (M8: 3/4): the transport's time signature follows it,
    # so the player starts pieces on its barlines.
    timesig = p.obj("prepend timesig", 420, 230, 2, 1, w=100)
    p.connect(route, 2, timesig, 0)
    p.connect(timesig, 0, transport, 0)
    p.comment("meter <n> <d> from the engine", 530, 230, w=200)
    play_gate = p.obj("gate 1 0", 300, 400, 2, 1, w=60)
    p.connect(m_open, 0, play_gate, 0)
    p.connect(m_close, 0, play_gate, 0)
    p.connect(route, 0, play_gate, 1)
    p.comment("voices only while Play is on", 230, 430, w=170)
    gate = p.obj("gate 2 1", 400, 400, 2, 2, w=60)
    p.connect(plus, 0, gate, 0)
    p.connect(play_gate, 0, gate, 1)
    mo = p.sub("p midi-out", 400, 450, midi_out(), 2, 0, w=90)
    ins = p.sub("p instruments", 400, 500, instruments(), 2, 0, w=100)
    p.connect(gate, 0, mo, 0)
    p.connect(gate, 1, ins, 0)
    tosym = p.obj("tosymbol", 260, 370, 1, 1, w=65)
    p.connect(menu, 1, tosym, 0)
    p.connect(tosym, 0, mo, 1)
    p.connect(instruments_window_obj, 0, ins, 1)

    # Settings: every change is remembered; startup restores them (Max only:
    # Live saves its devices' settings with the set).
    for control, name, x in [(tempo, "bpm", 800), (menu, "output", 950), (use_vst, "vst", 1100)]:
        pre = p.obj(f"prepend remember {name}", x, 470, 2, 1, w=140)
        p.connect(control, 0, pre, 0)
        p.connect(pre, 0, out, 0)
    lb3 = p.obj("loadbang", 800, 30, 1, 1, ["bang"])
    defer_start = p.obj("deferlow", 800, 65, 1, 1, w=65)
    startup = p.msg("startup all", 800, 100, w=80)
    p.connect(lb3, 0, defer_start, 0)
    p.connect(defer_start, 0, startup, 0)
    p.connect(startup, 0, out, 0)
    p.comment("after everything has loaded: read the settings file, restore every setting, reload the "
              "last corpus and compose", 890, 100, w=330, h=34, linecount=2)
    defer_set = p.obj("deferlow", 20, 470, 1, 1, w=65)
    p.connect(route, 1, defer_set, 0)
    restore = p.obj("route bpm output vst key", 20, 510, 2, 5, w=160)
    p.connect(defer_set, 0, restore, 0)
    p.connect(restore, 0, tempo, 0)
    p.connect(restore, 1, menu, 0)
    p.connect(restore, 2, use_vst, 0)
    key = p.obj("prepend key", 200, 545, 2, 1, w=80)
    p.connect(restore, 3, key, 0)
    p.connect(key, 0, extras, 0)
    p.comment("setting <name> <value> from startup: applied (deferred, so the remember it sends back "
              "never re-enters the engine); key: to the more features window's original key", 290, 545,
              w=360, h=48, linecount=3)
    section(p, PLAY_BG, HOST_MAX_W)
    return p


def instruments_window():
    """emi.instruments: the Max version's plug-in instruments window (GUI
    redesign, M12): an AU or VST3 instrument for each voice, and its editor.
    Opened by the Max panel's set up button; its plug <n> and open <n> go to
    the [vst~] objects in emi.host.max."""
    p = Patch(rect=(140, 140, 140 + 330, 140 + 180), presentation=True)
    p.comment("emi.instruments: the plug-in instruments window (Max version). Opened by the panel's set up "
              "button, through [pcontrol] in emi.host.max.", 20, 420, w=600, h=34, linecount=2)
    p.inlet(20, 20, "pcontrol: open", 1)
    out = p.outlet(20, 380, "to emi.host.max's instruments: plug <n> | open <n>", 1)
    for k, voice in enumerate(VOICES):
        y = 10 + k * 28
        x = 20 + k * 220
        p.comment(voice, x, 60, w=70, pres=(10, y, 70, 22))
        labelled(p, f"Choose {k + 1}", "choose…", f"plug {k + 1}", x, 100, (82, y, 104, 22), out)
        labelled(p, f"Show Editor {k + 1}", "show editor", f"open {k + 1}", x + 110, 100, (192, y, 120, 22), out)
    p.comment("Then switch on plug-in instruments in the panel, and audio (the speaker).", 20, 300, w=300,
              h=34, linecount=2, pres=(10, 124, 300, 34), fontsize=LABEL_SIZE)
    window_title(p, "Cento: plug-in instruments", 500)
    return p


def extras_window():
    """emi.extras: the Max version's more features window: the blind
    listening test (M8), and the less-used tools: a single chorale as written
    (and its key), the test phrase, and clearing the queue. Opened by the Max
    panel's more features button; what it sends goes to the engine."""
    W = 360
    p = Patch(rect=(160, 160, 160 + W, 160 + 190), presentation=True)
    p.comment("emi.extras: the more features window (Max version). Opened by the panel's more features "
              "button, through [pcontrol] in emi.host.max. Its inlet also takes key <0|1> (a restored "
              "original key).", 20, 640, w=600, h=34, linecount=2)
    inl = p.inlet(20, 20, "pcontrol: open; key <0|1>: show a restored original key", 1)
    out = p.outlet(20, 600, "to emi.engine: abtest, loadmidi, key, pattern, clear", 1)
    targets = [(out, 0)]
    dialog_button(p, "Listening Test", "listening test…", 20, 80, (10, 10, 150, 22), "savedialog", "abtest",
                  targets)
    p.comment("A blind test: a web page of 10 pairs, a chorale and a piece in its form. Which is Bach?",
              180, 80, w=180, h=34, linecount=2, pres=(166, 8, W - 176, 34), fontsize=LABEL_SIZE)
    dialog_button(p, "Load A Chorale", "load a chorale…", 200, 200, (10, 56, 150, 22), "opendialog",
                  "loadmidi", targets)
    key = live_toggle(p, "Original Key", "original key", 380, 200, (166, 56, 100, 22))
    key_pre = p.obj("prepend key", 380, 235, 2, 1, w=80)
    p.connect(key, 0, key_pre, 0)
    p.connect(key_pre, 0, out, 0)
    p.comment("One chorale plays as written, in C major or A minor, or in its own key with original key on.",
              200, 320, w=300, h=34, linecount=2, pres=(10, 82, W - 20, 34), fontsize=LABEL_SIZE)
    labelled(p, "Test Phrase", "play the test phrase", "pattern", 20, 380, (10, 124, 150, 22), out)
    labelled(p, "Clear Queue", "stop and clear the queue", "clear", 200, 380, (166, 124, 160, 22), out)
    p.comment("The test phrase needs no chorales: a check that the voices sound.", 20, 480, w=300,
              pres=(10, 150, W - 20, 20), fontsize=LABEL_SIZE)
    restore = p.obj("route key", 380, 20, 2, 2, w=70)
    p.connect(inl, 0, restore, 0)
    show = p.obj("prepend set", 380, 55, 2, 1, w=80)
    p.connect(restore, 0, show, 0)
    p.connect(show, 0, key, 0)
    window_title(p, "Cento: more features", 500)
    return p


def window_title(p, title, x):
    """Sets the window's title when it loads."""
    lb = p.obj("loadbang", x, 20, 1, 1, ["bang"])
    t = p.msg("title " + title, x, 55, w=7 * len(title) + 60)
    this = p.obj("thispatcher", x, 90, 1, 2, ["", ""], w=80)
    p.connect(lb, 0, t, 0)
    p.connect(t, 0, this, 0)


# ---------------------------------------------------------------- emi.host.live
def host_live():
    p = Patch(rect=(40, 40, 1300, 760), presentation=True)
    p.comment("emi.host.live: the Live version's adapter: follows Live's transport, sends voices to the "
              "cento.voice devices, writes clips, and startup (reloads the last corpus). "
              f"Panel {HOST_LIVE_W} x {PANEL_H} px.", 20, 5, w=1000)
    inl = p.inlet(20, 30, "from emi.engine", 1)
    out = p.outlet(20, 720, "to emi.engine", 1)

    # Live's stop -> engine (note-offs; the player starts the queue again at
    # the next barline it reaches). Live's play isn't sent: the observer
    # reports it on the main thread, often a few 16ths after the transport
    # has started and the player has begun the piece, and a late play would
    # start it again at the next bar (a false start). The player finds the
    # transport starting by itself, from its position.
    thisdev = p.obj("live.thisdevice", 1100, 30, 1, 3, ["bang", "int", "int"])
    t2 = p.obj("t b b", 1100, 65, 1, 2, ["bang", "bang"], w=50)
    p.connect(thisdev, 0, t2, 0)
    prop = p.msg("property is_playing", 1220, 100)
    path = p.msg("path live_set", 1100, 100)
    livepath = p.obj("live.path", 1100, 135, 1, 3)
    observer = p.obj("live.observer", 1180, 170, 2, 2)
    p.connect(t2, 1, prop, 0)
    p.connect(t2, 0, path, 0)
    p.connect(prop, 0, observer, 0)
    p.connect(path, 0, livepath, 0)
    p.connect(livepath, 0, observer, 1)
    sel = p.obj("sel 0", 1180, 205, 2, 2, ["bang", ""], w=45)
    p.connect(observer, 0, sel, 0)
    m_stop = p.msg("stop", 1180, 275, w=40)
    p.connect(sel, 0, m_stop, 0)
    p.connect(m_stop, 0, out, 0)
    p.comment("not play: it can arrive late", 1240, 205, w=110, h=34, linecount=2)

    # Startup: once the device has loaded (its parameters already restored)
    defer_start = p.obj("deferlow", 960, 65, 1, 1, w=65)
    startup = p.msg("startup corpus", 960, 100, w=100)
    p.connect(thisdev, 0, defer_start, 0)
    p.connect(defer_start, 0, startup, 0)
    p.connect(startup, 0, out, 0)
    p.comment("reload the last corpus and compose; the controls keep the set's values", 960, 170, w=200,
              h=34, linecount=2)

    # Clips (rows 6 and 32)
    labelled(p, "Write Clips", "write clips", "writeclips", 20, 100, (6, 6, 80, 20), out, mappable=True)
    labelled(p, "Test Clips", "test clips", "testclip", 120, 100, (90, 6, 74, 20), out)
    auto = live_toggle(p, "Clips On Compose", "clips on compose", 260, 100, (6, 32, 158, 20))
    auto_pre = p.obj("prepend autoclips", 260, 135, 2, 1, w=110)
    p.connect(auto, 0, auto_pre, 0)
    p.connect(auto_pre, 0, out, 0)

    # Play through voices (row 58): the grid player runs whenever Live's
    # transport does; its notes reach the voice devices only while this is
    # on, so written clips don't also get every note a second time. Turning
    # it off first stops the player (note-offs pass while the gate is still
    # open), then closes the gate.
    play_on = live_toggle(p, "Play Through Voices", "play through voices", 850, 600, (6, 58, 158, 20))
    play_t = p.obj("t i i", 850, 635, 1, 2, ["int", "int"], w=45)
    p.connect(play_on, 0, play_t, 0)
    off = p.obj("sel 0", 950, 635, 2, 2, ["bang", ""], w=45)
    p.connect(play_t, 1, off, 0)
    p.connect(off, 0, m_stop, 0)
    p.comment("Play off: stop (note-offs), then close the gate", 850, 670, w=280)

    route = p.obj("route voice", 20, 400, 2, 2, w=80)
    p.connect(inl, 0, route, 0)
    voices = p.obj("gate 1", 20, 440, 2, 1, w=50)
    p.connect(play_t, 0, voices, 0)
    p.connect(route, 0, voices, 1)
    p.comment("open while Play through voices is on", 80, 440, w=220)
    vroute = p.obj("route 1 2 3 4", 20, 475, 2, 5)
    p.connect(voices, 0, vroute, 0)
    for k in range(4):
        snd = p.obj(f"send emi.voice.{k + 1}", 20 + k * 115, 510, 1, 0, [], w=105)
        p.connect(vroute, k, snd, 0)
    p.comment("to the cento.voice devices on the Soprano/Alto/Tenor/Bass tracks", 20, 540, w=420)

    # All voices on this track (row 84)
    here = live_toggle(p, "All Voices Here", "all voices on this track", 600, 360, (6, 84, 158, 20))
    gate = p.obj("gate 1", 600, 440, 2, 1, w=50)
    p.connect(here, 0, gate, 0)
    p.connect(voices, 0, gate, 1)
    slice_ = p.obj("zl.slice 1", 600, 480, 2, 2, w=70)
    p.connect(gate, 0, slice_, 0)
    fmt = p.obj("midiformat", 600, 515, 7, 2, ["int", ""], w=75)
    p.connect(slice_, 1, fmt, 0)
    midiin = p.obj("midiin", 720, 480, 1, 1, ["int"], w=50)
    midiout = p.obj("midiout", 660, 550, 1, 0, [], w=55)
    p.connect(fmt, 0, midiout, 0)
    p.connect(midiin, 0, midiout, 0)
    p.comment("track MIDI passes through", 780, 480, w=170)
    p.comment("Voice tracks: Soprano, Alto, Tenor, Bass.", 20, 600, w=160, h=34, linecount=2,
              pres=(6, 112, 158, 32), fontsize=LABEL_SIZE, textcolor=SOFT_TEXT)
    section(p, PLAY_BG, HOST_LIVE_W)
    return p


# ---------------------------------------------------------------- top levels
def view():
    p = Patch(rect=(100, 100, 700, 420), presentation=True)
    inl = p.inlet(20, 20, "clear | note | seam | done (from emi.core, via view)", 1)
    roll = p._add(p._place({
        "maxclass": "v8ui", "filename": "emi.view.bundle.js", "varname": "Piano roll",
        "textfile": {"filename": "emi.view.bundle.js", "flags": 0, "embed": 0, "autowatch": 1},
        "numinlets": 1, "numoutlets": 1, "outlettype": [""], "parameter_enable": 0,
    }, 20, 60, VIEW_W, PANEL_H, (0, 0, VIEW_W, PANEL_H)))
    p.connect(inl, 0, roll, 0)
    out = p.outlet(20, 260, "to emi.engine: select <from> <to> (beats dragged across, for Magdalena's ratings)", 1)
    p.connect(roll, 0, out, 0)
    p.comment("emi.view: piano roll of the current score; colors = source chorale (or voice), bright lines = seams",
              40 + VIEW_W, 60, w=260, h=48, linecount=3)
    return p


def window():
    """emi.window: the pop-up window, shared by both products."""
    W, ROLL_H, TASTE_H = 1160, 430, 250
    p = Patch(rect=(60, 60, 60 + W + 20, 60 + ROLL_H + TASTE_H + 70), presentation=True)
    p.comment("emi.window: the pop-up window (both products). A large piano roll (the same script as the "
              "panels' roll, emi.view) and Magdalena's taste in full (emi.taste). Opened by the Magdalena panel's "
              "window button, through [pcontrol] in the top patch.", 20, 900, w=900, h=34, linecount=2)
    inl = p.inlet(20, 20, "from emi.engine: view ..., emilyview ...", 1)
    out = p.outlet(20, 860, "to emi.engine: select (from the roll), like, dislike, taste", 1)
    route = p.obj("route view emilyview", 20, 60, 2, 3, w=140)
    p.connect(inl, 0, route, 0)
    roll = p._add(p._place({
        "maxclass": "v8ui", "filename": "emi.view.bundle.js", "varname": "Piano roll",
        "textfile": {"filename": "emi.view.bundle.js", "flags": 0, "embed": 0, "autowatch": 1},
        "numinlets": 1, "numoutlets": 1, "outlettype": [""], "parameter_enable": 0, "border": 0,
    }, 20, 100, W, ROLL_H, (10, 10, W, ROLL_H)))
    p.connect(route, 0, roll, 0)
    p.connect(roll, 0, out, 0)
    taste_view = p._add(p._place({
        "maxclass": "v8ui", "filename": "emi.taste.bundle.js", "varname": "Taste",
        "textfile": {"filename": "emi.taste.bundle.js", "flags": 0, "embed": 0, "autowatch": 1},
        "numinlets": 1, "numoutlets": 1, "outlettype": [""], "parameter_enable": 0, "border": 0,
    }, 20, 100 + ROLL_H + 10, W, TASTE_H, (10, 20 + ROLL_H, W, TASTE_H)))
    p.connect(route, 1, taste_view, 0)
    p.connect(taste_view, 0, out, 0)  # pin, unpin, strength from the weight editor
    y = 30 + ROLL_H + TASTE_H
    labelled(p, "Window Like", "like", "like", 20, 760, (10, y, 56, 24), out, look=WARM)
    labelled(p, "Window Dislike", "dislike", "dislike", 80, 760, (70, y, 56, 24), out, look=WARM)
    labelled(p, "Window Keep", "keep", "accept", 140, 760, (130, y, 46, 24), out, look=WARM)
    labelled(p, "Taste Report", "taste report", "taste", 200, 760, (180, y, 72, 24), out)
    # Reload seed: compose the seed shown again, after changing her mix,
    # novelty or weights, to hear and see what they do.
    labelled(p, "Reload Seed", "reload seed", "compose", 260, 760, (256, y, 90, 24), out)
    # Releasing every pin, and storing or recalling a whole taste as a file.
    # (The taste pane's views are its own tabs.)
    labelled(p, "Release All Pins", "release all pins", "unpin", 410, 760, (356, y, 120, 24), out)
    dialog_button(p, "Store Taste", "store taste", 580, 760, (486, y, 95, 24), "savedialog", "storetaste", [(out, 0)])
    dialog_button(p, "Recall Taste", "recall taste", 720, 760, (587, y, 95, 24), "opendialog", "recalltaste",
                  [(out, 0)])
    labelled(p, "Forget", "forget", "forget", 860, 760, (688, y, 60, 24), out)
    # Who Magdalena is (emi.magdalena, a small window of its own).
    opener(p, "Explain Magdalena", "explain Magdalena", 1000, 760, (758, y, 130, 24), "emi.magdalena")
    p.comment("Drag across the roll to select beats for like, dislike and keep. The tabs at the pane's top "
              "right choose its view.", 940, 900, w=400, h=34, linecount=2, pres=(896, y - 2, 274, 30),
              fontsize=LABEL_SIZE)
    window_title(p, "Cento: piano roll and Magdalena", 700)
    return p


MAGDALENA_TEXT = [
    ("Magdalena", 16.0, 1, 24),
    ("learns the user's taste", 11.0, 0, 20),
    ("Magdalena is Cento's listener. She learns the user's taste: like and dislike tell her what you "
     "enjoy in a piece, a stream phrase, or beats you select in the piano roll. Later pieces lean toward "
     "what you liked, always within Bach's rules. temperature sets how much chance still plays: 0, only her "
     "favourite choices; 1, as if she weren't there; up to 3, more adventurous.", 12.0, 0, 90),
    ("keep writes what you're hearing into Magdalena's notebook: music of her own that later pieces draw on, "
     "alongside Bach's (how much: mix, in the memory tab). novelty lets her vary phrases with notes Bach "
     "never wrote. Snapshots let you roll her taste back to an earlier one; forget starts afresh.",
     12.0, 0, 90),
    ("She is named after Anna Magdalena Bach (1701\u20131760), a professional singer and the copyist of "
     "much of Bach's music. Her notebooks of 1722 and 1725 collected the pieces she and her family loved, "
     "as Magdalena's notebook collects the ones you keep.", 12.0, 0, 76),
    ("Her ideas come from David Cope's Emily Howell, a program that learned from its listeners. Cento is "
     "independent and isn't affiliated with David Cope.", 10.0, 0, 36),
]


def magdalena_window():
    """emi.magdalena: who Magdalena is (the pop-up window's explain Magdalena button)."""
    W = 480
    p = Patch(rect=(160, 120, 160 + W + 20, 120 + 410), presentation=True)
    p.comment("emi.magdalena: who Magdalena is, and what she does. Opened by the pop-up window's explain "
              "Magdalena button, through [pcontrol] in emi.window.", 20, 520, w=600, h=34, linecount=2)
    p.inlet(20, 20, "pcontrol: open", 1)
    y = 12
    for k, (text, size, face, h) in enumerate(MAGDALENA_TEXT):
        extra = {"textcolor": HEADING} if k == 1 or k == len(MAGDALENA_TEXT) - 1 else {}
        p.comment(text, 20, 60 + k * 70, w=W - 20, h=h, pres=(12, y, W - 24, h), fontsize=size, fontface=face,
                  linecount=max(1, round(h / (size * 1.4))), **extra)
        y += h + 8
    window_title(p, "Cento: about Magdalena", 520)
    return p


def corpora_window():
    """emi.corpora: the corpus window (M11), shared by both products."""
    W, LIST_H = 760, 330
    p = Patch(rect=(80, 80, 80 + W + 20, 80 + LIST_H + 70), presentation=True)
    p.comment("emi.corpora: the corpus window (both products, M11). Folders of chorales, each switched on or "
              "off (emi.corpora.bundle.js); composing uses every folder that is on, as one corpus. Opened by "
              "the panel's corpora button, through [pcontrol] in the top patch.", 20, 600, w=900, h=34,
              linecount=2)
    inl = p.inlet(20, 20, "from emi.engine: corpusview ...", 1)
    out = p.outlet(20, 560, "to emi.engine: corpusadd, corpuson, corpusonly, corpusremove, corpusrescan", 1)
    route = p.obj("route corpusview", 20, 60, 2, 2, w=120)
    p.connect(inl, 0, route, 0)
    view_box = p._add(p._place({
        "maxclass": "v8ui", "filename": "emi.corpora.bundle.js", "varname": "Corpora",
        "textfile": {"filename": "emi.corpora.bundle.js", "flags": 0, "embed": 0, "autowatch": 1},
        "numinlets": 1, "numoutlets": 1, "outlettype": [""], "parameter_enable": 0, "border": 0,
    }, 20, 100, W, LIST_H, (10, 10, W, LIST_H)))
    p.connect(route, 0, view_box, 0)
    p.connect(view_box, 0, out, 0)  # corpuson, corpusonly, corpusremove
    y = 20 + LIST_H
    dialog_button(p, "Add Folder", "add folder", 20, 460, (10, y, 90, 24), "opendialog fold", "corpusadd",
                  [(out, 0)])
    labelled(p, "Rescan", "rescan", "corpusrescan", 160, 460, (106, y, 60, 24), out)
    p.comment("Add a folder of chorales (MIDI files), then switch folders on or off.", 300, 460, w=420, h=20,
              pres=(176, y + 2, W - 166, 20), fontsize=LABEL_SIZE)
    window_title(p, "Cento: corpora", 500)
    return p


PANEL_W = 300
EMILY_W = 130
VIEW_W = 260  # the panels' piano roll (260 px since the GUI redesign; 400 in M11, 360 before;
#               the pop-up window has the large one)
HOST_MAX_W = 232
HOST_LIVE_W = 170


def top(adapter, host_name, title, host_w, h=169, abstraction="emi.engine"):
    """[host adapter panel | shared panel | Magdalena | piano roll], all wired to one engine, under a
    row naming each section (centred above it)."""
    panel_x = host_w + 8
    emily_x = panel_x + PANEL_W + 8
    view_x = emily_x + EMILY_W + 8
    p = Patch(rect=(50, 50, max(view_x + VIEW_W + 60, 900), 540), presentation=True)
    # The row of section names along the top.
    solid(p, HEADER_BG, (0, 0, view_x + VIEW_W, HEADER_H))
    # The piano roll's name leaves room at the right for the window button,
    # keeping its centre.
    room = WINDOW_SIZE + 4
    for name, x, w in [(host_name, 0, host_w), ("COMPOSE", panel_x, PANEL_W), ("MAGDALENA", emily_x, EMILY_W),
                       ("PIANO ROLL", view_x + room, VIEW_W - 2 * room)]:
        p.comment(name, 20 + x, 2, w=w, h=18, pres=(x, 1, w, 18), fontsize=11.0, fontface=1, textcolor=HEADING,
                  textjustification=1)
    y, ph = 20 + HEADER_H, h - HEADER_H
    bp = p.bpatcher(adapter, 20, y, host_w, ph, 1, 1, pres=(0, HEADER_H, host_w, ph))
    pn = p.bpatcher("emi.panel.maxpat", panel_x + 20, y, PANEL_W, ph, 1, 1, pres=(panel_x, HEADER_H, PANEL_W, ph))
    em = p.bpatcher("emily.panel.maxpat", emily_x + 20, y, EMILY_W, ph, 1, 1, pres=(emily_x, HEADER_H, EMILY_W, ph))
    vw = p.bpatcher("emi.view.maxpat", view_x + 20, y, VIEW_W, ph, 1, 1, pres=(view_x, HEADER_H, VIEW_W, ph))
    eng = p.obj(abstraction, 20, h + 60, 1, 1, w=90)
    rv = p.obj("route view", view_x + 20, h + 60, 2, 2, w=75)
    # The pop-up window: opened by the square button at the top right, in
    # the row of names (an arrow: there's no room for a word).
    win = p.obj("emi.window", view_x + 120, h + 60, 1, 1, w=80)
    window = button(p, "Window", "\u2197", view_x + 120, h + 100, (view_x + VIEW_W - WINDOW_SIZE - 1, 1, WINDOW_SIZE,
                    WINDOW_SIZE), fontsize=12.0)
    window_t = p.obj("t b", view_x + 120, h + 130, 1, 1, ["bang"], w=35)
    opener = p.msg("open", view_x + 120, h + 160, w=40)
    pcontrol = p.obj("pcontrol", view_x + 120, h + 190, 1, 1, w=60)
    p.connect(window, 0, window_t, 0)
    p.connect(window_t, 0, opener, 0)
    p.connect(opener, 0, pcontrol, 0)
    p.connect(pcontrol, 0, win, 0)
    # The corpus window (M11): opened by the panel's corpora button.
    corp = p.obj("emi.corpora", view_x + 240, h + 60, 1, 1, w=80)
    rcv_c = p.obj("r ---emi.corpora", view_x + 240, h + 100, 1, 1, w=110)
    opener_c = p.msg("open", view_x + 240, h + 130, w=40)
    pcontrol_c = p.obj("pcontrol", view_x + 240, h + 160, 1, 1, w=60)
    p.connect(rcv_c, 0, opener_c, 0)
    p.connect(opener_c, 0, pcontrol_c, 0)
    p.connect(pcontrol_c, 0, corp, 0)
    p.connect(eng, 0, corp, 0)
    for source in (bp, pn, em, vw, win, corp):
        p.connect(source, 0, eng, 0)
    p.connect(eng, 0, bp, 0)
    p.connect(eng, 0, pn, 0)
    p.connect(eng, 0, em, 0)
    p.connect(eng, 0, rv, 0)
    p.connect(eng, 0, win, 0)
    p.connect(rv, 0, vw, 0)
    p.comment(title, 20, h + 100, w=480, h=34, linecount=2)
    return annotate("top", p)


def device_width(host_w):
    return host_w + 8 + PANEL_W + 8 + EMILY_W + 8 + VIEW_W


def voice():
    p = Patch(rect=(80, 80, 760, 460), presentation=True)
    p.comment("emi.voice (the cento.voice device): plays one voice from cento.brain on this track. The track's name picks the voice "
              "(Soprano, Alto, Tenor or Bass), the same rule clip writing uses.", 20, 5, w=640, h=34, linecount=2)
    p.comment("Cento voice", 20, 50, w=80, pres=(6, 4, 100, 20), fontface=1)

    # The track's name, now and whenever it changes
    thisdev = p.obj("live.thisdevice", 20, 80, 1, 3, ["bang", "int", "int"])
    t2 = p.obj("t b b", 20, 115, 1, 2, ["bang", "bang"], w=50)
    p.connect(thisdev, 0, t2, 0)
    prop = p.msg("property name", 290, 150)
    path = p.msg("path this_device canonical_parent", 20, 150)
    livepath = p.obj("live.path", 20, 185, 1, 3)
    observer = p.obj("live.observer", 200, 220, 2, 2)
    p.connect(t2, 1, prop, 0)
    p.connect(t2, 0, path, 0)
    p.connect(prop, 0, observer, 0)
    p.connect(path, 0, livepath, 0)
    p.connect(livepath, 0, observer, 1)
    p.comment("this track's name", 320, 220, w=120)

    pre = p.obj("prepend trackname", 200, 255, 2, 1, w=120)
    p.connect(observer, 0, pre, 0)
    js = p.obj("v8 emi.voice.bundle.js", 200, 290, 1, 1)
    p.connect(pre, 0, js, 0)
    route = p.obj("route show", 200, 325, 2, 2, w=75)
    p.connect(js, 0, route, 0)
    set_label = p.obj("prepend set", 330, 360, 2, 1)
    p.connect(route, 0, set_label, 0)
    label = p.msg("", 330, 395, w=100, pres=(6, 30, 108, 20), varname="Voice")
    p.connect(set_label, 0, label, 0)
    p.comment("Plays the voice its track is named for: Soprano, Alto, Tenor or Bass.", 460, 395, w=110,
              h=62, linecount=4, pres=(6, 56, 108, 62))

    rcv = p.obj("receive", 200, 360, 1, 1, w=55)
    p.comment("set emi.voice.N (only an unnamed [receive] has an inlet for set)", 20, 395, w=170, h=34, linecount=2)
    p.connect(route, 1, rcv, 0)
    fmt = p.obj("midiformat", 200, 430, 7, 2, ["int", ""], w=75)
    p.connect(rcv, 0, fmt, 0)
    midiin = p.obj("midiin", 330, 430, 1, 1, ["int"], w=50)
    midiout = p.obj("midiout", 260, 470, 1, 0, [], w=55)
    p.connect(fmt, 0, midiout, 0)
    p.connect(midiin, 0, midiout, 0)
    p.comment("pitch velocity from cento.brain -> this track's instrument; track MIDI passes through",
              390, 465, w=330, h=34, linecount=2)
    return p


# ---------------------------------------------------------------- .amxd
def tlv(tag, data):
    return tag.encode("ascii") + struct.pack(">I", 8 + len(data)) + data


def tlv_str(tag, text):
    raw = text.encode("ascii")
    return tlv(tag, raw + b"\x00" * ((4 - len(raw) % 4) % 4))


def tlv_u32(tag, value):
    return tlv(tag, struct.pack(">I", value))


def amxd(bpatcher_name, width, filename, height=169):
    """Layout: ampf/meta/ptch chunks; ptch = mx@c header + JSON + "\n\0" + dlst."""
    p = Patch(rect=(100, 100, 640, 480), presentation=True, devicewidth=width)
    p.bpatcher(bpatcher_name, 10, 10, width, height, 0, 0, pres=(0, 0, width, height))
    extra = {"bglocked": 0, "description": "", "digest": "", "tags": "", "style": "",
             "dependency_cache": [], "autosave": 0}
    body = json.dumps({"patcher": {**p.patcher_dict(), **extra}}, indent="\t", ensure_ascii=True).encode("utf-8")
    separator = b"\n\x00"
    dlst = tlv("dlst", tlv("dire", tlv_str("type", "JSON") + tlv_str("fnam", filename)
                             + tlv_u32("sz32", len(body) + 2) + tlv_u32("of32", 16)
                             + tlv_u32("vers", 0) + tlv_u32("flag", 0x11) + tlv_u32("mdat", 0)))
    mx = b"mx@c" + struct.pack(">III", 16, 0, len(body) + len(separator) + 16)
    ptch = mx + body + separator + dlst
    return (b"ampf" + struct.pack("<I", 4) + b"mmmm"
            + b"meta" + struct.pack("<I", 4) + struct.pack("<I", 7)
            + b"ptch" + struct.pack("<I", len(ptch)) + ptch)


if __name__ == "__main__":
    write("patchers/parts/emi.engine.maxpat", engine().to_json())
    write("patchers/parts/emi.host.max.maxpat", annotate("emi.host.max", host_max()).to_json())
    write("patchers/parts/emi.host.live.maxpat", annotate("emi.host.live", host_live()).to_json())
    write("patchers/parts/emi.panel.maxpat", annotate("emi.panel", panel()).to_json())
    write("patchers/parts/emily.panel.maxpat", annotate("emily.panel", emily_panel()).to_json())
    write("patchers/parts/emi.window.maxpat", annotate("emi.window", window()).to_json(
        {"toolbarvisible": 0, "statusbarvisible": 0}))
    write("patchers/parts/emi.corpora.maxpat", annotate("emi.corpora", corpora_window()).to_json(
        {"toolbarvisible": 0, "statusbarvisible": 0}))
    write("patchers/parts/emi.instruments.maxpat", annotate("emi.instruments", instruments_window()).to_json(
        {"toolbarvisible": 0, "statusbarvisible": 0}))
    write("patchers/parts/emi.extras.maxpat", annotate("emi.extras", extras_window()).to_json(
        {"toolbarvisible": 0, "statusbarvisible": 0}))
    write("patchers/parts/emi.magdalena.maxpat", magdalena_window().to_json({"toolbarvisible": 0, "statusbarvisible": 0}))
    write("patchers/cento.maxpat", top(
        "emi.host.max.maxpat", "PLAY",
        "Max version: the Max adapter and the shared panel above, wired both ways to the shared engine.",
        HOST_MAX_W).to_json())
    write("patchers/parts/emi.brain.maxpat", top(
        "emi.host.live.maxpat", "CLIPS AND VOICES",
        "Live version (device content): the Live adapter and the shared panel above, wired both ways "
        "to the shared engine.", HOST_LIVE_W).to_json())
    write("patchers/parts/emi.voice.maxpat", annotate("emi.voice", voice()).to_json())
    write("patchers/parts/emi.view.maxpat", annotate("emi.view", view()).to_json())
    assert ANNOTATED == set(HELP), sorted(set(HELP) - ANNOTATED)
    write("docs/controls.md", controls_doc())
    # The Live devices (their contents are emi.brain and emi.voice).
    for name, bp, w in [("cento.brain", "emi.brain.maxpat", device_width(HOST_LIVE_W)), ("cento.voice", "emi.voice.maxpat", 120)]:
        write(f"patchers/{name}.amxd", amxd(bp, w, f"{name}.amxd"))
    if CHECK:
        if STALE:
            print("patches differ from tools/maxgen.py (run python3 tools/maxgen.py, or port your Max edits):")
            for path in STALE:
                print("  " + path)
            sys.exit(1)
        print("patches are up to date")
