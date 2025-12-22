"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function Footer() {
  const pathname = usePathname()

  // Hide footer on dashboard and admin pages
  const isDashboard = pathname === "/admin" || pathname.startsWith("/admin/") ||
                      pathname === "/dashboard" || pathname.startsWith("/dashboard/")

  if (isDashboard) return null

  return (
    <footer className="border-t">
      <div className="container grid gap-4 py-8 text-sm sm:grid-cols-3">
        <div>
          <h3 className="mb-2 font-semibold">Dadisi Community Labs</h3>
          <p className="text-muted-foreground">
            Discovering together. Inclusive labs and programs for Kenya.
          </p>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Contact</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>Nairobi, Kenya</li>
            <li>
              <a href="mailto:info@dadisilabs.org" className="hover:underline">
                info@dadisilabs.org
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold">Social</h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>
              <Link href="#" className="hover:underline">
                Twitter/X
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:underline">
                GitHub
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Dadisi Community Labs
      </div>
    </footer>
  )
}
