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
