import { Routes, Route } from "react-router";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { SignUpPage } from "./pages/signup-page";
import { ForgotPasswordPage } from "./pages/forgot-password-page";
import { ResetPasswordPage } from "./pages/reset-password-page";
import { SetupPage } from "./pages/setup-page";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { Dashboard } from "./pages/dashboard";
import { BrowsePage } from "./pages/browse-page";
import { ThesisViewerPage } from "./pages/thesis-viewer-page";
import { UploadPage } from "./pages/upload-page";
import { ApprovalPage } from "./pages/approval-page";
import { AdminPage } from "./pages/admin-page";
import { GuestBrowsePage } from "./pages/guest-browse-page";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/setup" element={<SetupPage />} />
      <Route path="/browse" element={<GuestBrowsePage />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="browse" element={<BrowsePage />} />
        <Route path="thesis/:id" element={<ThesisViewerPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="approvals" element={<ApprovalPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
    </Routes>
  );
}
