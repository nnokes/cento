# ml_midi — an EMI / Emily Howell–style composer in Max + [v8]

This is a working plan for a recombinant composition system in the style of
David Cope's **Experiments in Musical Intelligence (EMI)**, with an **Emily
Howell**–style interactive layer added later. It is built in Max, with MIDI in
and out, one sub-patch per component, and the algorithms written in JavaScript
running in `[v8]`.

### Decisions so far

| Question | Decision |
|----------|----------|
| Max version | **Max 9**, so `[v8]` (modern JS) is available everywhere |
| First style | **Bach chorales**: about 20 in 4/4, major mode, one voice per track |
| Workflow | **Both**: offline (compose a whole piece, then listen and edit) and **live** (compose phrase by phrase ahead of the playhead) |
| Output | **MIDI**, into **Ableton Live**, with the engine packaged as **Max for Live** devices (§5) |
| Emily scope | Options are explained in §7. The recommended scope (taste + memory and drift) is assumed until you confirm |

---

## 1. What we are rebuilding

### EMI in one paragraph

EMI takes a **database of several works in one style** (Cope's first test case
was the Bach chorales). It transposes them to a common key, cuts them into small
**groupings** (beats or measures), and records three things for each grouping:
its **structural function** (SPEAC), the **notes each voice moves to next** (its
"destination"), and whether it contains a **signature**, meaning a pattern that
recurs across several works and marks the composer's style. It then writes a new
piece by taking the structure of one existing work and **replacing each grouping
with a different grouping from a different work** that has the same function
and connects smoothly to its neighbors. Signatures are kept intact and placed
where they usually occur, such as just before cadences.

### The core mechanisms, ranked by how much they matter

| # | Mechanism | What it does | Without it you get |
|---|-----------|--------------|--------------------|
| 1 | **Voice-hooking (destination matching)** | The next grouping must start on the exact notes the current grouping's voices moved to in the original piece (Hofstadter's name for this is "voice-hooking"). | Broken voice-leading at every seam. |
| 2 | **Different-source rule** | Consecutive groupings must come from different source works. | Long quotations of one piece. |
| 3 | **Cadence and form template** | Phrase lengths, cadence locations and the ending are taken from a real work. | Music that wanders and never ends properly. |
| 4 | **SPEAC labeling** | Each grouping is labeled Statement, Preparation, Extension, Antecedent or Consequent from its tension profile. A replacement must have the same label. | Locally smooth music with no sense of direction. |
| 5 | **Signatures** | Cross-work patterns are preserved whole and placed where they usually occur. | Generic-sounding results that lack the composer's fingerprints. |
| 6 | **Hierarchical SPEAC (ATN)** | SPEAC is applied again at measure and phrase level, so the form is coherent at every scale. | Good phrases that don't add up to a piece. |

Mechanisms 1–3 alone already produce convincing chorales. That is the first
real milestone (M2), and it should be reached quickly.

### Emily Howell, the second program

Emily Howell uses **EMI's output as its database** and works **interactively**.
Cope accepts or rejects what it produces, and that feedback shapes later output
through **association networks** (weighted links between musical elements and
the responses they got). Accepted music goes back into the database, so over
time the style moves away from its sources. We reproduce this as a feedback and
memory layer on top of the EMI engine (see §7).

---

## 2. Architecture

### Guiding principle: a pure JS core inside a thin Max shell

- **`code/lib/*`** holds plain JavaScript with **no Max APIs**: parsing, analysis
  and composition. It runs unchanged in `[v8]` and in Node, so the hard parts
  can be unit-tested and run from the command line.
- **`code/*.v8.js`** holds thin `[v8]` wrappers. Their only jobs are messages,
  inlets and outlets, `Dict` I/O and status reporting.
- **Patchers** hold wiring, UI and real-time I/O only, with no logic.

There are four reasons for this split:

1. `[v8]` runs in Max's main (low-priority) thread, so heavy analysis there
   blocks the UI, and timing-critical playback must not be scheduled from JS.
2. Debugging recombination logic is much easier with tests than with print
   statements in the Max window.
3. Offline batch analysis of a large corpus can run in Node and simply produce
   a JSON file that Max loads.
4. `.maxpat` files are JSON and diff poorly, while `.js` files diff well.

### Two hosts, one engine

All of the logic sits in a single host-agnostic abstraction, **`emi.engine`**,
which never touches MIDI ports or Live. Two thin shells wrap it:

| Shell | Used for | MIDI out | Transport |
|-------|----------|----------|-----------|
| `emi.main.maxpat` (standalone Max) | Development, corpus analysis, debugging views | `[noteout]` to a virtual port (IAC on macOS, loopMIDI on Windows), then into Live tracks filtered by channel 1–4 | Max's own transport, or synced to Live |
| `emi.brain.amxd` + `emi.voice.amxd` (Max for Live) | Composing and performing inside Live | Live tracks directly (§5) | Live's transport |

Develop and debug in standalone Max, where iterating is faster, then drop the
same `emi.engine` into the devices.

### Data flow

