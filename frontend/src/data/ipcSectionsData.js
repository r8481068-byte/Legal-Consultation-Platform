/**
 * Verified Indian Criminal Law Dataset: IPC (1860) & BNS (2023)
 * Authoritative cross-references based on Ministry of Home Affairs comparative tables
 * and India Code statutory publications.
 *
 * Statutory Note:
 * The Bharatiya Nyaya Sanhita (BNS), 2023 came into force on 1 July 2024.
 * Offences committed prior to 1 July 2024 are prosecuted under the Indian Penal Code (IPC), 1860
 * pursuant to Section 358 of BNS and Section 6 of the General Clauses Act, 1897.
 */

export const IPC_BNS_SECTIONS = [
  {
    id: "ipc-302",
    slug: "ipc-302-bns-103-murder",
    ipcSection: "302",
    ipcTitle: "Punishment for Murder",
    bnsSection: "103(1)",
    bnsTitle: "Punishment for Murder",
    category: "Offences Affecting Life & Body",
    shortDescription: "Prescribes the statutory punishment for committing the offence of murder.",
    plainLanguageExplanation:
      "Under Indian criminal jurisprudence, murder requires an intentional act causing death, or intentional infliction of bodily injury sufficient in the ordinary course of nature to cause death, without legal justification or falling within the statutory exceptions under Section 300 IPC (now Section 101 BNS).",
    ingredients: [
      "Death of a human being must be caused.",
      "The act causing death was done with the intention of causing death, or",
      "With the intention of causing such bodily injury as the offender knows to be likely to cause death, or",
      "With knowledge that the act is so imminently dangerous that it must in all probability cause death.",
      "The act does not fall within any of the five statutory exceptions (grave & sudden provocation, private defense excess, public servant duty, sudden fight, or adult consent)."
    ],
    punishment: "Death or imprisonment for life, and shall also be liable to fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Court of Session",
    transitionalNote:
      "Incidents occurring before 1 July 2024 are charged under Section 302 IPC. Incidents occurring on or after 1 July 2024 are charged under Section 103(1) of Bharatiya Nyaya Sanhita (BNS). Under BNS Section 103(2), mob lynching on grounds of race, caste, or community carries a specific statutory penalty.",
    officialReferences: [
      {
        title: "Ministry of Home Affairs - Criminal Law Reforms",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      },
      {
        title: "India Code - Indian Penal Code 1860",
        url: "https://www.indiacode.nic.in/handle/123456789/2263"
      }
    ]
  },
  {
    id: "ipc-307",
    slug: "ipc-307-bns-109-attempt-to-murder",
    ipcSection: "307",
    ipcTitle: "Attempt to Murder",
    bnsSection: "109",
    bnsTitle: "Attempt to Murder",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes any act done with intention or knowledge that if death were caused, it would amount to murder.",
    plainLanguageExplanation:
      "Penalizes an overt criminal act executed with the intention or knowledge capable of causing death, where the victim survives. The court looks at the nature of the weapon, bodily location of injury, force applied, and surrounding circumstances to infer murderous intent.",
    ingredients: [
      "Execution of an overt act towards the commission of murder.",
      "Act done with murderous intent or knowledge.",
      "The act must have been capable of causing death in ordinary circumstances, but death did not ensue."
    ],
    punishment:
      "Imprisonment up to 10 years and fine; if hurt is caused to any person by such act, imprisonment for life or up to 10 years and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Court of Session",
    transitionalNote: "Governed by IPC 307 pre-July 2024, and BNS Section 109 post-July 2024.",
    officialReferences: [
      {
        title: "India Code - IPC Section 307",
        url: "https://www.indiacode.nic.in/handle/123456789/2263"
      }
    ]
  },
  {
    id: "ipc-304a",
    slug: "ipc-304a-bns-106-death-by-negligence",
    ipcSection: "304A",
    ipcTitle: "Causing Death by Negligence",
    bnsSection: "106(1)",
    bnsTitle: "Causing Death by Negligence",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes causing death by any rash or negligent act not amounting to culpable homicide.",
    plainLanguageExplanation:
      "Applies primarily to vehicular road accidents and medical negligence where gross criminal negligence or reckless disregard for human safety is established without an intention to cause death.",
    ingredients: [
      "Death of a human being.",
      "Death caused by the rash or negligent act of the accused.",
      "The act must not amount to culpable homicide (no intention or knowledge of causing fatal injury)."
    ],
    punishment:
      "Under IPC 304A: Imprisonment up to 2 years, or fine, or both. Under BNS 106(1): Imprisonment up to 5 years and fine (registered medical practitioners face up to 2 years).",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote:
      "Note that BNS 106(2) introduces enhanced punishment up to 10 years for hit-and-run drivers who fail to report the incident to police or a magistrate immediately.",
    officialReferences: [
      {
        title: "MHA - New Criminal Laws Overview",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      }
    ]
  },
  {
    id: "ipc-376",
    slug: "ipc-376-bns-64-rape",
    ipcSection: "376",
    ipcTitle: "Punishment for Rape",
    bnsSection: "64",
    bnsTitle: "Punishment for Rape",
    category: "Offences Against Women",
    shortDescription: "Prescribes statutory minimum and aggravated punishments for sexual assault and rape.",
    plainLanguageExplanation:
      "Strict penal provision defining non-consensual sexual acts, sexual assault under false promises, or acts against a person incapable of giving valid consent under law.",
    ingredients: [
      "Commission of sexual acts defined under Section 375 IPC (now Section 63 BNS).",
      "Act committed against will, without consent, or with consent obtained under fear, misconception, or intoxication."
    ],
    punishment:
      "Rigorous imprisonment of not less than 10 years, which may extend to imprisonment for life, and fine (fine to be paid to the victim).",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Court of Session",
    transitionalNote: "Offenses committed from 1 July 2024 are prosecuted under Chapter V of BNS (Sections 63–72).",
    officialReferences: [
      {
        title: "India Code - Criminal Law Amendments",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-354",
    slug: "ipc-354-bns-74-outraging-modesty-woman",
    ipcSection: "354",
    ipcTitle: "Assault or Criminal Force to Woman with Intent to Outrage Modesty",
    bnsSection: "74",
    bnsTitle: "Assault or Criminal Force to Woman with Intent to Outrage Modesty",
    category: "Offences Against Women",
    shortDescription: "Penalizes assault or use of criminal force with intent or knowledge to outrage a woman's modesty.",
    plainLanguageExplanation:
      "Protects female bodily autonomy and dignity against unauthorized physical contact, force, or intimidating gestures in public or private spaces.",
    ingredients: [
      "Use of assault or criminal force against a woman.",
      "Intent to outrage or knowledge that it is likely to outrage her modesty."
    ],
    punishment: "Imprisonment of not less than 1 year which may extend to 5 years, and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Charged under IPC 354 pre-July 2024 and BNS 74 post-July 2024.",
    officialReferences: [
      {
        title: "MHA - New Criminal Laws",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      }
    ]
  },
  {
    id: "ipc-354a",
    slug: "ipc-354a-bns-75-sexual-harassment",
    ipcSection: "354A",
    ipcTitle: "Sexual Harassment and Punishment",
    bnsSection: "75",
    bnsTitle: "Sexual Harassment",
    category: "Offences Against Women",
    shortDescription: "Defines physical contact, sexually colored remarks, showing pornography, or sexual demands.",
    plainLanguageExplanation:
      "Covers verbal, visual, and physical harassment of a sexual nature at the workplace, educational institutions, or public arenas.",
    ingredients: [
      "Physical contact and advances involving unwelcome and explicit sexual overtures; or",
      "Demand or request for sexual favors; or",
      "Showing pornography against a woman's will; or",
      "Making sexually colored remarks."
    ],
    punishment: "Rigorous imprisonment up to 3 years or fine, or imprisonment up to 1 year for verbal remarks.",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds directly to Section 75 of BNS, 2023.",
    officialReferences: [
      {
        title: "India Code - Section 354A",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-498a",
    slug: "ipc-498a-bns-85-matrimonial-cruelty",
    ipcSection: "498A",
    ipcTitle: "Husband or Relative of Husband Subjecting Woman to Cruelty",
    bnsSection: "85",
    bnsTitle: "Husband or Relative of Husband Subjecting Woman to Cruelty",
    category: "Offences Against Women",
    shortDescription: "Criminalizes physical, mental, or dowry-related harassment of a married woman.",
    plainLanguageExplanation:
      "A vital legal protection against dowry demands and domestic cruelty. The Supreme Court in Arnesh Kumar and Social Action Forum established strict Section 41A notice protocols before arrest.",
    ingredients: [
      "The woman must be married.",
      "She must be subjected to cruelty or harassment by her husband or relatives of her husband.",
      "Cruelty must be willful conduct driving her to suicide or grave injury, or harassment to coerce unlawful property demands."
    ],
    punishment: "Imprisonment up to 3 years and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 85 of BNS (with Section 86 defining cruelty).",
    officialReferences: [
      {
        title: "MHA Comparative Tables IPC-BNS",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      }
    ]
  },
  {
    id: "ipc-420",
    slug: "ipc-420-bns-318-4-cheating",
    ipcSection: "420",
    ipcTitle: "Cheating and Dishonestly Inducing Delivery of Property",
    bnsSection: "318(4)",
    bnsTitle: "Cheating and Dishonestly Inducing Delivery of Property",
    category: "Offences Against Property & Fraud",
    shortDescription: "Penalizes dishonest deception that fraudulently induces someone to deliver property.",
    plainLanguageExplanation:
      "Applies to financial scams, fake property sale representations, fraudulent commercial promises, and intentional misrepresentation where fraudulent intention existed from the inception of the transaction.",
    ingredients: [
      "Deception of any person by fraudulent or dishonest inducement.",
      "Inducing the person to deliver any property, or make, alter or destroy a valuable security.",
      "Dishonest intention must exist at the time the promise or representation was made."
    ],
    punishment: "Imprisonment up to 7 years and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote:
      "Section 420 IPC is one of the most widely referenced provisions, now mapped to Section 318(4) of Bharatiya Nyaya Sanhita.",
    officialReferences: [
      {
        title: "India Code - Cheating Provisions",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-406",
    slug: "ipc-406-bns-316-2-criminal-breach-of-trust",
    ipcSection: "406",
    ipcTitle: "Punishment for Criminal Breach of Trust",
    bnsSection: "316(2)",
    bnsTitle: "Punishment for Criminal Breach of Trust",
    category: "Offences Against Property & Fraud",
    shortDescription: "Penalizes misappropriation or unauthorized conversion of property entrusted to someone.",
    plainLanguageExplanation:
      "Covers situations where property, funds, or assets are lawfully entrusted to an individual (such as partner, agent, or custodian) who subsequently dishonestly misappropriates or uses them in violation of law.",
    ingredients: [
      "Entrustment of property or dominion over property.",
      "Dishonest misappropriation, conversion to personal use, or disposal in violation of legal direction."
    ],
    punishment: "Imprisonment up to 3 years, or fine, or both (enhanced for public servants or bankers).",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 316(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 406",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-379",
    slug: "ipc-379-bns-303-theft",
    ipcSection: "379",
    ipcTitle: "Punishment for Theft",
    bnsSection: "303(2)",
    bnsTitle: "Punishment for Theft",
    category: "Offences Against Property & Fraud",
    shortDescription: "Penalizes dishonest taking of movable property out of the possession of any person without consent.",
    plainLanguageExplanation:
      "Deals with moving movable property dishonestly out of someone else's possession without their consent.",
    ingredients: [
      "Intention to take dishonestly.",
      "The property must be movable property.",
      "Taken out of the possession of another person without consent.",
      "Moved in order to effect such taking."
    ],
    punishment: "Imprisonment up to 3 years, or fine, or both.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote:
      "BNS Section 303(2) includes community service as a potential penalty for first-time petty theft under ₹5,000 upon restoration of property.",
    officialReferences: [
      {
        title: "MHA - Theft Provisions in New Laws",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      }
    ]
  },
  {
    id: "ipc-392",
    slug: "ipc-392-bns-309-robbery",
    ipcSection: "392",
    ipcTitle: "Punishment for Robbery",
    bnsSection: "309",
    bnsTitle: "Punishment for Robbery",
    category: "Offences Against Property & Fraud",
    shortDescription: "Aggravated theft or extortion committed with threat of instant death, hurt, or wrongful restraint.",
    plainLanguageExplanation:
      "Robbery is an aggravated form of theft or extortion where the offender causes or attempts to cause fear of instant death, hurt, or restraint.",
    ingredients: [
      "Theft or extortion.",
      "Offender causes or attempts to cause death, hurt, or wrongful restraint, or fear of instant injury."
    ],
    punishment: "Rigorous imprisonment up to 10 years and fine; if committed on highway between sunset and sunrise, up to 14 years.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 309 of BNS, 2023.",
    officialReferences: [
      {
        title: "India Code - Robbery",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-395",
    slug: "ipc-395-bns-310-2-dacoity",
    ipcSection: "395",
    ipcTitle: "Punishment for Dacoity",
    bnsSection: "310(2)",
    bnsTitle: "Punishment for Dacoity",
    category: "Offences Against Property & Fraud",
    shortDescription: "Penalizes robbery committed conjointly by five or more persons.",
    plainLanguageExplanation:
      "Whenever five or more persons conjointly commit or attempt to commit a robbery, the offence is dacoity, attracting severe penalties.",
    ingredients: [
      "Five or more persons acting conjointly.",
      "Commission or attempt to commit robbery."
    ],
    punishment: "Imprisonment for life, or rigorous imprisonment up to 10 years, and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Court of Session",
    transitionalNote: "Corresponds to Section 310(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - Dacoity",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-323",
    slug: "ipc-323-bns-115-2-voluntarily-causing-hurt",
    ipcSection: "323",
    ipcTitle: "Punishment for Voluntarily Causing Hurt",
    bnsSection: "115(2)",
    bnsTitle: "Punishment for Voluntarily Causing Hurt",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes voluntarily causing bodily pain, disease, or infirmity to any person.",
    plainLanguageExplanation:
      "Applies to common physical altercations and scuffles resulting in simple bodily hurt without the use of dangerous weapons.",
    ingredients: [
      "Bodily pain, disease, or infirmity caused to another.",
      "Act done with the intention of causing hurt or knowledge that it is likely to cause hurt."
    ],
    punishment: "Imprisonment up to 1 year, or fine up to ₹1,000, or both.",
    bailable: "Bailable",
    cognizable: "Non-Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 115(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 323",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-324",
    slug: "ipc-324-bns-118-1-hurt-by-dangerous-weapons",
    ipcSection: "324",
    ipcTitle: "Voluntarily Causing Hurt by Dangerous Weapons or Means",
    bnsSection: "118(1)",
    bnsTitle: "Voluntarily Causing Hurt by Dangerous Weapons or Means",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes simple hurt caused using instruments for shooting, stabbing, cutting, fire, or poison.",
    plainLanguageExplanation:
      "Elevates the punishment for simple assault when committed using dangerous weapons, firearms, sharp blades, corrosive substances, or fire.",
    ingredients: [
      "Voluntarily causing hurt.",
      "Use of instruments for shooting, stabbing, cutting, fire, corrosive substance, or poison."
    ],
    punishment: "Imprisonment up to 3 years, or fine, or both.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 118(1) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 324",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-325",
    slug: "ipc-325-bns-117-2-grievous-hurt",
    ipcSection: "325",
    ipcTitle: "Punishment for Voluntarily Causing Grievous Hurt",
    bnsSection: "117(2)",
    bnsTitle: "Punishment for Voluntarily Causing Grievous Hurt",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes severe bodily harm such as bone fractures, permanent vision/hearing loss, or disfigurement.",
    plainLanguageExplanation:
      "Applies when physical injury qualifies as 'grievous hurt' under statutory definitions (e.g. emasculation, permanent deprivation of sight/hearing, fracture or dislocation of bone/tooth, or severe bodily pain exceeding 20 days).",
    ingredients: [
      "Causing grievous hurt as defined under Section 320 IPC (Section 116 BNS).",
      "Act done voluntarily with requisite intention or knowledge."
    ],
    punishment: "Imprisonment up to 7 years and fine.",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 117(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - Grievous Hurt",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-341",
    slug: "ipc-341-bns-126-2-wrongful-restraint",
    ipcSection: "341",
    ipcTitle: "Punishment for Wrongful Restraint",
    bnsSection: "126(2)",
    bnsTitle: "Punishment for Wrongful Restraint",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes voluntarily obstructing any person so as to prevent that person from proceeding in any direction.",
    plainLanguageExplanation:
      "Protects citizen freedom of physical movement against unauthorized road blockades, private confinement, or physical prevention from proceeding along a public path.",
    ingredients: [
      "Obstruction of a person.",
      "The person has a right to proceed in that direction.",
      "Obstruction prevents the person from proceeding."
    ],
    punishment: "Simple imprisonment up to 1 month, or fine up to ₹500, or both.",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 126(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 341",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-363",
    slug: "ipc-363-bns-137-2-kidnapping",
    ipcSection: "363",
    ipcTitle: "Punishment for Kidnapping",
    bnsSection: "137(2)",
    bnsTitle: "Punishment for Kidnapping",
    category: "Offences Affecting Life & Body",
    shortDescription: "Penalizes kidnapping any person from India or from lawful guardianship.",
    plainLanguageExplanation:
      "Protects minors and lawfully guarded persons from being taken or enticed away from parents or legal guardians without consent.",
    ingredients: [
      "Taking or enticing away a minor (under 16 for male, under 18 for female) or person of unsound mind.",
      "Out of the keeping of the lawful guardian without the guardian's consent."
    ],
    punishment: "Imprisonment up to 7 years and fine.",
    bailable: "Bailable (under IPC 363) / Non-bailable under state amendments & BNS.",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 137(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - Kidnapping",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-506",
    slug: "ipc-506-bns-351-2-criminal-intimidation",
    ipcSection: "506",
    ipcTitle: "Punishment for Criminal Intimidation",
    bnsSection: "351(2)",
    bnsTitle: "Punishment for Criminal Intimidation",
    category: "Criminal Intimidation & Public Tranquility",
    shortDescription: "Penalizes threatening another with injury to person, reputation, or property.",
    plainLanguageExplanation:
      "Covers verbal, physical, or electronic threats intended to cause alarm, or to force a person to do any act they are not legally bound to do.",
    ingredients: [
      "Threat of injury to person, reputation, or property.",
      "Intent to cause alarm or force an unlawful action or omission."
    ],
    punishment: "Imprisonment up to 2 years, or fine, or both; if threat is to cause death or grievous hurt, up to 7 years.",
    bailable: "Bailable (Part 1) / Non-Bailable in specific states",
    cognizable: "Non-Cognizable (Cognizable under state amendments)",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 351(2) and 351(3) of BNS.",
    officialReferences: [
      {
        title: "India Code - Criminal Intimidation",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-509",
    slug: "ipc-509-bns-79-insulting-modesty-woman",
    ipcSection: "509",
    ipcTitle: "Word, Gesture or Act Intended to Insult the Modesty of a Woman",
    bnsSection: "79",
    bnsTitle: "Word, Gesture or Act Intended to Insult the Modesty of a Woman",
    category: "Offences Against Women",
    shortDescription: "Penalizes uttering words, making sounds/gestures, or intruding on privacy to insult modesty.",
    plainLanguageExplanation:
      "Applies to verbal abuse, stalking gestures, lewd commentary, or cyber messages directed at female modesty or privacy.",
    ingredients: [
      "Uttering any word, making sound or gesture, or exhibiting any object.",
      "Intending that such word or sound shall be heard, or gesture seen by a woman.",
      "Intruding upon the privacy of such woman with intent to insult her modesty."
    ],
    punishment: "Simple imprisonment up to 3 years and fine.",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 79 of BNS, 2023.",
    officialReferences: [
      {
        title: "India Code - Section 509",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-467",
    slug: "ipc-467-bns-338-forgery-valuable-security",
    ipcSection: "467",
    ipcTitle: "Forgery of Valuable Security, Will, etc.",
    bnsSection: "338",
    bnsTitle: "Forgery of Valuable Security, Will, etc.",
    category: "Fraud & Document Crimes",
    shortDescription: "Severe punishment for fabricating fake wills, power of attorneys, deeds, or valuable securities.",
    plainLanguageExplanation:
      "Critical criminal provision in real estate and financial frauds involving forged land title deeds, fake wills, forged bank guarantees, or fraudulent powers of attorney.",
    ingredients: [
      "Making of a false document.",
      "Document purports to be a valuable security, will, authority to adopt, or give power to receive money/goods."
    ],
    punishment: "Imprisonment for life, or imprisonment up to 10 years, and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 338 of BNS.",
    officialReferences: [
      {
        title: "India Code - Forgery",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-468",
    slug: "ipc-468-bns-336-3-forgery-for-cheating",
    ipcSection: "468",
    ipcTitle: "Forgery for Purpose of Cheating",
    bnsSection: "336(3)",
    bnsTitle: "Forgery for Purpose of Cheating",
    category: "Fraud & Document Crimes",
    shortDescription: "Penalizes forging documents with the intent that they will be used for cheating.",
    plainLanguageExplanation:
      "Applies when fraudulent educational certificates, bank slips, invoices, or identification proofs are created specifically to cheat institutions or individuals.",
    ingredients: [
      "Accused forged a document.",
      "Act done intending that the document forged shall be used for the purpose of cheating."
    ],
    punishment: "Imprisonment up to 7 years and fine.",
    bailable: "Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 336(3) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 468",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-471",
    slug: "ipc-471-bns-340-2-using-forged-document",
    ipcSection: "471",
    ipcTitle: "Using as Genuine a Forged Document",
    bnsSection: "340(2)",
    bnsTitle: "Using as Genuine a Forged Document",
    category: "Fraud & Document Crimes",
    shortDescription: "Fraudulently or dishonestly using any document known to be forged as if it were genuine.",
    plainLanguageExplanation:
      "Penalizes presenting forged agreements, fake bank statements, or counterfeit IDs to banks, courts, or registries even if the user was not the original creator.",
    ingredients: [
      "Fraudulent or dishonest use of a document as genuine.",
      "Knowledge or reason to believe that the document was forged."
    ],
    punishment: "Punished in the same manner as if the accused had forged the document.",
    bailable: "Bailable (if underlying forgery is bailable) / Non-Bailable",
    cognizable: "Cognizable",
    trialCourt: "Magistrate of the First Class",
    transitionalNote: "Corresponds to Section 340(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - IPC 471",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-279",
    slug: "ipc-279-bns-281-rash-driving",
    ipcSection: "279",
    ipcTitle: "Rash Driving or Riding on a Public Way",
    bnsSection: "281",
    bnsTitle: "Rash Driving or Riding on a Public Way",
    category: "Public Safety & Traffic",
    shortDescription: "Driving any vehicle on a public way so rashly or negligently as to endanger human life.",
    plainLanguageExplanation:
      "Applied in road traffic violations where high speed or reckless maneuver on public roads endangers pedestrians or other motorists.",
    ingredients: [
      "Driving a vehicle or riding on a public way.",
      "Manner of driving was rash or negligent.",
      "Endangering human life or likely to cause hurt or injury to any person."
    ],
    punishment: "Imprisonment up to 6 months, or fine up to ₹1,000, or both.",
    bailable: "Bailable",
    cognizable: "Cognizable",
    trialCourt: "Any Magistrate",
    transitionalNote: "Corresponds to Section 281 of BNS.",
    officialReferences: [
      {
        title: "India Code - Traffic Offences",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-120b",
    slug: "ipc-120b-bns-61-criminal-conspiracy",
    ipcSection: "120B",
    ipcTitle: "Punishment of Criminal Conspiracy",
    bnsSection: "61(2)",
    bnsTitle: "Criminal Conspiracy",
    category: "General Principles & Inchoate Crimes",
    shortDescription: "Penalizes agreements between two or more persons to commit an illegal act.",
    plainLanguageExplanation:
      "Applied alongside substantive charges where multiple conspirators agree and coordinate together to execute a crime.",
    ingredients: [
      "Agreement between two or more persons.",
      "Agreement to do or cause to be done an illegal act or an act by illegal means.",
      "Overt act required unless the agreement itself is to commit an offence."
    ],
    punishment:
      "Same punishment as provided for the abetment of the principal offence, or imprisonment up to 6 months/fine for non-serious offences.",
    bailable: "Same as substantive offence",
    cognizable: "Same as substantive offence",
    trialCourt: "Same as substantive offence",
    transitionalNote: "Corresponds to Section 61(2) of BNS.",
    officialReferences: [
      {
        title: "India Code - Criminal Conspiracy",
        url: "https://www.indiacode.nic.in/"
      }
    ]
  },
  {
    id: "ipc-34",
    slug: "ipc-34-bns-3-5-common-intention",
    ipcSection: "34",
    ipcTitle: "Acts Done by Several Persons in Furtherance of Common Intention",
    bnsSection: "3(5)",
    bnsTitle: "Joint Liability / Common Intention",
    category: "General Principles & Inchoate Crimes",
    shortDescription: "Joint liability rule holding every participant liable for criminal acts done with shared intention.",
    plainLanguageExplanation:
      "Not a standalone substantive offence, but a cardinal rule of joint liability. When multiple persons participate in a crime sharing a prior meeting of minds, each is held liable as if they committed the act alone.",
    ingredients: [
      "A criminal act done by several persons.",
      "Act done in furtherance of the common intention of all.",
      "Participation in the commission of the act (presence or active facilitation)."
    ],
    punishment: "Liable in the same manner as if the act was done by each participant alone.",
    bailable: "Governed by substantive offence charged",
    cognizable: "Governed by substantive offence charged",
    trialCourt: "Governed by substantive offence charged",
    transitionalNote: "Corresponds to Section 3(5) of Bharatiya Nyaya Sanhita, 2023.",
    officialReferences: [
      {
        title: "MHA - BNS Joint Liability Provisions",
        url: "https://www.mha.gov.in/en/commoncontent/new-criminal-laws"
      }
    ]
  }
];

export const IPC_CATEGORIES = [
  "All Categories",
  "Offences Affecting Life & Body",
  "Offences Against Women",
  "Offences Against Property & Fraud",
  "Fraud & Document Crimes",
  "Criminal Intimidation & Public Tranquility",
  "Public Safety & Traffic",
  "General Principles & Inchoate Crimes"
];

export function getSectionBySlug(slug) {
  if (!slug) return null;
  const target = slug.toLowerCase();
  return (
    IPC_BNS_SECTIONS.find(
      (s) =>
        s.slug.toLowerCase() === target ||
        s.id.toLowerCase() === target ||
        `ipc-${s.ipcSection.toLowerCase()}` === target ||
        `bns-${s.bnsSection.toLowerCase()}` === target
    ) || null
  );
}
