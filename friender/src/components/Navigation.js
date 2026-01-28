import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetOnboarding } = useApp();

  const isActive = (path) => location.pathname === path;

  const handleDevReset = () => {
    if (window.confirm('Reset to sign-in page? This will clear your onboarding state.')) {
      resetOnboarding();
      navigate('/');
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🤝</span>
          <span className="logo-text">Friender</span>
        </Link>
        <div className="nav-links">
          <Link 
            to="/home" 
            className={`nav-link ${isActive('/home') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link 
            to="/swipe" 
            className={`nav-link ${isActive('/swipe') ? 'active' : ''}`}
          >
            <span className="nav-icon">👆</span>
            <span className="nav-text">Discover</span>
          </Link>
          <Link 
            to="/recommendations" 
            className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">For You</span>
          </Link>
          <Link 
            to="/groups" 
            className={`nav-link ${isActive('/groups') ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Groups</span>
          </Link>
          <Link 
            to="/matches" 
            className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
          >
            <span className="nav-icon">💚</span>
            <span className="nav-text">Matches</span>
          </Link>
          <Link 
            to="/messages" 
            className={`nav-link nav-link-messages ${isActive('/messages') ? 'active' : ''}`}
          >
            <span className="nav-icon">💬</span>
            <span className="nav-text">Messages</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </Link>
        </div>
        <button 
          onClick={handleDevReset}
          className="dev-reset-btn"
          title="Dev: Reset to sign-in"
        >
          🔄
        </button>
      </div>
    </nav>
  );
};

export default Navigation;
