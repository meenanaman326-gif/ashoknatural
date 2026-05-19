import { useState } from "react";

// Ye component apne checkout page mein add kar
const PaymentMethodSelector = ({ onMethodChange }) => {
  const [method, setMethod] = useState("cod");

  const handleChange = (value) => {
    setMethod(value);
    onMethodChange?.(value);
  };

  return (
    <div className="payment-methods-section" style={{
      marginTop: "20px",
      padding: "16px",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      backgroundColor: "#f8fafc"
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "#1e293b" }}>
        💳 Select Payment Method
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        
        {/* COD Option */}
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: method === "cod" ? "#e6f7e6" : "white",
          borderRadius: "8px",
          border: method === "cod" ? "2px solid #22c55e" : "1px solid #cbd5e1",
          cursor: "pointer"
        }}>
          <input
            type="radio"
            name="payment"
            value="cod"
            checked={method === "cod"}
            onChange={() => handleChange("cod")}
            style={{ width: "18px", height: "18px" }}
          />
          <div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>💵 Cash on Delivery (COD)</span>
            <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>Pay when you receive the order</p>
          </div>
        </label>

        {/* QR Code Option */}
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: method === "qr" ? "#e6f7e6" : "white",
          borderRadius: "8px",
          border: method === "qr" ? "2px solid #22c55e" : "1px solid #cbd5e1",
          cursor: "pointer"
        }}>
          <input
            type="radio"
            name="payment"
            value="qr"
            checked={method === "qr"}
            onChange={() => handleChange("qr")}
            style={{ width: "18px", height: "18px" }}
          />
          <div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>📱 Scan QR Code (UPI)</span>
            <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>Pay via PhonePe / Google Pay / Paytm</p>
          </div>
        </label>

        {/* Online Payment Option */}
        <label style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px",
          backgroundColor: method === "online" ? "#e6f7e6" : "white",
          borderRadius: "8px",
          border: method === "online" ? "2px solid #22c55e" : "1px solid #cbd5e1",
          cursor: "pointer",
          opacity: "0.6"
        }}>
          <input
            type="radio"
            name="payment"
            value="online"
            checked={method === "online"}
            onChange={() => handleChange("online")}
            disabled
            style={{ width: "18px", height: "18px" }}
          />
          <div>
            <span style={{ fontWeight: "bold", fontSize: "16px" }}>💳 Online Payment (Coming Soon)</span>
            <p style={{ margin: "0", fontSize: "12px", color: "#64748b" }}>Cards / Netbanking / Paytm Wallet</p>
          </div>
        </label>
      </div>
    </div>
  );
};

// ========== APNE CHECKOUT PAGE MEIN YE USE KAR ==========

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod");
  
  // Teri existing info hai
  const userInfo = {
    name: "Naman Meena",
    email: "meenanaman326@gmail.com",
    phone: "09975809816",
    address: "Talegon Dabhade, Maharashtra, 111045"
  };
  
  const subtotal = 396;
  const shipping = 49;
  const gst = 20;
  const total = 465;

  const handlePlaceOrder = () => {
    if (paymentMethod === "cod") {
      alert(`Order placed successfully! You'll pay ₹${total} on delivery.`);
      // Yahan apna order save logic daal
    } else if (paymentMethod === "qr") {
      alert(`Scan QR code to pay ₹${total}`);
      // Yahan QR modal open kar
    }
  };

  return (
    <div className="checkout-container">
      {/* User Info Section — Jo tera already hai */}
      <div className="user-info">
        <h3>Customer Details</h3>
        <p><strong>{userInfo.name}</strong></p>
        <p>{userInfo.email}</p>
        <p>{userInfo.phone}</p>
        <p>{userInfo.address}</p>
      </div>

      {/* Order Summary — Jo tera already hai */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping: ₹{shipping}</p>
        <p>GST: ₹{gst}</p>
        <h4>Total: ₹{total}</h4>
      </div>

      {/* 🔥 YAHAN PAYMENT OPTIONS ADD KAR — Exactly tujhe yahi chahiye */}
      <PaymentMethodSelector onMethodChange={setPaymentMethod} />

      {/* Pay Button */}
      <button 
        onClick={handlePlaceOrder}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: "20px",
          backgroundColor: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Pay ₹{total}
      </button>
    </div>
  );
};

export default CheckoutPage;
