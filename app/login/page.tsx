"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
// CORRECTION 1 : Import avec accolades car c'est un export nommé
import { authService } from "../../services/AuthService"; 

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    
    try {
      // CORRECTION 2 : Utiliser loginAdmin et passer un objet
      const data = await authService.loginAdmin({ 
        email: email, 
        password: password 
      });

      // CORRECTION 3 : Le token est déjà stocké dans localStorage par le service
      // Mais on redirige vers le dashboard
      router.push("/dashboard"); 
      
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      // CORRECTION 4 : Gestion propre du message d'erreur Laravel
      const message = err.response?.data?.message || "Identifiants invalides ou accès refusé";
      setError(message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div
      className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/bg_login.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl px-8 py-10">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/logo_canal.png"
            alt="CANAL+"
            width={160}
            height={40}
            priority
          />
        </div>
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-2">
          Bienvenue
        </h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          saisissez vos infromations de connexion pour vous connecter à votre espace.
        </p>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vérification...
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} CANAL+ • Accès réservé
        </div>
      </div>
    </div>
  );
}