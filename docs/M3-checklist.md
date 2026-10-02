# M3 checklist: form

## Result: M3 passed (macOS, Max 9, Live 12)

| Check | Max version | Live version |
|---|---|---|
| **compose** gives a piece in the form of a named chorale, the same as in Node | ✅ | ✅ |
| The piano roll marks cadences; they line up with the template chorale's | ✅ | ✅ |
| The piece sounds phrased: it cadences where its template does, and ends properly | ✅ | ✅ (as clips) |
| **form** off composes as in M2 | ✅ | n/a (Max only) |
| 142 chorales, 100 seeds: every piece keeps its form; under 5% dead ends | ✅ (`tests/corpus.test.js`: 1) | |

The checklist below is kept as a record and for re-testing.

M2 chained beats with no plan, so its pieces wandered and cadenced anywhere.
M3 gives every piece the **form of a real chorale** (its *template*):

- The seed picks a chorale from the corpus. The new piece has exactly that
  chorale's length, bar layout, pickups and rests.
- Its phrases end where that chorale's phrases end. Each **cadence** (a
  fermata beat in the template) is filled with a cadence beat from some
  chorale, on the same bass note. No other beat may be a cadence.
- It starts with a chorale's opening beat and ends with a chorale's final
  beat.
- Voice-hooking, metre and the different-source rule still hold, as in M2.

**If the form can't be filled**, the rules relax one step at a time:

1. **Strict**: every beat joins the previous one exactly (L0, as in M2).
2. **Octave moves (L1)**: where no exact join exists, a beat may start on the
   same pitch classes with the same bass. Its upper voices then move by
   octaves, so each voice still starts exactly where the previous beat sent
   it, staying in range and without new voice crossings. The piano roll draws
   these seams in orange.
3. **Any cadence bass**: a cadence may stand on a different bass note than
   the template's.

Only if all three fail does the composer move on to another chorale's form.
That's a *dead end*.

**Already verified (CI runs the first three on every push):**

- Templates: metre, cadences and their bass notes, rests, first and last
  beats.
- On small made-up corpora: strict pieces follow their template exactly. A
  rest in the template is a rest in the piece. Where only octave moves can
  join two chorales, voices move and still join exactly.
- The engine bundle: **compose** reports the form, draws cadence marks, and
  **form 0** goes back to M2.
- On the full corpus (`tests/corpus.test.js`), 100 seeds:
  - Every piece keeps every rule.
  - 95 compose strictly, 3 need octave moves, and 2 need a cadence on
    another bass note.
  - 1 is a dead end and takes another chorale's form, against a limit of 5.
  - Pieces average 0.2 octave-moved beats. Composing takes 10–80 ms.
- With only 20 chorales, every seed now composes too, but almost every piece
  needs octave moves (about 12 per piece) and relaxed cadences. Use the full
  corpus.

**Not built:** composing backward from each cadence (PLAN.md, §4.6). The
forward search checks first which beats can still reach the template's next
cadence, so cadences already land where they should.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop. The corpus from M2 (all 142
chorales) is all M3 needs.

## 1. Max version (`patchers/ml_midi.maxpat`)

There's a new **form** toggle at the right end of the top row. It's on when
the patch opens.

1. [ ] Click **load corpus** and choose the `corpus` folder, as in M2:
       `corpus 142 chorales, 8578 beats, 18% dead ends`.
2. [ ] Click **compose** (seed 1). The status line should read
       `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 46 chorales`.
       Along the top of the piano roll, six small white triangles mark the
       cadences.
3. [ ] Play it (AU DLS Synth 1, **Play**). Listen for six phrases, each
       ending on a held chord, and a proper final cadence. Compare M2's
       wandering.
4. [ ] Now load the template itself: **load chorale**, `bwv248.12-2.mid`.
       Status: `bwv248.12-2 G major -> C major (+5) 4/4 17 bars 6 phrases
       queued`. Its six cadence triangles sit in the same places as the
       piece's. Play it: same phrase lengths and the same pickup, different
       music.
5. [ ] Back to composing: click **compose** again (seed 1 again): the same
       piece. Click **new** twice:
       - seed 2: `emi-2: form of bwv248.12-2, 6 phrases, 64 beats, 48 chorales`
         (the same form by chance, with different music);
       - seed 3: `emi-3: form of bwv260, 5 phrases, 56 beats, 36 chorales`.
6. [ ] Turn **form** off. Status: `free pieces (M2), 32+ beats`. Type `1`
       into the seed box and press Return: `emi-1: 36 beats from 29
       chorales`, the M2 piece. Its six triangles bunch up (beats 4, 6, 18,
       24, 26 and 34): borrowed cadence beats land wherever the chain put
       them. Turn **form** back on.
7. [ ] Optional: **export midi** as `emi-1-form` in `~/Documents/ml_midi/out/`.

## 2. Live version

1. [ ] Reopen the set. The brain device has the **form** toggle at the right
       end of its top row.
2. [ ] **load corpus**, then **compose** (seed 1): the same status line as
       Max step 2, and the same piano roll.
3. [ ] **writeclips**, then launch the clips (Play through voices off): the
       same piece as in Max. The clips are 17 bars long.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window.

Most of all, say how the pieces sound next to M2's. Do the phrases feel like
phrases? Do the cadences land? Is anything at the seams wrong, beyond what
M2 had?
