"use client";

import { useI18n } from "@/components/locale-provider";
import type { ValidationReport } from "@/lib/domain/learn-validation/types";

export function ValidationIssues({ report, stale = false }: { report: ValidationReport; stale?: boolean }) {
  const { t } = useI18n();
  return <div className="studio-validation-issues" data-stale={stale}>
    {(["ERROR", "WARNING", "INFO"] as const).map((severity) => report.counts[severity] > 0 && <section key={severity} aria-label={t(`studio.severity${severity}`)}>
      <h4>{t(`studio.severity${severity}`)} · {report.counts[severity]}</h4>
      <ul>{report.issues.filter((issue) => issue.severity === severity).map((issue, index) => <li key={`${issue.code}:${issue.path}:${index}`}>
        <strong>{issue.code}</strong><p lang="en">{issue.message}</p><code>{issue.path}</code>
        {issue.blockId && <span> · {issue.blockId}</span>}
      </li>)}</ul>
    </section>)}
  </div>;
}
