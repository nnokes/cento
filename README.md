# ml_midi

A recombinant composer for **Max** and **Max for Live**, in the style of David
Cope's *Experiments in Musical Intelligence* (EMI) and his later program
*Emily Howell*.

It analyzes a corpus of music in one style (Bach chorales first) and writes
new pieces in that style by recombining beats from different works. Each
recombination must preserve the voice-leading, the structural function of the
beat (SPEAC) and the composer's recurring signatures. An Emily-style layer then
learns from your ratings, and its style drifts as you accept its music.

This is an independent project. It is not affiliated with David Cope; it
implements ideas from his published books (see [PLAN.md](PLAN.md#11-references)).

**Status: M5 code done; waiting on the Max and Live checks
([M5 checklist](docs/M5-checklist.md)).** Both products load Bach chorales,
play them in C major or their own key, and compose new chorales by
recombining beats from the whole corpus. Since M3, each new piece takes the
form of a chorale from the corpus: its phrases, its cadences and its ending.
They show pieces in a piano roll colored by source chorale, export them as
MIDI files, and (in Live) write them as clips ([M0](docs/M0-spikes.md),
[M1](docs/M1-checklist.md), [M2](docs/M2-checklist.md),
[M3](docs/M3-checklist.md), [M4](docs/M4-checklist.md) results). Both share
one control panel and remember their settings, including the last corpus,
between sessions. Since M5, pieces start on the next barline wherever Play
starts. Pieces can also stream phrase by phrase while they play, endlessly or
ending after a set number of phrases. The full plan and milestones are in
[PLAN.md](PLAN.md).

## Two products, one engine

| | Open this | Plays through |
|---|---|---|
| **Max version** | `patchers/ml_midi.maxpat` | A MIDI port (AU DLS Synth, IAC to any app) or `[vst~]` instruments |
| **Live version** | `patchers/emi.brain.amxd` on one track, `patchers/emi.voice.amxd` on each voice track | Live's tracks and instruments |

Both versions load the same `emi.engine` abstraction. Everything that differs
between them is in two thin adapters, `emi.host.max` and `emi.host.live`.

## Requirements

- **Max 9**, for the `[v8]` JavaScript object.
- **Ableton Live 12** with Max for Live, running Max 9. Live 12.2.1 and later
  bundle Max 9; with an earlier version, point Live at your Max 9
  installation.
- **Node 20+**, for tests and building the bundles (development only).
- **Python 3 + music21**, to export the chorale corpus (run once).

## Setup (macOS)

### Where things live

| What | Where | Notes |
|---|---|---|
| **The repo** (your clone) | wherever you cloned it, e.g. `~/Documents/GitHub/ml_midi` | Run every command below from this folder |
| **Python for music21** | `<repo>/.venv/` | Made by `python3 -m venv .venv`. About 300 MB, git-ignored, delete it to uninstall |
| **Chorale corpus** | `~/Documents/ml_midi/corpus/` | Written by `tools/export-chorales.py`; outside the repo |
| **Minor-key corpus** (optional) | `~/Documents/ml_midi/corpus-minor/` | Written with `--mode minor`; load it with **load corpus** instead |
| **Exported pieces** | `~/Documents/ml_midi/out/` | Where to save with **export midi**; outside the repo |
| **Later: databases, Emily's memory** | `~/Documents/ml_midi/db/`, `emily/` | Outside the repo |
| **Live's search path entry** | `<repo>/patchers/` | Added once in *Options → File Preferences* |
| **Remembered settings** | `<repo>/patchers/ml_midi.settings.json` | Last corpus, seed and other settings; written by the patches, git-ignored. Delete it to start fresh |

`~` is your home folder, `/Users/<your name>`. `<repo>` is the folder you
cloned into.

### Commands

Clone the repo wherever you like (GitHub Desktop's `~/Documents/GitHub` is
fine), then run everything from inside it:

```sh
git clone https://github.com/nnokes/ml_midi.git
cd ml_midi                  # <repo>: all commands below run from here

npm test                    # engine tests
npm run hooks               # pre-commit check: no personal paths, bundles up to date

# Chorale corpus: installs music21 into <repo>/.venv, then writes all 142
# major-key chorales in 4/4 to ~/Documents/ml_midi/corpus/
python3 -m venv .venv
.venv/bin/pip install music21
.venv/bin/python tools/export-chorales.py

# Optional: the 153 minor-key chorales, as a corpus of their own
.venv/bin/python tools/export-chorales.py --mode minor --out ~/Documents/ml_midi/corpus-minor
```

Tip: in Terminal, type `cd ` (with a space), then drag the repo folder from
Finder into the window to paste its exact path.

Everything Max loads (patches, devices and the generated script bundles) is
in `patchers/`.

- **Max version:** open `patchers/ml_midi.maxpat`. Nothing else to set up.
- **Live version:** Live's Max needs `patchers/` on its search path, once:
  1. In Live, drop a *Max MIDI Effect* on a track and click *Edit*.
  2. In that editor, choose *Options → File Preferences*, click **+**, then
     *Choose* and select the repo's `patchers` folder.
  3. Restart Live. In Live's browser, add the repo folder under *Places*.
     Drag `patchers/emi.brain.amxd` onto one MIDI track, and
     `patchers/emi.voice.amxd` onto four MIDI tracks named **Soprano**,
     **Alto**, **Tenor** and **Bass**. Each voice device plays the voice its
     track is named for, and shows it.

  To check the search path, type `emi.engine` into an object box in any
  device editor: a solid box means Live can see the files.

How Max finds files (learned the hard way in M0):

- Standalone Max searches the folder of the patch it opens, plus the search
  path.
- A Max for Live device is a *project*: it finds files that belong to its
  project, plus the search path, but **not** other files in its own folder.
- `~/Documents/Max 9/Packages/` is on the search path for Max and for Live.
- Max doesn't follow symbolic links (or Finder aliases).

The alternative to the File Preferences step is to clone the repo directly
into `~/Documents/Max 9/Packages/` (a real folder, not a link).

## Repository layout

```
patchers/     everything Max loads, in one folder:
              ml_midi.maxpat (Max version), emi.brain.amxd + emi.voice.amxd
              (Live version), emi.engine, emi.host.max, emi.host.live,
              emi.panel (the shared controls), emi.view (piano roll), and the
              generated *.bundle.js scripts (npm run build; committed)
code/         [v8] wrappers: glue between Max messages and the engine
              (emi.core.v8.js), and the piano roll (emi.view.v8ui.js)
code/lib/     the engine: plain JavaScript, no Max APIs, tested in Node
code/max/     Max-only helpers used by the wrappers (files, Live clips)
tests/        node --test, including the bundles in a simulated [v8] context
tools/        build, path check, git hook, chorale export
docs/         milestone checklists
```

Your working data (corpus, analyzed databases, generated music, Emily's
memory) lives in `~/Documents/ml_midi/`, outside the repository.

## Development

- Edit the engine in `code/lib/` and the wrappers in `code/`. Keep
  `npm run build:watch` running while Max is open: the `[v8]` objects reload
  their bundles automatically.
- Never edit `patchers/*.bundle.js` by hand. CI fails if the bundles don't
  match `code/`.
- Patches always load the bundles, never `code/` directly, so what you test in
  Max is exactly what gets frozen into a device.

## License

[MIT](LICENSE)
