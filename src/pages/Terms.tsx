import { useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/fonts.css";
import "../styles/Main.css";
import Lenis from "lenis";

const Terms = () => {
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
      
      <div style={{ flex: 1,}}>
        <div className="container-fluid">
          <h1 
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(32px, 15vw, 770px)",
              letterSpacing: "-16px",
              lineHeight: "1.1",
              fontWeight: 400,
              textAlign: "left",
              marginBottom: "600px"
            }}
          >
            TERMS & <br />CONDITIONS
          </h1>
          
          <div 
            className="aeonik-regular text-white"
            style={{
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: "1.6",
              maxWidth: "1300px",
              textAlign: "left",
              paddingLeft: "10px"
            }}
          >
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              1. INTRODUCTION
            </h2>
            <p style={{ marginBottom: "40px" }}>
              Welcome To Auxin Media – Your Premier Digital Solutions Partner Specializing In Web Development, Branding 
              Services, Digital Marketing Strategies, And Business Automation Solutions. By Accessing Our Website 
              (Auxin.Media), Utilizing Our Digital Services, Or Executing A Service Agreement, You Agree To These Legally 
              Binding Terms And Conditions.
            </p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              2. COMPANY OVERVIEW
            </h2>
            <p style={{ marginBottom: "0px" }}>
              Auxin Media Is A Registered Digital Service Provider Headquartered In India, Delivering Cutting-Edge:
            </p>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Custom Website & App Development</li>
              <li>Brand Identity & Graphic Design Solutions</li>
              <li>Social Media Marketing & SEO Services</li>
              <li>CRM Integration & Business Automation</li>
              <li>Digital Transformation Consulting</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              3. SERVICE SCOPE
            </h2>
            <p style={{ marginBottom: "0px" }}>
              Our Comprehensive Digital Solutions Include (But Aren't Limited To):
            </p>
            <ul style={{ marginBottom: "20px", paddingLeft: "20px" }}>
              <li>Website & Mobile Application Development</li>
              <li>Brand Strategy & Visual Identity Design</li>
              <li>Targeted Digital Marketing Campaigns</li>
              <li>Workflow Automation & CRM Implementation</li>
              <li>Business Process Consulting</li>
            </ul>
            <p style={{ marginBottom: "40px"}}>
              Note: Specific Service Engagements Are Governed By Individual Proposals Or Statements Of Work.
            </p>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              4. CLIENT OBLIGATIONS
            </h2>
            <p style={{ marginBottom: "0px" }}>You Agree To:</p>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Provide Timely Access To Systems, Content, And Resources</li>
              <li>Supply Legally Licensed Text, Images, Videos, And Brand Assets</li>
              <li>Designate A Primary Point Of Contact For Project Coordination</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              5. PAYMENT TERMS
            </h2>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Invoices payable within 7 business days of receipt</li>
              <li>2% monthly late fee applied to overdue balances</li>
              <li>Milestone payments required before phase advancement</li>
              <li>Service suspension permitted for unpaid invoices exceeding 15 days</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              6. REFUND & CANCELLATION POLICY
            </h2>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Zero refunds after project commencement</li>
              <li>Cancellations require written notice via email</li>
              <li>Pre-paid monthly services terminate at next billing cycle</li>
              <li>Completed work billed at contractual rates upon cancellation</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              7. INTELLECTUAL PROPERTY RIGHTS
            </h2>
            <ul style={{ marginBottom: "40px", paddingLeft: "20px" }}>
              <li>Auxin Media retains full IP ownership of all deliverables until final payment</li>
              <li>Client receives unlimited usage rights to final approved assets post-payment</li>
              <li>Portfolio display rights granted to Auxin Media for completed projects</li>
              <li>Source files require separate licensing (detailed in proposals)</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              8. LIABILITY LIMITATIONS
            </h2>
            <p style={{ marginBottom: "0px" }}>
            <ul style={{ marginBottom: "0px", paddingLeft: "20px" }}>
              <li>No guarantee of specific marketing KPIs, revenue outcomes, or performance metrics</li>
              <li style={{ marginBottom: "0px" }}>Zero liability for:</li>
            </ul>
            </p>
       
            <ul style={{ marginBottom: "40px", paddingLeft: "47px" }}>
              <li>Third-party platform changes (e.g., Google/Facebook algorithms)</li>
              <li>Data breaches from unsecured client systems</li>
              <li>Business losses related to service utilization</li>
            </ul>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              9. CONFIDENTIALITY COMMITMENT
            </h2>
            <ul style={{ marginBottom: "0px", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "0px" }}>Strict NDA adherence for all:</li>
            </ul>
            <ul style={{ marginBottom: "0px", paddingLeft: "47px" }}>
              <li>Business intelligence</li>
              <li>Technical documentation</li>
              <li>Financial information</li>
            </ul>
            <li style={{ marginBottom: "40px" }}>Confidentiality obligations survive contract termination</li>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              10. TERMINATION CLAUSES
            </h2>
            <ul style={{ marginBottom: "0px" }}>
              <li style={{ marginBottom: "0px" }}>Immediate termination rights for:</li>
            </ul>
            <ul style={{ marginBottom: "0px", paddingLeft: "50px" }}>
              <li>Client fraud or illegal activity</li>
              <li>Payment breaches exceeding 30 days</li>
              <li>Harassment of team members</li>
            </ul>
            <li style={{ marginBottom: "40px" }}>Client termination requires 14-day written notice + settled balances</li>
            
            <h2 style={{ fontSize: "clamp(28px, 6vw, 50px)", marginTop: "60px", marginBottom: "30px", }}>
              11. LEGAL JURISDICTION
            </h2>
            <ul style={{ marginBottom: "60px", paddingLeft: "20px" }}>
              <li>Governed by Indian Contract Act (or registered country's laws)</li>
              <li>Dispute resolution via arbitration in Chandigarh, India</li>
              <li>Exclusive jurisdiction in home state courts for injunctive relief</li>
            </ul>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Terms;