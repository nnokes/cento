# M1 checklist: reading the corpus

## Result: M1 passed (macOS, Max 9, Live 12)

| Check | Max version | Live version |
|---|---|---|
| **load chorale**: `File` reads the `.mid` and `.json` in `[v8]`; the file dialog's path works | ✅ | ✅ |
| Plays in C, and a minor third lower with **original key** | ✅ | ✅ |
| **writeclips** writes the chorale as clips on the voice tracks | n/a | ✅ |
| 20 chorales: MIDI → work → MIDI → work with identical notes | ✅ (`tests/corpus.test.js`) | |

The checklist below is kept as a record and for re-testing.

M1 reads chorale MIDI files into the engine, moves them to C major (or
A minor), and plays them back in both products. Live can also write them as
clips.

**Already verified (CI runs the first three on every push):**

- The MIDI reader and writer handle running status, note-on with velocity 0
  as note-off, tempo, meter, key signatures, and unfinished notes. Some tests
  use hand-made byte sequences.
- Keys: names (including music21's `B-` for B-flat), key signatures both ways,
  and transposition to C major / A minor by the shorter way (never more than
  a tritone).
- The player and clip-writer bundles load a chorale through a stand-in for
  Max's `File` object, and queue or write it in C and in the original key.
- On the 20 exported chorales (`tests/corpus.test.js`, which runs where the
  corpus exists):
  - MIDI → work → MIDI → work keeps identical notes.
  - Every chorale normalizes to C major and fits the 16th-note grid.
  - The key estimate (used only when a file has no `.json`) agrees with
    music21 on 16 of 20. Where they differ, it picks the key a fifth above.

**Not yet verified:**

- Max's `File` object reading the bytes inside `[v8]`.
- The path format `[opendialog]` produces, in Max and in Live.

---

## 0. Get the corpus and the new code

1. Pull the latest code in GitHub Desktop.
2. Export the corpus once. In Terminal, go to the repo folder first: type
   `cd ` (with a space), drag the repo folder from Finder into the window,
   and press Return. Then:
   ```sh
   python3 -m venv .venv                    # creates <repo>/.venv (git-ignored)
   .venv/bin/pip install music21            # installs into <repo>/.venv only, ~300 MB
   .venv/bin/python tools/export-chorales.py
   ```
   The script prints its output folder first and its file count last. It
   writes 20 chorales (`.mid` + `.json`) to `~/Documents/cento/corpus/`,
   which is `/Users/<your name>/Documents/cento/corpus/`. In Finder, use
   *Go → Go to Folder…* and paste `~/Documents/cento/corpus`.
3. Optional: `npm test` now also runs the four corpus tests against your
   corpus. All should pass, none skipped.

## 1. Max version (`patchers/cento.maxpat`)

1. [ ] Click **load chorale** and pick `bwv347.mid` from
       `~/Documents/cento/corpus/`. The status line should read
       `bwv347 A major -> C major (+3) 4/4 18 bars 6 phrases queued`.
2. [ ] Choose **AU DLS Synth 1** under Output and turn on **Play**. You should
       hear the chorale in C major. It starts after three beats of silence:
       bar 1 is padded so the pickup falls on beat 4.
3. [ ] Turn on **original key**. The status line should drop the `->` part.
       Play again: the same chorale, a minor third lower (A major).
4. [ ] Load two or three other chorales. Each should play in C, or in its
       own key with **original key** on.

## 2. Live version

1. [ ] Reload the devices (reopen the set), so they pick up the new panel.
       Click **load chorale** in the brain device and pick `bwv347.mid`.
2. [ ] Click **writeclips**. An 18-bar clip named `bwv347 in C` should appear
       on each voice track. Launch the scene.
3. [ ] Turn on **original key** and click **writeclips** again. New clips
       named `bwv347` should appear, in A major.
4. [ ] With the clips stopped, press Live's Play from bar 1. The loaded
       chorale plays through the four voice devices, just like the test
       pattern did in M0.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The new pieces most likely
to need a fix are reading the file in `[v8]` and the path format from the file
dialog.
