import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Users, Search, CheckCircle, UserX, Filter,
  Mail, Shield, RefreshCw, AlertCircle,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import {
  getAllUsers,
  updateUserStatus,
  type User,
  type UserRole as MockUserRole,
} from "../../lib/mock-data";

type AccountStatus = "pending" | "active" | "deactivated";
type UserRole = MockUserRole;

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
}

function isKnownRole(role: unknown): role is UserRole {
  return role === "admin" || role === "uploader" || role === "approver" || role === "faculty" || role === "student";
}

function normalizeManagedUser(raw: User): ManagedUser {
  const safeName = typeof raw.name === "string" && raw.name.trim() ? raw.name.trim() : "Unknown User";
  const safeEmail = typeof raw.email === "string" && raw.email.trim() ? raw.email.trim() : "No email";
  const safeRole: UserRole = isKnownRole(raw.role) ? raw.role : "student";
  const safeCreatedAt = typeof raw.created_at === "string" && raw.created_at.trim()
    ? raw.created_at
    : new Date().toISOString();

  return {
    id: raw.id,
    name: safeName,
    email: safeEmail,
    role: safeRole,
    is_approved: !!raw.is_approved,
    is_active: !!raw.is_active,
    created_at: safeCreatedAt,
  };
}

function getStatus(u: ManagedUser): AccountStatus {
  if (!u.is_approved) return "pending";
  if (!u.is_active)   return "deactivated";
  return "active";
}

function RoleBadge({ role }: { role: UserRole }) {
  const map: Record<UserRole, string> = {
    admin:    "bg-[#2D5016] text-white",
    uploader: "bg-[#4A7C2D] text-white",
    approver: "bg-[#2D5016] text-white",
    faculty:  "bg-[#E8F5E1] text-[#2D5016] border border-[#4A7C2D]/30",
    student:  "bg-[#F4E5C2] text-[#B8962C]",
  };
  const safeRole: UserRole = isKnownRole(role) ? role : "student";
  return (
    <Badge className={map[safeRole]}>
      {safeRole.charAt(0).toUpperCase() + safeRole.slice(1)}
    </Badge>
  );
}

function StatusBadge({ status }: { status: AccountStatus }) {
  if (status === "active")
    return <Badge variant="outline" className="border-[#4A7C2D] text-[#4A7C2D] font-medium">Active</Badge>;
  if (status === "pending")
    return <Badge className="bg-[#F4E5C2] text-[#B8962C] font-medium">Pending</Badge>;
  return <Badge variant="outline" className="border-red-400 text-red-500 font-medium">Deactivated</Badge>;
}

export function AdminPage() {
  const { user } = useAuth();

  const [users, setUsers]               = useState<ManagedUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | AccountStatus>("all");
  const [filterRole, setFilterRole]     = useState<"all" | "student" | "faculty" | "approver" | "uploader">("all");

  // Confirmation dialog
  const [confirmUser,   setConfirmUser]   = useState<ManagedUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "deactivate" | "activate" | null>(null);
  const [submitting, setSubmitting]       = useState(false);

  // ── Fetch profiles ─────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const allUsers = await getAllUsers();
      // Don't show current admin user in the list
      const filtered = allUsers
        .filter((u) => u.id !== user?.id)
        .map(normalizeManagedUser);
      setUsers(filtered);
    } catch (err) {
      setError("Failed to load users.");
      console.log("admin fetch error:", err);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || getStatus(u) === filterStatus;
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesStatus && matchesRole;
  });

  // ── Actions ──────────────���─────────────────────────────────────────────────
  const handleConfirmAction = async () => {
    if (!confirmUser || !confirmAction) return;
    setSubmitting(true);

    try {
      const updates: Partial<Pick<User, "is_approved" | "is_active">> = {};

      if (confirmAction === "approve") {
        updates.is_approved = true;
        updates.is_active = true;
      } else if (confirmAction === "activate") {
        updates.is_active = true;
      } else if (confirmAction === "deactivate") {
        updates.is_active = false;
      }

      await updateUserStatus(confirmUser.id, updates);

      toast.success("Success", {
        description: `${confirmUser.name}'s account has been ${confirmAction}d.`,
      });

      fetchUsers();
      setConfirmUser(null);
      setConfirmAction(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error("Error", { description: msg });
    }
    setSubmitting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const pendingCount = users.filter((u) => !u.is_approved).length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D5016] flex items-center gap-3">
            <Shield className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Approve new users and manage account status</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1] flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Pending alert */}
      {pendingCount > 0 && (
        <Card className="mb-6 border-[#D4AF37]/40 bg-[#F4E5C2]/40">
          <CardContent className="p-5 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#B8962C] flex-shrink-0" />
            <p className="text-[#2D5016]">
              <strong>{pendingCount}</strong> user{pendingCount !== 1 ? "s" : ""} awaiting approval
            </p>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6 border-[#2D5016]/10">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-[#4A7C2D]" />
            <h2 className="text-lg font-semibold text-[#2D5016]">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-[#2D5016]/20"
              />
            </div>

            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as "all" | AccountStatus)}>
              <SelectTrigger className="border-[#2D5016]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filterRole}
              onValueChange={(v) => setFilterRole(v as "all" | "student" | "faculty" | "approver" | "uploader")}
            >
              <SelectTrigger className="border-[#2D5016]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="approver">Approver</SelectItem>
                <SelectItem value="uploader">Uploader</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#2D5016]">
            <div className="w-6 h-6 border-2 border-[#2D5016]/30 border-t-[#2D5016] rounded-full animate-spin" />
            <span>Loading users...</span>
          </div>
        </div>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length === 0 && (
        <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Users Found</h3>
            <p className="text-gray-600">
              {search || filterStatus !== "all" || filterRole !== "all"
                ? "Try adjusting your filters."
                : "No users registered yet."}
            </p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing <strong className="text-[#2D5016]">{filtered.length}</strong> user{filtered.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {filtered.map((u) => {
              const status = getStatus(u);
              return (
                <Card key={u.id} className="border-[#2D5016]/10 hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-[#2D5016]">{u.name}</h3>
                          <RoleBadge role={u.role} />
                          <StatusBadge status={status} />
                        </div>

                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                          <Mail className="w-4 h-4" />
                          {u.email}
                        </div>

                        <p className="text-xs text-gray-500">
                          Registered: {new Date(u.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {status === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setConfirmUser(u);
                              setConfirmAction("approve");
                            }}
                            className="bg-[#4A7C2D] hover:bg-[#2D5016] text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        )}

                        {status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmUser(u);
                              setConfirmAction("deactivate");
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Deactivate
                          </Button>
                        )}

                        {status === "deactivated" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmUser(u);
                              setConfirmAction("activate");
                            }}
                            className="border-[#4A7C2D] text-[#4A7C2D] hover:bg-[#E8F5E1]"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" && "Confirm Approval"}
              {confirmAction === "activate" && "Confirm Activation"}
              {confirmAction === "deactivate" && "Confirm Deactivation"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve" &&
                `Are you sure you want to approve ${confirmUser?.name}'s account?`}
              {confirmAction === "activate" &&
                `Are you sure you want to activate ${confirmUser?.name}'s account?`}
              {confirmAction === "deactivate" &&
                `Are you sure you want to deactivate ${confirmUser?.name}'s account?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmUser(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={submitting}
              className={
                confirmAction === "deactivate"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-[#2D5016] hover:bg-[#4A7C2D] text-white"
              }
            >
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
