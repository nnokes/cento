# M10 checklist: Emily's memory and drift

## Result: waiting on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| Variants: **novelty** varies pieces and stream phrases; varied beats are marked and named | | |
| **accept** keeps a piece or a stream phrase as a work of her own | | |
| **mix**: later pieces use her music; mix 0 is Bach alone, exactly as before | | |
| Accepted variants appear in later output (the milestone's "done when") | ✅ simulated (`tests/corpus.test.js`, run locally) | |
| A rollback restores an earlier taste exactly (the "done when") | ✅ (`npm test`) | |
| The memory view in the pop-up window | | |
| A playhead in both piano rolls | | |
| Engine tests | ✅ (`npm test`) | ✅ |

M10 is the second part of Emily Howell. In M9 Emily learned what you like.
Now she keeps the music you accept, varies it with notes Bach never wrote,
and composes from Bach's chorales and her own music together. Over time
her style drifts away from Bach's.

**Variants.** Emily changes a few notes of a piece, one place per phrase at
most:
- **passing tone:** a third filled in with the step between;
- **neighbor tone:** a repeated note decorated with the step above or below;
- **chromatic passing tone:** a whole step filled in with the half step
  between;
- **anticipation:** at a cadence, the soprano's last note arrives an eighth
  early;
- **suspension:** a voice stepping down into a new chord is held over half a
  beat (a 4-3, 7-6 or 9-8 against the bass), then resolves;
- **simplified line:** two eighths become one quarter;
- **re-voiced chord:** the alto and tenor swap chord tones, an octave apart.

Each change is kept only if every voice stays in its range, no voices cross,
no leap is wider than an octave, and no parallel fifths or octaves appear.

**Novelty** (0 to 1) is the chance that each phrase gets a variant. At 1,
pieces get about 6 or 7; at 0.25, about 1 or 2. It starts at 0: until you
raise it, nothing changes.

**Accept** keeps what you hear as a work of her own: the beats you
selected, or else the stream phrase playing, or else the whole piece. Her
works join the corpus next to Bach's:
- their beats, including the notes she varied;
- the joins between their beats;
- their forms.

A work made partly from her own earlier works is a generation later.
Patterns that recur across her works but never in Bach's become her own
signatures.

**Mix** (0 to 0.75) sets how much her music counts against Bach's:
- **0.5:** as much as his;
- **above 0.5:** more;
- **below 0.5:** less;
- **0:** not at all. The corpus is then Bach's alone, and pieces are exactly
  as they were before she had music of her own.

The top is 0.75, so Bach always counts. The first **accept** sets mix to
0.5 if it was 0.

**Snapshots.** A snapshot is her whole taste at a moment:
- learned weights, pins and strength;
- ratings;
- novelty and mix;
- which of her works are in use.

One is kept when a session starts (if anything changed), whenever you ask,
and before every rollback, forget or recall. **Roll back** makes a snapshot
hers again, exactly. Her corpus comes back with it, so the same seed gives
the same piece. The last 30 snapshots are kept.

**Measured** on the full corpus (`tests/corpus.test.js`):
- **Novelty 1, 40 pieces:** about 6.5 variants a piece, and no new parallel
  fifths or octaves.
- **Five varied pieces accepted, then 20 new seeds:**
  - **mix 0.5:** 11% of beats are hers, and notes she varied appear in 11
    of the 20 pieces;
  - **mix 0.75:** 45% of beats are hers, and notes she varied appear in all
    20.

**Where it's kept** (`patchers/`, next to the taste file, both git-ignored):
- `ml_midi.emily.json`: every work ever accepted;
- `ml_midi.snapshots.json`: the snapshots.

Both products share them. The plan put these in `~/Documents/ml_midi/emily/`,
but Max can't create folders.

**Speed.** Each **accept** rebuilds the corpus with her new work, so Max
pauses for a second or two.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

Do steps 1 to 9 in one sitting, without closing the patch. The lines below
assume her taste starts empty, so step 2 puts yours aside first and step 9
brings it back.

1. [ ] **Open the patch.** The corpus reloads as before:
       `corpus 142 chorales (major), 8578 beats, 18% dead ends, 76 signatures`.
       On the **Emily** panel, **accept** has taken **forget**'s place.
       **forget** is now at the bottom of the pop-up window.
2. [ ] **Keep your taste, then start fresh.**
       1. Make sure **temp** reads `1.00`; drag slowly to set it exactly.
       2. Click **window**. At the bottom of the window, click
          **store taste** and save as `my-taste` in `Documents/ml_midi`:
          `stored Emily's taste in my-taste.json (... ratings)`.
       3. Click **forget**:
          `Emily forgot her taste (... ratings, kept in ml_midi.taste.backup.json)`.
3. [ ] **No novelty, no change.** Set **seed** to 3:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 23 chorales, SPEAC 68%, 3 signatures`,
       as in M8.
4. [ ] **Variants.**
       1. In the window, click **memory**. The pane shows **Emily's
          memory**, with **mix** and **novelty** sliders at the top right.
       2. Drag **novelty** to the right end:
          `novelty 1.00: a variant in every phrase (from the next piece or phrase)`.
       3. Click **compose** (seed 3):
          `emi-3: form of bwv260, 5 phrases, 56 beats, 23 chorales, SPEAC 68%, 3 signatures, 6 variants`.
          The Max window adds:
          ```
          emi-3: varied: anticipation (bar 3, soprano), simplified line (bar 4, alto), anticipation (bar 7, soprano), simplified line (bar 9, tenor), re-voiced chord (bar 11, alto), chromatic passing tone (bar 13, tenor)
          ```
       4. Look at the piano rolls: a purple dot sits above each varied
          beat. Hover over the first:
          `bwv245.14, bar 2 beat 2 · E · signature block · varied: anticipation`.
          Listen for the soprano arriving early at the cadence.
5. [ ] **Accept five pieces.** For each row, set **seed**, then click
       **accept**. Max pauses a moment each time.

       | Seed | Status line after **seed** | After **accept** |
       |---|---|---|
       | 1001 | `emi-1001: form of bwv376, 5 phrases, 40 beats, 24 chorales, SPEAC 55%, 5 signatures, 5 variants` | `accepted emi-1001 as emily-1 (generation 1, 40 beats, 5 varied); Emily has 1 work of her own` |
       | 1002 | `emi-1002: form of bwv373, 4 phrases, 60 beats, 41 chorales, SPEAC 75%, 3 signatures, 5 variants` | `accepted emi-1002 as emily-2 (generation 1, 60 beats, 5 varied); Emily has 2 works of her own` |
       | 1003 | `emi-1003: form of bwv427, 6 phrases, 56 beats, 35 chorales, SPEAC 65%, 5 signatures, 6 variants, 2 of Emily's own beats` | `accepted emi-1003 as emily-3 (generation 2, 56 beats, 6 varied); Emily has 3 works of her own` |
       | 1004 | `emi-1004: form of bwv36.4-2, 7 phrases, 80 beats, 45 chorales, SPEAC 82%, 7 signatures, 8 variants, 3 of Emily's own beats` | `accepted emi-1004 as emily-4 (generation 3, 80 beats, 8 varied); Emily has 4 works of her own` |
       | 1005 | `emi-1005: form of bwv248.12-2, 6 phrases, 64 beats, 34 chorales, SPEAC 77%, 4 signatures, 7 variants, 9 of Emily's own beats` | `accepted emi-1005 as emily-5 (generation 4, 64 beats, 7 varied); Emily has 5 works of her own` |

       From seed 1003 on, pieces already use some of her beats: the first
       **accept** set mix to 0.5. That's why the generations climb. After
       the fifth, the Max window says
       `ml_midi: Emily's own music: 5 works (generation 1: 2, generation 2: 1, generation 3: 1, generation 4: 1), 295 beats, 31 varied`.
       The memory view lists emily-5 to emily-1, each with **put aside**.
6. [ ] **Mix.** Drag **mix** to its right end:
       `mix 0.75: her own music counts more than Bach's (from the next piece or phrase)`.
       Then seeds 1 to 3:
       - `emi-1: form of bwv264, 5 phrases, 40 beats, 21 chorales, SPEAC 73%, 5 signatures, 5 variants, 9 of Emily's own beats`
       - `emi-2: form of bwv86.6, 5 phrases, 56 beats, 17 chorales, SPEAC 59%, 3 signatures, 6 variants, 31 of Emily's own beats`
       - `emi-3: form of bwv436, 7 phrases, 80 beats, 30 chorales, SPEAC 62%, 7 signatures, 8 variants, 28 of Emily's own beats (1 with her variants)`

       Seed 3 has a beat with notes she varied in an accepted piece: the
       "done when". Hover over beats in the roll. Hers read like
       `emily-4, bar 3 beat 2 · A · Emily's own, generation 3`. The one
       with her variant is
       `emily-4, bar 3 beat 1 · E · Emily's own, generation 3 (her chromatic passing tone)`.
7. [ ] **Snapshot and rollback.** This is the second "done when".
       1. In the memory view, click **keep a snapshot**:
          `snapshot #2 kept: 0 ratings, 5 works of her own`. (#1 is
          `session start`, your own taste, kept when the patch opened.)
       2. Set **seed** to 1006 and click **accept**:
          `accepted emi-1006 as emily-6 (generation 5, 76 beats, 7 varied); Emily has 6 works of her own`.
       3. Seed 3 is now a different piece:
          `emi-3: form of bwv370, 4 phrases, 32 beats, 16 chorales, SPEAC 44%, 4 signatures, 4 variants, 16 of Emily's own beats (1 with her variants)`.
       4. Click **roll back** on snapshot #2:
          `rolled back to snapshot #2 (<today's date and time>): 0 ratings, 5 works of her own; what was before is snapshot #3`.
       5. Compose seed 3 again. It is exactly step 6's piece:
          `emi-3: form of bwv436, 7 phrases, 80 beats, 30 chorales, SPEAC 62%, 7 signatures, 8 variants, 28 of Emily's own beats (1 with her variants)`.

       (Snapshot numbers are higher if you've opened the patch more than
       once since pulling this code, or rated something before step 2.)
8. [ ] **Bach alone again.** Drag **mix** and **novelty** to their left ends
       (`mix 0.00: Bach only ...`, `novelty 0.00: no variants ...`).
       Compose seed 3: `emi-3: form of bwv260, 5 phrases, 56 beats, 23 chorales, SPEAC 68%, 3 signatures`,
       step 3's line exactly.
9. [ ] **Your taste back.** Click **recall taste** and choose
       `my-taste.json`:
       `recalled Emily's taste from my-taste.json (... ratings); the one before is in ml_midi.taste.backup.json`.
       Your taste comes back as you stored it, before she had music of her
       own, so her works aren't in use in it. The memory view shows
       snapshot #4, `before recalling my-taste.json`. Roll back to it to
       return to the checklist's state, with her six works.

10. [ ] **The playhead.** Press **Play**. A pale yellow line moves across
       the piano roll, and across the pop-up window's large roll, with the
       music. It lines up with the notes sounding.
       - Compose another seed while playing: the line disappears until the
         new piece starts on the next barline, then runs from its start.
       - In a stream, it follows each phrase as the roll moves on.
       - Turn **Play** off: the line goes.
11. [ ] **No false start.** Turn **Play** off, compose a seed, and turn
       **Play** on. The piece starts on the next barline and plays straight
       through: it never plays its first chords and then goes back to the
       beginning. Do this five times, with **stream** off and on. If you use
       Ableton Link (the Link button in Max's Global Transport window), do it
       once with Link on too: the piece still plays straight on, though Link
       may move it off the barline by a little.
12. [ ] **Hover help.** Rest the mouse on any control for a moment: a
       yellow hint says what it does. Try **taste** in the Emily panel:
       `Report Emily's taste: ...`. With **Window > Clue Window** open, the
       same text appears there as you move over controls. In the pop-up
       window, click **edit weights** and rest on a slider (say,
       *suspensions*): a box beside it says what the feature means and how to
       pin it. Click **memory** and rest on **mix**, **novelty**, **put
       aside** and **roll back**: each explains itself.
       [docs/controls.md](controls.md) has every control's text.

## 2. Live version

1. [ ] **Reopen the set.** The brain's **Emily** panel has **accept**. Its
       pop-up window's memory view shows the same works and snapshots: the
       files are shared.
2. [ ] **Accept a stream phrase.**
       1. Set **novelty** to about 0.5 and **mix** to 0.5.
       2. Turn **stream** on and press Play.
       3. During the third phrase, click **accept**:
          `accepted phrase 3 of emi-<seed> as emily-N (generation ..., ... beats...)`.
3. [ ] **Map accept.** Press Cmd+K, click **accept**, press `A`, then Cmd+K
       again. While the stream plays, press `A`: the phrase is kept.
4. [ ] **The playhead in Live.** Press Play in Live: the line moves across
       the brain's piano roll (and the pop-up window's), following Live's
       transport; stop Live and it goes.
5. [ ] **No false start in Live.** Stop Live, return to bar 1, and press
       Play, five times, with **stream** off and on. Each time the piece
       starts on bar 1 and plays straight through, without going back to its
       beginning after the first chords. Move Live's playhead while it plays:
       the piece plays on from where it was.
6. [ ] **Hover help in Live.** Open the Info View (**View > Info**, or the
       **?** at the bottom left). Move the mouse over the brain's controls
       (**writeclips**, **Play Through Voices**, **like**, **temp**, ...) and
       the emi.voice device's voice name: the Info View names each and says
       what it does. In the pop-up window, the taste pane's sliders and
       buttons show their help in a box, as in Max.
7. [ ] **Back in Max.** Close Live, open `ml_midi.maxpat`, and open the
       memory view: the phrase accepted in Live is listed.

## 3. Your own Emily

1. [ ] With your own taste back (step 1.9), set **novelty** to about 0.25
       and **mix** to 0.5.
2. [ ] Over a few sessions, **accept** the pieces and phrases you like, and
       rate as before.
3. [ ] Listen to how later pieces change. Open the memory view now and then.
       If she drifts somewhere you don't like, roll back.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix:
- the memory view's buttons and sliders (mouse handling in `[v8ui]`);
- how long **accept** pauses Max (tell me roughly how many seconds);
- whether Live finds the new files (`emily-vary`, `emily-memory` are inside
  the bundles; nothing new to add to the search path).

For step 3, tell me in a sentence or two how her pieces sound after a few
sessions: closer to what you like, further from Bach, or neither.
