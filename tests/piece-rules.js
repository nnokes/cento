"use strict";
// Checks shared by the compose tests: the rules every composed piece must keep,
// checked from its provenance. Not a test file itself (no .test.js).
const assert = require("node:assert/strict");
const lexicon = require("emi-lexicon");
const form = require("emi-form");
const signatures = require("emi-signatures");

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
    const beatsPerBar = (db.meter[0] * 4) / db.meter[1];
    assert.equal(next.beatInBar, (prev.beatInBar % beatsPerBar) + 1, `metre broken at beat ${i}`);
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

  checkBlocks(db, piece.provenance, (k) => filled[k], piece.form.template);
  piece.provenance.forEach((p, k) => {
    const s = filled[k];
    const g = byId.get(p.grouping);
    assert.equal(p.tick, t0 + s * db.beatTicks, `slot ${s} is at the wrong time`);
    assert.ok(form.fits(g, slots[s], !p.block), `slot ${s}: ${g.id} doesn't fit`);
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
    if (g.work === prev.work && !(p.block && p.block === prevP.block)) assert.equal(g.newNotes, 0, `slot ${s}: same source`);
  });

  const cadenceTicks = filled.filter((s) => slots[s].cadence).map((s) => t0 + s * db.beatTicks);
  assert.deepEqual(piece.fermatas, cadenceTicks, "cadences only where the template has them");
  checkVoices(piece);
}

// The rules a stream (M5) must keep: every phrase's groupings fit its
// prepared slots and sit at their beats; phrases follow each other with no
// overlap; voices join exactly wherever two beats touch, inside a phrase or
// across a phrase boundary (after a gap or a breath, a phrase starts with a
// grouping that followed a rest); the different-source rule; a final phrase
// ends on a chorale's last chord.
function checkStream(db, stream) {
  const moved = (key, shift) => lexicon.parseKey(key).map((t, v) => t && t.pitch + (shift ? shift[v] : 0));
  let prev = null; // { placed, beat }
  let expectedStart = 0;
  for (const phrase of stream.phrases) {
    const where = `phrase ${phrase.number} (${phrase.work} #${phrase.index})`;
    assert.equal(phrase.startBeat, expectedStart + (phrase.fallback ? 1 : 0), `${where}: starts where the last ended`);
    assert.equal(phrase.endBeat - phrase.startBeat, phrase.slots.length, where);
    checkBlocks(db, phrase.piece.provenance, (k) => phrase.placed[k].beat - phrase.startBeat, phrase.work);
    for (const p of phrase.placed) {
      const g = db.groupings[p.index];
      const slot = phrase.slots[p.beat - phrase.startBeat];
      assert.ok(slot && !slot.rest, `${where}: beat ${p.beat} has no slot`);
      assert.ok(form.fits(g, slot, !p.block), `${where}: ${g.id} doesn't fit beat ${p.beat}`);
      if (prev && prev.beat === p.beat - 1) {
        const before = db.groupings[prev.placed.index];
        assert.deepEqual(moved(g.entryKey, p.shift), moved(before.destKey, prev.placed.shift), `${where}: voices don't join at beat ${p.beat}`);
        if (g.work === before.work && !(p.block && p.block === prev.placed.block)) assert.equal(g.newNotes, 0, `${where}: same source at beat ${p.beat}`);
      } else if (prev) {
        assert.ok(g.restBefore, `${where}: beat ${p.beat} follows silence but isn't a phrase start`);
      }
      prev = { placed: p, beat: p.beat };
    }
    if (phrase.final) assert.ok(db.groupings[phrase.placed[phrase.placed.length - 1].index].final, `${where}: doesn't end on a last chord`);
    expectedStart = phrase.endBeat;
  }
}

// Signature blocks (M7): each is a run of consecutive groupings of one work,
// on consecutive slots, moved alike, ending on a cadence; together they are
// one of the corpus's signature blocks (emi-signatures), from a work other
// than the template's, and its last grouping lists that block's signatures.
// slotOf(k): the slot of provenance entry k.
function checkBlocks(db, provenance, slotOf, template = null) {
  const byId = new Map(db.groupings.map((g, i) => [g.id, i]));
  for (let k = 0; k < provenance.length; ) {
    if (!provenance[k].block) {
      k++;
      continue;
    }
    let end = k;
    while (end + 1 < provenance.length && provenance[end + 1].block === provenance[k].block) end++;
    const first = byId.get(provenance[k].grouping);
    assert.equal(provenance[k].block, provenance[k].grouping, "a block is named after its first grouping");
    for (let j = k; j <= end; j++) {
      assert.equal(byId.get(provenance[j].grouping), first + j - k, `block ${provenance[k].block}: not consecutive groupings`);
      assert.equal(slotOf(j), slotOf(k) + j - k, `block ${provenance[k].block}: not on consecutive slots`);
      assert.deepEqual(provenance[j].shift, provenance[k].shift, `block ${provenance[k].block}: voices moved differently`);
    }
    const last = db.groupings[first + end - k];
    assert.ok(last.cadence, `block ${provenance[k].block}: doesn't end on a cadence`);
    const found = signatures.blockAt(db, first, first + end - k);
    assert.ok(found, `block ${provenance[k].block}: not a signature block`);
    assert.deepEqual(provenance[end].signatures, found.sigs, `block ${provenance[k].block}: signatures`);
    if (template) assert.notEqual(found.work, template, `block ${provenance[k].block}: from the template's own work`);
    k = end + 1;
  }
}

module.exports = { checkPiece, checkForm, checkStream, checkBlocks };
