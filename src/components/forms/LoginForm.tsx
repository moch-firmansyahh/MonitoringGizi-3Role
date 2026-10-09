"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

type RoleOption = "posyandu" | "puskesmas" | "orang_tua";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleOption>("posyandu");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // 1. Validasi Kelengkapan Field (UX)
    let hasEmpty = false;

    if (!cleanUsername) {
      setUsernameError("Username wajib diisi");
      hasEmpty = true;
    } else {
      setUsernameError(null);
    }

    if (!cleanPassword) {
      setPasswordError("Kata sandi wajib diisi");
      hasEmpty = true;
    } else {
      setPasswordError(null);
    }

    if (hasEmpty) {
      return;
    }

    setIsLoading(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        // Anti-User Enumeration
        setPasswordError(json.error || "Username atau kata sandi salah");
        setIsLoading(false);
        return;
      }

      const redirectTo = json.data?.redirectTo || "/";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setPasswordError("Gagal menghubungi server. Silakan coba kembali.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[649px] min-h-[500px] md:h-auto bg-white dark:bg-[#161920] border border-[#e6e8eb] dark:border-[#262a34] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] p-6 sm:p-8 md:p-12 flex flex-col justify-between transition-colors duration-200 select-none">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-between h-full space-y-6 md:space-y-0"
      >
        {/* Top Header & Inputs */}
        <div>
          {/* Logo & App Name */}
          <div className="flex items-center gap-2.5 mb-5 md:mb-6">
            <div className="w-[32px] h-[32px] rounded-lg overflow-hidden flex items-center justify-center shadow-xs shrink-0">
              <Image
                src="/images/Logo-SimGizi.png"
                alt="Logo SimGizi"
                width={32}
                height={32}
                className="w-full h-full object-contain"
                unoptimized
                priority
              />
            </div>
            <span className="font-ag text-[16px] leading-[24px] font-semibold text-zinc-900 dark:text-zinc-100">
              SimGizi
            </span>
          </div>

          {/* Heading Section */}
          <div className="mb-5 md:mb-6">
            <h1 className="font-ag text-[30px] sm:text-[32px] leading-[40px] font-medium tracking-tight text-zinc-900 dark:text-zinc-100">
              Masuk ke SimGizi
            </h1>
            <p className="font-inter text-[14px] sm:text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">
              Portal Layanan Terpadu Pemantauan Gizi Anak & Kesehatan Balita
            </p>
          </div>

          {/* Minimalist Segmented Role Tab (Clean Enterprise Style) */}
          <div className="flex p-1 bg-[#f1f3f5] dark:bg-[#1e222d] rounded-xl mb-6 border border-gray-200/60 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setSelectedRole("posyandu");
                if (usernameError) setUsernameError(null);
                if (passwordError) setPasswordError(null);
              }}
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                selectedRole === "posyandu"
                  ? "bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Posyandu
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("puskesmas");
                if (usernameError) setUsernameError(null);
                if (passwordError) setPasswordError(null);
              }}
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                selectedRole === "puskesmas"
                  ? "bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Puskesmas
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole("orang_tua");
                if (usernameError) setUsernameError(null);
                if (passwordError) setPasswordError(null);
              }}
              className={`flex-1 py-2 text-[13px] font-medium rounded-lg transition-all cursor-pointer ${
                selectedRole === "orang_tua"
                  ? "bg-white dark:bg-[#161920] text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              Orang Tua
            </button>
          </div>

          {/* Form Input Fields */}
          <div className="space-y-4 md:space-y-5">
            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="block font-inter text-[15px] font-medium text-zinc-800 dark:text-zinc-200 mb-1.5 md:mb-2"
              >
                {selectedRole === "posyandu"
                  ? "Username Posyandu"
                  : selectedRole === "puskesmas"
                  ? "Username Puskesmas"
                  : selectedRole === "orang_tua"
                  ? "Username Akun Orang Tua"
                  : "Username"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (usernameError) setUsernameError(null);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder={
                  selectedRole === "posyandu"
                    ? "Masukkan ID / username Posyandu"
                    : selectedRole === "puskesmas"
                    ? "Masukkan ID / username Puskesmas"
                    : selectedRole === "orang_tua"
                    ? "Masukkan ID / username Orang Tua"
                    : "Masukkan username Anda"
                }
                className={`w-full px-4 py-3 rounded-xl font-inter text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all duration-150 ${
                  usernameError
                    ? "bg-white dark:bg-[#1e222d] border border-[#a52a2a] dark:border-red-500 focus:border-[#a52a2a] dark:focus:border-red-500"
                    : "bg-[#f5f6f8] dark:bg-[#1e222d] border border-transparent focus:border-[#0d472c] dark:focus:border-[#2d6a4f] focus:bg-white dark:focus:bg-[#1e222d]"
                }`}
              />
              {usernameError && (
                <p className="font-inter text-[13px] md:text-[14px] text-[#a52a2a] dark:text-red-400 mt-1.5">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block font-inter text-[15px] font-medium text-zinc-800 dark:text-zinc-200 mb-1.5 md:mb-2"
              >
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="Masukkan kata sandi Anda"
                  className={`w-full px-4 py-3 pr-12 rounded-xl font-inter text-[15px] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none transition-all duration-150 ${
                    passwordError
                      ? "bg-white dark:bg-[#1e222d] border border-[#a52a2a] dark:border-red-500 focus:border-[#a52a2a] dark:focus:border-red-500"
                      : "bg-[#f5f6f8] dark:bg-[#1e222d] border border-transparent focus:border-[#0d472c] dark:focus:border-[#2d6a4f] focus:bg-white dark:focus:bg-[#1e222d]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <Eye className="w-5 h-5 stroke-[1.8]" />
                  ) : (
                    <EyeOff className="w-5 h-5 stroke-[1.8]" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="font-inter text-[13px] md:text-[14px] text-[#a52a2a] dark:text-red-400 mt-1.5">
                  {passwordError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button & Disclaimer */}
        <div className="pt-6 md:pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-[#0d472c] hover:bg-[#0a3923] active:bg-[#072a1a] disabled:opacity-75 disabled:cursor-not-allowed text-white font-inter text-[15px] font-medium rounded-xl transition-colors shadow-xs flex items-center justify-center cursor-pointer"
          >
            {isLoading ? "Memverifikasi..." : "Masuk ke Sistem"}
          </button>

          <p className="font-inter text-[12px] text-zinc-500 dark:text-zinc-400 text-center mt-3.5 md:mt-4 leading-normal">
            Sistem Informasi Kesehatan Anak dan Pemantauan Gizi Terpadu
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
