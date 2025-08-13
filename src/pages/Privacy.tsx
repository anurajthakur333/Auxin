import { useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";
// import PopUpText from "../components/PopUpText";
import CleanSlideUpText from "../components/CleanSlideUpText";

const Privacy = () => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      minHeight: "100vh", 
      background: "#000",
      position: "relative",
      zIndex: 1
    }}>
      <Navbar />
      
      <div style={{ flex: 1, }}>
        <div className="container-fluid">
          <h1
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(32px, 15vw, 770px)",
              letterSpacing: "-15px",
              lineHeight: "0.9",
              fontWeight: 600,
              textAlign: "left",
              marginBottom: "600px",
            }}
          >
            <CleanSlideUpText trigger="visible" speed="fast" preset="display">
  PRIVACY
            </CleanSlideUpText>
            <br />
            <CleanSlideUpText trigger="visible" speed="fast" preset="display">
              POLICY
            </CleanSlideUpText>
          </h1>
          
          <div 
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: "1.6",
              maxWidth: "1200px",
              paddingLeft: "10px",
              textAlign: "left"
            }}
          >
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px",  }}>
              1. DATA COLLECTION: WHAT WE GATHER
            </h2>
            <p style={{ marginBottom: "20px" }}>We collect information through:</p>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>▸ Direct Input (contact forms, service agreements):</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Full name & business name</li>
              <li>Professional email address</li>
              <li>Phone number & billing address</li>
              <li>Payment credentials* (via PCI-DSS compliant gateways)</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>▸ Automated Tracking (cookies & analytics):</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>IP address & device type</li>
              <li>Browser version & OS</li>
              <li>Session duration & page interactions</li>
              <li>Referral sources (Google, social media)</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>▸ Third-Party Services:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>CRM platforms (Zoho/HubSpot)</li>
              <li>Analytics tools (Google Analytics 4)</li>
              <li>Payment processors (Razorpay/Stripe)</li>
            </ul>
            <p style={{ marginBottom: "40px", fontStyle: "italic" }}>*Note: We never store raw payment card data</p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              2. PURPOSES OF DATA PROCESSING
            </h2>
            <p style={{ marginBottom: "20px" }}>We use your information exclusively for:</p>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Service Delivery & Operations</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Executing web development/digital marketing contracts</li>
              <li>Processing invoices and payments</li>
              <li>Providing client support and project updates</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Business Communications</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Responding to inquiries within 24 hours</li>
              <li>Sending service notifications (opt-out available)</li>
              <li>Sharing promotional offers with consent</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Performance Optimization</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Analyzing website traffic patterns</li>
              <li>Improving user experience and functionality</li>
              <li>Conducting A/B testing on non-critical pages</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Security & Compliance</p>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Preventing fraudulent activities</li>
              <li>Meeting tax/legal obligations</li>
              <li>Protecting system integrity through access monitoring</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              3. DATA PROTECTION FRAMEWORK
            </h2>
            <p style={{ marginBottom: "20px", fontWeight: "bold" }}>Our Security Infrastructure Includes:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Military-grade AES-256 encryption</li>
              <li>SSL/TLS secured data transmission</li>
              <li>SOC 2 compliant cloud hosting (AWS/GCP)</li>
              <li>Biometric access controls for sensitive data</li>
              <li>Quarterly penetration testing</li>
              <li>Mandatory employee privacy training</li>
            </ul>
            
            <p style={{ marginBottom: "20px", fontWeight: "bold" }}>Breach Response Protocol:</p>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Immediate containment within 1 hour</li>
              <li>Regulatory notification within 72 hours</li>
              <li>User alerts via email within 96 hours</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              4. YOUR PRIVACY RIGHTS
            </h2>
            <p style={{ marginBottom: "20px" }}>Regardless of Location, You Can:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>▸ Request full data access report</li>
              <li>▸ Demand correction of inaccuracies</li>
              <li>▸ Initiate data deletion (where legally permitted)</li>
              <li>▸ Restrict processing activities</li>
              <li>▸ Object to direct marketing</li>
              <li>▸ Withdraw consent at any time</li>
            </ul>
            <p style={{ marginBottom: "40px" }}>Submit requests to: Auxinmedia@gmail.com with "Privacy Request" in subject (Response within 14 days)</p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              5. COOKIES & TRACKING TECHNOLOGIES
            </h2>
            <p style={{ marginBottom: "20px" }}>We Utilize:</p>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Essential Cookies</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Enable core site functionality</li>
              <li>Maintain secure login sessions</li>
              <li>Remember consent preferences</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Performance Cookies</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Measure traffic sources</li>
              <li>Track page engagement metrics</li>
              <li>Identify UI friction points</li>
            </ul>
            
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Marketing Cookies</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Deliver personalized ads</li>
              <li>Enable social media retargeting</li>
              <li>Analyze campaign ROI</li>
            </ul>
            
            <p style={{ marginBottom: "40px" }}>Control Options: Browser settings | Cookie consent manager | Ad platform opt-outs</p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              6. THIRD-PARTY DATA SHARING
            </h2>
            <p style={{ marginBottom: "20px" }}>We disclose information only to:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Payment Gateways (Stripe/Razorpay) for transaction processing</li>
              <li>Cloud Infrastructure (AWS/Microsoft Azure) for secure hosting</li>
              <li>Analytics Providers (GA4) for performance insights</li>
              <li>Legal Authorities under court order/subpoena</li>
            </ul>
            <p style={{ marginBottom: "40px" }}>Strict DPAs (Data Processing Agreements) govern all third-party relationships</p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              7. DATA RETENTION SCHEDULE
            </h2>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Client Records: 7 years post-contract termination (tax compliance)</li>
              <li>Marketing Leads: 3 years from last engagement</li>
              <li>Website Analytics: 26 months (Google Analytics standard)</li>
              <li>Financial Documents: 10 years (statutory requirement)</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              8. CHILDREN'S PRIVACY & GLOBAL TRANSFERS
            </h2>
            <p style={{ marginBottom: "20px" }}>🚫 Strictly 18+ Services - No data collection from minors</p>
            <p style={{ marginBottom: "20px" }}>🌍 International Data Flows: Protected through:</p>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>EU Standard Contractual Clauses</li>
              <li>CCPA-compliant protocols</li>
              <li>India DPDPA cross-border frameworks</li>
            </ul>
            
                <h2 style={{ fontSize: "clamp(28px, 6vw, 124px)", marginTop: "60px", marginBottom: "30px", }}>
              9. POLICY UPDATES & CONTACT
            </h2>
            <p style={{ marginBottom: "20px", fontWeight: "bold" }}>Modification Protocol:</p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Quarterly compliance reviews</li>
              <li>Prominent website banners for material changes</li>
              <li>Email notifications to active clients</li>
            </ul>
            <p style={{ marginBottom: "10px", fontWeight: "bold" }}>Data Protection Officer:</p>
            <ul style={{ marginBottom: "60px", paddingLeft: "20px" }}>
              <li>📧 Auxinmedia@gmail.com</li>
              <li>📍 Auxin Media, Chandigarh, India</li>
              <li>🌐 www.auxinmedia.com/contact-privacy</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Privacy;