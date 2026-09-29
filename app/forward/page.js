"use client";

// FSSH2K Forward — she signs in once, logs her numbers, and sees her progress.
// Copy source: Helios → Offers/The_Build/Curriculum/MyNumbers_Form_Spec.md

import { useEffect, useMemo, useState } from "react";
import {
  SECTIONS,
  INTRO,
  CONFIRMATION,
  TREND_FIELDS,
  FIELD_BY_KEY,
  numericValue,
  formatTime,
  lastSetup,
  lastPicks,
  lastTimeFor,
  latestByField,
  lastFastCapture,
} from "@/lib/forward/fields";

const TOKEN_KEY = "fwd_token";
const readToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
const writeToken = (t) => {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function display(field, raw) {
  if (raw == null || raw === "") return "";
  if (field.kind === "time" || field.kind === "result") return String(raw);
  return field.unit && field.unit !== "%" ? `${raw} ${field.unit}` : field.unit === "%" ? `${raw}%` : String(raw);
}

function delta(field, a, b, asTime) {
  const d = b - a;
  if (!d) return "no change";
  const sign = d > 0 ? "+" : "−";
  if (field.kind === "time" || asTime) return `${sign}${formatTime(Math.abs(d))}`;
  const n = Math.abs(d);
  const s = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${sign}${s}${field.unit === "%" ? " pts" : field.unit ? ` ${field.unit}` : ""}`;
}

async function api(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`/api/forward/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({ ok: false, error: "Something went wrong. Try again." }));
  return { status: res.status, ...data };
}

