import { Link } from "@tanstack/react-router";
import {
  Menu,
  ShoppingCart,
  Search,
  User,
} from "lucide-react";

const navItems = [
  {
    label: "Home",
    to: "/",
  },
  {
    label: "Products",
    to: "/products",
  },
  {
    label: "About",
    to: "/about",
  },
  {
    label: "Contact",
    to: "/contact",
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur border-b">
      <div className="container-x h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-display text-primary"
        >
          Ashok Naturals
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button className="hover:text-primary transition-colors">
            <Search className="w-5 h-5" />
          </button>

          <button className="hover:text-primary transition-colors">
            <ShoppingCart className="w-5 h-5" />
          </button>

          <button className="hover:text-primary transition-colors">
            <User className="w-5 h-5" />
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden hover:text-primary transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
