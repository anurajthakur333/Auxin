import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScrambleText from '../components/Scramble';
import { API_BASE_URL } from '../lib/apiConfig';
import '../styles/fonts.css';
import '../styles/Main.css';

const EmployeeLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Attempting employee login to:', `${API_BASE_URL}/api/auth/employee/login`);
      const response = await fetch(`${API_BASE_URL}/api/auth/employee/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 Response status:', response.status);

      // Handle non-JSON responses (like 404)
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('🔐 Non-JSON response:', text);
        setError(`SERVER ERROR: ${response.status} - ${text || 'Route not found'}`);
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        // Store employee token
        localStorage.setItem('employeeToken', data.token);
        localStorage.setItem('employeeData', JSON.stringify(data.employee));
        console.log('✅ Employee login successful, redirecting to dashboard');
        // Redirect to employee dashboard (you can create this later)
        navigate('/employee/dashboard', { replace: true });
      } else {
        setError((data.error || 'INVALID CREDENTIALS').toUpperCase());
      }
    } catch (err) {
      console.error('🔐 Employee login error:', err);
      setError('AN ERROR OCCURRED. PLEASE TRY AGAIN.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      {/* Custom styles for input animations and autofill */}
      <style>
        {`
          .login-input {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s;
            font-family: 'Aeonik Mono', monospace !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
            color: #39FF14 !important;
          }
          .login-input:-webkit-autofill,
          .login-input:-webkit-autofill:hover,
          .login-input:-webkit-autofill:focus,
          .login-input:-webkit-autofill:active {
            -webkit-text-fill-color: #39FF14 !important;
            caret-color: #39FF14 !important;
            -webkit-box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            box-shadow: 0 0 0px 1000px rgba(255, 255, 255, 0.05) inset !important;
            transition: background-color 9999s ease-in-out 0s !important;
            font-family: 'Aeonik Mono', monospace !important;
            background: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.2) !important;
          }
        `}
      </style>

      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "500px",
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "60px 50px",
        }}>
          <div style={{ marginBottom: "50px", textAlign: "center" }}>
            <h1
              className="aeonik-mono"
              style={{
                fontSize: "clamp(32px, 8vw, 80px)",
                lineHeight: "0.9",
                letterSpacing: "-5px",
                fontWeight: 600,
                color: "#FFF",
                marginBottom: "20px",
              }}
            >
              <ScrambleText
                trigger="load"
                speed="fast"
                revealSpeed={0.3}
                scrambleIntensity={1}
                delay={0}
                style={{ color: "white" }}
              >
                EMPLOYEE
              </ScrambleText>
            </h1>
            <h2
              className="aeonik-mono"
              style={{
                fontSize: "clamp(20px, 4vw, 40px)",
                fontWeight: 600,
                color: "#39FF14",
                letterSpacing: "-2px",
              }}
            >
              LOGIN
            </h2>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "30px" }}>
              <label
                className="aeonik-mono"
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: isEmailFocused ? "#39FF14" : "rgba(255, 255, 255, 0.5)",
                  marginBottom: "10px",
                  letterSpacing: "1px",
                  transition: "color 0.3s ease",
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                className="login-input aeonik-mono"
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  border: isEmailFocused ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.2)",
                }}
                placeholder="employee@example.com"
                required
                disabled={isLoading}
              />
            </div>

            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label
                  className="aeonik-mono"
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: isPasswordFocused ? "#39FF14" : "rgba(255, 255, 255, 0.5)",
                    letterSpacing: "1px",
                    transition: "color 0.3s ease",
                  }}
                >
                  PASSWORD
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="aeonik-mono"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    padding: "5px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#39FF14";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255, 255, 255, 0.5)";
                  }}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="login-input aeonik-mono"
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.3s ease",
                  border: isPasswordFocused ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.2)",
                }}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div
                className="aeonik-mono"
                style={{
                  padding: "15px 20px",
                  marginBottom: "30px",
                  background: "rgba(255, 0, 0, 0.1)",
                  border: "1px solid #FF0000",
                  color: "#FF0000",
                  fontSize: "12px",
                  letterSpacing: "1px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "15px 30px",
                background: isLoading ? "rgba(57, 255, 20, 0.5)" : "#39FF14",
                border: "1px solid #39FF14",
                color: "#000",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "2px",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#2ecc11";
                  e.currentTarget.style.borderColor = "#2ecc11";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#39FF14";
                  e.currentTarget.style.borderColor = "#39FF14";
                }
              }}
            >
              {isLoading ? "LOGGING IN..." : "LOGIN"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;

