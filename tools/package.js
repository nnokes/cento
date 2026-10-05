#!/usr/bin/env node
"use strict";
// Makes the two downloads for a release (M12; docs/releasing.md), on your
// Mac, from the repository and what you built in Live:
//
//   dist/Cento-for-Live-v<version>.zip
//     Cento for Live v<version>/
//       Read me first.html, LICENSE.txt
//       Cento/                 the folder for Documents: corpus/, About this folder.txt
//       Cento Demo Project/    the demo set (build/Cento Demo Project)
//       Devices/               the frozen devices (frozen/cento.brain.amxd, cento.voice.amxd)
//   dist/Cento-for-Max-v<version>.zip
//     Cento for Max v<version>/
//       Read me first.html, LICENSE.txt, Cento/
//       Cento Patch/           cento.maxpat and every patch and script it uses,
//                              side by side: Max finds them in the patch's own
//                              folder, with no search path to set up
//
// The version is package.json's. Nothing personal goes in: the Cento folder
// is made from the repository (corpus/ and release/), never from your own.
// (A standalone app was planned instead of the patch; it waits for later.)
//
//   npm run package                 both zips (each needs everything it holds)
//   npm run package -- --only live  one of them: live or max
//   npm run package -- --check      only say what's there and what's missing
//
// On a Mac, ditto copies and zips (it keeps an app's links, permissions and
// attributes); elsewhere (the tests), cp and zip.

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const BUNDLED = ["bach-figured-bass", "bach-figured-bass-3-4"];

// What each download holds: [path in the zip's folder, source in the repo,
// how to make it if it's missing].
function contents(root) {
  const shared = [
    ["Read me first.html", "release/Read me first.html", "it's in the repository: pull the latest code"],
    ["LICENSE.txt", "LICENSE", "it's in the repository: pull the latest code"],
    ["Cento/About this folder.txt", "release/About this folder.txt", "it's in the repository: pull the latest code"],
    ["Cento/corpus/README.md", "corpus/README.md", "it's in the repository: pull the latest code"],
    ["Cento/corpus/LICENSE-CC-BY-4.0.txt", "corpus/LICENSE-CC-BY-4.0.txt", "it's in the repository: pull the latest code"],
    ...BUNDLED.map((name) => [`Cento/corpus/${name}`, `corpus/${name}`, "it's in the repository: pull the latest code"]),
  ];
  const live = [
    ...shared,
    ["Cento Demo Project", "build/Cento Demo Project", "save the demo set (docs/releasing.md, step 1.2)"],
    ["Devices/cento.brain.amxd", "frozen/cento.brain.amxd", "freeze the device (docs/releasing.md, step 1.1)"],
    ["Devices/cento.voice.amxd", "frozen/cento.voice.amxd", "freeze the device (docs/releasing.md, step 1.1)"],
  ];
  const max = [
    ...shared,
    ...patchFiles(root).map((from) => [`Cento Patch/${path.basename(from)}`, from,
      "it's in the repository: pull the latest code, or run npm run patches and npm run build"]),
  ];
  return { live, max };
}

// The Max version's files: patchers/cento.maxpat, then every patch and
// script it uses, found by following its references (bpatchers, abstractions
// such as [emi.engine], and the scripts of [v8] and [v8ui]), each once.
// Live's own parts (emi.brain, emi.host.live, emi.voice) aren't among them.
// A bpatcher's patch or a script that isn't there is listed where it belongs
// (parts/ or scripts/), so it's reported missing; an object that isn't an
// abstraction of ours ([zl.iter], [transport]...) is Max's own.
function patchFiles(root) {
  const where = (name) =>
    ["patchers", "patchers/parts", "patchers/scripts"].map((dir) => `${dir}/${name}`).find((p) => fs.existsSync(path.join(root, p)));
  const found = ["patchers/cento.maxpat"];
  const add = (name, required) => {
    const at = where(name) || (required ? `patchers/${name.endsWith(".js") ? "scripts" : "parts"}/${name}` : null);
    if (at && !found.includes(at)) {
      found.push(at);
      if (at.endsWith(".maxpat")) follow(at);
    }
  };
  const walk = (patcher) => {
    for (const { box } of patcher.boxes || []) {
      if (box.patcher) walk(box.patcher);
      if (box.maxclass === "bpatcher" && box.name) add(box.name, true);
      if (box.textfile && box.textfile.filename) add(box.textfile.filename, true);
      if (box.maxclass === "v8ui" && box.filename) add(box.filename, true);
      if (box.maxclass === "newobj" && box.text) add(box.text.split(/\s+/)[0] + ".maxpat", false);
    }
  };
  const follow = (file) => {
    try {
      walk(JSON.parse(fs.readFileSync(path.join(root, file), "utf8")).patcher);
    } catch (e) {
      // missing or unreadable: reported as missing (or as Max will report it)
    }
  };
  follow(found[0]);
  return found;
}

