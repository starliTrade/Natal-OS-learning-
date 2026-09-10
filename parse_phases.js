import fs from "fs";

const raw = fs.readFileSync("extracted_phases.json", "utf8");
const phases = Function("return " + raw)();

console.log(`TOTAL PHASES: ${phases.length}`);

let totalModules = 0;
let totalLessons = 0;
let totalProjects = 0;

const summary = phases.map(p => {
  const modCount = p.mods ? p.mods.length : 0;
  totalModules += modCount;
  let lessonCount = 0;
  if (p.mods) {
    p.mods.forEach(m => {
      if (m.lessons) lessonCount += m.lessons.length;
    });
  }
  totalLessons += lessonCount;
  const projs = p.projs ? p.projs.length : 0;
  totalProjects += projs;
  return {
    id: p.id,
    title: p.title,
    fa: p.fa,
    dur: p.dur,
    col: p.col,
    modules: modCount,
    lessons: lessonCount,
    projects: projs
  };
});

console.table(summary);
console.log(`TOTAL STATS: Phases=${phases.length}, Modules=${totalModules}, Lessons=${totalLessons}, Projects=${totalProjects}`);

// Write formatted JSON
fs.writeFileSync("phases_detailed.json", JSON.stringify(phases, null, 2));
