import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/SignupPage.css";
import logoIcon from "../../../assets/icon.png";

const SignupPage = () => {
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    user,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;

    const handleAuth = async () => {
      try {
        const token = await getAccessTokenSilently();
        await fetch("http://localhost:8000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const decoded = JSON.parse(atob(token.split(".")[1]));
        const roles = decoded["https://autispark/roles"] || [];
        const role = roles.includes("teacher") ? "teacher" : "student";

        if (role === "teacher") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/placement", { replace: true });
        }
      } catch (err) {
        console.error("Auth0 redirect error:", err);
      }
    };

    if (isAuthenticated && user) {
      handleAuth();
    }
  }, [isAuthenticated, isLoading, user, navigate, getAccessTokenSilently]);

  const handleSignUp = () => {
    loginWithRedirect({
      screen_hint: "signup",
      prompt: "login",
    });
  };

  const handleSignIn = () => {
    loginWithRedirect({
      prompt: "login",
    });
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="loading-container">
          <p className="loading-text">Loading Auth0 session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      {/* Left Side - Sign Up */}
      <div className="auth-left">
        <div className="auth-header">
          <img src={logoIcon} alt="AutiSpark Logo" className="auth-logo" />
          <h1 className="auth-brand">AutiSpark</h1>
        </div>

        <div className="auth-form-container">
          <h2 className="auth-title">Sign up to AutiSpark</h2>

          <div className="auth-form">
            {/* Email Input */}
            <div className="input-group">
              <div className="input-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
              </div>
              <input type="email" placeholder="Email" className="auth-input" />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <div className="input-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
              />
            </div>

            <button onClick={handleSignUp} className="signup-button">
              SIGN UP
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Sign In */}
      <div className="auth-right">
        <div className="signin-container">
          <h2 className="signin-greeting">Welcome Back!</h2>
          <p className="signin-text">
            Would you like to continue your journey? Sign in to pick up where
            you left off.
          </p>
          <button onClick={handleSignIn} className="signin-button">
            SIGN IN
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
