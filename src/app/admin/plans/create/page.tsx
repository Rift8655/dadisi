"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AdminPlanFormSchema,
  AdminPlanFormValues,
  SystemFeatureInput,
} from "@/schemas/plan"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  ListChecks,
  Loader2,
  Plus,
  Settings2,
  X,
} from "lucide-react"
import { useForm } from "react-hook-form"
import Swal from "sweetalert2"

import { useCreatePlan } from "@/hooks/useAdminPlans"
import { useSystemFeatures } from "@/hooks/useSystemFeatures"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"

export default function CreatePlanPage() {
  const router = useRouter()
  const createMut = useCreatePlan()
  const { data: availableSystemFeatures = [], isLoading: loadingFeatures } =
    useSystemFeatures(true)

  const form = useForm<AdminPlanFormValues>({
    resolver: zodResolver(AdminPlanFormSchema),
    defaultValues: {
      name: "",
      description: "",
      monthly_price_kes: 0,
      currency: "KES",
      is_active: true,
      requires_student_approval: false,
      display_features: [],
      system_features: [],
      monthly_promotion: null,
      yearly_promotion: null,
    },
  })

  const handleSubmit = async (values: AdminPlanFormValues) => {
    try {
      await createMut.mutateAsync(values)
      Swal.fire("Success", "Plan created successfully", "success")
      router.push("/admin/plans")
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : String(err ?? "Failed to create plan")
      Swal.fire("Error", message, "error")
    }
  }

  return (
    <AdminDashboardShell title="Create Plan">
      <div className="mb-6">
        <Link
          href="/admin/plans"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Plans
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
              <CardDescription>
                Configure the basic plan information and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Premium Plan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="monthly_price_kes"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Monthly Price (KES)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem className="w-24">
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe this plan's benefits..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief overview for the membership page (max 500
                      characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Inactive plans are hidden from users.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="requires_student_approval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Requires Student Approval</FormLabel>
                        <FormDescription>
                          Subscriptions to this plan await admin approval.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* System Features */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                <CardTitle>System Features</CardTitle>
              </div>
              <CardDescription>
                Enable built-in platform features for this plan. These control
                subscriber access to capabilities and quotas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingFeatures ? (
                <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading system features...
                </div>
              ) : availableSystemFeatures.length === 0 ? (
                <p className="py-4 text-center text-sm italic text-muted-foreground">
                  No system features available. Run the seeder to populate them.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {availableSystemFeatures.map((feature) => {
                    const currentFeatures = form.watch("system_features") || []
                    const existingIndex = currentFeatures.findIndex(
                      (sf) => sf.id === feature.id
                    )
                    const isEnabled = existingIndex >= 0
                    const currentValue = isEnabled
                      ? currentFeatures[existingIndex]?.value
                      : feature.default_value

                    const toggleFeature = (enabled: boolean) => {
                      const current = form.getValues("system_features") || []
                      if (enabled) {
                        form.setValue("system_features", [
                          ...current,
                          {
                            id: feature.id,
                            value: feature.default_value,
                            display_name: null,
                            display_description: null,
                          },
                        ])
                      } else {
                        form.setValue(
                          "system_features",
                          current.filter((sf) => sf.id !== feature.id)
                        )
                      }
                    }

                    const updateValue = (value: string) => {
                      const current = form.getValues("system_features") || []
                      const idx = current.findIndex(
                        (sf) => sf.id === feature.id
                      )
                      if (idx >= 0) {
                        const updated = [...current]
                        updated[idx] = { ...updated[idx], value }
                        form.setValue("system_features", updated)
                      }
                    }

                    return (
                      <div
                        key={feature.id}
                        className="space-y-2 rounded-lg border p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={toggleFeature}
                            />
                            <div>
                              <Label className="font-medium">
                                {feature.name}
                              </Label>
                              {feature.description && (
                                <p className="text-xs text-muted-foreground">
                                  {feature.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {isEnabled && feature.value_type === "number" && (
                            <Input
                              type="number"
                              className="w-24"
                              value={currentValue}
                              onChange={(e) => updateValue(e.target.value)}
                              placeholder="-1"
                            />
                          )}
                          {isEnabled && feature.value_type === "boolean" && (
                            <span className="text-xs font-medium text-green-600">
                              Enabled
                            </span>
                          )}
                        </div>
                        {isEnabled && feature.value_type === "number" && (
                          <p className="pl-11 text-xs text-muted-foreground">
                            Set to -1 for unlimited
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Features - For UI display only */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5" />
                <CardTitle>Display Features</CardTitle>
              </div>
              <CardDescription>
                These are the bullet points shown on the membership page dialog.
                They are purely for display purposes and do not affect user
                quotas or permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(form.watch("display_features") || []).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => {
                        const current = form.getValues("display_features") || []
                        const updated = [...current]
                        updated[idx] = e.target.value
                        form.setValue("display_features", updated)
                      }}
                      placeholder="e.g. Basic user profile"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const current = form.getValues("display_features") || []
                        form.setValue(
                          "display_features",
                          current.filter((_, i) => i !== idx)
                        )
                      }}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const current = form.getValues("display_features") || []
                    form.setValue("display_features", [...current, ""])
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Promotions */}
          <Card>
            <CardHeader>
              <CardTitle>Promotions (Optional)</CardTitle>
              <CardDescription>
                Configure discount promotions for monthly and yearly billing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <PromotionSection form={form} type="monthly" />
                <PromotionSection form={form} type="yearly" />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/plans")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMut.isPending}>
              {createMut.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Plan
            </Button>
          </div>
        </form>
      </Form>
    </AdminDashboardShell>
  )
}

function PromotionSection({
  form,
  type,
}: {
  form: any
  type: "monthly" | "yearly"
}) {
  const fieldName = `${type}_promotion` as const
  const enabled = !!form.watch(fieldName)

  const toggle = (checked: boolean) => {
    if (checked) {
      form.setValue(fieldName, { discount_percent: 0, expires_at: null })
    } else {
      form.setValue(fieldName, null)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={enabled}
          onCheckedChange={toggle}
          id={`toggle-${type}`}
        />
        <Label htmlFor={`toggle-${type}`} className="capitalize">
          {type} Discount
        </Label>
      </div>

      {enabled && (
        <div className="space-y-3 pl-6">
          <FormField
            control={form.control}
            name={`${fieldName}.discount_percent`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Discount %</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${fieldName}.expires_at`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Expires At</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={field.value ? String(field.value).slice(0, 16) : ""}
                    onChange={(e) => field.onChange(e.target.value || null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  )
}
