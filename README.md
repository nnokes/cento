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

**Status: M12 under way: free downloads for other people on GitHub's
Releases page ([M12](docs/M12-checklist.md) checklist, [how](docs/releasing.md));
first, your files move to your Cento folder in Documents. M11 code done;
waiting on its Max and Live checks ([M11](docs/M11-checklist.md)
checklist). M9 and M10 passed in both
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
as one corpus (major and minor, or a 3/4 folder alone). Cento comes with
131 Bach chorales of its own ([`corpus/`](corpus/README.md), freely
licensed), so it composes straight away; music21's are an optional extra
([step by step](#more-chorales-from-music21)). Every control explains itself when you hover
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
- **Python 3 + music21** (optional), for more chorales than the 131 that come
  with Cento: [More chorales from music21](#more-chorales-from-music21).

## Setup (macOS)

### Where things live

| What | Where | Notes |
|---|---|---|
| **The repo** (your clone) | wherever you cloned it, e.g. `~/Documents/GitHub/cento` | Run every command below from this folder |
| **Cento's chorales** | `<repo>/corpus/bach-figured-bass/`, `bach-figured-bass-3-4/` | 118 chorales in 4/4 and 13 in 3/4 that come with Cento (CC BY 4.0: [corpus/README.md](corpus/README.md)). Listed in the **corpora** window the first time Cento opens; the 4/4 folder is switched on if the list was empty |
| **Python for music21** (optional) | `<repo>/.venv/` | Made in [step 4](#more-chorales-from-music21) below. About 300 MB, git-ignored, delete it to uninstall |
| **music21's chorales** (optional) | `~/Documents/cento/corpus/`, `corpus-both/`, `corpus-minor/`, `corpus-3-4/` | Written by `tools/export-chorales.py` ([step 5](#more-chorales-from-music21)); outside the repo, because they're for your own use only |
| **Exported pieces** | `~/Documents/cento/out/` | Where to save with **export midi** (a `.mid`, and for a composed piece a `.json` of where each beat came from); outside the repo |
| **Listening tests** | anywhere, e.g. `~/Documents/cento/` | Written by the **A/B** button: one web page, opened in a browser |
| **Emily's taste** (M9) | `~/Documents/cento/cento.taste.json` | Your ratings, pins and strength, shared by both products. **forget** and **recall taste** set the old one aside as `cento.taste.backup.json`; delete both to start fresh |
| **Stored tastes** (optional) | e.g. `~/Documents/cento/emily/` | Written by **store taste** in the pop-up window; read back by **recall taste** |
| **Emily's own music and snapshots** (M10) | `~/Documents/cento/cento.emily.json`, `cento.snapshots.json` | Every piece or phrase you **accept**, and her last 30 snapshots; shared by both products |
| **Live's search path entry** | `<repo>/patchers/` | Added once in *Options → File Preferences* |
| **Remembered settings** | `~/Documents/cento/cento.settings.json` | The corpus window's folders (which are on), seed and other settings; written by the patches. Delete it to start fresh |

**Your Cento folder** (M12): the settings and Emily's files live in
`~/Documents/cento` (any case: `Cento` is the same folder on a Mac). Cento
uses it if it's there, so make it in Finder if you don't have it yet. The
first time Cento finds it, it copies the files it kept in `patchers/` until
M12 (they stay there too, git-ignored; delete them when you like). Without
that folder, Cento keeps its files in `patchers/` as before. The Max window
says which folder it uses: `cento: your Cento folder is ...`.

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
```

Cento's own chorales are already in the repo (`corpus/`). For music21's, see
[More chorales from music21](#more-chorales-from-music21).

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

## More chorales from music21

Cento comes with 131 Bach chorales ([`corpus/`](corpus/README.md)). The free
[music21](https://www.music21.org) toolkit has more: 296 in 4/4 and 32 in
3/4. Their encodings are for **your own use only**: keep them on your
computer, and don't share them or add them to the repository. (That's why
Cento can't include them: [PLAN.md](PLAN.md#61-working-in-a-public-repository),
§6.1.)

You do this once. It takes about 10 minutes, mostly downloading. You need an
internet connection and about 400 MB of free space. You type every command
into **Terminal**, then press Return.

**1. Open Terminal.** Press **⌘ Space**, type `Terminal`, press Return.

**2. Check Python.** Type:

```sh
python3 --version
```

- It prints `Python 3.` and a number (e.g. `Python 3.9.6`): go to step 3.
- macOS asks to install the **command line developer tools** instead: click
  **Install**, agree, wait for it to finish (a few minutes), then type
  `python3 --version` again.

**3. Go to the Cento folder.** Type `cd` and a space, then drag Cento's
folder (the repo, e.g. `Documents/GitHub/cento`) from Finder onto the
Terminal window, and press Return. To check, type `ls`: the list should
include `patchers` and `tools`.

**4. Install music21.** This makes a private Python just for Cento, in a
hidden folder `.venv` inside the Cento folder, and installs music21 there
(nothing else on your Mac changes):

```sh
python3 -m venv .venv
.venv/bin/pip install music21
```

The second command prints a lot and ends with
`Successfully installed ... music21-...`. A yellow notice that "a new release
of pip is available" is harmless.

**5. Export the chorales.** Choose any of these, one command each (each
takes a minute or two and lists every chorale it writes):

```sh
# All 296 chorales in 4/4, major and minor (the one most people want)
.venv/bin/python tools/export-chorales.py --mode any --out ~/Documents/cento/corpus-both

# Only the 142 major ones (the default), or only the 154 minor ones
.venv/bin/python tools/export-chorales.py --out ~/Documents/cento/corpus
.venv/bin/python tools/export-chorales.py --mode minor --out ~/Documents/cento/corpus-minor

# The 32 chorales in 3/4 (20 major, 12 minor)
.venv/bin/python tools/export-chorales.py --meter 3/4 --mode any --out ~/Documents/cento/corpus-3-4
```

Each ends with `wrote N chorales to /Users/<you>/Documents/cento/...`. Each
chorale is a `.mid` file and a `.json` file. (`--count 20` writes only the
first 20, for a quick try.)

**6. Add them in Cento.** In the Max patch or the Live device, click
**corpora**, then **add folder**, and choose the folder you exported to
(e.g. `Documents/cento/corpus-both`). It's added switched on. Leave Cento's
own `bach-figured-bass` on too, or use **only** for one folder alone: a
chorale that's in two folders counts once. Use 3/4 folders on their own
(**only**): the corpus has one meter.

**To uninstall:** delete the `.venv` folder inside the Cento folder (in
Finder, **⌘ Shift .** shows hidden folders), and the folders you exported in
`Documents/cento`.

**If something goes wrong:**

- `No such file or directory: tools/export-chorales.py`: Terminal isn't in
  the Cento folder. Repeat step 3.
- `.venv/bin/pip: No such file or directory`: step 4's first command didn't
  run, or ran in another folder. Repeat steps 3 and 4.
- `ModuleNotFoundError: No module named 'music21'`: you typed `python3`
  instead of `.venv/bin/python` in step 5.
- A few lines start with `skip`: those chorales can't be used (no four
  voices, or chords in one voice). That's expected.

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

Your working data (corpus, settings, Emily's taste and music, generated
music) lives in `~/Documents/cento/`, outside the repository.

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

The code: [MIT](LICENSE). The chorales in `corpus/`: CC BY 4.0, from the
Bach Chorales Figured Bass dataset ([corpus/README.md](corpus/README.md)).
