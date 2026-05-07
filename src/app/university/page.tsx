"use client";

import { FormEvent, useState } from "react";

type UniversityListing = {
  id: string;
  title: string;
  city: string;
  studyLevel: string | null;
  seatsAvailable: number | null;
  ownerUserId?: string;
};

export default function UniversityDashboardPage() {
  const [ownerUserId, setOwnerUserId] = useState("demo-university-user-id");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Romania");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [studyLevel, setStudyLevel] = useState("Licenta");
  const [studyYears, setStudyYears] = useState("1-3");
  const [seatsAvailable, setSeatsAvailable] = useState(50);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState<UniversityListing[]>([]);

  async function loadPrograms() {
    const response = await fetch("/api/listings");
    const data = (await response.json()) as Array<
      UniversityListing & { category: "JOB" | "COURSE" | "STUDY_PROGRAM" }
    >;
    setPrograms(
      data.filter(
        (item) =>
          item.category === "STUDY_PROGRAM" &&
          (!item.ownerUserId || item.ownerUserId === ownerUserId),
      ),
    );
  }

  async function syncMyUniversityAccount() {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setMessage("Nu esti autentificat.");
      return;
    }
    const data = (await response.json()) as {
      user?: { userId: string; role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN" };
    };
    if (data.user?.role !== "UNIVERSITY") {
      setMessage("Contul autentificat nu este de universitate.");
      return;
    }
    setOwnerUserId(data.user.userId);
    setMessage("ID universitate sincronizat din sesiune.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerUserId,
          category: "STUDY_PROGRAM",
          title,
          description,
          city,
          country,
          applicationEmail,
          relocationSupport: false,
          disabilityFriendly: false,
          studyLevel,
          studyYears,
          seatsAvailable,
          eligibility: "Conditii de eligibilitate conform metodologiei universitatii.",
          requiredDocuments: "Diploma, foaie matricola, CI, scrisoare de intentie.",
          selectionProcess: "Evaluare dosar, apoi interviu/comisie.",
          feesAndScholarships: "Taxe conform regulament + optiuni de burse.",
          curriculum: "Curriculum actualizat, cu materii fundamentale si optionale.",
        }),
      });
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Program publicat.");
      if (response.ok) {
        setTitle("");
        setDescription("");
        setCity("");
        await loadPrograms();
      }
    } catch {
      setMessage("A aparut o eroare la publicare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Universitate</h1>
          <p className="mt-2 text-sm text-slate-600">
            Publicare programe de studiu pentru licenta, master si doctorat.
          </p>
          <button
            onClick={() => void syncMyUniversityAccount()}
            className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Foloseste contul meu
          </button>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Publica program universitar</h2>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={ownerUserId}
              onChange={(event) => setOwnerUserId(event.target.value)}
              placeholder="ID utilizator universitate"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={applicationEmail}
              onChange={(event) => setApplicationEmail(event.target.value)}
              type="email"
              placeholder="Email pentru aplicatii studenti"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Program / specializare"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={studyLevel}
              onChange={(event) => setStudyLevel(event.target.value)}
              placeholder="Nivel studiu (Licenta/Master/Doctorat)"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={studyYears}
              onChange={(event) => setStudyYears(event.target.value)}
              placeholder="Ani de studiu"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              type="number"
              min={1}
              value={seatsAvailable}
              onChange={(event) => setSeatsAvailable(Number(event.target.value))}
              placeholder="Locuri disponibile"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Oras"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              placeholder="Tara"
              className="rounded-lg border border-slate-300 p-3"
            />
            <textarea
              required
              rows={4}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Descriere program"
              className="rounded-lg border border-slate-300 p-3 md:col-span-2"
            />
            <button
              disabled={loading}
              className="rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50 md:col-span-2"
            >
              {loading ? "Se publica..." : "Publica program"}
            </button>
          </form>
          {message ? <p className="mt-3 text-sm font-medium text-slate-700">{message}</p> : null}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Programe active</h2>
            <button
              onClick={() => void loadPrograms()}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Reincarca lista
            </button>
          </div>
          <div className="space-y-3">
            {programs.map((program) => (
              <article
                key={program.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">{program.title}</p>
                <p className="text-sm text-slate-600">
                  {program.city} | {program.studyLevel ?? "-"} | Locuri:{" "}
                  {program.seatsAvailable ?? 0}
                </p>
              </article>
            ))}
            {programs.length === 0 ? (
              <p className="text-sm text-slate-500">Nu exista programe incarcate inca.</p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
