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

  const login = () => loginWithRedirect();
  const signup = () => loginWithRedirect({ screen_hint: "signup" });
  const signout = () =>
    logout({ logoutParams: { returnTo: window.location.origin } });

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
