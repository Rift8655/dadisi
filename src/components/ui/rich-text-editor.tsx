"use client"

import { useRef, useMemo } from "react"
import dynamic from "next/dynamic"
import { Editor as TinyMCEEditorComponent } from "@tinymce/tinymce-react"
import { DevEditor } from "@/components/post-editor/DevEditor"

// Check if we should use dev editor (for local development without TinyMCE domain registration)
const USE_DEV_EDITOR = process.env.NEXT_PUBLIC_USE_DEV_EDITOR === "true"

interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  height?: number
  disabled?: boolean
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  height = 400,
  disabled = false,
}: RichTextEditorProps) {
  const editorRef = useRef(null)

  // Render the appropriate editor based on environment
  if (USE_DEV_EDITOR) {
    return (
      <DevEditor
        value={value}
        onChange={onChange}
        height={height}
      />
    )
  }

  return (
    <div className="rounded-md border border-input bg-background">
      <TinyMCEEditorComponent
        apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY || "no-api-key"}
        onInit={(evt: any, editor: any) => {
          editorRef.current = editor
        }}
        value={value}
        onEditorChange={(content: any) => onChange(content)}
        disabled={disabled}
        init={{
          height: height,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | bold italic underline strikethrough | link image media table | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
          content_style: `
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #333;
            }
          `,
          skin: "oxide",
          content_css: "default",
          placeholder: placeholder,
          automatic_uploads: false,
          file_picker_types: "image media",
          branding: false,
          statusbar: true,
        }}
      />
    </div>
  )
}
