"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ScrambleText from "../components/Scramble"
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
  isActive?: boolean
}

interface Category {
  _id: string
  name: string
}

const Articles = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL")
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<string[]>(["ALL"])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories and articles in parallel
        const [categoriesRes, articlesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories/public`),
          fetch(`${API_BASE_URL}/api/articles/public`)
        ])

        // Handle categories
        if (categoriesRes.ok) {
          const catData = await categoriesRes.json()
          const categoryNames = (catData.categories || []).map((c: Category) => c.name)
          setCategories(["ALL", ...categoryNames])
        } else {
          // Fallback categories
          setCategories(["ALL", "DESIGN", "DEVELOPMENT", "BRANDING", "MARKETING"])
        }

        // Handle articles
        if (articlesRes.ok) {
          const artData = await articlesRes.json()
          const activeArticles = (artData.articles || []).filter((a: Article) => a.isActive !== false)
          setArticles(activeArticles)
        } else {
          setArticles([])
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
        setCategories(["ALL", "DESIGN", "DEVELOPMENT", "BRANDING", "MARKETING"])
        setArticles([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

        {/* Loading State */}
        {loading ? (
          <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {"LOADING ARTICLES..."}
          </p>
        ) : filteredArticles.length === 0 ? (
          <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
            {"NO ARTICLES FOUND"}
          </p>
        ) : (
          /* Articles Grid */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
              gap: "30px",
            }}
          >
            {filteredArticles.map((article) => (
              <Link
                key={article._id || article.id}
                to={`/articles/${article.slug}`}
                style={{
                  textDecoration: "none",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "0px",
                  padding: "35px",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  display: "block",
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
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Articles
