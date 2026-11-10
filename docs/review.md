# Review after v0.1.0: what to improve next

Written after the first release (M12), from a read of the engine, the taste
layer, the patch generator and the milestone results. It hasn't been
listened to: the musical points come from what the code does and doesn't
do, and from the listening tests in [M8](M8-checklist.md).

## Where it stands

- One engine (`code/lib`) shared by the Max version and the Live devices;
  247 tests; every control documented ([controls.md](controls.md)).
- The composer: voice-hooking at two levels, SPEAC, signatures kept as
  whole blocks, template forms with bar-form repeats, key areas and
  modulation planning, a quotation guard, and 98 pieces in 100 with exact
  voice-leading throughout.
- The honest measure is the blind A/B test: the developer picked Bach out
  9 times in 10, twice (M8). The fixes made after it (repeats, modulation,
  soprano range) were the right ones; the goal (no better than guessing)
  is still open. Most of the musical items below aim at that number.

## GUI: streamlining

*G1 to G4 built* (after the performance layer): chorale form and signatures
are in the more features window (Max) and gone from the Live device (both
stay on); the top row is **new piece**, **piece #**, **again**, **export
midi**; the status line reads `Piece 3 · A minor · 14 bars · in the form of
BWV 14.5 · from 24 chorales` (the details go to the Max console); length is
in **bars**. The read-me's screenshots need retaking.

The redesign got the layout right (workflow order, a row of section names,
one look for every control). What's left is too many knobs for a first-time
user, and some engineer's vocabulary leaking through.

| # | Change | Why | Where |
|---|---|---|---|
| G1 | Move **chorale form** and **signatures** to the more features window | Both default on and turning either off makes the music worse (form off is the M2 naive composer). They prove milestones; listeners don't need them. Frees a row of COMPOSE | `tools/maxgen.py`: `panel()`, `extras_window()`; the engine's `form`/`sigs` messages stay |
| G2 | **new piece** (= next), **again** (= update composition), and a small **piece #** box (= seed) | Three controls for one idea; "next" is cryptic to a newcomer. Same wiring; Live parameter names (`Compose`, `Next`, `Seed`) unchanged, so mappings survive | `panel()` |
| G3 | A listener's status line: `Piece 1 · A minor · 14 bars · in the form of BWV 14.5 · from 24 chorales` | Today's line (`emi-1: form of bwv14.5 (A minor), 7 phrases, 56 beats, 24 chorales, SPEAC 41%, 4 signatures, 3 variants, ...`) is a debug line. SPEAC %, signature and variant counts stay in the Max console, where they already go. Same for the corpora footer's "7067 beats, 158 signatures" | `code/emi.core.v8.js`: `describePiece()`; `code/emi.corpora.v8ui.js` |
| G4 | Length in **bars**, not beats | `beats 32` means nothing to most people; `8 bars` does. The engine keeps working in beats | `panel()`, `beats()` in the engine |
| G5 | Tidy the pop-up's button row | Ten buttons in one row mix rating (like, dislike, keep), composing (update), taste housekeeping (release all pins, store, recall, forget) and help (explain). Put **release all pins** in the weights tab and **store / recall / forget** in the memory tab; the row keeps five | `window()`; `code/emi.taste.v8ui.js` |
| G6 | Temperature slider: 0–2 with 1 in the middle, or labelled ends ("Magdalena's picks" ↔ "surprise me") | Default 1 sits a third of the way along 0–3, so it reads as "low"; parked at 3, chance dominates and Magdalena barely counts | `emily_panel()`; clamp in `temperature()` |

Smaller:

- **keep** sounds like "save this piece"; it adds it to Magdalena's notebook. Her panel is 170 px now: **add to notebook** fits.
- **phrases** only means anything with **stream** on: show it as a sub-setting of stream, or hide it when stream is off.
- **undo last rating**: cheap (the rating log exists) and removes the fear of a mis-click on like/dislike.
- **taste report** composes ten pieces and prints to the Max console, which frozen-device users never see. Route its text to the overview tab only.

## Musical improvements

### A. A performance layer (the biggest audible gain, no risk to the composer)

