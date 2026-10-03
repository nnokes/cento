# Cento — an EMI / Emily Howell–style composer in Max + [v8]

*(Called ml_midi until after M11: see the README.)*

This is a working plan for a recombinant composition system in the style of
David Cope's **Experiments in Musical Intelligence (EMI)**, with an **Emily
Howell**–style interactive layer added later. It is built in Max, with MIDI in
and out, one sub-patch per component, and the algorithms written in JavaScript
running in `[v8]`.

### Decisions so far

| Question | Decision |
|----------|----------|
| Max version | **Max 9**, so `[v8]` (modern JS) is available everywhere |
| Live version and OS | **Live 12, macOS**. Clip writing uses the Live 11+ note API; the Max version reaches other apps through the IAC Driver |
| First style | **Bach chorales**: about 20 in 4/4, major mode, one voice per track |
| Workflow | **Both**: offline (compose a whole piece, then listen and edit) and **live** (compose phrase by phrase ahead of the playhead) |
| Output | **MIDI**, into **Ableton Live** |
| End state | **Two products from one engine**: a **Max version** (patch or macOS app) and a **Max for Live version** (devices). Both are first-class and built in parallel from M0 (§2) |
| Emily scope | **Tier 1 (taste) + Tier 2 (memory and drift)** as the core; **Tier 3a** (phrase table) later; **3b** (LLM) optional (§7) |
| Audience | **Personal use for now**, so no signing, notarization or Live Pack yet. The **GitHub repo is public** from the start (§6.1) |

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

### One engine, two products

There are **two deliverables**, and both are first-class:

- **Cento for Max**: a standalone Max patch (optionally built into a macOS
  app).
- **Cento for Live**: Max for Live devices.

Both are built from the same host-agnostic abstraction, **`emi.engine`**. The
engine never touches MIDI ports, transports or Live. Everything that differs
between the two hosts is confined to one thin **host adapter** per product:

| Concern | `emi.host.max` (Max version) | `emi.host.live` (M4L version) |
|---------|------------------------------|-------------------------------|
| **Startup** | `[loadbang]` | `[live.thisdevice]` |
| **MIDI out** | Per voice: a `[vst~]` instrument hosted in Max (AU/VST3, fed with `midievent` messages), or `[noteout]` on channels 1–4 to hardware or to another app via the IAC Driver | `[send emi.voice.N]` → `cento.voice` devices, or the brain's own `[midiout]` (§5) |
| **MIDI in** (continuation, keyboard rating) | `[notein]` / `[ctlin]` from any port | the track's MIDI input (`[midiin]`) |
| **Transport, tempo, meter** | Max's global `[transport]` with its own play/stop, tempo and meter controls | Live's transport; meter read with `[live.observer]` |
| **Offline result** | `.mid` file, auditioned with `[seq]`; drag it into any DAW | Clips written into the voice tracks (Live API), plus the `.mid` file |
| **Corpus import** | `[dropfile]` / folder | `[live.drop]` / folder / **Import from Live** (one scene = one work) |
| **Saving settings** | `[pattrstorage]` presets (JSON). *As built in M4:* one remembered state in `patchers/cento.settings.json`, restored when the patch opens | `live.*` parameters saved with the set; `.adv` presets. *As built in M4:* plus the last corpus, from the same settings file |
| **Instruments** | Hosted in Max (`[vst~]`) or external | Live's tracks |

Both versions share **`~/Documents/cento/`** for databases, output and
Emily's memory. Taste Emily learns in one product carries over to the other.

### Why not "Max first, port later" or "M4L first, open in Max"?

- **Max first, port at the end**: the Live-specific parts (Live API, Live's
  transport, sending to tracks) would be designed last. If one of them needs
  something from the engine, the engine changes late, which is the most
  expensive point to change it.
- **M4L first, open in Max**: Max can open and host `.amxd` devices. But the
  Live API, Live's transport and track MIDI routing don't exist outside Live,
  so every one of them needs a fallback anyway. That fallback layer *is* the
  Max adapter, just hidden inside a device instead of designed on purpose. The
  Max version would also inherit device constraints it doesn't need, such as
  the 169 px device strip.
- **The chosen approach is "designed to port" taken to its conclusion**: both
  shells exist from M0, so there is never a port step. Day-to-day development
  happens in the Max version, which is faster to iterate. The Live version is
  checked at every milestone.

### Rules that keep the two versions in step

1. **Nothing host-specific inside `emi.engine`.** The engine talks only through
   its inlets and outlets and the shared dicts. If a feature needs the host
   (transport position, Live clips, ports), it goes through the adapter's
   interface.
2. **The adapter interface is a short list of messages:**
   - Engine → adapter: `voice <n> <pitch> <velocity>`, `score-ready <dict>`,
     `status …`.
   - Adapter → engine: `play` / `stop`, `tempo <bpm>`, `meter <n> <d>`,
     `import <dict>`.

   The step clock (`[metro 16n @quantize 16n]` on the global `[transport]`)
   lives in the engine, because it behaves the same in both hosts: inside Live,
   Max's transport *is* Live's transport. The difference is who drives it. The
   Max adapter has its own play, stop and tempo controls; the Live adapter just
   follows Live.
3. **UI panels are shared `[bpatcher]`s built with `live.*` objects.** These
   work in plain Max as well, and they work with `[pattrstorage]`. Each panel is
   designed at **device height (169 px)**. The Live device shows the panels
   side by side in its strip; the Max version shows the same panels in a larger
   window, plus the full-size debug view.
   *As built in M4:* `emi.panel` (300 px) holds the composing controls and the
   status line in both products. Seed, beats, form and original key are
   `live.numbox` / `live.text` parameters. Each host adapter keeps only its
   own controls: 232 px in Max (transport, output, `[vst~]`), 170 px in Live
   (clips, voice routing). Both show the piano roll on the right; the device
   is 846 px wide.
   The engine keeps the settings file. It writes nothing until `startup` has
   read the file, so values that controls send while a patch loads can't
   overwrite it. `startup all` (Max) restores every setting; `startup corpus`
   (Live) only reloads the last corpus, because Live restores the controls.
   Both then compose the current seed, so the piece comes back with the same
   notes.
4. **Parity check at each milestone.** From M4 onward, a milestone is done only
   when its feature works in **both** products, or when the gap is written into
   the feature table above as intentional.

### Shipping the Max version

*Planned for M12* (§8, "M12 in detail"): the app, in a zip on GitHub
Releases, unsigned at first.

- **As a patch**: anyone with Max 9 clones the repo and opens
  `patchers/cento.maxpat`. No search-path setup is needed.
- **As a macOS app**: Max can build a patch into a standalone application
  that runs **without Max installed**. Include the starter database; the
  scripts are already single-file bundles (§5.4). To share the app beyond your own Mac, it needs code signing
  and notarization; otherwise macOS Gatekeeper will block it.
- **Sound**: `[vst~]` hosts AU or VST3 instruments directly in the patch (one
  per voice). Alternatively, send to hardware, or to Live, Logic and other apps
  over the IAC Driver.

### Data flow

```
 ~/Documents/cento/corpus/*.mid
        │
 ┌──────▼───────┐   dict emi.corpus   ┌──────────────┐   dict emi.db  (+ db/*.json)
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
cento.maxpat  (Max version)                 cento.brain.amxd  (Live version)
├── [emi.host.max]                            ├── [emi.host.live]
│     ├── [p transport]   play/stop/tempo     │     ├── [p live-sync]    live.observer: tempo, meter
│     ├── [p midi-out]    noteout ch 1–4      │     ├── [p voices]       send emi.voice.N / midiout
│     ├── [p midi-in]     notein / ctlin      │     ├── [p clip-writer]  emi-clips.js (Live API)
│     ├── [p instruments] vst~ ×4 (optional)  │     ├── [p import-live]  scene → corpus
│     ├── [p presets]     pattrstorage        │     └── [p layout]       panels in the device strip
│     └── [p layout]      panels + big view   │
└── [emi.engine]  ◀──── same file ────────▶   └── [emi.engine]

[emi.engine]                                  host-agnostic: everything below
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
    │     └── [p grid-player]          transport-locked step player → voice events
    ├── [emi.view]   (bpatcher)        piano roll colored by source work, SPEAC lane, seams
    └── [emily.feedback] (bpatcher)    👍/👎 selection or last phrase, temperature, accept
```

