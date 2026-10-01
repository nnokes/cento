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

**Status: M0, setup and spikes.** The engine skeleton, both shells and the
tooling are in place. The Max and Live checks are listed in
[docs/M0-spikes.md](docs/M0-spikes.md). The full plan and milestones are in
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

```sh
git clone https://github.com/nnokes/ml_midi.git ~/Code/ml_midi
cd ~/Code/ml_midi

npm test          # engine tests
npm run hooks     # pre-commit check: no personal paths, bundles up to date

# Source corpus -> ~/Documents/ml_midi/corpus (outside the repo)
python3 -m venv .venv && .venv/bin/pip install music21
.venv/bin/python tools/export-chorales.py
```

Everything Max loads (patches, devices and the generated script bundles) is
in `patchers/`.

- **Max version:** no setup. Max searches the folder of the patch it opens,
  so just open `patchers/ml_midi.maxpat`.
- **Live version:** Live doesn't search a device's own folder, so link the repo
  into the Packages folder (the one where packages such as bach live), then
  restart Live:
  ```sh
  ln -s "$PWD" "$HOME/Documents/Max 9/Packages/ml_midi"
  ```

## Repository layout

```
patchers/     everything Max loads, in one folder:
              ml_midi.maxpat (Max version), emi.brain.amxd + emi.voice.amxd
              (Live version), emi.engine, emi.host.max, emi.host.live, and the
              generated *.bundle.js scripts (npm run build; committed)
code/         [v8] wrappers (*.v8.js): glue between Max messages and the engine
code/lib/     the engine: plain JavaScript, no Max APIs, tested in Node
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
