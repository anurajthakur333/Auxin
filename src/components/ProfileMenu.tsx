import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/ProfileMenu.css';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

// Animation duration constant (in milliseconds)
const ANIMATION_DURATION = 1000;

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, onLogout }) => {
  const [isClosing, setIsClosing] = useState(false);
  const { user } = useAuth();
  
  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, ANIMATION_DURATION); // ✅ Matches animation duration
  };

  // Handle click outside to close menu
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Only show client-specific items (DASHBOARD, MY PROJECTS, NOTIFICATIONS, BILLING) if user is a client
  const isClient = !!user?.clientCode;
  
  const menuItems = [
    { label: 'SUPPORT', href: '/support' },
    { label: 'MESSAGES', href: '/messages' },
    // Client-only items
    ...(isClient ? [
      { label: 'DASHBOARD', href: '/dashboard' },
      { label: 'MY PROJECTS', href: '/dashboard' },
      { label: 'NOTIFICATIONS', href: '/dashboard' },
      { label: 'MY PROJECTS', href: '/dashboard' },
    ] : []),
    { label: 'MESSAGES', href: '/messages' },
    ...(isClient ? [{ label: 'BILLING', href: '/dashboard' }] : []),
  ];

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`position-fixed top-0 start-0 w-100 h-100 d-flex flex-column ${isClosing ? 'closing' : ''}`}
      style={{ 
        backgroundColor: '#39FF14', 
        zIndex: 9999,
        animation: isClosing 
          ? `slideOutToBottom ${ANIMATION_DURATION}ms ease-in forwards` 
          : `slideInFromBottom ${ANIMATION_DURATION}ms ease-out`
      }}
      onClick={handleOverlayClick}
    >
      {/* Main Content Container - Right Aligned */}
      <div className="container-fluid h-100 d-flex flex-column justify-content-center align-items-end px-4 py-5">
        {/* Menu Items - Right Aligned */}
        <nav className="d-flex flex-column align-items-end w-100" style={{ maxWidth: '800px' }}>
          {/* Logout Button - First Item */}
          <button 
            className="text-dark text-decoration-none fw-bold text-uppercase border-0 bg-transparent"
            onClick={handleLogout}
            aria-label="Logout"
            style={{ 
              fontSize: 'clamp(18px, 5vw, 24px)',
              letterSpacing: '0px',
              fontFamily: 'Aeonik',
              padding: 'clamp(8px, 2vw, 15px) 0',
              transition: 'all 0.3s ease',
              lineHeight: '0.5',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-20px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            LOGOUT
          </button>

          {/* Regular Menu Items */}
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              className="text-dark text-decoration-none fw-bold text-uppercase"
              onClick={handleClose}
              style={{ 
                fontSize: 'clamp(18px, 5vw, 24px)',
                letterSpacing: '0px',
                fontFamily: 'Aeonik',
                padding: 'clamp(8px, 2vw, 15px) 0',
                transition: 'all 0.3s ease',
                lineHeight: '0.5'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-20px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {item.label}
            </Link>
          ))}

          {/* Back Button - Last Item */}
          <button 
            className="text-dark text-decoration-none fw-bold text-uppercase border-0 bg-transparent"
            onClick={handleClose}
            aria-label="Close menu"
            style={{ 
              fontSize: 'clamp(18px, 5vw, 24px)',
              letterSpacing: '0px',
              fontFamily: 'Aeonik',
              padding: 'clamp(8px, 2vw, 15px) 0',
              transition: 'all 0.3s ease',
              lineHeight: '0.5',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(-20px)';
              e.currentTarget.style.textShadow = '3px 3px 6px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            BACK
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfileMenu;