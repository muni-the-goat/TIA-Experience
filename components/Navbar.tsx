"use client";

import { useEffect, useState } from "react";

const links = [
  { href: "#exhibition", label: "Exhibition" },
  { href: "#artifacts", label: "Artifacts" },
  { href: "#treasure-hunt", label: "Treasure Hunt" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[800] transition-all duration-500 ${
        scrolled
          ? "bg-sand-5/85 backdrop-blur-md shadow-[0_1px_0_rgba(9,59,63,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-content items-center justify-between px-5 py-4 md:px-8">
        <a href="#top" className="group flex items-center gap-3" aria-label="Cambodia Airport Investment — Techo International Airport, home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/TIA-Logo.svg"
            alt="Cambodia Airport Investment Co., Ltd"
            className="h-10 w-auto md:h-12"
          />
          <span className="hidden h-7 w-px bg-teal/15 sm:block" />
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.3em] text-brown sm:block">
            Experience
          </span>
        </a>
        <ul className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="group relative text-sm font-medium text-teal/80 transition-colors hover:text-teal"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
          <li>
            <a
              href="#treasure-hunt"
              className="rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-gold-2"
            >
              Start the Hunt
            </a>
          </li>
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full border border-teal/20 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 h-0.5 w-5 bg-teal transition-all ${open ? "top-1.5 rotate-45" : "top-0"}`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-5 bg-teal transition-all ${open ? "opacity-0" : "opacity-100"}`}
            />
            <span
              className={`absolute left-0 h-0.5 w-5 bg-teal transition-all ${open ? "top-1.5 -rotate-45" : "top-3"}`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`overflow-hidden border-t border-teal/10 bg-sand-5/95 backdrop-blur-md transition-[max-height] duration-500 md:hidden ${
          open ? "max-h-80" : "max-h-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-5 py-3">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 text-base font-medium text-teal hover:bg-sand-4"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#treasure-hunt"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-full bg-gold px-3 py-3 text-center text-base font-semibold text-teal"
            >
              Start the Hunt
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
