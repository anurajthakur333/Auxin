import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface Question {
  label: string
  type: "text" | "textarea" | "email" | "tel" | "number"
  placeholder?: string
  required: boolean
  order: number
}

interface MeetingCategory {
  _id?: string
  name: string
  description?: string
  icon?: string
  color?: string
  questions: Question[]
  isActive: boolean
}

const MeetingCategoriesAdmin = () => {
  const [categories, setCategories] = useState<MeetingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<MeetingCategory>({
    name: "",
    description: "",
    icon: "",
    color: "#39FF14",
    questions: [],
    isActive: true,
  })
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<MeetingCategory | null>(null)
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

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-categories`, {
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

  const resetForm = () => {
    setEditingId(null)
    setShowForm(false)
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "#39FF14",
      questions: [],
      isActive: true,
    })
  }

  const handleEdit = (category: MeetingCategory) => {
    playClickSound()
    setEditingId(category._id || null)
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#39FF14",
      questions: [...category.questions],
      isActive: category.isActive,
    })
    setShowForm(true)
  }

  const handleAddQuestion = () => {
    playClickSound()
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          label: "",
          type: "text",
          placeholder: "",
          required: false,
          order: formData.questions.length,
        },
      ],
    })
  }

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const handleRemoveQuestion = (index: number) => {
    playClickSound()
    const updatedQuestions = formData.questions.filter((_, i) => i !== index)
    // Reorder remaining questions
    updatedQuestions.forEach((q, i) => {
      q.order = i
    })
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const handleSave = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      // Validate required fields
      if (!formData.name.trim()) {
        setMessage({ type: "error", text: "NAME IS REQUIRED" })
        setTimeout(() => setMessage(null), 3000)
        return
      }

      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const q = formData.questions[i]
        if (!q.label.trim()) {
          setMessage({ type: "error", text: `QUESTION ${i + 1}: LABEL IS REQUIRED` })
          setTimeout(() => setMessage(null), 3000)
          return
        }
      }

      const url = editingId
        ? `${API_BASE_URL}/api/admin/meeting-categories/${editingId}`
        : `${API_BASE_URL}/api/admin/meeting-categories`

      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: "success", text: editingId ? "CATEGORY UPDATED" : "CATEGORY CREATED" })
        resetForm()
        fetchCategories()
        setTimeout(() => setMessage(null), 3000)
      } else {
        const errorData = await response.json()
        setMessage({ type: "error", text: errorData.error || "FAILED TO SAVE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Save error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete?._id) return

    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-categories/${categoryToDelete._id}`, {
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
        setMessage({ type: "error", text: "FAILED TO DELETE" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Delete error:", error)
      setMessage({ type: "error", text: "NETWORK ERROR" })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const toggleActive = async (category: MeetingCategory) => {
    try {
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/meeting-categories/${category._id}`, {
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
          {"MEETING CATEGORIES"}
        </h2>
        <button
          onClick={() => {
            playClickSound()
            resetForm()
            setShowForm(true)
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: "#39FF14",
            border: "1px solid #39FF14",
            color: "#000",
            fontSize: "12px",
            cursor: "pointer",
            letterSpacing: "1px",
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
          {"+ ADD CATEGORY"}
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
            <h3 className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 600 }}>
              {editingId ? "EDIT CATEGORY" : "NEW CATEGORY"}
            </h3>
            <button
              onClick={() => {
                playClickSound()
                resetForm()
              }}
              className="aeonik-mono"
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFF",
                fontSize: "11px",
                cursor: "pointer",
                letterSpacing: "1px",
              }}
            >
              {"CANCEL"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"NAME *"}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                placeholder="DEVELOPMENT"
              />
            </div>

            <div>
              <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
                {"COLOR"}
              </label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  cursor: "pointer",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", display: "block" }}>
              {"DESCRIPTION"}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description..."
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
              {"ICON (EMOJI OR TEXT)"}
            </label>
            <Input
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              placeholder="💻 or DEV"
            />
          </div>

          {/* Questions Section */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
              <label className="aeonik-mono" style={{ fontSize: "12px", color: "#FFF", fontWeight: 600 }}>
                {"QUESTIONS"}
              </label>
              <button
                onClick={handleAddQuestion}
                className="aeonik-mono"
                style={{
                  padding: "6px 12px",
                  background: "transparent",
                  border: "1px solid #39FF14",
                  color: "#39FF14",
                  fontSize: "11px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
              >
                {"+ ADD QUESTION"}
              </button>
            </div>

            {formData.questions.map((question, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  padding: "20px",
                  marginBottom: "15px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <span className="aeonik-mono" style={{ fontSize: "11px", color: "#39FF14" }}>
                    {`QUESTION ${index + 1}`}
                  </span>
                  <button
                    onClick={() => handleRemoveQuestion(index)}
                    className="aeonik-mono"
                    style={{
                      padding: "4px 10px",
                      background: "transparent",
                      border: "1px solid #FF0000",
                      color: "#FF0000",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {"REMOVE"}
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "15px", marginBottom: "15px" }}>
                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>
                      {"LABEL *"}
                    </label>
                    <Input
                      value={question.label}
                      onChange={(e) => handleQuestionChange(index, "label", e.target.value)}
                      placeholder="What is your project about?"
                    />
                  </div>

                  <div>
                    <label className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>
                      {"TYPE"}
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionChange(index, "type", e.target.value)}
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
                      <option value="text" style={{ background: "#000" }}>TEXT</option>
                      <option value="textarea" style={{ background: "#000" }}>TEXTAREA</option>
                      <option value="email" style={{ background: "#000" }}>EMAIL</option>
                      <option value="tel" style={{ background: "#000" }}>PHONE</option>
                      <option value="number" style={{ background: "#000" }}>NUMBER</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", marginBottom: "6px", display: "block" }}>
                    {"PLACEHOLDER"}
                  </label>
                  <Input
                    value={question.placeholder || ""}
                    onChange={(e) => handleQuestionChange(index, "placeholder", e.target.value)}
                    placeholder="Enter placeholder text..."
                  />
                </div>

                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={question.required}
                    onChange={(e) => handleQuestionChange(index, "required", e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                  <span className="aeonik-mono" style={{ fontSize: "11px", color: "#FFF" }}>
                    {"REQUIRED"}
                  </span>
                </label>
              </div>
            ))}

            {formData.questions.length === 0 && (
              <p className="aeonik-mono" style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", textAlign: "center", padding: "20px" }}>
                {"NO QUESTIONS YET. CLICK 'ADD QUESTION' TO ADD ONE."}
              </p>
            )}
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
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2ecc11"
              e.currentTarget.style.borderColor = "#2ecc11"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#39FF14"
              e.currentTarget.style.borderColor = "#39FF14"
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
          {"NO CATEGORIES FOUND"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {categories.map((category) => (
            <div
              key={category._id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${category.isActive ? category.color || "#39FF14" : "rgba(255, 255, 255, 0.1)"}`,
                padding: "25px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div>
                  <h3 className="aeonik-mono" style={{ fontSize: "18px", color: category.color || "#39FF14", fontWeight: 600, marginBottom: "5px" }}>
                    {category.icon && <span style={{ marginRight: "10px" }}>{category.icon}</span>}
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "5px" }}>
                      {category.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    playClickSound()
                    toggleActive(category)
                  }}
                  className="aeonik-mono"
                  style={{
                    padding: "6px 12px",
                    background: category.isActive ? "rgba(57, 255, 20, 0.1)" : "transparent",
                    border: `1px solid ${category.isActive ? "#39FF14" : "rgba(255, 0, 0, 0.3)"}`,
                    color: category.isActive ? "#39FF14" : "#FF0000",
                    fontSize: "10px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                >
                  {category.isActive ? "ACTIVE" : "INACTIVE"}
                </button>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <p className="aeonik-mono" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
                  {`${category.questions.length} QUESTION${category.questions.length !== 1 ? "S" : ""}`}
                </p>
                {category.questions.length > 0 && (
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>
                    {category.questions.slice(0, 3).map((q, idx) => (
                      <div key={idx} style={{ marginBottom: "4px" }}>
                        {q.label}
                      </div>
                    ))}
                    {category.questions.length > 3 && (
                      <div>{"..."}</div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => handleEdit(category)}
                  className="aeonik-mono"
                  style={{
                    flex: 1,
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#FFF",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
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
                    flex: 1,
                    padding: "8px 16px",
                    background: "transparent",
                    border: "1px solid rgba(255, 0, 0, 0.3)",
                    color: "#FF0000",
                    fontSize: "11px",
                    cursor: "pointer",
                    letterSpacing: "1px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
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
              background: "#111",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              padding: "30px",
              maxWidth: "400px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aeonik-mono" style={{ fontSize: "16px", color: "#FFF", marginBottom: "15px" }}>
              {"DELETE CATEGORY?"}
            </h3>
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)", marginBottom: "25px" }}>
              {`ARE YOU SURE YOU WANT TO DELETE "${categoryToDelete.name}"? THIS ACTION CANNOT BE UNDONE.`}
            </p>
            <div style={{ display: "flex", gap: "15px" }}>
              <button
                onClick={() => {
                  playClickSound()
                  setCategoryToDelete(null)
                }}
                className="aeonik-mono"
                style={{
                  flex: 1,
                  padding: "10px 20px",
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
                  flex: 1,
                  padding: "10px 20px",
                  background: "transparent",
                  border: "1px solid #FF0000",
                  color: "#FF0000",
                  fontSize: "12px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 0, 0, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
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

export default MeetingCategoriesAdmin
