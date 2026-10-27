/**
 * LegalConnect Verified Pan-India Judicial & Administrative Directory Dataset
 * Encompasses all 28 States and 8 Union Territories with verified High Courts,
 * principal seats, benches, official court portals, district registries,
 * major cities, and jurisdiction-specific legal overviews.
 */

export const COURT_LEVELS_INFO = [
  {
    id: "supreme-court",
    name: "Supreme Court of India",
    level: "Apex Judicial Authority",
    seat: "New Delhi, Tilak Marg",
    jurisdiction: "Pan-India Appellate, Original & Advisory Jurisdiction under Article 32, 131-143 of Constitution",
    description: "The Supreme Court is the highest judicial court and final court of appeal under the Constitution of India. It exercises original jurisdiction in fundamental rights enforcement and inter-state disputes, broad appellate jurisdiction over High Court judgments, and special leave petitions (SLP) under Article 136.",
    verifiedRequirement: "Advocates appearing as Advocate-on-Record (AoR) must be registered with the Supreme Court Bar Association (SCBA) and have passed the AoR examination conducted by the Supreme Court.",
    officialPortal: "https://main.sci.gov.in"
  },
  {
    id: "high-courts",
    name: "High Courts of India",
    level: "State Constitutional Courts",
    seat: "25 High Courts across States and Union Territories",
    jurisdiction: "State-level supervisory, writ jurisdiction under Article 226, original civil/criminal, and first/second appellate jurisdiction",
    description: "High Courts stand at the pinnacle of each state's judicial administration. They issue constitutional prerogative writs (Habeas Corpus, Mandamus, Quo Warranto, Certiorari, Prohibition) and exercise superintendence over all subordinate courts and tribunals in their respective territorial jurisdiction.",
    verifiedRequirement: "Practicing advocates must be enrolled with the respective State Bar Council and hold verified Bar Council of India (BCI) Certificate of Practice.",
    officialPortal: "https://districts.ecourts.gov.in"
  },
  {
    id: "district-courts",
    name: "District & Sessions Courts",
    level: "Principal Subordinate Trial Courts",
    seat: "Headquartered in each District Headquarters across India",
    jurisdiction: "Original civil and criminal jurisdiction, Sessions trials, civil suits, matrimonial petitions, probate, and motor accident claims (MACT)",
    description: "Presided over by the Principal District and Sessions Judge. Handles serious criminal trials (punishable with imprisonment or life), civil suits of unlimited valuation, probate proceedings, and statutory appeals against orders of Civil Judges and Judicial Magistrates.",
    verifiedRequirement: "Advocates must hold active district bar association membership and verified enrollment numbers.",
    officialPortal: "https://ecourts.gov.in"
  },
  {
    id: "tribunals",
    name: "Specialized Tribunals & Forums",
    level: "Quasi-Judicial & Specialized Adjudicatory Bodies",
    seat: "National and Regional Benches (NCLT, NGT, DRT, SAT, Consumer Commissions)",
    jurisdiction: "Corporate insolvency (IBC), company law, environment protection, debt recovery, consumer disputes, and service matters",
    description: "Statutory quasi-judicial bodies established under specific central legislations (Companies Act 2013, IBC 2016, National Green Tribunal Act 2010, Consumer Protection Act 2019) providing expedited, subject-specific dispute adjudication.",
    verifiedRequirement: "Requires advocates, company secretaries, or insolvency professionals with verified subject-matter bar credentials.",
    officialPortal: "https://nclt.gov.in"
  }
];

export const MAJOR_CITIES_DIRECTORY = [
  { name: "Delhi", slug: "delhi", stateSlug: "delhi", stateName: "Delhi", highCourt: "Delhi High Court", desc: "National capital, seat of Supreme Court of India, Delhi High Court, and 11 District Court complexes." },
  { name: "Mumbai", slug: "mumbai", stateSlug: "maharashtra", stateName: "Maharashtra", highCourt: "Bombay High Court", desc: "Financial capital, principal seat of Bombay High Court, NCLT Principal Benches, and City Civil & Sessions Courts." },
  { name: "Pune", slug: "pune", stateSlug: "maharashtra", stateName: "Maharashtra", highCourt: "Bombay High Court", desc: "Western Maharashtra commercial and IT center, District & Sessions Court, and specialized labour tribunals." },
  { name: "Bengaluru", slug: "bengaluru", stateSlug: "karnataka", stateName: "Karnataka", highCourt: "Karnataka High Court", desc: "Principal seat of Karnataka High Court, major corporate arbitration, IP, and civil litigation center." },
  { name: "Chennai", slug: "chennai", stateSlug: "tamil-nadu", stateName: "Tamil Nadu", highCourt: "Madras High Court", desc: "Historic principal seat of Madras High Court, City Civil Court, and maritime admiralty jurisdiction." },
  { name: "Hyderabad", slug: "hyderabad", stateSlug: "telangana", stateName: "Telangana", highCourt: "Telangana High Court", desc: "Principal seat of Telangana High Court, City Civil Courts, and specialized commercial court division." },
  { name: "Kolkata", slug: "kolkata", stateSlug: "west-bengal", stateName: "West Bengal", highCourt: "Calcutta High Court", desc: "Oldest High Court in India, original side jurisdiction, City Civil Court, and NCLT regional bench." },
  { name: "Lucknow", slug: "lucknow", stateSlug: "uttar-pradesh", stateName: "Uttar Pradesh", highCourt: "Allahabad High Court (Lucknow Bench)", desc: "State administrative capital, Lucknow Bench of Allahabad High Court, and District Courts." },
  { name: "Bhopal", slug: "bhopal", stateSlug: "madhya-pradesh", stateName: "Madhya Pradesh", highCourt: "Madhya Pradesh High Court", desc: "State capital, Principal District and Sessions Court, State Consumer Commission, and NGT Central Zone Bench." },
  { name: "Indore", slug: "indore", stateSlug: "madhya-pradesh", stateName: "Madhya Pradesh", highCourt: "Madhya Pradesh High Court (Indore Bench)", desc: "Commercial hub of MP, permanent Bench of MP High Court, and District & Sessions Court." },
  { name: "Jaipur", slug: "jaipur", stateSlug: "rajasthan", stateName: "Rajasthan", highCourt: "Rajasthan High Court (Jaipur Bench)", desc: "State capital, Jaipur Bench of Rajasthan High Court, and metropolitan Sessions Court complexes." },
  { name: "Patna", slug: "patna", stateSlug: "bihar", stateName: "Bihar", highCourt: "Patna High Court", desc: "Principal seat of Patna High Court, City Civil & Sessions Courts, and appellate tribunals." },
  { name: "Chandigarh", slug: "chandigarh", stateSlug: "chandigarh", stateName: "Chandigarh", highCourt: "Punjab and Haryana High Court", desc: "Joint capital, principal seat of Punjab and Haryana High Court, and District Courts complex." },
  { name: "Ahmedabad", slug: "ahmedabad", stateSlug: "gujarat", stateName: "Gujarat", highCourt: "Gujarat High Court", desc: "Principal seat of Gujarat High Court at Sola, City Civil Courts, and commercial tribunals." },
  { name: "Gurugram", slug: "gurugram", stateSlug: "haryana", stateName: "Haryana", highCourt: "Punjab and Haryana High Court", desc: "Key NCR corporate tech hub, District & Sessions Court, RERA Haryana Bench, and industrial tribunals." },
  { name: "Noida", slug: "noida", stateSlug: "uttar-pradesh", stateName: "Uttar Pradesh", highCourt: "Allahabad High Court", desc: "Gautam Buddha Nagar judicial district, UP RERA bench, consumer commissions, and corporate arbitration." },
  { name: "Ghaziabad", slug: "ghaziabad", stateSlug: "uttar-pradesh", stateName: "Uttar Pradesh", highCourt: "Allahabad High Court", desc: "Major NCR judicial district, CBI Special Courts, District & Sessions Court complex." },
  { name: "Jabalpur", slug: "jabalpur", stateSlug: "madhya-pradesh", stateName: "Madhya Pradesh", highCourt: "Madhya Pradesh High Court (Principal Seat)", desc: "Principal Seat of MP High Court, State Bar Council of Madhya Pradesh headquarters." },
  { name: "Gwalior", slug: "gwalior", stateSlug: "madhya-pradesh", stateName: "Madhya Pradesh", highCourt: "Madhya Pradesh High Court (Gwalior Bench)", desc: "Permanent Bench of MP High Court, Chamber of Commerce, and District & Sessions Court." },
  { name: "Kochi", slug: "kochi", stateSlug: "kerala", stateName: "Kerala", highCourt: "Kerala High Court", desc: "Principal seat of Kerala High Court at Ernakulam, Admiralty jurisdiction, and maritime tribunals." },
  { name: "Nagpur", slug: "nagpur", stateSlug: "maharashtra", stateName: "Maharashtra", highCourt: "Bombay High Court (Nagpur Bench)", desc: "Second capital of Maharashtra, permanent Bench of Bombay High Court, and District Courts." },
  { name: "Prayagraj", slug: "prayagraj", stateSlug: "uttar-pradesh", stateName: "Uttar Pradesh", highCourt: "Allahabad High Court (Principal Seat)", desc: "Principal seat of Allahabad High Court, highest pendency court in India, Bar Council of UP." }
];

