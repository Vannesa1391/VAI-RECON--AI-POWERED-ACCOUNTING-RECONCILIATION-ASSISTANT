import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Mic, MicOff, Volume2, Square } from "lucide-react";
import {
  askChatbot,
  autoTracePayment,
  prioritizeAccounts,
} from "@/lib/vai.functions";
import { useVoice, timeGreeting } from "@/hooks/use-voice";
import bgImage from "@/assets/vai-bg.jpg";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type ChatResult = Awaited<ReturnType<typeof askChatbot>>;
type PrioritizeResult = Awaited<ReturnType<typeof prioritizeAccounts>>;
type TraceResult = Awaited<ReturnType<typeof autoTracePayment>>;

function Dashboard() {
  const [voiceMode, setVoiceMode] = useState(false);
  const voice = useVoice();
  const [greeting] = useState(() => timeGreeting("Ms V"));

  // Greet on load once voices are ready.
  useEffect(() => {
    const t = setTimeout(() => voice.speak(greeting), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[oklch(0.22_0.09_155/0.55)] pointer-events-none" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64">
          <TopBar voiceMode={voiceMode} setVoiceMode={setVoiceMode} />
          <div className="max-w-7xl mx-auto px-8 py-8">
            <Header greeting={greeting} onReplay={() => voice.speak(greeting)} />
            <Disclaimer />
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 mt-8">
              <ResearchCard voiceMode={voiceMode} voice={voice} />
              <ChatCard voiceMode={voiceMode} voice={voice} />
              <PlannerCard voiceMode={voiceMode} voice={voice} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar() {
  const items = [
    { label: "Research Assistant", active: true },
    { label: "AI Chatbot", active: false },
    { label: "Task Planner", active: false },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[oklch(0.18_0.06_155/0.85)] backdrop-blur-xl text-white p-6 flex flex-col border-r border-white/10 z-10">
      <div className="flex items-center gap-3 mb-10">
        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="vaiLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.85 0.2 130)" />
              <stop offset="100%" stopColor="oklch(0.68 0.16 155)" />
            </linearGradient>
          </defs>
          <path
            d="M4 5 L12 20 L20 5"
            stroke="url(#vaiLogoGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="9" r="1" fill="url(#vaiLogoGradient)" />
          <circle cx="16" cy="9" r="1" fill="url(#vaiLogoGradient)" />
          <circle cx="12" cy="15" r="1" fill="url(#vaiLogoGradient)" />
        </svg>
        <div>
          <div className="font-display font-semibold text-lg leading-tight">
            VAI <span style={{ color: "oklch(0.85 0.2 130)" }}>Recon</span>
          </div>
          <div className="text-xs text-white/60">Reconciliation AI</div>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((it) => (
          <div
            key={it.label}
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
              it.active
                ? "bg-white/10 text-white font-medium"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
          >
            {it.label}
          </div>
        ))}
      </nav>
      <div className="mt-auto text-xs text-white/60">
        <div className="border-t border-white/10 pt-4">
          <div className="font-medium text-white">Finance Team</div>
          <div>March 2026 close</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({
  voiceMode,
  setVoiceMode,
}: {
  voiceMode: boolean;
  setVoiceMode: (v: boolean) => void;
}) {
  return (
    <div className="h-14 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between px-8">
      <div className="text-sm text-white/70">
        Workspace <span className="text-white font-medium">/ March 2026</span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={() => setVoiceMode(!voiceMode)}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition ${
            voiceMode
              ? "bg-[oklch(0.85_0.2_130)] text-[oklch(0.18_0.06_155)] border-transparent shadow-[0_0_20px_oklch(0.85_0.2_130/0.5)]"
              : "bg-white/5 text-white/80 border-white/20 hover:bg-white/10"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${voiceMode ? "bg-[oklch(0.18_0.06_155)]" : "bg-white/50"}`}
          />
          Voice Mode {voiceMode ? "ON" : "OFF"}
        </button>
        <div className="w-8 h-8 rounded-full bg-[oklch(0.85_0.2_130)]/20 text-[oklch(0.85_0.2_130)] grid place-items-center text-xs font-semibold border border-white/10">
          MV
        </div>
      </div>
    </div>
  );
}

function Header({ greeting, onReplay }: { greeting: string; onReplay: () => void }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-[oklch(0.85_0.2_130)] font-semibold">
        Dashboard
      </div>
      <div className="mt-2 flex items-start gap-3">
        <h1 className="text-4xl font-display font-semibold text-white max-w-3xl leading-tight">
          {greeting}
        </h1>
        <button
          onClick={onReplay}
          aria-label="Replay greeting"
          className="mt-2 inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur px-4 py-3 text-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.85_0.2_130)] mt-1.5" />
      <div className="text-white/90">
        AI-generated content may require human review before you post to the ledger.
      </div>
    </div>
  );
}

function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 flex flex-col shadow-[0_8px_40px_rgb(0_0_0/0.25)]">
      {children}
    </div>
  );
}

function CardHeader({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.2_130)]">
        {step}
      </div>
      <h3 className="mt-1 font-display font-semibold text-lg text-white">{title}</h3>
      <p className="text-sm text-white/70 mt-0.5">{desc}</p>
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg border border-white/25 bg-white/10 text-sm text-white placeholder:text-white/50 outline-none focus:border-[oklch(0.85_0.2_130)] focus:ring-2 focus:ring-[oklch(0.85_0.2_130)]/30 transition backdrop-blur";

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputCls} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputCls} resize-none font-mono`} />;
}

function MicButton({
  onText,
  listening,
  onClick,
}: {
  onText: (t: string) => void;
  listening: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={listening ? "Stop listening" : "Start voice input"}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border transition ${
        listening
          ? "bg-[oklch(0.85_0.2_130)] text-[oklch(0.18_0.06_155)] border-transparent animate-pulse"
          : "bg-white/10 text-white border-white/25 hover:bg-white/20"
      }`}
    >
      {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
    </button>
  );
}

function SpeakerButton({
  text,
  voice,
}: {
  text: string;
  voice: ReturnType<typeof useVoice>;
}) {
  if (!text) return null;
  return (
    <button
      type="button"
      onClick={() => (voice.speaking ? voice.stop() : voice.speak(text))}
      aria-label={voice.speaking ? "Stop reading" : "Read aloud"}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 text-white transition"
    >
      {voice.speaking ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
    </button>
  );
}

function Button({
  children,
  loading,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-[oklch(0.18_0.06_155)] disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.98] shadow-[0_0_24px_oklch(0.85_0.2_130/0.4)]"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.9 0.2 130) 0%, oklch(0.78 0.22 140) 100%)",
      }}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-[oklch(0.18_0.06_155)]/40 border-t-[oklch(0.18_0.06_155)] animate-spin" />
      )}
      {children}
    </button>
  );
}

function ErrorLine({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="mt-3 text-xs text-white bg-red-500/40 border border-red-300/40 rounded-md px-3 py-2">
      {msg}
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const color =
    value >= 90 ? "oklch(0.85 0.2 130)" : value >= 70 ? "oklch(0.8 0.15 200)" : "oklch(0.85 0.15 80)";
  return (
    <div
      className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md"
      style={{ color, background: `color-mix(in oklab, ${color} 18%, transparent)` }}
    >
      {Math.round(value)}%
    </div>
  );
}

type VoiceProps = { voiceMode: boolean; voice: ReturnType<typeof useVoice> };

function ChatCard({ voiceMode, voice }: VoiceProps) {
  const run = useServerFn(askChatbot);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<ChatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await run({ data: { question: q.trim() } });
      setResult(r);
      if (voiceMode) voice.speak(r.text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard>
      <CardHeader
        step="01 · Ask"
        title="AI Chatbot"
        desc="Ask VAI in plain English about a specific invoice, customer, or payment."
      />
      <div className="flex items-center gap-2">
        <TextInput
          placeholder="Find proof of payment for INV-2035"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <MicButton
          listening={voice.listening}
          onClick={() => voice.listen((t) => setQ(t))}
          onText={setQ}
        />
      </div>
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Ask VAI
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 rounded-lg bg-white/10 border border-white/20 p-4 text-sm text-white/95 whitespace-pre-wrap leading-relaxed">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.2_130)]">
              VAI
            </div>
            <SpeakerButton text={result.text} voice={voice} />
          </div>
          {result.text}
        </div>
      )}
    </GlassCard>
  );
}

function PlannerCard({ voiceMode, voice }: VoiceProps) {
  const run = useServerFn(prioritizeAccounts);
  const [text, setText] = useState(
    "ABC Retail — 60 days — R42,500\nXYZ Stores — 45 days — R18,900\nDelta Foods — 12 days — R6,200\nOmega Traders — 90 days — R31,000",
  );
  const [result, setResult] = useState<PrioritizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!text.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await run({ data: { accounts: text.trim() } });
      setResult(r);
      if (voiceMode) {
        const spoken = `Top priorities. ${r.priorities
          .slice(0, 3)
          .map((p) => `${p.rank}. ${p.account}, ${p.age_days} days overdue.`)
          .join(" ")} ${r.recommendation ?? ""}`;
        voice.speak(spoken);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const spokenSummary = result
    ? `Top priorities. ${result.priorities
        .map((p) => `${p.rank}. ${p.account}, ${p.age_days} days overdue. ${p.action}`)
        .join(" ")} ${result.recommendation ?? ""}`
    : "";

  return (
    <GlassCard>
      <CardHeader
        step="02 · Plan"
        title="Task Planner"
        desc="Paste unreconciled accounts. VAI ranks them by risk and age."
      />
      <div className="flex items-start gap-2">
        <TextArea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="One account per line: customer — age — amount"
        />
        <MicButton
          listening={voice.listening}
          onClick={() =>
            voice.listen((t) => setText((prev) => (prev ? prev + "\n" + t : t)))
          }
          onText={(t) => setText(t)}
        />
      </div>
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Prioritize accounts
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-end">
            <SpeakerButton text={spokenSummary} voice={voice} />
          </div>
          {result.priorities.map((p) => (
            <div
              key={p.rank}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm flex items-start gap-3 text-white"
            >
              <div className="w-7 h-7 rounded-md bg-[oklch(0.85_0.2_130)] text-[oklch(0.18_0.06_155)] grid place-items-center text-xs font-semibold shrink-0">
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{p.account}</span>
                  <span className="text-[11px] text-white/60">{p.age_days}d overdue</span>
                </div>
                <div className="text-xs text-white/70 mt-0.5">{p.action}</div>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.15_80)] shrink-0">
                {p.risk}
              </div>
            </div>
          ))}
          {result.recommendation && (
            <div className="mt-2 rounded-lg border-l-2 border-[oklch(0.85_0.2_130)] bg-[oklch(0.85_0.2_130)]/10 px-3 py-2 text-xs text-white">
              <span className="font-semibold text-[oklch(0.85_0.2_130)]">Recommendation · </span>
              {result.recommendation}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function ResearchCard({ voiceMode, voice }: VoiceProps) {
  const run = useServerFn(autoTracePayment);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<TraceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!amount.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await run({
        data: {
          amount: amount.trim(),
          date: date.trim() || null,
          reference: ref.trim() || null,
        },
      });
      setResult(r);
      if (voiceMode) {
        voice.speak(
          `Best match: ${r.match.invoice} for ${r.match.customer}, ${r.match.amount}. Confidence ${Math.round(
            r.confidence,
          )} percent. ${r.reason}`,
        );
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const spoken = result
    ? `Best match: ${result.match.invoice} for ${result.match.customer}, ${result.match.amount}. Confidence ${Math.round(
        result.confidence,
      )} percent. Pattern: ${result.reason}. ${result.history ?? ""}`
    : "";

  return (
    <GlassCard>
      <CardHeader
        step="01 · Research"
        title="AI Research Assistant"
        desc="Analyzes bank data to identify mystery payments — no manual searching needed."
      />
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <TextInput
            placeholder="Amount (e.g. 15500)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <MicButton
            listening={voice.listening}
            onClick={() =>
              voice.listen((t) => setAmount(t.replace(/[^0-9.]/g, "") || t))
            }
            onText={setAmount}
          />
        </div>
        <TextInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <TextInput
            placeholder="Bank Ref (e.g. 12345 or blank)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
          <MicButton
            listening={voice.listening}
            onClick={() => voice.listen((t) => setRef(t))}
            onText={setRef}
          />
        </div>
      </div>
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Research payment
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 rounded-lg border border-white/20 bg-white/10 p-4 text-sm space-y-2 text-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[oklch(0.85_0.2_130)]">
                AI insight
              </div>
              <div className="font-medium mt-0.5">
                {result.match.invoice} · {result.match.customer}
              </div>
              <div className="text-xs text-white/70">{result.match.amount}</div>
            </div>
            <div className="flex items-center gap-2">
              <ConfidencePill value={result.confidence} />
              <SpeakerButton text={spoken} voice={voice} />
            </div>
          </div>
          <div className="text-xs text-white/80">
            <span className="font-semibold text-white">Pattern: </span>
            {result.reason}
          </div>
          {result.history && (
            <div className="text-xs text-white/80">
              <span className="font-semibold text-white">Customer history: </span>
              {result.history}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