```
 data/corpus/*.mid
        │
 ┌──────▼───────┐   dict emi.corpus   ┌──────────────┐   dict emi.db  (+ data/db/*.json)
 │  emi.ingest  │────────────────────▶│  emi.analyze │──────────────────┐
 └──────────────┘                     │  segment     │                  │
                                      │  tension     │                  │
                                      │  SPEAC       │                  │
                                      │  signatures  │                  │
                                      │  lexicon     │                  │
                                      └──────────────┘                  │
 ┌──────────────┐  params                                               │
 │  emi.ui      │──────────────────────┐                                │
 └──────────────┘                      ▼                                ▼
                               ┌───────────────┐   dict emi.score   ┌─────────────┐   offline: .mid file / Live clips
 ┌──────────────┐  weights     │  emi.compose  │───────────────────▶│ emi.render  │──▶
 │emily.feedback│─────────────▶│  (recombine)  │◀── "need next" ────│             │   live: grid player → MIDI out
 └──────▲───────┘              └───────────────┘                    └─────────────┘
        │                                                                  │
        └──────────── ratings on a selection, or on the phrase just played ◀┘
```

### Max patch layout

Each major component is an **abstraction**, meaning its own `.maxpat` file.
This is your "sub-patch per component" approach, with two advantages over
embedded `[p]` patchers: each file can be opened, versioned and reused on its
own, and UI panels can be shown via `[bpatcher]`. Inside each abstraction, use
`[p ...]` freely to keep things readable.

```
emi.main.maxpat  /  emi.brain.amxd     host shell: I/O, transport, UI panels only
└── [emi.engine]                       host-agnostic: everything below
    ├── [emi.ingest]                   folder/drop → parse → normalize → dict emi.corpus
    │     ├── [p file-list]            [dropfile] / [folder] / [opendialog fold]
    │     ├── [v8 emi.ingest.v8.js]
    │     └── [p report]               per-work summary: key, meter, voices, warnings
    ├── [emi.analyze]                  dict emi.corpus → dict emi.db  (+ save JSON)
    │     ├── [v8 emi.analyze.v8.js]
    │     └── [p progress]             chunked-job progress bar
    ├── [emi.compose]                  dict emi.db + params (+ emily weights) → dict emi.score
    │     └── [v8 emi.compose.v8.js]   whole-piece mode and phrase-streaming mode
    ├── [emi.render]                   dict emi.score → events (no ports here)
    │     ├── [p export]               write .mid + provenance .json
    │     ├── [p clip-writer]          [v8 emi.clips.v8.js] → Live clips (M4L only)
    │     └── [p grid-player]          transport-locked step player → per-voice event outlets
    ├── [emi.view]   (bpatcher)        piano roll colored by source work, SPEAC lane, seams
    └── [emily.feedback] (bpatcher)    👍/👎 selection or last phrase, temperature, accept
```

**Conventions**

- **Shared data goes through named `[dict]`s**: `emi.corpus`, `emi.db`,
  `emi.score`, `emi.params`, `emily.weights`. Use `[send]`/`[receive]` only for
  control messages, under one prefix such as `emi.ctl.*`.
- **Every `[v8]` wrapper uses the same message protocol.** Inputs are verbs:
  `load <dict>`, `run`, `param <key> <value>`, `cancel`. Outputs go out the right
  outlet as `status <text>`, `progress <0..1>`, `done <dict>` or `error <text>`.
  This keeps all the wrappers interchangeable from the patch's point of view.
- **Never schedule notes from JS.** JS writes events ahead of time (a whole
  piece, or the next phrase), and a Max-native player locked to the transport
  sends them out (§4.7).

---

## 3. Data model

Times are integer **ticks at 960 per quarter note** (this divides evenly by 2,
3, 4, 5, 6 and 8, so triplets are exact). Cope's Lisp examples use 1000 per
beat; add a converter for comparing results against his book examples. Max's
transport counts **480** ticks per quarter, so the player halves our values, and
Live's note API uses **beats** as floats (`ticks / 960`).

**Event.** This uses Cope's own field order, so his published examples can be
pasted in directly:

```js
[ontime, pitch, duration, channel, velocity]     // e.g. [0, 60, 960, 1, 90]
```

**Work**

```js
{ id: "bwv253", title: "...", meter: [4, 4], key: { tonic: 0, mode: "major" },
  transposedBy: -7, voices: 4, events: [/* Event[] in C / A minor */],
  phrases: [/* tick ranges, from fermatas or cadence detection */] }
```

**Grouping (one lexicon entry)**

```js
{
  id: "bwv253:12",              // work + grouping index
  work: "bwv253",
  start: 11520, length: 960,    // ticks
  beatInBar: 1,                 // 1-based metric position
  events: [/* relative to start */],
  entry: [48, 55, 64, 72],      // first sounding pitch per voice (bass → soprano)
  destination: [50, 55, 65, 71],// entry of the NEXT grouping in the original work
  heldIn:  [false, false, true, false],   // voice tied in from previous grouping
  heldOut: [false, false, false, false],  // voice ties into next grouping
  tension: 0.78,
  speac: { beat: "A", bar: "P", phrase: "S" },
  cadence: null | "authentic" | "half" | "final",
  phrasePos: 0.85,              // 0..1 position within its phrase
  signature: null | "sig:17"
}
```

**Lexicon**: groupings are indexed by a hashed `entry` key, so finding
"everything that starts on these notes" is a single lookup. There is one index
per **match level**:

