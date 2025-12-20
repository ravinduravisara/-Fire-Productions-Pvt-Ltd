import { motion, useReducedMotion } from "framer-motion";
import {
  Flame,
  Film,
  Music2,
  Mic2,
  Sparkles,
  Instagram,
  Globe,
  Facebook,
  Youtube,
} from "lucide-react";
import SectionTitle from "../components/ui/SectionTitle";

// ✅ Images from src/assets (Vite friendly)
import founderImg from "../assets/founder.jpg";
import coFounderImg from "../assets/cofounder.jpg";

const highlights = [
  {
    icon: Music2,
    title: "Music Production",
    desc: "Original tracks, mixing, and mastering that elevate your brand identity.",
  },
  {
    icon: Mic2,
    title: "Acoustic & Live Audio",
    desc: "Premium live capture and acoustic sound design with studio-level clarity.",
  },
  {
    icon: Sparkles,
    title: "Creative Direction",
    desc: "Story-first concepts, visuals, and campaigns designed to stand out.",
  },
  {
    icon: Film,
    title: "Film Production",
    desc: "Cinematic shooting, editing, and color grading built for modern audiences.",
  },
];

// ✅ Simple TikTok icon (lucide-react doesn't include TikTok by default in many versions)
function TikTokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.6 3c.4 2.7 2 4.8 4.4 5.4v3.2c-1.9 0-3.6-.6-5-1.6v6.2c0 3.6-2.9 6.6-6.6 6.6S3 20.1 3 16.6s2.9-6.6 6.6-6.6c.4 0 .8 0 1.2.1v3.5c-.4-.2-.8-.3-1.2-.3-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V3h3.4z" />
    </svg>
  );
}

const LEADERSHIP = [
  {
    name: "Founder Name",
    role: "Founder • Fire Productions",
    image: founderImg,
    bio: "Leads creative direction across music and film — focused on story, craft, and studio-grade execution.",
  },
  {
    name: "Co-Founder Name",
    role: "Director • Fire Entertainment",
    image: coFounderImg,
    bio: "Builds entertainment concepts and production workflows — delivering premium visuals with fast turnaround.",
  },
];

// ✅ Social links row BELOW the highlights
const SOCIAL_LINKS = {
  facebook: "",
  youtube: "",
  tiktok: "",
  instagram: "https://www.instagram.com/ravinduraviya",
};

function SocialLink({ href, label, children }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border/60 bg-background/25 text-muted transition hover:-translate-y-0.5 hover:border-brand-600/25 hover:bg-card/40 hover:text-text"
    >
      {children}
    </a>
  );
}

export default function About() {
  const reduce = useReducedMotion();

  const wrap = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduce
        ? { duration: 0.01 }
        : { staggerChildren: 0.08, delayChildren: 0.06 },
    },
  };

  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" },
    show: reduce
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6 } },
  };

  return (
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-20">
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
          variants={wrap}
          initial="hidden"
          animate="show"   // ✅ FIX: always show on load (no scroll needed)
          className="mx-auto max-w-5xl"
        >
          {/* Header */}
          <motion.div variants={item} className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <SectionTitle
                title="About Fire Productions"
                subtitle="A creative studio built for cinematic stories and powerful sound"
              />

              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                Fire Productions is a multidisciplinary creative studio specializing in{" "}
                <span className="text-text font-semibold">music</span>,{" "}
                <span className="text-text font-semibold">acoustic</span>,{" "}
                <span className="text-text font-semibold">entertainment</span>, and{" "}
                <span className="text-text font-semibold">film production</span>. We craft story-led
                visuals and studio-quality audio that strengthen brand identity and keep audiences
                engaged.
              </p>

              <p className="mt-4 text-base leading-relaxed text-muted">
                From concept to final delivery, we focus on clean execution, fast turnaround, and a
                premium finish — whether you need a brand film, a music release, or live sound that
                feels world-class.
              </p>
            </div>

            {/* Side card */}
            <motion.div variants={item} className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/35 p-6 backdrop-blur-xl">
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-600/15 blur-3xl"
                  aria-hidden="true"
                />
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background/40">
                    <Flame className="h-6 w-6 text-brand-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text">What we stand for</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      Craft, clarity, and impact — every frame and every note is designed to move people.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { k: "Quality", v: "Studio-grade" },
                    { k: "Speed", v: "Fast delivery" },
                    { k: "Style", v: "Modern look" },
                  ].map((x) => (
                    <div
                      key={x.k}
                      className="rounded-2xl border border-border/60 bg-background/25 p-3 text-center"
                    >
                      <div className="text-xs font-semibold text-text">{x.k}</div>
                      <div className="mt-1 text-xs text-muted">{x.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Leadership (responsive) */}
          <motion.div variants={item} className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-text">Leadership</div>
                <p className="mt-1 text-sm text-muted">
                  The people behind Fire Productions & Fire Entertainment.
                </p>
              </div>
              <span className="hidden sm:block text-xs text-muted">
                Studio-first • Story-led • Fast turnaround
              </span>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              {LEADERSHIP.map((p) => (
                <div
                  key={p.role}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 backdrop-blur-xl transition hover:-translate-y-1 hover:border-brand-600/25 hover:bg-card/45 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40"
                >
                  <div className="grid gap-4 p-5 md:grid-cols-[220px,1fr] md:items-start">
                    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/25">
                      <div className="aspect-[4/3] w-full md:aspect-[3/4]">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-text sm:text-lg">{p.name}</h3>
                      <p className="mt-1 text-sm text-muted">{p.role}</p>
                      <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{p.bio}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Highlights */}
          <motion.div variants={item} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="group relative rounded-2xl border border-border/60 bg-card/30 p-5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-brand-600/25 hover:bg-card/45 hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background/35">
                    <Icon className="h-5 w-5 text-text group-hover:text-brand-600 transition-colors" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-text">{h.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{h.desc}</p>
                </div>
              );
            })}
          </motion.div>

          {/* Social bar */}
          <motion.div
            variants={item}
            className="mt-6 rounded-2xl border border-border/60 bg-card/25 p-5 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-text">Follow us</div>
                <p className="mt-1 text-sm text-muted">
                  Stay connected on social media for new releases and updates.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SocialLink href={SOCIAL_LINKS.facebook} label="Facebook">
                  <Facebook className="h-5 w-5" />
                </SocialLink>
                <SocialLink href={SOCIAL_LINKS.youtube} label="YouTube">
                  <Youtube className="h-5 w-5" />
                </SocialLink>
                <SocialLink href={SOCIAL_LINKS.tiktok} label="TikTok">
                  <TikTokIcon className="h-5 w-5" />
                </SocialLink>
                <SocialLink href={SOCIAL_LINKS.instagram} label="Instagram">
                  <Instagram className="h-5 w-5" />
                </SocialLink>
                <SocialLink href="https://fireproductions.lk" label="Website">
                  <Globe className="h-5 w-5" />
                </SocialLink>
              </div>
            </div>
          </motion.div>

          {/* Bottom note */}
          <motion.div
            variants={item}
            className="mt-6 rounded-2xl border border-border/60 bg-card/25 p-6 backdrop-blur-xl"
          >
            <p className="text-sm text-muted">
              Want to collaborate? We’re available for{" "}
              <span className="text-text font-semibold">music projects</span>,{" "}
              <span className="text-text font-semibold">live acoustic production</span>,{" "}
              <span className="text-text font-semibold">entertainment</span>, and{" "}
              <span className="text-text font-semibold">brand films</span>.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
