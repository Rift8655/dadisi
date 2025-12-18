"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/store/auth"
import { useAdmin } from "@/store/admin"

import { AdminDashboardShell } from "@/components/admin-dashboard-shell"
import { Unauthorized } from "@/components/unauthorized"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { showSuccess, showError } from "@/lib/sweetalert"

interface PesapalSettings {
  environment: string
  consumer_key: string
  consumer_secret: string
  callback_url: string
  webhook_url: string
}

interface MockPaymentTest {
  amount: string
  description: string
  user_email: string
}

export default function AdminSystemSettingsPage() {
  const user = useAuth((s) => s.user)
  const isLoading = useAuth((s) => s.isLoading)
  const logout = useAuth((s) => s.logout)
  const [authorizationError, setAuthorizationError] = useState(false)
  const [savingLocal, setSavingLocal] = useState(false)
  const [activeTab, setActiveTab] = useState<'pesapal' | 'testing'>('pesapal')

  // Pesapal Settings (from store)
  const systemSettings = useAdmin((s) => s.systemSettings)
  const systemLoading = useAdmin((s) => s.systemLoading)
  const systemSaving = useAdmin((s) => s.systemSaving)
  const setSystemSettings = useAdmin((s) => s.setSystemSettings)
  const fetchSystemSettings = useAdmin((s) => s.fetchSystemSettings)
  const saveSystemSettings = useAdmin((s) => s.saveSystemSettings)

  // Mock Payment Testing (local form, store-driven results)
  const [mockPayment, setMockPayment] = useState<MockPaymentTest>({
    amount: '2500',
    description: 'Test payment from admin dashboard',
    user_email: user?.email || '',
  })
  const testResults = useAdmin((s) => s.testResults)
  const mockPaymentLoading = useAdmin((s) => s.mockPaymentLoading)
  const testMockPaymentAction = useAdmin((s) => s.testMockPayment)

  useEffect(() => {
    fetchSystemSettings().catch((err) => console.error('Failed to fetch system settings', err))
  }, [fetchSystemSettings])

  const saveSettings = async () => {
    try {
      setSavingLocal(true)
      await saveSystemSettings()
      showSuccess('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      showError('Failed to save settings')
    } finally {
      setSavingLocal(false)
    }
  }

  const handleTestMockPayment = async () => {
    try {
      await testMockPaymentAction(mockPayment)
      showSuccess('Mock payment test initiated! Visit the URL to complete the test.')
    } catch (error) {
      console.error('Mock payment test failed:', error)
      showError('Mock payment test failed')
    }
  }

  if (isLoading || systemLoading) {
    return (
      <AdminDashboardShell title="System Settings">
        <div className="flex items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </AdminDashboardShell>
    )
  }

  if (authorizationError) {
    return <Unauthorized actionHref="/admin" />
  }

  return (
    <AdminDashboardShell title="System Settings">
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('pesapal')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pesapal'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Pesapal Configuration
            </button>
            <button
              onClick={() => setActiveTab('testing')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'testing'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Payment Testing
            </button>
          </nav>
        </div>

        {/* Pesapal Configuration Tab */}
        {activeTab === 'pesapal' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pesapal Payment Gateway Settings
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  systemSettings.environment === 'live'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {systemSettings.environment.toUpperCase()}
                </span>
              </CardTitle>
              <CardDescription>
                Configure your Pesapal payment gateway settings. Changes take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environment">Environment</Label>
                  <select
                    id="environment"
                    value={systemSettings.environment}
                    onChange={(e) => setSystemSettings({ environment: e.target.value })}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={systemSettings.consumer_key}
                    onChange={(e) => setSystemSettings({ consumer_key: e.target.value })}
                    placeholder="Enter your Pesapal Consumer Key"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="consumer_secret">Consumer Secret</Label>
                  <Input
                    id="consumer_secret"
                    type="password"
                    value={systemSettings.consumer_secret}
                    onChange={(e) => setSystemSettings({ consumer_secret: e.target.value })}
                    placeholder="Enter your Pesapal Consumer Secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="callback_url">Callback URL</Label>
                  <Input
                    id="callback_url"
                    value={systemSettings.callback_url}
                    onChange={(e) => setSystemSettings({ callback_url: e.target.value })}
                    placeholder="Frontend callback URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL where users return after payment completion
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_url">Webhook URL</Label>
                  <Input
                    id="webhook_url"
                    value={systemSettings.webhook_url}
                    onChange={(e) => setSystemSettings({ webhook_url: e.target.value })}
                    placeholder="Webhook receiver URL"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTTPS URL for Pesapal to send payment notifications
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={saveSettings} disabled={savingLocal || systemSaving}>
                  {savingLocal || systemSaving ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button variant="outline" onClick={() => fetchSystemSettings()}>
                  Reset Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Testing Tab */}
        {activeTab === 'testing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mock Payment Testing</CardTitle>
                <CardDescription>
                  Test your payment integration locally without connecting to Pesapal.
                  This simulates the complete payment flow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="test_amount">Amount (KES)</Label>
                    <Input
                      id="test_amount"
                      type="number"
                      value={mockPayment.amount}
                      onChange={(e) => setMockPayment(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="2500"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="test_email">Test User Email</Label>
                    <Input
                      id="test_email"
                      value={mockPayment.user_email}
                      onChange={(e) => setMockPayment(prev => ({ ...prev, user_email: e.target.value }))}
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="test_description">Payment Description</Label>
                  <Input
                    id="test_description"
                    value={mockPayment.description}
                    onChange={(e) => setMockPayment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Test payment from admin dashboard"
                  />
                </div>

                <Button
                  onClick={handleTestMockPayment}
                  disabled={mockPaymentLoading}
                  className="mt-4"
                >
                  {mockPaymentLoading ? 'Running Test...' : '🧪 Start Mock Payment Test'}
                </Button>
              </CardContent>
            </Card>

            {testResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm space-y-1">
                    {testResults.map((result, index) => (
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
