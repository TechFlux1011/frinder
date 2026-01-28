import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navigation from './components/Navigation';
import SwipePage from './pages/SwipePage';
import RecommendationsPage from './pages/RecommendationsPage';
import GroupsPage from './pages/GroupsPage';
import MatchesPage from './pages/MatchesPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="App">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/swipe" element={<SwipePage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
