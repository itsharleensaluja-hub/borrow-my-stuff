import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8F5F8" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#F4B63E" }}
          >
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-800 text-lg">BorrowBox</span>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/listings"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Browse
          </a>
          <a
            href="/list-item"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Lend
          </a>
          <a
            href="/ask-help"
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Help
          </a>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm px-4 py-2 rounded-xl text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#F4B63E" }}
          >
            My Dashboard
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-12 py-16 max-w-7xl mx-auto min-h-[85vh]">
        {/* Left: Text */}
        <div className="flex-1 z-10 max-w-xl">
          <div
            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ backgroundColor: "#C9C4F5", color: "#534AB7" }}
          >
            For college students only 🎓
          </div>
          <h1 className="text-6xl font-bold text-gray-800 leading-tight mb-5">
            Borrow, Lend &<br />
            <span style={{ color: "#F4B63E" }}>Earn on Campus</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            A marketplace built for hostel life. Rent items, offer services, and
            make money — all within your college community.
          </p>
          <div className="flex gap-4 mb-12">
            <button
              onClick={() => navigate("/roles")}
              className="px-7 py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-md"
              style={{ backgroundColor: "#F4B63E" }}
            >
              Get Started →
            </button>
            <button
              onClick={() => navigate("/listings")}
              className="px-7 py-3.5 rounded-xl font-semibold text-sm border-2 transition-colors hover:bg-white"
              style={{ borderColor: "#C9C4F5", color: "#534AB7" }}
            >
              Browse Items
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-10">
            <div>
              <p className="text-3xl font-bold text-gray-800">500+</p>
              <p className="text-sm text-gray-400 mt-1">Active students</p>
            </div>
            <div className="w-px" style={{ backgroundColor: "#E5E5E5" }}></div>
            <div>
              <p className="text-3xl font-bold text-gray-800">1.2k</p>
              <p className="text-sm text-gray-400 mt-1">Items listed</p>
            </div>
            <div className="w-px" style={{ backgroundColor: "#E5E5E5" }}></div>
            <div>
              <p className="text-3xl font-bold text-gray-800">₹50k+</p>
              <p className="text-sm text-gray-400 mt-1">Earned by students</p>
            </div>
          </div>
        </div>

        {/* Right: Hero Visual */}
        <div className="flex-1 flex items-center justify-center relative h-[520px] mt-10 lg:mt-0">
          {/* Big yellow blob behind everything */}
          <div
            className="absolute w-80 h-80 rounded-full opacity-40"
            style={{
              backgroundColor: "#F4B63E",
              filter: "blur(60px)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>

          {/* Big yellow pill / card background — like QuickDel */}
          <div
            className="absolute w-72 h-96 rounded-3xl"
            style={{
              backgroundColor: "#F4B63E",
              opacity: 0.15,
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>

          {/* Center: Big emoji / avatar placeholder */}
          <div
            className="relative z-10 flex flex-col items-center justify-center w-64 h-80 rounded-3xl shadow-xl"
            style={{ backgroundColor: "#F4B63E" }}
          >
            <div className="text-8xl mb-2">🎒</div>
            <p className="text-white font-bold text-lg">Campus Life</p>
            <p className="text-yellow-100 text-sm">Borrow anything</p>
          </div>

          {/* Floating card 1 — top left */}
          <div
            className="absolute top-8 left-4 bg-white rounded-2xl shadow-lg px-4 py-3 z-20 flex items-center gap-3"
            style={{ minWidth: "160px" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#FFF3D4" }}
            >
              📚
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Textbooks</p>
              <p className="text-xs" style={{ color: "#F4B63E" }}>
                ₹50/day
              </p>
            </div>
          </div>

          {/* Floating card 2 — top right */}
          <div
            className="absolute top-16 right-0 bg-white rounded-2xl shadow-lg px-4 py-3 z-20 flex items-center gap-3"
            style={{ minWidth: "160px" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#EEEDFE" }}
            >
              🎸
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Guitar</p>
              <p className="text-xs" style={{ color: "#C9C4F5" }}>
                ₹100/day
              </p>
            </div>
          </div>

          {/* Floating card 3 — bottom left */}
          <div
            className="absolute bottom-16 left-0 bg-white rounded-2xl shadow-lg px-4 py-3 z-20 flex items-center gap-3"
            style={{ minWidth: "170px" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#FFF3D4" }}
            >
              🍕
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Food delivery</p>
              <p className="text-xs text-gray-400">Ask for help</p>
            </div>
          </div>

          {/* Floating card 4 — bottom right */}
          <div
            className="absolute bottom-8 right-2 bg-white rounded-2xl shadow-lg px-4 py-3 z-20 flex items-center gap-3"
            style={{ minWidth: "160px" }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: "#EEEDFE" }}
            >
              💻
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Laptop</p>
              <p className="text-xs" style={{ color: "#F4B63E" }}>
                ₹200/day
              </p>
            </div>
          </div>

          {/* Small badge — verified */}
          <div
            className="absolute top-1/2 right-[-10px] bg-white rounded-full shadow-lg px-3 py-2 z-20 flex items-center gap-2"
            style={{ transform: "translateY(-50%)" }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{ backgroundColor: "#F4B63E" }}
            >
              ✓
            </div>
            <p className="text-xs font-bold text-gray-700">College verified</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-12 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
          Everything you need on campus
        </h2>
        <p className="text-center text-gray-400 mb-12">
          One app for all your college needs
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
              style={{ backgroundColor: "#FFF3D4" }}
            >
              📦
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Borrow & Lend</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Need a calculator for exams? A guitar for the weekend? Borrow from
              classmates and save money.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
              style={{ backgroundColor: "#EEEDFE" }}
            >
              🤝
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Ask for Help</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Need notes written, food delivered from the canteen, or a quiz
              taken? Post a task and pay a fellow student.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl"
              style={{ backgroundColor: "#FFF3D4" }}
            >
              💰
            </div>
            <h3 className="font-bold text-gray-800 mb-2">Sell Items</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Sell old textbooks, gadgets, or anything you no longer need
              directly to students in your college.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
