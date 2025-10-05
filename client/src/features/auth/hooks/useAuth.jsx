// useAuth.jsx
import { useAuth0 } from "@auth0/auth0-react";

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const login = () => loginWithRedirect({ prompt: "login" });
  const signup = () =>
    loginWithRedirect({ screen_hint: "signup", prompt: "login" });

  // This fully logs out and redirects to your login page
  const signout = () => {
    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/`, // redirect to /
        federated: true, // clears Auth0 SSO cookie (forces manual login)
      },
    });

    // optional client-side navigation safety (ensures React refreshes)
    window.location.href = "/";
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    signout,
    getAccessTokenSilently,
  };
}
