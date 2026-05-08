import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Package, MapPin, Heart, LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Account — Ashok Naturals" }] }),
  component: Auth,
});

function Auth() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  if (loggedIn) return <Dashboard onLogout={() => setLoggedIn(false)} />;

  return (
    <section className="container-x py-16 max-w-md mx-auto">
      <div className="bg-card rounded-3xl p-8 shadow-elegant">
        <div className="text-center mb-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">{mode === "login" ? "Welcome back" : "Create account"}</p>
          <h1 className="font-display text-3xl text-primary">{mode === "login" ? "Sign in to Ashok" : "Join Ashok Naturals"}</h1>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setLoggedIn(true); toast.success(mode === "login" ? "Welcome back!" : "Account created!"); }}
          className="space-y-3"
        >
          {mode === "register" && (
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
              <input required placeholder="Full name" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <input required type="email" placeholder="Email address" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
            <input required type="password" placeholder="Password" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary" />
          </div>
          <button className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-4">
          {mode === "login" ? "New to Ashok? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-primary font-semibold hover:text-gold">
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </section>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"orders" | "wishlist" | "addresses">("orders");
  return (
    <section className="container-x py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-1">Welcome back</p>
          <h1 className="font-display text-4xl text-primary">My Account</h1>
        </div>
        <button onClick={onLogout} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive"><LogOut className="w-4 h-4" /> Sign out</button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="bg-card rounded-2xl p-4 shadow-card h-fit">
          {[
            { id: "orders", icon: Package, t: "Orders" },
            { id: "wishlist", icon: Heart, t: "Wishlist" },
            { id: "addresses", icon: MapPin, t: "Addresses" },
          ].map(b => (
            <button
              key={b.id}
              onClick={() => setTab(b.id as typeof tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${tab === b.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <b.icon className="w-4 h-4" /> {b.t}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 bg-card rounded-2xl p-6 shadow-card">
          {tab === "orders" && (
            <>
              <h2 className="font-display text-2xl text-primary mb-4">Recent Orders</h2>
              <div className="space-y-3">
                {[
                  { id: "AN847291", date: "Nov 28, 2025", total: "₹1,249", status: "Delivered" },
                  { id: "AN847102", date: "Oct 14, 2025", total: "₹699", status: "Delivered" },
                  { id: "AN846553", date: "Sep 02, 2025", total: "₹2,180", status: "Delivered" },
                ].map(o => (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-xl border border-border">
                    <div>
                      <p className="font-semibold">#{o.id}</p>
                      <p className="text-xs text-muted-foreground">{o.date} · {o.total}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">{o.status}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {tab === "wishlist" && (
            <>
              <h2 className="font-display text-2xl text-primary mb-4">Wishlist</h2>
              <p className="text-muted-foreground text-sm">Save products from the shop by tapping the heart icon.</p>
            </>
          )}
          {tab === "addresses" && (
            <>
              <h2 className="font-display text-2xl text-primary mb-4">Saved Addresses</h2>
              <div className="p-4 rounded-xl border border-border">
                <p className="font-semibold">Home</p>
                <p className="text-sm text-muted-foreground mt-1">123 MG Road, Bengaluru, Karnataka 560001</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
