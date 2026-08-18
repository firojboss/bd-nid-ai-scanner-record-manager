import { NIDRecord } from "../types.js";
import { formatBanglaDate } from "./nidHelpers.js";

/**
 * Generates a self-contained, high-fidelity Bangladesh NID Card & Record Document
 * and opens it in a brand-new browser tab with print, copy, and visual card modes.
 */
export function openNidDocumentInNewTab(record: NIDRecord) {
  if (!record) return;

  const isSmart = record.cardType === "smart_card";
  const formattedDob = formatBanglaDate(record.dateOfBirth);
  const formattedIssue = formatBanglaDate(record.issueDate || "");

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NID: ${record.nidNumber} - ${record.nameBangla || record.nameEnglish || "National ID"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Share+Tech+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090d16;
      --card-bg: #0f172a;
      --card-border: #1e293b;
      --text-main: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #10b981;
      --primary-dark: #059669;
      --accent: #3b82f6;
      --gold: #f59e0b;
      --card-green: #064e3b;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      min-height: 100vh;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .top-actions {
      width: 100%;
      max-width: 900px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(8px);
      padding: 14px 20px;
      border-radius: 16px;
      border: 1px solid var(--card-border);
    }
    .badge-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge-gov {
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-group {
      display: flex;
      gap: 8px;
    }
    .btn {
      background: #1e293b;
      color: #f8fafc;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .btn:hover {
      background: #334155;
      border-color: #475569;
    }
    .btn-primary {
      background: #059669;
      border-color: #10b981;
      color: white;
    }
    .btn-primary:hover {
      background: #10b981;
    }
    .container {
      width: 100%;
      max-width: 900px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    /* Smart Card Mockup */
    .nid-card-visual {
      background: linear-gradient(135deg, #064e3b 0%, #022c22 60%, #0f172a 100%);
      border: 2px solid #059669;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }
    .nid-card-visual::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(16, 185, 129, 0.3);
      padding-bottom: 14px;
      margin-bottom: 18px;
    }
    .emblem-title {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .emblem {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #047857;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      border: 2px solid #34d399;
      box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);
    }
    .header-text h1 {
      font-size: 15px;
      font-weight: 700;
      color: #ecfdf5;
      letter-spacing: 0.5px;
    }
    .header-text h2 {
      font-size: 12px;
      font-weight: 500;
      color: #a7f3d0;
    }
    .card-body {
      display: grid;
      grid-template-columns: 140px 1fr auto;
      gap: 20px;
      align-items: start;
    }
    @media (max-width: 640px) {
      .card-body {
        grid-template-columns: 1fr;
      }
    }
    .photo-box {
      width: 140px;
      height: 170px;
      border-radius: 12px;
      background: #022c22;
      border: 2px solid #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
    }
    .photo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      font-size: 40px;
      color: #34d399;
    }
    .field-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px 18px;
    }
    .field-item {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-size: 11px;
      color: #6ee7b7;
      font-weight: 500;
      margin-bottom: 2px;
    }
    .field-val {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: 0.2px;
    }
    .nid-highlight {
      background: rgba(0, 0, 0, 0.4);
      padding: 10px 14px;
      border-radius: 10px;
      border: 1px solid rgba(52, 211, 153, 0.4);
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nid-val {
      font-family: 'Share Tech Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #34d399;
      letter-spacing: 2px;
    }
    /* Info Card Grid */
    .info-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 20px;
    }
    .info-card h3 {
      font-size: 14px;
      font-weight: 700;
      color: #38bdf8;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table tr {
      border-bottom: 1px solid #1e293b;
    }
    .data-table tr:last-child {
      border-bottom: none;
    }
    .data-table td {
      padding: 10px 12px;
      font-size: 13px;
    }
    .data-table td.label-col {
      color: var(--text-muted);
      width: 35%;
      font-weight: 500;
    }
    .data-table td.val-col {
      color: #f8fafc;
      font-weight: 600;
    }
    /* Scanned Images Grid */
    .images-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 640px) {
      .images-grid {
        grid-template-columns: 1fr;
      }
    }
    .scanned-img-box {
      background: #020617;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 10px;
      text-align: center;
    }
    .scanned-img-box img {
      max-width: 100%;
      height: auto;
      max-height: 280px;
      border-radius: 8px;
      object-fit: contain;
    }
    .scanned-img-box span {
      display: block;
      margin-top: 8px;
      font-size: 12px;
      color: var(--text-muted);
    }
    /* Copy Toast */
    #copy-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: white;
      padding: 10px 20px;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 13px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      z-index: 1000;
    }
    #copy-toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    /* Print Styles */
    @media print {
      body {
        background: white !important;
        color: black !important;
        padding: 0 !important;
      }
      .top-actions, #copy-toast {
        display: none !important;
      }
      .nid-card-visual {
        background: #064e3b !important;
        color: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        box-shadow: none !important;
      }
      .info-card {
        background: white !important;
        border-color: #cbd5e1 !important;
        color: black !important;
      }
      .data-table td {
        color: black !important;
        border-color: #e2e8f0 !important;
      }
      .data-table td.label-col {
        color: #475569 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Top Navigation & Action Controls -->
  <div class="top-actions">
    <div class="badge-wrap">
      <div class="badge-gov">
        <span>🇧🇩</span>
        <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (National ID Profile)</span>
      </div>
      ${isSmart ? '<span style="background: rgba(59,130,246,0.2); color:#60a5fa; border:1px solid rgba(59,130,246,0.4); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">SMART CARD</span>' : '<span style="background: rgba(245,158,11,0.2); color:#fcd34d; border:1px solid rgba(245,158,11,0.4); padding:3px 8px; border-radius:6px; font-size:11px; font-weight:700;">OLD NID</span>'}
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ প্রিন্ট করুন (Print)
      </button>
      <button class="btn" onclick="copyNidInfo()">
        📋 ডাটা কপি (Copy Text)
      </button>
      <button class="btn" onclick="window.close()">
        ✕ বন্ধ করুন
      </button>
    </div>
  </div>

  <div class="container">
    <!-- Visual Smart/Old NID Card -->
    <div class="nid-card-visual">
      <div class="card-header">
        <div class="emblem-title">
          <div class="emblem">🇧🇩</div>
          <div class="header-text">
            <h1>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h1>
            <h2>Government of the People's Republic of Bangladesh</h2>
            <div style="font-size: 10px; color: #6ee7b7; font-weight: 600; text-transform: uppercase;">
              ${isSmart ? "National Identity Card / স্মার্ট জাতীয় পরিচয়পত্র" : "জাতীয় পরিচয়পত্র (National ID Card)"}
            </div>
          </div>
        </div>
        ${record.bloodGroup ? `<div style="background: rgba(239,68,68,0.2); color:#fca5a5; border:1px solid rgba(239,68,68,0.4); padding:4px 10px; border-radius:8px; font-weight:800; font-size:13px;">🩸 ${record.bloodGroup}</div>` : ""}
      </div>

      <div class="card-body">
        <!-- Photo Container -->
        <div class="photo-box">
          ${record.frontImage ? `<img src="${record.frontImage}" alt="Citizen Photo" />` : `<div class="photo-placeholder">👤</div>`}
        </div>

        <!-- Main Info Columns -->
        <div>
          <div class="field-grid">
            <div class="field-item">
              <span class="field-label">নাম (বাংলা) / Name</span>
              <span class="field-val" style="font-size:16px; color:#a7f3d0;">${record.nameBangla || "—"}</span>
            </div>
            <div class="field-item">
              <span class="field-label">Name (English)</span>
              <span class="field-val" style="font-size:15px; text-transform: uppercase;">${record.nameEnglish || "—"}</span>
            </div>
            <div class="field-item">
              <span class="field-label">পিতা / Father's Name</span>
              <span class="field-val">${record.fatherName || "—"}</span>
            </div>
            <div class="field-item">
              <span class="field-label">মাতা / Mother's Name</span>
              <span class="field-val">${record.motherName || "—"}</span>
            </div>
            ${record.spouseName ? `
            <div class="field-item">
              <span class="field-label">স্বামী/স্ত্রী / Spouse Name</span>
              <span class="field-val">${record.spouseName}</span>
            </div>` : ""}
            <div class="field-item">
              <span class="field-label">জন্ম তারিখ / Date of Birth</span>
              <span class="field-val">${record.dateOfBirth || "—"} ${formattedDob ? `(${formattedDob})` : ""}</span>
            </div>
            <div class="field-item">
              <span class="field-label">জন্মস্থান / Place of Birth</span>
              <span class="field-val">${record.placeOfBirth || "বাংলাদেশ"}</span>
            </div>
          </div>

          <!-- Highlighted NID Number Box -->
          <div class="nid-highlight">
            <div>
              <div style="font-size:11px; color:#6ee7b7; font-weight:600;">NID NO / জাতীয় পরিচয়পত্র নম্বর</div>
              <div class="nid-val">${record.nidNumber}</div>
            </div>
            <button onclick="copyOnlyNid('${record.nidNumber}')" class="btn" style="padding:6px 12px; font-size:11px; background:#047857; border-color:#34d399;">
              📋 NID কপি
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Complete Citizen Record Table -->
    <div class="info-card">
      <h3>📄 নাগরিক বিস্তারিত প্রোফাইল (Full Record Specifications)</h3>
      <table class="data-table">
        <tbody>
          <tr>
            <td class="label-col">জাতীয় পরিচয়পত্র নম্বর (NID)</td>
            <td class="val-col" style="font-family:'Share Tech Mono', monospace; font-size:15px; color:#34d399;">${record.nidNumber}</td>
          </tr>
          <tr>
            <td class="label-col">নাম (বাংলা)</td>
            <td class="val-col">${record.nameBangla || "—"}</td>
          </tr>
          <tr>
            <td class="label-col">Name (English)</td>
            <td class="val-col" style="text-transform: uppercase;">${record.nameEnglish || "—"}</td>
          </tr>
          <tr>
            <td class="label-col">পিতার নাম</td>
            <td class="val-col">${record.fatherName || "—"}</td>
          </tr>
          <tr>
            <td class="label-col">মাতার নাম</td>
            <td class="val-col">${record.motherName || "—"}</td>
          </tr>
          ${record.spouseName ? `
          <tr>
            <td class="label-col">স্বামী/স্ত্রীর নাম</td>
            <td class="val-col">${record.spouseName}</td>
          </tr>` : ""}
          <tr>
            <td class="label-col">জন্ম তারিখ</td>
            <td class="val-col">${record.dateOfBirth || "—"}</td>
          </tr>
          <tr>
            <td class="label-col">রক্তের গ্রুপ</td>
            <td class="val-col">${record.bloodGroup || "—"}</td>
          </tr>
          <tr>
            <td class="label-col">জন্মস্থান</td>
            <td class="val-col">${record.placeOfBirth || "বাংলাদেশ"}</td>
          </tr>
          <tr>
            <td class="label-col">বর্তমান ও স্থায়ী ঠিকানা</td>
            <td class="val-col" style="line-height:1.5;">${record.addressBangla || "—"}</td>
          </tr>
          ${record.issueDate ? `
          <tr>
            <td class="label-col">প্রদানের তারিখ (Issue Date)</td>
            <td class="val-col">${record.issueDate} ${formattedIssue ? `(${formattedIssue})` : ""}</td>
          </tr>` : ""}
          ${record.pinNumber ? `
          <tr>
            <td class="label-col">পিন নম্বর (PIN)</td>
            <td class="val-col" style="font-family:'Share Tech Mono', monospace;">${record.pinNumber}</td>
          </tr>` : ""}
          <tr>
            <td class="label-col">কার্ডের ধরণ</td>
            <td class="val-col">${isSmart ? "স্মার্ট জাতীয় পরিচয়পত্র (Smart Card)" : "পুরাতন জাতীয় পরিচয়পত্র (Old Laminated NID)"}</td>
          </tr>
          <tr>
            <td class="label-col">স্ট্যাটাস</td>
            <td class="val-col"><span style="color:#34d399; font-weight:bold;">✓ Verified / সংগৃহীত</span></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Scanned Images Box (If Front/Back Images Exist) -->
    ${(record.frontImage || record.backImage) ? `
    <div class="info-card">
      <h3>🖼️ স্ক্যানকৃত মূল ডকুমেন্টের ছবি (Scanned Original Documents)</h3>
      <div class="images-grid">
        ${record.frontImage ? `
        <div class="scanned-img-box">
          <img src="${record.frontImage}" alt="Front Card Scan" />
          <span>সামনের অংশ (Front View)</span>
        </div>` : ""}
        ${record.backImage ? `
        <div class="scanned-img-box">
          <img src="${record.backImage}" alt="Back Card Scan" />
          <span>পেছনের অংশ (Back View)</span>
        </div>` : ""}
      </div>
    </div>` : ""}
  </div>

  <div id="copy-toast">✓ সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!</div>

  <script>
    const recordData = ${JSON.stringify(record)};

    function showToast(msg) {
      const toast = document.getElementById('copy-toast');
      if (msg) toast.innerText = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }

    function copyOnlyNid(nid) {
      navigator.clipboard.writeText(nid).then(() => {
        showToast('✓ NID নম্বর ' + nid + ' কপি করা হয়েছে!');
      });
    }

    function copyNidInfo() {
      const text = [
        '--- BANGLADESH NATIONAL ID CARD ---',
        'NID Number: ' + (recordData.nidNumber || ''),
        'Name (Bangla): ' + (recordData.nameBangla || ''),
        'Name (English): ' + (recordData.nameEnglish || ''),
        'Father: ' + (recordData.fatherName || ''),
        'Mother: ' + (recordData.motherName || ''),
        'DOB: ' + (recordData.dateOfBirth || ''),
        'Blood Group: ' + (recordData.bloodGroup || ''),
        'Place of Birth: ' + (recordData.placeOfBirth || ''),
        'Address: ' + (recordData.addressBangla || ''),
        'Issue Date: ' + (recordData.issueDate || '')
      ].join('\\n');

      navigator.clipboard.writeText(text).then(() => {
        showToast('✓ সম্পূর্ণ NID তথ্য কপি করা হয়েছে!');
      });
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const blobUrl = URL.createObjectURL(blob);
  const newWindow = window.open(blobUrl, "_blank");
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    // If popup blocked, create link and click
    const a = document.createElement("a");
    a.href = blobUrl;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
