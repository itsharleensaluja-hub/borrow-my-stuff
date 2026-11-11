import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getItemByIdAPI } from "../api/items";
import { createBookingAPI } from "../api/bookings";
import { API_ORIGIN } from "../api/config";
import { useAuth } from "../context/useAuth";
import SiteNav from "../components/SiteNav";
import { ErrorMessage, LoadingRows } from "../components/PageStates";

function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [booking, setBooking] = useState(false);
  const [dates, setDates] = useState({ startDate: "", endDate: "" });
  const [selectedImage, setSelectedImage] = useState(0);

  const fetchItem = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setItem(await getItemByIdAPI(id));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    fetchItem();
  }, [fetchItem]);
  const handleBooking = async () => {
    if (!user) return navigate("/");
    if (!dates.startDate || !dates.endDate)
      return setError("Choose both dates to continue.");
    if (new Date(dates.startDate) > new Date(dates.endDate))
      return setError("The end date must be after the start date.");
    try {
      setBooking(true);
      setError("");
      await createBookingAPI(id, dates.startDate, dates.endDate);
      setSuccess("Request sent. The owner will confirm the booking.");
      await fetchItem();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBooking(false);
    }
  };
  const today = (() => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000)
      .toISOString()
      .split("T")[0];
  })();
  if (loading)
    return (
      <div className="page-shell">
        <SiteNav />
        <main className="container-wide py-16">
          <LoadingRows count={4} />
        </main>
      </div>
    );
  if (!item)
    return (
      <div className="page-shell">
        <SiteNav />
        <main className="container-wide py-16">
          <ErrorMessage message={error || "Item not found"} />
          <Link to="/listings" className="btn-primary mt-6">
            Back to listings
          </Link>
        </main>
      </div>
    );

  return (
    <div className="page-shell">
      <SiteNav />
      <main className="container-wide py-10 lg:py-16">
        <Link
          to="/listings"
          className="font-mono text-xs uppercase text-[#687087] hover:text-[#175c58]"
        >
          ← Back to the list
        </Link>
        <div className="mt-8 grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="relative flex aspect-square max-h-[560px] flex-col justify-between overflow-hidden border border-[#17213d] bg-[#ece6dc] p-6">
              {item.images?.length ? (
                <img
                  src={`${API_ORIGIN}${item.images[selectedImage]?.url || item.images[0].url}`}
                  alt={item.images[selectedImage]?.alt || item.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="font-display text-[clamp(7rem,20vw,14rem)] leading-none text-[#175c58]">
                  {item.title?.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="relative flex justify-between font-mono text-xs uppercase text-[#687087]">
                <span>{item.category}</span>
                <span>{item.type === "borrow" ? "To borrow" : "For sale"}</span>
              </div>
              <div className="relative mt-auto flex justify-between border-t border-[#17213d55] pt-3 font-mono text-xs text-[#687087]">
                <span>
                  {item.available ? "Available now" : "Currently unavailable"}
                </span>
                <span>↘</span>
              </div>
            </div>
            {item.images?.length > 1 && (
              <div className="mt-3 grid grid-cols-6 gap-2">
                {item.images.map((image, index) => (
                  <button
                    key={image.url}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square overflow-hidden border-2 ${selectedImage === index ? "border-[#175c58]" : "border-transparent"}`}
                  >
                    <img
                      src={`${API_ORIGIN}${image.url}`}
                      alt={image.alt || `${item.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {item.rules?.length > 0 && (
              <div className="mt-5 border-t hairline pt-5">
                <p className="eyebrow mb-4">Owner’s notes</p>
                <ul className="space-y-2 text-sm text-[#687087]">
                  {item.rules.map((rule) => (
                    <li key={rule}>— {rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <p className="eyebrow">
              {item.type === "borrow" ? "Available to borrow" : "Campus sale"}
            </p>
            <h1 className="font-display mt-4 text-6xl leading-none">
              {item.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#687087]">
              {item.description}
            </p>
            <div className="mt-8 flex items-end justify-between border-y hairline py-5">
              <div>
                <p className="font-mono text-xs uppercase text-[#687087]">
                  Listed by
                </p>
                <p className="mt-2 text-sm font-bold">
                  {item.owner?.name || "Student"}{" "}
                  <span className="font-normal text-[#687087]">
                    / {item.owner?.hostel || "Campus"}
                  </span>
                </p>
              </div>
              <p className="font-display text-4xl">
                ₹{item.price}
                <span className="ml-1 font-sans text-sm font-normal text-[#687087]">
                  {item.per === "flat" ? "flat" : `/ ${item.per}`}
                </span>
              </p>
            </div>
            {error && (
              <div className="mt-6">
                <ErrorMessage message={error} />
              </div>
            )}
            {success && (
              <div className="mt-6 border border-[#91b59e] bg-[#d9ece7] px-4 py-3 text-sm text-[#175c58]">
                {success}
              </div>
            )}
            {item.type === "borrow" &&
              item.owner?._id !== user?._id &&
              item.available && (
                <div className="mt-8 border border-[#d8d5cf] bg-[#fffdf9] p-5">
                  <p className="eyebrow">Choose your dates</p>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label" htmlFor="startDate">
                        Start
                      </label>
                      <input
                        id="startDate"
                        type="date"
                        min={today}
                        className="field-control"
                        value={dates.startDate}
                        onChange={(e) =>
                          setDates({ ...dates, startDate: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="endDate">
                        End
                      </label>
                      <input
                        id="endDate"
                        type="date"
                        min={dates.startDate || today}
                        className="field-control"
                        value={dates.endDate}
                        onChange={(e) =>
                          setDates({ ...dates, endDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleBooking}
                    disabled={booking}
                    className="btn-quiet mt-5 w-full"
                  >
                    {booking ? "Sending request..." : "Request this item"}
                  </button>
                </div>
              )}
            {item.type === "sell" && (
              <div className="mt-8 border border-[#d8d5cf] bg-[#fff0c8] p-5 text-sm leading-6 text-[#687087]">
                This sale listing is informational for now. Online purchase and
                payment are not available.
              </div>
            )}
            {item.owner?._id === user?._id && (
              <div className="mt-8 border border-[#b8cdbb] bg-[#d9ece7] p-4 text-sm text-[#175c58]">
                This is your listing.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ItemDetailPage;
