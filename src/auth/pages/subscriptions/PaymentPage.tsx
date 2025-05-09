import React, { useState, useEffect } from "react";
import PayGate from "./payment/PayGate";
import { useTenant } from "../../hooks/useTenant";
import { useAuth } from "../../hooks/useAuth";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { accessElf } from "../../utils/accessElf";
import Container from "../../../components/Container";
import Button from "../../../components/Button";

interface SubscriptionItem {
  name?: string;
  price?: number;
}

interface PaymentProps {
  subscriptionItems?: SubscriptionItem[];
  onPaid?: () => void;
}

const Payment: React.FC<PaymentProps> = ({
  subscriptionItems = [],
  onPaid,
}) => {
  const [amount, setAmount] = useState<string>("0.00");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const { tenant } = useTenant();
  const { token } = useAuth();
  const { createOrder } = useSubscriptions();

  accessElf.track("Payment");

  useEffect(() => {
    if (subscriptionItems.length > 0) {
      const total = subscriptionItems.reduce(
        (sum, item) => sum + (item.price || 0),
        0
      );
      setAmount(total.toFixed(2));
    }
  }, [subscriptionItems]);

  const handleGetOrder = async () => {
    const order = await createOrder(subscriptionItems);
    if (order && !order.error) {
      return {
        id: order.order_id,
        total_price: order.total_price,
        currency: "ZAR",
      };
    } else {
      setError("Failed to create order");
      return null;
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess("Payment completed successfully!");
    setError("");
    if (typeof onPaid === "function") {
      onPaid();
    }
  };

  return (
    <Container>
      <div className="p-2">
        <h2 className="text-center text-2xl font-bold mb-4">Make Payment</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            <button
              className="float-right text-red-500"
              onClick={() => setError("")}
            >
              x
            </button>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            <button
              className="float-right text-green-500"
              onClick={() => setSuccess("")}
            >
              x
            </button>
            {success}
          </div>
        )}

        {subscriptionItems.length > 0 && (
          <div className="mb-4">
            <div className="flex justify-between font-bold border-b pb-2">
              <span>Subscription Items</span>
              <span>Price (ZAR)</span>
            </div>
            {subscriptionItems.map((item, index) => (
              <div key={index} className="flex justify-between py-2 border-b">
                <span>{item.name || "Unnamed Item"}</span>
                <span>R {(item.price || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2">
              <span>Total</span>
              <span>R {amount}</span>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Amount (ZAR)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            readOnly={subscriptionItems.length > 0}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <PayGate onGetOrder={handleGetOrder} onPaid={handlePaymentSuccess} />
        <Button variant="secondary" className="mt-2 w-full" to="/home">Cancel</Button>
      </div>
    </Container>
  );
};

export default Payment;
