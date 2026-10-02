# M6 checklist: tension and SPEAC

## Result: waiting on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| Golden tests reproduce Cope's published analyses | ✅ (`tests/speac.test.js`) | |
| The piano roll shows a SPEAC lane, for chorales and for composed pieces | | |
| Pieces report how many of their template's labels they keep | | |
| Compose and streams still work as in M3–M5 (timing, voice-leading) | | |
| Engine tests | ✅ (`npm test`) | ✅ |

M6 gives every beat a musical *function*, as Cope's SPEAC does. Beats were
already matched by their notes; now their function counts too.

**Tension.** Every beat of every chorale gets a tension score, the sum of
four parts:
- **its chord:** the intervals above the bass, so dissonance scores higher;
- **its place in the bar:** beat 4, the upbeat, scores highest;
- **its length;**
- **how far its chord's root moved** from the previous beat.

**SPEAC labels.** Each beat is then labelled by its tension, compared with
the beats around it and its phrase's average:

| Label | Meaning | Lane color |
|---|---|---|
| **S** statement | about average tension | grey-blue |
| **P** preparation | close to the next beat: leads into it | green |
| **E** extension | close to the previous beat: continues it | dark grey |
| **A** antecedent | the phrase's high point: wants resolving | orange |
| **C** consequent | the resolution after an antecedent | blue |

There are three levels. The **beat** label compares a beat with the others
in its phrase. The **bar** label compares bars within the phrase. The
**phrase** label compares phrases within the chorale.

**Recombination by function.** A form's beats now ask for their template
beat's label as well as its notes: a preparation where the template
prepares, an antecedent where it builds up. The rules relax in this order:

1. Exact voice-hooking and exact labels.
2. Exact voice-hooking, with matching labels *preferred*: tried first, but
   not required. This is Cope's "soft constraint".
3. Octave moves.
4. Any cadence bass.

On the full corpus:
- 95 pieces in 100 keep exact voice-leading throughout, as before;
- 63% of beats keep their template beat's label, against 33% without SPEAC
  (and 47% against 20% for the directional labels P, A and C).

The status line reports each piece's share, e.g. `SPEAC 70%`. Streams use
the same rules for every phrase.

**The SPEAC lane** runs along the bottom of the piano roll: one colored
block per beat, with its letter when there's room.
- For a **chorale**, it shows the chorale's own analysis.
- For a **composed piece**, it shows the label each beat brings from its
  source chorale.

**Golden tests** (the milestone's "done when"):
- **The book's worked example** (ch. 7, eight beats), in CI. Every step
  matches the published values: the beats (including the two-chord beats
  with passing notes), the chord dissonances, the roots
  `45 57 64 57 62 55 57 50`, the tensions
  `0.56 0.41 0.78 0.51 1.33 0.51 1.26 0.51` and the labels `P E S E A C A C`.
- **Cope's analysis of Chopin's Mazurka Op. 33 No. 3**, all four levels: all
  six phrases' beat labels (102 labels), their averages, the middleground,
  background and top level all match exactly. The music isn't in this
  repository, so this test runs only with `EMI_SPEAC_REF` pointing to a
  clone of
  [GolzitskyNikolay/SPEAC-analysis](https://github.com/GolzitskyNikolay/SPEAC-analysis).
  It passed here.
- To match Cope's numbers exactly, the code follows his 32-bit arithmetic,
  his root finder and his rounding. His published averages turn out to be
  truncated, not rounded.

**Loading a corpus takes longer**: about half a second for 142 chorales,
since every beat is analysed.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

1. [ ] Open the patch. The corpus reloads. Check the Max window for red
       text.
2. [ ] **A chorale's lane.** Click **load chorale** and pick `bwv347.mid`.
       Along the bottom of the piano roll, a lane of colored blocks, one
       per beat, mostly dark grey (E) with greens (P) and grey-blues (S),
       and the odd orange (A). Widen the window if you want to read the
       letters.
3. [ ] **A composed piece.** Turn **stream** off, set **seed** to 1:
       `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 48 chorales, SPEAC 70%`.
       The lane shows the piece's labels. Then seeds 2, 3 and 4:
       - `emi-2: form of bwv248.12-2, 6 phrases, 64 beats, 44 chorales, SPEAC 61%`
       - `emi-3: form of bwv260, 5 phrases, 56 beats, 38 chorales, SPEAC 73%`
       - `emi-4: form of bwv117.4, 5 phrases, 56 beats, 46 chorales, SPEAC 52%`
4. [ ] **Listen** to a few seeds. The notes have changed since M5 (beats are
       now chosen by function too). Do phrases build and resolve more
       clearly than before?
5. [ ] **Streams still work.** Turn **stream** on, compose, and play a few
       phrases. Turn **stream** off again.

## 2. Live version

1. [ ] Reopen the set. **load chorale** `bwv347.mid`: the same lane as in
       Max.
2. [ ] Compose seed 3: the same status line as in Max. **writeclips**, and
       play the clips.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The new piece most likely
to need a fix is the lane's drawing (text and colors in `[v8ui]`).

Most of all, say how the pieces sound compared with M3–M5: is there more
sense of direction, of tension building to cadences and resolving?
