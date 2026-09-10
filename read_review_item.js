import fs from "fs";

const storeCode = fs.readFileSync("store_section.js", "utf8");
const revIdx = storeCode.indexOf("reviewItem:(n,a)=>");
console.log("=== REVIEW ITEM AND BEYOND ===");
console.log(storeCode.substring(revIdx, revIdx + 3000));
