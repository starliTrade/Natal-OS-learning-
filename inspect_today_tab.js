import fs from "fs";

const uiCode = fs.readFileSync("ui_section.js", "utf8");
const cIdx = uiCode.indexOf("function C(){");
console.log("=== COMPONENT C (TODAY TAB) ===");
console.log(uiCode.substring(cIdx, cIdx + 4000));
