"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, Code2, Download, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import { domains, topicById, topics } from "@/content";
import { practiceById } from "@/content/practice/problems";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { usePractice } from "@/hooks/use-practice";
import { practiceStatus } from "@/lib/practice/progress";
import { createAnonymousLocalProfileExport } from "@/lib/profile/local-profile";
import { storage } from "@/lib/storage";

export function LocalProfile() {
  const { locale, t } = useI18n();
  const { progress, learningEvents } = useAtlas();
  const { state, ready } = usePractice();
  const completedTopics = topics.filter((topic) => progress[topic.id] === "completed").length;
  const solvedProblems = ready ? Array.from(practiceById.values()).filter((problem) => practiceStatus(problem, state) === "passed").length : 0;
  const nextTopics = domains.flatMap((domain) => domain.topicIds).map((id) => topicById.get(id)).filter((topic): topic is NonNullable<typeof topic> => Boolean(topic)).filter((topic) => progress[topic.id] !== "completed" && topic.prerequisiteIds.every((id) => progress[id] === "completed")).slice(0, 4);
  const recent = learningEvents.toReversed().slice(0, 6);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteFailed, setDeleteFailed] = useState(false);

  const downloadProfile = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(createAnonymousLocalProfileExport(), null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cs-atlas-local-profile.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const clearLearningData = () => {
    if (!storage.clearLocalLearningData()) { setDeleteFailed(true); return; }
    window.location.reload();
  };

  return <><section className="profile-privacy"><ShieldCheck size={18} /><span>{t("profile.private")}</span></section><section className="profile-metrics"><div><BookOpenCheck size={18} /><strong>{completedTopics}</strong><span>{t("profile.completedTopics")}</span></div><div><Code2 size={18} /><strong>{solvedProblems}</strong><span>{t("profile.publicProblems")}</span></div><div><ShieldCheck size={18} /><strong>{learningEvents.length}</strong><span>{t("profile.evidence")}</span></div></section><div className="profile-layout"><section><h2>{t("profile.next")}</h2>{nextTopics.length ? <div className="topic-list">{nextTopics.map((topic) => <Link className="topic-row" href={`/learn/${topic.slug}`} key={topic.id}><span>{topic.title}</span><ArrowRight size={14} /></Link>)}</div> : <p>{t("progress.mapReadyBody")}</p>}</section><section><h2>{t("profile.recent")}</h2>{recent.length ? <ul className="activity-list">{recent.map((event) => <li key={event.id}><span>{event.type.replaceAll("-", " ")}</span><small>{new Date(event.occurredAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}</small></li>)}</ul> : <p>{t("profile.noActivity")}</p>}</section></div><section className="panel stack"><div><h2>{t("profile.dataTitle")}</h2><p>{t("profile.dataBody")}</p></div><div className="form-actions"><Link className="button-secondary" href="/library">{t("profile.libraryData")}</Link><button className="button-secondary" type="button" onClick={downloadProfile}><Download size={15} />{t("profile.export")}</button>{confirmDelete ? <><button className="button-secondary" type="button" onClick={() => setConfirmDelete(false)}>{t("profile.cancelDelete")}</button><button className="button-danger" type="button" onClick={clearLearningData}><Trash2 size={15} />{t("profile.confirmDelete")}</button></> : <button className="button-danger" type="button" onClick={() => setConfirmDelete(true)}><Trash2 size={15} />{t("profile.delete")}</button>}</div>{confirmDelete && <p className="form-notice" role="status">{t("profile.deleteWarning")}</p>}{deleteFailed && <p className="form-error" role="alert">{t("profile.deleteFailed")}</p>}</section></>;
}