*As built in M2:* one `[v8 emi.core]` script in `emi.engine` does the work of
`emi.ingest`, `emi.compose` and `emi.render` for now (load, compose, export,
clip writing), with the logic in `code/lib` and `code/max`. It splits into
the separate abstractions above when a stage needs its own progress or
cancelling (analysis in M6, streaming in M5). The piano roll is `emi.view`, a
`[v8ui]` that the hosts show next to their panels.
*As built in M9:* `emily.feedback` is `emily.panel`, a bpatcher beside
`emi.panel` in both products (like, dislike, temperature, taste, forget).
Selections are dragged in `emi.view`, which now has an outlet to the
engine. Emily's logic is `code/lib/emily-assoc.js`, used by `emi.core`.
The panel's **window** button opens `emi.window`, the floating window §4.8
planned. It holds a large `emi.view` (the same script; its lettering grows
with its size) and `emi.taste`, Emily's taste in full. It is an abstraction
in the top patch, opened with `[pcontrol]` (from `[s ---emi.window]`), so it
works the same in Max and in Live. Both rolls get the same `view` messages,
and a selection made in either is drawn in both (`view highlight`).
The taste pane's **weights** tab (an **edit weights** button at first) is a
weight editor:
- **A slider per musical feature**, from -3 to +3. Dragging one *pins* the
  feature at that value (`pin`). Ratings go on teaching her learned weight
  underneath, and fading never moves a pin. Double-clicking releases the
  pin (`unpin`).
- **A strength slider**, from 0 to 2, scales her whole taste (`strength`).
- **release all pins** releases them all at once.
- **store taste** and **recall taste** save her whole taste to a file of
  your choice and bring it back (`storetaste`, `recalltaste`). The taste
  replaced by a recall is kept in the backup file. This is a first step
  toward M10's snapshots.

The editor lives only in the pop-up. It draws its own sliders rather than
using `live.*` objects, so it adds no Live parameters (nor automation).

**Conventions**

- **Shared data goes through named `[dict]`s**: `emi.corpus`, `emi.db`,
  `emi.score`, `emi.params`, `emily.weights`. Use `[send]`/`[receive]` only for
  control messages, under one prefix such as `emi.ctl.*`.
- **Every `[v8]` wrapper has one inlet and one outlet**, and uses the same
  message protocol. Inputs are verbs: `load <dict>`, `run`,
  `param <key> <value>`, `cancel`. Every output starts with a selector
  (`status <text>`, `progress <0..1>`, `done <dict>`, `error <text>`, or a
  destination such as `coll …`), and the patch sorts them with `[route]`.
  *Learned in M0:* in Max 9, a `[v8]` box must also carry a `textfile` entry
  naming its script (`{"filename": "…bundle.js", "embed": 0}`). Without it,
  `[v8]` starts with an empty embedded script: no error on load, then
  `no function bang`, and only its default single inlet and outlet, so Max
  deletes cords to any other outlet. Max writes `textfile` itself when you
  create the box by hand; it only matters for generated patches.
  One inlet and one outlet per wrapper keeps cords safe even if a script fails
  to load. `tests/patches.test.js` checks both rules.
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

*As built in M3:* L0 and L1 only. L1 keys the upper voices by pitch class and
the bass exactly, and ignores whether a voice is held or re-struck. A grouping
found at L1 has its upper voices moved by octaves so each starts exactly where
the previous beat's voice went, within the corpus's range for that voice and
without new voice crossings. On the full corpus, forms fill with 1% dead ends
(§4.6), so L2 and L3 aren't needed yet.

**Signature**

```js
{ id: "sig:17", voice: "soprano", intervals: [-1, -2, 2, ...], rhythm: [...] | null,
  occurrences: [{ work, start, phrasePos, beatsToCadence }], spanGroupings: 3 }
```

**Template (form)**: one per work, a list of slots:

```js
[{ beatInBar, speac: {beat, bar, phrase}, cadence, phraseIndex, signatureSlot? }, ...]
```

*As built in M3* (`code/lib/emi-form.js`): one slot per beat, from the work's
first sounding beat to its last: `{ rest: true }` for a silent beat (32 of the
142 chorales rest for a beat after some cadences), otherwise `{ beatInBar,
cadence, bass, first, afterRest, last }`. `bass` is the pitch class a cadence
chord stands on. SPEAC labels and signature slots come in M6 and M7.

