import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NIDRecord, DataSheetAccount, NoteExpense } from "../src/types.js";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "supabase_config.json");
const IS_VERCEL = Boolean(process.env.VERCEL);

let cachedSupabase: SupabaseClient | null = null;
let savedCustomUrl = "";
let savedCustomKey = "";

function loadSavedCredentials() {
  if (IS_VERCEL) return;
  if (savedCustomUrl && savedCustomKey) return;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      if (parsed.url && parsed.key) {
        savedCustomUrl = parsed.url;
        savedCustomKey = parsed.key;
      }
    }
  } catch (e) {
    // ignore
  }
}

export function setSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    savedCustomUrl = url;
    savedCustomKey = key;
    cachedSupabase = createClient(url, key);

    if (IS_VERCEL) return;

    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(CONFIG_FILE, JSON.stringify({ url, key, savedAt: new Date().toISOString() }, null, 2), "utf-8");
    } catch (err) {
      console.error("[Supabase] Failed to persist credentials locally:", err);
    }
  }
}

export function getSupabaseServerClient(): SupabaseClient | null {
  loadSavedCredentials();
  if (cachedSupabase) return cachedSupabase;

  const url = savedCustomUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    savedCustomKey ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) return null;

  try {
    cachedSupabase = createClient(url, key);
    return cachedSupabase;
  } catch (err) {
    console.error("[Supabase] Failed to create server client:", err);
    return null;
  }
}

export function isSupabaseActive(): boolean {
  return Boolean(getSupabaseServerClient());
}

// Convert app NIDRecord to Supabase snake_case schema
export function toSupabaseNidRecord(r: NIDRecord) {
  return {
    id: r.id,
    nid_number: r.nidNumber,
    name_bangla: r.nameBangla,
    name_english: r.nameEnglish || null,
    father_name: r.fatherName || null,
    mother_name: r.motherName || null,
    spouse_name: r.spouseName || null,
    date_of_birth: r.dateOfBirth || null,
    pin_number: r.pinNumber || null,
    place_of_birth: r.placeOfBirth || null,
    blood_group: r.bloodGroup || null,
    address_bangla: r.addressBangla || null,
    address_english: r.addressEnglish || null,
    issue_date: r.issueDate || null,
    card_type: r.cardType || "smart_card",
    card_side: r.cardSide || "front",
    accuracy_score: r.accuracyScore || 98.0,
    field_confidence: r.fieldConfidence || {},
    validation_issues: r.validationIssues || [],
    status: r.status || "verified",
    notes: r.notes || null,
    front_image_url: r.frontImage || null,
    back_image_url: r.backImage || null,
    scan_source: r.scanSource || "upload",
    original_file_name: r.originalFileName || null,
    original_file_size: r.originalFileSize || null,
    created_at: r.createdAt || new Date().toISOString(),
    updated_at: r.updatedAt || new Date().toISOString(),
  };
}

// Convert Supabase record to app NIDRecord
export function fromSupabaseNidRecord(db: any): NIDRecord {
  return {
    id: db.id,
    nidNumber: db.nid_number,
    nameBangla: db.name_bangla,
    nameEnglish: db.name_english || "",
    fatherName: db.father_name || "",
    motherName: db.mother_name || "",
    spouseName: db.spouse_name || "",
    dateOfBirth: db.date_of_birth || "",
    pinNumber: db.pin_number || "",
    placeOfBirth: db.place_of_birth || "",
    bloodGroup: db.blood_group || "",
    addressBangla: db.address_bangla || "",
    addressEnglish: db.address_english || "",
    issueDate: db.issue_date || "",
    cardType: db.card_type || "smart_card",
    cardSide: db.card_side || "front",
    accuracyScore: parseFloat(db.accuracy_score) || 98.0,
    fieldConfidence: db.field_confidence || {},
    validationIssues: db.validation_issues || [],
    status: db.status || "verified",
    notes: db.notes || "",
    frontImage: db.front_image_url || "",
    backImage: db.back_image_url || "",
    scanSource: db.scan_source || "upload",
    originalFileName: db.original_file_name || "",
    originalFileSize: db.original_file_size || "",
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString(),
  };
}

// Convert app DataSheetAccount to Supabase
export function toSupabaseDataSheetAccount(a: DataSheetAccount) {
  return {
    id: a.id,
    site_id: a.siteId,
    site_name: a.siteName,
    site_logo: a.siteLogo || null,
    account_id: a.accountId,
    password: a.password,
    phone_number: a.phoneNumber || null,
    email: a.email || null,
    two_fa: a.twoFa || null,
    two_fa_disable_key: a.twoFaDisableKey || null,
    name: a.name || null,
    nid_number: a.nidNumber || null,
    nid_record_id: a.nidRecordId || null,
    created_timestamp: a.createdTimestamp || null,
    edited_timestamp: a.editedTimestamp || null,
    balance: a.balance || "0",
    status: a.status || "New Account",
    notes: a.notes || null,
    updated_at: new Date().toISOString(),
  };
}

// Convert Supabase to app DataSheetAccount
export function fromSupabaseDataSheetAccount(db: any): DataSheetAccount {
  return {
    id: db.id,
    siteId: db.site_id,
    siteName: db.site_name,
    siteLogo: db.site_logo || "",
    accountId: db.account_id,
    password: db.password,
    phoneNumber: db.phone_number || "",
    email: db.email || "",
    twoFa: db.two_fa || "",
    twoFaDisableKey: db.two_fa_disable_key || "",
    name: db.name || "",
    nidNumber: db.nid_number || "",
    nidRecordId: db.nid_record_id || undefined,
    createdTimestamp: db.created_timestamp || "",
    editedTimestamp: db.edited_timestamp || "",
    balance: db.balance || "0",
    status: db.status || "New Account",
    notes: db.notes || "",
  };
}

