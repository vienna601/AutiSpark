import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const { signup } = useAuth();

  return (
    <AuthLayout>
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">Join Autispark</h1>
        <p className="mb-6 text-gray-600">
          Create your account and start learning with confidence.
        </p>
        <Button onClick={signup}>Sign Up</Button>
      </div>
    </AuthLayout>
  );
}
