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

  // --- STYLES ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif', padding: '20px' },
    card: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '20px' },
    title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '8px', display: 'block' },
    roleContainer: { display: 'flex', gap: '10px' },
    roleButton: (isSelected, color) => ({ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: isSelected ? color : '#e5e7eb', color: isSelected ? 'white' : '#374151', fontWeight: 'bold' }),
    input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px', boxSizing: 'border-box' },
    joinButton: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: role === 'customer' ? '#2563eb' : '#059669', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px' },
    disabledInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f3f4f6', color: '#6b7280' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ backgroundColor: role === 'customer' ? '#dbeafe' : '#d1fae5', padding: '12px', borderRadius: '50%', marginBottom: '15px' }}>
            <User size={32} color={role === 'customer' ? '#2563eb' : '#059669'} />
          </div>
          <h1 style={styles.title}>Voice Chat Portal</h1>
        </div>

        {/* 1. SELECT ROLE (Hidden if locked) */}
        {!defaultRole && (
          <div>
            <label style={styles.label}>Select Role</label>
            <div style={styles.roleContainer}>
              <button style={styles.roleButton(role === 'customer', '#2563eb')} onClick={() => setRole('customer')}>Customer</button>
              <button style={styles.roleButton(role === 'employee', '#059669')} onClick={() => setRole('employee')}>Employee</button>
            </div>
          </div>
        )}

        {/* 2. SELECT LANGUAGE */}
        <div>
          <label style={styles.label}>My Language</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '8px', padding: '0 10px', backgroundColor: 'white' }}>
            <Globe size={20} color="#666" />
            <select
              style={{ ...styles.input, border: 'none', outline: 'none', backgroundColor: 'transparent' }}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
        </div>

        {/* 3. ENTER NAME */}
        <div>
          <label style={styles.label}>Display Name</label>
          <input
            type="text"
            style={lockedName ? styles.disabledInput : styles.input}
            placeholder="e.g. John"
            value={userId}
            onChange={(e) => !lockedName && setUserId(e.target.value)}
            disabled={!!lockedName}
          />
        </div>

        <button style={styles.joinButton} onClick={handleJoin}>Start Chat <LogIn size={20} /></button>
      </div>
    </div>
  );
};

export default LoginScreen;