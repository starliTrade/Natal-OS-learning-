const fs = require("fs");
const phases = require("./extracted_phases.js");

console.log(`Loaded ${phases.length} phases.`);
phases.forEach(p => {
  const modCount = p.mods ? p.mods.length : 0;
  let lessonCount = 0;
  if (p.mods) {
    p.mods.forEach(m => {
      if (m.lessons) lessonCount += m.lessons.length;
    });
  }
  console.log(`Phase ${p.id}: ${p.title} | ${p.fa} | ${p.dur} | Modules: ${modCount} | Lessons: ${lessonCount} | Projects: ${p.projects ? p.projects.length : 0}`);
});

// Now let's inspect the rest of 0.fi213plkvp_.js
const code = fs.readFileSync("0.fi213plkvp_.js", "utf8");
const rest = code.substring(45898);
fs.writeFileSync("rest_of_app.js", rest);
console.log(`Saved rest_of_app.js (${rest.length} chars)`);
