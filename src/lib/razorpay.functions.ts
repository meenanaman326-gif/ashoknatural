import { createServerFn } from "@tanstack/react-start";
import { createHmac } from "crypto";

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { amount: number; currency?: string; receipt?: string }) => {
    if (!data || typeof data.amount !== "number" || data.amount <= 0) {
      throw new Error("Invalid amount");
    }
    return {
      amount: Math.round(data.amount),
      currency: data.currency ?? "INR",
      receipt: data.receipt ?? `rcpt_${Date.now()}`,
    };
  })
  .handler(async ({ data }) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: data.amount * 100, // paise
        currency: data.currency,
        receipt: data.receipt,
        payment_capture: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Razorpay order error:", err);
      throw new Error("Failed to create payment order");
    }
    const order = (await res.json()) as { id: string; amount: number; currency: string };
    return { orderId: order.id, amount: order.amount, currency: order.currency, keyId };
  });

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((d: { orderId: string; paymentId: string; signature: string }) => {
    if (!d?.orderId || !d?.paymentId || !d?.signature) throw new Error("Missing fields");
    return d;
  })
  .handler(async ({ data }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error("Razorpay secret not configured");
    const expected = createHmac("sha256", secret)
      .update(`${data.orderId}|${data.paymentId}`)
      .digest("hex");
    const valid = expected === data.signature;
    if (!valid) throw new Error("Payment signature verification failed");
    return { valid: true, paymentId: data.paymentId, orderId: data.orderId };
  });
