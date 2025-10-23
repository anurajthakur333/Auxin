import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfileMenu.css';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose, onLogout }) => {
  const [isClosing, setIsClosing] = useState(false);
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
    }, 400); // Match animation duration
  };

  // Handle click outside to close menu
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const menuItems = [
    { label: 'DASHBOARD', href: '/dashboard' },
    { label: 'EDIT PROFILE', href: '/profile/edit' },
    { label: 'ACCOUNT SETTINGS', href: '/settings' },
    { label: 'NOTIFICATIONS', href: '/notifications' },
    { label: 'BILLING', href: '/billing' },
    { label: 'MY PROJECTS', href: '/projects' },
    { label: 'MESSAGES', href: '/messages' },
    { label: 'SUPPORT', href: '/support' },
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
        animation: isClosing ? 'slideOutToBottom 0.4s ease-in forwards' : 'slideInFromBottom 0.4s ease-out'
      }}
      onClick={handleOverlayClick}
    >
      {/* Logout Button - Top Right */}
      <div className="position-absolute top-0 end-0 p-3 p-md-4">
        <button 
          className="btn btn-link text-dark fw-bold text-uppercase border-0"
          onClick={handleLogout}
          aria-label="Logout"
          style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)',
            letterSpacing: '2px',
            fontFamily: 'Aeonik, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
   >
          LOGOUT
        </button>
      </div>

      {/* Main Content Container */}
      <div className="container-fluid h-100 d-flex flex-column justify-content-start align-items-start">
        {/* Menu Items */}
        <nav className="d-flex flex-column align-items-start w-100" style={{ maxWidth: '800px' }}>
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
                lineHeight: '0'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(20px)';
                e.currentTarget.style.textShadow = '3px 3px 6px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.textShadow = 'none';
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Back Button - Bottom Left */}
      <div className="position-absolute bottom-0 start-0 p-3 p-md-4">
        <button 
          className="btn btn-link text-dark fw-bold text-uppercase border-0"
          onClick={handleClose}
          aria-label="Close menu"
          style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)',
            letterSpacing: '2px',
            fontFamily: 'Aeonik, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}
        
        >
          BACK
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
