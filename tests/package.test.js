"use strict";
// tools/package.js (M12): the two downloads, made from a pretend repository,
// and the files the repository itself puts in them.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { plan, build } = require("../tools/package");
const { MARKERS } = require("emi-userfolder");

const ROOT = path.resolve(__dirname, "..");

function write(root, file, content = "x") {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), content);
}

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
  write(root, "build/Cento.app/Contents/MacOS/Cento");
  write(root, "build/Cento.app/Contents/Info.plist");
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
  fs.rmSync(path.join(root, "build", "Cento.app", "Contents", "MacOS"), { recursive: true });
  const [live, mac] = plan(root);
  assert.equal(live.zip, "Cento-for-Live-v9.9.9.zip");
  assert.equal(live.folder, "Cento for Live v9.9.9");
  assert.deepEqual(live.missing, ["frozen/cento.voice.amxd isn't frozen (it's hardly bigger than patchers/cento.voice.amxd): click Freeze Device before saving it"]);
  assert.deepEqual(mac.missing, ["build/Cento.app isn't an app (no Contents/MacOS): build it with Build Collective / Application, as Application"]);
  fs.rmSync(path.join(root, "frozen"), { recursive: true });
  assert.match(plan(root, "live")[0].missing[0], /^frozen\/cento\.brain\.amxd is missing: freeze the device \(docs\/releasing\.md, step 1\.1\)$/);
  assert.equal(plan(root, "mac").length, 1);
});

test("package: the zips hold the read-me, the licence, the Cento folder and the product", { skip: !hasZip && "no zip command" }, () => {
  const root = fakeRepo();
  const out = path.join(root, "dist");
  const listing = (zip) => execFileSync("unzip", ["-Z1", zip], { encoding: "utf8" }).split("\n").filter((l) => l && !l.endsWith("/")).sort();
  const [live, mac] = plan(root);
  assert.deepEqual([live.missing, mac.missing], [[], []]);
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
  assert.deepEqual(listing(build(root, mac, out)), [
    ...shared("Cento for Mac v9.9.9"),
    "Cento for Mac v9.9.9/Cento.app/Contents/Info.plist",
    "Cento for Mac v9.9.9/Cento.app/Contents/MacOS/Cento",
  ].sort());
  assert.ok(!fs.existsSync(path.join(out, "stage")));
});

test("package: in the repository, only what's built on the Mac is missing", () => {
  for (const product of plan(ROOT)) {
    for (const line of product.missing) assert.match(line, /^(frozen|build)\//, line);
  }
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
  assert.ok(readme.includes("<code>bach-figured-bass-3-4</code>"));
  assert.match(readme, /comes with 131 Bach chorales/);
  const about = fs.readFileSync(path.join(ROOT, "release", "About this folder.txt"), "utf8");
  for (const name of ["cento.settings.json", "cento.taste.json", "cento.emily.json", "cento.snapshots.json"]) assert.ok(about.includes(name), name);
});