| Level | Key | Use |
|-------|-----|-----|
| `L0 exact` | exact pitches per voice | Cope-faithful, strongest voice-leading, sparse |
| `L1 pc+bass` | pitch class per voice + exact bass | default fallback |
| `L2 pcset+bass` | pitch-class set + bass pitch class | looser, needs octave adjustment of upper voices |
| `L3 harmony` | chord root + quality | last resort, needs voice-leading repair |

**Signature**

```js
{ id: "sig:17", voice: "soprano", intervals: [-1, -2, 2, ...], rhythm: [...] | null,
  occurrences: [{ work, start, phrasePos, beatsToCadence }], spanGroupings: 3 }
```

**Template (form)**: one per work, a list of slots:

```js
[{ beatInBar, speac: {beat, bar, phrase}, cadence, phraseIndex, signatureSlot? }, ...]
```

**Database file** (`data/db/<style>.json`): `{ version, settings, works, groupings,
lexicon: {L0, L1, L2, L3}, signatures, templates }`. Record the analysis settings
in the file so every output can be reproduced.

---

## 4. Module plans

### 4.1 `emi.ingest`: corpus to normalized events

- **SMF parser in JS** (`lib/smf.js`, about 200 lines). Read bytes with Max's
  `File` object in the wrapper and with `fs` in Node, then pass them to the same
  parser. Handle SMF type 0 and 1, running status, note-on with velocity 0 as
  note-off, and tempo, time-signature and key-signature meta events.
  - If you want a no-code fallback, `[detonate]` can import a MIDI file and dump
    its events. Treat that as a stopgap, because the JS parser is what lets you
    test ingest outside Max.
- **Normalize**
  - **Quantize** to a grid (a 16th by default), plus a "fix micro-overlaps" pass;
    Cope's code has `fix-triplets` for the same reason.
  - **Separate voices.** For chorales, use one track or channel per voice. For
    other music this is hard; see §9 Risks.
  - **Key-normalize**: take the key from key-signature meta events if they exist,
    otherwise use Krumhansl–Schmuckler key finding. Then transpose to C major or
    A minor and store the offset.
  - **Filter**: keep only works in the target meter and mode (to start, 4/4
    major only).
- **Output**: `dict emi.corpus` and a per-work report (key, meter, voices,
  warnings).

### 4.2 `emi.analyze/segment`

- Groupings are **one beat** long by default (Cope's choice for chorales). This
  is configurable to a half bar or a full bar.
- **Notes that cross a grouping boundary** (ties and suspensions) are split.
  Each piece is flagged with `heldIn`/`heldOut`, and the pitch must match across
  the seam during recombination. Suspensions are central to the Bach style, so
  handle this properly from the start.
- Mark **phrase boundaries** from fermatas if the source has them, otherwise
  from cadence detection (strong-beat arrival, long duration, a V→I or V→vi bass
  pattern).

### 4.3 `emi.analyze/tension` and SPEAC

The numbers below come from Cope's own SPEAC code (*Computer Models of Musical
Creativity*, ch. 7), as ported to Python in
[GolzitskyNikolay/SPEAC-analysis](https://github.com/GolzitskyNikolay/SPEAC-analysis).
That repo has no license, so read it and re-implement; don't copy it. Treat all
of these values as starting points that can be adjusted.

**Tension of a grouping = vertical + metric + duration + approach**

- **Vertical**: measure each pitch's interval above the bass (octave
  duplicates removed; the weights repeat every octave), look up each weight and
  **add them up**. If a beat contains several verticals (because notes enter at
  different times), use the **lowest** sum. For example, a bass with a 12th and
  a 17th above it scores .1 + .2 = .3.

  | Interval | P1 | m2 | M2 | m3 | M3 | P4 | TT | P5 | m6 | M6 | m7 | M7 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | Weight | 0 | 1.0 | .8 | .225 | .2 | .55 | .65 | .1 | .275 | .25 | .7 | .9 |

- **Metric**: `(beatNumber × 0.1) / k[meter][beat]`. In 4/4, k = `[2, 2, 6, 2]`,
  which gives beats 1–4 the values .05, .1, .05 and .2. The upbeat carries the
  most tension. Cope's table also has rows for 2, 3, 6 and 9 beats per bar.
- **Duration**: `0.1 × (dur / 4 beats) + 0.1 × vertical`.
- **Approach**: the root-motion interval from the previous chord, scored with the
  same interval table. This needs a simple root finder; Cope ranks intervals by
  root strength, with the 5th strongest and then the 4th.

