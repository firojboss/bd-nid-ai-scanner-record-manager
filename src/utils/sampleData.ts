import { NIDExtractedData } from "../types.js";

// Helper SVG to generate high-resolution sample card preview images
function createSampleCardSvg(
  nameBn: string,
  nameEn: string,
  father: string,
  mother: string,
  dob: string,
  nid: string,
  type: 'smart' | 'old'
): string {
  const isSmart = type === 'smart';
  const bgColor = isSmart ? '#1e293b' : '#14532d';
  const headerBg = isSmart ? '#0f172a' : '#052e16';
  const badgeColor = isSmart ? '#0284c7' : '#eab308';
  
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
  <defs>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bgColor}" />
      <stop offset="100%" stop-color="#090d16" />
    </linearGradient>
    <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  
  <!-- Outer Card Frame -->
  <rect width="600" height="380" rx="20" fill="url(#cardGrad)" stroke="#334155" stroke-width="2"/>
  
  <!-- Card Header -->
  <rect width="600" height="75" rx="20" fill="${headerBg}"/>
  <rect y="55" width="600" height="20" fill="${headerBg}"/>
  
  <!-- Emblem Circle -->
  <circle cx="50" cy="38" r="24" fill="#dc2626"/>
  <circle cx="50" cy="38" r="18" fill="#15803d"/>
  <circle cx="50" cy="38" r="8" fill="#eab308"/>
  
  <!-- Header Text -->
  <text x="86" y="32" font-family="sans-serif" font-size="15" font-weight="bold" fill="#f8fafc">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</text>
  <text x="86" y="52" font-family="sans-serif" font-size="12" fill="#94a3b8">Government of the People's Republic of Bangladesh</text>
  
  <!-- Card Type Tag -->
  <rect x="420" y="24" width="160" height="28" rx="14" fill="${badgeColor}" fill-opacity="0.2" stroke="${badgeColor}" stroke-width="1"/>
  <text x="500" y="42" font-family="sans-serif" font-size="11" font-weight="bold" fill="#f8fafc" text-anchor="middle">
    ${isSmart ? 'SMART NID CARD' : 'NATIONAL ID CARD'}
  </text>
  
  <!-- Chip for Smart Card -->
  ${isSmart ? `
  <rect x="40" y="95" width="65" height="50" rx="6" fill="url(#chipGrad)" stroke="#b45309" stroke-width="1.5"/>
  <line x1="40" y1="120" x2="105" y2="120" stroke="#78350f" stroke-width="1"/>
  <line x1="72" y1="95" x2="72" y2="145" stroke="#78350f" stroke-width="1"/>
  ` : `
  <!-- Photo Box for Old Card -->
  <rect x="40" y="95" width="90" height="110" rx="8" fill="#334155" stroke="#475569" stroke-width="1.5"/>
  <circle cx="85" cy="135" r="22" fill="#64748b"/>
  <path d="M55 195 C55 165, 115 165, 115 195 Z" fill="#64748b"/>
  `}

  <!-- Photo Box for Smart Card (Right side) -->
  ${isSmart ? `
  <rect x="470" y="95" width="90" height="110" rx="8" fill="#334155" stroke="#475569" stroke-width="1.5"/>
  <circle cx="515" cy="135" r="22" fill="#64748b"/>
  <path d="M485 195 C485 165, 545 165, 545 195 Z" fill="#64748b"/>
  ` : ''}

  <!-- Text Details -->
  <g transform="translate(${isSmart ? '120' : '150'}, 105)">
    <text x="0" y="15" font-family="sans-serif" font-size="12" fill="#94a3b8">নাম:</text>
    <text x="50" y="15" font-family="sans-serif" font-size="14" font-weight="bold" fill="#38bdf8">${nameBn}</text>
    
    <text x="0" y="38" font-family="sans-serif" font-size="12" fill="#94a3b8">Name:</text>
    <text x="50" y="38" font-family="sans-serif" font-size="13" font-weight="600" fill="#f1f5f9">${nameEn}</text>
    
    <text x="0" y="60" font-family="sans-serif" font-size="12" fill="#94a3b8">পিতা:</text>
    <text x="50" y="60" font-family="sans-serif" font-size="13" fill="#e2e8f0">${father}</text>
    
    <text x="0" y="82" font-family="sans-serif" font-size="12" fill="#94a3b8">মাতা:</text>
    <text x="50" y="82" font-family="sans-serif" font-size="13" fill="#e2e8f0">${mother}</text>
    
    <text x="0" y="104" font-family="sans-serif" font-size="12" fill="#94a3b8">জন্ম তারিখ:</text>
    <text x="80" y="104" font-family="sans-serif" font-size="13" font-weight="bold" fill="#f59e0b">${dob}</text>
  </g>

  <!-- NID Number Bottom Bar -->
  <rect x="30" y="270" width="540" height="50" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
  <text x="50" y="300" font-family="sans-serif" font-size="12" font-weight="bold" fill="#94a3b8">NID NO:</text>
  <text x="130" y="302" font-family="monospace" font-size="20" font-weight="bold" fill="#ef4444" letter-spacing="3">${nid}</text>
  
  <!-- Security Hologram Indicator -->
  <circle cx="530" cy="295" r="14" fill="#0284c7" fill-opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="530" y="299" font-family="sans-serif" font-size="8" fill="#38bdf8" text-anchor="middle">BD</text>
  
  <!-- Bottom Signature and Issue -->
  <text x="40" y="355" font-family="sans-serif" font-size="10" fill="#64748b">স্বাক্ষর / Signature</text>
  <path d="M40 340 Q 70 330 90 340 T 130 335" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <text x="480" y="355" font-family="sans-serif" font-size="10" fill="#64748b">জাতীয় পরিচয়পত্র</text>
