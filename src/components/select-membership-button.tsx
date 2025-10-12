"use client"

import { Button } from "@/components/ui/button"
import { useToastStore } from "@/store/useToastStore"

export function SelectMembershipButton() {
  const show = useToastStore((s) => s.show)
  return (
    <Button
      onClick={() => show("Please sign in to subscribe.")}
    >
      Select
    </Button>
  )
}

export default SelectMembershipButton
