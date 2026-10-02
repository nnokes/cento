# M2 checklist: the first recombined chorales

## Result: M2 passed (macOS, Max 9, Live 12)

| Check | Max version | Live version |
|---|---|---|
| **load corpus**: `Folder` lists the corpus in `[v8]`; the folder dialog's path works | ✅ | ✅ |
| **compose** / **new** / seed box: the same seed gives the same piece as in Node | ✅ | ✅ |
| The piano roll draws chorales (by voice) and composed pieces (by source, with seams) | ✅ | ✅ |
| The composed piece plays: no broken voices at seams, ends on a cadence | ✅ | ✅ |
| **export midi**: `File` writes a `.mid` (Max), which plays in Live | ✅ | ✅ |
| **writeclips** writes a composed piece as clips | n/a | ✅ |
| Each voice plays on its own track (fixed and re-tested; see section 3) | n/a | ✅ |
| 142 chorales, 20 seeds: every piece keeps every rule | ✅ (`tests/corpus.test.js`) | |

The checklist below is kept as a record and for re-testing. One bug turned up
in Live (voices doubled onto the wrong tracks); section 3 describes it and its
fix.

M2 composes new chorales by EMI's simplest method, *naive recombination*:

- Every beat of every chorale (in C major) becomes a **grouping**: its notes,
  where in the bar it falls, and which pitches it starts on and leads to.
- A new piece is a chain of groupings. Each one must start exactly on the
  pitches the previous one led to in its own chorale (**voice-hooking**), fall
  on the right beat of the bar, and come from a **different chorale** than
  the beat before (a held chord may continue its own chorale).
- It starts on a beat that opened a chorale and ends on a chorale's final
  beat, after at least 32 beats.
- A seed picks among the choices, so the same seed and corpus always give the
  same piece.

**What to listen for.** Every voice moves exactly as it did in some Bach
chorale, so each step from beat to beat should sound like Bach, and no voice
should jump at a seam. But almost every beat comes from a different chorale,
and nothing plans phrases yet. Expect the harmony to wander, and cadences
(even fermata chords) to land in odd places mid-piece. Only the ending is
certain to be a final cadence. That is what M3 (form) fixes.

**Already verified (CI runs the first three on every push):**

- Segmenting: notes split at beat lines and joined back up, entry and
  destination pitches, beat in bar, openings, cadences and final beats.
- Composing from a small made-up corpus: the same seed gives the same piece,
  and `tests/piece-rules.js` checks every rule on every piece.
- The engine bundle in a simulated `[v8]`: reads a corpus folder, composes,
  queues and draws a piece, exports a `.mid` that reads back with identical
  notes, and writes clips. The piano roll bundle draws what it's sent.
- On the full corpus (all 142 major-key chorales in 4/4;
  `tests/corpus.test.js`, which runs where the corpus exists): every seed
  tried composes (50 seeds each at 16, 32 and 48 beats), and every piece
  keeps the rules. Reading the corpus takes about a quarter of a second in
  Node; composing takes a few milliseconds.

**Verified in Max and Live by these checks** (only simulated before):

- Max's `Folder` object listing files inside `[v8]`, and the path
  `[opendialog fold]` produces.
