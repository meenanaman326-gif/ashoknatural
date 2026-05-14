import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { useCart, inr } from "@/lib/cart-store";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ashok Naturals" }] }),
  component: Checkout,
});

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const formRef = useRef(null);

  const shipping = subtotal > 599 ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  const validateForm = () => {
    const form = formRef.current;
    if (!form) return false;
    
    const errors = {};
    const email = form.email?.value;
    const phone = form.phone?.value;
    const firstName = form.firstName?.value;
    const address = form.address1?.value;
    const pincode = form.pincode?.value;

    if (!email || !email.includes("@")) errors.email = "Valid email required";
    if (!phone || phone.length !== 10) errors.phone = "10-digit phone required";
    if (!firstName) errors.firstName = "First name required";
    if (!address) errors.address = "Address required";
    if (!pincode || pincode.length !== 6) errors.pincode = "6-digit pincode required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setProcessing(true);

    // Simple COD order - always works
    setTimeout(() => {
      const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
      
      // Save order
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");
      orders.push({
        id: orderId,
        date: new Date().toISOString(),
        total: total,
        items: items,
        status: "confirmed"
      });
      localStorage.setItem("orders", JSON.stringify(orders));
      
      clear();
      toast.success("Order placed successfully!");
      setProcessing(false);
      navigate({ to: "/order-success", search: { id: orderId } });
    }, 500);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl mb-4">Your cart is empty</h1>
        <button onClick={() => navigate({ to: "/shop" })} className="bg-green-700 text-white px-6 py-3 rounded-lg">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <form ref={formRef} onSubmit={placeOrder} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          {/* Contact */}
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Contact</h2>
            <input name="email" type="email" placeholder="Email" className="w-full border rounded-lg p-3 mb-3" required />
            <input name="phone" type="tel" placeholder="Phone (10 digits)" className="w-full border rounded-lg p-3" required />
            {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
          </div>

          {/* Shipping */}
          <div className="border rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="grid md:grid-cols-2 gap-3">
              <input name="firstName" placeholder="First name" className="border rounded-lg p-3" required />
              <input name="lastName" placeholder="Last name" className="border rounded-lg p-3" />
            </div>
            <input name="address1" placeholder="Street address" className="w-full border rounded-lg p-3 mt-3" required />
            <input name="address2" placeholder="Apartment, suite (optional)" className="w-full border rounded-lg p-3 mt-3" />
            <div className="grid md:grid-cols-3 gap-3 mt-3">
              <input name="city" placeholder="City" className="border rounded-lg p-3" required />
              <input name="state" placeholder="State" className="border rounded-lg p-3" required />
              <input name="pincode" placeholder="Pincode" className="border rounded-lg p-3" required />
            </div>
          </div>

          {/* Payment - COD Only for now */}
          <div className="border rounded-xl p-6 bg-green-50">
            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
            <div className="border-2 border-green-500 rounded-xl p-4 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500"></div>
                <div>
                  <div className="font-bold text-lg">💰 Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when you receive your order</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">✓ No payment issues • Pay after delivery</p>
          </div>
        </div>

        {/* Summary */}
        <div className="border rounded-xl p-6 h-fit sticky top-4">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({items.length} items)</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full mt-6 bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:opacity-50"
          >
            {processing ? "Placing Order..." : `Place Order • ₹${total}`}
          </button>
          
          <p className="text-center text-xs text-gray-500 mt-4">
            🔒 Secure checkout • Pay on delivery
          </p>
        </div>
      </form>
    </div>
  );
}
