import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import PlacementPage from "./pages/PlacementPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import ReadingPage from "@/features/reading/pages/ReadingPage";
import HomePage from "@/pages/HomePage";
import SpeakingPage from "@/features/speaking/pages/SpeakingPage";
import WritingPage from "@/features/writing/pages/WritingPage";
// later: import DashboardPage, ReadingPage, etc.

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
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
