import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { School, Department } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

const allProgrammes = ['ND', 'HND'];
const allLevels = ['ND1', 'ND2', 'HND1', 'HND2'];

export default function EditDepartmentDialog({ open, onOpenChange, department }: Props) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && department) {
      setName(department.name);
      setProgrammes(department.programmes || []);
      setLevels(department.levels || []);
      api.getSchools().then(s => {
        setSchools(s);
        const match = s.find(sc => sc.name === department.school);
        if (match) setSchoolId(match.id);
      });
    }
  }, [open, department]);

  const toggleProgramme = (p: string) => setProgrammes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleLevel = (l: string) => setLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const handleSave = async () => {
    if (!department || !name.trim() || !schoolId) { toast.error('Fill in all required fields'); return; }
    setSaving(true);
    try {
      await api.updateDepartment(department.id, { name: name.trim(), schoolId, programmes, levels });
      toast.success('Department updated');
      onOpenChange(false);
    } catch (err: any) { toast.error(err.message || 'Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Department</DialogTitle><DialogDescription>Update department details</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>School (Faculty) <span className="text-destructive">*</span></Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
              <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Department Name <span className="text-destructive">*</span></Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="space-y-2">
            <Label>Programmes</Label>
            <div className="flex gap-4">{allProgrammes.map(p => (
              <div key={p} className="flex items-center gap-2"><Checkbox id={`edit-prog-${p}`} checked={programmes.includes(p)} onCheckedChange={() => toggleProgramme(p)} /><Label htmlFor={`edit-prog-${p}`} className="text-sm cursor-pointer">{p}</Label></div>
            ))}</div>
          </div>
          <div className="space-y-2">
            <Label>Available Levels</Label>
            <div className="flex flex-wrap gap-4">{allLevels.map(l => (
              <div key={l} className="flex items-center gap-2"><Checkbox id={`edit-lvl-${l}`} checked={levels.includes(l)} onCheckedChange={() => toggleLevel(l)} /><Label htmlFor={`edit-lvl-${l}`} className="text-sm cursor-pointer">{l}</Label></div>
            ))}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
