import { describe, it, expect } from "vitest"
import { cn, formatDate } from "@/lib/utils"

describe("utils", () => {
  describe("cn", () => {
    it("merges classes correctly", () => {
      expect(cn("c1", "c2")).toBe("c1 c2")
    })

    it("handles conditional classes", () => {
      expect(cn("c1", true && "c2", false && "c3")).toBe("c1 c2")
    })

    it("merges tailwind classes cleanly", () => {
      // tailwind-merge should resolve conflicts
      expect(cn("p-4", "p-2")).toBe("p-2")
    })
  })

  describe("formatDate", () => {
    it("formats standard date string", () => {
      const date = "2023-12-25T10:00:00Z"
      expect(formatDate(date)).toBe("25/12/2023")
    })
    
    it("handles single digit days/months", () => {
      const date = "2023-01-05T00:00:00Z"
      expect(formatDate(date)).toBe("05/01/2023")
    })
  })
})
