import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Category {
  _id?: string
  name: string
  description: string
  isActive: boolean
}

const CategoriesAdmin = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Category>({
    name: "",
    description: "",
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setMessage(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setMessage({ type: "error", text: "ADMIN AUTHENTICATION REQUIRED" })
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      } else {
        const errorData = await response.json().catch(() => ({ error: "FAILED TO FETCH CATEGORIES" }))
        setMessage({ type: "error", text: errorData.error || `HTTP ERROR! STATUS: ${response.status}` })
        setCategories([])
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "NETWORK ERROR" })
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "CATEGORY NAME IS REQUIRED" })
        return
      }

      const categoryData = {
        name: formData.name.toUpperCase().trim(),
        description: formData.description?.toUpperCase().trim() || "",
        isActive: formData.isActive,
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/categories/${editingId}`
        : `${API_BASE_URL}/api/admin/categories`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "CATEGORY UPDATED" : "CATEGORY CREATED" })
        resetForm()
        fetchCategories()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: "SAVE FAILED" }))
        setMessage({ type: "error", text: errorData.error || "SAVE FAILED" })
      }
    } catch (error) {
      console.error("Failed to save category:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
    }
  }

  const handleEdit = (category: Category) => {
    playClickSound()
    setEditingId(category._id || null)
    setFormData(category)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/categories/${categoryToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        setMessage({ type: "success", text: "CATEGORY DELETED" })
        setCategoryToDelete(null)
        fetchCategories()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json().catch(() => ({ error: "DELETE FAILED" }))
        setMessage({ type: "error", text: errorData.error || "DELETE FAILED" })
      }
    } catch (error) {
      console.error("Failed to delete category:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/categories/${category._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ ...category, isActive: !category.isActive }),
      })

      if (response.ok) {
        setMessage({ type: "success", text: category.isActive ? "CATEGORY DEACTIVATED" : "CATEGORY ACTIVATED" })
        fetchCategories()
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Failed to toggle category:", error)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: "",
      description: "",
      isActive: true,
    })
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
          {"CATEGORIES MANAGEMENT"}
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
          {showForm ? "CANCEL" : "ADD CATEGORY"}
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
          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"CATEGORY NAME"}
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              placeholder="E.G. DESIGN, DEVELOPMENT, MARKETING"
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"DESCRIPTION (OPTIONAL)"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value.toUpperCase() })}
              placeholder="BRIEF DESCRIPTION OF THE CATEGORY..."
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
            {editingId ? "UPDATE CATEGORY" : "CREATE CATEGORY"}
          </button>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"LOADING..."}
        </p>
      ) : categories.length === 0 ? (
        <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>
          {"NO CATEGORIES FOUND. CREATE ONE TO GET STARTED."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {categories.map((category) => (
            <div
              key={category._id}
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
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "5px" }}>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#39FF14", fontWeight: 600 }}>
                    {category.name}
                  </h3>
                  {!category.isActive && (
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
                {category.description && (
                  <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    {category.description}
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleToggleActive(category)}
                  className="aeonik-mono"
                  style={{
                    padding: "8px 15px",
                    background: category.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${category.isActive ? "#39FF14" : "#FF0000"}`,
                    color: category.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!category.isActive) {
                      e.currentTarget.style.background = "#FF0000"
                      e.currentTarget.style.color = "#FFF"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!category.isActive) {
                      e.currentTarget.style.background = "transparent"
                      e.currentTarget.style.color = "#FF0000"
                    }
                  }}
                >
                  {category.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
                <button
                  onClick={() => handleEdit(category)}
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
                    setCategoryToDelete(category)
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
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
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
          onClick={() => setCategoryToDelete(null)}
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
              {"DELETE CATEGORY?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", marginBottom: "10px" }}>
              {categoryToDelete.name}
            </p>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "#FF0000", marginBottom: "30px" }}>
              {"WARNING: ARTICLES USING THIS CATEGORY MAY BE AFFECTED"}
            </p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button
                onClick={() => setCategoryToDelete(null)}
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

export default CategoriesAdmin
