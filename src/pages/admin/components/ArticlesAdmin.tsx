import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import DatePicker from "../../../components/ui/DatePicker"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Article {
  _id?: string
  slug: string
  title: string
  category: string
  date: string
  readTime: string
  excerpt: string
  author: string
  tags: string[]
  content: string[]
  image?: string
  isActive: boolean
}

interface Category {
  _id: string
  name: string
  isActive: boolean
}

const ArticlesAdmin = () => {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Article>({
    slug: "",
    title: "",
    category: "",
    date: "",
    readTime: "",
    excerpt: "",
    author: "",
    tags: [],
    content: [],
    image: "",
    isActive: true,
  })
  const [readTimeMinutes, setReadTimeMinutes] = useState<number>(5)
  const [tagsInput, setTagsInput] = useState("")
  const [contentInput, setContentInput] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Scheduling State
  const [isScheduled, setIsScheduled] = useState(false)

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Only show active categories
        const activeCategories = (data.categories || []).filter((c: Category) => c.isActive)
        setCategories(activeCategories)
        // Set default category if available
        if (activeCategories.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: activeCategories[0].name }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  const fetchArticles = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/articles`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setArticles(data.articles || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH ARTICLES" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setArticles([])
      }
    } catch (error) {
      console.error("Failed to fetch articles:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setArticles([])
    } finally {
      setLoading(false)
    }
  }

  // Get current date in ISO format for DatePicker (yyyy-mm-dd)
  const getCurrentDate = (): string => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const year = now.getFullYear()
    return `${year}-${month}-${day}`
  }

  // Filter articles based on search and filters
  const filteredArticles = articles.filter((article) => {
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        article.title.toLowerCase().includes(query) ||
        article.author.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.slug.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Category filter
    if (categoryFilter !== "all" && article.category.toUpperCase() !== categoryFilter.toUpperCase()) {
      return false
    }

    // Status filter
    if (statusFilter === "active" && !article.isActive) return false
    if (statusFilter === "inactive" && article.isActive) return false

    return true
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + itemsPerPage)

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleTitleChange = (value: string) => {
    const upperTitle = value.toUpperCase()
    setFormData({
      ...formData,
      title: upperTitle,
      slug: generateSlug(upperTitle),
    })
  }

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ""
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      }).toUpperCase()
    } catch {
      return dateString
    }
  }

  const handleSave = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      // Parse tags and content from inputs
      const parsedTags = tagsInput
        .split(",")
        .map((tag) => tag.trim().toUpperCase())
        .filter((tag) => tag.length > 0)

      const parsedContent = contentInput
        .split("\n\n")
        .map((para) => {
          const trimmed = para.trim()
          // Don't uppercase if it contains URL patterns
          const hasUrl = /https?:\/\/|\[.*\]\(.*\)/i.test(trimmed)
          return hasUrl ? trimmed : trimmed.toUpperCase()
        })
        .filter((para) => para.length > 0)

      const articleData = {
        ...formData,
        title: formData.title.toUpperCase(),
        excerpt: formData.excerpt.toUpperCase(),
        author: formData.author.toUpperCase(),
        category: formData.category.toUpperCase(),
        date: formatDateForDisplay(formData.date),
        readTime: `${readTimeMinutes} MIN`,
        tags: parsedTags,
        content: parsedContent,
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/articles/${editingId}`
        : `${API_BASE_URL}/api/admin/articles`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(articleData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "ARTICLE UPDATED" : "ARTICLE CREATED" })
        resetForm()
        fetchArticles()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: "SAVE FAILED" }))
        setMessage({ type: "error", text: errorData.error || "SAVE FAILED" })
      }
    } catch (error) {
      console.error("Failed to save article:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
    }
  }

  const handleEdit = (article: Article) => {
    playClickSound()
    setEditingId(article._id || null)
    setFormData(article)
    // Parse read time to number
    const minutes = parseInt(article.readTime.replace(/[^0-9]/g, "")) || 5
    setReadTimeMinutes(minutes)
    setTagsInput(article.tags.join(", "))
    setContentInput(article.content.join("\n\n"))
    // When editing, allow date to be different (scheduled)
    setIsScheduled(true)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!articleToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/articles/${articleToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "ARTICLE DELETED" })
        setArticleToDelete(null)
        fetchArticles()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: "DELETE FAILED" }))
        setMessage({ type: "error", text: errorData.error || "DELETE FAILED" })
      }
    } catch (error) {
      console.error("Failed to delete article:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
    }
  }

  const handleToggleActive = async (article: Article) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/articles/${article._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...article, isActive: !article.isActive }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: article.isActive ? "ARTICLE DEACTIVATED" : "ARTICLE ACTIVATED" })
        fetchArticles()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Failed to toggle article:", error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setIsScheduled(false)
    setFormData({
      slug: "",
      title: "",
      category: categories.length > 0 ? categories[0].name : "",
      date: getCurrentDate(),
      readTime: "",
      excerpt: "",
      author: "",
      tags: [],
      content: [],
      image: "",
      isActive: true,
    })
    setReadTimeMinutes(5)
    setTagsInput("")
    setContentInput("")
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h2
          className="aeonik-mono"
          style={{
            fontSize: "24px",
            color: "#FFF",
            fontWeight: 600,
            letterSpacing: "-1px",
          }}
        >
          {"ARTICLES MANAGEMENT"}
        </h2>
        <button
          onClick={() => {
            playClickSound()
            resetForm()
            setShowForm(!showForm)
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: showForm ? "transparent" : "#39FF14",
            border: "1px solid #39FF14",
            color: showForm ? "#39FF14" : "#000",
            fontSize: "12px",
            cursor: "pointer",
            letterSpacing: "1px",
            transition: "all 0.3s ease",
          }}
        >
          {showForm ? "CANCEL" : "ADD ARTICLE"}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            background: message.type === "success" ? "rgba(57, 255, 20, 0.1)" : "rgba(255, 0, 0, 0.1)",
            border: `1px solid ${message.type === "success" ? "#39FF14" : "#FF0000"}`,
            color: message.type === "success" ? "#39FF14" : "#FF0000",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          {message.text}
        </div>
      )}

      {/* No Categories Warning */}
      {categories.length === 0 && !loading && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px 20px",
            marginBottom: "20px",
            background: "rgba(255, 165, 0, 0.1)",
            border: "1px solid #FFA500",
            color: "#FFA500",
            fontSize: "12px",
            letterSpacing: "1px",
          }}
        >
          {"NO CATEGORIES FOUND. PLEASE CREATE CATEGORIES FIRST IN THE CATEGORIES TAB."}
        </div>
      )}

      {/* Search & Filter Section */}
      {!showForm && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "20px",
            marginBottom: "25px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", letterSpacing: "1px" }}>
              {"FILTERS"}
            </span>
            <button
              onClick={() => {
                playClickSound()
                clearFilters()
              }}
              className="aeonik-mono"
              style={{
                padding: "6px 12px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "1px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3B82F6"
                e.currentTarget.style.color = "#3B82F6"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.color = "#FFF"
              }}
            >
              {"CLEAR"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
                {"SEARCH"}
              </label>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  handleFilterChange()
                }}
                placeholder="SEARCH TITLE, AUTHOR..."
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
                {"CATEGORY"}
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value)
                  handleFilterChange()
                }}
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="all" style={{ background: "#000" }}>{"ALL"}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name} style={{ background: "#000" }}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", marginBottom: "6px", display: "block" }}>
                {"STATUS"}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "all" | "active" | "inactive")
                  handleFilterChange()
                }}
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                <option value="all" style={{ background: "#000" }}>{"ALL"}</option>
                <option value="active" style={{ background: "#000" }}>{"ACTIVE"}</option>
                <option value="inactive" style={{ background: "#000" }}>{"INACTIVE"}</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div style={{ marginTop: "15px" }}>
            <span className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              {`SHOWING ${paginatedArticles.length} OF ${filteredArticles.length} ARTICLES`}
            </span>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "30px",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"TITLE"}
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="ARTICLE TITLE"
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"SLUG (AUTO-GENERATED)"}
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="article-slug"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"CATEGORY"}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                {categories.length === 0 ? (
                  <option value="" style={{ background: "#000" }}>NO CATEGORIES</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat._id} value={cat.name} style={{ background: "#000" }}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"AUTHOR"}
              </label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value.toUpperCase() })}
                placeholder="AUTHOR NAME"
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                  {"DATE"}
                </label>
                <label 
                  className="aeonik-mono" 
                  style={{ 
                    fontSize: "10px", 
                    color: isScheduled ? "#39FF14" : "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => {
                      setIsScheduled(e.target.checked)
                      if (!e.target.checked) {
                        setFormData({ ...formData, date: getCurrentDate() })
                      }
                    }}
                    style={{ 
                      accentColor: "#39FF14",
                      cursor: "pointer",
                    }}
                  />
                  {"SCHEDULE"}
                </label>
              </div>
              <DatePicker
                value={formData.date || getCurrentDate()}
                onChange={(value) => setFormData({ ...formData, date: value })}
                placeholder="SELECT DATE"
              />
              {!isScheduled && (
                <span className="aeonik-mono" style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginTop: "4px", display: "block" }}>
                  {"USING CURRENT DATE"}
                </span>
              )}
            </div>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"READ TIME (MINUTES)"}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#FFF",
                  fontSize: "12px",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"EXCERPT"}
            </label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value.toUpperCase() })}
              placeholder="SHORT DESCRIPTION OF THE ARTICLE..."
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "12px 15px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "14px",
                minHeight: "80px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"TAGS (COMMA SEPARATED)"}
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value.toUpperCase())}
              placeholder="WEB DESIGN, TRENDS, UI/UX"
            />
          </div>

          {/* Image URL Input */}
          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"COVER IMAGE URL"}
            </label>
            <Input
              value={formData.image || ""}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="HTTPS://EXAMPLE.COM/IMAGE.JPG"
            />
            {/* Image Preview */}
            {formData.image && (
              <div style={{ marginTop: "15px" }}>
                <p className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>
                  {"PREVIEW:"}
                </p>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "400px",
                    aspectRatio: "16/9",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <img
                    src={formData.image}
                    alt="Cover preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none"
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = "block"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"CONTENT (SEPARATE PARAGRAPHS WITH EMPTY LINE)"}
            </label>
            <div style={{ marginBottom: "8px" }}>
              <span className="aeonik-mono" style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)" }}>
                {"FOR HYPERLINKS: USE [TEXT](URL) FORMAT OR JUST PASTE URL"}
              </span>
            </div>
            <textarea
              value={contentInput}
              onChange={(e) => {
                const value = e.target.value
                // Check if content contains URL patterns or markdown links
                const hasUrl = /https?:\/\/|\[.*\]\(.*\)/i.test(value)
                // Only uppercase if no URLs and user is typing (not pasting large blocks)
                if (hasUrl) {
                  setContentInput(value)
                } else {
                  // Uppercase only if it's a small change (typing), preserve case for large pastes
                  const isTyping = Math.abs(value.length - contentInput.length) <= 1
                  setContentInput(isTyping ? value.toUpperCase() : value)
                }
              }}
              placeholder="FIRST PARAGRAPH HERE...

