import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/LoginPage.css";
import logoIcon from "../../../assets/icon.png";
import { useAuth } from "@/features/auth/hooks/useAuth";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/placement");
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = () => {
    loginWithRedirect({ prompt: "login" });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      screen_hint: "signup",
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
      {/* Left Side - Sign In */}
      <div className="auth-left">
        {/* Logo and Title */}
        <div className="auth-header">
          <img src={logoIcon} alt="AutiSpark Logo" className="auth-logo" />
          <h1 className="auth-brand">AutiSpark</h1>
        </div>

        {/* Sign In Section */}
        <div className="auth-form-container">
          <h2 className="auth-title">Sign in to AutiSpark</h2>

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
                <div className="auth-input-display">Email</div>
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
                ></svg>
              </div>
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
                <div className="auth-input-display">Password</div>
              </div>
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
              />
            </div>

            {/* Sign In Button */}
            <button onClick={handleSignIn} className="sign-in-button">
              SIGN IN
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up */}
      <div className="auth-right">
        <div className="signup-container">
          <h2 className="signup-greeting">Hello, Friend!</h2>
          <p className="signup-text">
            Enter your personal details and start your journey with us
          </p>
          <button onClick={handleSignUp} className="sign-up-button">
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
