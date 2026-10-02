"use strict";
// M8: the blind A/B listening test.
const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("vm");

const lexicon = require("emi-lexicon");
const abtest = require("emi-abtest");
const { page } = require("emi-abtest-page");
const { work, I, IV, V, phrase } = require("./synthetic");

const II = [74, 69, 65, 50];
const VI = [69, 64, 60, 57];
const corpus = ["a", "b", "c", "d"].map((id, k) =>
  work(id, [...phrase(...(k % 2 ? [I, VI, II, V, I, IV, V, I, IV] : [I, IV, V, I, IV, V, I, IV, V])), [...I, 2]], { fermataAt: [12] }),
);
// d is written in G major: the test plays it, and the piece in its form, in G.
corpus[3] = { ...corpus[3], key: { tonic: 7, mode: "major", from: "test" }, events: corpus[3].events.map((e) => [e[0], e[1] + 7, ...e.slice(2)]) };

test("abtest: each pair is a chorale and a piece in its form, in the chorale's key, in random order", () => {
  const db = lexicon.build(corpus);
  const t = abtest.build(db, { count: 3, seed: 2 });
  assert.equal(t.pairs.length, 3);
  assert.equal(t.answers.length, 3);
  assert.equal(new Set(t.answers.map((a) => a.chorale)).size, 3, "different chorales");
  for (const [k, pair] of t.pairs.entries()) {
    const answer = t.answers[k];
    assert.equal(answer.template, answer.chorale, "the piece takes the chorale's form");
    const bach = pair[answer.bach];
    const other = pair[answer.bach === "A" ? "B" : "A"];
    assert.equal(bach[0][0], 0, "starts at once");
    assert.equal(Math.max(...bach.map((n) => n[0] + n[2])), Math.max(...other.map((n) => n[0] + n[2])), "the same length");
    if (answer.chorale === "d") {
      assert.equal(pair.key, "G major");
      assert.ok(bach.some((n) => n[1] === 72 + 7), "back in G");
    } else assert.equal(pair.key, "C major");
  }
  assert.deepEqual(abtest.unseal(abtest.seal(t.answers)), t.answers);
  assert.deepEqual(abtest.build(db, { count: 3, seed: 2 }), t, "the same seed, the same test");
});

test("abtest: the chance of doing as well by guessing", () => {
  assert.equal(abtest.chance(0, 10), 1);
  assert.equal(abtest.chance(10, 10), 1 / 1024);
  assert.ok(Math.abs(abtest.chance(8, 10) - 56 / 1024) < 1e-12);
  assert.ok(Math.abs(abtest.chance(5, 10) - 638 / 1024) < 1e-12);
});

test("abtest: the page carries its data, hides the answers, and its script parses", () => {
  const db = lexicon.build(corpus);
  const t = abtest.build(db, { count: 3, seed: 2 });
  const html = page(t);
  assert.match(html, /^<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">/);
  const data = JSON.parse(html.match(/<script type="application\/json" id="test-data">([^<]*)<\/script>/)[1]);
  assert.deepEqual(data.pairs, t.pairs);
  assert.ok(!html.includes('"bach"'), "the answers aren't readable in the source");
  const key = JSON.parse(html.match(/<script type="application\/json" id="test-key">([^<]*)<\/script>/)[1]);
  assert.deepEqual(abtest.unseal(key), t.answers);
  const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(script));
  const body = page(t, { standalone: false });
  assert.match(body, /^<title>Which Is Bach\?<\/title>/);
  assert.ok(!body.includes("<html"));
});
