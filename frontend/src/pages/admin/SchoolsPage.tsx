import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { School, Department } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, School as SchoolIcon, Building2, Pencil, Trash2, Check, X } from 'lucide-react';
import AddSchoolDialog from '@/components/dialogs/AddSchoolDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteSchool, setDeleteSchool] = useState<School | null>(null);
  const [editSchool, setEditSchool] = useState<School | null>(null);
  const [editName, setEditName] = useState('');

  const load = () => { api.getSchools().then(setSchools); api.getDepartments().then(setDepartments); };
  useEffect(load, []);

  const handleDelete = async () => {
    if (!deleteSchool) return;
    try {
      await api.deleteSchool(deleteSchool.id);
      toast.success('School deleted');
      setSchools(prev => prev.filter(s => s.id !== deleteSchool.id));
    } catch (err: any) { toast.error(err.message || 'Failed to delete school'); }
    setDeleteSchool(null);
  };

  const handleEdit = (s: School) => { setEditSchool(s); setEditName(s.name); };
  const handleSaveEdit = async () => {
    if (!editSchool || !editName.trim()) return;
    try {
      await api.updateSchool(editSchool.id, editName.trim());
      toast.success('School updated');
      setSchools(prev => prev.map(s => s.id === editSchool.id ? { ...s, name: editName.trim() } : s));
    } catch (err: any) { toast.error(err.message || 'Failed to update school'); }
    setEditSchool(null);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Schools (Faculties)</h1><p className="text-sm text-muted-foreground">Manage academic schools / faculties</p></div>
        <Button className="gap-2" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add School</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {schools.map(s => {
          const depts = departments.filter(d => d.school === s.name);
          const isEditing = editSchool?.id === s.id;
          return (
            <Card key={s.id} className="hover:shadow-md transition-shadow border-border/40">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><SchoolIcon className="w-5 h-5 text-primary" /></div>
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input value={editName} onChange={e => setEditName(e.target.value)} className="h-8" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveEdit()} />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={handleSaveEdit}><Check className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditSchool(null)}><X className="w-4 h-4" /></Button>
                      </div>
                    ) : <CardTitle className="text-base">{s.name}</CardTitle>}
                  </div>
                  {!isEditing && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(s)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteSchool(s)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{depts.length} department{depts.length !== 1 ? 's' : ''}</p>
                <div className="space-y-2">
                  {depts.map(d => (
                    <div key={d.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                      <Building2 className="w-4 h-4 text-muted-foreground" /><span className="text-sm text-foreground">{d.name}</span>
                      <div className="ml-auto flex gap-1">{d.programmes.map(p => <Badge key={p} variant="outline" className="text-xs">{p}</Badge>)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <AlertDialog open={!!deleteSchool} onOpenChange={() => setDeleteSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete School</AlertDialogTitle><AlertDialogDescription>Are you sure you want to delete "{deleteSchool?.name}"? This will also delete all departments and courses under it.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AddSchoolDialog open={addOpen} onOpenChange={(o) => { setAddOpen(o); if (!o) load(); }} />
    </div>
  );
}
