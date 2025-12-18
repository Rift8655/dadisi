"use client"

/**
 * PageShell – A simple full-width layout wrapper for public pages.
 * No sidebar, just a title header and content area.
 */
export function PageShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      <main className="container mx-auto">
        <div className="border-b px-4 py-6 lg:px-6">
          <h1 className="text-2xl font-semibold">{title}</h1>
        </div>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
