import React, { useState } from "react";
import {
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  Server,
  Database,
  Layers,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";
import { SupabaseSetupGuide } from "./SupabaseSetupGuide.js";

interface PhpIntegrationHubProps {
  lang: "bn" | "en";
}

export const PhpIntegrationHub: React.FC<PhpIntegrationHubProps> = ({ lang }) => {
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [activeSnippet, setActiveSnippet] = useState<
    "supabase" | "php_curl" | "laravel" | "mysql" | "wordpress"
  >("supabase");

  const copyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(key);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  const phpCurlCode = `<?php
/**
 * Bangladesh NID Scanner AI Client (PHP / cURL)
 * Supports BD Smart Card & Old Laminated NID (JPG, PNG, PDF)
 */

class BDNIDScanner {
    private $apiUrl;
    private $apiKey;

    public function __construct($apiUrl = "https://your-domain.com/api/scan-nid", $apiKey = "") {
        $this->apiUrl = $apiUrl;
        $this->apiKey = $apiKey;
    }

    /**
     * Scan NID from Local Image File
     * @param string $filePath Path to image or PDF
     * @param string $side 'front' | 'back' | 'both'
     * @return array Extracted NID fields with confidence score
     */
    public function scanNID($filePath, $side = 'front') {
        if (!file_exists($filePath)) {
            throw new Exception("File not found: " . $filePath);
        }

        $fileData = file_get_contents($filePath);
        $mimeType = mime_content_type($filePath);
        $base64 = base64_encode($fileData);

        $payload = [
            "images" => [
                [
                    "data" => "data:" . $mimeType . ";base64," . $base64,
                    "mimeType" => $mimeType,
                    "side" => $side
                ]
            ]
        ];

        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Accept: application/json"
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception("API error with status code: " . $httpCode . " Response: " . $response);
        }

        return json_decode($response, true);
    }
}

// Example Usage:
try {
    $scanner = new BDNIDScanner("http://localhost:3000/api/scan-nid");
    $result = $scanner->scanNID("uploads/smart_card_front.jpg", "front");

    if ($result['success']) {
        $nidData = $result['data'];
        echo "<h3>NID Extraction Successful!</h3>";
        echo "নাম: " . $nidData['nameBangla'] . "<br>";
        echo "Name: " . $nidData['nameEnglish'] . "<br>";
        echo "পিতা: " . $nidData['fatherName'] . "<br>";
        echo "মাতা: " . $nidData['motherName'] . "<br>";
        echo "DOB: " . $nidData['dateOfBirth'] . "<br>";
        echo "NID NO: " . $nidData['nidNumber'] . "<br>";
        echo "Accuracy: " . $nidData['accuracyScore'] . "%<br>";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>`;

  const laravelCode = `<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use App\\Models\\NidRecord;

class NidScannerController extends Controller
{
    /**
     * Handle NID upload and Gemini AI OCR
     */
    public function scan(Request $request)
    {
        $request->validate([
            'nid_image' => 'required|image|mimes:jpeg,png,jpg,webp|max:10240',
            'card_side' => 'nullable|in:front,back,both',
        ]);

        $file = $request->file('nid_image');
        $base64 = base64_encode(file_get_contents($file->getRealPath()));
        $mimeType = $file->getMimeType();

        // Call Gemini AI Node/Express service or direct endpoint
        $response = Http::post(env('NID_AI_SERVICE_URL', 'http://localhost:3000/api/scan-nid'), [
            'images' => [
                [
                    'data' => "data:{$mimeType};base64,{$base64}",
                    'mimeType' => $mimeType,
                    'side' => $request->input('card_side', 'front'),
                ]
            ]
        ]);

        if ($response->successful() && $response->json('success')) {
            $data = $response->json('data');
            return response()->json([
                'status' => 'success',
                'extracted' => $data,
                'accuracy' => $data['accuracyScore'] ?? 98.0,
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'NID extraction failed.',
        ], 500);
    }
}`;

  const mysqlSchema = `-- MySQL Database Schema for Bangladesh NID Records (PHP/MySQL)
CREATE TABLE IF NOT EXISTS \`bd_nid_records\` (
  \`id\` VARCHAR(64) NOT NULL PRIMARY KEY,
  \`nid_number\` VARCHAR(20) NOT NULL UNIQUE,
  \`name_bangla\` VARCHAR(255) NOT NULL,
  \`name_english\` VARCHAR(255) NULL,
  \`father_name\` VARCHAR(255) NULL,
  \`mother_name\` VARCHAR(255) NULL,
  \`spouse_name\` VARCHAR(255) NULL,
  \`date_of_birth\` DATE NULL,
  \`place_of_birth\` VARCHAR(100) NULL,
  \`blood_group\` VARCHAR(10) NULL,
  \`address_bangla\` TEXT NULL,
  \`card_type\` ENUM('smart_card', 'old_laminated', 'server_copy', 'unknown') DEFAULT 'smart_card',
  \`card_side\` ENUM('front', 'back', 'both') DEFAULT 'front',
  \`accuracy_score\` DECIMAL(5,2) DEFAULT 98.00,
  \`status\` ENUM('verified', 'pending_review', 'flagged') DEFAULT 'verified',
  \`notes\` TEXT NULL,
  \`front_image_url\` VARCHAR(500) NULL,
  \`back_image_url\` VARCHAR(500) NULL,
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_nid\` (\`nid_number\`),
  INDEX \`idx_name_bn\` (\`name_bangla\`),
  INDEX \`idx_district\` (\`place_of_birth\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

  const wordpressCode = `<?php
/**
 * Plugin Name: Bangladesh NID AI Scanner
 * Description: AI NID OCR Scanner for WordPress Forms & User Verification
 */

add_action('wp_ajax_scan_bd_nid', 'handle_bd_nid_scan');
add_action('wp_ajax_nopriv_scan_bd_nid', 'handle_bd_nid_scan');

function handle_bd_nid_scan() {
    if (!isset($_FILES['nid_file'])) {
        wp_send_json_error(['message' => 'No image uploaded']);
    }

    $file = $_FILES['nid_file'];
    $fileData = file_get_contents($file['tmp_name']);
    $base64 = base64_encode($fileData);
    $mimeType = $file['type'];

    $apiEndpoint = 'http://localhost:3000/api/scan-nid';
    $response = wp_remote_post($apiEndpoint, [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => json_encode([
            'images' => [[
                'data' => 'data:' . $mimeType . ';base64,' . $base64,
                'mimeType' => $mimeType,
                'side' => 'front'
            ]]
        ]),
        'timeout' => 45
    ]);

    if (is_wp_error($response)) {
        wp_send_json_error(['message' => $response->get_error_message()]);
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    wp_send_json_success($body['data']);
}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 space-y-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            Database & REST API Integration Suite
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {lang === "bn"
            ? "Supabase ক্লাউড ডাটাবেস ও API ইন্টিগ্রেশন হাব"
            : "Supabase Database & API Integration Hub"}
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-3xl">
          {lang === "bn"
            ? "আপনার প্রজেক্টের জন্য Supabase PostgreSQL ক্লাউড ডাটাবেজ কানেক্ট করুন, অথবা যেকোনো PHP, Laravel, WordPress ও MySQL প্রজেক্টে জেমিনাই এআই স্ক্যানার ইন্টিগ্রেট করুন।"
            : "Connect your managed Supabase PostgreSQL cloud database, or integrate the Gemini AI NID OCR into PHP, Laravel, WordPress, and MySQL systems."}
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
        {/* Supabase Tab */}
        <button
          onClick={() => setActiveSnippet("supabase")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSnippet === "supabase"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Database className="w-4 h-4 text-emerald-300" />
          <span>Supabase (PostgreSQL)</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300">
            Setup
          </span>
        </button>

        <button
          onClick={() => setActiveSnippet("php_curl")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSnippet === "php_curl"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Vanilla PHP (cURL)</span>
        </button>

        <button
          onClick={() => setActiveSnippet("laravel")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSnippet === "laravel"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Laravel Controller</span>
        </button>

        <button
          onClick={() => setActiveSnippet("mysql")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSnippet === "mysql"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>MySQL Database Schema</span>
        </button>

        <button
          onClick={() => setActiveSnippet("wordpress")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSnippet === "wordpress"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-950/40"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>WordPress Plugin Hook</span>
        </button>
      </div>

      {/* If Supabase active, show Supabase Setup Guide */}
      {activeSnippet === "supabase" ? (
        <SupabaseSetupGuide lang={lang} />
      ) : (
        /* Code Display Box for Other Tabs */
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
          <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="text-xs text-slate-400 font-mono pl-2">
                {activeSnippet === "php_curl"
                  ? "BDNIDScanner.php"
                  : activeSnippet === "laravel"
                  ? "NidScannerController.php"
                  : activeSnippet === "mysql"
                  ? "bd_nid_records.sql"
                  : "bd-nid-wordpress.php"}
              </span>
            </div>

            <button
              onClick={() =>
                copyCode(
                  activeSnippet,
                  activeSnippet === "php_curl"
                    ? phpCurlCode
                    : activeSnippet === "laravel"
                    ? laravelCode
                    : activeSnippet === "mysql"
                    ? mysqlSchema
                    : wordpressCode
                )
              }
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {copiedSnippet === activeSnippet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === "bn" ? "কোড কপি করুন" : "Copy Code"}</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-6 text-xs text-slate-300 font-mono overflow-x-auto leading-relaxed">
            <code>
              {activeSnippet === "php_curl"
                ? phpCurlCode
                : activeSnippet === "laravel"
                ? laravelCode
                : activeSnippet === "mysql"
                ? mysqlSchema
                : wordpressCode}
            </code>
          </pre>
        </div>
      )}

      {/* REST API Endpoints Specs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>{lang === "bn" ? "উপলব্ধ REST API এন্ডপয়েন্ট সমূহ" : "Available REST API Endpoints"}</span>
        </h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-slate-200">/api/scan-nid</span>
            </div>
            <span className="text-slate-400">
              {lang === "bn"
                ? "ছবি আপলোড নিয়ে জেমিনাই এআই দিয়ে ফিল্ড এক্সট্রাক্ট করে"
                : "Uploads image/PDF and returns extracted NID fields with accuracy score"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono font-bold">
                GET
              </span>
              <span className="font-mono text-slate-200">/api/records</span>
            </div>
            <span className="text-slate-400">
              {lang === "bn" ? "সকল ডাটাবেস রেকর্ড অনুসন্ধান ও ফিল্টারিং" : "Fetch, search and filter all saved NID records"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                POST
              </span>
              <span className="font-mono text-slate-200">/api/supabase/test</span>
            </div>
            <span className="text-slate-400">
              {lang === "bn" ? "সরাসরি Supabase PostgreSQL সংযোগ যাচাই করুন" : "Live verification of Supabase PostgreSQL tables"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                GET
              </span>
              <span className="font-mono text-slate-200">/api/export/csv</span>
            </div>
            <span className="text-slate-400">
              {lang === "bn" ? "বাংলা ফন্ট সাপোর্ট সহ এক্সেল/CSV ডাউনলোড" : "Download UTF-8 BOM CSV compatible with Microsoft Excel"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
