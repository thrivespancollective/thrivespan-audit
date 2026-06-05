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
  ANCHOR_COPY,
  EDGE_COPY,
  INTEGRATION_COPY,
  LEVERAGE_PLAYS,
  REANCHOR_ROUTINES,
  CTA_COPY,
} from "@/lib/results";
import {
  scoreAudit,
  routeFromScore,
  matchCombo,
  anchorComparison,
  edgeComparison,
  quickwinComparison,
  trustReadback,
} from "@/lib/scoring";

// Build the sequence of screens
const MOVE_QS = QUESTIONS.filter((q) => q.pillar === "move");
const NOURISH_QS = QUESTIONS.filter((q) => q.pillar === "nourish");
const RESTORE_QS = QUESTIONS.filter((q) => q.pillar === "restore");
const CONNECT_QS = QUESTIONS.filter((q) => q.pillar === "connect");

const SCREENS = [
  { id: "hero", type: "hero" },
  { id: "arc_stage", type: "arc_stage" },
  { id: "intro_move", type: "pillar_intro", pillar: "move", label: "Pillar 1 of 4 · Move" },
  ...MOVE_QS.map((q) => ({ id: q.id, type: "question", question: q })),
  { id: "intro_nourish", type: "pillar_intro", pillar: "nourish", label: "Pillar 2 of 4 · Nourish" },
  ...NOURISH_QS.map((q) => ({ id: q.id, type: "question", question: q })),
  { id: "intro_restore", type: "pillar_intro", pillar: "restore", label: "Pillar 3 of 4 · Restore" },
  ...RESTORE_QS.map((q) => ({ id: q.id, type: "question", question: q })),
  { id: "intro_connect", type: "pillar_intro", pillar: "connect", label: "Pillar 4 of 4 · Connect" },
  ...CONNECT_QS.map((q) => ({ id: q.id, type: "question", question: q })),
  { id: "transition_meta", type: "transition", key: "afterConnect" },
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
  const [resultsBlock, setResultsBlock] = useState(0); // 0=header, 1=anchor, 2=edge, 3=integration, 4=leverage, 5=re-anchor, 6=cta

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
    const scoreResult = scoreAudit(answers);
    const route = routeFromScore({ ...scoreResult, arcStage, trust: metaAnswers.meta_trust });
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 sm:px-10 max-w-3xl mx-auto">
      <div className="crown-watermark">👑</div>

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
    <div className="fade-in text-center max-w-2xl">
      <h1 className="font-display text-5xl sm:text-6xl text-cream mb-4 leading-tight">
        {HERO.title}
      </h1>
      <p className="font-display italic text-xl text-gold mb-10">
        {HERO.subtitle}
      </p>
      <div className="text-cream/90 space-y-3 mb-12 text-base sm:text-lg leading-relaxed">
        {HERO.body.map((line, i) => (
          <p key={i} className={line === "" ? "h-2" : "[text-wrap:pretty]"}>
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

function ResultsPage({
  firstName,
  answers,
  arcStage,
  metaAnswers,
  resultsBlock,
  revealNext,
}) {
  const scoreResult = useMemo(() => scoreAudit(answers), [answers]);
  const { anchor, edge, composite, anchorEdgeMatch, pillarScores } = scoreResult;
  const route = routeFromScore({ ...scoreResult, arcStage, trust: metaAnswers.meta_trust });

  const anchorCopy = ANCHOR_COPY[anchor];
  const edgeCopy = EDGE_COPY[edge];
  const integration = matchCombo(anchor, edge, INTEGRATION_COPY);
  const leverage = matchCombo(anchor, edge, LEVERAGE_PLAYS);
  const reanchor = matchCombo(anchor, edge, REANCHOR_ROUTINES);
  const cta = CTA_COPY[route];

  const aCmp = anchorComparison({
    scoredAnchor: anchor,
    subjectiveAnchor: metaAnswers.meta_anchor,
  });
  const eCmp = edgeComparison({
    scoredEdge: edge,
    subjectiveEdge: metaAnswers.meta_edge,
  });
  const qCmp = quickwinComparison({
    leveragePillar: edge,
    subjectiveQuickwin: metaAnswers.meta_quickwin,
  });
  const trustNote = trustReadback(metaAnswers.meta_trust);

  return (
    <div className="w-full max-w-2xl">
      {/* HEADER */}
      <div className="block-reveal text-center mb-12">
        <p className="text-gold italic mb-3">{firstName ? `${firstName} —` : "—"}</p>
        <h1 className="font-display text-3xl sm:text-4xl text-cream mb-2">
          here's what your Code revealed.
        </h1>
        <div className="mt-8 mb-6">
          <div className="text-cream/60 text-sm uppercase tracking-wider mb-2">
            Your Thrive Score
          </div>
          <div className="font-display text-6xl sm:text-7xl text-gold">
            {composite} <span className="text-cream/50 text-3xl sm:text-4xl">/ 80</span>
          </div>
          <div className="text-cream/60 text-sm italic mt-3">
            Stage: {STAGE_LABELS[arcStage] || "Queenager"}
          </div>
        </div>
        <div className="mt-4 mb-2 inline-block border border-gold/40 rounded-sm px-5 py-3 bg-charcoal/60">
          <div className="text-cream/50 text-xs uppercase tracking-widest mb-1">Your Code</div>
          <div className="font-display text-xl text-gold">
            {cap(anchor)}-Anchor · {cap(edge)}-Lever
          </div>
        </div>
        <div className="text-cream/80 italic mt-6 space-y-3 max-w-lg mx-auto">
          <p>This isn't a grade. It's a code.</p>
          <p>A read of where you're strong, where you come loose, and how to use one to steady the other.</p>
          <p>Here's what it reveals:</p>
          <ol className="text-left list-decimal list-inside space-y-1 mt-2 not-italic text-cream/70 text-sm">
            <li>Your ANCHOR — the pillar you can rely on, even half-dead</li>
            <li>Your LEVER — the pillar with the most room, where focused work has the biggest payoff</li>
            <li>How they talk to each other (the integration insight)</li>
            <li>The LEVERAGE PLAY — how to use your anchor's power to build your lever</li>
            <li>Your RE-ANCHOR ROUTINE — your personalized protocol for finding your way back</li>
          </ol>
          <p className="mt-4">
            This is the code for when you're winning AND when you come loose.
          </p>
          <p className="mt-4">
            This is your starting map. The Queen Playbook is what you build next — inside The Build.
          </p>
        </div>
        {resultsBlock < 1 && (
          <button
            onClick={revealNext}
            className="mt-10 px-8 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
          >
            See your Anchor →
          </button>
        )}
      </div>

      {/* BLOCK A — ANCHOR */}
      {resultsBlock >= 1 && (
        <Block label="01 · Anchor" key="anchor">
          <h2 className="font-display text-3xl text-gold mb-4 italic">
            {anchorCopy.headline}
          </h2>
          <p className="text-cream/90 italic leading-relaxed mb-4">
            {anchorCopy.body}
          </p>
          {aCmp && (
            <div className="border-l-2 border-gold pl-4 mt-4 text-cream/80">
              <p className="italic text-sm">{aCmp.readback}</p>
            </div>
          )}
          {resultsBlock < 2 && (
            <button
              onClick={revealNext}
              className="mt-8 px-6 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
            >
              See your Lever →
            </button>
          )}
        </Block>
      )}

      {/* BLOCK B — LEVER */}
      {resultsBlock >= 2 && (
        <Block label="02 · Lever" key="edge">
          <h2 className="font-display text-3xl text-gold mb-4 italic">
            {edgeCopy.headline}
          </h2>
          <p className="text-cream/90 italic leading-relaxed mb-4">
            {edgeCopy.body}
          </p>
          <p className="text-cream font-medium italic mb-4">
            {edgeCopy.reframe}
          </p>
          <p className="text-cream/90 italic leading-relaxed">
            {edgeCopy.closer}
          </p>
          {eCmp && (
            <div className="mt-6 border border-gold/30 bg-charcoal/40 rounded-sm p-4">
              <div className="text-gold uppercase tracking-widest text-xs mb-2">
                Your Cascade Trigger
              </div>
              <p className="text-cream/85 italic text-sm leading-relaxed">{eCmp.readback}</p>
            </div>
          )}
          {resultsBlock < 3 && (
            <button
              onClick={revealNext}
              className="mt-8 px-6 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
            >
              See the Integration →
            </button>
          )}
        </Block>
      )}

      {/* BLOCK C — INTEGRATION */}
      {resultsBlock >= 3 && (
        <Block label="03 · Integration" key="integration">
          <p className="text-cream/90 italic leading-relaxed">{integration}</p>
          {resultsBlock < 4 && (
            <button
              onClick={revealNext}
              className="mt-8 px-6 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
            >
              See your Leverage Play →
            </button>
          )}
        </Block>
      )}

      {/* BLOCK D — LEVERAGE PLAY (the conversion moment) */}
      {resultsBlock >= 4 && (
        <Block label="04 · The Leverage Play" featured key="leverage">
          <div className="text-gold uppercase tracking-widest text-xs mb-4">
            Your Leverage Play
          </div>
          <p className="text-cream/90 italic leading-relaxed mb-4">
            {leverage.intro}
          </p>
          <p className="text-cream italic leading-relaxed mb-4 text-lg">
            {leverage.play}
          </p>
          <p className="text-cream font-medium italic">{leverage.closer}</p>
          {qCmp && (
            <div className="border-l-2 border-gold pl-4 mt-6 text-cream/80">
              <p className="italic text-sm">{qCmp.readback}</p>
            </div>
          )}
          {resultsBlock < 5 && (
            <button
              onClick={revealNext}
              className="mt-8 px-6 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
            >
              See your Re-Anchor Routine →
            </button>
          )}
        </Block>
      )}

      {/* BLOCK E — RE-ANCHOR ROUTINE */}
      {resultsBlock >= 5 && (
        <Block label="05 · Re-Anchor Routine" key="reanchor">
          <p className="text-cream font-medium italic mb-4">
            {reanchor.headline}
          </p>
          <ul className="space-y-2 mb-4">
            {reanchor.steps.map((step, i) => (
              <li key={i} className="flex items-start text-cream/90">
                <span className="text-gold mr-3 mt-1">•</span>
                <span className="italic">{step}</span>
              </li>
            ))}
          </ul>
          <p className="text-cream/90 italic">{reanchor.closer}</p>
          {trustNote && (
            <div className="border-l-2 border-gold pl-4 mt-6 text-cream/80">
              <p className="italic text-sm">{trustNote}</p>
            </div>
          )}
          {resultsBlock < 6 && (
            <button
              onClick={revealNext}
              className="mt-8 px-6 py-3 bg-cream text-ink hover:bg-gold transition-colors rounded-sm"
            >
              See your Next Step →
            </button>
          )}
        </Block>
      )}

      {/* BLOCK F — CTA */}
      {resultsBlock >= 6 && (
        <Block label="06 · Your Next Step" featured key="cta">
          <div className="text-cream/60 text-sm mb-4">
            Based on your score ({composite} / 80) and your combo ({cap(anchor)}-Anchor / {cap(edge)}-Lever):
          </div>
          <h2 className="font-display text-3xl text-gold mb-4 italic">
            {cta.headline}
          </h2>
          <p className="text-cream/90 italic leading-relaxed mb-4">
            {cta.body}
          </p>
          <p className="text-cream/70 text-sm italic mb-6">{cta.details}</p>
          <a
            href={cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-4 bg-cream text-ink font-medium hover:bg-gold transition-colors rounded-sm"
          >
            {cta.button} →
          </a>
          {cta.secondaryButton && (
            <a
              href={cta.secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-block px-6 py-3 border border-cream/40 text-cream hover:border-gold hover:text-gold transition-colors rounded-sm text-sm"
            >
              {cta.secondaryButton}
            </a>
          )}
          <div className="mt-12 text-center text-cream/60 italic text-sm">
            👑 Faster. Stronger. Sexier. Harder to Kill.
          </div>
        </Block>
      )}
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
