import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  component: VaiRecon,
  head: () => ({
    meta: [
      { title: "VAI RECON — Voice AI Assistant for Financial Reconciliation" },
      {
        name: "description",
        content:
          "Voice-driven reconciliation assistant: smart search, task planning, and email tracking for finance teams.",
      },
    ],
  }),
});

type User = { id: string; name: string; title: string; email: string };
type Msg = { who: "you" | "vai"; text: string };
type Payment = { date: string; client: string; amount: number; ref: string };
type Task = { id: number; text: string; when: string };

const USERS: User[] = [
  { id: "v", name: "Ms V", title: "Finance Manager", email: "v@company.co.za" },
  { id: "d", name: "Ms Dineo", title: "Senior Accountant", email: "dineo@company.co.za" },
  { id: "k", name: "Mr K", title: "Reconciliation Officer", email: "k@company.co.za" },
];

const PAYMENTS: Payment[] = [
  { date: "16 Jul 2026", client: "Vuma", amount: 12450, ref: "Missing" },
  { date: "16 Jul 2026", client: "Vuma", amount: 12450, ref: "Missing" },
  { date: "15 Jul 2026", client: "MTN", amount: 5000, ref: "INV-1001" },
  { date: "14 Jul 2026", client: "Telkom", amount: 5000, ref: "INV-1002" },
  { date: "14 Jul 2026", client: "Telkom", amount: 5000, ref: "INV-1002" },
  { date: "12 Jul 2026", client: "Vodacom", amount: 8700, ref: "Missing" },
];

