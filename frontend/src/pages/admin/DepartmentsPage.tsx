import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Department, Course } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2, BookOpen, Pencil, Trash2 } from 'lucide-react';
import AddDepartmentDialog from '@/components/dialogs/AddDepartmentDialog';
import EditDepartmentDialog from '@/components/dialogs/EditDepartmentDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [deleteDept, setDeleteDept] = useState<Department | null>(null);

  const load = () => {
    if (user?.role === 'examiner') {
      api.getDepartments().then(depts => setDepartments(depts.filter(d => d.name === user.department)));
      api.getCourses(user.department).then(setCourses);
    } else { api.getDepartments().then(setDepartments); api.getCourses().then(setCourses); }
  };
  useEffect(load, [user]);

  const canAdd = user?.role === 'super_admin' || user?.role === 'admin';

  const handleDelete = async () => {
    if (!deleteDept) return;
    try {
      await api.deleteDepartment(deleteDept.id);
      toast.success('Department deleted');
      setDepartments(prev => prev.filter(d => d.id !== deleteDept.id));
    } catch (err: any) { toast.error(err.message || 'Failed to delete department'); }
    setDeleteDept(null);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{user?.role === 'examiner' ? 'Department Overview' : 'Departments'}</h1><p className="text-sm text-muted-foreground">{user?.role === 'examiner' ? `Manage ${user.department}` : 'Manage departments across schools'}</p></div>
        {canAdd && <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Department</Button>}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {departments.map(d => {
          const deptCourses = courses.filter(c => c.department === d.name);
          return (
            <Card key={d.id} className="hover:shadow-md transition-shadow border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5 text-primary" /></div>
                    <div><CardTitle className="text-base">{d.name}</CardTitle><p className="text-sm text-muted-foreground">{d.school}</p></div>
                  </div>
                  {canAdd && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditDept(d)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteDept(d)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1"><span className="text-xs text-muted-foreground mr-1">Programmes:</span>{d.programmes.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                <div className="flex flex-wrap gap-1"><span className="text-xs text-muted-foreground mr-1">Levels:</span>{d.levels.map(l => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)}</div>
                <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground"><span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {deptCourses.length} courses</span></div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <AlertDialog open={!!deleteDept} onOpenChange={() => setDeleteDept(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Department</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{deleteDept?.name}"? This will also delete all courses under it.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {canAdd && <AddDepartmentDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) load(); }} />}
      <EditDepartmentDialog open={!!editDept} onOpenChange={(o) => { if (!o) { setEditDept(null); load(); } }} department={editDept} />
    </div>
  );
}
