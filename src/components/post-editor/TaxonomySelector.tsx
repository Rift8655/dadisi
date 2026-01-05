"use client"

import { useMemo, useState } from "react"
import { Check, Loader2, Plus, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

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
        // Clear search to show all items including the newly created one
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
    <div
      className={cn(
        "space-y-3 transition-all",
        flash && "rounded-lg ring-2 ring-green-500 ring-offset-2"
      )}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          {loading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowAddInput(!showAddInput)}
            disabled={creating}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>
      </div>

      {/* Quick Add Input */}
      {showAddInput && (
        <div className="flex gap-2 rounded-md border border-dashed bg-muted/50 p-2">
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
            {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
          </Button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="h-9 pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <ScrollArea className={cn("pr-3", type === "category" ? "h-48" : "h-32")}>
        {type === "category" ? (
          <div className="space-y-1">
            {filteredItems.length === 0 && !search.trim() ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No {title.toLowerCase()} found
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="py-2 text-center text-sm text-muted-foreground">
                No match found
              </p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <label
                    key={item.id}
                    className={cn(
                      "group flex cursor-pointer items-center gap-2 rounded p-1.5 transition-colors hover:bg-muted",
                      isSelected && "bg-accent/50"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border border-primary transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "group-hover:border-primary/70"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => onToggle(item.id)}
                    />
                    <span className="select-none text-sm">{item.name}</span>
                  </label>
                )
              })
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {filteredItems.length === 0 && !search.trim() ? (
              <p className="w-full py-2 text-center text-sm text-muted-foreground">
                No {title.toLowerCase()} found
              </p>
            ) : filteredItems.length === 0 ? (
              <p className="w-full py-2 text-center text-sm text-muted-foreground">
                No match found
              </p>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id)
                return (
                  <Badge
                    key={item.id}
                    variant={isSelected ? "default" : "secondary"}
                    className={cn(
                      "cursor-pointer select-none transition-all",
                      isSelected
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
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
          className="h-8 w-full border-dashed text-xs hover:bg-primary/10"
          onClick={() => handleCreate(search.trim())}
          disabled={creating}
        >
          {creating ? (
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
          ) : (
            <Plus className="mr-2 h-3 w-3" />
          )}
          Add &quot;{search}&quot; as new {type}
        </Button>
      )}
    </div>
  )
}
