import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/CongratsPage.css';
import logoIcon from '../assets/icon.png';

const CongratsPage = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/home'); // Change to your desired route
  };

  return (
    <div className="badge-page">
      {/* Logo in top left */}
      <div className="badge-logo">
        <img src={logoIcon} alt="Logo" className="badge-logo-image" />
      </div>

      {/* Main Content */}
      <div className="badge-content">
        <h1 className="badge-message">
          Great work! You have earned yourself a<br />
          badge for completing <b>Level 1</b>!
        </h1>

        {/* Badge Image (not a button) */}
        <div className="badge-display">
          <img src={logoIcon} alt="Badge" className="badge-image" />
        </div>

        {/* Continue Button */}
        <button className="continue-button" onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
};

export default CongratsPage;