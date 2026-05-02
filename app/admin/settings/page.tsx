"use client"

import { useState, useEffect } from "react"
import { store, type CompanySettings } from "@/lib/store"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Save, CheckCircle2, Building2, MonitorPlay, Camera, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({...settings, logo: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "manager"]}>
      <div className="min-h-screen bg-muted/30">
        <Sidebar role={user?.role === "admin" ? "admin" : "manager"} />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("settings") || "Settings"}</h1>
                <p className="text-muted-foreground mt-1">Manage your store and system preferences.</p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saved} 
                className="shadow-md min-w-[140px]"
              >
                {saved ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                {saved ? "Saved" : "Save Changes"}
              </Button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg w-fit border">
              <Button 
                variant={activeTab === "profile" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("profile")}
                className="rounded-md"
              >
                <Building2 className="mr-2 h-4 w-4" /> Company Profile
              </Button>
              <Button 
                variant={activeTab === "pos" ? "default" : "ghost"} 
                size="sm"
                onClick={() => setActiveTab("pos")}
                className="rounded-md"
              >
                <MonitorPlay className="mr-2 h-4 w-4" /> POS & Finance
              </Button>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              {activeTab === "profile" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <Card>
                    <CardHeader>
                      <CardTitle>Business Identity</CardTitle>
                      <CardDescription>How your business appears on receipts and the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-muted/20 rounded-xl border border-dashed">
                        <div className="relative group cursor-pointer">
                          {settings.logo ? (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-background shadow-sm">
                              <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                              {settings.name?.substring(0, 2).toUpperCase() || "GS"}
                            </div>
                          )}
                          <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Camera className="h-6 w-6" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                          </label>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium">Company Logo</h4>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="relative">
                              Change Image
                              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                            </Button>
                            {settings.logo && (
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setSettings({...settings, logo: ""})}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Store Name</Label>
                          <Input id="name" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="address">Address</Label>
                          <Input id="address" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === "pos" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                  <Card>
                    <CardHeader>
                      <CardTitle>Regional & Financial</CardTitle>
                      <CardDescription>Currency and tax configurations.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency Symbol</Label>
                        <Input id="currency" value={settings.currency} onChange={e => setSettings({...settings, currency: e.target.value})} placeholder="USD" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tax">Tax Rate (%)</Label>
                        <Input id="tax" type="number" value={settings.taxRate} onChange={e => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Receipt Settings</CardTitle>
                      <CardDescription>Customize the footer of your printed receipts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="footer">Footer Message</Label>
                        <textarea 
                          id="footer" 
                          className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                          value={settings.receiptFooter} 
                          onChange={e => setSettings({...settings, receiptFooter: e.target.value})}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
