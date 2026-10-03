# M12 checklist: shipping Cento to others (free)

## Result: under way; section 1 waits on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| Your files live in your Cento folder (`~/Documents/cento`), copied there from `patchers/` the first time | | |
| Both products share them, as before | | |
| Finding the folder: from a patch in a home folder, from Max's own path, through `/Users` (the app), by a file in it; none: the status line says where it goes | ✅ (`npm test`) | ✅ (the same engine) |
| Cento's own chorales are found in the Cento folder (as in a download) or the repository | ✅ (`npm test`) | ✅ (the same engine) |
| Frozen devices work on their own (the freeze test deferred from M0) | — | |
| The demo set, the app, the zips (`npm run package`) | | |
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
`cento: your Cento folder is ... (found from the patch's folder)`. This
section checks that it works on a real Mac, in Max and in Live. The other
sections (frozen devices, the demo set, the app, the zips, the read-me) come
next.

---

## 1. Your Cento folder

Pull the latest code in GitHub Desktop (branch `claude/dazzling-edison-2p29y3`).
Close Max and Live first.

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

---

## Reporting back

For each box, say whether it passed, and paste the two `cento:` lines from
step 1 (and the one from step 5). Copy any red text from the Max window
while the patch or the set opens: the part most likely to need a fix is how
Max lists folders and writes paths, which can't be tried without a Mac.
