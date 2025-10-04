import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    // Run only after Auth0 finishes loading
    if (isLoading) return;

    const handleLogin = async () => {
      try {
        const token = await getAccessTokenSilently();
        // Call your FastAPI /api/me route to sync user
        await fetch("http://localhost:8000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Decode token to check role (optional)
        const decoded = JSON.parse(atob(token.split(".")[1]));
        const roles = decoded["https://autispark/roles"] || [];
        const role = roles.includes("teacher") ? "teacher" : "student";

        // Redirect based on role
        if (role === "teacher") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/placement", { replace: true });
        }
      } catch (err) {
        console.error("Auth0 redirect error:", err);
      }
    };

    if (isAuthenticated && user) {
      handleLogin();
    }
  }, [isAuthenticated, isLoading, user, navigate, getAccessTokenSilently]);

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
      <Button onClick={() => loginWithRedirect({ prompt: "login" })}>
        Log In
      </Button>
    </div>
  );
}