**Label assignment** (Cope's `develop-speac`). For each grouping's tension `w`,
compare it with the previous and next values `w₋₁` and `w₊₁` and with the
average, maximum and minimum of its context. "≈" means within 0.2. Check the
rules in this order and use the first one that applies:

1. If `w ≈ w₋₁`, label it **E** (extension).
2. If `w ≈ w₊₁`, label it **P** (preparation). If the previous label was P,
   use E instead.
3. If `w ≈ avg`, label it **S** (statement). If the previous label was S, use E
   instead.
4. If `w ≈ max`, label it **A** (antecedent). If the previous label was A, use E
   instead.
5. If the previous label was A and `w ≈ min`, label it **C** (consequent).
6. Otherwise label it **S**, or E if the previous label was S.

**Hierarchy**: run the same procedure on bar-level and then phrase-level
averages. Each grouping then carries labels for three levels: beat, bar and
phrase.

**Succession sanity checks**, taken from Cope's definitions:

- P usually comes before S or A.
- E can follow anything.
- A expects a C, either directly or after one or more E's.
- C must be preceded by an A, possibly with E's in between.

During composition, use these checks as soft constraints when an exact label
match is impossible.

### 4.4 `emi.analyze/signatures`

These defaults also come from Cope's code (`pattern-match`):

- Work on **interval sequences per voice**. Rhythm is ignored by default and can
  be turned on as an option.
- **Pattern size** is 12 notes. Expose 4–16 in the UI.
- **Amount off** is 1 semitone: a single interval may differ from the pattern by
  at most this much.
- **Intervals off** is 2: at most this many intervals may differ at all.
- **Threshold**: a pattern must occur more than 2 times.
- **Signatures vs. unifications**: a pattern that recurs in **at least N
  different works** is a *signature* (it marks the style). A pattern that
  recurs only within one work is a *unification* (a motive). Keep both, because
  unifications are useful later for internal coherence.
- **Implementation**: do a first pass with exact n-gram hashing, which is fast.
  Then do the fuzzy pass only against the candidates it finds, comparing
  interval by interval. A full fuzzy all-pairs search is O(n²) per pattern size.
  It's fine in Node, but in `[v8]` it must be **chunked with a `Task`** (process
  N windows per tick and report `progress`).
- For each occurrence, store **where it happens**: `phrasePos`, `beatsToCadence`
  and `beatInBar`. Placement in §4.6 depends on this.

### 4.5 `emi.analyze/lexicon` and templates

- Build the four match-level indexes from §3.
- **Templates**: each work's slot sequence with its SPEAC labels, cadences,
  phrase lengths and the locations of its signatures.
- **Database statistics** for the UI: how many candidates are available per key,
  and which entries have **no exits**, meaning dead ends.

### 4.6 `emi.compose`: the recombination engine (a simplified ATN)

```
1. Pick a TEMPLATE (a source work's form, or a user-defined slot list).
2. PLACE SIGNATURES: for slots whose phrasePos and beatsToCadence match a
   signature's usual locations, pin a signature occurrence (from a work other
   than the template's).
3. FILL the remaining slots left to right, with depth-limited backtracking.
   A candidate g for slot i (after previous grouping p) must satisfy:
     • voice-hook:   key(g.entry) == key(p.destination)     at the current match level
     • ties:         held voices continue on the same pitch
     • metre:        g.beatInBar == slot.beatInBar
     • function:     g.speac.beat == slot.speac.beat         (relax to the grammar)
     • cadence:      slot.cadence ⇒ g.cadence of the same type
     • source:       g.work != p.work                        (Cope's different-source rule)
     • lookahead:    if slot i+1 is pinned, g.destination must hook into it
   Choose among the candidates with weighted randomness (Emily weights, §7).
4. DEAD END: backtrack, then relax the match level (L0→L1→L2→L3), then the
   SPEAC rule, and finally the different-source rule. Record each relaxation
   in the provenance.
5. POST-PROCESS: transpose to the output key, merge split ties, check ranges,
   count parallel 5ths and octaves at the seams (seams are the only places
   new errors can appear).
6. GUARDS: the longest run from one work and the longest n-gram shared with any
   source must stay under their thresholds. If not, regenerate with the next seed.
```

```js
// code/lib/emi-compose.js — core of step 3 (sketch)
function fill(slots, i, prev, out, ctx) {
  if (i === slots.length) return true;
  const slot = slots[i];
  const cands = slot.pinned ? [slot.pinned] : candidates(prev, slot, ctx);
  for (const g of ctx.choose(cands)) {            // weighted shuffle, seeded RNG
    out[i] = g;
    if (fill(slots, i + 1, g, out, ctx)) return true;
    if (--ctx.budget <= 0) return false;          // bounded search
  }
  return false;
}
```

- **Seeded RNG** (mulberry32 or similar): every output records `seed + params +
  db version`, so any piece can be regenerated exactly.
- **Provenance**: for every grouping in the output, record which work and which
  grouping it came from, and every rule that was relaxed. This drives the
  colored view and Emily's learning.

#### Streaming mode (live)

Whole-piece mode fills a complete template and then hands it to the renderer.
Streaming mode composes **one phrase at a time, ahead of the playhead**:

1. On start, compose phrase 1 (pick a phrase template, fill it), plus phrase 2
   as a buffer.
2. When the playhead enters the last buffered phrase, the player sends
   `need next`. The engine composes the next phrase, hooking its first grouping
   to the **destination of the last grouping already queued**, then appends it
   to the queue.
3. **Parameter changes and ratings take effect from the next phrase composed.**
   The delay is one phrase of lookahead (about 2 bars for chorales). Expose
   `lookahead` as a setting with a minimum of 1 bar.
4. **Endless or bounded**: either keep chaining phrase templates indefinitely,
   or end with a final cadence after N phrases (a "piece" length control).
5. If a phrase can't be filled in time, the fallback is to repeat the last
   phrase's cadence pattern, so the music never stops abruptly. Log every time
   this happens.

