"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/store/auth"
import { ExternalLink, Loader2 } from "lucide-react"

import { showConfirm, showError, showInfo, showSuccess } from "@/lib/sweetalert"
import {
  MockPaymentTestPayload,
  useAdminMockPayment,
} from "@/hooks/useAdminMockPayment"
import {
  PesapalTestPayload,
  useAdminPesapalTest,
} from "@/hooks/useAdminPesapalTest"
import {
  useAdminSystemSettings,
  useUpdateSystemSettings,
} from "@/hooks/useAdminSettings"
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
import { AdminDashboardShell } from "@/components/admin-dashboard-shell"

export default function PaymentGatewaySettingsPage() {
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [activeTab, setActiveTab] = useState<"gateway" | "pesapal" | "testing">(
    "gateway"
  )
  const [testingMode, setTestingMode] = useState<"mock" | "pesapal">("mock")

  // Hooks
  const {
    data: settingsData,
    isLoading: systemLoading,
    error: fetchError,
  } = useAdminSystemSettings("pesapal")
  const updateSettingsMutation = useUpdateSystemSettings()

  const {
    results: mockResults,
    isPending: mockPaymentLoading,
    mutateAsync: testMockPaymentAction,
  } = useAdminMockPayment()
  const {
    results: pesapalResults,
    isPending: pesapalTestLoading,
    mutateAsync: testPesapalAction,
  } = useAdminPesapalTest()

  // Local form state
  const [formSettings, setFormSettings] = useState<Record<string, any>>({})

  useEffect(() => {
    if (settingsData) {
      setFormSettings(settingsData)
    }
  }, [settingsData])

  useEffect(() => {
    if (fetchError) {
      const status = (fetchError as any).status
      if (status === 401) {
        logout()
      } else {
        showError("Failed to fetch settings")
      }
    }
  }, [fetchError, logout])

  // Mock Payment Testing state
  const [mockPayment, setMockPayment] = useState<MockPaymentTestPayload>({
    amount: "2500",
    description: "Test payment from admin dashboard",
    user_email: user?.email || "",
    payment_type: "test",
  })

  // Pesapal Testing state
  const [pesapalTest, setPesapalTest] = useState<PesapalTestPayload>({
    amount: "50", // Minimum often required for real tests
    description: "Real Pesapal Sandbox Test from Admin",
    user_email: user?.email || "",
    first_name: "Admin",
    last_name: "Tester",
    phone: "254700000000",
  })

  const handleUpdateField = (key: string, value: any) => {
    setFormSettings((prev) => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync(formSettings)
      showSuccess("Settings saved successfully!")
    } catch (error) {
      console.error("Failed to save settings:", error)
      showError("Failed to save settings")
    }
  }

  const handleTestMockPayment = async () => {
    try {
      await testMockPaymentAction(mockPayment)
      showSuccess(
        "Mock payment test initiated! Visit the URL to complete the test."
      )
    } catch (error) {
      console.error("Mock payment test failed:", error)
      showError("Mock payment test failed")
    }
  }

  const handleTestPesapal = async () => {
    // Check if sandbox is enabled first
    if (formSettings["pesapal.environment"] !== "sandbox") {
      const result = await showConfirm(
        "Live Mode Warning",
        "You are currently in LIVE mode. Use sandbox for testing to avoid real charges. Continue anyway?"
      )
      if (!result.isConfirmed) return
    }

    try {
      await testPesapalAction(pesapalTest)
      showSuccess(
        "Pesapal test initiated! A new tab should have opened with the Pesapal Sandbox payment page."
      )
    } catch (error) {
      console.error("Pesapal test failed:", error)
      showError(
        "Pesapal test failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      )
    }
  }

  if (systemLoading) {
    return (
      <AdminDashboardShell title="Payment Gateway Settings">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </AdminDashboardShell>
    )
  }

  const pesapalSettings = {
    environment: formSettings["pesapal.environment"] || "sandbox",
    consumer_key: formSettings["pesapal.consumer_key"] || "",
    consumer_secret: formSettings["pesapal.consumer_secret"] || "",
    callback_url: formSettings["pesapal.callback_url"] || "",
    webhook_url: formSettings["pesapal.webhook_url"] || "",
    webhook_secret: formSettings["pesapal.webhook_secret"] || "",
  }

  return (
    <AdminDashboardShell title="Payment Gateway Settings">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {(["gateway", "pesapal", "testing"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 py-2 text-sm font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                {tab === "gateway"
                  ? "Payment Gateway"
                  : tab === "pesapal"
                    ? "Pesapal Configuration"
                    : "Payment Testing"}
              </button>
            ))}
          </nav>
        </div>

        {/* Payment Gateway Selection Tab */}
        {activeTab === "gateway" && (
          <Card>
            <CardHeader>
              <CardTitle>Active Payment Gateway</CardTitle>
              <CardDescription>
                Select which payment gateway to use for processing subscription
                payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_gateway">Payment Gateway</Label>
                  <select
                    id="payment_gateway"
                    value={formSettings["payment.gateway"] || "mock"}
                    onChange={(e) =>
                      handleUpdateField("payment.gateway", e.target.value)
                    }
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="mock">Mock (Development/Testing)</option>
                    <option value="pesapal">Pesapal (Production)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    {formSettings["payment.gateway"] === "pesapal"
                      ? "⚠️ Using Pesapal for real payments. Make sure your Pesapal credentials are configured."
                      : "🧪 Using mock payment gateway for testing. No real transactions will be processed."}
                  </p>
                </div>

                {formSettings["payment.gateway"] === "mock" && (
                  <div className="space-y-2">
                    <Label htmlFor="mock_success_rate">
                      Mock Success Rate (%)
                    </Label>
                    <Input
                      id="mock_success_rate"
                      type="number"
                      min="0"
                      max="100"
                      value={formSettings["payment.mock_success_rate"] || "100"}
                      onChange={(e) =>
                        handleUpdateField(
                          "payment.mock_success_rate",
                          e.target.value
                        )
                      }
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Percentage of mock payments that will succeed. Set to 100
                      for all success, lower values to test failure scenarios.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={saveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Gateway Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pesapal Configuration Tab */}
        {activeTab === "pesapal" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pesapal Payment Gateway Settings
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    pesapalSettings.environment === "live"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {pesapalSettings.environment.toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription>
                Configure your Pesapal payment gateway settings. Changes take
                effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    value={pesapalSettings.environment}
                    onChange={(e) =>
                      handleUpdateField("pesapal.environment", e.target.value)
                    }
                    className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="live">Live (Production)</option>
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="consumer_key">Consumer Key</Label>
                  <Input
                    id="consumer_key"
                    type="password"
                    value={pesapalSettings.consumer_key}
                    onChange={(e) =>
                      handleUpdateField("pesapal.consumer_key", e.target.value)
                    }
                    placeholder="Enter your Pesapal Consumer Key"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    value={pesapalSettings.consumer_secret}
                    onChange={(e) =>
                      handleUpdateField(
                        "pesapal.consumer_secret",
                        e.target.value
                      )
                    }
                    placeholder="Enter your Pesapal Consumer Secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback_url">Callback URL</Label>
                  <Input
                    id="callback_url"
                    value={pesapalSettings.callback_url}
                    readOnly
                    className="cursor-not-allowed bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      System Generated:
                    </span>{" "}
                    URL where users return after payment completion.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Base Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={pesapalSettings.webhook_url}
                    readOnly
                    className="cursor-not-allowed bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-primary">
                      System Generated:
                    </span>{" "}
                    The backend endpoint for Pesapal IPN notifications.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_secret">Webhook Secret Token</Label>
                  <div className="flex gap-2">
                    <Input
                      id="webhook_secret"
                      type="password"
                      value={pesapalSettings.webhook_secret}
                      onChange={(e) =>
                        handleUpdateField(
                          "pesapal.webhook_secret",
                          e.target.value
                        )
                      }
                      placeholder="Enter secret token"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const randomToken =
                          "dadisi_sec_" +
                          Math.random().toString(36).substring(2, 8) +
                          "_v3"
                        handleUpdateField("pesapal.webhook_secret", randomToken)
                      }}
                    >
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Shared secret to authorize PesaPal notifications.
                  </p>
                </div>

                {pesapalSettings.webhook_url &&
                  pesapalSettings.webhook_secret && (
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-primary">
                        Your Authenticated IPN Listener URL
                      </Label>
                      <div className="flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 p-3 font-mono text-sm">
                        <span className="select-all break-all">
                          {pesapalSettings.webhook_url.includes("?")
                            ? `${pesapalSettings.webhook_url}&token=${pesapalSettings.webhook_secret}`
                            : `${pesapalSettings.webhook_url}?token=${pesapalSettings.webhook_secret}`}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0"
                          onClick={() => {
                            const fullUrl =
                              pesapalSettings.webhook_url.includes("?")
                                ? `${pesapalSettings.webhook_url}&token=${pesapalSettings.webhook_secret}`
                                : `${pesapalSettings.webhook_url}?token=${pesapalSettings.webhook_secret}`
                            navigator.clipboard.writeText(fullUrl)
                            showSuccess("URL copied to clipboard!")
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Copy this into your <strong>PesaPal Dashboard</strong>.
                        The "Website Domain" must match the server domain in
                        this URL.
                      </p>
                    </div>
                  )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={saveSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setFormSettings(settingsData || {})}
                >
                  Reset Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Testing Tab */}
        {activeTab === "testing" && (
          <div className="space-y-6">
            {/* Testing Mode Toggle */}
            <div className="flex w-fit rounded-lg bg-muted p-1">
              <button
                onClick={() => setTestingMode("mock")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  testingMode === "mock"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mock Testing
              </button>
              <button
                onClick={() => setTestingMode("pesapal")}
                className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                  testingMode === "pesapal"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Real Pesapal (Sandbox)
              </button>
            </div>

            {testingMode === "mock" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Mock Payment Testing</CardTitle>
                  <CardDescription>
                    Test your payment integration locally without connecting to
                    Pesapal. This simulates the complete payment flow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_type">Payment Type</Label>
                      <select
                        id="payment_type"
                        value={mockPayment.payment_type}
                        onChange={(e) =>
                          setMockPayment((prev) => ({
                            ...prev,
                            payment_type: e.target
                              .value as MockPaymentTestPayload["payment_type"],
                          }))
                        }
                        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="test">🧪 Test</option>
                        <option value="subscription">💳 Subscription</option>
                        <option value="donation">❤️ Donation</option>
                        <option value="event">🎫 Event Ticket</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="test_amount">Amount (KES)</Label>
                      <Input
                        id="test_amount"
                        type="number"
                        value={mockPayment.amount}
                        onChange={(e) =>
                          setMockPayment((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="2500"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="test_email">Test User Email</Label>
                      <Input
                        id="test_email"
                        value={mockPayment.user_email}
                        onChange={(e) =>
                          setMockPayment((prev) => ({
                            ...prev,
                            user_email: e.target.value,
                          }))
                        }
                        placeholder="user@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="test_description">
                      Payment Description
                    </Label>
                    <Input
                      id="test_description"
                      value={mockPayment.description}
                      onChange={(e) =>
                        setMockPayment((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Test payment from admin dashboard"
                    />
                  </div>

                  <Button
                    onClick={handleTestMockPayment}
                    disabled={mockPaymentLoading}
                    className="mt-4"
                  >
                    {mockPaymentLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Test...
                      </>
                    ) : (
                      "🧪 Start Mock Payment Test"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Real Pesapal Sandbox Testing</CardTitle>
                  <CardDescription>
                    Initiate a real payment session with Pesapal Sandbox. This
                    will open a new tab on Pesapal's secure payment page.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pesapal_amount">Amount (KES)</Label>
                      <Input
                        id="pesapal_amount"
                        type="number"
                        value={pesapalTest.amount}
                        onChange={(e) =>
                          setPesapalTest((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesapal_email">Payer Email</Label>
                      <Input
                        id="pesapal_email"
                        value={pesapalTest.user_email}
                        onChange={(e) =>
                          setPesapalTest((prev) => ({
                            ...prev,
                            user_email: e.target.value,
                          }))
                        }
                        placeholder="payer@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesapal_first_name">First Name</Label>
                      <Input
                        id="pesapal_first_name"
                        value={pesapalTest.first_name}
                        onChange={(e) =>
                          setPesapalTest((prev) => ({
                            ...prev,
                            first_name: e.target.value,
                          }))
                        }
                        placeholder="First Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pesapal_last_name">Last Name</Label>
                      <Input
                        id="pesapal_last_name"
                        value={pesapalTest.last_name}
                        onChange={(e) =>
                          setPesapalTest((prev) => ({
                            ...prev,
                            last_name: e.target.value,
                          }))
                        }
                        placeholder="Last Name"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="pesapal_description">Description</Label>
                      <Input
                        id="pesapal_description"
                        value={pesapalTest.description}
                        onChange={(e) =>
                          setPesapalTest((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Real Pesapal Sandbox Test"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleTestPesapal}
                    disabled={pesapalTestLoading}
                    className="mt-4"
                  >
                    {pesapalTestLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Initiating...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        🚀 Launch Real Pesapal Test
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {(testingMode === "mock" ? mockResults : pesapalResults).length >
              0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 rounded-md bg-muted p-4 font-mono text-sm text-foreground">
                    {(testingMode === "mock"
                      ? mockResults
                      : pesapalResults
                    ).map((result, index) => (
                      <div key={index} className="whitespace-pre-wrap">
                        {result}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </AdminDashboardShell>
  )
}
