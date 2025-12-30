import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, getAuthToken } from '../lib/apiConfig';
import '../styles/fonts.css';
import '../styles/Main.css';

interface AppointmentDetails {
  id: string;
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

  useEffect(() => {
    const capturePayment = async () => {
      try {
        // Get appointment ID from URL or localStorage
        const appointmentId = searchParams.get('appointmentId') || localStorage.getItem('pendingAppointmentId');
        // PayPal returns orderId as 'token' in the URL
        const orderId = searchParams.get('token') || searchParams.get('orderId') || localStorage.getItem('pendingOrderId');
        // PayPal also returns PayerID
        const payerId = searchParams.get('PayerID') || searchParams.get('payerId');

        if (!appointmentId || !orderId) {
          console.error('Missing payment info:', { appointmentId, orderId, url: window.location.href });
          setStatus('error');
          setMessage('Missing payment information. Please try booking again.');
          return;
        }
        
        console.log('Capturing payment:', { appointmentId, orderId });
        console.log('Full URL params:', Object.fromEntries(searchParams.entries()));
        console.log('LocalStorage pendingAppointmentId:', localStorage.getItem('pendingAppointmentId'));
        console.log('LocalStorage pendingOrderId:', localStorage.getItem('pendingOrderId'));

        // Capture the payment
        const token = getAuthToken();
        if (!token) {
          setStatus('error');
          setMessage('Authentication required. Please log in again.');
          return;
        }
        
        // Validate required fields
        if (!orderId || !appointmentId) {
          console.error('Missing required fields:', { 
            orderId, 
            appointmentId,
            urlParams: Object.fromEntries(searchParams.entries()),
            localStorage: {
              pendingAppointmentId: localStorage.getItem('pendingAppointmentId'),
              pendingOrderId: localStorage.getItem('pendingOrderId')
            }
          });
          setStatus('error');
          setMessage('Missing payment information. Please try booking again.');
          return;
        }

        // Validate appointmentId format (should be MongoDB ObjectId - 24 hex characters)
        const appointmentIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!appointmentIdRegex.test(appointmentId.trim())) {
          console.error('Invalid appointmentId format:', appointmentId);
          setStatus('error');
          setMessage('Invalid appointment ID format. Please contact support.');
          return;
        }

        // Get cached form data from localStorage
        const cachedFormData = localStorage.getItem('meetingFormData');
        let categoryData: { categoryId?: string; categoryName?: string; formAnswers?: Record<string, string> } = {};
        
        if (cachedFormData) {
          try {
            const parsed = JSON.parse(cachedFormData);
            categoryData = {
              categoryId: parsed.categoryId,
              categoryName: parsed.categoryName,
              formAnswers: parsed.formAnswers || {}
            };
          } catch (e) {
            console.error('Failed to parse cached form data:', e);
          }
        }

        const requestBody: {
          orderId: string;
          appointmentId: string;
          payerId?: string;
          categoryId?: string;
          categoryName?: string;
          formAnswers?: Record<string, string>;
        } = {
          orderId: orderId.trim(),
          appointmentId: appointmentId.trim(),
          ...categoryData
        };
        
        // Add payerId if available
        if (payerId) {
          requestBody.payerId = payerId.trim();
        }
        
        console.log('Request body:', requestBody);
        console.log('All URL params:', Object.fromEntries(searchParams.entries()));
        
        const response = await fetch(`${API_BASE_URL}/api/paypal/capture-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        let data;
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('Failed to parse response:', parseError);
          setStatus('error');
          setMessage(`Server error: ${responseText || 'Invalid response format'}`);
          return;
        }

        console.log('Response data:', data);

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Payment successful! Your meeting has been booked.');
          setAppointment(data.appointment);
          
          // Log Meet link if available
          if (data.appointment?.googleMeetLink) {
            console.log('✅ Google Meet link received:', data.appointment.googleMeetLink);
          } else {
            console.warn('⚠️ No Google Meet link in response');
          }
          
          // Clear stored payment data
          localStorage.removeItem('pendingAppointmentId');
          localStorage.removeItem('pendingOrderId');
          localStorage.removeItem('meetingFormData');
        } else {
          console.error('Payment capture failed:', data);
          setStatus('error');
          setMessage(data.error || data.message || 'Payment verification failed. Please contact support.');
        }
      } catch (error) {
        console.error('Payment capture error:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment. Please contact support.');
      }
    };

    if (user) {
      capturePayment();
    }
  }, [user, searchParams]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}:00`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#000',
      position: 'relative',
      zIndex: 1
    }}>
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
          {status === 'processing' && (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                border: '3px solid #333',
                borderTop: '3px solid #39FF14',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 2rem'
              }} />
              <h2 className="aeonik-mono" style={{ 
                color: '#39FF14', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                {"PROCESSING PAYMENT"}
              </h2>
              <p className="aeonik-mono" style={{ color: '#888' }}>{message.toUpperCase()}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(57, 255, 20, 0.1)',
                border: '2px solid #39FF14',
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
                  stroke="#39FF14" 
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="aeonik-mono" style={{ 
                color: '#39FF14', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                {"PAYMENT SUCCESSFUL!"}
              </h2>
              <p className="aeonik-mono" style={{ color: '#fff', marginBottom: '2rem' }}>{message.toUpperCase()}</p>

              {appointment && (
                <div style={{
                  background: '#222',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  textAlign: 'left',
                  borderLeft: '4px solid #39FF14'
                }}>
                  <h3 className="aeonik-mono" style={{ 
                    color: '#39FF14', 
                    marginBottom: '1rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    {"BOOKING DETAILS"}
                  </h3>
                  <p className="aeonik-mono" style={{ color: '#fff', marginBottom: '0.5rem' }}>
                    <strong>{"DATE:"}</strong> {formatDate(appointment.date).toUpperCase()}
                  </p>
                  <p className="aeonik-mono" style={{ color: '#39FF14', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#fff' }}>{"TIME:"}</strong> {formatTime(appointment.time).toUpperCase()}
                  </p>
                  <p className="aeonik-mono" style={{ color: '#888', fontSize: '0.85rem', marginTop: '1rem' }}>
                    {"A CONFIRMATION EMAIL HAS BEEN SENT TO YOUR REGISTERED EMAIL ADDRESS."}
                  </p>
                </div>
              )}

              <button
                className="aeonik-mono"
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
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#2ecc11'}
                onMouseOut={(e) => e.currentTarget.style.background = '#39FF14'}
              >
                {"VIEW MY APPOINTMENTS"}
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(255, 107, 107, 0.1)',
                border: '2px solid #ff6b6b',
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
                  stroke="#ff6b6b" 
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <h2 className="aeonik-mono" style={{ 
                color: '#ff6b6b', 
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                {"PAYMENT FAILED"}
              </h2>
              <p className="aeonik-mono" style={{ color: '#888', marginBottom: '2rem' }}>{message.toUpperCase()}</p>

              <button
                className="aeonik-mono"
                onClick={() => navigate('/meeting')}
                style={{
                  background: 'transparent',
                  color: '#39FF14',
                  border: '1px solid #39FF14',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#39FF14';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#39FF14';
                }}
              >
                {"TRY AGAIN"}
              </button>
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
    </div>
  );
};

export default PaymentSuccess;


