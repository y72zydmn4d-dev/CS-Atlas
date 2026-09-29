import { AlertTriangle, CheckCircle2, Clock3, LoaderCircle, OctagonX, Square } from "lucide-react";
import { Message } from "@/components/locale-provider";
import type { JudgeVerdict, SubmissionStatus, SubmissionUsage } from "@/lib/domain/judge";

const statusIcon = {
  queued: Clock3,
  running: LoaderCircle,
  finished: CheckCircle2,
  failed: OctagonX,
  cancelled: Square,
  unavailable: AlertTriangle,
} satisfies Record<SubmissionStatus, typeof Clock3>;

export function JudgeSubmissionStatus({ status, verdict, usage }: { status: SubmissionStatus; verdict?: JudgeVerdict; usage?: SubmissionUsage }) {
  const Icon = statusIcon[status];
  return <section className={`judge-status status-${status}`} aria-live="polite"><Icon size={17} aria-hidden="true" /><div><strong><Message k={`judge.status.${status}`} /></strong>{verdict && <span><Message k={`judge.verdict.${verdict}`} /></span>}{usage && <small>{usage.durationMs !== undefined && <Message k="judge.usage.time" values={{ value: usage.durationMs }} />}{usage.memoryBytes !== undefined && <> · <Message k="judge.usage.memory" values={{ value: usage.memoryBytes }} /></>}</small>}</div></section>;
}
