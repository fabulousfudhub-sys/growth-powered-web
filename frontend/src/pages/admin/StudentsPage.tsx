import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { User, Department } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Upload, Search, UserPlus, Eye, Pencil, Trash2, ChevronRight, Building2, GraduationCap, Users } from "lucide-react";
import AddStudentDialog from "@/components/dialogs/AddStudentDialog";
import EditUserDialog from "@/components/dialogs/EditUserDialog";
import ImportCSVDialog from "@/components/dialogs/ImportCSVDialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<User | null>(null);
  const [previewStudent, setPreviewStudent] = useState<User | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<User | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = () => {
    api.getStudents().then((all) => {
      setStudents(user?.role === "examiner" ? all.filter((s) => s.department === user.department) : all);
    }).catch(() => toast.error("Could not load students"));
    api.getDepartments().then(setDepartments).catch(() => {});
  };
  useEffect(load, [user]);

  const levels = [...new Set(students.map(s => s.level).filter(Boolean))].sort();

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.department?.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept === "all" || s.department === filterDept;
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchDept && matchLevel;
  });

  // Group: Department → Level → Students
  const grouped = useMemo(() => {
    const map = new Map<string, Map<string, User[]>>();
    for (const s of filtered) {
      const dept = s.department || "Unknown";
      const level = s.level || "Unknown";
      if (!map.has(dept)) map.set(dept, new Map());
      const levelMap = map.get(dept)!;
      if (!levelMap.has(level)) levelMap.set(level, []);
      levelMap.get(level)!.push(s);
    }
    return map;
  }, [filtered]);

  const toggle = (k: string) => setExpanded(prev => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleDelete = async () => {
    if (!deleteStudent) return;
    try {
      await api.deleteUser(deleteStudent.id);
      toast.success("Student deleted");
      setStudents((prev) => prev.filter((s) => s.id !== deleteStudent.id));
    } catch {
      toast.error("Failed to delete student");
    }
    setDeleteStudent(null);
  };

  const handleBulkDelete = async () => {
    let deleted = 0;
    for (const id of selected) {
      try { await api.deleteUser(id); deleted++; } catch {}
    }
    toast.success(`${deleted} student(s) deleted`);
    setSelected(new Set());
    setBulkDeleteOpen(false);
    load();
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "examiner" ? `Students in ${user.department}` : "Grouped by department and level"}
          </p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
              Delete {selected.size} Selected
            </Button>
          )}
          <Button variant="outline" className="gap-2" onClick={() => setImportOpen(true)}>
            <Upload className="w-4 h-4" /> Import CSV
          </Button>
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Students</p>
        </div>
        <div className="stat-card">
          <Building2 className="w-5 h-5 text-accent mb-2" />
          <p className="text-2xl font-bold text-foreground">{grouped.size}</p>
          <p className="text-xs text-muted-foreground mt-1">Departments</p>
        </div>
        <div className="stat-card">
          <GraduationCap className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{levels.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Levels</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterLevel} onValueChange={setFilterLevel}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {levels.map(l => <SelectItem key={l} value={l!}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Nested Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-10"></TableHead>
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Reg. Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.size === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">No students found</TableCell></TableRow>
            )}
            {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([dept, levelMap]) => {
              const deptKey = `d-${dept}`;
              const isDeptOpen = expanded.has(deptKey);
              const deptCount = Array.from(levelMap.values()).reduce((s, arr) => s + arr.length, 0);

              return (
                <>
                  {/* Department Header */}
                  <TableRow key={deptKey} className="bg-primary/5 hover:bg-primary/10 cursor-pointer border-t-2 border-border" onClick={() => toggle(deptKey)}>
                    <TableCell className="px-3">
                      <ChevronRight className={`w-4 h-4 text-primary transition-transform ${isDeptOpen ? "rotate-90" : ""}`} />
                    </TableCell>
                    <TableCell colSpan={6}>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-foreground">{dept}</span>
                        <Badge variant="secondary" className="text-xs">{deptCount} student{deptCount !== 1 ? "s" : ""}</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  {isDeptOpen && Array.from(levelMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([level, studs]) => {
                    const lvlKey = `l-${dept}-${level}`;
                    const isLvlOpen = expanded.has(lvlKey);
                    return (
                      <>
                        {/* Level Sub-header */}
                        <TableRow key={lvlKey} className="bg-muted/15 hover:bg-muted/25 cursor-pointer" onClick={() => toggle(lvlKey)}>
                          <TableCell></TableCell>
                          <TableCell className="px-3">
                            <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isLvlOpen ? "rotate-90" : ""}`} />
                          </TableCell>
                          <TableCell colSpan={5}>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-accent" />
                              <span className="text-sm font-medium text-foreground">{level}</span>
                              <span className="text-xs text-muted-foreground">({studs.length})</span>
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Student Rows */}
                        {isLvlOpen && studs.map(s => (
                          <TableRow key={s.id} className="hover:bg-muted/10">
                            <TableCell></TableCell>
                            <TableCell>
                              <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleSelect(s.id)} />
                            </TableCell>
                            <TableCell className="font-medium">{s.name}</TableCell>
                            <TableCell className="font-mono text-sm">{s.regNumber}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[180px]">{s.email || "—"}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">
                              {s.lastLogin ? new Date(s.lastLogin).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setPreviewStudent(s); }}><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditStudent(s); }}><Pencil className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteStudent(s); }}><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewStudent} onOpenChange={() => setPreviewStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>{previewStudent?.regNumber}</DialogDescription>
          </DialogHeader>
          {previewStudent && (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-muted"><strong>Name:</strong> {previewStudent.name}</div>
              <div className="p-3 rounded-lg bg-muted"><strong>Email:</strong> {previewStudent.email}</div>
              <div className="p-3 rounded-lg bg-muted"><strong>Department:</strong> {previewStudent.department}</div>
              <div className="p-3 rounded-lg bg-muted"><strong>Level:</strong> {previewStudent.level}</div>
              <div className="p-3 rounded-lg bg-muted"><strong>Last Login:</strong> {previewStudent.lastLogin ? new Date(previewStudent.lastLogin).toLocaleString("en-NG", { timeZone: "Africa/Lagos" }) : "Never"}</div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewStudent(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialogs */}
      <AlertDialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete "{deleteStudent?.name}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selected.size} Students</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove all selected students.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete All</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddStudentDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) load(); }} />
      <EditUserDialog open={!!editStudent} onOpenChange={(o) => { if (!o) { setEditStudent(null); load(); } }} user={editStudent} isStudent />
      <ImportCSVDialog open={importOpen} onOpenChange={(o) => { setImportOpen(o); if (!o) load(); }} type="students" />
    </div>
  );
}
