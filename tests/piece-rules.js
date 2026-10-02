"use strict";
// Checks shared by the compose tests: the rules every composed piece must keep,
// checked from its provenance. Not a test file itself (no .test.js).
const assert = require("node:assert/strict");
const lexicon = require("emi-lexicon");
const form = require("emi-form");

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
  checkVoices(piece);
}

// Within each voice, notes never overlap: split notes were joined again.
function checkVoices(piece) {
  for (let v = 1; v <= 4; v++) {
    const notes = piece.events.filter((e) => e[3] === v);
    for (let i = 1; i < notes.length; i++) {
      assert.ok(notes[i][0] >= notes[i - 1][0] + notes[i - 1][2], `voice ${v} overlaps at ${notes[i][0]}`);
    }
  }
}

// The rules every piece composed to a form (M3) must keep: one grouping per
// sounding slot of its template, at the slot's time, fitting the slot
// (metre, cadence and its bass, opening, after a rest, final); voices that
// join exactly at every seam (L0: the same pitches and ties; L1: the same
// pitches after octave moves); the different-source rule; cadences only
// where the template has them; every voice in its range.
function checkForm(db, piece) {
  const template = db.templates.find((t) => t.work === piece.form.template);
  assert.ok(template, `unknown template ${piece.form.template}`);
  const slots = form.slotsOf(db, template, form.RELAX[piece.form.relaxed]);
  const filled = slots.map((slot, s) => s).filter((s) => !slots[s].rest);
  const byId = new Map(db.groupings.map((g) => [g.id, g]));
  assert.equal(piece.provenance.length, filled.length, "one grouping per sounding slot");
  assert.equal(piece.form.beats, slots.length);
  const t0 = piece.provenance[0].tick;
  const moved = (key, shift) => lexicon.parseKey(key).map((t, v) => t && { held: t.held, pitch: t.pitch + (shift ? shift[v] : 0) });

  piece.provenance.forEach((p, k) => {
    const s = filled[k];
    const g = byId.get(p.grouping);
    assert.equal(p.tick, t0 + s * db.beatTicks, `slot ${s} is at the wrong time`);
    assert.ok(form.fits(g, slots[s]), `slot ${s}: ${g.id} doesn't fit`);
    if (piece.form.relaxed === 0) assert.equal(p.level, 0, `slot ${s}: relaxed in a strict piece`);
    for (const [, pitch, , voice] of g.pieces) {
      const [low, high] = db.ranges[voice - 1];
      const at = pitch + (p.shift ? p.shift[voice - 1] : 0);
      assert.ok(at >= low && at <= high, `slot ${s}: voice ${voice} out of range`);
    }
    if (k === 0 || filled[k - 1] !== s - 1) return; // nothing to join to
    const prevP = piece.provenance[k - 1];
    const prev = byId.get(prevP.grouping);
    const dest = moved(prev.destKey, prevP.shift);
    const entry = moved(g.entryKey, p.shift);
    const pitches = (tokens) => tokens.map((t) => t && t.pitch);
    assert.deepEqual(pitches(entry), pitches(dest), `slot ${s}: voices don't join`);
    if (p.level === 0) {
      assert.equal(p.shift, undefined, `slot ${s}: an exact hook moved voices`);
      assert.equal(lexicon.keyOf(entry), lexicon.keyOf(dest), `slot ${s}: ties differ in an exact hook`);
    }
    if (g.work === prev.work) assert.equal(g.newNotes, 0, `slot ${s}: same source`);
  });

  const cadenceTicks = filled.filter((s) => slots[s].cadence).map((s) => t0 + s * db.beatTicks);
  assert.deepEqual(piece.fermatas, cadenceTicks, "cadences only where the template has them");
  checkVoices(piece);
}

module.exports = { checkPiece, checkForm };
