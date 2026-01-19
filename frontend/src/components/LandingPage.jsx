import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCog, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
    const navigate = useNavigate();

    const styles = {
        container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f2f5', fontFamily: 'Arial, sans-serif', padding: '20px', textAlign: 'center' },
        title: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '40px', color: '#1f2937' }, // Reduced font size slightly
        cardContainer: { display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1000px' },
        card: { width: '100%', maxWidth: '250px', padding: '30px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' },
        cardTitle: { marginTop: '20px', fontSize: '1.25rem', fontWeight: '600' },
        icon: { width: '64px', height: '64px' }
    };

    return (
        <div className="bg-pattern" style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            padding: '40px 20px', // Extra padding for scroll space
        }}>
            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    background: '-webkit-linear-gradient(45deg, #2563eb, #9333ea)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    Voice AI Assistant
                </h1>
                <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Select your portal to continue</p>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '1000px' }}>

                {/* Customer Portal */}
                <div onClick={() => navigate('/customer')} className="glass" style={{
                    flex: '1 1 250px', maxWidth: '300px',
                    padding: '40px 30px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(37, 99, 235, 0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <div style={{
                        padding: '20px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                        color: '#2563eb', marginBottom: '20px'
                    }}>
                        <Users size={48} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Customer</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>Instant Access</p>
                </div>

                {/* Employee Portal */}
                <div onClick={() => navigate('/employee')} className="glass" style={{
                    flex: '1 1 250px', maxWidth: '300px',
                    padding: '40px 30px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <div style={{
                        padding: '20px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d1fae5 0%, #ecfdf5 100%)',
                        color: '#059669', marginBottom: '20px'
                    }}>
                        <UserCog size={48} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Employee</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>Login Required</p>
                </div>

                {/* Admin Portal */}
                <div onClick={() => navigate('/admin')} className="glass" style={{
                    flex: '1 1 250px', maxWidth: '300px',
                    padding: '40px 30px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '1px solid rgba(255,255,255,0.5)'
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(124, 58, 237, 0.2)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                    <div style={{
                        padding: '20px', borderRadius: '50%',
                        background: 'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
                        color: '#7c3aed', marginBottom: '20px'
                    }}>
                        <ShieldCheck size={48} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>Admin</h2>
                    <p style={{ color: '#6b7280', margin: 0 }}>System Control</p>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
