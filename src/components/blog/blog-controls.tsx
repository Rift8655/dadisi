"use client"

import { useBlogStore, BlogViewType } from "@/store/blog"
import { LayoutGrid, List, Columns3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const viewOptions: { value: BlogViewType; icon: React.ReactNode; label: string }[] = [
  { value: "grid", icon: <LayoutGrid className="h-4 w-4" />, label: "Grid" },
  { value: "list", icon: <List className="h-4 w-4" />, label: "List" },
  { value: "masonry", icon: <Columns3 className="h-4 w-4" />, label: "Masonry" },
]

const perPageOptions = [6, 12, 24, 48]

export function BlogControls() {
  const { viewType, setViewType, perPage, setPerPage } = useBlogStore()

  return (
    <div className="flex items-center gap-4">
      {/* View Switcher */}
      <div className="flex items-center gap-1 rounded-md border p-1">
        {viewOptions.map((opt) => (
          <Button
            key={opt.value}
            variant={viewType === opt.value ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewType(opt.value)}
            title={opt.label}
          >
            {opt.icon}
          </Button>
        ))}
      </div>

      {/* Posts per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Show:</span>
        <Select
          value={String(perPage)}
          onValueChange={(val) => setPerPage(Number(val))}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {perPageOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
