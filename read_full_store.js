import fs from "fs";

const storeCode = fs.readFileSync("store_section.js", "utf8");
console.log("STORE CODE LENGTH:", storeCode.length);

// Let us print in chunks of 3000 chars
for (let i = 0; i < storeCode.length; i += 3000) {
  console.log(`\n--- CHUNK ${i} ---`);
  console.log(storeCode.substring(i, i + 3000));
}
