import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ImageOff, ShoppingCart, ArrowUpRight } from "lucide-react";
import SEO from "../components/seo/SEO";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import { getProduct } from "../services/products.api";

const WHATSAPP_NUMBER = "94743678001";

function formatLKR(value) {
  return `LKR ${Number(value || 0).toLocaleString()}`;
}

function getImageSrcList(item) {
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const filesBase = apiBase.replace(/\/api$/, "");
  const raws = Array.isArray(item?.imageUrls) && item.imageUrls.length
    ? item.imageUrls
    : [item?.imageUrl || item?.image || item?.url].filter(Boolean);
  return raws
    .filter((u) => typeof u === 'string' && u.trim())
    .slice(0, 6)
    .map((u) => (String(u).startsWith('http') ? u : `${filesBase}${u}`));
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(!location.state);
  const [active, setActive] = useState(0);

  useEffect(() => {
    // render instantly from navigation state if available
    if (location.state && !item) {
      const s = location.state;
      setItem({
        ...s,
        price: Number(s.price ?? 0),
        description: s.description || "",
        category: s.category || "",
        subCategory: s.subCategory || "",
      });
    }
    // try cache for instant load
    if (!item) {
      try {
        const cached = sessionStorage.getItem(`product:${id}`);
        if (cached) {
          const data = JSON.parse(cached);
          setItem({
            ...data,
            price: Number(data.price ?? 0),
            description: data.description || "",
            category: data.category || "",
            subCategory: data.subCategory || "",
          });
        }
      } catch {}
    }
    // fetch latest in background and update
    (async () => {
      try {
        const data = await getProduct(id);
        const normalized = {
          ...data,
          price: Number(data.price ?? 0),
          description: data.description || "",
          category: data.category || "",
          subCategory: data.subCategory || "",
        };
        setItem(normalized);
        try { sessionStorage.setItem(`product:${id}`, JSON.stringify(normalized)); } catch {}
      } catch (e) {
        // if not found and nothing to show, go back
        if (!item) navigate('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const images = useMemo(() => getImageSrcList(item || {}), [item]);

  if (loading) {
    return (
      <section className="relative py-16 sm:py-20">
        <SEO title="Product" path={`/products/${id}`} />
        <div className="container">
          <SectionTitle title="Loading…" subtitle="Fetching product details" />
        </div>
      </section>
    );
  }

  if (!item) return null;

  return (
    <section className="relative py-16 sm:py-20">
      <SEO
        title={item.title}
        description={item.description || `View details for ${item.title}`}
        path={`/products/${id}`}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="container">
        <div className="mb-6 flex items-center justify-between">
          <SectionTitle
            title={item.title}
            subtitle={item.subCategory ? `${item.category} • ${item.subCategory}` : (item.category || "Products")}
          />
          <Button
            onClick={() => {
              try {
                sessionStorage.setItem('returnToProductId', id);
                window.dispatchEvent(new CustomEvent('return:product', { detail: { id } }));
              } catch {}
              navigate(-1);
            }}
            size="sm"
          >
            Back to Products
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Images */}
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/40">
            {images.length ? (
              <div className="relative">
                <img
                  src={images[Math.min(active, images.length - 1)]}
                  alt={item.title}
                  className="aspect-[4/3] w-full object-contain bg-background"
                />
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

            {images.length > 1 && (
              <div className="border-t border-border/60 bg-background/50 p-3">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={`thumb-${i}`}
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
          <div className="rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-brand-600/12 px-3 py-1 text-sm font-semibold text-brand-600 ring-1 ring-brand-600/25">
                {formatLKR(item.price)}
              </span>
              <span className="text-xs text-muted">In stock</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-muted">
              {item.description || "Premium product from Fire Acoustic."}
            </p>

            <div className="mt-6 flex items-center gap-2">
              <Button
                className="inline-flex items-center gap-2"
                size="sm"
                onClick={() => {
                  try {
                    const id = item._id || item.id;
                    if (!id) return;
                    const raw = localStorage.getItem('cart');
                    const arr = raw ? JSON.parse(raw) : [];
                    const cart = Array.isArray(arr) ? arr : [];
                    const existing = cart.find((p) => p.id === id);
                    const payload = {
                      id,
                      title: item.title,
                      price: Number(item.price || 0),
                      qty: 1,
                      category: item.category || '',
                      subCategory: item.subCategory || '',
                      description: item.description || '',
                    };
                    const next = existing
                      ? cart.map((p) => (p.id === id ? { ...p, qty: p.qty + payload.qty } : p))
                      : [...cart, payload];
                    localStorage.setItem('cart', JSON.stringify(next));
                    sessionStorage.setItem('cart:open', '1');
                    sessionStorage.setItem('returnToProductId', id);
                  } catch {}
                  navigate('/products');
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <a
                className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-500"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello, I'm interested in ${item.title} — ${formatLKR(item.price)}`)}`}
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
    </section>
  );
}
