"use client";

import { useState } from "react";
import { useI18n } from "@/components/locale-provider";
import { ContentBlockEditor } from "@/components/studio/content-block-editor";
import type { LearnLessonBlock } from "@/lib/domain/learn-platform";
import type { Locale } from "@/lib/types";
import { createDraftBlock, duplicateDraftBlock, editableBlockTypes, moveItem, type EditableBlockType } from "@/lib/studio/draft";

export function ContentBlockList({ blocks, language, onChange }: { blocks: LearnLessonBlock[]; language: Locale; onChange: (blocks: LearnLessonBlock[]) => void }) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [type, setType] = useState<EditableBlockType>("paragraph");
  return <section className="studio-editor-section" aria-label={t("studio.contentBlocks")}>
    <h3>{t("studio.contentBlocks")} · {blocks.length}</h3>
    <ol className="studio-block-list">{blocks.map((block, index) => <li key={block.id} className="studio-editor-block">
      <header className="studio-block-toolbar">
        <button type="button" aria-expanded={!collapsed.has(block.id)} aria-controls={`studio-block-${block.id}`} aria-label={`${t("studio.toggleBlock")} · ${block.id}`}
          onClick={() => setCollapsed((current) => { const next = new Set(current); if (next.has(block.id)) next.delete(block.id); else next.add(block.id); return next; })}>
          {collapsed.has(block.id) ? "▸" : "▾"} {index + 1}. {block.type}
        </button>
        <code>{block.id}</code>
        <div className="studio-actions">
          <button type="button" aria-label={`${t("studio.moveUp")} · ${block.id}`} disabled={index === 0} onClick={() => onChange(moveItem(blocks, index, index - 1))}>↑</button>
          <button type="button" aria-label={`${t("studio.moveDown")} · ${block.id}`} disabled={index === blocks.length - 1} onClick={() => onChange(moveItem(blocks, index, index + 1))}>↓</button>
          <button type="button" aria-label={`${t("studio.duplicate")} · ${block.id}`} onClick={() => onChange([...blocks.slice(0, index + 1), duplicateDraftBlock(block, blocks), ...blocks.slice(index + 1)])}>{t("studio.duplicate")}</button>
          <button type="button" aria-label={`${t("studio.remove")} · ${block.id}`} onClick={() => {
            setCollapsed((current) => { const next = new Set(current); next.delete(block.id); return next; });
            onChange(blocks.filter((_, position) => position !== index));
          }}>{t("studio.remove")}</button>
        </div>
      </header>
      <div id={`studio-block-${block.id}`} hidden={collapsed.has(block.id)}><ContentBlockEditor block={block} language={language} onChange={(value) => onChange(blocks.map((entry, position) => position === index ? value : entry))} /></div>
    </li>)}</ol>
    <div className="studio-add-block">
      <label className="studio-field">{t("studio.blockType")}<select value={type} onChange={(event) => {
        const selected = editableBlockTypes.find((entry) => entry === event.target.value); if (selected) setType(selected);
      }}>{editableBlockTypes.map((value) => <option key={value}>{value}</option>)}</select></label>
      <button type="button" onClick={() => onChange([...blocks, createDraftBlock(type, blocks)])}>{t("studio.addBlock")}</button>
    </div>
    <p className="studio-body-meta">{t("studio.relationshipsDeferred")}</p>
  </section>;
}
