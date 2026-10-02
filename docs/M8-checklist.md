# M8 checklist: hardening

## Result: waiting on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| Pieces stay under the quotation limits (16 notes of a voice, 8 beats in a row) | ✅ (`tests/corpus.test.js`, run locally) | ✅ (the same engine) |
| Parallel fifths and octaves are reported; none are new | ✅ (`tests/corpus.test.js`) | ✅ (the same engine) |
| The provenance view: hovering shows each beat's source; export writes a `.json` | | |
| Minor mode: a corpus of major and minor chorales composes each piece in one mode | | |
| 3/4: pieces in 3/4 bars, played from a barline | | |
| A blind A/B listening test against real chorales | | |
| Engine tests | ✅ (`npm test`) | ✅ |

M8 makes the composer harder to fool and easier to check.

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
- the longest melody quote is 14 notes, with a median of 9;
- Bach's own chorales share a median of 9 notes with each other.

So pieces quote about as much as Bach quotes himself.

**Parallel fifths and octaves.** Every piece is checked for two voices
moving the same way from a perfect fifth (or octave) to another. Each one
found is compared with the source chorales:
- **grey caret:** Bach's own (the source has the same motion);
- **red caret:** new.

In 100 pieces there are 37, all of them Bach's own (he has 34 in his 142
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
   .venv/bin/python tools/export-chorales.py --mode any --out ~/Documents/ml_midi/corpus-both
   ```
   It ends with `wrote 295 chorales to ...`.
4. **3/4** (20 major chorales, under a minute):
   ```sh
   .venv/bin/python tools/export-chorales.py --meter 3/4 --out ~/Documents/ml_midi/corpus-3-4
   ```
   It ends with `wrote 20 chorales to ...`.

If Terminal says `No such file or directory` for `.venv/bin/python`, step 2
picked the wrong folder (see the M2 checklist for recreating `.venv`).

## 2. Max version (`patchers/ml_midi.maxpat`)

1. [ ] **Open the patch.** The corpus reloads as before:
       `corpus 142 chorales (major), 8578 beats, 18% dead ends, 76 signatures`.
       A new **A/B** button sits at the right end of the second row.
2. [ ] **Quality in the Max window.** Turn **stream** off and set **seed** to 3.
       The status line is unchanged since M7:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 37 chorales, SPEAC 61%, 4 signatures`.
       The Max window (**Window ▸ Max Console**) now ends with one more line:
       ```
       emi-3: longest quote 9 notes (alto, as in bwv154.3), 4 beats in a row from bwv300; no parallel 5ths or 8ves
       ```
3. [ ] **Where each beat came from.** Move the mouse slowly over the piano
       roll. The beat under it lights up, and a dark box at the top names
       its source.
       - The first beat: `bwv307, bar 0 beat 4 · P`.
       - The second: `bwv389, bar 4 beat 1 · A`.
       - Over a gold band, the box adds `signature block`, and on its last
         beat the signature's name.
4. [ ] **Parallels.** Set **seed** to 2. The Max window's last line ends
       with `parallel 5ths/8ves: 1, all Bach's own`. In the piano roll, a
       small grey caret sits just above the SPEAC lane in bar 12. Grey
       means Bach wrote the same motion; none should be red.
5. [ ] **Export with provenance.** Set **seed** back to 3. Click
       **export midi** and save as `emi-3` in `Documents/ml_midi/out`.
       - The status line says `exported emi-3.mid and emi-3.json`.
       - Open `emi-3.json` in TextEdit. Near the bottom, under `"beats"`,
         each beat names its `"grouping"` (such as `"bwv307:3"`), its
         `"bar"`, `"beat"` and `"speac"`.
6. [ ] **Major and minor together.** Click **load corpus** and choose
       `Documents/ml_midi/corpus-both`:
       `corpus 295 chorales (142 major, 153 minor), 17746 beats, 14% dead ends, 154 signatures`.
       Then seeds 1 and 2:
       - `emi-1: form of bwv258 (A minor), 5 phrases, 56 beats, 33 chorales, SPEAC 80%, 5 signatures`
       - `emi-2: form of bwv45.7 (C major), 8 phrases, 64 beats, 33 chorales, SPEAC 68%, 7 signatures`

       Listen to seed 1: minor throughout. Then turn **stream** on, compose
       seed 1 and play a few phrases. Each status line names the key, e.g.
       `emi-1 stream: phrase 2 queued (bwv145-a phrase 2, C major, signature bass 5-5-1)`,
       and every phrase stays in C major. Seed 2's stream stays in A minor.
       Turn **stream** off.
7. [ ] **3/4.** **load corpus** `Documents/ml_midi/corpus-3-4`:
       `corpus 20 chorales (major), 1522 beats, 48% dead ends, 41 signatures`.
       Seed 1: `emi-1: form of bwv194.12, 4 phrases, 49 beats, 11 chorales, SPEAC 41%, 3 signatures`.
       - The piano roll's bar lines are three beats apart.
       - Press Play: the piece starts on a barline and moves in three.
       - Seed 2 shows the small corpus at work: `(19 octave moves)` at the
         end of its status line.
8. [ ] **Back to the main corpus.** **load corpus** `Documents/ml_midi/corpus`
       and compose any seed: playback is in four again.
9. [ ] **The listening test.** Click **A/B** and save as `listening-test` in
       `Documents/ml_midi`. The status line says
       `wrote listening-test.html: 10 pairs; open it in a web browser`.
       - Double-click the file in Finder: it opens in your browser. Play one
         pair to check the sound.
       - Best: ask one or two people who don't know which is which to take
         it. Otherwise take it yourself.
       - At the end, click **Show results**, then **Copy results**, and
         paste the text into your report.

## 3. Live version

1. [ ] **Reopen the set.** The brain's panel shows the **A/B** button, and the
       corpus status line is as in Max.
2. [ ] **Hover** over the piano roll in the brain: the same source box as in
       Max.
3. [ ] **3/4 in Live.** In the brain, **load corpus** `corpus-3-4` and compose
       seed 1. Live's time signature (top left of Live's window) changes to
       **3/4**. Play: the piece starts on a bar. **writeclips**, and play the
       clips.
4. [ ] **Back to 4/4.** **load corpus** `corpus` and compose: Live's time
       signature goes back to **4/4**.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix:
- the hover box (mouse tracking in `[v8ui]`);
- the time-signature switch in the Max transport and in Live.

For the listening test, paste the copied results and say who took it. The
milestone's "done when" is a score within what guessing gives (a chance
above 0.05).
