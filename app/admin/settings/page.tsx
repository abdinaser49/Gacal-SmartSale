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
    address: ""
  })
  const [saved, setSaved] = useState(false)

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

        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Profile Settings */}
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

              <Button onClick={handleSave} className="w-full mt-4" disabled={saved}>
                {saved ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Saved Successfully
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
