"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type Role = "CANDIDATE" | "COMPANY" | "UNIVERSITY";
type Language = "ro" | "en" | "es" | "it" | "de" | "fr";

type RegisterState = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
  city: string;
  country: string;
  title: string;
  cvUrl: string;
  companyName: string;
  cui: string;
  fiscalCode: string;
  companyAddress: string;
  companyContactName: string;
  companyContactEmail: string;
  universityName: string;
  universityAddress: string;
  faculties: string;
  universityContactPhone: string;
  universityContactEmail: string;
  universityDescription: string;
  openToOpportunities: boolean;
};

const initialState: RegisterState = {
  fullName: "",
  email: "",
  password: "",
  phoneNumber: "",
  role: "CANDIDATE",
  city: "",
  country: "",
  title: "",
  cvUrl: "",
  companyName: "",
  cui: "",
  fiscalCode: "",
  companyAddress: "",
  companyContactName: "",
  companyContactEmail: "",
  universityName: "",
  universityAddress: "",
  faculties: "",
  universityContactPhone: "",
  universityContactEmail: "",
  universityDescription: "",
  openToOpportunities: true,
};

const categories = [
  { title: "Joburi", description: "Oportunitati active, locale si internationale." },
  { title: "Cursuri", description: "Cursuri publicate de companii verificate." },
  { title: "Studii universitare", description: "Licenta, master si doctorat." },
  { title: "Vreau acasa", description: "Joburi pentru diaspora cu suport relocare." },
  { title: "Dizabilitati", description: "Roluri dedicate persoanelor cu dizabilitati." },
];

const uiText: Record<Language, { navCategories: string; navRegister: string; navPartners: string; login: string; logout: string; heroTitle: string; heroSubtitle: string; createAccount: string; openToOpportunities: string; activeCategory: string }> = {
  ro: {
    navCategories: "Categorii",
    navRegister: "Inregistrare",
    navPartners: "Parteneri Oficiali",
    login: "Login",
    logout: "Logout",
    heroTitle: "Construieste-ti viitorul cu Colibri Jobs",
    heroSubtitle: "Joburi, cursuri si programe universitare intr-o platforma eleganta, securizata si pregatita pentru companii, candidati si universitati.",
    createAccount: "Creare cont",
    openToOpportunities: "Sunt deschis la oportunitati noi",
    activeCategory: "Categoria activa",
  },
  en: {
    navCategories: "Categories",
    navRegister: "Register",
    navPartners: "Official Partners",
    login: "Login",
    logout: "Logout",
    heroTitle: "Build your future with Colibri Jobs",
    heroSubtitle: "Jobs, courses, and university programs in an elegant and secure platform.",
    createAccount: "Create account",
    openToOpportunities: "Open to new opportunities",
    activeCategory: "Active category",
  },
  es: { navCategories: "Categorias", navRegister: "Registro", navPartners: "Socios Oficiales", login: "Login", logout: "Salir", heroTitle: "Construye tu futuro con Colibri Jobs", heroSubtitle: "Empleos, cursos y programas universitarios en una plataforma profesional.", createAccount: "Crear cuenta", openToOpportunities: "Disponible para nuevas oportunidades", activeCategory: "Categoria activa" },
  it: { navCategories: "Categorie", navRegister: "Registrazione", navPartners: "Partner Ufficiali", login: "Login", logout: "Esci", heroTitle: "Costruisci il tuo futuro con Colibri Jobs", heroSubtitle: "Lavori, corsi e programmi universitari in una piattaforma professionale.", createAccount: "Crea account", openToOpportunities: "Disponibile per nuove opportunita", activeCategory: "Categoria attiva" },
  de: { navCategories: "Kategorien", navRegister: "Registrierung", navPartners: "Offizielle Partner", login: "Login", logout: "Abmelden", heroTitle: "Baue deine Zukunft mit Colibri Jobs", heroSubtitle: "Jobs, Kurse und Studienprogramme auf einer professionellen Plattform.", createAccount: "Konto erstellen", openToOpportunities: "Offen fur neue Chancen", activeCategory: "Aktive Kategorie" },
  fr: { navCategories: "Categories", navRegister: "Inscription", navPartners: "Partenaires Officiels", login: "Connexion", logout: "Deconnexion", heroTitle: "Construisez votre avenir avec Colibri Jobs", heroSubtitle: "Emplois, cours et programmes universitaires sur une plateforme professionnelle.", createAccount: "Creer un compte", openToOpportunities: "Ouvert aux nouvelles opportunites", activeCategory: "Categorie active" },
};