*Built* (`code/lib/emi-perform.js`, the **performance** switch in each
host panel, on by default): fermata chords held as long again (up to a beat
more; the last chord of all doubled), an eighth's breath before the next
phrase, velocities from a phrase arch and the beat's harmonic tension (the
chord's dissonance and the root's motion; not Cope's metric term, which
rises on weak beats), the soprano louder and the inner voices softer, beat
1 accented, and a lift before a repeated pitch. Playback only: export and
clips stay as written. The piano roll reads the playhead back through the
holds. No ritardando (the player's clock is the transport's).

Every note in the corpus has velocity 90 (`corpus/bach-figured-bass`, checked
over 40 files), and the player holds a fermata chord for exactly its written
length. The A/B page says so itself: "pieces are played without the pauses
singers take at fermatas". So every piece, Bach's included, plays like a MIDI
file from 1995. A post-processing step, after composing, can't break the
composer:

- **Fermatas**: stretch the cadence chord (×1.5–2) and add a breath (an
  eighth rest) before the next phrase. The grid player is a step queue
  (`emi-queue`), so this is "insert extra steps at fermata ticks".
- **Dynamics from the analysis already made**: velocity = base + k · (beat
  tension − phrase mean), so phrases swell toward their SPEAC antecedent and
  settle into the consequent. Soprano +5, inner voices −5, beat 1 slightly
  accented. Cope's tension measure as a phrasing model.
- **Articulation**: eighth-note passing tones slightly detached, cadence
  chords full length.
- Optional: a small ritardando into the final cadence (the player's step
  clock is the transport's; a tempo message to the host would do it in Max,
  not in Live).

One switch, **performance**, on by default.

### B. The composer

| # | Change | Why | Where |
|---|---|---|---|
| M1 | **Plan the soprano, not just hook it**: a soft score for matching the template soprano's direction beat to beat (or its distance from the template's soprano at phrase midpoints), like the `accidentals` term | The melody is constrained locally (hooking), by range (template) and at cadences (signatures); between those each beat knows only the beat before, so the tune can wander. A hymn tune has a contour and a climax. The single change most likely to move the listening test | `emi-form.js`: `slotsOf` (template soprano per slot), `feasible` (`SCORE`), `sopranoOf` |
| M2 | **Match the cadence's soprano degree**: the template's soprano scale degree at the fermata (ending on 1, 3 or 5) | Cadence slots already keep the bass pitch class (so half cadences stay half); the soprano's close is the other half of a cadence's character | `slotsOf`, `fits` |
| M3 | **Chord function as a soft constraint**: a label (I, IV, V, vi, V/V…) per beat from its key area and root, preferred like a SPEAC label | SPEAC is tension-based; two beats can share a label with different harmonic roles. `emi-tension` has the root finder and each beat has an area (`emi-lexicon`'s `areas`) | `emi-lexicon.js` (label at build), `emi-form.js` (score) |
| M4 | **Rhythmic density from the template**: score beats whose `newNotes` (or 16ths) match the template beat's | `slot.newNotes` is stored but only splits phrases. Bach's inner-voice eighths thicken toward cadences; carrying the template's density carries that shape | `feasible` |
| M5 | **Compose in the template's key**, with a key menu beside | Pieces are always in C or A minor and transpose is "n semitones". Each work's key and `transposedBy` are stored; "in the form of BWV 14.5, in its key" is nearly free and more musical | `emi.core.v8.js`: `transposed()`, `composeNow()`; the panel's transpose control |
| M6 | **Direct fifths and octaves to the outer voices**: a soft penalty at seams when soprano and bass move the same way into a fifth or octave with a soprano leap | The parallels check is good; hidden fifths and octaves are a voice-leading tell it lets through | `emi-quality.js`, `emi-form.js` (`voicesFit` or the score) |

### C. The taste layer

- Two more features: **cadence type** (half or full) and **rhythmic
  density**, so Magdalena can learn "busy inner voices" and "phrases that
  don't fully close" (`emily-assoc.js`: `musicalFeatures`, `NAMES`, `GROUPS`).
- Run the listening test with listeners who aren't the developer: both tests
  so far were.

## A suggested order

1. ~~The performance layer (A).~~ Built.
2. ~~GUI G1–G4.~~ Built.
3. Soprano contour (M1) and cadence degree (M2), then a fresh A/B test.
4. The template's key (M5), then the pop-up tidy (G5, G6).

Each is small enough for a pull request of its own.
