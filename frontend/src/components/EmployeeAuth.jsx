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
        container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ecfdf5', padding: '20px' },
        card: { width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
        title: { fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px', color: '#065f46' },
        input: { width: '100%', padding: '12px', marginBottom: '16px', border: '1px solid #d1d5db', borderRadius: '6px' },
        button: { width: '100%', padding: '12px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
        link: { display: 'block', textAlign: 'center', marginTop: '16px', color: '#059669', cursor: 'pointer', textDecoration: 'underline' },
        error: { color: 'red', textAlign: 'center', marginBottom: '10px' },
        success: { color: 'green', textAlign: 'center', marginBottom: '10px' }
    };

    return (
        <div className="bg-pattern" style={{
            minHeight: '100%', position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Inter', sans-serif", padding: '20px'
        }}>
            <form className="glass" style={{
                width: '100%', maxWidth: '400px',
                padding: '40px',
                borderRadius: '24px',
                display: 'flex', flexDirection: 'column', gap: '20px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
            }} onSubmit={handleSubmit}>

                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d1fae5 0%, #10b981 100%)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', marginBottom: '15px',
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                    }}>
                        {isRegister ? <UserPlus size={28} /> : <LogIn size={28} />}
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                        {isRegister ? 'Create Account' : 'Employee Login'}
                    </h1>
                    <p style={{ color: '#6b7280', marginTop: '8px', fontSize: '14px' }}>
                        {isRegister ? 'Join the support team' : 'Welcome back, please login'}
                    </p>
                </div>

                {error && <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontSize: '14px', textAlign: 'center' }}>{error}</div>}
                {success && <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '14px', textAlign: 'center' }}>{success}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 20px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px', outline: 'none',
                            fontSize: '15px', transition: 'border-color 0.2s',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 20px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px', outline: 'none',
                            fontSize: '15px', transition: 'border-color 0.2s',
                            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        required
                    />
                </div>

                <button type="submit" style={{
                    width: '100%', padding: '14px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white', border: 'none',
                    borderRadius: '12px', cursor: 'pointer',
                    fontSize: '16px', fontWeight: '600',
                    marginTop: '10px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                    transition: 'transform 0.1s'
                }}>
                    {isRegister ? 'Submit Registration' : 'Sign In'}
                </button>

                <div style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <span
                        style={{ color: '#059669', fontWeight: '600', cursor: 'pointer', marginLeft: '4px' }}
                        onClick={() => { setIsRegister(!isRegister); setError(''); }}
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </span>
                </div>
            </form>
        </div>
    );
};

export default EmployeeAuth;
