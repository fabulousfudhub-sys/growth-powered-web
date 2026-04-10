import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Building2, Settings2, Upload, Palette, Image, Loader2, Power, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export interface SiteSettings {
  institutionName: string;
  acronym: string;
  siteName: string;
  tagline: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  studentBgUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  autoSubmitOnTimeout: boolean;
  antiCheat: boolean;
  showScoreAfterExam: boolean;
  allowRetake: boolean;
}

const defaultSettings: SiteSettings = {
  institutionName: "Abubakar Tatari Ali Polytechnic, Bauchi",
  acronym: "ATAPOLY",
  siteName: "ATAPOLY CBT",
  tagline: "Computer Based Testing Platform",
  primaryColor: "#2563eb",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  studentBgUrl: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  shuffleQuestions: true,
  shuffleOptions: true,
  autoSubmitOnTimeout: true,
  antiCheat: true,
  showScoreAfterExam: true,
  allowRetake: false,
};

// Cached settings for use across components
let cachedSettings: SiteSettings | null = null;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cachedSettings) return cachedSettings;
  try {
    const saved = await api.getSiteSettings();
    cachedSettings = { ...defaultSettings, ...saved };
    return cachedSettings;
  } catch {
    return defaultSettings;
  }
}

export function getCachedSiteSettings(): SiteSettings {
  return cachedSettings || defaultSettings;
}

