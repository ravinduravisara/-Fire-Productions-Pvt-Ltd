export default function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 mt-16 bg-background">
      <div className="container flex flex-col items-center gap-2 text-sm text-muted">
        <p>© {new Date().getFullYear()} Fire Acoustic (Pvt) Ltd. All rights reserved.</p>
        <p className="text-xs">Designed By Ravindu Ravisara</p>
      </div>
    </footer>
  )
}