**Database file** (`~/Documents/cento/db/<style>.json`): `{ version, settings, works, groupings,
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
- **Importing inside the device (M4L)**: you can drop `.mid` files or a folder
  onto the device (`[live.drop]`), or use **Import from Live**. That option reads
  clips from the Live set through the Live API (`get_notes_extended`) and treats
  **one scene as one work**, with one track per voice. You can then audition,
  trim and fix any corpus piece in Live before it is analyzed.
- **Normalize**
  - **Quantize** to a grid (a 16th by default), plus a "fix micro-overlaps" pass;
    Cope's code has `fix-triplets` for the same reason.
  - **Separate voices.** For chorales, use one track or channel per voice. For
    other music this is hard; see §9 Risks.
  - **Key-normalize**: take the key from key-signature meta events if they exist,
    otherwise use Krumhansl–Schmuckler key finding. Then transpose to C major or
    A minor and store the offset.
  - **Filter**: keep only works in the target meter and mode (to start, 4/4
    major only). *As tested in M5:* the 153 minor chorales in 4/4 work as
    well (`--mode minor`, into their own folder). They move to A minor, and
    composed pieces are labelled A minor. *As built in M8:* a corpus may
    mix them (`--mode any`, 295 chorales): each piece is all major or all
    minor, in its template's mode and from that mode's chorales only;
    signatures are found per mode, and a stream keeps to its first
    chorale's mode. 3/4 works too (`--meter 3/4`: 20 major chorales, 12
    minor); the player takes its bar length from the transport's time
    signature, and the hosts set that from the music's meter.
- **Output**: `dict emi.corpus` and a per-work report (key, meter, voices,
  warnings).
- **Corpus files as exported** (`tools/export-chorales.py`): type-1 MIDI at
  960 ticks per quarter, track 0 for tempo and meter, tracks 1–4 for S/A/T/B,
  all on channel 1, so voices are identified by **track**, not channel.
  Pickups are padded so time 0 is always a barline. A JSON sidecar per file
  carries the fermatas (phrase ends), the padding, the key and the source.
  Of the 142 major-key chorales in 4/4, two (`bwv36.4-2`, `bwv432`) have four
  notes each off the 16th-note grid (32nds); the player moves them to the
  nearest 16th. Composing uses the notes as written.

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

*As built in M6* (`code/lib/emi-tension.js`, `code/lib/emi-speac.js`):

- **Golden tests pass.** Cope's published analyses are reproduced exactly:
  the book's eight-beat example at every step (beats, chord ratings, roots,
  tensions, labels), and his analysis of Chopin's Mazurka Op. 33 No. 3 at
  all four levels (`tests/speac.test.js`; the Chopin data is read from a
  local clone of the reference repo, `EMI_SPEAC_REF`).
- **Exactness** needs Cope's 32-bit float sums, his root finder (it scans
  the chord's interval pairs in a particular order) and his beat grouping
  (chords joined by held notes). Also, his phrase averages are *truncated*
  to hundredths, not rounded.
- **For chorales**, the engine's beats are emi-segment's groupings (one per
  metric beat). A beat with passing notes counts its least dissonant chord,
  as Cope's does, and its length is one beat. Phrases end at fermatas, as
  in emi-stream. Three labels per beat: **beat** (among its phrase's beats,
  Cope's foreground), **bar** (bar averages within the phrase) and
  **phrase** (phrase averages within the chorale). On the 142 major
  chorales: E 44%, S 21%, P 20%, A 12%, C 3% at beat level.
- **Matching** (§4.6): a form's slot asks for its template beat's label.
  Requiring every label exactly fills only 26 forms in 100. So the second
  relaxation step *prefers* labels (they're tried first) while keeping
  every hook exact. The result: 95 pieces in 100 with exact voice-leading
  throughout, and 63% of beats keeping their template's label (33% by
  chance; 47% vs 20% for P, A and C).

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

*As built in M7* (`code/lib/emi-signatures.js`): a narrower first version,
aimed at the "done when" (cadential formulas).
- **What is compared**: the last 3 notes of each voice going into every
  cadence (fermata) chord, as exact intervals (no amount off, no rhythm). A
  pattern of one repeated note doesn't count.
- **Threshold**: a pattern is a signature when it ends cadences in at least
  max(3, 5% of the works). Unifications and the fuzzy pass are left for
  later.
- **Occurrences**: each one is stored as the run of the work's groupings
  from the pattern's first note to its cadence (2 to 5 beats, rarely more),
  which §4.6 places whole.
- **Speed**: detection runs when the lexicon is built, in about 40 ms for
  142 chorales, so it needs no `Task`.
- **Result**: 76 signatures in the 142 major chorales. The strongest are
  bass 4-5-1 (99 chorales), alto 1-7-5 (96), tenor 5-4-3 (94) and soprano
  3-2-1 (92). In the 153 minor chorales there are 78, led by soprano b3-2-1
  (91) and bass 4-5-1 (89).

### 4.5 `emi.analyze/lexicon` and templates

- Build the four match-level indexes from §3.
- **Templates**: each work's slot sequence with its SPEAC labels, cadences,
  phrase lengths and the locations of its signatures.
- **Database statistics** for the UI: how many candidates are available per key,
  and which entries have **no exits**, meaning dead ends.
- *As built in M11:* the corpus is a list of folders (`emi-corpora`), each
  switched on or off in the corpus window (`emi.corpora`, opened by the
  panel's **corpora** button, which replaced **load corpus**). The lexicon is
  built from every folder that is on: a chorale in two folders is used once
  (from the first), the corpus keeps the first folder's meter (a folder in
  another meter is listed as not used, with the reason), and chorales from
  two or more folders are put in file-name order, so `corpus` and
  `corpus-minor` together compose exactly as `corpus-both`. Each folder is
  read once (until **rescan**). A change is shown at once and built on the
  next turn (`later corpusbuild <id>`, only the last of quick changes), then
  the seed shown is composed again (a stream restarts: its state points
  into the old corpus); a change that leaves the same chorales builds
  nothing. The list (with each folder's chorales, meter and modes) is in the
  settings file as `corpora`; the old single `corpus` is still written, and
  read when there is no list. `corpus <folder>` still loads one folder
  alone.

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

- **Option: compose backward.** Cope's patent describes a *retrograde*
  method: fill from the ending toward the beginning. Starting each phrase at its
  cadence makes the hardest constraint (land on a good cadence) automatic, and
  backtracking happens near the start of the phrase, where it's least audible.
  This needs a second lexicon index, by `destination`, so you can ask "what can
  come *before* this grouping?". Build it so `fill` can run in either direction
  and compare the results by ear in M3.
  *Not built in M3:* before searching, a backward pass over the template
  finds which groupings can still reach every later cadence, and the forward
  search only enters those. That already makes cadences land, with 1% dead
  ends.
- *As built in M3:* the seed picks the template. On a dead end the rules relax
  in this order: exact hooks (L0), then octave moves (L1), then a cadence on
  any bass note. *M6* puts SPEAC first: exact hooks with exact labels, then
  exact hooks with labels preferred, then octave moves, then any cadence
  bass. Only then is another template tried. A piece records its
  template, how far it relaxed, and each octave-moved beat in its provenance.
  On the full corpus, out of 100 seeds: 95 strict, 3 with octave moves, 2
  with any cadence bass; 1 dead end, which took another template.
- *As built in M7:* steps 2 and 3 are one search.
  - **Blocks**: a cadence slot may take a *signature block*, an occurrence's
    groupings kept whole, from a work other than the template's. The block
    must carry a soprano or bass signature, and each of its groupings must
    fit its slot (labels aside).
  - **Lookahead hooking**: the backward pass counts, for every slot and
    grouping, how many blocks can still be placed after it. The forward
    search tries the candidates that leave room for the most first, so the
    beat before a block is chosen to hook exactly into it.
  - **Order**: strong blocks start as soon as they can. A block is strong
    when it carries a soprano or bass signature found in at least half as
    many works as the strongest signature. Other blocks start as late as
    they can, so they stay short.
  - **Labels give way**: the strict-labels step is skipped when "labels
    preferred" can place more blocks with the same voice-leading.
  - **Results** (full corpus, 100 seeds): 91% of cadences get a block, and
    27% of beats come from blocks. 98 pieces in 100 are strict or "labels
    preferred". 56% of beats keep their template label, against 62%
    without signatures.
  - **Bach's formulas**: pieces use soprano 3-2-1 and bass 4-5-1 at 18% of
    cadences each; Bach uses them at 20% and 21%.
  - **Streams** place blocks at 76% of phrase cadences.
  - **Off switch**: with signatures off, the composer gives exactly M6's
    pieces.
- *As built in M8* (`code/lib/emi-quality.js`, steps 5 and 6):
  - **Quotation**: two measures per piece.
    - The longest run of beats in order from one chorale (signature blocks
      are such runs, on purpose).
    - The longest run of notes in one voice, pitch and rhythm, also found in
      that voice of one chorale.
  - **Guard**: a piece over 8 beats or 16 notes is set aside, and the next
    template is tried. If every template tried is over, the piece that
    quotes least is kept and marked. Long quotes came from tunes Bach
    harmonized more than once.
  - **Quotation results** (full corpus, 100 pieces): the longest melody
    quote is 14 notes, median 9. Each of Bach's chorales shares a median of
    9 notes with the others. Streams stayed at or
    under 16 notes in 400 phrases, so they aren't guarded.
  - **Parallel fifths and octaves**: two voices moving the same way from a
    perfect fifth or octave to another, not after a rest and not by octave
    leaps. Each is checked against the source chorales.
  - **Parallels results**: in 100 pieces there are 37, all of them Bach's
    own (he has 34 in his 142 chorales). Exact voice-hooking carries every
    seam's motion over from a source, so recombination adds none.
  - **Provenance** (`emi-provenance`): each beat's source in words, for
    the piano roll's hover view, and as a record written next to an
    exported `.mid`.
  - **After the first listening test** (9 of 10 right, chance 0.011):
    pieces matched Bach beat by beat but not as wholes. Three changes:
    - **Repeats** (`markRepeats`): where the template repeats a melody
      phrase (77 of the 142 chorales do, mostly A A B bar form), the piece
      repeats its own phrase. A second backward pass, made once the
      original's first beat is placed, steers the beats before the repeat
      into it. The cadence just before a repeat takes no signature block.
      35 of the 42 pieces whose template repeats now repeat.
    - **Score**: the backward pass now maximizes a score instead of only
      counting blocks.
      - Each signature block counts most, a strong one a little more.
      - Per beat: the template beat's accidentals (the modulation cues,
        such as an F#, found on 19% of beats), its SPEAC label where labels
        are preferred, a
        soprano within the template melody's range, and a small seeded
        random amount, so each seed has its own best path.
    - **Measured** against Bach (first test → now):
      - notes outside the key 2.2% → 3.0% (Bach 4.5%);
      - soprano range 15.0 → 12.6 semitones (Bach 12.3);
      - labels kept 56% → 62%.
      Pieces in the same form share about 20% of their beats across seeds.
  - **Listening test** (`emi-abtest`, `emi-abtest-page`): 10 pairs, each a
    chorale and a piece in its form, both in the chorale's key, with Bach
    as A in half the pairs. The page plays them with Web Audio and scores
    the guesses with a one-sided binomial test. Pass: listeners can't pick
    Bach out more often than guessing would (p > 0.05).
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

*As built in M5* (`code/lib/emi-stream.js`):

- **Phrase templates.** Each chorale's form is split at its cadences: a
  phrase runs from its first beat with new notes through its cadence and any
  held or silent beats after it. The 142 major chorales give 979 phrases,
  8 beats long on average.
- **Choosing phrases.** A stream walks one chorale's phrases in order, then
  another chorale's, chosen by the seed. Each phrase is filled like a whole
  form, with the same relaxation steps. Its first beat hooks to the previous
  phrase's last beat. If the next phrase's first beat doesn't follow on in
  the bar, silent beats fill the gap and it starts like a phrase after a
  rest. If no phrase can be filled, the stream takes a *breath*: one silent
  beat, then a fresh phrase start. On the full corpus that's about 4% of
  phrase joins, with no failures in 400 phrases. A stream uses each grouping
  once, within its last 64 phrases.
- **Ending.** A bounded stream's last phrase is a chorale's last phrase,
  ending on its final chord. If none fits at that point, an ordinary phrase
  is queued and the ending is tried again on the next phrase.
- **The engine** queues two phrases at the start. It tells the player to
  send `need` when the second one starts, and so on. The `need` message
  crosses from the scheduler thread through `[deferlow]`. Phrase joins in
  the queue keep note-offs before note-ons.
- **Changes from the next phrase.** Each phrase is drawn from its own seed
  and number, so streams are reproducible. Transpose and the phrase count
  apply to phrases composed after the change, which are heard after the one
  already queued. A new seed, **compose** or **next** starts a new stream at
  the next bar.

### 4.7 `emi.render`

The engine has three ways out. All three share the score format and provenance.

**1. MIDI file (offline)**

- `lib/emi-smf.js` also **writes** SMF type 1 files: one track per voice, a
  tempo map, and a text meta event holding the seed and parameters. Files go to
  `~/Documents/cento/out/<timestamp>-<seed>.mid`, alongside a `.json` provenance file.
- You can drag the file into Live, or `read` it into `[seq]` for quick
  auditioning in the Max version.

**2. Live clips (offline, M4L only)**

- `code/max/emi-clips.js` (called by the engine's `[v8]` script) uses the Live
  API to create a clip in each voice track and fill it with `add_new_notes`
  (start times and durations in beats). The details are in §5.
- This is the main offline workflow: compose, listen, edit the notes in Live,
  then rate and accept.

**3. Grid player (live)**

The grid player is a Max-native step sequencer in `[p grid-player]`, locked to
the transport:

- **Clock**: `[metro 16n @quantize 16n @active 1]` runs only while the
  transport plays (Live's transport inside M4L). A counter turns its ticks
  into a **step index** (one step per 16th note), and `stop` rewinds it to 0.
  *As built in M0*, playback therefore always starts at step 0. M5 reads the
  transport position instead, so playback can start mid-song aligned to the bar.
  *As built in M5:* on every tick the player asks `[transport]` for bars,
  beats and units and turns them into a step. When the transport starts (or
  the engine sends `restart`, after a new piece is queued), the queue's step
  0 is anchored to the next barline at or after the step. After a restart
  while the transport runs on, it's the barline strictly after, so the new
  queue is always written before it plays. A step that isn't the previous
  step + 1 (Play, or a jump of the playhead) sends note-offs first and always
  anchors at or after the step, because Live's play message can arrive after
  the first tick. 4/4 only, for now: 16 steps a bar.
  *As fixed after M10 (the false start):* a piece could play its first
  chords, then go back to the beginning, sometimes twice. Two causes, both
  fixed. (1) The queue's step was the transport's step minus the origin, so
  a transport that jumped back while playing (Ableton Link realigning Max's
  global transport at its start, Live's position settling) replayed the
  queue from there. Now a jump while the queue plays moves the origin with
  it (by the jump - 1), so the queue goes on to its next step, with no
  note-offs (the queue's own note-offs still come). Only play, stop and
  restart find a new origin. (2) Live's play came from a `live.observer` on
  the main thread, often a few 16ths after the transport started: the player
  had already begun the piece, and the late play started it again at the
  next bar (the "rest after the first chords"). The Live host no longer
  sends play: Live's stop (or loading the device) gets the player ready,
  and the first tick finds the barline. Max's Play still sends play, before
  it starts the transport. `tests/patches.test.js` runs the player's wiring
  tick by tick (`simulatePlayer`), and reproduces the old stutter.
  *As built in M11:* the end of a piece. With each piece the engine sends
  `endat <step>`, the step of its last note-offs (for a stream, once its
  last phrase is queued, or where its queue ends if it runs out; 999999
  for never). Each time the queue reaches that step the player sends
  `ended` (on the main thread, through `[deferlow]`), so a piece played
  again ends again. The Max version's Play is now one play/stop button
  (`live.text`: green "play", red "stop"); `ended` sets it back to play,
  which stops the transport as clicking it would. Live ignores `ended`: it
  follows its own transport.
- **Queue**: a `[coll ---emi.queue]` keyed by step index. Each entry is a flat
  list of `voice pitch velocity` triples, note-offs first, with velocity 0 for
  note-off. (`[coll]` was chosen over `[dict]` because an int in, list out
  lookup is the simplest reliable read on the scheduler thread.)
  - JS writes into the queue ahead of time, and the player only reads from it.
  - Note-offs are explicit events rather than `[makenote]` durations, so a tempo
    change mid-note doesn't break anything.
- **Output**: `voice <n> <pitch> <velocity>` from the engine's outlet, through
  one `[flush]` per voice so `stop` can release sounding notes. The host
  adapter routes these to `[vst~]` or `[noteout]` (Max version), or to
  `[send emi.voice.N]` (Live version, §5).
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
- *As built (after M10):* a playhead. The grid player sends its step in the
  queue (`view playhead <step>`, -1 when stopped or before a restarted queue
  begins) to both rolls, which draw a line there. It follows Max's or Live's
  transport, and in a stream it follows each phrase as the roll moves on.
- *As built after M11:* the panels' roll is 400 px wide (360 before). Over
  the SPEAC lane, a box explains the letter under the mouse (S, P, E, A, C:
  what it means, and how emi-speac gives it from tension), in both rolls.
- *As built (after M10):* hover help. Every control a player sees (55 in the
  patches) has `hint` (Max's tooltip), and `annotation` with
  `annotation_name` (Max's Clue window, Live's Info View), from one table in
  the patch generator, which also writes `docs/controls.md`; a patch test
  checks that every visible control has it and the page agrees. The window's
  taste pane draws its own: resting on a weight slider, a setting slider or a
  button shows a box saying what it does (each musical feature with what it
  means).
- *As built (after M10):* the window's taste pane has tabs (overview,
  weights, memory), which replaced the window's **edit weights** and
  **memory** buttons. The
  taste comparison (twenty pieces: 1.6 s on 142 chorales, 3.4 s on 295, all
  on Max's main thread) now runs a piece at a time: the engine sends
  `later tastestep <id>`, which comes back through `[deferlow]`, so the
  patch stays responsive between pieces; the pane shows its progress
  (`emilyview comparing <done> <pairs>`). A rating or a new corpus stops it.
  **reload seed** in the window composes the seed shown again, to hear what
  a change to mix, novelty or the weights did.
- **Click to inspect a grouping**: its source, tension, labels and the
  alternative candidates that were available at that point. This is the main
  debugging tool and later the selection tool for Emily's ratings.
- In M4L, show a compact version in the device (`[v8ui]` fits in the device
  strip), and open the full view in a floating window (`[pcontrol]` / `open`).
- *As built in M2:* the roll shows the current score (a chorale, colored by
  voice, or a composed piece, colored by source chorale), with bar lines and a
  bright line at each seam where the source changes. Clicking, the SPEAC lane
  and the floating window come later.

---

## 5. Ableton Live and Max for Live

### 5.1 Device layout in a Live set

```
Live set
├── MIDI track "EMI"       [cento.brain.amxd]            engine + UI + grid player + clip writer
├── MIDI track "Soprano"   [cento.voice.amxd] → instrument   the track's name picks the voice
├── MIDI track "Alto"      [cento.voice.amxd] → instrument
├── MIDI track "Tenor"     [cento.voice.amxd] → instrument
└── MIDI track "Bass"      [cento.voice.amxd] → instrument
```

- **`cento.brain`** is a MIDI effect device that contains `emi.engine`. Its panel
  has three sections: database (load and save), compose, and Emily.
  - **Offline**: a **Compose** button writes one clip per voice track.
  - **Live**: the grid player follows Live's transport, and a **Play through
    voices** toggle lets its notes through to the voice devices. It is off by
    default, so playing written clips doesn't also send every note a second
    time.
- **`cento.voice`** is tiny. It contains `[receive emi.voice.N]` → `[midiformat]`
  → `[midiout]`, where N comes from the **track's name** (Soprano, Alto, Tenor
  or Bass; also S/A/T/B, any case). Clip writing finds tracks by the same rule,
  so a track's clips and its live voice always agree. *Learned in M2:* the
  first version had a Voice menu on each device instead; set wrong, it sent
  the soprano and bass to the wrong tracks. In M4L, `[midiout]` is what sends
  MIDI into the track; `[noteout]` doesn't. Each voice gets its own instrument, mixer channel and
  effects.
- **Simplest setup**: if you only want one track, `cento.brain` sends all four
  voices out of its own `[midiformat]` → `[midiout]` into one instrument (organ,
  strings).
- **Recording a live performance**: Live doesn't record MIDI that a device
  generates on its own track. Create a second track with *MIDI From* set to the
  voice track (Post FX), arm it, and record there.

### 5.2 Clip writing (Live API, from `[v8]`)

```js
// code/max/emi-clips.js (sketch; the repo has the full version): write one
// voice into the first empty slot of a track
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
- **When to call the Live API**: only in response to a message once the device
  is running (a click, or a request from the engine), never in a script's
  top-level code and never from the scheduler (high-priority) thread. `[v8]`
  runs on the main thread, so calling from a `[v8]` message handler is fine.
