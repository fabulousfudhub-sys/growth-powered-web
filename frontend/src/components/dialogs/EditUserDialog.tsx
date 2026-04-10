import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Department, User } from "@/lib/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  isStudent?: boolean;
}

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  isStudent,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    departmentId: "",
    regNumber: "",
    level: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [saving, setSaving] = useState(false);
  const update = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (open && user) {
      api.getDepartments().then((d) => {
        setDepartments(d);
        const match = d.find((dept) => dept.name === user.department);
        setForm({
          name: user.name,
          email: user.email || "",
          role: user.role,
          password: "",
          departmentId: match?.id || "",
          regNumber: user.regNumber || "",
          level: user.level || "",
        });
      });
    }
  }, [open, user]);

  const selectedDept = departments.find((d) => d.id === form.departmentId);
  const showDepartment =
    isStudent || form.role === "examiner" || form.role === "instructor";

  const handleSave = async () => {
    if (!user || !form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!isStudent && !form.email.trim()) {
      toast.error("Email is required");
      return;
    }
    setSaving(true);
    try {
      await api.updateUser(user.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        password: form.password || undefined,
        regNumber: form.regNumber || undefined,
        departmentId: form.departmentId || undefined,
        level: form.level || undefined,
      });
      toast.success(`${isStudent ? "Student" : "User"} updated`);
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {isStudent ? "Student" : "User"}</DialogTitle>
          <DialogDescription>
            Update {isStudent ? "student" : "user"} details
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          {isStudent && (
            <div className="space-y-2">
              <Label>
                Registration Number <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.regNumber}
                onChange={(e) => update("regNumber", e.target.value)}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>
              Email{" "}
              {isStudent ? (
                "(optional)"
              ) : (
                <span className="text-destructive">*</span>
              )}
            </Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>New Password (leave blank to keep)</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          {!isStudent && (
            <div className="space-y-2">
              <Label>
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>            
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="examiner">Examiner</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {showDepartment && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department</Label>
                <Select
                  value={form.departmentId}
                  onValueChange={(v) => update("departmentId", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {isStudent && (
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select
                    value={form.level}
                    onValueChange={(v) => update("level", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        selectedDept?.levels || ["ND1", "ND2", "HND1", "HND2"]
                      ).map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save
            Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
