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
      <section className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1583911860367-8b9fa77c6f4c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Community lab background"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="container relative z-10 py-24">
          <div className="mx-auto max-w-2xl space-y-4 text-center text-white md:text-left">
            <h1 className="text-4xl font-bold sm:text-5xl">Discovering together</h1>
            <p className="text-white/80">
              Dadisi Community Labs is revolutionizing science in Kenya by removing obstacles to STEM engagement and providing inclusive research and learning spaces.
            </p>
            <div className="flex justify-center gap-2 md:justify-start">
              <Link href="/membership" className={cn(buttonVariants())}>Become a member</Link>
              <Link href="/events" className={cn(buttonVariants({ variant: "outline" }), "text-black hover:text-black dark:text-white dark:hover:text-white")}>See events</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="mb-4 text-2xl font-semibold">Facilities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Wet Lab", img:"https://images.unsplash.com/photo-1580795479025-93d13fd9aa6c?q=80&w=1141&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
            { title: "Dry Lab", img: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=60" },
            {
              title: "Greenhouse", img: "https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"},
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
