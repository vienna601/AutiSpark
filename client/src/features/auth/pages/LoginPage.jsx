import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/placement");
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading Auth0 session...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to AutiSpark</h1>
      <p className="mb-6 text-gray-600">
        Log in to start your literacy journey.
      </p>
      <Button onClick={login}>Log In</Button>
    </div>
  );
}
