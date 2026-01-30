import { useRef, useEffect } from "react"

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

interface InvoicePDFProps {
  invoice: Invoice
  onClose: () => void
  onPay?: () => void
}

const InvoicePDF = ({ invoice, onClose, onPay }: InvoicePDFProps) => {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = "hidden"
    
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDate()
    const month = date.toLocaleString("en-US", { month: "long" })
    const year = date.getFullYear()
    const daySuffix = day === 1 || day === 21 || day === 31 ? "ST" : day === 2 || day === 22 ? "ND" : day === 3 || day === 23 ? "RD" : "TH"
    return `${day}${daySuffix} ${month.toUpperCase()}, ${year}`
  }

  const downloadPDF = async () => {
    if (!invoiceRef.current) return

    try {
      // Use html2pdf library or similar for PDF generation
      // For now, we'll use window.print() as a fallback
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
              .invoice-header {
                margin-bottom: 40px;
              }
              .invoice-title {
                font-size: 120px;
                font-weight: 700;
                color: #39FF14;
                margin-bottom: 30px;
                text-align: center;
                letter-spacing: -4px;
                line-height: 0.9;
              }
              .invoice-meta {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
              }
              .invoice-number {
                font-size: 14px;
                color: #FFF;
              }
              .invoice-number span {
                color: #39FF14;
              }
              .invoice-date {
                font-size: 14px;
                color: #FFF;
                text-align: right;
              }
              .invoice-date span {
                color: #39FF14;
              }
              .billing-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
              }
              .section-title {
                font-size: 12px;
                color: #FFF;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .section-content {
                font-size: 14px;
                color: #39FF14;
                line-height: 1.6;
              }
              .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
              }
              .items-table th {
                text-align: left;
                padding: 15px;
                border-bottom: 2px solid #39FF14;
                color: #FFF;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .items-table td {
                padding: 15px;
                border-bottom: 1px solid rgba(57, 255, 20, 0.3);
                color: #39FF14;
                font-size: 14px;
              }
              .totals-section {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px solid #39FF14;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
                color: #FFF;
              }
              .total-final {
                font-size: 18px;
                font-weight: 700;
                color: #39FF14;
                margin-top: 10px;
              }
              .payment-terms {
                margin-top: 30px;
                padding: 20px;
                background: rgba(57, 255, 20, 0.05);
                border-left: 4px solid #39FF14;
                font-size: 12px;
                color: #FFF;
                line-height: 1.6;
              }
              .payment-method {
                margin-top: 30px;
              }
              .payment-method-title {
                font-size: 14px;
                color: #FFF;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .payment-details {
                font-size: 12px;
                color: #39FF14;
                line-height: 1.8;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
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

  return (
    <>
      <style>
        {`
          .invoice-scroll-container {
            scrollbar-width: thin;
            scrollbar-color: #39FF14 rgba(0, 0, 0, 0.3);
          }
          .invoice-scroll-container::-webkit-scrollbar {
            width: 10px;
          }
          .invoice-scroll-container::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
          }
          .invoice-scroll-container::-webkit-scrollbar-thumb {
            background: #39FF14;
            border-radius: 5px;
          }
          .invoice-scroll-container::-webkit-scrollbar-thumb:hover {
            background: #2ecc10;
          }
        `}
      </style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 10000,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Backdrop */}
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
          }}
        />
        
        {/* Scrollable Content Area */}
        <div
          ref={modalRef}
          className="invoice-scroll-container"
          style={{
            position: "relative",
            flex: 1,
            overflowY: "scroll",
            overflowX: "hidden",
            padding: "40px",
            paddingBottom: "100px",
          }}
        >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            background: "#000",
            padding: "60px",
            position: "relative",
          }}
          ref={invoiceRef}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          {/* Large INVOICE Title */}
          <h1
            className=""
            style={{
              fontSize: "clamp(90px, 18vw, 205px)",
              color: "#39FF14",
              fontWeight: 700,
              letterSpacing: "-4px",
              lineHeight: "0.9",
              marginBottom: "30px",
              textAlign: "center",
            }}
          >
            INVOICE
          </h1>
          
          {/* Invoice Number and Dates Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div className="" style={{ fontSize: "17px", color: "#FFF" }}>
              &nbsp;INVOICE NO : <span style={{ color: "#39FF14" }}>#{invoice.invoiceNumber}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="" style={{ fontSize: "17px", color: "#FFF", marginBottom: "8px" }}>
                DATE : <span style={{ color: "#39FF14" }}>{formatDate(invoice.date)}</span>
              </div>
              <div className="" style={{ fontSize: "17px", color: "#FFF" }}>
                DUE : <span style={{ color: "#39FF14" }}>{formatDate(invoice.dueDate)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing Addresses */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", marginBottom: "40px" }}>
          <div>
            <div className="" style={{ fontSize: "17px", color: "#FFF", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
              BILL TO :
            </div>
            <div className="" style={{ fontSize: "17px", color: "#39FF14", lineHeight: "1.8" }}>
              <div>{invoice.billTo.name}</div>
              <div>{invoice.billTo.email}</div>
              <div>{invoice.billTo.address}</div>
              {invoice.billTo.gstNumber && <div>GST Number: {invoice.billTo.gstNumber}</div>}
            </div>
          </div>
          <div>
            <div className="" style={{ fontSize: "17px", color: "#FFF", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
              ADDRESS :
            </div>
            <div className="" style={{ fontSize: "17px", color: "#39FF14", lineHeight: "1.8" }}>
              <div>{invoice.companyAddress.companyName}</div>
              <div>{invoice.companyAddress.email}</div>
              <div>{invoice.companyAddress.street}</div>
              <div>
                {invoice.companyAddress.city}, {invoice.companyAddress.state} {invoice.companyAddress.zip}
              </div>
              <div>{invoice.companyAddress.country}</div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ height: "2px", background: "#39FF14", marginBottom: "20px" }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="aeonik-mono" style={{ textAlign: "left", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  DESCRIPTION
                </th>
                <th className="aeonik-mono" style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  PRICE
                </th>
                <th className="aeonik-mono" style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  QUANTITY
                </th>
                <th className="aeonik-mono" style={{ textAlign: "right", padding: "15px", borderBottom: "2px solid #39FF14", color: "#FFF", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  SUBTOTAL
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={index}>
                  <td className="aeonik-mono" style={{ padding: "15px", borderBottom: "1px solid rgba(57, 255, 20, 0.3)", color: "#39FF14", fontSize: "14px" }}>
                    {index + 1}. {item.title}
                  </td>
                  <td className="aeonik-mono" style={{ padding: "15px", borderBottom: "1px solid rgba(57, 255, 20, 0.3)", color: "#39FF14", fontSize: "14px", textAlign: "right" }}>
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="aeonik-mono" style={{ padding: "15px", borderBottom: "1px solid rgba(57, 255, 20, 0.3)", color: "#39FF14", fontSize: "14px", textAlign: "right" }}>
                    {item.quantity}
                  </td>
                  <td className="aeonik-mono" style={{ padding: "15px", borderBottom: "1px solid rgba(57, 255, 20, 0.3)", color: "#39FF14", fontSize: "14px", textAlign: "right" }}>
                    ${item.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ height: "2px", background: "#39FF14", marginTop: "20px" }} />
        </div>

        {/* Totals with Background */}
        <div 
          style={{ 
            marginTop: "30px", 
            position: "relative",
            backgroundImage: "url('/invoice.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            padding: "40px",
            minHeight: "300px",
          }}
        >
          {/* Totals Content */}
          <div style={{ position: "relative", zIndex: 1, marginLeft: "auto", maxWidth: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", fontWeight: 600 }}>
                DISCOUNT
              </span>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>
                ${invoice.discount.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", fontWeight: 600 }}>
                SGST
              </span>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>
                ${invoice.sgst.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", fontWeight: 600 }}>
                CGST
              </span>
              <span className="aeonik-mono" style={{ fontSize: "14px", color: "#39FF14" }}>
                ${invoice.cgst.toFixed(2)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "25px", paddingTop: "20px", borderTop: "2px solid #39FF14" }}>
              <span className="aeonik-mono" style={{ fontSize: "18px", color: "#FFF", fontWeight: 700 }}>
                TOTAL
              </span>
              <span className="aeonik-mono" style={{ fontSize: "28px", color: "#39FF14", fontWeight: 700 }}>
                ${invoice.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Terms */}
        {invoice.paymentTerms && (
          <div style={{ marginTop: "40px", padding: "20px", background: "rgba(57, 255, 20, 0.05)", borderLeft: "4px solid #39FF14" }}>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: "#FFF", lineHeight: "1.8" }}>
              * {invoice.paymentTerms}
            </div>
          </div>
        )}

        {/* Payment Method */}
        {invoice.paymentMethod && Object.values(invoice.paymentMethod).some((v) => v) && (
          <div style={{ marginTop: "40px" }}>
            <div className="aeonik-mono" style={{ fontSize: "14px", color: "#FFF", marginBottom: "15px", textTransform: "uppercase", letterSpacing: "1px" }}>
              PAYMENT METHOD :
            </div>
            <div className="aeonik-mono" style={{ fontSize: "12px", color: "#39FF14", lineHeight: "1.8" }}>
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

        {/* QR Code Placeholder */}
        <div style={{ marginTop: "40px", textAlign: "right" }}>
          <div
            style={{
              width: "120px",
              height: "120px",
              background: "#FFF",
              display: "inline-block",
              border: "2px solid #39FF14",
            }}
          >
            {/* QR Code would go here */}
          </div>
        </div>
        </div>
      </div>

      {/* Action Buttons - Fixed at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "20px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "15px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
          zIndex: 10001,
        }}
      >
        {invoice.status !== "paid" && onPay && (
          <button
            onClick={onPay}
            className="aeonik-mono"
            style={{
              padding: "12px 24px",
              background: "#39FF14",
              color: "#000",
              border: "none",
              fontSize: "14px",
              cursor: "pointer",
              borderRadius: "0px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            PAY NOW
          </button>
        )}
        <button
          onClick={downloadPDF}
          className="aeonik-mono"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#39FF14",
            border: "1px solid #39FF14",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          DOWNLOAD PDF
        </button>
        <button
          onClick={onClose}
          className="aeonik-mono"
          style={{
            padding: "12px 24px",
            background: "transparent",
            color: "#FFF",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            fontSize: "14px",
            cursor: "pointer",
            borderRadius: "0px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          CLOSE
        </button>
      </div>
      </div>
    </>
  )
}

export default InvoicePDF
