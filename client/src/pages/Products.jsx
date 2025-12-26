import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Search,
  SlidersHorizontal,
  Star,
  ImageOff,
  MessageCircle,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";
import SEO from "../components/seo/SEO";
import { getProducts } from "../services/products.api";
import { listCategories } from "../services/categories.api";
import Button from "../components/ui/Button";

const WHATSAPP_NUMBER = "94743678001"; // ✅ change to your number

// Categories are loaded dynamically from the API

function formatLKR(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function getImageSrc(item) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const filesBase = apiBase.replace(/\/api$/, "");
  const raw = item.imageUrl || item.image || item.url || "";
  const imageSrc = raw
    ? String(raw).startsWith("http")
      ? raw
      : `${filesBase}${raw}`
    : "";
  return imageSrc;
}

function getImageSrcList(item) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const filesBase = apiBase.replace(/\/api$/, "");
  const raws = Array.isArray(item.imageUrls) && item.imageUrls.length
    ? item.imageUrls
    : [item.imageUrl || item.image || item.url].filter(Boolean);
  return raws
    .filter((u) => typeof u === 'string' && u.trim())
    .slice(0, 3)
    .map((u) => (String(u).startsWith('http') ? u : `${filesBase}${u}`));
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-card/30 px-3 py-1 text-xs font-semibold text-muted backdrop-blur">
      {children}
    </span>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur">
      <div className="aspect-[16/10] w-full bg-muted/25 animate-pulse" />
      <div className="p-5">
        <div className="h-4 w-2/3 rounded bg-muted/25 animate-pulse" />
        <div className="mt-3 h-3 w-full rounded bg-muted/20 animate-pulse" />
        <div className="mt-2 h-3 w-5/6 rounded bg-muted/20 animate-pulse" />
        <div className="mt-5 flex items-center justify-between">
          <div className="h-4 w-28 rounded bg-muted/25 animate-pulse" />
          <div className="h-9 w-28 rounded-full bg-muted/25 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function ProductCard({ item, onAdd, onPreview }) {
  const reduce = useReducedMotion();
  const images = getImageSrcList(item);
  const [active, setActive] = useState(0);
  const hasImages = images && images.length > 0;
  const max = hasImages ? images.length : 0;
  const prev = () => setActive((i) => (i - 1 + max) % max);
  const next = () => setActive((i) => (i + 1) % max);

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={reduce ? { duration: 0.01 } : { duration: 0.35 }}
      className="group overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-brand-600/25 hover:bg-card/45 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40 cursor-pointer"
      onClick={() => onPreview?.(item)}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-background/40">
        {hasImages ? (
          <>
            <img
              src={images[Math.min(active, images.length - 1)]}
              alt={item.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />

            {images.length > 1 && (
              <>
                {/* Prev/Next controls */}
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>

                {/* Dots */}
                <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={`dot-${i}`}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={(e) => { e.stopPropagation(); setActive(i); }}
                      className={[
                        "h-1.5 w-5 rounded-full transition",
                        i === active ? "bg-brand-600" : "bg-background/60",
                      ].join(" ")}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            <ImageOff className="h-6 w-6" />
          </div>
        )}

        {/* top glow */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-600/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* subtle badge */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Pill>
            <Star className="mr-1 h-3.5 w-3.5 text-brand-600" />
            {item.subCategory ? `${item.category} • ${item.subCategory}` : (item.category || "Fire Acoustic")}
          </Pill>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-text sm:text-base">{item.title}</h3>
          <span className="shrink-0 rounded-full bg-brand-600/12 px-3 py-1 text-xs font-semibold text-brand-600 ring-1 ring-brand-600/25">
            {formatLKR(item.price)}
          </span>
        </div>

        {item.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted">Premium product from Fire Acoustic.</p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-muted">Fast delivery • Quality assured</span>
          <Button
            onClick={(e) => { e.stopPropagation(); onAdd(item); }}
            className="group/btn inline-flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4 transition-transform group-hover/btn:rotate-90" />
            Add
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ProductPreview({ open, item, onClose, onAdd }) {
  const reduce = useReducedMotion();
  const images = item ? getImageSrcList(item) : [];
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-label="Close preview"
          />

          <motion.div
            className="relative mx-auto mt-10 w-full max-w-4xl px-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
            transition={reduce ? { duration: 0.01 } : { duration: 0.25 }}
          >
            <div className="overflow-hidden rounded-3xl border border-border/60 bg-background/90 backdrop-blur-xl">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-2">
                {/* Images */}
                <div className="relative bg-background/40">
                  {images.length ? (
                    <div className="relative">
                      <img
                        src={images[Math.min(active, images.length - 1)]}
                        alt={item.title}
                        className="aspect-[4/3] w-full object-contain bg-background"
                      />

                      {/* Prev/Next controls */}
                      {images.length > 1 && (
                        <>
                          <button
                            type="button"
                            aria-label="Previous image"
                            onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Next image"
                            onClick={() => setActive((i) => (i + 1) % images.length)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-[4/3] flex items-center justify-center text-muted">
                      <ImageOff className="h-6 w-6" />
                    </div>
                  )}

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="border-t border-border/60 bg-background/50 p-3">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        {images.map((src, i) => (
                          <button
                            key={`pv-thumb-${i}`}
                            type="button"
                            onClick={() => setActive(i)}
                            className={[
                              "relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border",
                              i === active ? "border-brand-600 ring-2 ring-brand-600/30" : "border-border/60",
                            ].join(" ")}
                            aria-label={`Show image ${i + 1}`}
                          >
                            <img src={src} alt="thumb" className="h-full w-full object-contain bg-background" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-text">{item.title}</h3>
                      <div className="mt-1 text-xs text-muted">
                        {item.subCategory ? `${item.category} • ${item.subCategory}` : (item.category || "Fire Acoustic")}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                      aria-label="Close"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2">
                    <span className="rounded-full bg-brand-600/12 px-3 py-1 text-sm font-semibold text-brand-600 ring-1 ring-brand-600/25">
                      {formatLKR(item.price)}
                    </span>
                    <span className="text-xs text-muted">In stock</span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {item.description || "Premium product from Fire Acoustic."}
                  </p>

                  {/* Qty + Actions */}
                  <div className="mt-6 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/25 px-2 py-1">
                      <button
                        type="button"
                        onClick={dec}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/30 text-text transition hover:bg-card/50"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-semibold text-text">{qty}</span>
                      <button
                        type="button"
                        onClick={inc}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/30 text-text transition hover:bg-card/50"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => onAdd(item, qty)}
                        className="inline-flex items-center gap-2"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                      <a
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I'm interested in ${item.title} — ${formatLKR(item.price)} (Qty ${qty})`)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Buy Now
                        <ArrowUpRight className="h-4 w-4 opacity-90" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CartDrawer({ open, onClose, cart, onUpdateQty, onRemove, onClear }) {
  const reduce = useReducedMotion();

  const total = useMemo(
    () => cart.reduce((sum, p) => sum + p.price * p.qty, 0),
    [cart]
  );

  const message = useMemo(() => {
    const lines = cart.map((p) => {
      const cat = [p.category, p.subCategory].filter(Boolean).join(" / ");
      const desc = (p.description || "").trim();
      const parts = [
        `• ${p.title} x${p.qty}`,
        cat ? cat : null,
        desc ? desc : null,
        `LKR ${(p.price * p.qty).toLocaleString()}`,
      ].filter(Boolean);
      return parts.join(" — ");
    });
    const text = `Hello, I would like to order:\n${lines.join("\n")}\nTotal: LKR ${total.toLocaleString()}`;
    return encodeURIComponent(text);
  }, [cart, total]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* overlay */}
          <motion.button
            type="button"
            aria-label="Close cart"
            className="fixed inset-0 z-40 cursor-default bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* panel */}
          <motion.aside
            className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-border/60 bg-background/90 backdrop-blur-xl"
            initial={reduce ? { opacity: 0 } : { x: 30, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { x: 30, opacity: 0 }}
            transition={reduce ? { duration: 0.01 } : { type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-brand-600" />
                <div className="font-semibold text-text">Your Cart</div>
                <span className="rounded-full bg-brand-600/12 px-2 py-0.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-600/25">
                  {cart.length}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full border border-border/60 bg-card/30 p-2 text-text transition hover:bg-card/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-64px)] overflow-y-auto px-5 py-5">
              {cart.length === 0 ? (
                <div className="rounded-2xl border border-border/60 bg-card/25 p-6 text-center">
                  <p className="text-sm font-semibold text-text">Cart is empty</p>
                  <p className="mt-1 text-sm text-muted">
                    Add products to place an order via WhatsApp.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cart.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-border/60 bg-card/25 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-text">{p.title}</div>
                            <div className="mt-1 text-xs text-muted">
                              {formatLKR(p.price)} • Subtotal:{" "}
                              <span className="text-text font-semibold">
                                {formatLKR(p.price * p.qty)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => onRemove(p.id)}
                            className="rounded-full border border-border/60 bg-background/30 p-2 text-muted transition hover:text-text hover:bg-card/40"
                            aria-label="Remove item"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/25 px-2 py-1">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(p.id, -1)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/30 text-text transition hover:bg-card/50"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-8 text-center text-sm font-semibold text-text">
                              {p.qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(p.id, +1)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/60 bg-card/30 text-text transition hover:bg-card/50"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <span className="text-xs text-muted">Tap + to add more</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* footer */}
                  <div className="mt-6 rounded-2xl border border-border/60 bg-card/25 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">Total</span>
                      <span className="text-base font-semibold text-text">{formatLKR(total)}</span>
                    </div>

                    <a
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Send WhatsApp Order
                      <ArrowUpRight className="h-4 w-4 opacity-90" />
                    </a>

                    <button
                      type="button"
                      onClick={onClear}
                      className="mt-3 w-full rounded-full border border-border/60 bg-background/25 px-4 py-3 text-sm font-semibold text-text transition hover:bg-card/40"
                    >
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default function Products() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState([]);

  const [cart, setCart] = useState([]); // [{id,title,price,qty}]
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // UI controls
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured"); // featured | price-asc | price-desc | name
  const [minPrice, setMinPrice] = useState("");
  const [category, setCategory] = useState(""); // parent category
  const [subCategory, setSubCategory] = useState(""); // child

  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        const normalized = (data || []).map((d) => ({
          ...d,
          price: Number(d.price ?? 0),
          description: d.description || "",
          category: d.category || "",
          subCategory: d.subCategory || "",
        }));
        setItems(normalized);
        try {
          const allCats = await listCategories();
          setCats(allCats);
        } catch {}
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addToCart = (itm, qty = 1) => {
    const id = itm._id || itm.id;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (existing) {
        return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + Math.max(1, Number(qty) || 1) } : p));
      }
      return [
        ...prev,
        {
          id,
          title: itm.title,
          price: Number(itm.price || 0),
          qty: Math.max(1, Number(qty) || 1),
          category: itm.category || "",
          subCategory: itm.subCategory || "",
          description: itm.description || "",
        },
      ];
    });
    setDrawerOpen(true);
  };

  const cartCount = useMemo(() => cart.reduce((sum, p) => sum + p.qty, 0), [cart]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);

    let list = [...items];

    if (q) {
      list = list.filter((p) => {
        const title = (p.title || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        return title.includes(q) || desc.includes(q);
      });
    }

    if (min != null && !Number.isNaN(min)) {
      list = list.filter((p) => Number(p.price || 0) >= min);
    }

    if (category) list = list.filter((p) => (p.category || "") === category);
    if (subCategory) list = list.filter((p) => (p.subCategory || "") === subCategory);

    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));

    return list;
  }, [items, query, sort, minPrice, category, subCategory]);

  return (
    <section className="relative py-16 sm:py-20">
      <SEO
        title="Products"
        description="Browse Fire Productions products and acoustic materials. Quality-assured items with fast delivery."
        path="/products"
      />
      {/* background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Products" subtitle="All products by Fire Acoustic" />

          {/* Cart button */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border/60 bg-card/30 px-4 py-2 text-sm font-semibold text-text backdrop-blur transition hover:bg-card/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60"
          >
            <ShoppingCart className="h-4 w-4 text-brand-600" />
            Cart
            {cartCount > 0 && (
              <span className="rounded-full bg-brand-600/12 px-2 py-0.5 text-xs font-semibold text-brand-600 ring-1 ring-brand-600/25">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Controls */}
        <div className="mt-8 grid gap-3 rounded-2xl border border-border/60 bg-card/25 p-4 backdrop-blur-xl sm:grid-cols-12 sm:items-center">
          {/* Search */}
          <div className="relative sm:col-span-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-2xl border border-border/60 bg-background/30 py-3 pl-10 pr-3 text-sm text-text placeholder:text-muted outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          {/* Min price */}
          <div className="sm:col-span-2">
            <input
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              inputMode="numeric"
              placeholder="Min price (LKR)"
              className="w-full rounded-2xl border border-border/60 bg-background/30 px-3 py-3 text-sm text-text placeholder:text-muted outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-4">
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubCategory("");
                }}
                className="w-full appearance-none rounded-2xl border border-border/60 bg-background/30 py-3 pl-10 pr-9 text-sm text-text outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20"
              >
                <option value="">All categories</option>
                {cats.filter((c) => !c.parent).map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">▾</span>
            </div>
          </div>

          {/* Subcategory */}
          <div className="sm:col-span-4">
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border/60 bg-background/30 py-3 pl-10 pr-9 text-sm text-text outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20"
              >
                <option value="">All subcategories</option>
                {cats
                  .filter((c) => {
                    const parent = cats.find((p) => !p.parent && p.name === category);
                    return parent && String(c.parent) === String(parent.id);
                  })
                  .map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">▾</span>
            </div>
          </div>

          {/* Sort */}
          <div className="sm:col-span-2">
            <div className="relative">
              <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-border/60 bg-background/30 py-3 pl-10 pr-9 text-sm text-text outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="name">Name: A → Z</option>
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                ▾
              </span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted">
                  Showing <span className="text-text font-semibold">{filtered.length}</span>{" "}
                  product{filtered.length === 1 ? "" : "s"}
                </p>
                {(query || minPrice || category || subCategory) && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setMinPrice("");
                      setCategory("");
                      setSubCategory("");
                    }}
                    className="text-sm font-semibold text-muted transition hover:text-brand-600"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((item) => (
                  <ProductCard
                    key={item._id || item.id}
                    item={item}
                    onAdd={addToCart}
                    onPreview={(itm) => { setPreviewItem(itm); setPreviewOpen(true); }}
                  />
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="mt-10 rounded-2xl border border-border/60 bg-card/25 p-8 text-center">
                  <p className="text-sm font-semibold text-text">No products found</p>
                  <p className="mt-1 text-sm text-muted">Try a different search or remove filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Preview modal */}
      <ProductPreview
        open={previewOpen}
        item={previewItem}
        onClose={() => setPreviewOpen(false)}
        onAdd={(item, qty) => { addToCart(item, qty); setPreviewOpen(false); }}
      />

      {/* Cart drawer */}
      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cart={cart}
        onUpdateQty={(id, delta) =>
          setCart((prev) =>
            prev
              .map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
              .filter((p) => p.qty > 0)
          )
        }
        onRemove={(id) => setCart((prev) => prev.filter((p) => p.id !== id))}
        onClear={() => setCart([])}
      />
    </section>
  );
}
