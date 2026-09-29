import type { Domain, Locale, Topic } from "@/lib/types";
import { domainTranslationsVi, topicTranslationsVi } from "@/content/translations/vi";
import { domains } from "@/content/domains";
import { topics } from "@/content/topics";

export function localizeDomain(domain: Domain, locale: Locale): Domain {
  if (locale === "en") return domain;
  const translated = domainTranslationsVi[domain.id];
  return translated ? { ...domain, ...translated } : domain;
}

export function localizeTopic(topic: Topic, locale: Locale): Topic {
  if (locale === "en") return topic;
  const translated = topicTranslationsVi[topic.id];
  if (!translated) return topic;
  return {
    ...topic,
    title: translated.title,
    summary: translated.summary,
    objectives: translated.objectives ?? topic.objectives,
    glossary: translated.glossary ?? topic.glossary,
    content: translated.content ?? topic.content,
  };
}

export function getTopicTranslationStatus(topicId: string, locale: Locale) {
  if (locale === "en") return null;
  return topicTranslationsVi[topicId]?.status ?? "english-only";
}

export function localizedLabel(label: string, locale: Locale): string {
  if (locale === "en") return label;
  const domain = domains.find((item) => item.name === label || item.shortName === label);
  if (domain) return domainTranslationsVi[domain.id]?.name ?? label;
  const topic = topics.find((item) => item.title === label);
  return topic ? topicTranslationsVi[topic.id]?.title ?? label : label;
}
