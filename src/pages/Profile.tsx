import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import '../styles/fonts.css';
import '../styles/Main.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#000',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Navbar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '120px 20px 80px',
          marginTop: '100px',
          marginBottom: '200px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '960px',
            border: '1px solid rgba(57, 255, 20, 0.4)',
            background:
              'radial-gradient(circle at top, rgba(57,255,20,0.12), transparent 60%)',
            padding: '40px 32px 32px',
          }}
        >
          {/* Heading */}
          <div
            className="aeonik-mono text-white"
            style={{
              fontSize: 'clamp(26px, 3vw, 34px)',
              letterSpacing: '2px',
              marginBottom: '32px',
            }}
          >
            PROFILE
          </div>

          {user ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)',
                gap: '32px',
              }}
            >
              {/* Left: basic identity */}
              <div>
                <div
                  className="aeonik-mono text-white"
                  style={{ fontSize: '14px', opacity: 0.7, marginBottom: '8px' }}
                >
                  SIGNED IN AS
                </div>
                <div
                  className="aeonik-mono text-white"
                  style={{ fontSize: '22px', marginBottom: '4px' }}
                >
                  {user.name}
                </div>
                <div
                  className="aeonik-mono text-white"
                  style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}
                >
                  {user.email}
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span
                    className="aeonik-mono"
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      border: '1px solid rgba(57,255,20,0.6)',
                      color: '#39FF14',
                      letterSpacing: '1px',
                    }}
                  >
                    {user.isEmailVerified ? 'EMAIL VERIFIED' : 'EMAIL NOT VERIFIED'}
                  </span>
                  {user.clientCode && (
                    <span
                      className="aeonik-mono"
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#fff',
                        letterSpacing: '1px',
                      }}
                    >
                      CLIENT CODE: {user.clientCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: meta info */}
              <div
                style={{
                  borderLeft: '1px solid rgba(255,255,255,0.1)',
                  paddingLeft: '24px',
                }}
              >
                <div
                  className="aeonik-mono text-white"
                  style={{ fontSize: '12px', opacity: 0.7, marginBottom: '8px' }}
                >
                  ACCOUNT SNAPSHOT
                </div>

                <div
                  className="aeonik-mono text-white"
                  style={{
                    fontSize: '13px',
                    lineHeight: 1.7,
                    opacity: 0.9,
                  }}
                >
                  <div>
                    STATUS:{' '}
                    <span style={{ color: '#39FF14' }}>
                      {user.clientCode ? 'CLIENT' : 'USER'}
                    </span>
                  </div>
                  <div>
                    EMAIL:{' '}
                    <span style={{ color: '#39FF14' }}>{user.email}</span>
                  </div>
                  {user.clientCode && (
                    <div>
                      DASHBOARD:{' '}
                      <span style={{ color: '#39FF14' }}>
                        All projects, invoices, and meetings live in your client
                        dashboard.
                      </span>
                    </div>
                  )}
                  {!user.clientCode && (
                    <div>
                      ACCESS:{' '}
                      <span style={{ color: '#39FF14' }}>
                        This account is not yet linked to a client workspace.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="aeonik-mono text-white "
              style={{ fontSize: '14px', opacity: 0.8 }}
            >
              You are not signed in.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;

