# M11 checklist: corpora

## Result: waiting on the Max and Live checks

| Check | Max version | Live version |
|---|---|---|
| The corpus window opens from the panel's **corpora** button and lists the folders | | |
| **add folder**: a folder joins the list, switched on, and the corpus is built from every folder that is on | | |
| A chorale in two folders counts once; a folder in another meter is listed as not used, with the reason | ✅ (`npm test`) | ✅ (the same engine) |
| Two folders compose exactly as one folder holding the same chorales (the milestone's "done when") | ✅ (`npm test`) | |
| Switching folders on and off, **only** and **remove**; the seed shown is composed again | | |
| A 3/4 folder alone: pieces in 3/4, and the transport follows | | |
| The list is remembered between sessions and shared by the two products | | |
| Hover help on the window's controls | | |
| Max: one play/stop button (green play, red stop) that goes back to play when the piece ends | | — (Max only) |
| Engine tests | ✅ (`npm test`) | ✅ |

M11 lets the corpus be more than one folder. Until now, **load corpus** read
one folder of chorales. Now the panel's **corpora** button (in its place)
opens a window listing folders, each switched on or off. Composing uses every
folder that is on, as one corpus.

**The list.** Each row is a folder:
- **its box**: on (filled) or off. Green means in use; amber means on but not
  used, and the row says why.
- **its name**, and what it holds: chorales, meter, major and/or minor.
  Resting the mouse on the name shows the folder's full path.
- **only**: just this folder on.
- **remove**: off the list. The folder and its files stay where they are.

Under the list, one line sums up the corpus in use. Below the window's list:
**add folder** (choose a folder) and **rescan** (read every folder again,
after adding or removing chorales in one).

**How folders combine.**
- **Each chorale once.** `corpus-both` holds all of `corpus`, so with both on,
  `corpus-both`'s row says `142 already in a folder above`.
- **One meter.** The corpus takes the first folder's meter. A 3/4 folder with
  4/4 folders on is listed as `not used: its chorales are in 3/4, the corpus
  in 4/4`. Use **only** on it to compose in 3/4.
- **The same chorales, the same pieces.** Chorales from several folders are
  put in file-name order, as one folder is read. So `corpus` and
  `corpus-minor` together compose exactly as `corpus-both`.

**After a change.** The window answers at once (`building...`). The corpus is
built a moment later, and the seed shown is composed again, so you hear it.
A stream that was playing starts again from the new corpus at the next bar.
A change that leaves the same chorales (switching off a folder that wasn't
used) builds and composes nothing: `corpus unchanged: 295 chorales`.

**Remembered.** The list, and which folders are on, is kept in the settings
file, shared by both products. Your old corpus becomes the first folder of
the list the first time you open the patch.

This is the groundwork for M12: a second style (Palestrina) will be another
folder on the list.

---

## 0. Get the new code

Pull the latest code in GitHub Desktop. If Max or Live is open, close and
reopen the patch or set.

## 1. Max version (`patchers/ml_midi.maxpat`)

1. [ ] **Open the patch.** The corpus reloads as before. The panel's second
       row starts with **corpora** where **load corpus** was.
2. [ ] **The corpus window.** Click **corpora**. A window, `ml_midi: corpora`,
       opens. It lists one folder, `corpus`, with a filled green box:
       `142 chorales · 4/4 · major`, then `in use`. The line under the list:
       `In use: 142 chorales (major) from 1 folder, in 4/4: 8578 beats, 76 signatures.`
3. [ ] **Add a folder.** Click **add folder** and choose
       `Documents/ml_midi/corpus-both`.
       - The window shows `building...` at once.
       - The status line then says
         `corpus 295 chorales (142 major, 153 minor), 17746 beats, 14% dead ends, 154 signatures from 2 folders`,
         and the seed shown is composed again.
       - `corpus-both`'s row: `295 chorales · 4/4 · major and minor`, then
         `in use; 142 already in a folder above`.
       - Write down the piece's status line (`emi-<seed>: form of ...`).
4. [ ] **The same chorales, the same piece** (the "done when"). On
       `corpus-both`'s row, click **only**. `corpus` turns off, and the seed
       is composed again: the same status line as in step 3, word for word.
       (If not, the two exported folders hold different versions of some
       chorales: tell me which seed.)
5. [ ] **A folder in another meter.** Click `corpus`'s box to switch it back
       on. Then **add folder** `Documents/ml_midi/corpus-3-4`.
       - Its row: `20 chorales · 3/4 · major`, then, in amber,
         `not used: its chorales are in 3/4, the corpus in 4/4`.
       - The status line: `corpus unchanged: 295 chorales`. Nothing is
         composed again.
6. [ ] **3/4 alone.** On `corpus-3-4`'s row, click **only**:
       `corpus 20 chorales (major), 1522 beats, 48% dead ends, 41 signatures`.
       Press Play: the piece starts on a barline and moves in three. Then
       **only** on `corpus`: back to 142 chorales, in four.
7. [ ] **All off.** Click `corpus`'s box to switch it off: the status line
       says `no corpus: switch a folder on in corpora`, and the line under the
       list `No corpus: switch a folder on.` Click **compose**: `error: load a
       corpus first`. Switch `corpus` back on.
8. [ ] **Remove.** On `corpus-3-4`'s row, click **remove**: the row goes. The
       folder is still in `Documents/ml_midi`.
9. [ ] **While a stream plays.** Turn **stream** on, compose and press Play.
       Switch `corpus-both` on: the stream starts again at the next bar, now
       with minor phrases among the major ones.
       Turn **stream** off.
10. [ ] **Remembered.** Close the patch and open it again. Click **corpora**:
       the same folders, the same boxes on and off. The corpus reloads from
       the folders that are on.
11. [ ] **Hover help.** In the corpus window, rest the mouse on a box, on
       **only**, on **remove** and on a folder's name (its full path).
       Then on **add folder** and **rescan**: a yellow hint for each.
       [docs/controls.md](controls.md) lists them all.
12. [ ] **Play and stop.** The host panel's **Play** is now one button: green,
       saying `play`. Click it: it turns red and says `stop`, and the piece
       plays from the next barline. Click it again: it goes back to green
       `play`, and the music stops.
       - Turn **stream** off, set **beats** to 16, compose, and click
         **play**. Let the piece finish: when its last chord ends, the
         button goes back to green `play` by itself, the transport stops,
         and the playhead goes.
       - Click **play** again: the same piece plays again from the next
         barline, and stops again at its end.
       - With **stream** on and **phrases** at 2, it stops after the second
         phrase. With **phrases** at 0 (endless) it plays on until you click
         **stop**.

## 2. Live version

1. [ ] **Reopen the set.** The brain's panel shows **corpora**. Click it: the
       same window opens over Live, with the same folders as in Max (the
       settings file is shared).
2. [ ] **3/4 in Live.** **add folder** `corpus-3-4`, then **only** on it. Live's
       time signature (top left of Live's window) changes to **3/4**. Play: the
       piece starts on a bar. **writeclips**, and play the clips.
3. [ ] **Back to 4/4.** **only** on `corpus`: Live's time signature goes back to
       **4/4**.
4. [ ] **Hover help in Live.** With the Info View open, move over **corpora** in
       the brain, and over the window's **add folder** and **rescan**: each
       is named and explained. The list's boxes and buttons show their help in
       a box, as in Max.
5. [ ] **Back in Max.** Close Live, open `ml_midi.maxpat`, click **corpora**:
       the list as you left it in Live.

---

## Reporting back

For each box, say whether it passed. For anything that failed, include the
status line and any red text from the Max window. The parts most likely to
need a fix:
- whether Live finds `emi.corpora.maxpat` (in `patchers/`, like the other
  windows) and the window opens;
- the folder dialog's path for **add folder** (as with **load corpus**
  before);
- how long a change takes before the piece is composed again (roughly how
  many seconds, with `corpus` and `corpus-both` on).

Steps 2.2 and 2.3 also complete M8's two remaining Live steps (3/4 in Live).
