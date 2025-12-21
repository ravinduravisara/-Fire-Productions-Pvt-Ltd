import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Mail, User, MessageSquare, CheckCircle2, AlertTriangle, Send } from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";
import Button from "../components/ui/Button";
import { sendMessage } from "../services/contact.api";
import SEO from "../components/seo/SEO";

export default function Contact() {
  const reduce = useReducedMotion();

  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      await sendMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (e) {
      setStatus("error");
      setError("Failed to send message. Please try again later.");
    }
  };

  const fieldBase =
    "w-full rounded-2xl border border-border/60 bg-background/30 px-4 py-3 text-sm text-text placeholder:text-muted outline-none transition focus:border-brand-600/40 focus:ring-2 focus:ring-brand-600/20";

  return (
    <section className="relative py-16 sm:py-20">
      <SEO
        title="Contact"
        description="Contact Fire Productions. Tell us about your project and we’ll respond within 24 hours."
        path="/contact"
      />
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-600/15 blur-3xl"
        aria-hidden="true"
      />

      <div className="container">
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, filter: "blur(6px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <SectionTitle
            title="Contact"
            subtitle="Let’s build something great together"
          />

          <div className="mt-8 rounded-3xl border border-border/60 bg-card/30 p-6 backdrop-blur-xl sm:p-8">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    required
                    placeholder="Your full name"
                    className={`${fieldBase} pl-11`}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    required
                    placeholder="you@example.com"
                    className={`${fieldBase} pl-11`}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-text">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-muted" />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    required
                    rows={5}
                    placeholder="Tell us about your project…"
                    className={`${fieldBase} pl-11 resize-none`}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="inline-flex items-center gap-2 rounded-full"
                >
                  {status === "loading" ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>

                {/* Status */}
                {status === "success" && (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Message sent successfully
                  </span>
                )}

                {status === "error" && (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    {error}
                  </span>
                )}
              </div>
            </form>

            {/* Footer note */}
            <div className="mt-6 border-t border-border/60 pt-4 text-sm text-muted">
              We typically respond within <span className="text-text font-semibold">24 hours</span>.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
