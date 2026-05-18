/* eslint-disable */
// @ts-nocheck
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Wallet, Truck, Lock, CheckCircle2, QrCode } from "lucide-react";
import { useCart, findProduct, inr } from "@/lib/cart-store";
import { toast } from "sonner";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/lib/razorpay.functions";
import {
  markStoredOrderFailed,
  markStoredOrderPaid,
  saveLastOrder,
  savePendingOrder,
  getStoredOrder,
} from "@/lib/order-storage";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => {
      open: () => void;
      on: (e: string, cb: (r: unknown) => void) => void;
    };
  }
}

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Ashok Naturals" }] }),
  component: Checkout,
});

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

function Checkout() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createRazorpayOrder);
  const verifyFn = useServerFn(verifyRazorpayPayment);
  
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [showQRPayment, setShowQRPayment] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadRazorpayScript();

    const params = new URLSearchParams(window.location.search);
    const rzpPaymentId = params.get("razorpay_payment_id");
    const rzpOrderId = params.get("razorpay_order_id");
    const rzpSignature = params.get("razorpay_signature");

    if (rzpPaymentId && rzpOrderId) {
      setProcessing(true);
      (async () => {
        try {
          if (rzpSignature) {
            await verifyFn({
              data: {
                orderId: rzpOrderId,
                paymentId: rzpPaymentId,
                signature: rzpSignature,
              },
            });
          }
          const paid = markStoredOrderPaid(rzpOrderId, rzpPaymentId);
          saveLastOrder({
            orderId: rzpOrderId,
            paymentId: rzpPaymentId,
            method: "razorpay",
            status: "paid",
            total: paid.total,
            items: paid.items,
          });
          clear();
          toast.success("Payment successful!");
          navigate({ to: "/order-success", search: { id: rzpOrderId } as never });
        } catch {
          toast.error("Payment verification failed. Contact support.");
          setProcessing(false);
        }
      })();
    }
  }, []);

  const shipping = subtotal > 599 ? 0 : 49;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + gst;

  const completeOrder = (paymentInfo: {
    orderId: string;
    paymentId?: string;
    method: "razorpay" | "cod";
    status?: "paid" | "confirmed";
  }) => {
    saveLastOrder({
      ...paymentInfo,
      status: paymentInfo.status ?? (paymentInfo.method === "cod" ? "confirmed" : "paid"),
      total,
      items,
    });
    clear();
    toast.success("Order placed successfully!");
    navigate({ to: "/order-success", search: { id: paymentInfo.orderId } as never });
  };

  // UPI Payment Handler
  const handleUPIPayment = () => {
    setShowQRPayment(true);
  };
