import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LayoutDashboard, Package, ShoppingBag, Users, Image as ImageIcon, MessageSquare, Boxes, FileText, TrendingUp, IndianRupee } from "lucide-react";
import { products } from "@/lib/products";
import { inr } from "@/lib/cart-store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Ashok Naturals" }] }),
  component: Admin,
});

const sections = [
  { id: "dashboard", icon: LayoutDashboard, t: "Dashboard" },
  { id: "products", icon: Package, t: "Products" },
  { id: "orders", icon: ShoppingBag, t: "Orders" },
  { id: "customers", icon: Users, t: "Customers" },
  { id: "banners", icon: ImageIcon, t: "Homepage Banners" },
  { id: "testimonials", icon: MessageSquare, t: "Testimonials" },
  { id: "inventory", icon: Boxes, t: "Inventory" },
  { id: "invoices", icon: FileText, t: "Invoices" },
] as const;

function Admin() {
  const [active, setActive] = useState<typeof sections[number]["id"]>("dashboard");

  return (
    <section className="container-x py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-1">Admin Panel</p>
          <h1 className="font-display text-3xl text-primary">Dashboard</h1>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">Live</span>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-card rounded-2xl p-3 shadow-card h-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active === s.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <s.icon className="w-4 h-4" /> {s.t}
            </button>
          ))}
        </aside>

        <div className="space-y-6">
          {active === "dashboard" && <DashboardView />}
          {active === "products" && <ProductsView />}
          {active === "orders" && <OrdersView />}
          {active === "customers" && <CustomersView />}
          {active === "banners" && <BannersView />}
          {active === "testimonials" && <TestimonialsView />}
          {active === "inventory" && <InventoryView />}
          {active === "invoices" && <InvoicesView />}
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, trend }: { icon: React.ElementType; label: string; value: string; trend: string }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <div className="flex items-center justify-between mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-gold grid place-items-center"><Icon className="w-5 h-5 text-primary" /></div>
        <span className="text-xs text-gold font-semibold">{trend}</span>
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-display text-2xl text-primary">{value}</p>
    </div>
  );
}

function DashboardView() {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={IndianRupee} label="Revenue" value="₹2,48,920" trend="+12%" />
        <Stat icon={ShoppingBag} label="Orders" value="184" trend="+8%" />
        <Stat icon={Users} label="Customers" value="1,247" trend="+24%" />
        <Stat icon={TrendingUp} label="Conversion" value="3.4%" trend="+0.5%" />
      </div>
      <div className="bg-card rounded-2xl p-6 shadow-card">
        <h3 className="font-display text-xl text-primary mb-4">Recent orders</h3>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
            <tr><th className="py-2">Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              ["AN847291", "Priya Menon", "₹1,249", "Delivered"],
              ["AN847290", "Rahul Sharma", "₹2,890", "Shipped"],
              ["AN847289", "Aisha Khan", "₹699", "Processing"],
              ["AN847288", "Vikram R.", "₹3,420", "Confirmed"],
            ].map(r => (
              <tr key={r[0]} className="border-b last:border-0">
                <td className="py-3 font-medium">#{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
                <td><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{r[3]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProductsView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-primary">Products ({products.length})</h3>
        <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold">+ Add Product</button>
      </div>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl border border-border">
            <img src={p.image} alt="" className="w-14 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.category} · {p.weights.length} variants</p>
            </div>
            <span className="font-display text-primary">{inr(p.weights[0].price)}</span>
            <button className="text-xs text-primary font-semibold">Edit</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OrdersView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">All Orders</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b">
          <tr><th className="py-2">Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {Array.from({ length: 8 }).map((_, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="py-3 font-medium">#AN8472{90 - i}</td>
              <td>Customer {i + 1}</td>
              <td>Nov {28 - i}, 2025</td>
              <td>₹{(Math.random() * 3000 + 500).toFixed(0)}</td>
              <td><span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">{["Delivered","Shipped","Processing"][i % 3]}</span></td>
              <td><button className="text-xs text-primary font-semibold">View</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomersView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">Customers</h3>
      <p className="text-sm text-muted-foreground">Manage your customer database, view order history, and segment by purchase behavior.</p>
    </div>
  );
}
function BannersView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">Homepage Banners</h3>
      <p className="text-sm text-muted-foreground">Upload and re-order hero banners and promotional carousels.</p>
    </div>
  );
}
function TestimonialsView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">Testimonials</h3>
      <p className="text-sm text-muted-foreground">Approve and showcase customer reviews on the homepage.</p>
    </div>
  );
}
function InventoryView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">Inventory</h3>
      <div className="space-y-2">
        {products.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl border border-border">
            <span className="font-medium">{p.name}</span>
            <span className="text-sm text-muted-foreground">{Math.floor(Math.random() * 200 + 20)} units</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function InvoicesView() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-card">
      <h3 className="font-display text-xl text-primary mb-4">Invoices</h3>
      <p className="text-sm text-muted-foreground">Auto-generated GST-compliant invoices for every order. Download as PDF or email to customers.</p>
    </div>
  );
}
