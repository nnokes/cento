# M7 checklist: signatures

## Result: waiting on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| Bach's cadence formulas are found as signatures (bass 4-5-1 and soprano 3-2-1 among the strongest) | ✅ (`tests/corpus.test.js`, run locally) | |
| The Max window lists the corpus's signatures, and where each piece keeps them | | |
| Pieces keep signature blocks at their cadences, shown as gold bands | | |
| With **sigs** off, pieces are exactly as in M6 | ✅ (`tests/signatures.test.js`) | |
| Streams keep signatures at their phrases' cadences | | |
| Engine tests | ✅ (`npm test`) | ✅ |

**Signatures** are Cope's name for the short melodic patterns that recur
across many works of one composer and mark the style. A listener hears them
as "this sounds like Bach". In the chorales they are mostly the ways voices
move into a cadence.

**Finding them.** When a corpus loads, the engine looks at the last three
notes of each voice going into every cadence (fermata) chord. It compares
these as intervals, so the same pattern counts in any key. A pattern that
ends cadences in at least 5% of the chorales (and in at least 3) is a
signature.

On the 142 major chorales there are 76. The strongest are:

| Signature | Found in |
|---|---|
| bass 4-5-1 | 99 chorales |
| alto 1-7-5 | 96 chorales |
| tenor 5-4-3 | 94 chorales |
| soprano 3-2-1 | 92 chorales |

Numbers are scale degrees, so soprano 3-2-1 in C is E-D-C. On the 153 minor
chorales, soprano b3-2-1 and bass 4-5-1 come first. Patterns of one repeated
note don't count.

**Keeping them.** At every cadence of a piece, the composer tries to place a
whole **signature block**: the beats of a real chorale from the pattern's
first note to its cadence chord, usually 2 or 3 beats, kept as they are.
- Inside a block, the different-source rule and the SPEAC labels don't
  apply: the block is one chorale's music, untouched.
- Blocks must carry a soprano or bass signature, since those are what you
  hear.
- Blocks come from a chorale other than the template's.

**Lookahead hooking.** The beat before a block must lead exactly into the
block's first beat. So the search looks ahead: before choosing each beat, it
knows how many blocks can still be placed after it, and takes the beats that
leave room for the most.

**Which block.** Blocks with one of the strongest soprano or bass formulas
are preferred: those found in at least half as many chorales as the
strongest signature. On the major chorales these are bass 4-5-1, soprano
3-2-1 and bass 5-5-1. Pieces then use Bach's formulas about as often as he
does:

| | Pieces | Bach's chorales |
|---|---|---|
| soprano 3-2-1 | 18% of cadences | 20% |
| bass 4-5-1 | 18% of cadences | 21% |
| soprano b3-2-1 (minor) | 19% of cadences | 19% |
| bass 4-5-1 (minor) | 15% of cadences | 22% |

Other blocks are kept as short as possible, leaving the rest to
recombination.

On the full corpus (100 seeds):
- 91% of cadences get a signature block, and 27% of beats come from blocks.
- Voice-leading improves: 15 octave-moved beats in 100 pieces, down from 77
  without signatures.
- 56% of beats keep their template beat's SPEAC label, down from 62%: a
  block keeps its own labels.
- Strict SPEAC labels give way to signatures. When requiring every label
  would leave out a block that preferring labels allows, labels are only
  preferred.
- Streams place a block at 76% of phrase cadences.
- Composing takes about 40 ms a piece.

**On screen.**
- The status line counts each piece's signatures, e.g. `6 signatures`.
- The piano roll shows each block as a **gold band** behind the notes,
  named after its strongest soprano or bass signature (shortened to `S 3-2-1`
  or `B 4-5-1` where the band is narrow).
- The Max window lists the corpus's strongest signatures when it loads, and
  one line per block whenever a piece is composed.
- The new **sigs** toggle (bottom row, right) turns signatures off. A piece
  is then exactly what M6 composed for that seed.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

1. [ ] **Open the patch.** The corpus reloads, and the status line ends with
       the signature count:
       `corpus 142 chorales (major), 8578 beats, 18% dead ends, 76 signatures`.
       Open the Max window (**Window ▸ Max Console**). It lists them:
       ```
       ml_midi: 76 signatures in 142 chorales, strongest first (in how many chorales):
         sig1: bass 4-5-1 (99)
         sig2: alto 1-7-5 (96)
         sig3: tenor 5-4-3 (94)
         sig4: soprano 3-2-1 (92)
         ...
       ```
2. [ ] **The new toggle.** **sigs** sits at the right end of the bottom row
       (after **transp.**). It is on (lit).
3. [ ] **A piece with signatures.** Turn **stream** off and set **seed** to 3:
       ```
       emi-3: form of bwv260, 5 phrases, 56 beats, 37 chorales, SPEAC 61%, 4 signatures
       ```
       - The piano roll shows four gold bands, each ending on a cadence's
         triangle. Widen the window to read their names.
       - The Max window shows one line per band:
         ```
         emi-3: soprano 3-4-5 at the cadence in bar 3 (beat 3), from bwv245.14
         emi-3: bass 4-5-1 + soprano 3-2-1 at the cadence in bar 5 (beat 3), from bwv300
         emi-3: soprano 5-4-3 at the cadence in bar 9 (beat 3), from bwv376
         emi-3: soprano 1-2-1 at the cadence in bar 11 (beat 3), from bwv39.7
         ```
4. [ ] **Listen** to seed 3, especially the cadence in bar 5: Bach's
       commonest cadence, both outer voices at once. Then seeds 1, 2 and 4:
       - `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 40 chorales, SPEAC 52%, 6 signatures`
       - `emi-2: form of bwv248.12-2, 6 phrases, 64 beats, 44 chorales, SPEAC 55%, 6 signatures`
       - `emi-4: form of bwv117.4, 5 phrases, 56 beats, 39 chorales, SPEAC 46%, 5 signatures`
5. [ ] **Signatures off.** Turn **sigs** off. The status line says
       `no signatures (as in M6)`. Click **compose** with seed 1. This is M6's
       piece (the same as in the M6 checklist), with no bands:
       ```
       emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 48 chorales, SPEAC 70%, 0 signatures
       ```
       Compare its cadences with the version with signatures. Leave **sigs**
       off for the next step.
6. [ ] **It's remembered.** Close the patch and open it again: **sigs** is
       still off. Turn it back on.
7. [ ] **Streams.** Turn **stream** on, set **phrases** to 0 (endless) and
       **seed** to 1, click **compose** and play. The status line names each
       phrase's signature, e.g.
       `emi-1 stream: phrase 2 queued (bwv389 phrase 2, signature soprano 3-2-1)`.
       Gold bands appear as phrases are added. Turn **stream** off again.

## 2. Live version

1. [ ] **Reopen the set.** The brain's panel shows **sigs** on, and the
       corpus status line ends with `76 signatures`. The Max window list is
       only visible with the device open in the Max editor, so step 1.1
       covers it.
2. [ ] **Seed 3.** Compose seed 3: the same status line as in Max, and the
       same four gold bands. **writeclips**, and play the clips: the cadence
       in bar 5 as in Max.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix are the gold bands (drawing in `[v8ui]`) and the new **sigs**
toggle in the Live device.

Most of all, say how the cadences sound compared with M6: do they sound
more like Bach's?