const confirmUPIPayment = () => {
  const txnId = prompt("Enter UPI Transaction ID");

  // Validate transaction ID
  if (!txnId || txnId.trim().length < 8) {
    toast.error("Please enter a valid UPI transaction ID");
    return;
  }

  const orderId = "AN" + Date.now();

  setShowQRPayment(false);

  // Save order for manual verification
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  orders.push({
    id: orderId,
    txnId: txnId.trim(),
    date: new Date().toISOString(),
    total,
    items,
    status: "payment_pending",
    method: "upi_manual",
  });

  localStorage.setItem("orders", JSON.stringify(orders));

  clear();

  toast.success("Payment submitted for verification");

  navigate({
    to: "/order-success",
    search: { id: orderId } as never,
  });
};
  

  const copyUPIID = () => {
    navigator.clipboard.writeText("ashoknaturals@okhdfcbank");
    setCopied(true);
    toast.success("UPI ID copied! Open your UPI app and send the amount.");
    setTimeout(() => setCopied(false), 3000);
  };

  const openUPIApp = (app: string) => {
    const upiLink = `upi://pay?pa=ashoknaturals@okhdfcbank&pn=Ashok%20Naturals&am=${total}&cu=INR`;
    
    let appLink = "";
    switch(app) {
      case "gpay":
        appLink = `tez://upi/pay?pa=ashoknaturals@okhdfcbank&pn=Ashok%20Naturals&am=${total}&cu=INR`;
        break;
      case "phonepe":
        appLink = `phonepe://pay?pa=ashoknaturals@okhdfcbank&pn=Ashok%20Naturals&am=${total}`;
        break;
      case "paytm":
        appLink = `paytmmp://upi/pay?pa=ashoknaturals@okhdfcbank&pn=Ashok%20Naturals&am=${total}`;
        break;
      default:
        appLink = upiLink;
    }
    
    window.location.href = appLink;
    
    // Fallback: if app doesn't open, copy UPI ID
    setTimeout(() => {
      copyUPIID();
      toast.info("If app didn't open, UPI ID has been copied");
    }, 1000);
  };

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (method === "cod") {
      const orderId = "AN" + Math.floor(100000 + Math.random() * 900000);
      completeOrder({ orderId, method: "cod", status: "confirmed" });
      setProcessing(false);
      return;
    }

    try {
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay)
        throw new Error("Razorpay failed to load. Check your connection.");

      const order = await createOrderFn({
        data: { amount: total, currency: "INR", receipt: `AN_${Date.now()}` },
      });
      if (!order?.orderId || !order?.keyId) throw new Error("Invalid payment order response");

      const form = formRef.current;
      const get = (name: string) =>
        (form?.elements.namedItem(name) as HTMLInputElement | null)?.value ?? "";

      const callbackUrl = `${window.location.origin}/checkout`;

      savePendingOrder({ orderId: order.orderId, method: "razorpay", total, items });

      const pollInterval = setInterval(() => {
        const stored = getStoredOrder(order.orderId);
        if (stored?.status === "paid") {
          clearInterval(pollInterval);
          completeOrder({
            orderId: order.orderId,
            paymentId: stored.paymentId,
            method: "razorpay",
          });
        }
      }, 3000);
      setTimeout(() => clearInterval(pollInterval), 120000);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Ashok Naturals",
        description: "Pure Indian Spices & Natural Foods",
        prefill: {
          name: `${get("firstName")} ${get("lastName")}`.trim(),
          email: get("email"),
          contact: get("phone"),
        },
        notes: {
          address: `${get("address1")} ${get("address2")} ${get("city")} ${get("state")} ${get("pincode")}`,
        },
        callback_url: callbackUrl,
        redirect: true,
        theme: { color: "#1f3d2b" },
        retry: { enabled: true, max_count: 2 },
        send_sms_hash: true,
        remember_customer: false,
        config: {
          display: {
            preferences: { show_default_blocks: true },
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          clearInterval(pollInterval);
          try {
            await verifyFn({
              data: {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              },
            });
            markStoredOrderPaid(response.razorpay_order_id, response.razorpay_payment_id);
            completeOrder({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              method: "razorpay",
            });
          } catch (err) {
            console.error(err);
            toast.error("Payment verification failed. Please contact support.");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            clearInterval(pollInterval);
            toast.info("Payment cancelled");
            setProcessing(false);
          },
        },
      });

      rzp.on("payment.failed", (resp: unknown) => {
        clearInterval(pollInterval);
        console.error("Razorpay payment failed:", resp);
        markStoredOrderFailed(order.orderId, "Payment failed");
        toast.error("Payment failed. Please try again.");
        setProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Could not start payment");
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="container-x py-24 text-center">
        <h1 className="font-display text-3xl text-primary">Your cart is empty</h1>
      </section>
    );
  }

  return (
    <section className="container-x py-12">
      <h1 className="font-display text-4xl md:text-5xl text-primary mb-8">Checkout</h1>
      
      <form ref={formRef} onSubmit={placeOrder} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Contact */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Contact</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                name="email"
                required
                type="email"
                placeholder="Email address"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="phone"
                required
                placeholder="Phone (+91)"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Shipping address</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input
                name="firstName"
                required
                placeholder="First name"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="lastName"
                required
                placeholder="Last name"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="address1"
                required
                placeholder="Address line 1"
                className="sm:col-span-2 px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="address2"
                placeholder="Apartment, suite (optional)"
                className="sm:col-span-2 px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="city"
                required
                placeholder="City"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="state"
                required
                placeholder="State"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                name="pincode"
                required
                placeholder="Pincode"
                className="px-4 py-3 rounded-xl border border-border bg-background outline-none focus:border-primary"
              />
              <input
                value="India"
                disabled
                className="px-4 py-3 rounded-xl border border-border bg-muted outline-none"
              />
            </div>
          </div>

          {/* Payment */}
          <div className="bg-card rounded-2xl p-6 shadow-card">
            <h2 className="font-display text-xl text-primary mb-4">Payment method</h2>
            <div className="space-y-2">
              {/* UPI Payment Option */}
              <button
                type="button"
                onClick={handleUPIPayment}
                className="w-full flex items-start gap-3 p-4 rounded-xl border-2 border-green-500 bg-green-50 cursor-pointer transition-all hover:shadow-md"
              >
                <QrCode className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1 text-left">
                  <p className="font-semibold text-green-800">📱 Pay with UPI</p>
                  <p className="text-xs text-gray-600">Google Pay • PhonePe • PayTM • BHIM • Any UPI App</p>
                </div>
                <div className="text-2xl">📱</div>
              </button>

              {[
                {
                  id: "razorpay" as const,
                  icon: CreditCard,
                  t: "Pay Online — Cards, UPI, Net Banking, Wallets",
                  d: "Secured by Razorpay · Visa, Mastercard, RuPay, GPay, PhonePe, Paytm",
                },
                {
                  id: "cod" as const,
                  icon: Truck,
                  t: "Cash on Delivery",
                  d: "Pay when your order arrives",
                },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${method === m.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={method === m.id}
                    onChange={() => setMethod(m.id)}
                    className="mt-1.5 accent-[var(--primary)]"
                  />
                  <m.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold">{m.t}</p>
                    <p className="text-xs text-muted-foreground">{m.d}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <Lock className="w-3.5 h-3.5" /> SSL secured · Payments processed by Razorpay (PCI-DSS compliant)
            </p>
          </div>
        </div>

        <aside className="bg-card rounded-2xl p-6 shadow-card h-fit sticky top-24 space-y-4">
          <h2 className="font-display text-xl text-primary">Order summary</h2>
          <div className="space-y-3 max-h-64 overflow-auto">
            {items.map((it) => {
              const p = findProduct(it.productId)!;
              return (
                <div key={it.productId + it.weightLabel} className="flex gap-3 text-sm">
                  <img src={p.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.weightLabel} × {it.qty}
                    </p>
                  </div>
                  <span className="font-semibold">{inr(it.price * it.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : inr(shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span>{inr(gst)}</span>
            </div>
            <div className="flex justify-between font-display text-lg text-primary border-t pt-2 mt-2">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={processing}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-gold hover:text-gold-foreground transition-colors disabled:opacity-60"
          >
            {processing ? (
              "Processing…"
            ) : method === "cod" ? (
              <>
                Place Order · {inr(total)}
                <CheckCircle2 className="w-4 h-4" />
              </>
            ) : (
              <>
                Pay {inr(total)}
                <Lock className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <Wallet className="w-3 h-3" /> Cards · UPI · Net Banking · Wallets · COD
          </p>
        </aside>
      </form>
{/* UPI Payment Modal */}
{showQRPayment && (
  <div
    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    onClick={() => setShowQRPayment(false)}
  >
    <div
      className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-6 py-5 text-white text-center">
        <h3 className="text-2xl font-bold">Pay with UPI</h3>
        <p className="text-sm opacity-90 mt-1">
          Scan & pay using any UPI app
        </p>
      </div>

      <div className="p-6">
        
        {/* QR IMAGE SECTION */}
<div className="bg-gray-50 rounded-2xl p-4 border text-center">
  <img
    src="/images/payment-qr.png"
    alt="UPI QR Code"
    className="w-full max-w-xs mx-auto rounded-xl shadow-md"
  />

  <div className="mt-4">
    <p className="text-lg font-bold text-green-700">
      Amount: {inr(total)}
    </p>

    <p className="text-sm text-gray-500 mt-1">
      Scan this QR using Google Pay, PhonePe, Paytm or any UPI app
    </p>
  </div>
</div>
        {/* UPI ID */}
        <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-2 font-medium">
            Manual UPI ID
          </p>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white border rounded-lg px-3 py-2 text-sm font-semibold text-green-700 break-all">
              ashoknaturals@okhdfcbank
            </div>

            <button
              type="button"
              onClick={copyUPIID}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Supported Apps */}
        <div className="mt-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Open directly in:
          </p>

          <div className="grid grid-cols-3 gap-3">
            {/* Google Pay */}
            <button
              type="button"
              onClick={() => openUPIApp("gpay")}
              className="border rounded-xl p-3 hover:border-green-500 hover:bg-green-50 transition-all"
            >
              <div className="text-3xl mb-1">💳</div>
              <p className="text-xs font-medium">GPay</p>
            </button>

            {/* PhonePe */}
            <button
              type="button"
              onClick={() => openUPIApp("phonepe")}
              className="border rounded-xl p-3 hover:border-purple-500 hover:bg-purple-50 transition-all"
            >
              <div className="text-3xl mb-1">📱</div>
              <p className="text-xs font-medium">PhonePe</p>
            </button>

            {/* Paytm */}
            <button
              type="button"
              onClick={() => openUPIApp("paytm")}
              className="border rounded-xl p-3 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <div className="text-3xl mb-1">💰</div>
              <p className="text-xs font-medium">Paytm</p>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
          <p className="text-xs text-yellow-800 leading-relaxed">
            After completing payment, click the button below.
            Your order will be confirmed after payment verification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowQRPayment(false)}
            className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={confirmUPIPayment}
            className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors"
          >
            I've Paid
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </section>
  );
}
     