export const STATES_AND_UTS = [
  // -------------------------------------------------------------
  // STATES (28)
  // -------------------------------------------------------------
  {
    id: "madhya-pradesh",
    slug: "madhya-pradesh",
    name: "Madhya Pradesh",
    type: "state",
    region: "Central",
    capital: "Bhopal",
    highCourt: {
      name: "High Court of Madhya Pradesh",
      principalSeat: "Jabalpur",
      benches: ["Indore", "Gwalior"],
      jurisdiction: "Entire State of Madhya Pradesh",
      establishedYear: 1956,
      officialPortal: "https://mphc.gov.in",
      circuitBenches: []
    },
    overview: "Madhya Pradesh boasts a well-structured three-tier judicial framework headed by the High Court of Madhya Pradesh. While the Principal Seat operates in Jabalpur, two permanent constitutional benches function actively at Indore and Gwalior to ensure prompt territorial access across the Malwa, Nimar, and Chambal divisions. Subordinate judiciary encompasses 55 District and Sessions Courts, family courts, and industrial tribunals. The State Bar Council of Madhya Pradesh (located in Jabalpur) oversees the enrollment and professional standards of over 100,000 practicing advocates. Citizens across MP frequently consult verified advocates for revenue land partitions under the MP Land Revenue Code, property registry disputes, criminal trial defense, civil injunctions, and service writs.",
    districts: [
      "Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Rewa", "Satna",
      "Dewas", "Ratlam", "Chhindwara", "Dhar", "Khargone", "Khandwa", "Shivpuri",
      "Vidisha", "Sehore", "Hoshangabad (Narmadapuram)", "Betul", "Raisen", "Damoh",
      "Mandsaur", "Neemuch", "Katni", "Balaghat", "Chhatarpur", "Panna", "Tikamgarh",
      "Niwari", "Singrauli", "Sidhi", "Shahdol", "Anuppur", "Umaria", "Dindori",
      "Mandla", "Seoni", "Narsinghpur", "Harda", "Burhanpur", "Barwani", "Alirajpur",
      "Jhabua", "Agar Malwa", "Shajapur", "Rajgarh", "Guna", "Ashoknagar", "Datia",
      "Bhind", "Morena", "Sheopur", "Maihar", "Mauganj", "Pandhurna"
    ],
    majorCities: [
      { name: "Bhopal", slug: "bhopal", desc: "State capital, District Court, MP Human Rights Commission, and NGT Central Zone Bench." },
      { name: "Indore", slug: "indore", desc: "Commercial epicenter, High Court Bench, and District Civil & Sessions Courts." },
      { name: "Jabalpur", slug: "jabalpur", desc: "Judicial capital of MP, Principal Seat of MP High Court, and MP State Bar Council." },
      { name: "Gwalior", slug: "gwalior", desc: "Northern divisional center, permanent High Court Bench, and District Court." },
      { name: "Ujjain", slug: "ujjain", desc: "Historic religious and judicial center with District & Sessions Courts." },
      { name: "Rewa", slug: "rewa", desc: "Vindhya region judicial hub with District Courts and Lok Adalat centers." },
      { name: "Satna", slug: "satna", desc: "Industrial and mining legal dispute center in eastern MP." }
    ],
    faqs: [
      {
        q: "How is jurisdiction split between Jabalpur Principal Seat and the Indore/Gwalior Benches?",
        a: "Under the MP High Court territorial division notification, matters arising from districts in the Gwalior and Chambal divisions are filed before the Gwalior Bench; matters from the Indore, Ujjain, and Nimar divisions are heard by the Indore Bench; and cases from Bhopal, Jabalpur, Sagar, Rewa, and Mahakoshal divisions fall under the Principal Seat at Jabalpur."
      },
      {
        q: "What are the common legal practice domains in Madhya Pradesh?",
        a: "Land revenue disputes under the MP Land Revenue Code (MPLRC), bail and criminal trials before Sessions Courts, cheque bounce under NI Act 138, RERA complaints, agricultural inheritance suits, and service writs against State departments."
      },
      {
        q: "Can I consult an MP advocate online for court drafting before physical filing?",
        a: "Yes. Through LegalConnect, you can book an encrypted video consultation with verified advocates across Jabalpur, Indore, Bhopal, or Gwalior to review petitions, FIRs, deeds, and draft legal notices prior to court submission."
      }
    ],
    nearbyStates: ["uttar-pradesh", "rajasthan", "gujarat", "maharashtra", "chhattisgarh"]
  },
  {
    id: "delhi",
    slug: "delhi",
    name: "Delhi (NCT)",
    type: "union_territory",
    region: "Northern",
    capital: "New Delhi",
    highCourt: {
      name: "High Court of Delhi",
      principalSeat: "New Delhi (Sher Shah Road)",
      benches: [],
      jurisdiction: "National Capital Territory of Delhi",
      establishedYear: 1966,
      officialPortal: "https://delhihighcourt.nic.in",
      circuitBenches: []
    },
    overview: "Delhi stands as the apex epicenter of India's judicial landscape, housing the Supreme Court of India, the High Court of Delhi, and eleven decentralized district court complexes including Tis Hazari, Patiala House, Karkardooma, Saket, Rohini, Dwarka, and Rouse Avenue (Special CBI & MP/MLA Courts). Delhi High Court exercises both constitutional writ jurisdiction under Article 226 and original civil jurisdiction for high-value commercial and intellectual property suits above ₹2 Crore. The Bar Council of Delhi oversees the legal fraternity. From trademark litigation to White Collar criminal trials and NCLT corporate insolvency, Delhi is home to seasoned advocates with extensive appellate and trial experience.",
    districts: [
      "Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi",
      "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"
    ],
    majorCities: [
      { name: "New Delhi", slug: "new-delhi", desc: "Central capital district, Supreme Court, Delhi High Court, and Patiala House Courts." },
      { name: "South Delhi", slug: "south-delhi", desc: "Saket District Court complex, consumer forums, and high-net-worth property litigation." },
      { name: "North Delhi", slug: "north-delhi", desc: "Historic Tis Hazari Courts complex, civil and criminal trial divisions." },
      { name: "East Delhi", slug: "east-delhi", desc: "Karkardooma Courts complex covering East, North East, and Shahdara districts." },
      { name: "West Delhi", slug: "west-delhi", desc: "Tis Hazari & Rohini jurisdictional divisions for commercial and matrimonial suits." },
      { name: "Dwarka", slug: "dwarka", desc: "South West Delhi District Court complex handling aviation, real estate, and civil matters." }
    ],
    faqs: [
      {
        q: "What is the pecuniary jurisdiction of the Delhi High Court for original civil suits?",
        a: "Under the Delhi High Court (Amendment) Act, ordinary civil suits with valuation exceeding ₹2 Crore can be instituted directly before the High Court's Original Side, while suits valued up to ₹2 Crore are instituted before District Courts (Saket, Tis Hazari, etc.)."
      },
      {
        q: "Which court complex hears cases for a specific area in Delhi?",
        a: "Delhi is divided into 11 judicial districts. For example, Saket Courts covers South and South-East Delhi; Tis Hazari covers Central and West Delhi; Patiala House covers New Delhi; Rohini covers North and North-West; Karkardooma covers East, North-East, and Shahdara; and Dwarka covers South-West Delhi."
      },
      {
        q: "Can I file online cases in Delhi Courts?",
        a: "Yes. Both Delhi High Court and Delhi District Courts operate mandatory electronic filing (e-Filing 3.0) and digital court hearing rooms across civil, commercial, and criminal matters."
      }
    ],
    nearbyStates: ["haryana", "uttar-pradesh", "rajasthan"]
  },
  {
    id: "uttar-pradesh",
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    type: "state",
    region: "Northern",
    capital: "Lucknow",
    highCourt: {
      name: "High Court of Judicature at Allahabad",
      principalSeat: "Prayagraj (Allahabad)",
      benches: ["Lucknow"],
      jurisdiction: "Entire State of Uttar Pradesh",
      establishedYear: 1866,
      officialPortal: "https://allahabadhighcourt.in",
      circuitBenches: []
    },
    overview: "Uttar Pradesh has the largest judicial system in India, anchored by the historic Allahabad High Court (Principal Seat at Prayagraj) and its permanent Lucknow Bench. Covering 75 districts, the state handles substantial civil, criminal, revenue, and constitutional litigation. The Bar Council of Uttar Pradesh represents the largest advocate cohort in the nation. District courts across Noida, Ghaziabad, Lucknow, Kanpur, and Varanasi operate specialized tribunals, POCSO courts, and commercial divisions. Key practice areas include UP Revenue Code (UPRC) agricultural title disputes, land acquisition compensation, RERA matters in Noida/Greater Noida, bail before Sessions and High Court, and service litigation before the State Public Services Tribunal (SPST).",
    districts: [
      "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya",
      "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki",
      "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli",
      "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad",
      "Gautam Buddha Nagar (Noida)", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur",
      "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi",
      "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri",
      "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri",
      "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit",
      "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal",
      "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar",
      "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"
    ],
    majorCities: [
      { name: "Lucknow", slug: "lucknow", desc: "State capital, Allahabad High Court Lucknow Bench, and State Consumer Commission." },
      { name: "Prayagraj", slug: "prayagraj", desc: "Principal Seat of Allahabad High Court, highest appellate pendency, and Bar Council of UP." },
      { name: "Noida", slug: "noida", desc: "Gautam Buddha Nagar district, UP RERA bench, corporate real estate and tech disputes." },
      { name: "Ghaziabad", slug: "ghaziabad", desc: "NCR judicial district, CBI Special Courts, District & Sessions Court complex." },
      { name: "Kanpur Nagar", slug: "kanpur", desc: "Commercial hub, District Court, and specialized industrial tribunals." },
      { name: "Varanasi", slug: "varanasi", desc: "Eastern UP judicial center, civil suits, and District & Sessions Courts." },
      { name: "Meerut", slug: "meerut", desc: "Western UP commercial and agrarian litigation center." },
      { name: "Agra", slug: "agra", desc: "District and Commercial Court, tourism, civil, and criminal jurisdictions." }
    ],
    faqs: [
      {
        q: "Which districts fall under the Lucknow Bench vs Allahabad Principal Seat?",
        a: "The Lucknow Bench exercises jurisdiction over districts including Lucknow, Unnao, Rae Bareli, Sitapur, Hardoi, Ayodhya, Sultanpur, Barabanki, Amethi, Bahraich, and Kheri. The remaining districts across Western, Central, and Eastern UP fall under the Principal Seat at Prayagraj."
      },
      {
        q: "How to resolve builder delay disputes in Noida and Greater Noida?",
        a: "Property buyers can file statutory complaints before the Uttar Pradesh Real Estate Regulatory Authority (UP RERA) at its Greater Noida or Lucknow benches to demand possession with interest or full refunds under Section 18 of RERA 2016."
      },
      {
        q: "What is the procedure for anticipatory bail in Uttar Pradesh?",
        a: "Anticipatory bail is governed by Section 438 CrPC (and now Section 482 of the Bharatiya Nagarik Suraksha Sanhita - BNSS). An application can be instituted before the Sessions Judge of the district or directly before the Allahabad High Court under exceptional circumstances."
      }
    ],
    nearbyStates: ["delhi", "haryana", "rajasthan", "madhya-pradesh", "bihar", "uttarakhand"]
  },
  {
    id: "haryana",
    slug: "haryana",
    name: "Haryana",
    type: "state",
    region: "Northern",
    capital: "Chandigarh",
    highCourt: {
      name: "High Court of Punjab and Haryana",
      principalSeat: "Chandigarh",
      benches: [],
      jurisdiction: "States of Punjab, Haryana, and UT of Chandigarh",
      establishedYear: 1947,
      officialPortal: "https://highcourtchd.gov.in",
      circuitBenches: []
    },
    overview: "Haryana's judicial landscape is administered by the joint High Court of Punjab and Haryana at Chandigarh. The state encompasses 22 districts with prominent commercial hubs in Gurugram, Faridabad, Panipat, and Sonipat. Gurugram District Court and Faridabad District Court handle a large volume of corporate contract litigation, cyber fraud, motor vehicle claims, and real estate disputes under HRERA. The Bar Council of Punjab and Haryana at Chandigarh oversees enrollment across the two states. Verified advocates in Haryana assist clients with industrial labor disputes, agricultural partition under the Punjab Security of Land Tenures Act, matrimonial settlements, and criminal defenses.",
    districts: [
      "Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram",
      "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh",
      "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa",
      "Sonipat", "Yamunanagar"
    ],
    majorCities: [
      { name: "Gurugram", slug: "gurugram", desc: "Major NCR corporate hub, District Court, Haryana RERA Bench, and cyber crime divisions." },
      { name: "Faridabad", slug: "faridabad", desc: "Industrial center, District & Sessions Court, and labour tribunals." },
      { name: "Panchkula", slug: "panchkula", desc: "Adjoining Chandigarh, District Courts, and state commission headquarters." },
      { name: "Panipat", slug: "panipat", desc: "Textile industrial cluster, commercial and criminal trial jurisdictions." },
      { name: "Rohtak", slug: "rohtak", desc: "Educational and agricultural hub with District & Sessions Courts." },
      { name: "Karnal", slug: "karnal", desc: "Agricultural and civil litigation center along the GT Road corridor." }
    ],
    faqs: [
      {
        q: "Where do appeals from Haryana District Courts go?",
        a: "First appeals in civil and criminal matters go to the Punjab and Haryana High Court at Chandigarh, or to the Sessions/District Judge depending on valuation and sentencing limits."
      },
      {
        q: "How does HRERA Gurugram operate for property buyers?",
        a: "The Haryana Real Estate Regulatory Authority (HRERA Gurugram) adjudicates complaints regarding non-delivery of flats, failure to obtain OC, and illegal structural changes by developers across Gurugram district."
      }
    ],
    nearbyStates: ["punjab", "delhi", "rajasthan", "uttar-pradesh", "himachal-pradesh"]
  },
  {
    id: "rajasthan",
    slug: "rajasthan",
    name: "Rajasthan",
    type: "state",
    region: "Northern",
    capital: "Jaipur",
    highCourt: {
      name: "High Court of Judicature for Rajasthan",
      principalSeat: "Jodhpur",
      benches: ["Jaipur"],
      jurisdiction: "Entire State of Rajasthan",
      establishedYear: 1949,
      officialPortal: "https://hcraj.nic.in",
      circuitBenches: []
    },
    overview: "Rajasthan's judicial administration is guided by the Rajasthan High Court, which has its Principal Seat at Jodhpur and a permanent Bench at Jaipur. The state includes 50 administrative districts following recent reorganization, with vibrant trial courts in Jaipur, Jodhpur, Kota, Udaipur, Bikaner, and Ajmer. The Bar Council of Rajasthan is based in Jodhpur. Practice domains feature land disputes under the Rajasthan Tenancy Act, mining leases, commercial contract disputes, tourism hospitality litigation, and criminal appeals before the High Court.",
    districts: [
      "Ajmer", "Alwar", "Anupgarh", "Balotra", "Banswara", "Baran", "Barmer", "Beawar",
      "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa",
      "Deeg", "Didwana-Kuchaman", "Dholpur", "Dungarpur", "Ganganagar", "Gangapur City",
      "Hanumangarh", "Jaipur", "Jaipur Rural", "Jaisalmer", "Jalore", "Jhalawar",
      "Jhunjhunu", "Jodhpur", "Jodhpur Rural", "Karauli", "Kekri", "Khairthal-Tijara",
      "Kota", "Kotputli-Behror", "Nagaur", "Neem Ka Thana", "Pali", "Phalodi",
      "Pratapgarh", "Rajsamand", "Salumbar", "Sanchore", "Sawai Madhopur", "Shahpura",
      "Sikar", "Sirohi", "Tonk", "Udaipur"
    ],
    majorCities: [
      { name: "Jaipur", slug: "jaipur", desc: "State capital, Jaipur Bench of Rajasthan High Court, and Metropolitan Sessions Courts." },
      { name: "Jodhpur", slug: "jodhpur", desc: "Principal Seat of Rajasthan High Court, Bar Council of Rajasthan headquarters." },
      { name: "Kota", slug: "kota", desc: "Industrial and educational center with District & Sessions Courts." },
      { name: "Udaipur", slug: "udaipur", desc: "Mewar regional commercial, mining, and civil dispute center." },
      { name: "Bikaner", slug: "bikaner", desc: "Northern divisional center with District & Sessions Courts." },
      { name: "Ajmer", slug: "ajmer", desc: "Central Rajasthan judicial center, Revenue Board headquarters." }
    ],
    faqs: [
      {
        q: "What is the territorial division between Jodhpur Principal Seat and Jaipur Bench?",
        a: "Matters arising from Jaipur, Ajmer, Alwar, Bharatpur, Kota, Sawai Madhopur, Sikar, Jhunjhunu, Tonk, and adjoining districts are filed before the Jaipur Bench, while Western districts like Jodhpur, Bikaner, Jaisalmer, Barmer, Pali, and Udaipur fall under the Jodhpur Principal Seat."
      },
      {
        q: "Where is the Board of Revenue for Rajasthan situated?",
        a: "The Rajasthan Board of Revenue is situated at Ajmer, exercising supreme appellate and revisional powers in land revenue matters across the state."
      }
    ],
    nearbyStates: ["punjab", "haryana", "uttar-pradesh", "madhya-pradesh", "gujarat"]
  },
  {
    id: "maharashtra",
    slug: "maharashtra",
    name: "Maharashtra",
    type: "state",
    region: "Western",
    capital: "Mumbai",
    highCourt: {
      name: "High Court of Judicature at Bombay",
      principalSeat: "Mumbai",
      benches: ["Nagpur", "Aurangabad (Chhatrapati Sambhaji Nagar)", "Panaji (Goa)"],
      jurisdiction: "States of Maharashtra and Goa, Union Territories of Dadra & Nagar Haveli and Daman & Diu",
      establishedYear: 1862,
      officialPortal: "https://bombayhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "Maharashtra's legal framework is anchored by the historic Bombay High Court, one of the three Chartered High Courts established in 1862. It exercises supervisory authority across Maharashtra and Goa, with permanent benches at Nagpur, Aurangabad (Chhatrapati Sambhaji Nagar), and Panaji. Mumbai is India's commercial dispute capital, housing the National Company Law Tribunal (NCLT) Principal and regional benches, SEBI, SAT, and specialized Commercial Division courts. Subordinate trial courts operate across 36 districts including Pune, Thane, Nashik, and Nagpur. The Bar Council of Maharashtra and Goa oversees over 150,000 enrolled legal professionals.",
    districts: [
      "Ahmednagar", "Akola", "Amravati", "Chhatrapati Sambhaji Nagar (Aurangabad)",
      "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia",
      "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City",
      "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Dharashiv (Osmanabad)",
      "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara",
      "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ],
    majorCities: [
      { name: "Mumbai", slug: "mumbai", desc: "Commercial capital, Bombay High Court Principal Seat, City Civil & Sessions Courts, NCLT, SAT." },
      { name: "Pune", slug: "pune", desc: "District & Sessions Courts, labour courts, commercial arbitration, and tech litigation." },
      { name: "Nagpur", slug: "nagpur", desc: "Winter capital, permanent High Court Bench, and District Courts." },
      { name: "Thane", slug: "thane", desc: "Fastest growing judicial district in MMR with Sessions and Family Courts." },
      { name: "Nashik", slug: "nashik", desc: "North Maharashtra commercial and agrarian dispute center." },
      { name: "Chhatrapati Sambhaji Nagar", slug: "chhatrapati-sambhaji-nagar", desc: "Marathwada regional center, permanent Bombay High Court Bench." }
    ],
    faqs: [
      {
        q: "What is the Original Side jurisdiction of Bombay High Court?",
        a: "Unlike most High Courts, Bombay High Court possesses Original Civil Jurisdiction within the limits of Greater Mumbai for civil suits of high valuation, admiralty actions, and company matters."
      },
      {
        q: "How does MahaRERA protect property buyers in Mumbai and Pune?",
        a: "MahaRERA (Maharashtra Real Estate Regulatory Authority) is headquartered in Mumbai and conducts online hearings for delayed possession, refund of booking amounts, and project completion mandates."
      }
    ],
    nearbyStates: ["gujarat", "madhya-pradesh", "chhattisgarh", "telangana", "karnataka", "goa"]
  },
  {
    id: "karnataka",
    slug: "karnataka",
    name: "Karnataka",
    type: "state",
    region: "Southern",
    capital: "Bengaluru",
    highCourt: {
      name: "High Court of Karnataka",
      principalSeat: "Bengaluru",
      benches: ["Dharwad", "Kalaburagi"],
      jurisdiction: "Entire State of Karnataka",
      establishedYear: 1884,
      officialPortal: "https://karnatakahi.courtrec.nic.in",
      circuitBenches: []
    },
    overview: "Karnataka's judicial structure is led by the High Court of Karnataka with its Principal Seat at Bengaluru (Attara Kacheri) and permanent benches at Dharwad and Kalaburagi. Bengaluru is the center for intellectual property (IP), technology contracts, cross-border corporate arbitration, and startup equity disputes. Subordinate courts function across 31 districts. The Karnataka State Bar Council administers legal enrollments. Practicing advocates in Karnataka routinely represent clients in civil suits under Karnataka Land Revenue Act, municipal BBMP title verifications, family disputes, and IT employment arbitrations.",
    districts: [
      "Bagalkote", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
      "Bidar", "Chamarajanagar", "Chikkaballapura", "Chikkamagaluru", "Chitradurga",
      "Dakshina Kannada (Mangaluru)", "Davanagere", "Dharwad", "Gadag", "Hassan",
      "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru",
      "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada",
      "Vijayanagara", "Vijayapura", "Yadgir"
    ],
    majorCities: [
      { name: "Bengaluru", slug: "bengaluru", desc: "State capital, Principal Seat of Karnataka High Court, City Civil Court, NCLT, and IP courts." },
      { name: "Mysuru", slug: "mysuru", desc: "Heritage cultural center, District & Sessions Court, commercial courts." },
      { name: "Mangaluru", slug: "mangaluru", desc: "Coastal commercial hub, maritime admiralty, and District Court complex." },
      { name: "Hubballi-Dharwad", slug: "hubballi-dharwad", desc: "Dharwad Bench of Karnataka High Court and northern Karnataka judicial hub." },
      { name: "Kalaburagi", slug: "kalaburagi", desc: "Kalaburagi Bench of Karnataka High Court covering Hyderabad-Karnataka region." },
      { name: "Belagavi", slug: "belagavi", desc: "Major northern district with commercial and border civil courts." }
    ],
    faqs: [
      {
        q: "Which districts fall under the Dharwad and Kalaburagi Benches?",
        a: "The Dharwad Bench covers districts such as Bagalkote, Belagavi, Ballari, Dharwad, Gadag, Haveri, Koppal, and Uttara Kannada. The Kalaburagi Bench covers Bidar, Kalaburagi, Raichur, and Yadgir. Remaining districts report to Bengaluru."
      },
      {
        q: "What is K-RERA and how to file complaints in Karnataka?",
        a: "K-RERA (Karnataka Real Estate Regulatory Authority) in Bengaluru accepts online complaints against unregistered or defaulting developers across Karnataka."
      }
    ],
    nearbyStates: ["goa", "maharashtra", "telangana", "andhra-pradesh", "tamil-nadu", "kerala"]
  },
  {
    id: "punjab",
    slug: "punjab",
    name: "Punjab",
    type: "state",
    region: "Northern",
    capital: "Chandigarh",
    highCourt: {
      name: "High Court of Punjab and Haryana",
      principalSeat: "Chandigarh",
      benches: [],
      jurisdiction: "States of Punjab, Haryana, and UT of Chandigarh",
      establishedYear: 1947,
      officialPortal: "https://highcourtchd.gov.in",
      circuitBenches: []
    },
    overview: "Punjab's judicial administration is presided over by the High Court of Punjab and Haryana at Chandigarh. With 23 districts across the Malwa, Majha, and Doaba belts, Punjab features active District and Sessions Courts in Ludhiana, Amritsar, Jalandhar, and Patiala. Common litigation domains include NRI property partition, ancestral agricultural land disputes under the Punjab Land Revenue Act, matrimonial cross-border divorces, and criminal trial appeals.",
    districts: [
      "Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka",
      "Firozpur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana",
      "Malerkotla", "Mansa", "Moga", "Mohali (SAS Nagar)", "Muktsar", "Pathankot",
      "Patiala", "Rupnagar", "Sangrur", "Nawanshahr (SBS Nagar)", "Tarn Taran"
    ],
    majorCities: [
      { name: "Ludhiana", slug: "ludhiana", desc: "Industrial capital of Punjab, largest District Court, and commercial arbitration." },
      { name: "Amritsar", slug: "amritsar", desc: "Border district commercial center, District & Sessions Courts." },
      { name: "Jalandhar", slug: "jalandhar", desc: "NRI hub, Doaba regional center with specialized property and civil courts." },
      { name: "Patiala", slug: "patiala", desc: "Historic princely judicial center, District Court, and law university." },
      { name: "Mohali", slug: "mohali", desc: "Adjoining Chandigarh, Punjab RERA headquarters, and corporate tech dispute center." }
    ],
    faqs: [
      {
        q: "How can NRIs protect ancestral agricultural property in Punjab?",
        a: "NRIs can execute registered Powers of Attorney (PoA) verified by the Indian Consulate, and engage verified advocates to conduct revenue search mutations, seek stay injunctions against illegal sales, or file partition suits before Civil Judges."
      }
    ],
    nearbyStates: ["haryana", "rajasthan", "himachal-pradesh", "jammu-and-kashmir"]
  },
  {
    id: "bihar",
    slug: "bihar",
    name: "Bihar",
    type: "state",
    region: "Eastern",
    capital: "Patna",
    highCourt: {
      name: "High Court of Judicature at Patna",
      principalSeat: "Patna",
      benches: [],
      jurisdiction: "Entire State of Bihar",
      establishedYear: 1916,
      officialPortal: "https://patnahighcourt.gov.in",
      circuitBenches: []
    },
    overview: "Bihar's judicial landscape is steered by the historic Patna High Court, established in 1916. Administering 38 districts, the subordinate courts handle intensive civil partition suits, land reforms, criminal trials under the Indian Penal Code and Special Acts, and service matters. The Bihar State Bar Council in Patna is one of the oldest in Eastern India. Practice areas center on the Bihar Land Reforms Act, mutation appeals, bail petitions, and statutory writs against municipal and state bodies.",
    districts: [
      "Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur (Arrah)",
      "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui",
      "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai",
      "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda (Bihar Sharif)",
      "Nawada", "Patna", "Purnia", "Rohtas (Sasaram)", "Saharsa", "Samastipur",
      "Saran (Chhapra)", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul",
      "Vaishali (Hajipur)", "West Champaran (Bettiah)"
    ],
    majorCities: [
      { name: "Patna", slug: "patna", desc: "State capital, Patna High Court Principal Seat, City Civil Court, and appellate tribunals." },
      { name: "Gaya", slug: "gaya", desc: "Southern Bihar commercial and pilgrimage center with District & Sessions Courts." },
      { name: "Muzaffarpur", slug: "muzaffarpur", desc: "North Bihar commercial center, District Court, and consumer forums." },
      { name: "Bhagalpur", slug: "bhagalpur", desc: "Eastern Bihar judicial and commercial hub on the Ganges." },
      { name: "Darbhanga", slug: "darbhanga", desc: "Mithilanchal educational and legal center with District Courts." }
    ],
    faqs: [
      {
        q: "What is the procedure for land mutation appeals in Bihar?",
        a: "If a Circle Officer rejects a mutation application, an appeal can be filed before the Deputy Collector Land Reforms (DCLR) under the Bihar Land Mutation Act 2011, followed by a revision before the District Collector/Additional Collector."
      }
    ],
    nearbyStates: ["uttar-pradesh", "jharkhand", "west-bengal"]
  },
  {
    id: "west-bengal",
    slug: "west-bengal",
    name: "West Bengal",
    type: "state",
    region: "Eastern",
    capital: "Kolkata",
    highCourt: {
      name: "High Court at Calcutta",
      principalSeat: "Kolkata",
      benches: ["Jalpaiguri (Circuit)", "Port Blair (Circuit)"],
      jurisdiction: "State of West Bengal and Union Territory of Andaman and Nicobar Islands",
      establishedYear: 1862,
      officialPortal: "https://calcuttahighcourt.gov.in",
      circuitBenches: ["Jalpaiguri", "Port Blair"]
    },
    overview: "Calcutta High Court is the oldest High Court in India, established under the High Courts Act 1861. It possesses Original Civil Jurisdiction for suits within Kolkata city limits as well as appellate writ jurisdiction. A permanent circuit bench functions at Jalpaiguri for North Bengal districts and at Port Blair for Andaman & Nicobar Islands. The Bar Council of West Bengal oversees an extensive legal community. Subordinate courts in 23 districts handle tenant-landlord disputes under the West Bengal Premises Tenancy Act, commercial admiralty, labour disputes, and consumer claims.",
    districts: [
      "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
      "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong",
      "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas",
      "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur",
      "Purulia", "South 24 Parganas", "Uttar Dinajpur"
    ],
    majorCities: [
      { name: "Kolkata", slug: "kolkata", desc: "State capital, Calcutta High Court, City Civil Court, Small Causes Court, and NCLT bench." },
      { name: "Howrah", slug: "howrah", desc: "Major industrial district, District & Sessions Court, commercial litigation." },
      { name: "Siliguri", slug: "siliguri", desc: "Commercial hub of North Bengal and gateway to North East, District Courts." },
      { name: "Asansol", slug: "asansol", desc: "Industrial and mining judicial division in Paschim Bardhaman." },
      { name: "Durgapur", slug: "durgapur", desc: "Steel and manufacturing hub with commercial and civil courts." }
    ],
    faqs: [
      {
        q: "What is the jurisdiction of the Jalpaiguri Circuit Bench?",
        a: "The Jalpaiguri Circuit Bench hears civil, criminal, and writ matters arising from the North Bengal districts including Jalpaiguri, Darjeeling, Kalimpong, Alipurduar, and Cooch Behar."
      }
    ],
    nearbyStates: ["bihar", "jharkhand", "odisha", "assam", "sikkim"]
  },
  {
    id: "gujarat",
    slug: "gujarat",
    name: "Gujarat",
    type: "state",
    region: "Western",
    capital: "Gandhinagar",
    highCourt: {
      name: "High Court of Gujarat",
      principalSeat: "Ahmedabad (Sola)",
      benches: [],
      jurisdiction: "Entire State of Gujarat",
      establishedYear: 1960,
      officialPortal: "https://gujarathighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Gujarat, situated at Sola in Ahmedabad, heads the state's judicial system across 33 districts. Gujarat is known for high-velocity commercial arbitration, corporate compliance, chemical and industrial disputes, customs litigation at major ports (Mundra, Kandla), and revenue tenancy under the Bombay Tenancy and Agricultural Lands Act. The Bar Council of Gujarat maintains rigorous standards. Subordinate judiciary across Ahmedabad, Surat, Vadodara, and Rajkot operate specialized commercial divisions.",
    districts: [
      "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch",
      "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka",
      "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch",
      "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan",
      "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi",
      "Vadodara", "Valsad"
    ],
    majorCities: [
      { name: "Ahmedabad", slug: "ahmedabad", desc: "Commercial hub, High Court of Gujarat, City Civil Courts, NCLT Regional Bench." },
      { name: "Surat", slug: "surat", desc: "Textile and diamond capital, District & Sessions Court, commercial arbitration." },
      { name: "Vadodara", slug: "vadodara", desc: "Cultural and chemical industrial hub with District Courts." },
      { name: "Rajkot", slug: "rajkot", desc: "Saurashtra regional judicial and industrial center." },
      { name: "Gandhinagar", slug: "gandhinagar", desc: "State administrative capital, District Courts, and state tribunal commissions." }
    ],
    faqs: [
      {
        q: "How does the commercial court system operate in Gujarat?",
        a: "Under the Commercial Courts Act 2015, dedicated Commercial Courts function in Ahmedabad, Surat, and Vadodara for expedited resolution of commercial disputes valued above ₹3 Lakhs."
      }
    ],
    nearbyStates: ["rajasthan", "madhya-pradesh", "maharashtra"]
  },
  {
    id: "tamil-nadu",
    slug: "tamil-nadu",
    name: "Tamil Nadu",
    type: "state",
    region: "Southern",
    capital: "Chennai",
    highCourt: {
      name: "High Court of Judicature at Madras",
      principalSeat: "Chennai",
      benches: ["Madurai"],
      jurisdiction: "State of Tamil Nadu and Union Territory of Puducherry",
      establishedYear: 1862,
      officialPortal: "https://hcmadras.tn.gov.in",
      circuitBenches: []
    },
    overview: "Madras High Court is one of India's three historic Chartered High Courts, with its iconic Principal Seat in Chennai and a permanent Bench at Madurai. It also exercises jurisdiction over the Union Territory of Puducherry. Chennai is a hub for maritime law, copyright, patent suits, automobile industrial disputes, and banking debt recovery. Trial courts function across 38 districts. The Bar Council of Tamil Nadu and Puducherry administers advocate enrollments. Advocates specialize in Tamil Nadu Buildings (Lease and Rent Control) matters, SARFAESI proceedings, writ petitions, and consumer protection.",
    districts: [
      "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri",
      "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur",
      "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal",
      "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet",
      "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi",
      "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur",
      "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
    ],
    majorCities: [
      { name: "Chennai", slug: "chennai", desc: "State capital, Madras High Court Principal Seat, City Civil Court, Small Causes Court, NCLT." },
      { name: "Madurai", slug: "madurai", desc: "Madurai Bench of Madras High Court, southern district commercial and civil hub." },
      { name: "Coimbatore", slug: "coimbatore", desc: "Industrial and textile capital of western Tamil Nadu, District Courts." },
      { name: "Tiruchirappalli", slug: "tiruchirappalli", desc: "Central district judicial center on the Cauvery river." },
      { name: "Salem", slug: "salem", desc: "Commercial and mining district with District & Sessions Courts." }
    ],
    faqs: [
      {
        q: "Which districts report to the Madurai Bench of Madras High Court?",
        a: "The Madurai Bench covers southern districts including Madurai, Dindigul, Theni, Ramanathapuram, Virudhunagar, Sivaganga, Tirunelveli, Thoothukudi, Kanyakumari, Thanjavur, Tiruchirappalli, Pudukkottai, Karur, and Kanyakumari."
      }
    ],
    nearbyStates: ["kerala", "karnataka", "andhra-pradesh"]
  },
  {
    id: "kerala",
    slug: "kerala",
    name: "Kerala",
    type: "state",
    region: "Southern",
    capital: "Thiruvananthapuram",
    highCourt: {
      name: "High Court of Kerala",
      principalSeat: "Kochi (Ernakulam)",
      benches: [],
      jurisdiction: "State of Kerala and Union Territory of Lakshadweep",
      establishedYear: 1956,
      officialPortal: "https://highcourtofkerala.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Kerala, situated at Ernakulam (Kochi), serves the state of Kerala and the Union Territory of Lakshadweep. Known for progressive judicial pronouncements and high digital integration, Kerala has 14 well-organized judicial districts. Core practice areas include NRI property protection, land ceiling under the Kerala Land Reforms Act, environmental litigation, admiralty suits at Cochin Port, maritime shipping claims, and cooperative banking disputes under SARFAESI. The Bar Council of Kerala oversees the legal community.",
    districts: [
      "Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam",
      "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta",
      "Thiruvananthapuram", "Thrissur", "Wayanad"
    ],
    majorCities: [
      { name: "Kochi", slug: "kochi", desc: "Commercial capital, High Court of Kerala, admiralty courts, and NCLT bench." },
      { name: "Thiruvananthapuram", slug: "thiruvananthapuram", desc: "State administrative capital, District Courts, and state commissions." },
      { name: "Kozhikode", slug: "kozhikode", desc: "Northern Malabar commercial center with District & Sessions Courts." },
      { name: "Thrissur", slug: "thrissur", desc: "Cultural and banking hub with District Courts." },
      { name: "Kollam", slug: "kollam", desc: "Southern coastal district, cashew and maritime commercial disputes." }
    ],
    faqs: [
      {
        q: "Where is the High Court of Kerala located?",
        a: "The High Court of Kerala is located at Kochi (Ernakulam), not the administrative capital of Thiruvananthapuram."
      }
    ],
    nearbyStates: ["tamil-nadu", "karnataka"]
  },
  {
    id: "telangana",
    slug: "telangana",
    name: "Telangana",
    type: "state",
    region: "Southern",
    capital: "Hyderabad",
    highCourt: {
      name: "High Court for the State of Telangana",
      principalSeat: "Hyderabad",
      benches: [],
      jurisdiction: "Entire State of Telangana",
      establishedYear: 2019,
      officialPortal: "https://tshc.gov.in",
      circuitBenches: []
    },
    overview: "The High Court for the State of Telangana is situated along the Musi river in Hyderabad. Administering 33 districts, it is one of India's most tech-forward courts with extensive live-streaming and paperless benches. Hyderabad is a prime location for pharmaceutical patents, IT software disputes, real estate litigation under TG-RERA, and corporate insolvency. District and Metropolitan Sessions Courts function across Hyderabad, Cyberabad, Warangal, and Nizamabad.",
    districts: [
      "Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial",
      "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy",
      "Karimnagar", "Khammam", "Kumuram Bheem Asifabad", "Mahabubabad",
      "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu",
      "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad",
      "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet",
      "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ],
    majorCities: [
      { name: "Hyderabad", slug: "hyderabad", desc: "State capital, High Court of Telangana, City Civil Courts, NCLT Regional Bench." },
      { name: "Warangal", slug: "warangal", desc: "Second largest city, historic judicial center with District & Sessions Courts." },
      { name: "Nizamabad", slug: "nizamabad", desc: "Northern Telangana agricultural and commercial dispute center." },
      { name: "Karimnagar", slug: "karimnagar", desc: "Major urban center with active District and Sessions Courts." }
    ],
    faqs: [
      {
        q: "How does TG-RERA function for property disputes in Hyderabad?",
        a: "Telangana RERA operates online complaint filing for home buyers seeking refunds, possession notices, and penalty enforcement against real estate promoters."
      }
    ],
    nearbyStates: ["andhra-pradesh", "karnataka", "maharashtra", "chhattisgarh"]
  },
  {
    id: "andhra-pradesh",
    slug: "andhra-pradesh",
    name: "Andhra Pradesh",
    type: "state",
    region: "Southern",
    capital: "Amaravati",
    highCourt: {
      name: "High Court of Andhra Pradesh",
      principalSeat: "Amaravati",
      benches: [],
      jurisdiction: "Entire State of Andhra Pradesh",
      establishedYear: 2019,
      officialPortal: "https://aphc.gov.in",
      circuitBenches: []
    },
    overview: "The High Court of Andhra Pradesh operates from its modern court complex in Amaravati. The state spans 26 restructured districts with prominent commercial coastal hubs including Visakhapatnam, Vijayawada, Guntur, and Tirupati. Core litigation domains include maritime trade, port customs, aquaculture and agricultural contracts, land acquisition compensation, and administrative service appeals.",
    districts: [
      "Alluri Sitharama Raju", "Anakapalli", "Ananthapuramu", "Annamayya", "Bapatla",
      "Chittoor", "Dr. B.R. Ambedkar Konaseema", "East Godavari", "Eluru", "Guntur",
      "Kakinada", "Krishna", "Kurnool", "Nandyal", "NTR (Vijayawada)", "Palnadu",
      "Parvathipuram Manyam", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore",
      "Sri Sathya Sai", "Tirupati", "Visakhapatnam", "Vizianagaram", "West Godavari",
      "YSR (Kadapa)"
    ],
    majorCities: [
      { name: "Visakhapatnam", slug: "visakhapatnam", desc: "Major port and industrial city, District & Sessions Court, commercial admiralty." },
      { name: "Vijayawada", slug: "vijayawada", desc: "Commercial hub of Andhra Pradesh, District Court, and consumer commissions." },
      { name: "Guntur", slug: "guntur", desc: "Adjoining capital region, major civil and agricultural litigation center." },
      { name: "Tirupati", slug: "tirupati", desc: "Rayalaseema educational and pilgrimage center with District Courts." },
      { name: "Kurnool", slug: "kurnool", desc: "Judicial center of western Andhra Pradesh with District Courts." }
    ],
    faqs: [
      {
        q: "Where is the High Court of Andhra Pradesh seated?",
        a: "The High Court of Andhra Pradesh is seated at Nelapadu in Amaravati."
      }
    ],
    nearbyStates: ["telangana", "tamil-nadu", "karnataka", "odisha"]
  },
  {
    id: "odisha",
    slug: "odisha",
    name: "Odisha",
    type: "state",
    region: "Eastern",
    capital: "Bhubaneswar",
    highCourt: {
      name: "High Court of Orissa",
      principalSeat: "Cuttack",
      benches: [],
      jurisdiction: "Entire State of Odisha",
      establishedYear: 1948,
      officialPortal: "https://orissahighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Orissa, situated at Cuttack, is the apex judicial body of Odisha. The twin-city corridor of Bhubaneswar and Cuttack represents the legal nerve center. Subordinate courts function across 30 districts. Key practice areas include mining leases, environmental disputes before NGT East Zone, tribal land protection under the Odisha Scheduled Areas Transfer of Immovable Property Regulations, industrial port litigation at Paradip, and service matters.",
    districts: [
      "Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack",
      "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur",
      "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)",
      "Khordha (Bhubaneswar)", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur",
      "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)",
      "Sundargarh"
    ],
    majorCities: [
      { name: "Cuttack", slug: "cuttack", desc: "Judicial capital, High Court of Orissa, and Odisha State Bar Council." },
      { name: "Bhubaneswar", slug: "bhubaneswar", desc: "Administrative capital, District Court, State Commission, and NCLT bench." },
      { name: "Rourkela", slug: "rourkela", desc: "Steel and industrial hub with commercial and civil trial courts." },
      { name: "Berhampur", slug: "berhampur", desc: "Southern Odisha commercial center with District & Sessions Courts." },
      { name: "Sambalpur", slug: "sambalpur", desc: "Western Odisha educational, mining, and legal dispute hub." }
    ],
    faqs: [
      {
        q: "Why is the High Court of Orissa located in Cuttack instead of Bhubaneswar?",
        a: "Cuttack was the historic capital of Odisha and has hosted the High Court since its establishment in 1948, while Bhubaneswar serves as the modern administrative capital."
      }
    ],
    nearbyStates: ["west-bengal", "jharkhand", "chhattisgarh", "andhra-pradesh"]
  },
  {
    id: "jharkhand",
    slug: "jharkhand",
    name: "Jharkhand",
    type: "state",
    region: "Eastern",
    capital: "Ranchi",
    highCourt: {
      name: "High Court of Jharkhand",
      principalSeat: "Ranchi",
      benches: [],
      jurisdiction: "Entire State of Jharkhand",
      establishedYear: 2000,
      officialPortal: "https://jharkhandhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Jharkhand functions from its grand judicial campus in Ranchi. Spanning 24 districts with heavy mining and manufacturing activities in Jamshedpur, Dhanbad, and Bokaro, the state's legal framework centers heavily on tenancy under the Chota Nagpur Tenancy (CNT) Act and Santhal Parganas Tenancy (SPT) Act, mining royalties, forest rights, industrial accidents, and criminal trials.",
    districts: [
      "Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum (Jamshedpur)",
      "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti",
      "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi",
      "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum (Chaibasa)"
    ],
    majorCities: [
      { name: "Ranchi", slug: "ranchi", desc: "State capital, High Court of Jharkhand, Judicial Academy, and District Courts." },
      { name: "Jamshedpur", slug: "jamshedpur", desc: "Steel city, East Singhbhum District Court, industrial labour tribunals." },
      { name: "Dhanbad", slug: "dhanbad", desc: "Coal capital of India, specialized mining accident and labour dispute courts." },
      { name: "Bokaro", slug: "bokaro", desc: "Industrial center with District & Sessions Courts." },
      { name: "Deoghar", slug: "deoghar", desc: "Santhal Pargana regional commercial and pilgrimage center." }
    ],
    faqs: [
      {
        q: "What is the CNT Act and how does it affect land transfer in Jharkhand?",
        a: "The Chota Nagpur Tenancy (CNT) Act 1908 restricts the transfer of tribal and indigenous lands to non-tribals to prevent exploitation, making specialized legal title scrutiny essential before any property purchase in Jharkhand."
      }
    ],
    nearbyStates: ["bihar", "west-bengal", "odisha", "chhattisgarh", "uttar-pradesh"]
  },
  {
    id: "assam",
    slug: "assam",
    name: "Assam",
    type: "state",
    region: "North Eastern",
    capital: "Dispur (Guwahati)",
    highCourt: {
      name: "The Gauhati High Court",
      principalSeat: "Guwahati",
      benches: ["Kohima (Nagaland)", "Aizawl (Mizoram)", "Itanagar (Arunachal Pradesh)"],
      jurisdiction: "States of Assam, Nagaland, Mizoram, and Arunachal Pradesh",
      establishedYear: 1948,
      officialPortal: "https://ghconline.gov.in",
      circuitBenches: []
    },
    overview: "The Gauhati High Court at Guwahati is the premier judicial institution in North East India, holding common jurisdiction across Assam, Nagaland, Mizoram, and Arunachal Pradesh through its Principal Seat and three permanent benches. Assam's subordinate judiciary spans 31 districts. Core litigation areas include citizenship and Foreigners Tribunal matters, tea plantation labour disputes, oil and natural gas contracts, forest preservation, and border revenue partitions.",
    districts: [
      "Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar (Silchar)", "Charaideo",
      "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara",
      "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan (Guwahati)",
      "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli",
      "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur (Tezpur)", "South Salmara-Mankachar",
      "Tinsukia", "Udalguri", "West Karbi Anglong"
    ],
    majorCities: [
      { name: "Guwahati", slug: "guwahati", desc: "Principal Seat of Gauhati High Court, Kamrup Metro District Court, NCLT Guwahati Bench." },
      { name: "Silchar", slug: "silchar", desc: "Barak Valley commercial and judicial center, Cachar District Court." },
      { name: "Dibrugarh", slug: "dibrugarh", desc: "Upper Assam tea, oil, and educational hub with District & Sessions Courts." },
      { name: "Jorhat", slug: "jorhat", desc: "Cultural and commercial center with active District Courts." },
      { name: "Tezpur", slug: "tezpur", desc: "Northern bank cultural and administrative center with District Courts." }
    ],
    faqs: [
      {
        q: "What is the jurisdiction of the Gauhati High Court?",
        a: "The Gauhati High Court exercises common jurisdiction over four North Eastern states: Assam (Principal Seat at Guwahati), Nagaland (Kohima Bench), Mizoram (Aizawl Bench), and Arunachal Pradesh (Itanagar Bench)."
      }
    ],
    nearbyStates: ["meghalaya", "arunachal-pradesh", "nagaland", "manipur", "mizoram", "tripura", "west-bengal"]
  },
  {
    id: "chhattisgarh",
    slug: "chhattisgarh",
    name: "Chhattisgarh",
    type: "state",
    region: "Central",
    capital: "Raipur",
    highCourt: {
      name: "High Court of Chhattisgarh",
      principalSeat: "Bilaspur (Bodhri)",
      benches: [],
      jurisdiction: "Entire State of Chhattisgarh",
      establishedYear: 2000,
      officialPortal: "https://highcourt.cg.gov.in",
      circuitBenches: []
    },
    overview: "The High Court of Chhattisgarh is located at Bodhri in Bilaspur, presiding over 33 districts. The state's judicial docket features mineral concession agreements, forest conservation disputes, electricity regulatory challenges, tribal land protections, and revenue partition under the Chhattisgarh Land Revenue Code. Subordinate courts in Raipur, Bilaspur, Durg-Bhilai, and Korba operate commercial and civil benches.",
    districts: [
      "Balod", "Baloda Bazar", "Balrampur", "Bastar (Jagdalpur)", "Bemetara", "Bijapur",
      "Bilaspur", "Dakshin Bastar Dantewada", "Dhamtari", "Durg", "Gariaband",
      "Gaurela-Pendra-Marwahi", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)",
      "Khairagarh-Chhuikhadan-Gandai", "Kondagaon", "Korba", "Koriya", "Mahasamund",
      "Manendragarh-Chirmiri-Bharatpur", "Mohla-Manpur-Ambagarh Chowki", "Mungeli",
      "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sakti", "Sarangarh-Bilaigarh",
      "Sukma", "Surajpur", "Surguja (Ambikapur)", "Uttar Bastar Kanker"
    ],
    majorCities: [
      { name: "Bilaspur", slug: "bilaspur", desc: "Judicial capital of Chhattisgarh, High Court Principal Seat, and District Courts." },
      { name: "Raipur", slug: "raipur", desc: "State administrative capital, District Court, State Commission, and commercial tribunals." },
      { name: "Durg-Bhilai", slug: "durg-bhilai", desc: "Steel industrial cluster with District & Sessions Courts." },
      { name: "Korba", slug: "korba", desc: "Power generation and coal dispute center with District Courts." },
      { name: "Jagdalpur", slug: "jagdalpur", desc: "Bastar tribal division administrative and legal center." }
    ],
    faqs: [
      {
        q: "Where is the High Court of Chhattisgarh situated?",
        a: "The High Court of Chhattisgarh is situated at Bodhri in Bilaspur district."
      }
    ],
    nearbyStates: ["madhya-pradesh", "maharashtra", "telangana", "odisha", "jharkhand", "uttar-pradesh"]
  },
  {
    id: "uttarakhand",
    slug: "uttarakhand",
    name: "Uttarakhand",
    type: "state",
    region: "Northern",
    capital: "Dehradun",
    highCourt: {
      name: "High Court of Uttarakhand",
      principalSeat: "Nainital",
      benches: [],
      jurisdiction: "Entire State of Uttarakhand",
      establishedYear: 2000,
      officialPortal: "https://highcourtofuttarakhand.gov.in",
      circuitBenches: []
    },
    overview: "The High Court of Uttarakhand is seated amid the hills of Nainital, governing 13 districts in the Garhwal and Kumaon divisions. With the rapid industrialization of Dehradun, Haridwar, and Udham Singh Nagar, key litigation areas include environmental PILs concerning the Himalayas and holy rivers, land purchase restrictions under the Uttarakhand Land Revenue and Tenancy laws, tourism and hotel licensing, and forest rights.",
    districts: [
      "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar",
      "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal",
      "Udham Singh Nagar (Rudrapur)", "Uttarkashi"
    ],
    majorCities: [
      { name: "Dehradun", slug: "dehradun", desc: "State capital, District & Sessions Court, commercial courts, and tribunal branches." },
      { name: "Nainital", slug: "nainital", desc: "Judicial capital, High Court of Uttarakhand, and Bar Association." },
      { name: "Haridwar", slug: "haridwar", desc: "Industrial and religious center with District Courts and Lok Adalats." },
      { name: "Rudrapur", slug: "rudrapur", desc: "Commercial hub of Terai with industrial and civil trial courts." },
      { name: "Haldwani", slug: "haldwani", desc: "Major commercial gateway to Kumaon with District Court division." }
    ],
    faqs: [
      {
        q: "Can outsiders buy land in Uttarakhand without restrictions?",
        a: "Under the Uttarakhand Tenancy and Land Laws (including Section 154 of the UP Zamindari Abolition Act as applicable to Uttarakhand), non-domiciled individuals face strict municipal acreage limits (up to 250 sq meters) without prior District Magistrate approval."
      }
    ],
    nearbyStates: ["uttar-pradesh", "himachal-pradesh", "haryana"]
  },
  {
    id: "goa",
    slug: "goa",
    name: "Goa",
    type: "state",
    region: "Western",
    capital: "Panaji",
    highCourt: {
      name: "High Court of Bombay at Goa",
      principalSeat: "Panaji (Porvorim)",
      benches: [],
      jurisdiction: "State of Goa under Bombay High Court jurisdiction",
      establishedYear: 1982,
      officialPortal: "https://hcbombayatgoa.nic.in",
      circuitBenches: []
    },
    overview: "Goa holds a unique position in Indian jurisprudence as the only state with a Uniform Civil Code (Portuguese Civil Code of 1867), which provides equal matrimonial property regimes and succession rights regardless of religion. Judicial oversight is exercised by the permanent Bench of the Bombay High Court at Porvorim (Panaji). The state has 2 districts: North Goa and South Goa. Prominent litigation areas include Comunidade land rights, CRZ coastal environmental regulations, tourism property leases, and mining lease renewals.",
    districts: [
      "North Goa (Panaji)", "South Goa (Margao)"
    ],
    majorCities: [
      { name: "Panaji", slug: "panaji", desc: "State capital, High Court of Bombay at Goa, North Goa District Courts." },
      { name: "Margao", slug: "margao", desc: "Commercial capital of South Goa, South Goa District & Sessions Court." },
      { name: "Vasco da Gama", slug: "vasco-da-gama", desc: "Port city, maritime dispute jurisdiction, and civil courts." },
      { name: "Mapusa", slug: "mapusa", desc: "Northern Goa commercial and tourism property legal dispute center." }
    ],
    faqs: [
      {
        q: "How does the Uniform Civil Code in Goa affect marriage and inheritance?",
        a: "Under the Goa Civil Code, marriages entail a default communion of assets where each spouse owns a 50% share in all acquired property. Ancestral inheritance cannot be completely disinherited due to the mandatory legitime share for children."
      }
    ],
    nearbyStates: ["maharashtra", "karnataka"]
  },
  {
    id: "himachal-pradesh",
    slug: "himachal-pradesh",
    name: "Himachal Pradesh",
    type: "state",
    region: "Northern",
    capital: "Shimla",
    highCourt: {
      name: "High Court of Himachal Pradesh",
      principalSeat: "Shimla",
      benches: [],
      jurisdiction: "Entire State of Himachal Pradesh",
      establishedYear: 1971,
      officialPortal: "https://hphighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Himachal Pradesh is situated at Ravenswood in Shimla, administering 12 hill districts. The state's legal framework centers heavily on Section 118 of the HP Tenancy and Land Reforms Act 1972, which restricts agricultural land purchases by non-agriculturists. Other key practice areas include hydro-power project disputes, apple orchard tenancy partitions, municipal town planning violations, and state government service appeals.",
    districts: [
      "Bilaspur", "Chamba", "Hamirpur", "Kangra (Dharamshala)", "Kinnaur",
      "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur (Nahan)",
      "Solan", "Una"
    ],
    majorCities: [
      { name: "Shimla", slug: "shimla", desc: "State capital, High Court of Himachal Pradesh, District Courts, State Commission." },
      { name: "Dharamshala", slug: "dharamshala", desc: "Kangra district headquarters, winter legislative capital with District Courts." },
      { name: "Solan", slug: "solan", desc: "Industrial and pharmaceutical corridor with District & Sessions Courts." },
      { name: "Mandi", slug: "mandi", desc: "Central hill commercial center with District Courts." },
      { name: "Kullu", slug: "kullu", desc: "Tourism and horticulture legal dispute center." }
    ],
    faqs: [
      {
        q: "What is Section 118 of the HP Tenancy and Land Reforms Act?",
        a: "Section 118 prevents non-agriculturists of Himachal Pradesh from purchasing land without prior Cabinet sanction from the State Government, safeguarding local agrarian ownership."
      }
    ],
    nearbyStates: ["punjab", "haryana", "uttarakhand", "jammu-and-kashmir"]
  },
  {
    id: "tripura",
    slug: "tripura",
    name: "Tripura",
    type: "state",
    region: "North Eastern",
    capital: "Agartala",
    highCourt: {
      name: "High Court of Tripura",
      principalSeat: "Agartala",
      benches: [],
      jurisdiction: "Entire State of Tripura",
      establishedYear: 2013,
      officialPortal: "https://thc.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Tripura is situated at Capital Complex in Agartala, administering 8 districts. It handles constitutional writs, Tripura Land Revenue and Land Reforms Act cases, tribal autonomous district council disputes under the Sixth Schedule, rubber plantation tenures, and border trade issues.",
    districts: [
      "Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala",
      "South Tripura", "Unakoti", "West Tripura (Agartala)"
    ],
    majorCities: [
      { name: "Agartala", slug: "agartala", desc: "State capital, High Court of Tripura, and District & Sessions Courts." },
      { name: "Dharmanagar", slug: "dharmanagar", desc: "North Tripura commercial center with District Courts." },
      { name: "Udaipur", slug: "udaipur-tripura", desc: "Gomati district headquarters with District Courts." }
    ],
    faqs: [
      {
        q: "When was the High Court of Tripura established?",
        a: "The High Court of Tripura was established in March 2013, prior to which Tripura was under the jurisdiction of the Gauhati High Court."
      }
    ],
    nearbyStates: ["assam", "mizoram"]
  },
  {
    id: "manipur",
    slug: "manipur",
    name: "Manipur",
    type: "state",
    region: "North Eastern",
    capital: "Imphal",
    highCourt: {
      name: "High Court of Manipur",
      principalSeat: "Imphal (Chingmeirong)",
      benches: [],
      jurisdiction: "Entire State of Manipur",
      establishedYear: 2013,
      officialPortal: "https://hcmimphal.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Manipur, established in 2013, operates from its permanent complex at Chingmeirong in Imphal. Administering 16 valley and hill districts, it handles customary tribal laws, land ownership differences between the valley and Sixth Schedule hill areas, constitutional human rights writs, and service litigation.",
    districts: [
      "Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West",
      "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl",
      "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"
    ],
    majorCities: [
      { name: "Imphal", slug: "imphal", desc: "State capital, High Court of Manipur, District Courts of Imphal East & West." },
      { name: "Churachandpur", slug: "churachandpur", desc: "Southern hill district judicial and administrative center." },
      { name: "Thoubal", slug: "thoubal", desc: "Valley commercial center with District & Sessions Courts." }
    ],
    faqs: [
      {
        q: "What is the legal distinction between valley and hill land laws in Manipur?",
        a: "Under the Manipur Land Revenue and Land Reforms Act 1960, land in the valley is freehold and transferable, while hill districts follow customary tribal community land rights where transfer to non-tribals is restricted."
      }
    ],
    nearbyStates: ["assam", "nagaland", "mizoram"]
  },
  {
    id: "meghalaya",
    slug: "meghalaya",
    name: "Meghalaya",
    type: "state",
    region: "North Eastern",
    capital: "Shillong",
    highCourt: {
      name: "High Court of Meghalaya",
      principalSeat: "Shillong",
      benches: [],
      jurisdiction: "Entire State of Meghalaya",
      establishedYear: 2013,
      officialPortal: "https://meghalayahighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Meghalaya, located in Shillong, governs 12 districts across the Khasi, Jaintia, and Garo hills. Meghalaya's legal structure is strongly integrated with Autonomous District Councils (KHADC, JHADC, GHADC) under the Sixth Schedule of the Indian Constitution, which operate customary village and subordinate courts alongside the formal judicial framework.",
    districts: [
      "East Garo Hills", "East Jaintia Hills", "East Khasi Hills (Shillong)",
      "Eastern West Khasi Hills", "North Garo Hills", "Ri-Bhoi", "South Garo Hills",
      "South West Garo Hills", "South West Khasi Hills", "West Garo Hills (Tura)",
      "West Jaintia Hills (Jowai)", "West Khasi Hills"
    ],
    majorCities: [
      { name: "Shillong", slug: "shillong", desc: "State capital, High Court of Meghalaya, and East Khasi Hills District Courts." },
      { name: "Tura", slug: "tura", desc: "Garo Hills commercial and judicial hub with District Courts." },
      { name: "Jowai", slug: "jowai", desc: "Jaintia Hills regional center with District & Sessions Courts." }
    ],
    faqs: [
      {
        q: "How do Autonomous District Council Courts operate in Meghalaya?",
        a: "Under the Sixth Schedule, District Council Courts adjudicate customary tribal disputes, marriage, and inheritance between tribal members, with appeals progressing to the High Court of Meghalaya."
      }
    ],
    nearbyStates: ["assam"]
  },
  {
    id: "nagaland",
    slug: "nagaland",
    name: "Nagaland",
    type: "state",
    region: "North Eastern",
    capital: "Kohima",
    highCourt: {
      name: "The Gauhati High Court (Kohima Bench)",
      principalSeat: "Guwahati (Principal Seat)",
      benches: ["Kohima"],
      jurisdiction: "State of Nagaland under Gauhati High Court",
      establishedYear: 1972,
      officialPortal: "https://kohimahighcourt.gov.in",
      circuitBenches: []
    },
    overview: "Nagaland's legal landscape is protected by Article 371A of the Constitution of India, which stipulates that no Act of Parliament concerning Naga religious practices, customary laws, or ownership of land and resources applies to Nagaland unless approved by the State Legislative Assembly. The Kohima Bench of the Gauhati High Court exercises appellate and constitutional oversight across 16 districts, operating alongside traditional Dobashi and customary tribal village courts.",
    districts: [
      "Chümoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung",
      "Mon", "Niuland", "Noklak", "Peren", "Phek", "Shamator", "Tseminyü",
      "Tuensang", "Wokha", "Zunheboto"
    ],
    majorCities: [
      { name: "Kohima", slug: "kohima", desc: "State capital, Kohima Bench of Gauhati High Court, and District Courts." },
      { name: "Dimapur", slug: "dimapur", desc: "Commercial capital of Nagaland with active District & Sessions Courts." },
      { name: "Mokokchung", slug: "mokokchung", desc: "Cultural and educational center of Ao Nagas with District Courts." }
    ],
    faqs: [
      {
        q: "What special legal protections does Article 371A provide to Nagaland?",
        a: "Article 371A protects Naga customary laws and land ownership, giving customary Dobashi courts primary authority in civil disputes among tribal inhabitants."
      }
    ],
    nearbyStates: ["assam", "arunachal-pradesh", "manipur"]
  },
  {
    id: "mizoram",
    slug: "mizoram",
    name: "Mizoram",
    type: "state",
    region: "North Eastern",
    capital: "Aizawl",
    highCourt: {
      name: "The Gauhati High Court (Aizawl Bench)",
      principalSeat: "Guwahati (Principal Seat)",
      benches: ["Aizawl"],
      jurisdiction: "State of Mizoram under Gauhati High Court",
      establishedYear: 1990,
      officialPortal: "https://aizawlhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "Mizoram benefits from special constitutional safeguards under Article 371G of the Constitution, preserving Mizo customary law and land rights. The Aizawl Bench of the Gauhati High Court oversees the formal judiciary across 11 districts, working alongside customary Village Council Courts. Subordinate judiciary in Aizawl, Lunglei, and Champhai handle civil contracts, family disputes, and border trade litigation.",
    districts: [
      "Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai",
      "Lunglei", "Mamit", "Saitual", "Serchhip", "Siaha"
    ],
    majorCities: [
      { name: "Aizawl", slug: "aizawl", desc: "State capital, Aizawl Bench of Gauhati High Court, District & Sessions Courts." },
      { name: "Lunglei", slug: "lunglei", desc: "Southern regional center with District Courts." },
      { name: "Champhai", slug: "champhai", desc: "Border trade hub with Myanmar, civil and criminal trial courts." }
    ],
    faqs: [
      {
        q: "Which High Court bench oversees Mizoram?",
        a: "The permanent Aizawl Bench of the Gauhati High Court exercises jurisdiction over the state of Mizoram."
      }
    ],
    nearbyStates: ["assam", "manipur", "tripura"]
  },
  {
    id: "sikkim",
    slug: "sikkim",
    name: "Sikkim",
    type: "state",
    region: "North Eastern",
    capital: "Gangtok",
    highCourt: {
      name: "High Court of Sikkim",
      principalSeat: "Gangtok",
      benches: [],
      jurisdiction: "Entire State of Sikkim",
      establishedYear: 1975,
      officialPortal: "https://hcs.gov.in",
      circuitBenches: []
    },
    overview: "The High Court of Sikkim at Gangtok is one of India's smallest yet most efficient High Courts. Under Article 371F of the Constitution, old Sikkimese laws in force prior to merger in 1975 continue to operate unless amended. Administering 6 districts, the court handles revenue appeals under Sikkim Old Laws, environmental conservation, tourism disputes, and hydro-electric litigation.",
    districts: [
      "Gangtok", "Gyalshing", "Mangan", "Namchi", "Pakyong", "Soreng"
    ],
    majorCities: [
      { name: "Gangtok", slug: "gangtok", desc: "State capital, High Court of Sikkim, District Courts of Gangtok." },
      { name: "Namchi", slug: "namchi", desc: "South Sikkim district headquarters with District Courts." },
      { name: "Gyalshing", slug: "gyalshing", desc: "West Sikkim administrative and tourism center with District Courts." }
    ],
    faqs: [
      {
        q: "What is the effect of Article 371F on property ownership in Sikkim?",
        a: "Article 371F protects old laws such as Revenue Order No. 1 of 1917, which bars the sale or mortgage of Bhutia-Lepcha land to non-tribals, preserving indigenous land tenure."
      }
    ],
    nearbyStates: ["west-bengal"]
  },
  {
    id: "arunachal-pradesh",
    slug: "arunachal-pradesh",
    name: "Arunachal Pradesh",
    type: "state",
    region: "North Eastern",
    capital: "Itanagar",
    highCourt: {
      name: "The Gauhati High Court (Itanagar Bench)",
      principalSeat: "Guwahati (Principal Seat)",
      benches: ["Itanagar (Naharlagun)"],
      jurisdiction: "State of Arunachal Pradesh under Gauhati High Court",
      establishedYear: 2000,
      officialPortal: "https://itanagarhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "Arunachal Pradesh's judicial structure is guided by the Itanagar Bench of the Gauhati High Court located at Naharlagun. Covering 26 hill districts, customary tribal councils (Kebang among the Adis, Tsorgens among the Monpas) resolve most civil disputes under the Assam Frontier (Administration of Justice) Regulation 1945, while the formal judiciary handles statutory civil and criminal litigation.",
    districts: [
      "Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang (Pasighat)",
      "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding",
      "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai",
      "Pakke Kessang", "Papum Pare (Itanagar)", "Shi Yomi", "Siang", "Tawang",
      "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"
    ],
    majorCities: [
      { name: "Itanagar", slug: "itanagar", desc: "State capital, Itanagar Bench of Gauhati High Court, District Courts." },
      { name: "Pasighat", slug: "pasighat", desc: "Oldest town in the state, East Siang District & Sessions Courts." },
      { name: "Tawang", slug: "tawang", desc: "Western border district with District Courts and customary councils." }
    ],
    faqs: [
      {
        q: "What role do traditional Kebang councils play in Arunachal Pradesh?",
        a: "Kebangs are customary village councils recognized under the 1945 Regulation that resolve community, property, and family matters based on tribal customary jurisprudence."
      }
    ],
    nearbyStates: ["assam", "nagaland"]
  },

  // -------------------------------------------------------------
  // UNION TERRITORIES (8)
  // -------------------------------------------------------------
  {
    id: "chandigarh",
    slug: "chandigarh",
    name: "Chandigarh",
    type: "union_territory",
    region: "Northern",
    capital: "Chandigarh",
    highCourt: {
      name: "High Court of Punjab and Haryana",
      principalSeat: "Chandigarh",
      benches: [],
      jurisdiction: "UT of Chandigarh, States of Punjab and Haryana",
      establishedYear: 1947,
      officialPortal: "https://highcourtchd.gov.in",
      circuitBenches: []
    },
    overview: "Chandigarh functions as a Union Territory and joint capital of Punjab and Haryana, hosting the High Court of Punjab and Haryana at Sector 1. The District Courts Complex at Sector 43 handles high volumes of civil suits, property lease disputes with the Chandigarh Administration, consumer complaints, and criminal trials. The city is a major center for corporate arbitration, banking SARFAESI, and appellate litigation.",
    districts: ["Chandigarh"],
    majorCities: [
      { name: "Chandigarh", slug: "chandigarh", desc: "Union Territory capital, High Court of Punjab & Haryana, District Courts Sector 43." }
    ],
    faqs: [
      {
        q: "Where is the District Court of Chandigarh located?",
        a: "The District Courts of Chandigarh are situated at the Judicial Complex in Sector 43."
      }
    ],
    nearbyStates: ["punjab", "haryana"]
  },
  {
    id: "jammu-and-kashmir",
    slug: "jammu-and-kashmir",
    name: "Jammu and Kashmir",
    type: "union_territory",
    region: "Northern",
    capital: "Srinagar (Summer) / Jammu (Winter)",
    highCourt: {
      name: "High Court of Jammu & Kashmir and Ladakh",
      principalSeat: "Srinagar & Jammu",
      benches: [],
      jurisdiction: "Union Territories of Jammu and Kashmir, and Ladakh",
      establishedYear: 1928,
      officialPortal: "https://jkhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "The High Court of Jammu & Kashmir and Ladakh operates with rotating summer and winter principal seats at Srinagar and Jammu. Following the J&K Reorganisation Act 2019, central statutory enactments including the Central Motor Vehicles Act, IPC/BNS, and commercial laws apply in full. Subordinate courts in 20 districts handle civil property suits, land acquisition, criminal trials, and constitutional writs.",
    districts: [
      "Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal",
      "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama",
      "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"
    ],
    majorCities: [
      { name: "Srinagar", slug: "srinagar", desc: "Summer judicial seat, High Court complex at Mominabad, District Courts." },
      { name: "Jammu", slug: "jammu", desc: "Winter judicial seat, High Court complex at Janipur, District Courts." },
      { name: "Anantnag", slug: "anantnag", desc: "Southern Kashmir commercial and judicial center." },
      { name: "Baramulla", slug: "baramulla", desc: "Northern Kashmir commercial center with District & Sessions Courts." }
    ],
    faqs: [
      {
        q: "How does the rotating bench system function for J&K High Court?",
        a: "The High Court operates two full wings at Srinagar and Jammu simultaneously, with judges hearing cases year-round at both wings."
      }
    ],
    nearbyStates: ["ladakh", "himachal-pradesh", "punjab"]
  },
  {
    id: "ladakh",
    slug: "ladakh",
    name: "Ladakh",
    type: "union_territory",
    region: "Northern",
    capital: "Leh",
    highCourt: {
      name: "High Court of Jammu & Kashmir and Ladakh",
      principalSeat: "Srinagar & Jammu",
      benches: ["Leh (Virtual/Circuit)"],
      jurisdiction: "Union Territory of Ladakh",
      establishedYear: 2019,
      officialPortal: "https://jkhighcourt.nic.in",
      circuitBenches: ["Leh", "Kargil"]
    },
    overview: "Ladakh is governed by the common High Court of Jammu & Kashmir and Ladakh, which conducts regular virtual and physical circuit hearings at Leh and Kargil. The UT has two judicial districts: Leh and Kargil. Legal matters center on land title verifications, tourism regulations, wildlife and environmental preservation, and border contract disputes.",
    districts: ["Leh", "Kargil"],
    majorCities: [
      { name: "Leh", slug: "leh", desc: "Capital of Ladakh, Principal District and Sessions Court, High Court circuit hearings." },
      { name: "Kargil", slug: "kargil", desc: "District and Sessions Court of Kargil, consumer forums." }
    ],
    faqs: [
      {
        q: "Which High Court has jurisdiction over Ladakh?",
        a: "The High Court of Jammu & Kashmir and Ladakh exercises full constitutional and appellate jurisdiction over Ladakh."
      }
    ],
    nearbyStates: ["jammu-and-kashmir", "himachal-pradesh"]
  },
  {
    id: "puducherry",
    slug: "puducherry",
    name: "Puducherry",
    type: "union_territory",
    region: "Southern",
    capital: "Puducherry",
    highCourt: {
      name: "High Court of Judicature at Madras",
      principalSeat: "Chennai",
      benches: [],
      jurisdiction: "Union Territory of Puducherry under Madras High Court",
      establishedYear: 1962,
      officialPortal: "https://hcmadras.tn.gov.in",
      circuitBenches: []
    },
    overview: "The Union Territory of Puducherry falls under the appellate and constitutional jurisdiction of the Madras High Court. Subordinate trial courts operate across its 4 geographically separated enclaves: Puducherry, Karaikal, Mahe, and Yanam. Matters include coastal property titles, French civil heritage partitions, tourism licensing, and commercial consumer claims.",
    districts: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    majorCities: [
      { name: "Puducherry", slug: "puducherry", desc: "UT capital, Integrated Judicial Court Complex, consumer forums." },
      { name: "Karaikal", slug: "karaikal", desc: "Port and commercial enclave with District Court division." }
    ],
    faqs: [
      {
        q: "Which High Court oversees Puducherry?",
        a: "The Madras High Court in Chennai has jurisdiction over the Union Territory of Puducherry."
      }
    ],
    nearbyStates: ["tamil-nadu", "kerala", "andhra-pradesh"]
  },
  {
    id: "andaman-and-nicobar-islands",
    slug: "andaman-and-nicobar-islands",
    name: "Andaman and Nicobar Islands",
    type: "union_territory",
    region: "Eastern",
    capital: "Port Blair",
    highCourt: {
      name: "High Court at Calcutta (Circuit Bench at Port Blair)",
      principalSeat: "Kolkata (Principal Seat)",
      benches: ["Port Blair (Circuit)"],
      jurisdiction: "UT of Andaman and Nicobar Islands under Calcutta High Court",
      establishedYear: 1954,
      officialPortal: "https://calcuttahighcourt.gov.in",
      circuitBenches: ["Port Blair"]
    },
    overview: "The Union Territory of Andaman and Nicobar Islands falls under the jurisdiction of the Calcutta High Court, which operates a permanent Circuit Bench at Port Blair. Subordinate courts in 3 districts handle maritime law, tribal reserve protection under the A&N Protection of Aboriginal Tribes Regulation, environmental CRZ disputes, and tourism lease agreements.",
    districts: [
      "Nicobar", "North and Middle Andaman (Mayabunder)", "South Andaman (Port Blair)"
    ],
    majorCities: [
      { name: "Port Blair", slug: "port-blair", desc: "Capital city, Calcutta High Court Circuit Bench, District & Sessions Court." }
    ],
    faqs: [
      {
        q: "Where is the High Court Circuit Bench located in Andaman?",
        a: "The Circuit Bench of the Calcutta High Court sits at Port Blair, hearing matters throughout the judicial calendar."
      }
    ],
    nearbyStates: ["west-bengal"]
  },
  {
    id: "dadra-and-nagar-haveli-and-daman-and-diu",
    slug: "dadra-and-nagar-haveli-and-daman-and-diu",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "union_territory",
    region: "Western",
    capital: "Daman",
    highCourt: {
      name: "High Court of Judicature at Bombay",
      principalSeat: "Mumbai",
      benches: [],
      jurisdiction: "Under Bombay High Court jurisdiction",
      establishedYear: 1961,
      officialPortal: "https://bombayhighcourt.nic.in",
      circuitBenches: []
    },
    overview: "This merged Union Territory comes under the jurisdiction of the Bombay High Court in Mumbai. District and Sessions Courts in Daman, Diu, and Silvassa handle industrial manufacturing contracts, tax incentive compliance, customs at coastal ports, and land revenue suits.",
    districts: ["Dadra and Nagar Haveli (Silvassa)", "Daman", "Diu"],
    majorCities: [
      { name: "Silvassa", slug: "silvassa", desc: "Industrial center with District & Sessions Courts." },
      { name: "Daman", slug: "daman", desc: "UT capital, District Courts, and coastal commercial litigation." },
      { name: "Diu", slug: "diu", desc: "Coastal heritage center with civil courts." }
    ],
    faqs: [
      {
        q: "Which High Court exercises jurisdiction over Daman and Diu?",
        a: "The Bombay High Court in Mumbai has judicial jurisdiction over Dadra and Nagar Haveli and Daman and Diu."
      }
    ],
    nearbyStates: ["gujarat", "maharashtra"]
  },
  {
    id: "lakshadweep",
    slug: "lakshadweep",
    name: "Lakshadweep",
    type: "union_territory",
    region: "Southern",
    capital: "Kavaratti",
    highCourt: {
      name: "High Court of Kerala",
      principalSeat: "Kochi (Ernakulam)",
      benches: [],
      jurisdiction: "Union Territory of Lakshadweep under Kerala High Court",
      establishedYear: 1956,
      officialPortal: "https://highcourtofkerala.nic.in",
      circuitBenches: []
    },
    overview: "The Union Territory of Lakshadweep is situated in the Arabian Sea and falls under the judicial superintendence of the High Court of Kerala at Ernakulam. The single district of Lakshadweep has judicial magistrate courts on key islands like Kavaratti and Amini. Practice areas center on customary islander land tenures, environmental preservation of atolls, and maritime fishing regulations.",
    districts: ["Lakshadweep (Kavaratti)"],
    majorCities: [
      { name: "Kavaratti", slug: "kavaratti", desc: "Capital of Lakshadweep, District Court, consumer forums." }
    ],
    faqs: [
      {
        q: "Where are appeals from Lakshadweep courts filed?",
        a: "Appeals from Lakshadweep District Courts are heard by the High Court of Kerala in Ernakulam."
      }
    ],
    nearbyStates: ["kerala"]
  }
];

// Helper functions for easy lookup
export function getAllStates() {
  return STATES_AND_UTS.filter((loc) => loc.type === "state");
}

export function getAllUnionTerritories() {
  return STATES_AND_UTS.filter((loc) => loc.type === "union_territory");
}

export function getAllLocations() {
  return STATES_AND_UTS;
}

export function getLocationBySlug(slug) {
  if (!slug) return null;
  const clean = slug.toLowerCase().replace(/^advocate-lawyer-/, "").replace(/^lawyers-in-/, "");
  return STATES_AND_UTS.find((loc) => loc.slug === clean || loc.id === clean) || null;
}

export function getMajorCities() {
  return MAJOR_CITIES_DIRECTORY;
}

export function searchLocations(query) {
  if (!query || !query.trim()) return STATES_AND_UTS;
  const q = query.trim().toLowerCase();
  return STATES_AND_UTS.filter((loc) =>
    loc.name.toLowerCase().includes(q) ||
    loc.capital.toLowerCase().includes(q) ||
    loc.highCourt.name.toLowerCase().includes(q) ||
    loc.districts.some((d) => d.toLowerCase().includes(q)) ||
    loc.majorCities.some((c) => c.name.toLowerCase().includes(q))
  );
}
