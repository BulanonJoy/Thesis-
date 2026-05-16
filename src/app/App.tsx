import { BrowserRouter } from "react-router";
import { AppRoutes } from "./routes";
import { AuthProvider } from "./contexts/auth-context";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </>
  );
}