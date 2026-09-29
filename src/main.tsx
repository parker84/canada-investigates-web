import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowUpRight,
  ArrowRight,
  Search,
  MapPin,
  FileText,
  ArrowLeft,
  Menu,
  X,
  ShieldCheck,
  Radio,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import "./style.css";
import {
  InvestigationExperience,
  ScrollAtmosphere,
} from "./InvestigationExperience";

type Case = {
  id: string;
  slug: string;
  title: string;
  location: string;
  province: string;
  category: string;
  summary: string;
  status: string;
  demo: boolean;
  number?: string;
  art?: string;
  note?: string;
  status_as_of?: string;
  checked_at?: string;
  tip?: { phone: string; url: string; label: string };
  sources: { url: string; label: string }[];
  claims?: { text: string; status: string }[];
  timeline?: { date: string; text: string }[];
};
const API =
  (import.meta as unknown as { env: Record<string, string> }).env
    .VITE_API_URL || "";
const provinces = [
  "Ontario",
  "Nova Scotia",
  "Manitoba",
  "British Columbia",
  "Alberta",
  "Saskatchewan",
  "Quebec",
  "New Brunswick",
  "Prince Edward Island",
  "Newfoundland and Labrador",
  "Yukon",
  "Northwest Territories",
  "Nunavut",
];
const statusLabel = (value: string) =>
  ({
    reported: "Reported to police",
    "witness-appeal": "Witness appeal",
    investigating: "Investigating",
    resolved: "Resolved",
  })[value] || value.replaceAll("-", " ");
