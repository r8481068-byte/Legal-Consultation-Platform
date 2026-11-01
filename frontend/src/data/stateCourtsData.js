/**
 * State-Wise Courts & Tribunals Directory Dataset
 * Encompasses verified High Courts, Benches, District Court Complexes, and Tribunals.
 */

export const STATE_COURTS_DATA = {
  "delhi": [
    { name: "Delhi High Court", level: "High Court", seat: "Sher Shah Road, New Delhi", type: "Constitutional High Court" },
    { name: "Tis Hazari Courts Complex", level: "District Court", seat: "Central & West Delhi", type: "Principal Trial Court Complex" },
    { name: "Saket Courts Complex", level: "District Court", seat: "South & South-East Delhi", type: "District Civil & Sessions Court" },
    { name: "Patiala House Courts", level: "District Court", seat: "New Delhi District", type: "District Civil & Criminal Court" },
    { name: "Dwarka Courts Complex", level: "District Court", seat: "South-West Delhi", type: "District & Commercial Court" },
    { name: "Rohini Courts Complex", level: "District Court", seat: "North & North-West Delhi", type: "District & Family Courts" },
    { name: "Karkardooma Courts Complex", level: "District Court", seat: "East, North-East & Shahdara", type: "District & Labour Courts" },
    { name: "Rouse Avenue Courts Complex", level: "Special Court", seat: "Rouse Avenue, DDU Marg", type: "Special CBI, ED & MP/MLA Courts" },
    { name: "National Company Law Tribunal (NCLT)", level: "Tribunal", seat: "CGO Complex, New Delhi", type: "Corporate Insolvency (IBC)" },
    { name: "National Green Tribunal (NGT)", level: "Tribunal", seat: "Faridkot House, Copernicus Marg", type: "Environmental Protection Forum" }
  ],
  "uttar-pradesh": [
    { name: "Allahabad High Court (Principal Seat)", level: "High Court", seat: "Prayagraj", type: "Constitutional High Court" },
    { name: "Allahabad High Court (Lucknow Bench)", level: "High Court Bench", seat: "Lucknow", type: "Permanent High Court Bench" },
    { name: "District & Sessions Court, Lucknow", level: "District Court", seat: "Qaiserbagh, Lucknow", type: "Principal District Court" },
    { name: "District & Sessions Court, Gautam Buddha Nagar", level: "District Court", seat: "Surajpur, Greater Noida", type: "NCR District Court & Commercial Division" },
    { name: "District & Sessions Court, Ghaziabad", level: "District Court", seat: "Raj Nagar, Ghaziabad", type: "District & Special CBI Court" },
    { name: "District & Sessions Court, Kanpur Nagar", level: "District Court", seat: "Kanpur", type: "Commercial & Civil Court Complex" },
    { name: "District & Sessions Court, Agra", level: "District Court", seat: "Agra", type: "District & Sessions Court" },
    { name: "District & Sessions Court, Prayagraj", level: "District Court", seat: "Prayagraj", type: "District Civil Court" },
    { name: "District & Sessions Court, Varanasi", level: "District Court", seat: "Varanasi", type: "Civil, Matrimonial & Criminal Court" },
    { name: "District & Sessions Court, Meerut", level: "District Court", seat: "Meerut", type: "District Trial Court" },
    { name: "Uttar Pradesh Real Estate Regulatory Authority (UP RERA)", level: "Tribunal", seat: "Greater Noida & Lucknow", type: "Real Estate Regulatory Bench" }
  ],
  "bihar": [
    { name: "Patna High Court", level: "High Court", seat: "Patna (Bailey Road)", type: "Constitutional High Court" },
    { name: "District & Sessions Court, Patna", level: "District Court", seat: "Patna City", type: "Principal District Civil & Criminal Court" },
    { name: "District & Sessions Court, Gaya", level: "District Court", seat: "Gaya", type: "Magadh Division District Court" },
    { name: "District & Sessions Court, Muzaffarpur", level: "District Court", seat: "Muzaffarpur", type: "Tirhut Division Principal Court" },
    { name: "District & Sessions Court, Bhagalpur", level: "District Court", seat: "Bhagalpur", type: "Eastern Bihar Judicial Center" },
    { name: "District & Sessions Court, Darbhanga", level: "District Court", seat: "Darbhanga", type: "Mithila Region Trial Court" },
    { name: "Bihar Real Estate Regulatory Authority (RERA Bihar)", level: "Tribunal", seat: "Patna", type: "Statutory Real Estate Tribunal" },
    { name: "Bihar State Consumer Disputes Redressal Commission", level: "Tribunal", seat: "Patna", type: "Appellate Consumer Forum" }
  ],
  "maharashtra": [
    { name: "Bombay High Court (Principal Seat)", level: "High Court", seat: "Fort, Mumbai", type: "Constitutional High Court with Original Side" },
    { name: "Bombay High Court (Nagpur Bench)", level: "High Court Bench", seat: "Nagpur", type: "Permanent High Court Bench" },
    { name: "Bombay High Court (Aurangabad Bench)", level: "High Court Bench", seat: "Chhatrapati Sambhajinagar", type: "Permanent High Court Bench" },
    { name: "City Civil & Sessions Court, Mumbai", level: "District Court", seat: "Fort, Mumbai", type: "Principal Trial Court Complex" },
    { name: "District & Sessions Court, Pune", level: "District Court", seat: "Shivajinagar, Pune", type: "Western Maharashtra Trial Hub" },
    { name: "District & Sessions Court, Thane", level: "District Court", seat: "Court Naka, Thane", type: "District Civil & Criminal Court" },
    { name: "District & Sessions Court, Nagpur", level: "District Court", seat: "Civil Lines, Nagpur", type: "Vidarbha Regional Court" },
    { name: "Maharashtra Real Estate Regulatory Authority (MahaRERA)", level: "Tribunal", seat: "Bandra Kurla Complex, Mumbai", type: "Real Estate Appellate Body" }
  ],
  "karnataka": [
    { name: "High Court of Karnataka (Principal Seat)", level: "High Court", seat: "Attara Kacheri, Bengaluru", type: "Constitutional High Court" },
    { name: "Karnataka High Court (Dharwad Bench)", level: "High Court Bench", seat: "Dharwad", type: "Permanent Northern Bench" },
    { name: "Karnataka High Court (Kalaburagi Bench)", level: "High Court Bench", seat: "Kalaburagi", type: "Permanent Hyderabad-Karnataka Bench" },
    { name: "City Civil & Sessions Court, Bengaluru", level: "District Court", seat: "Bengaluru City", type: "Principal District Court Complex" },
    { name: "District & Sessions Court, Mysuru", level: "District Court", seat: "Mysuru", type: "District Trial Court" },
    { name: "District & Sessions Court, Mangaluru", level: "District Court", seat: "Dakshina Kannada", type: "Coastal Karnataka Trial Court" },
    { name: "Karnataka Real Estate Regulatory Authority (K-RERA)", level: "Tribunal", seat: "Bengaluru", type: "Real Estate Redressal Body" }
  ],
  "haryana": [
    { name: "Punjab and Haryana High Court", level: "High Court", seat: "Sector 1, Chandigarh", type: "Joint Constitutional High Court" },
    { name: "District & Sessions Court, Gurugram", level: "District Court", seat: "Rajiv Chowk, Gurugram", type: "NCR Commercial & Civil Court" },
    { name: "District & Sessions Court, Faridabad", level: "District Court", seat: "Sector 12, Faridabad", type: "Industrial Trial Court Complex" },
    { name: "District & Sessions Court, Panchkula", level: "District Court", seat: "Sector 1, Panchkula", type: "District & Sessions Court" },
    { name: "District & Sessions Court, Ambala", level: "District Court", seat: "Ambala City", type: "District Trial Court" },
    { name: "Haryana Real Estate Regulatory Authority (HRERA)", level: "Tribunal", seat: "Gurugram & Panchkula", type: "Real Estate Redressal Authority" }
  ],
  "punjab": [
    { name: "Punjab and Haryana High Court", level: "High Court", seat: "Sector 1, Chandigarh", type: "Joint Constitutional High Court" },
    { name: "District & Sessions Court, Ludhiana", level: "District Court", seat: "Ludhiana", type: "Principal Commercial & Trial Court" },
    { name: "District & Sessions Court, Amritsar", level: "District Court", seat: "Amritsar", type: "Border District Trial Court" },
    { name: "District & Sessions Court, Jalandhar", level: "District Court", seat: "Jalandhar", type: "Doaba Regional Court Complex" },
    { name: "District & Sessions Court, Patiala", level: "District Court", seat: "Patiala", type: "Historic Judicial Court Complex" },
    { name: "District & Sessions Court, SAS Nagar (Mohali)", level: "District Court", seat: "Mohali", type: "NCR-Tricity District Court" }
  ],
  "rajasthan": [
    { name: "Rajasthan High Court (Principal Seat)", level: "High Court", seat: "Jodhpur", type: "Constitutional High Court" },
    { name: "Rajasthan High Court (Jaipur Bench)", level: "High Court Bench", seat: "Jaipur", type: "Permanent High Court Bench" },
    { name: "District & Sessions Court, Jaipur Metropolitan", level: "District Court", seat: "Jaipur City", type: "Metropolitan Trial Court Complex" },
    { name: "District & Sessions Court, Jodhpur", level: "District Court", seat: "Jodhpur", type: "Principal District Court" },
    { name: "District & Sessions Court, Udaipur", level: "District Court", seat: "Udaipur", type: "Mewar Regional Trial Court" },
    { name: "District & Sessions Court, Kota", level: "District Court", seat: "Kota", type: "Hadoti Division Court" },
    { name: "Rajasthan Board of Revenue", level: "Tribunal", seat: "Ajmer", type: "Apex State Land Revenue Tribunal" }
  ],
  "madhya-pradesh": [
    { name: "High Court of Madhya Pradesh (Principal Seat)", level: "High Court", seat: "Jabalpur", type: "Constitutional High Court" },
    { name: "Madhya Pradesh High Court (Indore Bench)", level: "High Court Bench", seat: "Indore", type: "Permanent Commercial Bench" },
    { name: "Madhya Pradesh High Court (Gwalior Bench)", level: "High Court Bench", seat: "Gwalior", type: "Permanent Northern Bench" },
    { name: "District & Sessions Court, Bhopal", level: "District Court", seat: "Bhopal", type: "State Capital District Court" },
    { name: "District & Sessions Court, Indore", level: "District Court", seat: "Indore", type: "Commercial District Court Complex" },
    { name: "District & Sessions Court, Jabalpur", level: "District Court", seat: "Jabalpur", type: "Judicial Capital Trial Court" },
    { name: "District & Sessions Court, Gwalior", level: "District Court", seat: "Gwalior", type: "Northern Regional Court" },
    { name: "National Green Tribunal (Central Zone)", level: "Tribunal", seat: "Bhopal", type: "Central Environmental Bench" }
  ]
};

