import { useState } from "react"

interface Invoice {
  id: string
  invoiceNumber: string
  amount: string
  status: "paid" | "pending" | "overdue"
  dueDate: string
  issueDate: string
  description: string
}

interface PaymentMethod {
  id: string
  type: "card" | "bank"
  last4: string
  brand?: string
  expiry?: string
}

const Billing = () => {
  const [invoices] = useState<Invoice[]>([
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      amount: "$15,000",
      status: "paid",
      dueDate: "2024-01-15",
      issueDate: "2024-01-01",
      description: "WEBSITE REDESIGN PROJECT",
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      amount: "$8,000",
      status: "pending",
      dueDate: "2024-02-28",
      issueDate: "2024-02-10",
      description: "BRAND IDENTITY PROJECT",
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      amount: "$12,000",
      status: "overdue",
      dueDate: "2024-01-20",
      issueDate: "2024-01-05",
      description: "MARKETING CAMPAIGN PROJECT",
    },
  ])

  const [paymentMethods] = useState<PaymentMethod[]>([
    { id: "1", type: "card", last4: "4242", brand: "VISA", expiry: "12/25" },
    { id: "2", type: "bank", last4: "1234" },
  ])

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

      {/* Payment Methods */}
      <div style={{ marginBottom: "40px" }}>
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
          PAYMENT METHODS
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "20px",
                borderRadius: "0px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.borderColor = "#39FF14"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)"
              }}
            >
              <div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", marginBottom: "5px" }}>
                  {method.type === "card" ? `${method.brand} •••• ${method.last4}` : `BANK ACCOUNT •••• ${method.last4}`}
                </div>
                {method.expiry && (
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    EXPIRES {method.expiry}
                  </div>
                )}
              </div>
              <button
                className="aeonik-mono"
                style={{
                  fontSize: "12px",
                  color: "#FF6B6B",
                  background: "transparent",
                  border: "1px solid #FF6B6B",
                  padding: "8px 16px",
                  borderRadius: "0px",
                  cursor: "pointer",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 107, 107, 0.1)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>
      </div>

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
          {invoices.map((invoice) => (
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
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                  gap: "20px",
                  alignItems: "center",
                }}
              >
                <div>
                  <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", marginBottom: "5px" }}>
                    {invoice.invoiceNumber}
                  </div>
                  <div className="aeonik-mono" style={{ fontSize: "12px", color: "rgba(255, 255, 255, 0.5)" }}>
                    {invoice.description}
                  </div>
                </div>
                <div className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14", fontWeight: 600 }}>
                  {invoice.amount}
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
                  {new Date(invoice.issueDate).toLocaleDateString().toUpperCase()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Billing
