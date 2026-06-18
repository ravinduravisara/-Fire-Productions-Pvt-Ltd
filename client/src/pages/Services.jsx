import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Music2,
  Video,
  Mic2,
  PartyPopper,
  X,
  ArrowRight,
} from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";
import SEO from "../components/seo/SEO";
import { getWorks } from "../services/works.api";
import FireCards from "../components/home/FireCards";
import { listServices } from "../services/services.api";

const LOGO_ASSETS = {
  acoustic: "/images/logos/acoustic.png",
  music: "/images/logos/music.png",
  films: "/images/logos/films.png",
  entertainment: "/images/logos/entertainment.png",
};

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/^fire\s+/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const cleanText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/^fire\s+/, "")
    .trim();

const FALLBACK_SERVICES = [
  {
    key: "acoustic",
    title: "Fire Acoustic",
    tag: "Acoustic",
    desc: "Premium acoustic sound, live audio capture, and room-tuned mixes that feel real.",
    icon: Mic2,
    order: 2,
  },
  {
    key: "music",
    title: "Fire Music",
    tag: "Music",
    desc: "Original music, mixing, and mastering engineered for streaming and brand identity.",
    icon: Music2,
    order: 1,
  },
  {
    key: "films",
    title: "Fire Films",
    tag: "Films",
    desc: "Cinematic filming, color grading, and edits designed to hold attention.",
    icon: Video,
    order: 4,
  },
  {
    key: "entertainment",
    title: "Fire Entertainment",
    tag: "Entertainment",
    desc: "Creative show concepts and immersive experiences built for maximum impact.",
    icon: PartyPopper,
    order: 3,
  },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");
const CACHE_TTL_MS = 5 * 60 * 1000;

const readCache = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;

    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== "object") return null;
    if (!obj.ts || Date.now() - obj.ts > CACHE_TTL_MS) return null;

    return obj.data || null;
  } catch {
    return null;
  }
};

const writeCache = (key, data) => {
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
};

const resolveImageUrl = (url) => {
  if (!url) return null;
  const value = String(url);

  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/uploads")) return `${API_ORIGIN}${value}`;
  if (value.startsWith("/api/")) return `${API_ORIGIN}${value}`;

  return value;
};