/**
 * Retrieves courts list for a state/UT. If specific list not defined,
 * constructs accurate courts from high court, benches, and district registries.
 */
export function getCourtsForState(stateData) {
  if (!stateData) return [];
  const slug = stateData.slug;
  if (STATE_COURTS_DATA[slug]) {
    return STATE_COURTS_DATA[slug];
  }

  const list = [
    {
      name: stateData.highCourt.name,
      level: "High Court",
      seat: stateData.highCourt.principalSeat,
      type: "Constitutional High Court"
    }
  ];

  if (stateData.highCourt.benches && stateData.highCourt.benches.length > 0) {
    stateData.highCourt.benches.forEach((bench) => {
      list.push({
        name: `${stateData.highCourt.name} (${bench} Bench)`,
        level: "High Court Bench",
        seat: bench,
        type: "Permanent High Court Bench"
      });
    });
  }

  // Add capital and major district courts
  const capital = stateData.capital || stateData.districts[0] || "Capital";
  list.push({
    name: `District & Sessions Court, ${capital}`,
    level: "District Court",
    seat: capital,
    type: "Principal District & Sessions Court"
  });

  const remainingDistricts = (stateData.districts || [])
    .filter((d) => d.toLowerCase() !== capital.toLowerCase())
    .slice(0, 5);

  remainingDistricts.forEach((d) => {
    list.push({
      name: `District & Sessions Court, ${d}`,
      level: "District Court",
      seat: d,
      type: "District Trial & Civil Court"
    });
  });

  list.push({
    name: `${stateData.name} State Consumer Disputes Redressal Commission`,
    level: "Tribunal",
    seat: capital,
    type: "State Consumer Forum"
  });

  return list;
}
