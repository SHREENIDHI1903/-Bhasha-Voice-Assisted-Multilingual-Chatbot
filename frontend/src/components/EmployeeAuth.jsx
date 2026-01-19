import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, LogIn } from 'lucide-react';
import { getApiUrl } from '../config';

const EmployeeAuth = ({ onLogin }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const endpoint = isRegister ? `${getApiUrl()}/auth/register` : `${getApiUrl()}/auth/login`;

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail || 'Request failed');

            if (isRegister) {
                setSuccess('Registration successful! Please wait for Admin approval.');
                setIsRegister(false); // Switch back to login
            } else {
                // Login Success
                onLogin(data);
                navigate('/app'); // Irrespective of role, go to chat app? Or maybe logic in App.jsx handles that
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const styles = {
        container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5' },
        card: { width: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
        title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#065f46' },
        input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '6px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        link: { display: 'block', textAlign: 'center', marginTop: '16px', color: '#059669', cursor: 'pointer', textDecoration: 'underline' },
        error: { color: 'red', textAlign: 'center', marginBottom: '10px' },
        success: { color: 'green', textAlign: 'center', marginBottom: '10px' }
    };

    return (
        <div style={styles.container}>
            <form style={styles.card} onSubmit={handleSubmit}>
                <h1 style={styles.title}>{isRegister ? 'Employee Registration' : 'Employee Login'}</h1>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <input
                    type="text"
                    placeholder="Username"
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
                    {isRegister ? 'Register' : 'Login'}
                </button>

                <span style={styles.link} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
                    {isRegister ? 'Already have an account? Login' : 'New employee? Register here'}
                </span>
            </form>
        </div>
    );
};

export default EmployeeAuth;
