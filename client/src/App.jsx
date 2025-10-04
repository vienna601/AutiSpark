import { AuthProvider } from "@/context/AuthContext";
import Router from "./Router"; // your app routes

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}

export default App;
