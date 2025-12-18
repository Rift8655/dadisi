import { DonationsClient } from "@/components/donations-client"
import { PageShell } from "@/components/page-shell"

export const metadata = {
  title: "Donations",
  description: "Support Dadisi Community Labs",
}

export default function DonationsPage() {
  return (
    <PageShell title="Donations">
      <div className="space-y-8">
        <div>
          <p className="mb-8 max-w-2xl text-muted-foreground">
            Support our mission to expand access to science across Kenya.
          </p>
        </div>
        <DonationsClient />
      </div>
    </PageShell>
  )
}
