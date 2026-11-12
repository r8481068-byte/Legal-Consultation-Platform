/**
 * LegalConnect Phase 3: Search Regex Sanitization Test Suite
 *
 * Covers:
 * 1. Normal lawyer search.
 * 2. Normal admin search across client, lawyer, application, review, payment, complaint, and log queries.
 * 3. Search input containing regex metacharacters (. * + ? ^ $ { } ( ) | [ ] \).
 * 4. Invalid-looking regex input such as `(` or `[` or `{` without closing pairs.
 * 5. Backslashes and escaped characters (e.g. `\`, `\\`, `\d+`).
 * 6. Empty and whitespace-only search inputs.
 * 7. Existing case-insensitive behavior ($options: "i").
 * 8. Existing pagination, sorting, and multi-field filtering behavior.
 *
 * Run with:
 *   node --test backend/tests/searchRegexSanitization.test.js
 */

const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const mongoose = require("mongoose");

const { escapeRegex } = require("../src/utils/searchUtils");
const { searchLawyersService } = require("../src/services/lawyerService");
const {
  getAdminClientsService,
  getAdminLawyersService,
  getAdminVerificationsService,
  getAdminAppointmentsService,
  getAdminReviewsService,
  getAdminPaymentsService,
  getAdminComplaintsService,
  getAdminActivityLogsService
} = require("../src/services/adminService");

const User = require("../src/models/User");
const Lawyer = require("../src/models/Lawyer");
const Appointment = require("../src/models/Appointment");
const Review = require("../src/models/Review");
const Payment = require("../src/models/Payment");
const Complaint = require("../src/models/Complaint");
const AdminLog = require("../src/models/AdminLog");

