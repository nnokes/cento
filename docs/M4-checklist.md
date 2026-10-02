# M4 checklist: both products, offline

## Result: M4 passed (macOS, Max 9, Live 12)

| Check | Max version | Live version |
|---|---|---|
| The new layout loads: host panel, shared panel and piano roll, with no red text | ✅ | ✅ |
| Settings survive a reload | ✅ | ✅ |
| The last corpus reloads by itself, and the seed's piece comes back with the same notes | ✅ | ✅ |
| **clips on compose** writes S/A/T/B clips with every compose | n/a | ✅ |
| Compose and hear it (export unchanged since M2) | ✅ | ✅ (as clips) |
| Engine and patch tests | ✅ (`npm test`) | ✅ |

The checklist below is kept as a record and for re-testing. The generated
`live.numbox` and `live.text` objects, Live restoring parameters inside the
device's panels, and the engine finding its own folder all work in Max 9 and
Live 12.

M4 makes the two products behave the same way offline, and remember their
settings.

**One shared panel.** The composing controls now live in one panel,
`emi.panel`, which both products show. Each window has three parts:

| Part | Max version (`ml_midi.maxpat`) | Live version (`emi.brain`) |
|---|---|---|
| **Left: host panel** | **Play**, **BPM**, **Output**, **vst~ instead**, plug/open 1–4 | **writeclips**, **testclip**, **clips on compose**, **play through voices**, **all voices on this track** |
| **Middle: shared panel** | the same in both: **load chorale**, **original key**, **pattern**, **clear**, **load corpus**, **form**, **beats**, **compose**, **seed**, **next**, **export midi**, and the status line | |
| **Right** | the piano roll | the piano roll |

Two controls behave differently from M3:

- **next** replaces **new**: it adds 1 to the seed and composes.
- **compose** composes the seed shown in the box. Changing the seed composes
  straight away, as before.

**Settings survive a reload.**

- **Live** saves the device's settings with the set, like any Live device:
  seed, beats, form, original key, clips on compose, play through voices and
  all voices on this track.
- **Max version** remembers the same composing settings, plus BPM, Output and
  vst~ instead, in a small file: `patchers/ml_midi.settings.json`. It's
  rewritten on every change and read when the patch opens. Git ignores it,
  because it holds your own paths.
- **Both** remember the last corpus in that file. When a patch or set opens,
  the corpus reloads by itself and the current seed is composed again. That
  brings back the same piece, with the same notes. The Live version never
  writes clips at startup.

**Already verified** (CI runs these on every push):

- Engine: nothing is saved before startup has read the file, so values
  arriving while a patch loads can't overwrite it.
  - The Max version restores every setting, reloads the corpus and composes.
  - The Live version keeps the set's values and only reloads the corpus.
  - A missing corpus is reported, not fatal.
  - **clips on compose** writes four clips per compose, and none at startup.
- Patches: each saved control sends its message and shows restored values
  without sending them back. Parameter names are unique in each product.
  Startup runs after everything has loaded. The device is exactly as wide as
  its three panels (846 px).

**Not yet verified** (new to Max):

- The generated `live.numbox` and `live.text` objects, in Max and in Live.
- The engine finding its own folder (`this.patcher.filepath`) and writing
  the settings file there.
- Live restoring the parameters inside the device's panels.

**Not built** (see PLAN.md):

- `[seq]` audition: the grid player already plays the current piece.
- Several named presets in the Max version: it remembers one state.
- `[vst~]` plugin choices: choose them again with **plug 1–4** after
  reopening.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

1. [ ] Open `patchers/ml_midi.maxpat`. The window shows three panels side by
       side: the Max controls, the shared panel, the piano roll. Check the
       Max window for red text.
2. [ ] Choose **AU DLS Synth 1** under **Output** and set **BPM** to `90`.
       Click **load corpus** and choose the `corpus` folder:
       `corpus 142 chorales, 8578 beats, 18% dead ends`.
3. [ ] Click **compose** (seed 1):
       `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 46 chorales`.
       Then click **next** three times. The seed box counts up to 4, and the
       last status is
       `emi-4: form of bwv117.4, 5 phrases, 56 beats, 45 chorales`.
4. [ ] Close the patch. If Max asks to save changes, click **Don't Save**.
       Open it again. Without clicking anything:
       - **Output** shows AU DLS Synth 1, **BPM** shows 90, and **seed**
         shows 4;
       - the status line reads
         `emi-4: form of bwv117.4, 5 phrases, 56 beats, 45 chorales`;
       - the piano roll shows the piece.

       Turn on **Play**: it's the same piece as before.
5. [ ] Turn **form** off: `free pieces (M2), 32+ beats`. Close and reopen.
       **form** is still off, and the status line reads
       `emi-4: 35 beats from 29 chorales`. Turn **form** back on.
6. [ ] Optional: in Finder, open the repo's `patchers` folder. You'll see
       `ml_midi.settings.json`, with your corpus folder, the seed and the
       other settings.

## 2. Live version

1. [ ] Reopen the set, so the devices reload. The brain device is wider
       (846 px): the Live controls, the shared panel, the piano roll. Within
       a second or two, without any clicks, the status line reads
       `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 46 chorales`. The
       corpus came from the settings file. The seed is 1 because this set
       hasn't saved a seed yet.
2. [ ] Click the **seed** box, type `3` and press Return:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 36 chorales`.
3. [ ] Turn on **clips on compose**, then click **next**. Clips named
       `emi-4` appear on the four voice tracks, and the status line ends
       with `; wrote emi-4 to 4 voice tracks`. Launch them, with
       **play through voices** off.
4. [ ] Save the set (Cmd+S) and reopen it (*File → Open Recent Set*). Without
       any clicks:
       - **seed** shows 4 and **clips on compose** is still on;
       - the status line reads
         `emi-4: form of bwv117.4, 5 phrases, 56 beats, 45 chorales`;
       - no new clips were written.
5. [ ] Turn **clips on compose** off again, and save the set if you like.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix are:

- the new `live.numbox` and `live.text` objects;
- the settings file: if the status line says `this patch has no folder`, or
  nothing comes back after reopening, the engine couldn't find its folder.
