import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderData = {
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  paymentMethod: string;
  total: number;
  items: OrderItem[];
};

export async function sendOrderEmails(order: OrderData) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price}</td>
      </tr>
    `
    )
    .join("");

  // CUSTOMER EMAIL
  await resend.emails.send({
    from: "Ashok Naturals <onboarding@resend.dev>",
    to: order.customerEmail,
    subject: "Thank you for your order — Ashok Naturals",

    html: `
      <h2>Thank you for purchasing from Ashok Naturals 🌿</h2>

      <p>Hello ${order.customerName},</p>

      <p>Your order has been successfully placed.</p>

      <h3>Order Details</h3>

      <table border="1" cellpadding="10">
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>

        ${itemsHtml}
      </table>

      <p><strong>Total:</strong> ₹${order.total}</p>

      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>

      <p><strong>Delivery Address:</strong> ${order.address}</p>

      <br />

      <p>
        Your order will be processed shortly.
      </p>

      <p>
        Thanks for choosing Ashok Naturals ❤️
      </p>
    `,
  });

  // ADMIN EMAIL
  await resend.emails.send({
    from: "Ashok Naturals <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL!,

    subject: "New Order Received",

    html: `
      <h2>New Order Received</h2>

      <p><strong>Customer:</strong> ${order.customerName}</p>

      <p><strong>Email:</strong> ${order.customerEmail}</p>

      <p><strong>Phone:</strong> ${order.phone}</p>

      <p><strong>Address:</strong> ${order.address}</p>

      <p><strong>Payment:</strong> ${order.paymentMethod}</p>

      <p><strong>Total:</strong> ₹${order.total}</p>

      <h3>Products</h3>

      <table border="1" cellpadding="10">
        <tr>
          <th>Product</th>
          <th>Qty</th>
          <th>Price</th>
        </tr>

        ${itemsHtml}
      </table>
    `,
  });
}
