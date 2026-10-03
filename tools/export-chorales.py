#!/usr/bin/env python3
"""Exports Bach chorales as a Cento corpus: from the music21 corpus, or (with
--from) from a folder of MusicXML scores.

For each chorale that passes the filter, this writes:
  <name>.mid   type-1 MIDI at 960 ticks per quarter (the engine's own unit).
               Track 0 holds tempo and meter; tracks 1-4 are soprano, alto,
               tenor and bass. A pickup is padded with silence so that bar 1
               starts on a real barline.
  <name>.json  what MIDI can't carry: fermatas (phrase ends), the padding,
               the key, the meter and where the chorale came from

Paths:
  output:   ~/Documents/cento/corpus/  (i.e. $HOME/Documents/cento/corpus/),
            outside the repository: the music is public domain, but music21's
            encodings are for your own use, not to share (PLAN.md, section
            6.1). Change it with --out.
  music21:  installed into <repo>/.venv by the commands below (git-ignored).

From a folder (--from): every .musicxml, .mxl or .xml score in it. Only the
four voices are kept (parts named Voice, Soprano, Alto, Tenor or Bass, in
score order; instruments and continuo are dropped); a score without four, or
without fermatas, is skipped. This is how corpus/bach-figured-bass in the
repository was made, from the Bach Chorales Figured Bass dataset (CC BY 4.0;
see corpus/README.md):
  .venv/bin/python tools/export-chorales.py --from <Bach_chorale_FB>/FB_source/musicXML_master \
      --mode any --out corpus/bach-figured-bass
  .venv/bin/python tools/export-chorales.py --from <Bach_chorale_FB>/FB_source/musicXML_master \
      --mode any --meter 3/4 --out corpus/bach-figured-bass-3-4

Run from the repo folder:
  python3 -m venv .venv
  .venv/bin/pip install music21
  .venv/bin/python tools/export-chorales.py                  # all 4/4 major (142)
  .venv/bin/python tools/export-chorales.py --count 20       # just the first 20
  .venv/bin/python tools/export-chorales.py --mode minor --out ~/Documents/cento/corpus-minor
  .venv/bin/python tools/export-chorales.py --mode any --out ~/Documents/cento/corpus-both     # 4/4, major and minor (296)
  .venv/bin/python tools/export-chorales.py --meter 3/4 --mode any --out ~/Documents/cento/corpus-3-4  # 3/4 (32)
"""

import argparse
import json
import re
import sys
from pathlib import Path

from music21 import converter, corpus, defaults, expressions, meter, midi, stream
from music21.corpus import chorales

DEFAULT_OUT = Path.home() / "Documents" / "cento" / "corpus"
PPQ = 960
defaults.ticksPerQuarter = PPQ  # music21's default is 10080


VOICE_NAMES = ("voice", "soprano", "alto", "tenor", "bass")


def voices_of(score):
    """A score of just its four voices (for scores with instruments and
    continuo, as in the Bach Chorales Figured Bass dataset), or None."""
    voices = [p for p in score.parts if (p.partName or "").strip().lower().split(" ")[0] in VOICE_NAMES]
    if len(voices) != 4:
        return None
    out = stream.Score()
    out.metadata = score.metadata
    for part, name in zip(voices, ["Soprano", "Alto", "Tenor", "Bass"]):
        part.partName = name
        out.insert(0, part)
    return out


def work_id(path, music21_names):
    """A file's chorale as music21 names it, so the same chorale from two
    sources counts once: BWV_10.07a_FB.musicxml -> bwv10.7, its second
    version (b) -> bwv10.7b, BWV_250_FB.musicxml -> bwv250, and
    BWV_248.12_FB.musicxml -> bwv248.12-2 (music21 adds the part of a work
    in parts: the Christmas Oratorio's part 2)."""
    m = re.match(r"(?i)bwv[_ ]?(\d+)(?:\.0*(\d+))?([a-z]?)(?=_|$)", Path(path).stem)
    if not m:
        return Path(path).stem.lower()
    number, movement, version = m.groups()
    name = f"bwv{number}" + (f".{movement}" if movement else "")
    name += "" if version in ("", "a") else version.lower()
    return music21_names.get(name, name)


def music21_names():
    """music21's chorale names, by the name without a part: {"bwv248.12":
    "bwv248.12-2", ...}."""
    names = {}
    for source in chorales.Iterator(returnType="filename"):
        name = Path(source).name
        names.setdefault(re.sub(r"-\d+$", "", name), name)
    return names


