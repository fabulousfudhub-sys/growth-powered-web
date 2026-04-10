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

export default function AddStudentDialog({ open, onOpenChange }: Props) {
  const [form, setForm] = useState({
    name: "",
    regNumber: "",
    email: "",
    departmentId: "",
    level: "",
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

  const selectedDept = departments.find((d) => d.id === form.departmentId);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.regNumber.trim()) {
      toast.error("Name and Reg. Number are required");
      return;
    }
    try {
      await api.createUser({
        name: form.name,
        email: form.email || undefined,
        password: "student123",
        role: "student",
        regNumber: form.regNumber,
        departmentId: form.departmentId,
        level: form.level,
      });
      toast.success(
        `Student "${form.name}" registered with Reg. Number ${form.regNumber}`,
      );
      onOpenChange(false);
      setForm({
        name: "",
        regNumber: "",
        email: "",
        departmentId: "",
        level: "",
      });
    } catch {
      toast.error("Failed to add student");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
          <DialogDescription>
            Register a new student in the system
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Aisha Mohammed"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>
              Registration Number <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. ND/CSC/22/004"
              value={form.regNumber}
              onChange={(e) => update("regNumber", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email (optional)</Label>
            <Input
              type="email"
              placeholder="student@email.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.departmentId}
                onValueChange={(v) => {
                  update("departmentId", v);
                  update("level", "");
                }}
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
                  {(selectedDept?.levels || ["ND1", "ND2", "HND1", "HND2"]).map(
                    (l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!form.name.trim() || !form.regNumber.trim()}
          >
            Add Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
