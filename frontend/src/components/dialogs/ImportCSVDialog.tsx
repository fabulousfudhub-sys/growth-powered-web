import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'students' | 'questions';
}

export default function ImportCSVDialog({ open, onOpenChange, type }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [imported, setImported] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim()).map(row => row.split(',').map(c => c.trim()));
      setPreview(rows.slice(0, 6));
    };
    reader.readAsText(f);
  };

  const parseCSV = (text: string) => {
    const rows = text.split('\n').filter(r => r.trim()).map(row => row.split(',').map(c => c.trim()));
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    return rows.slice(1).map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const records = parseCSV(text);

      if (type === 'students') {
        const students = records.map(r => ({
          name: r.name,
          regNumber: r.reg_number || r.matric_number || r.reg,
          email: r.email || '',
          department: r.department || r.dept || '',
          level: r.level || '',
        }));
        const res = await api.importStudents(students);
        setResult({ created: res.created, skipped: res.skipped });
        toast.success(`${res.created} students imported successfully!`);
      } else {
        const questions = records.map(r => ({
          type: r.type || 'mcq',
          text: r.text || r.question || '',
          option_a: r.option_a || r.a || '',
          option_b: r.option_b || r.b || '',
          option_c: r.option_c || r.c || '',
          option_d: r.option_d || r.d || '',
          correct_answer: r.correct_answer || r.answer || '',
          difficulty: r.difficulty || 'medium',
          course: r.course || r.course_code || '',
        }));
        const res = await api.importQuestions(questions);
        setResult({ created: res.created, skipped: res.skipped });
        toast.success(`${res.created} questions imported successfully!`);
      }
      setImported(true);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFile(null);
    setPreview([]);
    setImported(false);
    setResult(null);
  };

  const studentTemplate = `name,reg_number,email,department,level
Aisha Mohammed,ND/CSC/23/001,aisha23@student.edu.ng,Computer Science,ND1
Tunde Bakare,ND/CSC/23/002,tunde23@student.edu.ng,Computer Science,ND1
Chioma Eze,ND/EEE/23/001,chioma23@student.edu.ng,Electrical Engineering,ND1`;

  const questionTemplate = `type,text,option_a,option_b,option_c,option_d,correct_answer,difficulty,course
mcq,What does HTML stand for?,Hyper Text Markup Language,High Tech Modern Language,Hyper Transfer Markup Language,Home Tool Markup Language,Hyper Text Markup Language,easy,COM 101
true_false,The CPU is the brain of the computer.,,,,,True,easy,COM 101
fill_blank,The full meaning of CPU is ___.,,,,,Central Processing Unit,medium,COM 101`;

  const templateContent = type === 'students' ? studentTemplate : questionTemplate;

  const downloadTemplate = () => {
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${type}_template.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import {type === 'students' ? 'Students' : 'Questions'} from CSV</DialogTitle>
          <DialogDescription>Upload a CSV file to bulk import {type}. Download the template for the correct format.</DialogDescription>
        </DialogHeader>

        {imported ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-success" />
            </div>
            <p className="font-semibold text-foreground">Import Complete!</p>
            {result && (
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{result.created} records created</p>
                {result.skipped > 0 && <p>{result.skipped} records skipped (duplicates or errors)</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
              <Download className="w-4 h-4" /> Download Template
            </Button>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-accent transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <FileText className="w-5 h-5 text-accent" />
                  <span className="font-medium text-foreground">{file.name}</span>
                  <span className="text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload a CSV file</p>
                </div>
              )}
            </div>

            {preview.length > 0 && (
              <div className="overflow-auto max-h-48 rounded border">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      {preview[0].map((h, i) => <th key={i} className="p-2 text-left font-medium">{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(1).map((row, i) => (
                      <tr key={i} className="border-t">
                        {row.map((cell, j) => <td key={j} className="p-2 text-muted-foreground">{cell}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>{imported ? 'Close' : 'Cancel'}</Button>
          {!imported && file && (
            <Button onClick={handleImport} disabled={importing}>
              {importing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Import {preview.length - 1} Records
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
