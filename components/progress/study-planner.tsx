"use client";

import Link from "next/link";
import { Archive, CalendarDays, CheckCircle2, ListChecks, Plus, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import { useI18n } from "@/components/locale-provider";
import { lessonById } from "@/content/lessons";
import { topics } from "@/content/topics";
import { canonicalConceptIdForTopic } from "@/content/concepts/registry";
import { deriveGoalProgress, type GoalMetric, type GoalRecurrence, type StudyPlanItem } from "@/lib/domain/learning";
import { localizeTopic } from "@/i18n/content";

const metrics: GoalMetric[] = ["lessons-completed", "exercises-solved", "problems-solved", "plan-items-completed"];

function localDate() {
  const current = new Date();
  const month = String(current.getMonth() + 1).padStart(2, "0");
  const day = String(current.getDate()).padStart(2, "0");
  return `${current.getFullYear()}-${month}-${day}`;
}

export function StudyPlanner({ compact = false }: { compact?: boolean }) {
  const { locale, t } = useI18n();
  const { learningEvents, learningGoals, studyPlans, createLearningGoal, archiveLearningGoal, createStudyPlan, completeStudyPlanItem, rescheduleStudyPlanItem } = useAtlas();
  const [goalTitle, setGoalTitle] = useState("");
  const [goalMetric, setGoalMetric] = useState<GoalMetric>("lessons-completed");
  const [goalTarget, setGoalTarget] = useState("3");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalRecurrence, setGoalRecurrence] = useState<GoalRecurrence>("none");
  const [planTitle, setPlanTitle] = useState("");
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [scheduledFor, setScheduledFor] = useState(localDate());
  const [saveFailed, setSaveFailed] = useState(false);
  const today = localDate();
  const activeGoals = learningGoals.filter((goal) => goal.status === "active");
  const activePlans = studyPlans.filter((plan) => plan.status === "active");
  const todayItems = useMemo(() => activePlans.flatMap((plan) => plan.items.filter((item) => item.scheduledFor === today && !item.completedAt).map((item) => ({ plan, item }))), [activePlans, today]);

  const addGoal = () => {
    const targetCount = Number(goalTarget);
    const saved = createLearningGoal({ title: goalTitle, metric: goalMetric, targetCount, deadline: goalDeadline || undefined, recurrence: goalRecurrence });
    setSaveFailed(!saved);
    if (saved) { setGoalTitle(""); setGoalTarget("3"); setGoalDeadline(""); setGoalRecurrence("none"); }
  };

  const addPlan = () => {
    const topic = topics.find((candidate) => candidate.id === topicId);
    const lesson = topic ? lessonById.get(`lesson:${topic.id}`) : null;
    if (!topic || !lesson) { setSaveFailed(true); return; }
    const item: StudyPlanItem = {
      id: `plan-item-${topic.id}-${Date.now()}`,
      target: { type: "lesson", id: lesson.id },
      conceptId: canonicalConceptIdForTopic(topic.id),
      title: localizeTopic(topic, locale).title,
      href: lesson.href,
      scheduledFor: scheduledFor || undefined,
    };
    const saved = createStudyPlan({ title: planTitle || localizeTopic(topic, locale).title, items: [item] });
    setSaveFailed(!saved);
    if (saved) setPlanTitle("");
  };

  const complete = (planId: string, itemId: string) => setSaveFailed(!completeStudyPlanItem(planId, itemId));
  const reschedule = (planId: string, itemId: string, date: string) => setSaveFailed(!rescheduleStudyPlanItem(planId, itemId, date));

  return <section className={compact ? "study-planner compact" : "study-planner"} aria-labelledby="study-planner-title">
    {!compact && <header className="planner-heading"><div><p className="kicker">{t("planner.localOnly")}</p><h2 id="study-planner-title">{t("planner.title")}</h2><p>{t("planner.lede")}</p></div></header>}
    <section className="planner-today" aria-labelledby="planner-today-title">
      <div className="panel-header"><h3 id="planner-today-title"><CalendarDays size={17} />{t("planner.today")}</h3><span className="planner-local">{t("planner.localOnly")}</span></div>
      {todayItems.length ? <ul className="planner-items">{todayItems.map(({ plan, item }) => <li key={`${plan.id}:${item.id}`}><Link href={item.href}>{item.title}</Link><button className="button-secondary" onClick={() => complete(plan.id, item.id)}><CheckCircle2 size={14} />{t("planner.complete")}</button></li>)}</ul> : <p>{t("planner.noToday")}</p>}
    </section>
    {!compact && <div className="planner-grid">
      <section className="planner-section" aria-labelledby="planner-goals-title"><div className="panel-header"><h3 id="planner-goals-title"><Target size={17} />{t("planner.goals")}</h3></div>
        {activeGoals.length ? <ul className="goal-list">{activeGoals.map((goal) => { const progress = deriveGoalProgress(goal, learningEvents); return <li key={goal.id}><div><strong>{goal.title}</strong><small>{t(`planner.${goal.metric === "lessons-completed" ? "lessons" : goal.metric === "exercises-solved" ? "exercises" : goal.metric === "problems-solved" ? "problems" : "planItems"}`)} · {progress.completedCount}/{progress.targetCount}{goal.recurrence && goal.recurrence !== "none" ? ` · ${t(`planner.${goal.recurrence}`)}` : ""}{goal.deadline ? ` · ${goal.deadline}` : ""}</small><div className="progress-track"><span style={{ width: `${progress.percent}%` }} /></div></div><button className="icon-button" title={t("planner.archive")} aria-label={t("planner.archive")} onClick={() => setSaveFailed(!archiveLearningGoal(goal.id))}><Archive size={15} /></button></li>; })}</ul> : <p>{t("planner.noGoals")}</p>}
        <div className="planner-form"><label className="form-field"><span>{t("planner.goalTitle")}</span><input value={goalTitle} maxLength={160} onChange={(event) => setGoalTitle(event.target.value)} /></label><label className="form-field"><span>{t("planner.metric")}</span><select value={goalMetric} onChange={(event) => setGoalMetric(event.target.value as GoalMetric)}>{metrics.map((metric) => <option key={metric} value={metric}>{t(`planner.${metric === "lessons-completed" ? "lessons" : metric === "exercises-solved" ? "exercises" : metric === "problems-solved" ? "problems" : "planItems"}`)}</option>)}</select></label><label className="form-field"><span>{t("planner.goalTarget")}</span><input type="number" min="1" max="999" value={goalTarget} onChange={(event) => setGoalTarget(event.target.value)} /></label><label className="form-field"><span>{t("planner.recurrence")}</span><select value={goalRecurrence} onChange={(event) => setGoalRecurrence(event.target.value as GoalRecurrence)}><option value="none">{t("planner.oneTime")}</option><option value="weekly">{t("planner.weekly")}</option><option value="monthly">{t("planner.monthly")}</option></select></label><label className="form-field"><span>{t("planner.deadline")}</span><input type="date" value={goalDeadline} onChange={(event) => setGoalDeadline(event.target.value)} /></label><button className="button-secondary" type="button" onClick={addGoal}><Plus size={15} />{t("planner.addGoal")}</button></div>
      </section>
      <section className="planner-section" aria-labelledby="planner-plans-title"><div className="panel-header"><h3 id="planner-plans-title"><ListChecks size={17} />{t("planner.studyPlans")}</h3></div>
        {activePlans.length ? <ul className="plan-list">{activePlans.flatMap((plan) => plan.items.map((item) => <li key={`${plan.id}:${item.id}`}><div><strong>{plan.title}</strong><Link href={item.href}>{item.title}</Link><small>{item.completedAt ? t("planner.completed") : item.scheduledFor ?? t("planner.noToday")}</small></div>{item.completedAt ? <CheckCircle2 className="complete-icon" size={17} /> : <div className="plan-item-actions"><label><span className="sr-only">{t("planner.reschedule")}</span><input type="date" value={item.scheduledFor ?? ""} onChange={(event) => reschedule(plan.id, item.id, event.target.value)} /></label><button className="icon-button" title={t("planner.complete")} aria-label={t("planner.complete")} onClick={() => complete(plan.id, item.id)}><CheckCircle2 size={16} /></button></div>}</li>))}</ul> : <p>{t("planner.noPlans")}</p>}
        <div className="planner-form"><label className="form-field"><span>{t("planner.planTitle")}</span><input value={planTitle} maxLength={160} onChange={(event) => setPlanTitle(event.target.value)} /></label><label className="form-field"><span>{t("planner.lesson")}</span><select value={topicId} onChange={(event) => setTopicId(event.target.value)}>{topics.map((topic) => <option key={topic.id} value={topic.id}>{localizeTopic(topic, locale).title}</option>)}</select></label><label className="form-field"><span>{t("planner.schedule")}</span><input type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></label><button className="button-secondary" type="button" onClick={addPlan}><Plus size={15} />{t("planner.createPlan")}</button></div>
      </section>
    </div>}
    {saveFailed && <p className="form-error" role="alert">{t("planner.saveFailed")}</p>}
  </section>;
}
