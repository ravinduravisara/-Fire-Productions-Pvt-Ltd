import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, Sparkles, PlayCircle } from "lucide-react";
import heroBg from "../../assets/hero-bg.png";
import Button from "../ui/Button";

export default function Hero() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const variants = useMemo(
    () => ({
      wrap: {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: shouldReduceMotion
            ? { duration: 0.01 }
            : { staggerChildren: 0.08, delayChildren: 0.05 },
        },
      },
      item: {
        hidden: shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, y: 18, filter: "blur(6px)" },
        show: shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6 } },
      },
    }),
    [shouldReduceMotion]
  );

  const go = (path) => navigate(path);

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background image + overlays */}
      <div
        className="absolute inset-0 -z-20"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-background/85 via-background/70 to-background/40"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/30 via-secondary/25 to-highlight/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-40 right-[-120px] -z-10 h-[520px] w-[520px] rounded-full bg-gradient-to-tr from-secondary/20 via-primary/15 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="container">
        <motion.div
          variants={variants.wrap}
          initial="hidden"
          animate={isLoaded ? "show" : "hidden"}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <motion.div variants={variants.item} className="flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/70 px-4 py-2 text-sm text-text shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="font-medium">Music • Acoustic • Entertainment • Film Production</span>
              <span className="h-1 w-1 rounded-full bg-border/60" />
              <span className="text-muted">Premium creative studio</span>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={variants.item}
            className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-text sm:text-6xl"
          >
            Igniting brands with{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-secondary to-highlight bg-clip-text text-transparent">
                Fire Productions
              </span>
              <span
                className="pointer-events-none absolute -bottom-2 left-0 right-0 mx-auto h-[10px] w-[90%] rounded-full bg-gradient-to-r from-primary/30 via-secondary/30 to-highlight/20 blur-md"
                aria-hidden="true"
              />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={variants.item}
            className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg"
          >
            Fire Production specializes in high-quality film, music, and acoustic production that strengthens
            brand identity and audience impact.
          </motion.p>

          {/* CTA */}
          <motion.div
            variants={variants.item}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              onClick={() => go("/products")}
              className="group relative w-full overflow-hidden sm:w-auto"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                View Products
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
              <span
                className="absolute inset-0 -z-0 bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity duration-200 group-hover:opacity-15"
                aria-hidden="true"
              />
            </Button>

            <Button
              onClick={() => go("/contact")}
              className="w-full bg-surface hover:bg-border/40 text-text sm:w-auto"
            >
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Us
              </span>
            </Button>

            <button
              type="button"
              onClick={() => go("/services")}
              className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:text-text"
            >
              <PlayCircle className="h-5 w-5 text-secondary" />
              Watch Our Work
              <span className="h-px w-6 bg-border/60 transition group-hover:w-10" />
            </button>
          </motion.div>

          {/* Trust / Stats */}
          <motion.div
            variants={variants.item}
            className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            {[
              { k: "Fast Turnaround", v: "Studio-ready delivery" },
              { k: "Cinematic Quality", v: "Modern production pipeline" },
              { k: "Brand Impact", v: "Story-led creative direction" },
            ].map((x) => (
              <div
                key={x.k}
                className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-left shadow-sm backdrop-blur"
              >
                <div className="text-sm font-semibold text-text">{x.k}</div>
                <div className="mt-1 text-sm text-muted">{x.v}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/90 to-transparent"
        aria-hidden="true"
      />
    </section>
  );
}
