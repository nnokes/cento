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

**Status: M1, reading the corpus.** M0 is done: the engine skeleton, both
shells and the tooling work in Max and in Live ([results](docs/M0-spikes.md)).
M1 reads chorale MIDI files, moves them to C major, and plays them in both
products ([checklist](docs/M1-checklist.md)). The full plan and milestones are
in [PLAN.md](PLAN.md).

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
| **Later: databases, output, Emily's memory** | `~/Documents/ml_midi/db/`, `out/`, `emily/` | Outside the repo |
| **Live's search path entry** | `<repo>/patchers/` | Added once in *Options → File Preferences* |

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

# Chorale corpus: installs music21 into <repo>/.venv, then writes the
# chorales to ~/Documents/ml_midi/corpus/
python3 -m venv .venv
.venv/bin/pip install music21
.venv/bin/python tools/export-chorales.py
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
  3. Restart Live. In Live's browser, add the repo folder under *Places*, then
     drag `patchers/emi.brain.amxd` and `patchers/emi.voice.amxd` onto tracks.

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
              (Live version), emi.engine, emi.host.max, emi.host.live, and the
              generated *.bundle.js scripts (npm run build; committed)
code/         [v8] wrappers (*.v8.js): glue between Max messages and the engine
code/lib/     the engine: plain JavaScript, no Max APIs, tested in Node
code/max/     Max-only helpers used by the wrappers (e.g. reading files)
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
