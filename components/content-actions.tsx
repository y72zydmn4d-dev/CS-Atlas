"use client";

import { Bookmark } from "lucide-react";
import { useState } from "react";
import { useAtlas } from "@/components/atlas-provider";
import type { Bookmark as BookmarkType, ProgressStatus } from "@/lib/types";
import type { LearningEvent } from "@/lib/domain/learning";
import { cn } from "@/lib/utils";
import { useI18n } from "@/components/locale-provider";

export function StatusSelect({ id, label = "Learning status", conceptId }: { id: string; label?: string; conceptId?: string }) {
  const { getStatus, setStatus, recordLearningEvent } = useAtlas();
  const { t } = useI18n();
  const value = getStatus(id);
  const [updated, setUpdated] = useState(false);
  const update = (next: ProgressStatus) => {
    setStatus(id, next);
    if (conceptId) {
      recordLearningEvent({
        type: next === "completed" ? "lesson-completed" : "lesson-status-changed",
        conceptId,
        source: "browser-local" as LearningEvent["source"],
      });
    }
    setUpdated(false);
    requestAnimationFrame(() => setUpdated(true));
    window.setTimeout(() => setUpdated(false), 520);
  };
  return (
    <select className={cn("status-select", value, updated && "status-updated")} value={value} onChange={(event) => update(event.target.value as ProgressStatus)} aria-label={label === "Learning status" ? t("status.learning") : label}>
      <option value="not-started">{t("status.notStarted")}</option><option value="in-progress">{t("status.inProgress")}</option><option value="completed">{t("status.completed")}</option>
    </select>
  );
}

export function BookmarkButton({ bookmark }: { bookmark: Omit<BookmarkType, "createdAt"> }) {
  const { isBookmarked, toggleBookmark } = useAtlas();
  const { t } = useI18n();
  const active = isBookmarked(bookmark.id, bookmark.type);
  return <button className={cn("button-secondary", "bookmark-button", active && "active")} onClick={() => toggleBookmark(bookmark)} aria-pressed={active}><Bookmark size={16} fill={active ? "currentColor" : "none"} />{active ? t("actions.saved") : t("actions.bookmark")}</button>;
}
