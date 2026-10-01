"use strict";
// Checks shared by the compose tests: the rules every composed piece must keep,
// checked from its provenance. Not a test file itself (no .test.js).
const assert = require("node:assert/strict");

// The rules every composed piece must keep, checked from its provenance.
function checkPiece(db, piece, minBeats) {
  const byId = new Map(db.groupings.map((g) => [g.id, g]));
  const chain = piece.provenance.map((p) => byId.get(p.grouping));
  assert.ok(chain.length >= minBeats, "too short");
  assert.equal(chain[0].opening, true, "must start on an opening");
  assert.equal(chain.at(-1).final, true, "must end on a final grouping");
  for (let i = 1; i < chain.length; i++) {
    const [prev, next] = [chain[i - 1], chain[i]];
    assert.equal(next.entryKey, prev.destKey, `voice-hooking broken at beat ${i}`);
    assert.equal(next.beatInBar, (prev.beatInBar % 4) + 1, `metre broken at beat ${i}`);
    if (next.work === prev.work) assert.equal(next.newNotes, 0, `same source at beat ${i}`);
  }
  // Within each voice, notes never overlap: split notes were joined again.
  for (let v = 1; v <= 4; v++) {
    const notes = piece.events.filter((e) => e[3] === v);
    for (let i = 1; i < notes.length; i++) {
      assert.ok(notes[i][0] >= notes[i - 1][0] + notes[i - 1][2], `voice ${v} overlaps at ${notes[i][0]}`);
    }
  }
}

module.exports = { checkPiece };
