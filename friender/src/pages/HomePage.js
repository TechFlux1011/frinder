import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, matches, groups } = useApp();

  const recentMatch = useMemo(() => {
    if (!matches.length) return null;
    return [...matches].sort(
      (a, b) => new Date(b.matchedAt) - new Date(a.matchedAt)
    )[0];
  }, [matches]);

  const upcomingMeetups = useMemo(
    () => matches.filter((m) => m.meetup),
    [matches]
  );

  const totalFriends = matches.length;

  return (
    <div className="home-page">
      <div className="home-header">
        <div>
          <h1 className="home-title">
            Hey {currentUser?.name || 'friend'} 👋
          </h1>
          <p className="home-subtitle">
            Here&apos;s a quick snapshot of what&apos;s happening in your friend world.
          </p>
        </div>
        <button
          className="cta-button primary"
          onClick={() => navigate('/swipe')}
        >
          Discover new friends
        </button>
      </div>

      <div className="home-cards-grid">
        <div className="home-card">
          <div className="home-card-header">
            <span className="home-card-icon">💚</span>
            <h2>Recently matched</h2>
          </div>
          {recentMatch ? (
            <div className="home-card-body">
              <p className="home-card-primary">
                You matched with <strong>{recentMatch.user.name}</strong>
              </p>
              <p className="home-card-secondary">
                {recentMatch.user.bio}
              </p>
              <button
                className="home-card-link"
                onClick={() => navigate('/matches')}
              >
                View all matches
              </button>
            </div>
          ) : (
            <div className="home-card-empty">
              <p>No matches yet. Start swiping to find your first friend!</p>
              <button
                className="home-card-link"
                onClick={() => navigate('/swipe')}
              >
                Go to Discover
              </button>
            </div>
          )}
        </div>

        <div className="home-card">
          <div className="home-card-header">
            <span className="home-card-icon">👥</span>
            <h2>Joined groups</h2>
          </div>
          <div className="home-card-body">
            <p className="home-card-number">{groups.length}</p>
            <p className="home-card-secondary">
              groups you&apos;re part of
            </p>
            <button
              className="home-card-link"
              onClick={() => navigate('/groups')}
            >
              Manage groups
            </button>
          </div>
        </div>

        <div className="home-card">
          <div className="home-card-header">
            <span className="home-card-icon">🤝</span>
            <h2>Total friends</h2>
          </div>
          <div className="home-card-body">
            <p className="home-card-number">{totalFriends}</p>
            <p className="home-card-secondary">
              people you&apos;ve matched with
            </p>
            <button
              className="home-card-link"
              onClick={() => navigate('/matches')}
            >
              See all friends
            </button>
          </div>
        </div>

        <div className="home-card">
          <div className="home-card-header">
            <span className="home-card-icon">📅</span>
            <h2>Upcoming MeetUps</h2>
          </div>
          {upcomingMeetups.length ? (
            <div className="home-card-body">
              <p className="home-card-number">{upcomingMeetups.length}</p>
              <p className="home-card-secondary">
                in-person meetups scheduled with friends
              </p>
              <button
                className="home-card-link"
                onClick={() => navigate('/plans')}
              >
                Review plans
              </button>
            </div>
          ) : (
            <div className="home-card-empty">
              <p>No hangouts scheduled yet. Plan something with a new match!</p>
              <button
                className="home-card-link"
                onClick={() => navigate('/matches')}
              >
                Open messages
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
