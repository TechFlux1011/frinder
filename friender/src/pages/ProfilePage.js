import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ZODIAC_SYMBOLS = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const ProfilePage = () => {
  const { currentUser, updateCurrentUser, users, calculateMatchScore } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const viewUserId = searchParams.get('user');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(currentUser || {
    name: '',
    age: '',
    bio: '',
    allInterests: [],
    allValues: [],
    location: '',
    avatarUrl: ''
  });

  const maxTopInterests = 5;
  const maxTopValues = 5;

  const topInterests = (profile.allInterests || []).slice(0, maxTopInterests);
  const extraInterests = (profile.allInterests || []).slice(maxTopInterests);
  const topValues = (profile.allValues || []).slice(0, maxTopValues);
  const extraValues = (profile.allValues || []).slice(maxTopValues);

  const interestsRemaining = Math.max(0, maxTopInterests - topInterests.length);
  const valuesRemaining = Math.max(0, maxTopValues - topValues.length);

  const canSaveTopPicks =
    topInterests.length === maxTopInterests &&
    topValues.length === maxTopValues;

  // Determine if viewing another user's profile
  const viewUser = viewUserId ? users.find(u => u.id === viewUserId) : null;

  // Calculate match breakdown for other users
  const matchResult = viewUser && currentUser
    ? calculateMatchScore(currentUser, viewUser, users)
    : null;

  useEffect(() => {
    if (!currentUser) return;
    const existingTopInterests = currentUser.interests || [];
    const existingExtraInterests = currentUser.extraInterests || [];
    const existingTopValues = currentUser.values || [];
    const existingExtraValues = currentUser.extraValues || [];

    const combinedInterests = [...existingTopInterests, ...existingExtraInterests];
    const combinedValues = [...existingTopValues, ...existingExtraValues];

    setProfile({
      ...currentUser,
      allInterests: combinedInterests,
      allValues: combinedValues,
      avatarUrl: currentUser.avatarUrl || ''
    });

    if (!currentUser.name || (currentUser.interests || []).length === 0 || (currentUser.values || []).length === 0) {
      setIsEditing(true);
    }
  }, [currentUser]);

  const availableInterests = [
    'hiking', 'coffee', 'board games', 'photography', 'yoga', 'reading',
    'food', 'travel', 'music', 'art', 'sports', 'cooking', 'dancing',
    'movies', 'gaming', 'fitness', 'nature', 'writing', 'volunteering'
  ];

  const availableValues = [
    'authenticity', 'adventure', 'kindness', 'growth', 'community',
    'creativity', 'wellness', 'fun', 'intelligence', 'humor', 'mindfulness',
    'environment', 'sharing', 'respect', 'empathy', 'curiosity'
  ];

  const toggleInterest = (interest) => {
    const isSelected = (profile.allInterests || []).includes(interest);
    if (isSelected) {
      setProfile({
        ...profile,
        allInterests: profile.allInterests.filter(i => i !== interest)
      });
    } else {
      setProfile({
        ...profile,
        allInterests: [...(profile.allInterests || []), interest]
      });
    }
  };

  const toggleValue = (value) => {
    const isSelected = (profile.allValues || []).includes(value);
    if (isSelected) {
      setProfile({
        ...profile,
        allValues: profile.allValues.filter(v => v !== value)
      });
    } else {
      setProfile({
        ...profile,
        allValues: [...(profile.allValues || []), value]
      });
    }
  };

  const handleSave = () => {
    updateCurrentUser({
      name: profile.name,
      age: profile.age,
      bio: profile.bio,
      location: profile.location,
      interests: topInterests,
      values: topValues,
      extraInterests: extraInterests,
      extraValues: extraValues,
      avatarUrl: profile.avatarUrl || ''
    });
    setIsEditing(false);
  };

  // Profile completeness for own profile
  const getProfileCompleteness = () => {
    if (!currentUser) return { sections: [], percent: 0 };
    const sections = [
      { name: 'Basic Info', done: !!(currentUser.name && currentUser.age && currentUser.location) },
      { name: 'Interests & Values', done: (currentUser.interests?.length || 0) >= 5 && (currentUser.values?.length || 0) >= 5 },
      { name: 'MBTI Type', done: !!currentUser.mbtiType },
      { name: 'Zodiac Sign', done: !!currentUser.zodiacSign },
      { name: 'Lifestyle', done: !!(currentUser.lifestyle && (currentUser.lifestyle.availability?.length > 0 || currentUser.lifestyle.groupSize?.length > 0)) },
      { name: 'Friendship Goals', done: (currentUser.friendshipGoals?.length || 0) > 0 },
    ];
    const done = sections.filter(s => s.done).length;
    return { sections, percent: Math.round((done / sections.length) * 100) };
  };

  const completeness = getProfileCompleteness();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Viewing another user's profile
  if (viewUser) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <button className="profile-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1>{viewUser.name}'s Profile</h1>
          </div>

          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                {viewUser.avatar}
              </div>
              <h2>{viewUser.name}, {viewUser.age}</h2>
              <p className="profile-location">📍 {viewUser.location}</p>
              <p className="profile-bio">{viewUser.bio}</p>

              {viewUser.mbtiType && (
                <div className="profile-badges-row">
                  <span className="profile-mbti-badge">{viewUser.mbtiType}</span>
                  {viewUser.zodiacSign && (
                    <span className="profile-zodiac-badge">
                      {ZODIAC_SYMBOLS[viewUser.zodiacSign]} {viewUser.zodiacSign}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Match Breakdown */}
            {matchResult && (
              <div className="match-breakdown-section">
                <h3>Match Breakdown</h3>
                <div className="match-overall">
                  <span className="match-overall-score">{matchResult.overall}%</span>
                  <span className="match-overall-label">Overall Match</span>
                </div>

                {matchResult.highlights.length > 0 && (
                  <div className="match-highlights">
                    {matchResult.highlights.map((badge, idx) => (
                      <span key={idx} className="highlight-badge">{badge}</span>
                    ))}
                  </div>
                )}

                <div className="breakdown-bars">
                  <BreakdownBar label="Shared Interests" value={matchResult.breakdown.interests} />
                  <BreakdownBar label="Values Alignment" value={matchResult.breakdown.values} />
                  {matchResult.breakdown.mbti !== null ? (
                    <BreakdownBar
                      label={`MBTI (${currentUser.mbtiType || '?'} + ${viewUser.mbtiType || '?'})`}
                      value={matchResult.breakdown.mbti}
                    />
                  ) : (
                    <div className="breakdown-locked">MBTI -- Complete your profile to unlock</div>
                  )}
                  {matchResult.breakdown.astrology !== null ? (
                    <BreakdownBar
                      label={`Zodiac (${currentUser.zodiacSign || '?'} + ${viewUser.zodiacSign || '?'})`}
                      value={matchResult.breakdown.astrology}
                      sublabel={matchResult.breakdown.astrology >= 80 ? 'Cosmic Connection' : matchResult.breakdown.astrology >= 50 ? 'Interesting Mix' : 'Opposites Attract'}
                    />
                  ) : (
                    <div className="breakdown-locked">Zodiac -- Complete your profile to unlock</div>
                  )}
                  {matchResult.breakdown.lifestyle !== null ? (
                    <BreakdownBar label="Lifestyle Fit" value={matchResult.breakdown.lifestyle} />
                  ) : (
                    <div className="breakdown-locked">Lifestyle -- Complete your profile to unlock</div>
                  )}
                  {matchResult.breakdown.goals !== null ? (
                    <BreakdownBar label="Friendship Goals" value={matchResult.breakdown.goals} />
                  ) : (
                    <div className="breakdown-locked">Friendship Goals -- Complete your profile to unlock</div>
                  )}
                </div>

                {/* Shared interests/values */}
                <div className="shared-items">
                  <h4>What you have in common</h4>
                  <div className="tags">
                    {[...(viewUser.interests || []), ...(viewUser.extraInterests || [])]
                      .filter(i => [...(currentUser.interests || []), ...(currentUser.extraInterests || [])].includes(i))
                      .map((item, idx) => (
                        <span key={`i-${idx}`} className="tag tag-top">{item}</span>
                      ))
                    }
                    {[...(viewUser.values || []), ...(viewUser.extraValues || [])]
                      .filter(v => [...(currentUser.values || []), ...(currentUser.extraValues || [])].includes(v))
                      .map((item, idx) => (
                        <span key={`v-${idx}`} className="tag value-tag tag-top">{item}</span>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            <div className="profile-section">
              <h3>Interests</h3>
              <div className="tags">
                {(viewUser.interests || []).map((interest, idx) => (
                  <span key={idx} className="tag tag-top">{interest}</span>
                ))}
                {(viewUser.extraInterests || []).map((interest, idx) => (
                  <span key={`extra-${idx}`} className="tag tag-extra">{interest}</span>
                ))}
              </div>
            </div>

            <div className="profile-section">
              <h3>Values</h3>
              <div className="tags">
                {(viewUser.values || []).map((value, idx) => (
                  <span key={idx} className="tag value-tag tag-top">{value}</span>
                ))}
                {(viewUser.extraValues || []).map((value, idx) => (
                  <span key={`extra-${idx}`} className="tag value-tag tag-extra">{value}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Own profile view
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Completeness */}
        {!isEditing && (
          <div className="completeness-card">
            <div className="completeness-header">
              <span className="completeness-label">Profile Completeness</span>
              <span className="completeness-percent">{completeness.percent}%</span>
            </div>
            <div className="completeness-bar-bg">
              <div className="completeness-bar-fill" style={{ width: `${completeness.percent}%` }} />
            </div>
            <div className="completeness-sections">
              {completeness.sections.map((s, idx) => (
                <span key={idx} className={`completeness-item ${s.done ? 'done' : ''}`}>
                  {s.done ? '✓' : '○'} {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="profile-avatar-image"
                  />
                ) : (
                  profile.avatar || '👤'
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    type="button"
                    className="avatar-edit-button"
                    onClick={() => document.getElementById('avatar-file-input')?.click()}
                  >
                    ✏️
                  </button>
                  <input
                    id="avatar-file-input"
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="avatar-file-input"
                    onChange={(event) => {
                      const file = event.target.files && event.target.files[0];
                      if (!file) return;

                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfile((prev) => ({
                          ...prev,
                          avatarUrl: typeof reader.result === 'string' ? reader.result : prev.avatarUrl
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </>
              )}
            </div>
            {isEditing ? (
              <div className="profile-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
                <textarea
                  placeholder="Bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
                <button onClick={handleSave} className="save-btn" disabled={!canSaveTopPicks}>
                  Save Changes
                </button>
                {!canSaveTopPicks && (
                  <p className="profile-save-hint">
                    Choose exactly {maxTopInterests} interests and {maxTopValues} values to enable saving.
                  </p>
                )}
              </div>
            ) : (
              <>
                <h2>{profile.name}, {profile.age}</h2>
                <p className="profile-location">📍 {profile.location}</p>
                <p className="profile-bio">{profile.bio}</p>
                {(currentUser.mbtiType || currentUser.zodiacSign) && (
                  <div className="profile-badges-row">
                    {currentUser.mbtiType && <span className="profile-mbti-badge">{currentUser.mbtiType}</span>}
                    {currentUser.zodiacSign && (
                      <span className="profile-zodiac-badge">
                        {ZODIAC_SYMBOLS[currentUser.zodiacSign]} {currentUser.zodiacSign}
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="profile-section">
            <h3>Interests <span className="profile-limit">({topInterests.length}/{maxTopInterests} top picks)</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {interestsRemaining === 0 ? (
                  <p className="profile-limit-hint">You've picked your top {maxTopInterests}. Tap one to remove it.</p>
                ) : (
                  <p className="profile-limit-hint">Pick {interestsRemaining} more to complete your top {maxTopInterests}. The rest will still count, just a bit less.</p>
                )}
                <div className="selected-tags">
                  {profile.allInterests?.map((interest, idx) => {
                    const isTop = idx < maxTopInterests;
                    const tagClass = isTop ? 'tag selected tag-top' : 'tag selected tag-extra';
                    return (
                      <span
                        key={idx}
                        className={tagClass}
                        onClick={() => toggleInterest(interest)}
                      >
                        {interest} ×
                      </span>
                    );
                  })}
                </div>
                <div className="available-tags">
                  {availableInterests
                    .filter(i => !profile.allInterests?.includes(i))
                    .map((interest, idx) => (
                      <span
                        key={idx}
                        className="tag available"
                        onClick={() => toggleInterest(interest)}
                      >
                        + {interest}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="tags">
                {topInterests.map((interest, idx) => (
                  <span key={idx} className="tag tag-top">{interest}</span>
                ))}
                {extraInterests.map((interest, idx) => (
                  <span key={`extra-${idx}`} className="tag tag-extra">{interest}</span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3>Values <span className="profile-limit">({topValues.length}/{maxTopValues} top picks)</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {valuesRemaining === 0 ? (
                  <p className="profile-limit-hint">You've picked your top {maxTopValues}. Tap one to remove it.</p>
                ) : (
                  <p className="profile-limit-hint">Pick {valuesRemaining} more to complete your top {maxTopValues}. The rest will still count, just a bit less.</p>
                )}
                <div className="selected-tags">
                  {profile.allValues?.map((value, idx) => {
                    const isTop = idx < maxTopValues;
                    const base = 'tag selected value-tag';
                    const tagClass = isTop ? `${base} tag-top` : `${base} tag-extra`;
                    return (
                      <span
                        key={idx}
                        className={tagClass}
                        onClick={() => toggleValue(value)}
                      >
                        {value} ×
                      </span>
                    );
                  })}
                </div>
                <div className="available-tags">
                  {availableValues
                    .filter(v => !profile.allValues?.includes(v))
                    .map((value, idx) => (
                      <span
                        key={idx}
                        className="tag available value-tag"
                        onClick={() => toggleValue(value)}
                      >
                        + {value}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="tags">
                {topValues.map((value, idx) => (
                  <span key={idx} className="tag value-tag tag-top">{value}</span>
                ))}
                {extraValues.map((value, idx) => (
                  <span key={`extra-${idx}`} className="tag value-tag tag-extra">{value}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Breakdown bar component
const BreakdownBar = ({ label, value, sublabel }) => (
  <div className="breakdown-row">
    <div className="breakdown-label">
      <span>{label}</span>
      <span className="breakdown-value">{value}%</span>
    </div>
    <div className="breakdown-bar-bg">
      <div
        className="breakdown-bar-fill"
        style={{ width: `${value}%` }}
      />
    </div>
    {sublabel && <span className="breakdown-sublabel">{sublabel}</span>}
  </div>
);

export default ProfilePage;
