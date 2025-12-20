import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MemberProfile } from "@/types";

interface MemberProfileState {
  member: MemberProfile | null;
  setMember: (member: MemberProfile | null) => void;
  clearMember: () => void;
}

export const useMemberProfile = create<MemberProfileState>()(
  persist(
    (set) => ({
      member: null,
      setMember: (member) => set({ member }),
      clearMember: () => set({ member: null }),
    }),
    {
      name: "member-profile-storage",
    }
  )
);
