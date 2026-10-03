# M0 checklist: the four spikes

## Result: M0 passed (macOS, Max 9, Live 12)

| Spike | Max version | Live version |
|---|---|---|
| (a) `hello` prints `627 2 527 981`, same as `npm test` | ✅ | ✅ |
| (b) `testclip` writes one 2-bar clip per voice track | n/a | ✅ |
| (c) `pattern` + Play: in sync, clean stop, no hanging notes | ✅ (AU DLS Synth) | ✅ |
| (d) frozen device works on its own | n/a | deferred to M13 (shipping; M11 when this was written) |

Fixed along the way (details in PLAN.md and the commit history):

- Generated `[v8]` boxes need a `textfile` entry naming their script.
- `[receive]` with a name typed in has no inlet.
- Standalone Max searches the opened patch's folder; a Max for Live device
  doesn't search its own folder, and Max ignores symbolic links. Live needs
  `patchers/` added in *Options → File Preferences*.

The checklist below is kept as a record and for re-testing.

M0 proves the architecture before any real music code depends on it. Some of
it was verified when the code was written; the rest needs Max and Live on
your Mac.

**Already verified (and re-checked by CI on every push):**

- The engine modules and the three bundled `[v8]` scripts pass `npm test`
  (30 tests). The bundles are also loaded in a simulated `[v8]` context with
  no `require()`, which proves they are self-contained.
- The clip writer was tested against a fake Live set (track lookup by name,
  first empty slot, the "no empty slot" error).
- Every patch is valid JSON, and every patch cord connects to an inlet or
  outlet that exists. `tests/patches.test.js` also checks the rules found on
  first open: every `[v8]` box names its script in a `textfile` entry, cords
  only to and from inlet 0 and outlet 0 of a `[v8]`, and no cords into a named
  `[receive]`.
- `tools/export-chorales.py` exported 20 chorales: all at 960 ticks per
  quarter, pickups padded to a barline, and all 10,342 note events on the
  16th-note grid.

**Not yet verified:** that Max and Live accept the hand-generated patches and
devices, and everything below. The patches were written without Max, so
expect a few small fixes. Copy any error text from the Max window into your
reply.

---

## 0. One-time setup

1. **Clone the repository** anywhere (GitHub Desktop's `~/Documents/GitHub`
   is fine).
2. **Put `patchers/` on Live's search path** (once; the Max version doesn't
   need this):
   - In Live, drop a *Max MIDI Effect* on a track and click *Edit*.
   - Choose *Options → File Preferences*, click **+**, then *Choose* and
     select the repo's `patchers` folder.
   - Restart Live. To check: type `emi.engine` into an object box in a device
     editor. A solid box with one inlet and one outlet means it worked.

   **What M0 taught us about finding files:**
   - Standalone Max searches the folder of the patch it opens.
   - A Max for Live device is a project. It finds files in its project and on
     the search path, **not** other files in its own folder (`bpatcher: error
     loading patcher emi.brain.maxpat`).
   - Max doesn't follow symbolic links, so linking a clone into Packages
     doesn't work. Cloning straight into `~/Documents/Max 9/Packages/` is the
     other option that does.
   - `a project without a name is like a day without sunshine. fatal.` appears
     even for a fresh, unsaved device. It is harmless.
3. **Node** (for tests and building the bundles): install Node 20 or later
   (`brew install node`), then in the repo run:
   ```sh
   npm test
   npm run hooks     # pre-commit check for personal paths and stale bundles
   ```
4. **Corpus** (optional for M0, needed for M1):
   ```sh
   python3 -m venv .venv && .venv/bin/pip install music21
   .venv/bin/python tools/export-chorales.py
   ```
   This writes 20 chorales to `~/Documents/cento/corpus/`.

---

## (a) Same engine, same answer, everywhere

`npm test` pins `hello` with seed 1 to the numbers **627 2 527 981**.

- [ ] **Max version.** Open `patchers/cento.maxpat` and click **hello**. The
      status line should read `hello emi 0.0.0 seed 1 check 627 2 527 981`.
- [ ] **Live version.** After setting up the devices in (b), click **hello**
      in the `cento.brain` device. You should see the same line.

If a `[v8]` object reports that it can't find `emi.hello.bundle.js`, check
that the bundles are in `patchers/` (they're committed; `npm run build`
recreates them).

## (b) `[v8]` writes clips through the Live API

1. [ ] **Check the Max version inside Live.** Open any Max device in the
       editor and choose *Max → About Max*. It must say **9.x**. If it says
       8.x, update Live (12.2.1 or later bundles Max 9), or point Live at your
       Max 9 (*Settings → File & Folder → Max Application*).
2. **Build the set.** Create five MIDI tracks named **EMI**, **Soprano**,
   **Alto**, **Tenor** and **Bass**. Put an instrument on each voice track.
3. **Add the devices.** In Live's browser, add the repo folder under
   *Places → Add Folder*. Then drag `patchers/cento.brain.amxd` onto the EMI track, and
   `patchers/cento.voice.amxd` onto each voice track. On each voice device, pick
   that track's voice in the menu.
   - [ ] **The provided `.amxd` files load.** They were generated by script,
         so this is the first thing to check. If Live refuses one, use the
         fallback below.
   - Once a device loads, open it in the editor and save it once, so Max
     rewrites the file in its own format. Commit that version.
4. [ ] Click **testclip**. Four 2-bar clips named `EMI test-cadence` should
       appear, one in the first empty slot of each voice track. Launch them:
       you should hear a cadence in C (I IV V I | ii6 V I).
5. [ ] Rename the Bass track to something else and click **testclip**
       again. This time one clip with all 28 notes should appear on the EMI
       track.

If nothing happens, open the brain device in the editor and look at the Max
window. The two most likely culprits are the form of `new LiveAPI(path)` and
the argument format for `add_new_notes`. Both are one-line fixes in
`code/emi.clips.v8.js`.

**Fallback: building a device by hand.**

1. Create a new *Max MIDI Effect* on the track and click its *Edit* button.
2. Delete the default `[midiin]` and `[midiout]`. The patch already has its
   own; keeping both would double every note.
3. Create an object box containing `bpatcher emi.brain.maxpat`.
4. In the Inspector, turn on *Include in Presentation*, and set the
   presentation size to **400 × 169** (**120 × 169** for `emi.voice.maxpat`).
5. Turn on *Open in Presentation* for the device patcher.
6. Save over `patchers/cento.brain.amxd` (or `patchers/cento.voice.amxd`).

## (c) The grid player, in sync

The status line should read `queued test-cadence 8 steps` after **pattern**.

**Max version** (`patchers/cento.maxpat`):

1. [ ] Choose **AU DLS Synth 1** (the Mac's built-in General MIDI synth) in
       the Output menu. Click **pattern**, then turn on **Play**. The cadence
       plays once at 100 BPM.
2. [ ] Turn Play off and on again. The cadence plays again from the start.
3. [ ] Turn Play off in the middle of the cadence. No notes should hang.
4. [ ] Turn on **vst~ instead**. Click **plug 1** to **plug 4** and choose an
       instrument for each voice. Turn on audio with the speaker button, then
       play. Each voice should sound on its own instrument.
5. [ ] Optional: choose **IAC Driver Bus 1**, then in Live set four tracks'
       *MIDI From* to the IAC bus, on channels 1–4. Playing from Max then
       drives Live. (Enable the IAC Driver in *Audio MIDI Setup* first.)

**Live version:**

6. [ ] Click **pattern** in the brain device. Press Live's Play **from the
       start of a bar**. Each voice track should play its own voice, in time
       with Live's metronome.
7. [ ] Stop in the middle of the cadence. No notes should hang.
8. [ ] Change the tempo and play again. The cadence should still be in sync.
9. [ ] Turn on **All voices on this track** with an instrument on the EMI
       track. The EMI track should play all four voices too.

**Known limitation (fixed in M5):** playback always starts at step 0 when the
transport starts, wherever the playhead is. Start from a bar line for now.

**If the Max window fills with messages from `[coll]`** on steps that have no
notes, report it. The fix is to store empty steps in the queue.

## (d) A frozen device works on its own

**Deferred to M13** (shipping; numbered M11 when this was written), where frozen devices are needed. Until then
the devices run unfrozen from `patchers/`. The steps below are kept for M13.

*Freezing* packs everything a device uses (its patches and scripts) into the
`.amxd` file itself, so it runs without the repo or any search-path setup.
That's how the Live version will ship (M13). It's tested now because frozen
devices are known to miss JavaScript files loaded with `require()`, which is
why every script is a single bundle.

1. [ ] Open `cento.brain.amxd` in the editor and click **Freeze** (the snowflake
       in the editor's toolbar). Use *File → Save As* to save it into
       `frozen/` at the top of the repo. That folder is git-ignored; frozen
       devices go into GitHub Releases. Do the same for `cento.voice.amxd`.
2. [ ] **Take `patchers/` off the search path**, so the frozen devices can't
       quietly load the originals. In a device editor, open *Options → File
       Preferences* and remove (or untick) the `patchers` entry. Restart Live.
       Check: an object box with `emi.engine` should now be dashed.
3. [ ] Open a new set, set up the five tracks again, and drag in the
       **frozen** devices from `frozen/`. Don't open the editor.
4. [ ] **hello**, **pattern** with Play, and **testclip** still work.
5. Put the `patchers` entry back in File Preferences and restart Live.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
text from the Max window. If you can, also save over the generated devices and
patches once from Max: the `.maxpat` diff then shows what Max changed, which
helps correct these hand-written files before M1.
