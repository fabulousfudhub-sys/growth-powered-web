import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GraduationCap, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/pages/admin/SettingsPage";

export default function StaffLoginPage() {
  const { loginStaff, isLoading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [site, setSite] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSite);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginStaff(email, password);
  };

  const logoUrl = site?.logoUrl || "/logo.png";
  const siteName = site?.acronym || "ATAPOLY";
  const tagline = site?.tagline || "Staff Administration Portal";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="w-full max-w-md animate-slide-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 shadow-lg mb-4">
            <img
              src={logoUrl}
              alt={`${siteName} Logo`}
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <GraduationCap className="w-10 h-10 text-primary hidden" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {site?.siteName || "ATAPOLY CBT"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Staff Administration Portal
          </p>
        </div>

        <Card className="border-border/60 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Staff Login</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="staff@cbt.edu.ng" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass">Password</Label>
                <div className="relative">
                  <Input id="pass" type={showPassword ? "text" : "password"} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" required />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-11 font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
