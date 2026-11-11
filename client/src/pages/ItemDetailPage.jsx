import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getItemByIdAPI } from "../api/items"
import { createBookingAPI } from "../api/bookings"
import { useAuth } from "../context/useAuth"

function ItemDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [booking, setBooking] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        const data = await getItemByIdAPI(id)
        setItem(data)
      } catch (err) {
        setError(err.message || "Item not found")
      } finally {
        setLoading(false)
      }
    }

    fetchItem()
  }, [id])

  const refreshItem = async () => {
    try {
      setLoading(true)
      const data = await getItemByIdAPI(id)
      setItem(data)
    } catch (err) {
      setError(err.message || "Item not found")
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    if (!user) return navigate("/")
    if (!startDate || !endDate) {
      setError("Please select start and end dates")
      return
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("End date must be after start date")
      return
    }
    try {
      setBooking(true)
      setError("")
      await createBookingAPI(id, startDate, endDate)
      setSuccess("Booking confirmed! Contact the owner to arrange pickup.")
      await refreshItem()
    } catch (err) {
      setError(err.message)
    } finally {
      setBooking(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F8F5F8" }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
          style={{ borderColor: "#F4B63E", borderTopColor: "transparent" }}/>
        <p className="text-gray-400 text-sm">Loading item...</p>
      </div>
    </div>
  )

  if (error && !item) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F8F5F8" }}>
      <div className="text-center">
        <p className="text-gray-500 font-medium mb-4">{error}</p>
        <button onClick={() => navigate("/listings")}
          className="px-6 py-2.5 rounded-xl text-white font-medium"
          style={{ backgroundColor: "#F4B63E" }}>
          Back to listings
        </button>
      </div>
    </div>
  )

  const isYellow = item?._id?.charCodeAt(0) % 2 === 0
  const bgLight = isYellow ? "#FFF8E8" : "#F0EFFD"
  const accentColor = isYellow ? "#E2A72E" : "#8B85D4"
  const isOwner = user && item?.owner?._id === user._id

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F8" }}>

      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#F4B63E" }}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">BorrowBox</span>
        </div>
        <button onClick={() => navigate("/listings")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Left — Item visual */}
          <div>
            <div className="h-80 rounded-2xl flex items-center justify-center relative mb-4"
              style={{ backgroundColor: bgLight }}>
              <div className="w-40 h-40 rounded-full flex items-center justify-center"
                style={{ backgroundColor: isYellow ? "#F4B63E20" : "#C9C4F520" }}>
                <svg width="80" height="80" viewBox="0 0 52 52" fill="none">
                  <rect x="8" y="6" width="28" height="40" rx="3"
                    stroke={accentColor} strokeWidth="2.5"/>
                  <rect x="8" y="6" width="6" height="40" rx="3"
                    fill={accentColor} opacity="0.4"/>
                  <line x1="18" y1="16" x2="30" y2="16"
                    stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="22" x2="30" y2="22"
                    stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                  <line x1="18" y1="28" x2="26" y2="28"
                    stroke={accentColor} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>

              {/* Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: item.type === "sell" ? "#F4B63E" : "#C9C4F5",
                  color: item.type === "sell" ? "white" : "#534AB7",
                }}>
                {item.type === "sell" ? "For Sale" : "For Rent"}
              </div>
            </div>

            {/* Rules */}
            {item.rules && item.rules.length > 0 && (
              <div className="bg-white rounded-2xl p-5"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Owner's Rules</h3>
                <div className="space-y-2">
                  {item.rules.map((rule, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: "#F4B63E" }}/>
                      <span className="text-sm text-gray-500">{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Details + Booking */}
          <div>
            <div className="mb-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full"
                style={{ backgroundColor: "#F0EFFD", color: "#534AB7" }}>
                {item.category}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">{item.title}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#F4B63E">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-sm font-bold text-gray-800">
                  {item.rating || "New"}
                </span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                {item.owner?.hostel || "Campus"} · {item.owner?.name || "Student"}
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed mb-6">{item.description}</p>

            {/* Price */}
            <div className="bg-white rounded-2xl p-5 mb-5"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-gray-800">₹{item.price}</span>
                <span className="text-gray-400 text-sm">
                  {item.per === "flat" ? "flat price" : `per ${item.per}`}
                </span>
              </div>
              {item.type === "borrow" && (
                <p className="text-xs text-gray-400">Deposit may be required by owner</p>
              )}
            </div>

            {/* Success message */}
            {success && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#E8F8F0", color: "#1A7A4A" }}>
                {success}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#FFE8E8", color: "#C0392B" }}>
                {error}
              </div>
            )}

            {/* Booking section — only for borrow type */}
            {item.type === "borrow" && !isOwner && item.available && (
              <div className="bg-white rounded-2xl p-5 mb-5"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">Select Dates</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input type="date" value={startDate} min={today}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "#E5E5E5" }}
                      onFocus={e => e.target.style.borderColor = "#F4B63E"}
                      onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input type="date" value={endDate} min={startDate || today}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border text-sm outline-none"
                      style={{ borderColor: "#E5E5E5" }}
                      onFocus={e => e.target.style.borderColor = "#F4B63E"}
                      onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
                  </div>
                </div>

                {/* Price estimate */}
                {startDate && endDate && (
                  <div className="mt-3 px-3 py-2 rounded-xl"
                    style={{ backgroundColor: "#FFF8E8" }}>
                    <p className="text-xs text-gray-500">
                      Estimated total:
                      <span className="font-bold text-gray-800 ml-1">
                        ₹{Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) * item.price || item.price}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Owner badge */}
            {isOwner && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
                style={{ backgroundColor: "#F0EFFD", color: "#534AB7" }}>
                This is your listing
              </div>
            )}

            {/* Booking is available for rentals only; sales remain informational until a purchase workflow is added. */}
            {!isOwner && item.type === "borrow" && (
              <button
                onClick={handleBooking}
                disabled={!item.available || booking}
                className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: item.available ? "#F4B63E" : "#D1D1D1",
                  cursor: item.available ? "pointer" : "not-allowed",
                }}>
                {!item.available
                  ? "Currently Unavailable"
                  : booking
                  ? "Confirming..."
                  : "Confirm Booking →"}
              </button>
            )}
            {!isOwner && item.type === "sell" && (
              <div className="px-4 py-3 rounded-xl text-sm text-gray-500"
                style={{ backgroundColor: "#FFF8E8" }}>
                Sale listings are currently informational. No online purchase or payment is processed.
              </div>
            )}

            {item.type === "borrow" && (
              <p className="text-center text-xs text-gray-400 mt-3">
                Payment is not processed in this version.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemDetailPage
