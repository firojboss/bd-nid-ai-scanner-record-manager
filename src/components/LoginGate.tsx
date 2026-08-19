import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Eye, EyeOff, Lock } from "lucide-react";

const PASSWORD = "112233";
const SESSION_KEY = "bd_nid_auth_ts";
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours

function isSessionValid(): boolean {
  try {
    const ts = localStorage.getItem(SESSION_KEY);
    if (!ts) return false;
    return Date.now() - Number(ts) < SESSION_DURATION_MS;
  } catch {
    return false;
  }
}

function saveSession() {
  try {
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  } catch {}
}

interface LoginGateProps {
  children: React.ReactNode;
}

export const LoginGate: React.FC<LoginGateProps> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [input, setInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSessionValid()) {
      setAuthenticated(true);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      saveSession();
      setError(false);
      setAuthenticated(true);
    } else {
      setError(true);
      setShake(true);
      setInput("");
      setTimeout(() => setShake(false), 600);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-4">
      {/* Background subtle pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div
        className={`relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 p-8 flex flex-col items-center gap-6 ${
          shake ? "animate-[shake_0.5s_ease-in-out]" : ""
        }`}
        style={
          shake
            ? { animation: "shake 0.5s ease-in-out" }
            : {}
        }
      >
        {/* Logo / Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 p-0.5 shadow-lg shadow-emerald-950/60">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <img
                src="/assets/icon.png"
                alt="BD NID AI Scanner"
                className="w-10 h-10 rounded-xl object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-base font-extrabold text-white tracking-tight">
              BD NID AI Scanner
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              বাংলাদেশ জাতীয় পরিচয়পত্র ম্যানেজার
            </p>
          </div>
        </div>

        {/* Lock icon */}
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">পাসওয়ার্ড দিয়ে প্রবেশ করুন</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <div className="relative">
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Password"
              autoComplete="current-password"
              className={`w-full bg-slate-800 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all focus:ring-2 ${
                error
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/20"
              }`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-400 text-center -mt-2">
              ❌ পাসওয়ার্ড ভুল হয়েছে। আবার চেষ্টা করুন।
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm py-3 rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            প্রবেশ করুন
          </button>
        </form>

        <p className="text-[10px] text-slate-600 text-center">
          ১২ ঘণ্টা পর স্বয়ংক্রিয়ভাবে লগআউট হবে
        </p>
      </div>

      {/* Shake keyframe injected inline */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-8px); }
          30% { transform: translateX(8px); }
          45% { transform: translateX(-6px); }
          60% { transform: translateX(6px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
};
