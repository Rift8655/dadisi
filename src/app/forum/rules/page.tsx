"use client"

import Link from "next/link"
import { ArrowLeft, ScrollText, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ForumSidebar } from "@/components/forum/ForumSidebar"

export default function RulesPage() {
  const rules = [
    {
      title: "Be Respectful",
      description: "Treat all community members with respect. No harassment, hate speech, or personal attacks.",
    },
    {
      title: "Stay On Topic",
      description: "Keep discussions relevant to the category. Use appropriate categories for your posts.",
    },
    {
      title: "No Spam",
      description: "Don't post promotional content, advertisements, or repetitive messages.",
    },
    {
      title: "Protect Privacy",
      description: "Don't share personal information about yourself or others without consent.",
    },
    {
      title: "Report Issues",
      description: "If you see rule violations, report them to moderators rather than engaging.",
    },
    {
      title: "Constructive Discussions",
      description: "Contribute meaningfully. Share knowledge, ask questions, and help others.",
    },
  ]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex gap-8">
        <ForumSidebar className="hidden lg:block" />
        
        <main className="flex-1 min-w-0">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/forum">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Forum
            </Link>
          </Button>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <ScrollText className="h-8 w-8 text-primary" />
                Community Guidelines
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">
                Please follow these rules to keep our community welcoming and productive.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {rules.map((rule, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      {rule.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{rule.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-6">
                <p className="text-sm text-center">
                  Violations may result in warnings, temporary suspension, or permanent bans.
                  <br />
                  <span className="text-muted-foreground">
                    Contact moderators if you have questions about these guidelines.
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
