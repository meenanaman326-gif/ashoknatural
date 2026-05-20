import { Link } from "@tanstack/react-router";
import { Leaf, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="container-x py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-10 h-10 rounded-full bg-gradient-gold grid place-items-center">
              <Leaf className="w-5 h-5 text-primary" />
            </span>

            <span className="font-display text-2xl">
              Ashok Naturals
            </span>
          </div>

          <p className="text-sm text-primary-foreground/80 max-w-sm">
            Stone-ground spices, raw forest honey and natural foods —
            sourced directly from Indian farms, delivered with love.
          </p>

          <div className="flex gap-3 pt-2">
            {/* Instagram */}
            <a
              href="https://www.instagram.com/ashoknaturals?utm_source=qr&igsh=MWlwdWY3bDdlMWIwMA=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 grid place-items-center rounded-full bg-primary-foreground/10 hover:bg-pink-500 hover:text-white transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/17fP73sNoV/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 grid place-items-center rounded-full bg-primary-foreground/10 hover:bg-blue-600 hover:text-white transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>

            {/* Twitter/X */}
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 grid place-items-center rounded-full bg-primary-foreground/10 hover:bg-black hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Shop</h4>

          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/products">All Products</Link>
            </li>

            <li>
              <Link
                to="/products"
                search={{ category: "Whole Spices" } as never}
              >
                Whole Spices
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                search={{ category: "Ground Spices" } as never}
              >
                Ground Spices
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                search={{ category: "Spice Blends" } as never}
              >
                Spice Blends
              </Link>
            </li>

            <li>
              <Link
                to="/products"
                search={{ category: "Natural Foods" } as never}
              >
                Natural Foods
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">Help</h4>

          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>
              <Link to="/faq">FAQ</Link>
            </li>

            <li>
              <Link to="/shipping">Shipping & Returns</Link>
            </li>

            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>

            <li>
              <Link to="/terms">Terms & Conditions</Link>
            </li>

            <li>
              <Link to="/admin">Admin</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg mb-4">
            Contact
          </h4>

          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
              <span>
                24, Spice Market Rd, Erode, Tamil Nadu 638001
              </span>
            </li>

            <li className="flex gap-2">
              <Phone className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
              <span>+91 94148 57764</span>
            </li>

            <li className="flex gap-2">
              <Mail className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
              <span>care@ashoknaturals.in</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-x py-5 text-xs text-primary-foreground/70 flex flex-wrap items-center justify-between gap-2">
          <p>
            © {new Date().getFullYear()} Ashok Naturals.
            All rights reserved.
          </p>

          <p>
            Made with love in India · FSSAI Lic. 10021022001234
          </p>
        </div>
      </div>
    </footer>
  );
}
