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
import { AdminPlanFormSchema, AdminPlanFormValues } from "@/schemas/plan"

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
        // Note: initialData might have different structure (nested pricing, etc)
        // We assume basic mapping for now, enhance as needed based on API response
        
        // Handling Features: API returns objects [{id, name: {en: "Foo"}}], form expects strings ["Foo"]
        const features = Array.isArray((initialData as any)?.features)
          ? (initialData as any).features.map((f: unknown) => {
              if (typeof f === 'string') return f
              if (typeof f === 'object' && f !== null) {
                const obj = f as Record<string, unknown>
                const name = obj.name
                if (typeof name === 'object' && name !== null) {
                  const n = name as Record<string, unknown>
                  const en = n.en
                  if (typeof en === 'string') return en
                }
                if (typeof name === 'string') return name
              }
              return ""
            })
          : []

        // Handling Price: API might return number or string
        const price = typeof (initialData as any)?.price === 'number' ? (initialData as any).price : Number((initialData as any)?.price || 0)

        // TODO: Handle promotions extraction if they are nested in the GET response
        // For now, assume flat or manually flatten
        
        const nameVal = (() => {
          const n = (initialData as any)?.name
          if (typeof n === 'object' && n !== null) return (n as Record<string, unknown>)?.en ?? ""
          if (typeof n === 'string') return n
          return ""
        })()

        form.reset({
          name: nameVal || "",
          monthly_price_kes: price,
          currency: initialData.currency || "KES",
          is_active: initialData.is_active ?? true,
          features: features,
          // If existing plan has no promotion structure, defaulting to null is fine
          monthly_promotion: initialData.monthly_promotion || null,
          yearly_promotion: initialData.yearly_promotion || null,
        })
      } else {
        form.reset({
          name: "",
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

  // Helper to handle array of strings with useFieldArray (requires object with id usually)
  // Since we use array of strings, we might need a manual approach or wrapper objects
  // For simplicity: We'll manage features as a simple array in state if useFieldArray is tricky with primitives
  // OR: useFieldArray with { value: string } wrapper and transform on submit.
  
  // Implementation choice: Manual array management for string primitives is often easier
  const features = form.watch("features") || []
  
  const addFeature = () => {
    const current = form.getValues("features") || []
    form.setValue("features", [...current, ""])
  }

  const removeFeature = (index: number) => {
    const current = form.getValues("features") || []
    form.setValue("features", current.filter((_, i) => i !== index))
  }

  const updateFeature = (index: number, value: string) => {
    const current = form.getValues("features") || []
    const updated = [...current]
    updated[index] = value
    form.setValue("features", updated)
  }

  const handleSubmit = async (values: AdminPlanFormValues) => {
    // Filter out empty features
    values.features = values.features?.filter(f => f.trim() !== "")
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
                <h3 className="text-sm font-medium">Features</h3>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="mr-2 h-4 w-4" /> Add Feature
                </Button>
              </div>
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFeature(index)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {features.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No features added yet.</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-4 text-sm font-medium">Promotions (Optional)</h3>
              <div className="grid grid-cols-2 gap-4">
                 <CardSection title="Monthly Discount" form={form} path="monthly_promotion" />
                 <CardSection title="Yearly Discount" form={form} path="yearly_promotion" />
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

function CardSection({ title, form, path }: { title: string, form: UseFormReturn<AdminPlanFormValues>, path: string }) {
  const enabled = !!form.watch(path)

  const toggle = (checked: boolean) => {
    if (checked) {
      form.setValue(path, { discount_percent: 0, expires_at: null })
    } else {
      form.setValue(path, null)
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-4">
       <div className="flex items-center space-x-2">
          <Checkbox checked={enabled} onCheckedChange={toggle} id={`toggle-${path}`} />
          <Label htmlFor={`toggle-${path}`}>{title}</Label>
       </div>
       
       {enabled && (
         <div className="space-y-3 pl-6">
            <FormField
              control={form.control}
              name={`${path}.discount_percent`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Discount %</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${path}.expires_at`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Expires At (ISO Date)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value ? field.value.slice(0, 16) : ""} />
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


