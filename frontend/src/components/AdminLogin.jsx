import React, { useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';
import { getApiUrl } from '../config';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${getApiUrl()}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Login failed');

            if (data.role !== 'admin') {
                throw new Error("Access Denied: You are not an admin.");
            }

            // Success
            onLogin(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const styles = {
        container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif', padding: '20px' },
        card: { width: '100%', maxWidth: '350px', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '5px solid #7c3aed' },
        title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
        input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '6px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        error: { color: '#dc2626', textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px' }
    };

    return (
    return (
        <div className="bg-pattern" style={{
            minHeight: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", padding: '20px'
        }}>
            <form className="glass" style={{
                width: '100%', maxWidth: '380px',
                padding: '40px',
                borderRadius: '24px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                borderTop: 'none'
            }} onSubmit={handleSubmit}>

                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', marginBottom: '15px',
                        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)'
                    }}>
                        <ShieldAlert size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                        Admin Portal
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '6px', fontSize: '14px' }}>
                        Type-0 High Security Clearance
                    </p>
                </div>

                {error && <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Admin ID"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 20px',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px', outline: 'none',
                                fontSize: '15px',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            required
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="Passcode"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 20px',
                                backgroundColor: 'rgba(255,255,255,0.8)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px', outline: 'none',
                                fontSize: '15px',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                            }}
                            required
                        />
                    </div>
                </div>

                <button type="submit" style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    color: 'white', border: 'none',
                    borderRadius: '12px', cursor: 'pointer',
                    fontSize: '16px', fontWeight: '700',
                    marginTop: '10px',
                    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                    letterSpacing: '0.5px'
                }}>
                    AUTHENTICATE
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
