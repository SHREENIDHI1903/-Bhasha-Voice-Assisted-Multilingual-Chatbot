import React, { useState } from 'react';
import { User, LogIn, Globe } from 'lucide-react';

// --- LIST OF LANGUAGES ---
const LANGUAGES = [
  // --- INDIAN LANGUAGES ---
  { code: 'kn', name: 'Kannada (ಕನ್ನಡ)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ml', name: 'Malayalam (മലയാളം)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'mr', name: 'Marathi (मराठी)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', name: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'ur', name: 'Urdu (اردو)' },
  { code: 'or', name: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'as', name: 'Assamese (অসমীয়া)' },
  { code: 'sa', name: 'Sanskrit (संस्कृतम्)' },
  { code: 'ne', name: 'Nepali (नेपाली)' },
  { code: 'sd', name: 'Sindhi (सिंधी)' },
  { code: 'ks', name: 'Kashmiri (कश्मीरी)' },
  { code: 'kok', name: 'Konkani (कोंकणी)' },
  { code: 'doi', name: 'Dogri (डोगरी)' },
  { code: 'mai', name: 'Maithili (मैथिली)' },
  { code: 'mni', name: 'Manipuri (মৈতৈলোন্)' },
  { code: 'brx', name: 'Bodo (बर/बड़)' },
  { code: 'sat', name: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)' },

  // --- GLOBAL ---
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'ru', name: 'Russian (Русский)' },
  { code: 'zh', name: 'Chinese (中文)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'ko', name: 'Korean (한국어)' },
  { code: 'ar', name: 'Arabic (العربية)' }
];

const LoginScreen = ({ onJoin, defaultRole, lockedName }) => {
  const [role, setRole] = useState(defaultRole || 'customer');
  const [userId, setUserId] = useState(lockedName || '');
  // Default language is English
  const [lang, setLang] = useState('en');

  const handleJoin = () => {
    if (!userId.trim()) return alert("Please enter a User ID/Name");
    // Pass 'lang' to the parent component
    onJoin(role, userId, lang);
  };

  const containerStyle = {
    minHeight: '100vh', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', fontFamily: "'Inter', sans-serif"
  };

  return (
    <div className="bg-pattern" style={containerStyle}>
      <div className="glass" style={{
        width: '100%', maxWidth: '400px',
        padding: '40px',
        borderRadius: '24px',
        display: 'flex', flexDirection: 'column', gap: '25px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '70px', height: '70px', borderRadius: '50%',
            background: role === 'customer' ? 'linear-gradient(135deg, #dbeafe 0%, #2563eb 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #059669 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '15px', color: 'white',
            boxShadow: role === 'customer' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : '0 4px 15px rgba(5, 150, 105, 0.3)'
          }}>
            <User size={32} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
            Voice Link
          </h1>
          <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>
            {role === 'customer' ? 'Customer Support Portal' : 'Employee Access System'}
          </p>
        </div>

        {/* 1. ROLE SELECTOR (If allowed) */}
        {!defaultRole && (
          <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '5px', borderRadius: '12px', display: 'flex', border: '1px solid #e5e7eb' }}>
            <button
              onClick={() => setRole('customer')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: role === 'customer' ? 'white' : 'transparent',
                color: role === 'customer' ? '#2563eb' : '#6b7280',
                fontWeight: role === 'customer' ? '600' : '500',
                boxShadow: role === 'customer' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}>Customer</button>
            <button
              onClick={() => setRole('employee')}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                backgroundColor: role === 'employee' ? 'white' : 'transparent',
                color: role === 'employee' ? '#059669' : '#6b7280',
                fontWeight: role === 'employee' ? '600' : '500',
                boxShadow: role === 'employee' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s'
              }}>Employee</button>
          </div>
        )}

        {/* 2. LANGUAGE SELECTOR */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block', paddingLeft: '4px' }}>
            Preferred Language
          </label>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #e5e7eb', borderRadius: '12px',
            padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.8)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Globe size={20} color="#6b7280" style={{ marginRight: '10px' }} />
            <select
              style={{
                width: '100%', border: 'none', outline: 'none',
                backgroundColor: 'transparent', fontSize: '15px', color: '#1f2937',
                cursor: 'pointer'
              }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>

        {/* 3. NAME INPUT */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px', display: 'block', paddingLeft: '4px' }}>
            Display Name
          </label>
          <input
            type="text"
            style={{
              width: '100%', padding: '14px 16px',
              borderRadius: '12px', border: '1px solid #e5e7eb',
              fontSize: '15px', outline: 'none',
              backgroundColor: lockedName ? '#f3f4f6' : 'rgba(255,255,255,0.8)',
              color: lockedName ? '#9ca3af' : '#1f2937',
              cursor: lockedName ? 'not-allowed' : 'text',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
            }}
            placeholder="Enter your name..."
            value={userId}
            onChange={(e) => !lockedName && setUserId(e.target.value)}
            disabled={!!lockedName}
          />
        </div>

        <button
          onClick={handleJoin}
          style={{
            width: '100%', padding: '16px',
            background: role === 'customer'
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white', border: 'none',
            borderRadius: '12px', cursor: 'pointer',
            fontSize: '16px', fontWeight: '700',
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
            boxShadow: role === 'customer' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'transform 0.1s',
            marginTop: '10px'
          }}>
          Start Session <LogIn size={20} />
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;