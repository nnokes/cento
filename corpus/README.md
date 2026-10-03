# Cento's chorales

These chorales come with Cento, so it can compose straight away. The first
time Cento opens, its corpus window lists both folders and switches the 4/4
one on.

| Folder | Chorales | Meter | Keys |
|---|---|---|---|
| `bach-figured-bass` | 118 | 4/4 | 51 major, 67 minor |
| `bach-figured-bass-3-4` | 13 | 3/4 | 10 major, 3 minor |

Each chorale is a MIDI file (soprano, alto, tenor and bass on tracks 1 to 4,
960 ticks per quarter note) with a JSON file beside it: where its phrases end
(fermatas), its key and meter, and where it came from.

## Where they come from, and the licence

They are J. S. Bach's chorales as encoded in the **Bach Chorales Figured
Bass** dataset, from the *Neue Bach-Ausgabe* critical edition:

> *Bach Chorales Figured Bass* (BCFB), version 2.0,
> https://github.com/juyaolongpaul/Bach_chorale_FB (taken from commit
> 431c5c0, July 2021). As its authors ask, please cite: Ju, Yaolong, Sylvain
> Margot, Cory McKay, Luke Dahn, and Ichiro Fujinaga. 2020. "Automatic Figured
> Bass Annotation Using the New Bach Chorales Figured Bass Dataset." In
> *Proceedings of the 21st International Society for Music Information
> Retrieval Conference* (ISMIR).

The dataset is licensed under the **Creative Commons Attribution 4.0
International** licence (CC BY 4.0): [`LICENSE-CC-BY-4.0.txt`](LICENSE-CC-BY-4.0.txt),
or https://creativecommons.org/licenses/by/4.0/. You may share and adapt these
files, as long as you give the same credit.

**What Cento changed** (as CC BY asks us to say): each score was cut down to
its four voices (the instrument and continuo parts, and the figured bass, are
left out), converted from MusicXML to MIDI with a JSON sidecar by
`tools/export-chorales.py`, and renamed as music21 names its chorales
(`BWV_10.07a_FB.musicxml` becomes `bwv10.7`, `BWV_248.12_FB.musicxml`
becomes `bwv248.12-2`). Scores without fermatas (9) are
left out, as are the few in other meters. The notes themselves are as
encoded.

## More chorales

music21's collection has more: 296 in 4/4 and 32 in 3/4 that Cento can use.
Its encodings may not be shared: they're for your own use only. The main
[README](../README.md#more-chorales-from-music21) explains, step by step, how
to get them onto your own computer.

95 of these 131 chorales are also in music21's collection, under the same
name. With both folders on, each of those counts once (the version in the
folder higher on the corpus window's list). The other 36 are only here.
