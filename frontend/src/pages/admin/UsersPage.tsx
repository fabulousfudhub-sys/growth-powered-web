import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
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
import { UserPlus, Eye, Pencil, Trash2 } from "lucide-react";
import AddUserDialog from "@/components/dialogs/AddUserDialog";
import EditUserDialog from "@/components/dialogs/EditUserDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const roleBadge: Record<string, string> = {
  super_admin: "bg-primary text-primary-foreground",
  admin: "bg-accent text-accent-foreground",
  examiner: "bg-warning/10 text-warning",
  instructor: "bg-secondary text-secondary-foreground",
  student: "bg-muted text-muted-foreground",
};
const roleLabel: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  examiner: "Examiner",
  instructor: "Instructor",
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [previewUser, setPreviewUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const load = () => {
    api.getUsers().then(setUsers);
  };
  useEffect(load, []);

  let staff = users.filter((u) => u.role !== "student");
  if (currentUser?.role === "examiner")
    staff = users.filter(
      (u) => u.role === "instructor" && u.department === currentUser.department,
    );

  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await api.deleteUser(deleteUser.id);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
    setDeleteUser(null);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentUser?.role === "examiner" ? "Instructors" : "Users"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {currentUser?.role === "examiner"
              ? `Instructors in ${currentUser.department}`
              : "Manage staff and system users"}
          </p>
        </div>
        {currentUser?.role !== "examiner" && (
          <Button className="gap-2" onClick={() => setAddOpen(true)}>
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>
      <Card className="border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                {currentUser?.role !== "examiner" && (
                  <TableHead>Role</TableHead>
                )}
                <TableHead>Department</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm">{u.email}</TableCell>
                  {currentUser?.role !== "examiner" && (
                    <TableCell>
                      <Badge className={roleBadge[u.role]}>
                        {roleLabel[u.role] || u.role}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{u.department || "—"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setPreviewUser(u)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditUser(u)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteUser(u)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={!!previewUser} onOpenChange={() => setPreviewUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewUser?.name}</DialogTitle>
            <DialogDescription>
              {roleLabel[previewUser?.role || ""]}
            </DialogDescription>
          </DialogHeader>
          {previewUser && (
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <strong>Email:</strong> {previewUser.email}
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <strong>Department:</strong> {previewUser.department || "N/A"}
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <strong>Last Login:</strong>{" "}
                {previewUser.lastLogin
                  ? new Date(previewUser.lastLogin).toLocaleString()
                  : "Never"}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteUser?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AddUserDialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) load();
        }}
      />
      <EditUserDialog
        open={!!editUser}
        onOpenChange={(o) => {
          if (!o) {
            setEditUser(null);
            load();
          }
        }}
        user={editUser}
      />
    </div>
  );
}
