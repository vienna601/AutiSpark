import { createContext } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = () => loginWithRedirect();
  const signup = () => loginWithRedirect({ screen_hint: "signup" });
  const signout = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        signout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
