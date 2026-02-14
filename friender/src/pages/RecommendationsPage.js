import React from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const { getRecommendedUsers, swipeUser, currentUser } = useApp();
  const navigate = useNavigate();
  const recommendedUsers = getRecommendedUsers();

  const handleConnect = (userId) => {
    swipeUser(userId, 'right');
    navigate('/matches');
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile?user=${userId}`);
  };

  if (recommendedUsers.length === 0) {
    return (
      <div className="recommendations-page">
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h2>No recommendations yet</h2>
          <p>Choose your top 5 interests and top 5 values to get personalized friend recommendations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">
        <div className="page-header">
          <h1>Recommended For You</h1>
          <p>Friends we think you'll connect with based on your profile</p>
        </div>
        
        <div className="recommendations-grid">
          {recommendedUsers.map((user) => (
            <div key={user.id} className="recommendation-card">
              <div className="card-match-score">
                <span className="score-icon">✨</span>
                <span className="score-text">{user.matchScore}% match</span>
              </div>
              
              <div className="card-content">
                <div className="user-avatar-large">{user.avatar}</div>
                <h3 className="user-name">{user.name}, {user.age}</h3>
                <p className="user-location">📍 {user.location}</p>
                <p className="user-bio">{user.bio}</p>

                {/* Highlight badges */}
                {user.matchHighlights && user.matchHighlights.length > 0 && (
                  <div className="rec-highlights">
                    {user.matchHighlights.map((badge, idx) => (
                      <span key={idx} className="rec-highlight-badge">{badge}</span>
                    ))}
                  </div>
                )}

                {/* MBTI and Zodiac badges */}
                {(user.mbtiType || user.zodiacSign) && (
                  <div className="rec-badges-row">
                    {user.mbtiType && <span className="rec-mbti-badge">{user.mbtiType}</span>}
                    {user.zodiacSign && <span className="rec-zodiac-badge">{user.zodiacSign}</span>}
                  </div>
                )}
                
                <div className="match-reasons">
                  <h4>Why you'll connect:</h4>
                  <div className="tags">
                    {user.interests
                      .filter(interest =>
                        currentUser?.interests?.includes(interest)
                      )
                      .slice(0, 3)
                      .map((interest, idx) => (
                        <span key={`interest-${idx}`} className="tag">
                          {interest}
                        </span>
                      ))}
                    {user.values
                      .filter(value =>
                        currentUser?.values?.includes(value)
                      )
                      .slice(0, 3)
                      .map((value, idx) => (
                        <span key={`value-${idx}`} className="tag value-tag">
                          {value}
                        </span>
                      ))}
                  </div>
                </div>

                <div className="rec-actions">
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnect(user.id)}
                  >
                    Connect
                  </button>
                  <button
                    className="view-profile-btn"
                    onClick={() => handleViewProfile(user.id)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
