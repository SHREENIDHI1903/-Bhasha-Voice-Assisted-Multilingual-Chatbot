import React, { useState } from 'react';
import { ShieldAlert, Lock } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://localhost:8000/auth/login', {
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
        container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif' },
        card: { width: '350px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', borderTop: '5px solid #7c3aed' },
        title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
        input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '6px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#7c3aed', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        error: { color: '#dc2626', textAlign: 'center', marginBottom: '15px', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px' }
    };

    return (
        <div style={styles.container}>
            <form style={styles.card} onSubmit={handleSubmit}>
                <h1 style={styles.title}><ShieldAlert color="#7c3aed" /> Admin Access</h1>

                {error && <div style={styles.error}>{error}</div>}

                <input
                    type="text"
                    placeholder="Admin Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    style={styles.input}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>
                    Login to Dashboard
                </button>
            </form>
        </div>
    );
};

export default AdminLogin;
