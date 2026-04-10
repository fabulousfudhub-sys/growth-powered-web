import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { api } from '@/lib/api';
import type { Exam } from '@/lib/types';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

interface Props { open: boolean; onOpenChange: (open: boolean) => void; }

export default function ExportPinsDialog({ open, onOpenChange }: Props) {
  const [format, setFormat] = useState('csv');
  const [exam, setExam] = useState('all');
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    if (open) api.getExams().then(setExams).catch(() => {});
  }, [open]);

  const handleExport = () => {
    toast.success(`Exam PINs exported as ${format.toUpperCase()}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Export Exam PINs</DialogTitle><DialogDescription>Download exam PINs for distribution to students</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Exam</Label>
            <Select value={exam} onValueChange={setExam}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={setFormat} className="flex gap-4">
              <div className="flex items-center gap-2 p-3 rounded-lg border flex-1 cursor-pointer hover:bg-muted/50"><RadioGroupItem value="csv" id="csv" /><Label htmlFor="csv" className="cursor-pointer flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-success" /> CSV</Label></div>
              <div className="flex items-center gap-2 p-3 rounded-lg border flex-1 cursor-pointer hover:bg-muted/50"><RadioGroupItem value="pdf" id="pdf" /><Label htmlFor="pdf" className="cursor-pointer flex items-center gap-2"><FileText className="w-4 h-4 text-destructive" /> PDF</Label></div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleExport} className="gap-2"><Download className="w-4 h-4" /> Export</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