// Force refresh from server (invalidate cache)
export async function refreshSiteSettings(): Promise<SiteSettings> {
  cachedSettings = null;
  return getSiteSettings();
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [systemLocked, setSystemLocked] = useState(false);
  const [systemDeactivated, setSystemDeactivated] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
    getSiteSettings().then((s) => { setSettings(s); setLoading(false); });
    api.getSystemStatus().then(s => {
      setSystemLocked(s.locked);
      setSystemDeactivated(s.deactivated);
    }).catch(() => {});
  }, []);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    toast.success("Password updated!");
    setOldPassword(""); setNewPassword(""); setConfirmPassword("");
  };

  const updateSetting = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.saveSiteSettings(settings);
      cachedSettings = settings;
      // Update favicon dynamically
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link && settings.faviconUrl) link.href = settings.faviconUrl;
      if (settings.siteName) document.title = settings.siteName;
      // Dispatch event so other pages can react
      window.dispatchEvent(new CustomEvent('cbt-settings-changed', { detail: settings }));
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (key: 'logoUrl' | 'faviconUrl' | 'studentBgUrl') => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File too large (max 5MB)"); return; }
    setUploading(key);
    try {
      const { url } = await api.uploadFile(file);
      updateSetting(key, url);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const isSuperAdmin = user?.role === "super_admin";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">
          {isSuperAdmin ? "Configure system-wide settings" : "Manage your account"}
        </p>
      </div>

      {/* Change Password - visible to all */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription className="text-xs">Update your account password</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showOldPass ? "text" : "password"} placeholder="Enter current password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="pr-10" required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground" onClick={() => setShowOldPass(!showOldPass)} tabIndex={-1}>
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <div className="relative">
                  <Input type={showNewPass ? "text" : "password"} placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pr-10" required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground" onClick={() => setShowNewPass(!showNewPass)} tabIndex={-1}>
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Input type={showConfirmPass ? "text" : "password"} placeholder="Re-enter" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pr-10" required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground" onClick={() => setShowConfirmPass(!showConfirmPass)} tabIndex={-1}>
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <>
          {/* Institution Details */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Institution Details</CardTitle>
                  <CardDescription className="text-xs">Configure institution info & contact</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Institution Name</Label><Input value={settings.institutionName} onChange={e => updateSetting('institutionName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Acronym</Label><Input value={settings.acronym} onChange={e => updateSetting('acronym', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Contact Email</Label><Input type="email" value={settings.contactEmail} onChange={e => updateSetting('contactEmail', e.target.value)} placeholder="admin@example.com" /></div>
                <div className="space-y-2"><Label>Contact Phone</Label><Input value={settings.contactPhone} onChange={e => updateSetting('contactPhone', e.target.value)} placeholder="+234..." /></div>
              </div>
              <div className="space-y-2"><Label>Address</Label><Textarea rows={2} value={settings.address} onChange={e => updateSetting('address', e.target.value)} placeholder="Institution address" /></div>
            </CardContent>
          </Card>

          {/* Branding & Appearance */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">Branding & Appearance</CardTitle>
                  <CardDescription className="text-xs">Logo, favicon, colors & branding</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Site Name</Label><Input value={settings.siteName} onChange={e => updateSetting('siteName', e.target.value)} /></div>
                <div className="space-y-2"><Label>Tagline</Label><Input value={settings.tagline} onChange={e => updateSetting('tagline', e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-3">
                    {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded border" />}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors">
                        {uploading === 'logoUrl' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('logoUrl')} disabled={!!uploading} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-3">
                    {settings.faviconUrl && <img src={settings.faviconUrl} alt="Favicon" className="w-8 h-8 object-contain rounded border" />}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors">
                        {uploading === 'faviconUrl' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
                      </div>
                      <input type="file" accept="image/*,.ico" className="hidden" onChange={handleFileUpload('faviconUrl')} disabled={!!uploading} />
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student Login BG</Label>
                  <div className="flex items-center gap-3">
                    {settings.studentBgUrl && <img src={settings.studentBgUrl} alt="BG" className="w-10 h-10 object-cover rounded border" />}
                    <label className="cursor-pointer">
                      <div className="flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted transition-colors">
                        {uploading === 'studentBgUrl' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Image className="w-4 h-4" />} Upload
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload('studentBgUrl')} disabled={!!uploading} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Brand Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings.primaryColor} onChange={e => updateSetting('primaryColor', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                  <Input value={settings.primaryColor} onChange={e => updateSetting('primaryColor', e.target.value)} className="w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Exam Defaults */}
          <Card className="border-border/40 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Settings2 className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-base">Exam Defaults</CardTitle>
                  <CardDescription className="text-xs">Default settings for new exams</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { key: 'shuffleQuestions' as const, label: "Shuffle Questions", desc: "Randomize question order per student" },
                { key: 'shuffleOptions' as const, label: "Shuffle Options", desc: "Randomize MCQ option order" },
                { key: 'autoSubmitOnTimeout' as const, label: "Auto-submit on timeout", desc: "Automatically submit when time expires" },
                { key: 'antiCheat' as const, label: "Anti-cheat measures", desc: "Disable copy/paste, right-click during exams" },
                { key: 'showScoreAfterExam' as const, label: "Show score after exam", desc: "Display score to student immediately after submission" },
                { key: 'allowRetake' as const, label: "Allow exam retake", desc: "Allow students to retake exams (requires admin reset)" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-sm">{item.label}</Label>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={settings[item.key]} onCheckedChange={v => updateSetting(item.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Button onClick={saveSettings} disabled={saving} className="w-full" size="lg">
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save All Settings
          </Button>

          {/* System Lock & Deactivation */}
          <Card className="border-destructive/30 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-base">System Controls</CardTitle>
                  <CardDescription className="text-xs">Lock operations or deactivate the system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Operation Lock */}
              <div className="flex items-center justify-between py-3 border-b border-border/40">
                <div>
                  <Label className="text-sm font-medium">Lock Create/Edit Operations</Label>
                  <p className="text-xs text-muted-foreground">Prevents all users (except Super Admin) from creating or editing records</p>
                </div>
                <div className="flex items-center gap-2">
                  {lockLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Switch
                    checked={systemLocked}
                    onCheckedChange={async (checked) => {
                      setLockLoading(true);
                      try {
                        await api.setSystemLock(checked);
                        setSystemLocked(checked);
                        toast.success(checked ? 'System operations locked' : 'System operations unlocked');
                      } catch {
                        toast.error('Failed to update lock');
                      } finally {
                        setLockLoading(false);
                      }
                    }}
                    disabled={lockLoading}
                  />
                </div>
              </div>

              {/* System Deactivation - Super Admin Only */}
              {user?.role === 'super_admin' && (
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label className="text-sm font-medium text-destructive">Deactivate System</Label>
                    <p className="text-xs text-muted-foreground">Blocks all access except Super Admin (like a license toggle)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {deactivateLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <Switch
                      checked={systemDeactivated}
                      onCheckedChange={async (checked) => {
                        setDeactivateLoading(true);
                        try {
                          await api.setSystemActive(!checked);
                          setSystemDeactivated(checked);
                          toast.success(checked ? 'System deactivated' : 'System activated');
                        } catch {
                          toast.error('Failed to update system status');
                        } finally {
                          setDeactivateLoading(false);
                        }
                      }}
                      disabled={deactivateLoading}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
