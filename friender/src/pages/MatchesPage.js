import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './MatchesPage.css';

const MatchesPage = () => {
  const { matches, createMeetup } = useApp();
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [meetupData, setMeetupData] = useState({
    activity: '',
    location: '',
    date: '',
    time: ''
  });

  const handleCreateMeetup = (e, matchId) => {
    e.preventDefault();
    createMeetup(matchId, {
      ...meetupData,
      status: 'pending',
      createdAt: new Date()
    });
    setMeetupData({ activity: '', location: '', date: '', time: '' });
    setShowMeetupForm(false);
    setSelectedMatch(null);
  };

  if (matches.length === 0) {
    return (
      <div className="matches-page">
        <div className="empty-state">
          <div className="empty-icon">💚</div>
          <h2>No matches yet</h2>
          <p>Start swiping to find friends! When you both swipe right, you'll match.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-container">
        <div className="page-header">
          <h1>Your Matches</h1>
          <p>Connect with your new friends and plan meetups!</p>
        </div>

        <div className="matches-grid">
          {matches.map((match) => (
            <div key={match.id} className="match-card">
              <div className="match-header">
                <div className="match-avatar">{match.user.avatar}</div>
                <div className="match-info">
                  <h3 className="match-name">{match.user.name}</h3>
                  <p className="match-time">
                    Matched {new Date(match.matchedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="match-details">
                <p className="match-bio">{match.user.bio}</p>
                <div className="common-interests">
                  <h4>Common Interests:</h4>
                  <div className="tags">
                    {match.user.interests.slice(0, 3).map((interest, idx) => (
                      <span key={idx} className="tag">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {match.meetup ? (
                <div className="meetup-info">
                  <h4>📅 Planned Meetup</h4>
                  <p><strong>{match.meetup.activity}</strong></p>
                  <p>📍 {match.meetup.location}</p>
                  <p>🕐 {match.meetup.date} at {match.meetup.time}</p>
                  <span className={`meetup-status ${match.meetup.status}`}>
                    {match.meetup.status}
                  </span>
                </div>
              ) : (
                <button
                  className="plan-meetup-btn"
                  onClick={() => {
                    setSelectedMatch(match.id);
                    setShowMeetupForm(true);
                  }}
                >
                  Plan Meetup
                </button>
              )}
            </div>
          ))}
        </div>

        {showMeetupForm && selectedMatch && (
          <div className="meetup-modal">
            <div className="meetup-form">
              <h2>Plan a Meetup</h2>
              <form onSubmit={(e) => handleCreateMeetup(e, selectedMatch)}>
                <input
                  type="text"
                  placeholder="Activity (e.g., Coffee, Hiking, Board Games)"
                  value={meetupData.activity}
                  onChange={(e) => setMeetupData({ ...meetupData, activity: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={meetupData.location}
                  onChange={(e) => setMeetupData({ ...meetupData, location: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={meetupData.date}
                  onChange={(e) => setMeetupData({ ...meetupData, date: e.target.value })}
                  required
                />
                <input
                  type="time"
                  value={meetupData.time}
                  onChange={(e) => setMeetupData({ ...meetupData, time: e.target.value })}
                  required
                />
                <div className="form-actions">
                  <button type="button" onClick={() => setShowMeetupForm(false)}>
                    Cancel
                  </button>
                  <button type="submit">Create Meetup</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
