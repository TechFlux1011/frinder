import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const { matches, getMessagesForMatch, sendMessage, respondToMeetup } = useApp();
  const matchParam = searchParams.get('match');
  const [activeMatchId, setActiveMatchId] = useState(matchParam || null);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (matchParam && matches.some(m => m.id === matchParam)) {
      setActiveMatchId(matchParam);
    }
  }, [matchParam, matches]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!activeMatchId || !draft.trim()) return;
    sendMessage(activeMatchId, draft, 'me');
    setDraft('');
  };

  if (matches.length === 0) {
    return (
      <div className="messages-page">
        <div className="messages-empty-state">
          <div className="messages-empty-icon">💬</div>
          <h2>No conversations yet</h2>
          <p>Start swiping and matching to unlock messaging with new friends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page">
      <div className="messages-container">
        {!activeMatchId ? (
          <div className="messages-list-view">
            <h2 className="messages-title">Your Conversations</h2>
            <ul className="messages-match-list">
              {matches.map(match => {
                const lastMessage = getMessagesForMatch(match.id).slice(-1)[0];
                return (
                  <li
                    key={match.id}
                    className="messages-match-item"
                    onClick={() => setActiveMatchId(match.id)}
                  >
                    <div className="messages-match-avatar">{match.user.avatar}</div>
                    <div className="messages-match-info">
                      <div className="messages-match-name">{match.user.name}</div>
                      <div className="messages-match-preview">
                        {lastMessage?.text || 'Say hi 👋'}
                      </div>
                    </div>
                    {lastMessage && (
                      <div className="messages-match-time">
                        {new Date(lastMessage.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            <div className="messages-list-sidebar">
              <button 
                className="messages-back-btn"
                onClick={() => setActiveMatchId(null)}
                title="Back to conversations"
              >
                ← Back
              </button>
              <h2 className="messages-title">Chats</h2>
              <ul className="messages-match-list">
                {matches.map(match => (
                  <li
                    key={match.id}
                    className={`messages-match-item ${activeMatchId === match.id ? 'active' : ''}`}
                    onClick={() => setActiveMatchId(match.id)}
                  >
                    <div className="messages-match-avatar">{match.user.avatar}</div>
                    <div className="messages-match-info">
                      <div className="messages-match-name">{match.user.name}</div>
                      <div className="messages-match-preview">
                        {getMessagesForMatch(match.id).slice(-1)[0]?.text || 'Say hi 👋'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {(() => {
              const activeMatch = matches.find(m => m.id === activeMatchId);
              if (!activeMatch) return null;
              const conversation = getMessagesForMatch(activeMatch.id);
              
              return (
                <div className="messages-chat">
                  <div className="messages-chat-header">
                    <div className="messages-chat-avatar">{activeMatch.user.avatar}</div>
                    <div>
                      <h2>{activeMatch.user.name}</h2>
                      <p>Start building a real friendship with a simple hello.</p>
                    </div>
                  </div>

                  <div className="messages-chat-body">
                    {conversation.map(msg => {
                      // Check if this is a meetup preview message
                      if (msg.type === 'meetup' && msg.meetupData) {
                        const meetup = msg.meetupData;
                        const isPending = meetup.status === 'pending';
                        const isFromThem = msg.from === 'them';
                        
                        // Only show action buttons if meetup is pending and it's from the other person
                        const showActions = isPending && isFromThem;

                        return (
                          <div
                            key={msg.id}
                            className={`messages-bubble meetup-preview ${msg.from === 'me' ? 'me' : 'them'}`}
                          >
                            <div className="meetup-preview-content">
                              <div className="meetup-preview-header">
                                <span className="meetup-icon">📅</span>
                                <span className="meetup-title">{msg.text}</span>
                              </div>
                              <div className="meetup-details">
                                <div className="meetup-detail-item">
                                  <span className="meetup-detail-label">Activity:</span>
                                  <span className="meetup-detail-value">{meetup.activity}</span>
                                </div>
                                <div className="meetup-detail-item">
                                  <span className="meetup-detail-label">Location:</span>
                                  <span className="meetup-detail-value">{meetup.location}</span>
                                </div>
                                <div className="meetup-detail-item">
                                  <span className="meetup-detail-label">Date:</span>
                                  <span className="meetup-detail-value">{meetup.date}</span>
                                </div>
                                <div className="meetup-detail-item">
                                  <span className="meetup-detail-label">Time:</span>
                                  <span className="meetup-detail-value">{meetup.time}</span>
                                </div>
                                {meetup.status !== 'pending' && (
                                  <div className="meetup-status-badge">
                                    Status: {meetup.status}
                                  </div>
                                )}
                              </div>
                              {showActions && (
                                <div className="meetup-actions">
                                  <button
                                    className="meetup-btn meetup-btn-yes"
                                    onClick={() => respondToMeetup(activeMatch.id, 'yes')}
                                  >
                                    ✓ Yes
                                  </button>
                                  <button
                                    className="meetup-btn meetup-btn-rain-check"
                                    onClick={() => respondToMeetup(activeMatch.id, 'rain-check')}
                                  >
                                    ☔ Rain Check
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Regular message
                      return (
                        <div
                          key={msg.id}
                          className={`messages-bubble ${msg.from === 'me' ? 'me' : msg.from === 'system' ? 'system' : 'them'}`}
                        >
                          <span>{msg.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <form className="messages-input-bar" onSubmit={handleSend}>
                    <input
                      type="text"
                      placeholder={`Message ${activeMatch.user.name}...`}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                    <button type="submit">Send</button>
                  </form>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;

