import { useCallback, useEffect, useRef, useState } from "react";

// Pick a professional female English voice from the system list.
function pickFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const preferred = [
    "Samantha",
    "Google UK English Female",
    "Microsoft Aria Online",
    "Microsoft Jenny Online",
    "Microsoft Zira",
    "Karen",
    "Victoria",
    "Serena",
    "Moira",
    "Tessa",
  ];
  for (const name of preferred) {
    const v = en.find((x) => x.name.includes(name));
    if (v) return v;
  }
  const female = en.find((v) => /female|woman|zira|aria|jenny|samantha/i.test(v.name));
  return female ?? en[0] ?? voices[0];
}

export function useVoice() {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const load = () => setVoice(pickFemaleVoice(window.speechSynthesis.getVoices()));
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      if (voice) u.voice = voice;
      u.rate = 1;
      u.pitch = 1.05;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [voice],
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, []);

  const listen = useCallback((onResult: (text: string) => void) => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      alert("Voice input is not supported in this browser. Try Chrome or Edge.");
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
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => onResult(e.results[0][0].transcript);
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
  }, []);

  return { speak, stop, listen, speaking, listening };
}

export function timeGreeting(name = "Ms V") {
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part} ${name}, I am VAI. What amount would you like to find today?`;
}