SECOND PARAGRAPH HERE...

FOR LINKS USE: [CLICK HERE](HTTPS://EXAMPLE.COM) OR JUST PASTE: HTTPS://EXAMPLE.COM"
              className="aeonik-mono"
              style={{
                width: "100%",
                padding: "12px 15px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "#FFF",
                fontSize: "14px",
                minHeight: "200px",
                resize: "vertical",
                whiteSpace: "pre-wrap",
                lineHeight: "1.8",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            onClick={() => {
              playClickSound()
              handleSave()
            }}
            className="aeonik-mono"
            style={{
              padding: "12px 30px",
              background: "#39FF14",
              border: "1px solid #39FF14",
              color: "#000",
              fontSize: "12px",
              cursor: "pointer",
              letterSpacing: "1px",
              transition: "all 0.3s ease",
            }}
          >
            {editingId ? "UPDATE ARTICLE" : "CREATE ARTICLE"}
          </button>
        </div>
      )}

      {/* Articles List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : filteredArticles.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {articles.length === 0 ? "NO ARTICLES FOUND" : "NO ARTICLES MATCH THE FILTERS"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {paginatedArticles.map((article) => (
            <div
              key={article._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "8px" }}>
                  <span
                    className="aeonik-mono"
                    style={{
                      padding: "4px 10px",
                      fontSize: "10px",
                      color: "#39FF14",
                      background: "rgba(57, 255, 20, 0.1)",
                      border: "1px solid #39FF14",
                      letterSpacing: "1px",
                    }}
                  >
                    {article.category}
                  </span>
                  {!article.isActive && (
                    <span
                      className="aeonik-mono"
                      style={{
                        padding: "4px 10px",
                        fontSize: "10px",
                        color: "#FF0000",
                        background: "rgba(255, 0, 0, 0.1)",
                        border: "1px solid #FF0000",
                        letterSpacing: "1px",
                      }}
                    >
                      {"INACTIVE"}
                    </span>
                  )}
                </div>
                <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FFF", fontWeight: 600, marginBottom: "5px" }}>
                  {article.title}
                </h3>
                <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                  {article.author} · {article.date} · {article.readTime} {"READ"}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleToggleActive(article)}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 15px",
                    background: article.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${article.isActive ? "#39FF14" : "#FF0000"}`,
                    color: article.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!article.isActive) {
                      e.currentTarget.style.background = "#FF0000"
                      e.currentTarget.style.color = "#FFF"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!article.isActive) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "#FF0000"
                    }
                  }}
                >
                  {article.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
                <button
                  onClick={() => handleEdit(article)}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 15px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
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
                  {"EDIT"}
                </button>
                <button
                  onClick={() => {
                    playClickSound()
                    setArticleToDelete(article)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 15px",
                    background: "transparent",
                    border: "1px solid #FF0000",
                    color: "#FF0000",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FF0000"
                    e.currentTarget.style.color = "#FFF"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.color = "#FF0000"
                  }}
                >
                  {"DELETE"}
                </button>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage(1)
                }}
                disabled={currentPage === 1}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"«"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }}
                disabled={currentPage === 1}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === 1 ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"‹ PREV"}
              </button>

              <span
                className="aeonik-mono"
                style={{
                  padding: "8px 16px",
                  fontSize: "12px",
                  color: "#FFF",
                  letterSpacing: "1px",
                }}
              >
                {`PAGE ${currentPage} OF ${totalPages}`}
              </span>

              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }}
                disabled={currentPage === totalPages}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === totalPages ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"NEXT ›"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  setCurrentPage(totalPages)
                }}
                disabled={currentPage === totalPages}
                className="aeonik-mono"
                style={{
                  padding: "8px 12px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: currentPage === totalPages ? "rgba(255,255,255,0.3)" : "#FFF",
                  fontSize: "11px",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"»"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setArticleToDelete(null)}
        >
          <div
            style={{
              background: "#000",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "40px",
              maxWidth: "500px",
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", marginBottom: "15px" }}>
              {"DELETE ARTICLE?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "30px" }}>
              {articleToDelete.title}
            </p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={() => setArticleToDelete(null)}
                className="aeonik-mono"
                style={{
                  padding: "12px 25px",
                  background: "transparent",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"CANCEL"}
              </button>
              <button
                onClick={() => {
                  playClickSound()
                  handleDelete()
                }}
                className="aeonik-mono"
                style={{
                  padding: "12px 25px",
                  background: "#FF0000",
                  border: "1px solid #FF0000",
                  color: "#FFF",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticlesAdmin
