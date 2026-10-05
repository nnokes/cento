# M12 checklist: shipping Cento to others (free)

## Result: M12 passed on your Mac (sections 0 to 6): both downloads work, and a newcomer hears a piece from the read-me alone. Next: publish v0.1.0 ([releasing.md](releasing.md), section 3)

| Check | Max version | Live version |
|---|---|---|
| The new layout: a row of section names, compose first, every button in Live's look, more features window (Max), plug-in instruments window, plain names, a narrower piano roll; nothing overlaps | ✅ (`npm test`: sizes, overlaps, wiring; 0.0–0.4 on the Mac) | ✅ (0.5) |
| Your files live in your Cento folder (`~/Documents/cento`), copied there from `patchers/` the first time | ✅ (1.1–1.4) | ✅ (1.5) |
| Both products share them, as before | ✅ (1.6) | ✅ (1.6) |
| Finding the folder: from a patch in a home folder, from Max's own path, through `/Users` (for an app, later), by a file in it; none: the status line says where it goes | ✅ (`npm test`) | ✅ (the same engine) |
| Cento's own chorales are found in the Cento folder (as in a download) or the repository | ✅ (`npm test`) | ✅ (the same engine) |
| Frozen devices work on their own (the freeze test deferred from M0) | — | ✅ (2.1–2.4) |
| The demo set | — | ✅ (section 3) |
| Cento for Max: the patch from its download, with nothing on the search path | ✅ (section 4) | — |
| The zips (`npm run package`): what's in them, and what's missing if not | ✅ (`npm test`, with stand-ins; section 5 on the Mac) | ✅ |
| A newcomer, following only the read-me, hears a piece within five minutes | ✅ (section 6) | ✅ (section 6) |
| Engine tests | ✅ (`npm test`) | ✅ |

M12 makes Cento something other people can download from GitHub and use
without git, Python, Node or `tools/`: two zips on GitHub's Releases page,
**Cento for Live** (frozen devices and a demo set) and **Cento for Max** (a
patch for Max 9; a standalone app waits for later). The plan is in [PLAN.md](../PLAN.md) (§8, "M12 in detail"); publishing
is in [releasing.md](releasing.md).

**First: your Cento folder.** A frozen device or a downloaded patch has no
repository `patchers/` folder to write in, so each user's files (settings, Magdalena's taste, her notebook
and snapshots) now live in a folder called Cento in Documents:
`~/Documents/Cento`. On your Mac that's the `cento` folder you already have
(a Mac's disk doesn't tell `Cento` from `cento`). The first time Cento finds
it, it copies your files from `patchers/` into it; the old copies stay in
`patchers/` (git-ignored), and you can delete them once all is well.

Max's JavaScript can't ask where your home folder is, so Cento works it out
from the paths it does know, and the Max window says how:
`cento: your Cento folder is ... (found from the patch's folder)`. Section 1
checks that it works on a real Mac, in Max and in Live.

**Then the downloads.** Sections 2 to 5 make, once, the things only Live can
make, and check each download: frozen devices, the demo set, the Max patch
from its zip, and the zips from `npm run package`. Section 6 is the real test: someone new
following only the read-me. The read-me is
[`release/Read me first.html`](../release/Read%20me%20first.html) (double-click
it in Finder to see it as people will), and the Cento folder's note is
[`release/About this folder.txt`](../release/About%20this%20folder.txt).

---

## 0. The new layout

The panels were rearranged before shipping (the GUI redesign). Nothing
behaves differently; what changed is where things are and what they're
called:

| Before | Now |
|---|---|
| load chorale, pattern, clear (top row) | **more features…** (Max version only, in the PLAY panel): **load a chorale…**, **play the test phrase**, **stop and clear the queue** |
| original key (top row) | **original key**, beside **load a chorale…** in the same window |
| A/B (the listening test) | **listening test…**, in the same window |
| compose, seed, next (third row) | the top row; **compose**, now **update composition**, is the blue button (the pop-up window has one too, in place of **reload seed**) |
| form, sigs, transp. | **chorale form**, **signatures**, **transpose** |
| accept, taste | **keep**; **taste report** is in the pop-up window (the panel keeps her one-line report) |
| vst~ instead, plug 1–4, open 1–4 (Max) | **plug-in instruments** and **set up…** (a window) |
| writeclips, testclip (Live) | **write clips**, **test clips** |
| Emily (her panel, her own music) | **Magdalena**, "user's taste" (her panel), **Magdalena's notebook** (the music you keep); **explain Magdalena** in the pop-up window |

