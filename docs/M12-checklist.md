# M12 checklist: shipping Cento to others (free)

## Result: under way; waiting on the checks on your Mac (sections 1 to 6)

| Check | Max version | Live version |
|---|---|---|
| Your files live in your Cento folder (`~/Documents/cento`), copied there from `patchers/` the first time | | |
| Both products share them, as before | | |
| Finding the folder: from a patch in a home folder, from Max's own path, through `/Users` (the app), by a file in it; none: the status line says where it goes | ✅ (`npm test`) | ✅ (the same engine) |
| Cento's own chorales are found in the Cento folder (as in a download) or the repository | ✅ (`npm test`) | ✅ (the same engine) |
| Frozen devices work on their own (the freeze test deferred from M0) | — | |
| The demo set | — | |
| The app, from Applications | | — |
| The zips (`npm run package`): what's in them, and what's missing if not | ✅ (`npm test`, with stand-ins) | ✅ |
| A newcomer, following only the read-me, hears a piece within five minutes | | |
| Engine tests | ✅ (`npm test`) | ✅ |

M12 makes Cento something other people can download from GitHub and use
without git, Python, Node or `tools/`: two zips on GitHub's Releases page,
**Cento for Live** (frozen devices and a demo set) and **Cento for Mac** (an
app). The plan is in [PLAN.md](../PLAN.md) (§8, "M12 in detail"); publishing
is in [releasing.md](releasing.md).

**First: your Cento folder.** A frozen device or an app has no `patchers/`
folder to write in, so each user's files (settings, Emily's taste, her works
and snapshots) now live in a folder called Cento in Documents:
`~/Documents/Cento`. On your Mac that's the `cento` folder you already have
(a Mac's disk doesn't tell `Cento` from `cento`). The first time Cento finds
it, it copies your files from `patchers/` into it; the old copies stay in
`patchers/` (git-ignored), and you can delete them once all is well.

Max's JavaScript can't ask where your home folder is, so Cento works it out
from the paths it does know, and the Max window says how:
`cento: your Cento folder is ... (found from the patch's folder)`. Section 1
checks that it works on a real Mac, in Max and in Live.

**Then the downloads.** Sections 2 to 5 make, once, the things only Max and
Live can make, and check each: frozen devices, the demo set, the app, and
the zips from `npm run package`. Section 6 is the real test: someone new
following only the read-me. The read-me is
[`release/Read me first.html`](../release/Read%20me%20first.html) (double-click
it in Finder to see it as people will), and the Cento folder's note is
[`release/About this folder.txt`](../release/About%20this%20folder.txt).

---

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

1. [ ] **Open the patch.** If macOS asks whether **Max** may access files
       in your Documents folder, click **Allow**. In the Max window
       (*Window → Max Console*):
       - `cento: your Cento folder is Macintosh HD:/Users/<you>/Documents/cento (found from the patch's folder)`
         (your disk's and your name, as Max writes them);
       - `cento: copied to your Cento folder from patchers/: cento.settings.json, cento.taste.json, ...`
         (the files you have).
       Copy both lines into your report.
2. [ ] **Nothing lost.** The seed, the corpus window's folders (which are
       on) and Emily's taste (the pop-up window's overview) are as they
       were. The piece composed is the same as before you pulled.
