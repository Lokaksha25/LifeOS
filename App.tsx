
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { TimelinePage } from './pages/TimelinePage';
import { JournalPage } from './pages/JournalPage';
import { GalleryPage } from './pages/GalleryPage';
import { LevelUpPage } from './pages/LevelUpPage';
import { PlannerPage } from './pages/PlannerPage';
import { ThemeSwitch } from './components/ThemeSwitch';

const App: React.FC = () => {
  return (
    <Router>
      <div className="antialiased">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/journal/:month" element={<JournalPage />} />
          <Route path="/gallery/:month" element={<GalleryPage />} />
          <Route path="/levelup/:month" element={<LevelUpPage />} />
          <Route path="/planner/:month" element={<PlannerPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ThemeSwitch />
      </div>
    </Router>
  );
};

export default App;
