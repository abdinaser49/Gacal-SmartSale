"use client"

import { useState, useEffect } from "react"
import { store, type CompanySettings } from "@/lib/store"
import { ProtectedRoute } from "@/components/protected-route"
import { Sidebar } from "@/components/dashboard/sidebar"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Save, CheckCircle2, Building2, MonitorPlay, Camera, Trash2 } from "lucide-react"

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
        <Sidebar role="admin" />
        <main className="md:ml-64 p-4 md:p-8">
          <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-12 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-6 gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings className="h-7 w-7 text-primary" />
                  </div>
                  System Settings
                </h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Manage your store preferences, company profile, and application configurations.
                </p>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saved} 
                size="lg" 
                className="shadow-md hover:shadow-lg transition-all min-w-[160px]"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Saved
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" /> Save Changes
                  </>
                )}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Navigation */}
              <aside className="lg:w-64 flex-shrink-0">
                <nav className="flex flex-col gap-2 sticky top-6">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'profile' 
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-[1.01]'
                    }`}
                  >
                    <Building2 className="w-5 h-5" /> 
                    Company Profile
                  </button>
                  <button 
                    onClick={() => setActiveTab("pos")}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      activeTab === 'pos' 
                      ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
                      : 'hover:bg-muted text-muted-foreground hover:text-foreground hover:scale-[1.01]'
                    }`}
                  >
                    <MonitorPlay className="w-5 h-5" /> 
                    POS & Finance
                  </button>
                </nav>
              </aside>

              {/* Content Area */}
              <div className="flex-1">
                {/* Profile Settings */}
                {activeTab === "profile" && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <Card className="border-border/50 shadow-sm overflow-hidden">
                      <div className="h-24 bg-gradient-to-r from-primary/20 to-primary/5"></div>
                      <CardHeader className="relative pb-2">
                        <CardTitle className="text-2xl">Company Branding</CardTitle>
                        <CardDescription>Personalize how your business appears to customers.</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row items-center gap-8 p-6 bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
                          <div className="relative group cursor-pointer">
                            {settings.logo ? (
                              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">
                                <img src={settings.logo} alt="Logo" className="w-full h-full object-contain" />
                              </div>
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-primary/10 text-primary flex items-center justify-center text-4xl font-bold border-4 border-white shadow-lg">
                                {settings.name ? settings.name.substring(0, 2).toUpperCase() : "GS"}
                              </div>
                            )}
                            <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm">
                              <Camera className="w-8 h-8 mb-1" />
                              <span className="text-xs font-medium">Upload</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-lg font-semibold text-foreground">Upload Business Logo</h4>
                            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm">
                              Recommended size: 256x256px. Formats: PNG, JPG. Max size: 2MB.
                            </p>
                            <div className="flex items-center justify-center sm:justify-start gap-3">
                              <Button variant="outline" className="relative cursor-pointer">
                                <Camera className="w-4 h-4 mr-2" /> Choose Image
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleLogoUpload} />
                              </Button>
                              {settings.logo && (
                                <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setSettings({...settings, logo: ""})}>
                                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-2xl">Contact Information</CardTitle>
                        <CardDescription>Update your business name and contact details.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="companyName" className="text-sm font-medium">Business Name</Label>
                            <Input 
                              id="companyName" 
                              value={settings.name} 
                              onChange={(e) => setSettings({...settings, name: e.target.value})} 
                              placeholder="e.g. GacalSolution"
                              className="h-11 bg-muted/20 focus:bg-background transition-colors"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="companyPhone" className="text-sm font-medium">Phone Number</Label>
                            <Input 
                              id="companyPhone" 
                              value={settings.phone} 
                              onChange={(e) => setSettings({...settings, phone: e.target.value})} 
                              placeholder="e.g. +252 61 000 0000"
                              className="h-11 bg-muted/20 focus:bg-background transition-colors"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="companyAddress" className="text-sm font-medium">Physical Address</Label>
                            <Input 
                              id="companyAddress" 
                              value={settings.address} 
                              onChange={(e) => setSettings({...settings, address: e.target.value})} 
                              placeholder="e.g. Maka Al-Mukarama, Mogadishu"
                              className="h-11 bg-muted/20 focus:bg-background transition-colors"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* POS Settings */}
                {activeTab === "pos" && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <Card className="border-border/50 shadow-sm">
                      <div className="h-2 bg-primary w-full rounded-t-xl"></div>
                      <CardHeader>
                        <CardTitle className="text-2xl">Point of Sale (POS)</CardTitle>
                        <CardDescription>Configure how your sales terminal operates.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <Label htmlFor="currency" className="text-sm font-medium">Base Currency Symbol</Label>
                            <Input 
                              id="currency" 
                              value={settings.currency} 
                              onChange={(e) => setSettings({...settings, currency: e.target.value})} 
                              placeholder="e.g. USD, $, SO.SH"
                              className="h-11 max-w-[200px]"
                            />
                            <p className="text-xs text-muted-foreground">This symbol will be displayed next to all prices.</p>
                          </div>

                          <div className="space-y-3">
                            <Label htmlFor="taxRate" className="text-sm font-medium">Default Tax Rate (%)</Label>
                            <Input 
                              id="taxRate" 
                              type="number"
                              step="0.1"
                              min="0"
                              value={settings.taxRate} 
                              onChange={(e) => setSettings({...settings, taxRate: parseFloat(e.target.value) || 0})} 
                              className="h-11 max-w-[200px]"
                            />
                            <p className="text-xs text-muted-foreground">Applied automatically to applicable sales.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-2xl">Receipt Configuration</CardTitle>
                        <CardDescription>Customize the paper receipts printed for customers.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4 max-w-2xl">
                          <div className="space-y-2">
                            <Label htmlFor="receiptFooter" className="text-sm font-medium">Receipt Footer Message</Label>
                            <textarea 
                              id="receiptFooter" 
                              value={settings.receiptFooter} 
                              onChange={(e) => setSettings({...settings, receiptFooter: e.target.value})} 
                              placeholder="Thank you for shopping with us! Please come again."
                              className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <p className="text-xs text-muted-foreground">This text will be printed at the very bottom of every thermal receipt.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
