import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updateRolesAPI } from "../api/auth"
import { useAuth } from "../context/useAuth"
import SiteNav from "../components/SiteNav"
import { ErrorMessage } from "../components/PageStates"

const roles = [
  ["borrower", "Borrower", "Need something useful", "Find what you need nearby.", "dbe7dc"],
  ["lender", "Lender", "Have something useful", "Put idle things back in circulation.", "f8e9be"],
  ["seller", "Seller", "Ready to pass it on", "Give good things a second home.", "e3ddd2"],
  ["helper", "Helper", "Have time to share", "Make someone’s busy day easier.", "dbe7dc"],
]

function RolesPage() {
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const continueRole = async () => {
    if (!selected) return
    try { setSaving(true); const data = await updateRolesAPI([selected]); login({ ...user, role: data.roles }); navigate("/listings") } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  return <div className="page-shell"><SiteNav /><main className="container-wide py-14 lg:py-20"><div className="max-w-2xl"><p className="eyebrow">Make it yours</p><h1 className="font-display mt-4 text-6xl leading-none">How will you use it?</h1><p className="mt-5 text-lg leading-7 text-[#687087]">Choose a starting point. You can always do more than one thing here.</p></div><div className="mt-12 grid gap-px border border-[#17213d] bg-[#17213d] sm:grid-cols-2">{roles.map(([id, title, label, body, tone]) => <button key={id} onClick={() => setSelected(id)} className={`min-h-52 p-6 text-left transition-transform hover:-translate-y-1 ${selected === id ? "bg-[#175c58] text-[#fffdf9]" : `bg-[#${tone}] text-[#17213d]`}`}><span className="font-mono text-xs uppercase opacity-70">{label}</span><h2 className="font-display mt-12 text-3xl">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 opacity-75">{body}</p></button>)}</div>{error && <div className="mt-6"><ErrorMessage message={error} /></div>}<div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t hairline pt-6"><p className="text-sm text-[#687087]">Your role is saved to your account, not just this device.</p><button className="btn-primary" disabled={!selected || saving} onClick={continueRole}>{saving ? "Saving..." : "Continue"} <span>↗</span></button></div></main></div>
}

export default RolesPage
