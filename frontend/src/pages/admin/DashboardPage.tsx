import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Exam } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, FileText, ClipboardList, CheckCircle, TrendingUp, BookOpen, Building2, BarChart3, School, Activity, Wifi, WifiOff, RefreshCw, Loader2, Cloud } from 'lucide-react';
import { toast } from 'sonner';

interface DashStats {
  totalStudents: number; totalExams: number; activeExams: number; completedExams: number;
  totalQuestions: number; totalCourses: number; totalDepartments: number; totalSchools: number;
  averageScore: number; passRate: number;
}

interface SyncStatus {
  pending: Record<string, number>;
  totalPending: number;
  failedCount: number;
  lastSynced: string | null;
  isOnline: boolean;
  isSyncing: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashStats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const dept = user?.role === 'examiner' ? user.department : undefined;
    api.getDashboardStats(dept).then(setStats);
    if (user?.role === 'examiner') {
      api.getExams(user.department).then(setExams);
    } else {
      api.getExams().then(setExams);
    }
    if (['super_admin', 'admin'].includes(user?.role || '')) {
      api.getSyncStatus().then((s: any) => setSyncStatus(s)).catch(() => {});
    }
  }, [user]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.triggerSync();
      toast.success('Sync triggered successfully');
      const s: any = await api.getSyncStatus();
      setSyncStatus(s);
    } catch { toast.error('Sync failed'); }
    finally { setSyncing(false); }
  };

  if (!stats) return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, accent: 'from-accent/20 to-accent/5', iconColor: 'text-accent' },
    { label: 'Total Exams', value: stats.totalExams, icon: ClipboardList, accent: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
    { label: 'Active Exams', value: stats.activeExams, icon: Activity, accent: 'from-success/20 to-success/5', iconColor: 'text-success' },
    { label: 'Completed', value: stats.completedExams, icon: CheckCircle, accent: 'from-muted to-muted/50', iconColor: 'text-muted-foreground' },
    { label: 'Question Bank', value: stats.totalQuestions, icon: FileText, accent: 'from-warning/20 to-warning/5', iconColor: 'text-warning' },
    { label: 'Courses', value: stats.totalCourses, icon: BookOpen, accent: 'from-accent/20 to-accent/5', iconColor: 'text-accent' },
    ...(['super_admin', 'admin'].includes(user?.role || '') ? [
      { label: 'Departments', value: stats.totalDepartments, icon: Building2, accent: 'from-primary/20 to-primary/5', iconColor: 'text-primary' },
      { label: 'Schools', value: stats.totalSchools, icon: School, accent: 'from-accent/20 to-accent/5', iconColor: 'text-accent' },
    ] : []),
    { label: 'Pass Rate', value: `${stats.passRate}%`, icon: TrendingUp, accent: 'from-success/20 to-success/5', iconColor: 'text-success' },
  ];

  const statusConfig: Record<string, { color: string; dot: string }> = {
    draft: { color: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground' },
    scheduled: { color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
    active: { color: 'bg-success/10 text-success', dot: 'bg-success' },
    completed: { color: 'bg-secondary text-secondary-foreground', dot: 'bg-secondary-foreground' },
  };

  return (
    <div className="space-y-8 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {user?.role === 'examiner' ? `Department overview · ${user.department}` 
           : user?.role === 'instructor' ? 'Your courses and questions overview'
           : 'System overview and quick stats'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="border-border/40 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${s.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <CardContent className="p-5 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Exams */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-muted-foreground" />
              Recent Exams
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {exams.slice(0, 4).map(exam => (
              <div key={exam.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{exam.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{exam.course} · {exam.duration} min · {exam.enrolledStudents} students</p>
                </div>
                <Badge className={`${statusConfig[exam.status].color} ml-3 shrink-0`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[exam.status].dot} mr-1.5`} />
                  {exam.status}
                </Badge>
              </div>
            ))}
            {exams.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No exams yet</p>}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Average Score</span>
                <span className="text-sm font-bold text-foreground">{stats.averageScore}%</span>
              </div>
              <Progress value={stats.averageScore} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Pass Rate</span>
                <span className="text-sm font-bold text-foreground">{stats.passRate}%</span>
              </div>
              <Progress value={stats.passRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40">
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-lg font-bold text-foreground">{stats.activeExams}</p>
                <p className="text-xs text-muted-foreground">Active Now</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30">
                <p className="text-lg font-bold text-foreground">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Status Widget — admin only */}
      {['super_admin', 'admin'].includes(user?.role || '') && syncStatus && (
        <Card className="border-border/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Cloud className="w-4 h-4 text-muted-foreground" />
                Online Sync Status
              </CardTitle>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {syncStatus.isOnline ? (
                    <><Wifi className="w-4 h-4 text-success" /><span className="text-xs font-medium text-success">Online</span></>
                  ) : (
                    <><WifiOff className="w-4 h-4 text-destructive" /><span className="text-xs font-medium text-destructive">Offline</span></>
                  )}
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={handleSync} disabled={syncing || syncStatus.isSyncing}>
                  {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  Sync Now
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-lg font-bold text-foreground">{syncStatus.totalPending}</p>
                <p className="text-xs text-muted-foreground">Pending Records</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
                <p className="text-lg font-bold text-foreground">{syncStatus.failedCount}</p>
                <p className="text-xs text-muted-foreground">Failed (1h)</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/30 col-span-2">
                <p className="text-sm font-medium text-foreground">
                  {syncStatus.lastSynced ? new Date(syncStatus.lastSynced).toLocaleString() : 'Never synced'}
                </p>
                <p className="text-xs text-muted-foreground">Last Successful Sync</p>
              </div>
            </div>
            {syncStatus.totalPending > 0 && Object.keys(syncStatus.pending).length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(syncStatus.pending).map(([table, count]) => (
                  <Badge key={table} variant="outline" className="text-xs gap-1">
                    {table}: <span className="font-bold">{count}</span>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
