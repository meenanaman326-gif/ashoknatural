import { createFileRoute } from "@tanstack/react-router";
import { createHmac } from "crypto";

export const Route = createFileRoute("/api/public/razorpay-callback")({
  server: {
    handlers: {
      POST: async ({ request }) => handleRazorpayCallback(request),
      GET: async ({ request }) => handleRazorpayCallback(request),
    },
  },
});

async function handleRazorpayCallback(request: Request) {
  const url = new URL(request.url);
  const values = request.method === "POST" ? await readPostedValues(request) : url.searchParams;
  const orderId = values.get("razorpay_order_id") ?? values.get("orderId") ?? "";
  const paymentId = values.get("razorpay_payment_id") ?? values.get("paymentId") ?? "";
  const signature = values.get("razorpay_signature") ?? values.get("signature") ?? "";
  const failureReason = values.get("error[description]") ?? values.get("error_description") ?? "";
  const secret = process.env.RAZORPAY_KEY_SECRET;

  const params = new URLSearchParams({ id: orderId });
  if (paymentId) params.set("paymentId", paymentId);
  if (signature) params.set("signature", signature);

  const isValid = Boolean(
    secret &&
      orderId &&
      paymentId &&
      signature &&
      createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex") === signature,
  );

  params.set("payment", isValid ? "success" : "failed");
  if (!isValid && failureReason) params.set("reason", failureReason);

  return Response.redirect(`${url.origin}/order-success?${params.toString()}`, 303);
}

async function readPostedValues(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, string | undefined>;
    return new URLSearchParams(Object.entries(body).flatMap(([key, value]) => (value ? [[key, value]] : [])));
  }
  const body = await request.text();
  return new URLSearchParams(body);
}