import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { School } from '@/lib/types';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

const allProgrammes = ['ND', 'HND'];
const allLevels = ['ND1', 'ND2', 'HND1', 'HND2'];

export default function AddDepartmentDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    if (open) api.getSchools().then(setSchools).catch(() => {});
  }, [open]);

  const toggleProgramme = (p: string) => setProgrammes(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const toggleLevel = (l: string) => setLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);

  const handleAdd = async () => {
    if (!name.trim() || !schoolId) { toast.error('Name and school are required'); return; }
    try {
      await api.createDepartment({ name, schoolId, programmes, levels });
      toast.success(`Department "${name}" added!`);
      onOpenChange(false);
      setName(''); setSchoolId(''); setProgrammes([]); setLevels([]);
    } catch { toast.error('Failed to add department'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Department</DialogTitle><DialogDescription>Add a new department under a school</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>School (Faculty) <span className="text-destructive">*</span></Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger><SelectValue placeholder="Select school" /></SelectTrigger>
              <SelectContent>{schools.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Department Name <span className="text-destructive">*</span></Label><Input placeholder="e.g. Mechanical Engineering" value={name} onChange={e => setName(e.target.value)} required /></div>
          <div className="space-y-2">
            <Label>Programmes</Label>
            <div className="flex gap-4">{allProgrammes.map(p => (
              <div key={p} className="flex items-center gap-2"><Checkbox id={`prog-${p}`} checked={programmes.includes(p)} onCheckedChange={() => toggleProgramme(p)} /><Label htmlFor={`prog-${p}`} className="text-sm cursor-pointer">{p}</Label></div>
            ))}</div>
          </div>
          <div className="space-y-2">
            <Label>Available Levels</Label>
            <div className="flex flex-wrap gap-4">{allLevels.map(l => (
              <div key={l} className="flex items-center gap-2"><Checkbox id={`lvl-${l}`} checked={levels.includes(l)} onCheckedChange={() => toggleLevel(l)} /><Label htmlFor={`lvl-${l}`} className="text-sm cursor-pointer">{l}</Label></div>
            ))}</div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim() || !schoolId}>Add Department</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
