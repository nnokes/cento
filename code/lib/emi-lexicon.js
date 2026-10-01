"use strict";
// The lexicon: every grouping of every work, indexed by how it starts.
// In M2 the only match level is L0: exact pitches per voice, including which
// voices are held over (see entryKey in emi-segment).
//
// db = {
//   version, beatTicks, meter, matchLevel: "L0",
//   works: [{ id, title, key, transposedBy, groupings }],
//   groupings: [grouping],            // see emi-segment
//   lexicon: { entryKey: [grouping index] },
//   openings: [grouping index], finals: [grouping index]
// }
// Plain JSON, so a database can be saved and loaded later.

const ingest = require("emi-ingest");
const { segment } = require("emi-segment");

// works: as read (any key); each is moved to C major / A minor first.
function build(works) {
  if (!works.length) throw new Error("no works to build a lexicon from");
  const meters = new Set(works.map((w) => w.meter.join("/")));
  if (meters.size > 1) throw new Error("works must share one meter, found " + [...meters].join(", "));

  const db = {
    version: 1,
    beatTicks: works[0].ppq,
    meter: works[0].meter,
    matchLevel: "L0",
    works: [],
    groupings: [],
    lexicon: {},
    openings: [],
    finals: [],
  };
  for (const work of works) {
    const inC = ingest.normalize(work);
    const groupings = segment(inC, db.beatTicks);
    db.works.push({ id: work.id, title: work.title, key: work.key, transposedBy: inC.transposedBy, groupings: groupings.length });
    for (const g of groupings) {
      const i = db.groupings.length;
      db.groupings.push(g);
      (db.lexicon[g.entryKey] = db.lexicon[g.entryKey] || []).push(i);
      if (g.opening) db.openings.push(i);
      if (g.final) db.finals.push(i);
    }
  }
  return db;
}

// For each grouping that has a continuation: how many groupings from OTHER
// works start where it goes. Zero means a dead end for the different-source
// rule (unless the next beat is a pure continuation).
function stats(db) {
  let withDest = 0;
  let deadEnds = 0;
  let choices = 0;
  for (const g of db.groupings) {
    if (g.destKey === null) continue;
    withDest++;
    const others = (db.lexicon[g.destKey] || []).filter((i) => db.groupings[i].work !== g.work).length;
    if (others === 0) deadEnds++;
    choices += others;
  }
  return {
    works: db.works.length,
    groupings: db.groupings.length,
    keys: Object.keys(db.lexicon).length,
    deadEndShare: withDest ? deadEnds / withDest : 0,
    meanChoices: withDest ? choices / withDest : 0,
  };
}

exports.build = build;
exports.stats = stats;
