"use client"

import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ScrambleText from "../components/Scramble"
import "../styles/fonts.css"
import "../styles/Main.css"
import Lenis from "lenis"

interface Article {
  id: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  author: string
  tags: string[]
}

const Articles = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")

  const articles: Article[] = [
    {
      id: "1",
      title: "THE FUTURE OF WEB DESIGN: TRENDS SHAPING 2025",
      category: "DESIGN",
      date: "DEC 10, 2024",
      readTime: "8 MIN",
      excerpt:
        "EXPLORING THE CUTTING-EDGE DESIGN TRENDS THAT WILL DEFINE DIGITAL EXPERIENCES IN 2025, FROM AI-POWERED INTERFACES TO IMMERSIVE 3D ENVIRONMENTS.",
      author: "SARAH CHEN",
      tags: ["WEB DESIGN", "TRENDS", "UI/UX"],
    },
    {
      id: "2",
      title: "BUILDING SCALABLE REACT APPLICATIONS",
      category: "DEVELOPMENT",
      date: "DEC 8, 2024",
      readTime: "12 MIN",
      excerpt:
        "A COMPREHENSIVE GUIDE TO ARCHITECTING REACT APPLICATIONS THAT SCALE FROM STARTUP MVP TO ENTERPRISE-LEVEL SYSTEMS.",
      author: "MARCUS RODRIGUEZ",
      tags: ["REACT", "ARCHITECTURE", "PERFORMANCE"],
    },
    {
      id: "3",
      title: "BRAND IDENTITY IN THE DIGITAL AGE",
      category: "BRANDING",
      date: "DEC 5, 2024",
      readTime: "6 MIN",
      excerpt:
        "HOW MODERN BRANDS ARE ESTABLISHING AUTHENTIC DIGITAL IDENTITIES THAT RESONATE ACROSS PLATFORMS AND CONNECT WITH AUDIENCES.",
      author: "EMMA THOMPSON",
      tags: ["BRANDING", "STRATEGY", "DIGITAL"],
    },
    {
      id: "4",
      title: "MAXIMIZING ROI WITH PERFORMANCE MARKETING",
      category: "MARKETING",
      date: "DEC 3, 2024",
      readTime: "10 MIN",
      excerpt:
        "DATA-DRIVEN STRATEGIES FOR OPTIMIZING MARKETING SPEND AND ACHIEVING MEASURABLE RESULTS IN COMPETITIVE DIGITAL LANDSCAPES.",
      author: "JAMES PARK",
      tags: ["MARKETING", "ROI", "ANALYTICS"],
    },
    {
      id: "5",
      title: "THE POWER OF MICRO-INTERACTIONS",
      category: "DESIGN",
      date: "NOV 28, 2024",
      readTime: "5 MIN",
      excerpt:
        "SMALL DETAILS THAT CREATE BIG IMPACTS: HOW MICRO-INTERACTIONS ENHANCE USER EXPERIENCE AND DRIVE ENGAGEMENT.",
      author: "SARAH CHEN",
      tags: ["UX", "ANIMATION", "INTERACTION"],
    },
    {
      id: "6",
      title: "SERVERLESS ARCHITECTURE: A PRACTICAL GUIDE",
      category: "DEVELOPMENT",
      date: "NOV 25, 2024",
      readTime: "15 MIN",
      excerpt: "UNDERSTANDING WHEN AND HOW TO IMPLEMENT SERVERLESS SOLUTIONS FOR MODERN WEB APPLICATIONS.",
      author: "MARCUS RODRIGUEZ",
      tags: ["SERVERLESS", "CLOUD", "BACKEND"],
    },
  ]

  const categories = ["ALL", "DESIGN", "DEVELOPMENT", "BRANDING", "MARKETING"]

  const filteredArticles =
    selectedCategory === "ALL" ? articles : articles.filter((article) => article.category === selectedCategory)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    })

    const raf = (time: number) => {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#000",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Navbar />

      <div style={{ flex: 1, padding: "50px" }}>
        {/* Page Title */}
        <h1
          className="aeonik-mono"
          style={{
            fontSize: "clamp(32px, 10vw, 150px)",
            lineHeight: "0.9",
            letterSpacing: "-8px",
            fontWeight: 600,
            marginBottom: "30px",
            color: "#FFF",
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
            {"ARTICLES"}
          </ScrambleText>
        </h1>

        <div
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 36px)",
            color: "#39FF14",
            lineHeight: "1.4",
            letterSpacing: "-1px",
            maxWidth: "900px",
            marginBottom: "60px",
          }}
        >
          <ScrambleText
            trigger="load"
            speed="fast"
            revealSpeed={0.3}
            scrambleIntensity={1}
            delay={200}
            style={{ color: "#39FF14" }}
          >
            {"INSIGHTS, TUTORIALS & INDUSTRY PERSPECTIVES"}
          </ScrambleText>
        </div>

        {/* Category Filter */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            marginBottom: "60px",
            flexWrap: "wrap",
          }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="aeonik-mono"
              style={{
                padding: "12px 28px",
                fontSize: "14px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                background: selectedCategory === category ? "#39FF14" : "rgba(255, 255, 255, 0.05)",
                color: selectedCategory === category ? "#000" : "#FFF",
                border: `1px solid ${selectedCategory === category ? "#39FF14" : "rgba(255, 255, 255, 0.2)"}`,
                borderRadius: "0px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
                  e.currentTarget.style.borderColor = "#39FF14"
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                }
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
            gap: "30px",
          }}
        >
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "0px",
                padding: "35px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = "#39FF14"
                e.currentTarget.style.transform = "translateY(-4px)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                e.currentTarget.style.transform = "translateY(0)"
              }}
            >
              {/* Category Badge */}
              <span
                className="aeonik-mono"
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  fontSize: "10px",
                  color: "#39FF14",
                  background: "rgba(57, 255, 20, 0.1)",
                  border: "1px solid #39FF14",
                  borderRadius: "0px",
                  letterSpacing: "1px",
                  marginBottom: "20px",
                }}
              >
                {article.category}
              </span>

              {/* Title */}
              <h2
                className="aeonik-mono"
                style={{
                  fontSize: "24px",
                  color: "#FFF",
                  fontWeight: 600,
                  lineHeight: "1.2",
                  marginBottom: "15px",
                  letterSpacing: "-0.5px",
                }}
              >
                {article.title}
              </h2>

              {/* Excerpt */}
              <p
                className="aeonik-mono"
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.6)",
                  lineHeight: "1.6",
                  marginBottom: "25px",
                }}
              >
                {article.excerpt}
              </p>

              {/* Meta Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: "20px",
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "12px",
                      color: "#FFF",
                      marginBottom: "5px",
                    }}
                  >
                    {article.author}
                  </div>
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.5)",
                    }}
                  >
                    {article.date} · {article.readTime} {"READ"}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {article.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="aeonik-mono"
                      style={{
                        fontSize: "10px",
                        color: "rgba(255, 255, 255, 0.4)",
                        padding: "4px 8px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "0px",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Articles
