import fs from "fs";

const storeCode = fs.readFileSync("store_section.js", "utf8");
console.log("=== STORE SECTION SNIPPET ===");
console.log(storeCode.substring(0, 3000));
