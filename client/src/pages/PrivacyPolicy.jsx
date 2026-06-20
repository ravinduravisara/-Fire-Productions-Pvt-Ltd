export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-20">
      <section className="container max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Fire Productions
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            This Privacy Policy explains how Fire Productions (Pvt) Ltd.
            collects, uses, and protects information when you visit our website
            or contact us for our creative production services.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-border/60 bg-card/40 p-6 md:p-10">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Information We Collect</h2>
            <p className="text-muted leading-7">
              We may collect information that you voluntarily provide to us,
              such as your name, email address, phone number, company name,
              project details, and messages when you contact Fire Productions
              through our website, email, phone, or social media.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. How We Use Your Information</h2>
            <p className="text-muted leading-7">
              We use collected information to respond to inquiries, discuss
              projects, provide quotations, deliver music, acoustic,
              entertainment, film, and creative production services, improve our
              website, and communicate with clients.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. Cookies and Website Analytics</h2>
            <p className="text-muted leading-7">
              Our website may use cookies and similar technologies to improve
              user experience, understand website performance, and analyze how
              visitors interact with our pages. You can disable cookies through
              your browser settings, but some website features may not work
              properly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Cookies and Advertising</h2>
            <p className="text-muted leading-7">
                Our website may use cookies and third-party services, including Google
                AdSense, to display advertisements and measure ad performance. These
                third-party services may use cookies according to their own privacy
                policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Sharing of Information</h2>
            <p className="text-muted leading-7">
              We do not sell your personal information. We may share information
              only when required to provide our services, comply with legal
              obligations, protect our rights, or work with trusted service
              providers who support our website and business operations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Data Security</h2>
            <p className="text-muted leading-7">
              We take reasonable steps to protect your information from
              unauthorized access, misuse, loss, or disclosure. However, no
              internet-based system can be guaranteed to be completely secure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. External Links</h2>
            <p className="text-muted leading-7">
              Our website may contain links to external websites, social media
              pages, videos, or partner platforms. We are not responsible for the
              privacy practices or content of third-party websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Contact Us</h2>
            <p className="text-muted leading-7">
              If you have any questions about this Privacy Policy, please
              contact Fire Productions (Pvt) Ltd. through our contact page or
              official communication channels.
            </p>
          </section>

          <p className="pt-4 text-sm text-muted">
            Last updated: {new Date().getFullYear()}
          </p>
        </div>
      </section>
    </main>
  );
}