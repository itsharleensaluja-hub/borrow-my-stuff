import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItemsAPI } from "../api/items";
import { API_ORIGIN } from "../api/config";
import SiteNav from "../components/SiteNav";

const pathways = [
  {
    index: "01",
    title: "Borrow",
    body: "Find the useful thing you need for a day, a week, or a semester.",
    href: "/listings",
    tone: "bg-[#d9ece7]",
  },
  {
    index: "02",
    title: "Lend",
    body: "Turn idle gear into a little extra room in your budget.",
    href: "/list-item",
    tone: "bg-[#fff0c8]",
  },
  {
    index: "03",
    title: "Ask for help",
    body: "Post the small campus tasks that make a busy week easier.",
    href: "/ask-help",
    tone: "bg-[#ece6dc]",
  },
];

function HomePage() {
  const [featured, setFeatured] = useState([]);
  useEffect(() => {
    getItemsAPI()
      .then((items) => setFeatured(items.slice(0, 2)))
      .catch(() => setFeatured([]));
  }, []);
  return (
    <div className="page-shell">
      <SiteNav />
      <main>
        <section className="container-wide grid min-h-[620px] items-stretch gap-8 py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:py-20">
          <div className="fade-up relative min-h-[520px] overflow-hidden border border-[#17213d] bg-[#175c58] text-[#fffdf9]">
            <img
              src="/college-essentials.jpg"
              alt="Students sharing books, laptops and everyday college essentials"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,33,61,.08),rgba(15,64,62,.9))]" />
            <div className="relative flex h-full min-h-[520px] flex-col justify-between p-6 sm:p-8">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-[.18em] text-[#fffdf9]">
                  Borrow My Stuff / Campus essentials
                </span>
                <span className="font-mono text-xs text-[#d9ece7]">01</span>
              </div>
              <div className="max-w-xl">
                <p className="eyebrow text-[#d9ece7]">A better campus economy</p>
                <h1 className="font-display mt-5 text-5xl leading-[.98] tracking-[-.04em] sm:text-7xl">
                  One stop solution for all your{" "}
                  <em className="text-[#b8d99a]">college essentials.</em>
                </h1>
                <p className="mt-6 max-w-lg text-base leading-7 text-[#f7f3eb] sm:text-lg">
                  Find useful things nearby, share what you own, and make
                  campus life a little easier.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link to="/listings" className="btn-quiet">
                    Browse essentials <span aria-hidden>↗</span>
                  </Link>
                  <Link
                    to="/list-item"
                    className="border border-[#fffdf9] px-[18px] py-3 text-[13px] font-bold text-[#fffdf9] transition-colors hover:bg-[#fffdf9] hover:text-[#17213d]"
                  >
                    Share something
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="relative min-h-[440px] overflow-hidden border border-[#17213d] bg-[#175c58] p-6 text-[#fffdf9]">
            <div className="absolute right-0 top-0 h-40 w-40 border-l border-b border-[#fffdf955]" />
            <div className="absolute bottom-0 left-0 h-32 w-32 border-r border-t border-[#fffdf955]" />
            <div className="relative flex h-full min-h-[388px] flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-[.18em] text-[#d9ece7]">
                  Campus exchange / 01
                </span>
                <span className="font-mono text-xs text-[#d9ece7]">2026</span>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-[.16em] text-[#d9ece7]">
                  Today’s useful objects
                </p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {featured.length ? (
                    featured.map((item, index) => (
                      <Link
                        to={`/item/${item._id}`}
                        key={item._id}
                        className={`${index ? "mt-8" : ""} border border-[#fffdf955] bg-[#fffdf915] p-4 transition-transform hover:-translate-y-1`}
                      >
                        {item.images?.[0]?.url ? (
                          <img
                            src={`${API_ORIGIN}${item.images[0].url}`}
                            alt={item.images[0].alt || item.title}
                            className="mb-4 aspect-[4/3] w-full object-cover"
                          />
                        ) : (
                          <span className="font-display text-4xl">
                            {item.title?.slice(0, 1).toUpperCase()}
                          </span>
                        )}
                        <p className="mt-3 line-clamp-2 text-sm">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs text-[#d9ece7]">
                          ₹{item.price} /{" "}
                          {item.per === "flat" ? "flat" : item.per}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <div className="col-span-2 border border-[#fffdf955] bg-[#fffdf915] p-4">
                      <span className="font-display text-4xl">+</span>
                      <p className="mt-8 text-sm">Your next useful thing</p>
                      <p className="mt-1 text-xs text-[#d9ece7]">
                        Be the first to list it
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-end justify-between border-t border-[#fffdf955] pt-4 text-xs text-[#d9ece7]">
                <span>Borrow less. Share more.</span>
                <span>↘</span>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y hairline bg-[#fffdf9]">
          <div className="container-wide grid gap-8 py-16 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="eyebrow">Start where you are</p>
              <h2 className="font-display mt-4 text-4xl leading-tight">
                The campus is already full of answers.
              </h2>
            </div>
            <div className="grid gap-0 border-t hairline sm:grid-cols-3 sm:border-t-0">
              {pathways.map((path) => (
                <Link
                  key={path.title}
                  to={path.href}
                  className={`group border-b hairline p-5 transition-transform hover:-translate-y-1 sm:border-l sm:border-b-0 ${path.tone}`}
                >
                  <span className="font-mono text-xs">{path.index}</span>
                  <h3 className="mt-10 font-display text-3xl">{path.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5e625a]">
                    {path.body}
                  </p>
                  <span className="mt-8 block text-xl transition-transform group-hover:translate-x-1">
                    ↗
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b hairline bg-[#fffdf9]">
          <div className="container-wide py-16">
            <div className="flex flex-col justify-between gap-5 border-b border-[#17213d] pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow">Browse by need</p>
                <h2 className="font-display mt-3 text-4xl">
                  Start with a category.
                </h2>
              </div>
              <Link
                to="/listings"
                className="font-mono text-xs uppercase text-[#175c58]"
              >
                See everything ↗
              </Link>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-px border border-[#17213d] bg-[#17213d] sm:grid-cols-4">
              {["Electronics", "Books", "Instruments", "Sports"].map(
                (category, index) => (
                  <Link
                    key={category}
                    to={`/listings?category=${category}`}
                    className={`p-5 ${index % 2 ? "bg-[#d9ece7]" : "bg-[#e2efdc]"} transition-colors hover:bg-[#d88968]`}
                  >
                    <span className="font-mono text-xs">0{index + 1}</span>
                    <p className="mt-12 font-display text-2xl">{category}</p>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="container-wide grid gap-10 py-20 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="eyebrow">How it works</p>
            <h2 className="font-display mt-4 max-w-md text-5xl leading-tight">
              Keep good things in circulation.
            </h2>
          </div>
          <ol className="border-t hairline">
            {[
              "Search the campus",
              "Make a clear request",
              "Meet, exchange, return",
            ].map((step, index) => (
              <li
                key={step}
                className="grid grid-cols-[52px_1fr] border-b hairline py-5"
              >
                <span className="font-mono text-sm text-[#a94d3c]">
                  0{index + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold">{step}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#687087]">
                    {index === 0
                      ? "Filter by what you need, where it is, and whether it is available."
                      : index === 1
                        ? "Dates, rules, and a real owner keep every exchange straightforward."
                        : "The best marketplace interaction is the one that feels like campus life."}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <footer className="border-t border-[#17213d] bg-[#17213d] py-10 text-[#fffdf9]">
        <div className="container-wide flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-2xl">Borrow My Stuff</p>
            <p className="mt-2 text-sm text-[#cbd0c5]">
              Useful things, closer to home.
            </p>
          </div>
          <p className="font-mono text-xs text-[#cbd0c5]">
            Built for campus / 2026
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
