import React, { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";

export type Account = { id: string; display_name: string; role: string };
type Contribution = {
  id: string;
  kind: string;
  body: string;
  source_url?: string;
  status: string;
  created_at: string;
  author: Account;
  case_slug?: string;
  review_note?: string;
};

async function jsonRequest(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      typeof result.detail === "string"
        ? result.detail
        : "Something went wrong. Please try again.",
    );
  return result;
}

export function AccountFlow({
  api,
  route,
  account,
  onAccount,
}: {
  api: string;
  route: string;
  account: Account | null;
  onAccount: (account: Account | null) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [busy, setBusy] = useState(false);
  const token = new URLSearchParams(route.split("?")[1] || "").get("token");
  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await jsonRequest(
        api + "/api/v1/auth/request-link",
        "POST",
        { email },
      );
      setMessage(result.message);
      setDevLink(result.dev_link || "");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const user = await jsonRequest(api + "/api/v1/auth/verify", "POST", {
        token,
        display_name: name,
      });
      onAccount(user);
      const returnTo = sessionStorage.getItem("sign-in:return-to");
      sessionStorage.removeItem("sign-in:return-to");
      location.hash = returnTo || "#/account";
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    await fetch(api + "/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    onAccount(null);
    setMessage("Signed out.");
  }
  return (
    <section className="reading account-page">
      <p className="eyebrow">YOUR PLACE AT THE TABLE</p>
      <h1>
        {account ? (
          <>
            Welcome back, <em>{account.display_name}.</em>
          </>
        ) : (
          <>
            Help move a case <em>forward.</em>
          </>
        )}
      </h1>
      <p className="intro">
        Browse freely. Sign in to ask a careful question, share a public source,
        or suggest a correction. An editor reviews each contribution before it
        appears on a case file.
      </p>
      {account ? (
        <>
          <div className="notice">
            <ShieldCheck size={17} /> Signed in as {account.display_name} ·{" "}
            {account.role}
          </div>
          <MyContributions api={api} />
          {account.role === "editor" && (
            <a className="button" href="#/editor">
              Open review queue <ArrowRight size={16} />
            </a>
          )}
          <button className="text-button" onClick={signOut}>
            Sign out
          </button>
        </>
      ) : token ? (
        <form onSubmit={verify} className="account-form">
          <h2>Finish signing in</h2>
          <p className="muted">
            New here? Choose the name that will appear beside approved
            contributions.
          </p>
          <label>
            Display name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={60}
              placeholder="Your public name"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Signing in…" : "Continue"} <ArrowRight size={16} />
          </button>
        </form>
      ) : (
        <form onSubmit={requestLink} className="account-form">
          <h2>Sign in by email</h2>
          <p className="muted">
            We’ll send a one-time link. No password to remember.
          </p>
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.ca"
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="success">
              {message}
            </p>
          )}
          {devLink && (
            <a className="text-link" href={devLink}>
              Open local sign-in link →
            </a>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Sending…" : "Send sign-in link"} <ArrowRight size={16} />
          </button>
        </form>
      )}
    </section>
  );
}

function MyContributions({ api }: { api: string }) {
  const [items, setItems] = useState<Contribution[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(api + "/api/v1/discussion/mine", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => {});
  }, [api]);
  async function save(event: React.FormEvent, item: Contribution) {
    event.preventDefault();
    setError("");
    try {
      await jsonRequest(`${api}/api/v1/discussion/${item.id}`, "PATCH", {
        body: draft,
        source_url: source || null,
      });
      setItems(
        items.map((current) =>
          current.id === item.id
            ? {
                ...current,
                body: draft,
                source_url: source,
                status: "pending",
                review_note: "",
              }
            : current,
        ),
      );
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="my-contributions">
      <h2>Your contributions</h2>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {items.length ? (
        items.map((item) => (
          <article className="discussion-item" key={item.id}>
            <div className="discussion-meta">
              <span>{item.kind}</span>
              <span>{item.status.replaceAll("-", " ")}</span>
            </div>
            <p>{item.body}</p>
            {item.review_note && (
              <small>Editor's note: {item.review_note}</small>
            )}
            <a className="text-link" href={`#/cases/${item.case_slug}`}>
              View case →
            </a>
            {["pending", "changes-requested"].includes(item.status) && (
              <button
                className="text-button"
                onClick={() => {
                  setEditing(item.id);
                  setDraft(item.body);
                  setSource(item.source_url || "");
                }}
              >
                Edit and resubmit
              </button>
            )}
            {editing === item.id && (
              <form onSubmit={(event) => save(event, item)}>
                <label>
                  Revised contribution
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    minLength={20}
                    maxLength={5000}
                    required
                    rows={5}
                  />
                </label>
                {item.kind === "source" && (
                  <label>
                    Public source URL
                    <input
                      type="url"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      required
                    />
                  </label>
                )}
                <button className="button">Send revision for review</button>
              </form>
            )}
          </article>
        ))
      ) : (
        <p className="empty-note">
          Your questions, sources, and corrections will appear here.
        </p>
      )}
    </div>
  );
}

export function CaseDiscussion({
  api,
  slug,
  account,
}: {
  api: string;
  slug: string;
  account: Account | null;
}) {
  const [items, setItems] = useState<Contribution[]>([]);
  const [kind, setKind] = useState("question");
  const [body, setBody] = useState(
    sessionStorage.getItem(`draft:${slug}`) || "",
  );
  const [sourceUrl, setSourceUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch(`${api}/api/v1/cases/${encodeURIComponent(slug)}/discussion`)
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setError("Discussion is unavailable right now."));
  }, [api, slug]);
  function updateDraft(value: string) {
    setBody(value);
    sessionStorage.setItem(`draft:${slug}`, value);
  }
  async function send(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await jsonRequest(
        `${api}/api/v1/cases/${encodeURIComponent(slug)}/discussion`,
        "POST",
        { kind, body, source_url: sourceUrl || null },
      );
      setMessage(result.message);
      updateDraft("");
      setSourceUrl("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function report(id: string) {
    const reason = window.prompt(
      "What should our editors review? Please be specific.",
    );
    if (!reason) return;
    try {
      const result = await jsonRequest(
        `${api}/api/v1/discussion/${id}/report`,
        "POST",
        { reason },
      );
      setMessage(result.message);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="discussion-section">
      <p className="eyebrow">FOLLOW THE THREAD</p>
      <h2>Discuss this case</h2>
      <p className="empty-note">
        Share questions and public sources. Every post is checked before
        publication. Have first-hand information? Use the official police
        contact above.
      </p>
      <div className="discussion-list">
        {items.length ? (
          items.map((item) => (
            <article className="discussion-item" key={item.id}>
              <div className="discussion-meta">
                <span>{item.kind}</span>
                <span>
                  {item.author.display_name} ·{" "}
                  {new Date(item.created_at).toLocaleDateString("en-CA")}
                </span>
              </div>
              <p>{item.body}</p>
              {item.source_url && (
                <a
                  className="text-link"
                  href={item.source_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Read source <ExternalLink size={14} />
                </a>
              )}
              {account && (
                <button className="text-button" onClick={() => report(item.id)}>
                  Report
                </button>
              )}
            </article>
          ))
        ) : (
          <div className="discussion-empty">
            <span>001 / OPEN FILE</span>
            <h3>Start with a good question.</h3>
            <p>
              No published discussion yet. Your perspective might uncover a
              source or clarify what is still unknown.
            </p>
          </div>
        )}
      </div>
      <form className="discussion-form" onSubmit={send}>
        <h3>Add to the investigation</h3>
        <div
          className="contribution-tabs"
          role="group"
          aria-label="Contribution type"
        >
          {[
            ["question", "Ask a question"],
            ["source", "Add a public source"],
            ["correction", "Suggest a correction"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={kind === value ? "selected" : ""}
              onClick={() => setKind(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label>
          Your {kind}
          <textarea
            value={body}
            onChange={(e) => updateDraft(e.target.value)}
            minLength={20}
            maxLength={5000}
            required
            rows={5}
            placeholder="Be specific, cite what you know, and distinguish facts from questions."
          />
        </label>
        {kind === "source" && (
          <label>
            Public source URL
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              required
              placeholder="https://…"
            />
          </label>
        )}
        <p className="muted">
          Please avoid private addresses, personal contact details, and
          unsupported accusations. Posts appear after editorial review.
        </p>
        {message && (
          <p className="success" role="status">
            {message}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {account ? (
          <button className="button" disabled={busy}>
            {busy ? "Sending…" : "Send for review"} <ArrowRight size={16} />
          </button>
        ) : (
          <a
            className="button"
            href="#/account"
            onClick={() =>
              sessionStorage.setItem("sign-in:return-to", `#/cases/${slug}`)
            }
          >
            Sign in to contribute <ArrowRight size={16} />
          </a>
        )}
      </form>
    </section>
  );
}

export function EditorQueue({
  api,
  account,
}: {
  api: string;
  account: Account | null;
}) {
  const [items, setItems] = useState<Contribution[]>([]);
  const [reports, setReports] = useState<
    {
      id: string;
      reason: string;
      contribution: Contribution;
      case_slug: string;
    }[]
  >([]);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  useEffect(() => {
    if (account?.role === "editor") {
      fetch(api + "/api/v1/editor/queue", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setItems(data.items || []))
        .catch(() => setError("The review queue is unavailable."));
      fetch(api + "/api/v1/editor/reports", { credentials: "include" })
        .then((r) => r.json())
        .then((data) => setReports(data.items || []))
        .catch(() => setError("Reports are unavailable."));
    }
  }, [api, account]);
  async function decide(id: string, decision: string) {
    if ((notes[id] || "").trim().length < 5) {
      setError("Add a specific decision note before reviewing.");
      return;
    }
    try {
      await jsonRequest(
        `${api}/api/v1/editor/contributions/${id}/review`,
        "POST",
        {
          decision,
          reason: notes[id],
        },
      );
      setItems(items.filter((item) => item.id !== id));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function resolve(id: string) {
    try {
      await jsonRequest(`${api}/api/v1/editor/reports/${id}/resolve`, "POST");
      setReports(reports.filter((report) => report.id !== id));
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function remove(report: { id: string; contribution: Contribution }) {
    if ((notes[report.id] || "").trim().length < 5) {
      setError("Add a reason before removing this post.");
      return;
    }
    try {
      await jsonRequest(
        `${api}/api/v1/editor/contributions/${report.contribution.id}/review`,
        "POST",
        {
          decision: "removed",
          reason: notes[report.id],
        },
      );
      await resolve(report.id);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="reading">
      <p className="eyebrow">EDITORIAL DESK</p>
      <h1>Review queue</h1>
      {account?.role !== "editor" ? (
        <p className="notice">
          Editor access is required. <a href="#/account">Sign in →</a>
        </p>
      ) : (
        <>
          <p className="intro">
            Check the claim and source before publishing. Give a clear reason
            for every decision.
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {items.length ? (
            items.map((item) => (
              <article className="discussion-item" key={item.id}>
                <div className="discussion-meta">
                  <span>
                    {item.kind} · {item.case_slug}
                  </span>
                  <span>{item.author.display_name}</span>
                </div>
                <p>{item.body}</p>
                {item.source_url && (
                  <a href={item.source_url} target="_blank" rel="noreferrer">
                    Open source ↗
                  </a>
                )}
                <label>
                  Decision note
                  <textarea
                    value={notes[item.id] || ""}
                    onChange={(e) =>
                      setNotes({ ...notes, [item.id]: e.target.value })
                    }
                    rows={3}
                    placeholder="What did you verify? What needs to change?"
                  />
                </label>
                <div className="review-actions">
                  <button onClick={() => decide(item.id, "approved")}>
                    Approve
                  </button>
                  <button onClick={() => decide(item.id, "changes-requested")}>
                    Request changes
                  </button>
                  <button onClick={() => decide(item.id, "rejected")}>
                    Reject
                  </button>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-note">No contributions waiting for review.</p>
          )}
          <h2>Community reports</h2>
          {reports.length ? (
            reports.map((report) => (
              <article className="discussion-item" key={report.id}>
                <div className="discussion-meta">
                  <span>{report.case_slug}</span>
                  <span>{report.contribution.author.display_name}</span>
                </div>
                <p>{report.contribution.body}</p>
                <small>Reported: {report.reason}</small>
                <label>
                  Removal reason
                  <textarea
                    value={notes[report.id] || ""}
                    onChange={(e) =>
                      setNotes({ ...notes, [report.id]: e.target.value })
                    }
                    rows={2}
                  />
                </label>
                <div className="review-actions">
                  <button onClick={() => resolve(report.id)}>
                    Keep published
                  </button>
                  <button onClick={() => remove(report)}>Remove post</button>
                </div>
              </article>
            ))
          ) : (
            <p className="empty-note">No open reports.</p>
          )}
        </>
      )}
    </section>
  );
}
