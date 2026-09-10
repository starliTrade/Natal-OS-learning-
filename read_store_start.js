import fs from "fs";

const storeCode = fs.readFileSync("store_section.js", "utf8");
console.log("=== CHUNK 0 TO 6000 ===");
console.log(storeCode.substring(0, 6000));
