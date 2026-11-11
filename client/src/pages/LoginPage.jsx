import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { loginAPI, registerAPI } from "../api/auth"
import { useAuth } from "../context/useAuth"

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [hostel, setHostel] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      let userData
      if (isLogin) {
        userData = await loginAPI(email, password)
      } else {
        userData = await registerAPI(name, email, password, hostel)
      }
      login(userData)
      navigate("/home")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F8F5F8" }}>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">

        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3"
            style={{ backgroundColor: "#F4B63E" }}>
            <span className="text-white text-2xl font-bold">B</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">BorrowBox</h1>
          <p className="text-sm text-gray-400 mt-1">Your college marketplace</p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-xl overflow-hidden mb-6 border"
          style={{ borderColor: "#E5E5E5" }}>
          <button onClick={() => { setIsLogin(true); setError("") }}
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{ backgroundColor: isLogin ? "#F4B63E" : "white", color: isLogin ? "white" : "#6B6B6B" }}>
            Login
          </button>
          <button onClick={() => { setIsLogin(false); setError("") }}
            className="flex-1 py-2 text-sm font-medium transition-all"
            style={{ backgroundColor: !isLogin ? "#F4B63E" : "white", color: !isLogin ? "white" : "#6B6B6B" }}>
            Sign Up
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm font-medium"
            style={{ backgroundColor: "#FFE8E8", color: "#C0392B" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
              <input type="text" placeholder="Enter your full name"
                value={name} onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "#E5E5E5" }}
                onFocus={(e) => e.target.style.borderColor = "#F4B63E"}
                onBlur={(e) => e.target.style.borderColor = "#E5E5E5"} />
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Hostel / Block</label>
              <input type="text" placeholder="e.g. Block A, Room 204"
                value={hostel} onChange={(e) => setHostel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
                style={{ borderColor: "#E5E5E5" }}
                onFocus={(e) => e.target.style.borderColor = "#F4B63E"}
                onBlur={(e) => e.target.style.borderColor = "#E5E5E5"} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">College Email</label>
            <input type="email" placeholder="yourname@college.edu"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "#E5E5E5" }}
              onFocus={(e) => e.target.style.borderColor = "#F4B63E"}
              onBlur={(e) => e.target.style.borderColor = "#E5E5E5"} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input type="password" placeholder="Enter your password"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: "#E5E5E5" }}
              onFocus={(e) => e.target.style.borderColor = "#F4B63E"}
              onBlur={(e) => e.target.style.borderColor = "#E5E5E5"} />
          </div>

          <p className="text-xs text-center px-2" style={{ color: "#A8A8B4" }}>
            Only students with a valid college email can access BorrowBox
          </p>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: loading ? "#D1D1D1" : "#F4B63E" }}>
            {loading ? "Please wait..." : isLogin ? "Login to BorrowBox" : "Create Account"}
          </button>

        </form>

        <p className="text-center text-xs mt-6" style={{ color: "#A8A8B4" }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError("") }}
            className="font-medium" style={{ color: "#F4B63E" }}>
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>

      </div>
    </div>
  )
}

export default LoginPage