Filling one phrase takes milliseconds, so the low-priority thread is not a
problem as long as there is one phrase of buffer.

### 4.7 `emi.render`

The engine has three ways out. All three share the score format and provenance.

**1. MIDI file (offline)**

- `lib/emi-smf.js` also **writes** SMF type 1 files: one track per voice, a
  tempo map, and a text meta event holding the seed and parameters. Files go to
  `data/out/<timestamp>-<seed>.mid`, alongside a `.json` provenance file.
- You can drag the file into Live, or `read` it into `[seq]` for quick
  auditioning in standalone Max.

**2. Live clips (offline, M4L only)**

- `[v8 emi.clips.v8.js]` uses the Live API to create a clip in each voice track
  and fill it with `add_new_notes` (start times and durations in beats). The
  details are in §5.
- This is the main offline workflow: compose, listen, edit the notes in Live,
  then rate and accept.

**3. Grid player (live)**

The grid player is a Max-native step sequencer in `[p grid-player]`, locked to
the transport:

- **Clock**: `[metro 16n @quantize 16n]` runs on the transport (Live's
  transport inside M4L). On each tick, `[transport]` gives the current position,
  and the player converts it to a **step index** (one step per 16th note).
- **Queue**: a named `[dict]` (`emi.queue`) keyed by step index. Each entry lists
  note-ons and note-offs as `[voice, pitch, velocity]`, with velocity 0 for
  note-off.
  - JS writes into the queue ahead of time, and the player only reads from it.
  - Note-offs are explicit events rather than `[makenote]` durations, so a tempo
    change mid-note doesn't break anything.
- **Output**: one outlet per voice. The host shell connects these to
  `[noteout]` (standalone) or to `[send emi.voice.N]` (M4L, §5).
- The player also sends the current grouping index to `emi.view` for
  highlighting, and `need next` back to `emi.compose`.
- **Resolution**: the chorales are quantized to 16ths, so a 16th grid is exact.
  Other repertoire may need a finer grid (32nd) or per-event offsets through
  `[pipe]`.
- **Panic**: on transport stop, send note-offs for every sounding note, and clear
  or rewind the queue.

### 4.8 `emi.view` (UI)

- A piano roll in `[v8ui]` (or `[jsui]`), with **notes colored by source work**,
  a **SPEAC lane** under the roll, and **seam markers** that flag relaxed rules.
- **Click to inspect a grouping**: its source, tension, labels and the
  alternative candidates that were available at that point. This is the main
  debugging tool and later the selection tool for Emily's ratings.
- In M4L, show a compact version in the device (`[v8ui]` fits in the device
  strip), and open the full view in a floating window (`[pcontrol]` / `open`).

---

## 5. Ableton Live and Max for Live

### Device layout in a Live set

```
Live set
├── MIDI track "EMI"       [emi.brain.amxd]            engine + UI + grid player + clip writer
├── MIDI track "Soprano"   [emi.voice.amxd  voice 1] → instrument
├── MIDI track "Alto"      [emi.voice.amxd  voice 2] → instrument
├── MIDI track "Tenor"     [emi.voice.amxd  voice 3] → instrument
└── MIDI track "Bass"      [emi.voice.amxd  voice 4] → instrument
```

- **`emi.brain`** is a MIDI effect device that contains `emi.engine`. Its panel
  has three sections: database (load and save), compose, and Emily.
  - **Offline**: a **Compose** button writes one clip per voice track.
  - **Live**: a **Play** toggle starts the grid player, synced to Live's
    transport.
- **`emi.voice`** is tiny. It contains `[receive emi.voice.N]` → `[midiformat]`
  → `[midiout]`, plus a voice-number menu. In M4L, `[midiout]` is what sends
  MIDI into the track; `[noteout]` doesn't. Each voice gets its own instrument, mixer channel and
  effects.
- **Simplest setup**: if you only want one track, `emi.brain` sends all four
  voices out of its own `[midiformat]` → `[midiout]` into one instrument (organ,
  strings).
- **Recording a live performance**: Live doesn't record MIDI that a device
  generates on its own track. Create a second track with *MIDI From* set to the
  voice track (Post FX), arm it, and record there.

### Clip writing (Live API, from `[v8]`)

```js
// emi.clips.v8.js (sketch): write one voice into the first empty slot of a track
function writeVoice(trackIndex, notes, lengthBeats, clipName) {
  const track = new LiveAPI("live_set tracks " + trackIndex);
  const slotCount = track.getcount("clip_slots");
  for (let s = 0; s < slotCount; s++) {
    const slot = new LiveAPI("live_set tracks " + trackIndex + " clip_slots " + s);
    if (Number(slot.get("has_clip")) === 0) {
      slot.call("create_clip", lengthBeats);
      const clip = new LiveAPI(slot.unquotedpath + " clip");
      clip.call("add_new_notes", { notes });   // [{pitch, start_time, duration, velocity}]
      clip.set("name", clipName);              // e.g. "EMI seed 42"
      return;
    }
  }
}
```

- **Finding the voice tracks**: look tracks up **by name** (`Soprano`, `Alto`,
  `Tenor`, `Bass`, configurable) instead of by index, so moving tracks around
  doesn't break anything.