The piano roll in the panels is narrower (260 px); **window** (the square
**↗** button at the top right, in the row of names) has the large
one. In Live the device is now about 880 px wide. A dark row along the top
names each section (**PLAY** or **CLIPS AND VOICES**, **COMPOSE**,
**MAGDALENA**, **PIANO ROLL**), centred above it. Every button is in Live's
own look (a `live.text`), like the switches. In Live, **update composition**
(its parameter is still *Compose*), **next**,
**like**, **dislike**, **keep** and **write clips** can be mapped to keys or
MIDI notes; the other buttons are hidden from Live's mapping and automation.

0. [x] **Subfolders first.** `patchers/` now holds only what you open
       (`cento.maxpat` and the two devices); the rest is in
       `patchers/parts/` and `patchers/scripts/`. Max doesn't look in
       subfolders by itself, so:
       - **Max:** *Options → File Preferences*. If `patchers` isn't listed,
         click **+**, *Choose*, and select the repository's `patchers`
         folder. In its row, tick **Subfolders**. Close the window.
       - **Live:** in any Max device's editor (a Max MIDI Effect will do),
         the same: the `patchers` row with **Subfolders** ticked. Restart
         Live.
       If a patch opens with dashed boxes or a device says "media files are
       missing", this is the step to check.
1. [x] **Max: the look.** Open `patchers/cento.maxpat`. A dark row along
       the top says **PLAY**, **COMPOSE**, **MAGDALENA** and **PIANO ROLL**,
       each centred above its part; below it, each part on its own colour:
       green, blue, brown, then the piano roll. *user's taste* is just under
       Magdalena's name; **temperature** shows its name and value without
       touching anything; the piano roll's bar numbers, triangles and purple
       dots don't cover one another. Nothing overlaps or is cut off, and every
       label reads easily. (If not, a screenshot helps most.)
2. [x] **compose first.** Click **compose**, **next**, change **seed**: as
       before.
3. [x] **More features.** Click **more features…** (PLAY panel): *Cento:
       more features* opens. Click **play the test phrase**: the test phrase
       is drawn and plays (press play). Switch **original key** on, click
       **load a chorale…** and pick any `.mid` from a chorales folder: it
       loads in its own key. Then **stop and clear the queue**. Close Max
       and open the patch again: **original key** is still on (in the same
       window). **listening test…** asks where to save the test.
4. [x] **The windows.** **corpora** opens *Cento: corpora*. **set up…**
       opens *Cento: plug-in instruments*; click **choose…** for the soprano:
       the plug-in chooser opens (cancel it). **↗** (top right) opens the pop-up
       window, whose buttons say **keep** and **taste report**; click
       **explain Magdalena**: *Cento: about Magdalena* opens, with who she
       is and what she does. Every paragraph is whole (nothing cut off).
5. [x] **Live: the look.** Reopen your set. The brain device has the same
       row of names (**CLIPS AND VOICES**, **COMPOSE**, **MAGDALENA**,
       **PIANO ROLL**), no listening test or tools (those are Max-only now),
       and nothing overlaps. **write clips** and **test clips** work.
       **temperature** is a slider across Magdalena's panel. If you mapped
       **like**, **dislike** or **accept** (now **keep**) to keys or MIDI
       notes, the mappings still work. In Live's MIDI Map mode (**⌘M**),
       **update composition** and **next** can be mapped too.

## 1. Your Cento folder

Pull the latest code in GitHub Desktop (branch `claude/dazzling-edison-2p29y3`).
Close Max and Live first.

**No Cento folder yet?** Open your **Documents** folder in Finder.
- If there's a folder called `ml_midi` (your chorales from music21): rename
  it to `Cento` (click its name once, wait, type). The corpus window's
  folders inside it follow by themselves.
- If not: *File → New Folder* (**⇧⌘N**), and name it `Cento`.

Then, to be safe, copy `About this folder.txt` from the repository's
`release` folder into it: Cento also recognises its folder by that file.

