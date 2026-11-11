import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import BrandMark from "./BrandMark";

function SiteNav({ minimal = false }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const links = [
    { href: "/listings", label: "Browse" },
    { href: "/list-item", label: "Lend" },
    { href: "/ask-help", label: "Ask for help" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-30 border-b hairline bg-[#fffdf9]/95 backdrop-blur-sm">
      <div className="container-wide flex min-h-18 items-center justify-between gap-6">
        <Link to={user ? "/home" : "/"}>
          <BrandMark />
        </Link>
        {!minimal && (
          <>
            <nav className="hidden items-center gap-7 md:flex">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`text-sm transition-colors ${location.pathname === link.href ? "font-bold text-[#175c58]" : "text-[#687087] hover:text-[#17213d]"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn-outline">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-[#687087] hover:text-[#a94d3c]"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <Link to="/" className="btn-primary">
                  Log in
                </Link>
              )}
            </div>
            <button
              type="button"
              aria-label="Toggle menu"
              onClick={() => setOpen(!open)}
              className="border border-[#d8d5cf] px-3 py-2 text-sm md:hidden"
            >
              {open ? "Close" : "Menu"}
            </button>
          </>
        )}
      </div>
      {open && !minimal && (
        <div className="border-t hairline bg-[#fffdf9] px-5 py-5 md:hidden">
          <nav className="container-wide flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                onClick={() => setOpen(false)}
                to={link.href}
                className="text-base"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link onClick={() => setOpen(false)} to="/dashboard">
                  Dashboard
                </Link>
                <button
                  className="text-left text-[#a94d3c]"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link to="/" onClick={() => setOpen(false)}>
                Log in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default SiteNav;
