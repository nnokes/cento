# M9 checklist: Emily's taste

## Result: M9 passed (macOS, Max 9, Live 12)

Reported back: "M9 all success".

| Check | Max version | Live version |
|---|---|---|
| Emily's panel: **like**, **dislike**, **temp**, **taste** (and, since M10, **accept**; **forget** is in the pop-up window) | ✅ | ✅ |
| With no ratings, pieces are exactly as in M8 | ✅ (`tests/emily.test.js`) | ✅ (the same engine) |
| Ten scripted ratings give the expected taste | ✅ | — (checked in Max; the same engine) |
| After ten ratings, new pieces have more of the liked features | ✅ (and simulated: `tests/corpus.test.js`, run locally) | — (checked in Max; the same engine) |
| Rating a selection, and a stream phrase while it plays | ✅ | ✅ (a stream phrase) |
| like and dislike mapped to a key or a MIDI controller | ✅ | ✅ |
| The taste carries over between the products, and fades a little each session | ✅ | ✅ |
| The pop-up window: a large piano roll and Emily's taste in full | ✅ | ✅ |
| Editing her weights (pins, strength), and storing and recalling a taste | ✅ | — (checked in Max; the files are shared) |
| Your own taste, by ear | ✅ | ✅ |
| Engine tests | ✅ (`npm test`) | ✅ |

M9 adds the first part of Emily Howell, Cope's second program: it learns
what you like. You rate what you hear, and later pieces lean toward it.

**What Emily listens for.** Every beat of the corpus has a set of features
worked out from its notes:
- **motion:** block chords, one moving voice, or busy voices;
- **16th notes** and **suspensions** (a voice held over, then stepping down);
- **melody:** repeated notes, steps or leaps to the next beat; a low,
  middle or high melody;
- **chords:** major, minor, seventh, diminished or other;
- **key:** chromatic notes, and whether the beat is in the home key, the
  dominant, the relative or the subdominant;
- **tension:** low, middling or high (Cope's tension measure).

Emily also remembers the exact beats, transitions, chorales, signatures and
forms you rated.

**How she learns.** When you like a piece, each feature it has more of than
the corpus usually has gains weight, and each it has less of loses some. A
dislike does the opposite. Each rating moves the weights only a little, so a
taste forms over about ten ratings. She learns what *goes with* what you
liked: like pieces with high melodies and she may also learn to like the
home key, if those pieces happened to stay in it. To teach one thing, select
just the beats you mean (step 5).

**How she composes.** The rules don't change: voice-leading, the form, SPEAC
labels and signatures work as before. Among the beats that fit, Emily picks
the ones with the features you like.
- **temp** (temperature) sets how much chance still plays:
  - **0:** Emily's favourite choices only;
  - **1:** chance as before M9 (the default);
  - **3:** adventurous.
- Without ratings, pieces are exactly as in M8.

Each piece composed with a taste adds one line to the Max window. It compares
the piece with the same seed composed without the taste.

**Measured** (full corpus, a simulated listener, 24 new seeds; see
`tests/corpus.test.js`). The listener liked pieces with more of one feature
than usual and disliked the rest, ten ratings in all:

| Liked | Share of beats without the taste | After ten ratings |
|---|---|---|
| a high melody | 52% | 81% |
| melodic leaps | 15% | 23% |
| 16th notes | 4.3% | 11.2% |
| a low melody (disliked) | 13% | 2% |

The cost: pieces keep their template's SPEAC labels a little less often (on
about 51 to 63% of beats, against 61% without a taste). Suspensions and
repeated melody notes barely move: few beats that have them fit the
voice-leading.

**Where the taste is kept.** `patchers/ml_midi.taste.json`, next to the
settings file. Both products use it, so a taste learned in one carries over
to the other. It's git-ignored. Each time a patch or set opens after you
rated something, every weight fades by a tenth, so early opinions don't
harden.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop.

## 1. Max version (`patchers/ml_midi.maxpat`)