function greetFor(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part} ${name}, I am VAI. How can I help with your reconciliation today?`;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const za = voices.find((v) => /en-ZA/i.test(v.lang));
  if (za) return za;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const female = en.find((v) => /female|zira|aria|jenny|samantha|karen|victoria/i.test(v.name));
  return female ?? en[0] ?? voices[0];
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const v = pickVoice();
  if (v) u.voice = v;
  u.lang = "en-ZA";
  u.rate = 1;
  u.pitch = 1.05;
  window.speechSynthesis.speak(u);
}

function VaiRecon() {
  const [userId, setUserId] = useState("v");
  const user = USERS.find((u) => u.id === userId)!;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [filtered, setFiltered] = useState<Payment[] | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("client@vuma.co.za");
  const [emailCc, setEmailCc] = useState("");
  const [emailStatus, setEmailStatus] = useState<string>("");
  const recRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef<string>("");

  // Warm up voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Greet on user change
  useEffect(() => {
    if (greetedRef.current === user.id) return;
    greetedRef.current = user.id;
    const g = greetFor(user.name);
    setMessages((m) => [...m, { who: "vai", text: g }]);
    speak(g);
  }, [user.id, user.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function addVai(text: string) {
    setMessages((m) => [...m, { who: "vai", text }]);
    speak(text);
  }

  function handleCommand(raw: string) {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { who: "you", text }]);
    const q = text.toLowerCase();

    // Task: remind me / remember / add task
    const remindMatch = q.match(/(?:remind me to|remember to|add task)\s+(.*)/i);
    if (remindMatch) {
      const timeMatch = text.match(/\b(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      const when = timeMatch ? timeMatch[1] : "today";
      const taskText = remindMatch[1].replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?/i, "").trim();
      const t: Task = { id: Date.now(), text: taskText || text, when };
      setTasks((ts) => [t, ...ts]);
      addVai(`Task saved: ${t.text} at ${when}.`);
      return;
    }

    if (/duplicate/i.test(q)) {
      const seen = new Map<string, number>();
      PAYMENTS.forEach((p) => {
        const k = `${p.client}|${p.amount}|${p.ref}`;
        seen.set(k, (seen.get(k) ?? 0) + 1);
      });
      const dupes = PAYMENTS.filter((p) => (seen.get(`${p.client}|${p.amount}|${p.ref}`) ?? 0) > 1);
      setFiltered(dupes);
      addVai(`Found ${dupes.length} duplicate payments across Vuma and Telkom.`);
      return;
    }

    if (/missing/i.test(q) && /(ref|reference)/i.test(q)) {
      const rows = PAYMENTS.filter((p) => /missing/i.test(p.ref));
      setFiltered(rows);
      addVai(`Found ${rows.length} payments with a missing reference.`);
      return;
    }

    const clientMatch = ["Vuma", "MTN", "Telkom", "Vodacom"].find((c) =>
      q.includes(c.toLowerCase()),
    );
    if (clientMatch && /(find|show|payment|from)/i.test(q)) {
      const rows = PAYMENTS.filter((p) => p.client === clientMatch);
      setFiltered(rows);
      addVai(`Showing ${rows.length} payment${rows.length === 1 ? "" : "s"} from ${clientMatch}.`);
      return;
    }

    if (/clear|reset|all payments/i.test(q)) {
      setFiltered(null);
      addVai("Showing all payments.");
      return;
    }

    if (/email|draft/i.test(q)) {
      setEmailOpen(true);
      addVai("Draft email ready. Please review the recipient and hit Send & Track.");
      return;
    }

    addVai(
      "I can find payments by client, find duplicates, find missing references, save reminders, or draft emails.",
    );
  }

  function toggleMic() {
    const SR =
      (typeof window !== "undefined" &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) ||
      null;
    if (!SR) {
      alert("Voice input not supported here. Try Chrome or Edge.");
      return;
    }
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {}
      recRef.current = null;
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-ZA";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      handleCommand(t);
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };
    rec.onerror = () => {
      setListening(false);
      recRef.current = null;
    };
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function submitInput(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    handleCommand(input);
    setInput("");
  }

  function draftEmail() {
    setEmailOpen(true);
    setEmailStatus("");
  }

  function sendAndTrack() {
    setEmailStatus("📡 Tracking for replies...");
    addVai("Email sent. I am tracking for replies.");
    setTimeout(() => {
      const reply = "Reply received: Reference is INV-VUMA-2231";
      setEmailStatus("✅ " + reply);
      addVai(reply);
    }, 5000);
  }

  const rows = filtered ?? PAYMENTS;
  const emailBody = useMemo(
    () =>
      `Dear Client,\n\nWe received a payment on 16 Jul 2026 for R12,450.00 without a reference. Please share the invoice reference so we can allocate it correctly.\n\nKind regards,\n${user.name}\n${user.title}\n${user.email}`,
    [user],
  );

  return (
    <div className="vr-root">
      <style>{CSS}</style>
      <header className="vr-header">
        <div className="vr-brand">
          <div className="vr-logo">VAI</div>
          <div>
            <h1>VAI RECON</h1>
            <p>Voice AI Assistant for Financial Reconciliation</p>
          </div>
        </div>
        <div className="vr-user">
          <label>User</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            {USERS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} — {u.title}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="vr-grid">
        {/* Chat */}
        <section className="vr-card vr-chat">
          <h2>🎙️ Voice Chatbot</h2>
          <div className="vr-messages">
            {messages.map((m, i) => (
              <div key={i} className={`vr-msg vr-msg-${m.who}`}>
                <strong>{m.who === "you" ? user.name : "VAI"}:</strong> {m.text}
                {m.who === "vai" && (
                  <button className="vr-speaker" onClick={() => speak(m.text)} title="Replay">
                    🔊
                  </button>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form className="vr-input-row" onSubmit={submitInput}>
            <button
              type="button"
              onClick={toggleMic}
              className={`vr-mic ${listening ? "listening" : ""}`}
              title="Push to talk"
            >
              {listening ? "🔴" : "🎤"}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try: "Find payment from Vuma" or "Remind me to reconcile at 9AM"'
            />
            <button type="submit" className="vr-send">
              Send
            </button>
          </form>
        </section>

        {/* Payments */}
        <section className="vr-card">
          <div className="vr-row-between">
            <h2>🔍 Smart Search — Bank Data (July 2026)</h2>
            {filtered && (
              <button className="vr-link" onClick={() => setFiltered(null)}>
                Show all
              </button>
            )}
          </div>
          <div className="vr-tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Reference</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={i} className={p.ref === "Missing" ? "vr-warn" : ""}>
                    <td>{p.date}</td>
                    <td>{p.client}</td>
                    <td>R{p.amount.toLocaleString()}</td>
                    <td>{p.ref}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="vr-quick">
            <button onClick={() => handleCommand("Find payment from Vuma")}>Vuma payments</button>
            <button onClick={() => handleCommand("Find duplicates")}>Find duplicates</button>
            <button onClick={() => handleCommand("Find missing reference")}>Missing refs</button>
          </div>
        </section>

        {/* Tasks */}
        <section className="vr-card">
          <h2>📋 Task Planner</h2>
          <p className="vr-hint">
            Say or type: <em>"Remind me to reconcile at 9AM"</em>
          </p>
          {tasks.length === 0 ? (
            <p className="vr-empty">No tasks yet.</p>
          ) : (
            <ul className="vr-tasks">
              {tasks.map((t) => (
                <li key={t.id}>
                  <span>✓ {t.text}</span>
                  <span className="vr-when">{t.when}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Email */}
        <section className="vr-card">
          <div className="vr-row-between">
            <h2>✉️ Email Generator & Tracking</h2>
            <button className="vr-primary" onClick={draftEmail}>
              Draft email to client
            </button>
          </div>
          {emailOpen && (
            <div className="vr-email">
              <div className="vr-field">
                <label>To</label>
                <input value={emailTo} onChange={(e) => setEmailTo(e.target.value)} />
              </div>
              <div className="vr-field">
                <label>CC</label>
                <input
                  value={emailCc}
                  onChange={(e) => setEmailCc(e.target.value)}
                  placeholder="cc@company.co.za"
                />
              </div>
              <div className="vr-field">
                <label>Subject</label>
                <input readOnly value="Missing Payment Reference" />
              </div>
              <textarea readOnly value={emailBody} rows={9} />
              <div className="vr-row-between">
                <button className="vr-primary" onClick={sendAndTrack}>
                  Send & Track
                </button>
                {emailStatus && <span className="vr-status">{emailStatus}</span>}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="vr-footer">
        Signed in as <b>{user.name}</b> · {user.title} · Voice: en-ZA
      </footer>
    </div>
  );
}

const CSS = `
.vr-root{min-height:100vh;background:linear-gradient(180deg,#0b1220 0%,#0f1e3a 100%);color:#e2e8f0;font-family:'Inter',system-ui,sans-serif;padding:20px;box-sizing:border-box;}
.vr-header{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;margin-bottom:20px;}
.vr-brand{display:flex;align-items:center;gap:14px;}
.vr-logo{width:52px;height:52px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#22c55e);display:grid;place-items:center;font-weight:800;color:#0b1220;font-size:16px;}
.vr-header h1{margin:0;font-size:22px;color:#60a5fa;font-family:'Space Grotesk',sans-serif;}
.vr-header p{margin:2px 0 0;color:#94a3b8;font-size:13px;}
.vr-user{display:flex;align-items:center;gap:10px;}
.vr-user label{color:#94a3b8;font-size:13px;}
.vr-user select,.vr-card input,.vr-card textarea{background:#0b1a33;color:#e2e8f0;border:1px solid #1e3a5f;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;}
.vr-user select{min-width:220px;}
.vr-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
@media (max-width:900px){.vr-grid{grid-template-columns:1fr;}}
.vr-card{background:rgba(15,30,58,0.7);backdrop-filter:blur(10px);border:1px solid #1e3a5f;border-radius:16px;padding:18px;box-shadow:0 4px 24px rgba(0,0,0,0.25);}
.vr-card h2{margin:0 0 12px;font-size:16px;color:#93c5fd;font-family:'Space Grotesk',sans-serif;}
.vr-row-between{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap;}
.vr-messages{background:#0b1a33;border:1px solid #1e3a5f;border-radius:12px;padding:12px;height:280px;overflow-y:auto;font-size:14px;}
.vr-msg{margin:6px 0;padding:8px 10px;border-radius:8px;line-height:1.4;}
.vr-msg-you{background:#1e3a5f;}
.vr-msg-vai{background:#132b52;border-left:3px solid #22c55e;}
.vr-speaker{background:transparent;border:none;color:#94a3b8;cursor:pointer;margin-left:6px;font-size:14px;}
.vr-input-row{display:flex;gap:8px;margin-top:10px;}
.vr-input-row input{flex:1;}
.vr-mic{width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(135deg,#0ea5e9,#22c55e);color:white;font-size:18px;cursor:pointer;}
.vr-mic.listening{background:#ef4444;animation:pulse 1s infinite;}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}
.vr-send,.vr-primary{background:#22c55e;color:#052e16;border:none;padding:10px 16px;border-radius:10px;font-weight:600;cursor:pointer;font-family:inherit;}
.vr-send:hover,.vr-primary:hover{background:#16a34a;color:white;}
.vr-tablewrap{overflow-x:auto;}
.vr-card table{width:100%;border-collapse:collapse;font-size:14px;}
.vr-card th,.vr-card td{padding:8px 10px;text-align:left;border-bottom:1px solid #1e3a5f;}
.vr-card th{color:#94a3b8;font-weight:500;font-size:12px;text-transform:uppercase;}
.vr-warn td{background:rgba(239,68,68,0.08);}
.vr-quick{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;}
.vr-quick button{background:#1e3a5f;color:#e2e8f0;border:1px solid #1e3a5f;padding:6px 12px;border-radius:8px;cursor:pointer;font-size:13px;}
.vr-quick button:hover{background:#2a4a75;}
.vr-link{background:none;border:none;color:#60a5fa;cursor:pointer;font-size:13px;}
.vr-hint{color:#94a3b8;font-size:13px;margin:0 0 10px;}
.vr-empty{color:#64748b;font-style:italic;font-size:13px;}
.vr-tasks{list-style:none;padding:0;margin:0;}
.vr-tasks li{display:flex;justify-content:space-between;padding:8px 10px;background:#0b1a33;border-radius:8px;margin-bottom:6px;font-size:14px;}
.vr-when{color:#22c55e;font-weight:600;font-size:13px;}
.vr-email{display:flex;flex-direction:column;gap:10px;margin-top:8px;}
.vr-field{display:flex;flex-direction:column;gap:4px;}
.vr-field label{font-size:12px;color:#94a3b8;}
.vr-email textarea{background:#0b1a33;color:#e2e8f0;border:1px solid #1e3a5f;border-radius:10px;padding:10px 12px;font-family:inherit;font-size:13px;white-space:pre-wrap;}
.vr-status{color:#22c55e;font-size:13px;font-weight:600;}
.vr-footer{margin-top:20px;text-align:center;color:#64748b;font-size:12px;}
`;
