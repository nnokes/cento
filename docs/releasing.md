# Releasing Cento

How to put a new version of Cento on GitHub's Releases page, where anyone can
download it as a zip. People who download it need none of the development
tools: no git, Python, Node or `tools/`.

**Status:** written before M12. The steps marked *(M12)* depend on things M12
builds (the user folder, the packaging script, the read-me); until then they
can't be done. See PLAN.md, §8, "M12 in detail".

## What a release is

- A **release** is a named version, such as `v0.1.0`, with files attached for
  download. It lives on the repository's **Releases** page (in the right-hand
  column of the repository's main page on github.com).
- Each release is tied to a **tag**: a permanent label on one commit of
  `main`. The release page creates the tag for you when you publish.
- GitHub attaches the source code as zips to every release by itself. Those
  are for developers. The files you attach are the ones people want:
  `Cento-for-Live-vX.Y.Z.zip` and `Cento-for-Mac-vX.Y.Z.zip`.
- `https://github.com/nnokes/cento/releases/latest` always points to the
  newest release, so the README's Download link never needs changing. (That
  address works once the repository is renamed to `cento`; until then it is
  `nnokes/ml_midi`.)

**Version numbers**: `v0.1.0` for the first beta. Then `v0.1.1` for fixes
only, `v0.2.0` for new features, and `v1.0.0` when you consider it finished.
Mark releases before `v1.0.0` as **pre-releases**.

## Before you start

1. The milestone's checks have passed in Max and Live.
2. Its work is merged into `main` (a pull request from the working branch).
3. The latest commit on `main` has a green check on GitHub (CI passed).
4. In GitHub Desktop, switch to `main` and click **Fetch origin**, then
   **Pull**.

## 1. Build on your Mac

These need Max on your Mac, so CI can't do them.

1. **Freeze the devices.** In Live, open `cento.brain` in the Max editor (the
   device's title bar, the editor button). Click **Freeze Device** in the
   editor's toolbar, then save it into the repository's `frozen/` folder
   (git-ignored), keeping its name. The same for `cento.voice`.
2. **The demo set** *(M12)*: open it, check that it plays, then
   **File > Collect All and Save**.
3. **The app** *(M12)*: open `patchers/cento.maxpat` in Max, then
   **File > Build Collective / Application...**, choose **Application**, and
   save it as `Cento` into `build/` (git-ignored).
4. **The zips** *(M12)*: in Terminal, from the repository folder, run
   `npm run package`. It writes both zips into `dist/` (git-ignored).

## 2. Test like a newcomer

On a fresh user account on your Mac (System Settings > Users & Groups), or a
friend's Mac: download nothing else, follow only `Read me first`, and check
that a piece plays within five minutes, in Live and with the app. Note
anything that was unclear, and fix the read-me before publishing.

## 3. Publish on GitHub

On github.com, on the repository's main page:

1. Click **Releases** (right-hand column), then **Draft a new release**.
2. **Choose a tag**: type the version, e.g. `v0.1.0`, and pick
   **Create new tag: v0.1.0 on publish**. **Target**: `main`.
3. **Release title**: `Cento v0.1.0 (beta)`.
4. **Description**: use the template below.
5. **Attach the zips**: drag the two files from `dist/` onto the
   "Attach binaries" box, and wait for both to finish uploading.
6. Tick **Set as a pre-release** (until `v1.0.0`).
7. Click **Publish release**.

Then send people the link to the release, or to
`https://github.com/nnokes/cento/releases/latest`.

### Description template

```
Cento writes new chorales in the style of J. S. Bach, by recombining beats
from Bach's own, in Max or in Ableton Live. (An independent project, not
affiliated with David Cope.)

Download one:
- Cento-for-Live: for Ableton Live 12 Suite (or Standard + Max for Live).
- Cento-for-Mac: a standalone app; no Max needed.
Then follow "Read me first" in the zip.

What's new:
- ...

Known issues:
- The app isn't signed: the first time, right-click it and choose Open.
- Tested on macOS only.
```

## If something is wrong after publishing

- **A broken zip**: edit the release, delete the attachment, attach a fixed
  one. The tag doesn't change.
- **A real bug**: fix it on the working branch, merge into `main`, and
  publish a new release with the next fix number (`v0.1.1`). Don't move an
  existing tag.
