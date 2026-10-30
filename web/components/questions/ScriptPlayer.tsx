"use client";

import { useEffect, useRef, useState } from "react";

interface Segment {
  speaker: string | null;
  text: string;
}

function parseTranscript(transcript: string): Segment[] {
  return transcript
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const m = block.match(/^([A-Z][A-Za-z ]{0,20}):\s+([\s\S]+)$/);
      return m ? { speaker: m[1], text: m[2] } : { speaker: null, text: block };
    });
}

/**
 * Plays a listening script with the browser's speech synthesis (free, offline-capable).
 * Different speakers get different voices or pitches. `singlePlay` mimics the real test,
 * where every recording plays only once.
 */
export default function ScriptPlayer({
  transcript,
  singlePlay = false,
}: {
  transcript: string;
  singlePlay?: boolean;
}) {
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [plays, setPlays] = useState(0);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const load = () => {
      voicesRef.current = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Stop playback when the script changes (next question).
  useEffect(() => {
    setPlays(0);
    setPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [transcript]);

  function play() {
    if (!supported || playing || (singlePlay && plays >= 1)) return;
    const segments = parseTranscript(transcript);
    const speakers = [...new Set(segments.map((s) => s.speaker ?? "narrator"))];
    const synth = window.speechSynthesis;
    synth.cancel();
    setPlays((n) => n + 1);
    setPlaying(true);
    segments.forEach((seg, i) => {
      const u = new SpeechSynthesisUtterance(seg.text);
      const idx = speakers.indexOf(seg.speaker ?? "narrator");
      const voices = voicesRef.current;
      if (voices.length) u.voice = voices[idx % voices.length];
      u.pitch = idx % 2 === 0 ? 1 : 1.25;
      u.rate = 0.95;
      if (i === segments.length - 1) {
        u.onend = () => setPlaying(false);
        u.onerror = () => setPlaying(false);
      }
      synth.speak(u);
    });
  }

  function stop() {
    window.speechSynthesis.cancel();
    setPlaying(false);
  }

  if (!supported) {
    return <p style={{ color: "var(--muted)" }}>Audio playback is not supported in this browser. Use Chrome or Edge, or read the transcript.</p>;
  }

  const locked = singlePlay && plays >= 1 && !playing;
  return (
    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", margin: "0.5rem 0 1rem" }}>
      {playing ? (
        <button type="button" onClick={stop}>
          Stop
        </button>
      ) : (
        <button type="button" onClick={play} disabled={locked}>
          {plays === 0 ? "Play audio" : locked ? "Played once" : "Replay"}
        </button>
      )}
      <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
        {singlePlay ? "This recording plays once, as on the real test." : `Plays: ${plays}`}
      </span>
    </div>
  );
}
