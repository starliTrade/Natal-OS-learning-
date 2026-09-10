import fs from "fs";

const code = fs.readFileSync("0.fi213plkvp_.js", "utf8");

// Let's find the store definition and all components
// The store seems to be around where getDueReviews, checkDates, dailyPlan, etc. are defined
const storeStart = code.indexOf("function c(e,t,n)");
const subCode = code.substring(storeStart, storeStart + 15000);
fs.writeFileSync("store_section.js", subCode);
console.log("Saved store_section.js");

// Let's also extract the rest
const uiSection = code.substring(storeStart + 15000);
fs.writeFileSync("ui_section.js", uiSection);
console.log("Saved ui_section.js");
