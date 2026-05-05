export type ParsedPipeTag = {
  teks_code: string;
  skill_description: string;
  standard_type: string;
  priority: string;
  complexity: string;
};

export function parsePipeTag(rawTag: string): ParsedPipeTag {
  const [
    teks_code = "",
    skill_description = "",
    standard_type = "",
    priority = "",
    complexity = "",
  ] = rawTag.split("|").map((part) => part.trim());

  return {
    teks_code,
    skill_description,
    standard_type,
    priority,
    complexity,
  };
}

export function buildPipeTag(tag: ParsedPipeTag) {
  return [tag.teks_code, tag.skill_description, tag.standard_type, tag.priority, tag.complexity].filter(Boolean).join(" | ");
}

export function parsedTagFromRow(row: Record<string, string>): ParsedPipeTag {
  const rawTag = row.raw_tag || row.pipe_tag || row.tag || "";
  const parsed = rawTag ? parsePipeTag(rawTag) : {
    teks_code: "",
    skill_description: "",
    standard_type: "",
    priority: "",
    complexity: "",
  };

  return {
    teks_code: row.teks_code?.trim() || row.teks?.trim() || parsed.teks_code,
    skill_description: row.skill_description?.trim() || row.description?.trim() || row.skill?.trim() || parsed.skill_description,
    standard_type: row.standard_type?.trim() || row.readiness_type?.trim() || parsed.standard_type,
    priority: row.priority?.trim() || parsed.priority,
    complexity: row.complexity?.trim() || parsed.complexity,
  };
}

export function problemIdFromRow(row: Record<string, string>) {
  return (row.mom_question_id || row.myopenmath_question_id || row.problem_id || row.question_id || "").trim();
}
