
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useAppContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import CalendarPage from './pages/CalendarPage';
import StatusPage from './pages/StatusPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppProvider>
  );
};

export default App;
