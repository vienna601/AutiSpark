//define the hook for auth context
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

export function useAuthContext() {
  return useContext(AuthContext);
}
