"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = (await response.json()) as {
      message?: string;
      user?: { role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN"; id: string };
    };
    setMessage(data.message ?? "Autentificare finalizata.");
    if (response.ok && data.user) {
      if (data.user.role === "ADMIN") router.push("/admin");
      if (data.user.role === "COMPANY") router.push("/company");
      if (data.user.role === "UNIVERSITY") router.push("/university");
      if (data.user.role === "CANDIDATE") router.push("/");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Autentificare Colibri Jobs</h1>
        <p className="mt-2 text-sm text-slate-600">
          Login cu email si parola securizata.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 p-3"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Parola"
            className="w-full rounded-lg border border-slate-300 p-3"
          />
          <button className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800">
            Login
          </button>
          {message ? <p className="text-sm font-medium text-slate-700">{message}</p> : null}
        </form>
      </div>
    </main>
  );
}
