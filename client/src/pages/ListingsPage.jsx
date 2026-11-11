import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getItemsAPI } from "../api/items";
import { API_ORIGIN } from "../api/config";
import SiteNav from "../components/SiteNav";
import {
  EmptyState,
  ErrorMessage,
  LoadingRows,
} from "../components/PageStates";

const categories = [
  "All",
  "Electronics",
  "Books",
  "Instruments",
  "Sports",
  "Food",
  "Clothes",
  "Other",
];

function ListingCard({ item }) {
  const isAvailable = item.available;
  return (
    <Link
      to={`/item/${item._id}`}
      className="group grid grid-cols-[96px_1fr] gap-4 border-b hairline py-5 transition-colors hover:bg-[#fffdf9] sm:grid-cols-[150px_1fr] sm:gap-6"
    >
      <div className="relative flex aspect-square items-end justify-between overflow-hidden border border-[#d8d5cf] bg-[#ece6dc] p-3">
        {item.images?.[0]?.url && (
          <img
            src={`${API_ORIGIN}${item.images[0].url}`}
            alt={item.images[0].alt || item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <span className="font-mono text-xs text-[#687087]">
          {item.category?.slice(0, 3).toUpperCase()}
        </span>
        <span
          className={`relative ml-auto h-3 w-3 rounded-full ${isAvailable ? "bg-[#175c58]" : "bg-[#a94d3c]"}`}
          title={isAvailable ? "Available" : "Unavailable"}
        />
      </div>
      <div className="flex min-w-0 flex-col justify-between py-1">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="font-display text-2xl leading-tight group-hover:text-[#175c58]">
              {item.title}
            </h2>
            <span className="font-mono text-xs uppercase text-[#687087]">
              {item.type === "sell" ? "Sale" : "Borrow"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#687087]">
            {item.description}
          </p>
        </div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <p className="text-sm text-[#687087]">
            {item.owner?.name || "Student"}{" "}
            <span className="text-[#d8d5cf]">/</span>{" "}
            {item.owner?.hostel || "Campus"}
          </p>
          <p className="font-display text-2xl">
            ₹{item.price}
            <span className="ml-1 font-sans text-xs text-[#687087]">
              {item.per === "flat" ? "flat" : `/ ${item.per}`}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}

function ListingsPage() {
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState(
    () => searchParams.get("category") || "All",
  );
  const [type, setType] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const fetchItems = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");
        const data = await getItemsAPI(
          {
            ...(category !== "All" && { category }),
            ...(type !== "All" && { type }),
            ...(search && { search }),
          },
          { signal },
        );
        setItems(data);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [category, search, type],
  );
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => fetchItems(controller.signal), 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchItems]);
  const sortedItems = [...items].sort((a, b) =>
    sort === "price-low"
      ? a.price - b.price
      : sort === "price-high"
        ? b.price - a.price
        : sort === "newest"
          ? new Date(b.createdAt) - new Date(a.createdAt)
          : 0,
  );

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="container-wide py-12 lg:py-16">
        <div className="flex flex-col justify-between gap-8 border-b border-[#17213d] pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow">Campus marketplace</p>
            <h1 className="font-display mt-4 text-5xl sm:text-6xl">
              Find useful.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#687087]">
              A practical list of things students are sharing nearby. Search by
              object, category, or what you need it for.
            </p>
          </div>
          <Link to="/list-item" className="btn-quiet self-start">
            List something <span>↗</span>
          </Link>
        </div>
        <div className="grid gap-8 py-8 lg:grid-cols-[220px_1fr]">
          <aside className="space-y-7">
            <div>
              <label className="field-label" htmlFor="search">
                Search the list
              </label>
              <input
                id="search"
                className="field-control"
                placeholder="calculator, guitar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <p className="field-label">Category</p>
              <div className="flex flex-wrap gap-2 lg:block">
                {categories.map((value) => (
                  <button
                    key={value}
                    onClick={() => setCategory(value)}
                    className={`mr-2 mb-2 border px-3 py-2 text-left text-xs ${category === value ? "border-[#17213d] bg-[#17213d] text-[#fffdf9]" : "border-[#d8d5cf] hover:border-[#175c58]"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="field-label" htmlFor="type">
                Looking for
              </label>
              <select
                id="type"
                className="field-control"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="All">Anything</option>
                <option value="borrow">To borrow</option>
                <option value="sell">To buy</option>
              </select>
            </div>
          </aside>
          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs uppercase text-[#687087]">
                {loading
                  ? "Loading"
                  : `${items.length} result${items.length === 1 ? "" : "s"}`}
              </p>
              <select
                aria-label="Sort listings"
                className="border-0 border-b hairline bg-transparent py-2 text-xs outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Recently added</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
            {error ? (
              <ErrorMessage message={error} />
            ) : loading ? (
              <LoadingRows count={5} />
            ) : sortedItems.length === 0 ? (
              <EmptyState
                title="Nothing matches yet."
                body="Try a broader search or be the first student to list what you have."
                action={
                  <Link to="/list-item" className="btn-primary mt-6">
                    List an item
                  </Link>
                }
              />
            ) : (
              <div>
                {sortedItems.map((item) => (
                  <ListingCard key={item._id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default ListingsPage;
