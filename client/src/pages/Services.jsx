import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Music2, Video, Mic2, PartyPopper, X, ArrowRight } from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";
import SEO from "../components/seo/SEO";
import { getWorks } from "../services/works.api";
import FireCards from "../components/home/FireCards";
import { listServices } from "../services/services.api";

// --- CONFIGURATION: MAP KEYS TO LOGO IMAGES ---
// Place your logo images in the 'public' folder or import them here.
const LOGO_ASSETS = {
  acoustic: "/images/logos/acoustic.png", // Example path
  music: "/images/logos/music.png",
  films: "/images/logos/films.png",
  entertainment: "/images/logos/entertainment.png",
};

const FALLBACK_SERVICES = [
  { 
    key: "acoustic", 
    title: "Fire Acoustic", 
    tag: "Acoustic", 
    desc: "Premium acoustic sound, live audio capture, and room-tuned mixes that feel real.", 
    icon: Mic2 
  },
  { 
    key: "music", 
    title: "Fire Music", 
    tag: "Music", 
    desc: "Original music, mixing, and mastering engineered for streaming and brand identity.", 
    icon: Music2 
  },
  { 
    key: "films", 
    title: "Fire Films", 
    tag: "Films", 
    desc: "Cinematic filming, color grading, and edits designed to hold attention.", 
    icon: Video 
  },
  { 
    key: "entertainment", 
    title: "Fire Entertainment", 
    tag: "Entertainment", 
    desc: "Creative show concepts and immersive experiences built for maximum impact.", 
    icon: PartyPopper 
  },
];

// Derive API origin for resolving relative image URLs
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

const resolveImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${API_ORIGIN}${url}`;
  if (url.startsWith('/api/')) return `${API_ORIGIN}${url}`;
  return url; // public asset path
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur">
      <div className="h-10 w-10 rounded-xl bg-muted/30" />
      <div className="mt-4 h-4 w-2/3 rounded bg-muted/30" />
      <div className="mt-3 h-3 w-full rounded bg-muted/20" />
      <div className="mt-2 h-3 w-5/6 rounded bg-muted/20" />
      <div className="mt-5 h-8 w-28 rounded-full bg-muted/25" />
    </div>
  );
}

export default function Services() {
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState(FALLBACK_SERVICES);
  const shouldReduceMotion = useReducedMotion();

  // Helper: map a DB service into UI card format
  const mapDbService = (s) => {
    // Determine Tag and Category
    const tag = s.category || (
      s.name?.includes('Acoustic') ? 'Acoustic' : 
      s.name?.includes('Music') ? 'Music' : 
      s.name?.includes('Film') ? 'Films' : 
      s.name?.includes('Entertainment') ? 'Entertainment' : 
      s.name || ''
    );

    // Determine Fallback Icon
    const icon = tag === 'Acoustic' ? Mic2 : 
                 tag === 'Music' ? Music2 : 
                 tag === 'Films' ? Video : 
                 tag === 'Entertainment' ? PartyPopper : 
                 Sparkles;

    const key = s.id || s._id || s.name;
    
    // Check if we have a mapped logo for this key (lowercased) or a logo URL from DB
    const logoKey = Object.keys(LOGO_ASSETS).find(k => s.name?.toLowerCase().includes(k)) || key;
    // Use imageUrl from DB (uploaded via Admin) or fallback to mapped logo
    const customLogo = resolveImageUrl(s.imageUrl) || LOGO_ASSETS[logoKey];

    return { 
      key, 
      title: s.name, 
      tag, 
      desc: s.description || '', 
      icon,
      logo: customLogo // Attach the logo path if found
    };
  };

  // Merge DB services with fallback so defaults stay visible
  const mergeServices = (dbList) => {
    const mapped = Array.isArray(dbList) ? dbList.map(mapDbService) : [];
    // If DB has services, use them only (no fallback to avoid duplicates)
    if (mapped.length > 0) return mapped;
    // Otherwise, show defaults with configured logos
    return FALLBACK_SERVICES.map((svc) => ({ ...svc, logo: LOGO_ASSETS[svc.key] }));
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getWorks();
        setItems(Array.isArray(data) ? data : []);
        // Load services and merge with fallback
        try {
          const svc = await listServices();
          setServices(mergeServices(svc));
        } catch {}
      } catch (e) {
        console.error("Failed to load works", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Live refresh when services are updated from admin
  useEffect(() => {
    const handler = async () => {
      try {
        const svc = await listServices();
        setServices(mergeServices(svc));
      } catch {}
    };
    window.addEventListener('services:updated', handler);
    return () => window.removeEventListener('services:updated', handler);
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.key === selected) || null,
    [selected, services]
  );

  const filtered = useMemo(() => {
    if (!selectedService) return [];
    const tag = selectedService.tag;
    return items.filter((w) => (w.tags || []).includes(tag) || (w.category || '') === tag);
  }, [items, selectedService]);

  const toggle = (key) => setSelected((prev) => (prev === key ? null : key));

  const wrap = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0.01 }
        : { staggerChildren: 0.06, delayChildren: 0.04 },
    },
  };

  const item = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, y: 14, filter: "blur(6px)" },
    show: shouldReduceMotion
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55 } },
  };

  return (
    <section className="relative py-16 sm:py-20">
      <SEO
        title="Services"
        description="Explore Fire Productions services: music production, acoustic & live audio, film production, and entertainment."
        path="/services"
      />
      {/* subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="container">
        <motion.div variants={wrap} initial="hidden" animate="show">
          <motion.div variants={item}>
            <SectionTitle
              title="Services"
              subtitle="Explore our capabilities — select a service to see related projects"
            />
          </motion.div>

          {/* Services grid */}
          <motion.div
            variants={wrap}
            initial="hidden"
            animate="show"
            className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {services.map((s) => {
              const active = selected === s.key;
              const Icon = s.icon;
              const hasLogo = !!s.logo;

              return (
                <motion.button
                  key={s.key}
                  variants={item}
                  type="button"
                  onClick={() => toggle(s.key)}
                  onKeyDown={(e) => (e.key === "Enter" ? toggle(s.key) : null)}
                  aria-pressed={active}
                  className={[
                    "group relative w-full rounded-2xl border p-5 text-left",
                    "transition will-change-transform",
                    "bg-card/40 backdrop-blur-xl",
                    "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60",
                    active
                      ? "border-brand-600/60 ring-1 ring-brand-600/25"
                      : "border-border/60 hover:border-brand-600/25",
                  ].join(" ")}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                >
                  {/* top glow */}
                  <span
                    className={[
                      "pointer-events-none absolute inset-x-0 top-0 h-px",
                      "bg-gradient-to-r from-transparent via-brand-600/35 to-transparent",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                      "transition-opacity duration-300",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <div className="flex items-start justify-between gap-3">
                    {/* ICON OR LOGO CONTAINER */}
                    <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/40 overflow-hidden">
                      <Icon className={["h-5 w-5", active ? "text-brand-600" : "text-text"].join(" ")} />
                      {hasLogo && (
                        <img 
                          src={s.logo} 
                          alt={`${s.title} Logo`}
                          className="absolute inset-0 h-full w-full object-contain p-1.5"
                          onError={(e) => { try { e.currentTarget.style.display = 'none' } catch {} }}
                        />
                      )}
                    </div>

                    <span
                      className={[
                        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                        active
                          ? "bg-brand-600/12 text-brand-600 ring-1 ring-brand-600/25"
                          : "bg-background/30 text-muted ring-1 ring-border/50",
                      ].join(" ")}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {s.tag}
                    </span>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-text">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.desc}</p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-muted">
                      {active ? "Selected" : "Click to view projects"}
                    </span>
                    <span
                      className={[
                        "inline-flex items-center gap-2 text-sm font-semibold",
                        active ? "text-brand-600" : "text-text group-hover:text-brand-600",
                        "transition-colors",
                      ].join(" ")}
                    >
                      Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  {/* active corner */}
                  {active && (
                    <span
                      className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-600/15 blur-2xl"
                      aria-hidden="true"
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Selected projects panel */}
          <AnimatePresence mode="wait">
            {selectedService && (
              <motion.div
                key={selectedService.key}
                initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
                transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.35 }}
                className="mt-12"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <SectionTitle title={`${selectedService.title} Projects`} />
                    <p className="mt-2 text-sm text-muted">
                      Showing projects tagged as <span className="text-text font-semibold">{selectedService.tag}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm font-semibold text-text backdrop-blur transition hover:bg-card/60 hover:border-brand-600/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60"
                  >
                    <X className="h-4 w-4" />
                    Clear selection
                  </button>
                </div>

                <div className="mt-6 rounded-2xl border border-border/60 bg-card/30 p-4 backdrop-blur-xl sm:p-6">
                  {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  ) : (
                    <>
                      <FireCards items={filtered} />
                      {filtered.length === 0 && (
                        <p className="mt-4 text-sm text-muted">
                          No projects found for this service yet.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}