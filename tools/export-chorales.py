#!/usr/bin/env python3
"""Exports Bach chorales from the music21 corpus as the ml_midi source corpus.

For each chorale that passes the filter, this writes:
  <name>.mid   type-1 MIDI at 960 ticks per quarter (the engine's own unit).
               Track 0 holds tempo and meter; tracks 1-4 are soprano, alto,
               tenor and bass. A pickup is padded with silence so that bar 1
               starts on a real barline.
  <name>.json  what MIDI can't carry: fermatas (phrase ends), the padding,
               the key, the meter and where the chorale came from

Paths:
  output:   ~/Documents/ml_midi/corpus/  (i.e. $HOME/Documents/ml_midi/corpus/),
            outside the repository: the music is public domain, but these
            encodings aren't ours to redistribute. Change it with --out.
  music21:  installed into <repo>/.venv by the commands below (git-ignored).

Run from the repo folder:
  python3 -m venv .venv
  .venv/bin/pip install music21
  .venv/bin/python tools/export-chorales.py                  # all 4/4 major (142)
  .venv/bin/python tools/export-chorales.py --count 20       # just the first 20
  .venv/bin/python tools/export-chorales.py --mode minor --out ~/Documents/ml_midi/corpus-minor
"""

import argparse
import json
import sys
from pathlib import Path

from music21 import corpus, defaults, expressions, meter, midi
from music21.corpus import chorales

DEFAULT_OUT = Path.home() / "Documents" / "ml_midi" / "corpus"
PPQ = 960
defaults.ticksPerQuarter = PPQ  # music21's default is 10080


def describe(score, source):
    """Returns the sidecar metadata, or None if the chorale isn't usable."""
    parts = list(score.parts)
    if len(parts) != 4:
        return None
    signatures = {ts.ratioString for ts in score.recurse().getElementsByClass(meter.TimeSignature)}
    if len(signatures) != 1:
        return None  # no time signature, or the meter changes

    # A pickup bar (numbered 0) is short. Pad it so bar 1 starts on a barline.
    first_measure = parts[0].getElementsByClass("Measure").first()
    pad = 0.0
    if first_measure is not None and first_measure.number == 0:
        pad = float(first_measure.barDuration.quarterLength - first_measure.duration.quarterLength)

    fermatas = sorted(
        {
            float(note.getOffsetInHierarchy(score)) + pad
            for note in parts[0].recurse().notes
            if any(isinstance(e, expressions.Fermata) for e in note.expressions)
        }
    )
    key = score.analyze("key")
    return {
        "source": "music21 corpus: " + source,
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


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="output folder (default: %(default)s)")
    parser.add_argument("--count", type=int, default=None, help="export at most this many (default: every match)")
    parser.add_argument("--meter", default="4/4", help="keep only this meter (default: %(default)s)")
    parser.add_argument("--mode", default="major", choices=["major", "minor", "any"], help="(default: %(default)s)")
    args = parser.parse_args()

    args.out = args.out.expanduser().resolve()
    args.out.mkdir(parents=True, exist_ok=True)
    print(f"Exporting to {args.out}")
    seen = set()
    written = 0
    # Riemenschneider order. Some numbers repeat a chorale, hence "seen".
    for source in chorales.Iterator(returnType="filename"):
        if args.count is not None and written >= args.count:
            break
        if source in seen:
            continue
        seen.add(source)
        try:
            score = corpus.parse(source)
        except Exception as e:  # a few corpus files don't parse; skip them
            print(f"skip {source}: {e}", file=sys.stderr)
            continue
        # Grace notes have no duration: in MIDI their note-off can come before
        # their note-on, which leaves a note hanging. They're ornaments; drop them.
        for note in list(score.recurse().notes):
            if note.duration.isGrace:
                note.activeSite.remove(note)
        info = describe(score, source)
        if info is None or info["meter"] != args.meter:
            continue
        if args.mode != "any" and info["key"]["mode"] != args.mode:
            continue
        if any(part.recurse().getElementsByClass("Chord") for part in score.parts):
            # The engine needs one note at a time in each voice.
            print(f"skip {source}: a part has chords", file=sys.stderr)
            continue

        name = Path(source).name
        try:
            write_midi(score, info["padQuarters"], args.out / f"{name}.mid")
        except Exception as e:  # e.g. repeat marks music21 can't expand; skip it
            print(f"skip {source}: {e}", file=sys.stderr)
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
