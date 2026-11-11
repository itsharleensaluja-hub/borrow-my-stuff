import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAPI, registerAPI } from "../api/auth";
import { useAuth } from "../context/useAuth";
import BrandMark from "../components/BrandMark";
import { ErrorMessage } from "../components/PageStates";

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    hostel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const update = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = isLogin
        ? await loginAPI(form.email, form.password)
        : await registerAPI(form.name, form.email, form.password, form.hostel);
      login(data);
      navigate("/home");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell grid lg:grid-cols-[.9fr_1.1fr]">
      <div className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#175c58] p-10 text-[#fffdf9] lg:flex">
        <img
          src="/campus-study-session.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,64,62,.72),rgba(15,64,62,.94))]" />
        <div className="relative">
          <BrandMark inverse />
        </div>
        <div className="relative">
          <p className="eyebrow text-[#d9ece7]">A campus marketplace</p>
          <h1 className="font-display mt-5 max-w-lg text-6xl leading-[.98]">
            The useful stuff is already nearby.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-[#d9ece7]">
            Borrow a little. Lend what you have. Make campus life lighter.
          </p>
        </div>
        <p className="relative font-mono text-xs text-[#d9ece7]">
          Private to your college community.
        </p>
      </div>
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b hairline px-6 py-5 lg:px-12">
          <BrandMark />
          <span className="font-mono text-xs text-[#687087]">
            {isLogin ? "Welcome back" : "Join the exchange"}
          </span>
        </div>
        <div className="m-auto w-full max-w-md px-6 py-12 lg:px-0">
          <p className="eyebrow">{isLogin ? "Sign in" : "Create account"}</p>
          <h2 className="font-display mt-4 text-5xl">
            {isLogin ? "Good to see you." : "Make campus useful."}
          </h2>
          <p className="mt-4 text-sm leading-6 text-[#687087]">
            {isLogin
              ? "Pick up where you left off."
              : "Use your college email to join Borrow My Stuff."}
          </p>
          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} />
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="field-label" htmlFor="name">
                    Full name
                  </label>
                  <input
                    id="name"
                    name="name"
                    className="field-control"
                    value={form.name}
                    onChange={update}
                    required
                  />
                </div>
                <div>
                  <label className="field-label" htmlFor="hostel">
                    Hostel / block{" "}
                    <span className="font-normal text-[#687087]">
                      (optional)
                    </span>
                  </label>
                  <input
                    id="hostel"
                    name="hostel"
                    className="field-control"
                    value={form.hostel}
                    onChange={update}
                  />
                </div>
              </>
            )}
            <div>
              <label className="field-label" htmlFor="email">
                College email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="field-control"
                placeholder="you@your-college-domain.ac.in"
                value={form.email}
                onChange={update}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                minLength="6"
                className="field-control"
                value={form.password}
                onChange={update}
                required
              />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : isLogin
                  ? "Enter Borrow My Stuff"
                  : "Create my account"}
            </button>
          </form>
          <button
            className="mt-7 text-sm text-[#175c58] underline underline-offset-4"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
