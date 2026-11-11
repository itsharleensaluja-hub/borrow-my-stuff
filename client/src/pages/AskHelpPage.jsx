import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptGigAPI, createGigAPI, getGigsAPI } from "../api/gigs";
import { useAuth } from "../context/useAuth";
import SiteNav from "../components/SiteNav";
import {
  EmptyState,
  ErrorMessage,
  LoadingRows,
} from "../components/PageStates";

function AskHelpPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [category, setCategory] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Delivery",
    budget: "",
    urgency: "today",
    hostel: "",
  });
  const fetchGigs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setGigs(await getGigsAPI(category === "All" ? {} : { category }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [category]);
  useEffect(() => {
    fetchGigs();
  }, [fetchGigs]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!Number.isFinite(Number(form.budget)) || Number(form.budget) <= 0)
      return setError("Enter a budget greater than zero.");
    try {
      setError("");
      await createGigAPI({ ...form, budget: Number(form.budget) });
      setShowForm(false);
      setForm({
        title: "",
        description: "",
        category: "Delivery",
        budget: "",
        urgency: "today",
        hostel: "",
      });
      fetchGigs();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  const accept = async (id) => {
    if (!user) return navigate("/");
    try {
      await acceptGigAPI(id);
      fetchGigs();
    } catch (requestError) {
      setError(requestError.message);
    }
  };
  return (
    <div className="page-shell">
      <SiteNav />
      <main className="container-wide py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-6 border-b border-[#17213d] pb-10 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Campus help desk</p>
            <h1 className="font-display mt-4 text-6xl leading-none">
              Ask for help.
            </h1>
            <p className="mt-5 max-w-lg text-[#687087]">
              Small jobs, clear budgets, another student who can make it happen.
            </p>
          </div>
          <button
            className="btn-quiet self-start"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close form" : "Post a task"} <span>↗</span>
          </button>
        </div>
        {error && (
          <div className="mt-6">
            <ErrorMessage message={error} />
          </div>
        )}
        {showForm && (
          <form
            onSubmit={submit}
            className="mt-8 grid gap-5 border border-[#17213d] bg-[#fffdf9] p-6 sm:grid-cols-2"
          >
            <div>
              <label className="field-label" htmlFor="title">
                Task
              </label>
              <input
                id="title"
                name="title"
                className="field-control"
                value={form.title}
                onChange={update}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="budget">
                Budget (₹)
              </label>
              <input
                id="budget"
                name="budget"
                type="number"
                min="0.01"
                step="0.01"
                className="field-control"
                value={form.budget}
                onChange={update}
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                name="category"
                className="field-control"
                value={form.category}
                onChange={update}
              >
                <option>Delivery</option>
                <option>Academic</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="urgency">
                When?
              </label>
              <select
                id="urgency"
                name="urgency"
                className="field-control"
                value={form.urgency}
                onChange={update}
              >
                <option value="urgent">Urgent</option>
                <option value="today">Today</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="field-label" htmlFor="description">
                Details
              </label>
              <textarea
                id="description"
                name="description"
                className="field-control min-h-24"
                value={form.description}
                onChange={update}
                required
              />
            </div>
            <button className="btn-primary sm:col-span-2">Post task ↗</button>
          </form>
        )}
        <div className="mt-10 flex gap-2 overflow-auto border-b hairline pb-3">
          {["All", "Delivery", "Academic", "Other"].map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap px-3 py-2 text-xs ${category === item ? "bg-[#17213d] text-[#fffdf9]" : "border border-[#d8d5cf]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <section className="mt-2">
          {loading ? (
            <LoadingRows count={4} />
          ) : gigs.length === 0 ? (
            <EmptyState
              title="No open tasks."
              body="Post the first one if there’s something your campus can help with."
            />
          ) : (
            <div className="grid gap-0 border-b hairline">
              {gigs.map((gig) => (
                <article
                  key={gig._id}
                  className="grid gap-5 border-t hairline py-6 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap gap-3">
                      <span className="eyebrow">{gig.category}</span>
                      <span className="font-mono text-xs uppercase text-[#a94d3c]">
                        {gig.urgency}
                      </span>
                    </div>
                    <h2 className="font-display mt-3 text-3xl">{gig.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#687087]">
                      {gig.description}
                    </p>
                    <p className="mt-4 text-xs text-[#687087]">
                      {gig.postedBy?.name || "Student"} /{" "}
                      {gig.hostel || "Campus"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-5 md:block md:text-right">
                    <p className="font-display text-3xl">₹{gig.budget}</p>
                    {gig.postedBy?._id !== user?._id && (
                      <button
                        className="btn-outline mt-3"
                        onClick={() => accept(gig._id)}
                      >
                        Accept task
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AskHelpPage;
