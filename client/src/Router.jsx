import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlacementPage from "./pages/PlacementPage";
import ProtectedRoute from "@/features/auth/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import SpeakingPage from "@/features/speaking/pages/SpeakingPage";
import WritingPage from "@/features/writing/pages/WritingPage";
import ReadingPage from "@/features/reading/pages/ReadingPage";
<<<<<<< HEAD
import CongratsPage from "@/pages/CongratsPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
=======
>>>>>>> f3e8d6c ("Update styles")
// later: import DashboardPage, ReadingPage, etc.

export default function AppRouter() {
  return (
    <Router>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<LoginPage />} />
        <Route path="/placement" element={<PlacementPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
        <Route path="/congrats" element={<CongratsPage />} />
=======
        <Route path="/" element={<HomePage />} />
        <Route path="/writing" element={<WritingPage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/speaking" element={<SpeakingPage />} />
>>>>>>> f3e8d6c ("Update styles")
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
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
