import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../../../styles/LoginPage.css";
import logoIcon from "../../../assets/icon.png";
import Button from "@/components/ui/Button";

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, error, isLoading } = useAuth0();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [warning, setWarning] = useState("");

  // ✅ Redirect user after successful login
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/placement");
    }
  }, [isAuthenticated, navigate]);

  // ✅ Handle Auth0 error (invalid credentials)
  useEffect(() => {
    if (error) {
      setWarning("Invalid email or password. Please try again.");
    }
  }, [error]);

  const handleSignIn = async () => {
    try {
      await loginWithRedirect({
        prompt: "login",
        login_hint: email,
        appState: { returnTo: "/placement" }, // ✅ redirect target
      });
    } catch (err) {
      console.error("Auth0 login failed:", err);
      setWarning("Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async () => {
    try {
      await loginWithRedirect({
        screen_hint: "signup",
        login_hint: email,
        appState: { returnTo: "/signup" },
      });
    } catch (err) {
      console.error("Auth0 signup failed:", err);
      setWarning("Signup failed. Please try again later.");
    }
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
        <div className="auth-header">
          <img src={logoIcon} alt="AutiSpark Logo" className="auth-logo" />
          <h1 className="auth-brand">AutiSpark</h1>
        </div>

        <div className="auth-form-container">
          <h2 className="auth-title">Sign in to AutiSpark</h2>

          <div className="auth-form">
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                className="auth-input"
              />
            </div>

            <button onClick={handleSignIn} className="sign-in-button">
              SIGN IN
            </button>
          </div>

          {/* ⚠️ Warning Message */}
          {warning && <p className="warning-text">{warning}</p>}
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
