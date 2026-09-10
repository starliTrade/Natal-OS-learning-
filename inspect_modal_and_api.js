import fs from "fs";

const uiCode = fs.readFileSync("ui_section.js", "utf8");
// Find where `function k(` is defined
const kIdx = uiCode.indexOf("function k({lessonId:e");
if (kIdx !== -1) {
  console.log("=== LESSON MODAL k ===");
  console.log(uiCode.substring(kIdx, kIdx + 4000));
} else {
  console.log("k not found");
}

// Check fetch("/api/review")
const apiIdx = uiCode.indexOf('fetch("/api/review"');
if (apiIdx !== -1) {
  console.log("=== API REVIEW FETCH CALL ===");
  console.log(uiCode.substring(apiIdx - 200, apiIdx + 800));
}
