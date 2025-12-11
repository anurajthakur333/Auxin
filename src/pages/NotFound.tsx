import { useNavigate } from 'react-router-dom';
import ASCIIText from '../components/ASCIIText';
import '../styles/fonts.css';
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="ascii-container">
        <ASCIIText
          text="404!"
          enableWaves={false}
          asciiFontSize={10}
          textFontSize={350}
          planeBaseHeight={12}
        />
      </div>
      
      <div className="not-found-content">
        <p className="not-found-message">Oops! Page not found</p>
        <button className="not-found-button" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>

      <style>{`
        .not-found-page {
          min-height: 100vh;
          width: 100%;
          background: #0a0a0a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .ascii-container {
          position: relative;
          width: 100%;
          height: 60vh;
          min-height: 300px;
        }

        .not-found-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
        }

        .not-found-message {
          font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-weight: 400;
          font-size: 1.25rem;
          color: #888;
          margin: 0;
          text-align: center;
        }

        .not-found-button {
          font-family: 'Aeonik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          font-weight: 400;
          font-size: 1rem;
          padding: 0.875rem 2rem;
          background: transparent;
          color: #fdf9f3;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 2px solid #888;
        }

        .not-found-button:hover {
          background: #39FF14;
          color: #0a0a0a;
          border: 2px solid #39FF14;
        }

        @media (max-width: 768px) {
          .ascii-container {
            height: 50vh;
            min-height: 250px;
          }

          .not-found-message {
            font-size: 1rem;
          }

          .not-found-button {
            font-size: 0.875rem;
            padding: 0.75rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}

