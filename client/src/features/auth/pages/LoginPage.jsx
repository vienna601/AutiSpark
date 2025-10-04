import { useAuth0 } from "@auth0/auth0-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const { loginWithRedirect, isLoading, error, isAuthenticated } = useAuth0();

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        Error: {error.message}
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="text-center mt-10">✅ You are already logged in!</div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome Back</h1>
      <p className="mb-6 text-gray-600">
        Log in to continue your literacy journey.
      </p>
      <Button onClick={() => loginWithRedirect()}>Log In</Button>
    </div>
  );
}
