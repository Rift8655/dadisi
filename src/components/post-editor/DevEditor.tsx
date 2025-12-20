"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
} from "lucide-react"

interface DevEditorProps {
  value: string
  onChange: (content: string) => void
  height?: number
}

/**
 * Development-only HTML editor as a fallback when TinyMCE is not available.
 * This is NOT intended for production use - just for local development.
 */
export function DevEditor({ value, onChange, height = 500 }: DevEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertTag = useCallback((openTag: string, closeTag: string = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const beforeText = value.substring(0, start)
    const afterText = value.substring(end)
    
    const newText = `${beforeText}${openTag}${selectedText}${closeTag || openTag.replace("<", "</")}${afterText}`
    onChange(newText)

    // Restore cursor position after React re-render
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + openTag.length + selectedText.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const insertAtCursor = useCallback((text: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const beforeText = value.substring(0, start)
    const afterText = value.substring(start)
    
    onChange(`${beforeText}${text}${afterText}`)

    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + text.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const toolbarButtons = [
    { icon: Bold, title: "Bold", action: () => insertTag("<strong>", "</strong>") },
    { icon: Italic, title: "Italic", action: () => insertTag("<em>", "</em>") },
    { icon: Underline, title: "Underline", action: () => insertTag("<u>", "</u>") },
    { divider: true },
    { icon: Heading1, title: "Heading 1", action: () => insertTag("<h1>", "</h1>") },
    { icon: Heading2, title: "Heading 2", action: () => insertTag("<h2>", "</h2>") },
    { divider: true },
    { icon: List, title: "Bullet List", action: () => insertAtCursor("\n<ul>\n  <li>Item</li>\n</ul>\n") },
    { icon: ListOrdered, title: "Numbered List", action: () => insertAtCursor("\n<ol>\n  <li>Item</li>\n</ol>\n") },
    { divider: true },
    { icon: Link, title: "Link", action: () => insertTag('<a href="#">', "</a>") },
    { icon: Image, title: "Image", action: () => insertAtCursor('<img src="" alt="" />') },
    { divider: true },
    { icon: Code, title: "Code", action: () => insertTag("<code>", "</code>") },
    { icon: Quote, title: "Quote", action: () => insertTag("<blockquote>", "</blockquote>") },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted border-b flex-wrap">
        {toolbarButtons.map((btn, idx) => 
          btn.divider ? (
            <div key={idx} className="w-px h-6 bg-border mx-1" />
          ) : (
            <Button
              key={idx}
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title={btn.title}
              onClick={btn.action}
            >
              {btn.icon && <btn.icon className="h-4 w-4" />}
            </Button>
          )
        )}
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground px-2">
          Dev Editor (HTML)
        </span>
      </div>

      {/* Editor */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-0 rounded-none border-0 focus-visible:ring-0 font-mono text-sm resize-none"
        style={{ height: `${height}px` }}
        placeholder="Write your HTML content here..."
      />

      {/* Preview hint */}
      <div className="p-2 bg-amber-50 dark:bg-amber-950/20 border-t text-xs text-amber-700 dark:text-amber-400">
        ⚠️ Development Editor - This is a simplified HTML editor for local development only.
        TinyMCE will be used in production once the domain is registered.
      </div>
    </div>
  )
}
