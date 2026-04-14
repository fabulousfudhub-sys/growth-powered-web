import { useState, useEffect } from "react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Key, ShieldCheck, ShieldX, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

interface LicenseStatus {
  active: boolean;
  licenseKey: string | null;
  expiresAt: string | null;
}

export default function LicensePage() {
  const [status, setStatus] = useState<LicenseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [licenseKey, setLicenseKey] = useState("");

  const fetchStatus = async () => {
    try {
      const s = await api.getLicenseStatus();
      setStatus(s as LicenseStatus);
    } catch {
      toast.error("Failed to check license status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;
    setActivating(true);
    try {
      await api.activateLicense(licenseKey.trim());
      toast.success("License activated successfully");
      setLicenseKey("");
      await fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate the license? The system will be locked until a new license is activated.")) return;
    setDeactivating(true);
    try {
      await api.deactivateLicense();
      toast.success("License deactivated");
      await fetchStatus();
    } catch (err: any) {
      toast.error(err.message || "Deactivation failed");
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isExpired = status?.expiresAt && new Date(status.expiresAt) < new Date();

  return (
    <div className="space-y-6 animate-slide-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">License Management</h1>
        <p className="text-sm text-muted-foreground">
          Activate or manage your system license
        </p>
      </div>

      {/* Current Status */}
      <Card className={`border-2 ${status?.active && !isExpired ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-destructive/30 bg-destructive/5'}`}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status?.active && !isExpired ? 'bg-emerald-500/10' : 'bg-destructive/10'}`}>
              {status?.active && !isExpired
                ? <ShieldCheck className="w-6 h-6 text-emerald-600" />
                : <ShieldX className="w-6 h-6 text-destructive" />
              }
            </div>
            <div>
              <CardTitle className="text-lg">License Status</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={status?.active && !isExpired ? "default" : "destructive"} className={status?.active && !isExpired ? "bg-emerald-500" : ""}>
                  {status?.active && !isExpired ? "Active" : isExpired ? "Expired" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {status?.licenseKey && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">License Key</span>
              <span className="font-mono text-sm">{status.licenseKey}</span>
            </div>
          )}
          {status?.expiresAt && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Expires</span>
              <span className={`text-sm font-medium ${isExpired ? 'text-destructive' : ''}`}>
                {new Date(status.expiresAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
              </span>
            </div>
          )}

          {isExpired && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Your license has expired. Please activate a new license key.
            </div>
          )}

          {status?.active && !isExpired && (
            <Button
              variant="outline"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleDeactivate}
              disabled={deactivating}
            >
              {deactivating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Deactivate License
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Activate New License */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">
                {status?.active ? "Update License" : "Activate License"}
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your license key to activate the system
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleActivate} className="space-y-4">
            <div className="space-y-2">
              <Label>License Key</Label>
              <Input
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="font-mono"
                required
              />
            </div>
            <Button type="submit" disabled={activating || !licenseKey.trim()} className="w-full">
              {activating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {status?.active ? "Update License" : "Activate License"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
