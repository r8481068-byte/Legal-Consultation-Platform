import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Video Call End Navigation & Client Identity Documents Verification", () => {
  const videoRoomPath = path.join(__dirname, "../src/pages/VideoRoom.jsx");
  const dashboardPath = path.join(__dirname, "../src/pages/Dashboard.jsx");
  const clientProfilePath = path.join(__dirname, "../src/pages/ClientProfile.jsx");
  const authServicePath = path.join(__dirname, "../src/services/authService.js");

  const videoRoomCode = fs.readFileSync(videoRoomPath, "utf8");
  const dashboardCode = fs.readFileSync(dashboardPath, "utf8");
  const clientProfileCode = fs.readFileSync(clientProfilePath, "utf8");
  const authServiceCode = fs.readFileSync(authServicePath, "utf8");

  describe("1. Video Call End Navigation Fix", () => {
    it("does not automatically redirect to /client/lawyers or /my-appointments on call end", () => {
      // Find active component definition (not commented code)
      const activeComponentIndex = videoRoomCode.lastIndexOf("export default function VideoRoom()");
      assert.ok(activeComponentIndex !== -1, "VideoRoom component must exist");
      const activeCode = videoRoomCode.slice(activeComponentIndex);

      // Verify that handleCallEndCleanup does NOT automatically redirect
      const cleanupStart = activeCode.indexOf("const handleCallEndCleanup =");
      assert.ok(cleanupStart !== -1, "handleCallEndCleanup must exist");
      const cleanupEnd = activeCode.indexOf("const formatTimer =", cleanupStart);
      const cleanupBody = activeCode.slice(cleanupStart, cleanupEnd);

      assert.ok(
        !cleanupBody.includes("/client/lawyers"),
        "handleCallEndCleanup must NOT navigate to /client/lawyers"
      );
      assert.ok(
        !cleanupBody.includes("navigate("),
        "handleCallEndCleanup must NOT call navigate directly (no automatic redirect)"
      );
      assert.ok(
        !cleanupBody.includes("setIsReviewOpen(true)"),
        "handleCallEndCleanup must NOT automatically open review modal and bypass call-ended screen"
      );
    });

    it("displays the call ended screen with duration and a prominent Back to Dashboard button", () => {
      const activeComponentIndex = videoRoomCode.lastIndexOf("export default function VideoRoom()");
      const activeCode = videoRoomCode.slice(activeComponentIndex);

      const callEndedStart = activeCode.indexOf("// 13. CALL ENDED SCREEN");
      assert.ok(callEndedStart !== -1, "Call ended screen section must exist");
      const callEndedEnd = activeCode.indexOf("// 14. WAITING ROOM", callEndedStart);
      const callEndedBody = activeCode.slice(callEndedStart, callEndedEnd);

      assert.ok(
        callEndedBody.includes("Consultation Completed"),
        "Call ended screen must display 'Consultation Completed'"
      );
      assert.ok(
        callEndedBody.includes("formatTimer(secondsElapsed)"),
        "Call ended screen must display call duration"
      );
      assert.ok(
        callEndedBody.includes("Back to Dashboard"),
        "Call ended screen must have clearly visible 'Back to Dashboard' button"
      );
      assert.ok(
        callEndedBody.includes('navigate(isClient ? "/dashboard" : "/lawyer-dashboard")') ||
        callEndedBody.includes('navigate(isClient ? "/dashboard"'),
        "Back to Dashboard button must navigate client to /dashboard"
      );
    });

    it("does not redirect away when ReviewModal is closed or submitted", () => {
      const activeComponentIndex = videoRoomCode.lastIndexOf("export default function VideoRoom()");
      const activeCode = videoRoomCode.slice(activeComponentIndex);

      const callEndedStart = activeCode.indexOf("// 13. CALL ENDED SCREEN");
      const callEndedEnd = activeCode.indexOf("// 14. WAITING ROOM", callEndedStart);
      const callEndedBody = activeCode.slice(callEndedStart, callEndedEnd);

      // Verify that onClose and onReviewSubmitted do not call navigate("/my-appointments") or navigate("/client/lawyers")
      assert.ok(
        !callEndedBody.includes('navigate("/my-appointments")'),
        "ReviewModal in call ended screen must not redirect to /my-appointments"
      );
      assert.ok(
        !callEndedBody.includes('navigate("/client/lawyers")'),
        "ReviewModal in call ended screen must not redirect to /client/lawyers"
      );
    });

    it("waiting room and error screen back button also route clients to /dashboard", () => {
      const activeComponentIndex = videoRoomCode.lastIndexOf("export default function VideoRoom()");
      const activeCode = videoRoomCode.slice(activeComponentIndex);

      // Error screen back button
      const errorScreenStart = activeCode.indexOf("// 12. ERROR SCREEN");
      const errorScreenEnd = activeCode.indexOf("// 13. CALL ENDED SCREEN", errorScreenStart);
      const errorScreenBody = activeCode.slice(errorScreenStart, errorScreenEnd);

      assert.ok(
        errorScreenBody.includes('/dashboard'),
        "Error screen back button must navigate client to /dashboard"
      );

      // Waiting room exit link
      const waitingRoomStart = activeCode.indexOf("// 14. WAITING ROOM");
      const waitingRoomEnd = activeCode.indexOf("<section", waitingRoomStart);
      const waitingRoomHeader = activeCode.slice(waitingRoomStart, waitingRoomEnd);

      assert.ok(
        waitingRoomHeader.includes('to={isClient ? "/dashboard" : "/lawyer-dashboard"}'),
        "Waiting room Exit Room link must navigate client to /dashboard"
      );
    });
  });

  describe("2. Client Identity Documents Section in My Profile", () => {
    it("Dashboard Profile tab has 'Identity Documents & Verification' section title", () => {
      assert.ok(
        dashboardCode.includes("Identity Documents & Verification"),
        "Dashboard My Profile tab must contain 'Identity Documents & Verification' section"
      );
    });

    it("Dashboard contains Aadhaar and PAN input fields with format helpers", () => {
      assert.ok(
        dashboardCode.includes("Aadhaar Number"),
        "Aadhaar Number label/field must exist"
      );
      assert.ok(
        dashboardCode.includes("PAN Card Number"),
        "PAN Card Number label/field must exist"
      );
      assert.ok(
        dashboardCode.includes("identityAadhaar"),
        "identityAadhaar state binding must exist"
      );
      assert.ok(
        dashboardCode.includes("identityPan"),
        "identityPan state binding must exist"
      );
    });

    it("Dashboard contains an 'Update Identity Details' button", () => {
      assert.ok(
        dashboardCode.includes("Update Identity Details"),
        "'Update Identity Details' button must exist in Dashboard profile"
      );
    });

    it("Dashboard displays masked Aadhaar and PAN values", () => {
      assert.ok(
        dashboardCode.includes("maskedAadhaar"),
        "Masked Aadhaar must be rendered"
      );
      assert.ok(
        dashboardCode.includes("maskedPan"),
        "Masked PAN must be rendered"
      );
    });

    it("Dashboard enforces Aadhaar and PAN format validation and clears inputs after saving", () => {
      assert.ok(
        dashboardCode.includes("handleUpdateIdentity"),
        "handleUpdateIdentity submit handler must exist"
      );
      assert.ok(
        dashboardCode.includes("/^[2-9]\\d{11}$/"),
        "Must validate Aadhaar as 12 digits starting with 2-9"
      );
      assert.ok(
        dashboardCode.includes("/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/"),
        "Must validate PAN as 10 alphanumeric characters"
      );
      assert.ok(
        dashboardCode.includes('setIdentityAadhaar("")'),
        "Must clear Aadhaar input field after saving so raw data is not retained in state"
      );
      assert.ok(
        dashboardCode.includes('setIdentityPan("")'),
        "Must clear PAN input field after saving so raw data is not retained in state"
      );
      assert.ok(
        dashboardCode.includes("identitySuccess"),
        "Must display success message after successful update"
      );
    });

    it("ClientProfile page (/client/profile) also features Identity Documents & Verification with Update Identity Details", () => {
      assert.ok(
        clientProfileCode.includes("Identity Documents & Verification"),
        "ClientProfile must have 'Identity Documents & Verification' section"
      );
      assert.ok(
        clientProfileCode.includes("Update Identity Details"),
        "ClientProfile must have 'Update Identity Details' button"
      );
      assert.ok(
        clientProfileCode.includes("/^[2-9]\\d{11}$/"),
        "ClientProfile must validate Aadhaar format"
      );
      assert.ok(
        clientProfileCode.includes("/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/"),
        "ClientProfile must validate PAN format"
      );
    });

    it("authService calls /auth/client-identity using secure authFetch", () => {
      assert.ok(
        authServiceCode.includes("updateClientIdentity"),
        "updateClientIdentity function must be exported from authService"
      );
      assert.ok(
        authServiceCode.includes("/auth/client-identity"),
        "Must call /auth/client-identity endpoint"
      );
    });
  });
});
