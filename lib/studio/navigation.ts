/** Only canonical selections, never filesystem paths. */
export function studioHref(subjectId?: string, lessonId?: string): string {
  const query = new URLSearchParams();
  if (subjectId) query.set("subject", subjectId);
  if (lessonId) query.set("lesson", lessonId);
  return query.size ? `/studio?${query}` : "/studio";
}

export function isStudioSubjectId(value: string): boolean {
  return value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function isStudioLessonId(value: string): boolean {
  return value.length <= 170 && /^learn:[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function matchesStudioQuery(query: string, values: string[]): boolean {
  const normalize = (value: string) => value.toLowerCase().replaceAll("đ", "d").normalize("NFKD").replace(/\p{M}/gu, "");
  const haystack = normalize(values.join(" "));
  return normalize(query).trim().split(/\s+/).every((word) => haystack.includes(word));
}
