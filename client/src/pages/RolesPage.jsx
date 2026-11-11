import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { updateRolesAPI } from "../api/auth"
import { useAuth } from "../context/useAuth"

const roles = [
  {
    id: "borrower",
    emoji: "🙋",
    title: "Borrower",
    subtitle: "I need something",
    description: "Browse items available to borrow or rent from fellow students. Pay per day and return when done.",
    perks: ["Browse all listings", "Book time slots", "Arrange pickup"],
    color: "#F4B63E",
    lightColor: "#FFF3D4",
  },
  {
    id: "lender",
    emoji: "📦",
    title: "Lender",
    subtitle: "I have something to share",
    description: "List your items for rent and earn money while you're not using them. You set the price and schedule.",
    perks: ["List your items", "Set your price", "Manage bookings", "Earn passively"],
    color: "#C9C4F5",
    lightColor: "#EEEDFE",
  },
  {
    id: "seller",
    emoji: "🏷️",
    title: "Seller",
    subtitle: "I want to sell something",
    description: "Sell old textbooks, gadgets, clothes or anything directly to students in your college.",
    perks: ["Post for free", "Set your price", "Manage listings"],
    color: "#F4B63E",
    lightColor: "#FFF3D4",
  },
  {
    id: "helper",
    emoji: "🤝",
    title: "Helper",
    subtitle: "I want to earn by helping",
    description: "Pick up tasks posted by students — deliver food, write notes, give quizzes, earn extra money.",
    perks: ["Browse tasks", "Set your rate", "Coordinate task details"],
    color: "#C9C4F5",
    lightColor: "#EEEDFE",
  },
]

function RolesPage() {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()
  const { user, login } = useAuth()

  const handleContinue = async () => {
    if (selected) {
      const data = await updateRolesAPI([selected])
      login({ ...user, role: data.roles })
      navigate("/listings")
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F8" }}>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#F4B63E" }}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">BorrowBox</span>
        </div>
        <button
          onClick={() => navigate("/home")}
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Back to Home
        </button>
      </nav>

      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
          style={{ backgroundColor: "#C9C4F5", color: "#534AB7" }}>
          Step 1 of 1
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          What do you want to do?
        </h1>
        <p className="text-gray-400 text-lg max-w-md mx-auto">
          Pick a role to get started. You can always switch later from your dashboard.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto px-8 pb-8">
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => setSelected(role.id)}
            className="bg-white rounded-2xl p-6 cursor-pointer transition-all duration-200 relative"
            style={{
              border: selected === role.id
                ? `2px solid ${role.color}`
                : "2px solid transparent",
              boxShadow: selected === role.id
                ? `0 8px 30px ${role.color}30`
                : "0 2px 12px rgba(0,0,0,0.06)",
              transform: selected === role.id ? "translateY(-4px)" : "translateY(0)",
            }}>

            {/* Selected checkmark */}
            {selected === role.id && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: role.color }}>
                ✓
              </div>
            )}

            {/* Emoji icon */}
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4"
              style={{ backgroundColor: role.lightColor }}>
              {role.emoji}
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-gray-800 mb-1">{role.title}</h3>
            <p className="text-xs font-medium mb-3" style={{ color: role.color }}>
              {role.subtitle}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {role.description}
            </p>

            {/* Perks */}
            <div className="space-y-2">
              {role.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: role.color }}>
                    ✓
                  </div>
                  <span className="text-xs text-gray-500">{perk}</span>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center pb-16">
        <button
          onClick={handleContinue}
          disabled={!selected}
          className="px-10 py-4 rounded-xl text-white font-semibold text-base transition-all"
          style={{
            backgroundColor: selected ? "#F4B63E" : "#D1D1D1",
            cursor: selected ? "pointer" : "not-allowed",
            boxShadow: selected ? "0 8px 24px #F4B63E50" : "none",
          }}>
          {selected
            ? `Continue as ${roles.find(r => r.id === selected)?.title} →`
            : "Select a role to continue"}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          You can have multiple roles — just switch anytime from your dashboard
        </p>
      </div>

    </div>
  )
}

export default RolesPage