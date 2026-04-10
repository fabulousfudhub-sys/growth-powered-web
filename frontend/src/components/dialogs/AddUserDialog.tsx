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
import type { Department } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddUserDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const update = (key: string, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (open)
      api
        .getDepartments()
        .then(setDepartments)
        .catch(() => {});
  }, [open]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      toast.error("Name, email, and role are required");
      return;
    }
    try {
      await api.createUser({
        name: form.name,
        email: form.email,
        password: form.password || "changeme123",
        role: form.role,
        departmentId: form.departmentId || undefined,
      });
      toast.success(`User "${form.name}" created successfully!`);
      onOpenChange(false);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        departmentId: "",
      });
    } catch {
      toast.error("Failed to create user");
    }
  };

  const showDepartment =
    form.role === "examiner" ||
    form.role === "instructor" ||
    form.role === "lab_admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Staff User</DialogTitle>
          <DialogDescription>Create a new staff account</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Dr. John Doe"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              type="email"
              placeholder="staff@cbt.edu.ng"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              placeholder="Default: changeme123"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              Role <span className="text-destructive">*</span>
            </Label>
            <Select value={form.role} onValueChange={(v) => update("role", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="examiner">Examiner (Dept Level)</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="lab_admin">Lab Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {showDepartment && (
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => update("departmentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
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
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!form.name.trim() || !form.email.trim() || !form.role}
          >
            Create User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
