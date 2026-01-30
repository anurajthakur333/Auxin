import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

const ProjectCategoriesAdmin = () => {
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#39FF14",
    isActive: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/project-categories/admin/all`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch categories")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingCategory(null)
    setFormData({
      name: "",
      description: "",
      color: "#39FF14",
      isActive: true,
    })
    setShowAddModal(true)
    playClickSound()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || "#39FF14",
      isActive: category.isActive,
    })
    setShowAddModal(true)
    playClickSound()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError("Category name is required")
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const url = editingCategory
        ? `${API_BASE_URL}/api/project-categories/admin/${editingCategory.id}`
        : `${API_BASE_URL}/api/project-categories/admin`

      const response = await fetch(url, {
        method: editingCategory ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to save category" }))
        throw new Error(errorData.error || "Failed to save category")
      }

      setSuccess(editingCategory ? "Category updated successfully!" : "Category created successfully!")
      setShowAddModal(false)
      setEditingCategory(null)
      fetchCategories()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving category:", err)
      setError(err instanceof Error ? err.message : "Failed to save category")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return
    }

    try {
      setDeletingId(id)
      setError(null)

      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/project-categories/admin/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to delete category" }))
        throw new Error(errorData.error || "Failed to delete category")
      }

      setSuccess("Category deleted successfully!")
      fetchCategories()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error deleting category:", err)
      setError(err instanceof Error ? err.message : "Failed to delete category")
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (category: Category) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/project-categories/admin/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isActive: !category.isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      fetchCategories()
      playClickSound()
    } catch (err) {
      console.error("Error toggling category:", err)
      setError(err instanceof Error ? err.message : "Failed to update category")
    }
  }

  const handleSeedDefaults = async () => {
    try {
      setLoading(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/project-categories/admin/seed`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to seed categories")
      }

      const data = await response.json()
      setSuccess(`Seeded categories: ${data.created.length} created, ${data.skipped.length} skipped`)
      fetchCategories()
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      console.error("Error seeding categories:", err)
      setError(err instanceof Error ? err.message : "Failed to seed categories")
    } finally {
      setLoading(false)
    }
  }

  const predefinedColors = [
    "#39FF14", // Neon green
    "#FF6B6B", // Red
    "#4ECDC4", // Teal
    "#FFE66D", // Yellow
    "#95E1D3", // Mint
    "#A8E6CF", // Light green
    "#DDA0DD", // Plum
    "#87CEEB", // Sky blue
    "#F0E68C", // Khaki
    "#FFB6C1", // Light pink
  ]

  return (
    <div style={{ color: "#FFF" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
        <h3
          className="aeonik-mono"
          style={{
            fontSize: "clamp(20px, 2.5vw, 28px)",
            color: "#FFF",
            margin: 0,
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          PROJECT CATEGORIES
        </h3>
        <div style={{ display: "flex", gap: "10px" }}>
          {categories.length === 0 && (
            <button
              onClick={handleSeedDefaults}
              className="aeonik-mono"
              style={{
                padding: "10px 20px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFF",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "0px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              SEED DEFAULTS
            </button>
          )}
          <button
            onClick={handleAdd}
            className="aeonik-mono"
            style={{
              padding: "10px 20px",
              background: "#39FF14",
              border: "none",
              color: "#000",
              fontSize: "12px",
              cursor: "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            + ADD CATEGORY
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px",
            background: "rgba(255, 107, 107, 0.1)",
            border: "1px solid #FF6B6B",
            color: "#FF6B6B",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="aeonik-mono"
          style={{
            padding: "15px",
            background: "rgba(57, 255, 20, 0.1)",
            border: "1px solid #39FF14",
            color: "#39FF14",
            marginBottom: "20px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="aeonik-mono" style={{ color: "#FFF", fontSize: "14px", marginBottom: "20px" }}>
          LOADING CATEGORIES...
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && (
        <div
          className="aeonik-mono"
          style={{
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "14px",
            padding: "40px",
            textAlign: "center",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
          }}
        >
          NO CATEGORIES FOUND. ADD YOUR FIRST CATEGORY OR SEED DEFAULTS.
        </div>
      )}

      {/* Categories List */}
      {!loading && categories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {categories.map((category) => (
            <div
              key={category.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "15px 20px",
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${category.isActive ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 107, 107, 0.3)"}`,
                opacity: category.isActive ? 1 : 0.6,
                transition: "all 0.3s ease",
              }}
            >
              {/* Color indicator */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: category.color || "#39FF14",
                  flexShrink: 0,
                }}
              />

              {/* Name and description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="aeonik-mono"
                  style={{
                    fontSize: "14px",
                    color: "#FFF",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {category.name}
                  {!category.isActive && (
                    <span
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        background: "rgba(255, 107, 107, 0.2)",
                        color: "#FF6B6B",
                      }}
                    >
                      INACTIVE
                    </span>
                  )}
                </div>
                {category.description && (
                  <div
                    className="aeonik-mono"
                    style={{
                      fontSize: "12px",
                      color: "rgba(255, 255, 255, 0.5)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {category.description}
                  </div>
                )}
              </div>

              {/* Slug */}
              <div
                className="aeonik-mono"
                style={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.4)",
                  padding: "4px 8px",
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                {category.slug}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <button
                  onClick={() => handleToggleActive(category)}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: "transparent",
                    border: `1px solid ${category.isActive ? "#FFD700" : "#39FF14"}`,
                    color: category.isActive ? "#FFD700" : "#39FF14",
                    fontSize: "10px",
                    cursor: "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  {category.isActive ? "DISABLE" : "ENABLE"}
                </button>
                <button
                  onClick={() => handleEdit(category)}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "10px",
                    cursor: "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  disabled={deletingId === category.id}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: deletingId === category.id ? "rgba(255, 107, 107, 0.2)" : "transparent",
                    border: "1px solid #FF6B6B",
                    color: "#FF6B6B",
                    fontSize: "10px",
                    cursor: deletingId === category.id ? "not-allowed" : "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  {deletingId === category.id ? "..." : "DELETE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 10001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false)
              setEditingCategory(null)
            }
          }}
        >
          <div
            style={{
              background: "#0A0A0A",
              border: "1px solid #39FF14",
              padding: "30px",
              width: "100%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#39FF14", margin: 0 }}>
                {editingCategory ? "EDIT CATEGORY" : "ADD CATEGORY"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingCategory(null)
                }}
                className="aeonik-mono"
                style={{
                  fontSize: "24px",
                  background: "transparent",
                  border: "none",
                  color: "#FFF",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  NAME *
                </label>
                <Input
                  label=""
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="E.G., WEB DESIGN"
                  required
                  style={{ marginBottom: 0 }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  DESCRIPTION
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="OPTIONAL DESCRIPTION..."
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#FFF",
                    fontSize: "14px",
                    borderRadius: "0px",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  COLOR
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, color })
                        playClickSound()
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: color,
                        border: formData.color === color ? "3px solid #FFF" : "2px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "none",
                      borderRadius: "0px",
                      cursor: "pointer",
                      background: "transparent",
                    }}
                  />
                  <span className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    OR PICK CUSTOM COLOR
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: "25px" }}>
                <label
                  className="aeonik-mono"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.6)",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: "18px", height: "18px" }}
                  />
                  ACTIVE (VISIBLE IN DROPDOWNS)
                </label>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="aeonik-mono"
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: submitting ? "rgba(57, 255, 20, 0.3)" : "#39FF14",
                    border: "none",
                    color: "#000",
                    fontSize: "12px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                    fontWeight: 600,
                  }}
                >
                  {submitting ? "SAVING..." : "SAVE"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setEditingCategory(null)
                    playClickSound()
                  }}
                  className="aeonik-mono"
                  style={{
                    flex: 1,
                    padding: "12px 20px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "12px",
                    cursor: "pointer",
                    borderRadius: "0px",
                    letterSpacing: "1px",
                  }}
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectCategoriesAdmin
