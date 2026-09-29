"use client";
import { useEffect, useState } from "react";
import { storage } from "@/lib/storage";
import { emptyPracticeState } from "@/lib/practice/validation";
export function usePractice() {
  const [state, setState] = useState(emptyPracticeState);
  const [ready, setReady] = useState(false);
  const [recovered, setRecovered] = useState(false);
  useEffect(() => {
    const read = () => { const loaded = storage.loadPractice(); setState(loaded.state); setRecovered(loaded.recovered); setReady(true); };
    read(); window.addEventListener("storage", read); window.addEventListener("cs-atlas-practice", read);
    return () => { window.removeEventListener("storage", read); window.removeEventListener("cs-atlas-practice", read); };
  }, []);
  return { state, ready, recovered };
}
