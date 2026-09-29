import type { Locale } from "@/lib/types";
import { en } from "@/i18n/messages/en";
import { vi } from "@/i18n/messages/vi";

export type MessageKey = keyof typeof en;
export type MessageValues = Record<string, string | number>;

const registries = { en, vi } as const;

export function getMessage(locale: Locale, key: MessageKey, values: MessageValues = {}): string {
  let message: string = registries[locale][key] ?? en[key];
  for (const [name, value] of Object.entries(values)) {
    message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}
