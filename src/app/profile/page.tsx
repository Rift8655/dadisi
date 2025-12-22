"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/auth"
import { useMemberProfileQuery, useCountiesQuery, useUpdateProfileMutation } from "@/hooks/useMemberProfileQuery"
import { AlertCircle, Check, Edit2, Loader2, Save, X } from "lucide-react"

import type { County, MemberProfile } from "@/types/index"
// memberProfileApi calls moved into `useMemberProfile` store
import { showError, showSuccess } from "@/lib/sweetalert"

import { mapZodErrorToFieldErrors } from "@/lib/zodUtils"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { DashboardShell } from "@/components/dashboard-shell"
import { VerifyEmailButton } from "@/components/verify-email-button"
import { ProfilePictureUpload } from "@/components/profile/ProfilePictureUpload"

type ValidationErrors = Record<string, string>

export default function ProfilePage() {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  // Data: use React Query for server-state
  const updateMutation = useUpdateProfileMutation()


  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } =
    useMemberProfileQuery()
  const { data: counties = [], isLoading: countiesLoading } = useCountiesQuery()

  // Editing states
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<MemberProfile>>({})
  const [errors, setErrors] = useState<ValidationErrors>({})

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  const loading = profileLoading || countiesLoading

  const validateField = (fieldName: string, value: unknown): string | null => {
    switch (fieldName) {
      case "first_name":
      case "last_name":
        if (typeof value === "string" && value.trim() === "") {
          return `${fieldName === "first_name" ? "First" : "Last"} name is required`
        }
        if (typeof value === "string" && value.length > 100) {
          return "Name must be less than 100 characters"
        }
        return null

      case "phone_number":
        if (value && typeof value === "string") {
          if (!/^[\d+\-() ]{7,}$/.test(value.replace(/\s/g, ""))) {
            return "Please enter a valid phone number"
          }
        }
        return null

      case "date_of_birth":
        if (value) {
          const date = new Date(value as string | number | Date)
          const today = new Date()
          if (date > today) {
            return "Date of birth cannot be in the future"
          }
          const age = today.getFullYear() - date.getFullYear()
          if (age < 13) {
            return "You must be at least 13 years old"
          }
        }
        return null

      case "county_id":
        if (!value) {
          return "County is required"
        }
        return null

      case "bio":
        if (value && typeof value === "string" && value.length > 1000) {
          return "Bio must be less than 1000 characters"
        }
        return null

      case "emergency_contact_name":
      case "emergency_contact_phone":
        const currentName =
          fieldName === "emergency_contact_name"
            ? value
            : editingData.emergency_contact_name
        const currentPhone =
          fieldName === "emergency_contact_phone"
            ? value
            : editingData.emergency_contact_phone
        const hasName = typeof currentName === "string" ? currentName.trim() : ""
        const hasPhone = typeof currentPhone === "string" ? currentPhone.trim() : ""
        if ((hasName || hasPhone) && (!hasName || !hasPhone)) {
          return "Both emergency contact name and phone are required"
        }
        if (hasPhone && !/^[\d+\-() ]{7,}$/.test(hasPhone.replace(/\s/g, ""))) {
          return "Please enter a valid phone number"
        }
        return null

      default:
        return null
    }
  }

  const validateSection = (section: string): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    if (section === "personal") {
      const fieldsToValidate = [
        "first_name",
        "last_name",
        "phone_number",
        "date_of_birth",
      ]
      fieldsToValidate.forEach((field) => {
        const error = validateField(
          field,
          editingData[field as keyof MemberProfile]
        )
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    } else if (section === "location") {
      const fieldsToValidate = ["county_id", "occupation"]
      fieldsToValidate.forEach((field) => {
        const error = validateField(
          field,
          editingData[field as keyof MemberProfile]
        )
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    } else if (section === "profile-details") {
      const fieldsToValidate = ["bio"]
      fieldsToValidate.forEach((field) => {
        const error = validateField(
          field,
          editingData[field as keyof MemberProfile]
        )
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    } else if (section === "emergency") {
      const fieldsToValidate = [
        "emergency_contact_name",
        "emergency_contact_phone",
      ]
      fieldsToValidate.forEach((field) => {
        const error = validateField(
          field,
          editingData[field as keyof MemberProfile]
        )
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }

  const startEditing = (section: string) => {
    if (!profile) return
    setEditingSection(section)
    setEditingData({ ...profile })
    setErrors({})
  }

  const cancelEditing = () => {
    setEditingSection(null)
    setEditingData({})
    setErrors({})
  }

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setEditingData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))

    const error = validateField(fieldName, value)
    setErrors((prev) => {
      if (error) {
        return { ...prev, [fieldName]: error }
      } else {
        const { [fieldName]: _, ...rest } = prev
        return rest
      }
    })
  }

  const handleSaveSection = async (section: string) => {
    if (!profile) return

    if (!validateSection(section)) {
      showError("Please fix the errors in this section")
      return
    }

    try {
      const updateData: Partial<MemberProfile> = {}
      if (section === "personal") {
        updateData.first_name = editingData.first_name
        updateData.last_name = editingData.last_name
        updateData.phone_number = editingData.phone_number
        updateData.date_of_birth = editingData.date_of_birth
        updateData.gender = editingData.gender
      } else if (section === "location") {
        updateData.county_id = editingData.county_id
        updateData.sub_county = editingData.sub_county
        updateData.ward = editingData.ward
        updateData.occupation = editingData.occupation
      } else if (section === "profile-details") {
        updateData.bio = editingData.bio
        updateData.interests = editingData.interests
      } else if (section === "emergency") {
        updateData.emergency_contact_name = editingData.emergency_contact_name
        updateData.emergency_contact_phone = editingData.emergency_contact_phone
      } else if (section === "preferences") {
        updateData.terms_accepted = editingData.terms_accepted
        updateData.marketing_consent = editingData.marketing_consent
      }

      await updateMutation.mutateAsync({ id: profile.id, data: updateData })
      // store already updated; reflect UI
      setEditingSection(null)
      setEditingData({})
      showSuccess("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      // If it's a Zod validation error from the store, map to field errors
      const fieldErrors = mapZodErrorToFieldErrors(error)
      if (Object.keys(fieldErrors).length) {
        setErrors((prev) => ({ ...prev, ...fieldErrors }))
        showError("Validation error: please fix the highlighted fields")
      } else {
        const message = error instanceof Error ? error.message : "Failed to update profile"
        showError(message)
      }
    } finally {
      // Handled by updateMutation.isPending
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (!user) {
    return null
  }

  if (profileError) {
    return (
      <DashboardShell title="Profile">
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
           <CardContent className="py-12 text-center text-red-600">
             <p>Error loading profile: {profileError.message}</p>
             <Button variant="outline" className="mt-4" onClick={() => refetchProfile()}>Retry</Button>
           </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  if (loading) {
    return (
      <DashboardShell title="Profile">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            <span>Loading profile...</span>
          </CardContent>
        </Card>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell title="Profile">
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      <div className="space-y-6">
        {/* Account Information Section - Read Only */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Account Information</span>
              <span className="inline-block rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                Read-only
              </span>
            </CardTitle>
            <CardDescription>
              Your account details managed by system administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                 <p className="text-sm font-medium text-muted-foreground">
                   Username
                 </p>
                 <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email
                </p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email Status
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {user.email_verified_at ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <p className="text-sm font-semibold text-green-600">
                        Verified
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-amber-600">
                        Not verified
                      </p>
                    </>
                  )}
                </div>
              </div>
              {profile?.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </p>
                  <p className="text-lg font-semibold">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security & Privacy Section */}
        <Card className="border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Security & Privacy</span>
              {(user as any)?.two_factor_enabled ? (
                <span className="inline-block rounded bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/50 dark:text-green-300">
                  2FA Enabled
                </span>
              ) : (
                <span className="inline-block rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                  2FA Not Configured
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Manage your account security and two-factor authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Protect your account with two-factor authentication using an
              authenticator app or passkeys. You can also manage your password
              and view active sessions.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                onClick={() => router.push("/dashboard/security")}
              >
                Configure MFA
              </Button>
              <Button
                variant="outline"
                onClick={() => setChangePasswordOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Email Verification Section */}
        {!user.email_verified_at && (
          <Card className="border-amber-200 dark:border-amber-900">
            <CardHeader>
              <CardTitle className="text-amber-600 dark:text-amber-400">
                Email Verification Needed
              </CardTitle>
              <CardDescription>
                Verify your email to unlock all features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Verify your email to ensure account security and enable all
                platform features.
              </p>
              <VerifyEmailButton className="w-full" />
            </CardContent>
          </Card>
        )}

        {/* Profile Not Found Section */}
        {!profile && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30">
            <CardHeader>
              <CardTitle className="text-yellow-600 dark:text-yellow-400">
                Profile Not Found
              </CardTitle>
              <CardDescription>
                Your member profile is not set up yet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your member profile hasn't been created yet. This typically
                happens after account approval by administrators. Please check
                back later or contact support.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Profile Picture Section */}
        {profile && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Upload or change your profile picture</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ProfilePictureUpload />
            </CardContent>
          </Card>
        )}

        {/* Personal Information Section */}
        {profile && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Name, phone, and birth date</CardDescription>
                </div>
                {editingSection === "personal" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("personal")}
                      disabled={Object.keys(errors).length > 0 || updateMutation.isPending}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing("personal")}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === "personal" ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={editingData.first_name || ""}
                          onChange={(e) =>
                            handleFieldChange("first_name", e.target.value)
                          }
                          disabled={updateMutation.isPending}
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.first_name}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={editingData.last_name || ""}
                          onChange={(e) =>
                            handleFieldChange("last_name", e.target.value)
                          }
                          disabled={updateMutation.isPending}
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          type="tel"
                          value={editingData.phone_number || ""}
                          onChange={(e) =>
                            handleFieldChange("phone_number", e.target.value)
                          }
                          placeholder="+254 XXX XXX XXX"
                          disabled={updateMutation.isPending}
                        />
                        {errors.phone_number && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phone_number}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={editingData.date_of_birth || ""}
                          onChange={(e) =>
                            handleFieldChange("date_of_birth", e.target.value)
                          }
                          disabled={updateMutation.isPending}
                        />
                        {errors.date_of_birth && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.date_of_birth}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <select
                        id="gender"
                        value={editingData.gender || ""}
                        onChange={(e) =>
                          handleFieldChange("gender", e.target.value || null)
                        }
                        disabled={updateMutation.isPending}
                        className="w-full rounded-md border px-3 py-2 dark:bg-gray-950"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        First Name
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.first_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Last Name
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.last_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.phone_number || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.date_of_birth
                          ? new Date(profile.date_of_birth).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Gender
                      </p>
                      <p className="text-lg font-semibold capitalize">
                        {profile.gender || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Location & Demographics Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Location & Demographics</CardTitle>
                  <CardDescription>
                    County, occupation, and location details
                  </CardDescription>
                </div>
                {editingSection === "location" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("location")}
                      disabled={Object.keys(errors).length > 0 || updateMutation.isPending}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing("location")}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === "location" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="county_id">County</Label>
                      <select
                        id="county_id"
                        value={editingData.county_id || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "county_id",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        disabled={updateMutation.isPending}
                        className="w-full rounded-md border px-3 py-2 dark:bg-gray-950"
                      >
                        <option value="">Select county</option>
                        {counties.map((county) => (
                          <option key={county.id} value={county.id}>
                            {county.name}
                          </option>
                        ))}
                      </select>
                      {errors.county_id && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.county_id}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="sub_county">Sub County</Label>
                        <Input
                          id="sub_county"
                          value={editingData.sub_county || ""}
                          onChange={(e) =>
                            handleFieldChange("sub_county", e.target.value)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ward">Ward</Label>
                        <Input
                          id="ward"
                          value={editingData.ward || ""}
                          onChange={(e) =>
                            handleFieldChange("ward", e.target.value)
                          }
                          disabled={updateMutation.isPending}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="occupation">Occupation</Label>
                      <Input
                        id="occupation"
                        value={editingData.occupation || ""}
                        onChange={(e) =>
                          handleFieldChange("occupation", e.target.value)
                        }
                        placeholder="e.g., Software Engineer, Teacher, Farmer"
                        disabled={updateMutation.isPending}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        County
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.county?.name || "-"}
                      </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Sub County
                        </p>
                        <p className="text-lg font-semibold">
                          {profile.sub_county || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Ward
                        </p>
                        <p className="text-lg font-semibold">
                          {profile.ward || "-"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Occupation
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.occupation || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>Bio and interests</CardDescription>
                </div>
                {editingSection === "profile-details" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("profile-details")}
                      disabled={Object.keys(errors).length > 0 || updateMutation.isPending}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing("profile-details")}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === "profile-details" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editingData.bio || ""}
                        onChange={(e) =>
                          handleFieldChange("bio", e.target.value)
                        }
                        placeholder="Tell us about yourself (max 500 characters)"
                        rows={4}
                        disabled={updateMutation.isPending}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {(editingData.bio || "").length} / 1000 characters
                      </p>
                      {errors.bio && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.bio}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="interests">Interests</Label>
                      <Input
                        id="interests"
                        value={editingData.interests?.join(", ") || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "interests",
                            e.target.value
                              ? e.target.value.split(",").map((i) => i.trim())
                              : []
                          )
                        }
                        placeholder="e.g., Technology, Music, Sports (comma-separated)"
                        disabled={updateMutation.isPending}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Separate interests with commas
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Bio
                        </p>
                        <p className="mt-1 text-sm">{profile.bio}</p>
                      </div>
                    )}
                    {profile.interests && profile.interests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Interests
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {profile.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emergency Contact Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>
                    In case we need to reach you in an emergency
                  </CardDescription>
                </div>
                {editingSection === "emergency" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("emergency")}
                      disabled={Object.keys(errors).length > 0 || updateMutation.isPending}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing("emergency")}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === "emergency" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emergency_contact_name">
                        Contact Name
                      </Label>
                      <Input
                        id="emergency_contact_name"
                        value={editingData.emergency_contact_name || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "emergency_contact_name",
                            e.target.value
                          )
                        }
                        placeholder="Full name of emergency contact"
                        disabled={updateMutation.isPending}
                      />
                    </div>

                    <div>
                      <Label htmlFor="emergency_contact_phone">
                        Contact Phone
                      </Label>
                      <Input
                        id="emergency_contact_phone"
                        type="tel"
                        value={editingData.emergency_contact_phone || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "emergency_contact_phone",
                            e.target.value
                          )
                        }
                        placeholder="+254 XXX XXX XXX"
                        disabled={updateMutation.isPending}
                      />
                      {errors.emergency_contact_phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.emergency_contact_phone}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Both fields are required to save emergency contact
                      information, or leave both empty.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contact Name
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.emergency_contact_name || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contact Phone
                      </p>
                      <p className="text-lg font-semibold">
                        {profile.emergency_contact_phone || "-"}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Your communication preferences
                  </CardDescription>
                </div>
                {editingSection === "preferences" ? (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSaveSection("preferences")}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEditing}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing("preferences")}
                  >
                    <Edit2 className="mr-1 h-4 w-4" />
                    Edit
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {editingSection === "preferences" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border p-3 dark:bg-gray-950">
                      <div>
                        <Label htmlFor="terms_accepted" className="font-medium">
                          Terms & Conditions
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          I accept the terms and conditions
                        </p>
                      </div>
                      <Switch
                        id="terms_accepted"
                        checked={editingData.terms_accepted || false}
                        onCheckedChange={(checked) =>
                          handleFieldChange("terms_accepted", checked)
                        }
                        disabled={updateMutation.isPending}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3 dark:bg-gray-950">
                      <div>
                        <Label
                          htmlFor="marketing_consent"
                          className="font-medium"
                        >
                          Marketing Communications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive news and updates from us
                        </p>
                      </div>
                      <Switch
                        id="marketing_consent"
                        checked={editingData.marketing_consent || false}
                        onCheckedChange={(checked) =>
                          handleFieldChange("marketing_consent", checked)
                        }
                        disabled={updateMutation.isPending}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-md border p-3 dark:bg-gray-950">
                      <div>
                        <p className="font-medium">Terms & Conditions</p>
                        <p className="text-sm text-muted-foreground">
                          You have accepted our terms and conditions
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.terms_accepted ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              Accepted
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-red-600" />
                            <span className="text-sm font-semibold text-red-600">
                              Not accepted
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border p-3 dark:bg-gray-950">
                      <div>
                        <p className="font-medium">Marketing Communications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive news and updates from us
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.marketing_consent ? (
                          <>
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              Enabled
                            </span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-600">
                              Disabled
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Account Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account security and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setChangePasswordOpen(true)}
            >
              Change Password
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
