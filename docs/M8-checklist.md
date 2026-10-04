# M8 checklist: hardening

## Result: the Max version passed; waiting on the Live checks

Reported back: "M8.1 success, M8.2 success": the two corpora exported, and every step in the Max
version passed (macOS, Max 9). Still to come: the Live steps (section 3), which M11's Live
steps 2.2 and 2.3 also cover. The third listening test (seed 5, step 2.10) was taken off the
checklist: its score isn't needed.

| Check | Max version | Live version |
|---|---|---|
| Pieces stay under the quotation limits (16 notes of a voice, 8 beats in a row) | ✅ (`tests/corpus.test.js`, run locally) | ✅ (the same engine) |
| Parallel fifths and octaves are reported; none are new | ✅ (`tests/corpus.test.js`) | ✅ (the same engine) |
| The provenance view: hovering shows each beat's source; export writes a `.json` | ✅ | |
| Minor mode: a corpus of major and minor chorales composes each piece in one mode | ✅ | — (checked in Max; the same engine) |
| 3/4: pieces in 3/4 bars, played from a barline | ✅ | |
| A blind A/B listening test against real chorales | ❌ first test: 9 of 10 right (chance by guessing 0.011); retest after the changes below, 10 new chorales: 9 of 10 right again (0.011). Both taken by the developer, who knows Bach well; together 18 of 20 (0.0002). A third test (seed 5) was written and played, then taken off the checklist without a score. The goal stays open, as an aim for later rather than a gate | |
| Engine tests | ✅ (`npm test`) | ✅ |

M8 makes the composer harder to fool and easier to check.

### After the first listening test

The first test failed: Bach was picked out in 9 of 10 pairs, and the chance
of that by guessing is 0.011. Comparing pieces with their own templates
showed why. Beat to beat they matched Bach closely (melodic steps, leaps,
voice-leading). As whole pieces they didn't:

