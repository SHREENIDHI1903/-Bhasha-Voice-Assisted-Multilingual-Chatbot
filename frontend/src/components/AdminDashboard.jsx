import React, { useEffect, useState } from 'react';
import { Check, X, Shield, LogOut } from 'lucide-react';
import { getApiUrl } from '../config';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    // Fetch ALL users (modified endpoint to /users)
    const fetchUsers = async () => {
        try {
            const res = await fetch(`${getApiUrl()}/auth/users`);
            const data = await res.json();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleApprove = async (username) => {
        try {
            await fetch(`${getApiUrl()}/auth/approve/${username}`, { method: 'POST' });
            fetchUsers(); // Refresh
        } catch (err) {
            alert("Approve failed");
        }
    };

    const handleBlock = async (username) => {
        if (!window.confirm(`Are you sure you want to block ${username}?`)) return;
        try {
            await fetch(`${getApiUrl()}/auth/block/${username}`, { method: 'POST' });
            fetchUsers(); // Refresh
        } catch (err) {
            alert("Block failed");
        }
    };

    // Filter lists
    const pendingUsers = Array.isArray(users) ? users.filter(u => !u.approved) : [];
    const activeUsers = Array.isArray(users) ? users.filter(u => u.approved) : [];

    return (
        <div className="bg-pattern" style={{
            minHeight: '100vh',
            padding: '40px',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <header className="glass" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: '40px', padding: '20px 30px',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.6)'
                }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '24px', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                        <div style={{ padding: '8px', background: '#7c3aed', borderRadius: '12px', color: 'white', display: 'flex' }}>
                            <Shield size={24} />
                        </div>
                        Admin Dashboard
                    </h1>
                    <button onClick={() => window.location.href = '/'} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', backgroundColor: 'white',
                        color: '#4b5563', border: '1px solid #e5e7eb',
                        borderRadius: '12px', cursor: 'pointer', fontWeight: '600',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                    }}>
                        <LogOut size={18} /> Exit
                    </button>
                </header>

                {error && <p style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '15px', borderRadius: '12px', textAlign: 'center' }}>{error}</p>}

                <div style={{ display: 'grid', gap: '40px' }}>

                    {/* PENDING SECTION */}
                    <section>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ⏳ Pending Approvals
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {pendingUsers.length === 0 ? (
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No pending requests found.</div>
                            ) : (
                                pendingUsers.map(u => (
                                    <div key={u.username} className="glass" style={{
                                        padding: '20px 24px', borderRadius: '16px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                        border: '1px solid white'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827', display: 'block' }}>{u.username}</span>
                                            <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '500' }}>Awaiting Access</span>
                                        </div>
                                        <button onClick={() => handleApprove(u.username)} style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '10px 20px',
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white', border: 'none',
                                            borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                                        }}>
                                            <Check size={18} /> Approve
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* ACTIVE SECTION */}
                    <section>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            ✅ Active Employees
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {activeUsers.length === 0 ? (
                                <div style={{ padding: '30px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>No active employees found.</div>
                            ) : (
                                activeUsers.map(u => (
                                    <div key={u.username} className="glass" style={{
                                        padding: '20px 24px', borderRadius: '16px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
                                        border: '1px solid white'
                                    }}>
                                        <div>
                                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#111827', display: 'block' }}>{u.username}</span>
                                            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: '500' }}>authorized_user</span>
                                        </div>
                                        <button onClick={() => handleBlock(u.username)} style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '10px 20px',
                                            backgroundColor: '#fee2e2',
                                            color: '#dc2626', border: '1px solid #fecaca',
                                            borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                                            transition: 'background-color 0.2s'
                                        }}>
                                            <X size={18} /> Revoke
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