const normalizeWork = (work) => {
  if (!work) return null;

  const imageUrls = Array.isArray(work.imageUrls)
    ? work.imageUrls
    : Array.isArray(work.images)
      ? work.images
      : [];

  return {
    ...work,
    id: work.id || work._id || work.oldId,
    title: work.title || "",
    description: work.description || "",
    imageUrl: work.imageUrl || work.image || work.url || imageUrls[0] || "",
    imageUrls,
    category: work.category || "",
    tags: Array.isArray(work.tags) ? work.tags : [],
  };
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
  const location = useLocation();
  const { serviceSlug } = useParams();

  const isServiceRoute = Boolean(serviceSlug);
  const shouldReduceMotion = useReducedMotion();

  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [services, setServices] = useState([]);

  const initRef = useRef(false);
  const prefetchedRef = useRef(new Set());
  const panelRef = useRef(null);
  const returnWorkIdRef = useRef(null);
  const suppressPanelScrollRef = useRef(false);

  const mapDbService = (s) => {
    const name = s.name || s.title || "";
    const tag =
      s.category ||
      s.tag ||
      (name.includes("Acoustic")
        ? "Acoustic"
        : name.includes("Music")
          ? "Music"
          : name.includes("Film")
            ? "Films"
            : name.includes("Entertainment")
              ? "Entertainment"
              : name || "");

    const icon =
      tag === "Acoustic"
        ? Mic2
        : tag === "Music"
          ? Music2
          : tag === "Films"
            ? Video
            : tag === "Entertainment"
              ? PartyPopper
              : Sparkles;

    const key = s.id || s._id || s.oldId || slugify(name || tag);
    const logoKey =
      Object.keys(LOGO_ASSETS).find((k) => name.toLowerCase().includes(k)) ||
      slugify(tag);
    const customLogo = resolveImageUrl(s.imageUrl || s.logo) || LOGO_ASSETS[logoKey];

    return {
      key,
      title: name,
      tag,
      desc: s.description || s.desc || "",
      icon,
      logo: customLogo,
      order: Number.isFinite(s.order) ? s.order : undefined,
    };
  };

  const mergeServices = (dbList) => {
    const mapped = Array.isArray(dbList) ? dbList.map(mapDbService) : [];

    const byOrder = (a, b) => {
      const ao = Number.isFinite(a?.order) ? a.order : Number.MAX_SAFE_INTEGER;
      const bo = Number.isFinite(b?.order) ? b.order : Number.MAX_SAFE_INTEGER;
      return ao - bo;
    };

    if (mapped.length > 0) return mapped.slice().sort(byOrder);

    return FALLBACK_SERVICES.map((svc) => ({
      ...svc,
      logo: LOGO_ASSETS[svc.key],
    })).sort(byOrder);
  };

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    (async () => {
      try {
        const cachedServices = readCache("servicesCache");
        const cachedWorks = readCache("worksCache");
        const hadCache = Array.isArray(cachedWorks) || Array.isArray(cachedServices);

        if (Array.isArray(cachedServices)) {
          setServices(mergeServices(cachedServices));
          setServicesLoading(false);
        }

        if (Array.isArray(cachedWorks)) {
          setItems(cachedWorks.map(normalizeWork).filter(Boolean));
          setLoading(false);
        }

        if (!hadCache) {
          setServicesLoading(true);
          setLoading(true);
        }

        const [svc, data] = await Promise.all([
          listServices().catch(() => []),
          getWorks().catch(() => []),
        ]);

        if (Array.isArray(svc)) {
          writeCache("servicesCache", svc);
          setServices(mergeServices(svc));
        }

        if (Array.isArray(data)) {
          const normalized = data.map(normalizeWork).filter(Boolean);
          writeCache("worksCache", normalized);
          setItems(normalized);
        }
      } catch (e) {
        console.error("Failed to load data", e);
      } finally {
        setServicesLoading(false);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!services.length) return;

    const routeSlug = String(serviceSlug || "").toLowerCase();
    const hashSlug = String(location.hash || "").replace("#", "").toLowerCase();
    const targetSlug = routeSlug || hashSlug;

    if (!targetSlug) return;

    const svc = services.find((s) => slugify(s.tag || s.title) === targetSlug);
    if (svc) setSelected(svc.key);
  }, [serviceSlug, location.hash, services]);

  const imageSrcsForWork = (w) => {
    const list =
      Array.isArray(w.imageUrls) && w.imageUrls.length
        ? w.imageUrls
        : [w.imageUrl || w.image || w.url].filter(Boolean);

    return list
      .map(resolveImageUrl)
      .filter(Boolean);
  };

  const prefetchForTag = (tag) => {
    try {
      if (!tag || prefetchedRef.current.has(tag)) return;

      const target = cleanText(tag);

      const pool = items
        .filter((w) => {
          const category = cleanText(w.category);
          const tags = Array.isArray(w.tags) ? w.tags.map(cleanText) : [];

          return category === target || tags.includes(target);
        })
        .flatMap(imageSrcsForWork)
        .slice(0, 12);

      pool.forEach((src) => {
        const img = new Image();

        try {
          img.loading = "eager";
          img.decoding = "async";
        } catch {}

        img.src = src;
      });

      prefetchedRef.current.add(tag);
    } catch {}
  };

  useEffect(() => {
    if (!items.length || !services.length) return;

    const tags = Array.from(new Set(services.map((s) => s.tag).filter(Boolean)));

    const schedule =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback
        : (fn) => setTimeout(fn, 300);

    schedule(() => {
      try {
        tags.forEach((t) => prefetchForTag(t));
      } catch {}
    });
  }, [items, services]);

  useEffect(() => {
    const handler = async () => {
      try {
        const svc = await listServices();
        setServices(mergeServices(svc));
      } catch {}
    };

    window.addEventListener("services:updated", handler);

    return () => window.removeEventListener("services:updated", handler);
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => s.key === selected) || null,
    [selected, services]
  );

  const visibleServices = useMemo(() => {
    if (!isServiceRoute) return services;

    const routeSlug = String(serviceSlug || "").toLowerCase();

    return services.filter((s) => slugify(s.tag || s.title) === routeSlug);
  }, [isServiceRoute, serviceSlug, services]);

  const filtered = useMemo(() => {
    if (!selectedService) return [];

    const serviceTag = cleanText(selectedService.tag);
    const serviceTitle = cleanText(selectedService.title);

    const matched = items.filter((w) => {
      const category = cleanText(w.category);
      const tags = Array.isArray(w.tags) ? w.tags.map(cleanText) : [];

      return (
        category === serviceTag ||
        category === serviceTitle ||
        tags.includes(serviceTag) ||
        tags.includes(serviceTitle)
      );
    });

    // Important migration fix:
    // If old PostgreSQL service relation no longer matches after MongoDB import,
    // show all works instead of showing an empty page.
    return matched.length > 0 ? matched : items;
  }, [items, selectedService]);

  const toggle = (key) =>
    setSelected((prev) => (isServiceRoute ? key : prev === key ? null : key));

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
      : {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          transition: { duration: 0.55 },
        },
  };

  useEffect(() => {
    if (!selectedService || !panelRef.current) return;

    try {
      if (
        suppressPanelScrollRef.current ||
        sessionStorage.getItem("suppressPanelScroll") === "1"
      ) {
        return;
      }

      const src = sessionStorage.getItem("returnToSource");
      const wid = sessionStorage.getItem("returnToWorkId");
      let tag = sessionStorage.getItem("returnToServiceTag");
      const allowed = ["Acoustic", "Entertainment"];

      if (!tag && wid && Array.isArray(items) && items.length) {
        const w = items.find((it) => String(it.id || it._id) === String(wid));
        if (w) tag = (Array.isArray(w.tags) && w.tags.find(Boolean)) || w.category || "";
      }

      const shouldSkip = src === "services" && wid && allowed.includes(String(tag));

      if (!shouldSkip) {
        const rect = panelRef.current.getBoundingClientRect();
        const offset = 80;
        const top = rect.top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: shouldReduceMotion ? "auto" : "smooth",
        });
      }
    } catch {}
  }, [selectedService, shouldReduceMotion, items]);

  useEffect(() => {
    if (!returnWorkIdRef.current) {
      try {
        const src = sessionStorage.getItem("returnToSource");
        const wid = sessionStorage.getItem("returnToWorkId");

        if (src === "services" && wid) returnWorkIdRef.current = wid;
      } catch {}
    }

    const workId = returnWorkIdRef.current;
    if (!workId) return;

    let svcKey = null;
    let svcTag = null;

    try {
      svcKey = sessionStorage.getItem("returnToServiceKey");
      svcTag = sessionStorage.getItem("returnToServiceTag");
    } catch {}

    const allowed = ["Acoustic", "Entertainment"];

    if (!svcTag) {
      const w = items.find((it) => String(it.id || it._id) === String(workId));
      if (w) svcTag = (Array.isArray(w.tags) && w.tags.find(Boolean)) || w.category || "";
    }

    if (!allowed.includes(String(svcTag))) return;

    try {
      sessionStorage.setItem("suppressPanelScroll", "1");
    } catch {}

    suppressPanelScrollRef.current = true;

    if (svcKey && selected !== svcKey) {
      setSelected(svcKey);
      return;
    }

    if (!svcKey && svcTag) {
      const svc = services.find((s) => s.tag === svcTag);

      if (svc && selected !== svc.key) {
        setSelected(svc.key);
        return;
      }
    }

    if (!selectedService) return;
    if (!allowed.includes(String(selectedService.tag))) return;
    if (!Array.isArray(items) || items.length === 0) return;

    let tries = 0;
    const maxTries = 150;

    const tick = () => {
      const el = document.getElementById(`work-card-${workId}`);

      if (el) {
        try {
          sessionStorage.removeItem("returnToWorkId");
          sessionStorage.removeItem("returnToSource");
          sessionStorage.removeItem("returnToTime");
          sessionStorage.removeItem("returnToServiceKey");
          sessionStorage.removeItem("returnToServiceTag");
        } catch {}

        returnWorkIdRef.current = null;

        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          suppressPanelScrollRef.current = false;

          try {
            sessionStorage.removeItem("suppressPanelScroll");
          } catch {}
        }, 600);

        return;
      }

      tries += 1;

      if (tries < maxTries) {
        requestAnimationFrame(tick);
      } else {
        try {
          sessionStorage.removeItem("returnToWorkId");
          sessionStorage.removeItem("returnToSource");
        } catch {}

        suppressPanelScrollRef.current = false;

        try {
          sessionStorage.removeItem("suppressPanelScroll");
        } catch {}
      }
    };

    setTimeout(() => requestAnimationFrame(tick), 40);
  }, [items, services, selected, selectedService]);

  return (
    <section className="relative py-16 sm:py-20">
      <SEO
        title="Services"
        description="Explore Fire Productions services: music production, acoustic & live audio, film production, and entertainment."
        path="/services"
      />

      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/5 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container">
        <motion.div variants={wrap} initial="hidden" animate="show">
          <motion.div variants={item}>
            <SectionTitle
              title={isServiceRoute ? selectedService?.title || "Service" : "Services"}
              subtitle={
                isServiceRoute
                  ? "Explore related projects for this service"
                  : "Explore our capabilities — select a service to see related projects"
              }
            />
          </motion.div>

          {!isServiceRoute && (
            <motion.div
              variants={wrap}
              initial="hidden"
              animate="show"
              className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {servicesLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : visibleServices.length === 0 ? (
                <div className="col-span-full rounded-2xl border border-border/60 bg-card/30 p-6 text-center text-sm text-muted">
                  Service not found.
                </div>
              ) : (
                visibleServices.map((s) => {
                  const active = selected === s.key;
                  const Icon = s.icon;
                  const hasLogo = Boolean(s.logo);

                  return (
                    <motion.button
                      key={s.key}
                      variants={item}
                      type="button"
                      onClick={() => toggle(s.key)}
                      onMouseEnter={() => prefetchForTag(s.tag)}
                      onKeyDown={(e) => (e.key === "Enter" ? toggle(s.key) : null)}
                      aria-pressed={active}
                      className={[
                        "group relative w-full rounded-2xl border p-5 text-left",
                        "transition",
                        "bg-card/40 backdrop-blur-xl",
                        "hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60",
                        active
                          ? "border-brand-600/60 ring-1 ring-brand-600/25"
                          : "border-border/60 hover:border-brand-600/25",
                      ].join(" ")}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                    >
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
                        <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/40">
                          <Icon
                            className={[
                              "h-5 w-5",
                              active ? "text-brand-600" : "text-text",
                            ].join(" ")}
                          />

                          {hasLogo && (
                            <img
                              src={s.logo}
                              alt={`${s.title} Logo`}
                              loading="lazy"
                              decoding="async"
                              className="absolute inset-0 h-full w-full object-contain p-1.5"
                              onError={(e) => {
                                try {
                                  e.currentTarget.style.display = "none";
                                } catch {}
                              }}
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

                      <h3 className="mt-4 text-base font-semibold text-text">
                        {s.title}
                      </h3>

                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {s.desc}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-muted">
                          {active ? "Selected" : "Click to view projects"}
                        </span>

                        <span
                          className={[
                            "inline-flex items-center gap-2 text-sm font-semibold",
                            active
                              ? "text-brand-600"
                              : "text-text group-hover:text-brand-600",
                            "transition-colors",
                          ].join(" ")}
                        >
                          Explore{" "}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      {active && (
                        <span
                          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand-600/15 blur-2xl"
                          aria-hidden="true"
                        />
                      )}
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          )}

          {isServiceRoute && !servicesLoading && !selectedService && (
            <div className="mt-10 rounded-2xl border border-border/60 bg-card/30 p-6 text-center text-sm text-muted">
              Service not found.
            </div>
          )}

          {selectedService && (
            <div className="mt-12" ref={panelRef}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <SectionTitle title={`${selectedService.title} Projects`} />
                  <p className="mt-2 text-sm text-muted">
                    Showing projects tagged as{" "}
                    <span className="font-semibold text-text">
                      {selectedService.tag}
                    </span>
                  </p>
                </div>

                {!isServiceRoute && (
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/40 px-4 py-2 text-sm font-semibold text-text backdrop-blur transition hover:border-brand-600/25 hover:bg-card/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60"
                  >
                    <X className="h-4 w-4" />
                    Clear selection
                  </button>
                )}
              </div>

              <div className="mt-6 min-h-[360px] rounded-2xl border border-border/60 bg-card/30 p-4 backdrop-blur-xl sm:p-6">
                {loading ? (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </div>
                ) : (
                  <>
                    <FireCards
                      items={filtered}
                      serviceKey={selectedService?.key}
                      serviceTag={selectedService?.tag}
                    />

                    {filtered.length === 0 && (
                      <p className="mt-4 text-sm text-muted">
                        No projects found yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}