3. [ ] **Saved there.** In Finder, open `Documents/cento`: it now holds
       `cento.settings.json` (and `cento.taste.json`, ...). Change the
       **seed** in the patch, then look at `cento.settings.json`'s **Date
       Modified** (Finder's list view): it's now. The copy in `patchers/`
       doesn't change any more.
4. [ ] **Open the patch again.** The Max window says
       `cento: your Cento folder is ...` again, but nothing is copied this
       time.

### Live version

5. [ ] **Reopen your set.** In a device's editor, open *Window → Max
       Console*: the same `your Cento folder` line (it may say "from Max's
       own folder" or "from the patch's folder"). If macOS asks whether
       **Live** may access your Documents folder, click **Allow**.
6. [ ] **Shared.** The corpus window lists the same folders as in Max. Click
       **like** on a piece in Live; then open `cento.maxpat` in Max: the
       pop-up window's overview counts that rating.

## 2. Frozen devices (the freeze test from M0)

*Freezing* packs everything a device uses (its patches and scripts) into the
`.amxd` file, so it works without the repository.

1. [ ] **Freeze.** In Live, on the track with `cento.brain`, open the device
       in the Max editor (the editor button in the device's title bar).
       Click **Freeze Device** (the snowflake in the editor's toolbar), then
       *File → Save As* into the repository's `frozen/` folder, as
       `cento.brain.amxd` (Max may make the folder for you; if not, make it
       in Finder first). Close the editor. The same for `cento.voice`, as
       `frozen/cento.voice.amxd`.
2. [ ] **Hide the originals.** So the frozen devices can't quietly use the
       files in `patchers/`: in a device editor, *Options → File
       Preferences*, select the `patchers` entry and click **−** to remove
       it. Restart Live.
3. [ ] **A new set.** Make five MIDI tracks: `Cento`, `Soprano`, `Alto`,
       `Tenor` and `Bass`. Put an instrument on the four voice tracks:
       **Drift** (it comes with every edition of Live 12), with a gentle
       preset. Drag `frozen/cento.brain.amxd` onto `Cento` and
       `frozen/cento.voice.amxd` onto the four voice tracks. Don't open an
       editor.
4. [ ] **It works.** The brain composes at once (its piano roll fills).
       **Play Through Voices** on, then Live's Play: the piece plays through
       the four instruments, from a bar. Then, one at a time: **corpora**
       opens the corpus window; **window** opens the pop-up window; hover
       help shows in the Info View; **like** counts. Last, open the brain's
       editor and *Window → Max Console*: copy the
       `cento: your Cento folder is ...` line. Close the editor.
5. [ ] Leave the set open for section 3.

## 3. The demo set (made once)

1. [ ] **Save it.** With the set from section 2: **Play Through Voices** on,
       **Seed** 1, tempo 80. *File → Save Live Set As...*, into the
       repository's `build/` folder (make it in Finder if needed), named
       `Cento Demo`. Live makes `build/Cento Demo Project/Cento Demo.als`.
2. [ ] **Collect.** *File → Collect All and Save*: the frozen devices are
       copied into the project, so it doesn't need `frozen/`.
3. [ ] **Check.** Close Live. In Finder, double-click
       `build/Cento Demo Project/Cento Demo.als`. Press Play: it plays.
4. [ ] Put the `patchers` entry back: in a device editor, *Options → File
       Preferences*, **+**, *Choose*, the repository's `patchers` folder.
       Restart Live.

## 4. The app

1. [ ] **Build it.** In Max, open `patchers/cento.maxpat`. *File → Build
       Collective / Application...*: choose **Application**, name it
       `Cento`, and save it into the repository's `build/` folder. Close
       Max.
2. [ ] **From Applications.** Drag `build/Cento.app` into Applications
       (hold **⌥ Option** to copy it rather than move it). Open it from
       there. If macOS asks whether Cento may access your Documents folder,
       click **Allow**.
3. [ ] **It works.** It composes at once with your settings (the same seed
       and corpora as in Max). Click **play**: it plays through the output
       shown (choose *AU DLS Synth 1* if it's silent). **corpora** and
       **window** open their windows; hover help shows; **export midi**
       saves a file.
4. [ ] **Where it found your folder.** If the app has a Max Console (the
       Window menu), copy its `cento: your Cento folder is ...` line: from
       Applications it should say "from the folders in /Users".
5. [ ] Delete the copy in Applications (it's a build, not a release).

## 5. The zips

1. [ ] In Terminal, in the repository folder:
       ```sh
       npm run package
       ```
       It ends with two lines like `wrote dist/Cento-for-Live-v0.1.0.zip (12.3 MB)`.
       (If something is missing it says what, and how to make it.)
2. [ ] Double-click each zip in `dist/`. Each opens to a folder with
       `Read me first.html`, `LICENSE.txt`, the `Cento` folder (with
       `corpus` and `About this folder.txt`), and `Cento Demo Project` and
       `Devices` (Live) or `Cento.app` (Mac). Note the zips' sizes for your
       report.

## 6. A newcomer (the "done when")

1. [ ] Make a new user account (*System Settings → Users & Groups → Add
       User*), or ask a friend with a Mac. Copy the two zips to it (AirDrop,
       or a USB stick).
2. [ ] As that user, follow **only** `Read me first.html`, first for Cento
       for Mac, then (if Live is there) for Cento for Live. Time it: a piece
       should play within five minutes.
3. [ ] Note every place the read-me was unclear or wrong, and anything
       macOS asked. Delete the account afterwards if you like.

---

## Reporting back

For each box, say whether it passed, and paste the `cento:` lines from 1.1,
1.5, 2.4 and 4.4. Copy any red text from the Max window. The parts most
likely to need a fix:
- how Max lists folders and writes paths (section 1), which can't be tried
  without a Mac;
- the frozen devices' windows (2.4): whether freezing takes the corpus
  window and the pop-up window along;
- the app (section 4): whether *Build Collective / Application* takes every
  window and script along, and finds your Cento folder from Applications.

Sections 1 and 2 can be done first; report them before the rest if you
like.
