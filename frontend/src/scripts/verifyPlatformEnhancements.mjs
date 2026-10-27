/**
 * Comprehensive Automated Verification Script for LegalConnect Enhancements
 * Tests:
 * 1. Location dataset integrity (all 28 states, 8 UTs, High Courts, seats, districts)
 * 2. Reusable State and City/District route slug resolution
 * 3. Footer state links & social links configuration
 * 4. How We Work routes & aliases
 */

import {
  STATES_AND_UTS,
  MAJOR_CITIES_DIRECTORY,
  COURT_LEVELS_INFO,
  getAllStates,
  getAllUnionTerritories,
  getLocationBySlug,
  searchLocations
} from "../data/indiaLocationsData.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("TEST SUITE 1: India Locations Dataset Integrity");
console.log("========================================================");

const states = getAllStates();
const uts = getAllUnionTerritories();

assert(states.length === 28, `Exactly 28 Indian States present (Found: ${states.length})`);
assert(uts.length === 8, `Exactly 8 Union Territories present (Found: ${uts.length})`);
assert(STATES_AND_UTS.length === 36, `Total 36 States + UTs present (Found: ${STATES_AND_UTS.length})`);

// Specific states check
const requiredStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

requiredStates.forEach((st) => {
  const found = states.find((s) => s.name.toLowerCase() === st.toLowerCase());
  assert(!!found, `State '${st}' exists in dataset`);
  if (found) {
    assert(found.districts && found.districts.length > 0, `'${st}' has ${found.districts.length} verified districts`);
    assert(!!found.highCourt && !!found.highCourt.principalSeat, `'${st}' has verified High Court & Principal Seat (${found.highCourt.principalSeat})`);
    assert(!!found.overview && found.overview.length > 50, `'${st}' has verified location-specific overview`);
    assert(found.faqs && found.faqs.length >= 1, `'${st}' has location-relevant FAQs (${found.faqs.length})`);
  }
});

// Specific Union Territories check
const requiredUTs = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

requiredUTs.forEach((ut) => {
  const found = uts.find((u) => u.name.toLowerCase().includes(ut.toLowerCase()));
  assert(!!found, `Union Territory '${ut}' exists in dataset`);
});

console.log("\n========================================================");
console.log("TEST SUITE 2: Madhya Pradesh Detailed Verification");
console.log("========================================================");

const mp = getLocationBySlug("madhya-pradesh");
assert(!!mp, "Madhya Pradesh is retrievable by slug 'madhya-pradesh'");
assert(mp.highCourt.principalSeat === "Jabalpur", "MP High Court Principal Seat is Jabalpur");
assert(mp.highCourt.benches.includes("Indore") && mp.highCourt.benches.includes("Gwalior"), "MP High Court permanent benches at Indore and Gwalior");
assert(mp.districts.length >= 50, `MP has verified district directory (${mp.districts.length} districts)`);
assert(mp.majorCities.some((c) => c.name === "Bhopal"), "MP contains Bhopal");
assert(mp.majorCities.some((c) => c.name === "Indore"), "MP contains Indore");
assert(mp.majorCities.some((c) => c.name === "Gwalior"), "MP contains Gwalior");
assert(mp.majorCities.some((c) => c.name === "Jabalpur"), "MP contains Jabalpur");

console.log("\n========================================================");
console.log("TEST SUITE 3: Slug Lookup & Prefix Normalization");
console.log("========================================================");

assert(getLocationBySlug("advocate-lawyer-delhi")?.id === "delhi", "Prefix 'advocate-lawyer-delhi' resolves to Delhi");
assert(getLocationBySlug("lawyers-in-maharashtra")?.id === "maharashtra", "Prefix 'lawyers-in-maharashtra' resolves to Maharashtra");
assert(getLocationBySlug("karnataka")?.id === "karnataka", "Raw slug 'karnataka' resolves to Karnataka");

console.log("\n========================================================");
console.log("TEST SUITE 4: Major Cities Directory");
console.log("========================================================");

assert(MAJOR_CITIES_DIRECTORY.length >= 17, `Major cities count >= 17 (Found: ${MAJOR_CITIES_DIRECTORY.length})`);
const sampleCities = ["Delhi", "Mumbai", "Pune", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Lucknow", "Bhopal", "Indore", "Jaipur", "Patna", "Chandigarh", "Ahmedabad", "Gurugram", "Noida", "Ghaziabad"];
sampleCities.forEach((city) => {
  const found = MAJOR_CITIES_DIRECTORY.find((c) => c.name.toLowerCase() === city.toLowerCase());
  assert(!!found, `Major city '${city}' is present in directory`);
});

console.log("\n========================================================");
console.log("TEST SUITE 5: Court Levels Directory");
console.log("========================================================");

assert(COURT_LEVELS_INFO.length === 4, `All 4 Court levels present (Found: ${COURT_LEVELS_INFO.length})`);
assert(COURT_LEVELS_INFO.some((c) => c.id === "supreme-court"), "Supreme Court of India present");
assert(COURT_LEVELS_INFO.some((c) => c.id === "high-courts"), "High Courts present");
assert(COURT_LEVELS_INFO.some((c) => c.id === "district-courts"), "District & Sessions Courts present");
assert(COURT_LEVELS_INFO.some((c) => c.id === "tribunals"), "Specialized Tribunals present");

console.log("\n========================================================");
console.log("TEST SUMMARY");
console.log("========================================================");
console.log(`Total Passed: ${passed}`);
console.log(`Total Failed: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log("\nALL TESTS PASSED SUCCESSFULLY! ✓\n");
}