- **Requirement**: the `add_new_notes` note API needs **Live 11 or later**.
- **When to call the Live API**: only after `[live.thisdevice]` has banged, and
  never from the scheduler (high-priority) thread. `[v8]` runs on the main
  thread, so calling from there is fine.
- **Signal the source**: name and color each clip with its seed, so a clip can
  be traced back to its provenance file.

### Max for Live gotchas to design around

- **All devices in a Live set share one Max instance.** Named `[send]`,
  `[receive]`, `[dict]` and `[v8]` globals are visible across devices. That is
  what lets brain talk to voice, and also why everything internal to a device
  should use the `---` prefix (for example `---emi.queue`), which makes the name
  unique to that device instance.
- **Use `live.*` UI objects** (`live.dial`, `live.numbox`, `live.menu`,
  `live.text`) for every control that should be saved with the set, automated or
  MIDI-mapped. This includes temperature, seed, match level, lookahead and the
  rating buttons. Mapping 👍/👎 to a footswitch or pad works naturally this way.
- **Data lives outside the device.** Freezing a device embeds its JS and
  abstractions, but the databases (`.json`) and Emily's memory are files that
  change at runtime. Keep them in a user folder such as
  `~/Documents/ml_midi/{db,out,emily}`, with a default database loaded on
  startup and a **Load** button for others.
- **Tempo and meter come from Live.** Read them with `[live.observer]` on
  `live_set tempo`, `signature_numerator` and `signature_denominator`, and
  refuse to play when Live's meter differs from the database's meter.

---

## 6. Repository layout

The layout follows Max Project conventions, so that a `.maxproj` at the root
puts all of these folders on the search path.

```
ml_midi/
├── ml_midi.maxproj
├── PLAN.md
├── patchers/            emi.main.maxpat (standalone shell), emi.engine.maxpat,
│                        emi.ingest.maxpat, … emily.feedback.maxpat
├── devices/             emi.brain.amxd, emi.voice.amxd (Max for Live)
├── code/
│   ├── emi.ingest.v8.js   emi.analyze.v8.js   emi.compose.v8.js
│   │   emi.clips.v8.js   … (glue only)
│   └── lib/               emi-smf.js  emi-model.js  emi-quantize.js  emi-key.js
│                          emi-segment.js  emi-tension.js  emi-speac.js
│                          emi-signatures.js  emi-lexicon.js  emi-compose.js
│                          emi-rng.js  emily-assoc.js
├── data/
│   ├── corpus/          source .mid (start: ~20 Bach chorales, 4/4, major)
│   ├── db/              analyzed databases (.json)
│   ├── out/             generated .mid + provenance .json
│   └── emily/           weight snapshots
├── tests/               node --test  (golden tests against Cope's book examples)
├── tools/               node CLI: analyze-corpus, compose-batch
└── package.json         dev-only: test scripts, no runtime deps
```

**Module sharing between Max and Node.** `[v8]` `require()` follows CommonJS 1.0:
export by assigning to `exports.foo` and **don't** reassign `module.exports`.
Max finds modules **by bare name on the search path**. Give every module a
unique prefixed name (`emi-tension`) and require it by that bare name, so the
same line works in both environments. In Node, set
`NODE_PATH=code/lib node --test tests/` so bare names resolve there too.
Confirm this works in M0 before writing anything else.

**Minimal wrapper shape**

```js
// code/emi.compose.v8.js — glue only
autowatch = 1;
inlets = 1;
outlets = 2;                                  // 0: results   1: status

const compose = require("emi-compose");
const params = { seed: 1, matchLevel: 0, template: null, temperature: 1 };
let db = null;

function load(dictName) {
  db = JSON.parse(new Dict(dictName).stringify());
  outlet(1, "status", "groupings", db.groupings.length);
}

function param(key, value) { params[key] = value; }

function run() {
  if (!db) { outlet(1, "error", "no database loaded"); return; }
  const score = compose.run(db, params);
  new Dict("emi.score").parse(JSON.stringify(score));
  outlet(1, "done", "emi.score");
}
```

---

## 7. Emily layer: scope options

The Emily layer comes in three tiers. Each tier builds on the one before it, and
you can stop after any of them.

### Tier 1: Taste (learning your preferences)

| | |
|---|---|
| **You** | Rate a selection 👍 or 👎 (offline), or rate the phrase that just played (live, mapped to a pad or footswitch). |
| **It learns** | Weights in an association network of musical features. |
| **It changes** | *Which* of the valid candidates gets chosen. The rules and the source material stay the same. |
| **Limit** | It can only choose among what the Bach database already contains. The result is a Bach recombiner that knows your taste. |
| **Effort** | One milestone. |

How it works:

1. **Ratings.** The provenance tells us exactly which groupings, transitions,
   signatures and template produced the rated region.
2. **Association network** (`lib/emily-assoc.js`). This is a sparse map of
   weights keyed by **features**, not just individual groupings, so feedback
   generalizes to material that hasn't been rated:
   - `g:<grouping>` for a specific grouping, and `t:<a>><b>` for a specific
     transition between two groupings
   - `w:<work>` for preference toward a source work
   - `f:speac:A>C`, `f:tension:high`, `f:leap:>5`, `f:susp:4-3`,
     `f:density:16ths`, and other musical features
   - `tpl:<work>` for templates and `sig:<id>` for signatures
