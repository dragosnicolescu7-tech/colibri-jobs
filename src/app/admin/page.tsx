"use client";

import { useState } from "react";

type AdminStats = {
  usersLast30Days: number;
  usersLast6Months: number;
  usersLastYear: number;
  candidateCount: number;
  companyCount: number;
  universityCount: number;
  pendingCompanies: number;
  pendingUniversities: number;
};

type PendingCompany = {
  id: string;
  companyName: string;
  cui: string;
  contactEmail: string;
  user: { fullName: string; email: string };
};

type PendingUniversity = {
  id: string;
  universityName: string;
  contactEmail: string;
  user: { fullName: string; email: string };
};

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingCompanies, setPendingCompanies] = useState<PendingCompany[]>([]);
  const [pendingUniversities, setPendingUniversities] = useState<PendingUniversity[]>([]);
  const [message, setMessage] = useState("");

  async function refreshStats() {
    const response = await fetch("/api/admin/stats");
    const data = (await response.json()) as AdminStats;
    setStats(data);
  }

  async function refreshQueues() {
    const [companiesResponse, universitiesResponse] = await Promise.all([
      fetch("/api/admin/reviews?type=company"),
      fetch("/api/admin/reviews?type=university"),
    ]);
    const companies = (await companiesResponse.json()) as PendingCompany[];
    const universities = (await universitiesResponse.json()) as PendingUniversity[];
    setPendingCompanies(companies);
    setPendingUniversities(universities);
  }

  async function refreshAll() {
    await refreshStats();
    void refreshQueues();
  }

  async function decide(
    type: "company" | "university",
    profileId: string,
    action: "approve" | "reject",
  ) {
    const response = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, profileId, action }),
    });
    const data = (await response.json()) as { message?: string };
    setMessage(data.message ?? "Status actualizat.");
    await refreshQueues();
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard Colibri Jobs</h1>
          <p className="mt-2 text-sm text-slate-600">
            Viziune centralizata pentru utilizatori, verificari si activitatea platformei.
          </p>
          <button
            onClick={() => void refreshAll()}
            className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Incarca date admin
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <Card title="Utilizatori noi (30 zile)" value={stats?.usersLast30Days ?? 0} />
          <Card title="Utilizatori noi (6 luni)" value={stats?.usersLast6Months ?? 0} />
          <Card title="Utilizatori noi (1 an)" value={stats?.usersLastYear ?? 0} />
          <Card title="Candidati total" value={stats?.candidateCount ?? 0} />
          <Card title="Companii total" value={stats?.companyCount ?? 0} />
          <Card title="Universitati total" value={stats?.universityCount ?? 0} />
          <Card title="Companii in asteptare" value={stats?.pendingCompanies ?? 0} />
          <Card title="Universitati in asteptare" value={stats?.pendingUniversities ?? 0} />
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Companii in asteptare</h2>
          <div className="mt-4 space-y-3">
            {pendingCompanies.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.companyName}</p>
                  <p className="text-sm text-slate-500">
                    CUI: {item.cui} | Contact: {item.contactEmail}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void decide("company", item.id, "approve")}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Aproba
                  </button>
                  <button
                    onClick={() => void decide("company", item.id, "reject")}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Respinge
                  </button>
                </div>
              </article>
            ))}
            {pendingCompanies.length === 0 ? (
              <p className="text-sm text-slate-500">Nu exista companii in asteptare.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Universitati in asteptare</h2>
          <div className="mt-4 space-y-3">
            {pendingUniversities.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.universityName}</p>
                  <p className="text-sm text-slate-500">Contact: {item.contactEmail}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void decide("university", item.id, "approve")}
                    className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Aproba
                  </button>
                  <button
                    onClick={() => void decide("university", item.id, "reject")}
                    className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Respinge
                  </button>
                </div>
              </article>
            ))}
            {pendingUniversities.length === 0 ? (
              <p className="text-sm text-slate-500">Nu exista universitati in asteptare.</p>
            ) : null}
          </div>
        </section>
        {message ? (
          <p className="rounded-lg bg-white p-4 text-sm font-medium text-slate-700 shadow-sm">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: number }) {
  return (
    <article className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </article>
  );
}