### Max version (`patchers/cento.maxpat`)

1. [x] **Open the patch.** If macOS asks whether **Max** may access files
       in your Documents folder, click **Allow**. In the Max window
       (*Window → Max Console*):
       - `cento: your Cento folder is Macintosh HD:/Users/<you>/Documents/cento (found from the patch's folder)`
         (your disk's and your name, as Max writes them);
       - `cento: copied to your Cento folder from patchers/: cento.settings.json, cento.taste.json, ...`
         (the files you have).
       Copy both lines into your report. If it says instead
       `cento: no Cento folder found, so your files stay in patchers/ (looked in ...)`,
       copy that line: it says where Cento looked and how many names Max
       listed there.
2. [x] **Nothing lost.** The seed, the corpus window's folders (which are
       on) and Magdalena's taste (the pop-up window's overview) are as they
       were. The piece composed is the same as before you pulled.
3. [x] **Saved there.** In Finder, open `Documents/cento`: it now holds
       `cento.settings.json` (and `cento.taste.json`, ...). Change the
       **seed** in the patch, then look at `cento.settings.json`'s **Date
       Modified** (Finder's list view): it's now. The copy in `patchers/`
       doesn't change any more.
4. [x] **Open the patch again.** The Max window says
       `cento: your Cento folder is ...` again, but nothing is copied this
       time.

### Live version

5. [x] **Reopen your set.** In a device's editor, open *Window → Max
       Console*: the same `your Cento folder` line (it may say "from Max's
       own folder" or "from the patch's folder"). If macOS asks whether
       **Live** may access your Documents folder, click **Allow**.
6. [x] **Shared.** The corpus window lists the same folders as in Max. Click
       **like** on a piece in Live; then open `cento.maxpat` in Max: the
       pop-up window's overview counts that rating.

## 2. Frozen devices (the freeze test from M0)

*Freezing* packs everything a device uses (its patches and scripts) into the
`.amxd` file, so it works without the repository.

1. [x] **Freeze.** In Live, on the track with `cento.brain`, open the device
       in the Max editor (the editor button in the device's title bar).
       Click **Freeze Device** (the snowflake in the editor's toolbar), then
       *File → Save As* into the repository's `frozen/` folder, as
       `cento.brain.amxd` (Max may make the folder for you; if not, make it
       in Finder first). Close the editor. The same for `cento.voice`, as
       `frozen/cento.voice.amxd`.
2. [x] **Hide the originals.** So the frozen devices can't quietly use the
       files in `patchers/`: in a device editor, *Options → File
       Preferences*, select the `patchers` entry and click **−** to remove
       it. Restart Live.
3. [x] **A new set.** Make five MIDI tracks: `Cento`, `Soprano`, `Alto`,
       `Tenor` and `Bass`. Put an instrument on the four voice tracks:
       **Drift** (it comes with every edition of Live 12), with a gentle
       preset. Drag `frozen/cento.brain.amxd` onto `Cento` and
       `frozen/cento.voice.amxd` onto the four voice tracks. Don't open an
       editor.
4. [x] **It works.** The brain composes at once (its piano roll fills).
       **Play Through Voices** on, then Live's Play: the piece plays through
       the four instruments, from a bar. Then, one at a time: **corpora**
       opens the corpus window; **↗** (top right) opens the pop-up window; hover
       help shows in the Info View; **like** counts. Last, open the brain's
       editor and *Window → Max Console*: copy the
       `cento: your Cento folder is ...` line. Close the editor.
       (Your settings, Magdalena's taste and her notebook are there as
       before: they live in your Cento folder, not in the device, so every
       copy of Cento finds them: the patch, frozen devices, a downloaded patch. A
       newcomer's Cento folder, from the download, starts empty: section 6.)
       *Passed:* `cento: your Cento folder is Macintosh HD:/Users/<you>/Documents/Cento (found from the patch's folder)`,
       from a frozen device in a folder of its own, with `patchers` off the
       search path.
5. [x] Leave the set open for section 3.

## 3. The demo set (made once)

1. [x] **Save it.** With the set from section 2: **Play Through Voices** on,
       **Seed** 1, tempo 80. *File → Save Live Set As...*, into the
       repository's `build/` folder (make it in Finder if needed), named
       `Cento Demo`. Live makes `build/Cento Demo Project/Cento Demo.als`.
2. [x] **Collect.** *File → Collect All and Save*: the frozen devices are
       copied into the project, so it doesn't need `frozen/`.
3. [x] **Check.** Close Live. In Finder, double-click
       `build/Cento Demo Project/Cento Demo.als`. Press Play: it plays.
4. [x] Put the `patchers` entry back: in a device editor, *Options → File
       Preferences*, **+**, *Choose*, the repository's `patchers` folder,
       and tick **Subfolders** in its row. Restart Live.

## 4. Cento for Max (the patch, from its download)

The Max version ships as a patch, not an app (the app waits for later). It
needs no building: the packaging script copies `cento.maxpat` and every
patch and script it uses into one folder, `Cento Patch`, where Max finds
them with nothing on its search path.

1. [x] **Make the zip.** In Terminal, in the repository folder:
       ```sh
       npm run package -- --only max
       ```
       It ends with `wrote dist/Cento-for-Max-v0.1.0.zip (0.3 MB)`.
       Double-click the zip in `dist/` (in Finder): a folder
       `Cento for Max v0.1.0` opens beside it.
2. [x] **Hide the originals.** So the patch can't quietly use the
       repository's files: in Max, *Options → File Preferences*, select the
       `patchers` entry and click **−**. Quit Max.
3. [x] **Open it.** In the unzipped folder, open `Cento Patch` and
       double-click `cento.maxpat`. It opens in Max and composes at once,
       with your settings (the same seed and corpora as before: they're in
       your Cento folder). The Max Console (*Window → Max Console*) says
       `cento: your Cento folder is ... (found from the patch's folder)`:
       copy that line, and any red text.
4. [x] **It works.** Click **play**: it plays through the Output shown
       (choose *AU DLS Synth 1* if it's silent). **corpora**, **↗** (top
       right), **set up…** and **more features…** open their windows, and
       **explain Magdalena** (in the pop-up window) opens its own; hover help
       shows; **export midi** saves a file.
5. [x] **Put the `patchers` entry back**: *Options → File Preferences*,
       **+**, *Choose*, the repository's `patchers` folder, and tick
       **Subfolders**. (`dist/` is git-ignored: delete it whenever you like.)

## 5. The zips

1. [x] In Terminal, in the repository folder:
       ```sh
       npm run package
       ```
       It ends with two lines like `wrote dist/Cento-for-Live-v0.1.0.zip (12.3 MB)`
       and `wrote dist/Cento-for-Max-v0.1.0.zip (0.3 MB)`.
       (If something is missing it says what, and how to make it.)
2. [x] Double-click each zip in `dist/`. Each opens to a folder with
       `Read me first.html`, `LICENSE.txt`, the `Cento` folder (with
       `corpus` and `About this folder.txt`), and `Cento Demo Project` and
       `Devices` (Live) or `Cento Patch` (Max). Note the zips' sizes for your
       report.

## 6. A newcomer (the "done when")

1. [x] Make a new user account (*System Settings → Users & Groups → Add
       User*), or ask a friend with a Mac. Copy the two zips to it (AirDrop,
       or a USB stick).
2. [x] As that user, follow **only** `Read me first.html`, first for Cento
       for Max, then (if Live is there) for Cento for Live. Time it: a piece
       should play within five minutes. (On your own Mac, Max 9 is already
       installed for every account: skip that step, but note what Max asks
       the new user the first time, such as signing in or a trial, and
       that Cento runs without a licence.)
3. [x] Note every place the read-me was unclear or wrong, and anything
       macOS asked. Delete the account afterwards if you like.

---

## Reporting back

For each box, say whether it passed, and paste the `cento:` lines from 1.1,
1.5, 2.4 and 4.3. Copy any red text from the Max window. The parts most
likely to need a fix:
- how Max lists folders and writes paths (section 1), which can't be tried
  without a Mac;
- the frozen devices' windows (2.4): whether freezing takes the corpus
  window and the pop-up window along;
- the Max patch from its download (section 4): whether `Cento Patch` holds
  everything it needs (red text in the Max Console names anything missing);
- what Max asks a new user, and whether Cento runs without a licence (6.2).

Sections 0 to 2 can be done first; report them before the rest if you
like.
