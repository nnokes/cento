"use strict";
// M0 spike: proves the same code gives the same answer in Node, in the Max
// version and in the Live version. "check" is four seeded random numbers, so
// any difference between environments shows up immediately.

const rng = require("emi-rng");
const { VERSION } = require("emi-version");

function hello(seed) {
  const random = rng.create(seed);
  const check = [];
  for (let i = 0; i < 4; i++) check.push(random.int(1000));
  return { name: "emi", version: VERSION, seed, check };
}

exports.hello = hello;
