import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Course } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import AddCourseDialog from '@/components/dialogs/AddCourseDialog';
import EditCourseDialog from '@/components/dialogs/EditCourseDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  const load = () => {
    if (user?.role === 'instructor') {
      api.getCourses().then(cs => setCourses(cs.filter(c => c.instructorId === user.id)));
    } else { api.getCourses().then(setCourses); }
  };
  useEffect(load, [user]);

  const canAdd = user?.role === 'super_admin' || user?.role === 'admin';

  const handleDelete = async () => {
    if (!deleteCourse) return;
    try {
      await api.deleteCourse(deleteCourse.id);
      toast.success('Course deleted');
      setCourses(prev => prev.filter(c => c.id !== deleteCourse.id));
    } catch (err: any) { toast.error(err.message || 'Failed to delete course'); }
    setDeleteCourse(null);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">{user?.role === 'instructor' ? 'My Courses' : 'Courses'}</h1><p className="text-sm text-muted-foreground">{user?.role === 'instructor' ? 'Courses assigned to you' : 'Manage course catalog'}</p></div>
        {canAdd && <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Course</Button>}
      </div>
      <Card className="border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Department</TableHead><TableHead>Programme</TableHead><TableHead>Level</TableHead>{user?.role !== 'instructor' && <TableHead>Instructor</TableHead>}<TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {courses.map(c => (
                <TableRow key={c.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{c.code}</Badge></TableCell>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell>{c.department}</TableCell>
                  <TableCell><Badge variant="secondary">{c.programme}</Badge></TableCell>
                  <TableCell>{c.level}</TableCell>
                  {user?.role !== 'instructor' && <TableCell>{c.instructor}</TableCell>}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewCourse(c)}><Eye className="w-4 h-4" /></Button>
                      {canAdd && <>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditCourse(c)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteCourse(c)}><Trash2 className="w-4 h-4" /></Button>
                      </>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!previewCourse} onOpenChange={() => setPreviewCourse(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{previewCourse?.code} — {previewCourse?.title}</DialogTitle><DialogDescription>Course details</DialogDescription></DialogHeader>
          {previewCourse && <div className="space-y-3 text-sm">
            <div className="p-3 rounded-lg bg-muted"><strong>School:</strong> {previewCourse.school}</div>
            <div className="p-3 rounded-lg bg-muted"><strong>Department:</strong> {previewCourse.department}</div>
            <div className="p-3 rounded-lg bg-muted"><strong>Programme:</strong> {previewCourse.programme}</div>
            <div className="p-3 rounded-lg bg-muted"><strong>Level:</strong> {previewCourse.level}</div>
            <div className="p-3 rounded-lg bg-muted"><strong>Instructor:</strong> {previewCourse.instructor}</div>
          </div>}
          <DialogFooter><Button variant="outline" onClick={() => setPreviewCourse(null)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteCourse} onOpenChange={() => setDeleteCourse(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Course</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{deleteCourse?.code} — {deleteCourse?.title}"?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {canAdd && <AddCourseDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) load(); }} />}
      <EditCourseDialog open={!!editCourse} onOpenChange={(o) => { if (!o) { setEditCourse(null); load(); } }} course={editCourse} />
    </div>
  );
}
