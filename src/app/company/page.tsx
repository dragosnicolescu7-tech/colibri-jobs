"use client";

import { FormEvent, useState } from "react";

const statuses = [
  { name: "Respins", color: "bg-red-100 text-red-700" },
  { name: "Invitat la interviu", color: "bg-yellow-100 text-yellow-700" },
  { name: "Angajat", color: "bg-green-100 text-green-700" },
];

type ListingCategory = "JOB" | "COURSE" | "STUDY_PROGRAM";

type Listing = {
  id: string;
  title: string;
  city: string;
  category: ListingCategory;
  ownerUserId?: string;
  relocationSupport?: boolean;
  disabilityFriendly?: boolean;
};

type ApplicationStatus = "APPLIED" | "REJECTED" | "INTERVIEW" | "HIRED";

type CompanyApplication = {
  id: string;
  motivation: string;
  cvUrl: string;
  status: ApplicationStatus;
  candidate: { fullName: string; email: string };
  listing: { title: string };
};

export default function CompanyDashboardPage() {
  const [ownerUserId, setOwnerUserId] = useState("demo-company-user-id");
  const [category, setCategory] = useState<ListingCategory>("JOB");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("Romania");
  const [applicationEmail, setApplicationEmail] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Mid");
  const [studyLevel, setStudyLevel] = useState("Licenta");
  const [studyYears, setStudyYears] = useState("1-3");
  const [seatsAvailable, setSeatsAvailable] = useState(100);
  const [relocationSupport, setRelocationSupport] = useState(false);
  const [relocationDetails, setRelocationDetails] = useState("");
  const [disabilityFriendly, setDisabilityFriendly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [listings, setListings] = useState<Listing[]>([]);
  const [applications, setApplications] = useState<CompanyApplication[]>([]);

  async function loadListings() {
    const response = await fetch("/api/listings");
    const data = (await response.json()) as Listing[];
    setListings(
      data.filter(
        (item) =>
          (item.category === "JOB" ||
            item.category === "COURSE" ||
            item.category === "STUDY_PROGRAM") &&
          (!item.ownerUserId || item.ownerUserId === ownerUserId),
      ),
    );
  }

  async function syncMyCompanyAccount() {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setMessage("Nu esti autentificat.");
      return;
    }
    const data = (await response.json()) as {
      user?: { userId: string; role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN" };
    };
    if (data.user?.role !== "COMPANY") {
      setMessage("Contul autentificat nu este de companie.");
      return;
    }
    setOwnerUserId(data.user.userId);
    setMessage("ID companie sincronizat din sesiune.");
  }

  async function loadApplications() {
    const response = await fetch(
      `/api/company/applications?ownerUserId=${encodeURIComponent(ownerUserId)}`,
    );
    if (!response.ok) {
      setApplications([]);
      return;
    }
    const data = (await response.json()) as CompanyApplication[];
    setApplications(data);
  }

  async function updateApplicationStatus(
    applicationId: string,
    status: "REJECTED" | "INTERVIEW" | "HIRED",
  ) {
    const response = await fetch("/api/company/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, status }),
    });
    if (response.ok) {
      setMessage("Status candidat actualizat.");
      await loadApplications();
    } else {
      setMessage("Nu am putut actualiza statusul candidatului.");
    }
  }

  async function startPromotion(listingId: string, plan: "TOP_30" | "PROMOTED_15" | "PROMOTED_7") {
    const response = await fetch("/api/promotions/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, plan }),
    });
    const data = (await response.json()) as { checkoutUrl?: string; message?: string };
    if (response.ok && data.checkoutUrl) {
      window.location.assign(data.checkoutUrl);
      return;
    }
    setMessage(data.message ?? "Promovarea nu a putut fi initiata.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        ownerUserId,
        category,
        title,
        description,
        city,
        country,
        applicationEmail,
        relocationSupport,
        relocationDetails,
        disabilityFriendly,
      };

      if (category === "JOB") {
        payload.employmentType = employmentType;
        payload.experienceLevel = experienceLevel;
      }

      if (category === "STUDY_PROGRAM") {
        payload.studyLevel = studyLevel;
        payload.studyYears = studyYears;
        payload.seatsAvailable = seatsAvailable;
        payload.eligibility = "Conditii standard conform metodologiei.";
        payload.requiredDocuments = "Diploma, foaie matricola, CI.";
        payload.selectionProcess = "Verificare dosar + interviu.";
        payload.feesAndScholarships = "Taxe standard + burse merit.";
        payload.curriculum = "Programa completa pe specializare.";
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Operatie finalizata.");
      if (response.ok) {
        setTitle("");
        setDescription("");
        setCity("");
        setRelocationSupport(false);
        setRelocationDetails("");
        setDisabilityFriendly(false);
        void loadListings();
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
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Companie</h1>
          <p className="mt-2 text-sm text-slate-600">
            Joburi active, aplicatii primite si promovare rapida cu Stripe.
          </p>
          <button
            onClick={() => void syncMyCompanyAccount()}
            className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Foloseste contul meu
          </button>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Joburi active</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{listings.length}</p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Aplicatii noi (7 zile)</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{applications.length}</p>
          </article>
          <article className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Status companie</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">Verificata</p>
          </article>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Publicare anunt nou</h2>
          <form onSubmit={onSubmit} className="grid gap-3 md:grid-cols-2">
            <input
              value={ownerUserId}
              onChange={(event) => setOwnerUserId(event.target.value)}
              required
              placeholder="ID utilizator companie"
              className="rounded-lg border border-slate-300 p-3"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ListingCategory)}
              className="rounded-lg border border-slate-300 p-3"
            >
              <option value="JOB">Job</option>
              <option value="COURSE">Curs</option>
              <option value="STUDY_PROGRAM">Program universitar</option>
            </select>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              placeholder="Titlu"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              value={applicationEmail}
              onChange={(event) => setApplicationEmail(event.target.value)}
              required
              type="email"
              placeholder="Email aplicatii"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              required
              placeholder="Oras"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              required
              placeholder="Tara"
              className="rounded-lg border border-slate-300 p-3"
            />
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 p-3 text-sm">
              <input
                type="checkbox"
                checked={relocationSupport}
                onChange={(event) => setRelocationSupport(event.target.checked)}
              />
              Job cu suport relocare (Vreau acasa)
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 p-3 text-sm">
              <input
                type="checkbox"
                checked={disabilityFriendly}
                onChange={(event) => setDisabilityFriendly(event.target.checked)}
              />
              Job dedicat persoanelor cu dizabilitati
            </label>
            {relocationSupport ? (
              <input
                value={relocationDetails}
                onChange={(event) => setRelocationDetails(event.target.value)}
                required
                placeholder="Detalii suport relocare (obligatoriu)"
                className="rounded-lg border border-slate-300 p-3 md:col-span-2"
              />
            ) : null}
            {category === "JOB" ? (
              <>
                <input
                  value={employmentType}
                  onChange={(event) => setEmploymentType(event.target.value)}
                  required
                  placeholder="Tip angajare"
                  className="rounded-lg border border-slate-300 p-3"
                />
                <input
                  value={experienceLevel}
                  onChange={(event) => setExperienceLevel(event.target.value)}
                  required
                  placeholder="Nivel experienta"
                  className="rounded-lg border border-slate-300 p-3"
                />
              </>
            ) : null}
            {category === "STUDY_PROGRAM" ? (
              <>
                <input
                  value={studyLevel}
                  onChange={(event) => setStudyLevel(event.target.value)}
                  required
                  placeholder="Nivel studiu"
                  className="rounded-lg border border-slate-300 p-3"
                />
                <input
                  value={studyYears}
                  onChange={(event) => setStudyYears(event.target.value)}
                  required
                  placeholder="Ani studiu"
                  className="rounded-lg border border-slate-300 p-3"
                />
                <input
                  value={seatsAvailable}
                  onChange={(event) => setSeatsAvailable(Number(event.target.value))}
                  required
                  type="number"
                  min={1}
                  placeholder="Numar locuri"
                  className="rounded-lg border border-slate-300 p-3"
                />
              </>
            ) : null}
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
              rows={4}
              placeholder="Descriere detaliata"
              className="rounded-lg border border-slate-300 p-3 md:col-span-2"
            />
            <button
              disabled={loading}
              className="rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50 md:col-span-2"
            >
              {loading ? "Se publica..." : "Publica anunt"}
            </button>
            {message ? (
              <p className="text-sm font-medium text-slate-700 md:col-span-2">{message}</p>
            ) : null}
          </form>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Joburi active</h2>
            <button
              onClick={() => void loadListings()}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Reincarca lista
            </button>
          </div>
          <div className="space-y-3">
            {listings.map((job) => (
              <article
                key={job.id}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{job.title}</p>
                  <p className="text-sm text-slate-500">
                    {job.city} - {job.category}
                  </p>
                  <div className="mt-1 flex gap-2 text-xs">
                    {job.relocationSupport ? (
                      <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
                        Vreau acasa
                      </span>
                    ) : null}
                    {job.disabilityFriendly ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">
                        Dizabilitati
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void loadApplications()}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium"
                  >
                    Vezi aplicatii
                  </button>
                  <button
                    onClick={() => void startPromotion(job.id, "TOP_30")}
                    className="rounded-lg bg-fuchsia-600 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700"
                  >
                    Promoveaza 299 lei
                  </button>
                  <button
                    onClick={() => void startPromotion(job.id, "PROMOTED_15")}
                    className="rounded-lg bg-fuchsia-500 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-600"
                  >
                    15 zile - 189 lei
                  </button>
                  <button
                    onClick={() => void startPromotion(job.id, "PROMOTED_7")}
                    className="rounded-lg bg-fuchsia-400 px-3 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500"
                  >
                    7 zile - 129 lei
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Aplicatii primite</h2>
          <p className="mt-2 text-sm text-slate-600">
            Statusurile candidatilor sunt evidentiate vizual pentru decizii rapide.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <span key={status.name} className={`rounded-full px-3 py-1 text-sm font-semibold ${status.color}`}>
                {status.name}
              </span>
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {applications.map((application) => (
              <article
                key={application.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <p className="font-semibold text-slate-900">
                  {application.candidate.fullName} - {application.listing.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">{application.candidate.email}</p>
                <p className="mt-2 text-sm text-slate-600">{application.motivation}</p>
                <a
                  href={application.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-violet-700"
                >
                  Deschide CV
                </a>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => void updateApplicationStatus(application.id, "REJECTED")}
                    className="rounded-lg bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                  >
                    Respins
                  </button>
                  <button
                    onClick={() => void updateApplicationStatus(application.id, "INTERVIEW")}
                    className="rounded-lg bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
                  >
                    Invitat la interviu
                  </button>
                  <button
                    onClick={() => void updateApplicationStatus(application.id, "HIRED")}
                    className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                  >
                    Angajat
                  </button>
                </div>
              </article>
            ))}
            {applications.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nu exista aplicatii inca. Apasa &quot;Vezi aplicatii&quot; dupa ce candidatii aplica.
              </p>
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
