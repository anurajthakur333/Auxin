import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import ClientProjectsAdmin from "./components/ClientProjectsAdmin"
import { useSound } from "../../hooks/useSound"
import clickSound from "../../assets/Sound/Click1.wav"

const ClientProjectsPage = () => {
  const { clientId } = useParams<{ clientId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const playClickSound = useSound(clickSound, { volume: 0.3 })

  const clientName = searchParams.get("name") || "CLIENT"
  const clientCode = searchParams.get("code") || ""

  useEffect(() => {
    // Basic admin auth check – redirect if no adminToken
    const adminToken = localStorage.getItem("adminToken")
    if (!adminToken) {
      navigate("/admin")
    }
  }, [navigate])

  if (!clientId) {
    return (
      <div
        className="aeonik-mono"
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.6)",
        }}
      >
        INVALID CLIENT
      </div>
    )
  }

  return (
    <ClientProjectsAdmin
      clientId={clientId}
      clientName={clientName}
      clientCode={clientCode}
      onClose={() => {
        playClickSound()
        navigate("/admin/dashboard")
      }}
    />
  )
}

export default ClientProjectsPage

