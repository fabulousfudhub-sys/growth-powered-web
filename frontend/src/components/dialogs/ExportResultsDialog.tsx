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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import type { Exam } from "@/lib/types";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportResultsDialog({ open, onOpenChange }: Props) {
  const [exam, setExam] = useState("all");
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (open)
      api
        .getExams()
        .then(setExams)
        .catch(() => {});
  }, [open]);

  const handleExport = async () => {
    try {
      const attempts = await api.getAttempts(exam !== "all" ? exam : undefined);
      const examTitle =
        exam !== "all"
          ? exams.find((e) => e.id === exam)?.title || ""
          : "all_exams";
      const csv = [
        "Student Name,Reg. Number,Exam,Score,Total Marks,Status,Submitted At",
        ...attempts.map(
          (a) =>
            `"${(a as any).studentName || a.studentId}","${(a as any).regNumber || ""}","${(a as any).examTitle || ""}",${a.score || 0},${a.totalMarks || 0},${a.status},"${a.submittedAt ? new Date(a.submittedAt).toLocaleString() : ""}"`,
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const el = document.createElement("a");
      el.href = url;
      el.download = `results_${examTitle}.csv`;
      el.click();
      URL.revokeObjectURL(url);
      toast.success("Results exported");
      onOpenChange(false);
    } catch {
      toast.error("Export failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Results</DialogTitle>
          <DialogDescription>Download exam results as CSV</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Exam</Label>
            <Select value={exam} onValueChange={setExam}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
