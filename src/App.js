import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalyzePage from './pages/AnalyzePage';
import MindReaderPage from './pages/MindReaderPage';
import CommunityPage from './pages/CommunityPage';
import { AuthProvider } from './components/AuthProvider';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/mind-reader" element={<MindReaderPage />} />
            <Route path="/community" element={<CommunityPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;