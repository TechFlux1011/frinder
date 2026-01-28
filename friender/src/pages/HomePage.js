import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, matches, groups } = useApp();

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-emoji">🤝</span>
            Find Your Tribe
          </h1>
          <p className="hero-subtitle">
            Connect with amazing people platonically. Build meaningful friendships 
            through shared interests and values.
          </p>
          <div className="hero-actions">
            <button 
              className="cta-button primary"
              onClick={() => navigate('/swipe')}
            >
              Start Discovering
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => navigate('/groups')}
            >
              Explore Groups
            </button>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="features-container">
          <h2>How Friender Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👆</div>
              <h3>Swipe to Connect</h3>
              <p>Discover friends by swiping through profiles. When you both swipe right, it's a match!</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Smart Recommendations</h3>
              <p>Get personalized friend suggestions based on your interests and values.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Join Groups</h3>
              <p>Find or create groups around shared interests and meet people in your community.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Plan Meetups</h3>
              <p>Turn online connections into real friendships by planning in-person meetups.</p>
            </div>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="stats-section">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-number">{matches.length}</div>
              <div className="stat-label">Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{groups.length}</div>
              <div className="stat-label">Groups</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{currentUser.interests?.length || 0}</div>
              <div className="stat-label">Interests</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
