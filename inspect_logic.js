import fs from "fs";

const code = fs.readFileSync("0.fi213plkvp_.js", "utf8");

// Search for useState, useEffect, localStorage keys, tab names
const tabs = code.match(/["'](Roadmap|Daily Gate|Review|Feynman|Stats|Profile|Settings|Flashcards|Gate|Learn|Practice)["']/gi) || [];
console.log("Found tab matches:", [...new Set(tabs)]);

// Let's find localStorage usages
const lsMatches = code.match(/localStorage\.(getItem|setItem|removeItem)\(["'][^"']+["']\)/g) || [];
console.log("localStorage calls:", [...new Set(lsMatches)]);

// Let's find function definitions or key logic blocks
const sm2Matches = code.match(/interval|easeFactor|repetition|quality|grade|sm-2|sm2|nextReview/gi) || [];
console.log("SM-2 related words count:", sm2Matches.length);

// Extract snippets around SM2 or review
const idxSM2 = code.indexOf("calcSM2") !== -1 ? code.indexOf("calcSM2") : code.indexOf("sm2");
console.log("SM2 index:", idxSM2);

// Let's find all function names or state variables
const stateMatches = code.match(/const\s*\[([a-zA-Z0-9_]+),\s*set([a-zA-Z0-9_]+)\]/g) || [];
console.log("State variables found:", stateMatches.length);
console.log("Sample states:", stateMatches.slice(0, 30));

