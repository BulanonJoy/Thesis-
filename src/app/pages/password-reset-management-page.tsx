import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  KeyRound, RefreshCw, AlertCircle, CheckCircle, XCircle, Mail, Clock,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import {
  getAllPasswordResetRequests,
  updatePasswordResetRequest,
  deletePasswordResetRequest,
  type PasswordResetRequest,
} from "../../lib/mock-data";

export function PasswordResetManagementPage() {
  const { user } = useAuth();

  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirmation dialog
  const [confirmRequest, setConfirmRequest] = useState<PasswordResetRequest | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch password reset requests ──────────────────────────────────────────
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const allRequests = await getAllPasswordResetRequests();
      // Sort by requested_at (newest first)
      const sorted = allRequests.sort((a, b) => 
        new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime()
      );
      setRequests(sorted);
    } catch (err) {
      setError("Failed to load password reset requests.");
      console.log("password reset fetch error:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleConfirmAction = async () => {
    if (!confirmRequest || !confirmAction || !user) return;
    setSubmitting(true);

    try {
      if (confirmAction === "approve") {
        await updatePasswordResetRequest(confirmRequest.id, {
          status: "approved",
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        });
        toast.success("Request Approved", {
          description: `Password reset request for ${confirmRequest.email} has been approved.`,
        });
      } else if (confirmAction === "reject") {
        await updatePasswordResetRequest(confirmRequest.id, {
          status: "rejected",
          processed_at: new Date().toISOString(),
          processed_by: user.id,
        });
        toast.error("Request Rejected", {
          description: `Password reset request for ${confirmRequest.email} has been rejected.`,
        });
      }

      fetchRequests();
      setConfirmRequest(null);
      setConfirmAction(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error("Error", { description: msg });
    }
    setSubmitting(false);
  };

  const handleDelete = async (request: PasswordResetRequest) => {
    try {
      await deletePasswordResetRequest(request.id);
      toast.success("Request Deleted", {
        description: "Password reset request has been removed.",
      });
      fetchRequests();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete request.";
      toast.error("Error", { description: msg });
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D5016] flex items-center gap-3">
            <KeyRound className="w-8 h-8" />
            Password Reset Requests
          </h1>
          <p className="text-gray-600 mt-1">Manage user password reset requests</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchRequests}
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
              <strong>{pendingCount}</strong> password reset request{pendingCount !== 1 ? "s" : ""} awaiting approval
            </p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-3 text-[#2D5016]">
            <div className="w-6 h-6 border-2 border-[#2D5016]/30 border-t-[#2D5016] rounded-full animate-spin" />
            <span>Loading requests...</span>
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

      {!loading && !error && requests.length === 0 && (
        <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
          <CardContent className="p-12 text-center">
            <KeyRound className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Requests Found</h3>
            <p className="text-gray-600">No password reset requests have been submitted.</p>
          </CardContent>
        </Card>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Showing <strong className="text-[#2D5016]">{requests.length}</strong> request{requests.length !== 1 ? "s" : ""}
          </p>

          <div className="grid grid-cols-1 gap-4">
            {requests.map((request) => (
              <Card key={request.id} className="border-[#2D5016]/10 hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-[#2D5016]">{request.email}</h3>
                        {request.status === "pending" && (
                          <Badge className="bg-[#F4E5C2] text-[#B8962C] font-medium">Pending</Badge>
                        )}
                        {request.status === "approved" && (
                          <Badge variant="outline" className="border-[#4A7C2D] text-[#4A7C2D] font-medium">Approved</Badge>
                        )}
                        {request.status === "rejected" && (
                          <Badge variant="outline" className="border-red-400 text-red-500 font-medium">Rejected</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                        <Clock className="w-4 h-4" />
                        Requested: {new Date(request.requested_at).toLocaleString()}
                      </div>

                      {request.processed_at && (
                        <p className="text-xs text-gray-500">
                          Processed: {new Date(request.processed_at).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setConfirmRequest(request);
                              setConfirmAction("approve");
                            }}
                            className="bg-[#4A7C2D] hover:bg-[#2D5016] text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setConfirmRequest(request);
                              setConfirmAction("reject");
                            }}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status !== "pending" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(request)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmRequest} onOpenChange={(open) => !open && setConfirmRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve" && "Confirm Approval"}
              {confirmAction === "reject" && "Confirm Rejection"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === "approve" &&
                `Are you sure you want to approve the password reset request for ${confirmRequest?.email}?`}
              {confirmAction === "reject" &&
                `Are you sure you want to reject the password reset request for ${confirmRequest?.email}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRequest(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={submitting}
              className={
                confirmAction === "reject"
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
