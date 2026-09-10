import fs from "fs";

const code = fs.readFileSync("0.fi213plkvp_.js", "utf8");

// Let us find Persian strings, tabs, storage keys, modal names, etc.
const persianRegex = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
const persianMatches = [...new Set(code.match(persianRegex) || [])];
console.log("Persian terms count:", persianMatches.length);

// Extract flashcards, questions, or other static datasets
const questions = code.match(/\{q:[^}]+\}/g) || [];
console.log("Found questions/flashcards count:", questions.length);

// Search for key parts in the file
// Let's split code into sections or search for components
const matches = [];
let pos = 0;
while (true) {
  const idx = code.indexOf("function ", pos);
  if (idx === -1) break;
  // look at the next 50 chars
  matches.push(code.substring(idx, idx + 40));
  pos = idx + 9;
}
console.log("Found functions:", matches);

// Search for tabs:
const tabsRegex = /"roadmap"|"gate"|"review"|"feynman"|"stats"|"you"|"profile"|"settings"/gi;
console.log("Tab occurrences:", [...new Set(code.match(tabsRegex) || [])]);
