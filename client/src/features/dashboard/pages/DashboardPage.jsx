import { useAuth0 } from "@auth0/auth0-react";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Not logged in</p>;

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <p className="text-gray-600 mb-4">
        Welcome, <strong>{user?.name || user?.email}</strong> 👋
      </p>

      {/* ✅ Logout button */}
      <Button
        onClick={() =>
          logout({
            logoutParams: { returnTo: window.location.origin },
          })
        }
      >
        Log Out
      </Button>

      <p className="mt-6 text-gray-400 text-sm">
        (Logging out clears your Auth0 session — next visit will ask for login
        again.)
      </p>
    </div>
  );
}
