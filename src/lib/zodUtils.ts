import { ZodError } from "zod"

// Convert a ZodError into a simple field->message map for form UIs
export function mapZodErrorToFieldErrors(err: unknown): Record<string, string> {
  const out: Record<string, string> = {}
  if (err instanceof ZodError) {
    for (const issue of err.issues) {
      const path = issue.path.join(".") || issue.path[0] || ""
      // prefer the provided message; fallback to issue.code
      out[path] = issue.message || issue.code
    }
  }
  return out
}

export default mapZodErrorToFieldErrors

