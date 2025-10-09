import React, { Suspense } from 'react';
const Spline = React.lazy(() => import('@splinetool/react-spline'));

export default function SplinePage() {
  return (
    <div style={{ position: 'relative', height: '100vh', background: '#000' }}>
      {/* Faster Spline load */}
      <Suspense fallback={<div className="loader">Loading 3D...</div>}>
        <Spline
          scene="https://prod.spline.design/y8mYpLOQ2QbylASi/scene.splinecode"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        />
      </Suspense>

      {/* Simple header like Webflow */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'white',
        }}
      >
        <h1>Design Showcase</h1>
        <p>Interactive 3D Experience</p>
      </div>

      {/* CSS */}
      <style>
        {`
          .loader {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #39FF14;
            font-size: 18px;
          }
        `}
      </style>
    </div>
  );
}
