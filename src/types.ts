export type CardType = 'smart_card' | 'old_laminated' | 'server_copy' | 'unknown';
export type CardSide = 'front' | 'back' | 'both';
export type RecordStatus = 'verified' | 'pending_review' | 'flagged' | 'archived';

export interface FieldConfidence {
  nameBangla: number;
  nameEnglish: number;
  fatherName: number;
  motherName: number;
  spouseName?: number;
  dateOfBirth: number;
  nidNumber: number;
  pinNumber?: number;
  placeOfBirth: number;
  bloodGroup: number;
  addressBangla: number;
  addressEnglish?: number;
  issueDate?: number;
}

export interface NIDExtractedData {
  nameBangla: string;
  nameEnglish: string;
  fatherName: string;
  motherName: string;
  spouseName?: string;
  dateOfBirth: string;
  nidNumber: string;
  pinNumber?: string;
  placeOfBirth: string;
  bloodGroup: string;
  addressBangla: string;
  addressEnglish?: string;
  issueDate?: string;
  cardType: CardType;
  cardSide: CardSide;
  accuracyScore: number;
  fieldConfidence: FieldConfidence;
  validationIssues?: string[];
  extractedRawText?: string;
}

export interface NIDRecord extends NIDExtractedData {
  id: string;
  status: RecordStatus;
  notes?: string;
  frontImage?: string; // base64 or url
  backImage?: string;  // base64 or url
  originalFileName?: string;
  originalFileSize?: string;
  scanSource?: 'camera' | 'upload' | 'sample' | 'api';
  createdAt: string;
  updatedAt: string;
  verifiedBy?: string;
}

export interface ScanRequestPayload {
  images: Array<{
    data: string; // base64 string
    mimeType: string;
    side?: 'front' | 'back' | 'auto';
  }>;
}

export interface ScanResponsePayload {
  success: boolean;
  data?: NIDExtractedData;
  error?: string;
  processingTimeMs?: number;
}

export interface DashboardStats {
  totalRecords: number;
  smartCardCount: number;
  oldNidCount: number;
  serverCopyCount: number;
  avgAccuracy: number;
  verifiedCount: number;
  pendingCount: number;
  recentScans: NIDRecord[];
  districtStats: { district: string; count: number }[];
}

export type AccountStatus = 'New Account' | 'Running' | 'Redeem' | 'Reject';

export interface NoteExpense {
  id: string;
  category: string; // e.g. "NID ফি", "সিম কার্ড", "সার্ভার বিল", "নাস্তা / যাতায়াত", "অ্যাকাউন্ট রিচার্জ", "অন্যান্য"
  title: string;    // খরচের বিবরণ / শিরোনাম
  amount: number;   // টাকার পরিমাণ
  details?: string; // বিস্তারিত বিবরণ (ঐচ্ছিক)
  date: string;     // e.g. "2026-08-18"
  time: string;     // e.g. "01:25 PM"
  timestamp: string;// ISO string
  paymentMethod?: string; // "Cash" | "bKash" | "Nagad" | "Rocket" | "Bank"
  createdAt: string;
  updatedAt: string;
}

export interface SiteDefinition {
  id: string;
  name: string;
  logo: string;
  color: string;
  badgeBg: string;
  category?: 'betting' | 'crypto' | 'mfs' | 'wallet' | 'other';
}

export interface DataSheetAccount {
  id: string;
  siteId: string;
  siteName: string;
  siteLogo?: string;
  accountId: string;          // e.g. "1726514825"
  password: string;           // e.g. "fr9cdc4h"
  phoneNumber: string;        // e.g. "" or "017XXXXXXXX"
  email: string;              // e.g. "mst135354663@gmail.com"
  twoFa: string;              // e.g. "IUVORZNYTSIBLFLR"
  twoFaDisableKey: string;    // e.g. "H3WIIfxc9ilYN6Vsl1ds9g=="
  name: string;               // e.g. "Rana (According NID Data)"
  nidNumber?: string;         // linked NID number
  nidRecordId?: string;       // linked NID record id
  createdTimestamp: string;   // e.g. "04/07/2026 - 7:40:18 pm"
  editedTimestamp?: string;   // e.g. "04/07/2026 - 8:12:05 pm" (1-click set)
  balance: string;            // e.g. "10,000"
  status: AccountStatus;      // 'New Account' | 'Running' | 'Redeem' | 'Reject'
  notes?: string;
}

export type ViewMode = 'datasheet' | 'scanner' | 'dashboard' | 'analytics' | 'notepad' | 'php-api' | 'templates';

