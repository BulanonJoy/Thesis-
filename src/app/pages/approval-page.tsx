import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "../components/ui/dialog";
import {
  BookOpen, CheckCircle, XCircle, Clock, Calendar, User, Eye,
  Building, Tag, AlertCircle, RefreshCw, Trash2,
} from "lucide-react";
import { useAuth } from "../contexts/auth-context";
import { getAllTheses, updateThesis, deleteThesis } from "../../lib/mock-data";

interface Thesis {
  id: string;
  title: string;
  authors: string;
  department: string;
  year: number;
  abstract: string;
  keywords: string[];
  created_at: string;
  status: "pending" | "approved" | "rejected";
}

type ThesisStatusFilter = "all" | "approved" | "rejected";

export function ApprovalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [theses, setTheses]         = useState<Thesis[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [statusFilter, setStatusFilter] = useState<ThesisStatusFilter>("all");
  const [activeTab, setActiveTab]   = useState<"pending" | "reviewed">("pending");

  // Review dialog state
  const [selected, setSelected]     = useState<Thesis | null>(null);
  const [action, setAction]         = useState<"approve" | "reject" | null>(null);
  const [feedback, setFeedback]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Thesis | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch all theses (review queue) ────────────────────────────────────────
  const fetchTheses = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError("");
    try {
      const allTheses = await getAllTheses();
      
      // Map to expected format
      const mapped: Thesis[] = allTheses.map(t => ({
        id: t.id,
        title: t.title,
        authors: t.authors,
        department: t.department,
        year: t.year,
        abstract: t.abstract,
        keywords: t.keywords,
        created_at: t.created_at,
        status: t.status,
      }));
      
      setTheses(mapped);
    } catch (err) {
      setError("Failed to load theses.");
      console.log("approval fetch error:", err);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => { fetchTheses(); }, [fetchTheses]);

  const openDialog = (thesis: Thesis, act: "approve" | "reject") => {
    setSelected(thesis);
    setAction(act);
    setFeedback("");
  };

  // ── Navigate to full thesis viewer page ────────────────────────────────────
  const openPreview = (thesis: Thesis) => {
    navigate(`/dashboard/thesis/${thesis.id}`);
  };

  // ── Handle approve/reject ───────────────────────────────────────────────────
  const handleConfirmAction = async () => {
    if (!selected || !action || !user) return;
    setSubmitting(true);

    try {
      const updates: any = {
        status: action === "approve" ? "approved" : "rejected",
        approved_by: user.id,
        ...(action === "reject" && { rejection_reason: feedback || null }),
      };

      await updateThesis(selected.id, updates);

      if (action === "approve") {
        toast.success("Thesis Approved", {
          description: `"${selected.title}" has been approved.`,
        });
      } else {
        toast.error("Thesis Rejected", {
          description: `"${selected.title}" has been rejected.`,
        });
      }

      fetchTheses();
      setSelected(null);
      setAction(null);
      setFeedback("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      toast.error("Error", { description: msg });
    }
    setSubmitting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteThesis(deleteTarget.id);
      setTheses((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      toast.success("Thesis Deleted", {
        description: `"${deleteTarget.title}" has been deleted.`,
      });
      setDeleteTarget(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed.";
      toast.error("Error", { description: msg });
    }

    setDeleting(false);
  };

  const pendingTheses = theses.filter((t) => t.status === "pending");
  const allReviewedTheses = theses.filter((t) => t.status !== "pending");
  const reviewedTheses = allReviewedTheses.filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#2D5016] flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            Thesis Approval
          </h1>
          <p className="text-gray-600 mt-1">Review and approve thesis submissions</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {activeTab === "reviewed" && (
            <Select
              value={statusFilter}
              onValueChange={(value: ThesisStatusFilter) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[170px] border-[#2D5016]/30 text-[#2D5016]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTheses}
            disabled={loading}
            className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1] flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Pending count alert */}
      {pendingTheses.length > 0 && (
        <Card className="mb-6 border-[#D4AF37]/40 bg-[#F4E5C2]/40">
          <CardContent className="p-5 flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#B8962C] flex-shrink-0" />
            <p className="text-[#2D5016]">
              <strong>{pendingTheses.length}</strong> thes{pendingTheses.length !== 1 ? "es" : "is"} pending approval
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "pending" | "reviewed")} className="space-y-6">
        <TabsList className="bg-[#E8F5E1]">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-[#2D5016] data-[state=active]:text-white"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending ({pendingTheses.length})
          </TabsTrigger>
          <TabsTrigger
            value="reviewed"
            className="data-[state=active]:bg-[#2D5016] data-[state=active]:text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Reviewed ({allReviewedTheses.length})
          </TabsTrigger>
        </TabsList>

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-3 text-[#2D5016]">
              <div className="w-6 h-6 border-2 border-[#2D5016]/30 border-t-[#2D5016] rounded-full animate-spin" />
              <span>Loading theses...</span>
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

        {/* Pending Theses */}
        <TabsContent value="pending" className="space-y-4">
          {!loading && !error && pendingTheses.length === 0 && (
            <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
              <CardContent className="p-12 text-center">
                <Clock className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Pending Theses</h3>
                <p className="text-gray-600">All submissions have been reviewed.</p>
              </CardContent>
            </Card>
          )}

          {pendingTheses.map((thesis) => (
            <Card key={thesis.id} className="border-[#2D5016]/10 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-[#2D5016]">{thesis.title}</h3>
                      <Badge className="bg-[#F4E5C2] text-[#B8962C]">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {thesis.authors}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        {thesis.department}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {thesis.year}
                      </div>
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-2">{thesis.abstract}</p>

                    <div className="flex flex-wrap gap-2">
                      {thesis.keywords.slice(0, 4).map((kw, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-[#E8F5E1] text-[#2D5016] border-[#4A7C2D]/20">
                          <Tag className="w-3 h-3 mr-1" />
                          {kw}
                        </Badge>
                      ))}
                      {thesis.keywords.length > 4 && (
                        <Badge variant="outline" className="border-[#2D5016]/20 text-gray-600">
                          +{thesis.keywords.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPreview(thesis)}
                      className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1]"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openDialog(thesis, "approve")}
                      className="bg-[#4A7C2D] hover:bg-[#2D5016] text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDialog(thesis, "reject")}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Reviewed Theses */}
        <TabsContent value="reviewed" className="space-y-4">
          {!loading && !error && reviewedTheses.length === 0 && (
            <Card className="border-[#D4AF37]/30 bg-[#F4E5C2]/20">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-[#B8962C] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2D5016] mb-2">No Reviewed Theses</h3>
                <p className="text-gray-600">No theses have been reviewed yet.</p>
              </CardContent>
            </Card>
          )}

          {reviewedTheses.map((thesis) => (
            <Card
              key={thesis.id}
              className={thesis.status === "rejected" ? "border-red-200 bg-red-50/40" : "border-[#2D5016]/10"}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`text-xl font-semibold ${thesis.status === "rejected" ? "text-red-700" : "text-[#2D5016]"}`}>
                        {thesis.title}
                      </h3>
                      {thesis.status === "approved" ? (
                        <Badge className="bg-[#E8F5E1] text-[#2D5016]">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Rejected
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        {thesis.authors}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Building className="w-4 h-4" />
                        {thesis.department}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {thesis.year}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openPreview(thesis)}
                    className="border-[#2D5016]/30 text-[#2D5016] hover:bg-[#E8F5E1] flex-shrink-0"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {thesis.status === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(thesis)}
                      className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </DialogTitle>
            <DialogDescription>
              {action === "approve" &&
                `Are you sure you want to approve "${selected?.title}"?`}
              {action === "reject" &&
                `Are you sure you want to reject "${selected?.title}"?`}
            </DialogDescription>
          </DialogHeader>

          {action === "reject" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Feedback (Optional)</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to the uploader..."
                rows={4}
                className="border-[#2D5016]/20"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={submitting}
              className={
                action === "approve"
                  ? "bg-[#4A7C2D] hover:bg-[#2D5016] text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {submitting ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rejected Thesis</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rejected thesis?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
