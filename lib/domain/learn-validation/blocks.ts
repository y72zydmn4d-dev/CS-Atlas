import type { LessonCandidate, ValidationIssue } from "./types";

export function validateLessonBlocks({ lesson, content }: LessonCandidate): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();
  content?.blocks.forEach((block, index) => {
    const path = `content.blocks[${index}]`;
    const add = (code: string, field: string, message: string, severity: ValidationIssue["severity"] = "ERROR") => issues.push({ code, severity, message, path: `${path}${field ? `.${field}` : ""}`, blockId: block.id, blockIndex: index, entityId: lesson.id });
    const required = (value: string, field: string) => { if (!value.trim()) add("BLOCK_CONTENT_EMPTY", field, "Required block content is empty.", lesson.status === "COMPLETE" ? "ERROR" : "WARNING"); };
    const items = (values: Array<{ en: string }>, field: string) => {
      if (!values.length) add("BLOCK_CONTENT_EMPTY", field, "This collection is empty.", lesson.status === "COMPLETE" ? "ERROR" : "WARNING");
      values.forEach((item, offset) => required(item.en, `${field}[${offset}].en`));
    };
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(block.id)) add("BLOCK_ID_INVALID", "id", "Block ID must be stable kebab-case.");
    if (seen.has(block.id)) add("DUPLICATE_BLOCK_ID", "id", "Block IDs must be unique within the body.");
    seen.add(block.id);
    switch (block.type) {
      case "paragraph": case "callout": required(block.body.en, "body.en"); break;
      case "definition": required(block.term, "term"); required(block.body.en, "body.en"); break;
      case "heading": required(block.text.en, "text.en"); break;
      case "objectives": case "list": {
        items(block.items, "items");
        if (block.type === "objectives") {
          const objectives = new Set<string>();
          block.items.forEach((item, offset) => { const text = item.en.trim(); if (text && objectives.has(text)) add("DUPLICATE_OBJECTIVE", `items[${offset}]`, "Exact duplicate objective.", "WARNING"); objectives.add(text); });
        }
        break;
      }
      case "code": case "syntax":
        if (!/^[a-zA-Z0-9][a-zA-Z0-9+#._-]*$/.test(block.language)) add("CODE_LANGUAGE_INVALID", "language", "Expected a nonempty syntax-language token. This is not an execution capability.");
        required(block.code, "code"); break;
      case "output": required(block.output, "output"); break;
      case "complexity": required(block.time, "time"); required(block.space, "space"); required(block.body.en, "body.en"); break;
      case "table": case "comparison":
        if (!block.columns.length) add("TABLE_COLUMNS_REQUIRED", "columns", "A table needs at least one column.");
        items(block.columns, "columns");
        block.rows.forEach((row, offset) => {
          const values = Array.isArray(row) ? row : row.values;
          if (values.length !== block.columns.length) add("TABLE_ROW_WIDTH_INVALID", `rows[${offset}]`, "Row width must match the column count.");
          if (!Array.isArray(row)) required(row.label.en, `rows[${offset}].label.en`);
        });
        if (!block.rows.length) add("TABLE_ROWS_EMPTY", "rows", "This table has no rows.", "WARNING");
        break;
      case "example": case "exercise": case "references": case "related": break; // Registry layer owns required IDs.
    }
  });
  return issues;
}
