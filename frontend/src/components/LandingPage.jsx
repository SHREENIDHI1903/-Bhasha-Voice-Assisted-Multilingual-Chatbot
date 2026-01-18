import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const styles = {
        container: { height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
        title: { fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '40px', color: '#1f2937' },
        cardContainer: { display: 'flex', gap: '30px' },
        card: { width: '250px', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
        cardTitle: { marginTop: '20px', fontSize: '1.25rem', fontWeight: '600' },
        icon: { width: '64px', height: '64px' }
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Welcome to Voice Chat</h1>

            <div style={styles.cardContainer}>
                {/* Customer Portal */}
                <div style={styles.card} onClick={() => navigate('/customer')}>
                    <div style={{ ...styles.icon, color: '#2563eb' }}>
                        <Users size={64} />
                    </div>
                    <h2 style={styles.cardTitle}>I am a Customer</h2>
                </div>

                {/* Employee Portal */}
                <div style={styles.card} onClick={() => navigate('/employee')}>
                    <div style={{ ...styles.icon, color: '#059669' }}>
                        <UserCog size={64} />
                    </div>
                    <h2 style={styles.cardTitle}>Employee Login</h2>
                </div>

                {/* Admin Portal */}
                <div style={styles.card} onClick={() => navigate('/admin')}>
                    <div style={{ ...styles.icon, color: '#7c3aed' }}>
                        <ShieldCheck size={64} />
                    </div>
                    <h2 style={styles.cardTitle}>Admin Panel</h2>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
