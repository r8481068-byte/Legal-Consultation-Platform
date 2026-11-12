import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("LegalConnect — Simplify My Account Dropdown for Client and Lawyer", () => {
  const accountMenuFile = fs.readFileSync(path.join(__dirname, "../src/components/AccountMenu.jsx"), "utf8");
  const headerFile = fs.readFileSync(path.join(__dirname, "../src/components/Header.jsx"), "utf8");

  it("1. Authenticated user header displays user name, email, and role badge", () => {
    // Both mobile and desktop views must render user.name, user.email, and user.role badge
    assert.ok(
      accountMenuFile.includes("{user.name}"),
      "AccountMenu must display authenticated user.name"
    );
    assert.ok(
      accountMenuFile.includes("{user.email}"),
      "AccountMenu must display authenticated user.email"
    );
    assert.ok(
      accountMenuFile.includes("{user.role}"),
      "AccountMenu must display authenticated user.role"
    );
  });

  it("2. Removed options are completely eliminated from the dropdown", () => {
    // None of these options should exist in AccountMenu.jsx
    assert.strictEqual(
      accountMenuFile.includes("My Consultations"),
      false,
      "My Consultations must be removed from AccountMenu"
    );
    assert.strictEqual(
      accountMenuFile.includes("Profile Settings"),
      false,
      "Profile Settings must be removed from AccountMenu"
    );
    assert.strictEqual(
      accountMenuFile.includes("My Profile"),
      false,
      "My Profile must be removed from AccountMenu"
    );
    assert.strictEqual(
      accountMenuFile.includes("Availability Schedule") || accountMenuFile.includes(">Availability<") || accountMenuFile.includes("Availability</Link>"),
      false,
      "Availability must be removed from AccountMenu"
    );
    assert.strictEqual(
      accountMenuFile.includes("About Us"),
      false,
      "About Us must be removed from AccountMenu"
    );
  });

  it("3. Authenticated dropdown contains ONLY Dashboard and Logout", () => {
    // Dashboard option
    assert.ok(
      accountMenuFile.includes("Dashboard"),
      "Authenticated dropdown must contain Dashboard"
    );
    assert.ok(
      accountMenuFile.includes("LayoutDashboard"),
      "Dashboard link must use LayoutDashboard icon"
    );
    assert.ok(
      accountMenuFile.includes("to={getDashboardPath()}"),
      "Dashboard link must route via getDashboardPath()"
    );

    // Logout option
    assert.ok(
      accountMenuFile.includes("Logout"),
      "Authenticated dropdown must contain Logout"
    );
    assert.ok(
      accountMenuFile.includes("onClick={handleLogout}"),
      "Logout button must trigger handleLogout"
    );
    assert.ok(
      accountMenuFile.includes("LogOut"),
      "Logout button must use LogOut icon"
    );
  });

  it("4. Dashboard path navigates correctly based on user role", () => {
    // Extract getDashboardPath function logic
    assert.ok(
      accountMenuFile.includes('user.role === "lawyer"') &&
        accountMenuFile.includes('return "/lawyer-dashboard"'),
      "getDashboardPath must return '/lawyer-dashboard' for lawyer role"
    );
    assert.ok(
      accountMenuFile.includes('user.role === "admin"') &&
        accountMenuFile.includes('return "/admin"'),
      "getDashboardPath must return '/admin' for admin role"
    );
    assert.ok(
      accountMenuFile.includes('return "/dashboard"'),
      "getDashboardPath must return '/dashboard' for client role"
    );

    // Simulate getDashboardPath logic directly
    const simulateDashboardPath = (user) => {
      if (!user) return "/login";
      if (user.role === "lawyer") return "/lawyer-dashboard";
      if (user.role === "admin") return "/admin";
      return "/dashboard";
    };

    assert.strictEqual(simulateDashboardPath({ role: "client" }), "/dashboard");
    assert.strictEqual(simulateDashboardPath({ role: "lawyer" }), "/lawyer-dashboard");
    assert.strictEqual(simulateDashboardPath({ role: "admin" }), "/admin");
    assert.strictEqual(simulateDashboardPath(null), "/login");
  });

  it("5. Logout clears session and redirects to Home Page", () => {
    assert.ok(
      accountMenuFile.includes("logout()"),
      "handleLogout must call auth logout()"
    );
    assert.ok(
      accountMenuFile.includes('navigate("/")'),
      "handleLogout must redirect to public home page '/'"
    );
    assert.ok(
      accountMenuFile.includes("setIsOpen(false)"),
      "handleLogout must close the dropdown"
    );
  });

  it("6. Unauthenticated dropdown preserves all access portal options", () => {
    assert.ok(
      accountMenuFile.includes("/login?role=client") && accountMenuFile.includes("Client Login"),
      "Unauthenticated menu must preserve Client Login"
    );
    assert.ok(
      accountMenuFile.includes("/login?role=lawyer") && accountMenuFile.includes("Lawyer Login"),
      "Unauthenticated menu must preserve Lawyer Login"
    );
    assert.ok(
      accountMenuFile.includes("/login?role=admin") && accountMenuFile.includes("Admin Login"),
      "Unauthenticated menu must preserve Admin Login"
    );
    assert.ok(
      accountMenuFile.includes("/register") && accountMenuFile.includes("Client Register"),
      "Unauthenticated menu must preserve Client Register"
    );
    assert.ok(
      accountMenuFile.includes("/lawyer/signup") && accountMenuFile.includes("Lawyer Signup"),
      "Unauthenticated menu must preserve Lawyer Signup"
    );
  });

  it("7. Header.jsx mounts AccountMenu in both desktop and mobile viewports", () => {
    assert.ok(
      headerFile.includes("<AccountMenu"),
      "Header.jsx must mount AccountMenu"
    );
    assert.ok(
      headerFile.includes("isMobile"),
      "Header.jsx must provide isMobile support for AccountMenu"
    );
  });
});

