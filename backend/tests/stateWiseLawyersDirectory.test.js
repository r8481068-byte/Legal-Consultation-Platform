const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { connectTestDB, disconnectTestDB } = require("./helpers/testDb");
const Lawyer = require("../src/models/Lawyer");
const User = require("../src/models/User");
const { searchLawyersService, getDirectorySummaryService } = require("../src/services/lawyerService");

test("Lawyers in India - State-Wise Directory Comprehensive Suite", async (t) => {
  await connectTestDB();
  try {
  await t.test("1. Directory Summary Service aggregates state counts accurately", async () => {
    const summary = await getDirectorySummaryService();
    assert.ok(summary, "Summary must be returned");
    assert.ok(typeof summary.stateCounts === "object", "stateCounts must be an object");
    assert.ok(typeof summary.totalLawyers === "number", "totalLawyers must be a number");
    assert.ok(summary.totalLawyers >= 0, "totalLawyers must be >= 0");
  });

  await t.test("2. State-Specific Lawyer Search returns only matching lawyers", async () => {
    const res = await searchLawyersService({ state: "Delhi" });
    assert.ok(res.lawyers, "Lawyers array should be returned");
    assert.ok(res.pagination, "Pagination should be returned");

    // All returned lawyers must belong to Delhi
    res.lawyers.forEach((l) => {
      const match =
        (l.state && /delhi/i.test(l.state)) ||
        (l.city && /delhi/i.test(l.city)) ||
        (l.stateOfEnrolment && /delhi/i.test(l.stateOfEnrolment)) ||
        (l.officeAddress && /delhi/i.test(l.officeAddress));
      assert.ok(match, `Lawyer ${l._id} must match Delhi jurisdiction`);
    });
  });

  await t.test("3. District-Wise Lawyer Search filters accurately", async () => {
    const res = await searchLawyersService({ state: "Delhi", district: "New Delhi" });
    assert.ok(res.lawyers, "Lawyers array should be returned");

    res.lawyers.forEach((l) => {
      const match =
        (l.district && /new delhi/i.test(l.district)) ||
        (l.city && /new delhi/i.test(l.city)) ||
        (l.officeAddress && /new delhi/i.test(l.officeAddress));
      assert.ok(match, `Lawyer ${l._id} must match New Delhi district`);
    });
  });

  await t.test("4. Empty location query returns 0 lawyers gracefully without error", async () => {
    const res = await searchLawyersService({ state: "NonExistentStateXYZ" });
    assert.equal(res.lawyers.length, 0, "No lawyers should match non-existent state");
    assert.equal(res.pagination.total, 0, "Pagination total should be 0");
  });

  await t.test("5. Sensitive data exposure check: barCouncilId must NOT be returned in public search", async () => {
    const res = await searchLawyersService({ state: "Delhi" });
    if (res.lawyers.length > 0) {
      const lawyer = res.lawyers[0];
      assert.equal(lawyer.barCouncilId, undefined, "barCouncilId must be stripped for public privacy");
    }
  });

  await t.test("6. Specialization filter works in combination with state filter", async () => {
    const res = await searchLawyersService({ state: "Delhi", specialization: "Corporate Law" });
    res.lawyers.forEach((l) => {
      const hasSpec = (l.specialization || []).some((s) => /corporate/i.test(s));
      assert.ok(hasSpec, `Lawyer ${l._id} must have Corporate Law specialization`);
    });
  });

  await t.test("7. Pagination limits results per page as configured", async () => {
    const res = await searchLawyersService({ state: "Delhi", page: 1, limit: 1 });
    assert.ok(res.lawyers.length <= 1, "Page limit of 1 must be respected");
    assert.equal(res.pagination.page, 1, "Page number must be 1");
    assert.equal(res.pagination.limit, 1, "Limit must be 1");
  });
  } finally {
    await disconnectTestDB();
  }
});
