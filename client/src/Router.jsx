import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import PlacementPage from "./pages/PlacementPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import SpeakingPage from "@/features/speaking/pages/SpeakingPage";
import WritingPage from "@/features/writing/pages/WritingPage";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
// later: import DashboardPage, ReadingPage, etc.

export default function AppRouter() {
  const { isLoading, error } = useAuth0();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Handle Auth0 errors
    if (error) {
      console.error("Auth0 Error:", error);
      setAuthError(error.message);
    }
  }, [error]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (authError) {
    return (
      <div className="auth-error">
        <h2>Authentication Error</h2>
        <p>{authError}</p>
        <button onClick={() => window.location.reload()}>
          Retry Authentication
        </button>
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SpeakingPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/placement"
          element={
            <ProtectedRoute>
              <PlacementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