- **Signal the source**: name and color each clip with its seed, so a clip can
  be traced back to its provenance file.

### 5.3 Max for Live gotchas to design around

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
  change at runtime. Keep them in `~/Documents/cento/` (§6), with the
  starter database loaded on startup and a **Load** button for others.
- **Tempo and meter come from Live.** Read them with `[live.observer]` on
  `live_set tempo`, `signature_numerator` and `signature_denominator`, and
  refuse to play when Live's meter differs from the database's meter.

### 5.4 Shipping the Max for Live version

Everything the engine uses works inside a device: `[v8]`, `[dict]`, file I/O,
`Task`, `[v8ui]`, the transport, the Live API, and Node for Max (needed only for
Emily Tier 3b). Because the Live adapter is built alongside the Max one from M0,
there's no porting step at the end. These are the things to handle:

| Concern | Plan |
|---------|------|
| **Max version inside Live** | `[v8]` needs Max 9. Recent Live 12 releases bundle Max 9 (12.2.1 onward, according to Ableton's release notes); earlier 12.x releases bundled Max 8.6. **To check yours**, open any device in the Max editor and choose *Max → About Max*. If it shows 8.x, either update Live or point Live at your own Max 9 installation (*Settings → File & Folder → Max Application*). Anyone you share the devices with needs the same. |
| **Live edition** | Live Suite, or Standard plus the Max for Live add-on. |
| **Freezing and `require()`** | Frozen devices are known to break when one JS file `require()`s another: Max can miss the nested dependency, and the error only shows when the editor is open. The fix: keep `code/lib` modular for development and tests, but **load only bundles in Max**. `npm run build` (`tools/build.js`, no dependencies) produces one self-contained `patchers/*.bundle.js` per wrapper, and every patch references those, during development too. Max never runs `require()` at all. The M0 spike checks this: freeze the device, copy it to a folder with no project files, and load it in a fresh set with the editor closed. |
| **Starter database** | Freeze a prebuilt `bach-chorales.json` into `cento.brain`, so the device makes music straight away with no setup. User databases and Emily's memory still live in `~/Documents/cento/`. *Planned for M12*: the release ships the corpus itself in a `Cento` folder (if its terms allow), and a first run adds it. |
| **Analysis inside Live** | Analysis runs in chunks (`Task`) with a progress bar. Live's audio isn't affected, but Max device UIs are sluggish while it runs, and the engine can't compose the next phrase, so **don't analyze while performing**. 20 chorales should take seconds; a few hundred works, perhaps a minute. Node stays a development tool for bulk runs and tests. |
| **Per-set state** | Numeric controls are `live.*` parameters, so they are saved with the set and as device presets (`.adv`). Non-numeric state, such as which database file is loaded, needs a short spike: either store it with the set, or fall back to "last used database" in the user folder. |
| **Distribution** | Freeze both devices. Put them in a folder, or build a **Live Pack** with a demo set (five tracks, devices already in place). *Planned for M12* (§8, "M12 in detail"): a zip on GitHub Releases with the frozen devices, a demo set and the starter corpus; a Live Pack later. |

In the Live version, Live's instruments, mixer and effects make the sound, and
the devices only produce MIDI. The Max version hosts its own instruments
(`[vst~]`) instead. That is the only real difference in what each product
contains.

### 5.5 Optional: a Live 12 MIDI Tool

Live 12 added **MIDI Generators and Transformations** to the clip view, and Max
for Live can build them with `[live.miditool.in]` / `[live.miditool.out]`. A
small extra device could reuse `emi.engine`:

- **EMI Generate**: fills the selected clip with a chorale that fits the clip's
  length, with all voices in one clip (one instrument).
- **EMI Continue**: continues whatever is in the clip from its last beat, in
  style. This is an offline version of the Alice-style continuation.

It would use the database that `cento.brain` already loaded (through the shared
global `emi.db` dict), or the frozen starter database if no brain is present.
MIDI Tools work on one clip at a time, so separate instruments per voice still
go through `cento.brain`. This is a stretch item (M14).

---

## 6. Repository layout

**Everything Max loads is in one folder, `patchers/`**: patches, devices and
the generated script bundles. Max always searches the folder of the patch or
device it opens, so a fresh clone works with no setup. *Learned in M0:* with
the bundles in a sibling `javascript/` folder, Max reported `can't find file`.
For the **Live version during development**, the repo's `patchers/` folder is
added to Live's Max search path once (*Options → File Preferences*, from a
device editor inside Live); cloning the repo straight into
`~/Documents/Max 9/Packages/` also works.
*Learned in M0:* a Max for Live device is a project; it finds files in its
project and on the search path, not other files in its own folder (`bpatcher:
error loading patcher emi.brain.maxpat`). Max doesn't follow symbolic links,
so linking a clone into Packages doesn't work either. Frozen devices need
none of this, because freezing embeds everything. (A `.maxproj` was dropped: Max Projects can reorganize folders on
their own.)

