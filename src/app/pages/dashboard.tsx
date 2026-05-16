import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/auth-context";

export function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user || !user.isApproved) { navigate("/login", { replace: true }); return; }
    switch (user.role) {
      case "admin":    navigate("/dashboard/admin",     { replace: true }); break;
      case "approver": navigate("/dashboard/approvals", { replace: true }); break;
      case "uploader": navigate("/dashboard/upload",    { replace: true }); break;
      default:         navigate("/dashboard/browse",    { replace: true }); break;
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAF8]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#2D5016] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#2D5016] font-medium">Redirecting…</p>
      </div>
    </div>
  );
}
