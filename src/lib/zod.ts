import { ZodError } from "zod"

// Convert a ZodError to a simple field->message map usable by forms
export function mapZodErrorToFieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (err instanceof ZodError) {
    for (const issue of err.issues) {
      // use the first path segment as the field name
      const field = issue.path && issue.path.length ? String(issue.path[0]) : "_error"
      // only keep the first message per field
      if (!out[field]) out[field] = issue.message
    }
  }
  return out
}
