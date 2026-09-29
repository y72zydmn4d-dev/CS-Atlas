"use client";

import { useCallback, useEffect, useState } from "react";
import { libraryRepository } from "@/lib/library/repository";
import type { LibraryItem, LibraryQuery } from "@/lib/library/types";

export function useLibraryItems(query?: LibraryQuery) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const type = query?.type; const format = query?.format; const tag = query?.tag; const entityType = query?.entityType; const entityId = query?.entityId;
  const refresh = useCallback(async () => {
    try { setItems(await libraryRepository.list({ type, format, tag, entityType, entityId })); setError(null); }
    catch (value) { setError(value instanceof Error ? value.message : "storage"); }
    finally { setLoading(false); }
  }, [entityId, entityType, format, tag, type]);
  useEffect(() => { queueMicrotask(() => void refresh()); window.addEventListener("cs-atlas:library-changed", refresh); return () => window.removeEventListener("cs-atlas:library-changed", refresh); }, [refresh]);
  return { items, loading, error, refresh };
}
