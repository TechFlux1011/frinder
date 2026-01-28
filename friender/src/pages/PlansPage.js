import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import './PlansPage.css';

const PlansPage = () => {
  const { matches, respondToMeetup, createMeetup, sendMessage } = useApp();
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [calendarView, setCalendarView] = useState('weekly'); // 'weekly' or 'monthly'
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showRescheduleModal, setShowRescheduleModal] = useState(null); // matchId or null
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });
  const [declinedMeetupId, setDeclinedMeetupId] = useState(null); // matchId for declined meetup
  const [declineMessage, setDeclineMessage] = useState('');
  const [expandedMeetup, setExpandedMeetup] = useState(null); // { matchId, date } or null

  // Get all meetups
  const meetups = useMemo(() => {
    return matches
      .filter(match => match.meetup)
      .map(match => ({
        ...match.meetup,
        matchId: match.id,
        friendName: match.user.name,
        friendAvatar: match.user.avatar
      }));
  }, [matches]);

  // Separate pending and confirmed meetups
  const pendingMeetups = useMemo(() => {
    return meetups.filter(m => m.status === 'pending');
  }, [meetups]);

  const confirmedMeetups = useMemo(() => {
    return meetups.filter(m => m.status === 'confirmed');
  }, [meetups]);

  // Get week start and end dates
  const getWeekDates = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };



  // Navigate weeks
  const changeWeek = (direction) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeek(newDate);
  };

  // Navigate months
  const changeMonth = (direction) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentMonth(newDate);
  };

  // Format date for display
  const formatDate = (dateString) => {
    // Handle YYYY-MM-DD format
    const date = dateString.includes('T') 
      ? new Date(dateString) 
      : new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Get days of week
  const getWeekDays = () => {
    const { start } = getWeekDates(currentWeek);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get days of month
  const getMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  // Check if date has meetup
  const getMeetupsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    // Handle both YYYY-MM-DD format and Date objects
    return meetups.filter(m => {
      const meetupDateStr = m.date.includes('T') ? m.date.split('T')[0] : m.date;
      return meetupDateStr === dateStr;
    });
  };

  // Handle confirm meetup
  const handleConfirmMeetup = (matchId) => {
    respondToMeetup(matchId, 'yes');
  };

  // Handle decline meetup - show reschedule option
  const handleDeclineMeetup = (matchId) => {
    setShowRescheduleModal(matchId);
    const meetup = matches.find(m => m.id === matchId)?.meetup;
    if (meetup) {
      setRescheduleData({ date: meetup.date, time: meetup.time });
    }
  };

  // Handle reschedule
  const handleReschedule = (matchId) => {
    const meetup = matches.find(m => m.id === matchId)?.meetup;
    if (!meetup) return;

    // Format date for message
    const formattedDate = formatDate(rescheduleData.date);

    // Create new meetup with rescheduled date/time (this replaces the old one)
    createMeetup(matchId, {
      activity: meetup.activity,
      location: meetup.location,
      date: rescheduleData.date,
      time: rescheduleData.time,
      status: 'pending',
      createdAt: new Date(),
      rescheduled: true
    });

    // Send message about rescheduling
    sendMessage(matchId, `I'd love to reschedule! How about ${formattedDate} at ${rescheduleData.time}?`, 'me');

    setShowRescheduleModal(null);
    setRescheduleData({ date: '', time: '' });
  };

  // Handle decline without reschedule
  const handleDeclineWithoutReschedule = (matchId) => {
    respondToMeetup(matchId, 'rain-check');
    setShowRescheduleModal(null);
    setDeclinedMeetupId(matchId);
    setRescheduleData({ date: '', time: '' });
  };

  // Send decline message
  const handleSendDeclineMessage = (matchId) => {
    if (declineMessage.trim()) {
      sendMessage(matchId, declineMessage.trim(), 'me');
      setDeclineMessage('');
      setDeclinedMeetupId(null);
    }
  };

  return (
    <div className="plans-page">
      <div className="plans-container">
        <div className="plans-header">
          <h1>Your Plans</h1>
        </div>
        <div className="view-toggle-container">
          <button
            className="view-toggle-btn"
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            title={`Switch to ${viewMode === 'list' ? 'Calendar' : 'List'} view`}
          >
            {viewMode === 'list' ? '📅' : '📋'}
          </button>
          {viewMode === 'calendar' && (
            <button
              className="calendar-toggle-btn"
              onClick={() => setCalendarView(calendarView === 'weekly' ? 'monthly' : 'weekly')}
              title={`Switch to ${calendarView === 'weekly' ? 'Monthly' : 'Weekly'} view`}
            >
              {calendarView === 'weekly' ? '📅' : '📆'}
            </button>
          )}
        </div>

        {viewMode === 'list' ? (
          <div className="list-view">
            {pendingMeetups.length > 0 && (
              <div className="meetup-section">
                <h2 className="section-title pending">Pending Meetups</h2>
                <div className="meetup-list">
                  {pendingMeetups.map((meetup, idx) => (
                    <div key={`pending-${idx}`} className="meetup-item pending">
                      <div className="meetup-item-header">
                        <div className="meetup-friend">
                          <span className="friend-avatar">{meetup.friendAvatar}</span>
                          <span className="friend-name">{meetup.friendName}</span>
                        </div>
                        <span className="meetup-status-badge pending">Pending</span>
                      </div>
                      <div className="meetup-details">
                        <div className="meetup-detail">
                          <span className="detail-icon">🎯</span>
                          <span>{meetup.activity}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">📍</span>
                          <span>{meetup.location}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">📅</span>
                          <span>{formatDate(meetup.date)}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">🕐</span>
                          <span>{meetup.time}</span>
                        </div>
                      </div>
                      <div className="meetup-actions-container">
                        <div className="meetup-action-buttons">
                          <button
                            className="meetup-action-btn confirm-btn"
                            onClick={() => handleConfirmMeetup(meetup.matchId)}
                            title="Confirm"
                          >
                            ✓
                          </button>
                          <button
                            className="meetup-action-btn decline-btn"
                            onClick={() => handleDeclineMeetup(meetup.matchId)}
                            title="Can't make it"
                          >
                            🥺
                          </button>
                        </div>
                        {declinedMeetupId === meetup.matchId && (
                          <div className="decline-message-container">
                            <input
                              type="text"
                              className="decline-message-input"
                              placeholder="Send a message explaining why..."
                              value={declineMessage}
                              onChange={(e) => setDeclineMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendDeclineMessage(meetup.matchId);
                                }
                              }}
                            />
                            <button
                              className="decline-send-btn"
                              onClick={() => handleSendDeclineMessage(meetup.matchId)}
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {confirmedMeetups.length > 0 && (
              <div className="meetup-section">
                <h2 className="section-title confirmed">Confirmed Meetups</h2>
                <div className="meetup-list">
                  {confirmedMeetups.map((meetup, idx) => (
                    <div key={`confirmed-${idx}`} className="meetup-item confirmed">
                      <div className="meetup-item-header">
                        <div className="meetup-friend">
                          <span className="friend-avatar">{meetup.friendAvatar}</span>
                          <span className="friend-name">{meetup.friendName}</span>
                        </div>
                        <span className="meetup-status-badge confirmed">Confirmed</span>
                      </div>
                      <div className="meetup-details">
                        <div className="meetup-detail">
                          <span className="detail-icon">🎯</span>
                          <span>{meetup.activity}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">📍</span>
                          <span>{meetup.location}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">📅</span>
                          <span>{formatDate(meetup.date)}</span>
                        </div>
                        <div className="meetup-detail">
                          <span className="detail-icon">🕐</span>
                          <span>{meetup.time}</span>
                        </div>
                      </div>
                      <div className="meetup-actions-container">
                        <div className="meetup-action-buttons">
                          <button
                            className="meetup-action-btn confirm-btn"
                            onClick={() => handleConfirmMeetup(meetup.matchId)}
                            title="Confirm"
                          >
                            ✓
                          </button>
                          <button
                            className="meetup-action-btn decline-btn"
                            onClick={() => handleDeclineMeetup(meetup.matchId)}
                            title="Can't make it"
                          >
                            🥺
                          </button>
                        </div>
                        {declinedMeetupId === meetup.matchId && (
                          <div className="decline-message-container">
                            <input
                              type="text"
                              className="decline-message-input"
                              placeholder="Send a message explaining why..."
                              value={declineMessage}
                              onChange={(e) => setDeclineMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSendDeclineMessage(meetup.matchId);
                                }
                              }}
                            />
                            <button
                              className="decline-send-btn"
                              onClick={() => handleSendDeclineMessage(meetup.matchId)}
                            >
                              Send
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {meetups.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📅</div>
                <h2>No plans yet</h2>
                <p>Start planning meetups with your matches!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="calendar-view">

            {calendarView === 'weekly' ? (
              <div className="weekly-calendar">
                <div className="calendar-nav">
                  <button onClick={() => changeWeek(-1)}>◀️</button>
                  <h3>
                    {getWeekDates(currentWeek).start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {getWeekDates(currentWeek).end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <button onClick={() => changeWeek(1)}>▶️</button>
                </div>
                <div className="week-grid">
                  {getWeekDays().map((day, idx) => {
                    const dayMeetups = getMeetupsForDate(day);
                    const hasMeetups = dayMeetups.length > 0;
                    return (
                      <div key={idx} className={`week-day ${hasMeetups ? 'has-meetups' : 'no-meetups'}`}>
                        <div className="day-header">
                          <div className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                          <div className="day-number">{day.getDate()}</div>
                        </div>
                        <div className="day-meetups">
                          {dayMeetups.map((meetup, meetupIdx) => {
                            const isExpanded = expandedMeetup?.matchId === meetup.matchId && expandedMeetup?.date === meetup.date;
                            return (
                              <div key={meetupIdx} className="meetup-bar-wrapper">
                                <div
                                  className={`meetup-bar ${meetup.status === 'confirmed' ? 'confirmed' : 'pending'}`}
                                  onClick={() => {
                                    if (isExpanded) {
                                      setExpandedMeetup(null);
                                    } else {
                                      setExpandedMeetup({ matchId: meetup.matchId, date: meetup.date });
                                    }
                                  }}
                                >
                                  <div className="meetup-bar-content">
                                    <span className="meetup-bar-name">{meetup.friendName}</span>
                                    <span className="meetup-bar-time">{meetup.time}</span>
                                  </div>
                                </div>
                                {isExpanded && meetup.status === 'pending' && (
                                  <div className="meetup-expanded-details">
                                    <div className="expanded-meetup-info">
                                      <div className="expanded-meetup-header">
                                        <div className="expanded-meetup-friend">
                                          <span className="friend-avatar">{meetup.friendAvatar}</span>
                                          <span className="friend-name">{meetup.friendName}</span>
                                        </div>
                                      </div>
                                      <div className="expanded-meetup-details-list">
                                        <div className="expanded-meetup-detail">
                                          <span className="detail-icon">🎯</span>
                                          <span>{meetup.activity}</span>
                                        </div>
                                        <div className="expanded-meetup-detail">
                                          <span className="detail-icon">📍</span>
                                          <span>{meetup.location}</span>
                                        </div>
                                        <div className="expanded-meetup-detail">
                                          <span className="detail-icon">📅</span>
                                          <span>{formatDate(meetup.date)}</span>
                                        </div>
                                        <div className="expanded-meetup-detail">
                                          <span className="detail-icon">🕐</span>
                                          <span>{meetup.time}</span>
                                        </div>
                                      </div>
                                      <div className="expanded-meetup-actions">
                                        <button
                                          className="meetup-action-btn confirm-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmMeetup(meetup.matchId);
                                            setExpandedMeetup(null);
                                          }}
                                          title="Confirm"
                                        >
                                          ✓
                                        </button>
                                        <button
                                          className="meetup-action-btn decline-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeclineMeetup(meetup.matchId);
                                          }}
                                          title="Can't make it"
                                        >
                                          🥺
                                        </button>
                                      </div>
                                      {declinedMeetupId === meetup.matchId && (
                                        <div className="decline-message-container">
                                          <input
                                            type="text"
                                            className="decline-message-input"
                                            placeholder="Send a message explaining why..."
                                            value={declineMessage}
                                            onChange={(e) => setDeclineMessage(e.target.value)}
                                            onKeyPress={(e) => {
                                              if (e.key === 'Enter') {
                                                handleSendDeclineMessage(meetup.matchId);
                                                setExpandedMeetup(null);
                                              }
                                            }}
                                          />
                                          <button
                                            className="decline-send-btn"
                                            onClick={() => {
                                              handleSendDeclineMessage(meetup.matchId);
                                              setExpandedMeetup(null);
                                            }}
                                          >
                                            Send
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="monthly-calendar">
                <div className="calendar-nav">
                  <button onClick={() => changeMonth(-1)}>◀️</button>
                  <h3>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => changeMonth(1)}>▶️</button>
                </div>
                <div className="month-grid">
                  <div className="month-day-header">Sun</div>
                  <div className="month-day-header">Mon</div>
                  <div className="month-day-header">Tue</div>
                  <div className="month-day-header">Wed</div>
                  <div className="month-day-header">Thu</div>
                  <div className="month-day-header">Fri</div>
                  <div className="month-day-header">Sat</div>
                  {getMonthDays().map((day, idx) => {
                    if (!day) {
                      return <div key={idx} className="month-day empty"></div>;
                    }
                    const dayMeetups = getMeetupsForDate(day);
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={idx}
                        className={`month-day ${isToday ? 'today' : ''} ${dayMeetups.length > 0 ? 'has-meetups' : ''}`}
                      >
                        <div className="day-number">{day.getDate()}</div>
                        <div className="day-meetup-dots">
                          {dayMeetups.map((meetup, meetupIdx) => (
                            <div
                              key={meetupIdx}
                              className={`meetup-dot ${meetup.status === 'confirmed' ? 'confirmed' : 'pending'}`}
                              title={`${meetup.friendName}: ${meetup.activity}`}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="calendar-legend">
                  <div className="legend-item">
                    <span className="legend-dot confirmed"></span>
                    <span>Confirmed</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot pending"></span>
                    <span>Pending</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="reschedule-modal-overlay" onClick={() => setShowRescheduleModal(null)}>
          <div className="reschedule-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Reschedule Meetup?</h3>
            <p>Would you like to suggest a different date or time?</p>
            <div className="reschedule-form">
              <input
                type="date"
                value={rescheduleData.date}
                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                required
              />
              <input
                type="time"
                value={rescheduleData.time}
                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                required
              />
              <div className="reschedule-actions">
                <button
                  className="reschedule-btn"
                  onClick={() => handleReschedule(showRescheduleModal)}
                  disabled={!rescheduleData.date || !rescheduleData.time}
                >
                  Reschedule
                </button>
                <button
                  className="decline-final-btn"
                  onClick={() => handleDeclineWithoutReschedule(showRescheduleModal)}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
