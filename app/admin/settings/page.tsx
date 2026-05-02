"use client"

import { useState, useEffect } from "react"
import { store, type CompanySettings } from "@/lib/store"
import { ProtectedRoute } from "@/components/protected-route"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, Save, CheckCircle2 } from "lucide-react"

export default function SettingsPage() {
  const { t } = useLanguage()
  const [settings, setSettings] = useState<CompanySettings>({
    name: "",
    logo: "",
    phone: "",
    address: "",
    currency: "USD",
    taxRate: 0,
    receiptFooter: ""
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    setSettings(store.getSettings())
  }, [])

  const handleSave = () => {
    store.updateSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Manage your company profile and application settings
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-2">
          <Button 
            variant={activeTab === "profile" ? "default" : "ghost"} 
            onClick={() => setActiveTab("profile")}
          >
            Company Profile
          </Button>
          <Button 
            variant={activeTab === "pos" ? "default" : "ghost"} 
            onClick={() => setActiveTab("pos")}
          >
            POS & Sales Settings
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Profile Settings */}
          {activeTab === "profile" && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-muted/20">
                <h3 className="font-semibold leading-none tracking-tight">Company Profile</h3>
                <p className="text-sm text-muted-foreground">This information will appear on receipts and dashboards.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={settings.name} 
                    onChange={(e) => setSettings({...settings, name: e.target.value})} 
                    placeholder="e.g. GacalSolution"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <div className="flex gap-4 items-center">
                    {settings.logo ? (
                      <img src={settings.logo} alt="Logo preview" className="w-12 h-12 rounded-md object-contain border bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-md border flex items-center justify-center bg-muted text-muted-foreground font-bold text-xl">
                        {settings.name.substring(0, 2).toUpperCase() || "GS"}
                      </div>
                    )}
                    <div className="flex-1 flex gap-2">
                      <Input 
                        id="companyLogo" 
                        type="file"
                        accept="image/*"
                        className="cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSettings({...settings, logo: reader.result as string});
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                      />
                      {settings.logo && (
                        <Button variant="outline" type="button" onClick={() => setSettings({...settings, logo: ""})}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload an image to use as your logo. Leave blank to use initials.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Phone Number</Label>
                  <Input 
                    id="companyPhone" 
                    value={settings.phone} 
                    onChange={(e) => setSettings({...settings, phone: e.target.value})} 
                    placeholder="e.g. +252 61 000 0000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress">Address</Label>
                  <Input 
                    id="companyAddress" 
                    value={settings.address} 
                    onChange={(e) => setSettings({...settings, address: e.target.value})} 
                    placeholder="e.g. Mogadishu, Somalia"
                  />
                </div>
              </div>
            </div>
          )}

          {/* POS & Sales Settings */}
          {activeTab === "pos" && (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 border-b border-border/50 bg-muted/20">
                <h3 className="font-semibold leading-none tracking-tight">Point of Sale & Finance</h3>
                <p className="text-sm text-muted-foreground">Manage how your sales and receipts behave.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Base Currency</Label>
                  <Input 
                    id="currency" 
                    value={settings.currency} 
                    onChange={(e) => setSettings({...settings, currency: e.target.value})} 
                    placeholder="e.g. USD, EUR, SOS"
                  />
                  <p className="text-xs text-muted-foreground">The default currency code used across the system.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                  <Input 
                    id="taxRate" 
                    type="number"
                    step="0.1"
                    min="0"
                    value={settings.taxRate} 
                    onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptFooter">Receipt Footer Message</Label>
                  <Input 
                    id="receiptFooter" 
                    value={settings.receiptFooter} 
                    onChange={(e) => setSettings({...settings, receiptFooter: e.target.value})} 
                    placeholder="e.g. Thank you for shopping with us!"
                  />
                  <p className="text-xs text-muted-foreground">This message will appear at the very bottom of every printed receipt.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="md:col-span-2 mt-4 flex justify-end">
            <Button onClick={handleSave} className="w-full md:w-auto min-w-[200px]" size="lg" disabled={saved}>
              {saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" /> Settings Saved!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save All Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
