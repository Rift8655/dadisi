import path from "path"
import fs from "fs"
import { DonationsClient } from "@/components/donations-client"

export const metadata = { title: "Donations", description: "Support Dadisi Community Labs" }

function getDonationConfig() {
  const file = path.join(process.cwd(), "public/data/donations.json")
  const raw = fs.readFileSync(file, "utf8")
  return JSON.parse(raw) as { presetAmounts: number[]; currency: string; thankYouMessage: string }
}

export default function DonationsPage() {
  const config = getDonationConfig()
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Donations</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Support our mission to expand access to science across Kenya.
      </p>
      <DonationsClient config={config} />
    </div>
  )
}