Do steps 1 to 6 in one sitting, without closing the patch: closing and
reopening it makes the taste fade (step 7), and the lines below would change.

1. [x] **Open the patch.** A new panel, **Emily**, sits between the controls
       and the piano roll:
       - **like** and **dislike**, two large buttons;
       - **temp**, a dial showing `1.00`;
       - **taste** and **accept** (M10; **forget** is now in the pop-up
         window, step 9);
       - a small text box: `no ratings yet`.

       The corpus reloads as before:
       `corpus 142 chorales (major), 8578 beats, 18% dead ends, 76 signatures`.

       The status line and Emily's box show text plainly: commas and
       semicolons without a backslash before them (not `melody\,`), and
       numbers without quotes (not `"10" ratings`). Both boxes now draw their
       text themselves; a long line wraps and gets a smaller font.

       Nothing plays until you turn **Play** on, even if the patch was
       playing when you last closed it. (Before this fix it could start by
       itself: Max's transport belongs to Max, not to the patch, so it kept
       running after the patch closed.)
2. [x] **No taste, no change.** Turn **stream** off and set **seed** to 3:
       `emi-3: form of bwv260, 5 phrases, 56 beats, 23 chorales, SPEAC 68%, 3 signatures`,
       exactly as in M8.
3. [x] **Ten ratings, scripted.** This teaches Emily a known taste, so the
       results can be checked: a listener who likes high melodies. For each
       row, set **seed** (it composes), listen if you like, then click the
       button shown. The status line after each click starts as shown.

       | Seed | Form | Click | Status line after the click |
       |---|---|---|---|
       | 1000 | bwv376 | **like** | `liked emi-1000 (40 beats): + a high melody, - a low melody, + repeated melody notes; 1 rating` |
       | 1001 | bwv376 | **like** | `liked emi-1001 (40 beats): + major chords, + a high melody, - a low melody; 2 ratings` |
       | 1002 | bwv407 | **like** | `liked emi-1002 (108 beats): + major chords, + the home key, + low tension; 3 ratings` |
       | 1003 | bwv355 | **like** | `liked emi-1003 (64 beats): - stepwise melody, + major chords, + the home key; 4 ratings` |
       | 1004 | bwv248.12-2 | **dislike** | `disliked emi-1004 (64 beats): + stepwise melody, - major chords, - the home key; 5 ratings` |
       | 1005 | bwv432 | **dislike** | `disliked emi-1005 (32 beats): - major chords, - repeated melody notes, + seventh chords; 6 ratings` |
       | 1006 | bwv248.53-5 | **like** | `liked emi-1006 (48 beats): + major chords, + a high melody, - high tension; 7 ratings` |
       | 1007 | bwv296 | **like** | `liked emi-1007 (52 beats): + the home key, + a high melody, + low tension; 8 ratings` |
       | 1008 | bwv244.40 | **like** | `liked emi-1008 (64 beats): - busy voices, + major chords, + the home key; 9 ratings` |
       | 1009 | bwv318 | **like** | `liked emi-1009 (52 beats): + major chords, + the home key, + a high melody; 10 ratings` |

       The **Emily** box now reads
       `10 ratings; likes a high melody; dislikes a low melody`
       (her strongest like and dislike; **taste** lists the rest).

       From seed 1001 on, the Max window also gets a comparison after each
       piece. For seed 1009:
       ```
       emi-1009: her taste +5.74 a beat (+3.38 without); a high melody 92% of beats (75%); the home key 85% (54%); a low melody 0% (0%); seventh chords 0% (0%)
       ```
       The numbers in brackets are for the same seed without the taste.
