import React, { useState } from 'react';
import { useIdleTimeout } from './hooks/useIdleTimeout';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import ChatInterface from './components/ChatInterface';
import LandingPage from './components/LandingPage';
import EmployeeAuth from './components/EmployeeAuth';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';

function App() {
  // Session State (Persisted)
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("chat_session");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [adminSession, setAdminSession] = useState(null);

  // Helper to handle login from any flow
  const handleChatStart = (role, userId, lang) => {
    const newSession = { role, userId, lang };
    localStorage.setItem("chat_session", JSON.stringify(newSession));
    setSession(newSession);
  };

  // Protected Chat Route Wrapper
  const ProtectedChat = () => {
    if (!session) return <Navigate to="/" />;

    // Auto-Logout after 5 minutes of inactivity
    useIdleTimeout(300000, () => {
      alert("Session timed out due to inactivity.");
      localStorage.removeItem("chat_session");
      setSession(null);
    });

    return (
      <ChatInterface
        role={session.role}
        userId={session.userId}
        lang={session.lang}
        onLogout={() => {
          localStorage.removeItem("chat_session");
          setSession(null);
        }}
      />
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Landing Page (Role Selection) */}
        <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/chat" />} />

        {/* 2. Customer Flow -> Direct to Login (Role locked to customer) */}
        <Route path="/customer" element={
          session ? <Navigate to="/chat" /> : (
            <LoginScreen
              defaultRole="customer"
              onJoin={handleChatStart}
            />
          )
        } />

        {/* 3. Employee Flow -> Auth -> then LoginScreen (for Lang selection) */}
        <Route path="/employee" element={
          <EmployeeAuth
            onLogin={(userData) => {
              // After auth success, we need Language selection.
              // For MVP, we pass them to LoginScreen but with ID pre-filled and Role locked.
              // We can pass state via Navigation, but simple way is to use a specific Route.
              window.location.href = `/employee-setup?user=${userData.username}`;
            }}
          />
        } />

        {/* 4. Employee Setup (Language Selection) */}
        <Route path="/employee-setup" element={
          session ? <Navigate to="/chat" /> : <LoginScreenCallbackHelper onJoin={handleChatStart} />
        } />

        {/* 5. Admin Flow (Protected) */}
        <Route path="/admin" element={
          adminSession ? (
            <AdminDashboard />
          ) : (
            <AdminLogin onLogin={(data) => setAdminSession(data)} />
          )
        } />

        {/* 6. The Chat App */}
        <Route path="/chat" element={<ProtectedChat />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

// Helper component to read URL params for Employee Setup
const LoginScreenCallbackHelper = ({ onJoin }) => {
  const params = new URLSearchParams(window.location.search);
  const username = params.get('user') || '';

  return (
    <LoginScreen
      defaultRole="employee"
      lockedName={username} // New prop to lock name
      onJoin={onJoin}
    />
  );
};

export default App;