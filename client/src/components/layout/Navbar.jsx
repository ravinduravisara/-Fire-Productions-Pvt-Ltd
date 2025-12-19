import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, X, Flame } from "lucide-react";
import logo from "../../assets/logo.svg";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const shouldReduceMotion = useReducedMotion();

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const linkBase =
    "relative text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

  const variants = useMemo(
    () => ({
      bar: {
        hidden: { y: -10, opacity: 0 },
        show: {
          y: 0,
          opacity: 1,
          transition: shouldReduceMotion ? { duration: 0.01 } : { duration: 0.35 },
        },
      },
      mobilePanel: {
        hidden: { opacity: 0, y: -8 },
        show: {
          opacity: 1,
          y: 0,
          transition: shouldReduceMotion ? { duration: 0.01 } : { duration: 0.22 },
        },
        exit: {
          opacity: 0,
          y: -8,
          transition: shouldReduceMotion ? { duration: 0.01 } : { duration: 0.18 },
        },
      },
    }),
    [shouldReduceMotion]
  );

  return (
    <motion.header
      variants={variants.bar}
      initial="hidden"
      animate="show"
      className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl"
    >
      {/* subtle glow line */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-brand-600/35 to-transparent"
        aria-hidden="true"
      />

      <div className="container flex h-16 items-center justify-between">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="relative">
            <img src={logo} alt="Fire Production" className="h-9 w-9" />
            <span
              className="pointer-events-none absolute -inset-2 rounded-full bg-brand-600/10 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>

          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-text">
              Fire Production
            </span>
            <span className="text-[11px] text-muted">Film • Music • Acoustic</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              className={({ isActive }) =>
                [
                  linkBase,
                  "px-3 py-2 rounded-full",
                  isActive
                    ? "text-text"
                    : "text-muted hover:text-text",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{n.label}</span>

                  {/* active pill */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-brand-600/12 ring-1 ring-brand-600/25"
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.01 }
                          : { type: "spring", stiffness: 420, damping: 32 }
                      }
                      aria-hidden="true"
                    />
                  )}

                  {/* hover underline glow */}
                  <span
                    className="pointer-events-none absolute left-1/2 top-[calc(100%-4px)] h-[2px] w-0 -translate-x-1/2 rounded-full bg-brand-600/70 blur-[0.5px] transition-all duration-300 group-hover:w-8"
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Desktop CTA */}
          <Link
            to="/contact"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-600/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60"
          >
            <Flame className="h-4 w-4" />
            Let’s talk
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/40 p-2 text-text shadow-sm backdrop-blur-md transition hover:bg-card/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <motion.div
          variants={variants.mobilePanel}
          initial="hidden"
          animate="show"
          exit="exit"
          className="md:hidden"
        >
          {/* overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* panel */}
          <div className="relative z-50 border-t border-border/60 bg-background/90 backdrop-blur-xl">
            <div className="container py-4">
              <div className="grid gap-1">
                {nav.map((n) => (
                  <NavLink
                    key={n.to}
                    to={n.to}
                    end={n.to === "/"}
                    className={({ isActive }) =>
                      [
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        isActive
                          ? "bg-brand-600/12 text-text ring-1 ring-brand-600/25"
                          : "text-muted hover:bg-card/40 hover:text-text",
                      ].join(" ")
                    }
                  >
                    {n.label}
                    <span className="text-muted">→</span>
                  </NavLink>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/contact"
                  className="flex-1 rounded-2xl bg-brand-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-600/90"
                >
                  Contact
                </Link>
                <Link
                  to="/products"
                  className="flex-1 rounded-2xl border border-border/60 bg-card/40 px-4 py-3 text-center text-sm font-semibold text-text backdrop-blur transition hover:bg-card/60"
                >
                  Products
                </Link>
              </div>

              <p className="mt-3 text-center text-xs text-muted">
                Film • Music • Acoustic Production
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
