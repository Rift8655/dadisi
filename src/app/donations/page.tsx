import { DonationsClient } from "@/components/donations-client"
import { PageShell } from "@/components/page-shell"
import { CampaignsSection } from "@/components/campaigns-section"

export const metadata = {
  title: "Donations",
  description: "Support Dadisi Community Labs through our campaigns or make a general donation",
}

export default function DonationsPage() {
  return (
    <PageShell title="Donations">
      <div className="space-y-12">
        {/* Campaigns Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Support Our Campaigns
            </h2>
            <p className="text-muted-foreground mt-1">
              Choose a cause that resonates with you and make a targeted impact.
            </p>
          </div>
          <CampaignsSection />
        </section>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-4 text-muted-foreground">
              Or make a general donation
            </span>
          </div>
        </div>

        {/* General Donations Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">
              Make a General Donation
            </h2>
            <p className="text-muted-foreground mt-1 max-w-2xl">
              Support our mission to expand access to science across Kenya without specifying a campaign.
            </p>
          </div>
          <DonationsClient />
        </section>
      </div>
    </PageShell>
  )
}
