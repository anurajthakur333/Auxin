"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { API_BASE_URL } from "../lib/apiConfig"
import "../styles/fonts.css"
import "../styles/Main.css"
import Lenis from "lenis"

interface Article {
  _id?: string
  id?: string
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  author: string
  tags: string[]
  content: string[]
  isActive?: boolean
}

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/articles/public/${slug}`)
        if (response.ok) {
          const data = await response.json()
          if (data.article && data.article.isActive !== false) {
            setArticle(data.article)
          } else {
            setArticle(null)
          }
        } else {
          setArticle(null)
        }
      } catch (error) {
        console.error("Failed to fetch article:", error)
        setArticle(null)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [slug])

  if (loading) {
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
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {"LOADING..."}
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (!article) {
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
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p className="aeonik-mono" style={{ color: "#FFF", fontSize: "18px" }}>
            {"ARTICLE NOT FOUND"}
          </p>
        </div>
        <Footer />
      </div>
    )
  }

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

      <div style={{ flex: 1, padding: "50px", paddingBottom: "100px" }}>
        {/* Back Button & Category Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            marginBottom: "30px",
          }}
        >
          <Link
            to="/articles"
            className="aeonik-mono"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              color: "#FFF",
              fontSize: "11px",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#39FF14"
              e.currentTarget.style.color = "#39FF14"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
              e.currentTarget.style.color = "#FFF"
            }}
          >
            {"← BACK TO ARTICLES"}
          </Link>

          {/* Category Badge */}
          <span
            className="aeonik-mono"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              fontSize: "11px",
              color: "#39FF14",
              background: "rgba(57, 255, 20, 0.1)",
              border: "1px solid #39FF14",
              letterSpacing: "1px",
            }}
          >
            {article.category}
          </span>
        </div>

        {/* Title */}
        <h1
          className="aeonik-mono"
          style={{
            fontSize: "clamp(32px, 6vw, 72px)",
            color: "#FFF",
            fontWeight: 600,
            lineHeight: "1.05",
            marginBottom: "30px",
            letterSpacing: "-3px",
            maxWidth: "1000px",
          }}
        >
          {article.title}
        </h1>

        {/* Meta Info */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "30px",
            flexWrap: "wrap",
            marginBottom: "60px",
            paddingBottom: "40px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span
            className="aeonik-mono"
            style={{ fontSize: "14px", color: "#39FF14" }}
          >
            {article.author}
          </span>
          <span
            className="aeonik-mono"
            style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}
          >
            {article.date}
          </span>
          <span
            className="aeonik-mono"
            style={{ fontSize: "13px", color: "rgba(255, 255, 255, 0.5)" }}
          >
            {article.readTime} {"READ"}
          </span>
        </div>

        {/* Article Content */}
        {article.content.map((paragraph, index) => (
          <p
            key={index}
            className="aeonik-mono"
            style={{
              fontSize: "17px",
              color: "rgba(255, 255, 255, 0.85)",
              lineHeight: "2",
              marginBottom: "35px",
              letterSpacing: "0.3px",
              maxWidth: "1000px",
            }}
          >
            {paragraph}
          </p>
        ))}

        {/* Keywords/Tags */}
        <div
          style={{
            marginTop: "60px",
            paddingTop: "50px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <h4
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              letterSpacing: "2px",
              marginBottom: "25px",
            }}
          >
            {"KEYWORDS"}
          </h4>
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            {article.tags.map((tag, idx) => (
              <span
                key={idx}
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: "#39FF14",
                  padding: "12px 24px",
                  background: "rgba(57, 255, 20, 0.1)",
                  border: "1px solid rgba(57, 255, 20, 0.3)",
                  letterSpacing: "1px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Share Button */}
        <div
          style={{
            marginTop: "60px",
            display: "flex",
            gap: "15px",
          }}
        >
          <button
            className="aeonik-mono"
            style={{
              padding: "15px 35px",
              background: "#39FF14",
              border: "1px solid #39FF14",
              color: "#000",
              fontSize: "12px",
              letterSpacing: "1px",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2ecc11"
              e.currentTarget.style.borderColor = "#2ecc11"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#39FF14"
              e.currentTarget.style.borderColor = "#39FF14"
            }}
          >
            {"SHARE ARTICLE"}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ArticleDetail
