// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Meeting from './pages/Meeting';
import ScrollToTop from './components/ScrollToTop';
import "./styles/fonts.css";
import "./styles/Main.css";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/meeting" element={<Meeting />} />
      </Routes>
    </Router>
  );
}