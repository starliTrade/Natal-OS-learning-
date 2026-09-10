const fs = require("fs");
const code = fs.readFileSync("0.fi213plkvp_.js", "utf8");

// Search for the phases array
const marker = '[{id:0,title:"Phase 0';
const startIdx = code.indexOf(marker);
if (startIdx !== -1) {
  let depth = 0;
  let inStr = false;
  let strChar = "";
  let endIdx = -1;
  for (let i = startIdx; i < code.length; i++) {
    const ch = code[i];
    const prev = code[i - 1];
    if (inStr) {
      if (ch === strChar && prev !== "\\") {
        inStr = false;
      }
    } else {
      if (ch === '"' || ch === "'" || ch === "`") {
        inStr = true;
        strChar = ch;
      } else if (ch === "[") {
        depth++;
      } else if (ch === "]") {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
  }
  console.log("Found phases array from", startIdx, "to", endIdx);
  const phasesStr = code.substring(startIdx, endIdx);
  fs.writeFileSync("extracted_phases.js", "module.exports = " + phasesStr);
  console.log("Saved extracted_phases.js!");
} else {
  console.log("Marker not found");
}
