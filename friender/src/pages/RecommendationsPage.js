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

  if (recommendedUsers.length === 0) {
    return (
      <div className="recommendations-page">
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <h2>No recommendations yet</h2>
          <p>Complete your profile with interests and values to get personalized friend recommendations!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-container">
        <div className="page-header">
          <h1>Recommended For You</h1>
          <p>Friends we think you'll connect with based on your interests and values</p>
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
                
                <div className="match-reasons">
                  <h4>Why you'll connect:</h4>
                  <div className="tags">
                    {user.interests
                      .filter(interest => 
                        currentUser?.interests?.includes(interest)
                      )
                      .slice(0, 3)
                      .map((interest, idx) => (
                        <span key={idx} className="tag">
                          {interest}
                        </span>
                      ))}
                  </div>
                </div>
                
                <button 
                  className="connect-btn"
                  onClick={() => handleConnect(user.id)}
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;
