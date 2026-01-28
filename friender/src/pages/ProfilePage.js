import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, updateCurrentUser } = useApp();
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

    // If the user hasn't really set up their profile yet, drop them into edit mode.
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
    // In a real app, this would save to backend
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

  if (!currentUser) {
    return <div>Loading...</div>;
  }

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
              </>
            )}
          </div>

          <div className="profile-section">
            <h3>Interests <span className="profile-limit">({topInterests.length}/{maxTopInterests} top picks)</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {interestsRemaining === 0 ? (
                  <p className="profile-limit-hint">You’ve picked your top {maxTopInterests}. Tap one to remove it.</p>
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
                  <span key={idx} className="tag">{interest}</span>
                ))}
                {extraInterests.map((interest, idx) => (
                  <span key={`extra-${idx}`} className="tag">{interest}</span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3>Values <span className="profile-limit">({topValues.length}/{maxTopValues} top picks)</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {valuesRemaining === 0 ? (
                  <p className="profile-limit-hint">You’ve picked your top {maxTopValues}. Tap one to remove it.</p>
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
                  <span key={idx} className="tag value-tag">{value}</span>
                ))}
                {extraValues.map((value, idx) => (
                  <span key={`extra-${idx}`} className="tag value-tag">{value}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
