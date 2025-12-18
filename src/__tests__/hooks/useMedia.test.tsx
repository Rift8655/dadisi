import { renderHook, waitFor } from "@testing-library/react"
import { useMedia, useUploadMedia, useDeleteMedia } from "@/hooks/useMedia"
import { vi, describe, it, expect, beforeEach } from "vitest"
import { mediaApi } from "@/lib/api"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import React from "react"


// Mock the API layer
vi.mock("@/lib/api", () => ({
  mediaApi: {
    list: vi.fn(),
    upload: vi.fn(),
    delete: vi.fn(),
  },
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}


describe("useMedia Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches media list", async () => {
    const mockData = [{ id: 1, file_name: "test.jpg" }]
    ;(mediaApi.list as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(mockData)

    const { result } = renderHook(() => useMedia(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockData)
    expect(mediaApi.list).toHaveBeenCalled()
  })

  it("uploads media", async () => {
    const mockFile = new File(["foo"], "foo.png", { type: "image/png" })
    ;(mediaApi.upload as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ id: 1, file_name: "foo.png" })

    const { result } = renderHook(() => useUploadMedia(), { wrapper: createWrapper() })

    result.current.mutate(mockFile)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mediaApi.upload).toHaveBeenCalled()
  })

  it("deletes media", async () => {
    ;(mediaApi.delete as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({})

    const { result } = renderHook(() => useDeleteMedia(), { wrapper: createWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mediaApi.delete).toHaveBeenCalledWith(1)
  })
})