4. [x] **The shift (the milestone's "done when").** Set **seed** to 1, then
       click **taste**. Max pauses for a few seconds while it composes seeds 1
       to 10 twice, with and without the taste. The status line:
       `Emily, seeds 1-10: a high melody 83% of beats (54% without her taste), a low melody 1% (14%); more in the Max window`.
       The Max window:
       ```
       ml_midi: Emily's taste: 10 ratings; likes a high melody, the home key, major chords, low tension, repeated melody notes, block chords; dislikes a low melody, seventh chords, chromatic notes, high tension, 16th notes, suspensions
         likes: a high melody +2.10, the home key +1.58, major chords +1.47, low tension +1.32, repeated melody notes +1.01, block chords +0.87, the subdominant key +0.07
         dislikes: a low melody -1.75, seventh chords -1.34, chromatic notes -1.34, high tension -1.28, 16th notes -1.24, suspensions -1.13, the dominant key -1.08, stepwise melody -1.01
         seeds 1-10, with her taste and without: her taste +5.87 a beat (+2.59 without); a high melody 83% of beats (54%); the home key 83% (61%); major chords 88% (85%); a low melody 1% (14%); seventh chords 3% (5%); chromatic notes 4% (13%)
       ```
       Listen to seed 2: its melody sits high
       (`a high melody 86% of beats (67%)` in its line).
5. [x] **Temperature.** Set **seed** back to 1. Drag **temp** all the way
       down to `0.00`. The status line:
       `temperature 0.00: only Emily's favourite choices (from the next piece or phrase)`.
       Click **compose**:
       `emi-1: form of bwv244.40, 8 phrases, 64 beats, 28 chorales, SPEAC 47%, 3 signatures`.
       Drag it all the way up to `3.00` and compose again:
       `emi-1: form of bwv248.12-2, 6 phrases, 64 beats, 30 chorales, SPEAC 61%, 4 signatures`.
       Then turn it back to about 1 (the exact value doesn't matter from here on).
6. [x] **Rating a selection.** In the piano roll, press the mouse at the
       start of bar 2 and drag to the end of bar 3. A blue band covers those
       beats, and the status line says
       `selected bars 2-3 (8 beats): like or dislike rates them`
       (the count depends on where you start and stop). Click **dislike**:
       `disliked bars 2-3 of emi-1 (8 beats): ...; 11 ratings`.
       Click once anywhere in the roll: the band goes. The next rating is for
       the whole piece again.
7. [x] **Map like to a key.** In the Max window's bottom toolbar, click
       **Assign Key Map** (the patch gets an orange border). Click **like**,
       press `L`, then click **Assign Key Map** again to leave. Now press
       `L`: the status line says `liked emi-1 (...); 12 ratings`. (MIDI works
       the same way: right-click **like** and choose **Assign MIDI Map**,
       then press a pad or key.) When you close the patch, Max asks whether
       to save: choose **Don't Save**, unless you want to keep the mapping.
8. [x] **A new session.** Close the patch and open it again. The **Emily**
       box shows your 12 ratings. Click **taste**: the Max window's first
       line now ends `; 1 earlier session`. Opening a patch or set after a
       session with ratings makes every weight fade by a tenth.
9. [x] **The pop-up window.** Click **window** at the top right of the
       **Emily** panel. A window titled `ml_midi: piano roll and Emily` opens:
       - **Top:** the piano roll, about three times larger. Bars are numbered
         along the top, each C is named on the left (C4 is middle C), and
         the SPEAC letters and the hover box are larger.
       - **Below:** Emily's taste in four columns:
         - **Likes** and **Dislikes:** a bar per feature, longer for a
           stronger weight;
         - **Last ratings:** latest first;
         - **Compared:** empty until you click **taste**. It then shows each
           feature's share of beats with her taste (bright bar) and without
           (dim bar). A new rating clears it, since it no longer matches.
       - **At the bottom:** **like**, **dislike** and **taste** buttons,
         and the weight buttons (step 10).

       Drag across beats in the large roll: the blue band shows in both
       rolls, and **like** in either place rates those beats. Compose another
       seed: both rolls change. Close the window with its close button; the
       **window** button opens it again.
10. [x] **Edit her weights.** In the window, click **edit weights**. The
       lower pane shows a slider for every musical feature, in columns by kind
       (Motion, Melody, Chords, Key, Tension), from -3 on the left to +3 on
       the right. On each slider:
       - the **thin white line** is what Emily learned;
       - the **handle** is what she uses.

       1. **Pin.** Drag the **16th notes** slider to the right end. Its
          handle turns amber and reads `+3.0`. The status line says
          `Emily: 16th notes pinned at +3.00 (she learned ...)`.
       2. **Hear it.** Compose a few seeds: there are more 16th-note runs.
          Measured over seeds 1 to 10 with no other taste: 4.8% of beats
          without the pin, 18.4% with it.
       3. **Strength.** Drag **strength** (top right) to `2.00`: her whole
          taste counts double (25% of beats). Double-click it to go back to
          `1.00`. At 0 she has no taste at all.
       4. **Rate.** A rating still teaches her: the thin line moves, but a
          pinned handle stays where you put it. Fading doesn't move pins
          either.
       5. **Release.** Double-click the slider: the handle jumps back to the
          thin line, `Emily: 16th notes released (back to ..., what she
          learned)`. **release all pins** releases every pin at once.

       Click **edit weights** again to go back to the overview. Its title
       line now counts the pins, and the strength when it isn't 1.
11. [x] **Store and recall a taste.** Pin a feature or two, then click
       **store taste** and save it, for example as `busy` in
       `Documents/ml_midi` (the dialog's **New Folder** button can make an
       `emily` folder there for tastes). The status line says
       `stored Emily's taste in busy.json (... ratings, ... pins)`.
       Release all pins and rate something, then click **recall taste** and
       choose `busy.json`:
       `recalled Emily's taste from busy.json (...); the one before is in ml_midi.taste.backup.json`.
       The pins, strength, ratings and learned weights are all back as
       stored. A stored taste is a plain file: you can keep several and
       switch between them, in either product.

## 2. Live version

1. [x] **Reopen the set.** The brain is wider: the **Emily** panel sits between
       the controls and the piano roll, and shows the taste from the Max
       version (`12 ratings; likes a high melody; dislikes ...`).
2. [x] **Rate a phrase while it plays.** Turn **stream** on, compose any seed
       and press Play in Live. During the third phrase, click **like**:
       `liked phrase 3 of emi-<seed> (... beats): ...; 13 ratings`. A click
       in the first second and a half of a phrase rates the one before it
       (you're reacting to what just ended).
3. [x] **Map dislike to a key.** Press Cmd+K (Live's key map mode), click
       **dislike**, press `D`, then Cmd+K again. While the stream plays,
       press `D`: `disliked phrase N of ...`. Live saves the mapping with the set.
4. [x] **Temperature in Live.** **temp** is an ordinary Live parameter: it can
       be automated, or MIDI-mapped with Cmd+M.
5. [x] **The pop-up window in Live.** Click **window** on the brain's
       **Emily** panel: the same window opens over Live, and follows the
       stream phrase by phrase.
6. [x] **Back in Max.** Close Live, open `ml_midi.maxpat` and click **taste**:
       the ratings from Live are counted.

## 3. Your own taste, by ear

1. [x] In the pop-up window, click **forget**. The status line says
       `Emily forgot her taste (N ratings, kept in ml_midi.taste.backup.json)`
       and the box `no ratings yet`. (The backup is the scripted taste. Only
       the last one forgotten is kept.)
2. [x] Rate about ten pieces, or phrases of a stream, by ear: whatever you
       like or dislike, in either product. Selecting beats teaches Emily
       about just those beats.
3. [x] Click **taste**, and copy the four lines from the Max window into
       your report. Then listen to a few new seeds: do they lean your way?
       Try **temp** at 0 and at 2.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix:
- the drag selection in the piano roll (mouse handling in `[v8ui]`);
- key and MIDI mapping of the buttons in each product;
- whether Live finds `emily.panel.maxpat` and `emi.window.maxpat` (both in
  `patchers/`, like the other panels);
- whether the **window** button opens the window in each product (it uses
  `[pcontrol]`), and whether its layout fits your screen.

For step 3, paste Emily's lines from the Max window and say in a sentence
whether her pieces now sound more like what you liked.
