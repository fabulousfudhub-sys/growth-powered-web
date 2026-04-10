import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AuditEntry } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const categoryColors: Record<string, string> = { auth: 'bg-primary/10 text-primary', exam: 'bg-accent/10 text-accent', user: 'bg-warning/10 text-warning', question: 'bg-success/10 text-success', system: 'bg-secondary text-secondary-foreground', result: 'bg-muted text-muted-foreground' };
const roleColors: Record<string, string> = { super_admin: 'bg-destructive/10 text-destructive', admin: 'bg-primary/10 text-primary', examiner: 'bg-accent/10 text-accent', instructor: 'bg-warning/10 text-warning', student: 'bg-success/10 text-success' };

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    api.getAuditLog().then(setLogs).catch(() => setLogs([]));
  }, []);

  const filtered = logs.filter(entry => {
    const matchesSearch = entry.user.toLowerCase().includes(search.toLowerCase()) || entry.action.toLowerCase().includes(search.toLowerCase()) || entry.details.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (categoryFilter === 'all' || entry.category === categoryFilter);
  });

  const handleExport = () => {
    const csv = ['Timestamp,User,Role,Action,Category,Details,IP Address', ...filtered.map(e => `${e.timestamp},${e.user},${e.role},${e.action},${e.category},"${e.details}",${e.ip}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit_log.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-foreground">Audit Log</h1><p className="text-sm text-muted-foreground">Track all system activities</p></div>
        <Button variant="outline" className="gap-2" onClick={handleExport}><Download className="w-4 h-4" /> Export Log</Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card"><p className="text-2xl font-bold text-foreground">{logs.length}</p><p className="text-xs text-muted-foreground mt-1">Total Events</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-foreground">{logs.filter(e => e.category === 'auth').length}</p><p className="text-xs text-muted-foreground mt-1">Auth Events</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-foreground">{logs.filter(e => e.action === 'Login Failed').length}</p><p className="text-xs text-muted-foreground mt-1">Failed Logins</p></div>
        <div className="stat-card"><p className="text-2xl font-bold text-foreground">{new Set(logs.map(e => e.user)).size}</p><p className="text-xs text-muted-foreground mt-1">Active Users</p></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search logs..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-[180px]"><Filter className="w-4 h-4 mr-2 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Categories</SelectItem><SelectItem value="auth">Authentication</SelectItem><SelectItem value="exam">Exam</SelectItem><SelectItem value="user">User Management</SelectItem><SelectItem value="question">Questions</SelectItem><SelectItem value="system">System</SelectItem><SelectItem value="result">Results</SelectItem></SelectContent></Select>
      </div>
      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="hover:bg-transparent"><TableHead className="w-[180px]">Timestamp</TableHead><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Action</TableHead><TableHead>Category</TableHead><TableHead className="min-w-[250px]">Details</TableHead><TableHead>IP</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-sm">{entry.user}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${roleColors[entry.role]}`}>{entry.role.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-sm font-medium">{entry.action}</TableCell>
                  <TableCell><Badge className={`text-[10px] ${categoryColors[entry.category]}`}>{entry.category}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{entry.details}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{entry.ip}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No audit log entries found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
