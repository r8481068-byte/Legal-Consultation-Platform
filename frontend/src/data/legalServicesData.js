/**
 * LegalConnect Centralized Legal Services Directory Data
 * Reusable across Header navigation, Homepage, Service Catalog (/legal-services),
 * and Category Detail pages (/legal-services/:categorySlug).
 */

export const LEGAL_SERVICES = [
  {
    slug: "property-law",
    title: "Property and Real Estate Law",
    shortTitle: "Property Law",
    specialization: "Property Law",
    iconName: "Home",
    summary: "Comprehensive legal assistance for real estate purchases, title verification, registry disputes, and ancestral land partitions.",
    fullDescription: "Property and real estate disputes require thorough examination of revenue records, municipal sanctions, and statutory titles. LegalConnect enables property owners, buyers, and developers to consult experienced property advocates for title search due diligence, builder delay complaints before RERA, demarcation challenges, and ancestral partition suits.",
    statutoryFramework: [
      "Transfer of Property Act, 1882",
      "Real Estate (Regulation and Development) Act (RERA), 2016",
      "Registration Act, 1908 & Indian Stamp Act, 1899",
      "Specific Relief Act, 1963"
    ],
    commonIssues: [
      "Title verification and legal search report before purchase",
      "Builder possession delay and penalty refund under RERA",
      "Partition suits and ancestral property inheritance shares",
      "Illegal possession, boundary encroachment, and injunctions",
      "Registry, mutation, GPA sale disputes, and stamp duty issues"
    ],
    lawyerAssistance: [
      "Conduct 30-year title searches across Sub-Registrar and revenue offices",
      "Draft and review Sale Deeds, Agreement to Sell, Gift Deeds, and Relinquishment Deeds",
      "File complaints before State Real Estate Regulatory Authorities (RERA)",
      "Institute civil suits for declaration of title, partition, or permanent injunction",
      "Issue statutory legal notices to defaulting builders or encroachers"
    ],
    processSteps: [
      { step: 1, title: "Document Review", desc: "Share title deeds, parent documents, or builder buyer agreements with your advocate." },
      { step: 2, title: "Title Due Diligence", desc: "Advocate verifies encumbrances, municipal sanctions, and legal ownership chain." },
      { step: 3, title: "Legal Strategy & Notice", desc: "Issuance of statutory notice or drafting petition for court/RERA filing." },
      { step: 4, title: "Resolution & Filing", desc: "Court representation or mutual settlement drafting with complete documentation." }
    ],
    checklistDocuments: [
      "Title Deed / Conveyance Deed / Sale Deed",
      "Parent document chain (previous 30 years ownership records)",
      "Mutation extract / Jamabandi / Khata certificate",
      "Builder Buyer Agreement (BBA) and payment receipts (for RERA matters)",
      "Property tax receipts and Non-Encumbrance Certificate (NEC)"
    ],
    faqs: [
      {
        q: "Why is a title search report necessary before buying land or an apartment?",
        a: "A title search report verifies whether the seller holds clear and marketable title, verifies absence of court injunctions, mortgages, or bank encumbrances, and ensures the property is free from undisclosed legal heirs."
      },
      {
        q: "What relief can I seek if a builder delays possession beyond the promised date?",
        a: "Under Section 18 of RERA, 2016, buyers can either seek a full refund of money paid along with prescribed statutory interest, or demand monthly delay interest until physical possession with an Occupancy Certificate (OC) is handed over."
      },
      {
        q: "Can daughters claim an equal share in ancestral property?",
        a: "Yes. Following the landmark Supreme Court ruling in Vineeta Sharma v. Rakesh Sharma (2020), daughters have equal coparcenary rights by birth in ancestral property under the Hindu Succession Act, regardless of whether the father was alive in 2005."
      }
    ]
  },
  {
    slug: "criminal-law",
    title: "Criminal Law and Defense",
    shortTitle: "Criminal Law",
    specialization: "Criminal Law",
    iconName: "Gavel",
    summary: "Defense counsel for criminal complaints, anticipatory and regular bail hearings, FIR quashing under Sec 482, and court trials.",
    fullDescription: "Criminal litigation demands immediate legal intervention to protect fundamental personal liberties guaranteed under Article 21 of the Indian Constitution. LegalConnect connects individuals facing police complaints, investigation summons, or criminal charges with qualified criminal defense advocates experienced in bail jurisprudence, trial advocacy, and high court writ jurisdiction.",
    statutoryFramework: [
      "Bharatiya Nyaya Sanhita (BNS), 2023 / Indian Penal Code (IPC), 1860",
      "Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 / Code of Criminal Procedure (CrPC), 1973",
      "Bharatiya Sakshya Adhiniyam (BSA), 2023 / Indian Evidence Act, 1872",
      "Negotiable Instruments Act (Section 138), 1881"
    ],
    commonIssues: [
      "Anticipatory bail applications before Sessions Court and High Court",
      "Regular bail after arrest and remand proceedings",
      "FIR quashing petitions under Section 482 CrPC / Section 528 BNSS",
      "Police summons, Section 41A CrPC notices, and interrogation safeguards",
      "Defense in cross-cases, cheating, defamation, and corporate white-collar crimes"
    ],
    lawyerAssistance: [
      "Draft and argue anticipatory and regular bail petitions with urgency",
      "Challenge unlawful detention, illegal remand, or procedural non-compliance",
      "Draft comprehensive Section 482 petitions for quashing malicious FIRs",
      "Represent accused or complainant during police investigation and trial hearings",
      "Cross-examine prosecution witnesses and formulate defense evidence"
    ],
    processSteps: [
      { step: 1, title: "FIR & Case Assessment", desc: "Analyze the FIR or complaint copy to identify applicable sections and cognizable nature." },
      { step: 2, title: "Urgent Liberty Protection", desc: "Draft and file for anticipatory bail or interim stay against coercive steps." },
      { step: 3, title: "Investigation Guidance", desc: "Prepare written responses to investigation officers under Section 41A notices." },
      { step: 4, title: "Trial & Arguments", desc: "Formulate defense strategy, file discharge petition, or cross-examine witnesses." }
    ],
    checklistDocuments: [
      "Copy of FIR (First Information Report) or police complaint",
      "Police summons or Section 41A CrPC notice, if served",
      "Remand application or order sheet from Magistrate Court (if in custody)",
      "Identity and address proofs of accused and local sureties (for bail)",
      "Supporting exculpatory evidence (call records, CCTV receipts, emails)"
    ],
    faqs: [
      {
        q: "What is the difference between Anticipatory Bail and Regular Bail?",
        a: "Anticipatory bail is sought before an arrest when a person has reasonable apprehension of being arrested in a non-bailable offense. Regular bail is applied for after a person has already been taken into police or judicial custody."
      },
      {
        q: "Can an FIR be quashed if both parties mutually resolve their dispute?",
        a: "Yes. For matrimonial disputes, commercial misunderstandings, or compoundable offenses, High Courts under Section 482 CrPC / Section 528 BNSS routinely quash FIRs upon filing of joint settlement affidavits."
      },
      {
        q: "What rights do I have when summoned by the police?",
        a: "Under Section 41A of CrPC (and BNSS provisions), police cannot arbitrarily arrest a person where the offense carries up to 7 years imprisonment without recording reasons in writing. You have the right to consult your advocate and present genuine documents."
      }
    ]
  },
  {
    slug: "civil-law",
    title: "Civil Law and Dispute Resolution",
    shortTitle: "Civil Litigation",
    specialization: "Civil Litigation",
    iconName: "Scale",
    summary: "Litigation representation for financial recovery, property injunctions, contractual breach damages, and money suits.",
    fullDescription: "Civil law governs private rights, commercial remedies, property entitlements, and contractual duties. Whether you need to recover outstanding dues from a business debtor, prevent unlawful dispossession through a temporary injunction, or claim damages for breached covenants, LegalConnect advocates provide tactical advice and representation before Civil Courts and Appellate Benches.",
    statutoryFramework: [
      "Code of Civil Procedure (CPC), 1908",
      "Indian Contract Act, 1872",
      "Commercial Courts Act, 2015",
      "Arbitration and Conciliation Act, 1996"
    ],
    commonIssues: [
      "Money recovery suits under Order 37 summary procedure",
      "Temporary and permanent injunction suits under Order 39 CPC",
      "Breach of contract, liquidated damages, and specific performance",
      "Execution petitions to enforce decree and court orders",
      "Commercial disputes and pre-institution mediation proceedings"
    ],
    lawyerAssistance: [
      "Draft and serve formal statutory demand notices for debt recovery",
      "File plaint, written statements, and preliminary applications under CPC",
      "Seek emergency interim stay orders and status quo directives",
      "Represent parties before Commercial Courts and Lok Adalats",
      "Conduct cross-examination, exhibit documentary evidence, and argue final suits"
    ],
    processSteps: [
      { step: 1, title: "Statutory Legal Notice", desc: "Issue 15 to 30 day demand notice outlining actionable breach and financial liability." },
      { step: 2, title: "Plaint Filing", desc: "File civil suit with verified statement of truth and required court fee stamps." },
      { step: 3, title: "Interim Hearing", desc: "Argue application for urgent temporary injunction or security deposit." },
      { step: 4, title: "Trial & Decree", desc: "Evidence recording, witness examination, judicial decree, and execution." }
    ],
    checklistDocuments: [
      "Signed agreements, purchase orders, invoices, or delivery challans",
      "Bank statements showing disputed transactions or ledger accounts",
      "Proof of written communication (emails, WhatsApp, demand notices)",
      "Proof of damages suffered or loss incurred due to breach",
      "Postal tracking receipts proving delivery of prior notices"
    ],
    faqs: [
      {
        q: "What is an Order 37 Summary Suit?",
        a: "Order 37 of the CPC provides an expedited legal mechanism to recover debts arising from written contracts, bills of exchange, hundies, or promissory notes where the defendant must obtain judicial leave to defend."
      },
      {
        q: "What is the time limitation period for filing a money recovery suit in India?",
        a: "Under the Limitation Act, 1963, a money suit must generally be filed within 3 years from the date the debt became due or from the date of the last written acknowledgment of liability or partial payment."
      }
    ]
  },
  {
    slug: "family-law",
    title: "Family and Matrimonial Law",
    shortTitle: "Family Law",
    specialization: "Family Law",
    iconName: "Heart",
    summary: "Holistic counsel for domestic disputes, child custody, guardianship matters, maintenance petitions, and family settlements.",
    fullDescription: "Matrimonial disputes and family affairs require delicate negotiation paired with decisive legal knowledge. LegalConnect connects clients with compassionate family lawyers who prioritize child welfare, equitable maintenance, mediation, and amicable dispute resolution before Family Courts.",
    statutoryFramework: [
      "Hindu Marriage Act, 1955 & Special Marriage Act, 1954",
      "Protection of Women from Domestic Violence Act (PWDVA), 2005",
      "Guardians and Wards Act, 1890 & Hindu Minority and Guardianship Act, 1956",
      "Code of Criminal Procedure (Section 125) / BNSS Maintenance Provisions"
    ],
    commonIssues: [
      "Interim and permanent maintenance petitions for spouse and children",
      "Child custody, visitation rights, and international relocation disputes",
      "Domestic violence protection orders, residence rights, and monetary compensation",
      "Restitution of Conjugal Rights (RCR under Section 9)",
      "Family settlement agreements and partition of joint family property"
    ],
    lawyerAssistance: [
      "Mediate amicable settlement deeds protecting assets and parental rights",
      "File and contest maintenance petitions under Section 125 CrPC and Section 24 HMA",
      "Draft comprehensive child custody schedules and visitation agreements",
      "Represent clients before Family Court counsellors and mediation cells",
      "Secure emergency restraining orders under the Domestic Violence Act"
    ],
    processSteps: [
      { step: 1, title: "Counseling & Evaluation", desc: "Understand family dynamics, financial standing, and welfare of children." },
      { step: 2, title: "Mediation Exploration", desc: "Examine whether amicable conciliation or mutual terms can be achieved." },
      { step: 3, title: "Petition Filing", desc: "Institute petition before the jurisdictional Family Court with supporting affidavits." },
      { step: 4, title: "Interim Relief & Orders", desc: "Argue for immediate interim maintenance or urgent visitation arrangements." }
    ],
    checklistDocuments: [
      "Marriage certificate, wedding card, or photographic proof of marriage",
      "Birth certificates of minor children",
      "Income tax returns, salary slips, and bank statements of both spouses (for maintenance)",
      "Detail of stridhan, shared household, or jointly purchased assets",
      "Prior police complaints, medical records, or domestic incident reports (if any)"
    ],
    faqs: [
      {
        q: "How does the court decide child custody in India?",
        a: "The supreme consideration in custody disputes is the 'welfare and best interests of the child'. Courts evaluate emotional bond, educational continuity, financial capability, ethical environment, and child's preference if of sufficient age."
      },
      {
        q: "Can a working wife claim maintenance under Indian law?",
        a: "Yes. Courts have held that even if a wife is employed, she is entitled to maintenance if her individual earnings are insufficient to maintain the standard of living she enjoyed in the matrimonial home."
      }
    ]
  },
  {
    slug: "divorce-law",
    title: "Divorce and Separation Proceedings",
    shortTitle: "Divorce Law",
    specialization: "Family Law",
    iconName: "Users",
    summary: "Specialized advocacy for mutual consent divorce under Section 13B, contested divorce, annulment, and separation proceedings.",
    fullDescription: "Divorce proceedings determine crucial aspects of life, including alimony, asset division, and child custody. LegalConnect connects spouses with dedicated advocates skilled in mutual consent procedures (Section 13B) for fast-track dissolution, as well as contested divorce proceedings founded on statutory grounds such as cruelty, desertion, or adultery.",
    statutoryFramework: [
      "Hindu Marriage Act, 1955 (Sections 13 & 13B)",
      "Special Marriage Act, 1954 (Section 28)",
      "Indian Christian Marriage Act & Divorce Act, 1869",
      "Dissolution of Muslim Marriages Act, 1939"
    ],
    commonIssues: [
      "Mutual Consent Divorce under Section 13B with waiver of 6-month cooling period",
      "Contested divorce based on cruelty, desertion, mental illness, or adultery",
      "Permanent alimony settlement and return of stridhan articles",
      "Marriage annulment on grounds of non-consummation, fraud, or force",
      "Judicial separation petitions under Section 10 HMA"
    ],
    lawyerAssistance: [
      "Draft comprehensive Mutual Divorce Settlement Memorandum (MOU)",
      "File First Motion and Second Motion petitions before Family Court",
      "Draft Section 13B(2) waiver application citing Supreme Court guidelines",
      "Defend or prosecute contested divorce petitions with documentary evidence",
      "Ensure clean break settlements avoiding future litigation"
    ],
    processSteps: [
      { step: 1, title: "Mutual Terms Drafting", desc: "Formulate final terms for alimony, custody, and asset distribution in written MOU." },
      { step: 2, title: "First Motion Filing", desc: "Joint petition filed and statements recorded before Family Court judge." },
      { step: 3, title: "Waiver or Cooling Period", desc: "Application for statutory 6-month period waiver (Amardeep Singh guidelines)." },
      { step: 4, title: "Second Motion & Decree", desc: "Final statements recorded and formal Decree of Divorce issued by court." }
    ],
    checklistDocuments: [
      "Marriage Certificate / Wedding Card / Photographs",
      "ID and address proof of both spouses",
      "Proof of separate living for at least 1 year (for mutual consent)",
      "Comprehensive written settlement deed covering alimony and child custody",
      "Asset title deeds and bank details for mutual transfer"
    ],
    faqs: [
      {
        q: "How fast can a mutual consent divorce be granted?",
        a: "If parties have been living separately for over a year and have settled all claims, the court can waive the 6-month cooling period under Supreme Court guidelines in Amardeep Singh v. Harveen Kaur, completing the process in 2 to 4 weeks."
      },
      {
        q: "What happens if one spouse withdraws consent before the Second Motion?",
        a: "In mutual divorce, either party can withdraw consent prior to passing of the final decree. In such scenarios, the other spouse may initiate a contested divorce petition based on available statutory grounds."
      }
    ]
  },
  {
    slug: "corporate-law",
    title: "Corporate Law and Compliance",
    shortTitle: "Corporate Law",
    specialization: "Corporate Law",
    iconName: "Briefcase",
    summary: "Corporate legal counsel for contract drafting, commercial transactions, MCA compliance, shareholder agreements, and corporate governance.",
    fullDescription: "Corporate enterprises require strict statutory compliance with the Ministry of Corporate Affairs (MCA), transparent governance, and well-drafted commercial contracts to mitigate operational risk. LegalConnect offers access to seasoned corporate lawyers who assist with structural drafting, regulatory filings, and corporate dispute resolution.",
    statutoryFramework: [
      "Companies Act, 2013 and applicable MCA Rules",
      "Insolvency and Bankruptcy Code (IBC), 2016",
      "Foreign Exchange Management Act (FEMA), 1999",
      "Competition Act, 2002"
    ],
    commonIssues: [
      "Shareholders Agreements (SHA) and Share Purchase Agreements (SPA)",
      "Corporate governance, board resolutions, and annual MCA compliance",
      "Director disqualification removal and DIN reactivation before High Court",
      "Mergers, amalgamations, demergers, and joint venture documentation",
      "Commercial contract breach and corporate insolvency proceedings before NCLT"
    ],
    lawyerAssistance: [
      "Structure corporate transactions and prepare customized investment agreements",
      "Draft standard master service agreements (MSA), vendor contracts, and NDAs",
      "Ensure regulatory filings with Registrar of Companies (ROC) and MCA",
      "Represent directors and companies before NCLT and appellate bodies",
      "Issue Section 138 NI Act notices for dishonored corporate payments"
    ],
    processSteps: [
      { step: 1, title: "Transaction Scoping", desc: "Understand business goals, risk allocation, and statutory limitations." },
      { step: 2, title: "Contract Architecture", desc: "Draft customized agreements with indemnities, dispute clauses, and governance rules." },
      { step: 3, title: "Negotiation & Execution", desc: "Redline agreements with counterparties to secure maximum legal protection." },
      { step: 4, title: "Regulatory Filing", desc: "Complete mandatory ROC and MCA filings with valid board resolutions." }
    ],
    checklistDocuments: [
      "Certificate of Incorporation (COI), MOA, and AOA",
      "Board resolutions authorizing authorized signatories",
      "Draft commercial contracts or term sheets",
      "Financial ledgers, invoices, and debt acknowledgments (for recovery/NCLT)",
      "PAN, GST registration, and registered office records"
    ],
    faqs: [
      {
        q: "What are the essential clauses in a Shareholders Agreement (SHA)?",
        a: "Key clauses include board representation, veto/reserved matters, tag-along and drag-along rights, right of first refusal (ROFR), liquidation preferences, and clear dispute resolution through institutional arbitration."
      },
      {
        q: "How can directors resolve disqualification under Section 164(2)?",
        a: "Disqualified directors often approach the jurisdictional High Court via writ petition under Article 226 for de-tagging of DIN and permission to file pending annual financial returns."
      }
    ]
  },
  {
    slug: "cyber-crime-law",
    title: "Cyber Crime and Digital Security Law",
    shortTitle: "Cyber Crime Law",
    specialization: "Cyber Law",
    iconName: "ShieldAlert",
    summary: "Legal defense and victim recourse for online financial fraud, identity theft, unauthorized data access, and IT Act violations.",
    fullDescription: "With the rapid digitisation of commerce and communication, cyber offenses have escalated significantly. LegalConnect connects victims of digital fraud, cyber extortion, data breaches, and defamation with advocates versed in the Information Technology Act and cyber forensic evidence.",
    statutoryFramework: [
      "Information Technology Act, 2000 (Amended 2008)",
      "Digital Personal Data Protection (DPDP) Act, 2023",
      "Bharatiya Sakshya Adhiniyam, 2023 (Section 65B IT Act electronic evidence)",
      "RBI Master Directions on unauthorized digital banking transactions"
    ],
    commonIssues: [
      "Online banking fraud, UPI phishing, and fraudulent SIM swap financial losses",
      "Cyber harassment, online stalking, non-consensual image sharing, and defamation",
      "Identity theft, email spoofing, hacking, and unauthorized system access (Section 43/66)",
      "Corporate trade secret theft, database breaches, and DPDP non-compliance",
      "Account freezing by Cyber Crime Police Stations (Section 91 CrPC notices)"
    ],
    lawyerAssistance: [
      "File complaints with National Cyber Crime Reporting Portal (cybercrime.gov.in)",
      "Coordinate with bank nodal officers and cyber cells for quick account freezing",
      "File writ petitions before High Court for de-freezing legitimate bank accounts",
      "Ensure valid electronic evidence certification under Section 65B BSA",
      "Represent victims or defendants before Cyber Appellate and Magistrate Courts"
    ],
    processSteps: [
      { step: 1, title: "Evidence Preservation", desc: "Preserve unedited transaction screenshots, email headers, URLs, and server logs." },
      { step: 2, title: "Golden Hour Reporting", desc: "Report to 1930 cyber helpline and bank fraud cell to freeze money trails." },
      { step: 3, title: "Formal Cyber Cell Complaint", desc: "Advocate drafts formal legal complaint with forensic evidence sequence." },
      { step: 4, title: "Court Recourse", desc: "File application for de-freezing accounts or initiate criminal prosecution." }
    ],
    checklistDocuments: [
      "Bank statement showing unauthorized debits and transaction UTR numbers",
      "Screenshots of fraudulent chats, phishing SMS, or spoofed emails with full headers",
      "Complaint acknowledgement number from cybercrime.gov.in or 1930 helpline",
      "Police communication or notice under Section 91/102 CrPC (if account frozen)",
      "Electronic evidence certificate under Section 65B / Section 63 BSA"
    ],
    faqs: [
      {
        q: "What should I do immediately after falling victim to online banking fraud?",
        a: "Immediately call the national cyber fraud helpline 1930 and notify your bank's fraud monitoring cell within the first 'golden hour' to request freezing of beneficiary accounts."
      },
      {
        q: "Why was my legitimate merchant bank account frozen by cyber police?",
        a: "Police often freeze entire downstream account chains when stolen funds are layered through multiple transactions (even indirectly via P2P crypto or commercial payments). An advocate can petition the court or investigating officer with business proof to de-freeze."
      }
    ]
  },
  {
    slug: "intellectual-property-law",
    title: "Intellectual Property and Trademark Law",
    shortTitle: "IP Law",
    specialization: "Corporate Law",
    iconName: "Sparkles",
    summary: "Brand protection, trademark registration, trademark objections, copyright licensing, patent drafting, and passing-off litigation.",
    fullDescription: "Intellectual Property represents the core enterprise value of modern businesses. LegalConnect connects founders, creators, and corporations with experienced IP advocates who handle trademark filing, reply to examination reports, opposition hearings before the Trade Marks Registry, and commercial infringement litigation.",
    statutoryFramework: [
      "Trade Marks Act, 1999 & Trade Marks Rules, 2017",
      "Copyright Act, 1957",
      "Patents Act, 1970",
      "Designs Act, 2000 & Commercial Courts Act, 2015"
    ],
    commonIssues: [
      "Trademark availability search and filing under relevant Nice classifications",
      "Replies to Trademark Examination Reports under Section 9 and Section 11 objections",
      "Trademark opposition proceedings, counter-statements, and evidence in support",
      "Cease and desist legal notices for trademark infringement and passing off",
      "Software copyright protection, IP licensing, and assignment agreements"
    ],
    lawyerAssistance: [
      "Conduct comprehensive trademark clearance searches across class categories",
      "Draft persuasive legal responses to registry objections under Sec 9 and 11",
      "Appear before the Registrar of Trade Marks for show-cause hearings",
      "File commercial suits for interim injunctions against brand counterfeiters",
      "Draft robust IP assignment and technology transfer agreements"
    ],
    processSteps: [
      { step: 1, title: "Clearance Search", desc: "Examine trademark database to identify similar conflicting registered marks." },
      { step: 2, title: "Application Filing", desc: "Submit TM-A application under appropriate class with user affidavit." },
      { step: 3, title: "Examination & Reply", desc: "Advocate drafts formal reply to examination report addressing objections." },
      { step: 4, title: "Journal & Registration", desc: "Publication in Trademark Journal, opposition clearance, and registration certificate." }
    ],
    checklistDocuments: [
      "Logo artwork, brand name, slogan, or mark representation in high resolution",
      "Applicant details (PAN, Certificate of Incorporation, MSME/Udyam certificate)",
      "User date proof (first invoice, website registration, or user affidavit)",
      "List of products or services offered under the mark",
      "Signed Power of Attorney (Form TM-48) authorizing the advocate"
    ],
    faqs: [
      {
        q: "What is the benefit of obtaining an MSME certificate before filing a trademark?",
        a: "Under the Trade Marks Rules, 2017, individuals, startups, and MSME/Udyam registered entities receive a 50% statutory government fee concession (₹4,500 instead of ₹9,000 per class)."
      },
      {
        q: "What should I do if my trademark application is objected under Section 11?",
        a: "Section 11 objections indicate similarity with an earlier mark. An IP advocate files a reasoned reply highlighting visual, phonetical, and conceptual distinctions, distinct trade channels, and honest concurrent adoption."
      }
    ]
  },
  {
    slug: "labour-and-employment-law",
    title: "Labour and Employment Law",
    shortTitle: "Labour Law",
    specialization: "Labour Law",
    iconName: "Briefcase",
    summary: "Counsel on workplace rights, wrongful termination, unpaid gratuity, employment contracts, and POSH compliance.",
    fullDescription: "Employment relationships are governed by strict statutory requirements regarding fair wages, terminal benefits, non-discrimination, and grievance redressal. LegalConnect supports both employees and enterprises in resolving wrongful dismissal claims, unpaid severance dues, POSH compliance inquiries, and enforceability of non-compete clauses.",
    statutoryFramework: [
      "Industrial Disputes Act, 1947 / New Labour Codes",
      "Payment of Gratuity Act, 1972 & Employees' Provident Funds Act, 1952",
      "Sexual Harassment of Women at Workplace (POSH) Act, 2013",
      "Industrial Employment (Standing Orders) Act, 1946"
    ],
    commonIssues: [
      "Wrongful termination, forced resignation, and arbitrary dismissal without notice",
      "Non-payment of earned salary, severance pay, gratuity, and statutory bonus",
      "Enforceability of non-compete and non-solicitation covenants in employment contracts",
      "Internal Complaints Committee (ICC) inquiries and POSH statutory compliance",
      "Labour court conciliation proceedings and industrial tribunal disputes"
    ],
    lawyerAssistance: [
      "Issue legal notices demanding unpaid salary, gratuity, and relieving letters",
      "Represent employees before the Labour Commissioner for statutory conciliation",
      "Advise employers on structuring legally compliant employee handbooks and contracts",
      "Serve as external legal member on Internal Complaints Committees under POSH",
      "Challenge unlawful termination before the Industrial Tribunal or High Court"
    ],
    processSteps: [
      { step: 1, title: "Contract Analysis", desc: "Review employment agreement, appointment letter, HR policies, and termination notice." },
      { step: 2, title: "Statutory Demand", desc: "Issue comprehensive legal notice demanding legitimate terminal dues and relieving docs." },
      { step: 3, title: "Labour Conciliation", desc: "File representation before Assistant Labour Commissioner (ALC) for mediation." },
      { step: 4, title: "Tribunal Adjudication", desc: "Escalate failure of conciliation to Labour Court for formal decree and compensation." }
    ],
    checklistDocuments: [
      "Offer letter, employment contract, and subsequent appraisal/increment letters",
      "Monthly salary slips for previous 6 months and corresponding bank statements",
      "Resignation letter, termination notice, or performance improvement plan (PIP) emails",
      "Full and Final (F&F) settlement statement provided by employer (if any)",
      "All formal written communications exchanging requests for pending dues"
    ],
    faqs: [
      {
        q: "Are non-compete clauses enforceable in India after an employee resigns?",
        a: "Under Section 27 of the Indian Contract Act, agreements in restraint of lawful profession, trade, or business are void. Post-employment non-compete restrictions are generally unenforceable in Indian courts, although confidentiality and non-solicitation covenants remain valid."
      },
      {
        q: "When does an employee become entitled to payment of gratuity?",
        a: "Under the Payment of Gratuity Act, 1972, an employee who has rendered continuous service of at least 5 years in an establishment with 10 or more employees is entitled to gratuity upon resignation, retirement, or termination."
      }
    ]
  },
  {
    slug: "administrative-law",
    title: "Administrative and Constitutional Law",
    shortTitle: "Administrative Law",
    specialization: "Civil Litigation",
    iconName: "Scale",
    summary: "Writ petitions before High Courts and Supreme Court against arbitrary government orders, public tenders, and regulatory authorities.",
    fullDescription: "Administrative law protects citizens and businesses against arbitrary executive action, abuse of discretion, and violation of natural justice. LegalConnect provides access to seasoned High Court and Supreme Court advocates who draft and argue writ petitions (Mandamus, Certiorari, Prohibition, Quo Warranto, Habeas Corpus) challenging unlawful government directives, tender cancellations, and statutory body penalties.",
    statutoryFramework: [
      "Constitution of India (Articles 32, 226, and 227)",
      "Right to Information (RTI) Act, 2005",
      "Administrative Tribunals Act, 1985 (CAT / SAT)",
      "Principles of Natural Justice (Audi Alteram Partem)"
    ],
    commonIssues: [
      "Writ of Mandamus against government inaction or delayed statutory permissions",
      "Writ of Certiorari to quash arbitrary administrative or quasi-judicial orders",
      "Government tender disqualifications, tender cancellations, and blacklisting",
      "Service disputes of government and PSU employees before Central Administrative Tribunal (CAT)",
      "Violations of fundamental rights under Articles 14, 19, and 21 of the Constitution"
    ],
    lawyerAssistance: [
      "Draft comprehensive Writ Petitions with supporting affidavits under Article 226",
      "Seek emergency interim stay orders against adverse administrative actions",
      "Represent aggrieved tender bidders before High Court commercial benches",
      "File original applications (OAs) before Central and State Administrative Tribunals",
      "Appeal before Supreme Court of India through Special Leave Petitions (SLPs)"
    ],
    processSteps: [
      { step: 1, title: "Executive Order Review", desc: "Analyze the impugned order for jurisdictional error or breach of natural justice." },
      { step: 2, title: "Formal Representation", desc: "Submit statutory representation demanding corrective executive review." },
      { step: 3, title: "Writ Petition Filing", desc: "File writ before High Court with certified copy of order and urgency application." },
      { step: 4, title: "Motion Hearing", desc: "Argue before bench for immediate ad-interim stay and issuance of notice." }
    ],
    checklistDocuments: [
      "Copy of the impugned government notification, penalty notice, or rejection order",
      "Prior representations submitted to the administrative authority",
      "Relevant tender document, bid submission, and rejection communications",
      "Service record, appointment letter, and seniority list (for service matters)",
      "Proof of arbitrary discrimination violating Article 14 equality principles"
    ],
    faqs: [
      {
        q: "When can an individual file a Writ Petition under Article 226 in High Court?",
        a: "A Writ Petition can be filed against any state authority, government instrumentality, or statutory body for violation of fundamental constitutional rights or where an administrative order is passed without jurisdiction or without granting a fair hearing."
      },
      {
        q: "What is the significance of the principle of natural justice?",
        a: "Natural justice mandates that no person can be condemned unheard (Audi Alteram Partem) and no authority with a personal bias can act as judge. Orders passed without affording a reasonable opportunity to be heard are liable to be quashed by writ courts."
      }
    ]
  },
  {
    slug: "tax-law",
    title: "Tax Law and GST Consultation",
    shortTitle: "Tax Law",
    specialization: "Corporate Law",
    iconName: "CreditCard",
    summary: "Advisory and litigation support for Income Tax scrutiny notices, GST show-cause notices, appellate appeals, and tax compliance.",
    fullDescription: "Taxation statutes involve intricate procedural timelines, penalty risks, and multi-tier appellate jurisdictions. LegalConnect connects business owners, salaried individuals, and corporations with tax lawyers who handle scrutiny responses, GST classification disputes, appeals before CIT(A), ITAT, and High Court tax benches.",
    statutoryFramework: [
      "Income Tax Act, 1961 (and Finance Act amendments)",
      "Central Goods and Services Tax (CGST) Act, 2017 & SGST Acts",
      "Integrated Goods and Services Tax (IGST) Act, 2017",
      "Customs Act, 1962 & Foreign Trade Policy"
    ],
    commonIssues: [
      "Replies to Income Tax reassessment notices under Section 148 / 148A",
      "GST Show Cause Notices (SCN) under Section 73 (non-fraud) and Section 74 (fraud)",
      "Input Tax Credit (ITC) reversal disputes and mismatch notices",
      "Appeals before Commissioner of Income Tax (Appeals) and Appellate Tribunal (ITAT)",
      "Search, seizure, and survey proceedings with statutory compounding"
    ],
    lawyerAssistance: [
      "Draft structured replies to scrutiny questionnaires and reassessment orders",
      "Challenge arbitrary GST bank account attachments under Section 83",
      "File and argue statutory tax appeals before CIT(A), GST Appellate Authority, and ITAT",
      "Formulate corporate tax-efficient transaction structures for asset sales",
      "File writ petitions in High Court against jurisdictional defects in tax notices"
    ],
    processSteps: [
      { step: 1, title: "Notice Evaluation", desc: "Verify statutory jurisdiction, limitation dates, and digital DIN validity of tax notice." },
      { step: 2, title: "Evidence Compilation", desc: "Reconcile GSTR-2B with books, audited balance sheets, and bank summaries." },
      { step: 3, title: "Written Response", desc: "Advocate drafts exhaustive legal response referencing binding judicial precedents." },
      { step: 4, title: "Appellate Recourse", desc: "File statutory appeal before appellate authorities in case of adverse order." }
    ],
    checklistDocuments: [
      "Impugned tax notice or assessment order with Document Identification Number (DIN)",
      "Audited financial statements, tax audit reports, and filed ITR acknowledgments",
      "GSTR-1, GSTR-3B, and annual GSTR-9 returns with ledger reconciliations",
      "Bank statements matching questioned deposits or transactions",
      "Invoices, delivery proof, and e-way bills supporting questioned Input Tax Credits"
    ],
    faqs: [
      {
        q: "What is a DIN in tax communications, and is a notice valid without it?",
        a: "The Central Board of Direct Taxes (CBDT) mandates that every communication, notice, or order must bear a system-generated Document Identification Number (DIN). Communications issued without a valid DIN are invalid and non-est in the eyes of law."
      },
      {
        q: "Can the tax department arbitrarily freeze a bank account during a GST inquiry?",
        a: "Under Section 83 of the CGST Act, provisional attachment can only be ordered to protect revenue interests based on tangible material, not routine inquiries. High Courts frequently quash arbitrary attachments lacking written justification."
      }
    ]
  },
  {
    slug: "consumer-protection-law",
    title: "Consumer Protection and Product Liability",
    shortTitle: "Consumer Law",
    specialization: "Consumer Law",
    iconName: "ShieldAlert",
    summary: "Consumer commission petitions against defective products, builder possession delays, unfair trade practices, and insurance claim rejections.",
    fullDescription: "Under the Consumer Protection Act, 2019, consumers have robust statutory rights against defective products, deficiency in services, misleading advertisements, and unfair trade practices. LegalConnect connects aggrieved buyers with consumer advocates who formulate claims before District, State, and National Consumer Disputes Redressal Commissions (NCDRC).",
    statutoryFramework: [
      "Consumer Protection Act, 2019 & Consumer Protection Rules, 2020",
      "Real Estate (Regulation and Development) Act, 2016",
      "Insurance Regulatory and Development Authority of India (IRDAI) Regulations",
      "Legal Metrology Act, 2009"
    ],
    commonIssues: [
      "Defective automobiles, electronic appliances, and refusal of warranty replacement",
      "Repudiation of health, life, or motor insurance claims by insurance companies",
      "Real estate builder delay in handing over physical possession of residential units",
      "Medical negligence complaints against private hospitals and healthcare practitioners",
      "E-commerce fraud, delivery of counterfeit items, and refusal of statutory refunds"
    ],
    lawyerAssistance: [
      "Draft and serve formal statutory consumer notice demanding rectification and damages",
      "File e-daakhil consumer complaints before District, State, or National Commissions",
      "Calculate comprehensive compensation claims for mental agony, litigation costs, and interest",
      "Cross-examine expert witnesses (such as surveyors or medical boards)",
      "Enforce execution proceedings under Section 71/72 for recovery of awarded amounts"
    ],
    processSteps: [
      { step: 1, title: "Consumer Notice", desc: "Issue 15-day formal notice giving service provider opportunity to redress grievance." },
      { step: 2, title: "E-Daakhil Filing", desc: "Submit digital complaint on consumer commission portal with supporting documents." },
      { step: 3, title: "Admission & Evidence", desc: "Court admits complaint, issues notice, and records written evidence by way of affidavit." },
      { step: 4, title: "Order & Enforcement", desc: "Final order awarding refund, compensation, and execution of recovery warrant if defaulted." }
    ],
    checklistDocuments: [
      "Tax invoice, retail receipt, or digital payment confirmation",
      "Warranty cards, service job sheets, and communication with customer support",
      "Insurance policy schedule, claim form, and formal letter of claim rejection",
      "Builder buyer agreement and record of total consideration paid (for property matters)",
      "Written consumer notice and proof of delivery tracking"
    ],
    faqs: [
      {
        q: "What is the pecuniary jurisdiction of Consumer Commissions in India?",
        a: "Under the Consumer Protection Act 2019 (amended rules): District Commissions handle claims where value of goods/services paid does not exceed ₹50 Lakhs; State Commissions handle ₹50 Lakhs to ₹2 Crores; National Commission (NCDRC) handles claims exceeding ₹2 Crores."
      },
      {
        q: "What is the limitation period for filing a consumer complaint?",
        a: "A consumer complaint must be filed within 2 years from the date on which the cause of action arose (e.g. date of insurance repudiation or product breakdown)."
      }
    ]
  },
  {
    slug: "environmental-law",
    title: "Environmental Law and NGT Litigation",
    shortTitle: "Environmental Law",
    specialization: "Civil Litigation",
    iconName: "Scale",
    summary: "Representation before National Green Tribunal (NGT) and Pollution Control Boards for statutory clearances, factory notices, and ecological compliance.",
    fullDescription: "Environmental compliance is mandatory for industrial units, infrastructure projects, and manufacturing facilities across India. LegalConnect provides access to environmental law practitioners who handle Consent to Establish (CTE), Consent to Operate (CTO), pollution notices, and environmental public interest litigation before the National Green Tribunal.",
    statutoryFramework: [
      "National Green Tribunal (NGT) Act, 2010",
      "Environment (Protection) Act, 1986",
      "Water (Prevention and Control of Pollution) Act, 1974",
      "Air (Prevention and Control of Pollution) Act, 1981 & Waste Management Rules"
    ],
    commonIssues: [
      "Defense against closure notices and environmental compensation penalties by SPCB/CPCB",
      "Obtaining and renewing Consent to Establish (CTE) and Consent to Operate (CTO)",
      "Litigation before National Green Tribunal (NGT) regarding industrial effluent or air emissions",
      "Environmental Impact Assessment (EIA) clearance challenges for infrastructure projects",
      "Compliance with Plastic Waste, Solid Waste, and Hazardous Waste Management Rules"
    ],
    lawyerAssistance: [
      "Draft structured replies to State Pollution Control Board show-cause notices",
      "File appeals before SPCB Appellate Authorities and the National Green Tribunal",
      "Challenge excessive environmental damage compensation calculations",
      "Conduct environmental regulatory audits for manufacturing facilities",
      "Represent affected citizen groups in environmental conservation litigations"
    ],
    processSteps: [
      { step: 1, title: "Inspection Audit", desc: "Review SPCB inspection reports, effluent test results, and compliance conditions." },
      { step: 2, title: "Show-Cause Defense", desc: "File detailed technical and legal reply addressing pollution allegations." },
      { step: 3, title: "NGT Appeal", desc: "File statutory appeal before NGT Principal Bench or Regional Benches." },
      { step: 4, title: "Remediation & Compliance", desc: "Demonstrate environmental compliance monitoring to prevent plant closure." }
    ],
    checklistDocuments: [
      "Copy of SPCB inspection report, show-cause notice, or closure direction",
      "Current Consent to Establish (CTE) and Consent to Operate (CTO) certificates",
      "Effluent Treatment Plant (ETP) / Sewage Treatment Plant (STP) test logbooks",
      "Environmental clearance (EC) documentation (if applicable to project category)",
      "Proof of installed continuous online emission monitoring systems (OCEMS)"
    ],
    faqs: [
      {
        q: "What powers does the National Green Tribunal have regarding penalties?",
        a: "The NGT possesses powers to order restitution of damaged environment, award compensation for victims of pollution, and levy substantial environmental compensation on the 'Polluter Pays Principle'."
      },
      {
        q: "Within what period must an appeal be filed before the NGT?",
        a: "An appeal challenging an order of a State Pollution Control Board or appellate authority must generally be filed before the NGT within 30 days from the date the order is communicated."
      }
    ]
  },
  {
    slug: "immigration-law",
    title: "Immigration and Visa Legal Services",
    shortTitle: "Immigration Law",
    specialization: "Civil Litigation",
    iconName: "Globe",
    summary: "Legal assistance for visa refusal challenges, FRRO registrations, citizenship queries, OCI documentation, and extradition guidance.",
    fullDescription: "Cross-border travel, employment visas, and overseas permanent residency involve rigorous documentation and compliance with sovereign immigration laws. LegalConnect enables individuals and corporate employers to consult advocates experienced in visa refusal appeals, Indian FRRO compliance, and Overseas Citizen of India (OCI) matters.",
    statutoryFramework: [
      "Citizenship Act, 1955 and Citizenship Rules, 2009",
      "Foreigners Act, 1946 & Registration of Foreigners Act, 1939",
      "Passports Act, 1967",
      "Emigration Act, 1983"
    ],
    commonIssues: [
      "Legal recourse against visa refusal, travel bans, or passport impounding",
      "Foreigners Regional Registration Office (FRRO) visa extensions and overstay regularization",
      "Overseas Citizen of India (OCI) card applications, renewals, and revocations",
      "Dual citizenship statutory queries, surrender certificates, and renunciation of Indian nationality",
      "Look Out Circular (LOC) challenge and quashing before High Courts"
    ],
    lawyerAssistance: [
      "File writ petitions in High Court for revocation of arbitrary Look Out Circulars (LOC)",
      "Represent foreign nationals before FRRO for visa regularisation and exit permits",
      "Draft administrative representations against passport impoundment or refusal",
      "Verify foreign marriage certificates and apostille documentation for visa sponsorship",
      "Guide corporate employers on business visa compliance and employment permit norms"
    ],
    processSteps: [
      { step: 1, title: "Eligibility Assessment", desc: "Review immigration history, visa refusal reasons, or FRRO non-compliance." },
      { step: 2, title: "Document Apostille", desc: "Assist with MEA apostille certification and statutory legal translations." },
      { step: 3, title: "Administrative Representation", desc: "Submit formal representation to Passport Office or FRRO authorities." },
      { step: 4, title: "Writ Recourse", desc: "Petition High Court if fundamental right to travel abroad (Article 21) is violated." }
    ],
    checklistDocuments: [
      "Original passport, all previous visa stamps, and refusal letters",
      "FRRO registration certificate / residential permit (for foreign nationals in India)",
      "Proof of foreign residency, employment contract, or overseas educational admission",
      "Apostilled marriage or birth certificates (for dependent visas)",
      "Court orders granting permission to travel abroad (in pending litigation)"
    ],
    faqs: [
      {
        q: "How can a person challenge an arbitrary Look Out Circular (LOC) preventing foreign travel?",
        a: "An aggrieved citizen can approach the High Court under Article 226 citing violation of the fundamental right to travel under Article 21 (Maneka Gandhi v. UOI), seeking quashing or suspension of the LOC."
      },
      {
        q: "Can an OCI cardholder buy agricultural land in India?",
        a: "No. Under FEMA regulations and RBI directives, Overseas Citizens of India (OCI) cannot purchase agricultural land, farmhouse property, or plantation property in India without prior approval from the Reserve Bank of India."
      }
    ]
  },
  {
    slug: "insurance-law",
    title: "Insurance Law and Claim Settlement",
    shortTitle: "Insurance Law",
    specialization: "Consumer Law",
    iconName: "ShieldAlert",
    summary: "Legal advocacy for repudiated health, life, marine, and motor insurance claims, insurance ombudsman complaints, and court recovery.",
    fullDescription: "Insurance claim repudiations frequently rely on technical exclusions or alleged non-disclosure of pre-existing diseases. LegalConnect connects policyholders and commercial enterprises with insurance advocates who review policy wordings, challenge arbitrary rejections before the Insurance Ombudsman, and secure rightful compensation before Consumer Commissions.",
    statutoryFramework: [
      "Insurance Act, 1938 and Insurance Regulatory and Development Authority (IRDAI) Act, 1999",
      "Insurance Ombudsman Rules, 2017",
      "Consumer Protection Act, 2019",
      "Motor Vehicles Act, 1988 (Motor Accidents Claims Tribunal provisions)"
    ],
    commonIssues: [
      "Repudiation of health insurance mediclaim on grounds of alleged non-disclosure",
      "Rejection of life insurance death claims citing medical discrepancies",
      "Commercial fire, marine cargo, and business interruption insurance claim disputes",
      "Motor vehicle third-party accident claims before Motor Accident Claims Tribunals (MACT)",
      "Disputes regarding partial claim approvals and cashless hospital refusal"
    ],
    lawyerAssistance: [
      "Examine insurance policy exclusions against IRDAI health insurance regulations",
      "Draft structured representations to insurance company Grievance Redressal Officers (GRO)",
      "File complaints before the Insurance Ombudsman for claims up to ₹50 Lakhs",
      "File consumer petitions for claim settlement along with interest and mental agony damages",
      "Represent claimants or vehicle owners before Motor Accident Claims Tribunals (MACT)"
    ],
    processSteps: [
      { step: 1, title: "Repudiation Analysis", desc: "Inspect policy terms and insurer rejection letter to identify grounds of unfair denial." },
      { step: 2, title: "Internal Grievance Escalation", desc: "Submit formal escalation letter to insurer's Grievance Redressal Officer (GRO)." },
      { step: 3, title: "Ombudsman Complaint", desc: "File complaint before jurisdictional Insurance Ombudsman (no court fee required)." },
      { step: 4, title: "Consumer Commission", desc: "Institute formal complaint before District/State Consumer Commission for decree." }
    ],
    checklistDocuments: [
      "Complete insurance policy schedule with terms and conditions document",
      "Claim submission receipt and official letter of repudiation from insurer",
      "Discharge summary, hospital bills, pharmacy receipts, and treating doctor certificate",
      "Original proposal form submitted during policy purchase (if available)",
      "FIR, panchnama, and driving license (for motor accident claims)"
    ],
    faqs: [
      {
        q: "What is the limitation period for challenging a life insurance claim after 3 years?",
        a: "Under Section 45 of the Insurance Act (amended), no policy of life insurance can be called in question on any ground whatsoever after the expiry of 3 years from the date of issuance or revival."
      },
      {
        q: "Are decisions of the Insurance Ombudsman binding on insurance companies?",
        a: "Yes. An award passed by the Insurance Ombudsman is binding on the insurance company, but the policyholder retains the right to approach the Consumer Commission if dissatisfied with the award."
      }
    ]
  },
  {
    slug: "startup-law",
    title: "Startup and Venture Legal Advisory",
    shortTitle: "Startup Law",
    specialization: "Corporate Law",
    iconName: "Sparkles",
    summary: "Startup incorporation, term sheet negotiation, founder agreements, ESOP pool drafting, DPIIT recognition, and investor compliance.",
    fullDescription: "Early-stage ventures operate in high-velocity environments where proper legal foundation protects equity and enables seamless fundraising. LegalConnect offers founders access to startup advocates who handle co-founder agreements, Employee Stock Option Plans (ESOPs), angel/VC investment term sheets, and IP assignment.",
    statutoryFramework: [
      "Companies Act, 2013 and Startup India Initiative regulations",
      "DPIIT Notification for Startup Recognition and Tax Exemption (Section 80-IAC)",
      "Indian Contract Act, 1872 & Information Technology Act, 2000",
      "FEMA Regulations on Foreign Direct Investment (FDI)"
    ],
    commonIssues: [
      "Structuring Founders' Agreement with vesting schedules and reverse vesting clauses",
      "Drafting and negotiating Term Sheets, Shareholders Agreements (SHA), and CCPS terms",
      "Designing Employee Stock Option Plans (ESOP) and grant letters",
      "Website and mobile app Terms of Service, Privacy Policies, and DPDP compliance",
      "Securing DPIIT recognition and Angel Tax exemptions"
    ],
    lawyerAssistance: [
      "Draft customized Co-Founders Agreements avoiding equity disputes",
      "Review investment agreements (SHA/SSA) to safeguard founder control and anti-dilution",
      "Formulate ESOP schemes complying with MCA guidelines",
      "Draft customer Master Service Agreements (MSA) and enterprise vendor contracts",
      "Advise on corporate restructuring, seed funding, and SAFE / convertible notes"
    ],
    processSteps: [
      { step: 1, title: "Entity Formation", desc: "Incorporate Private Limited Company with startup-friendly charter documents." },
      { step: 2, title: "Founder Governance", desc: "Execute Co-Founders Agreement with milestone-based equity vesting." },
      { step: 3, title: "IP Assignment", desc: "Transfer all codebase, patents, and trademarks from founders to corporate entity." },
      { step: 4, title: "Fundraising Ready", desc: "Create standardized data room, ESOP pool, and review investor term sheets." }
    ],
    checklistDocuments: [
      "Certificate of Incorporation, MOA, and AOA of startup entity",
      "Cap table showing equity ownership, authorized capital, and paid-up capital",
      "Signed Co-Founders Agreement or draft term sheet from prospective investor",
      "Intellectual property assignment deeds executed by technical founders",
      "DPIIT recognition certificate (if already acquired)"
    ],
    faqs: [
      {
        q: "Why is a Founders' Agreement critical before raising capital?",
        a: "A Founders' Agreement defines roles, IP assignment, decision-making rights, and reverse vesting schedules. If a co-founder leaves prematurely, unvested shares return to the company rather than being locked."
      },
      {
        q: "What instruments are commonly used for angel and seed investments in India?",
        a: "Startups in India commonly issue Compulsorily Convertible Preference Shares (CCPS), Convertible Notes (for DPIIT recognized startups), or iSAFE notes which convert into equity in future priced rounds."
      }
    ]
  },
  {
    slug: "business-and-commercial-law",
    title: "Business and Commercial Contracts",
    shortTitle: "Business Law",
    specialization: "Contract Law",
    iconName: "Briefcase",
    summary: "Commercial contract drafting, vendor agreements, distributorship contracts, partnership deeds, and commercial arbitration.",
    fullDescription: "Every commercial partnership relies on clearly drafted contracts that define deliverable timelines, payment milestones, representations and warranties, and liability caps. LegalConnect advocates assist small and medium enterprises (MSMEs) and corporate entities with comprehensive contract drafting, vetting, and dispute management.",
    statutoryFramework: [
      "Indian Contract Act, 1872",
      "Sale of Goods Act, 1930",
      "Micro, Small and Medium Enterprises Development (MSMED) Act, 2006",
      "Arbitration and Conciliation Act, 1996"
    ],
    commonIssues: [
      "Drafting and negotiating vendor contracts, supply agreements, and master service agreements",
      "MSME delayed payment claims and statutory interest recovery before MSEFC",
      "Drafting Partnership Deeds and Limited Liability Partnership (LLP) agreements",
      "Distributorship, franchisee agreements, and non-disclosure agreements (NDAs)",
      "Commercial arbitration invocation and enforcement of arbitral awards"
    ],
    lawyerAssistance: [
      "Review commercial contracts line-by-line to identify one-sided indemnity clauses",
      "Draft customized commercial contracts tailored to specific business operations",
      "File delayed payment applications before the MSME Facilitation Council (MSEFC)",
      "Issue statutory notices for breach of contract and demand for performance",
      "Represent commercial clients before sole arbitrators and arbitral tribunals"
    ],
    processSteps: [
      { step: 1, title: "Commercial Scoping", desc: "Identify key risks, deliverables, payment milestones, and termination triggers." },
      { step: 2, title: "Contract Drafting", desc: "Draft customized agreement with unambiguous dispute resolution and liability caps." },
      { step: 3, title: "Negotiation Redlining", desc: "Represent business in bilateral negotiation calls to finalize contractual terms." },
      { step: 4, title: "Dispute Enforcement", desc: "Invoke arbitration or statutory MSME council remedies in case of payment defaults." }
    ],
    checklistDocuments: [
      "Draft contract, purchase order, or agreement submitted by counterparty",
      "Invoices, delivery challans, and completion sign-off certificates",
      "MSME / Udyam registration certificate (for statutory MSME interest claims)",
      "Record of communications showing breach, delays, or defective supplies",
      "Company registration and authorized signatory board resolution"
    ],
    faqs: [
      {
        q: "What remedy does an MSME registered supplier have against delayed payments?",
        a: "Under the MSMED Act, 2006, buyers must settle invoices within 45 days. In case of delay, buyers are statutorily liable to pay compound interest at three times the bank rate notified by the RBI, recoverable through the Micro and Small Enterprise Facilitation Council (MSEFC)."
      },
      {
        q: "Why is an institutional arbitration clause recommended in commercial contracts?",
        a: "Institutional arbitration provides a time-bound, confidential, and enforceable dispute mechanism before neutral arbitrators, avoiding multi-year delays associated with traditional civil court proceedings."
      }
    ]
  },
  {
    slug: "nri-legal-services",
    title: "NRI Legal Services and Global Advisory",
    shortTitle: "NRI Legal Services",
    specialization: "Property Law",
    iconName: "Globe",
    summary: "Dedicated legal assistance for Non-Resident Indians managing ancestral properties, partition suits, GPA verification, and court representation.",
    fullDescription: "Non-Resident Indians (NRIs) frequently encounter challenges managing immovable properties, tenant disputes, inheritance shares, and pending court cases in India while living overseas. LegalConnect provides a transparent digital bridge, connecting NRIs with verified advocates who manage properties, conduct title checks, and represent interests through valid Powers of Attorney.",
    statutoryFramework: [
      "Foreign Exchange Management Act (FEMA), 1999",
      "Power of Attorney Act, 1882 & Registration Act, 1908",
      "Hindu Succession Act, 1956 & Indian Succession Act, 1925",
      "Code of Civil Procedure, 1908 (Order 3: Recognised Agents)"
    ],
    commonIssues: [
      "Ancestral property partition and safeguarding against fraudulent sale by relatives",
      "Eviction of unauthorized tenants or illegal encroachers from NRI-owned properties",
      "Drafting, consular stamping, and adjudication of Special Power of Attorney (GPA/SPA)",
      "Succession certificates and mutation of inherited properties in municipal records",
      "Representation in pending civil, matrimonial, or property litigations without traveling"
    ],
    lawyerAssistance: [
      "Conduct independent physical verification and revenue search for NRI properties",
      "Draft country-specific Power of Attorney documents for Indian Embassy consular stamping",
      "File eviction petitions and injunction suits against illegal occupants",
      "Represent NRIs through appointed attorney before Civil Courts and Sub-Registrars",
      "Facilitate legitimate repatriation of sale proceeds under FEMA 15CA/15CB guidelines"
    ],
    processSteps: [
      { step: 1, title: "Virtual Consultation", desc: "Review overseas documents, land records, and legal goals via secure video room." },
      { step: 2, title: "Power of Attorney", desc: "Draft SPA/GPA, obtain Indian Embassy consular stamping, and adjudicate in India." },
      { step: 3, title: "Court & Revenue Action", desc: "Advocate files partition suit, mutation application, or eviction petition." },
      { step: 4, title: "Digital Case Updates", desc: "Client receives authenticated hearing summaries and court orders directly in portal." }
    ],
    checklistDocuments: [
      "Passport and OCI card copy with overseas proof of residence",
      "Title deeds, jamabandi, or parent records of the property situated in India",
      "Consular-attested General or Special Power of Attorney (POA)",
      "Death certificate of deceased ancestor and family genealogy tree (for succession)",
      "Prior legal notices or court summons served at Indian ancestral address"
    ],
    faqs: [
      {
        q: "How can an NRI execute a valid Power of Attorney from abroad for property in India?",
        a: "The NRI signs the POA before an authorized officer at the Indian Embassy/Consulate in their country of residence. Once received in India, the POA must be presented for statutory stamping and adjudication before the Collector of Stamps within 3 months."
      },
      {
        q: "Can an NRI sell inherited property in India and repatriate the money overseas?",
        a: "Yes. Under RBI and FEMA guidelines, an NRI can sell inherited residential or commercial property in India and repatriate up to USD 1 Million per financial year through their NRO account upon submitting Form 15CA and Form 15CB certified by a Chartered Accountant."
      }
    ]
  },
  {
    slug: "nclt-and-company-law",
    title: "NCLT and Insolvency Proceedings",
    shortTitle: "NCLT Law",
    specialization: "Corporate Law",
    iconName: "Scale",
    summary: "Tribunal litigation before National Company Law Tribunal (NCLT) for corporate insolvency, operational debt recovery, and oppression & mismanagement.",
    fullDescription: "Corporate insolvency proceedings under the Insolvency and Bankruptcy Code (IBC) have transformed commercial debt recovery in India. LegalConnect enables corporate creditors, operational vendors, and shareholders to consult advocates who draft statutory demand notices, file Section 7/9 IBC petitions, and contest oppression and mismanagement suits before NCLT benches nationwide.",
    statutoryFramework: [
      "Insolvency and Bankruptcy Code (IBC), 2016",
      "Companies Act, 2013 (Sections 241/242: Oppression & Mismanagement)",
      "NCLT Rules, 2016 & NCLAT Rules, 2016",
      "Insolvency and Bankruptcy Board of India (IBBI) Regulations"
    ],
    commonIssues: [
      "Corporate Insolvency Resolution Process (CIRP) filing under Section 9 (Operational Creditors)",
      "Section 7 IBC insolvency petitions by Financial Creditors and Banks",
      "Statutory demand notices under Section 8 of IBC for outstanding invoices",
      "Oppression and mismanagement petitions under Section 241 and 242 of Companies Act",
      "Appeals before National Company Law Appellate Tribunal (NCLAT)"
    ],
    lawyerAssistance: [
      "Draft and serve Form 3/Form 4 statutory demand notices under Section 8 IBC",
      "File Section 9 company insolvency petitions with complete proof of debt and default",
      "Defend corporate debtors against malicious insolvency filings by establishing pre-existing disputes",
      "Represent minority shareholders in oppression and mismanagement litigations",
      "File appeals before NCLAT against admission or rejection orders of NCLT benches"
    ],
    processSteps: [
      { step: 1, title: "Section 8 Demand Notice", desc: "Serve 10-day statutory demand notice demanding settlement of unpaid operational debt." },
      { step: 2, title: "Default Verification", desc: "Verify absence of pre-existing dispute and statutory default threshold (₹1 Crore min)." },
      { step: 3, title: "NCLT Petition Filing", desc: "File Section 9 petition with invoices, bank certificates, and affidavit." },
      { step: 4, title: "Tribunal Admission", desc: "Argue before NCLT Bench for CIRP admission or negotiated settlement." }
    ],
    checklistDocuments: [
      "Purchase orders, master agreements, and commercial invoices showing unpaid dues",
      "Bank statement with Banker's Book Evidence certificate confirming non-receipt of payment",
      "Copy of Section 8 statutory demand notice and proof of delivery tracking",
      "Reply received from corporate debtor (if any) or proof of absence of response",
      "MCA company master data showing status and directors of the corporate debtor"
    ],
    faqs: [
      {
        q: "What is the minimum default threshold for filing an insolvency petition before NCLT?",
        a: "The minimum default threshold for initiating Corporate Insolvency Resolution Process (CIRP) under Section 4 of the IBC is currently ₹1 Crore."
      },
      {
        q: "What is a 'pre-existing dispute' under Section 9 of the IBC?",
        a: "If the corporate debtor issued a written complaint regarding quality, breach, or non-delivery before receiving the Section 8 demand notice, courts consider it a 'pre-existing dispute', making Section 9 inapplicable and requiring civil court recovery."
      }
    ]
  }
];

export function getLegalServiceBySlug(slug) {
  if (!slug) return null;
  return LEGAL_SERVICES.find((s) => s.slug.toLowerCase() === slug.toLowerCase()) || null;
}

export const LEGAL_SERVICES_DATA = LEGAL_SERVICES;

