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
            <Image src="https://source.unsplash.com/featured/?lab,community" alt="Community lab" fill unoptimized className="rounded-lg object-cover" />
          </div>
        </div>
      </section>

      <section className="container">
        <h2 className="mb-4 text-2xl font-semibold">Facilities</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Wet Lab", img: "https://source.unsplash.com/featured/?wet,lab" },
            { title: "Dry Lab", img: "https://source.unsplash.com/featured/?computers,lab" },
            { title: "Greenhouse", img: "https://source.unsplash.com/featured/?greenhouse,plants" },
            { title: "Mobile Lab", img: "https://source.unsplash.com/featured/?mobile,lab" },
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
