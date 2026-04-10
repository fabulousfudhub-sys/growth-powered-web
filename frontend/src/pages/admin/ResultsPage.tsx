import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { ExamAttempt, Exam } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download, BarChart3, Search, TrendingUp, Users, CheckCircle,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { toast } from "sonner";

const PAGE_SIZE = 20;

export default function ResultsPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState("");
  const [filterExam, setFilterExam] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.getAttempts().then(setAttempts);
    if (user?.role === "examiner") {
      api.getExams(user.department).then(setExams);
    } else if (user?.role === "instructor") {
      api.getCourses().then((courses) => {
        const myCourses = courses.filter((c) => c.instructorId === user.id).map((c) => c.code);
        api.getExams().then((allExams) => setExams(allExams.filter((e) => myCourses.includes(e.course))));
      });
    } else {
      api.getExams().then(setExams);
    }
  }, [user]);

  const getExamTitle = (id: string) => exams.find((e) => e.id === id)?.title || "Unknown";

  const roleFilteredAttempts =
    user?.role === "examiner" || user?.role === "instructor"
      ? attempts.filter((a) => exams.some((e) => e.id === a.examId))
      : attempts;

  const filteredAttempts = roleFilteredAttempts.filter((a) => {
    const matchSearch = !search || (
      getExamTitle(a.examId).toLowerCase().includes(search.toLowerCase()) ||
      (a as any).studentName?.toLowerCase().includes(search.toLowerCase()) ||
      (a as any).regNumber?.toLowerCase().includes(search.toLowerCase())
    );
    const matchExam = filterExam === "all" || a.examId === filterExam;
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    return matchSearch && matchExam && matchStatus;
  });

  const totalPages = Math.ceil(filteredAttempts.length / PAGE_SIZE);
  const paginatedAttempts = filteredAttempts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const avgScore =
    roleFilteredAttempts.length > 0
      ? Math.round(roleFilteredAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / roleFilteredAttempts.length)
      : 0;

  const handleExport = () => {
    const csv = [
      "Student Name,Reg. Number,Exam,Score,Total Marks,Essay Score,Status,Submitted At",
      ...filteredAttempts.map(
        (a) =>
          `"${(a as any).studentName || a.studentId}","${(a as any).regNumber || ""}","${getExamTitle(a.examId)}",${a.score || 0},${a.totalMarks || 0},${(a as any).essayScore || 0},${a.status},"${a.submittedAt ? new Date(a.submittedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) : ""}"`,
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const el = document.createElement("a");
    el.href = url;
    el.download = "exam_results.csv";
    el.click();
    URL.revokeObjectURL(url);
    toast.success("Results exported");
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Results</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "instructor" ? "Results for your courses" : "View exam results and performance"}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <Users className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{roleFilteredAttempts.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Submissions</p>
        </div>
        <div className="stat-card">
          <TrendingUp className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{avgScore}%</p>
          <p className="text-xs text-muted-foreground mt-1">Average Score</p>
        </div>
        <div className="stat-card">
          <CheckCircle className="w-5 h-5 text-success mb-2" />
          <p className="text-2xl font-bold text-foreground">{roleFilteredAttempts.filter((a) => a.status === "graded").length}</p>
          <p className="text-xs text-muted-foreground mt-1">Graded</p>
        </div>
        <div className="stat-card">
          <BarChart3 className="w-5 h-5 text-warning mb-2" />
          <p className="text-2xl font-bold text-foreground">{exams.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Exams</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by exam, student name or matric..." className="pl-10"
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <Select value={filterExam} onValueChange={(v) => { setFilterExam(v); setPage(1); }}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filter by exam" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Exams</SelectItem>
            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="graded">Graded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Student Name</TableHead>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Essay Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAttempts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{(a as any).studentName || a.studentId}</TableCell>
                    <TableCell className="font-mono text-sm">{(a as any).regNumber || "—"}</TableCell>
                    <TableCell>{getExamTitle(a.examId)}</TableCell>
                    <TableCell className="font-mono font-semibold">
                      {a.score !== undefined ? (
                        <span className={a.score / (a.totalMarks || 1) >= 0.5 ? "text-success" : "text-destructive"}>
                          {a.score}/{a.totalMarks}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {(a as any).essayScore > 0 ? (a as any).essayScore : "0"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.status === "graded" ? "default" : "secondary"}>{a.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {a.submittedAt ? new Date(a.submittedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {paginatedAttempts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No results found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filteredAttempts.length} pageSize={PAGE_SIZE} />
    </div>
  );
}
