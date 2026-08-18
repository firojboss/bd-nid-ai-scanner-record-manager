১. সাইটটি কি লাইভ (Production) করার জন্য পুরোপুরি প্রস্তুত?
উত্তর: হ্যাঁ, সাইটটি ১০০% প্রস্তুত।
সমস্ত কোড টাইপস্ক্রিপ্ট কম্পাইলার (tsc) ও প্রোডাকশন বিল্ডার (vite build & esbuild) দ্বারা যাচাইকৃত এবং কোনো এরর ছাড়াই সফলভাবে বিল্ড হচ্ছে।
Gemini AI OCR স্ক্যানার, মাল্টি-সাইট ডাটাশিট, নোটপ্যাড এক্সপেন্সেস, BDT (UTC+6) সময় এবং রিয়েল-টাইম ক্লায়েন্ট ইন্টেলিজেন্স ফুটার পুরোপুরি সক্রিয়।
২. ভবিষ্যতে নতুন Database (Supabase) সেটআপ করতে কোন ফাইলে 'Key' পরিবর্তন করবেন?
ভবিষ্যতে নতুন ডাটাবেস যুক্ত করতে আপনাকে প্রজেক্টের রুট ডিরেক্টরিতে থাকা .env ফাইলটি আপডেট করতে হবে (অথবা হোস্টিং প্ল্যাটফর্মের Environment Variables সেকশনে দিতে হবে)।
যে যে কি (Keys) পরিবর্তন করবেন:
প্রজেক্টের রুট ডিরেক্টরিতে .env ফাইলে নিচের ভেরিয়েবলগুলো বসাবেন:
code
Env
# ১. Gemini AI OCR Key (সার্ভার সাইড প্রক্সির জন্য)
GEMINI_API_KEY="আপনার_নতুন_Gemini_API_Key"

# ২. Supabase Database Backend Keys
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-secret-key"

# ৩. Supabase Frontend Client Keys
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
ডাটাবেস টেবিল তৈরি করবেন কীভাবে?
নতুন Supabase প্রজেক্ট খুললে SQL Editor-এ গিয়ে টেবিলগুলো তৈরি করার সম্পূর্ণ SQL স্ক্রিপ্টটি প্রজেক্টের src/utils/supabaseSql.ts ফাইলে রয়েছে। সেখানে থাকা SQL কোডটি কপি করে Supabase SQL Editor-এ রান (Run) করলেই bd_nid_records, bd_datasheet_accounts, এবং bd_note_expenses তিনটি টেবিল অটোমেটিক তৈরি হয়ে যাবে।
৩. GitHub-এ এখন পুশ করা যাবে কি?
উত্তর: হ্যাঁ, এখনই গিটহাবে পুশ করতে পারবেন।
প্রজেক্টের .gitignore ফাইল ইতিমধ্যে সঠিকভাবে কনফিগার করা আছে:
node_modules/, dist/, এবং সব .env ফাইল গিট ইগনোর করা আছে, তাই আপনার সিক্রেট বা পাসওয়ার্ড কখনো গিটহাবে লিক হবে না।
গিটহাবে পুশ করার কমান্ডসমূহ:
code
Bash
git init
git add .
git commit -m "Initial release of BD NID AI Scanner & Record Engine"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
৪. Vercel-এ Deploy করার সম্পূর্ণ গাইড

এই প্রজেক্ট Vercel-এর জন্য কনফিগার করা আছে (`vercel.json` + `api/index.ts`)। ফ্রন্টএন্ড Vite static build হিসেবে এবং `/api/*` রাউট Express serverless function হিসেবে চলে।

**ধাপ ১:** GitHub-এ রিপো push করুন (`.env` এবং `data/` ফোল্ডার git-এ যাবে না)।

**ধাপ ২:** [vercel.com](https://vercel.com) → Add New Project → GitHub repo সিলেক্ট করুন।

**ধাপ ৩:** Vercel স্বয়ংক্রিয়ভাবে `vercel.json` পড়বে। Build settings:
- Build Command: `npm run build`
- Output Directory: `dist`

**ধাপ ৪:** Environment Variables (Settings → Environment Variables) — **Production, Preview, Development** তিনটিতেই সেট করুন:

| Variable | Required | Notes |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini OCR |
| `SUPABASE_URL` | Yes (Vercel) | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (Vercel) | Server-only secret key |
| `VITE_SUPABASE_URL` | Optional | Same as SUPABASE_URL |
| `VITE_SUPABASE_ANON_KEY` | Optional | Public anon key |

**গুরুত্বপূর্ণ:** Vercel-এ local JSON ফাইল persist হয় না। Supabase অবশ্যই কনফিগার করুন। Supabase SQL Editor-এ `src/utils/supabaseSql.ts` থেকে SQL রান করুন।

**সীমাবদ্ধতা:** Vercel serverless request body ~4.5 MB। বড় NID ইমেজ upload-এ client-side resize/compress করুন।

---

৫. Cloudflare Pages-এ রান করার সম্পূর্ণ গাইড
যেহেতু এই অ্যাপটিতে ফ্রন্টএন্ড (React Vite) এবং ব্যাকএন্ড (Express Server & Gemini Proxy API) উভয়ই রয়েছে, Cloudflare Pages-এ রান করার জন্য নিচের ধাপগুলো অনুসরণ করুন:
ধাপ ১: Cloudflare Pages-এ ডিপ্লয়মেন্ট
Cloudflare Dashboard-এ যান ➔ Workers & Pages ➔ Create application ➔ Pages ➔ Connect to Git নির্বাচন করুন।
আপনার GitHub রিপোজিটরিটি সিলেক্ট করুন।
ধাপ ২: Build Settings কনফিগারেশন
সেটিংস পেজে নিচের মানগুলো সেট করুন:
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: / (ফাঁকা বা ডিফল্ট রাখুন)
ধাপ ৩: Environment Variables যোগ করা
Cloudflare Pages-এর Environment variables সেকশনে গিয়ে নিচের ভেরিয়েবলগুলো যুক্ত করুন:
NODE_VERSION = 20
GEMINI_API_KEY = আপনার Gemini API Key
VITE_SUPABASE_URL = আপনার Supabase URL
VITE_SUPABASE_ANON_KEY = আপনার Supabase Anon Key
(নোট: আপনি যদি সম্পূর্ণ ফুলস্ট্যাক Node.js ব্যাকএন্ড এক্সপ্রেস সার্ভার হিসেবে এক ক্লিকে কোনো ঝামেলা ছাড়া হোস্ট করতে চান, তবে Render.com, Railway.app অথবা Google Cloud Run-এ গিটহাব কানেক্ট করলেই সরাসরি npm run build এবং npm start দিয়ে ফ্রন্টএন্ড ও ব্যাকএন্ড একসাথে লাইভ হয়ে যাবে।)