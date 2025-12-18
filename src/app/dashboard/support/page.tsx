"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { UserDashboardShell } from "@/components/user-dashboard-shell"
import { useAuth } from "@/store/auth"

interface SupportCategory {
  id: string
  name: string
  description: string
  icon: string
}

const supportCategories: SupportCategory[] = [
  {
    id: "technical",
    name: "Technical Issue",
    description: "Problems with the website or app",
    icon: "🔧",
  },
  {
    id: "billing",
    name: "Billing & Payments",
    description: "Subscription, donations, or payment issues",
    icon: "💳",
  },
  {
    id: "account",
    name: "Account Help",
    description: "Profile, password, or access issues",
    icon: "👤",
  },
  {
    id: "events",
    name: "Events & RSVPs",
    description: "Questions about events or registrations",
    icon: "📅",
  },
  {
    id: "feedback",
    name: "Feedback & Suggestions",
    description: "Share your ideas for improvement",
    icon: "💡",
  },
  {
    id: "other",
    name: "Other",
    description: "General inquiries",
    icon: "❓",
  },
]

export default function SupportPage() {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !formData.subject.trim() || !formData.message.trim()) return

    setSubmitting(true)
    try {
      // TODO: Call support API
      // await supportApi.createTicket({
      //   category: selectedCategory,
      //   subject: formData.subject,
      //   message: formData.message,
      // })
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      setSubmitted(true)
    } catch (error) {
      console.error("Failed to submit support request:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setSelectedCategory(null)
    setFormData({ subject: "", message: "" })
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <UserDashboardShell title="Support">
        <Card className="max-w-lg mx-auto mt-12">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <svg
                className="h-8 w-8 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold">Request Submitted!</h2>
            <p className="mt-2 text-muted-foreground">
              Thank you for reaching out. Our support team will get back to you within 24-48 hours.
            </p>
            <Button className="mt-6" onClick={resetForm}>
              Submit Another Request
            </Button>
          </CardContent>
        </Card>
      </UserDashboardShell>
    )
  }

  return (
    <UserDashboardShell title="Support">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-medium">How can we help?</h2>
          <p className="text-sm text-muted-foreground">
            Select a category and describe your issue or question.
          </p>
        </div>

        {/* Category Selection */}
        <div>
          <Label className="mb-3 block">Select a Category</Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {supportCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  selectedCategory === category.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        {selectedCategory && (
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Issue</CardTitle>
              <CardDescription>
                Provide as much detail as possible so we can help you faster.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail. Include any relevant information like error messages, steps to reproduce, etc."
                    rows={6}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !formData.subject.trim() || !formData.message.trim()}
                  >
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Quick Help */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Help</CardTitle>
            <CardDescription>Common questions and resources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <a
                href="/faq"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <p className="font-medium">FAQs</p>
                  <p className="text-sm text-muted-foreground">Common questions answered</p>
                </div>
              </a>
              <a
                href="/docs"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <svg
                  className="h-5 w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <div>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-muted-foreground">Guides and tutorials</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Other Ways to Reach Us</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href="mailto:support@dadisilab.com" className="font-medium hover:underline">
                    support@dadisilab.com
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <a href="tel:+254700000000" className="font-medium hover:underline">
                    +254 700 000 000
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-5 w-5 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Response Time</p>
                  <p className="font-medium">24-48 hours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserDashboardShell>
  )
}
