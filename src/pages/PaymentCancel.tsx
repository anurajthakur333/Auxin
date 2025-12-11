import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../lib/apiConfig';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/fonts.css';
import '../styles/Main.css';

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState(true);

  useEffect(() => {
    const cancelPendingAppointment = async () => {
      try {
        // Get appointment ID from URL or localStorage
        const appointmentId = searchParams.get('appointmentId') || localStorage.getItem('pendingAppointmentId');

        if (appointmentId) {
          // Cancel the pending appointment
          await fetch(`${API_BASE_URL}/api/paypal/cancel-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ appointmentId })
          });
        }

        // Clear stored payment data
        localStorage.removeItem('pendingAppointmentId');
        localStorage.removeItem('pendingOrderId');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      } finally {
        setCancelling(false);
      }
    };

    if (user) {
      cancelPendingAppointment();
    } else {
      setCancelling(false);
    }
  }, [user, searchParams]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#000',
      position: 'relative',
      zIndex: 1
    }}>
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div style={{
          background: '#111',
          padding: '3rem',
          maxWidth: '500px',
          width: '100%',
          textAlign: 'center'
        }}>
          {cancelling ? (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid #333',
                borderTop: '3px solid #FFA500',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 2rem'
              }} />
              <h2 className="aeonik-mono" style={{ 
                color: '#FFA500', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Cancelling...
              </h2>
              <p style={{ color: '#888' }}>Please wait while we cancel your booking.</p>
            </>
          ) : (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 165, 0, 0.1)',
                border: '2px solid #FFA500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 2rem'
              }}>
                <svg 
                  width="40" 
                  height="40" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#FFA500" 
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="aeonik-mono" style={{ 
                color: '#FFA500', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                Payment Cancelled
              </h2>
              <p style={{ color: '#888', marginBottom: '1rem' }}>
                Your payment was cancelled and no charges were made.
              </p>
              <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.9rem' }}>
                The time slot has been released and is available for booking again.
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                <button
                  onClick={() => navigate('/meeting')}
                  style={{
                    background: '#39FF14',
                    color: '#000',
                    border: 'none',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%',
                    fontFamily: 'Aeonik, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#2ecc11'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#39FF14'}
                >
                  Book Another Time
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'transparent',
                    color: '#888',
                    border: '1px solid #333',
                    padding: '1rem 2rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    width: '100%',
                    fontFamily: 'Aeonik, sans-serif',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#888';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#333';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  Go to Home
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default PaymentCancel;


