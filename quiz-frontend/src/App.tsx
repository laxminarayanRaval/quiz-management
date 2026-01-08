import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateQuizPage from './pages/CreateQuizPage';
import PublicQuizPage from './pages/PublicQuizPage';
import './index.css';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <div className="App min-h-screen">
        <Routes>
          <Route path="/" element={<CreateQuizPage />} />
          <Route path="/quiz/:id" element={<PublicQuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
