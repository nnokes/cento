# M5 checklist: streaming

## Result: M5 passed (macOS, Max 9, Live 12)

| Check | Max version | Live version |
|---|---|---|
| A piece starts on the next barline after Play, wherever the playhead is | ✅ | ✅ (bars 1 and 9, with the metronome) |
| Composing while playing: the old piece stops cleanly, the new one starts on the next bar | ✅ | ✅ |
| A stream of 8 phrases plays through and ends on a final cadence | ✅ | ✅ (4 phrases) |
| An endless stream keeps going; transpose is heard from the next phrase | ✅ | ✅ (endless; transpose checked in Max) |
| No stuck or dropped notes at 60–160 BPM, through stop/start and tempo changes | ✅ | ✅ |
| Engine, stream and patch tests | ✅ (`npm test`) | ✅ |

The checklist below is kept as a record and for re-testing. The player
reading `[transport]` works in Max 9 and inside Live 12, where it follows
Live's song position.

M5 changes how the player and the composer work together.

**The player follows the transport's position.** Until now, the grid player
counted 16ths from the moment Play was pressed. Now it reads the transport's
bar, beat and position on every 16th:

- A piece starts on the **next barline** after Play: at bar 1 if you start
  there, at bar 9 if you start at bar 9.
- **Composing while playing** sends note-offs for anything sounding. The new
  music starts at the bar after the current one.
- **Moving the playhead while playing** (a jump) also sends note-offs first.
  (Changed after M10: a playing piece now plays straight on through a jump;
  see the M10 checklist, step 1.11.)
- Only 4/4 for now: the player counts 16 steps a bar.

**Streaming.** Turn on **stream** and **compose** starts a *stream*. The
piece is composed one phrase at a time, as it plays.

- It follows one chorale's phrases in order (the same phrase lengths and
  cadences), then moves on to another chorale's. Every phrase joins the last
  one by voice-hooking, as beats do.
- Two phrases are queued at the start. When the second one starts playing,
  the next is composed and queued, and so on. The status line counts
  phrases as they are queued.
- **phrases** sets the length: after that many phrases, the stream ends on
  a chorale's final cadence. 0 means endless.
- Where no phrase can follow, the stream takes a *breath*: one silent beat,
  then a fresh phrase. On the full corpus that's about 1 phrase join in 25.
- **transpose** (−12 to +12): for a stream, it applies from the next phrase
  composed. That is heard after the phrase already queued, so within about
  two phrases. For a whole piece, it applies at once (the piece restarts on
  the next bar).
- Stop and Play again: the stream starts over from its first phrase on the
  next bar (the same notes), then carries on composing past where it was.
- **seed**, **compose** and **next** start a new stream.
- **clips on compose** doesn't apply to streams. Use **writeclips** for the
  phrases queued so far.

The panel has a new bottom row: **stream**, **phrases**, **transp.**. The
status line is shorter. Like the other controls, the new ones are saved
with the Live set and remembered by the Max version.

**Minor keys.** All 153 minor chorales in 4/4 work as a corpus of their own
(see the README). Composed pieces are labelled A minor.

**Already verified** (CI runs these on every push):

- Streams on small made-up corpora:
  - phrases join, and follow a chorale's phrases in order;
  - gaps become silent beats;
  - the last phrase ends the piece;
  - the same seed gives the same phrases, and a new seed is heard from the
    next phrase;
  - a failed phrase leaves the stream unchanged.
- The engine bundle:
  - compose queues two phrases and asks for more at the right step;
  - `need` adds phrases until the last;
  - the queue plays cleanly across every phrase join (every note-off ends a
    sounding note, and nothing is left sounding);
  - transpose applies from the next phrase;
  - stream off stops the requests.
- The patches: the step comes from `[transport]`, the queue starts on a
  barline, stop and restart send note-offs, and `need` reaches the engine
  through `[deferlow]`.