3. **Learning rule**: for each feature present in a rated region,
   `w ← w + lr · r`. Between sessions, every weight decays toward 0 with
   `w ← (1 − λ) · w`, so early opinions don't harden.
4. **Selection**: in `emi.compose`, `P(candidate) ∝ exp((base + Σ w_features) / T)`.
   **T ("temperature" or "adventurousness")** is a `live.dial` that you can
   automate.

### Tier 2: Memory and drift (Emily builds her own corpus)

| | |
|---|---|
| **You** | Also **accept** the pieces or phrases you want Emily to keep. |
| **It changes** | Accepted music becomes source material, tagged `gen: n`. This adds new forms (templates), new SPEAC patterns, and **Emily's own signatures**: patterns that recur across *her* accepted output rather than across Bach's. |
| **Effort** | About two milestones. Most of that is the variation operators described below. |

**The catch.** An accepted piece is built from Bach beats that are already in
the database. Feeding it back mostly adds new forms and transitions, not new
sounds. For the style to actually move away from Bach, Emily needs **variation
operators** that make material Bach never wrote:

- **Melodic**: add passing or neighbor tones, simplify a line, invert a
  fragment, move a voice by an octave.
- **Rhythmic**: augmentation and diminution, syncopation, anticipations.
- **Harmonic**: re-voice a chord, substitute a chord with the same bass and
  SPEAC function, add chromatic inflections.
- **Phrase**: extend, compress, or sequence (repeat a grouping a step higher or
  lower).

A variant enters the lexicon only if it passes the voice-leading checks and you
accept it.

**Controls**

- **Mix**: how much the original corpus counts compared with Emily's own output.
  The corpus has a minimum share it can't drop below.
- **Novelty**: how often Emily tries a variant.
- **Snapshots and rollback**: one file per session in `data/emily/*.json`.

**Risk**: a feedback loop can narrow the style until everything sounds like what
you liked last week. Decay, the mix floor and the novelty quota guard against
this.

### Tier 3: Conversation (text directions)

You type directions such as "more tension before the cadence", "less like Bach",
"slower harmonic rhythm" or "end in minor". Emily changes **parameters and
weights in response, never the notes directly**. There are two ways to build
this:

| | 3a: Phrase table | 3b: LLM interpreter |
|---|---|---|
| **How** | About 50 phrases in JS, each mapped to parameter changes | `[node.script]` (Node for Max) sends your text plus the parameter list to an LLM API. It gets back JSON parameter changes, which are checked before they're applied. |
| **Pros** | Works offline, predictable, instant | Understands free phrasing and can explain its choices |
| **Cons** | Fixed vocabulary | Needs an API key and network access. Each request takes 1–3 s (fine between phrases) and has a cost. |
| **Effort** | Small | Small to medium |

A cheap extra in either version: Emily can answer **"why?"** from the
provenance. For example: "this phrase takes 5 beats from 4 chorales; the cadence
is a signature found in 9 works."

### Out of scope

- **Training neural networks.** Emily's learning is the weighted association
  network above, which you can inspect and roll back.
- **Composing without a corpus.** Even in Tier 2, everything starts from
  analyzed music.

### Recommendation

- **Core**: Tier 1 + Tier 2 (milestones M9 and M10).
- **Later**: Tier 3a once the parameter set has settled. Tier 3b is optional.
- **Separate feature**: Alice-style continuation (play a phrase on a MIDI
  keyboard and it continues in style) belongs to live mode, not Emily (M11).

---

## 8. Milestones

Each milestone produces something you can listen to and ends with a written
acceptance check. Live integration (M4–M5) deliberately comes **before** SPEAC
and signatures. That way you're making music in Live early, and the later
milestones raise the quality without changing the plumbing.

| # | Milestone | Done when |
|---|-----------|-----------|
| **M0** | **Setup and three spikes**: Max project, repo layout, Node tests, corpus | (a) The same `emi-hello` module gives the same result in `[v8]` and in `node --test`. (b) `[v8]` in an M4L device writes a 1-bar clip through the Live API. (c) A grid player plays a hard-coded 4-voice pattern into 4 Live tracks, in sync. |
| **M1** | **Ingest round-trip**: SMF in → events → SMF out, plus a minimal piano roll | 20 chorales round-trip with identical notes; key normalization verified by ear |
| **M2** | **Naive recombination** (whole piece): beat groupings, `L0` voice-hooking, the different-source rule, a fixed length, ending on a cadence | 32-beat chorales with no broken voices at seams; the exported `.mid` plays in Live |
| **M3** | **Form**: templates, phrase lengths, cadence slots, backtracking, match-level relaxation | Output keeps the template's phrase structure; the dead-end rate is under 5% |
| **M4** | **Into Live, offline**: `emi.brain` + `emi.voice` devices | **Compose** writes S/A/T/B clips to tracks found by name; controls are `live.*` parameters saved with the set |
| **M5** | **Into Live, streaming**: phrase-by-phrase composition, grid player, endless or N-phrase pieces | Parameter changes are heard from the next phrase; no dropped or stuck notes at 60–160 BPM, including stop/start and tempo changes |
| **M6** | **Tension and SPEAC**: three-level labels, label-matched recombination, SPEAC lane in the view | Golden tests reproduce Cope's book examples within tolerance |
| **M7** | **Signatures**: detection UI, pinning, lookahead hooking (also used in streaming) | Known Bach cadential formulas show up as signatures and appear in output at cadences |
| **M8** | **Hardening**: provenance view, plagiarism guards, parallel-5ths report, minor mode, 3/4 | A blind A/B listening test against real chorales; quotation metrics under threshold |
| **M9** | **Emily Tier 1, taste**: rating buttons (mappable), association weights, temperature | After about 10 rating sessions, output measurably shifts toward the liked features |
| **M10** | **Emily Tier 2, memory and drift**: accept-to-database, variation operators, mix and novelty, snapshots | Accepted variants appear in later output; a rollback restores an earlier taste exactly |
| **M11** | **Stretch**: Emily Tier 3 (text), Alice-style continuation from a MIDI keyboard, a second style | — |

