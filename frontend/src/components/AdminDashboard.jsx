import React, { useEffect, useState } from 'react';
import { Check, X, Shield, LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');

    // Fetch ALL users (modified endpoint to /users)
    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:8000/auth/users');
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
            await fetch(`http://localhost:8000/auth/approve/${username}`, { method: 'POST' });
            fetchUsers(); // Refresh
        } catch (err) {
            alert("Approve failed");
        }
    };

    const handleBlock = async (username) => {
        if (!window.confirm(`Are you sure you want to block ${username}?`)) return;
        try {
            await fetch(`http://localhost:8000/auth/block/${username}`, { method: 'POST' });
            fetchUsers(); // Refresh
        } catch (err) {
            alert("Block failed");
        }
    };

    // Filter lists
    const pendingUsers = Array.isArray(users) ? users.filter(u => !u.approved) : [];
    const activeUsers = Array.isArray(users) ? users.filter(u => u.approved) : [];

    // Styles
    const styles = {
        container: { padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' },
        title: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', color: '#1f2937' },
        sectionTitle: { fontSize: '20px', fontWeight: 'bold', marginTop: '30px', marginBottom: '15px', color: '#374151' },
        card: { backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
        username: { fontSize: '18px', fontWeight: 'bold' },
        actions: { display: 'flex', gap: '10px' },
        btnApprove: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
        btnBlock: { display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
        empty: { fontStyle: 'italic', color: '#6b7280' }
    };

    return (
        <div style={styles.container}>
            <header style={styles.header}>
                <h1 style={styles.title}><Shield /> Admin Dashboard</h1>
                {/* Logout just reloads the page to clear state/reset */}
                <button onClick={() => window.location.href = '/'} style={{ ...styles.btnBlock, backgroundColor: '#4b5563' }}>
                    <LogOut size={16} /> Exit
                </button>
            </header>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* PENDING SECTION */}
            <h2 style={styles.sectionTitle}>⏳ Pending Approvals</h2>
            {pendingUsers.length === 0 ? (
                <div style={styles.empty}>No pending requests.</div>
            ) : (
                pendingUsers.map(u => (
                    <div key={u.username} style={styles.card}>
                        <span style={styles.username}>{u.username}</span>
                        <div style={styles.actions}>
                            <button style={styles.btnApprove} onClick={() => handleApprove(u.username)}>
                                <Check size={16} /> Approve
                            </button>
                        </div>
                    </div>
                ))
            )}

            {/* ACTIVE SECTION */}
            <h2 style={styles.sectionTitle}>✅ Active Employees</h2>
            {activeUsers.length === 0 ? (
                <div style={styles.empty}>No active employees.</div>
            ) : (
                activeUsers.map(u => (
                    <div key={u.username} style={styles.card}>
                        <span style={styles.username}>{u.username}</span>
                        <div style={styles.actions}>
                            <button style={styles.btnBlock} onClick={() => handleBlock(u.username)}>
                                <X size={16} /> Revoke Access
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default AdminDashboard;
