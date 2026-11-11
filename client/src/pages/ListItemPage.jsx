import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createItemAPI } from "../api/items"

function ListItemPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "", description: "", category: "Electronics",
    type: "borrow", price: "", per: "day", hostel: "", rules: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const rulesArray = form.rules.split("\n").filter(r => r.trim() !== "")
      await createItemAPI({ ...form, price: Number(form.price), rules: rulesArray })
      navigate("/listings")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    borderColor: "#E5E5E5",
    backgroundColor: "white",
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F8" }}>

      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/home")}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#F4B63E" }}>
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">BorrowBox</span>
        </div>
        <button onClick={() => navigate("/listings")}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to listings
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">List an Item</h1>
        <p className="text-gray-400 mb-8">Fill in the details and start earning</p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#FFE8E8", color: "#C0392B" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 className="font-bold text-gray-800">Basic Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Item Title</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Scientific Calculator, Guitar, Textbook"
                required className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#F4B63E"}
                onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange}
                placeholder="Describe the item — brand, condition, what's included..."
                required rows={3}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#F4B63E"}
                onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                <select name="category" value={form.category} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={inputStyle}>
                  {["Electronics", "Books", "Instruments", "Sports", "Food", "Clothes", "Other"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Listing Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={inputStyle}>
                  <option value="borrow">For Rent</option>
                  <option value="sell">For Sale</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 className="font-bold text-gray-800">Pricing & Location</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Price (₹)</label>
                <input name="price" value={form.price} onChange={handleChange}
                  type="number" placeholder="0" required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = "#F4B63E"}
                  onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Per</label>
                <select name="per" value={form.per} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none bg-white"
                  style={inputStyle}>
                  <option value="day">Per Day</option>
                  <option value="hour">Per Hour</option>
                  <option value="flat">Flat Price</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Your Hostel / Block</label>
              <input name="hostel" value={form.hostel} onChange={handleChange}
                placeholder="e.g. Block A, Room 204"
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#F4B63E"}
                onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <h2 className="font-bold text-gray-800">Rules (optional)</h2>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                One rule per line
              </label>
              <textarea name="rules" value={form.rules} onChange={handleChange}
                placeholder={"Return in same condition\nNo liquid near it\nMax 3 days per booking"}
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none resize-none"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#F4B63E"}
                onBlur={e => e.target.style.borderColor = "#E5E5E5"} />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl text-white font-bold text-base transition-opacity hover:opacity-90"
            style={{ backgroundColor: loading ? "#D1D1D1" : "#F4B63E" }}>
            {loading ? "Listing your item..." : "List Item →"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default ListItemPage