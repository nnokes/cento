"use strict";
// tools/package.js (M12): the two downloads, made from a pretend repository,
// and the files the repository itself puts in them.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { plan, build, patchFiles } = require("../tools/package");
const { MARKERS } = require("emi-userfolder");

const ROOT = path.resolve(__dirname, "..");

function write(root, file, content = "x") {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}

// A patch as Max saves it, with these boxes.
const patch = (...boxes) => JSON.stringify({ patcher: { boxes: boxes.map((box) => ({ box })) } });

// A repository with everything built, as on the Mac before a release.
function fakeRepo({ frozenVoice = 5000 } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "cento-package-"));
  write(root, "package.json", JSON.stringify({ version: "9.9.9" }));
  for (const file of ["LICENSE", "release/Read me first.html", "release/About this folder.txt", "corpus/README.md", "corpus/LICENSE-CC-BY-4.0.txt"]) write(root, file);
  write(root, "corpus/bach-figured-bass/bwv1.6.mid");
  write(root, "corpus/bach-figured-bass/.DS_Store");
  write(root, "corpus/bach-figured-bass-3-4/bwv11.6.mid");
  write(root, "patchers/cento.brain.amxd", "u".repeat(100));
  write(root, "patchers/cento.voice.amxd", "u".repeat(100));
  write(root, "frozen/cento.brain.amxd", "f".repeat(5000));
  write(root, "frozen/cento.voice.amxd", "f".repeat(frozenVoice));
  write(root, "build/Cento Demo Project/Cento Demo.als");
  // The Max version: its top patch, its parts and their scripts; and Live's
  // own parts, which it doesn't use.
  write(root, "patchers/cento.maxpat", patch(
    { maxclass: "bpatcher", name: "emi.host.max.maxpat" },
    { maxclass: "newobj", text: "emi.engine" },
    { maxclass: "newobj", text: "transport" },
    { maxclass: "newobj", text: "p sub", patcher: { boxes: [{ box: { maxclass: "v8ui", filename: "emi.view.bundle.js" } }] } },
  ));
  write(root, "patchers/parts/emi.host.max.maxpat", patch({ maxclass: "newobj", text: "emi.engine" }));
  write(root, "patchers/parts/emi.engine.maxpat", patch({ maxclass: "newobj", text: "v8 emi.core.bundle.js", textfile: { filename: "emi.core.bundle.js" } }));
  write(root, "patchers/scripts/emi.core.bundle.js");
  write(root, "patchers/scripts/emi.view.bundle.js");
  write(root, "patchers/parts/emi.brain.maxpat", patch({ maxclass: "newobj", text: "emi.engine" }));
  write(root, "patchers/scripts/emi.voice.bundle.js");
  return root;
}