def describe(score, source):
    """Returns the sidecar metadata, or None if the chorale isn't usable."""
    parts = list(score.parts)
    if len(parts) != 4:
        return None
    signatures = {ts.ratioString for ts in score.recurse().getElementsByClass(meter.TimeSignature)}
    if len(signatures) != 1:
        return None  # no time signature, or the meter changes

    # A pickup bar is short (numbered 0 in music21's chorales; 1 in others).
    # Pad it so bar 1 starts on a barline.
    first_measure = parts[0].getElementsByClass("Measure").first()
    pad = 0.0
    if first_measure is not None:
        short = first_measure.barDuration.quarterLength - first_measure.duration.quarterLength
        if first_measure.number == 0 or short > 0:
            pad = float(short)

    fermatas = sorted(
        {
            float(note.getOffsetInHierarchy(score)) + pad
            for note in parts[0].recurse().notes
            if any(isinstance(e, expressions.Fermata) for e in note.expressions)
        }
    )
    key = score.analyze("key")
    return {
        "source": source,
        "title": score.metadata.title if score.metadata else None,
        "parts": [part.partName for part in parts],
        "meter": signatures.pop(),
        "key": {"tonic": key.tonic.name, "mode": key.mode},
        "midi": {"ppq": PPQ, "voiceTracks": [1, 2, 3, 4]},
        # Times are in quarter notes from the start of the MIDI file, which is
        # always a barline. padQuarters of silence come before a pickup.
        "padQuarters": pad,
        "fermatasQuarters": fermatas,
    }


def write_midi(score, pad_quarters, path):
    """Writes the score as MIDI, delaying every voice by pad_quarters.

    music21 always starts the music at time 0, even after shifting the score,
    so the padding is added to the delta time before each track's first note.
    """
    mf = midi.translate.streamToMidiFile(score)
    pad_ticks = round(pad_quarters * PPQ)
    for track in mf.tracks[1:]:
        for i, event in enumerate(track.events):
            if event.isNoteOn():
                track.events[i - 1].time += pad_ticks  # the DeltaTime before it
                break
    mf.open(str(path), "wb")
    mf.write()
    mf.close()


def sources(args):
    """(name, label, load) for each chorale: music21's, or a folder's."""
    if args.source is None:
        # Riemenschneider order. Some numbers repeat a chorale (hence "seen" in
        # main). For three chorales music21 also has a CCARH Humdrum file,
        # whose terms reserve derived formats: read the MusicXML instead.
        for source in chorales.Iterator(returnType="filename"):
            yield (Path(source).name, "music21 corpus: " + source,
                   lambda source=source: corpus.parse(source, fileExtensions=("mxl", "xml", "musicxml")))
        return
    folder = args.source.expanduser().resolve()
    label = args.label or folder.name
    paths = sorted(p for p in folder.iterdir() if p.suffix.lower() in (".musicxml", ".mxl", ".xml"))
    names = music21_names()
    for path in paths:
        yield (work_id(path, names), f"{label}: {path.name}", lambda path=path: voices_of(converter.parse(str(path))))


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="output folder (default: %(default)s)")
    parser.add_argument("--count", type=int, default=None, help="export at most this many (default: every match)")
    parser.add_argument("--meter", default="4/4", help="keep only this meter (default: %(default)s)")
    parser.add_argument("--mode", default="major", choices=["major", "minor", "any"], help="(default: %(default)s)")
    parser.add_argument("--from", dest="source", type=Path, default=None,
                        help="a folder of MusicXML scores to export instead of music21's corpus")
    parser.add_argument("--label", default=None,
                        help="with --from: what the sidecars call the source (default: the folder's name)")
    args = parser.parse_args()

    args.out = args.out.expanduser().resolve()
    args.out.mkdir(parents=True, exist_ok=True)
    print(f"Exporting to {args.out}")
    seen = set()
    written = 0
    for name, label, load in sources(args):
        if args.count is not None and written >= args.count:
            break
        if name in seen:
            continue
        seen.add(name)
        try:
            score = load()
        except Exception as e:  # a few files don't parse; skip them
            print(f"skip {label}: {e}", file=sys.stderr)
            continue
        if score is None:
            print(f"skip {label}: not four voices", file=sys.stderr)
            continue
        # Grace notes have no duration: in MIDI their note-off can come before
        # their note-on, which leaves a note hanging. They're ornaments; drop them.
        for note in list(score.recurse().notes):
            if note.duration.isGrace:
                note.activeSite.remove(note)
        info = describe(score, label)
        if info is None or info["meter"] != args.meter:
            continue
        if args.mode != "any" and info["key"]["mode"] != args.mode:
            continue
        if args.source is not None and not info["fermatasQuarters"]:
            # Cento finds phrases at fermatas: without them, no form.
            print(f"skip {label}: no fermatas", file=sys.stderr)
            continue
        if any(part.recurse().getElementsByClass("Chord") for part in score.parts):
            # The engine needs one note at a time in each voice.
            print(f"skip {label}: a part has chords", file=sys.stderr)
            continue

        try:
            write_midi(score, info["padQuarters"], args.out / f"{name}.mid")
        except Exception as e:  # e.g. repeat marks music21 can't expand; skip it
            print(f"skip {label}: {e}", file=sys.stderr)
            continue
        (args.out / f"{name}.json").write_text(json.dumps(info, indent=2) + "\n")
        written += 1
        key = info["key"]
        print(f"{written:3d}  {name:12s} {key['tonic']} {key['mode']}, "
              f"padded {info['padQuarters']:g}, {len(info['fermatasQuarters'])} fermatas")

    print(f"wrote {written} chorales to {args.out}")
    if args.count is not None and written < args.count:
        print(f"only {written} chorales matched --meter {args.meter} --mode {args.mode}", file=sys.stderr)


if __name__ == "__main__":
    main()
