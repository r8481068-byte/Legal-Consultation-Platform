/**
 * LegalConnect Original Legal Education Articles & Guides Data
 * Reusable across /blogs and /blogs/:articleSlug
 */

export const BLOG_CATEGORIES = [
  "All",
  "Property Law",
  "Criminal Law",
  "Family Law",
  "Corporate & Business",
  "Cyber Crime",
  "Labour & Employment",
  "Consumer Protection"
];

export const BLOG_POSTS = [
  {
    slug: "property-title-verification-guide-india",
    title: "Complete Guide to Property Title Verification and Due Diligence in India",
    category: "Property Law",
    readTime: "7 min read",
    publishedDate: "October 2025",
    author: "Advocate Rajesh Verma (Senior Property Counsel)",
    summary: "Essential checklist of 30-year parent document chains, encumbrance certificates, RERA approvals, and municipal revenue searches before buying real estate.",
    content: `
### Why Title Verification is Crucial Before Purchasing Real Estate
In India, real estate transactions are governed by the principle of *caveat emptor* (buyer beware). Unlike systems with state-guaranteed titles, Indian property records are presumptive in nature. Therefore, comprehensive legal due diligence is the only safeguard against purchasing disputed ancestral land, mortgaged apartments, or properties subject to pending court injunctions.

### The 30-Year Chain of Title Documents
A thorough title search requires examining registered deeds over a continuous 30-year period to establish an unbroken chain of ownership:
1. **Parent Title Deeds:** Original Sale Deeds, Gift Deeds, Conveyance Deeds, or Partition Deeds proving how earlier owners acquired the property.
2. **Revenue Mutation Records:** Jamabandi, Patta, Khata certificate, or 7/12 extract confirming the current seller's name in state land revenue records.
3. **Sub-Registrar Encumbrance Certificate (EC):** Form 15 non-encumbrance certificate showing whether the property is subject to registered mortgages or court attachments.

### Essential Checklist for Apartment and Commercial Buyers
- **RERA Project Registration:** Verify the unique RERA registration number and approved sanction plans on the official State RERA portal.
- **Occupancy Certificate (OC) & Completion Certificate (CC):** Ensure the municipal corporation has issued an unconditional OC confirming adherence to fire and building safety norms.
- **No-Objection Certificates (NOCs):** Verify clearances from Airport Authority, Fire Department, and State Pollution Control Board for large developments.

### What to Do If Title Defects Are Discovered
If undisclosed legal heirs, bank mortgages, or demarcation discrepancies emerge, your property advocate can issue a formal requisition on title to the seller. If unresolved, the advance earnest money should be recovered pursuant to the terms of the Agreement to Sell.
    `,
    keyTakeaways: [
      "Always conduct a minimum 30-year search at the Sub-Registrar's office.",
      "Check State RERA portal for litigations or possession delay complaints.",
      "Never take possession or execute a Sale Deed without an Occupancy Certificate (OC)."
    ],
    relatedSpecialization: "Property Law"
  },
  {
    slug: "understanding-anticipatory-bail-bns-crpc",
    title: "Understanding Anticipatory Bail: Rights and Procedures under Indian Criminal Law",
    category: "Criminal Law",
    readTime: "6 min read",
    publishedDate: "October 2025",
    author: "Advocate S. K. Mahapatra (Criminal Defense Counsel)",
    summary: "How individuals can protect their personal liberty under Article 21 when facing apprehension of arrest in non-bailable criminal allegations.",
    content: `
### Constitutional Liberty and Anticipatory Bail
Article 21 of the Constitution of India guarantees that no person shall be deprived of their life or personal liberty except according to procedure established by law. Anticipatory bail acts as a vital judicial safeguard against frivolous, politically motivated, or matrimonial complaints designed to cause public humiliation.

### Grounds Considered by Sessions Courts and High Courts
When adjudicating an anticipatory bail application under Section 438 of CrPC (and corresponding provisions of Bharatiya Nagarik Suraksha Sanhita), courts assess:
- **Nature and Gravity of the Accusation:** Severity of the alleged offense and statutory minimum punishments.
- **Role Specifically Attributed to the Applicant:** Vague omnibus allegations versus specific overt acts.
- **Flight Risk and Tampering Potential:** Likelihood of the accused fleeing the country or influencing prosecution witnesses.
- **Past Criminal Record:** Absence of prior criminal antecedents weighs strongly in favor of grant of pre-arrest protection.

### Procedural Sequence in Anticipatory Bail
1. **Urgent Drafting:** Preparation of bail petition detailing the background, documentary contradictions in the complaint, and willingness to join investigation.
2. **Interim Protection / Notice:** Hearing before the Sessions Judge or High Court where interim protection from arrest is argued pending verification by the State.
3. **Conditions Imposed by Court:** Accused must make themselves available for interrogation, surrender passport, and not contact the complainant.

### What to Do Upon Receipt of a Section 41A Notice
Do not evade police summons. Evading a Section 41A notice provides grounds for the investigating officer to seek an arrest warrant. Attend the police station accompanied by your defense counsel with verified identity proof.
    `,
    keyTakeaways: [
      "Anticipatory bail can only be sought before arrest, not after physical detention.",
      "Sessions Court and High Court hold concurrent jurisdiction.",
      "Compliance with bail conditions and investigative cooperation is mandatory."
    ],
    relatedSpecialization: "Criminal Law"
  },
  {
    slug: "mutual-consent-divorce-fast-track-process",
    title: "Mutual Consent Divorce in India: Steps, Cooling Period Waiver, and Financial Settlement",
    category: "Family Law",
    readTime: "8 min read",
    publishedDate: "September 2025",
    author: "Advocate Meenakshi Sundaram (Family Court Mediator)",
    summary: "Step-by-step walkthrough of Section 13B mutual divorce proceedings, Memorandum of Understanding (MOU) drafting, and cooling-off waiver guidelines.",
    content: `
### The Dignified Path: Section 13B of the Hindu Marriage Act
Mutual consent divorce offers a civilized, confidential, and time-saving route for spouses who recognize that their marriage has irretrievably broken down. Governed by Section 13B of the Hindu Marriage Act (and Section 28 of the Special Marriage Act), it eliminates contentious fault-finding and allows parties to exit with mutual respect.

### Three Pillars of an Enforceable Settlement (MOU)
Before filing the joint petition, both parties must execute a legally binding Memorandum of Understanding (MOU) addressing:
1. **Permanent Alimony & Maintenance:** Lumpsum settlement or structured payments extinguishing all future financial claims between spouses.
2. **Child Custody and Visitation Schedules:** Joint parenting plans, vacation visitations, and contribution towards education/medical expenses.
3. **Return of Stridhan and Joint Assets:** Complete handover of jewelry, wedding gifts, and division of jointly held real estate or bank deposits.

### First Motion and Second Motion Explained
- **First Motion:** Spouses jointly present the petition before the Family Court. Statements are recorded on oath, and original marriage proof is exhibited.
- **Statutory Cooling Period Waiver:** While Section 13B(2) prescribes a 6-month wait between motions, the Supreme Court in *Amardeep Singh v. Harveen Kaur* established that trial courts can waive this period if parties have lived apart for over a year and settled all claims.
- **Second Motion & Final Decree:** Final affirmations recorded, followed by the formal judicial decree dissolving the marital bond.
    `,
    keyTakeaways: [
      "Spouses must have lived separately for a minimum continuous period of 1 year.",
      "A comprehensive written MOU prevents future disputes or litigation.",
      "Cooling period waiver applications can conclude proceedings within 3 to 4 weeks."
    ],
    relatedSpecialization: "Family Law"
  },
  {
    slug: "founders-agreement-essential-clauses-startups",
    title: "Founders' Agreement: 6 Essential Clauses Every Indian Startup Must Include",
    category: "Corporate & Business",
    readTime: "5 min read",
    publishedDate: "September 2025",
    author: "Advocate Ananya Deshmukh (Venture & Corporate Legal Advisory)",
    summary: "How early-stage co-founders can protect equity, intellectual property, and governance before onboarding angel investors or institutional venture capital.",
    content: `
### Why Co-Founder Disputes Derail Early-Stage Startups
Over 60% of early-stage startups falter not due to market failure, but due to internal co-founder friction regarding equity division, decision-making, and full-time commitment. A robust Founders' Agreement sets clear governance rules while the company is still young.

### The 6 Non-Negotiable Contractual Clauses
1. **Equity Vesting and Reverse Vesting:** Never grant 100% of shares upfront. A standard 4-year vesting schedule with a 1-year cliff ensures that a founder who departs early only keeps earned equity.
2. **Intellectual Property (IP) Assignment:** All source code, product designs, domain names, and trademarks must belong exclusively to the corporate entity, not individual founders.
3. **Roles and Operational Commitments:** Clear delineation of responsibilities (CEO, CTO, COO) and commitment to exclusive full-time engagement.
4. **Reserved Matters and Board Vetoes:** Specific high-impact decisions (fundraising, taking debt, selling assets, hiring executives) requiring unanimous founder consent.
5. **Right of First Refusal (ROFR) and Tag-Along Rights:** Preventing an estranged co-founder from transferring shares to unauthorized third parties or competitors.
6. **Dispute Resolution through Mediation:** Confidential mediation mechanisms preventing damaging public litigation that scares prospective investors.
    `,
    keyTakeaways: [
      "Adopt a 4-year vesting schedule with a 1-year cliff.",
      "Execute strict IP assignment deeds transferring all assets to the private limited company.",
      "Incorporate clear ROFR clauses to prevent unauthorized third-party share transfers."
    ],
    relatedSpecialization: "Corporate Law"
  },
  {
    slug: "online-banking-fraud-legal-recourse-india",
    title: "Victim of Online Banking or UPI Fraud? Steps to Recover Funds and File Cyber Complaints",
    category: "Cyber Crime",
    readTime: "6 min read",
    publishedDate: "August 2025",
    author: "Advocate T. R. Venkatesh (Cyber Crime & IT Law Specialist)",
    summary: "Immediate actions within the 'Golden Hour', reporting to the 1930 helpline, RBI zero-liability guidelines, and court remedies for de-freezing bank accounts.",
    content: `
### The Digital Fraud Crisis in India
Phishing links, fake customer care numbers, APK file scams, and unauthorized UPI transactions account for thousands of cybercrime complaints daily. Acting within the first few hours is the single most critical factor in recovering stolen funds before fraudsters cash out through mule accounts.

### The 'Golden Hour' Response Protocol
1. **Call 1930 Immediately:** The National Cyber Crime Reporting Portal helpline (1930) operates in real-time coordination with major banks. Immediate reporting enables the system to trigger automated holds on recipient beneficiary accounts.
2. **Notify Your Bank in Writing:** Under RBI's Master Directions on Customer Protection, if a customer reports unauthorized electronic transactions within 3 working days where the deficiency lies in the system or third party, the customer's liability is **Zero**.
3. **Register Formal Complaint at cybercrime.gov.in:** Upload unedited SMS alerts, transaction UTR numbers, UPI IDs, and call logs to generate an official Cyber Incident Acknowledgement Number.

### Dealing with Unintended Bank Account Freezes
Legitimate merchants and P2P crypto traders often find their personal accounts frozen because a fraudster layered stolen funds through multiple accounts. If your account is frozen under Section 102 CrPC, your cyber advocate can:
- Obtain the Police Case Diary reference from your bank branch.
- Submit legitimate commercial invoices, tax returns, and KYC documents to the investigating Cyber Crime Cell.
- File a petition before the jurisdictional Magistrate or High Court for de-freezing operating funds.
    `,
    keyTakeaways: [
      "Call 1930 within the first 2 hours of the fraudulent transaction.",
      "Notify your bank in writing to invoke RBI zero customer liability guidelines.",
      "Preserve original uncompressed screenshots, SMS alerts, and transaction UTR numbers."
    ],
    relatedSpecialization: "Cyber Law"
  },
  {
    slug: "cheque-bounce-section-138-notice-timeline",
    title: "Section 138 NI Act: Timelines, Statutory Legal Notice, and Cheque Bounce Procedure",
    category: "Corporate & Business",
    readTime: "7 min read",
    publishedDate: "August 2025",
    author: "Advocate Rajesh Verma (Senior Commercial Counsel)",
    summary: "Strict statutory deadlines under Section 138 of the Negotiable Instruments Act: 30-day notice window, 15-day payment period, and filing complaint.",
    content: `
### The Quasi-Criminal Nature of Section 138 Proceedings
Under Section 138 of the Negotiable Instruments Act, 1881, the dishonor of a cheque drawn for the discharge of a legally enforceable debt or liability is a punishable criminal offense. It carries a penalty of imprisonment up to 2 years, or a fine up to twice the cheque amount, or both.

### Critical Statutory Deadlines That Cannot Be Missed
Strict adherence to statutory limitation periods is mandatory. A single day's delay can result in dismissal of the complaint:
1. **Cheque Presentation:** The cheque must be presented to the bank within its validity period (3 months from the date of the cheque).
2. **Bank Return Memo:** The bank issues a return memo citing reasons such as "Funds Insufficient", "Account Closed", or "Payment Stopped by Drawer".
3. **Statutory Demand Notice within 30 Days:** The payee must dispatch a formal legal notice in writing to the drawer within **30 days** of receiving the return memo.
4. **15-Day Cure Period:** The drawer is granted exactly **15 days** from the date of receipt of the legal notice to settle the unpaid amount.
5. **Filing Complaint within 30 Days:** If the drawer fails to pay within 15 days, the payee must file a formal criminal complaint before the Metropolitan Magistrate or Judicial Magistrate First Class within **30 days** thereafter.

### Interim Compensation under Section 143A
Under Section 143A of the NI Act, the Magistrate Court possesses the statutory power to order the drawer to deposit interim compensation up to **20% of the cheque amount** to the complainant during the pendency of the trial.
    `,
    keyTakeaways: [
      "Statutory demand notice must be dispatched within 30 days of the bank return memo.",
      "Drawer has 15 days from notice receipt to clear the outstanding debt.",
      "Courts can award up to 20% interim compensation under Section 143A."
    ],
    relatedSpecialization: "Corporate Law"
  }
];

export function getBlogPostBySlug(slug) {
  if (!slug) return null;
  return BLOG_POSTS.find((p) => p.slug.toLowerCase() === slug.toLowerCase()) || null;
}
