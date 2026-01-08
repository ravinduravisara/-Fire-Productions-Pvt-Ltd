import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ShieldCheck,
  LogIn,
  Package,
  Film,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Link as LinkIcon,
  Tags,
  BadgeDollarSign,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowUp,
  ArrowDown,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import SEO from "../components/seo/SEO";
import { createProduct } from "../services/products.api";
import { createWork } from "../services/works.api";
import { uploadImage } from "../services/upload.api";
import { listCategories, createCategory, deleteCategory } from "../services/categories.api";
import { listServices, createService, deleteService, updateService } from "../services/services.api";
import {
  adminListProducts,
  adminUpdateProduct,
  adminDeleteProduct,
  adminListWorks,
  adminUpdateWork,
  adminDeleteWork,
  validateAdmin,
} from "../services/admin.api";

// Default service categories shown if DB has none
const defaultServiceOptions = [
  { value: "Acoustic", label: "Fire Acoustic" },
  { value: "Music", label: "Fire Music" },
  { value: "Films", label: "Fire Films" },
  { value: "Entertainment", label: "Fire Entertainment" },
];

// Fallback services for ManageServices when DB has none
const DEFAULT_SERVICES = [
  { name: "Fire Acoustic", category: "Acoustic", description: "Premium acoustic capture and mixes." },
  { name: "Fire Music", category: "Music", description: "Original music, mixing, and mastering." },
  { name: "Fire Films", category: "Films", description: "Cinematic filming and edits." },
  { name: "Fire Entertainment", category: "Entertainment", description: "Immersive show concepts and experiences." },
];

// Max images per project based on category
function getMaxWorkImagesForCategory(cat) {
  const c = String(cat || '').toLowerCase();
  return (c === 'acoustic' || c === 'entertainment') ? 20 : 6;
}

const productCategories = [
  { value: 'Acoustic Panels', label: 'Acoustic Panels' },
  { value: 'Rockwool and Glasswool', label: 'Rockwool and Glasswool' },
  { value: 'Acoustic Panels Fabric', label: 'Acoustic Panels Fabric' },
  { value: 'Acoustic Panels Wood', label: 'Acoustic Panels Wood' },
  { value: 'Other Materials', label: 'Other Materials' }
];

function cx(...arr) {
  return arr.filter(Boolean).join(" ");
}

function Card({ id, title, icon: Icon, children, right }) {
  return (
    <div id={id} className="rounded-3xl border border-border/60 bg-card/30 p-6 backdrop-blur-xl">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/30">
            <Icon className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{title}</h3>
            <p className="text-xs text-muted">Admin tools</p>
          </div>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status, error }) {
  if (status === "idle") return null;
  if (status === "loading" || status === "uploading") {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/20 px-3 py-1 text-xs font-semibold text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {status === "uploading" ? "Uploading…" : "Saving…"}
      </div>
    );
  }
  if (status === "success") {
    return (
      <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-green-600/15 px-3 py-1 text-xs font-semibold text-green-600 ring-1 ring-green-600/25">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Saved
      </div>
    );
  }
  return (
    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-600/15 px-3 py-1 text-xs font-semibold text-red-600 ring-1 ring-red-600/25">
      <AlertTriangle className="h-3.5 w-3.5" />
      {error || "Error"}
    </div>
  );
}

function Modal({ open, title, subtitle, icon: Icon, children, onClose }) {
  const reduce = useReducedMotion();
  if (!open) return null;

  return (
    <AnimatePresence>
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
          aria-label="Close modal"
        />
        <motion.div
          className="relative mx-auto mt-16 w-full max-w-lg px-4"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(8px)" }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.25 }}
        >
          <div className="rounded-3xl border border-border/60 bg-background/90 p-6 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/30">
                  <Icon className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text">{title}</div>
                  {subtitle && <div className="mt-0.5 text-xs text-muted">{subtitle}</div>}
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

            <div className="mt-5">{children}</div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      <div className="relative">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        ) : null}
        {children}
      </div>
    </div>
  );
}

const inputBase =
  "w-full rounded-2xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-text placeholder:text-muted outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20";

const inputWithIcon = cx(inputBase, "pl-11");

