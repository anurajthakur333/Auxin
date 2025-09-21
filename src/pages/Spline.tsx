import React, { useState } from 'react';
import Spline from '@splinetool/react-spline';
import '../styles/fonts.css';
import '../styles/Main.css';

const SplinePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSplineLoad = () => {
    console.log('Spline scene loaded successfully');
    setIsLoading(false);
  };

  const handleSplineError = (error: any) => {
    console.error('Spline scene failed to load:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error?.message || 'Failed to load 3D scene');
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#000",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Header Section */}
      <div style={{
        position: "absolute",
        top: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        textAlign: "center",
        color: "white"
      }}>
        <h1 className="aeonik-regular" style={{
          fontSize: "2.5rem",
          marginBottom: "0.5rem",
          background: "linear-gradient(135deg, #39FF14, #00cc00)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          Design Showcase
        </h1>
        <p className="aeonik-light" style={{
          fontSize: "1.1rem",
          color: "#888",
          margin: 0
        }}>
          Interactive 3D Experience
        </p>
      </div>

      {/* Spline 3D Scene */}
      <div style={{
        width: "100%",
        height: "100vh",
        position: "relative"
      }}>
        {!hasError ? (
          <Spline 
            scene="https://prod.spline.design/kJm8YfXpG1HHJzzX/scene.splinecode"
            onLoad={handleSplineLoad}
            onError={handleSplineError}
            style={{
              width: "100%",
              height: "100%"
            }}
          />
        ) : (
          <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center"
          }}>
            <div className="aeonik-regular" style={{
              fontSize: "1.5rem",
              color: "#ff6b6b",
              marginBottom: "1rem"
            }}>
              Failed to Load 3D Scene
            </div>
            <div className="aeonik-light" style={{
              fontSize: "1rem",
              color: "#888",
              marginBottom: "2rem"
            }}>
              {errorMessage}
            </div>
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                window.location.reload();
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #39FF14, #00cc00)",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold"
              }}
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "#000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15
          }}
        >
          <div className="aeonik-regular" style={{
            color: "#39FF14",
            fontSize: "1.2rem",
            marginBottom: "1rem"
          }}>
            Loading 3D Experience...
          </div>
          <div style={{
            width: "200px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "1px",
            overflow: "hidden"
          }}>
            <div style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(90deg, transparent, #39FF14, transparent)",
              animation: "loading 2s ease-in-out infinite"
            }} />
          </div>
        </div>
      )}

      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

export default SplinePage;
