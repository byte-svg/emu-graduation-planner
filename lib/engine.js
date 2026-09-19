(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.EmuPlanner = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const PASSING = new Set(["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "S", "P", "EX"]);
  const FAILING = new Set(["D-", "F", "U"]);
  const PENDING = new Set(["I", "IP", "NG"]);
  const GRADE_PATTERN = /(?:^|\s)(A\+?|A-|B\+?|B-|C\+?|C-|D\+?|D-|F|S|U|P|EX|I|IP|NG)$/i;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeCode(value) {
    return clean(value).toUpperCase().replace(/[\s_-]/g, "");
  }

  function parseSummary(value) {
    const text = clean(value).toUpperCase();
    if (!text) return { text, actualCode: "", grade: "", status: "missing" };
    const match = text.match(GRADE_PATTERN);
    const grade = match ? match[1].toUpperCase() : "";
    const withoutGrade = grade ? text.slice(0, match.index).trim() : text;
    const actualCode = normalizeCode(withoutGrade.split("/")[0]);
    let status = "active";
    if (PASSING.has(grade)) status = "passed";
    else if (FAILING.has(grade)) status = "failed";
    else if (PENDING.has(grade)) status = "active";
    return { text, actualCode, grade, status };
  }

  function textOf(cell) {
    return clean(cell && cell.textContent);
  }

  function cellsOf(row) {
    if (row?.cells?.length) return Array.from(row.cells);
    return Array.from(row?.querySelectorAll?.(":scope > th, :scope > td, [role='cell'], [role='gridcell']") || []);
  }

  function findRecordTable(doc) {
    const tables = Array.from(doc.querySelectorAll("table"));
    return tables
      .map((table) => {
        const firstRows = Array.from(table.querySelectorAll("tr")).slice(0, 3);
        const header = normalizeCode(firstRows.map((row) => row.textContent).join(" "));
        let score = 0;
        if (header.includes("REF.KOD") || header.includes("REFKOD")) score += 3;
        if (header.includes("DERSKOD") || header.includes("COURSECODE")) score += 3;
        if (header.includes("SUMMARY") || header.includes("OZET")) score += 2;
        score += Math.min(table.querySelectorAll("tr").length / 10, 2);
        return { table, score };
      })
      .sort((a, b) => b.score - a.score)[0]?.table || null;
  }

  function parseRecordTable(table) {
    if (!table) return [];
    const rows = Array.from(table.querySelectorAll("tr"));
    const records = [];
    for (const row of rows) {
      // Portal, sabitlenen ilk sütunları <th>, dönemleri ise <td> olarak üretiyor.
      // HTMLTableRowElement.cells her iki hücre türünü de doğru sırayla döndürür.
      const cells = cellsOf(row);
      if (cells.length < 3) continue;
      const ref = textOf(cells[0]).replace(/\D/g, "");
      if (!/^\d{5}$/.test(ref)) continue;
      const curriculumCode = normalizeCode(textOf(cells[1]));
      const summaryCell = cells[cells.length - 1];
      const summary = parseSummary(textOf(summaryCell));
      const attempts = cells.slice(2, -1).map(textOf).filter(Boolean);
      records.push({ ref, curriculumCode, summary, attempts });
    }
    return records;
  }

  function parseTableMeta(table) {
    if (!table) return { periodCount: 0, latestPeriod: "" };
    const headerRow = Array.from(table.querySelectorAll("tr")).find((row) => {
      const cells = cellsOf(row);
      const first = normalizeCode(textOf(cells[0]));
      return cells.length >= 3 && (first.includes("REF.KOD") || first.includes("REFKOD"));
    });
    if (!headerRow) return { periodCount: 0, latestPeriod: "" };
    const headers = cellsOf(headerRow).map(textOf);
    const periods = headers.slice(2, -1).filter(Boolean);
    return { periodCount: periods.length, latestPeriod: periods.at(-1) || "" };
  }

  function prerequisiteMet(expression, passedCodes) {
    return expression.split("|").some((code) => passedCodes.has(normalizeCode(code)));
  }

  function analyze(records, curriculum) {
    const byRef = new Map(records.map((record) => [record.ref, record]));
    const passedCodes = new Set();
    for (const record of records) {
      if (record.summary.status !== "passed") continue;
      if (record.summary.actualCode) passedCodes.add(record.summary.actualCode);
      record.curriculumCode.split("/").map(normalizeCode).forEach((code) => passedCodes.add(code));
    }

    const results = curriculum.courses.map((requirement) => {
      const record = byRef.get(requirement.ref);
      const status = record?.summary.status || "missing";
      const unmetPrerequisites = requirement.prerequisites.filter((item) => !prerequisiteMet(item, passedCodes));
      const portalCodes = (record?.curriculumCode || "").split("/").map(normalizeCode).filter(Boolean);
      const curriculumCodes = requirement.codes.map(normalizeCode);
      const codeMismatch = requirement.type === "required" && portalCodes.length > 0 &&
        !portalCodes.some((code) => curriculumCodes.includes(code));
      return { ...requirement, record, status, unmetPrerequisites, codeMismatch };
    });

    const passed = results.filter((item) => item.status === "passed");
    const active = results.filter((item) => item.status === "active");
    const failed = results.filter((item) => item.status === "failed");
    const missing = results.filter((item) => item.status === "missing");
    const eligible = results.filter((item) =>
      item.status !== "passed" && item.status !== "active" && item.unmetPrerequisites.length === 0
    );
    const blocked = results.filter((item) =>
      item.status !== "passed" && item.status !== "active" && item.unmetPrerequisites.length > 0
    );
    const completedEcts = passed.reduce((sum, item) => sum + item.ects, 0);
    const category = (type) => ({
      completed: passed.filter((item) => item.type === type).length,
      total: results.filter((item) => item.type === type).length
    });

    return {
      results,
      passed,
      active,
      failed,
      missing,
      eligible,
      blocked,
      completedEcts,
      totalEcts: curriculum.totalEcts,
      percentage: Math.min(100, Math.round((completedEcts / curriculum.totalEcts) * 100)),
      areaElectives: category("area-elective"),
      universityElectives: category("university-elective"),
      required: category("required"),
      mismatches: results.filter((item) => item.codeMismatch)
    };
  }

  return { analyze, clean, findRecordTable, normalizeCode, parseRecordTable, parseSummary, parseTableMeta, prerequisiteMet };
});
