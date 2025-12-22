"use client"

import { useEffect, useState } from "react"
import { useBlogStore } from "@/store/blog"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

export function BlogSearch() {
  const { searchQuery, setSearchQuery } = useBlogStore()
  const [localValue, setLocalValue] = useState(searchQuery)
  const debouncedValue = useDebounce(localValue, 300)

  // Sync debounced value to store
  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  // Sync store to local on external reset
  useEffect(() => {
    if (searchQuery === "" && localValue !== "") {
      setLocalValue("")
    }
  }, [searchQuery])

  const handleClear = () => {
    setLocalValue("")
    setSearchQuery("")
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search posts..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
