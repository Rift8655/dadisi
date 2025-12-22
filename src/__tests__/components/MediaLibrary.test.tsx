
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { MediaLibrary } from "@/components/media-library"
import { vi, describe, it, expect, beforeEach } from "vitest"

// Mock the hooks
const mockUploadMutate = vi.fn()
const mockDeleteMutate = vi.fn()

vi.mock("@/hooks/useMedia", () => ({
  useMedia: () => ({
    data: [
      { id: 1, file_name: "test-image.jpg", original_url: "http://example.com/img.jpg", mime_type: "image/jpeg", size: 1024 },
      { id: 2, file_name: "test-doc.pdf", original_url: "http://example.com/doc.pdf", mime_type: "application/pdf", size: 2048 }
    ],
    isLoading: false,
  }),
  useUploadMedia: () => ({
    mutateAsync: mockUploadMutate,
    isPending: false
  }),
  useDeleteMedia: () => ({
    mutateAsync: mockDeleteMutate
  })
}))

// Mock Swal
vi.mock("sweetalert2", () => ({
    default: {
        fire: vi.fn().mockResolvedValue({ isConfirmed: true })
    }
}))

// Mock Next/Image because it doesn't play nice in pure jsdom without setup
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}))

describe("MediaLibrary Component", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("renders media items", () => {
        render(<MediaLibrary />)
        expect(screen.getByText("test-image.jpg")).toBeInTheDocument()
        expect(screen.getByText("test-doc.pdf")).toBeInTheDocument()
    })

    it("displays upload button", () => {
        render(<MediaLibrary />)
        expect(screen.getByText("Upload File")).toBeInTheDocument()
    })

    it("handles delete action", async () => {
        render(<MediaLibrary />)
        // Find delete button - typically an icon button, might need test-id or query by role
        // For simplicity let's assume we can finding it by the trash icon's accessibility presence or just by button role
        // However, the component uses Lucide icons.
        
        // Let's rely on the delete button text/title if available, or just query all buttons
        const deleteButtons = screen.getAllByTitle("Delete")
        fireEvent.click(deleteButtons[0])

        await waitFor(() => {
            expect(mockDeleteMutate).toHaveBeenCalledWith(1)
        })
    })

    it("triggers selection callback when passed", () => {
        const onSelect = vi.fn()
        render(<MediaLibrary onSelect={onSelect} />)

        const selectButtons = screen.getAllByText("Select")
        fireEvent.click(selectButtons[0])

        expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }))
    })
})
