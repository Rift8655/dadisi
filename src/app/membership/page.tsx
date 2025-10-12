import fs from "fs"
import path from "path"
import fs from "fs"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
  title: "Membership",
  description: "Join Dadisi Community Labs",
}

function getMemberships() {
  const file = path.join(process.cwd(), "public/data/memberships.json")
  const raw = fs.readFileSync(file, "utf8")
  return JSON.parse(raw) as Array<{
    id: number
    name: string
    price: string
    description: string
    features: string[]
  }>
}

export default function MembershipPage() {
  const memberships = getMemberships()
  return (
    <div className="container py-10">
      <h1 className="mb-6 text-3xl font-bold">Membership</h1>
      <p className="mb-8 max-w-2xl text-muted-foreground">
        Choose a plan that fits you or your organization.
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {memberships.map((m) => (
          <Card key={m.id}>
            <CardHeader>
              <CardTitle>{m.name}</CardTitle>
              <CardDescription>{m.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-2xl font-semibold">{m.price}</div>
              <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {m.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Link href="#" className={buttonVariants()}>Select</Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
