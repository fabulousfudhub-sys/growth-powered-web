import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Eye, EyeOff, Lock, Building2, Settings2, Upload, Palette, Image, Loader2,
  Power, ShieldAlert, Database, RefreshCw, CheckCircle, XCircle, Wifi,
} from "lucide-react";
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

export async function refreshSiteSettings(): Promise<SiteSettings> {
  cachedSettings = null;
  return getSiteSettings();
}

// ── Sync Config Sub-component ──
function SyncConfigSection() {
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const [syncForm, setSyncForm] = useState({
    onlineDbHost: '', onlineDbPort: '5432', onlineDbName: 'postgres',
    onlineDbUser: 'postgres', onlineDbPassword: '', onlineDbSsl: true,
    syncInterval: '18000000', autoSync: false,
  });
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    api.getDbConfig().then((cfg: any) => {
      setDbConfig(cfg);
      if (cfg.sync) {
        setSyncForm({
          onlineDbHost: cfg.sync.onlineDbHost || '',
          onlineDbPort: String(cfg.sync.onlineDbPort || 5432),
          onlineDbName: cfg.sync.onlineDbName || 'postgres',
          onlineDbUser: cfg.sync.onlineDbUser || 'postgres',
          onlineDbPassword: '',
          onlineDbSsl: cfg.sync.onlineDbSsl !== false,
          syncInterval: String(cfg.sync.syncInterval || 18000000),
          autoSync: cfg.sync.autoSync || false,
        });
      }
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error("Could not load database config"); });
  }, []);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await api.testSyncConnection({
        host: syncForm.onlineDbHost,
        port: syncForm.onlineDbPort,
        database: syncForm.onlineDbName,
        user: syncForm.onlineDbUser,
        password: syncForm.onlineDbPassword,
        ssl: syncForm.onlineDbSsl,
      });
      setTestResult({ success: true, message: `Connected to ${result.database} at ${result.time}` });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  const saveSyncConfig = async () => {
    setSaving(true);
    try {
      await api.saveSyncConfig(syncForm);
      toast.success("Sync configuration saved");
    } catch {
      toast.error("Failed to save sync configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Card className="border-border/40"><CardContent className="py-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></CardContent></Card>;

  const intervalMinutes = Math.round(parseInt(syncForm.syncInterval) / 60000);

  return (
    <>
      {/* Primary Database Info */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Primary Database</CardTitle>
              <CardDescription className="text-xs">Current database connection</CardDescription>
            </div>
            {dbConfig?.primary && (
              <Badge variant={dbConfig.primary.isLocal ? "secondary" : "default"} className="text-xs">
                {dbConfig.primary.isLocal ? "Local" : "Remote / Supabase"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {dbConfig?.primary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Host</p>
                <p className="font-mono font-medium truncate">{dbConfig.primary.host}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Port</p>
                <p className="font-mono font-medium">{dbConfig.primary.port}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Database</p>
                <p className="font-mono font-medium truncate">{dbConfig.primary.database}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">SSL</p>
                <p className="font-medium">{dbConfig.primary.ssl ? "Enabled" : "Disabled"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync Configuration */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-accent" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Sync Configuration</CardTitle>
              <CardDescription className="text-xs">
                Configure the remote database for offline ↔ online synchronization
              </CardDescription>
            </div>
            {dbConfig?.sync?.configured && (
              <Badge variant="outline" className="text-xs gap-1">
                <Wifi className="w-3 h-3" /> Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Remote DB Host</Label>
              <Input
                placeholder="db.abcdef.supabase.co"
                value={syncForm.onlineDbHost}
                onChange={e => setSyncForm(p => ({ ...p, onlineDbHost: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                placeholder="5432"
                value={syncForm.onlineDbPort}
                onChange={e => setSyncForm(p => ({ ...p, onlineDbPort: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Database Name</Label>
              <Input
                placeholder="postgres"
                value={syncForm.onlineDbName}
                onChange={e => setSyncForm(p => ({ ...p, onlineDbName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                placeholder="postgres"
                value={syncForm.onlineDbUser}
                onChange={e => setSyncForm(p => ({ ...p, onlineDbUser: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={syncForm.onlineDbPassword}
                onChange={e => setSyncForm(p => ({ ...p, onlineDbPassword: e.target.value }))}
                className="pr-10"
              />
              <Button type="button" variant="ghost" size="icon"
                className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground"
                onClick={() => setShowPass(!showPass)} tabIndex={-1}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Leave blank to keep existing password</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm">SSL Connection</Label>
                <p className="text-xs text-muted-foreground">Required for Supabase</p>
              </div>
              <Switch
                checked={syncForm.onlineDbSsl}
                onCheckedChange={v => setSyncForm(p => ({ ...p, onlineDbSsl: v }))}
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label className="text-sm">Auto-Sync</Label>
                <p className="text-xs text-muted-foreground">Sync when internet is detected</p>
              </div>
              <Switch
                checked={syncForm.autoSync}
                onCheckedChange={v => setSyncForm(p => ({ ...p, autoSync: v }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Sync Interval</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                className="w-32"
                value={intervalMinutes}
                onChange={e => setSyncForm(p => ({ ...p, syncInterval: String(parseInt(e.target.value || '300') * 60000) }))}
                min={5}
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </div>

          {testResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-destructive/10 text-destructive'}`}>
              {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {testResult.message}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={testConnection} disabled={testing || !syncForm.onlineDbHost} className="gap-2">
              {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
              Test Connection
            </Button>
            <Button onClick={saveSyncConfig} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              Save Sync Config
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ── Main Settings Page ──
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
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link && settings.faviconUrl) link.href = settings.faviconUrl;
      if (settings.siteName) document.title = settings.siteName;
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

      {/* Change Password */}
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

          {/* Branding */}
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

          {/* Database & Sync Config */}
          <SyncConfigSection />

          {/* System Controls */}
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
