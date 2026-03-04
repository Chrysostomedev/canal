"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Mail, RefreshCcw } from "lucide-react";

export default function OtpPage() {
  const OTP_LENGTH = 6;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      setActiveIndex(index - 1);
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);

    // Ici tu connecteras Laravel
    console.log("OTP envoyé:", code);

    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const handleResend = () => {
    if (!canResend) return;
    setTimer(30);
    setCanResend(false);

    // Appel API Laravel pour renvoyer OTP
    console.log("Renvoi OTP");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/bg_login.png')" }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo_canal.png"
            alt="Logo"
            width={220}
            height={50}
            priority
          />
        </div>

        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Vérification sécurisée
        </h1>

        <p className="text-sm text-gray-500 text-center mb-8">
          Un code à 6 chiffres a été envoyé à votre adresse email.
        </p>

        <div className="flex justify-center gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setActiveIndex(index)}
              className={`w-12 h-14 text-center text-xl font-semibold rounded-xl border 
                ${activeIndex === index ? "border-black ring-2 ring-black" : "border-gray-300"}
                focus:outline-none transition-all duration-200`}
            />
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 disabled:bg-gray-400 transition-all duration-300 shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Vérification...
            </span>
          ) : (
            "Valider le code"
          )}
        </button>

        <div className="mt-6 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail size={16} />
            Vérifiez votre boîte mail
          </div>

          {canResend ? (
            <button
              onClick={handleResend}
              className="flex items-center justify-center gap-2 text-black font-medium hover:underline"
            >
              <RefreshCcw size={16} />
              Renvoyer un code
            </button>
          ) : (
            <p className="text-gray-400">
              Nouveau code disponible dans {timer}s
            </p>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} • Accès sécurisé
        </div>
      </div>
    </div>
  );
}