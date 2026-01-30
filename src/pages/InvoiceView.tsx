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
      <div style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#39FF14",
        fontFamily: "AeonikMono-Regular, monospace",
      }}>
        LOADING INVOICE...
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        color: "#FF6B6B",
        fontFamily: "AeonikMono-Regular, monospace",
      }}>
        <div>{error || "Invoice not found"}</div>
        <button
          onClick={() => navigate("/dashboard?tab=billing")}
          style={{
            padding: "12px 24px",
            background: "#39FF14",
            color: "#000",
            border: "none",
            cursor: "pointer",
            fontFamily: "AeonikMono-Regular, monospace",
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
      background: "#000",
      padding: "40px",
      paddingBottom: "120px",
    }}>
      <div
        ref={invoiceRef}
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#000",
          padding: "60px",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontSize: "clamp(90px, 18vw, 205px)",
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
            &nbsp; INVOICE NO : <span style={{ color: "#39FF14" }}>#{invoice.invoiceNumber}</span>
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
            <thead className="aeonik-light">
              <tr>
                <th style={{ textAlign: "left", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "aeonik" }}>
                  DESCRIPTION
                </th>
                <th style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "" }}>
                  PRICE
                </th>
                <th style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "" }}>
                  QUANTITY
                </th>
                <th style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "15px", textTransform: "uppercase", letterSpacing: "1px", fontFamily: "" }}>
                  SUBTOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td style={{ padding: "15px", borderBottom: "", color: "#FFF", fontSize: "17px", fontFamily: "" }}>
                    {index + 1}. {item.title}
                  </td>
                  <td style={{ padding: "15px", borderBottom: "", color: "#39FF14", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td style={{ padding: "15px", borderBottom: "", color: "#FFF", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "15px", borderBottom: "", color: "#39FF14", fontSize: "17px", textAlign: "right", fontFamily: "" }}>
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         
        </div>

        {/* Totals with Background */}
        <div 
          style={{ 
            marginTop: "30px", 
            position: "relative",
            backgroundImage: "url('/invoie.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "40px",
            minHeight: "300px",
          }}
        >
          <div style={{ position: "relative", zIndex: 1, marginLeft: "auto", maxWidth: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: 600, fontFamily: "" }}>
                DISCOUNT
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14", fontFamily: "" }}>
                ${invoice.discount.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: 600, fontFamily: "" }}>
                SGST
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14", fontFamily: "" }}>
                ${invoice.sgst.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span style={{ fontSize: "17px", color: "#FFF", fontWeight: 600, fontFamily: "" }}>
                CGST
              </span>
              <span style={{ fontSize: "17px", color: "#39FF14", fontFamily: "" }}>
                ${invoice.cgst.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px", paddingTop: "20px", borderTop: "" }}>
                <span style={{ fontSize: "17px", color: "#FFF", fontFamily: "" }}>
                TOTAL
              </span>
              <span style={{ fontSize: "px", color: "#39FF14", fontFamily: "" }}>
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
        <div style={{ height: "2px", background: "#39FF14", marginTop: "0px" }} />

        {/* Payment Terms */}
        {invoice.paymentTerms && (
          <div style={{ marginTop: "40px", padding: "20px", background: "rgba(57, 255, 20, 0.05)", borderLeft: "4px solid #39FF14" }}>
            <div style={{ fontSize: "17px", color: "#FFF", lineHeight: "1.8", fontFamily: "" }}>
              * {invoice.paymentTerms}
            </div>
          </div>
        )}

        {/* Payment Method */}
        {invoice.paymentMethod && Object.values(invoice.paymentMethod).some((v) => v) && (
          <div style={{ marginTop: "40px" }}>
            <div style={{ fontSize: "14px", color: "#FFF", marginBottom: "20px", fontWeight: 600, fontFamily: "AeonikMono-Regular, monospace" }}>
              PAYMENT METHOD :
            </div>
            <div style={{ fontSize: "14px", color: "#39FF14", lineHeight: "1.8", fontFamily: "AeonikMono-Regular, monospace" }}>
              {invoice.paymentMethod.bankName && <div>BANK NAME: {invoice.paymentMethod.bankName}</div>}
              {invoice.paymentMethod.accountHolderName && <div>ACCOUNT HOLDER NAME: {invoice.paymentMethod.accountHolderName}</div>}
              {invoice.paymentMethod.accountNumber && <div>ACCOUNT NUMBER: {invoice.paymentMethod.accountNumber}</div>}
              {invoice.paymentMethod.routingNumber && <div>ROUTING NUMBER: {invoice.paymentMethod.routingNumber}</div>}
              {invoice.paymentMethod.swiftCode && <div>SWIFT CODE: {invoice.paymentMethod.swiftCode}</div>}
              {invoice.paymentMethod.branchAddress && <div>BRANCH ADDRESS: {invoice.paymentMethod.branchAddress}</div>}
              {invoice.paymentMethod.accountType && <div>ACCOUNT TYPE: {invoice.paymentMethod.accountType}</div>}
            </div>
          </div>
        )}

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
              fontFamily: "AeonikMono-Regular, monospace",
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
        }}
      >
        <button
          onClick={() => navigate("/dashboard?tab=billing")}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            fontSize: "14px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "AeonikMono-Regular, monospace",
          }}
        >
          ← BACK
        </button>
        {invoice.status !== "paid" && (
          <button
            onClick={handlePay}
            disabled={paying}
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
              fontFamily: "AeonikMono-Regular, monospace",
              opacity: paying ? 0.7 : 1,
            }}
          >
            {paying ? "PROCESSING..." : "PAY NOW"}
          </button>
        )}
        <button
          onClick={downloadPDF}
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#39FF14",
            border: "1px solid #39FF14",
            fontSize: "14px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "AeonikMono-Regular, monospace",
          }}
        >
          DOWNLOAD PDF
        </button>
      </div>
    </div>
  )
}

export default InvoiceView
