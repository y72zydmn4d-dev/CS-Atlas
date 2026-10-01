"use client";

import { useState } from "react";
import { Check, Clipboard } from "lucide-react";
import { useI18n } from "@/components/locale-provider";

export function CopyCodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  async function copy() {
    try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }
    catch { setCopied(false); }
  }
  return <div className="rich-code"><div className="rich-code-header"><span>{language}</span><button type="button" onClick={() => void copy()} aria-label={t("actions.copy")}>{copied ? <Check size={14} /> : <Clipboard size={14} />}{copied ? t("actions.copied") : t("actions.copy")}</button></div><pre className="code-block"><code>{code}</code></pre></div>;
}
