"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import {
  HERO,
  ARC_STAGE,
  RATING_OPTIONS,
  PILLAR_INTROS,
  TRANSITIONS,
  QUESTIONS,
  META_QUESTIONS,
  EMAIL_CAPTURE,
} from "@/lib/content";
import {
  scoreBlockers,
  routeFromBlocker,
  BLOCKER_COPY,
  RESULT_CTA,
} from "@/lib/blockers";

// Build the sequence of screens

const SCREENS = [
  // IT'S NOT DISCIPLINE — four screen types, that's the whole flow.
  // The Code's arc-stage opener, pillar intros, rating questions and the
  // trust scale are all gone (Juls 2026-08-05): the result is one blocker,
  // so any screen that doesn't change the answer is friction against a
  // three-minute promise.
  { id: "hero", type: "hero" },
  ...META_QUESTIONS.map((q) => ({ id: q.id, type: "meta", meta: q })),
  { id: "email_capture", type: "email_capture" },
  { id: "results", type: "results" },
];

const STAGE_LABELS = {
  wakeup: "Wake-Up",
  reset: "Reset",
  assembly: "Assembly",
  command: "Command",
};

const STORAGE_KEY = "qcode_progress_v1";

export default function Page() {
  const [screenIdx, setScreenIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // pillar Qs (rating 1-4)
  const [arcStage, setArcStage] = useState(null);
  const [metaAnswers, setMetaAnswers] = useState({});
  const [metaEdgeOther, setMetaEdgeOther] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [modernToolsNote, setModernToolsNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Results page progressive reveal
  const [resultsBlock, setResultsBlock] = useState(0); // 0=header, 1=what's working, 2=where change pays off (+ the move), 3=cta

  const [restored, setRestored] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const testAutoSubmittedRef = useRef(false);

  // Restore in-progress session on mount (premium buyers get interrupted)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      // ?test = run it endlessly with no real email; starts fresh, pre-fills, skips Circle
      if (params.has("test")) {
        setTestMode(true);
        setFirstName("Test");
        setEmail("test@thrivespancollective.com");
        localStorage.removeItem(STORAGE_KEY);
        setRestored(true);
        return;
      }
      // ?reset (or ?fresh) clears saved progress and starts from the top
      if (params.has("reset") || params.has("fresh")) {
        localStorage.removeItem(STORAGE_KEY);
        setRestored(true);
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        // Don't resume onto the results screen — let them re-submit cleanly
        const resumeIdx = Math.min(s.screenIdx ?? 0, SCREENS.length - 2);
        if (resumeIdx > 1) {
          setScreenIdx(resumeIdx);
          setAnswers(s.answers || {});
          setArcStage(s.arcStage ?? null);
          setMetaAnswers(s.metaAnswers || {});
          setFirstName(s.firstName || "");
          setEmail(s.email || "");
        }
      }
    } catch (e) {
      /* ignore */
    }
    setRestored(true);
  }, []);

  // Save progress on change (after restore has run)
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ screenIdx, answers, arcStage, metaAnswers, firstName, email })
      );
    } catch (e) {
      /* ignore */
    }
  }, [restored, screenIdx, answers, arcStage, metaAnswers, firstName, email]);

  const screen = SCREENS[screenIdx];
  const next = () => setScreenIdx((i) => Math.min(i + 1, SCREENS.length - 1));

  // In test mode, auto-skip the email screen and jump straight to results.
  useEffect(() => {
    if (
      testMode &&
      screen.type === "email_capture" &&
      !testAutoSubmittedRef.current &&
      !submitting
    ) {
      testAutoSubmittedRef.current = true;
      submitAndAdvance();
    }
  }, [testMode, screen.type, submitting]);

  // For the question progress indicator
  const questionScreens = SCREENS.filter((s) => s.type === "question");
  const currentQuestionIdx = screen.type === "question"
    ? questionScreens.findIndex((s) => s.id === screen.id) + 1
    : null;

  async function submitAndAdvance() {
    setSubmitting(true);
    const scoreResult = scoreBlockers({ ...metaAnswers, ...answers });
    const route = routeFromBlocker();
    try {
      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          answers,
          arcStage,
          metaAnswers,
          metaEdgeOther,
          modernToolsNote,
          scoreResult,
          route,
          testMode,
        }),
      });
    } catch (e) {
      console.warn("Submit warn (proceeding anyway):", e);
    }
    setSubmitting(false);
    setResultsBlock(0);
    try {
      localStorage.removeItem(STORAGE_KEY); // fresh start for any future visit
    } catch (e) {
      /* ignore */
    }
    next(); // → results
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 sm:px-10 max-w-5xl mx-auto">
      <div className="crown-watermark">
        <img src="/teamqueen-crown.png" alt="" className="w-full h-auto" />
      </div>

      {screen.type === "hero" && <Hero onBegin={next} />}

      {screen.type === "arc_stage" && (
        <ArcStage
          onPick={(id) => {
            setArcStage(id);
            next();
          }}
        />
      )}

      {screen.type === "pillar_intro" && (
        <PillarIntro
          label={screen.label}
          intro={PILLAR_INTROS[screen.pillar]}
          onContinue={next}
        />
      )}

      {screen.type === "question" && (
        <QuestionScreen
          question={screen.question}
          index={currentQuestionIdx}
          total={questionScreens.length}
          onAnswer={(value) => {
            setAnswers((a) => ({ ...a, [screen.question.id]: value }));
            next();
          }}
        />
      )}

      {screen.type === "transition" && (
        <Transition transition={TRANSITIONS[screen.key]} onContinue={next} />
      )}

      {screen.type === "meta" && (
        <MetaScreen
          meta={screen.meta}
          onAnswer={(value, other) => {
            setMetaAnswers((m) => ({ ...m, [screen.meta.id]: value }));
            if (screen.meta.id === "meta_edge" && other) setMetaEdgeOther(other);
            next();
          }}
        />
      )}

      {screen.type === "email_capture" && (
        <EmailCaptureScreen
          firstName={firstName}
          setFirstName={setFirstName}
          email={email}
          setEmail={setEmail}
          modernToolsNote={modernToolsNote}
          setModernToolsNote={setModernToolsNote}
          submitting={submitting}
          onSubmit={submitAndAdvance}
          testMode={testMode}
        />
      )}

      {screen.type === "results" && (
        <ResultsPage
          firstName={firstName}
          answers={answers}
          arcStage={arcStage}
          metaAnswers={metaAnswers}
          resultsBlock={resultsBlock}
          revealNext={() => setResultsBlock((b) => b + 1)}
        />
      )}
    </main>
  );
}

