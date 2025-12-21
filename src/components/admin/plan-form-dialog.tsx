"use client"

import { useEffect } from "react"
import type { UseFormReturn } from "react-hook-form"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AdminPlanFormSchema, AdminPlanFormValues, PlanFeature } from "@/schemas/plan"

interface PlanFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: AdminPlanFormValues) => Promise<void>
  initialData?: unknown // Typed loosely as the GET response shape might differ slightly
  isLoading?: boolean
}

export function PlanFormDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: PlanFormDialogProps) {
  const isEditing = !!initialData

  const form = useForm<AdminPlanFormValues>({
    resolver: zodResolver(AdminPlanFormSchema),
    defaultValues: {
      name: "",
      description: "",
      monthly_price_kes: 0,
      currency: "KES",
      is_active: true,
      features: [],
      monthly_promotion: null,
      yearly_promotion: null,
    },
  })

  // Reset/Populate form when opening
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Transform initialData to form values
        // Features: API returns [{id, name: {en: "Foo"}, limit, ...}], transform to form objects
        const features: PlanFeature[] = Array.isArray((initialData as any)?.features)
          ? (initialData as any).features.map((f: unknown) => {
              if (typeof f === 'object' && f !== null) {
                const obj = f as Record<string, unknown>
                const name = obj.name
                let nameStr = ""
                if (typeof name === 'object' && name !== null) {
                  const n = name as Record<string, unknown>
                  nameStr = typeof n.en === 'string' ? n.en : ""
                } else if (typeof name === 'string') {
                  nameStr = name
                }
                
                // Extract limit - stored as 'value' in backend, but also check 'limit'
                let limit: number | null = null
                if (typeof obj.limit === 'number') {
                  limit = obj.limit
                } else if (typeof obj.value === 'string') {
                  const parsed = parseInt(obj.value, 10)
                  limit = isNaN(parsed) ? null : parsed
                } else if (typeof obj.value === 'number') {
                  limit = obj.value
                }
                
                // Extract description
                let description = ""
                const desc = obj.description
                if (typeof desc === 'object' && desc !== null) {
                  const d = desc as Record<string, unknown>
                  description = typeof d.en === 'string' ? d.en : ""
                } else if (typeof desc === 'string') {
                  description = desc
                }
                
                return { name: nameStr, limit, description }
              }
              return { name: "", limit: null, description: "" }
            })
          : []

        // Handling Price: API might return number or string
        const price = typeof (initialData as any)?.price === 'number' ? (initialData as any).price : Number((initialData as any)?.price || 0)
        
        const nameVal = (() => {
          const n = (initialData as any)?.name
          if (typeof n === 'object' && n !== null) return String((n as Record<string, unknown>)?.en ?? "")
          if (typeof n === 'string') return n
          return ""
        })()

        // Extract plan description
        let descriptionVal = ""
        const desc = (initialData as any)?.description
        if (typeof desc === 'object' && desc !== null) {
          descriptionVal = String((desc as Record<string, unknown>)?.en ?? "")
        } else if (typeof desc === 'string') {
          descriptionVal = desc
        }

        form.reset({
          name: nameVal || "",
          description: descriptionVal,
          monthly_price_kes: price,
          currency: (initialData as any).currency || "KES",
          is_active: (initialData as any).is_active ?? true,
          features: features,
          monthly_promotion: (initialData as any).monthly_promotion || null,
          yearly_promotion: (initialData as any).yearly_promotion || null,
        })
      } else {
        form.reset({
          name: "",
          description: "",
          monthly_price_kes: 0,
          currency: "KES",
          is_active: true,
          features: [],
          monthly_promotion: null,
          yearly_promotion: null,
        })
      }
    }
  }, [open, initialData, form])

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "features" as const,
  })


  const addFeature = () => {
    append({ name: "", limit: null, description: "" })
  }

  const removeFeature = (index: number) => {
    remove(index)
  }

  const handleSubmit = async (values: AdminPlanFormValues) => {
    // Filter out features with empty names
    values.features = values.features?.filter(f => f.name.trim() !== "")
    await onSubmit(values)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update subscription plan details."
              : "Create a new subscription plan with pricing and features."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
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
                      <FormMessage />
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
                  <FormLabel>General Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this plan's benefits and target audience..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief overview that appears on the membership page (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Inactive plans are hidden from users but remain in system.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Features</h3>
                  <p className="text-xs text-muted-foreground">Define plan features and limits (-1 = unlimited)</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </div>
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-md border p-3 space-y-2">
                    <div className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`features.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel className="text-xs">Feature Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Blog Posts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`features.${index}.limit`}
                        render={({ field }) => (
                          <FormItem className="w-24">
                            <FormLabel className="text-xs">Limit</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="-1" 
                                {...field} 
                                value={field.value ?? ""} 
                                onChange={(e) => {
                                  const val = e.target.value
                                  field.onChange(val === "" ? null : parseInt(val, 10))
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeFeature(index)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`features.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Description (optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Brief feature description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No features added yet.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-4 text-sm font-medium">Promotions (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <MonthlyPromotionSection form={form} />
                 <YearlyPromotionSection form={form} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Update Plan" : "Create Plan"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function MonthlyPromotionSection({ form }: { form: UseFormReturn<AdminPlanFormValues> }) {
  const enabled = !!form.watch("monthly_promotion")

  const toggle = (checked: boolean) => {
    if (checked) {
      form.setValue("monthly_promotion", { discount_percent: 0, expires_at: null })
    } else {
      form.setValue("monthly_promotion", null)
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
       <div className="flex items-center space-x-2">
          <Checkbox checked={enabled} onCheckedChange={toggle} id="toggle-monthly" />
          <Label htmlFor="toggle-monthly">Monthly Discount</Label>
       </div>
       
       {enabled && (
         <div className="space-y-3 pl-6">
            <FormField
              control={form.control}
              name="monthly_promotion.discount_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Discount %</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthly_promotion.expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Expires At (ISO Date)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ? String(field.value).slice(0, 16) : ""} onChange={e => field.onChange(e.target.value || null)} />
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

function YearlyPromotionSection({ form }: { form: UseFormReturn<AdminPlanFormValues> }) {
  const enabled = !!form.watch("yearly_promotion")

  const toggle = (checked: boolean) => {
    if (checked) {
      form.setValue("yearly_promotion", { discount_percent: 0, expires_at: null })
    } else {
      form.setValue("yearly_promotion", null)
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
       <div className="flex items-center space-x-2">
          <Checkbox checked={enabled} onCheckedChange={toggle} id="toggle-yearly" />
          <Label htmlFor="toggle-yearly">Yearly Discount</Label>
       </div>
       
       {enabled && (
         <div className="space-y-3 pl-6">
            <FormField
              control={form.control}
              name="yearly_promotion.discount_percent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Discount %</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} value={field.value ?? 0} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="yearly_promotion.expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Expires At (ISO Date)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ? String(field.value).slice(0, 16) : ""} onChange={e => field.onChange(e.target.value || null)} />
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


