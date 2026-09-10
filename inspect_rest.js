import fs from "fs";

const rest = fs.readFileSync("rest_of_app.js", "utf8");
console.log("Length of rest:", rest.length);

// Let's print out interesting strings from rest
const stringRegex = /"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g;
const allStrings = rest.match(stringRegex) || [];
const cleanStrings = allStrings
  .map(s => s.slice(1, -1))
  .filter(s => s.length > 3 && !s.includes("/") && !s.startsWith("M") && !s.startsWith("var("));

console.log("Total strings:", cleanStrings.length);
fs.writeFileSync("extracted_strings.txt", [...new Set(cleanStrings)].join("\n"));
console.log("Wrote unique strings to extracted_strings.txt");
