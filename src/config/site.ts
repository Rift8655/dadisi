import { SiteConfig } from "@/types"

import { env } from "@/env.mjs"

export const siteConfig: SiteConfig = {
  name: "Dadisi Community Labs",
  author: "Dadisi Team",
  description:
    "A non-profit community science lab in Kenya — removing barriers to STEM and providing inclusive research and learning spaces.",
  keywords: [
    "Community Science Lab Kenya",
    "STEM education Nairobi",
    "Citizen Science",
    "Innovation",
    "Education",
  ],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://dadisilabs.org",
  },
  links: {
    github: "https://github.com/",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/logo.png`,
}