// Problems with what's there, beyond being missing.
function problemsWith(root, from) {
  const full = path.join(root, from);
  if (from.startsWith("frozen/")) {
    // A frozen device carries its patches and scripts: many times the size
    // of the unfrozen one in patchers/, which only names them.
    const unfrozen = path.join(root, "patchers", path.basename(from));
    if (fs.existsSync(unfrozen) && fs.statSync(full).size < 10 * fs.statSync(unfrozen).size) {
      return `${from} isn't frozen (it's hardly bigger than patchers/${path.basename(from)}): click Freeze Device before saving it`;
    }
  }
  if (from === "build/Cento Demo Project" && !fs.readdirSync(full).some((name) => name.endsWith(".als"))) {
    return `${from} has no Live set (.als) in it: save the demo set there with Collect All and Save`;
  }
  return null;
}

function version(root) {
  return JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
}

// For each download: its name, zip, folder and files, and what's missing.
function plan(root, only = null) {
  const v = version(root);
  const all = contents(root);
  return Object.entries(all)
    .filter(([kind]) => !only || kind === only)
    .map(([kind, entries]) => {
      const title = kind === "live" ? "Live" : "Max";
      const missing = [];
      for (const [, from, how] of entries) {
        if (!fs.existsSync(path.join(root, from))) missing.push(`${from} is missing: ${how}`);
        else {
          const problem = problemsWith(root, from);
          if (problem) missing.push(problem);
        }
      }
      return { kind, folder: `Cento for ${title} v${v}`, zip: `Cento-for-${title}-v${v}.zip`, entries, missing };
    });
}

const onMac = () => process.platform === "darwin";

function copy(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (onMac()) execFileSync("ditto", [from, to]);
  else fs.cpSync(from, to, { recursive: true, verbatimSymlinks: true });
}

// Copies a download's files into stage/<folder> and zips it into out/.
function build(root, product, out) {
  const stage = path.join(out, "stage");
  const dest = path.join(stage, product.folder);
  fs.rmSync(dest, { recursive: true, force: true });
  for (const [to, from] of product.entries) copy(path.join(root, from), path.join(dest, to));
  // Finder's .DS_Store files don't belong in a download.
  const strip = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (name === ".DS_Store") fs.rmSync(p);
      else if (fs.lstatSync(p).isDirectory()) strip(p);
    }
  };
  strip(dest);
  const zip = path.join(out, product.zip);
  fs.rmSync(zip, { force: true });
  if (onMac()) execFileSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", dest, zip]);
  else execFileSync("zip", ["-r", "-y", "-q", zip, product.folder], { cwd: stage });
  fs.rmSync(stage, { recursive: true, force: true });
  return zip;
}

function main(argv) {
  const root = path.resolve(__dirname, "..");
  const at = argv.indexOf("--only");
  const only = at >= 0 ? argv[at + 1] : null;
  if (only && only !== "live" && only !== "max") {
    console.error("--only takes live or max");
    return 2;
  }
  const products = plan(root, only);
  let failed = false;
  for (const product of products) {
    if (product.missing.length) {
      failed = true;
      console.error(`${product.zip}: can't be made yet:`);
      for (const line of product.missing) console.error(`  - ${line}`);
    } else console.log(`${product.zip}: everything is there`);
  }
  if (argv.includes("--check")) return failed ? 1 : 0;
  if (failed) {
    console.error("Nothing was made. Fix the above, or make one zip with --only live or --only max.");
    return 1;
  }
  const out = path.join(root, "dist");
  fs.mkdirSync(out, { recursive: true });
  for (const product of products) {
    const zip = build(root, product, out);
    console.log(`wrote ${path.relative(root, zip)} (${(fs.statSync(zip).size / 1e6).toFixed(1)} MB)`);
  }
  return 0;
}

if (require.main === module) process.exitCode = main(process.argv.slice(2));

module.exports = { plan, build, contents, patchFiles };
