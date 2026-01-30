import { useState, useEffect } from "react"
import { API_BASE_URL, getAuthToken } from "../../../lib/apiConfig"
import InvoicePDF from "../../../components/InvoicePDF"
import Input from "../../../components/ui/Input"

interface BillingInfo {
  phone?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zip?: string
  gstNumber?: string
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
  gstNumber?: string
}

interface PaymentMethod {
  bankName?: string
  accountHolderName?: string
  accountNumber?: string
  routingNumber?: string
  swiftCode?: string
  branchAddress?: string
  accountType?: string
}

interface Invoice {
  id: string
  invoiceNumber: string
  date: string
  dueDate: string
  billTo: ClientAddress
  companyAddress: CompanyAddress
  items: InvoiceItem[]
  discount: number
  sgst: number
  cgst: number
  total: number
  paymentTerms?: string
  paymentMethod?: PaymentMethod
  status: "pending" | "paid" | "overdue"
  paypalOrderId?: string
}

const Billing = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null)
  
  // Billing info state
  const [billingInfo, setBillingInfo] = useState<BillingInfo>({})
  const [billingLoading, setBillingLoading] = useState(false)
  const [showBillingForm, setShowBillingForm] = useState(false)

  useEffect(() => {
    fetchInvoices()
    fetchBillingInfo()
    
    // Check if returning from PayPal payment
    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const invoiceId = urlParams.get('invoiceId')
      const orderId = urlParams.get('token') || urlParams.get('orderId')
      
      // If we have payment params, we're returning from PayPal
      // PaymentSuccess page will handle the capture, but we should refresh invoices
      if (invoiceId || orderId) {
        // Small delay to let PaymentSuccess handle first
        setTimeout(() => {
          fetchInvoices()
        }, 2000)
      }
    }
    
    checkPaymentReturn()
  }, [])

  const fetchBillingInfo = async () => {
    try {
      const token = getAuthToken()
      if (!token) return

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/user/billing-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        const info = data.billingInfo || {}
        setBillingInfo(info)
        
        // Check if billing info is empty - if so, show the form
        const hasBillingInfo = info.phone || info.address || info.city || info.state || info.country || info.zip
        setShowBillingForm(!hasBillingInfo)
      } else {
        // No billing info found, show the form
        setShowBillingForm(true)
      }
    } catch (err) {
      console.error("Error fetching billing info:", err)
      // On error, show the form so user can enter info
      setShowBillingForm(true)
    }
  }

  const saveBillingInfo = async () => {
    try {
      setBillingLoading(true)
      setError(null)
      setSuccess(null)

      const token = getAuthToken()
      if (!token) {
        setError("Authentication required")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/clients/user/billing-info`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(billingInfo),
      })

      if (!response.ok) {
        throw new Error("Failed to save billing info")
      }

      setSuccess("Billing information saved successfully!")
      setShowBillingForm(false) // Collapse form after successful save
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error("Error saving billing info:", err)
      setError(err instanceof Error ? err.message : "Failed to save billing info")
    } finally {
      setBillingLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        setError("Authentication required")
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/invoices/my-invoices`, {
        headers: {
          Authorization: `Bearer ${token}`,
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
      setLoading(false)
    }
  }

  const handlePayInvoice = async (invoice: Invoice) => {
    try {
      setPayingInvoiceId(invoice.id)

      const token = getAuthToken()
      if (!token) {
        setError("Authentication required")
        return
      }

      // Create PayPal order for invoice
      const response = await fetch(`${API_BASE_URL}/api/paypal/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: invoice.total,
          description: `Invoice ${invoice.invoiceNumber}`,
          invoiceId: invoice.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to create payment order" }))
        throw new Error(errorData.error || "Failed to create payment order")
      }

      const data = await response.json()

      if (data.approvalUrl) {
        // Store invoice ID for later use
        localStorage.setItem("pendingInvoiceId", invoice.id)
        localStorage.setItem("pendingOrderId", data.orderId)

        // Redirect to PayPal
        window.location.href = data.approvalUrl
      } else {
        throw new Error("No approval URL received")
      }
    } catch (err) {
      console.error("Error initiating payment:", err)
      setError(err instanceof Error ? err.message : "Failed to initiate payment")
      setPayingInvoiceId(null)
    }
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

  const stats = {
    total: invoices.length,
    paid: invoices.filter((i) => i.status === "paid").length,
    pending: invoices.filter((i) => i.status === "pending").length,
    overdue: invoices.filter((i) => i.status === "overdue").length,
  }

  return (
    <>
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
        BILLING
      </h3>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        {[
          { label: "TOTAL INVOICES", value: stats.total, color: "#39FF14" },
          { label: "PAID", value: stats.paid, color: "#39FF14" },
          { label: "PENDING", value: stats.pending, color: "#FFD700" },
          { label: "OVERDUE", value: stats.overdue, color: "#FF6B6B" },
        ].map((stat, index) => (
          <div
            key={index}
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "25px",
              borderRadius: "0px",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = stat.color
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
            }}
          >
            <div
              className="aeonik-mono"
              style={{
                fontSize: "clamp(32px, 4vw, 48px)",
                color: stat.color,
                fontWeight: 600,
                marginBottom: "10px",
                letterSpacing: "-2px",
              }}
            >
              {stat.value}
            </div>
            <div
              className="aeonik-mono"
              style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", letterSpacing: "1px" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Billing Information Section */}
      <div style={{ marginBottom: "40px" }}>
        <h4
          className="aeonik-mono"
          style={{
            fontSize: "clamp(18px, 2vw, 24px)",
            color: "#FFF",
            letterSpacing: "-1px",
            fontWeight: 600,
            marginBottom: "20px",
          }}
        >
          BILLING INFORMATION
        </h4>

        {showBillingForm && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.03)",
              border: `1px solid ${!(billingInfo.phone || billingInfo.address || billingInfo.country) ? "#FFD700" : "rgba(255, 255, 255, 0.1)"}`,
              padding: "25px",
                borderRadius: "0px",
            }}
          >
            {!(billingInfo.phone || billingInfo.address || billingInfo.country) && (
              <div 
                className="aeonik-mono" 
                style={{ 
                  fontSize: "12px", 
                  color: "#FFD700", 
                  marginBottom: "15px",
                  padding: "10px 15px",
                  background: "rgba(255, 215, 0, 0.1)",
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                }}
              >
                ⚠️ PLEASE COMPLETE YOUR BILLING INFORMATION. THIS IS REQUIRED FOR INVOICES.
              </div>
            )}
            <p className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "20px" }}>
              {!(billingInfo.phone || billingInfo.address || billingInfo.country) 
                ? "FILL IN YOUR BILLING DETAILS BELOW. THIS INFORMATION WILL APPEAR ON YOUR INVOICES."
                : "UPDATE YOUR BILLING DETAILS. THIS INFORMATION WILL BE USED FOR INVOICES."}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  PHONE NUMBER
                </label>
                <Input
                  value={billingInfo.phone || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  GST NUMBER
                </label>
                <Input
                  value={billingInfo.gstNumber || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, gstNumber: e.target.value })}
                  placeholder="OPTIONAL"
                />
              </div>
            </div>

            <div style={{ marginTop: "20px" }}>
              <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                ADDRESS
              </label>
              <Input
                value={billingInfo.address || ""}
                onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                placeholder="Street address"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginTop: "20px" }}>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  CITY
                </label>
                <Input
                  value={billingInfo.city || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  STATE / PROVINCE
                </label>
                <Input
                  value={billingInfo.state || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, state: e.target.value })}
                  placeholder="State"
                />
                </div>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  ZIP / POSTAL CODE
                </label>
                <Input
                  value={billingInfo.zip || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, zip: e.target.value })}
                  placeholder="12345"
                />
                  </div>
              <div>
                <label className="aeonik-mono" style={{ display: "block", marginBottom: "8px", fontSize: "11px", color: "rgba(255, 255, 255, 0.6)" }}>
                  COUNTRY
                </label>
                <Input
                  value={billingInfo.country || ""}
                  onChange={(e) => setBillingInfo({ ...billingInfo, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
            </div>

            <div style={{ marginTop: "25px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={saveBillingInfo}
                disabled={billingLoading}
                className="aeonik-mono"
                style={{
                  padding: "12px 24px",
                  background: billingLoading ? "rgba(57, 255, 20, 0.3)" : "rgba(57, 255, 20, 0.1)",
                  border: "1px solid #39FF14",
                  color: "#39FF14",
                  fontSize: "12px",
                  cursor: billingLoading ? "not-allowed" : "pointer",
                  borderRadius: "0px",
                  letterSpacing: "1px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  if (!billingLoading) {
                    e.currentTarget.style.background = "rgba(57, 255, 20, 0.2)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!billingLoading) {
                    e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
                  }
                }}
              >
                {billingLoading ? "SAVING..." : "SAVE BILLING INFO"}
              </button>
            </div>
          </div>
        )}

        {/* Show summary if form is hidden */}
        {!showBillingForm && (billingInfo.phone || billingInfo.address || billingInfo.country) && (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              padding: "20px",
              borderRadius: "0px",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
              {billingInfo.phone && (
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>PHONE</div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>{billingInfo.phone}</div>
                </div>
              )}
              {billingInfo.address && (
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>ADDRESS</div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>
                    {billingInfo.address}
                    {billingInfo.city && `, ${billingInfo.city}`}
                    {billingInfo.state && `, ${billingInfo.state}`}
                    {billingInfo.zip && ` ${billingInfo.zip}`}
                  </div>
                </div>
              )}
              {billingInfo.country && (
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>COUNTRY</div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>{billingInfo.country}</div>
                </div>
              )}
              {billingInfo.gstNumber && (
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", marginBottom: "5px" }}>GST NUMBER</div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF" }}>{billingInfo.gstNumber}</div>
                </div>
              )}
            </div>
        </div>
        )}
      </div>

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

      {loading && (
        <div className="aeonik-mono" style={{ color: "#FFF", fontSize: "14px", marginBottom: "20px" }}>
          LOADING INVOICES...
        </div>
      )}

      {/* Invoices */}
      <div>
        <h4
          className="aeonik-mono"
          style={{
            fontSize: "clamp(18px, 2vw, 24px)",
            color: "#FFF",
            marginBottom: "20px",
            letterSpacing: "-1px",
            fontWeight: 600,
          }}
        >
          INVOICES
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {invoices.length === 0 && !loading ? (
            <div className="aeonik-mono" style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "14px", padding: "40px", textAlign: "center" }}>
              NO INVOICES FOUND
            </div>
          ) : (
            invoices.map((invoice) => (
            <div
              key={invoice.id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                borderRadius: "0px",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = getStatusColor(invoice.status)
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              }}
                onClick={() => setSelectedInvoice(invoice)}
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
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                      {invoice.items.length > 0 ? invoice.items[0].title : "INVOICE"}
                    </div>
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14", fontWeight: 600 }}>
                    ${invoice.total.toFixed(2)}
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
                  DUE: {new Date(invoice.dueDate).toLocaleDateString().toUpperCase()}
                </div>
                <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.6)" }}>
                    {new Date(invoice.date).toLocaleDateString().toUpperCase()}
                  </div>
                  <div>
                    {invoice.status !== "paid" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePayInvoice(invoice)
                        }}
                        disabled={payingInvoiceId === invoice.id}
                        className="aeonik-mono"
                        style={{
                          padding: "8px 16px",
                          background: payingInvoiceId === invoice.id ? "rgba(57, 255, 20, 0.3)" : "transparent",
                          border: "1px solid #39FF14",
                          color: "#39FF14",
                          fontSize: "11px",
                          cursor: payingInvoiceId === invoice.id ? "not-allowed" : "pointer",
                          borderRadius: "0px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          whiteSpace: "nowrap",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (payingInvoiceId !== invoice.id) {
                            e.currentTarget.style.background = "rgba(57, 255, 20, 0.1)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (payingInvoiceId !== invoice.id) {
                            e.currentTarget.style.background = "transparent"
                          }
                        }}
                      >
                        {payingInvoiceId === invoice.id ? "PROCESSING..." : "PAY NOW"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedInvoice && (
        <InvoicePDF
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onPay={selectedInvoice.status !== "paid" ? () => handlePayInvoice(selectedInvoice) : undefined}
        />
      )}
    </>
  )
}

export default Billing
