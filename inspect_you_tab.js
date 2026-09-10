import fs from "fs";

const uiCode = fs.readFileSync("ui_section.js", "utf8");
const youIdx = uiCode.indexOf("function $(){");
console.log("=== COMPONENT $ (YOU TAB) ===");
console.log(uiCode.substring(youIdx, youIdx + 4000));
