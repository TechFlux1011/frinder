import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const OnboardingProfilePage = () => {
  const { currentUser, updateCurrentUser } = useApp();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    age: '',
    bio: '',
    location: '',
    avatarUrl: ''
  });

  useEffect(() => {
    if (!currentUser) return;
    setProfile({
      name: currentUser.name || '',
      age: currentUser.age || '',
      bio: currentUser.bio || '',
      location: currentUser.location || '',
      avatarUrl: currentUser.avatarUrl || ''
    });
  }, [currentUser]);

  const isComplete =
    profile.name.trim() &&
    profile.age &&
    profile.location.trim();

  const handleContinue = () => {
    if (!isComplete) return;

    updateCurrentUser({
      name: profile.name.trim(),
      age: profile.age,
      bio: profile.bio.trim(),
      location: profile.location.trim(),
      avatarUrl: profile.avatarUrl
    });

    navigate('/onboarding/interests');
  };

  if (!currentUser) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
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
                  '👤'
                )}
              </div>
              <button
                type="button"
                className="avatar-edit-button"
                onClick={() =>
                  document.getElementById('onboarding-avatar-file-input')?.click()
                }
              >
                ✏️
              </button>
              <input
                id="onboarding-avatar-file-input"
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
                      avatarUrl:
                        typeof reader.result === 'string'
                          ? reader.result
                          : prev.avatarUrl
                    }));
                  };
                  reader.readAsDataURL(file);
                }}
              />
          </div>

            <div className="profile-form">
              <h1 className="onboarding-title">Create your profile</h1>
              <p className="onboarding-subtitle">
                Add a selfie and a few details so friends recognize you.
              </p>
              <input
                type="text"
                placeholder="Name"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="Age"
                value={profile.age}
                onChange={(e) =>
                  setProfile({ ...profile, age: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Location"
                value={profile.location}
                onChange={(e) =>
                  setProfile({ ...profile, location: e.target.value })
                }
              />
              <textarea
                placeholder="Short bio (optional)"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
              <button
                className="save-btn"
                disabled={!isComplete}
                onClick={handleContinue}
              >
                Continue to interests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingProfilePage;