describe("Phase 3: Search Regex Sanitization & Query Safety", () => {
  // =========================================================================
  // 1. UNIT TESTS: escapeRegex Helper Correctness
  // =========================================================================
  describe("1. escapeRegex Utility Metacharacter Handling", () => {
    test("Escapes all 14 regex metacharacters properly", () => {
      const metacharacters = [".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"];
      for (const char of metacharacters) {
        const escaped = escapeRegex(char);
        assert.ok(escaped.startsWith("\\"), `Character ${char} must be escaped with a backslash`);
        // Verify that compiling RegExp does not throw
        assert.doesNotThrow(() => new RegExp(escaped));
        const regex = new RegExp(escaped);
        // Verify literal matching
        assert.strictEqual(regex.test(char), true, `Must match literal ${char}`);
        // Verify that '.' does NOT act as a wildcard
        if (char === ".") {
          assert.strictEqual(regex.test("x"), false, "Escaped dot must not match arbitrary character");
        }
      }
    });

    test("Escapes combined strings containing multiple metacharacters without regex corruption", () => {
      const complexString = "Tax (Corporate) [Audit] C++ & IP. Law * {2024} ^$ | \\test";
      const escaped = escapeRegex(complexString);

      assert.doesNotThrow(() => new RegExp(escaped));
      const regex = new RegExp(escaped);
      assert.strictEqual(regex.test(complexString), true);
      assert.strictEqual(regex.test("Tax Corporate Audit C++"), false);
    });

    test("Handles unclosed opening brackets, parentheses, and trailing backslashes safely", () => {
      const dangerousInputs = [
        "(",
        "[",
        "{",
        "(a|b",
        "lawyer(",
        "delhi[",
        "section{",
        "\\",
        "test\\",
        "+",
        "*",
        "?",
        "^",
        "$"
      ];

      for (const input of dangerousInputs) {
        // Raw unescaped input would throw SyntaxError when passed to RegExp
        let unescapedThrew = false;
        try {
          new RegExp(input);
        } catch {
          unescapedThrew = true;
        }

        const escaped = escapeRegex(input);
        assert.doesNotThrow(
          () => new RegExp(escaped),
          `Escaped input '${escaped}' must compile to a valid RegExp without syntax error`
        );
        const regex = new RegExp(escaped);
        assert.strictEqual(regex.test(input), true, `Must match original literal input '${input}'`);
      }
    });

    test("Handles edge cases: empty strings, null, undefined, and non-strings", () => {
      assert.strictEqual(escapeRegex(""), "");
      assert.strictEqual(escapeRegex(null), "");
      assert.strictEqual(escapeRegex(undefined), "");
      assert.strictEqual(escapeRegex(12345), "12345");
      assert.strictEqual(escapeRegex("Normal text"), "Normal text");
    });
  });

  // =========================================================================
  // 2. LAWYER SERVICE SEARCH TESTS
  // =========================================================================
  describe("2. Lawyer Search Service (searchLawyersService)", () => {
    let originalUserFind;
    let originalLawyerFind;
    let originalLawyerCount;

    beforeEach(() => {
      originalUserFind = User.find;
      originalLawyerFind = Lawyer.find;
      originalLawyerCount = Lawyer.countDocuments;
    });

    afterEach(() => {
      User.find = originalUserFind;
      Lawyer.find = originalLawyerFind;
      Lawyer.countDocuments = originalLawyerCount;
    });

    test("Normal lawyer search captures search term with $options: 'i'", async () => {
      let capturedUserQuery = null;
      let capturedLawyerFilter = null;

      User.find = (query) => {
        capturedUserQuery = query;
        return {
          select: () => ({
            lean: async () => [{ _id: new mongoose.Types.ObjectId() }]
          })
        };
      };

      Lawyer.find = (filter) => {
        capturedLawyerFilter = filter;
        return {
          select: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Lawyer.countDocuments = async () => 0;

      await searchLawyersService({ search: "Sharma", page: 1, limit: 10 });

      assert.ok(capturedUserQuery);
      assert.deepStrictEqual(capturedUserQuery.name, { $regex: "Sharma", $options: "i" });

      assert.ok(capturedLawyerFilter);
      assert.strictEqual(capturedLawyerFilter.verificationStatus, "approved");
      assert.strictEqual(capturedLawyerFilter.isAvailable, true);
      assert.ok(capturedLawyerFilter.$and);
    });

    test("Lawyer search with regex metacharacters escapes inputs in $and clauses and User query", async () => {
      let capturedUserQuery = null;
      let capturedLawyerFilter = null;

      User.find = (query) => {
        capturedUserQuery = query;
        return {
          select: () => ({
            lean: async () => []
          })
        };
      };

      Lawyer.find = (filter) => {
        capturedLawyerFilter = filter;
        return {
          select: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Lawyer.countDocuments = async () => 0;

      // User enters search containing +, (, ), [, ], ., *
      const dangerousSearch = "Corporate (Tax) [M&A] C++ Dr. Verma*";
      await searchLawyersService({ search: dangerousSearch });

      // Verify that the user query regex pattern is safely escaped
      assert.ok(capturedUserQuery);
      const userRegexStr = capturedUserQuery.name.$regex;
      assert.doesNotThrow(() => new RegExp(userRegexStr));
      assert.ok(userRegexStr.includes("\\("));
      assert.ok(userRegexStr.includes("\\["));
      assert.ok(userRegexStr.includes("\\+"));
      assert.ok(userRegexStr.includes("\\."));
      assert.ok(userRegexStr.includes("\\*"));

      // Verify that lawyer fields (city, state, specialization, headline, bio) in $or receive escaped pattern
      assert.ok(capturedLawyerFilter.$and);
      const searchOr = capturedLawyerFilter.$and[0].$or;
      const cityClause = searchOr.find((c) => c.city);
      assert.ok(cityClause);
      assert.strictEqual(cityClause.city.$regex, userRegexStr);
      assert.strictEqual(cityClause.city.$options, "i");
    });

    test("Lawyer search with invalid-looking unclosed brackets does not throw syntax error", async () => {
      let userQueryRegex = null;

      User.find = (query) => {
        userQueryRegex = query.name?.$regex;
        return {
          select: () => ({
            lean: async () => []
          })
        };
      };

      Lawyer.find = () => ({
        select: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => []
                })
              })
            })
          })
        })
      });

      Lawyer.countDocuments = async () => 0;

      // Malformed inputs that would crash RegExp if unescaped
      const malformedQueries = ["(", "[", "{", "a(b[c", "\\"];
      for (const badQuery of malformedQueries) {
        await assert.doesNotReject(async () => {
          await searchLawyersService({ search: badQuery });
        });
        assert.doesNotThrow(() => new RegExp(userQueryRegex));
      }
    });

    test("Lawyer search filters (specialization, courtLevel, state, district, city) sanitize metacharacters", async () => {
      let capturedFilter = null;

      User.find = () => ({
        select: () => ({
          lean: async () => []
        })
      });

      Lawyer.find = (filter) => {
        capturedFilter = filter;
        return {
          select: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Lawyer.countDocuments = async () => 0;

      await searchLawyersService({
        specialization: "Criminal (Cyber Law)",
        courtLevel: "High Court (Delhi)",
        state: "Delhi (NCT)",
        district: "South [Saket]",
        location: "New Delhi (South)"
      });

      assert.ok(capturedFilter);
      assert.strictEqual(capturedFilter.specialization.$regex, "Criminal \\(Cyber Law\\)");
      assert.strictEqual(capturedFilter.courtLevels.$regex, "High Court \\(Delhi\\)");

      // Check andClauses
      assert.ok(capturedFilter.$and);
      assert.strictEqual(capturedFilter.$and.length, 3); // state, district, location
      const stateClause = capturedFilter.$and[0].$or[0];
      assert.strictEqual(stateClause.state.$regex, "Delhi \\(NCT\\)");

      const distClause = capturedFilter.$and[1].$or[0];
      assert.strictEqual(distClause.district.$regex, "South \\[Saket\\]");

      const locClause = capturedFilter.$and[2].$or[0];
      assert.strictEqual(locClause.city.$regex, "New Delhi \\(South\\)");
    });

    test("Empty or whitespace-only search does not inject empty regex wildcard", async () => {
      let userFindCalled = false;
      let capturedFilter = null;

      User.find = () => {
        userFindCalled = true;
        return {
          select: () => ({ lean: async () => [] })
        };
      };

      Lawyer.find = (filter) => {
        capturedFilter = filter;
        return {
          select: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Lawyer.countDocuments = async () => 0;

      await searchLawyersService({ search: "   " });
      assert.strictEqual(userFindCalled, false, "User.find must not be called when search is whitespace only");
      assert.strictEqual(capturedFilter.$and, undefined, "No $and clause should be added for whitespace search");
    });
  });

  // =========================================================================
  // 3. ADMIN SERVICE SEARCH TESTS
  // =========================================================================
  describe("3. Admin Search Services (adminService.js)", () => {
    let originalUserFind;
    let originalUserCount;
    let originalLawyerFind;
    let originalLawyerCount;
    let originalAppFind;
    let originalAppCount;
    let originalAppAggregate;
    let originalReviewFind;
    let originalReviewCount;
    let originalPaymentFind;
    let originalPaymentCount;
    let originalPaymentAggregate;
    let originalComplaintFind;
    let originalComplaintCount;
    let originalAdminLogFind;
    let originalAdminLogCount;

    beforeEach(() => {
      originalUserFind = User.find;
      originalUserCount = User.countDocuments;
      originalLawyerFind = Lawyer.find;
      originalLawyerCount = Lawyer.countDocuments;
      originalAppFind = Appointment.find;
      originalAppCount = Appointment.countDocuments;
      originalAppAggregate = Appointment.aggregate;
      originalReviewFind = Review.find;
      originalReviewCount = Review.countDocuments;
      originalPaymentFind = Payment.find;
      originalPaymentCount = Payment.countDocuments;
      originalPaymentAggregate = Payment.aggregate;
      originalComplaintFind = Complaint.find;
      originalComplaintCount = Complaint.countDocuments;
      originalAdminLogFind = AdminLog.find;
      originalAdminLogCount = AdminLog.countDocuments;

      Appointment.aggregate = async () => [];
      Payment.aggregate = async () => [{ total: 0 }];
      AdminLog.countDocuments = async () => 0;
    });

    afterEach(() => {
      User.find = originalUserFind;
      User.countDocuments = originalUserCount;
      Lawyer.find = originalLawyerFind;
      Lawyer.countDocuments = originalLawyerCount;
      Appointment.find = originalAppFind;
      Appointment.countDocuments = originalAppCount;
      Appointment.aggregate = originalAppAggregate;
      Review.find = originalReviewFind;
      Review.countDocuments = originalReviewCount;
      Payment.find = originalPaymentFind;
      Payment.countDocuments = originalPaymentCount;
      Payment.aggregate = originalPaymentAggregate;
      Complaint.find = originalComplaintFind;
      Complaint.countDocuments = originalComplaintCount;
      AdminLog.find = originalAdminLogFind;
      AdminLog.countDocuments = originalAdminLogCount;
    });

    test("getAdminClientsService sanitizes search with regex metacharacters and preserves pagination", async () => {
      let capturedFilter = null;
      let capturedSkip = null;
      let capturedLimit = null;

      User.find = (filter) => {
        capturedFilter = filter;
        return {
          select: () => ({
            sort: () => ({
              skip: (s) => {
                capturedSkip = s;
                return {
                  limit: (l) => {
                    capturedLimit = l;
                    return { lean: async () => [] };
                  }
                };
              }
            })
          })
        };
      };

      User.countDocuments = async () => 0;

      const dangerousSearch = "client+test@example.com (VIP)";
      const res = await getAdminClientsService({ search: dangerousSearch, page: 2, limit: 15 });

      assert.ok(capturedFilter);
      assert.strictEqual(capturedFilter.role, "client");
      assert.ok(capturedFilter.$or);

      const regexPattern = capturedFilter.$or[0].name.$regex;
      assert.strictEqual(regexPattern, "client\\+test@example\\.com \\(VIP\\)");
      assert.strictEqual(capturedFilter.$or[0].name.$options, "i");
      assert.doesNotThrow(() => new RegExp(regexPattern));

      // Verify pagination preserved
      assert.strictEqual(capturedSkip, 15);
      assert.strictEqual(capturedLimit, 15);
      assert.strictEqual(res.pagination.page, 2);
      assert.strictEqual(res.pagination.limit, 15);
    });

    test("getAdminLawyersService sanitizes search with regex metacharacters", async () => {
      let capturedUserQuery = null;

      User.find = (query) => {
        capturedUserQuery = query;
        return {
          select: () => ({
            lean: async () => []
          })
        };
      };

      Lawyer.find = () => ({
        populate: () => ({
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => []
              })
            })
          })
        })
      });

      Lawyer.countDocuments = async () => 0;

      await getAdminLawyersService({ search: "Lawyer.Name (HC)*" });

      assert.ok(capturedUserQuery);
      assert.strictEqual(capturedUserQuery.role, "lawyer");
      const pattern = capturedUserQuery.$or[0].name.$regex;
      assert.strictEqual(pattern, "Lawyer\\.Name \\(HC\\)\\*");
      assert.strictEqual(capturedUserQuery.$or[0].name.$options, "i");
    });

    test("getAdminVerificationsService sanitizes Bar Council ID and city regex", async () => {
      let capturedFilter = null;

      User.find = () => ({
        select: () => ({
          lean: async () => []
        })
      });

      Lawyer.find = (filter) => {
        capturedFilter = filter;
        return {
          populate: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Lawyer.countDocuments = async () => 0;

      await getAdminVerificationsService({ search: "D/123/2020 (Del) [North]" });

      assert.ok(capturedFilter);
      assert.ok(capturedFilter.$or);
      const barCouncilPattern = capturedFilter.$or.find((c) => c.barCouncilId)?.barCouncilId.$regex;
      assert.strictEqual(barCouncilPattern, "D/123/2020 \\(Del\\) \\[North\\]");
      assert.doesNotThrow(() => new RegExp(barCouncilPattern));
    });

    test("getAdminAppointmentsService sanitizes search by client or lawyer name", async () => {
      let capturedUserQuery = null;

      User.find = (query) => {
        capturedUserQuery = query;
        return {
          select: () => ({
            lean: async () => []
          })
        };
      };

      Lawyer.find = () => ({
        select: () => ({
          lean: async () => []
        })
      });

      Appointment.find = () => ({
        populate: () => ({
          populate: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => []
                })
              })
            })
          })
        })
      });

      Appointment.countDocuments = async () => 0;

      await getAdminAppointmentsService({ search: "Sharma (Consultant)?" });

      assert.ok(capturedUserQuery);
      const pattern = capturedUserQuery.$or[0].name.$regex;
      assert.strictEqual(pattern, "Sharma \\(Consultant\\)\\?");
    });

    test("getAdminReviewsService sanitizes review text search regex", async () => {
      let capturedFilter = null;

      Review.find = (filter) => {
        capturedFilter = filter;
        return {
          populate: () => ({
            populate: () => ({
              populate: () => ({
                sort: () => ({
                  skip: () => ({
                    limit: () => ({
                      lean: async () => []
                    })
                  })
                })
              })
            })
          })
        };
      };

      Review.countDocuments = async () => 0;

      await getAdminReviewsService({ search: "Great service!! (5/5) [Top+Tier]" });

      assert.ok(capturedFilter);
      assert.strictEqual(capturedFilter.reviewText.$regex, "Great service!! \\(5/5\\) \\[Top\\+Tier\\]");
      assert.strictEqual(capturedFilter.reviewText.$options, "i");
    });

    test("getAdminPaymentsService sanitizes payment ID, order ID, and refund ID search", async () => {
      let capturedFilter = null;

      Payment.find = (filter) => {
        capturedFilter = filter;
        return {
          populate: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Payment.countDocuments = async () => 0;

      await getAdminPaymentsService({ search: "pay_test.*+?" });

      assert.ok(capturedFilter);
      assert.ok(capturedFilter.$or);
      const paymentIdPattern = capturedFilter.$or[0].razorpayPaymentId.$regex;
      assert.strictEqual(paymentIdPattern, "pay_test\\.\\*\\+\\?");
      assert.strictEqual(capturedFilter.$or[0].razorpayPaymentId.$options, "i");
    });

    test("getAdminComplaintsService sanitizes complaint ID, subject, and description search", async () => {
      let capturedFilter = null;

      Complaint.find = (filter) => {
        capturedFilter = filter;
        return {
          populate: () => ({
            populate: () => ({
              sort: () => ({
                skip: () => ({
                  limit: () => ({
                    lean: async () => []
                  })
                })
              })
            })
          })
        };
      };

      Complaint.countDocuments = async () => 0;

      await getAdminComplaintsService({ search: "Refund (URGENT) [Ticket #123]" });

      assert.ok(capturedFilter);
      assert.ok(capturedFilter.$or);
      const subjectPattern = capturedFilter.$or.find((c) => c.subject)?.subject.$regex;
      assert.strictEqual(subjectPattern, "Refund \\(URGENT\\) \\[Ticket #123\\]");
      assert.strictEqual(capturedFilter.$or[0].complaintId.$options, "i");
    });

    test("getAdminActivityLogsService sanitizes adminName, adminEmail, and description search", async () => {
      let capturedFilter = null;

      AdminLog.find = (filter) => {
        capturedFilter = filter;
        return {
          sort: () => ({
            skip: () => ({
              limit: () => ({
                lean: async () => []
              })
            })
          })
        };
      };

      AdminLog.countDocuments = async () => 0;

      await getAdminActivityLogsService({ search: "admin.super+1@legalconnect.in" });

      assert.ok(capturedFilter);
      assert.ok(capturedFilter.$or);
      const emailPattern = capturedFilter.$or.find((c) => c.adminEmail)?.adminEmail.$regex;
      assert.strictEqual(emailPattern, "admin\\.super\\+1@legalconnect\\.in");
      assert.strictEqual(capturedFilter.$or[0].adminName.$options, "i");
    });

    test("Admin services ignore empty or whitespace-only search without adding empty regex filter", async () => {
      let capturedFilter = null;

      User.find = (filter) => {
        capturedFilter = filter;
        return {
          select: () => ({
            sort: () => ({
              skip: () => ({
                limit: () => ({
                  lean: async () => []
                })
              })
            })
          })
        };
      };

      User.countDocuments = async () => 0;

      await getAdminClientsService({ search: "   " });

      assert.ok(capturedFilter);
      assert.strictEqual(capturedFilter.$or, undefined, "No $or filter should be added for whitespace search");
      assert.strictEqual(capturedFilter.role, "client");
    });
  });
});
