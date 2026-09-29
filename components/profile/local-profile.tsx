"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Code2, ShieldCheck } from "lucide-react";
import { domains, topicById, topics } from "@/content";
import { practiceById } from "@/content/practice/problems";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { usePractice } from "@/hooks/use-practice";
import { practiceStatus } from "@/lib/practice/progress";

export function LocalProfile() {
  const { locale, t } = useI18n();
  const { progress, learningEvents } = useAtlas();
  const { state, ready } = usePractice();
  const completedTopics = topics.filter((topic) => progress[topic.id] === "completed").length;
  const solvedProblems = ready ? Array.from(practiceById.values()).filter((problem) => practiceStatus(problem, state) === "passed").length : 0;
  const nextTopics = domains.flatMap((domain) => domain.topicIds).map((id) => topicById.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic)).filter((topic) => progress[topic.id] !== "completed" && topic.prerequisiteIds.every((id) => progress[id] === "completed")).slice(0, 4);
  const recent = learningEvents.toReversed().slice(0, 6);

  return <><section className="profile-privacy"><ShieldCheck size={18} /><span>{t("profile.private")}</span></section><section className="profile-metrics"><div><BookOpenCheck size={18} /><strong>{completedTopics}</strong><span>{t("profile.completedTopics")}</span></div><div><Code2 size={18} /><strong>{solvedProblems}</strong><span>{t("profile.publicProblems")}</span></div><div><ShieldCheck size={18} /><strong>{learningEvents.length}</strong><span>{t("profile.evidence")}</span></div></section><div className="profile-layout"><section><h2>{t("profile.next")}</h2>{nextTopics.length ? <div className="topic-list">{nextTopics.map((topic) => <Link className="topic-row" href={`/learn/${topic.slug}`} key={topic.id}><span>{topic.title}</span><ArrowRight size={14} /></Link>)}</div> : <p>{t("progress.mapReadyBody")}</p>}</section><section><h2>{t("profile.recent")}</h2>{recent.length ? <ul className="activity-list">{recent.map((event) => <li key={event.id}><span>{event.type.replaceAll("-", " ")}</span><small>{new Date(event.occurredAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</small></li>)}</ul> : <p>{t("profile.noActivity")}</p>}</section></div></>;
}
