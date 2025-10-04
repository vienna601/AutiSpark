export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-md w-full p-8 shadow-lg bg-white rounded-2xl">
        {children}
      </div>
    </div>
  );
}
