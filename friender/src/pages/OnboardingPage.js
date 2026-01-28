import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './OnboardingPage.css';

const OnboardingPage = () => {
  const navigate = useNavigate();
  const { updateCurrentUser } = useApp();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handlePhoneSubmit = (e) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError('Please enter your phone number to continue.');
      return;
    }

    setError('');

    // For now we just stash the phone number locally and move on.
    // Later we can hook this into Firebase phone auth / verification.
    updateCurrentUser({
      phoneNumber: phoneNumber.trim(),
    });

    navigate('/onboarding/profile');
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="onboarding-logo">🤝</div>
          <h1>Welcome to Friender</h1>
          <p>
            Sign in to start finding like-minded friends based on your interests and values.
          </p>
        </div>

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-btn social-btn google-btn"
          >
            <span className="social-icon">G</span>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="onboarding-btn social-btn apple-btn"
          >
            <span className="social-icon"></span>
            <span>Continue with Apple</span>
          </button>

          <div className="onboarding-divider">
            <span>or</span>
          </div>

          <form className="phone-form" onSubmit={handlePhoneSubmit}>
            <label className="phone-label">
              Continue with your phone number
            </label>
            <div className="phone-input-row">
              <span className="country-code">+1</span>
              <input
                type="tel"
                className="phone-input"
                placeholder="(555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            {error && <p className="phone-error">{error}</p>}
            <button type="submit" className="onboarding-btn primary-btn">
              Continue
            </button>
            <p className="phone-helper-text">
              For now we&rsquo;ll just use your number to get you into the app.
              SMS verification is coming soon.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;

