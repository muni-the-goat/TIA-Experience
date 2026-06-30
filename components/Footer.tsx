export default function Footer() {
  return (
    <footer className="border-t border-teal/10 bg-white py-14 text-teal/70">
      <div className="mx-auto max-w-content px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/TIA-Logo.svg"
              alt="Cambodia Airport Investment Co., Ltd"
              className="h-16 w-auto"
            />
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-brown">
              Techo International Airport · Experience
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <a href="#artifacts" className="transition-colors hover:text-gold">The Collection</a>
            <a href="#treasure-hunt" className="transition-colors hover:text-gold">Treasure Hunt</a>
            <a href="#visit" className="transition-colors hover:text-gold">Plan Your Visit</a>
            <a href="#top" className="transition-colors hover:text-gold">Back to top</a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-teal/10 pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Techo International Airport. A celebration of Cambodian heritage.</p>
          <p className="text-teal/40">
            Demo experience · Artifact content is illustrative.
          </p>
        </div>
      </div>
    </footer>
  );
}
