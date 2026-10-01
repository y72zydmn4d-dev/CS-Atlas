"use client";

import { useId } from "react";
import type { LocalizedConceptText } from "@/lib/domain/concepts";
import type { Locale } from "@/lib/types";

export function TextField({ label, value, onChange, multiline = false, code = false, type = "text" }: {
  label: string; value: string; onChange: (value: string) => void; multiline?: boolean; code?: boolean; type?: "text" | "date";
}) {
  const id = useId();
  return <label htmlFor={id} className="studio-field">{label}
    {multiline ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} rows={code ? 8 : 3} className={code ? "studio-code-input" : undefined} spellCheck={!code} />
      : <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} />}
  </label>;
}

export function LocalizedField({ label, value, language, onChange, multiline }: {
  label: string; value: LocalizedConceptText; language: Locale; onChange: (value: LocalizedConceptText) => void; multiline?: boolean;
}) {
  return <TextField label={`${label} (${language.toUpperCase()})`} value={value[language]} multiline={multiline}
    onChange={(text) => onChange({ ...value, [language]: text })} />;
}

export function optionalLocalized(value: LocalizedConceptText, original?: LocalizedConceptText): LocalizedConceptText | undefined {
  return value.en === "" && value.vi === "" ? (original?.en === "" && original.vi === "" ? value : undefined) : value;
}
