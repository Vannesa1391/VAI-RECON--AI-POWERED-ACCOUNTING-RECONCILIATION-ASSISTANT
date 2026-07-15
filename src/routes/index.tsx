import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  askChatbot,
  autoTracePayment,
  prioritizeAccounts,
  searchDocuments,
} from "@/lib/vai.functions";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

type SearchResult = Awaited<ReturnType<typeof searchDocuments>>;
type ChatResult = Awaited<ReturnType<typeof askChatbot>>;
type PrioritizeResult = Awaited<ReturnType<typeof prioritizeAccounts>>;
type TraceResult = Awaited<ReturnType<typeof autoTracePayment>>;

function Dashboard() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 ml-64">
        <TopBar />
        <div className="max-w-7xl mx-auto px-8 py-8">
          <Header />
          <Disclaimer />
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4 mt-8">
            <SearchCard />
            <ChatCard />
            <TracerCard />
            <PlannerCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function Sidebar() {
  const items = [
    { label: "Document Search", active: true },
    { label: "AI Chatbot", active: false },
    { label: "Auto-Tracer", active: false },
    { label: "Task Planner", active: false },
    { label: "Insights", active: false },
    { label: "Insights", active: false },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-lg" style={{ background: "var(--gradient-brand)" }} />
        <div>
          <div className="font-display font-semibold text-lg leading-tight">VAI Recon</div>
          <div className="text-xs text-sidebar-muted">Reconciliation AI</div>
        </div>
      </div>
      <nav className="space-y-1">
        {items.map((it) => (
          <div
            key={it.label}
            className={`px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
              it.active
                ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                : "text-sidebar-muted hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            {it.label}
          </div>
        ))}
      </nav>
      <div className="mt-auto text-xs text-sidebar-muted">
        <div className="border-t border-sidebar-border pt-4">
          <div className="font-medium text-sidebar-foreground">Finance Team</div>
          <div>March 2026 close</div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <div className="h-14 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between px-8">
      <div className="text-sm text-muted-foreground">
        Workspace <span className="text-foreground font-medium">/ March 2026</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[color:var(--success)]/10 text-[color:var(--success)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--success)]" />
          AI online
        </span>
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
          FT
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div>
      <div className="text-xs uppercase tracking-wider text-primary font-semibold">Dashboard</div>
      <h1 className="mt-2 text-4xl font-display font-semibold">
        <span className="text-gradient-brand">AI-powered</span> reconciliation
      </h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        Match supporting documents, ask VAI about specific invoices, and let the planner
        rank your unreconciled accounts.
      </p>
    </div>
  );
}

function Disclaimer() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-4 py-3 text-sm">
      <div className="w-1.5 h-1.5 rounded-full bg-[color:var(--warning)] mt-1.5" />
      <div className="text-[oklch(0.35_0.08_80)]">
        AI-generated content may require human review before you post to the ledger.
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-card rounded-2xl border border-border p-6 flex flex-col"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {children}
    </div>
  );
}

function CardHeader({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="mb-4">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{step}</div>
      <h3 className="mt-1 font-display font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition"
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/20 transition resize-none font-mono"
    />
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
      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed transition-transform active:scale-[0.98]"
      style={{ background: "var(--gradient-brand)" }}
    >
      {loading && (
        <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}

function ErrorLine({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <div className="mt-3 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
      {msg}
    </div>
  );
}

function ConfidencePill({ value }: { value: number }) {
  const color =
    value >= 90 ? "var(--success)" : value >= 70 ? "var(--primary)" : "var(--warning)";
  return (
    <div
      className="shrink-0 text-[11px] font-semibold px-2 py-1 rounded-md"
      style={{ color, background: `color-mix(in oklab, ${color} 12%, transparent)` }}
    >
      {Math.round(value)}%
    </div>
  );
}

function SearchCard() {
  const run = useServerFn(searchDocuments);
  const [q, setQ] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      setResult(await run({ data: { query: q.trim() } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        step="01 · Research"
        title="Document Search"
        desc="Fuzzy-match supporting docs by reference, invoice, customer, or amount."
      />
      <TextInput
        placeholder="e.g. INV-2035 or ABC Retail R15,500"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Find matching documents
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 space-y-2">
          {result.matches.map((m, i) => (
            <div
              key={i}
              className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-md bg-primary/10 text-primary grid place-items-center text-[10px] font-semibold shrink-0">
                {m.type.slice(0, 3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{m.filename}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.reason}</div>
              </div>
              <ConfidencePill value={m.confidence} />
            </div>
          ))}
          {result.interpretation && (
            <div className="text-xs text-muted-foreground italic px-1 pt-1">
              {result.interpretation}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ChatCard() {
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
      setResult(await run({ data: { question: q.trim() } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        step="02 · Ask"
        title="AI Chatbot"
        desc="Ask VAI in plain English about a specific invoice, customer, or payment."
      />
      <TextInput
        placeholder="Find proof of payment for INV-2035"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Ask VAI
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 rounded-lg bg-secondary/60 border border-border p-4 text-sm whitespace-pre-wrap leading-relaxed">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1.5">
            VAI
          </div>
          {result.text}
        </div>
      )}
    </Card>
  );
}

function PlannerCard() {
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
      setResult(await run({ data: { accounts: text.trim() } }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader
        step="03 · Plan"
        title="Task Planner"
        desc="Paste unreconciled accounts. VAI ranks them by risk and age."
      />
      <TextArea
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="One account per line: customer — age — amount"
      />
      <div className="mt-3">
        <Button onClick={submit} loading={loading}>
          Prioritize accounts
        </Button>
      </div>
      <ErrorLine msg={err} />
      {result && (
        <div className="mt-4 space-y-2">
          {result.priorities.map((p) => (
            <div
              key={p.rank}
              className="rounded-lg border border-border bg-secondary/50 px-3 py-2.5 text-sm flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-xs font-semibold shrink-0">
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{p.account}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {p.age_days}d overdue
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.action}</div>
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-[color:var(--warning)] shrink-0">
                {p.risk}
              </div>
            </div>
          ))}
          {result.recommendation && (
            <div className="mt-2 rounded-lg border-l-2 border-primary bg-primary/5 px-3 py-2 text-xs text-foreground">
              <span className="font-semibold text-primary">Recommendation · </span>
              {result.recommendation}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
