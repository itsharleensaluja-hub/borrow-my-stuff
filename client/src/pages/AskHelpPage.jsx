import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { getGigsAPI, createGigAPI, acceptGigAPI } from "../api/gigs"
import { useAuth } from "../context/useAuth"

const taskCategories = ["All", "Delivery", "Academic", "Other"]

const urgencyStyle = {
  urgent: { bg: "#FFE8E8", color: "#C0392B", label: "🔴 Urgent" },
  today: { bg: "#FFF8E8", color: "#E2A72E", label: "🟡 Due Today" },
  scheduled: { bg: "#F0EFFD", color: "#534AB7", label: "🔵 Scheduled" },
}

function AskHelpPage() {
  const [gigs, setGigs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [showPostForm, setShowPostForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({
    title: "", description: "", category: "Delivery",
    budget: "", urgency: "today", hostel: "",
  })
  const navigate = useNavigate()
  const { user } = useAuth()

  const fetchGigs = useCallback(async () => {
    try {
      setLoading(true)
      const filters = {}
      if (activeCategory !== "All") filters.category = activeCategory
      const data = await getGigsAPI(filters)
      setGigs(data)
    } catch (error) {
      console.error("Failed to fetch gigs:", error)
    } finally {
      setLoading(false)
    }
  }, [activeCategory])

  useEffect(() => {
    fetchGigs()
  }, [fetchGigs])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlePostGig = async (e) => {
    e.preventDefault()
    if (!user) return navigate("/")
    setError("")
    setSuccess("")
    setPosting(true)
    try {
      await createGigAPI({ ...form, budget: Number(form.budget) })
      setSuccess("Task posted successfully!")
      setForm({ title: "", description: "", category: "Delivery", budget: "", urgency: "today", hostel: "" })
      setShowPostForm(false)
      fetchGigs()
    } catch (err) {
      setError(err.message)
    } finally {
      setPosting(false)
    }
  }

  const handleAccept = async (gigId) => {
    if (!user) return navigate("/")
    try {
      await acceptGigAPI(gigId)
      setSuccess("Task accepted! Contact the poster to get started.")
      fetchGigs()
    } catch (err) {
      setError(err.message)
    }
  }

  const inputStyle = { borderColor: "#E5E5E5" }

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
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Browse Items
        </button>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Ask for Help</h1>
            <p className="text-gray-400">Post a task, pay a student, get it done</p>
          </div>
          <button onClick={() => { setShowPostForm(!showPostForm); setError(""); setSuccess("") }}
            className="px-5 py-3 rounded-xl text-white font-semibold text-sm flex items-center gap-2"
            style={{ backgroundColor: "#F4B63E" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post a Task
          </button>
        </div>

        {/* Success / Error messages */}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#E8F8F0", color: "#1A7A4A" }}>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#FFE8E8", color: "#C0392B" }}>
            {error}
          </div>
        )}

        {/* Post Task Form */}
        {showPostForm && (
          <form onSubmit={handlePostGig}
            className="bg-white rounded-2xl p-6 mb-8"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.08)", border: "2px solid #F4B63E" }}>
            <h3 className="font-bold text-gray-800 mb-4">Post a New Task</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Task Title</label>
                <input name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Bring food from canteen" required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#F4B63E"}
                  onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Budget (₹)</label>
                <input name="budget" value={form.budget} onChange={handleChange}
                  type="number" placeholder="How much will you pay?" required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#F4B63E"}
                  onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={inputStyle}>
                  <option>Delivery</option>
                  <option>Academic</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Urgency</label>
                <select name="urgency" value={form.urgency} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={inputStyle}>
                  <option value="urgent">Urgent</option>
                  <option value="today">Due Today</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Your Hostel</label>
                <input name="hostel" value={form.hostel} onChange={handleChange}
                  placeholder="e.g. Block A, Room 204"
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#F4B63E"}
                  onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe exactly what you need..." required rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#F4B63E"}
                  onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
              </div>

            </div>

            <div className="flex gap-3 mt-4">
              <button type="submit" disabled={posting}
                className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm"
                style={{ backgroundColor: posting ? "#D1D1D1" : "#F4B63E" }}>
                {posting ? "Posting..." : "Post Task →"}
              </button>
              <button type="button" onClick={() => setShowPostForm(false)}
                className="px-6 py-2.5 rounded-xl text-gray-500 font-semibold text-sm bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Category filter */}
        <div className="flex gap-2 mb-6">
          {taskCategories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat ? "#1A1A1A" : "white",
                color: activeCategory === cat ? "white" : "#6B6B6B",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Gig cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-48 animate-pulse"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <div className="p-5 space-y-3">
                  <div className="h-3 rounded" style={{ backgroundColor: "#F0F0F0" }}></div>
                  <div className="h-3 rounded w-2/3" style={{ backgroundColor: "#F0F0F0" }}></div>
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: "#F0F0F0" }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : gigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {gigs.map(gig => {
              const u = urgencyStyle[gig.urgency] || urgencyStyle.today
              const isYellow = gig.category === "Delivery"
              const isMyGig = user && gig.postedBy?._id === user._id

              return (
                <div key={gig._id}
                  className="bg-white rounded-2xl p-5 transition-all hover:shadow-md"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: isYellow ? "#FFF8E8" : "#F0EFFD",
                        color: isYellow ? "#E2A72E" : "#534AB7",
                      }}>
                      {gig.category}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: u.bg, color: u.color }}>
                      {u.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-800 mb-2">{gig.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-4">{gig.description}</p>

                  <div className="flex items-center justify-between pt-3"
                    style={{ borderTop: "1px solid #F0F0F0" }}>
                    <div>
                      <p className="text-xs text-gray-400">
                        {gig.postedBy?.name || "Student"} · {gig.hostel || "Campus"}
                      </p>
                      <p className="text-lg font-bold text-gray-800 mt-0.5">₹{gig.budget}</p>
                    </div>

                    {isMyGig ? (
                      <span className="text-xs font-medium px-3 py-1.5 rounded-xl"
                        style={{ backgroundColor: "#F0F0F0", color: "#6B6B6B" }}>
                        Your task
                      </span>
                    ) : (
                      <button onClick={() => handleAccept(gig._id)}
                        className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#F4B63E" }}>
                        Accept Task
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🤝</p>
            <p className="text-gray-500 font-medium">No tasks posted yet</p>
            <p className="text-gray-400 text-sm mt-1">Be the first to post a task!</p>
            <button onClick={() => setShowPostForm(true)}
              className="mt-4 px-6 py-2.5 rounded-xl text-white font-medium text-sm"
              style={{ backgroundColor: "#F4B63E" }}>
              Post a Task
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default AskHelpPage