```
cento/
├── README.md  PLAN.md  LICENSE  .gitignore  package.json
├── patchers/            EVERYTHING MAX LOADS: cento.maxpat (Max version),
│                        cento.brain.amxd + cento.voice.amxd (Live version),
│                        emi.host.max/live, emi.panel, emi.engine, …
│                        emily.panel (M9), and the generated
│                        *.bundle.js scripts (committed, so a clone just works)
├── code/
│   ├── emi.core.v8.js     the engine's [v8] script (glue only)
│   │   emi.view.v8ui.js   the piano roll; more wrappers as stages split (§2)
│   ├── max/               Max-only helpers: emi-load.js (files, with File and
│   │                      Folder), emi-clips.js (Live clips, with LiveAPI),
│   │                      emi-settings.js (the settings file)
│   └── lib/               emi-smf.js  emi-ingest.js  emi-key.js  emi-queue.js
│                          emi-segment.js  emi-tension.js  emi-speac.js
│                          emi-signatures.js  emi-lexicon.js  emi-compose.js
│                          emi-form.js  emi-stream.js  emi-rng.js  emily-assoc.js
│                          emily-vary.js  emily-memory.js (M10)
├── data/starter/        bach-chorales.json: the prebuilt starter database (§6.1)
├── tests/               node --test, incl. bundles in a simulated [v8] context;
│                        fixtures/ for tiny inputs (Cope's book examples)
├── tools/               build.js (bundler), check-paths.js, hooks/pre-commit,
│                        export-chorales.py (music21, run once), maxgen.py
│                        (writes every patch and device: the master copy of
│                        the patches; development only, not shipped); later
│                        analyze-corpus, compose-batch
├── docs/                milestone checklists (M0-spikes.md, M1-…, M2-…)
└── .github/workflows/   CI: tests, bundle freshness, path check, patches
                         match maxgen.py, on every push

~/Documents/cento/     working data, OUTSIDE the repo (shared by both products)
├── corpus/              your source .mid files
├── db/                  analyzed databases (.json)
├── out/                 generated .mid + provenance .json
└── emily/               Emily's memory and weight snapshots
```

