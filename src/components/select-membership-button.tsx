"use client"

import { Button } from "@/components/ui/button"
import { showWarning } from "@/lib/sweetalert"

export function SelectMembershipButton() {
  return (
    <Button
      onClick={() => showWarning("Please sign in to subscribe.")}
    >
      Select
    </Button>
  )
}

export default SelectMembershipButton