function App() {
  const [route, setRoute] = useState(location.hash.slice(1) || "/");
  const [menu, setMenu] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [province, setProvince] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [detail, setDetail] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [sent, setSent] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  useEffect(() => {
    const change = () => {
      const nextRoute = location.hash.slice(1) || "/";
      setRoute(nextRoute);
      if (nextRoute === "/") {
        setQuery("");
        setStatus("");
        setProvince("");
      }
      setMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    const abort = new AbortController();
    setLoading(true);
    setError("");
    setDetail(null);
    const path = route.startsWith("/cases/")
      ? `/api/v1/cases/${encodeURIComponent(route.split("/")[2])}`
      : `/api/v1/cases?${new URLSearchParams({ q: query, status, province })}`;
    const timer = setTimeout(
      () =>
        fetch(API + path, { signal: abort.signal })
          .then(async (r) => {
            if (!r.ok)
              throw new Error(
                r.status === 404
                  ? "This case could not be found."
                  : "The case archive is unavailable. Check that the backend is running.",
              );
            return r.json();
          })
          .then((data) =>
            route.startsWith("/cases/")
              ? setDetail(data)
              : setCases(data.items),
          )
          .catch((e) => {
            if (e.name !== "AbortError") setError(e.message);
          })
          .finally(() => {
            if (!abort.signal.aborted) setLoading(false);
          }),
      180,
    );
    return () => {
      clearTimeout(timer);
      abort.abort();
    };
  }, [route, query, status, province, retry]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setSubmitError("");
    const data = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const response = await fetch(API + "/api/v1/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json();
      if (!response.ok)
        throw new Error(
          typeof body.detail === "string"
            ? body.detail
            : "Please check the form fields and try again.",
        );
      setSent(body.message);
    } catch (e) {
      setSubmitError(
        e instanceof Error ? e.message : "Submission failed. Please try again.",
      );
    } finally {
      setSending(false);
    }
  }
  return (
    <>
      {route === "/" && !loading && (
        <ScrollAtmosphere key={`${query}-${status}-${province}`} />
      )}
      <header>
        <a className="brand" href="#/">
          <span className="brand-mark">//</span> CANADA<span>INVESTIGATES</span>
        </a>
        <button
          className="menu"
          aria-label="Toggle navigation"
          aria-expanded={menu}
          aria-controls="primary-navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? <X /> : <Menu />}
        </button>
        <nav id="primary-navigation" className={menu ? "expanded" : ""}>
          <a className={route === "/" ? "active" : ""} href="#/">
            Discover
          </a>
          <a href="#/cases">Case archive</a>
          <a href="#/about">Our approach</a>
          <a className="mobile-submit" href="#/submit">
            Submit a case
          </a>
        </nav>
        <a href="#/submit" className="button header-cta">
          Submit a case <ArrowUpRight size={15} />
        </a>
      </header>
      {route === "/" && (
        <section className="hero hero-v2">
          <img
            className="hero-image"
            src="/images/investigation-board.jpg"
            alt=""
            fetchPriority="high"
          />
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="live-dot" /> REAL CASES. YOUR CURIOSITY COUNTS.
            </p>
            <h1>
              Help solve real
              <br />
              Canadian <em>crimes.</em>
            </h1>
            <p className="hero-description">
              Someone knows something. A detail, a memory, a missing piece.
              Start with the facts. See where you can help.
            </p>
            <p className="hero-invitation">
              Open a case file. Follow the sources. Make a difference.
            </p>
            <div className="hero-actions">
              <a
                href="#/cases"
                className="button"
                onClick={() => {
                  setQuery("");
                  setProvince("");
                  setStatus("active");
                }}
              >
                Browse active cases <ArrowRight size={18} />
              </a>
              <a href="#/submit" className="hero-secondary">
                Got a story? <ArrowUpRight size={16} />
              </a>
            </div>
            <div className="hero-foot">
              <span>
                <ShieldCheck size={13} /> SOURCES OVER SPECULATION
              </span>
              <span>BUILT BY THE CURIOUS</span>
            </div>
          </div>
          <span className="hero-caption">
            ONE COUNTRY. COUNTLESS LOOSE ENDS.
          </span>
        </section>
      )}
      {route === "/" && (
        <div className="discovery-strip">
          <span>PICK UP THE THREAD</span>
          <a href="#/cases">
            Browse case files <ArrowUpRight size={12} />
          </a>
          <a href="#/cases" onClick={() => setProvince("Manitoba")}>
            Winnipeg card thefts <ArrowUpRight size={12} />
          </a>
          <a href="#/cases" onClick={() => setProvince("British Columbia")}>
            Vancouver witness appeal <ArrowUpRight size={12} />
          </a>
        </div>
      )}

      <main>
        {route === "/about" ? (
          <section className="reading">
            <p className="eyebrow">OUR APPROACH</p>
            <h1>
              Curiosity.
              <br />
              <em>With care.</em>
            </h1>
            <p className="intro">
              Canada Investigates is an open-source home for community research.
              A good investigation makes its sources and uncertainty visible.
            </p>
            {[
              [
                "01",
                "Start with a question",
                "Describe what is known, what is alleged, and what still needs an answer.",
              ],
              [
                "02",
                "Show the original source",
                "Link to public records and document provenance. Popularity never establishes truth.",
              ],
              [
                "03",
                "Protect the people in the story",
                "Submissions are reviewed before publication. Do not submit private addresses, personal contact details, or unsupported accusations.",
              ],
            ].map(([n, t, d]) => (
              <article className="principle" key={n}>
                <span>{n}</span>
                <div>
                  <h2>{t}</h2>
                  <p>{d}</p>
                </div>
              </article>
            ))}
            <p className="notice">
              Real cases, drawn from public reporting and Keep Canada Weird. We
              are independent of the podcast and police. Source dates and
              uncertainty are shown on each file; accounts, discussions,
              evidence uploads, and editorial tools are still to come.
            </p>
            <a
              href="https://github.com/parker84/canada-investigates-web"
              className="text-link"
            >
              Explore the open-source project <ExternalLink size={16} />
            </a>
          </section>
        ) : route === "/submit" ? (
          <section className="reading">
            <a href="#/" className="back">
              <ArrowLeft size={16} /> Back to discovery
            </a>
            <p className="eyebrow">START WITH A QUESTION</p>
            <h1>
              Something worth
              <br />
              <em>looking into?</em>
            </h1>
            <p className="intro">
              Share a clear question and a public source. Submissions stay
              private until editorial review.
            </p>
            {sent ? (
              <div className="success" role="status">
                <ShieldCheck />
                <h2>Submission received</h2>
                <p>{sent}</p>
                <a href="#/cases">Return to cases →</a>
              </div>
            ) : (
              <form onSubmit={submit}>
                <label>
                  Case title
                  <input
                    name="title"
                    minLength={8}
                    maxLength={160}
                    required
                    placeholder="What’s the question?"
                  />
                </label>
                <div className="form-row">
                  <label>
                    Province or territory
                    <select name="province" required>
                      {provinces.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    City or region
                    <input
                      name="location"
                      minLength={2}
                      maxLength={120}
                      required
                      placeholder="e.g. Ottawa"
                    />
                  </label>
                </div>
                <label>
                  Category
                  <select name="category">
                    <option>Theft</option>
                    <option>Witness appeal</option>
                    <option>History</option>
                    <option>Environment</option>
                    <option>Public interest</option>
                    <option>Maritime</option>
                    <option>Local history</option>
                  </select>
                </label>
                <label>
                  What do we know?
                  <textarea
                    name="summary"
                    minLength={40}
                    maxLength={5000}
                    required
                    rows={6}
                    placeholder="Separate documented facts from unanswered questions. Avoid personal information."
                  />
                </label>
                <label>
                  Public source URL
                  <input
                    name="source_url"
                    type="url"
                    pattern="https?://.*"
                    required
                    placeholder="https://…"
                  />
                </label>
                <p className="muted">
                  Only include information that is already public and relevant
                  to your question.
                </p>
                {submitError && (
                  <p role="alert" className="error">
                    {submitError}
                  </p>
                )}
                <button className="button" disabled={sending}>
                  {sending ? "Sending…" : "Submit for review"}{" "}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </section>
        ) : route.startsWith("/cases/") ? (
          <section className="reading">
            <a className="back" href="#/cases">
              <ArrowLeft size={16} /> All investigations
            </a>
            {loading ? (
              <p role="status">Loading case…</p>
            ) : error ? (
              <ErrorBox error={error} retry={() => setRetry(retry + 1)} />
            ) : (
              detail && (
                <>
                  <p className="eyebrow">
                    CASE FILE / {detail.number || detail.id.slice(0, 8)}
                  </p>
                  <span className={"status " + detail.status}>
                    {statusLabel(detail.status)}
                  </span>
                  <h1 className="detail-title">{detail.title}</h1>
                  <p className="muted">
                    <MapPin size={14} /> {detail.location} · {detail.category}
                  </p>
                  <p className="intro">{detail.summary}</p>
                  {detail.demo && (
                    <p className="notice">FICTIONAL DEMO — {detail.note}</p>
                  )}
                  <div className="case-status-note">
                    <p className="eyebrow">
                      STATUS IN THE PUBLIC RECORD · {detail.status_as_of}
                    </p>
                    <p>{detail.note}</p>
                    <small>
                      Sources checked {detail.checked_at}. Artwork throughout is
                      illustrative.
                    </small>
                  </div>
                  {detail.tip && (
                    <div className="tip-panel">
                      <p className="eyebrow">KNOW SOMETHING THAT COULD HELP?</p>
                      <h2>A detail could matter.</h2>
                      <p>
                        Share first-hand information directly with{" "}
                        {detail.tip.label}.
                      </p>
                      <a
                        className="button"
                        href={`tel:${detail.tip.phone.replaceAll("-", "")}`}
                      >
                        {detail.tip.phone} <ArrowUpRight size={16} />
                      </a>
                      <a
                        className="text-link"
                        href={detail.tip.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official contact details <ExternalLink size={14} />
                      </a>
                    </div>
                  )}
                  <h2>What the sources say</h2>
                  {detail.claims?.map((c, i) => (
                    <div className="claim" key={i}>
                      <span className="status">{c.status}</span>
                      <p>{c.text}</p>
                    </div>
                  ))}
                  <h2>Source library</h2>
                  {detail.sources.length ? (
                    detail.sources.map((s, i) => (
                      <a
                        className="source"
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        key={i}
                      >
                        <FileText />
                        {s.label}
                        <ExternalLink size={16} />
                      </a>
                    ))
                  ) : (
                    <p className="empty-note">
                      No sources attached. This sample demonstrates the
                      structure of a case; it does not establish any facts.
                    </p>
                  )}
                  <h2>Case timeline</h2>
                  {detail.timeline?.map((t, i) => (
                    <div className="timeline" key={i}>
                      <time>{t.date}</time>
                      <p>{t.text}</p>
                    </div>
                  ))}
                  <div className="notice">
                    <ShieldCheck size={18} /> Evidence submissions and
                    discussion will open after accounts and moderation are in
                    place.
                  </div>
                </>
              )
            )}
          </section>
        ) : (
          <>
            {route === "/" &&
              !query &&
              !status &&
              !province &&
              cases.length > 0 &&
              !loading &&
              !error && (
                <>
                  <section className="spotlight-section">
                    <div className="spotlight-intro">
                      <p className="eyebrow">REAL STORIES. LOOSE ENDS.</p>
                      <h2>Somebody knows something.</h2>
                      <p>
                        From Keep Canada Weird to the source. Open a file and
                        see what’s known.
                      </p>
                      <span className="demo-pill">
                        PUBLIC REPORTING · DATED SOURCES
                      </span>
                    </div>
                    {cases
                      .slice()
                      .sort((a, b) =>
                        (a.number || "").localeCompare(b.number || ""),
                      )
                      .slice(0, 2)
                      .map((c, i) => (
                        <a
                          className={
                            i === 0 ? "spotlight-card" : "secondary-story"
                          }
                          href={"#/cases/" + c.slug}
                          key={c.id}
                        >
                          <img
                            src={
                              i === 0
                                ? "/images/archive-mystery.jpg"
                                : "/images/investigation-board.jpg"
                            }
                            alt="Illustrative investigation artwork"
                            loading="lazy"
                          />
                          {i === 0 && <div className="spotlight-shade" />}
                          <div className={i === 0 ? "spotlight-copy" : ""}>
                            <span className="story-kicker">
                              {c.location} · {c.category}
                            </span>
                            <h3>{c.title}</h3>
                            <p>{c.summary}</p>
                            <span className="story-link">
                              Open the case file <ArrowRight size={17} />
                            </span>
                          </div>
                          {i === 0 && (
                            <span className="image-label">
                              ILLUSTRATIVE ART · REAL CASE
                            </span>
                          )}
                        </a>
                      ))}
                  </section>
                  <InvestigationExperience />
                </>
              )}
            <div className="section-heading">
              <div>
                <p className="eyebrow">FOLLOW THE THREAD</p>
                <h2>
                  {route === "/"
                    ? "On the investigation board"
                    : "Case archive"}
                  <span className="small-tag">PREVIEW</span>
                </h2>
              </div>
              <span className="desk-note">
                <Radio size={14} /> An open notebook for Canada
              </span>
            </div>
            <div className="workspace">
              <section className="case-list">
                <div className="filters">
                  <div className="tabs" aria-label="Filter cases">
                    {[
                      ["", "All cases"],
                      ["active", "Active files"],
                      ["reported", "Reported"],
                      ["witness-appeal", "Witness appeals"],
                      ["resolved", "Resolved"],
                    ].map(([v, t]) => (
                      <button
                        aria-pressed={status === v}
                        className={status === v ? "selected" : ""}
                        key={v}
                        onClick={() => setStatus(v)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="search-row">
                    <label className="search">
                      <Search size={17} />
                      <input
                        aria-label="Search cases"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search the case files…"
                      />
                    </label>
                    <select
                      aria-label="Filter by province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                    >
                      <option value="">Across Canada</option>
                      {provinces.map((p) => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="demo-label">
                  REAL CASE FILES · “Active” means unresolved on our research
                  desk. See each file for dated police status. Illustrative
                  artwork.
                </p>
                {loading ? (
                  <div className="empty" role="status">
                    Opening the case files…
                  </div>
                ) : error ? (
                  <ErrorBox error={error} retry={() => setRetry(retry + 1)} />
                ) : cases.length ? (
                  cases.map((c) => (
                    <a
                      href={"#/cases/" + c.slug}
                      className="case-card"
                      key={c.id}
                    >
                      <div className={"case-art " + c.art}>
                        <img
                          src={
                            c.art === "coast"
                              ? "/images/coastal-mystery.jpg"
                              : c.art === "map" || c.art === "city"
                                ? "/images/archive-mystery.jpg"
                                : "/images/investigation-board.jpg"
                          }
                          alt=""
                          loading="lazy"
                        />
                        <span>{c.number || "CI"}</span>
                      </div>
                      <div className="case-copy">
                        <div className="card-top">
                          <span className={"status " + c.status}>
                            {statusLabel(c.status)}
                          </span>
                          <span className="case-number">
                            CI — {c.number || "NEW"}
                          </span>
                        </div>
                        <h3>{c.title}</h3>
                        <p className="location">
                          <MapPin size={12} />
                          {c.location}
                        </p>
                        <p className="summary">{c.summary}</p>
                        <p className="case-date">
                          Status reported {c.status_as_of}
                        </p>
                        <div className="card-bottom">
                          <span className="tag">{c.category}</span>
                          <span>
                            <FileText size={13} />
                            {c.sources.length} sources
                          </span>
                          <ArrowUpRight size={17} />
                        </div>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="empty">
                    <Search />
                    <h3>No matching case files</h3>
                    <p>Try another search or widen your filters.</p>
                    <button
                      className="text-link"
                      onClick={() => {
                        setQuery("");
                        setStatus("");
                        setProvince("");
                      }}
                    >
                      Clear filters →
                    </button>
                  </div>
                )}
              </section>
              <aside>
                <div className="aside-card atlas">
                  <p className="eyebrow">COAST TO COAST TO COAST</p>
                  <h3>
                    A different perspective.
                    <br />
                    Everywhere you look.
                  </h3>
                  <div className="atlas-art" aria-hidden="true">
                    <span>CA</span>
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                  <p>
                    Explore the archive by province and follow a story closer to
                    home.
                  </p>
                  <button
                    className="aside-link"
                    onClick={() => {
                      setProvince(province ? "" : "Manitoba");
                      setQuery("");
                      setStatus("");
                    }}
                  >
                    {province ? "Explore all provinces" : "Explore Manitoba"}{" "}
                    <ArrowRight size={16} />
                  </button>
                </div>
                <div className="aside-card">
                  <BookOpen className="red" size={23} />
                  <h3>The source comes first.</h3>
                  <p>
                    Claims are questions to investigate. Evidence is something
                    you can check. Keep the difference clear.
                  </p>
                  <a className="aside-link" href="#/about">
                    Read our approach <ArrowUpRight size={16} />
                  </a>
                </div>
                <a className="submit-card" href="#/submit">
                  <Search size={25} />
                  <div>
                    <h3>Pull on a thread.</h3>
                    <p>Bring a question to the desk.</p>
                  </div>
                  <ArrowUpRight size={19} />
                </a>
                <div className="open-source">
                  <span className="brand-mark">//</span>
                  <p>
                    OPEN SOURCE.
                    <br />
                    CANADIAN CURIOSITY.
                  </p>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
      <footer>
        <a className="brand" href="#/">
          <span className="brand-mark">//</span> CANADA INVESTIGATES
        </a>
        <span>Follow the sources. Keep an open mind.</span>
        <a href="https://github.com/parker84/canada-investigates-web">
          Built in the open <ArrowUpRight size={14} />
        </a>
      </footer>
    </>
  );
}
function ErrorBox({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="empty" role="alert">
      <h3>We couldn’t load the archive</h3>
      <p>{error}</p>
      <button className="button" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