</svg>
`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleNID {
  id: string;
  title: string;
  titleBn: string;
  subtitle: string;
  cardType: 'smart_card' | 'old_laminated' | 'server_copy';
  frontImage: string;
  data: NIDExtractedData;
}

export const SAMPLE_NID_LIST: SampleNID[] = [
  {
    id: "sample_smart_1",
    title: "10-Digit Smart NID Card (Front)",
    titleBn: "১০ ডিজিট স্মার্ট এনআইডি কার্ড (সামনের অংশ)",
    subtitle: "Modern Chip-embedded Bangladesh Smart Card",
    cardType: "smart_card",
    frontImage: createSampleCardSvg(
      "তানজিলুর রহমান শাকিল",
      "TANZILUR RAHMAN SHAKIL",
      "আব্দুর রশিদ",
      "লুৎফুন্নাহার বেগম",
      "1992-07-18",
      "8214950283",
      "smart"
    ),
    data: {
      nameBangla: "তানজিলুর রহমান শাকিল",
      nameEnglish: "TANZILUR RAHMAN SHAKIL",
      fatherName: "আব্দুর রশিদ",
      motherName: "লুৎফুন্নাহার বেগম",
      dateOfBirth: "1992-07-18",
      nidNumber: "8214950283",
      placeOfBirth: "ঢাকা",
      bloodGroup: "A+",
      addressBangla: "বাসা: ১৮/এ, রোড: ৫, ধানমন্ডি, ঢাকা-১২০৫",
      addressEnglish: "House: 18/A, Road: 5, Dhanmondi, Dhaka-1205",
      issueDate: "2019-03-12",
      cardType: "smart_card",
      cardSide: "front",
      accuracyScore: 99.4,
      fieldConfidence: {
        nameBangla: 99,
        nameEnglish: 100,
        fatherName: 99,
        motherName: 98,
        dateOfBirth: 100,
        nidNumber: 100,
        placeOfBirth: 99,
        bloodGroup: 98,
        addressBangla: 97,
      },
      validationIssues: ["Standard 10-digit Smart Card format verified"],
    },
  },
  {
    id: "sample_old_1",
    title: "17-Digit Old Laminated NID",
    titleBn: "১৭ ডিজিট পুরাতন লেমিনেটেড জাতীয় পরিচয়পত্র",
    subtitle: "Classic Green Laminated Bangladesh National ID",
    cardType: "old_laminated",
    frontImage: createSampleCardSvg(
      "মোসাঃ শামীমা নাসরিন",
      "SHAMIMA NASRIN",
      "মোঃ সিরাজুল ইসলাম",
      "রোকেয়া খাতুন",
      "1986-10-24",
      "19865618290000418",
      "old"
    ),
    data: {
      nameBangla: "মোসাঃ শামীমা নাসরিন",
      nameEnglish: "SHAMIMA NASRIN",
      fatherName: "মোঃ সিরাজুল ইসলাম",
      motherName: "রোকেয়া খাতুন",
      dateOfBirth: "1986-10-24",
      nidNumber: "19865618290000418",
      pinNumber: "19865618290000418",
      placeOfBirth: "রাজশাহী",
      bloodGroup: "O+",
      addressBangla: "গ্রাম/মহল্লা: উপশহর, সেক্টর: ২, ডাকঘর: সোপুরা, বোয়ালিয়া, রাজশাহী-৬২০৩",
      issueDate: "2008-08-19",
      cardType: "old_laminated",
      cardSide: "front",
      accuracyScore: 98.1,
      fieldConfidence: {
        nameBangla: 98,
        nameEnglish: 99,
        fatherName: 98,
        motherName: 97,
        dateOfBirth: 99,
        nidNumber: 99,
        placeOfBirth: 96,
        bloodGroup: 95,
        addressBangla: 95,
      },
      validationIssues: ["17-digit Old Laminated NID Format (with birth year prefix)"],
    },
  },
  {
    id: "sample_smart_2",
    title: "10-Digit Smart Card (Female Citizen)",
    titleBn: "স্মার্ট জাতীয় পরিচয়পত্র (নারী নাগরিক)",
    subtitle: "Chittagong Region Citizen ID",
    cardType: "smart_card",
    frontImage: createSampleCardSvg(
      "আয়েশা সিদ্দিকা মিমি",
      "AYESHA SIDDIKA MIMI",
      "মোহাম্মদ মোস্তফা কামাল",
      "ফাতেমা জোহরা",
      "1998-02-14",
      "4192083756",
      "smart"
    ),
    data: {
      nameBangla: "আয়েশা সিদ্দিকা মিমি",
      nameEnglish: "AYESHA SIDDIKA MIMI",
      fatherName: "মোহাম্মদ মোস্তফা কামাল",
      motherName: "ফাতেমা জোহরা",
      spouseName: "মোঃ মাহমুদ হাসান",
      dateOfBirth: "1998-02-14",
      nidNumber: "4192083756",
      placeOfBirth: "চট্টগ্রাম",
      bloodGroup: "B+",
      addressBangla: "বাসা: ৯, লেন: ৩, হালিশহর হাউজিং এস্টেট, ডবলমুরিং, চট্টগ্রাম-৪২২৫",
      issueDate: "2020-11-05",
      cardType: "smart_card",
      cardSide: "front",
      accuracyScore: 99.0,
      fieldConfidence: {
        nameBangla: 99,
        nameEnglish: 100,
        fatherName: 99,
        motherName: 98,
        spouseName: 97,
        dateOfBirth: 100,
        nidNumber: 100,
        placeOfBirth: 99,
        bloodGroup: 100,
        addressBangla: 98,
      },
      validationIssues: ["Verified 10-digit Smart Card"],
    },
  },
];