Working data lives **outside the repository**, so personal material (your
corpus files, your output, Emily's taste) can't be committed by accident. The
repository holds only code, patches, tests, and the starter database.

**Module sharing between Max and Node.** Modules use CommonJS: export by
assigning to `exports.foo`, and require other modules by a **bare, prefixed
name** (`require("emi-tension")`). In Node, `NODE_PATH=code/lib` resolves those
names (`npm test` sets it). In Max, `tools/build.js` resolves them at build
time and inlines the modules, so each `patchers/*.bundle.js` is
self-contained. Run `npm run build:watch` while Max is open: `autowatch`
reloads a bundle as soon as it's rebuilt. CI fails if a committed bundle
doesn't match `code/`.

**Minimal wrapper shape**

```js
// code/emi.compose.v8.js — glue only (Max loads patchers/emi.compose.bundle.js)
autowatch = 1;
inlets = 1;
outlets = 1;                     // one outlet; outputs carry a selector

const compose = require("emi-compose");
const params = { seed: 1, matchLevel: 0, template: null, temperature: 1 };
let db = null;

function load(dictName) {
  db = JSON.parse(new Dict(dictName).stringify());
  outlet(0, "status", "groupings", db.groupings.length);
}

function param(key, value) { params[key] = value; }

function run() {
  if (!db) { outlet(0, "error", "no database loaded"); return; }
  const score = compose.run(db, params);
  new Dict("emi.score").parse(JSON.stringify(score));
  outlet(0, "done", "emi.score");
}
```

---

### 6.1 Working in a public repository

- **License.** Add one in M0. **MIT** is the simple, permissive default and is
  common for Max code. Choose **GPL-3.0** instead if you want modified versions
  to stay open source.
- **Corpus files.** The Bach chorales themselves are public domain, but a given
  digital *encoding* (MIDI, MusicXML or kern file) may carry its own license.
  Don't commit corpus files. Commit `tools/export-chorales.py`, which recreates
  them from the `music21` corpus. Commit the **starter database** only after
  checking that the source's terms allow redistribution; until then, the
  script rebuilds it locally.
- **Reference code.** The SPEAC Python port has **no license**: read it, but
  don't copy from it. Cope's own Lisp code ships with his books and is under his
  copyright. Implement from the published descriptions.
- **Cope's patent.** US7696426B2 (recombinant composition) is listed on Google
  Patents as *expired (fee related)*, so an open implementation is not blocked
  by it. The README should say the project is independent, not affiliated with
  David Cope, and cite his books.
- **No secrets in the repo.** The Tier 3b API key comes from an environment
  variable or from a file in `~/Documents/cento/`, never from the repository.
- **No personal paths.** Max sometimes saves absolute paths in patchers (for
  example `/Users/<you>/…` in file references or `[vst~]` plugin state). A
  small check (`tools/check-paths.js`, run in CI and as a pre-commit hook)
  catches them.
- **`.gitignore`** covers: `node_modules/`, `.DS_Store`, `frozen/`,
  built `.app` bundles, and stray `.mid` files (outside `tests/fixtures/`).
  Commit **unfrozen** devices; frozen ones and the built app go into **GitHub
  Releases** if you ever publish them.
- **CI is free for public repos.** Because the core is plain JavaScript, a
  GitHub Actions job can run `node --test` and the path check on every push.
  This is the safety net for the shared engine that both products depend on.
- **README**: what it is, a short demo (an audio clip or GIF), requirements
  (Max 9; Live 12.2.1+ with the bundled Max 9, or Live pointed at Max 9), how to
  build the starter database, and the project status (milestone table).

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

*As built in M9* (`code/lib/emily-assoc.js`; [checklist](docs/M9-checklist.md)):
- **Features**: each beat gets one of each musical kind, from its notes:
  motion (block chords, one moving voice, busy voices), 16th notes,
  suspensions, the soprano's step to the next beat (same, step, leap), the
  chord (major, minor, seventh, diminished, other), chromatic notes, the key
  area (home, dominant, relative, subdominant, other), the melody's register
  and Cope's tension (thirds of the corpus), and the mode in a mixed corpus.
  Exact kinds as planned: `g:`, `t:`, `w:`, `sig:`, `tpl:`. SPEAC labels are
  left out: they belong to the form.
- **Learning**: a whole piece is rarely all one feature, so the rule for
  musical features compares the rated beats with the corpus. Each feature's
  share of the rated beats becomes a z-score against its share of the
  corpus's beats, and `w ← w + 0.25 · r · clip(z, ±3) / 3`. The exact kinds
  use the planned rule, `w ← w + 0.2 · r`. Weights stay within ±3. Decay is
  `w ← 0.9 · w`, once at startup after a session with ratings.
- **Selection**: the search is a backward pass that maximizes a score (M7,
  M8), not a weighted draw, so taste enters that score. Each beat adds 4
  points per unit of taste (an accidental match is 16), a liked transition
  where two beats join, and a liked signature where its block ends; each is
  capped so taste never outweighs a signature block. The template's SPEAC
  label counts double while a taste is in use. Temperature multiplies the
  seeded random part of the score: 1 is exactly M8, 0 removes it. Forms are
  ordered by the planned formula: the seed's shuffle is read as a draw, and
  each form's taste is added as a Gumbel variable.
- **Ratings**: **like** and **dislike** (`live.text` buttons, mappable) rate,
  in this order:
  - the beats dragged across in the piano roll;
  - the stream phrase playing (or the one before, within 1.5 s of a new
    phrase);
  - the whole piece.

  **taste** lists the weights and compares ten seeds with and without them.
  **forget** starts again and keeps one backup. They sit in a shared
  `emily.panel` (130 px) between the panel and the piano roll; the device
  is now 984 px wide (1024 px since the piano roll grew to 400 px, after
  M11).
- **Memory**: `patchers/cento.taste.json` next to the settings file
  (git-ignored), not `~/Documents/cento/emily/`. Max's `File` can't create
  folders, and the settings file already has a known place shared by both
  products. Each product re-reads the file when it changes, so both can be
  open at once.
- **Results** (full corpus; a simulated listener rates ten pieces, then 24
  new seeds are measured): high melodies 52% → 81% of beats, melodic leaps
  15% → 23%, 16th notes 4.3% → 11.2%, and low melodies (disliked) 13% → 2%.
  Suspensions and repeated notes barely move, because few beats with them
  fit the voice-leading. Beats keeping their SPEAC label fall from 61% to
  51–63%.
- **Variety**: pieces in one form share more beats across seeds with a
  taste: 44% at temperature 1, against 29% without. At temperature 2 it is
  33%; at 0, 87%. This is the narrowing the Tier 2 risks warn about;
  temperature is the control for now.

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
- **Snapshots and rollback**: one file per session in `~/Documents/cento/emily/`.

**Risk**: a feedback loop can narrow the style until everything sounds like what
you liked last week. Decay, the mix floor and the novelty quota guard against
this.

*As built in M10* (`code/lib/emily-vary.js`, `code/lib/emily-memory.js`;
[checklist](docs/M10-checklist.md)):
- **Variation operators**: seven, all at the note level, each at one place
  in one or two voices:
  - passing tone, neighbor tone and chromatic passing tone;
  - anticipation (soprano, at cadences);
  - suspension (a dissonance against the bass, resolving down);
  - simplified line;
  - re-voiced chord (alto and tenor swap chord tones).

  A change is kept only if ranges hold, no voices cross, no leap passes an
  octave, and no parallel fifths or octaves appear. Novelty is the chance
  per phrase of one variant: an operator first (each as likely), then a
  place, from the seed. Not built yet: the rhythmic augmentation and
  diminution, and the phrase operators (extend, compress, sequence). They
  change the form, which recombination keeps fixed.
- **Accept** keeps the selection, the stream phrase playing, or the piece
  as a work, with its generation and its variants. Her works join Bach's in
  the lexicon:
  - their beats carry `gen` and `variant`;
  - varied beats keep the entry and exit of the beat they came from, so
    they hook in where it did;
  - Bach's signatures are found in his works alone. Patterns that recur
    across hers but not his are her own signatures.
- **Mix** is a score term in the search, like taste, and a weight on the
  choice of form. At mix 0 the engine composes from a Bach-only database,
  so pieces are exactly as before.
- **Snapshots** hold her whole taste: weights, pins, strength, ratings,
  novelty, mix, and which works are in use. Accepted works are kept forever
  in their own file, so a rollback restores the corpus exactly as well.
  All snapshots live in one file, the last 30, rather than one file per
  session. Like the taste, they are kept in `patchers/`.
- **Results** (full corpus; five varied pieces accepted, then 20 new
  seeds): at mix 0.5, 11% of beats are hers and her variants appear in 11
  pieces; at mix 0.75, 45% and all 20. At novelty 1, about 6.5 variants a
  piece with no new parallels.
- **Cost**: **accept** rebuilds the corpus with the new work, which takes
  about 1.5 s in Node. Max pauses for a second or two.

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

### Chosen scope

- **Core**: Tier 1 + Tier 2 (milestones M9 and M10).
- **Later**: Tier 3a once the parameter set has settled. Tier 3b is optional.
- **Separate feature**: Alice-style continuation (play a phrase on a MIDI
  keyboard and it continues in style) belongs to live mode, not Emily (M14).

---

## 8. Milestones

Each milestone produces something you can listen to and ends with a written
acceptance check. Both hosts (M4–M5) deliberately come **before** SPEAC and
signatures. That way you're making music in both products early, and the later
milestones raise the quality without changing the plumbing.

**From M4 onward, every milestone must pass in both products** (the parity rule
in §2). Work day to day in the Max version, then confirm the result in Live.

**Current status: M11 code done; waiting on its Max and Live checks
([checklist](docs/M11-checklist.md)). Next: M12, shipping Cento to others
for free (below); the second style (Palestrina, now M13) is on hold. M9 and
M10 passed in both products; M8 passed in the Max version and waits on its Live checks and the third
listening test's score ([checklist](docs/M8-checklist.md)).** M0 passed ([results](docs/M0-spikes.md));
its freeze test is deferred to M12 (shipping). M1 passed in both products
([results](docs/M1-checklist.md)): chorales load, play in C or their own key,
and write as Live clips, and 20 chorales round-trip with identical notes.
M2 passed in both products ([results](docs/M2-checklist.md)): new chorales
recombined from all 142 major-key chorales in 4/4 compose for every seed
tried, keep every rule (`tests/corpus.test.js`), show in the piano roll, play
in Max and in Live (as clips or through the voice devices), and export as
`.mid`. The Live checks found one bug, now fixed: voice devices pick their
voice from the track's name, and the brain plays through them only with
**Play through voices** on. M3 passed in both products
([results](docs/M3-checklist.md)): pieces take the form of a chorale from the
corpus (the same phrases, cadences on the same bass notes, the same rests and
ending), and on the full corpus 1 seed in 100 is a dead end (the limit is 5).
M4 passed in both products ([results](docs/M4-checklist.md)): one panel
shared between the products, and settings that survive a reload. M5 passed
in both products ([results](docs/M5-checklist.md)): pieces play from the
next barline wherever Play starts, and stream phrase by phrase, endlessly or
ending on a final cadence after N phrases. M6 passed in both products
([results](docs/M6-checklist.md)): every beat is labelled with Cope's SPEAC
functions (golden tests reproduce his published analyses exactly), beats are
matched by function when recombining, and the piano roll shows a SPEAC lane.
M7 passed in both products ([results](docs/M7-checklist.md)): the corpus's
signatures are found (Bach's cadence formulas: bass 4-5-1 and soprano 3-2-1
among the strongest) and kept whole at the cadences of pieces and stream
phrases, about as often as Bach uses them, with a **sigs** toggle and gold
bands in the piano roll. When a patch or set opens, the last corpus comes back and the
current seed's piece is composed again. M9 passed in both products
([results](docs/M9-checklist.md)): **like** and **dislike** (mappable) teach
Emily which musical features you like, later pieces lean toward them, and the
pop-up window shows and edits her taste. M10 passed in both products
([results](docs/M10-checklist.md)): **accept** keeps music as her own, she
varies it (**novelty**) and composes from it alongside Bach (**mix**), and a
rollback restores an earlier taste exactly; the same checks covered the
playhead, the false-start fix and hover help on every control.

| # | Milestone | Done when |
|---|-----------|-----------|
| **M0** | **Setup, both shells, four spikes**: repo as a Max package, README, LICENSE, `.gitignore`, CI, bundler, corpus export script; `cento.maxpat` and `cento.brain.amxd`, each loading the same `emi.engine` through its adapter | (a) The same `emi-hello` module gives the same result in `node --test` **and in both shells**. (b) `[v8]` in an M4L device writes a test clip through the Live API. (c) A grid player plays a hard-coded 4-voice phrase into 4 Live tracks in sync, and through MIDI ports or 4 `[vst~]` instruments in the Max version. (d) A **frozen** device works with `patchers/` off the search path *(deferred to M11)*. |
| **M1** | **Ingest round-trip**: MIDI reader/writer, ingest with sidecars (pickup padding, fermatas, key), transposition to C major / A minor; load and play a chorale in both products, and write it as Live clips. *(The piano roll moved to M2, where it can show where each beat came from; Live's clip view covers M1.)* | 20 chorales round-trip with identical notes; loaded chorales play in C and in their own key in both products |
| **M2** | **Naive recombination** (whole piece): beat groupings, `L0` voice-hooking, the different-source rule, a fixed length, ending on a cadence; the piano roll view (`emi.view`) colored by source chorale | 32-beat chorales with no broken voices at seams; heard in the Max version, and the exported `.mid` plays in Live |
| **M3** | **Form**: templates, phrase lengths, cadence slots, backtracking, match-level relaxation | Output keeps the template's phrase structure; the dead-end rate is under 5% |
| **M4** | **Both products, offline**: shared `live.*` panels; Max adapter (`.mid` export, `[seq]` audition, `[pattrstorage]` presets); Live adapter (`cento.brain` + `cento.voice`, clip writing) | **Max**: Compose → hear it through `[vst~]` and save the `.mid`. **Live**: Compose writes S/A/T/B clips to tracks found by name. In both, the same seed gives the same notes, and settings survive a reload. |
| **M5** | **Both products, streaming**: phrase-by-phrase composition, grid player, endless or N-phrase pieces | **Max**: its own play, stop and tempo controls. **Live**: follows Live's transport. In both, parameter changes are heard from the next phrase, with no dropped or stuck notes at 60–160 BPM, including stop/start and tempo changes. |
| **M6** | **Tension and SPEAC**: three-level labels, label-matched recombination, SPEAC lane in the view | Golden tests reproduce Cope's book examples within tolerance |
| **M7** | **Signatures**: detection UI, pinning, lookahead hooking (also used in streaming) | Known Bach cadential formulas show up as signatures and appear in output at cadences |
| **M8** | **Hardening**: provenance view, plagiarism guards, parallel-5ths report, minor mode, 3/4 | A blind A/B listening test against real chorales; quotation metrics under threshold |
| **M9** | **Emily Tier 1, taste**: rating buttons (mappable), association weights, temperature | After about 10 rating sessions, output measurably shifts toward the liked features |
| **M10** | **Emily Tier 2, memory and drift**: accept-to-database, variation operators, mix and novelty, snapshots | Accepted variants appear in later output; a rollback restores an earlier taste exactly |
| **M11** | **Corpora**: a corpus window in both products: folders of chorales, each switched on or off (and **only**, **remove**, **add folder**, **rescan**), combined into one corpus: each chorale once, one meter, in file-name order; remembered between sessions | Switching folders on and off changes what pieces are made from, in both products; two folders compose exactly as one folder holding the same chorales |
| **M12** | **Ship to others (free)**: two downloads on GitHub Releases, built on your Mac. **Cento for Live**: frozen `cento.brain` + `cento.voice`, a demo set and the starter corpus. **Cento for Mac**: a standalone app (runs without Max), unsigned at first. Each user's files in a user folder, not `patchers/`; a packaging script; a one-page read-me; a release guide ([docs/releasing.md](docs/releasing.md)). Details below. | Someone with a Mac and Live 12 (or no Max at all, for the app) downloads a zip, follows only the read-me, and hears a piece within five minutes, without git, Python, Node or `tools/`; tried on a clean machine; the freeze test deferred from M0 (d) passes. |
| **M13** | **A second style: Palestrina** *(on hold)*: a style profile per folder (voices, beat unit, modes, how cadences are found); export of music21's Palestrina masses; cadences found from their formulas instead of fermatas; modal keys; SPEAC, signatures and quality checks re-tuned; Bach and Palestrina folders on together | Palestrina pieces keep the style's rules (ranges, dissonance prepared and resolved, cadences where the formulas fall), a blind A/B test against real Palestrina, and with both styles on, the joins between them are reported |
| **M14** | **Stretch**: Emily Tier 3a (text), Live 12 MIDI Tool (§5.5), Alice-style continuation from a MIDI keyboard | — |

### M12 in detail: shipping Cento to others (free)

**What people download.** Each release on GitHub's Releases page has two zips
attached (GitHub adds the source code as a zip too; that one is for
developers). Nobody needs git, Python, Node, or anything in `tools/`.

| Download | Contents | What they do | What they need |
|---|---|---|---|
| **Cento for Live** | frozen `cento.brain.amxd` and `cento.voice.amxd`; a demo set (five tracks: the brain, and Soprano, Alto, Tenor and Bass with Live's own instruments and **Play through voices** on); the `Cento` folder (starter corpus); `Read me first`; `LICENSE` | unzip; put the `Cento` folder in Documents; open the demo set; press Play | Live 12 Suite (or Standard + Max for Live), with Max 9 (12.2.1 onward bundles it) |
| **Cento for Mac** | `Cento.app` (built from `cento.maxpat`; it plays through the Mac's built-in AU DLS Synth); the `Cento` folder; `Read me first`; `LICENSE` | unzip; move the app to Applications and the folder to Documents; open the app (the first time: right-click, Open); press **play** | macOS; no Max |

What isn't shipped: `tools/`, `tests/`, `code/` (frozen devices and the app
carry the bundles), `docs/`, `PLAN.md`, `.github/`, `package.json`, and your
own settings and Emily files.

**The work, in order.**
1. **The starter corpus.** The biggest hurdle today is installing Python and
   music21 to export the chorales. First confirm that music21's Bach chorale
   files may be redistributed (§6.1), and record the answer there. If they
   may, the `Cento` folder ships `corpus/` (the 142 major chorales, MIDI and
   JSON sidecars) and `corpus-both/`, and a first run with no corpora adds
   `Documents/Cento/corpus` by itself. If not, find an encoding that may be
   shared, or keep the export as an optional step and ship without one.
2. **A user folder.** Settings, Emily's taste, her works and snapshots live
   in `patchers/` today; a frozen device or an app has no writable
   `patchers/`. They move to `~/Documents/Cento/`. Max's `File` can't make
   folders, so the folder comes in the zip (the read-me says where to put
   it); with no folder there, the status line says so, and nothing is
   saved. Files in `patchers/` from development carry over once, as the
   `ml_midi` files did. To decide at the start: whether a "choose your
   Cento folder" dialog is worth it as a fallback.
3. **Frozen devices and the freeze test** (M0 (d)): freeze both devices in
   Max, copy them to a folder with nothing else, load them in a new set
   with the editor closed. Then the demo set, saved with *Collect All and
   Save*.
4. **The app**: *File > Build Collective / Application* in Max, from
   `cento.maxpat`. Unsigned at first: the read-me explains right-click, Open.
   Signing and notarization (Apple Developer Program, $99 a year) can come
   later, so it opens with no warning.
5. **A packaging script** (`npm run package`, on your Mac): makes
   `dist/Cento-for-Live-vX.Y.Z.zip` and `dist/Cento-for-Mac-vX.Y.Z.zip` from
   the frozen devices, the demo set, the app, the `Cento` folder, the read-me
   and the licence. `dist/` is git-ignored. CI can't do steps 3 and 4 (they
   need Max on a Mac); everything else it can check.
6. **The read-me** (one page, for people who aren't developers): what Cento
   is, what to install, first piece in five steps, where files go, how to
   remove it, known issues, and that it's independent of David Cope.
7. **A clean-machine test**: a fresh user account on your Mac (or a friend's
   Mac), following only the read-me.
8. **The release**: tag `main` (`v0.1.0`, marked as a pre-release: a beta
   for a few people first), attach the zips, publish. Then a **Download**
   link at the top of the README. Every later release follows
   [docs/releasing.md](docs/releasing.md).

**Later, if it's wanted**: a signed app; a Live Pack (one file that installs
the devices and the demo set into Live's browser); Windows (Max and Live run
there, but nothing has been tried); Max's Package Manager.

**First corpus**: about 20 Bach chorales in 4/4, major mode, with each
voice on its own track. The `music21` corpus has all of them, and
`tools/export-chorales.py` exports them to per-part MIDI in
`~/Documents/cento/corpus/`. See §6.1 for licensing.

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
| **Something private or unlicensed ends up in the public repo** (corpus files, personal paths, an API key, copied reference code) | Working data lives outside the repo; `.gitignore`; path check in CI and a pre-commit hook; corpus rebuilt by script; implement from published descriptions (§6.1). |
| **The two products drift apart** (a feature lands in one only) | All logic in `emi.engine`; adapters stay thin; shared `live.*` panels; parity rule from M4; one parity checklist used for every milestone. |
| **Live's bundled Max is 8.x** (no `[v8]`) | Check *About Max* in M0; use Live 12.2.1+ or point Live at Max 9. State the requirement when sharing the devices. |
| **Frozen device can't find `require()`d modules** | Max only ever loads single-file bundles from `patchers/`; the M0 freeze spike proves it before any real code depends on it. |
| **Live API threading and timing** | Use the Live API only from `[v8]` message handlers after the device is running (never at load, never from the scheduler). |
| **Generated `[v8]` boxes load no script** (found in M0: missing `textfile`) | Every generated `[v8]` box carries `textfile`; one inlet and one outlet per wrapper; `tests/patches.test.js` checks both. |
| **SPEAC thresholds** | Make every constant a parameter stored in the database settings; compare against Cope's published examples (golden tests). |

---

## 10. Open questions

1. **License**: MIT (recommended) or GPL-3.0? This is needed for M0, since the
   repo is public from the start.

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
