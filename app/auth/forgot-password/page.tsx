"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/update-password`
          : undefined,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Қалпына келтіру сілтемесі Электрондық почтаға жіберілді.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md space-y-5"
      >
        <h1 className="text-2xl font-bold text-center">
          Құпия сөзді қалпына келтіру
        </h1>

        <input
          type="email"
          placeholder="Электрондық почтаны енгізіңіз"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg p-3"
          required
        />

        <button
          className="w-full bg-indigo-600 text-white rounded-lg p-3"
        >
          Сілтемені жіберу
        </button>

        {message && (
          <p className="text-center text-sm text-green-600">
            {message}
          </p>
        )}

        <div className="text-center">
          <Link href="/auth/login" className="text-indigo-600">
            Артқа
          </Link>
        </div>
      </form>
    </div>
  );
}