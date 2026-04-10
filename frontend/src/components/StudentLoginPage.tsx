import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { getSiteSettings, type SiteSettings } from "@/pages/admin/SettingsPage";

export default function StudentLoginPage() {
  const { loginStudent, isLoading, error } = useAuth();
  const [matricNumber, setMatricNumber] = useState("");
  const [examPin, setExamPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [site, setSite] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSite);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await loginStudent(matricNumber, examPin);
  };

  const logoUrl = site?.logoUrl || "/logo.png";
  const bgUrl = site?.studentBgUrl;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={
        bgUrl
          ? {
              backgroundImage: `linear-gradient(to bottom right, hsl(var(--background) / 0.85), hsl(var(--background) / 0.9)), url(${bgUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      <div
        className={`w-full max-w-md animate-slide-in ${!bgUrl ? "bg-gradient-to-br from-background via-background to-accent/5" : ""}`}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 shadow-lg mb-4">
            <img
              src={logoUrl}
              alt={`${site?.acronym || "CBT"} Logo`}
              className="w-14 h-14 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (
                  e.target as HTMLImageElement
                ).nextElementSibling?.classList.remove("hidden");
              }}
            />
            <GraduationCap className="w-10 h-10 text-accent hidden" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            {site?.siteName || "ATAPOLY CBT"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Student Examination Portal
          </p>
        </div>

        <Card className="border-border/60 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Exam Login</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matric">Registration Number</Label>
                <Input
                  id="matric"
                  placeholder="e.g. ND/CSC/22/001"
                  value={matricNumber}
                  onChange={(e) => setMatricNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">Exam PIN</Label>
                <div className="relative">
                  <Input
                    id="pin"
                    type={showPin ? "text" : "password"}
                    maxLength={8}
                    placeholder="Enter 8-digit exam PIN"
                    value={examPin}
                    onChange={(e) => setExamPin(e.target.value)}
                    className="pr-10 font-mono tracking-widest"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full w-10 hover:bg-transparent text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPin(!showPin)}
                    tabIndex={-1}
                  >
                    {showPin ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Enter Examination
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