// ---------- Screen Components ----------

function Hero({ onBegin }) {
  return (
    <div className="fade-in text-center max-w-4xl">
      <img
        src="/teamqueen-logo.png"
        alt="TeamQueen"
        className="mx-auto mb-8 w-24 h-24 sm:w-28 sm:h-28"
      />
      <h1 className="font-display text-5xl sm:text-6xl text-cream mb-4 leading-tight">
        {HERO.title}
      </h1>
      <p className="font-display italic text-xl text-gold mb-8">
        {HERO.subtitle}
      </p>

      {/* The already-sold woman shouldn't have to read to the bottom to find
          the button. (Panel, 2026-08-05 — Amy.) */}
      <div className="mb-12">
        <button
          onClick={onBegin}
          className="px-8 py-4 bg-cream text-ink font-medium tracking-wide hover:bg-gold transition-colors rounded-sm"
        >
          {HERO.cta} →
        </button>
        <p className="text-cream/50 text-sm mt-3">Nine questions · three minutes · free</p>
      </div>

      {/* Body copy is LEFT-aligned. Centring is fine for a headline; across
          eight paragraphs the eye loses the left margin every line and it
          reads as work. */}
      <div className="text-cream/90 space-y-3 mb-12 text-base sm:text-lg leading-relaxed text-left max-w-2xl mx-auto">
        {HERO.body.map((line, i) => (
          <p key={i} className={line === "" ? "h-2" : ""}>
            {line}
          </p>
        ))}
      </div>
      <button
        onClick={onBegin}
        className="px-8 py-4 bg-cream text-ink font-medium tracking-wide hover:bg-gold transition-colors rounded-sm"
      >
        {HERO.cta} →
      </button>
    </div>
  );
}

