import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 mt-16 bg-background">
      <div className="container flex flex-col items-center gap-3 text-sm text-muted">
        <p className="text-center">
          © {new Date().getFullYear()} Fire Productions (Pvt) Ltd. All rights reserved.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link
            to="/privacy-policy"
            className="transition hover:text-foreground"
          >
            Privacy Policy
          </Link>

          <span className="text-muted/60">|</span>

          <Link
            to="/terms-and-conditions"
            className="transition hover:text-foreground"
          >
            Terms and Conditions
          </Link>
        </div>

        <p className="text-xs text-center">Designed By Ravindu Ravisara</p>
      </div>
    </footer>
  );
}