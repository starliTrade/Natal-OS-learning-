import fs from "fs";

const uiCode = fs.readFileSync("ui_section.js", "utf8");
console.log("UI CODE LENGTH:", uiCode.length);

// Let's find component signatures in uiCode
const compMatches = uiCode.match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(([^)]*)\)/g) || [];
console.log("Components found:", compMatches);

// Let's write a script that finds every component and prints the first 500 chars of it
let pos = 0;
while (true) {
  const match = uiCode.substring(pos).match(/function\s+([A-Z][a-zA-Z0-9]*)\s*\(([^)]*)\)/);
  if (!match) break;
  const idx = pos + match.index;
  console.log(`\n=== COMPONENT: ${match[1]} (${match[2]}) at offset ${idx} ===`);
  console.log(uiCode.substring(idx, idx + 400).replace(/\n/g, " "));
  pos = idx + match[0].length;
}