function ArcStage({ onPick }) {
  return (
    <div className="fade-in w-full max-w-xl">
      <h2 className="font-display text-3xl sm:text-4xl text-cream mb-3">
        {ARC_STAGE.prompt}
      </h2>
      <p className="text-cream/60 mb-8 italic text-sm">{ARC_STAGE.hint}</p>
      <div className="space-y-3">
        {ARC_STAGE.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onPick(opt.id)}
            className="w-full text-left px-6 py-5 border border-cream/20 hover:border-gold hover:bg-charcoal transition-colors rounded-sm group"
          >
            <div className="font-display text-xl text-cream group-hover:text-gold transition-colors">
              {opt.label}
            </div>
            <div className="text-cream/70 text-sm mt-1">{opt.body}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PillarIntro({ label, intro, onContinue }) {
  // label is e.g. "Pillar 1 of 4 · Move" — split into the count + the pillar name
  const parts = label.split("·");
  const count = parts[0]?.trim();
  const pillarName = parts[1]?.trim() || "";
  return (
    <div className="fade-in text-center max-w-xl">
      <div className="text-cream/40 uppercase tracking-widest text-xs mb-4">
        {count}
      </div>
      <h2 className="font-display text-5xl sm:text-6xl text-cream mb-3">
        {pillarName}
      </h2>
      <p className="text-gold tracking-widest text-sm uppercase mb-10">
        {intro}
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-cream text-ink font-medium hover:bg-gold transition-colors rounded-sm"
      >
        Continue →
      </button>
    </div>
  );
}

function QuestionScreen({ question, index, total, onAnswer }) {
  return (
    <div className="fade-in w-full max-w-xl">
      <div className="text-cream/40 text-xs mb-6 tracking-wider uppercase">
        Question {index} of {total}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl text-cream mb-4 leading-tight">
        {question.title}
      </h2>
      {question.body ? (
        <p className="text-cream/70 italic mb-10 leading-relaxed">
          {question.body}
        </p>
      ) : (
        <div className="mb-10" />
      )}
      <div className="space-y-2.5">
        {RATING_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id)}
            className="w-full text-left px-6 py-4 border border-cream/20 hover:border-gold hover:bg-charcoal transition-colors rounded-sm text-cream"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Transition({ transition, onContinue }) {
  return (
    <div className="fade-in text-center max-w-xl">
      <div className="text-gold uppercase tracking-widest text-sm mb-6">
        {transition.progress}
      </div>
      <p className="font-display text-2xl sm:text-3xl text-cream italic leading-snug mb-10">
        {transition.body}
      </p>
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-cream text-ink font-medium hover:bg-gold transition-colors rounded-sm"
      >
        Continue →
      </button>
    </div>
  );
}

function MetaScreen({ meta, onAnswer }) {
  const [otherText, setOtherText] = useState("");
  const [pickedOther, setPickedOther] = useState(false);

  if (meta.type === "scale-1-10") {
    return (
      <div className="fade-in w-full max-w-xl">
        <h2 className="font-display text-3xl sm:text-4xl text-cream mb-6 leading-tight">
          {meta.title}
        </h2>
        <div className="flex justify-between text-cream/50 text-xs mb-4 italic">
          <span>{meta.hintLow}</span>
          <span>{meta.hintHigh}</span>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => onAnswer(n)}
              className="aspect-square border border-cream/20 hover:border-gold hover:bg-gold hover:text-ink transition-colors rounded-sm text-cream font-medium"
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // single-select
  return (
    <div className="fade-in w-full max-w-xl">
      <h2 className="font-display text-2xl sm:text-3xl text-cream mb-8 leading-tight">
        {meta.title}
      </h2>
      <div className="space-y-3">
        {meta.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onAnswer(opt.id)}
            className="w-full text-left px-6 py-4 border border-cream/20 hover:border-gold hover:bg-charcoal transition-colors rounded-sm group"
          >
            <span className="font-medium text-cream group-hover:text-gold transition-colors">
              {opt.label}
            </span>
            {opt.body && (
              <span className="text-cream/60 text-sm"> — {opt.body}</span>
            )}
          </button>
        ))}
        {meta.allowOther && !pickedOther && (
          <button
            onClick={() => setPickedOther(true)}
            className="w-full text-left px-6 py-4 border border-cream/20 hover:border-gold transition-colors rounded-sm text-cream/70 italic"
          >
            Something else — write it for me
          </button>
        )}
        {pickedOther && (
          <div className="border border-gold/40 rounded-sm p-4">
            <input
              type="text"
              value={otherText}
              onChange={(e) => setOtherText(e.target.value)}
              placeholder="In your own words..."
              className="w-full bg-transparent text-cream border-b border-cream/30 focus:border-gold outline-none py-2 placeholder-cream/40"
              autoFocus
            />
            <button
              onClick={() => onAnswer("other", otherText)}
              disabled={!otherText.trim()}
              className="mt-4 px-6 py-2 bg-cream text-ink rounded-sm disabled:opacity-40 hover:bg-gold transition-colors text-sm"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailCaptureScreen({
  firstName,
  setFirstName,
  email,
  setEmail,
  modernToolsNote,
  setModernToolsNote,
  submitting,
  onSubmit,
  testMode,
}) {
  const valid = firstName.trim().length > 0 && /\S+@\S+\.\S+/.test(email);
  return (
    <div className="fade-in w-full max-w-xl">
      {testMode && (
        <div className="mb-4 text-center text-xs uppercase tracking-widest text-crimson border border-crimson/40 rounded-sm py-2">
          Test mode · pre-filled · skips Circle · click through freely
        </div>
      )}
      <h2 className="font-display text-3xl sm:text-4xl text-cream mb-6 leading-tight">
        {EMAIL_CAPTURE.title}
      </h2>
      <ul className="text-cream/80 mb-8 space-y-2">
        {EMAIL_CAPTURE.benefits.map((b, i) => (
          <li key={i} className="flex items-start">
            <span className="text-gold mr-3 mt-1">✓</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-4">
        <div>
          <label className="block text-cream/60 text-sm mb-2">First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-charcoal border border-cream/20 focus:border-gold outline-none px-4 py-3 text-cream rounded-sm"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-cream/60 text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-charcoal border border-cream/20 focus:border-gold outline-none px-4 py-3 text-cream rounded-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-cream/60 text-sm mb-2 italic">
            {EMAIL_CAPTURE.modernToolsHint}
          </label>
          <input
            type="text"
            value={modernToolsNote}
            onChange={(e) => setModernToolsNote(e.target.value)}
            className="w-full bg-charcoal border border-cream/20 focus:border-gold outline-none px-4 py-3 text-cream rounded-sm"
            placeholder="(optional)"
          />
        </div>
      </div>
      <p className="text-cream/50 text-xs mt-4 italic leading-relaxed">
        {EMAIL_CAPTURE.newsletterHint}
      </p>
      <button
        onClick={onSubmit}
        disabled={!valid || submitting}
        className="mt-8 w-full px-8 py-4 bg-cream text-ink font-medium hover:bg-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-sm"
      >
        {submitting ? "Loading your results..." : EMAIL_CAPTURE.cta + " →"}
      </button>
    </div>
  );
}

function ResultsPage({ firstName, answers, metaAnswers, resultsBlock, revealNext }) {
  // Answers live in metaAnswers — every question is a single-select.
  const { blocker } = useMemo(
    () => scoreBlockers({ ...metaAnswers, ...answers }),
    [metaAnswers, answers]
  );
  const copy = BLOCKER_COPY[blocker] || BLOCKER_COPY.unguarded;

  return (
    <div className="w-full max-w-2xl">
      {/* THE RESULT */}
      <div className="block-reveal text-center mb-12">
        <p className="text-gold italic mb-3">{firstName ? `${firstName} —` : "—"}</p>
        <p className="text-cream/60 text-sm uppercase tracking-widest mb-6">
          Here's what's in your way
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-gold mb-8">
          {copy.name}
        </h1>
      </div>

      {/* THE MIRROR */}
      <div className="block-reveal mb-12 space-y-5 text-cream/85 text-lg leading-relaxed">
        {copy.mirror.map((line, i) => (
          <p key={i} className={i === copy.mirror.length - 1 ? "text-cream font-medium" : ""}>
            {line}
          </p>
        ))}
      </div>

      {/* THE MOVE — a gift, not a button. Deliberately NOT gold-bordered:
          the only gold-bordered thing on this page is the one clickable one. */}
      <div className="block-reveal mb-10 border-l-2 border-cream/25 pl-6 py-1">
        <div className="text-cream/50 text-xs uppercase tracking-widest mb-3">
          Do this now
        </div>
        <p className="text-cream text-lg leading-relaxed">{copy.move}</p>
      </div>

      {/* A BEAT — she was just handed something real. Let it land before
          she's asked for anything. Whitespace only: the divider asset has an
          ivory background baked in, and the crown behind it is already doing
          the work. */}
      <div className="py-14" />

      {/* THE ROOM — deliberately short. Juls 2026-08-05: the per-blocker
          promise line repeated what the move already said, and one version of
          it ("same time every week") described the membership rather than a
          one-time room. The result card above already carries the
          personalization; this just opens the door. */}
      <div className="block-reveal text-center space-y-4 mb-10">
        <p className="font-display text-2xl text-cream">{RESULT_CTA.lead}</p>
        <p className="text-cream/85 text-lg pt-1">{RESULT_CTA.offer}</p>
        <p className="text-gold text-sm tracking-wide">{RESULT_CTA.times}</p>
        <div className="pt-4">
          <a
            href="https://teamqueen.co/first-win"
            className="inline-block border border-gold text-gold px-8 py-3 rounded-sm hover:bg-gold hover:text-plum transition-colors font-medium tracking-wide"
          >
            {RESULT_CTA.cta}
          </a>
        </div>
      </div>

      {/* SIGN-OFF */}
      <div className="block-reveal text-center text-cream/60 italic whitespace-pre-line">
        {RESULT_CTA.signoff}
      </div>
      {/* The logo closes the page — Juls 2026-08-05 */}
      <div className="text-center mt-14 pb-4">
        <img
          src="/teamqueen-logo.png"
          alt="TeamQueen"
          className="w-40 h-40 mx-auto opacity-95"
        />
      </div>
    </div>
  );
}

function Block({ label, children, featured }) {
  return (
    <div
      className={`block-reveal mb-12 p-6 sm:p-10 rounded-sm border ${
        featured
          ? "border-gold/40 bg-charcoal"
          : "border-cream/10 bg-charcoal/40"
      }`}
    >
      <div className="text-gold/70 text-xs uppercase tracking-widest mb-4">
        {label}
      </div>
      {children}
    </div>
  );
}

function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}