export default function Home() {
  const [state, setState] = useState<RegisterState>(initialState);
  const [language, setLanguage] = useState<Language>("ro");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Joburi");
  const [candidateId, setCandidateId] = useState("");
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applicationCvUrl, setApplicationCvUrl] = useState("");
  const [motivation, setMotivation] = useState("");
  const [selectedListingId, setSelectedListingId] = useState("");
  const [listings, setListings] = useState<
    Array<{
      id: string;
      title: string;
      city: string;
      country: string;
      category: "JOB" | "COURSE" | "STUDY_PROGRAM";
      relocationSupport: boolean;
      disabilityFriendly: boolean;
    }>
  >([]);
  const [sessionRole, setSessionRole] = useState<
    "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN" | null
  >(null);

  const isCandidate = state.role === "CANDIDATE";
  const isCompany = state.role === "COMPANY";
  const isUniversity = state.role === "UNIVERSITY";
  const t = uiText[language];

  const submitPayload = useMemo(() => {
    const base = {
      fullName: state.fullName,
      email: state.email,
      password: state.password,
      phoneNumber: state.phoneNumber,
      role: state.role,
      city: state.city,
      country: state.country,
    };

    if (isCandidate)
      return {
        ...base,
        title: state.title,
        cvUrl: state.cvUrl,
        openToOpportunities: state.openToOpportunities,
      };
    if (isCompany) {
      return {
        ...base,
        companyName: state.companyName,
        cui: state.cui,
        fiscalCode: state.fiscalCode,
        companyAddress: state.companyAddress,
        companyContactName: state.companyContactName,
        companyContactEmail: state.companyContactEmail,
      };
    }
    return {
      ...base,
      universityName: state.universityName,
      universityAddress: state.universityAddress,
      faculties: state.faculties,
      universityContactPhone: state.universityContactPhone,
      universityContactEmail: state.universityContactEmail,
      universityDescription: state.universityDescription,
    };
  }, [isCandidate, isCompany, state]);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          data:
            | { user?: { role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN" } }
            | null,
        ) => {
          setSessionRole(data?.user?.role ?? null);
        },
      )
      .catch(() => setSessionRole(null));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitPayload),
      });
      const data = (await response.json()) as { message?: string };
      setMessage(data.message ?? "Cerere trimisa.");
      if (response.ok) {
        setState((prev) => ({ ...initialState, role: prev.role }));
      }
    } catch {
      setMessage("A aparut o eroare la trimitere.");
    } finally {
      setLoading(false);
    }
  }

  function onCategoryChange(category: string) {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadListings() {
    const response = await fetch("/api/listings");
    const data = (await response.json()) as Array<{
      id: string;
      title: string;
      city: string;
      country: string;
      category: "JOB" | "COURSE" | "STUDY_PROGRAM";
      relocationSupport: boolean;
      disabilityFriendly: boolean;
    }>;
    setListings(data);
    if (data.length > 0 && !selectedListingId) {
      setSelectedListingId(data[0].id);
    }
  }

  async function uploadCv(file: File, destination: "register" | "application") {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload-cv", {
      method: "POST",
      body: formData,
    });
    const data = (await response.json()) as { message?: string; url?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.message ?? "Upload esuat.");
    }

    if (destination === "register") {
      setState((prev) => ({ ...prev, cvUrl: data.url ?? "" }));
      return;
    }
    setApplicationCvUrl(data.url ?? "");
  }

  async function applyToListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplicationMessage("");
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId: selectedListingId,
          candidateId,
          motivation,
          cvUrl: applicationCvUrl,
        }),
      });
      const data = (await response.json()) as { message?: string };
      setApplicationMessage(data.message ?? "Aplicatie trimisa.");
    } catch {
      setApplicationMessage("A aparut o eroare la aplicare.");
    }
  }

  async function syncMyCandidateAccount() {
    const response = await fetch("/api/auth/me");
    if (!response.ok) {
      setApplicationMessage("Nu esti autentificat.");
      return;
    }
    const data = (await response.json()) as {
      user?: { userId: string; role: "CANDIDATE" | "COMPANY" | "UNIVERSITY" | "ADMIN" };
    };
    if (data.user?.role !== "CANDIDATE") {
      setApplicationMessage("Contul autentificat nu este de candidat.");
      return;
    }
    setCandidateId(data.user.userId);
    setApplicationMessage("ID candidat sincronizat din sesiune.");
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setSessionRole(null);
    setApplicationMessage("Ai fost delogat.");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
              <Image
                src="/brand/colibri-logo.png"
                alt="Colibri Jobs"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <p className="text-lg font-bold">Colibri Jobs</p>
              <p className="text-xs text-slate-500">Portal profesional de recrutare</p>
            </div>
          </div>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#categorii">{t.navCategories}</a>
            <a href="#conturi">{t.navRegister}</a>
            <a href="#parteneri">{t.navPartners}</a>
            {sessionRole === "ADMIN" ? <a href="/admin">Admin</a> : null}
            {sessionRole === "COMPANY" ? <a href="/company">Companie</a> : null}
            {sessionRole === "UNIVERSITY" ? <a href="/university">Universitate</a> : null}
            {!sessionRole ? <a href="/login">{t.login}</a> : null}
            {sessionRole ? (
              <button onClick={() => void logout()} className="cursor-pointer">
                {t.logout}
              </button>
            ) : null}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="ro">RO</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="it">IT</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
            </select>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-10">
        <section className="rounded-2xl bg-gradient-to-r from-violet-800 via-fuchsia-700 to-cyan-600 p-10 text-white shadow-xl">
          <h1 className="text-4xl font-extrabold">{t.heroTitle}</h1>
          <p className="mt-3 max-w-3xl text-base text-white/90">{t.heroSubtitle}</p>
        </section>

        <section id="categorii" className="grid gap-4 md:grid-cols-5">
          {categories.map((category) => (
            <button
              key={category.title}
              type="button"
              onClick={() => onCategoryChange(category.title)}
              className={`rounded-xl border p-4 text-left shadow-sm transition ${
                activeCategory === category.title
                  ? "border-violet-700 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-violet-300"
              }`}
            >
              <h2 className="text-base font-bold">{category.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            </button>
          ))}
        </section>
        <p className="text-sm font-medium text-slate-600">
          {t.activeCategory}: <span className="text-violet-700">{activeCategory}</span>
        </p>

        <section id="conturi" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">{t.createAccount}</h2>
          <p className="mt-2 text-sm text-slate-600">
            Telefonul este obligatoriu pentru toate conturile. CV-ul este obligatoriu pentru candidati.
          </p>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <select
              value={state.role}
              onChange={(event) => setState((prev) => ({ ...prev, role: event.target.value as Role }))}
              className="rounded-lg border border-slate-300 p-3"
            >
              <option value="CANDIDATE">Cont candidat</option>
              <option value="COMPANY">Cont companie</option>
              <option value="UNIVERSITY">Cont universitate</option>
            </select>
            <input required placeholder="Nume complet" className="rounded-lg border border-slate-300 p-3" value={state.fullName} onChange={(event) => setState((prev) => ({ ...prev, fullName: event.target.value }))} />
            <input required type="email" placeholder="Email" className="rounded-lg border border-slate-300 p-3" value={state.email} onChange={(event) => setState((prev) => ({ ...prev, email: event.target.value }))} />
            <input required type="password" placeholder="Parola (minim 8 caractere)" className="rounded-lg border border-slate-300 p-3" value={state.password} onChange={(event) => setState((prev) => ({ ...prev, password: event.target.value }))} />
            <input required placeholder="Telefon (obligatoriu)" className="rounded-lg border border-slate-300 p-3" value={state.phoneNumber} onChange={(event) => setState((prev) => ({ ...prev, phoneNumber: event.target.value }))} />
            <input placeholder="Oras" className="rounded-lg border border-slate-300 p-3" value={state.city} onChange={(event) => setState((prev) => ({ ...prev, city: event.target.value }))} />
            <input placeholder="Tara" className="rounded-lg border border-slate-300 p-3" value={state.country} onChange={(event) => setState((prev) => ({ ...prev, country: event.target.value }))} />

            {isCandidate && (
              <>
                <input required placeholder="Functie dorita" className="rounded-lg border border-slate-300 p-3" value={state.title} onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))} />
                <div className="space-y-2">
                  <input required placeholder="URL CV (obligatoriu)" className="w-full rounded-lg border border-slate-300 p-3" value={state.cvUrl} onChange={(event) => setState((prev) => ({ ...prev, cvUrl: event.target.value }))} />
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadCv(file, "register").catch(() =>
                          setMessage("Upload CV esuat. Incearca din nou."),
                        );
                      }
                    }}
                    className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={state.openToOpportunities}
                    onChange={(event) =>
                      setState((prev) => ({
                        ...prev,
                        openToOpportunities: event.target.checked,
                      }))
                    }
                  />
                  {t.openToOpportunities}
                </label>
              </>
            )}

            {isCompany && (
              <>
                <input required placeholder="Nume companie" className="rounded-lg border border-slate-300 p-3" value={state.companyName} onChange={(event) => setState((prev) => ({ ...prev, companyName: event.target.value }))} />
                <input required placeholder="CUI" className="rounded-lg border border-slate-300 p-3" value={state.cui} onChange={(event) => setState((prev) => ({ ...prev, cui: event.target.value }))} />
                <input required placeholder="Cod fiscal" className="rounded-lg border border-slate-300 p-3" value={state.fiscalCode} onChange={(event) => setState((prev) => ({ ...prev, fiscalCode: event.target.value }))} />
                <input required placeholder="Adresa companiei" className="rounded-lg border border-slate-300 p-3" value={state.companyAddress} onChange={(event) => setState((prev) => ({ ...prev, companyAddress: event.target.value }))} />
                <input required placeholder="Persoana de contact" className="rounded-lg border border-slate-300 p-3" value={state.companyContactName} onChange={(event) => setState((prev) => ({ ...prev, companyContactName: event.target.value }))} />
                <input required type="email" placeholder="Email contact companie" className="rounded-lg border border-slate-300 p-3" value={state.companyContactEmail} onChange={(event) => setState((prev) => ({ ...prev, companyContactEmail: event.target.value }))} />
              </>
            )}

            {isUniversity && (
              <>
                <input required placeholder="Universitate" className="rounded-lg border border-slate-300 p-3" value={state.universityName} onChange={(event) => setState((prev) => ({ ...prev, universityName: event.target.value }))} />
                <input required placeholder="Adresa universitatii" className="rounded-lg border border-slate-300 p-3" value={state.universityAddress} onChange={(event) => setState((prev) => ({ ...prev, universityAddress: event.target.value }))} />
                <input required placeholder="Facultati (lista)" className="rounded-lg border border-slate-300 p-3" value={state.faculties} onChange={(event) => setState((prev) => ({ ...prev, faculties: event.target.value }))} />
                <input required placeholder="Telefon contact universitate" className="rounded-lg border border-slate-300 p-3" value={state.universityContactPhone} onChange={(event) => setState((prev) => ({ ...prev, universityContactPhone: event.target.value }))} />
                <input required type="email" placeholder="Email contact universitate" className="rounded-lg border border-slate-300 p-3" value={state.universityContactEmail} onChange={(event) => setState((prev) => ({ ...prev, universityContactEmail: event.target.value }))} />
                <textarea required placeholder="Descriere universitate / programe" className="rounded-lg border border-slate-300 p-3 md:col-span-2" rows={4} value={state.universityDescription} onChange={(event) => setState((prev) => ({ ...prev, universityDescription: event.target.value }))} />
              </>
            )}

            <button disabled={loading} className="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white transition hover:bg-violet-800 disabled:opacity-50 md:col-span-2">
              {loading ? "Se proceseaza..." : "Creeaza cont"}
            </button>
            {message ? <p className="text-sm font-medium text-slate-700 md:col-span-2">{message}</p> : null}
          </form>
        </section>

        <section id="parteneri" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Parteneri Oficiali</h3>
          <p className="mt-2 text-sm text-slate-600">
            Zona dedicata logo-urilor companiilor partenere, pentru incredere si vizibilitate.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-lg border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Logo Partener
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Anunturi active</h3>
            <button
              onClick={() => void loadListings()}
              className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
            >
              Incarca anunturi
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {listings.map((item) => (
              <article key={item.id} className="rounded-lg border border-slate-200 p-4">
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">
                  {item.city}, {item.country} - {item.category}
                </p>
                <div className="mt-2 flex gap-2 text-xs">
                  {item.relocationSupport ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-700">
                      Vreau acasa / relocare
                    </span>
                  ) : null}
                  {item.disabilityFriendly ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700">
                      Dizabilitati
                    </span>
                  ) : null}
                </div>
              </article>
            ))}
            {listings.length === 0 ? (
              <p className="text-sm text-slate-500">Nu exista anunturi incarcate inca.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Aplicare rapida candidat</h3>
          <p className="mt-2 text-sm text-slate-600">
            Formularul trimite automat aplicatia completa catre compania/universitatea care a publicat anuntul.
          </p>
          <button
            onClick={() => void syncMyCandidateAccount()}
            className="mt-3 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-800"
          >
            Foloseste contul meu candidat
          </button>
          <form onSubmit={applyToListing} className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              required
              value={selectedListingId}
              onChange={(event) => setSelectedListingId(event.target.value)}
              className="rounded-lg border border-slate-300 p-3"
            >
              <option value="">Selecteaza anunt</option>
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title} - {listing.city}
                </option>
              ))}
            </select>
            <input
              required
              value={candidateId}
              onChange={(event) => setCandidateId(event.target.value)}
              placeholder="ID candidat"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              required
              value={applicationCvUrl}
              onChange={(event) => setApplicationCvUrl(event.target.value)}
              placeholder="Link CV"
              className="rounded-lg border border-slate-300 p-3"
            />
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void uploadCv(file, "application").catch(() =>
                    setApplicationMessage("Upload CV esuat. Incearca din nou."),
                  );
                }
              }}
              className="rounded-lg border border-slate-300 p-2 text-sm"
            />
            <textarea
              required
              rows={4}
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              placeholder="Mesaj de aplicare"
              className="rounded-lg border border-slate-300 p-3 md:col-span-2"
            />
            <button className="rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800 md:col-span-2">
              Trimite aplicatia
            </button>
            {applicationMessage ? (
              <p className="text-sm font-medium text-slate-700 md:col-span-2">{applicationMessage}</p>
            ) : null}
          </form>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-6 text-sm text-slate-700 md:flex-row md:items-center md:justify-between">
          <p>Colibri Jobs - platforma profesionala de recrutare</p>
          <p>Telefon: 0740150801 | Email: recrutare@colibrijobs.ro</p>
        </div>
      </footer>
    </div>
  );
}