export default function AdminDashboard() {
  const [token, setToken] = useState("");
  const [active, setActive] = useState("add-product");

  useEffect(() => {
    setToken(localStorage.getItem("admin_token") || "");
  }, []);

  // Validate token against server; clear if invalid
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await validateAdmin(token);
      } catch {
        localStorage.removeItem('admin_token');
        setToken("");
      }
    })();
  }, [token]);

  if (!token) {
    return (
      <section className="relative py-16 sm:py-20">
        <SEO title="Admin Dashboard" path="/admin/dashboard" noindex />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="container max-w-2xl">
          <div className="rounded-3xl border border-border/60 bg-card/30 p-8 backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/30">
                <ShieldCheck className="h-6 w-6 text-brand-600" />
              </div>
              <div className="min-w-0">
                <SectionTitle title="Admin Dashboard" subtitle="You must log in first." />
                <a
                  href="/admin/login"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
                >
                  <LogIn className="h-4 w-4" />
                  Go to Admin Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 sm:py-20">
      <SEO title="Admin Dashboard" path="/admin/dashboard" noindex />
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div className="container max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle title="Admin Dashboard" subtitle="Add and manage Products & Projects" />
          <div className="text-xs text-muted">Admin access granted</div>
        </div>

        {(() => {
          const items = [
            { id: "add-product", label: "Add Product", icon: Package },
            { id: "add-work", label: "Add Project", icon: Film },
            { id: "add-service", label: "Add Service", icon: Plus },
            { id: "manage-products", label: "Manage Products", icon: Package },
            { id: "manage-works", label: "Manage Projects", icon: Film },
            { id: "manage-categories", label: "Manage Categories", icon: Tags },
            { id: "manage-services", label: "Manage Services", icon: Plus },
          ];
          const onSelect = (id) => {
            setActive(id);
            const el = document.getElementById(id);
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          };
          return <AdminNav items={items} active={active} onSelect={onSelect} />;
        })()}

        <div className="mt-10 grid grid-cols-1 gap-8">
          <div className={active === "add-product" ? "" : "hidden"}>
            <AddProduct token={token} />
          </div>
          <div className={active === "add-work" ? "" : "hidden"}>
            <AddWork token={token} />
          </div>
          <div className={active === "add-service" ? "" : "hidden"}>
            <AddService token={token} />
          </div>
          <div className={active === "manage-products" ? "" : "hidden"}>
            <ManageProducts token={token} />
          </div>
          <div className={active === "manage-works" ? "" : "hidden"}>
            <ManageWorks token={token} />
          </div>
          <div className={active === "manage-categories" ? "" : "hidden"}>
            <ManageCategories token={token} />
          </div>
          <div className={active === "manage-services" ? "" : "hidden"}>
            <ManageServices token={token} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ===================== MANAGE PRODUCTS ===================== */

function ManageProducts({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminListProducts());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await adminListProducts());
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await adminDeleteProduct(id, token);
    await refresh();
  };

  const actions = [
    { label: "Refresh", icon: RefreshCcw, onClick: refresh },
  ];
  return (
    <Card id="manage-products" title="Manage Products" icon={Package} right={<ButtonBar items={actions} />}>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState text="No products yet. Add one from the left panel." />
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/20 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{it.title}</p>
                <p className="mt-1 text-xs text-muted">{it.category || 'Uncategorized'}</p>
                <p className="mt-0.5 text-xs text-muted">{`LKR ${Number(it.price || 0).toLocaleString()}`}</p>
              </div>

              <div className="flex items-center gap-2">
                {it && it.id ? (
                  <>
                    <EditProductButton item={it} token={token} onSaved={refresh} />
                    <IconButton
                      label="Delete product"
                      tone="danger"
                      onClick={() => onDelete(it.id)}
                      icon={Trash2}
                    />
                  </>
                ) : (
                  <span className="text-xs text-muted">Demo item (connect DB to edit)</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EditProductButton({ item, token, onSaved }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: item.title,
    price: item.price,
    description: item.description || "",
    imageUrl: item.imageUrl || "",
    imageUrls: Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : (item.imageUrl ? [item.imageUrl] : []),
    category: item.category || '',
    subCategory: item.subCategory || '',
  });
  const [cats, setCats] = useState([]);
  useEffect(() => {
    (async () => {
      try { setCats(await listCategories()); } catch {}
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const payload = {
        ...form,
        imageUrls: (form.imageUrls && form.imageUrls.length)
          ? form.imageUrls.slice(0,3)
          : (form.imageUrl ? [form.imageUrl] : []),
        price: Number(form.price || 0),
      };
      await adminUpdateProduct(item.id, payload, token);
      setStatus("success");
      setTimeout(() => setOpen(false), 450);
      onSaved?.();
    } catch (err) {
      setStatus("error");
      setError("Failed to update product.");
    }
  };

  return (
    <>
      <IconButton label="Edit product" onClick={() => setOpen(true)} icon={Pencil} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Product"
        subtitle="Update title, price, image, and description"
        icon={Package}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" icon={Package}>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              className={inputWithIcon}
            />
          </Field>

          <Field label="Category" icon={Tags}>
            <select
              name="category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: '' })}
              className={cx(inputWithIcon, "appearance-none")}
            >
              <option value="">Select category</option>
              {cats.filter((c) => !c.parentId).map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Subcategory" icon={Tags}>
            <select
              name="subCategory"
              value={form.subCategory}
              onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
              className={cx(inputWithIcon, "appearance-none")}
            >
              <option value="">None</option>
              {cats
                .filter((c) => {
                  const parent = cats.find((p) => !p.parentId && p.name === form.category);
                  return parent && String(c.parentId) === String(parent.id);
                })
                .map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
            </select>
          </Field>

          <Field label="Price (LKR)" icon={BadgeDollarSign}>
            <input
              name="price"
              value={form.price}
              onChange={onChange}
              inputMode="numeric"
              className={inputWithIcon}
            />
          </Field>

          <Field label="Images (up to 3)">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setStatus("uploading");
                setError("");
                try {
                  const urls = [];
                  const remaining = 3 - (form.imageUrls?.length || 0);
                  for (const file of files.slice(0, remaining)) {
                    const { url } = await uploadImage(file, token);
                    urls.push(url);
                  }
                  setForm((f) => ({
                    ...f,
                    imageUrl: f.imageUrl || urls[0] || "",
                    imageUrls: [...(f.imageUrls || []), ...urls].slice(0, 3),
                  }));
                  setStatus("idle");
                } catch (err) {
                  setStatus("error");
                  setError("Upload failed.");
                }
              }}
              className={cx(inputBase, "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90")}
            />
            {(form.imageUrls && form.imageUrls.length) ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.imageUrls.slice(0,3).map((u, idx) => (
                  <div key={u + idx} className="relative overflow-hidden rounded-xl border border-border/60 bg-background/30">
                    <img src={u} alt={`Image ${idx+1}`} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full border border-border/60 bg-card/40 px-2 py-1 text-xs text-text hover:bg-card/60"
                      onClick={() => setForm((f) => {
                        const next = (f.imageUrls || []).filter((x, i) => i !== idx);
                        return { ...f, imageUrls: next, imageUrl: next[0] || f.imageUrl };
                      })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </Field>

          <Field label="Image URL" icon={ImageIcon}>
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
              className={inputWithIcon}
              placeholder="/uploads/xxx.jpg or full URL"
            />
          </Field>

          <Field label="Description" icon={Tags}>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              rows={3}
              className={cx(inputWithIcon, "resize-none")}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-full border border-border/60 bg-card/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-card/40"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <Button type="submit" className="rounded-full" disabled={status === "loading"}>
              Save
            </Button>
          </div>

          <StatusBadge status={status} error={error} />
        </form>
      </Modal>
    </>
  );
}

/* ===================== MANAGE WORKS ===================== */

function ManageWorks({ token }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setItems(await adminListWorks());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      setItems(await adminListWorks());
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await adminDeleteWork(id, token);
    await refresh();
  };

  const actions = [
    { label: "Refresh", icon: RefreshCcw, onClick: refresh },
  ];
  return (
    <Card id="manage-works" title="Manage Projects" icon={Film} right={<ButtonBar items={actions} />}>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState text="No projects yet. Add one from the right panel." />
      ) : (
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/20 p-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{it.title}</p>
                <p className="mt-1 text-xs text-muted">{it.category || it.tags?.[0] || ""}</p>
              </div>

              <div className="flex items-center gap-2">
                {it && it.id ? (
                  <>
                    <EditWorkButton item={it} token={token} onSaved={refresh} />
                    <IconButton
                      label="Delete project"
                      tone="danger"
                      onClick={() => onDelete(it.id)}
                      icon={Trash2}
                    />
                  </>
                ) : (
                  <span className="text-xs text-muted">Demo item (connect DB to edit)</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function EditWorkButton({ item, token, onSaved }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [svcOptions, setSvcOptions] = useState(defaultServiceOptions);

  const computeTag = (name, category) => {
    if (category) return category;
    if (!name) return "";
    const n = String(name).toLowerCase();
    if (n.includes('acoustic')) return 'Acoustic';
    if (n.includes('music')) return 'Music';
    if (n.includes('film')) return 'Films';
    if (n.includes('entertain')) return 'Entertainment';
    return name; // fallback to service name as tag
  };

  const refreshServiceOptions = async () => {
    try {
      const list = await listServices();
      const mapped = Array.isArray(list)
        ? list.map((s) => ({ value: computeTag(s.name, s.category), label: s.name }))
        : [];
      const byLabel = new Map();
      [...defaultServiceOptions, ...mapped].forEach((opt) => {
        const key = opt.label || opt.value;
        if (!byLabel.has(key)) byLabel.set(key, opt);
      });
      setSvcOptions(Array.from(byLabel.values()));
    } catch {}
  };

  useEffect(() => { refreshServiceOptions() }, []);
  useEffect(() => {
    const handler = () => refreshServiceOptions();
    window.addEventListener('services:updated', handler);
    return () => window.removeEventListener('services:updated', handler);
  }, []);

  const [form, setForm] = useState({
    title: item.title,
    link: item.link || "",
    description: item.description || "",
    imageUrl: item.imageUrl || "",
    imageUrls: Array.isArray(item.imageUrls) && item.imageUrls.length
      ? item.imageUrls
      : (item.imageUrl ? [item.imageUrl] : []),
    category: item.category || "Acoustic",
    tags: (item.tags || []).join(", "),
  });

  const maxImages = getMaxWorkImagesForCategory(form.category);

  const onChange = (e) => {
    const { name, value } = e.target;

    // keep tags in sync (optional)
    if (name === "category") {
      const currentTags = form.tags.trim();
      const tagsList = currentTags
        ? currentTags.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const wasOnlyPrevCategory = tagsList.length <= 1;
      const nextTags = wasOnlyPrevCategory ? value : currentTags;
      setForm({ ...form, category: value, tags: nextTags });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const payload = {
        ...form,
        imageUrls: (form.imageUrls && form.imageUrls.length)
          ? form.imageUrls
          : (form.imageUrl ? [form.imageUrl] : []),
        tags: form.tags
          ? form.tags.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };
      await adminUpdateWork(item.id, payload, token);
      setStatus("success");
      setTimeout(() => setOpen(false), 450);
      onSaved?.();
    } catch (err) {
      setStatus("error");
      setError("Failed to update project.");
    }
  };

  return (
    <>
      <IconButton label="Edit project" onClick={() => setOpen(true)} icon={Pencil} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Project"
        subtitle={`Update title, images (up to ${maxImages}), category, tags, and link`}
        icon={Film}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Title" icon={Film}>
            <input name="title" value={form.title} onChange={onChange} className={inputWithIcon} />
          </Field>

          <Field label="Category" icon={ShieldCheck}>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className={cx(inputWithIcon, "appearance-none")}
            >
              {svcOptions.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="External Link (optional)" icon={LinkIcon}>
            <input
              name="link"
              value={form.link}
              onChange={onChange}
              className={inputWithIcon}
              placeholder="https://…"
            />
          </Field>

          <Field label="Description" icon={Tags}>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              className={cx(inputWithIcon, "resize-none")}
              rows={3}
              placeholder="Short description about the project"
            />
          </Field>

          <Field label="Tags (comma separated)" icon={Tags}>
            <input
              name="tags"
              value={form.tags}
              onChange={onChange}
              className={inputWithIcon}
              placeholder="Acoustic, Live, Studio…"
            />
          </Field>

          <Field label={`Images (up to ${maxImages})`}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                setStatus("uploading");
                setError("");
                try {
                  const urls = [];
                  const remaining = maxImages - (form.imageUrls?.length || 0);
                  for (const file of files.slice(0, remaining)) {
                    const { url } = await uploadImage(file, token);
                    urls.push(url);
                  }
                  setForm((f) => ({
                    ...f,
                    imageUrl: f.imageUrl || urls[0] || "",
                    imageUrls: [...(f.imageUrls || []), ...urls].slice(0, maxImages),
                  }));
                  if (files.length > remaining) {
                    setError(`You can upload up to ${maxImages} images for ${form.category}.`);
                  }
                  setStatus("idle");
                } catch (err) {
                  setStatus("error");
                  setError("Upload failed.");
                }
              }}
              className={cx(inputBase, "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90")}
            />
            {(form.imageUrls && form.imageUrls.length) ? (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {form.imageUrls.slice(0, maxImages).map((u, idx) => (
                  <div key={u + idx} className="relative overflow-hidden rounded-xl border border-border/60 bg-background/30">
                    <img src={u} alt={`Image ${idx+1}`} className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full border border-border/60 bg-card/40 px-2 py-1 text-xs text-text hover:bg-card/60"
                      onClick={() => setForm((f) => {
                        const next = (f.imageUrls || []).filter((x, i) => i !== idx);
                        return { ...f, imageUrls: next, imageUrl: next[0] || f.imageUrl };
                      })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="mt-2 text-xs text-muted">Selected {form.imageUrls?.length || 0} of {maxImages}</div>
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="rounded-full border border-border/60 bg-card/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-card/40"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <Button type="submit" className="rounded-full" disabled={status === "loading"}>
              Save
            </Button>
          </div>

          <StatusBadge status={status} error={error} />
        </form>
      </Modal>
    </>
  );
}

/* ===================== ADD PRODUCT ===================== */

function AddProduct({ token }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    imageUrls: [],
    price: "",
    category: '',
    subCategory: '',
  });
  const [cats, setCats] = useState([]);
  useEffect(() => {
    (async () => {
      try { setCats(await listCategories()); } catch {}
    })();
  }, []);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setStatus("uploading");
    setError("");

    try {
      const urls = [];
      const remaining = 3 - (form.imageUrls?.length || 0);
      for (const file of files.slice(0, remaining)) {
        const { url } = await uploadImage(file, token);
        urls.push(url);
      }
      setForm((f) => ({
        ...f,
        imageUrl: f.imageUrl || urls[0] || "",
        imageUrls: [...(f.imageUrls || []), ...urls].slice(0, 3),
      }));
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError("Upload failed.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (!(form.imageUrls && form.imageUrls.length) && !form.imageUrl) {
      setStatus("error");
      setError("Please upload at least one image first.");
      return;
    }

    try {
      const payload = {
        ...form,
        imageUrls: (form.imageUrls && form.imageUrls.length)
          ? form.imageUrls.slice(0,3)
          : (form.imageUrl ? [form.imageUrl] : []),
        price: Number(form.price || 0),
      };
      await createProduct(payload, token);
      setStatus("success");
      setForm({ title: "", description: "", imageUrl: "", imageUrls: [], price: "", category: '', subCategory: '' });
    } catch (e) {
      setStatus("error");
      const msg = e?.response?.data?.message || "Failed to save product.";
      setError(msg);
    }
  };

  const reloadCategories = async () => {
    try { setCats(await listCategories()); } catch {}
  };
  const resetForm = () => setForm({ title: "", description: "", imageUrl: "", imageUrls: [], price: "", category: '', subCategory: '' });
  const actions = [
    { label: "Reset", icon: RotateCcw, onClick: resetForm },
    { label: "Refresh Cats", icon: RefreshCcw, onClick: reloadCategories },
  ];
  return (
    <Card id="add-product" title="Add Product" icon={Plus} right={<ButtonBar items={actions} />}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Title" icon={Package}>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Product title"
            className={inputWithIcon}
            required
          />
        </Field>

        <Field label="Images (up to 3)">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFile}
            className={cx(inputBase, "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90")}
          />
          {(form.imageUrls && form.imageUrls.length) ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.imageUrls.slice(0,3).map((u, idx) => (
                <div key={u + idx} className="relative overflow-hidden rounded-xl border border-border/60 bg-background/30">
                  <img src={u} alt={`Image ${idx+1}`} className="h-24 w-full object-cover" />
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full border border-border/60 bg-card/40 px-2 py-1 text-xs text-text hover:bg-card/60"
                    onClick={() => setForm((f) => {
                      const next = (f.imageUrls || []).filter((x, i) => i !== idx);
                      return { ...f, imageUrls: next, imageUrl: next[0] || f.imageUrl };
                    })}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </Field>

        <Field label="Price (LKR)" icon={BadgeDollarSign}>
          <input
            name="price"
            value={form.price}
            onChange={onChange}
            placeholder="Price"
            inputMode="numeric"
            className={inputWithIcon}
            required
          />
        </Field>

        <Field label="Category" icon={Tags}>
          <select
            name="category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value, subCategory: '' })}
            className={cx(inputWithIcon, "appearance-none")}
            required
          >
            <option value="">Select category</option>
            {cats.filter((c) => !c.parentId).map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Subcategory (optional)" icon={Tags}>
          <select
            name="subCategory"
            value={form.subCategory}
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
            className={cx(inputWithIcon, "appearance-none")}
          >
            <option value="">None</option>
            {cats
              .filter((c) => {
                const parent = cats.find((p) => !p.parentId && p.name === form.category);
                return parent && String(c.parentId) === String(parent.id);
              })
              .map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
          </select>
        </Field>

        <Field label="Description" icon={Tags}>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short description"
            rows={3}
            className={cx(inputWithIcon, "resize-none")}
          />
        </Field>

        <Button type="submit" className="w-full rounded-full" disabled={status === "loading" || status === "uploading"}>
          {status === "uploading" ? "Uploading…" : status === "loading" ? "Saving…" : "Save Product"}
        </Button>

        <StatusBadge status={status} error={error} />
      </form>
    </Card>
  );
}

/* ===================== ADD WORK ===================== */

function AddWork({ token }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    imageUrl: "",
    imageUrls: [],
    link: "",
    tags: "",
    category: "Acoustic",
  });
  const [svcOptions, setSvcOptions] = useState(defaultServiceOptions);

  const computeTag = (name, category) => {
    if (category) return category;
    if (!name) return "";
    const n = String(name).toLowerCase();
    if (n.includes('acoustic')) return 'Acoustic';
    if (n.includes('music')) return 'Music';
    if (n.includes('film')) return 'Films';
    if (n.includes('entertain')) return 'Entertainment';
    return name; // fallback to service name as tag
  };

  const refreshServiceOptions = async () => {
    try {
      const list = await listServices();
      const mapped = Array.isArray(list)
        ? list.map((s) => ({ value: computeTag(s.name, s.category), label: s.name }))
        : [];
      const byLabel = new Map();
      [...defaultServiceOptions, ...mapped].forEach((opt) => {
        const key = opt.label || opt.value;
        if (!byLabel.has(key)) byLabel.set(key, opt);
      });
      setSvcOptions(Array.from(byLabel.values()));
    } catch {}
  };

  useEffect(() => { refreshServiceOptions() }, []);
  useEffect(() => {
    const handler = () => refreshServiceOptions();
    window.addEventListener('services:updated', handler);
    return () => window.removeEventListener('services:updated', handler);
  }, []);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setStatus("uploading");
    setError("");

    try {
      const urls = [];
      const maxImages = getMaxWorkImagesForCategory(form.category);
      const remaining = maxImages - (form.imageUrls?.length || 0);
      for (const file of files.slice(0, remaining)) {
        const { url } = await uploadImage(file, token);
        urls.push(url);
      }
      setForm((f) => ({
        ...f,
        imageUrl: f.imageUrl || urls[0] || "",
        imageUrls: [...(f.imageUrls || []), ...urls].slice(0, maxImages),
      }));
      if (files.length > remaining) {
        setError(`You can upload up to ${maxImages} images for ${form.category}.`);
      }
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError("Upload failed.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    if (!(form.imageUrls && form.imageUrls.length) && !form.imageUrl) {
      setStatus("error");
      setError("Please upload at least one image first.");
      return;
    }

    try {
      const payload = {
        ...form,
        imageUrls: (form.imageUrls && form.imageUrls.length)
          ? form.imageUrls.slice(0, getMaxWorkImagesForCategory(form.category))
          : (form.imageUrl ? [form.imageUrl] : []),
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [form.category].filter(Boolean),
      };

      await createWork(payload, token);
      setStatus("success");
      setForm({ title: "", description: "", imageUrl: "", imageUrls: [], link: "", tags: "", category: "Acoustic" });
    } catch (e) {
      setStatus("error");
      const msg = e?.response?.data?.message || "Failed to save project.";
      setError(msg);
    }
  };

  const resetForm = () => setForm({ title: "", description: "", imageUrl: "", imageUrls: [], link: "", tags: "", category: "Acoustic" });
  const actions = [
    { label: "Reset", icon: RotateCcw, onClick: resetForm },
  ];
  return (
    <Card id="add-work" title="Add Project (Works)" icon={Film} right={<ButtonBar items={actions} />}>
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Title" icon={Film}>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Project title"
            className={inputWithIcon}
            required
          />
        </Field>

        <Field label={`Images (up to ${getMaxWorkImagesForCategory(form.category)})`}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFile}
            className={cx(inputBase, "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90")}
          />
          {(form.imageUrls && form.imageUrls.length) ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.imageUrls.slice(0, getMaxWorkImagesForCategory(form.category)).map((u, idx) => (
                <div key={u + idx} className="relative overflow-hidden rounded-xl border border-border/60 bg-background/30">
                  <img src={u} alt={`Image ${idx+1}`} className="h-24 w-full object-cover" />
                </div>
              ))}
            </div>
          ) : null}
          <div className="mt-2 text-xs text-muted">Selected {form.imageUrls?.length || 0} of {getMaxWorkImagesForCategory(form.category)}</div>
        </Field>

        <Field label="Category" icon={ShieldCheck}>
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className={cx(inputWithIcon, "appearance-none")}
          >
            {svcOptions.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="External Link (optional)" icon={LinkIcon}>
          <input
            name="link"
            value={form.link}
            onChange={onChange}
            placeholder="https://…"
            className={inputWithIcon}
          />
        </Field>

        <Field label="Description" icon={Tags}>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Short description about the project"
            rows={3}
            className={cx(inputWithIcon, "resize-none")}
          />
        </Field>

        <Field label="Tags (optional, comma-separated)" icon={Tags}>
          <input
            name="tags"
            value={form.tags}
            onChange={onChange}
            placeholder="Acoustic, Live, Studio…"
            className={inputWithIcon}
          />
        </Field>

        <Button type="submit" className="w-full rounded-full" disabled={status === "loading" || status === "uploading"}>
          {status === "uploading" ? "Uploading…" : status === "loading" ? "Saving…" : "Save Project"}
        </Button>

        <StatusBadge status={status} error={error} />
      </form>
    </Card>
  );
}

/* ===================== ADD SERVICE ===================== */

function AddService({ token }) {
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("uploading");
    setError("");
    try {
      const { url } = await uploadImage(file, token);
      setForm((f) => ({ ...f, imageUrl: url }));
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError("Upload failed.");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    if (!form.name || !form.description) {
      setStatus("error");
      setError("Name and description are required.");
      return;
    }
    try {
      await createService(form, token);
      setStatus("success");
      setForm({ name: "", description: "", imageUrl: "" });
      // Notify other panels to refresh services list
      try { window.dispatchEvent(new CustomEvent('services:updated')) } catch {}
    } catch (e) {
      setStatus("error");
      const msg = e?.response?.data?.message || "Failed to save service.";
      setError(msg);
    }
  };

  const resetForm = () => setForm({ name: "", description: "", imageUrl: "" });
  const actions = [
    { label: "Reset", icon: RotateCcw, onClick: resetForm },
  ];
  return (
    <Card id="add-service" title="Add Service" icon={Plus} right={<ButtonBar items={actions} />}>
      <form onSubmit={onSubmit} className="space-y-4">
                {/* Category removed per request */}
        <Field label="Service Name" icon={Package}>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Service name"
            className={inputWithIcon}
            required
          />
        </Field>

        <Field label="Image (optional)">
          <input
            type="file"
            accept="image/*"
            onChange={onFile}
            className={cx(
              inputBase,
              "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90"
            )}
          />
          {form.imageUrl && (
            <p className="mt-2 text-xs text-muted">
              Uploaded: <span className="text-text font-semibold">{form.imageUrl}</span>
            </p>
          )}
        </Field>

        <Field label="Description" icon={Tags}>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Service description"
            rows={3}
            className={cx(inputWithIcon, "resize-none")}
            required
          />
        </Field>

        <Button type="submit" className="w-full rounded-full" disabled={status === "loading" || status === "uploading"}>
          {status === "uploading" ? "Uploading…" : status === "loading" ? "Saving…" : "Save Service"}
        </Button>

        <StatusBadge status={status} error={error} />
      </form>
    </Card>
  );
}

/* ===================== MANAGE SERVICES ===================== */

function ManageServices({ token }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reordering, setReordering] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await listServices()
      let list = Array.isArray(data) ? data.filter((s) => s && s.id) : []
      // Sort by order asc then createdAt desc for stability
      list = list.sort((a, b) => {
        const ao = typeof a.order === 'number' ? a.order : 0
        const bo = typeof b.order === 'number' ? b.order : 0
        if (ao !== bo) return ao - bo
        const ad = new Date(a.createdAt || 0).getTime()
        const bd = new Date(b.createdAt || 0).getTime()
        return bd - ad
      })

      // Normalize orders to consecutive values if missing/duplicate
      const needsNormalize = (() => {
        const seen = new Set()
        for (const s of list) {
          const o = typeof s.order === 'number' ? s.order : 0
          if (o <= 0 || seen.has(o)) return true
          seen.add(o)
        }
        return list.length > 0 && (seen.size !== list.length)
      })()

      if (needsNormalize) {
        const normalized = list.map((s, i) => ({ ...s, order: i + 1 }))
        try {
          await Promise.all(normalized.map((s, i) => {
            const current = list[i]
            if (current.order === s.order) return Promise.resolve()
            return updateService(s.id, { order: s.order }, token)
          }))
          list = normalized
        } catch {}
      }

      setItems(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])
  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('services:updated', handler)
    return () => window.removeEventListener('services:updated', handler)
  }, [])

  const seedDefaults = async () => {
    setLoading(true)
    try {
      const existing = await listServices()
      const names = new Set((Array.isArray(existing) ? existing : []).map(s => String(s.name).toLowerCase()))
      const missing = DEFAULT_SERVICES.filter(s => !names.has(String(s.name).toLowerCase()))
      for (const svc of missing) {
        await createService({ name: svc.name, description: svc.description || 'Service', imageUrl: '', category: svc.category }, token)
      }
      try { window.dispatchEvent(new CustomEvent('services:updated')) } catch {}
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this service?')) return
    await deleteService(id, token)
    await refresh()
  }

  const moveUp = async (idx) => {
    if (idx <= 0) return
    setReordering(true)
    const next = [...items]
    const tmp = next[idx - 1]
    next[idx - 1] = next[idx]
    next[idx] = tmp
    // assign consecutive orders optimistically
    next.forEach((s, i) => { s.order = i + 1 })
    setItems(next)
    try {
      await Promise.all([
        updateService(next[idx - 1].id, { order: next[idx - 1].order }, token),
        updateService(next[idx].id, { order: next[idx].order }, token)
      ])
    } finally {
      setReordering(false)
    }
  }

  const moveDown = async (idx) => {
    if (idx >= items.length - 1) return
    setReordering(true)
    const arr = [...items]
    const tmp = arr[idx + 1]
    arr[idx + 1] = arr[idx]
    arr[idx] = tmp
    arr.forEach((s, i) => { s.order = i + 1 })
    setItems(arr)
    try {
      await Promise.all([
        updateService(arr[idx].id, { order: arr[idx].order }, token),
        updateService(arr[idx + 1].id, { order: arr[idx + 1].order }, token)
      ])
    } finally {
      setReordering(false)
    }
  }

  const actions = [
    { label: "Refresh", icon: RefreshCcw, onClick: refresh },
    { label: "Seed defaults", icon: Plus, onClick: seedDefaults, disabled: loading },
  ];
  return (
    <Card id="manage-services" title="Manage Services" icon={Plus} right={<ButtonBar items={actions} />}>
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState text="No services yet. Add one above." />
      ) : (
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li key={it.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/20 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text">{it.name}</p>
                <p className="mt-1 text-xs text-muted">{it.category || 'Service'}</p>
              </div>
              <div className="flex items-center gap-2">
                <EditServiceButton item={it} token={token} onSaved={refresh} />
                <IconButton label="Delete service" tone="danger" onClick={() => onDelete(it.id)} icon={Trash2} />
                <IconButton label="Move up" onClick={() => moveUp(idx)} icon={ArrowUp} />
                <IconButton label="Move down" onClick={() => moveDown(idx)} icon={ArrowDown} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function EditServiceButton({ item, token, onSaved }) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: item.name || '',
    description: item.description || '',
    imageUrl: item.imageUrl || ''
  })

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setStatus('uploading')
    setError('')
    try {
      const { url } = await uploadImage(file, token)
      setForm((f) => ({ ...f, imageUrl: url }))
      setStatus('idle')
    } catch (err) {
      setStatus('error')
      setError('Upload failed.')
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      await updateService(item.id, form, token)
      setStatus('success')
      setTimeout(() => setOpen(false), 450)
      onSaved?.()
    } catch (err) {
      setStatus('error')
      setError('Failed to update service.')
    }
  }

  return (
    <>
      <IconButton label="Edit service" onClick={() => setOpen(true)} icon={Pencil} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit Service"
        subtitle="Update name, image, and description"
        icon={Plus}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="Service Name" icon={Package}>
            <input name="name" value={form.name} onChange={onChange} className={inputWithIcon} />
          </Field>

          <Field label="Image (optional)" icon={Upload}>
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              className={cx(
                inputBase,
                "file:mr-4 file:rounded-full file:border-0 file:bg-brand-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-600/90"
              )}
            />
            {form.imageUrl && (
              <p className="mt-2 text-xs text-muted">
                Uploaded: <span className="text-text font-semibold">{form.imageUrl}</span>
              </p>
            )}
          </Field>

          <Field label="Image URL" icon={ImageIcon}>
            <input name="imageUrl" value={form.imageUrl} onChange={onChange} className={inputWithIcon} placeholder="/uploads/xxx.jpg or full URL" />
          </Field>
          <Field label="Description" icon={Tags}>
            <textarea name="description" value={form.description} onChange={onChange} rows={3} className={cx(inputWithIcon, 'resize-none')} />
          </Field>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" className="rounded-full border border-border/60 bg-card/20 px-4 py-2 text-sm font-semibold text-text transition hover:bg-card/40" onClick={() => setOpen(false)}>Cancel</button>
            <Button type="submit" className="rounded-full" disabled={status === 'loading'}>Save</Button>
          </div>
          <StatusBadge status={status} error={error} />
        </form>
      </Modal>
    </>
  )
}
/* ===================== SMALL UI PARTS ===================== */

function IconButton({ label, icon: Icon, onClick, tone = "neutral" }) {
  const base =
    "inline-flex items-center justify-center rounded-full border p-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60";
  const styles =
    tone === "danger"
      ? "border-red-600/30 bg-red-600/10 text-red-600 hover:bg-red-600/15"
      : "border-border/60 bg-card/20 text-text hover:bg-card/40";

  return (
    <button type="button" aria-label={label} onClick={onClick} className={cx(base, styles)}>
      <Icon className="h-4 w-4" />
    </button>
  );
}

function SmallHint({ text }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/20 px-3 py-1 text-xs font-semibold text-muted">
      {text}
    </span>
  );
}

function AdminNav({ items, active, onSelect }) {
  return (
    <nav className="mt-6 mb-6 rounded-2xl border border-border/60 bg-card/30 p-3 backdrop-blur-xl">
      <div className="flex flex-wrap items-center gap-2">
        {items.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => onSelect?.(it.id)}
            className={cx(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              active === it.id
                ? "border-brand-600/40 bg-brand-600/12 text-brand-600"
                : "border-border/60 bg-card/20 text-text hover:bg-card/40"
            )}
          >
            <it.icon className="h-3.5 w-3.5" />
            {it.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function BarButton({ label, icon: Icon, onClick, tone = "neutral", disabled }) {
  const base =
    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600/60";
  const styles =
    tone === "danger"
      ? "border-red-600/30 bg-red-600/10 text-red-600 hover:bg-red-600/15"
      : "border-border/60 bg-card/20 text-text hover:bg-card/40";
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={[base, styles, disabled ? "opacity-60 cursor-not-allowed" : ""].join(" ")}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function ButtonBar({ items }) {
  return (
    <div className="flex items-center gap-2">
      {items.map((it, idx) => (
        <BarButton key={idx} {...it} />
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/20 p-6 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-card/20">
        <ImageIcon className="h-5 w-5 text-muted" />
      </div>
      <p className="mt-3 text-sm font-semibold text-text">{text}</p>
      <p className="mt-1 text-sm text-muted">Create new items using the forms above.</p>
    </div>
  );
}

/* ===================== MANAGE CATEGORIES ===================== */

function ManageCategories({ token }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      setCats(await listCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const [newCat, setNewCat] = useState("");
  const [newSub, setNewSub] = useState({ parent: "", name: "" });

  const parents = cats.filter((c) => !c.parentId);
  const childrenByParent = (parentId) => cats.filter((c) => String(c.parentId) === String(parentId));

  const addCategory = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await createCategory(newCat, token);
      setNewCat("");
      setStatus("success");
      refresh();
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.message || "Failed to add category");
    }
  };

  const addSubcategory = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      if (!newSub.parent) {
        setStatus("error");
        setError("Select a parent category");
        return;
      }
      await createCategory(newSub.name, token, newSub.parent);
      setNewSub({ parent: "", name: "" });
      setStatus("success");
      refresh();
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.message || "Failed to add subcategory");
    }
  };

  const removeCategory = async (id) => {
    if (!confirm("Delete this category? Subcategories under it will also be removed.")) return;
    await deleteCategory(id, token);
    refresh();
  };

  const removeSub = async (id) => {
    if (!confirm("Delete this subcategory?")) return;
    await deleteCategory(id, token);
    refresh();
  };

  const actions = [
    { label: "Refresh", icon: RefreshCcw, onClick: refresh },
  ];
  return (
    <Card id="manage-categories" title="Manage Categories" icon={Tags} right={<ButtonBar items={actions} />}>
      <div className="grid gap-6 sm:grid-cols-2">
        <form onSubmit={addCategory} className="space-y-3">
          <Field label="New Category" icon={Tags}>
            <input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className={inputWithIcon}
              placeholder="e.g. Acoustic Panels"
              list="manage-parent-categories"
            />
            <datalist id="manage-parent-categories">
              {parents.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </Field>
          <Button type="submit" className="rounded-full" disabled={status === "loading"}>Add Category</Button>
        </form>

        <form onSubmit={addSubcategory} className="space-y-3">
          <Field label="Parent Category" icon={Tags}>
            <select value={newSub.parent} onChange={(e) => setNewSub({ ...newSub, parent: e.target.value })} className={cx(inputWithIcon, "appearance-none")}>
              <option value="">Select parent</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory Name" icon={Tags}>
            <input value={newSub.name} onChange={(e) => setNewSub({ ...newSub, name: e.target.value })} className={inputWithIcon} placeholder="e.g. Glasswool" />
          </Field>
          <Button type="submit" className="rounded-full" disabled={status === "loading"}>Add Subcategory</Button>
        </form>
      </div>

      <StatusBadge status={status} error={error} />

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : parents.length === 0 ? (
          <EmptyState text="No categories yet. Add some above." />
        ) : (
          <ul className="space-y-4">
            {parents.map((p) => (
              <li key={p.id} className="rounded-2xl border border-border/60 bg-background/20 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-text">{p.name}</div>
                  <IconButton label="Delete category" tone="danger" onClick={() => removeCategory(p.id)} icon={Trash2} />
                </div>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {childrenByParent(p.id).map((c) => (
                    <li key={c.id} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/20 px-3 py-1 text-xs font-semibold text-text">
                      {c.name}
                      <button type="button" aria-label="Delete sub" onClick={() => removeSub(c.id)} className="rounded-full border border-border/60 bg-background/30 p-1 text-muted transition hover:text-text hover:bg-card/40"><X className="h-3.5 w-3.5" /></button>
                    </li>
                  ))}
                  {childrenByParent(p.id).length === 0 && (
                    <span className="text-xs text-muted">No subcategories</span>
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
