import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export default function AddSchoolDialog({ open, onOpenChange }: Props) {
  const [name, setName] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('School name is required'); return; }
    try {
      await api.createSchool(name);
      toast.success(`School "${name}" added!`);
      onOpenChange(false);
      setName('');
    } catch { toast.error('Failed to add school'); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add School (Faculty)</DialogTitle>
          <DialogDescription>Add a new school / faculty to the polytechnic</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>School Name <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. School of Environmental Studies" value={name} onChange={e => setName(e.target.value)} required />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>Add School</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