- The full corpus (`tests/corpus.test.js`):
  - 3 streams of 24 phrases keep every rule, with 3 breaths;
  - 400 phrases in 10 seeds, with no failures;
  - a phrase takes about 5 ms to compose, 135 ms at worst;
  - the same checks pass on the 153 minor chorales.

**Not yet verified:**

- `[transport]` in the player inside Max and inside Live: its bars, beats
  and units outlets, and that inside a device it follows Live's song
  position.
- The player's timing by ear: barline starts, tempo changes, stop/start.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

1. [ ] Open the patch. The shared panel has a new bottom row: **stream**,
       **phrases** (8) and **transp.** (0). The corpus reloads as in M4.
       Check the Max window for red text.
2. [ ] **Whole pieces still play.** With **stream** off, set **seed** to 3
       and turn on **Play**:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 36 chorales`. Stop in
       the middle and Play again. The piece starts again from its beginning
       on the next bar, with no stuck notes.
3. [ ] **Compose while playing.** While it plays, click **next**. The old
       piece stops cleanly, and `emi-4` starts on the next bar.
4. [ ] **A stream of 8 phrases.** Stop. Turn **stream** on, set **seed** to
       1 (or click **compose** if it already shows 1). Status:
       `emi-1 stream: phrase 2 of 8 queued (bwv389 phrase 2)`. Turn on
       **Play** and let it run. As each phrase starts, the next one is
       queued: phrase 3, 4 and on to 7 (all bwv389), then
       `emi-1 stream: phrase 8 of 8 queued (bwv308 phrase 6, the last)`. The
       piano roll scrolls, showing the last four phrases. The music ends on
       a final cadence, then silence.
5. [ ] **Endless, and transpose.** Set **phrases** to `0` and **seed** to
       `2`: `emi-2 stream: phrase 2 queued (bwv395 phrase 2)`. Play. While it
       plays, set **transp.** to `2`. The status reads
       `transpose +2 from the next phrase`. About two phrases later the music
       is a whole tone higher, and the status lines end with
       `transposed +2`. One phrase in this stream starts after a breath:
       `after a breath`, one silent beat. Set **transp.** back to `0`.
6. [ ] **Tempo.** While the stream plays, change **BPM** to 60, then 160,
       then back to 100. No stuck notes, no gaps, no doubled notes.
7. [ ] **Stop and start** a few times while streaming. Each time, the
       stream starts over on the next bar. No stuck notes.

## 2. Live version

Live has a metronome, which makes the barline checks easy. Turn it on.

1. [ ] Reopen the set. The brain device's shared panel has the new bottom
       row. Turn on **play through voices**, and make sure no clips are
       playing.
2. [ ] **Barlines.** With **stream** off, set **seed** to 3. Press Live's
       Play from bar 1. The piece starts with the metronome: its first notes
       (a pickup) fall on beat 4 of bar 1. Stop. Click in the timeline at
       bar 9 and press Play: the pickup falls on beat 4 of bar 9.
3. [ ] **Compose while playing.** While it plays, click **next**: the old
       piece stops cleanly and `emi-4` starts on the next bar, in time with
       the metronome.
4. [ ] **A stream.** Turn **stream** on, set **phrases** to `4`, then click
       **compose** (seed 4). Play from bar 1. You'll hear four phrases, the
       last ending on a final cadence. The status line counts the phrases
       as they're queued, ending with
       `emi-4 stream: phrase 4 of 4 queued (bwv244.44 phrase 7, the last)`.
5. [ ] **Tempo and stop/start.** Set **phrases** to `0` and click
       **compose**. While it plays, change Live's tempo to 60 and 160, and
       stop and start a few times. No stuck notes.
6. [ ] Turn **stream** off and **play through voices** off when you're done.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix are:

- the player reading `[transport]`: if nothing plays, or pieces start in the
  wrong place, say what you heard;
- timing at the joins between phrases, and through tempo changes.

Also say how the streams sound: do phrases flow into each other? Are the
breaths noticeable?
