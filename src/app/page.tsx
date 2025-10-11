import Link from "next/link"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ModeToggle } from "@/components/mode-toggle"

import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="container grid gap-6 py-16 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col justify-center space-y-4 text-center md:text-left">
            <h1 className="text-4xl font-bold sm:text-5xl">Discovering together</h1>
            <p className="text-muted-foreground">
              Dadisi Community Labs is revolutionizing science in Kenya by removing obstacles to STEM engagement and providing inclusive research and learning spaces.
            </p>
            <div className="flex justify-center gap-2 md:justify-start">
              <Link href="/membership" className={cn(buttonVariants())}>Become a member</Link>
              <Link href="/events" className={cn(buttonVariants({ variant: "outline" }))}>See events</Link>
            </div>
          </div>
          <div className="relative aspect-video w-full">
            <Image src="https://images.unsplash.com/photo-1581092795361-7dca6ae60f78?auto=format&fit=crop&w=1600&q=60" alt="Community lab" fill unoptimized className="rounded-lg object-cover" />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="mb-4 text-2xl font-semibold">Facilities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Wet Lab", img: "https://images.unsplash.com/photo-1581091215367-59ab6b26b488?auto=format&fit=crop&w=1200&q=60" },
            { title: "Dry Lab", img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=60" },
            { title: "Greenhouse", img: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=60" },
            { title: "Mobile Lab", img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=60" },
          ].map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>Available for schools, innovators and citizens.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video w-full">
                  <Image src={f.img} alt={f.title} fill unoptimized className="rounded-md object-cover" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container">
        <h2 className="mb-4 text-2xl font-semibold">Get involved</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Membership", href: "/membership", desc: "Join the community" },
            { title: "Events", href: "/events", desc: "Workshops & seminars" },
            { title: "Blog", href: "/blog", desc: "Stories & updates" },
            { title: "Donations", href: "/donations", desc: "Support our mission" },
          ].map((s) => (
            <Card key={s.title}>
              <CardHeader>
                <CardTitle>{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={s.href} className={cn(buttonVariants({ variant: "link" }))}>
                  Learn more →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