- Max's `File` object writing bytes, and the path `[savedialog]` produces.
- The piano roll in `[v8ui]` (Max's drawing calls, not the simulated ones).
- The wider panels: the Max patch and the Live device show the piano roll
  next to the controls.

---

## 0. Get the full corpus and the new code

1. Pull the latest code in GitHub Desktop.
2. Export **all** the chorales. The 20 from M1 are too few: with exact
   voice-hooking, only about 1 seed in 7 finds a 32-beat piece in them.
   With all 142, every seed tried works. (M3 adds looser matching, which
   helps small corpora.) Step by step:

   1. **Open Terminal**: press Cmd+Space, type `Terminal`, press Return.
   2. **Go to the repo folder.** Type `cd` and a space (don't press Return
      yet), then drag the repo folder (the one with `PLAN.md` and
      `patchers` in it) from Finder into the Terminal window. Its path
      appears after `cd `. Now press Return.
   3. **Check you're in the right place**:
      ```sh
      ls .venv/bin/python
      ```
      It should print `.venv/bin/python`. If it says
      `No such file or directory`, either step 2 picked the wrong folder,
      or the `.venv` from M1 is gone; then recreate it (about 300 MB, a few
      minutes):
      ```sh
      python3 -m venv .venv
      .venv/bin/pip install music21
      ```
   4. **Export**:
      ```sh
      .venv/bin/python tools/export-chorales.py --count 200
      ```
      It takes about half a minute. The first line is
      `Exporting to /Users/<your name>/Documents/ml_midi/corpus`, then one
      numbered line per chorale, then
      `wrote 142 chorales to …` and `only 142 chorales matched …`. That last
      line is expected: there are only 142, and `--count 200` asks for all
      of them. Your 20 chorales are rewritten unchanged; 122 are added.
   5. **Check the files**: in Finder, *Go → Go to Folder…*, paste
      `~/Documents/ml_midi/corpus` and press Return. You should see 284
      files: a `.mid` and a `.json` for each chorale.

   You can close Terminal afterwards; nothing needs to keep running.
3. Optional, in the same Terminal window: `npm test` now runs the corpus
   tests on all 142. All should pass, none skipped.

## 1. Max version (`patchers/ml_midi.maxpat`)

The window is wider now: the controls are on the left, the piano roll on the
right.

1. [ ] Click **load chorale** and pick `bwv347.mid`, as in M1. The piano roll
       shows it with notes colored by voice (soprano orange, alto blue, tenor
       green, bass yellow) and faint bar lines.
2. [ ] Click **load corpus**. In the dialog, go to `Documents/ml_midi`,
       select the `corpus` folder itself and click *Open* (or *Choose*). The
       status line should read
       `corpus 142 chorales, 8578 beats, 18% dead ends`.
3. [ ] Click **compose** (the seed box shows 1). The status line should read
       `emi-1: 36 beats from 29 chorales`, and the piano roll shows the piece
       in many colors (one per source chorale), with a bright line at each
       seam. These exact numbers mean Max composed the same piece the tests
       did in Node.
4. [ ] Choose **AU DLS Synth 1** under Output and turn on **Play**. The piece
       starts after three beats of silence (it opens with a pickup), lasts
       10 bars and ends on a cadence. Listen for voices jumping at seams:
       there should be none.
5. [ ] Click **new**. The seed goes to 2 and the status line should read
       `emi-2: 33 beats from 25 chorales`. Then type `1` into the seed box
       and press Return: the status line and the piano roll match step 3
       again.
6. [ ] Set **beats** to `16`. The status line should read
       `pieces of 16+ beats`. Click **compose**:
       `emi-1: 16 beats from 13 chorales`. Set **beats** back to `32`.
7. [ ] Click **export midi**. Save as `emi-1` in `~/Documents/ml_midi/out/`
       (in the dialog, make the `out` folder with *New Folder* if it isn't
       there). The status line should read `exported emi-1.mid`. Live step 5
       below plays this file in Live.

## 2. Live version

1. [ ] Reopen the set, so the devices reload. The brain device is wider now,
       with the piano roll on its right.
2. [ ] Click **load corpus** and choose `~/Documents/ml_midi/corpus` as in
       Max. Same status line: `corpus 142 chorales, 8578 beats, 18% dead ends`.
3. [ ] Click **compose** with seed 1. Same status line and piano roll as in
       Max: `emi-1: 36 beats from 29 chorales`.
4. [ ] Click **writeclips**. A 10-bar clip named `emi-1` should appear on
       each voice track, and the status line should read
       `wrote emi-1 to 4 voice tracks`. Launch the scene and listen as in
       Max step 4.
5. [ ] Drag `~/Documents/ml_midi/out/emi-1.mid` (exported in Max step 7)
       from Finder into Live, onto the empty area below the tracks. Give the
       new track(s) an instrument and play: it should be the same piece.
6. [ ] Click **export midi** in the device and save as `emi-1-live` in the
       same folder. The status line should read `exported emi-1-live.mid`.

---

## 3. Fixed after the Live checks: voices on the wrong tracks

**What happened.** With clips playing, the soprano and bass were also heard
on the tenor and alto tracks; bypassing the voice devices fixed it. Two things
combined:

- The brain's grid player plays the current piece through the voice devices
  whenever Live's transport runs, so launching the clips played every note
  twice: once from the clip, once from the brain.
- Each voice device chose its voice from its own **Voice** menu. Where a menu
  didn't match its track, the brain's copy of a voice went to the wrong track.

**The fix.**

- `emi.voice` has no menu any more. The **track's name** picks the voice
  (Soprano, Alto, Tenor or Bass; S/A/T/B also work), the same rule
  **writeclips** uses to find the tracks, and the device shows which voice it
  plays.
- `emi.brain` has a **Play through voices** toggle, off by default. Only with
  it on do the brain's notes reach the voice devices while the transport runs.
  Leave it off when you play clips.

**Re-test:**

1. [ ] Pull, then reopen the set. Each voice device shows its voice under
       *EMI voice*: `Soprano`, `Alto`, `Tenor`, `Bass`.
2. [ ] Rename the Tenor track to `Tenor 2`. Its device shows `no voice`.
       Rename it back: `Tenor` again.
3. [ ] Click **load corpus**, **compose** (seed 1) and **writeclips**. With
       **Play through voices** off, launch the new `emi-1` clips. Each part
       plays only on its own track (solo each track to check), the same as
       with the voice devices bypassed.
4. [ ] Stop the clips and Live. Turn **Play through voices** on and press
       Live's Play from bar 1, with no clips playing. The brain plays the
       current piece, and each voice is again on its own track.
5. [ ] While it plays, turn **Play through voices** off. Everything goes
       silent at once, with no hanging notes.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The new pieces most likely
to need a fix are:

- reading the folder (`load corpus`);
- writing the file (`export midi`);
- the piano roll: if it stays blank or grey, open the Max window and look for
  `v8ui` errors.

Also say how the pieces sound: whether anything at the seams sounds wrong,
beyond the wandering harmony described above.
