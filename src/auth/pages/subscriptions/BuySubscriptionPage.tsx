import { accessElf } from "../../utils/accessElf";
import Navigation from "../../../application/Navigation";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { useState } from "react";
import Payment from "./PaymentPage";

const BuySubscriptionPage = () => {
  const { subscriptions } = useSubscriptions();
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [subscriptionItems, setSubscriptionItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  accessElf.track("BuySubscriptionPage");

  const toggleSubscription = (subscription) => {
    setSelectedSubscriptions((prev) =>
      prev.includes(subscription)
        ? prev.filter((item) => item !== subscription)
        : [...prev, subscription]
    );
  };

  const total = selectedSubscriptions.reduce(
    (sum, sub) => sum + sub.price,
    0
  );

  const currency = selectedSubscriptions[0]?.currency || "";

  const handlePurchase = () => {
    if (selectedSubscriptions.length === 0) return;

    // Create subscription items for the payment page
    const items = selectedSubscriptions.flatMap((subscription) => [
      {
        id: subscription.id,
        name: subscription.name,
        item_description: subscription.description,
        price: parseFloat(subscription.price),
        quantity: 1,
        additional: JSON.stringify({ subscription: subscription.id }),
      },
    ]);
    setShowPayment(true);
    setSubscriptionItems(items);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedSubscriptions([]);
    setSubscriptionItems([]);
  };


  if (showPayment) {
    return (
        <Payment
          subscriptionItems={subscriptionItems}
          onPaid={handlePaymentSuccess}
        />
    );
  }

  return (
    <div className="flex flex-col w-full bg-white">
      <Navigation />
      <div className="flex flex-col items-center px-4 mt-4">
        <h1 className="text-2xl font-bold">Buy Subscription</h1>
        <p className="mt-4">Purchase a subscription plan here.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 mt-4 sm:grid-cols-2 lg:grid-cols-3">
        {subscriptions.map((subscription) => (
          <div
            key={subscription.id}
            className="p-4 border rounded shadow-sm bg-gray-50"
          >
            <h2 className="text-lg font-semibold">{subscription.name}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Price: {subscription.currency} {subscription.price}
            </p>
            <button
              onClick={() => toggleSubscription(subscription)}
              className={`mt-4 px-4 py-2 rounded ${
                selectedSubscriptions.includes(subscription)
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {selectedSubscriptions.includes(subscription) ? "Deselect" : "Select"}
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center my-3">
        <p className="text-lg font-semibold">
          Total: {currency} {total.toFixed(2)}
        </p>
        <button
          onClick={handlePurchase}
          className="mt-4 bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600"
        >
          Pay
        </button>
      </div>
    </div>
  );
};

export default BuySubscriptionPage;