// Convert app NoteExpense to Supabase
export function toSupabaseNoteExpense(e: NoteExpense) {
  return {
    id: e.id,
    category: e.category,
    title: e.title,
    amount: e.amount,
    details: e.details || null,
    date: e.date,
    time: e.time,
    timestamp: e.timestamp || new Date().toISOString(),
    payment_method: e.paymentMethod || "Cash",
    created_at: e.createdAt || new Date().toISOString(),
    updated_at: e.updatedAt || new Date().toISOString(),
  };
}

// Convert Supabase to app NoteExpense
export function fromSupabaseNoteExpense(db: any): NoteExpense {
  return {
    id: db.id,
    category: db.category,
    title: db.title,
    amount: Number(db.amount) || 0,
    details: db.details || "",
    date: db.date || "",
    time: db.time || "",
    timestamp: db.timestamp || db.created_at || new Date().toISOString(),
    paymentMethod: db.payment_method || "Cash",
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString(),
  };
}

// Background sync helpers
export async function syncRecordToSupabase(record: NIDRecord) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const payload = toSupabaseNidRecord(record);
    const { error } = await supabase.from("bd_nid_records").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("[Supabase Background Sync] Failed to upsert NID record:", error.message);
    } else {
      console.log(`[Supabase Background Sync] Synced NID Record ${record.id} (${record.nidNumber})`);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function deleteRecordFromSupabase(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("bd_nid_records").delete().eq("id", id);
    if (error) {
      console.error("[Supabase Background Sync] Failed to delete record:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function deleteBulkRecordsFromSupabase(ids: string[]) {
  const supabase = getSupabaseServerClient();
  if (!supabase || ids.length === 0) return;
  try {
    const { error } = await supabase.from("bd_nid_records").delete().in("id", ids);
    if (error) {
      console.error("[Supabase Background Sync] Failed to bulk delete records:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function syncAccountToSupabase(account: DataSheetAccount) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const payload = toSupabaseDataSheetAccount(account);
    const { error } = await supabase.from("bd_datasheet_accounts").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("[Supabase Background Sync] Failed to upsert DataSheet account:", error.message);
    } else {
      console.log(`[Supabase Background Sync] Synced DataSheet Account ${account.id} (${account.siteName})`);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function syncBatchAccountsToSupabase(accounts: DataSheetAccount[]) {
  const supabase = getSupabaseServerClient();
  if (!supabase || accounts.length === 0) return;
  try {
    const payload = accounts.map(toSupabaseDataSheetAccount);
    const { error } = await supabase.from("bd_datasheet_accounts").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("[Supabase Background Sync] Failed to batch upsert DataSheet accounts:", error.message);
    } else {
      console.log(`[Supabase Background Sync] Synced ${accounts.length} DataSheet Accounts`);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function deleteAccountFromSupabase(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("bd_datasheet_accounts").delete().eq("id", id);
    if (error) {
      console.error("[Supabase Background Sync] Failed to delete DataSheet account:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function deleteBulkAccountsFromSupabase(ids: string[]) {
  const supabase = getSupabaseServerClient();
  if (!supabase || ids.length === 0) return;
  try {
    const { error } = await supabase.from("bd_datasheet_accounts").delete().in("id", ids);
    if (error) {
      console.error("[Supabase Background Sync] Failed to bulk delete accounts:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function syncExpenseToSupabase(expense: NoteExpense) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const payload = toSupabaseNoteExpense(expense);
    const { error } = await supabase.from("bd_note_expenses").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("[Supabase Background Sync] Failed to upsert NoteExpense:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

export async function deleteExpenseFromSupabase(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  try {
    const { error } = await supabase.from("bd_note_expenses").delete().eq("id", id);
    if (error) {
      console.error("[Supabase Background Sync] Failed to delete NoteExpense:", error.message);
    }
  } catch (err: any) {
    console.error("[Supabase Background Sync] Error:", err?.message);
  }
}

// Fetch all live records directly from Supabase (Source of Truth)
export async function fetchRecordsFromSupabase(): Promise<NIDRecord[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("bd_nid_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase Fetch Records] Error:", error.message);
      return null;
    }
    return (data || []).map(fromSupabaseNidRecord);
  } catch (err: any) {
    console.error("[Supabase Fetch Records] Exception:", err?.message);
    return null;
  }
}

// Fetch all live accounts directly from Supabase (Source of Truth)
export async function fetchAccountsFromSupabase(): Promise<DataSheetAccount[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("bd_datasheet_accounts")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase Fetch Accounts] Error:", error.message);
      return null;
    }
    return (data || []).map(fromSupabaseDataSheetAccount);
  } catch (err: any) {
    console.error("[Supabase Fetch Accounts] Exception:", err?.message);
    return null;
  }
}

// Fetch all live expenses directly from Supabase (Source of Truth)
export async function fetchExpensesFromSupabase(): Promise<NoteExpense[] | null> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("bd_note_expenses")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[Supabase Fetch Expenses] Error:", error.message);
      return null;
    }
    return (data || []).map(fromSupabaseNoteExpense);
  } catch (err: any) {
    console.error("[Supabase Fetch Expenses] Exception:", err?.message);
    return null;
  }
}



