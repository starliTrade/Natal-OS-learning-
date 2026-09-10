import fs from "fs";

const uiCode = fs.readFileSync("ui_section.js", "utf8");
const bIdx = uiCode.indexOf("function B(){");
console.log("=== COMPONENT B (REVIEW TAB) ===");
console.log(uiCode.substring(bIdx, bIdx + 3500));
