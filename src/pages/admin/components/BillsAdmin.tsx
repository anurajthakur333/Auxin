import { useState, useEffect } from "react"
import { API_BASE_URL } from "../../../lib/apiConfig"
import Input from "../../../components/ui/Input"
import DatePicker from "../../../components/ui/DatePicker"
import { useSound } from "../../../hooks/useSound"
import clickSound from "../../../assets/Sound/Click1.wav"

interface BillingInfo {
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  gstNumber?: string
}

interface Client {
  id: string
  name: string
  email: string
  clientCode: string
  status: string
  billingInfo?: BillingInfo
}

interface InvoiceItem {
  title: string
  price: number
  quantity: number
  subtotal: number
}

interface CompanyAddress {
  companyName: string
  email: string
  street: string
  city: string
  state: string
  zip: string
  country: string
}

interface ClientAddress {
  name: string
  email: string
  address: string
  gstNumber: string
}

interface PaymentMethod {
  bankName: string
  accountHolderName: string
  accountNumber: string
  routingNumber: string
  swiftCode: string
  branchAddress: string
  accountType: string
}

interface Project {
  id: string
  name: string
  projectCode: string
  category: string
  status: string
  budget?: string
  progress: number
  deadline: string
  startDate: string
}

const BillsAdmin = () => {
  const playClickSound = useSound(clickSound, { volume: 0.3 })
  const [activeView, setActiveView] = useState<"create" | "list">("create")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null)

  // Form data
  const [clientCode, setClientCode] = useState<string>("")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientCodeError, setClientCodeError] = useState<string | null>(null)
  const [fetchingClient, setFetchingClient] = useState(false)
  const [date, setDate] = useState<string>("")
  const [dueDate, setDueDate] = useState<string>("")
  const [billTo, setBillTo] = useState<ClientAddress>({
    name: "",
    email: "",
    address: "",
    gstNumber: "",
  })
  const [companyAddress, setCompanyAddress] = useState<CompanyAddress>({
    companyName: "Auxin Media Digital",
    email: "auxinmediadigital@gmail.com",
    street: "1234 Market Street, Suite 500",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
    country: "United States",
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { title: "", price: 0, quantity: 1, subtotal: 0 },
  ])
  const [projectCode, setProjectCode] = useState<string>("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectCodeError, setProjectCodeError] = useState<string | null>(null)
  const [fetchingProject, setFetchingProject] = useState(false)
  const [clientProjects, setClientProjects] = useState<Project[]>([])
  const [fetchingClientProjects, setFetchingClientProjects] = useState(false)
  const [discount, setDiscount] = useState<number>(0)
  const [sgst, setSgst] = useState<number>(0)
  const [cgst, setCgst] = useState<number>(0)
  const [paymentTerms, setPaymentTerms] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    bankName: "",
    accountHolderName: "",
    accountNumber: "",
    routingNumber: "",
    swiftCode: "",
    branchAddress: "",
    accountType: "",
  })

  // Fetch client's projects when client is selected
  useEffect(() => {
    if (selectedClient?.id) {
      fetchClientProjects(selectedClient.id)
    } else {
      setClientProjects([])
    }
  }, [selectedClient])

  useEffect(() => {
    // Auto-fill billTo when client is found (including billing info)
    // But only when NOT editing an existing invoice
    if (selectedClient && !editingInvoice) {
      const billing = selectedClient.billingInfo || {}
      // Build full address from billing info
      const fullAddress = [
        billing.address,
        billing.city,
        billing.state,
        billing.zip,
        billing.country
      ].filter(Boolean).join(", ")
      
      setBillTo({
        name: selectedClient.name,
        email: selectedClient.email,
        address: fullAddress || "",
        gstNumber: billing.gstNumber || "",
      })
    }
  }, [selectedClient, editingInvoice])

  useEffect(() => {
    // Recalculate item subtotals
    setItems((prevItems) =>
      prevItems.map((item) => ({
        ...item,
        subtotal: item.price * item.quantity,
      }))
    )
  }, [])

  const fetchClientByCode = async (code: string) => {
    const trimmedCode = code.trim().toUpperCase()
    
    // Validate format: exactly 5 capital letters
    const codeRegex = /^[A-Z]{5}$/
    if (!codeRegex.test(trimmedCode)) {
      setClientCodeError("CLIENT CODE MUST BE EXACTLY 5 CAPITAL LETTERS (A-Z)")
      setSelectedClient(null)
      return
    }

    try {
      setFetchingClient(true)
      setClientCodeError(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/by-code/${trimmedCode}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to fetch client" }))
        setClientCodeError(errorData.error || "CLIENT NOT FOUND")
        setSelectedClient(null)
        return
      }

      const data = await response.json()
      setSelectedClient(data.client)
      setClientCodeError(null)
    } catch (err) {
      console.error("Error fetching client:", err)
      setClientCodeError("FAILED TO FETCH CLIENT")
      setSelectedClient(null)
    } finally {
      setFetchingClient(false)
    }
  }

  const fetchClientProjects = async (clientId: string) => {
    try {
      setFetchingClientProjects(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) return

      const response = await fetch(`${API_BASE_URL}/api/admin/projects/client/${clientId}`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Normalize project IDs
        const normalizedProjects = (data.projects || []).map((p: any) => ({
          ...p,
          id: p.id || p._id,
        }))
        setClientProjects(normalizedProjects)
      } else {
        setClientProjects([])
      }
    } catch (err) {
      console.error("Error fetching client projects:", err)
      setClientProjects([])
    } finally {
      setFetchingClientProjects(false)
    }
  }

  const handleClientCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 5)
    setClientCode(upperValue)
    
    // Clear previous client selection only if code changed significantly
    if (upperValue.length < 5) {
      setSelectedClient(null)
      setClientCodeError(null)
      setClientProjects([])
      // Also clear project selection when client changes
      setProjectCode("")
      setSelectedProject(null)
      setProjectCodeError(null)
    }
    
    // Fetch client when code is complete (5 letters)
    if (upperValue.length === 5) {
      fetchClientByCode(upperValue)
    }
  }

  const fetchProjectByCode = async (code: string) => {
    const trimmedCode = code.trim().toUpperCase()
    
    // Validate format: exactly 6 capital letters
    const codeRegex = /^[A-Z]{6}$/
    if (!codeRegex.test(trimmedCode)) {
      if (trimmedCode.length > 0 && trimmedCode.length < 6) {
        setProjectCodeError(null) // Don't show error while typing
      } else if (trimmedCode.length > 6) {
        setProjectCodeError("PROJECT CODE MUST BE EXACTLY 6 CAPITAL LETTERS (A-Z)")
      }
      setSelectedProject(null)
      return
    }

    try {
      setFetchingProject(true)
      setProjectCodeError(null)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      // Fetch all projects and find the one with matching code
      const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        setProjectCodeError("FAILED TO FETCH PROJECTS")
        setSelectedProject(null)
        return
      }

      const data = await response.json()
      const projects = data.projects || []
      const foundProject = projects.find((p: any) => p.projectCode === trimmedCode)
      
      if (foundProject) {
        setSelectedProject({
          id: foundProject.id || foundProject._id,
          name: foundProject.name,
          projectCode: foundProject.projectCode,
          category: foundProject.category,
          status: foundProject.status,
          budget: foundProject.budget,
          progress: foundProject.progress || 0,
          deadline: foundProject.deadline,
          startDate: foundProject.startDate,
        })
        setProjectCodeError(null)
      } else {
        setProjectCodeError("PROJECT NOT FOUND")
        setSelectedProject(null)
      }
    } catch (err) {
      console.error("Error fetching project:", err)
      setProjectCodeError("FAILED TO FETCH PROJECT")
      setSelectedProject(null)
    } finally {
      setFetchingProject(false)
    }
  }

  const handleProjectCodeChange = (value: string) => {
    const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
    setProjectCode(upperValue)
    
    // Clear previous project selection
    if (upperValue.length < 6) {
      setSelectedProject(null)
      setProjectCodeError(null)
    }
    
    // Check project when code is complete (6 characters)
    if (upperValue.length === 6) {
      // First check in local clientProjects
      const localProject = clientProjects.find(p => p.projectCode === upperValue)
      if (localProject) {
        setSelectedProject(localProject)
        setProjectCodeError(null)
      } else {
        // If not found locally, fetch from API
        fetchProjectByCode(upperValue)
      }
    }
  }

  const addItem = () => {
    setItems([...items, { title: "", price: 0, quantity: 1, subtotal: 0 }])
    playClickSound()
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
      playClickSound()
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    }
    // Recalculate subtotal
    if (field === "price" || field === "quantity") {
      newItems[index].subtotal = newItems[index].price * newItems[index].quantity
    }
    setItems(newItems)
  }

  const calculateTotal = () => {
    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const subtotalAfterDiscount = itemsTotal - discount
    const taxTotal = sgst + cgst
    return subtotalAfterDiscount + taxTotal
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!selectedClient || !clientCode) {
      setError("Please enter a valid client code")
      return
    }
    if (!selectedProject || !projectCode || projectCode.length !== 6) {
      setError("Please enter a valid 6-character project code")
      return
    }
    if (!date || !dueDate) {
      setError("Please select date and due date")
      return
    }
    if (!billTo.name || !billTo.email || !billTo.address) {
      setError("Please fill in all bill to fields")
      return
    }
    if (!companyAddress.companyName || !companyAddress.email) {
      setError("Please fill in company address")
      return
    }
    if (items.some((item) => !item.title || item.price <= 0 || item.quantity <= 0)) {
      setError("Please fill in all item fields correctly")
      return
    }

    try {
      setSubmitting(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const requestBody = {
        clientId: selectedClient.id,
        projectCode: projectCode.trim(),
        projectId: selectedProject?.id,
        date,
        dueDate,
        billTo,
        companyAddress,
        items,
        discount,
        sgst,
        cgst,
        paymentTerms: paymentTerms || undefined,
        paymentMethod: Object.values(paymentMethod).some((v) => v) ? paymentMethod : undefined,
      }

      console.log("📤 Sending invoice data:", JSON.stringify(requestBody, null, 2))

      const response = await fetch(`${API_BASE_URL}/api/admin/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create invoice" }))
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || "Failed to create invoice"
        console.error("Invoice creation error:", errorData)
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setSuccess(`Invoice ${data.invoice.invoiceNumber} created successfully!`)
      
      // Reset form
      setClientCode("")
      setSelectedClient(null)
      setClientCodeError(null)
      setProjectCode("")
      setSelectedProject(null)
      setProjectCodeError(null)
      setDate("")
      setDueDate("")
      setBillTo({ name: "", email: "", address: "", gstNumber: "" })
      setItems([{ title: "", price: 0, quantity: 1, subtotal: 0 }])
      setDiscount(0)
      setSgst(0)
      setCgst(0)
      setPaymentTerms("")
      setPaymentMethod({
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        routingNumber: "",
        swiftCode: "",
        branchAddress: "",
        accountType: "",
      })
    } catch (err) {
      console.error("Error creating invoice:", err)
      setError(err instanceof Error ? err.message : "Failed to create invoice")
    } finally {
      setSubmitting(false)
    }
  }

  // Invoice list state
  const [invoices, setInvoices] = useState<any[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [deletingInvoiceId, setDeletingInvoiceId] = useState<string | null>(null)
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState<string>("")
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all")

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/invoices`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      setInvoices(data.invoices || [])
    } catch (err) {
      console.error("Error fetching invoices:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch invoices")
    } finally {
      setLoadingInvoices(false)
    }
  }

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm("ARE YOU SURE YOU WANT TO DELETE THIS INVOICE? THIS ACTION CANNOT BE UNDONE.")) {
      return
    }

    try {
      setDeletingInvoiceId(invoiceId)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/invoices/${invoiceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete invoice")
      }

      setSuccess("Invoice deleted successfully!")
      fetchInvoices()
    } catch (err) {
      console.error("Error deleting invoice:", err)
      setError(err instanceof Error ? err.message : "Failed to delete invoice")
    } finally {
      setDeletingInvoiceId(null)
    }
  }

  useEffect(() => {
    if (activeView === "list") {
      fetchInvoices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView])

  const handleEditInvoice = (invoice: any) => {
    setEditingInvoice(invoice)
    
    // Populate form with invoice data
    setClientCode(invoice.clientId?.clientCode || "")
    setSelectedClient(invoice.clientId ? {
      id: invoice.clientId._id || invoice.clientId.id,
      name: invoice.clientId.name || "",
      email: invoice.clientId.email || "",
      clientCode: invoice.clientId.clientCode || "",
      status: invoice.clientId.status || "active",
      billingInfo: invoice.clientId.billingInfo,
    } : null)
    
    // Set project code
    const pCode = invoice.projectCode || ""
    setProjectCode(pCode)
    
    // Handle projectId - it might be an object or just an ID string
    if (invoice.projectId) {
      const projectIdValue = typeof invoice.projectId === 'string' 
        ? invoice.projectId 
        : (invoice.projectId._id || invoice.projectId.id)
      
      // If projectId is an object with details, use them
      if (typeof invoice.projectId === 'object' && invoice.projectId.name) {
        setSelectedProject({
          id: projectIdValue,
          name: invoice.projectId.name || "",
          projectCode: pCode,
          category: invoice.projectId.category || "",
          status: invoice.projectId.status || "",
          budget: invoice.projectId.budget,
          progress: invoice.projectId.progress || 0,
          deadline: invoice.projectId.deadline || "",
          startDate: invoice.projectId.startDate || "",
        })
      } else {
        // projectId is just an ID, create a minimal project object
        // The user will need to select from dropdown or the project will be fetched
        setSelectedProject({
          id: projectIdValue,
          name: "",
          projectCode: pCode,
          category: "",
          status: "",
          budget: undefined,
          progress: 0,
          deadline: "",
          startDate: "",
        })
      }
    } else {
      setSelectedProject(null)
    }
    
    setDate(invoice.date ? invoice.date.split("T")[0] : "")
    setDueDate(invoice.dueDate ? invoice.dueDate.split("T")[0] : "")
    
    setBillTo({
      name: invoice.billTo?.name || "",
      email: invoice.billTo?.email || "",
      address: invoice.billTo?.address || "",
      gstNumber: invoice.billTo?.gstNumber || "",
    })
    
    setCompanyAddress({
      companyName: invoice.companyAddress?.companyName || "Auxin Media Digital",
      email: invoice.companyAddress?.email || "auxinmediadigital@gmail.com",
      street: invoice.companyAddress?.street || "",
      city: invoice.companyAddress?.city || "",
      state: invoice.companyAddress?.state || "",
      zip: invoice.companyAddress?.zip || "",
      country: invoice.companyAddress?.country || "",
    })
    
    setItems(invoice.items?.length > 0 ? invoice.items : [{ title: "", price: 0, quantity: 1, subtotal: 0 }])
    setDiscount(invoice.discount || 0)
    setSgst(invoice.sgst || 0)
    setCgst(invoice.cgst || 0)
    setPaymentTerms(invoice.paymentTerms || "")
    setPaymentMethod({
      bankName: invoice.paymentMethod?.bankName || "",
      accountHolderName: invoice.paymentMethod?.accountHolderName || "",
      accountNumber: invoice.paymentMethod?.accountNumber || "",
      routingNumber: invoice.paymentMethod?.routingNumber || "",
      swiftCode: invoice.paymentMethod?.swiftCode || "",
      branchAddress: invoice.paymentMethod?.branchAddress || "",
      accountType: invoice.paymentMethod?.accountType || "",
    })
    
    setActiveView("create")
    playClickSound()
  }

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInvoice) return
    
    setError(null)
    setSuccess(null)

    // Validation
    if (!selectedClient || !clientCode) {
      setError("Please enter a valid client code")
      return
    }
    if (!selectedProject || !projectCode || projectCode.length !== 6) {
      setError("Please enter a valid 6-character project code")
      return
    }
    if (!date || !dueDate) {
      setError("Please select date and due date")
      return
    }
    if (!billTo.name || !billTo.email || !billTo.address) {
      setError("Please fill in all bill to fields")
      return
    }
    if (items.some((item) => !item.title || item.price <= 0 || item.quantity <= 0)) {
      setError("Please fill in all item fields correctly")
      return
    }

    try {
      setSubmitting(true)
      const adminToken = localStorage.getItem("adminToken")
      if (!adminToken) {
        setError("Admin authentication required")
        return
      }

      const invoiceId = editingInvoice.id || editingInvoice._id
      const requestBody = {
        clientId: selectedClient.id,
        projectCode: projectCode.trim(),
        projectId: selectedProject?.id,
        date,
        dueDate,
        billTo,
        companyAddress,
        items,
        discount,
        sgst,
        cgst,
        paymentTerms: paymentTerms || undefined,
        paymentMethod: Object.values(paymentMethod).some((v) => v) ? paymentMethod : undefined,
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/invoices/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to update invoice" }))
        throw new Error(errorData.error || "Failed to update invoice")
      }

      setSuccess("Invoice updated successfully!")
      setEditingInvoice(null)
      
      // Reset form
      setClientCode("")
      setSelectedClient(null)
      setProjectCode("")
      setSelectedProject(null)
      setDate("")
      setDueDate("")
      setBillTo({ name: "", email: "", address: "", gstNumber: "" })
      setItems([{ title: "", price: 0, quantity: 1, subtotal: 0 }])
      setDiscount(0)
      setSgst(0)
      setCgst(0)
      setPaymentTerms("")
      setPaymentMethod({
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        routingNumber: "",
        swiftCode: "",
        branchAddress: "",
        accountType: "",
      })
      
      // Switch to list view and refresh
      setActiveView("list")
    } catch (err) {
      console.error("Error updating invoice:", err)
      setError(err instanceof Error ? err.message : "Failed to update invoice")
    } finally {
      setSubmitting(false)
    }
  }

  const cancelEdit = () => {
    setEditingInvoice(null)
    // Reset form
    setClientCode("")
    setSelectedClient(null)
    setProjectCode("")
    setSelectedProject(null)
    setDate("")
    setDueDate("")
    setBillTo({ name: "", email: "", address: "", gstNumber: "" })
    setItems([{ title: "", price: 0, quantity: 1, subtotal: 0 }])
    setDiscount(0)
    setSgst(0)
    setCgst(0)
    setPaymentTerms("")
    setPaymentMethod({
      bankName: "",
      accountHolderName: "",
      accountNumber: "",
      routingNumber: "",
      swiftCode: "",
      branchAddress: "",
      accountType: "",
    })
    playClickSound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#39FF14"
      case "pending":
        return "#FFD700"
      case "overdue":
        return "#FF6B6B"
      default:
        return "#FFF"
    }
  }

  return (
    <div style={{ color: "#FFF" }}>
      {/* Tabs */}
      <div style={{ display: "flex", gap: "15px", marginBottom: "30px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "15px" }}>
        <button
          onClick={() => {
            setActiveView("create")
            playClickSound()
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: activeView === "create" ? "rgba(57, 255, 20, 0.1)" : "transparent",
            border: activeView === "create" ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.1)",
            color: activeView === "create" ? "#39FF14" : "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (activeView !== "create") {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
              e.currentTarget.style.color = "#FFF"
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "create") {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"
            }
          }}
        >
          CREATE INVOICE
        </button>
        <button
          onClick={() => {
            setActiveView("list")
            playClickSound()
          }}
          className="aeonik-mono"
          style={{
            padding: "10px 20px",
            background: activeView === "list" ? "rgba(57, 255, 20, 0.1)" : "transparent",
            border: activeView === "list" ? "1px solid #39FF14" : "1px solid rgba(255, 255, 255, 0.1)",
            color: activeView === "list" ? "#39FF14" : "rgba(255, 255, 255, 0.6)",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            textTransform: "uppercase",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            if (activeView !== "list") {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
              e.currentTarget.style.color = "#FFF"
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== "list") {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)"
            }
          }}
        >
          ALL INVOICES
        </button>
      </div>

      {activeView === "list" ? (
        <div>
          <h3
            className="aeonik-mono"
            style={{
              fontSize: "clamp(20px, 2.5vw, 28px)",
              color: "#FFF",
              marginBottom: "25px",
              letterSpacing: "-1px",
              fontWeight: 600,
            }}
          >
            ALL INVOICES
          </h3>

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

          {/* Search Filters */}
          <div style={{ marginBottom: "25px", display: "flex", gap: "15px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: 1, minWidth: "250px" }}>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                SEARCH
              </label>
              <Input
                value={invoiceSearchQuery}
                onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                placeholder="SEARCH BY INVOICE #, CLIENT, PROJECT CODE..."
                style={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ minWidth: "180px" }}>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                STATUS
              </label>
              <select
                value={invoiceStatusFilter}
                onChange={(e) => {
                  setInvoiceStatusFilter(e.target.value)
                  playClickSound()
                }}
                className="aeonik-mono"
                style={{
                  width: "100%",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#FFF",
                  fontSize: "14px",
                  borderRadius: "0px",
                }}
              >
                <option value="all">ALL STATUS</option>
                <option value="pending">PENDING</option>
                <option value="paid">PAID</option>
                <option value="overdue">OVERDUE</option>
              </select>
            </div>
            {(invoiceSearchQuery || invoiceStatusFilter !== "all") && (
              <button
                onClick={() => {
                  setInvoiceSearchQuery("")
                  setInvoiceStatusFilter("all")
                  playClickSound()
                }}
                className="aeonik-mono"
                style={{
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
                CLEAR FILTERS
              </button>
            )}
          </div>

          {/* Results Count */}
          {!loadingInvoices && invoices.length > 0 && (
            <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "15px" }}>
              {(() => {
                const count = invoices.filter((invoice) => {
                  if (invoiceStatusFilter !== "all" && invoice.status !== invoiceStatusFilter) return false
                  if (invoiceSearchQuery) {
                    const query = invoiceSearchQuery.toLowerCase()
                    return (
                      (invoice.invoiceNumber || "").toLowerCase().includes(query) ||
                      (invoice.clientId?.name || "").toLowerCase().includes(query) ||
                      (invoice.clientId?.email || "").toLowerCase().includes(query) ||
                      (invoice.projectCode || "").toLowerCase().includes(query)
                    )
                  }
                  return true
                }).length
                return `SHOWING ${count} OF ${invoices.length} INVOICES`
              })()}
            </div>
          )}

          {loadingInvoices && (
            <div className="aeonik-mono" style={{ color: "#FFF", fontSize: "14px", marginBottom: "20px" }}>
              LOADING INVOICES...
            </div>
          )}

          {!loadingInvoices && invoices.length === 0 && (
            <div className="aeonik-mono" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", padding: "40px", textAlign: "center" }}>
              NO INVOICES FOUND
            </div>
          )}

          {!loadingInvoices && invoices.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {(() => {
                const filteredInvoices = invoices.filter((invoice) => {
                  // Status filter
                  if (invoiceStatusFilter !== "all" && invoice.status !== invoiceStatusFilter) {
                    return false
                  }
                  
                  // Search filter
                  if (invoiceSearchQuery) {
                    const query = invoiceSearchQuery.toLowerCase()
                    const invoiceNumber = (invoice.invoiceNumber || "").toLowerCase()
                    const clientName = (invoice.clientId?.name || "").toLowerCase()
                    const clientEmail = (invoice.clientId?.email || "").toLowerCase()
                    const projectCode = (invoice.projectCode || "").toLowerCase()
                    
                    return (
                      invoiceNumber.includes(query) ||
                      clientName.includes(query) ||
                      clientEmail.includes(query) ||
                      projectCode.includes(query)
                    )
                  }
                  
                  return true
                })

                if (filteredInvoices.length === 0) {
                  return (
                    <div className="aeonik-mono" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", padding: "40px", textAlign: "center" }}>
                      NO INVOICES MATCH YOUR FILTERS
                    </div>
                  )
                }

                return filteredInvoices.map((invoice) => (
                <div
                  key={invoice.id || invoice._id}
                  style={{
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    padding: "20px",
                    borderRadius: "0px",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                    e.currentTarget.style.borderColor = getStatusColor(invoice.status)
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
                      gap: "20px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", marginBottom: "5px" }}>
                        {invoice.invoiceNumber}
                        {invoice.projectCode && (
                          <span style={{ marginLeft: "10px", color: "#39FF14", fontSize: "12px" }}>
                            PROJECT: {invoice.projectCode}
                          </span>
                        )}
                      </div>
                      <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                        {invoice.clientId?.name || invoice.clientId?.email || "CLIENT"}
                      </div>
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14", fontWeight: 600 }}>
                      ${invoice.total?.toFixed(2) || "0.00"}
                    </div>
                    <div>
                      <div
                        className="aeonik-mono"
                        style={{
                          fontSize: "11px",
                          color: getStatusColor(invoice.status),
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                          padding: "4px 10px",
                          border: `1px solid ${getStatusColor(invoice.status)}`,
                          borderRadius: "0px",
                          display: "inline-block",
                        }}
                      >
                        {invoice.status}
                      </div>
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                      DUE: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString().toUpperCase() : "N/A"}
                    </div>
                    <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                      {invoice.date ? new Date(invoice.date).toLocaleDateString().toUpperCase() : "N/A"}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => handleEditInvoice(invoice)}
                        className="aeonik-mono"
                        style={{
                          padding: "8px 16px",
                          background: "transparent",
                          border: "1px solid #39FF14",
                          color: "#39FF14",
                          fontSize: "11px",
                          cursor: "pointer",
                          borderRadius: "0px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent"
                        }}
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => {
                          playClickSound()
                          handleDeleteInvoice(invoice.id || invoice._id)
                        }}
                        disabled={deletingInvoiceId === (invoice.id || invoice._id)}
                        className="aeonik-mono"
                        style={{
                          padding: "8px 16px",
                          background: deletingInvoiceId === (invoice.id || invoice._id) ? "rgba(255, 107, 107, 0.3)" : "transparent",
                          border: "1px solid #FF6B6B",
                          color: "#FF6B6B",
                          fontSize: "11px",
                          cursor: deletingInvoiceId === (invoice.id || invoice._id) ? "not-allowed" : "pointer",
                          borderRadius: "0px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (deletingInvoiceId !== (invoice.id || invoice._id)) {
                            e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (deletingInvoiceId !== (invoice.id || invoice._id)) {
                            e.currentTarget.style.background = "transparent"
                          }
                        }}
                      >
                        {deletingInvoiceId === (invoice.id || invoice._id) ? "DELETING..." : "DELETE"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
              })()}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
            <h3
              className="aeonik-mono"
              style={{
                fontSize: "clamp(20px, 2.5vw, 28px)",
                color: "#FFF",
                letterSpacing: "-1px",
                fontWeight: 600,
                margin: 0,
              }}
            >
              {editingInvoice ? `EDIT INVOICE - ${editingInvoice.invoiceNumber}` : "CREATE INVOICE"}
            </h3>
            {editingInvoice && (
              <button
                type="button"
                onClick={cancelEdit}
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
                CANCEL EDIT
              </button>
            )}
          </div>

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

      <form onSubmit={editingInvoice ? handleUpdateInvoice : handleSubmit}>
        {/* Client Selection */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            CLIENT CODE *
          </label>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "10px",
              lineHeight: "1.5"
            }}
          >
            ENTER THE 5-LETTER CLIENT CODE (E.G., ABCDE). CLIENT DETAILS WILL BE DISPLAYED BELOW WHEN FOUND.
          </p>
          <Input
            value={clientCode}
            onChange={(e) => handleClientCodeChange(e.target.value)}
            placeholder="ABCDE"
            maxLength={5}
            style={{
              textTransform: "uppercase",
              letterSpacing: "2px",
              fontSize: "16px",
              fontFamily: "AeonikMono-Regular, monospace",
            }}
            required
          />
          {fetchingClient && (
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "8px" }}>
              FETCHING CLIENT...
            </p>
          )}
          {clientCodeError && (
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "#FF6B6B", marginTop: "8px" }}>
              {clientCodeError}
            </p>
          )}
          {selectedClient && (
            <div
              className="aeonik-mono"
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "rgba(57, 255, 20, 0.05)",
                border: "1px solid rgba(57, 255, 20, 0.3)",
                fontSize: "13px",
              }}
            >
              <div style={{ marginBottom: "8px", color: "#39FF14", fontWeight: 600 }}>
                CLIENT FOUND
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "rgba(255, 255, 255, 0.9)" }}>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>NAME:</span> {selectedClient.name}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>EMAIL:</span> {selectedClient.email}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>CODE:</span> {selectedClient.clientCode}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>STATUS:</span> {selectedClient.status.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Project Selection (Required) */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            SELECT PROJECT *
          </label>
          <p
            className="aeonik-mono"
            style={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.6)",
              marginBottom: "15px",
              lineHeight: "1.5"
            }}
          >
            {selectedClient 
              ? "SELECT A PROJECT FROM THE DROPDOWN OR ENTER THE 6-CHARACTER PROJECT CODE MANUALLY."
              : "FIRST SELECT A CLIENT TO SEE THEIR PROJECTS."}
          </p>
          
          {/* Project Dropdown - only show when client is selected */}
          {selectedClient && (
            <div style={{ marginBottom: "15px" }}>
              {fetchingClientProjects ? (
                <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  LOADING PROJECTS...
                </p>
              ) : clientProjects.length > 0 ? (
                <select
                  value={projectCode || ""}
                  onChange={(e) => {
                    const selectedCode = e.target.value
                    const project = clientProjects.find(p => p.projectCode === selectedCode)
                    if (project) {
                      setSelectedProject(project)
                      setProjectCode(project.projectCode)
                      setProjectCodeError(null)
                    } else {
                      setSelectedProject(null)
                      setProjectCode("")
                    }
                    playClickSound()
                  }}
                  className="aeonik-mono"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="" style={{ background: "#1a1a1a" }}>-- SELECT A PROJECT --</option>
                  {clientProjects.map((project) => (
                    <option 
                      key={project.id || project.projectCode} 
                      value={project.projectCode}
                      style={{ background: "#1a1a1a" }}
                    >
                      {project.projectCode} - {project.name} ({project.category?.toUpperCase() || 'N/A'})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                  NO PROJECTS FOUND FOR THIS CLIENT. CREATE A PROJECT FIRST OR ENTER CODE MANUALLY.
                </p>
              )}
            </div>
          )}

          {/* Manual project code input */}
          <div style={{ marginTop: selectedClient ? "10px" : "0" }}>
            {selectedClient && (
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                OR ENTER PROJECT CODE MANUALLY:
              </label>
            )}
            <Input
              value={projectCode}
              onChange={(e) => handleProjectCodeChange(e.target.value)}
              placeholder={selectedClient ? "E.G., IOIOSD" : "SELECT CLIENT FIRST"}
              maxLength={6}
              disabled={!selectedClient}
              style={{
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "16px",
                fontFamily: "AeonikMono-Regular, monospace",
                opacity: selectedClient ? 1 : 0.5,
              }}
              required
            />
          </div>
          
          {fetchingProject && (
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)", marginTop: "8px" }}>
              FETCHING PROJECT...
            </p>
          )}
          {projectCodeError && (
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "#FF6B6B", marginTop: "8px" }}>
              {projectCodeError}
            </p>
          )}
          {selectedProject && (
            <div
              className="aeonik-mono"
              style={{
                marginTop: "15px",
                padding: "15px",
                background: "rgba(57, 255, 20, 0.05)",
                border: "1px solid rgba(57, 255, 20, 0.3)",
                fontSize: "13px",
              }}
            >
              <div style={{ marginBottom: "8px", color: "#39FF14", fontWeight: 600 }}>
                PROJECT SELECTED
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", color: "rgba(255, 255, 255, 0.9)" }}>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>NAME:</span> {selectedProject.name}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>CODE:</span> {selectedProject.projectCode}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>CATEGORY:</span> {selectedProject.category.toUpperCase()}
                </div>
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>STATUS:</span> {selectedProject.status.toUpperCase()}
                </div>
                {selectedProject.budget && (
                  <div>
                    <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>BUDGET:</span> {selectedProject.budget}
                  </div>
                )}
                <div>
                  <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>PROGRESS:</span> {selectedProject.progress}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
          <div>
            <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
              DATE *
            </label>
            <DatePicker
              value={date}
              onChange={(value) => {
                setDate(value)
                playClickSound()
              }}
            />
          </div>
          <div>
            <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
              DUE DATE *
            </label>
            <DatePicker
              value={dueDate}
              onChange={(value) => {
                setDueDate(value)
                playClickSound()
              }}
            />
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: "30px" }}>
          <h4 className="aeonik-mono" style={{ fontSize: "18px", marginBottom: "10px" }}>BILL TO *</h4>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "15px",
              lineHeight: "1.5"
            }}
          >
            ENTER THE CLIENT'S BILLING INFORMATION. THIS INFORMATION WILL APPEAR ON THE INVOICE SENT TO THE CLIENT.
          </p>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "11px", 
              color: "rgba(255, 255, 255, 0.5)", 
              marginBottom: "10px",
              lineHeight: "1.4"
            }}
          >
            FILL IN THE CLIENT'S NAME, EMAIL, AND BILLING ADDRESS. GST NUMBER IS OPTIONAL.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                NAME *
              </label>
              <Input
                value={billTo.name}
                onChange={(e) => setBillTo({ ...billTo, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                EMAIL *
              </label>
              <Input
                type="email"
                value={billTo.email}
                onChange={(e) => setBillTo({ ...billTo, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ADDRESS *
              </label>
              <Input
                value={billTo.address}
                onChange={(e) => setBillTo({ ...billTo, address: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                GST NUMBER
              </label>
              <Input
                value={billTo.gstNumber}
                onChange={(e) => setBillTo({ ...billTo, gstNumber: e.target.value })}
                placeholder="OPTIONAL"
              />
            </div>
          </div>
        </div>

        {/* Company Address */}
        <div style={{ marginBottom: "30px" }}>
          <h4 className="aeonik-mono" style={{ fontSize: "18px", marginBottom: "10px" }}>COMPANY ADDRESS *</h4>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "15px",
              lineHeight: "1.5"
            }}
          >
            ENTER YOUR COMPANY'S BILLING ADDRESS. THIS WILL APPEAR AS THE SENDER'S ADDRESS ON THE INVOICE.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                COMPANY NAME *
              </label>
              <Input
                value={companyAddress.companyName}
                onChange={(e) => setCompanyAddress({ ...companyAddress, companyName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                EMAIL *
              </label>
              <Input
                type="email"
                value={companyAddress.email}
                onChange={(e) => setCompanyAddress({ ...companyAddress, email: e.target.value })}
                required
              />
            </div>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
              STREET ADDRESS *
            </label>
            <Input
              value={companyAddress.street}
              onChange={(e) => setCompanyAddress({ ...companyAddress, street: e.target.value })}
              required
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                CITY *
              </label>
              <Input
                value={companyAddress.city}
                onChange={(e) => setCompanyAddress({ ...companyAddress, city: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                STATE *
              </label>
              <Input
                value={companyAddress.state}
                onChange={(e) => setCompanyAddress({ ...companyAddress, state: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ZIP *
              </label>
              <Input
                value={companyAddress.zip}
                onChange={(e) => setCompanyAddress({ ...companyAddress, zip: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                COUNTRY *
              </label>
              <Input
                value={companyAddress.country}
                onChange={(e) => setCompanyAddress({ ...companyAddress, country: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* Items */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
            <div>
              <h4 className="aeonik-mono" style={{ fontSize: "18px", marginBottom: "10px" }}>ITEMS *</h4>
              <p 
                className="aeonik-mono" 
                style={{ 
                  fontSize: "12px", 
                  color: "rgba(255, 255, 255, 0.6)", 
                  lineHeight: "1.5"
                }}
              >
                ADD LINE ITEMS FOR PRODUCTS OR SERVICES BEING BILLED. EACH ITEM REQUIRES A TITLE, PRICE, AND QUANTITY.
              </p>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="aeonik-mono"
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "1px solid #39FF14",
                color: "#39FF14",
                fontSize: "12px",
                cursor: "pointer",
                borderRadius: "0px",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              ADD ITEM
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {items.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr auto",
                  gap: "15px",
                  alignItems: "start",
                  padding: "15px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <div>
                  <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                    TITLE *
                  </label>
                  <Input
                    value={item.title}
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                    PRICE *
                  </label>
                  <Input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                    QUANTITY *
                  </label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                    SUBTOTAL
                  </label>
                  <div className="aeonik-mono" style={{ padding: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#39FF14", fontSize: "14px" }}>
                    ${item.subtotal.toFixed(2)}
                  </div>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="aeonik-mono"
                    style={{
                      padding: "12px",
                      background: "transparent",
                      border: "1px solid #FF6B6B",
                      color: "#FF6B6B",
                      fontSize: "12px",
                      cursor: "pointer",
                      borderRadius: "0px",
                      letterSpacing: "1px",
                    }}
                  >
                    REMOVE
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div style={{ marginBottom: "30px" }}>
          <h4 className="aeonik-mono" style={{ fontSize: "18px", marginBottom: "10px" }}>TOTALS</h4>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "15px",
              lineHeight: "1.5"
            }}
          >
            ENTER DISCOUNT AND TAX AMOUNTS (SGST, CGST). THE TOTAL WILL BE CALCULATED AUTOMATICALLY.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                DISCOUNT
              </label>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                SGST
              </label>
              <Input
                type="number"
                value={sgst}
                onChange={(e) => setSgst(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                CGST
              </label>
              <Input
                type="number"
                value={cgst}
                onChange={(e) => setCgst(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div style={{ padding: "15px", background: "rgba(57, 255, 20, 0.1)", border: "1px solid #39FF14" }}>
            <div className="aeonik-mono" style={{ fontSize: "18px", color: "#39FF14", fontWeight: 600 }}>
              TOTAL: ${calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        <div style={{ marginBottom: "30px" }}>
          <label className="aeonik-mono" style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            PAYMENT TERMS
          </label>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "10px",
              lineHeight: "1.5"
            }}
          >
            OPTIONAL: SPECIFY PAYMENT TERMS, SUCH AS DUE DATE REQUIREMENTS OR PAYMENT SCHEDULES.
          </p>
          <textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="aeonik-mono"
            style={{
              width: "100%",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#FFF",
              fontSize: "14px",
              borderRadius: "0px",
              minHeight: "100px",
              resize: "vertical",
            }}
            placeholder="e.g., 50% ADVANCE PAYMENT ($XXXX) TO BE MADE BEFORE THE WORK COMMENCES..."
          />
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: "30px" }}>
          <h4 className="aeonik-mono" style={{ fontSize: "18px", marginBottom: "10px" }}>PAYMENT METHOD (OPTIONAL)</h4>
          <p 
            className="aeonik-mono" 
            style={{ 
              fontSize: "12px", 
              color: "rgba(255, 255, 255, 0.6)", 
              marginBottom: "15px",
              lineHeight: "1.5"
            }}
          >
            OPTIONAL: ENTER BANK ACCOUNT DETAILS OR OTHER PAYMENT METHOD INFORMATION FOR WIRE TRANSFERS OR DIRECT DEPOSITS.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                BANK NAME
              </label>
              <Input
                value={paymentMethod.bankName}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, bankName: e.target.value })}
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ACCOUNT HOLDER NAME
              </label>
              <Input
                value={paymentMethod.accountHolderName}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, accountHolderName: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ACCOUNT NUMBER
              </label>
              <Input
                value={paymentMethod.accountNumber}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, accountNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ROUTING NUMBER
              </label>
              <Input
                value={paymentMethod.routingNumber}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, routingNumber: e.target.value })}
              />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                SWIFT CODE
              </label>
              <Input
                value={paymentMethod.swiftCode}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, swiftCode: e.target.value })}
              />
            </div>
            <div>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
                ACCOUNT TYPE
              </label>
              <Input
                value={paymentMethod.accountType}
                onChange={(e) => setPaymentMethod({ ...paymentMethod, accountType: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "12px", color: "rgba(255, 255, 255, 0.8)" }}>
              BRANCH ADDRESS
            </label>
            <Input
              value={paymentMethod.branchAddress}
              onChange={(e) => setPaymentMethod({ ...paymentMethod, branchAddress: e.target.value })}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ display: "flex", gap: "15px" }}>
          <button
            type="submit"
            disabled={submitting}
            className="aeonik-mono"
            style={{
              padding: "15px 30px",
              background: submitting ? "rgba(57, 255, 20, 0.3)" : "transparent",
              border: "1px solid #39FF14",
              color: "#39FF14",
              fontSize: "14px",
              cursor: submitting ? "not-allowed" : "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                e.currentTarget.style.background = "transparent"
              }
            }}
          >
            {submitting 
              ? (editingInvoice ? "UPDATING..." : "CREATING...") 
              : (editingInvoice ? "UPDATE INVOICE" : "CREATE INVOICE")}
          </button>
          {editingInvoice && (
            <button
              type="button"
              onClick={cancelEdit}
              className="aeonik-mono"
              style={{
                padding: "15px 30px",
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                color: "#FFF",
                fontSize: "14px",
                cursor: "pointer",
                borderRadius: "0px",
                letterSpacing: "1px",
                textTransform: "uppercase",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.5)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)"
              }}
            >
              CANCEL
            </button>
          )}
        </div>
      </form>
        </div>
      )}
    </div>
  )
}

export default BillsAdmin
