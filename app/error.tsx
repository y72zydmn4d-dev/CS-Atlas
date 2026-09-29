"use client";

import { useI18n } from "@/components/locale-provider";

export default function ErrorBoundary({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { t } = useI18n();
  return <div className="page route-fallback" role="alert"><h1>{t("error.title")}</h1><p>{t("error.body")}</p><button className="button-primary" type="button" onClick={() => retry()}>{t("error.retry")}</button></div>;
}
