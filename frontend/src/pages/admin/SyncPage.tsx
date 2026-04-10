import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpFromLine, ArrowDownToLine, RefreshCw, Wifi, WifiOff, Lock, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface SyncLogEntry {
  id: string;
  timestamp: string;
  type: 'push' | 'pull' | 'info' | 'error' | 'success';
  message: string;
  table?: string;
  count?: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  totalPending: number;
  lastPushed: string | null;
  lastPulled: string | null;
  lastSynced: string | null;
  activeExamLock: boolean;
  failedCount: number;
  pending: Record<string, number>;
}

export default function SyncPage() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [logs, setLogs] = useState<SyncLogEntry[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentOp, setCurrentOp] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (entry: Omit<SyncLogEntry, 'id' | 'timestamp'>) => {
    setLogs(prev => [...prev, {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }]);
  };

  const fetchStatus = async () => {
    try {
      const s = await api.getSyncStatus() as SyncStatus;
      setStatus(s);
    } catch {
      // offline
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handlePush = async () => {
    setIsPushing(true);
    setProgress(0);
    setCurrentOp('Pushing local changes to online server...');
    addLog({ type: 'info', message: '🚀 Starting PUSH operation...' });

    try {
      // Simulate progress steps
      setProgress(10);
      addLog({ type: 'info', message: 'Checking online connectivity...' });
      await new Promise(r => setTimeout(r, 500));

      setProgress(30);
      addLog({ type: 'info', message: 'Scanning local changes...' });

      const result = await api.triggerSyncPush() as any;

      setProgress(70);
      if (result.tables) {
        for (const [table, info] of Object.entries(result.tables) as any) {
          if (info.pushed > 0) {
            addLog({ type: 'push', message: `✅ Pushed ${info.pushed} records`, table, count: info.pushed });
          }
          if (info.pushFailed > 0) {
            addLog({ type: 'error', message: `❌ Failed to push ${info.pushFailed} records`, table });
          }
        }
      }

      setProgress(100);
      addLog({ type: 'success', message: `🎉 PUSH complete: ${result.pushed || 0} records synced` });
      toast.success(`Push complete: ${result.pushed || 0} records synced`);
    } catch (err: any) {
      addLog({ type: 'error', message: `❌ Push failed: ${err.message}` });
      toast.error('Push failed');
    } finally {
      setIsPushing(false);
      setCurrentOp(null);
      setProgress(0);
      fetchStatus();
    }
  };

  const handlePull = async () => {
    setIsPulling(true);
    setProgress(0);
    setCurrentOp('Pulling updates from online server...');
    addLog({ type: 'info', message: '📥 Starting PULL operation...' });

    try {
      setProgress(10);
      addLog({ type: 'info', message: 'Checking online connectivity...' });
      await new Promise(r => setTimeout(r, 500));

      setProgress(30);
      addLog({ type: 'info', message: 'Fetching remote changes...' });

      const result = await api.triggerSyncPull() as any;

      setProgress(70);
      if (result.tables) {
        for (const [table, info] of Object.entries(result.tables) as any) {
          if (info.pulled > 0) {
            addLog({ type: 'pull', message: `✅ Pulled ${info.pulled} records`, table, count: info.pulled });
          }
          if (info.pullSkipped === 'locked') {
            addLog({ type: 'error', message: `🔒 Skipped — active exam lock`, table });
          }
        }
      }

      setProgress(100);
      addLog({ type: 'success', message: `🎉 PULL complete: ${result.pulled || 0} records merged` });
      toast.success(`Pull complete: ${result.pulled || 0} records merged`);
    } catch (err: any) {
      addLog({ type: 'error', message: `❌ Pull failed: ${err.message}` });
      toast.error('Pull failed');
    } finally {
      setIsPulling(false);
      setCurrentOp(null);
      setProgress(0);
      fetchStatus();
    }
  };

  const isBusy = isPushing || isPulling;
  const formatTime = (iso: string | null) => {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'medium' });
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data Synchronization</h1>
        <p className="text-sm text-muted-foreground">Push local changes online or pull remote updates</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            {status?.isOnline ? <Wifi className="w-5 h-5 text-accent" /> : <WifiOff className="w-5 h-5 text-destructive" />}
            <div>
              <p className="text-xs text-muted-foreground">Connectivity</p>
              <p className="text-sm font-semibold">{status?.isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Push</p>
              <p className="text-sm font-semibold">{formatTime(status?.lastPushed ?? null)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last Pull</p>
              <p className="text-sm font-semibold">{formatTime(status?.lastPulled ?? null)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Pending Records</p>
              <p className="text-sm font-semibold">{status?.totalPending ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Exam Lock Warning */}
      {status?.activeExamLock && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-warning">Active Exam Lock</p>
              <p className="text-xs text-muted-foreground">Some tables (questions, exam_questions) are locked during active exams and won't be synced on pull.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending by Table */}
      {status?.pending && Object.keys(status.pending).length > 0 && (
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Pending Changes by Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(status.pending).map(([table, count]) => (
                <Badge key={table} variant="secondary" className="gap-1.5">
                  {table} <span className="font-bold text-primary">{count as number}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/40 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ArrowUpFromLine className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Push to Online</CardTitle>
                <CardDescription className="text-xs">Upload local changes to the online server</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePush} disabled={isBusy || !status?.isOnline} className="w-full gap-2" size="lg">
              {isPushing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpFromLine className="w-4 h-4" />}
              {isPushing ? 'Pushing...' : 'Push Changes'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/40 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Pull from Online</CardTitle>
                <CardDescription className="text-xs">Download remote updates to this server</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handlePull} disabled={isBusy || !status?.isOnline} className="w-full gap-2" size="lg" variant="outline">
              {isPulling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownToLine className="w-4 h-4" />}
              {isPulling ? 'Pulling...' : 'Pull Updates'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      {isBusy && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{currentOp}</p>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Sync Log */}
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Sync Activity Log</CardTitle>
            {logs.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setLogs([])}>Clear</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-lg border bg-muted/30 p-3">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No sync activity yet. Click Push or Pull to begin.</p>
            ) : (
              <div className="space-y-1.5 font-mono text-xs">
                {logs.map(log => (
                  <div key={log.id} className={`flex items-start gap-2 py-1 px-2 rounded ${
                    log.type === 'error' ? 'bg-destructive/10 text-destructive' :
                    log.type === 'success' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                    log.type === 'push' ? 'bg-primary/10 text-primary' :
                    log.type === 'pull' ? 'bg-accent/10 text-accent' : ''
                  }`}>
                    {log.type === 'error' ? <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                     log.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                     log.type === 'push' ? <ArrowUpFromLine className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                     log.type === 'pull' ? <ArrowDownToLine className="w-3.5 h-3.5 mt-0.5 shrink-0" /> :
                     <RefreshCw className="w-3.5 h-3.5 mt-0.5 shrink-0" />}
                    <span className="text-muted-foreground shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    {log.table && <Badge variant="outline" className="text-[10px] py-0 shrink-0">{log.table}</Badge>}
                    <span className="break-all">{log.message}</span>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
