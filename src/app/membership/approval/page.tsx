"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { studentApprovalsApi } from "@/lib/api"
import { showError, showSuccess } from "@/lib/sweetalert"
import { useCountiesQuery } from "@/hooks/useMemberProfileQuery"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageShell } from "@/components/page-shell"

const approvalSchema = z.object({
  student_institution: z.string().min(2, "Institution name is required"),
  student_email: z.string().email("Valid university email is required"),
  documentation_url: z.string().url("Valid documentation URL is required"),
  birth_date: z.string().optional(),
  county: z.string().min(1, "County is required"),
  additional_notes: z.string().optional(),
})

type ApprovalFormValues = z.infer<typeof approvalSchema>

function ApprovalSubmissionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get("plan_id")
  const [submitting, setSubmitting] = useState(false)

  const { data: countiesData, isLoading: loadingCounties } = useCountiesQuery()

  const form = useForm<ApprovalFormValues>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      student_institution: "",
      student_email: "",
      documentation_url: "",
      birth_date: "",
      county: "",
      additional_notes: "",
    },
  })

  const onSubmit = async (values: ApprovalFormValues) => {
    setSubmitting(true)
    try {
      const response = await studentApprovalsApi.submit(values)
      if (response.success) {
        showSuccess(
          "Your approval request has been submitted successfully. We will review it shortly."
        )
        router.push("/dashboard/subscription")
      } else {
        showError("Failed to submit request. Please try again.")
      }
    } catch (err: any) {
      console.error("Submission error:", err)
      showError(err.message || "An error occurred during submission.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell title="Student Verification">
      <div className="mx-auto max-w-2xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Submit Student Status Proof</CardTitle>
            <CardDescription>
              To access student discounted plans, we need to verify your current
              student status. Please provide the details below and a link to a
              digital scan of your student ID or enrollment letter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="student_institution"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Educational Institution</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. University of Nairobi"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="student_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>University/School Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="student@institution.ac.ke"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="documentation_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Documentation Link (ID / Enrollment Proof)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://link-to-your-document.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Link to a PDF or image of your student identification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County of Residence</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a county" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {loadingCounties ? (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              Loading counties...
                            </div>
                          ) : Array.isArray(countiesData) &&
                            countiesData.length > 0 ? (
                            countiesData.map(
                              (county: { id: number; name: string }) => (
                                <SelectItem key={county.id} value={county.name}>
                                  {county.name}
                                </SelectItem>
                              )
                            )
                          ) : (
                            <div className="p-2 text-center text-sm text-muted-foreground">
                              No counties available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="additional_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide any additional context for your application..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit Application
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="justify-center text-center text-sm text-muted-foreground">
            Verification usually takes 1-2 business days.
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  )
}

export default function ApprovalSubmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ApprovalSubmissionContent />
    </Suspense>
  )
}