| | Bach | Pieces (first test) | Pieces now |
|---|---|---|---|
| Templates that repeat a melody phrase (the hymn tune's A A B bar form), and pieces that repeat it too | 77 of 142 chorales | none | 35 of the 42 pieces whose template repeats |
| Notes outside the key (modulations) | 4.5% | 2.2% | 3.0% |
| Soprano range | 12.3 semitones | 15.0 | 12.6 |
| Beats keeping their template beat's SPEAC label | | 56% | 62% |

Three changes, all in the composer:
- **Repeats.** Where the template repeats a phrase, the piece repeats its
  own composed phrase there. The search looks ahead so that the beat before
  the repeat leads exactly into it. A cadence just before a repeat is left
  free of signature blocks for this, so signatures now stand at 81% of
  cadences (91% before).
- **Modulations.** Each beat now knows its accidentals (an F# in C major,
  say) and its key area. The search scores a beat with its template beat's
  accidentals, and plans several beats ahead to reach it.
- **Range.** It also scores a soprano that stays within the template
  melody's range.

Each seed now adds a small random amount to each beat's score, so different
seeds still give different pieces. Streams also get the quotation guard,
checked over the last three phrases.

Every other measure holds:
- quotes of 16 notes at most;
- no new parallels (51 in 100 pieces, all Bach's own);
- 98 pieces in 100 with exact voice-leading;
- about 75 ms a piece.

Pieces have changed, so the status lines below are new.

**Quotation.** Recombination should make new music, not copy old music.
Two measures check each piece:
- the longest run of beats taken in order from one chorale;
- the longest run of notes in one voice (pitch and rhythm) that also occurs
  in that voice of a single chorale.

A piece over the limits (8 beats, 16 notes) is set aside, and the next
chorale's form is tried. Long quotes came from chorales whose tune Bach
harmonized more than once: their beats fit each other's forms well and
bring the melody back.

On the full corpus (100 pieces):
- the longest melody quote is 16 notes, with a median of 9;
- Bach's own chorales share a median of 9 notes with each other.

So pieces quote about as much as Bach quotes himself.

**Parallel fifths and octaves.** Every piece is checked for two voices
moving the same way from a perfect fifth (or octave) to another. Each one
found is compared with the source chorales:
- **grey caret:** Bach's own (the source has the same motion);
- **red caret:** new.

In 100 pieces there are 51, all of them Bach's own (he has 34 in his 142
chorales). Voice-hooking carries each seam's motion over from a source, so
recombination adds none. This is Cope's claim, now measured.

**The provenance view.** Hover over the piano roll. The beat under the
mouse lights up, and a box shows where it came from: the chorale, its bar
and beat, its SPEAC label, any octave moves, and whether it's part of a
signature block. **export midi** now also writes a `.json` next to the
`.mid` for a composed piece. It lists every beat's source, the quotation
measures and the parallels, so a piece can be traced later.

**Minor mode.** A corpus may now hold major and minor chorales together.
- Each piece is all major or all minor, in its template's mode, from that
  mode's chorales only.
- Signatures are found per mode.
- A stream keeps to the mode of the chorale it starts with.
- Single-mode corpora compose exactly as before.

**3/4.** The player now takes its bar length from the transport's time
signature. The engine sends each piece's meter to the host:
- **Max version:** sets its transport to that meter.
- **Live version:** sets the set's time signature, only when it differs.

Only 20 of Bach's major chorales are in 3/4, so a 3/4 corpus is small. Its
pieces need many more octave moves and relaxed cadences than the 4/4 ones,
and a stream may run out sooner.

**The blind listening test.** The **A/B** button writes a web page with 10
pairs.
- **Each pair:** one of Bach's chorales and a piece composed in that
  chorale's form, both in the chorale's own key.
- **Order:** Bach is A in half the pairs, in shuffled order.
- **On the page:** it plays each one with a small organ sound, takes a
  guess per pair, and at the end shows the score. It also gives the chance
  of doing that well by guessing.
- **Pass:** listeners can't pick Bach out more often than guessing would
  (a chance above 0.05).

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Export two more corpora (Terminal, about 10 minutes)

1. **Open Terminal**: press Cmd+Space, type `Terminal`, press Return.
2. **Go to the repo folder.** Type `cd` and a space (don't press Return
   yet), then drag the repo folder (the one with `PLAN.md` in it) from Finder
   into the Terminal window. Press Return.
3. **Major and minor together** (295 chorales, a few minutes):
   ```sh
   .venv/bin/python tools/export-chorales.py --mode any --out ~/Documents/cento/corpus-both
   ```
   It ends with `wrote 295 chorales to ...`.
4. **3/4** (20 major chorales, under a minute):
   ```sh
   .venv/bin/python tools/export-chorales.py --meter 3/4 --out ~/Documents/cento/corpus-3-4
   ```
   It ends with `wrote 20 chorales to ...`.

If Terminal says `No such file or directory` for `.venv/bin/python`, step 2
picked the wrong folder (see the M2 checklist for recreating `.venv`).

## 2. Max version (`patchers/cento.maxpat`)

1. [x] **Open the patch.** The corpus reloads as before:
       `corpus 142 chorales (major), 8578 beats, 18% dead ends, 76 signatures`.
       A new **A/B** button sits at the right end of the second row.
2. [x] **Quality in the Max window.** Turn **stream** off and set **seed** to 3:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 23 chorales, SPEAC 68%, 3 signatures`.
       The Max window (**Window ▸ Max Console**) now ends with one more line:
       ```
       emi-3: longest quote 10 notes (soprano, as in bwv260), 4 beats in a row from bwv245.14; no parallel 5ths or 8ves
       ```
3. [x] **Where each beat came from.** Move the mouse slowly over the piano
       roll. The beat under it lights up, and a dark box at the top names
       its source.
       - The first beat: `bwv322, bar 0 beat 4 · P`.
       - The second: `bwv260, bar 4 beat 1 · E`.
       - Over a gold band, the box adds `signature block`, and on its last
         beat the signature's name.
4. [x] **Parallels.** Set **seed** to 2. The Max window's last line ends
       with `parallel 5ths/8ves: 2, all Bach's own`. In the piano roll, two
       small grey carets sit just above the SPEAC lane, in bars 3 and 7.
       Grey means Bach wrote the same motion; none should be red.
5. [x] **Repeats.** Still on seed 2 (`form of bwv248.12-2`): its template
       repeats its first two phrases, and so does the piece. From the
       pickup on beat 4 of bar 5, the piano roll shows the same 16 beats as
       from beat 4 of bar 1. Hovering over a beat in bar 6 names the same
       source as the matching beat in bar 2.
6. [x] **Export with provenance.** Set **seed** back to 3. Click
       **export midi** and save as `emi-3` in `Documents/cento/out`.
       - The status line says `exported emi-3.mid and emi-3.json`.
       - Open `emi-3.json` in TextEdit. Near the bottom, under `"beats"`,
         each beat names its `"grouping"` (such as `"bwv322:3"`), its
         `"bar"`, `"beat"` and `"speac"`.
7. [x] **Major and minor together.** Click **load corpus** and choose
       `Documents/cento/corpus-both`:
       `corpus 295 chorales (142 major, 153 minor), 17746 beats, 14% dead ends, 154 signatures`.
       Then seeds 1 and 2:
       - `emi-1: form of bwv258 (A minor), 5 phrases, 56 beats, 31 chorales, SPEAC 89%, 3 signatures`
       - `emi-2: form of bwv45.7 (C major), 8 phrases, 64 beats, 30 chorales, SPEAC 68%, 8 signatures`

       Listen to seed 1: minor throughout. Then turn **stream** on, compose
       seed 1 and play a few phrases. Each status line names the key, e.g.
       `emi-1 stream: phrase 2 queued (bwv145-a phrase 2, C major, signature soprano 4-2-1)`,
       and every phrase stays in C major. Seed 2's stream stays in A minor.
       Turn **stream** off.
8. [x] **3/4.** **load corpus** `Documents/cento/corpus-3-4`:
       `corpus 20 chorales (major), 1522 beats, 48% dead ends, 41 signatures`.
       Seed 1: `emi-1: form of bwv194.12, 4 phrases, 49 beats, 10 chorales, SPEAC 47%, 2 signatures`.
       - The piano roll's bar lines are three beats apart.
       - Press Play: the piece starts on a barline and moves in three.
       - Seed 2 shows the small corpus at work: `(25 octave moves)` at the
         end of its status line.
9. [x] **Back to the main corpus.** **load corpus** `Documents/cento/corpus`
       and compose any seed: playback is in four again.
10. [x] **The listening test.** Set **seed** to 5 (so the pairs differ from
       the test you took), click **A/B** and save as `listening-test` in
       `Documents/cento`. The status line says
       `wrote listening-test.html: 10 pairs; open it in a web browser`.
       - Double-click the file in Finder: it opens in your browser. Play one
         pair to check the sound.
       - Best: ask one or two people who don't know which is which to take
         it. Otherwise take it yourself.
       - At the end, click **Show results**, then **Copy results**, and
         paste the text into your report.
       - *Taken off the checklist after it was written and played: its
         score isn't needed.*

## 3. Live version

1. [ ] **Reopen the set.** The brain's panel shows the **A/B** button, and the
       corpus status line is as in Max.
2. [ ] **Hover** over the piano roll in the brain: the same source box as in
       Max.
3. [ ] **3/4 in Live.** (Since M11, **load corpus** is the **corpora** window.)
       In the brain, click **corpora**. If `corpus-3-4` isn't listed, click
       **add folder** and choose it. Click **only** on its row, then compose
       seed 1. Live's time signature (top left of Live's window) changes to
       **3/4**. Play: the piece starts on a bar. **writeclips**, and play the
       clips.
4. [ ] **Back to 4/4.** In the corpus window, **only** on `corpus`, and compose:
       Live's time signature goes back to **4/4**.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix:
- the hover box (mouse tracking in `[v8ui]`);
- the time-signature switch in the Max transport and in Live.

The listening test (step 2.10) is off the checklist. Its "done when", a
score within what guessing gives (a chance above 0.05), stays an aim for
later.
