// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext'; // Import useAuth here
import Login from './components/Login';
import SecurePage from './components/checklist';
import Navigation from './components/navigation';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route 
              path="/secure" 
              element={
                <ProtectedRoute>
                  <Navigation /> 
                  <SecurePage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

// ProtectedRoute component to handle authentication check
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  console.log('Is authenticated:', isAuthenticated); // Debug log

  return isAuthenticated ? children : <Navigate to="/" replace />;
};


export default App;