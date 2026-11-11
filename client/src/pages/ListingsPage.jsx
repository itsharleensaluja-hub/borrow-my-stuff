import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getItemsAPI } from "../api/items"

const categories = ["All", "Electronics", "Books", "Instruments", "Sports", "Food", "Clothes", "Other"]

function ItemIcon({ icon, color }) {
  const c = color === "#F4B63E" ? "#E2A72E" : "#8B85D4"
  const size = 52
  if (icon === "calc") return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect x="8" y="4" width="36" height="44" rx="6" stroke={c} strokeWidth="2.5"/>
      <rect x="14" y="10" width="24" height="10" rx="2" fill={c} opacity="0.3"/>
      <rect x="14" y="28" width="8" height="8" rx="2" fill={c}/>
      <rect x="22" y="28" width="8" height="8" rx="2" fill={c} opacity="0.5"/>
      <rect x="30" y="28" width="8" height="8" rx="2" fill={c} opacity="0.3"/>
    </svg>
  )
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
      <rect x="8" y="6" width="28" height="40" rx="3" stroke={c} strokeWidth="2.5"/>
      <rect x="8" y="6" width="6" height="40" rx="3" fill={c} opacity="0.4"/>
      <line x1="18" y1="16" x2="30" y2="16" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <line x1="18" y1="22" x2="30" y2="22" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ListingCard({ item, onClick }) {
  const isYellow = item._id?.charCodeAt(0) % 2 === 0
  const bgLight = isYellow ? "#FFF8E8" : "#F0EFFD"

  return (
    <div onClick={() => onClick(item)}
      className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

      <div className="h-44 flex items-center justify-center relative" style={{ backgroundColor: bgLight }}>
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ backgroundColor: isYellow ? "#F4B63E20" : "#C9C4F520" }}>
          <ItemIcon icon="calc" color={isYellow ? "#F4B63E" : "#C9C4F5"} />
        </div>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: item.type === "sell" ? "#F4B63E" : "#C9C4F5",
            color: item.type === "sell" ? "white" : "#534AB7",
          }}>
          {item.type === "sell" ? "For Sale" : "For Rent"}
        </div>
        {!item.available && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.75)" }}>
            <div className="px-3 py-1 rounded-lg text-xs font-semibold text-gray-500"
              style={{ backgroundColor: "white", border: "1px solid #E5E5E5" }}>
              Unavailable
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight flex-1 pr-2">{item.title}</h3>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="#F4B63E">
              <path d="M6 1l1.4 2.8 3.1.4-2.2 2.2.5 3.1L6 8l-2.8 1.5.5-3.1L1.5 4.2l3.1-.4z"/>
            </svg>
            <span className="text-xs text-gray-500 ml-0.5">{item.rating || "New"}</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          {item.owner?.hostel || "Hostel"} · {item.owner?.name || "Student"}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-800">₹{item.price}</span>
            <span className="text-xs text-gray-400 ml-1">
              {item.per === "flat" ? "flat" : `/ ${item.per}`}
            </span>
          </div>
          <button
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: item.available ? "#F4B63E" : "#F0F0F0",
              color: item.available ? "white" : "#A8A8A8",
            }}>
            {item.type === "sell" ? "View Details" : "Book Slot"}
          </button>
        </div>
      </div>
    </div>
  )
}

function ListingsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [activeType, setActiveType] = useState("All")
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {}
      if (activeCategory !== "All") filters.category = activeCategory
      if (activeType !== "All") filters.type = activeType
      if (search) filters.search = search
      const data = await getItemsAPI(filters)
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch items:", error)
    } finally {
      setLoading(false)
    }
  }, [activeCategory, activeType, search])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F8" }}>

      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F4B63E" }}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">BorrowBox</span>
        </div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A8A8B4" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search items..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none"
              style={{ borderColor: "#E5E5E5", backgroundColor: "#F8F5F8" }}
              onFocus={(e) => e.target.style.borderColor = "#F4B63E"}
              onBlur={(e) => e.target.style.borderColor = "#E5E5E5"} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/ask-help")}
            className="text-sm px-4 py-2 rounded-xl font-medium border-2"
            style={{ borderColor: "#C9C4F5", color: "#534AB7" }}>
            Ask for Help
          </button>
          <button onClick={() => navigate("/list-item")}
            className="text-sm px-4 py-2 rounded-xl text-white font-medium flex items-center gap-1.5"
            style={{ backgroundColor: "#F4B63E" }}>
            + List Item
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Browse Campus Listings</h1>
          <p className="text-gray-400">Find anything you need from students in your college</p>
        </div>

        <div className="flex gap-2 mb-4">
          {["All", "borrow", "sell"].map(type => (
            <button key={type} onClick={() => setActiveType(type)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeType === type ? "#F4B63E" : "white",
                color: activeType === type ? "white" : "#6B6B6B",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
              {type === "All" ? "All Types" : type === "borrow" ? "For Rent" : "For Sale"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat ? "#1A1A1A" : "white",
                color: activeCategory === cat ? "white" : "#6B6B6B",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-72 animate-pulse"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="h-44 rounded-t-2xl" style={{ backgroundColor: "#F0F0F0" }}></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 rounded" style={{ backgroundColor: "#F0F0F0" }}></div>
                  <div className="h-3 rounded w-2/3" style={{ backgroundColor: "#F0F0F0" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              Showing <span className="font-bold text-gray-700">{items.length}</span> items
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {items.map(item => (
                <ListingCard key={item._id} item={item}
                  onClick={() => navigate(`/item/${item._id}`)} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <svg className="mx-auto mb-4" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#D1D1D1" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <p className="text-gray-500 font-medium">No items found</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to list something!</p>
            <button onClick={() => navigate("/list-item")}
              className="mt-4 px-6 py-2.5 rounded-xl text-white font-medium text-sm"
              style={{ backgroundColor: "#F4B63E" }}>
              + List an Item
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ListingsPage