export default function ForwardPage() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState("loading"); // loading · email · code · home · form · done
  const [me, setMe] = useState(null);
  const [error, setError] = useState("");

  async function load(t) {
    const r = await api("me", { token: t });
    if (r.ok) {
      setMe({ member: r.member, entries: r.entries });
      setView(r.entries.length ? "home" : "form");
    } else {
      writeToken(null);
      setToken(null);
      setView("email");
      if (r.status !== 401) setError(r.error);
    }
  }

  useEffect(() => {
    const t = readToken();
    if (t) {
      setToken(t);
      load(t);
    } else setView("email");
  }, []);

  function signedIn(t) {
    writeToken(t);
    setToken(t);
    setError("");
    load(t);
  }

  function signOut() {
    writeToken(null);
    setToken(null);
    setMe(null);
    setView("email");
  }

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-10 sm:py-14">
        <header className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.22em] text-plum/70">TeamQueen</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-plum leading-tight mt-1">
            FSSH2K Forward
          </h1>
          <p className="font-serif italic text-lg text-plum/80 mt-1">
            Faster. Stronger. Sexier. Harder to Kill.
          </p>
          <div className="h-px bg-gold/60 mt-5" />
        </header>

        {error && (
          <p role="alert" className="mb-6 border-l-2 border-plum bg-blush/40 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        {view === "loading" && <p className="text-sm text-charcoal/60">Opening your numbers…</p>}
        {(view === "email" || view === "code") && (
          <SignIn view={view} setView={setView} onSignedIn={signedIn} setError={setError} />
        )}
        {view === "home" && me && (
          <Home me={me} onLog={() => setView("form")} onSignOut={signOut} />
        )}
        {view === "form" && me && (
          <CaptureForm
            me={me}
            token={token}
            setError={setError}
            onCancel={me.entries.length ? () => setView("home") : null}
            onSaved={async () => {
              await load(token);
              setView("done");
            }}
          />
        )}
        {view === "done" && (
          <section className="space-y-4">
            <p className="font-serif text-3xl text-plum">{CONFIRMATION[0]}</p>
            <p className="leading-relaxed">{CONFIRMATION[1]}</p>
            <button onClick={() => setView("home")} className={btn}>
              See my numbers
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

const btn =
  "inline-flex items-center justify-center rounded-full bg-plum text-cream px-6 py-3 text-sm font-medium tracking-wide hover:bg-plum/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream disabled:opacity-50";
const btnQuiet =
  "text-sm text-plum underline underline-offset-4 decoration-gold/70 hover:decoration-plum focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded";
const input =
  "w-full rounded-md border border-plum/20 bg-white px-3 py-2.5 text-base text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-plum focus:ring-1 focus:ring-plum";

// ── Sign in ───────────────────────────────────────────────────────────────
function SignIn({ view, setView, onSignedIn, setError }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("code", { method: "POST", body: { email } });
    setBusy(false);
    if (r.ok) setView("code");
    else setError(r.error);
  }

  async function verify(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("verify", { method: "POST", body: { email, code, name } });
    setBusy(false);
    if (r.ok) onSignedIn(r.token);
    else setError(r.error);
  }

  if (view === "email") {
    return (
      <form onSubmit={sendCode} className="space-y-5">
        <p className="leading-relaxed">
          Your numbers, every twelve weeks, in one place. Enter your email and we'll send you a code.
        </p>
        <div className="space-y-1.5">
          <label htmlFor="fwd-name" className="text-sm font-medium">First name</label>
          <input id="fwd-name" className={input} value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fwd-email" className="text-sm font-medium">Email</label>
          <input id="fwd-email" type="email" required className={input} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <button className={btn} disabled={busy}>{busy ? "Sending…" : "Send my code"}</button>
      </form>
    );
  }
  return (
    <form onSubmit={verify} className="space-y-5">
      <p className="leading-relaxed">
        We sent a 6-digit code to <strong>{email}</strong>. It expires in 15 minutes.
      </p>
      <div className="space-y-1.5">
        <label htmlFor="fwd-code" className="text-sm font-medium">Code</label>
        <input
          id="fwd-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          className={`${input} tracking-[0.4em] text-lg tabular-nums`}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        />
      </div>
      <div className="flex flex-wrap items-center gap-5">
        <button className={btn} disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Open my numbers"}</button>
        <button type="button" className={btnQuiet} onClick={() => setView("email")}>Use a different email</button>
      </div>
    </form>
  );
}

// ── Home: her picks, her test, her progress ──────────────────────────────
function lastTimeText(lt) {
  return lt.parts.map((p) => `${p.label}: ${p.value}${p.unit && p.value !== "N/A" && p.kind !== "time" ? ` ${p.unit}` : ""}`).join(" · ");
}

function Home({ me, onLog, onSignOut }) {
  const { member, entries } = me;
  const picks = lastPicks(entries);
  const anchor = lastFastCapture(entries);
  const weeks = anchor ? Math.floor((Date.now() - new Date(anchor.at).getTime()) / (7 * 864e5)) : null;

  const bySection = useMemo(
    () =>
      SECTIONS.filter((s) => !["picks", "else"].includes(s.id))
        .map((s) => ({
          section: s,
          series: TREND_FIELDS.filter((f) => f.section === s.id)
            .map((f) => ({
              field: f,
              points: entries
                .filter((e) => e.values?.[f.key] != null)
                .map((e) => ({ at: e.at, raw: e.values[f.key], n: numericValue(f, e.values[f.key]) }))
                .filter((p) => p.n != null),
            }))
            .filter((x) => x.points.length),
        }))
        .filter((x) => x.series.length),
    [entries]
  );

  return (
    <div className="space-y-10">
      <section className="space-y-1">
        <p className="font-serif text-3xl text-plum">{member.name ? `${member.name}, here's where you are.` : "Here's where you are."}</p>
        {anchor && (
          <p className="text-sm text-charcoal/70 tabular-nums">
            Last numbers {fmtDate(anchor.at)}
            {weeks != null ? ` · ${weeks === 0 ? "this week" : `${weeks} week${weeks === 1 ? "" : "s"} ago`}` : ""}
            {weeks != null && weeks >= 12 ? " · time for your next set" : ""}
          </p>
        )}
      </section>

      {(picks.star || picks.play) && (
        <section className="grid gap-4 sm:grid-cols-2">
          {picks.star && (
            <div className="border-l-2 border-gold pl-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-plum/70">⭐ My Star · {fmtDate(picks.star.at)}</p>
              <p className="font-serif text-2xl text-plum mt-1">{picks.star.value}</p>
              {picks.star.pillar && <p className="text-xs text-charcoal/60">{picks.star.pillar}</p>}
            </div>
          )}
          {picks.play && (
            <div className="border-l-2 border-gold pl-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-plum/70">🎯 My Play · {fmtDate(picks.play.at)}</p>
              <p className="font-serif text-2xl text-plum mt-1">{picks.play.value}</p>
              {picks.play.pillar && <p className="text-xs text-charcoal/60">{picks.play.pillar}</p>}
            </div>
          )}
        </section>
      )}

      <button onClick={onLog} className={btn}>Log today's numbers</button>

      {bySection.map(({ section, series }) => (
        <section key={section.id}>
          <h2 className="font-serif text-2xl text-plum">{section.title}</h2>
          <div className="h-px bg-gold/40 mt-2 mb-1" />
          <ul className="divide-y divide-plum/10">
            {series.map(({ field, points }) => {
              const first = points[0];
              const last = points[points.length - 1];
              const prev = points[points.length - 2];
              const g = SECTIONS.find((s) => s.id === section.id).groups.find((gr) => gr.fields.some((f) => f.key === field.key));
              const how = lastTimeFor({ fields: g.fields.filter((f) => f.setup) }, entries);
              return (
                <li key={field.key} className="py-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 items-center">
                  <div className="min-w-0">
                    <p className="text-sm text-charcoal/70">
                      {field.group && field.group !== field.label ? `${field.group} · ` : ""}
                      {field.label}
                    </p>
                    <p className="font-serif text-2xl text-plum tabular-nums leading-tight">
                      {display(field, last.raw)}
                      <span className="font-sans text-xs text-charcoal/50 ml-2">{fmtDate(last.at)}</span>
                    </p>
                    {points.length > 1 && (
                      <p className="text-xs text-charcoal/70 tabular-nums mt-0.5">
                        {delta(field, first.n, last.n, String(last.raw).includes(":"))} since {fmtDate(first.at)}
                        {points.length > 2 ? ` · ${delta(field, prev.n, last.n, String(last.raw).includes(":"))} since last time` : ""}
                      </p>
                    )}
                    {how && <p className="text-xs text-charcoal/55 mt-0.5">{lastTimeText(how)}</p>}
                  </div>
                  <Spark points={points} />
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <History entries={entries} />

      <button onClick={onSignOut} className={btnQuiet}>Sign out on this device</button>
    </div>
  );
}

function Spark({ points }) {
  if (points.length < 2) return <span className="w-[112px]" aria-hidden="true" />;
  const W = 112, H = 36, P = 4;
  const ns = points.map((p) => p.n);
  const min = Math.min(...ns), max = Math.max(...ns);
  const span = max - min || 1;
  const xy = points.map((p, i) => [
    P + (i * (W - 2 * P)) / (points.length - 1),
    H - P - ((p.n - min) / span) * (H - 2 * P),
  ]);
  const [lx, ly] = xy[xy.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="shrink-0">
      <polyline points={xy.map((p) => p.join(",")).join(" ")} fill="none" stroke="#3C1D3F" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3.5" fill="#CDB15B" stroke="#3C1D3F" strokeWidth="1" />
    </svg>
  );
}

function History({ entries }) {
  const [open, setOpen] = useState(false);
  if (!entries.length) return null;
  return (
    <section>
      <button onClick={() => setOpen(!open)} className={btnQuiet} aria-expanded={open}>
        {open ? "Hide" : "Show"} every capture ({entries.length})
      </button>
      {open && (
        <ol className="mt-4 space-y-4">
          {[...entries].reverse().map((e) => (
            <li key={e.id} className="text-sm">
              <p className="font-medium text-plum">{fmtDate(e.at)}</p>
              <p className="text-charcoal/80 leading-relaxed">
                {Object.entries(e.values)
                  .map(([k, v]) => `${FIELD_BY_KEY[k]?.label || k}: ${v}`)
                  .join(" · ")}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ── The capture form ─────────────────────────────────────────────────────
function CaptureForm({ me, token, setError, onCancel, onSaved }) {
  const setup = lastSetup(me.entries);
  const latest = latestByField(me.entries);
  const [values, setValues] = useState(() => {
    const v = { ...setup };
    for (const k of Object.keys(v)) if (v[k] === "N/A") delete v[k];
    return v;
  });
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await api("me", { method: "POST", token, body: { values, name: name || undefined } });
    setBusy(false);
    if (r.ok) onSaved();
    else setError(r.error);
  }

  return (
    <form onSubmit={submit} className="space-y-10">
      <p className="leading-relaxed">{INTRO}</p>

      {!me.member.name && (
        <div className="space-y-1.5">
          <label htmlFor="fwd-firstname" className="text-sm font-medium">First name</label>
          <input id="fwd-firstname" className={input} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
      )}

      {SECTIONS.map((s) => (
        <fieldset key={s.id} className="space-y-6">
          <legend className="w-full">
            <span className="font-serif text-2xl text-plum">{s.title}</span>
            <span className="block h-px bg-gold/40 mt-2" />
          </legend>

          {s.groups.map((g, gi) => {
            const lt = lastTimeFor(g, me.entries);
            return (
              <div key={gi} className="space-y-3">
                {g.title && <h3 className="text-sm font-semibold text-plum">{g.title}</h3>}
                {g.help && <p className="text-sm text-charcoal/65 leading-relaxed">{g.help}</p>}
                {lt && g.fields.length > 1 && (
                  <p className="text-sm bg-blush/30 rounded-md px-3 py-2">
                    <span className="font-medium text-plum">Last time, {fmtDate(lt.at)}:</span> {lastTimeText(lt)}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {g.fields.map((f) => (
                    <Field
                      key={f.key}
                      f={f}
                      value={values[f.key] ?? ""}
                      last={f.setup ? null : latest[f.key]?.value}
                      onChange={(v) => set(f.key, v)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </fieldset>
      ))}

      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button className={btn} disabled={busy}>{busy ? "Saving…" : "Save my numbers"}</button>
        {onCancel && <button type="button" className={btnQuiet} onClick={onCancel}>Back to my numbers</button>}
      </div>
    </form>
  );
}

function Field({ f, value, last, onChange }) {
  const id = `fwd-${f.key}`;
  const na = value === "N/A";
  const wide = f.long || f.kind === "scale";
  const lastLabel = last != null && last !== "" ? `Last: ${last}${f.unit && f.kind !== "scale" && last !== "N/A" ? ` ${f.unit}` : ""}` : null;

  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2" : ""}`}>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <label htmlFor={id} className="font-medium">
          {f.label}
          {f.unit && f.kind !== "scale" && <span className="font-normal text-charcoal/50"> · {f.unit}</span>}
          {f.hint && <span className="block font-normal text-charcoal/60">{f.hint}</span>}
        </label>
        <span className="flex items-center gap-2 shrink-0">
          {lastLabel && <span className="text-xs text-charcoal/50 tabular-nums">{lastLabel}</span>}
          {!f.noNA && (
            <button
              type="button"
              aria-pressed={na}
              onClick={() => onChange(na ? "" : "N/A")}
              className={`rounded-full border px-2.5 py-0.5 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                na ? "bg-plum text-cream border-plum" : "border-plum/25 text-charcoal/60 hover:border-plum/60"
              }`}
            >
              N/A
            </button>
          )}
        </span>
      </div>

      {na && <p className="text-sm text-charcoal/50">Marked N/A</p>}

      {!na && f.kind === "scale" && (
        <div id={id} role="radiogroup" aria-label={f.label} className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
            const on = Number(value) === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => onChange(on ? "" : n)}
                className={`h-10 rounded-md text-sm tabular-nums border focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  on ? "bg-plum text-cream border-plum" : "bg-white border-plum/20 hover:border-plum/60"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}

      {!na && f.kind === "choice" && (
        <select id={id} className={input} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {f.options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )}

      {!na && f.long && (
        <textarea id={id} rows={3} className={input} value={value} onChange={(e) => onChange(e.target.value)} />
      )}

      {!na && !f.long && ["text", "number", "time", "result"].includes(f.kind) && (
        <input
          id={id}
          className={input}
          inputMode={f.kind === "number" ? "decimal" : f.kind === "time" ? "numeric" : undefined}
          placeholder={f.placeholder || ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
