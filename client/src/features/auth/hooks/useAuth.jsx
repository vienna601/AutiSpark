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

  //updated logout that clears Auth0 SSO session
  const signout = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
        federated: true, //clears Auth0 cookie session
      },
    });

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