const hasZip = (() => {
  try {
    execFileSync("zip", ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

test("package: says what's missing or wrong, and how to make it", () => {
  const root = fakeRepo({ frozenVoice: 150 });
  fs.rmSync(path.join(root, "patchers", "scripts", "emi.view.bundle.js"));
  const [live, max] = plan(root);
  assert.equal(live.zip, "Cento-for-Live-v9.9.9.zip");
  assert.equal(live.folder, "Cento for Live v9.9.9");
  assert.deepEqual(live.missing, ["frozen/cento.voice.amxd isn't frozen (it's hardly bigger than patchers/cento.voice.amxd): click Freeze Device before saving it"]);
  assert.deepEqual([max.zip, max.folder], ["Cento-for-Max-v9.9.9.zip", "Cento for Max v9.9.9"]);
  assert.deepEqual(max.missing, ["patchers/scripts/emi.view.bundle.js is missing: it's in the repository: pull the latest code, or run npm run patches and npm run build"]);
  fs.rmSync(path.join(root, "frozen"), { recursive: true });
  assert.match(plan(root, "live")[0].missing[0], /^frozen\/cento\.brain\.amxd is missing: freeze the device \(docs\/releasing\.md, step 1\.1\)$/);
  assert.equal(plan(root, "max").length, 1);
});

test("package: the Max version is cento.maxpat and what it uses, followed through its patches", () => {
  const root = fakeRepo();
  assert.deepEqual(patchFiles(root), [
    "patchers/cento.maxpat",
    "patchers/parts/emi.host.max.maxpat",
    "patchers/parts/emi.engine.maxpat",
    "patchers/scripts/emi.core.bundle.js",
    "patchers/scripts/emi.view.bundle.js",
  ], "each once; Max's own objects and Live's parts left out");
  // In the repository: everything the Max version opens, nothing of Live's,
  // and no two files with one name (they share one folder in the download).
  const files = patchFiles(ROOT);
  const names = files.map((f) => path.basename(f));
  assert.deepEqual([...new Set(names)], names);
  for (const name of ["cento.maxpat", "emi.engine.maxpat", "emi.host.max.maxpat", "emi.panel.maxpat", "emily.panel.maxpat", "emi.view.maxpat",
    "emi.window.maxpat", "emi.corpora.maxpat", "emi.instruments.maxpat", "emi.extras.maxpat", "emi.magdalena.maxpat",
    "emi.core.bundle.js", "emi.view.bundle.js", "emi.text.bundle.js", "emi.taste.bundle.js", "emi.corpora.bundle.js"]) {
    assert.ok(names.includes(name), name);
  }
  for (const name of ["emi.brain.maxpat", "emi.host.live.maxpat", "emi.voice.maxpat", "emi.voice.bundle.js"]) assert.ok(!names.includes(name), name);
  for (const file of files) assert.ok(fs.existsSync(path.join(ROOT, file)), file);
});

test("package: the zips hold the read-me, the licence, the Cento folder and the product", { skip: !hasZip && "no zip command" }, () => {
  const root = fakeRepo();
  const out = path.join(root, "dist");
  const listing = (zip) => execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).split("\n").filter((l) => l && !l.endsWith("/")).sort();
  const [live, max] = plan(root);
  assert.deepEqual([live.missing, max.missing], [[], []]);
  const shared = (folder) => [
    `${folder}/Cento/About this folder.txt`,
    `${folder}/Cento/corpus/LICENSE-CC-BY-4.0.txt`,
    `${folder}/Cento/corpus/README.md`,
    `${folder}/Cento/corpus/bach-figured-bass-3-4/bwv11.6.mid`,
    `${folder}/Cento/corpus/bach-figured-bass/bwv1.6.mid`,
    `${folder}/LICENSE.txt`,
    `${folder}/Read me first.html`,
  ];
  assert.deepEqual(listing(build(root, live, out)), [
    ...shared("Cento for Live v9.9.9"),
    "Cento for Live v9.9.9/Cento Demo Project/Cento Demo.als",
    "Cento for Live v9.9.9/Devices/cento.brain.amxd",
    "Cento for Live v9.9.9/Devices/cento.voice.amxd",
  ].sort());
  assert.deepEqual(listing(build(root, max, out)), [
    ...shared("Cento for Max v9.9.9"),
    "Cento for Max v9.9.9/Cento Patch/cento.maxpat",
    "Cento for Max v9.9.9/Cento Patch/emi.core.bundle.js",
    "Cento for Max v9.9.9/Cento Patch/emi.engine.maxpat",
    "Cento for Max v9.9.9/Cento Patch/emi.host.max.maxpat",
    "Cento for Max v9.9.9/Cento Patch/emi.view.bundle.js",
  ].sort());
  assert.ok(!fs.existsSync(path.join(out, "stage")));
});

test("package: in the repository, only what's built in Live is missing; the Max version is all there", () => {
  const [live, max] = plan(ROOT);
  for (const line of live.missing) assert.match(line, /^(frozen|build)\//, line);
  assert.deepEqual(max.missing, []);
});

test("package: the read-me and the Cento folder's note agree with the code and the README", () => {
  const readme = fs.readFileSync(path.join(ROOT, "release", "Read me first.html"), "utf8");
  // The file the download brings is one Cento looks for (emi-userfolder).
  assert.ok(MARKERS.includes("About this folder.txt"));
  assert.ok(readme.includes("<code>About this folder.txt</code>"));
  // The music21 steps it links to.
  assert.match(readme, /github\.com\/nnokes\/cento#more-chorales-from-music21/);
  assert.match(fs.readFileSync(path.join(ROOT, "README.md"), "utf8"), /^## More chorales from music21$/m);
  // What it promises: the demo set's name, the folders, the chorales.
  assert.ok(readme.includes("<strong>Cento Demo Project</strong>") && readme.includes("<strong>Cento Demo.als</strong>"));
  // The Max version: the folder and the file the packaging script makes, and no app.
  const [, max] = plan(ROOT);
  assert.ok(max.entries.some(([to]) => to === "Cento Patch/cento.maxpat"));
  assert.ok(readme.includes("<strong>Cento Patch</strong>") && readme.includes("<strong>cento.maxpat</strong>"));
  assert.ok(!/Cento for Mac|\.app\b/.test(readme), "no app any more");
  assert.ok(readme.includes("<code>bach-figured-bass-3-4</code>"));
  assert.match(readme, /comes with 131 Bach chorales/);
  const about = fs.readFileSync(path.join(ROOT, "release", "About this folder.txt"), "utf8");
  for (const name of ["cento.settings.json", "cento.taste.json", "cento.emily.json", "cento.snapshots.json"]) assert.ok(about.includes(name), name);
});
