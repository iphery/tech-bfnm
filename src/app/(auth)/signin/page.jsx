"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/firebase-config";
import { toast } from "react-toastify";
import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

const SignIn = () => {
  const router = useRouter();
  const [inputEmail, setInputEmail] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [onloadLogin, setOnloadLogin] = useState(false);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("mita_remember_email");
      if (savedEmail) {
        setInputEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore local storage error if restricted
    }

    // Jika pengguna sedang membuka URL /signin dan sudah ada session info tersimpan serta auth aktif, langsung arahkan ke Dashboard
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && typeof window !== "undefined") {
        const info = localStorage.getItem("info");
        if (info) {
          window.location.href = "/";
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const getFirebaseErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "Format email tidak valid.";
      case "auth/user-not-found":
        return "Akun dengan email ini tidak ditemukan.";
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Email atau password yang Anda masukkan tidak sesuai.";
      case "auth/user-disabled":
        return "Akun Anda telah dinonaktifkan. Hubungi admin sistem.";
      case "auth/too-many-requests":
        return "Terlalu banyak percobaan gagal. Silakan coba beberapa saat lagi.";
      case "auth/network-request-failed":
        return "Koneksi internet bermasalah. Periksa jaringan Anda.";
      default:
        return "Gagal masuk ke sistem. Silakan periksa kembali email & password Anda.";
    }
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError("");
    setPasswordError("");
    setGeneralError("");

    if (!inputEmail.trim()) {
      setEmailError("Email wajib diisi.");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(inputEmail)) {
      setEmailError("Format email tidak valid.");
      isValid = false;
    }

    if (!inputPassword) {
      setPasswordError("Password wajib diisi.");
      isValid = false;
    } else if (inputPassword.length < 6) {
      setPasswordError("Password minimal 6 karakter.");
      isValid = false;
    }

    return isValid;
  };

  const fetch_data = async (uid, email) => {
    try {
      const response = await axios.post("/api/fetchuser", {
        uid: uid,
        email: email || inputEmail.trim(),
      });

      if (
        response.status === 200 &&
        response.data?.data &&
        response.data.data.length > 0
      ) {
        localStorage.setItem("info", JSON.stringify(response.data["data"]));

        if (rememberMe) {
          localStorage.setItem("mita_remember_email", inputEmail.trim());
        } else {
          localStorage.removeItem("mita_remember_email");
        }

        toast.success("Login berhasil! Mengalihkan...", {
          theme: "colored",
        });

        setTimeout(() => {
          window.location.href = "/";
        }, 300);
      } else {
        const errMsg = "Data akun pengguna tidak ditemukan di database.";
        setGeneralError(errMsg);
        toast.error(errMsg);
        setOnloadLogin(false);
      }
    } catch (error) {
      console.error("Fetch user error:", error);
      const errMsg = "Gagal memuat profil pengguna dari server.";
      setGeneralError(errMsg);
      toast.error(errMsg);
      setOnloadLogin(false);
    }
  };

  const proceed_login = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setOnloadLogin(true);
    setGeneralError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        inputEmail.trim(),
        inputPassword,
      );

      await fetch_data(userCredential.user.uid, userCredential.user.email);
    } catch (error) {
      console.error("Login error:", error);
      const friendlyMessage = getFirebaseErrorMessage(error?.code);
      setGeneralError(friendlyMessage);
      toast.error(friendlyMessage);
      setOnloadLogin(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0A0F1D] px-4 py-12 sm:px-6 lg:px-8">
      {/* Dynamic Background Light Glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[450px] w-[450px] rounded-full bg-primary/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[450px] w-[450px] rounded-full bg-indigo-600/20 blur-[140px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[160px]" />

      {/* Tech Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/85 p-7 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Top subtle line glow */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />

          {/* Brand Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700/70 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-3 shadow-xl shadow-primary/10 ring-1 ring-white/10">
              <Image
                src="/logo/logo.png"
                alt="MITA BFNM Logo"
                width={64}
                height={64}
                priority
                className="object-contain drop-shadow"
              />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>MITA • Maintenance System</span>
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Login
            </h1>
            {/* <p className="mt-1 text-sm text-slate-400">
              Masuk untuk mengakses portal perawatan & operasional aset
            </p> */}
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="animate-fadeIn mb-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300">
              <HiOutlineExclamationCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400" />
              <div className="flex-1">{generalError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={proceed_login} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <HiOutlineMail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (emailError) setEmailError("");
                    if (generalError) setGeneralError("");
                  }}
                  placeholder="nama@bfnm.com"
                  disabled={onloadLogin}
                  className={`w-full rounded-xl border bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all duration-200 focus:bg-slate-800 ${
                    emailError
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  } disabled:opacity-50`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-rose-400">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium uppercase tracking-wider text-slate-300"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <HiOutlineLockClosed className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                    if (generalError) setGeneralError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      proceed_login(e);
                    }
                  }}
                  placeholder="Masukkan kata sandi"
                  disabled={onloadLogin}
                  className={`w-full rounded-xl border bg-slate-800/80 py-3 pl-11 pr-11 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all duration-200 focus:bg-slate-800 ${
                    passwordError
                      ? "border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : "border-slate-700/80 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  } disabled:opacity-50`}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 transition-colors hover:text-slate-200"
                >
                  {showPassword ? (
                    <HiOutlineEyeOff className="h-5 w-5" />
                  ) : (
                    <HiOutlineEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-rose-400">{passwordError}</p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-400 hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-primary accent-primary focus:ring-primary/30"
                />
                <span>Ingat email saya</span>
              </label>

              {/* <span className="text-[11px] text-slate-500">
                Akses Terproteksi
              </span> */}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={onloadLogin}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-primary to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:from-primary/90 hover:to-indigo-500 hover:shadow-primary/35 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {onloadLogin ? (
                <div className="flex items-center gap-2.5">
                  <svg
                    className="h-5 w-5 animate-spin text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Memverifikasi Akun...</span>
                </div>
              ) : (
                <span className="flex items-center gap-2">
                  <span>Masuk ke Sistem</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              )}
            </button>
          </form>

          {/* Security & System Info Footer */}
          <div className="mt-8 border-t border-slate-800 pt-5 text-center">
            {/* <div className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <HiOutlineShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Koneksi Aman & Terenkripsi</span>
            </div> */}
            <p className="mt-2 text-[11px] text-slate-600">
              © {new Date().getFullYear()} ME • PT Balifoam Nusamegah
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
