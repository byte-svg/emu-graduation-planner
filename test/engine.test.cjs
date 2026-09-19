const assert = require("node:assert/strict");
const curriculum = require("../lib/curriculum.js");
const engine = require("../lib/engine.js");

assert.deepEqual(engine.parseSummary("CMSE107 B+"), {
  text: "CMSE107 B+",
  actualCode: "CMSE107",
  grade: "B+",
  status: "passed"
});
assert.equal(engine.parseSummary("MATH151").status, "active");
assert.equal(engine.parseSummary("MATH163 D-").status, "failed");
assert.equal(engine.parseSummary("CMSE100 S").status, "passed");

const records = [
  { ref: "29711", curriculumCode: "CMSE107", summary: engine.parseSummary("CMSE107 B+") },
  { ref: "29712", curriculumCode: "MATH163", summary: engine.parseSummary("MATH163 D+") },
  { ref: "29713", curriculumCode: "ENGL191/ENGL181", summary: engine.parseSummary("ENGL191 A") },
  { ref: "29714", curriculumCode: "MATH151", summary: engine.parseSummary("MATH151") },
  { ref: "29715", curriculumCode: "PHYS101", summary: engine.parseSummary("PHYS101 D") },
  { ref: "29721", curriculumCode: "CMSE100", summary: engine.parseSummary("CMSE100 S") },
  { ref: "29722", curriculumCode: "CMSE112", summary: engine.parseSummary("CMSE112 D+") }
];

const analysis = engine.analyze(records, curriculum);
assert.equal(analysis.completedEcts, 36);
assert.equal(analysis.active.length, 1);
assert.ok(analysis.eligible.some((course) => course.ref === "29732"), "CMSE211 should be eligible after CMSE112");
assert.ok(analysis.blocked.some((course) => course.ref === "29743"), "MATH373 should be blocked before MATH241");
assert.equal(curriculum.courses.reduce((sum, course) => sum + course.ects, 0), 240);
assert.equal(curriculum.catalogueYear, "2025-26");
assert.equal(curriculum.courses.find((course) => course.ref === "29752").codes[0], "CMSE351");
assert.equal(curriculum.courses.find((course) => course.ref === "29785").codes[0], "CMSE456");

const fakeCell = (textContent) => ({ textContent });
const fakeRow = {
  // `cells`, portalda kullanılan karışık <th>/<td> hücrelerini temsil eder.
  cells: [fakeCell("29711"), fakeCell("CMSE107"), fakeCell("CMSE107 B+"), fakeCell(""), fakeCell("CMSE107 B+")]
};
const fakeTable = { querySelectorAll: (selector) => selector === "tr" ? [fakeRow] : [] };
const parsedRows = engine.parseRecordTable(fakeTable);
assert.equal(parsedRows.length, 1);
assert.equal(parsedRows[0].ref, "29711");
assert.equal(parsedRows[0].summary.status, "passed");

console.log("All engine tests passed.");
