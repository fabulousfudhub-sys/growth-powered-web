import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Monitor,
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  Activity,
  Clock,
  Laptop,
} from "lucide-react";

interface ConnectedClient {
  id: string;
  ip: string;
  studentName: string;
  regNumber: string;
  examTitle: string;
  status: "active" | "idle" | "disconnected";
  lastSeen: string;
  progress: number;
  remainingTime: number;
}

export default function NetworkMonitoringPage() {
  const [clients, setClients] = useState<ConnectedClient[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api
      .getNetworkClients()
      .then((data: any) => {
        setClients(data.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  const activeCount = clients.filter((c) => c.status === "active").length;
  const idleCount = clients.filter((c) => c.status === "idle").length;
  const disconnectedCount = clients.filter(
    (c) => c.status === "disconnected",
  ).length;

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const statusBadge = (status: string) => {
    if (status === "active")
      return (
        <Badge className="bg-success/10 text-success">
          <Wifi className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    if (status === "idle")
      return (
        <Badge className="bg-warning/10 text-warning">
          <Clock className="w-3 h-3 mr-1" />
          Idle
        </Badge>
      );
    return (
      <Badge className="bg-destructive/10 text-destructive">
        <WifiOff className="w-3 h-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-6 h-6" /> Network Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor connected computers and active exam sessions ·
            Auto-refreshes every 5s
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={load}>
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Laptop className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clients.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeCount}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {idleCount}
                </p>
                <p className="text-xs text-muted-foreground">Idle</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <WifiOff className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {disconnectedCount}
                </p>
                <p className="text-xs text-muted-foreground">Disconnected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40">
        <CardHeader>
          <CardTitle className="text-base">Connected Computers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Reg. No.</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Last Seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.ip}</TableCell>
                    <TableCell className="font-medium">
                      {c.studentName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {c.regNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.examTitle}
                    </TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell>{c.progress}%</TableCell>
                    <TableCell className="font-mono text-sm">
                      {c.remainingTime > 0 ? formatTime(c.remainingTime) : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(c.lastSeen).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
                {clients.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-12 text-muted-foreground"
                    >
                      {loading ? "Loading..." : "No connected clients"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
