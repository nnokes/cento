# Releasing Cento

How to put a new version of Cento on GitHub's Releases page, where anyone can
download it as a zip. People who download it need none of the development
tools: no git, Python, Node or `tools/`.

**Status:** M12 built the pieces this needs: the user folder, the packaging
script (`npm run package`) and the read-me (`release/Read me first.html`).
The first time through, follow [the M12 checklist](M12-checklist.md), which
also checks each piece. See PLAN.md, §8, "M12 in detail".

## What a release is

- A **release** is a named version, such as `v0.1.0`, with files attached for
  download. It lives on the repository's **Releases** page (in the right-hand
  column of the repository's main page on github.com).
- Each release is tied to a **tag**: a permanent label on one commit of
  `main`. The release page creates the tag for you when you publish.
- GitHub attaches the source code as zips to every release by itself. Those
  are for developers. The files you attach are the ones people want:
  `Cento-for-Live-vX.Y.Z.zip` and `Cento-for-Max-vX.Y.Z.zip`.
- `https://github.com/nnokes/cento/releases/latest` always points to the
  newest release, so the README's Download link never needs changing.

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

The devices and the demo set need Live on your Mac, so CI can't make them.
The Max version needs no building: the packaging script takes
`cento.maxpat` and the patches and scripts it uses straight from the
repository.

0. **The version.** In `package.json`, set `"version"` to the new version
   (without the `v`), and the same in `code/lib/emi-version.js`; run
   `npm run build` and `npm test`, and commit. The zips are named after it.
1. **Freeze the devices.** In Live, open `cento.brain` in the Max editor (the
   device's title bar, the editor button). Click **Freeze Device** in the
   editor's toolbar, then save it into the repository's `frozen/` folder
   (git-ignored), keeping its name. The same for `cento.voice`.
2. **The demo set**: open `build/Cento Demo Project/Cento Demo.als` (made
   once, in the [M12 checklist](M12-checklist.md), section 3). Put the newly
   frozen devices in it (from `frozen/`, in place of the old ones), check
   that it plays, then **File > Collect All and Save**.
3. **The zips**: in Terminal, from the repository folder, run
   `npm run package`. It checks that everything above is there (and that
   the devices really are frozen), then writes both zips into `dist/`
   (git-ignored): Cento for Live, and Cento for Max (the read-me, the Cento
   folder, and `Cento Patch/`: `cento.maxpat` with every patch and script it
   uses, in one folder). `npm run package -- --check` only checks;
   `npm run package -- --only max` makes just the Max one.

## 2. Test like a newcomer

On a fresh user account on your Mac (System Settings > Users & Groups), or a
friend's Mac: download nothing else, follow only `Read me first`, and check
that a piece plays within five minutes, in Live and in Max. Note
anything that was unclear, and fix the read-me (`release/Read me first.html`)
before publishing.

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
- Cento-for-Max: a patch for Max 9 (a free download; no licence needed).
Then follow "Read me first" in the zip.

What's new:
- ...

Known issues:
- Tested on macOS only.
```

## If something is wrong after publishing

- **A broken zip**: edit the release, delete the attachment, attach a fixed
  one. The tag doesn't change.
- **A real bug**: fix it on the working branch, merge into `main`, and
  publish a new release with the next fix number (`v0.1.1`). Don't move an
  existing tag.
