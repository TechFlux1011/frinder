import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/Navigation';
import FloatingMessagesButton from './components/FloatingMessagesButton';
import SwipePage from './pages/SwipePage';
import RecommendationsPage from './pages/RecommendationsPage';
import GroupsPage from './pages/GroupsPage';
import MatchesPage from './pages/MatchesPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import PlansPage from './pages/PlansPage';
import OnboardingPage from './pages/OnboardingPage';
import './App.css';

import OnboardingProfilePage from './pages/OnboardingProfilePage';
import OnboardingInterestsPage from './pages/OnboardingInterestsPage';

const AppLayout = () => {
  const location = useLocation();
  const path = location.pathname || '/';
  const { hasCompletedOnboarding } = useApp();

  const isOnboardingSplash = !hasCompletedOnboarding && path === '/';
  const isOnboarding =
    isOnboardingSplash ||
    path.startsWith('/onboarding');

  return (
    <div className="App">
      {!isOnboarding && <Navigation />}
      <Routes>
        <Route
          path="/"
          element={
            hasCompletedOnboarding ? <Navigate to="/home" replace /> : <OnboardingPage />
          }
        />
        <Route path="/onboarding/profile" element={<OnboardingProfilePage />} />
        <Route path="/onboarding/interests" element={<OnboardingInterestsPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/plans" element={<PlansPage />} />
      </Routes>
      {!isOnboarding && <FloatingMessagesButton />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppLayout />
      </Router>
    </AppProvider>
  );
}

export default App;
