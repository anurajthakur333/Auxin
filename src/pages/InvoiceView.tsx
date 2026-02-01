import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL, getAuthToken } from "../lib/apiConfig"

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
}

const InvoiceView = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const navigate = useNavigate()
  const invoiceRef = useRef<HTMLDivElement>(null)
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) {
        setError("No invoice ID provided")
        setLoading(false)
        return
      }

      const token = getAuthToken()
      if (!token) {
        setError("Please login to view invoice")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/invoices/my-invoices`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch invoice")
        }

        const data = await response.json()
        console.log("Invoices data:", data)
        console.log("Looking for invoice ID:", invoiceId)
        
        // Check both id and _id for compatibility
        const foundInvoice = data.invoices?.find((inv: any) => 
          inv.id === invoiceId || inv._id === invoiceId
        )
        
        console.log("Found invoice:", foundInvoice)
        
        if (foundInvoice) {
          setInvoice({
            ...foundInvoice,
            id: foundInvoice.id || foundInvoice._id
          })
        } else {
          setError("Invoice not found")
        }
      } catch (err) {
        console.error("Error fetching invoice:", err)
        setError("Failed to load invoice")
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString("en-US", { month: "long" })
    const year = date.getFullYear()
    const daySuffix = day === 1 || day === 21 || day === 31 ? "ST" : day === 2 || day === 22 ? "ND" : day === 3 || day === 23 ? "RD" : "TH"
    return `${day}${daySuffix} ${month.toUpperCase()}, ${year}`
  }

  const handlePay = async () => {
    if (!invoice) return
    
    const token = getAuthToken()
    if (!token) {
      alert("Please login to pay")
      return
    }

    try {
      setPaying(true)
      const response = await fetch(`${API_BASE_URL}/api/paypal/create-invoice-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: invoice.total,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment")
      }

      const data = await response.json()
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      }
    } catch (err) {
      console.error("Payment error:", err)
      alert("Failed to initiate payment. Please try again.")
    } finally {
      setPaying(false)
    }
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current || !invoice) return

    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Inter', sans-serif;
                background: #000;
                color: #39FF14;
                padding: 40px;
              }
              .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                background: #000;
                color: #39FF14;
              }
              @media print {
                body { padding: 20px; }
              }
            </style>
          </head>
          <body>
            ${invoiceRef.current.innerHTML}
          </body>
        </html>
      `
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 250)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try printing the page instead.")
    }
  }

  if (loading) {
    return (
      <div 
        className="aeonik-regular"
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#39FF14",
        }}
      >
        LOADING INVOICE...
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div 
        className="aeonik-regular"
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          color: "#FF6B6B",
        }}
      >
        <div>{error || "Invoice not found"}</div>
        <button
          onClick={() => navigate("/dashboard?tab=billing")}
          className="aeonik-regular"
          style={{
            padding: "12px 24px",
            background: "#39FF14",
            color: "#000",
            border: "none",
            cursor: "pointer",
          }}
        >
          BACK TO BILLING
        </button>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "rgb(30, 30, 30)",
      backdropFilter: "blur(10px)",
      padding: "40px",
      paddingBottom: "120px",
      overflow: "hidden",
    }}>
      <div
        ref={invoiceRef}
        className="aeonik-regular"
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#000",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1 className="aeonik-regular"
            style={{
              fontSize: "clamp(90px, 18vw, 207px)",
              color: "#39FF14",
              fontWeight: 700,
              letterSpacing: "-4px",
              lineHeight: "0.9",
              marginBottom: "30px",
              textAlign: "center",
              fontFamily: "",
            }}
          >
            INVOICE
          </h1>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ fontSize: "17px", color: "#FFF", fontFamily: "",lineHeight: ""}}>
          INVOICE NO : <span style={{ color: "#39FF14" }}>#{invoice.invoiceNumber}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "17px", color: "#FFF", marginBottom: "8px", fontFamily: "" }}>
                DATE : <span style={{ color: "#39FF14" }}>{formatDate(invoice.date)}</span>
              </div>
              <div style={{ fontSize: "17px", color: "#FFF", fontFamily: "" }}>
                DUE : <span style={{ color: "#39FF14" }}>{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Addresses */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "325px", marginBottom: "40px" }}>
          <div>
            <div style={{ fontSize: "17px", color: "#FFF", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "" }}>
              BILL TO :
            </div>
            <div style={{ fontSize: "17px", color: "#39FF14", lineHeight: "1.3", fontFamily: "" }}>
              <div>{invoice.billTo.name}</div>
              <div>{invoice.billTo.email}</div>
              <div>{invoice.billTo.address}</div>
              {invoice.billTo.gstNumber && <div>GST Number: {invoice.billTo.gstNumber}</div>}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "17px", color: "#FFF", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "" }}>
              ADDRESS :
            </div>
            <div style={{ fontSize: "17px", color: "#39FF14", lineHeight: "1.8", fontFamily: "" }}>
              <div>{invoice.companyAddress.companyName}</div>
              <div>{invoice.companyAddress.email}</div>
              <div>{invoice.companyAddress.street}</div>
              <div>{invoice.companyAddress.city}, {invoice.companyAddress.state} {invoice.companyAddress.zip}</div>
              <div>{invoice.companyAddress.country}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "30px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead className="aeonik-regular">
              <tr>
                <th style={{ textAlign: "left", padding: "px", borderBottom: "1px solid #39FF14", color: "#FFF", fontSize: "17px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "normal" }}>
                  DESCRIPTION
                </th>
                <th style={{ textAlign: "right", padding: "15px", borderBottom: "1px solid #39FF14", color: "#FFF", fontSize: "17px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "normal" }}>
                  PRICE
                </th>
                <th style={{ textAlign: "right", padding: "15px", borderBottom: "1px solid #39FF14", color: "#FFF", fontSize: "17px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "normal" }}>
                  QUANTITY
                </th>
                <th style={{ textAlign: "right", padding: "0px", borderBottom: "1px solid #39FF14", color: "#FFF", fontSize: "17px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "normal" }}>
                  SUBTOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "0px", borderBottom: "", color: "#FFF", fontSize: "17px", fontFamily: "" }}>
                    {index + 1}. {item.title}
                  </td>
                  <td style={{ padding: "15px", borderBottom: "", color: "#39FF14", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{ padding: "15px", borderBottom: "", color: "#FFF", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "0px", borderBottom: "", color: "#39FF14", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         
        </div>

        {/* Section with SVG Background extending outside container */}
        <div 
          style={{ 
            marginTop: "30px", 
            position: "relative",
          }}
        >
          {/* SVG Background - extends outside container to the left */}
          <img 
            src="/invoice.svg" 
            alt=""
            style={{
              position: "absolute",
              left: "-60px",
              top: "54px",
              height: "115%",
              minHeight: "500px",
              width: "auto",
              objectFit: "contain",
              objectPosition: "left center",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          
          {/* Totals Content */}
          <div style={{ position: "relative", zIndex: 1, marginLeft: "auto", maxWidth: "300px", padding: "40px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: "normal" }}>
                DISCOUNT
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14" }}>
                {invoice.discount}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: "normal" }}>
                SGST
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14" }}>
                {invoice.sgst}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: "normal" }}>
                CGST
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14" }}>
                {invoice.cgst}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", paddingTop: "20px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: 600 }}>
                TOTAL
              </span>
              <span style={{ fontSize: "20px", color: "#39FF14", fontWeight: 600 }}>
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div style={{ height: "1px", background: "#39FF14", position: "relative", zIndex: 1 }} />

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <div style={{ padding: "30px 0", position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "18px", color: "#FFF", lineHeight: "1.8" }}>
                {invoice.paymentTerms}
              </div>
            </div>
          )}

          {/* Payment Method */}
          {invoice.paymentMethod && Object.values(invoice.paymentMethod).some((v) => v) && (
            <div style={{ paddingTop: "20px", position: "relative", zIndex: 1 }}>
              <div style={{ fontSize: "22px", color: "#FFF", marginBottom: "20px", fontWeight: "normal" }}>
                PAYMENT METHOD :
              </div>
              <div style={{ fontSize: "17px", lineHeight: "1.8" }}>
                {invoice.paymentMethod.bankName && (
                  <div><span style={{ color: "#FFF" }}>BANK NAME:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.bankName}</span></div>
                )}
                {invoice.paymentMethod.accountHolderName && (
                  <div><span style={{ color: "#FFF" }}>ACCOUNT HOLDER NAME:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.accountHolderName}</span></div>
                )}
                {invoice.paymentMethod.accountNumber && (
                  <div><span style={{ color: "#FFF" }}>ACCOUNT NUMBER:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.accountNumber}</span></div>
                )}
                {invoice.paymentMethod.routingNumber && (
                  <div><span style={{ color: "#FFF" }}>ROUTING NUMBER:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.routingNumber}</span></div>
                )}
                {invoice.paymentMethod.swiftCode && (
                  <div><span style={{ color: "#FFF" }}>SWIFT CODE:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.swiftCode}</span></div>
                )}
                {invoice.paymentMethod.branchAddress && (
                  <div><span style={{ color: "#FFF" }}>BRANCH ADDRESS:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.branchAddress}</span></div>
                )}
                {invoice.paymentMethod.accountType && (
                  <div><span style={{ color: "#FFF" }}>ACCOUNT TYPE:</span> <span style={{ color: "#39FF14" }}>{invoice.paymentMethod.accountType}</span></div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div style={{ marginTop: "40px", textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              padding: "10px 30px",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "2px",
              background: invoice.status === "paid" ? "rgba(57, 255, 20, 0.2)" : invoice.status === "overdue" ? "rgba(255, 107, 107, 0.2)" : "rgba(255, 193, 7, 0.2)",
              color: invoice.status === "paid" ? "#39FF14" : invoice.status === "overdue" ? "#FF6B6B" : "#FFC107",
              border: `1px solid ${invoice.status === "paid" ? "#39FF14" : invoice.status === "overdue" ? "#FF6B6B" : "#FFC107"}`,
            }}
          >
            {invoice.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Fixed Action Buttons */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px",
          display: "flex",
          justifyContent: "center",
          gap: "15px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.95))",
          zIndex: 100,
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgb(60, 60, 60)",
        }}
      >
        <button
          onClick={() => navigate("/dashboard?tab=billing")}
          className="aeonik-regular"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            fontSize: "14px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          ← BACK
        </button>
        {invoice.status !== "paid" && (
          <button
            onClick={handlePay}
            disabled={paying}
            className="aeonik-regular"
            style={{
              padding: "12px 24px",
              background: "#39FF14",
              color: "#000",
              border: "none",
              fontSize: "14px",
              cursor: paying ? "not-allowed" : "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: paying ? 0.7 : 1,
            }}
          >
            {paying ? "PROCESSING..." : "PAY NOW"}
          </button>
        )}
        <button
          onClick={downloadPDF}
          className="aeonik-regular"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#39FF14",
            border: "1px solid #39FF14",
            fontSize: "14px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          DOWNLOAD PDF
        </button>
      </div>
    </div>
  )
}

export default InvoiceView