**First corpus**: about 20 Bach chorales in 4/4, major mode, with each
voice on its own track. The `music21` corpus has all of them; a one-time
`music21` script can export them to per-part MIDI. These pieces are public
domain, but check the license of whichever **encoding** you use.

---

## 9. Risks and decisions

| Risk | Mitigation |
|------|------------|
| **Voice separation** in piano music (e.g., Chopin mazurkas, which are much harder than chorales) | Start with corpora that have separate voices. Later options are melody/bass/inner-texture voicing, or Cope's "texture-hooking" (matching texture and rhythm instead of exact voices). |
| **Lexicon too sparse** (few or no candidates, long quotes) | More works; match-level relaxation; statistics showing dead-end entries; keep the corpus homogeneous in meter and mode. |
| **Too literal** (sounds like Bach chorale #N) | Different-source rule, run-length guard, n-gram quote guard, variety in template choice. |
| **Modulation** | v1 only works with groupings that happen to modulate in their source. v2 adds key-area labels to templates and transposes groupings locally. |
| **UI freezes in `[v8]`** | Chunked `Task` jobs with progress; heavy analysis offline in Node; only the fast composition step runs live. |
| **Timing jitter** | Never schedule playback from JS. JS fills the queue, and a transport-locked Max player reads it (§4.7). |
| **Streaming runs dry** (the next phrase isn't ready in time) | Keep at least one phrase of lookahead; fall back to repeating the cadence pattern; log every fallback. |
| **Stuck notes** on stop, tempo change or device edits | Explicit note-off events; send a panic on transport stop and when the device is removed; track sounding notes per voice. |
| **Shared Max namespace in Live** (two brains, or clashing names) | Use the `---` prefix for everything device-internal. Only the `emi.voice.N` sends are global. |
| **Live API threading and timing** | Create Live API objects only after `[live.thisdevice]`; call them from `[v8]` (main thread), never from the scheduler. |
| **SPEAC thresholds** | Make every constant a parameter stored in the database settings; compare against Cope's published examples (golden tests). |

---

## 10. Open questions

1. **Emily scope**: confirm Tier 1 + Tier 2 as the core (§7). For Tier 3,
   choose 3a (phrase table), 3b (LLM), or neither.
2. **Live version**: 11 or later? Clip writing uses the Live 11 note API.
3. **macOS or Windows?** This only matters for the virtual MIDI port the
   standalone shell uses (IAC vs. loopMIDI).

---

## 11. References

**Books**

- Cope, D. *Computers and Musical Style* (1991). Introduces EMI, signatures and
  pattern matching.
- Cope, D. *Experiments in Musical Intelligence* (1996).
- Cope, D. *The Algorithmic Composer* (2000). Includes **SARA**, a simplified
  EMI with Lisp source code. This is the closest blueprint for this project.
- Cope, D. *Virtual Music: Computer Synthesis of Musical Style* (2001). Includes
  Hofstadter's essay explaining voice-hooking and texture-hooking.
- Cope, D. *Computer Models of Musical Creativity* (2005). Covers SPEAC,
  association networks and the background to Emily Howell.
- Cope, D. *Hidden Structure: Music Analysis Using Computers* (2008).

**Code and papers**

- Python port of Cope's SPEAC and pattern-matching Lisp:
  https://github.com/GolzitskyNikolay/SPEAC-analysis (no license; read only).
- Cope's patent on recombinant composition: US7696426B2,
  https://patents.google.com/patent/US7696426
- Maxwell & Eigenfeldt, *The MusicDB: A Music Database Query System for
  Recombinance-based Composition in Max/MSP* (ICMC 2008). Prior art done in Max.
- da Silva, *David Cope and Experiments in Musical Intelligence*. An overview of
  SPEAC and recombinance.
- Fernández & Vico, *AI Methods in Algorithmic Composition: A Comprehensive
  Survey* (2013), https://arxiv.org/abs/1402.0585

**Max documentation**

- `[v8]` reference: https://docs.cycling74.com/reference/v8
- `require()` in Max JS: https://docs.cycling74.com/api/latest/max8/vignettes/jsrequire
- Max 9.0.1 release notes ("v8 require: improved Common JS module support").
- Live Object Model (LOM) reference and the `LiveAPI` JavaScript docs, both in
  the Max documentation: clip slots, `create_clip`, `add_new_notes`.
