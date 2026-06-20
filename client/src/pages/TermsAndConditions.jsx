export default function TermsAndConditions() {
  return (
    <main className="min-h-screen bg-background text-foreground px-6 py-20">
      <section className="container max-w-5xl">
        <div className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">
            Fire Productions
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-5xl">
            Terms and Conditions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            These Terms and Conditions explain the rules for using the Fire
            Productions (Pvt) Ltd. website and our creative production services.
          </p>
        </div>

        <div className="space-y-6 rounded-3xl border border-border/60 bg-card/40 p-6 md:p-10">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-muted leading-7">
              By accessing or using this website, you agree to follow these
              Terms and Conditions. If you do not agree with these terms, please
              do not use our website or services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">2. About Our Services</h2>
            <p className="text-muted leading-7">
              Fire Productions (Pvt) Ltd. provides creative production services,
              including music production, acoustic production, entertainment
              production, film production, brand visuals, cinematic content, and
              related creative services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">3. Use of the Website</h2>
            <p className="text-muted leading-7">
              You agree to use this website only for lawful purposes. You must
              not attempt to damage, disrupt, hack, misuse, copy, or interfere
              with the website, its content, or its services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">4. Project Requests and Quotations</h2>
            <p className="text-muted leading-7">
              Any project request, quotation, package, timeline, or service
              discussion provided through the website, phone, email, or social
              media is subject to confirmation by Fire Productions. Final
              pricing, delivery dates, and service scope may vary depending on
              the project requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">5. Payments and Bookings</h2>
            <p className="text-muted leading-7">
              Some services may require advance payment or booking confirmation.
              Payment terms, refund conditions, and delivery arrangements will
              be discussed and agreed before starting a project.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">6. Intellectual Property</h2>
            <p className="text-muted leading-7">
              Website content, including text, images, videos, graphics, logos,
              design elements, and creative materials, belongs to Fire
              Productions (Pvt) Ltd. or the respective content owners. You may
              not copy, reuse, distribute, or modify our content without written
              permission.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">7. Client Materials</h2>
            <p className="text-muted leading-7">
              If you provide images, videos, audio, logos, brand assets, or
              other materials for a project, you confirm that you have the right
              to use and share those materials with Fire Productions for the
              requested work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">8. Limitation of Liability</h2>
            <p className="text-muted leading-7">
              We aim to keep our website accurate and available, but we do not
              guarantee that the website will always be error-free or
              uninterrupted. Fire Productions will not be responsible for losses
              caused by website downtime, technical issues, or third-party
              services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">9. External Links</h2>
            <p className="text-muted leading-7">
              Our website may include links to external websites, videos, social
              media pages, or third-party platforms. We are not responsible for
              the content, policies, or actions of those external websites.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">10. Changes to These Terms</h2>
            <p className="text-muted leading-7">
              Fire Productions may update these Terms and Conditions from time
              to time. Any changes will be posted on this page with the updated
              year or date.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">11. Contact Us</h2>
            <p className="text-muted leading-7">
              For questions about these Terms and Conditions, please contact
              Fire Productions (Pvt) Ltd. through our contact page or official
              communication channels.
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