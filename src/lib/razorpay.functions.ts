import { createServerFn } from "@tanstack/react-start";
import { createHmac } from "crypto";

function verifySignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}

function getRazorpayAuth() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay keys not configured");
  return {
    keyId,
    keySecret,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
  };
}

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: {
  items: {
    productId: string;
    qty: number;
    weightLabel: string;
    price: number;
  }[];
  receipt?: string;
}) => {
  if (!data?.items?.length) {
    throw new Error("No items");
  }

  return {
    items: data.items,
    receipt: data.receipt ?? `rcpt_${Date.now()}`,
  };
})
      throw new Error("Invalid amount");
    }
    return {
      amount: Math.round(data.amount),
      currency: data.currency ?? "INR",
      receipt: data.receipt ?? `rcpt_${Date.now()}`,
    };
  })
  .handler(async ({ data }) => {
    const { keyId, authorization } = getRazorpayAuth();
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: authorization,
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
    const valid = verifySignature(data.orderId, data.paymentId, data.signature, secret);
    if (!valid) throw new Error("Payment signature verification failed");
    return {
      valid: true,
      paid: true,
      status: "paid",
      paymentId: data.paymentId,
      orderId: data.orderId,
    };
  });

export const getRazorpayOrderStatus = createServerFn({ method: "POST" })
  .inputValidator((d: { orderId: string; paymentId?: string; signature?: string }) => {
    if (!d?.orderId) throw new Error("Missing order id");
    return d;
  })
  .handler(async ({ data }) => {
    const { keySecret, authorization } = getRazorpayAuth();

    if (data.paymentId && data.signature) {
      const valid = verifySignature(data.orderId, data.paymentId, data.signature, keySecret);
      if (valid)
        return { status: "paid", paid: true, orderId: data.orderId, paymentId: data.paymentId };
    }

    const res = await fetch(
      `https://api.razorpay.com/v1/orders/${encodeURIComponent(data.orderId)}`,
      {
        headers: { Authorization: authorization },
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Razorpay status error:", err);
      throw new Error("Could not check payment status");
    }

    const order = (await res.json()) as {
      id: string;
      status: string;
      amount_paid?: number;
      attempts?: number;
    };
    const paid = order.status === "paid" || (order.amount_paid ?? 0) > 0;
    return {
      status: paid ? "paid" : order.status,
      paid,
      orderId: order.id,
      attempts: order.attempts ?? 0,
    };
  });
      
