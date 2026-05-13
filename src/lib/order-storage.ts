import type { CartItem } from "./cart-store";

export type StoredOrderStatus = "pending" | "paid" | "failed" | "confirmed";

export type StoredOrder = {
  orderId: string;
  paymentId?: string;
  method: "razorpay" | "cod";
  status: StoredOrderStatus;
  total: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  failureReason?: string;
};

const LAST_ORDER_KEY = "an_last_order";
const PENDING_ORDER_KEY = "an_pending_order";

const now = () => new Date().toISOString();

function readOrder(key: string): StoredOrder | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as StoredOrder) : null;
  } catch {
    return null;
  }
}

function writeOrder(key: string, order: StoredOrder) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(order));
}

export function savePendingOrder(order: Omit<StoredOrder, "status" | "createdAt" | "updatedAt">) {
  writeOrder(PENDING_ORDER_KEY, {
    ...order,
    status: "pending",
    createdAt: now(),
    updatedAt: now(),
  });
}

export function saveLastOrder(order: Omit<StoredOrder, "createdAt" | "updatedAt">) {
  writeOrder(LAST_ORDER_KEY, {
    ...order,
    createdAt: now(),
    updatedAt: now(),
  });
  if (typeof window !== "undefined") localStorage.removeItem(PENDING_ORDER_KEY);
}

export function getStoredOrder(orderId?: string) {
  const last = readOrder(LAST_ORDER_KEY);
  const pending = readOrder(PENDING_ORDER_KEY);
  if (!orderId) return last ?? pending;
  if (last?.orderId === orderId) return last;
  if (pending?.orderId === orderId) return pending;
  return null;
}

export function markStoredOrderPaid(orderId: string, paymentId?: string) {
  const existing = getStoredOrder(orderId);
  const paidOrder: StoredOrder = {
    orderId,
    paymentId,
    method: existing?.method ?? "razorpay",
    status: "paid",
    total: existing?.total ?? 0,
    items: existing?.items ?? [],
    createdAt: existing?.createdAt ?? now(),
    updatedAt: now(),
  };
  writeOrder(LAST_ORDER_KEY, paidOrder);
  if (typeof window !== "undefined") localStorage.removeItem(PENDING_ORDER_KEY);
  return paidOrder;
}

export function markStoredOrderFailed(orderId: string, failureReason: string) {
  const existing = getStoredOrder(orderId);
  if (!existing) return null;
  const failedOrder: StoredOrder = {
    ...existing,
    status: "failed",
    failureReason,
    updatedAt: now(),
  };
  writeOrder(PENDING_ORDER_KEY, failedOrder);
  return failedOrder;
}