"use strict";
// The chorales that ship with Cento (corpus/, from the Bach Chorales Figured
// Bass dataset, CC BY 4.0; corpus/README.md): every one loads with four
// voices and its phrase ends, the folders match what the README says, and
// pieces compose from them.
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

const sim = require("./max-sim");
global.File = sim.FsFile; // emi-load reads files through Max's File and Folder
global.Folder = sim.FsFolder;
const load = require("emi-load");
const lexicon = require("emi-lexicon");
const forms = require("emi-form");

const ROOT = path.resolve(__dirname, "..", "corpus");
const FOLDERS = { "bach-figured-bass": { works: 118, meter: [4, 4], major: 51, minor: 67 }, "bach-figured-bass-3-4": { works: 13, meter: [3, 4], major: 10, minor: 3 } };

for (const [name, expected] of Object.entries(FOLDERS)) {
  test(`bundled corpus: ${name}: ${expected.works} chorales, each with four voices and fermatas`, () => {
    const { works, skipped } = load.loadFolder(path.join(ROOT, name));
    assert.deepEqual(skipped, []);
    assert.equal(works.length, expected.works);
    const modes = { major: 0, minor: 0 };
    for (const work of works) {
      assert.deepEqual(work.meter, expected.meter, work.id);
      assert.deepEqual([...new Set(work.events.map((e) => e[3]))].sort(), [1, 2, 3, 4], `${work.id}: four voices`);
      assert.ok(work.fermatas.length > 0, `${work.id}: phrase ends`);
      modes[work.key.mode]++;
    }
    assert.deepEqual(modes, { major: expected.major, minor: expected.minor });
    // Each says where it came from, without anyone's paths.
    for (const file of fs.readdirSync(path.join(ROOT, name)).filter((f) => f.endsWith(".json"))) {
      const info = JSON.parse(fs.readFileSync(path.join(ROOT, name, file), "utf8"));
      assert.match(info.source, /^Bach Chorales Figured Bass \(CC BY 4\.0\): BWV_[\w.]+_FB\.musicxml$/, file);
    }
  });
}

test("bundled corpus: the README's table and credit match, and the license is there", () => {
  const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
  for (const [name, e] of Object.entries(FOLDERS)) {
    assert.ok(readme.includes(`| \`${name}\` | ${e.works} | ${e.meter.join("/")} | ${e.major} major, ${e.minor} minor |`), name);
  }
  assert.match(readme, /Creative Commons Attribution 4\.0/);
  const prose = readme.replace(/\n>?\s*/g, " "); // the quoted citation wraps
  assert.match(prose, /Ju, Yaolong, Sylvain Margot, Cory McKay, Luke Dahn, and Ichiro Fujinaga/);
  assert.match(fs.readFileSync(path.join(ROOT, "LICENSE-CC-BY-4.0.txt"), "utf8"), /^Attribution 4\.0 International/);
});

test("bundled corpus: pieces compose from the 4/4 chorales", () => {
  const { works } = load.loadFolder(path.join(ROOT, "bach-figured-bass"));
  const db = lexicon.build(works);
  assert.equal(db.mode, "mixed");
  assert.ok(db.signatures.length > 50, `${db.signatures.length} signatures`);
  for (const seed of [1, 2, 3]) assert.ok(forms.compose(db, { seed, beats: 32, signatures: true }).ok, `seed ${seed}`);
});

// M1 and M2 (after v0.1.0): pieces follow their template's soprano more
// closely with the contour score than without it, and keep its degree at
// more of their cadences.
test("bundled corpus: the soprano follows the template's contour and its cadence degrees", () => {
  const { works } = load.loadFolder(path.join(ROOT, "bach-figured-bass"));
  const db = lexicon.build(works);
  const beat = db.beatTicks;
  const soprano = (piece, s) => {
    const e = piece.events.find((x) => x[3] === 1 && x[0] <= piece.padTicks + s * beat && piece.padTicks + s * beat < x[0] + x[2]);
    return e ? e[1] : null;
  };
  const agreement = (options) => {
    let moves = 0, same = 0, cadences = 0, degrees = 0;
    for (const seed of [1, 2, 3, 4, 5]) {
      const { ok, piece } = forms.compose(db, { seed, beats: 32, ...options });
      assert.ok(ok, `seed ${seed}`);
      const template = db.templates.find((t) => t.work === piece.form.template);
      const slots = forms.slotsOf(db, template);
      slots.forEach((slot, s) => {
        if (slot.rest) return;
        const here = soprano(piece, s);
        if (slot.contour !== null && here !== null && !slots[s + 1].rest && soprano(piece, s + 1) !== null) {
          moves++;
          if (Math.sign(soprano(piece, s + 1) - here) === Math.sign(slot.contour)) same++;
        }
        if (slot.soprano !== null && here !== null) {
          cadences++;
          if (here % 12 === slot.soprano) degrees++;
        }
      });
    }
    return { contour: same / moves, degree: degrees / cadences };
  };
  const on = agreement({});
  const off = agreement({ contour: false, cadenceSoprano: false });
  assert.ok(on.contour > off.contour + 0.1, `contour ${on.contour.toFixed(2)} on, ${off.contour.toFixed(2)} off`);
  assert.ok(on.degree > off.degree, `cadence degrees ${on.degree.toFixed(2)} on, ${off.degree.toFixed(2)} off`);
  assert.ok(on.contour >= 0.6 && on.degree >= 0.7, `contour ${on.contour.toFixed(2)}, degrees ${on.degree.toFixed(2)}`);
});
