# Cento

A recombinant composer for **Max** and **Max for Live**, in the style of David
Cope's *Experiments in Musical Intelligence* (EMI) and his later program
*Emily Howell*. A *cento* is a poem made entirely of lines from other poems;
Cento makes music the same way, from beats of the works it has learned.

(Cento was called ml_midi until after M11. The Max patch is now
`cento.maxpat` and the Live devices `cento.brain.amxd` and `cento.voice.amxd`;
the settings, Emily's taste, her works and snapshots in `patchers/` carry over
from their old names, `ml_midi.*.json`, by themselves. The working data
folder is now `~/Documents/cento`: rename `~/Documents/ml_midi` to it in
Finder, and the corpus window's folders follow.)

It analyzes a corpus of music in one style (Bach chorales first) and writes
new pieces in that style by recombining beats from different works. Each
recombination must preserve the voice-leading, the structural function of the
beat (SPEAC) and the composer's recurring signatures. An Emily-style layer then
learns from your ratings, and its style drifts as you accept its music.

This is an independent project. It is not affiliated with David Cope; it
implements ideas from his published books (see [PLAN.md](PLAN.md#11-references)).

**Status: M11 code done; waiting on its Max and Live checks
([M11](docs/M11-checklist.md) checklist). Next, M12: free downloads for
other people on GitHub's Releases page ([how](docs/releasing.md)). M9 and M10 passed in both
products ([M9](docs/M9-checklist.md), [M10](docs/M10-checklist.md)
results); M8 passed in the Max version and waits on its Live checks
([M8](docs/M8-checklist.md) checklist).**
Both products load Bach chorales, play them in C major or their own key, and
compose new chorales by
recombining beats from the whole corpus. Since M3, each new piece takes the
form of a chorale from the corpus: its phrases, its cadences and its ending.
They show pieces in a piano roll colored by source chorale, export them as
MIDI files, and (in Live) write them as clips ([M0](docs/M0-spikes.md),
[M1](docs/M1-checklist.md), [M2](docs/M2-checklist.md),
[M3](docs/M3-checklist.md), [M4](docs/M4-checklist.md),
[M5](docs/M5-checklist.md), [M6](docs/M6-checklist.md),
[M7](docs/M7-checklist.md) results). Both share
one control panel and remember their settings, including the last corpus,
between sessions. Since M5, pieces start on the next barline wherever Play
starts. Pieces can also stream phrase by phrase while they play, endlessly or
ending after a set number of phrases. Since M6, every beat carries Cope's
SPEAC function (statement, preparation, extension, antecedent, consequent),
recombination matches beats by function, and the piano roll shows a SPEAC
lane. Since M7, pieces keep Bach's *signatures*, the cadence formulas found
across many chorales (soprano 3-2-1, bass 4-5-1), whole at their cadences,
shown as gold bands in the piano roll. Since M8, pieces that quote a chorale
for too long are set aside, the piano roll shows where each beat came from
when you hover over it, a corpus may mix major and minor chorales, 3/4
chorales work, and the **A/B** button writes a blind listening test (Bach or
not?) as a web page. Since M9, Emily learns your taste: **like** and
**dislike** rate the piece, the stream phrase playing or the beats you drag
across in the piano roll. Later pieces lean toward the features you liked
(high melodies, 16th notes, modulations, ...), within the same rules, and
**temp** sets how much chance still plays. The **window** button opens a
large piano roll with Emily's taste in full, in both products. There you can
also pin any feature's weight with a slider, set her taste's strength, and
store and recall whole tastes as files. Since M10, Emily varies pieces with
notes Bach never wrote (**novelty**), **accept** keeps what you like as music
of her own that later pieces draw on (**mix**), and snapshots let you roll
her back to any earlier state. Since M11, the **corpora** window lists folders
of chorales, each switched on or off: composing uses every folder that is on,
as one corpus (major and minor, or a 3/4 folder alone). Every control explains itself when you hover
over it (a tooltip in Max, the Info View in Live); [docs/controls.md](docs/controls.md)
lists them all. The full plan
and milestones are in [PLAN.md](PLAN.md).

## Two products, one engine

| | Open this | Plays through |
|---|---|---|
| **Max version** | `patchers/cento.maxpat` | A MIDI port (AU DLS Synth, IAC to any app) or `[vst~]` instruments |
| **Live version** | `patchers/cento.brain.amxd` on one track, `patchers/cento.voice.amxd` on each voice track | Live's tracks and instruments |

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
| **The repo** (your clone) | wherever you cloned it, e.g. `~/Documents/GitHub/cento` | Run every command below from this folder |
| **Python for music21** | `<repo>/.venv/` | Made by `python3 -m venv .venv`. About 300 MB, git-ignored, delete it to uninstall |
| **Chorale corpus** | `~/Documents/cento/corpus/` | Written by `tools/export-chorales.py`; outside the repo |
| **Minor-key corpus** (optional) | `~/Documents/cento/corpus-minor/` | Written with `--mode minor`; add it in the **corpora** window, on its own or with `corpus` |
| **Major and minor, 3/4** (optional, M8) | `~/Documents/cento/corpus-both/`, `corpus-3-4/` | Written with `--mode any` and `--meter 3/4` |
| **Exported pieces** | `~/Documents/cento/out/` | Where to save with **export midi** (a `.mid`, and for a composed piece a `.json` of where each beat came from); outside the repo |
| **Listening tests** | anywhere, e.g. `~/Documents/cento/` | Written by the **A/B** button: one web page, opened in a browser |
| **Emily's taste** (M9) | `<repo>/patchers/cento.taste.json` | Your ratings, pins and strength, shared by both products; git-ignored. **forget** and **recall taste** set the old one aside as `cento.taste.backup.json`; delete both to start fresh |
| **Stored tastes** (optional) | e.g. `~/Documents/cento/emily/` | Written by **store taste** in the pop-up window; read back by **recall taste** |
| **Emily's own music and snapshots** (M10) | `<repo>/patchers/cento.emily.json`, `cento.snapshots.json` | Every piece or phrase you **accept**, and her last 30 snapshots; git-ignored, shared by both products |
| **Later: databases, Emily's snapshots** | `~/Documents/cento/db/`, `emily/` | Outside the repo |
| **Live's search path entry** | `<repo>/patchers/` | Added once in *Options → File Preferences* |
| **Remembered settings** | `<repo>/patchers/cento.settings.json` | The corpus window's folders (which are on), seed and other settings; written by the patches, git-ignored. Delete it to start fresh |

`~` is your home folder, `/Users/<your name>`. `<repo>` is the folder you
cloned into.

### Commands

Clone the repo wherever you like (GitHub Desktop's `~/Documents/GitHub` is
fine), then run everything from inside it:

```sh
git clone https://github.com/nnokes/cento.git
cd cento                    # <repo>: all commands below run from here

npm test                    # engine tests
npm run hooks               # pre-commit check: no personal paths, bundles up to date

# Chorale corpus: installs music21 into <repo>/.venv, then writes all 142
# major-key chorales in 4/4 to ~/Documents/cento/corpus/
python3 -m venv .venv
.venv/bin/pip install music21
.venv/bin/python tools/export-chorales.py

# Optional: the 153 minor-key chorales, as a corpus of their own
.venv/bin/python tools/export-chorales.py --mode minor --out ~/Documents/cento/corpus-minor
# Optional (M8): major and minor together (295), and the 20 major chorales in 3/4
.venv/bin/python tools/export-chorales.py --mode any --out ~/Documents/cento/corpus-both
.venv/bin/python tools/export-chorales.py --meter 3/4 --out ~/Documents/cento/corpus-3-4
```

Tip: in Terminal, type `cd ` (with a space), then drag the repo folder from
Finder into the window to paste its exact path.

Everything Max loads (patches, devices and the generated script bundles) is
in `patchers/`.

- **Max version:** open `patchers/cento.maxpat`. Nothing else to set up.
- **Live version:** Live's Max needs `patchers/` on its search path, once:
  1. In Live, drop a *Max MIDI Effect* on a track and click *Edit*.
  2. In that editor, choose *Options → File Preferences*, click **+**, then
     *Choose* and select the repo's `patchers` folder.
  3. Restart Live. In Live's browser, add the repo folder under *Places*.
     Drag `patchers/cento.brain.amxd` onto one MIDI track, and
     `patchers/cento.voice.amxd` onto four MIDI tracks named **Soprano**,
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
              cento.maxpat (Max version), cento.brain.amxd + cento.voice.amxd
              (Live version), emi.engine, emi.host.max, emi.host.live,
              emi.panel (the shared controls), emily.panel (Emily's ratings),
              emi.view (piano roll), emi.window (the pop-up window),
              emi.corpora (the corpus window), and the generated
              *.bundle.js scripts (npm run build; committed)
code/         [v8] wrappers: glue between Max messages and the engine
              (emi.core.v8.js), and the piano roll (emi.view.v8ui.js)
code/lib/     the engine: plain JavaScript, no Max APIs, tested in Node
code/max/     Max-only helpers used by the wrappers (files, Live clips)
tests/        node --test, including the bundles in a simulated [v8] context
tools/        build, path check, git hook, chorale export, and maxgen.py,
              which writes every patch and device (the master copy)
docs/         milestone checklists; controls.md: what every control does;
              releasing.md: how to publish a version for others
```

Your working data (corpus, analyzed databases, generated music) lives in
`~/Documents/cento/`, outside the repository. The remembered settings and
Emily's taste are git-ignored files in `patchers/`.

## Development

- Edit the engine in `code/lib/` and the wrappers in `code/`. Keep
  `npm run build:watch` running while Max is open: the `[v8]` objects reload
  their bundles automatically.
- Never edit `patchers/*.bundle.js` by hand. CI fails if the bundles don't
  match `code/`.
- The patches and devices in `patchers/` (and `docs/controls.md`) are written
  by `tools/maxgen.py`, the master copy: change a patch there and run
  `npm run patches` (Python 3, standard library only), then commit both. A
  change made in Max alone is overwritten by the next run; CI fails if the
  patches don't match the script (`npm run patches:check`).
- Patches always load the bundles, never `code/` directly, so what you test in
  Max is exactly what gets frozen into a device.
- Some tests need data that isn't in the repository, and skip without it:
  - `EMI_CORPUS=<folder>` runs the corpus tests on that folder (by default
    `~/Documents/cento/corpus`);
  - `EMI_SPEAC_REF=<folder>` runs the golden test against Cope's Chopin
    analysis, given a clone of
    [GolzitskyNikolay/SPEAC-analysis](https://github.com/GolzitskyNikolay/SPEAC-analysis).

## License

[MIT](LICENSE)
