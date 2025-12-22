"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Check, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface TaxonomyItem {
  id: number
  name: string
}

interface TaxonomySelectorProps {
  title: string
  items: TaxonomyItem[]
  selectedIds: number[]
  onToggle: (id: number) => void
  onCreate: (name: string) => Promise<void>
  placeholder?: string
  loading?: boolean
  creating?: boolean
  type?: "category" | "tag"
}

export function TaxonomySelector({
  title,
  items,
  selectedIds,
  onToggle,
  onCreate,
  placeholder = "Search...",
  loading = false,
  creating = false,
  type = "category",
}: TaxonomySelectorProps) {
  const [search, setSearch] = useState("")
  const [showAddInput, setShowAddInput] = useState(false)
  const [newName, setNewName] = useState("")
  const [flash, setFlash] = useState(false)

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const lowerSearch = search.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(lowerSearch))
  }, [items, search])

  const exactMatch = useMemo(() => {
    const lowerSearch = search.trim().toLowerCase()
    return items.find((item) => item.name.toLowerCase() === lowerSearch)
  }, [items, search])

  const handleCreate = async (name: string) => {
    if (name.trim() && !creating) {
      try {
        await onCreate(name.trim())
        setNewName("")
        setShowAddInput(false)
        setSearch("")
        // Show success flash
        setFlash(true)
        setTimeout(() => setFlash(false), 500)
      } catch (error) {
        console.error("Failed to create:", error)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && search.trim() && !exactMatch) {
      e.preventDefault()
      handleCreate(search.trim())
    }
  }

  const handleAddKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newName.trim()) {
      e.preventDefault()
      handleCreate(newName.trim())
    }
    if (e.key === "Escape") {
      setShowAddInput(false)
      setNewName("")
    }
  }

  return (
    <div className={cn("space-y-3 transition-all", flash && "ring-2 ring-green-500 ring-offset-2 rounded-lg")}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowAddInput(!showAddInput)}
            disabled={creating}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
        </div>
      </div>

      {/* Quick Add Input */}
      {showAddInput && (
        <div className="flex gap-2 p-2 bg-muted/50 rounded-md border border-dashed">
          <Input
            placeholder={`New ${type} name...`}
            className="h-8 text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleAddKeyDown}
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            className="h-8 px-3"
            onClick={() => handleCreate(newName)}
            disabled={creating || !newName.trim()}
          >
            {creating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Create"
            )}
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-9 h-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <ScrollArea className={cn("pr-3", type === "category" ? "h-48" : "h-32")}>
        {type === "category" ? (
          <div className="space-y-1">
            {filteredItems.length === 0 && !search.trim() ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No {title.toLowerCase()} found</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2 text-center">No match found</p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer hover:bg-muted p-1.5 rounded transition-colors group",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <div className={cn(
                        "h-4 w-4 rounded-sm border border-primary flex items-center justify-center transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "group-hover:border-primary/70"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onToggle(item.id)}
                    />
                    <span className="text-sm select-none">{item.name}</span>
                  </label>
                )
              })
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {filteredItems.length === 0 && !search.trim() ? (
              <p className="text-sm text-muted-foreground w-full py-2 text-center">No {title.toLowerCase()} found</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-sm text-muted-foreground w-full py-2 text-center">No match found</p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <Badge
                    key={item.id}
                    variant={isSelected ? "default" : undefined}
                    className={cn(
                      "cursor-pointer transition-all",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    onClick={() => onToggle(item.id)}
                  >
                    {item.name}
                  </Badge>
                )
              })
            )}
          </div>
        )}
      </ScrollArea>

      {/* Inline create from search */}
      {search.trim() && !exactMatch && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs h-8 border-dashed hover:bg-primary/10"
          onClick={() => handleCreate(search.trim())}
          disabled={creating}
        >
          {creating ? (
            <Loader2 className="h-3 w-3 animate-spin mr-2" />
          ) : (
            <Plus className="h-3 w-3 mr-2" />
          )}
          Add &quot;{search}&quot; as new {type}
        </Button>
      )}
    </div>
  )
}
