import React from "react";
import PayGateButton from "./PayGateButton";
import { combineUrlAndPath } from "../../../utils/combineUrlAndPath";
import { REACT_APP_PAYWEB3_API } from "../../../../env";
import { useTenant } from "../../../hooks/useTenant";
import { useAuth } from "../../../context/AuthContext";

interface PayGateProps {
  onGetOrder: () => Promise<{ id: string; total_price: number } | null>;
  onPaid: () => void;
}

const PayGate: React.FC<PayGateProps> = ({ onGetOrder, onPaid }) => {
  const { tenant } = useTenant();
  const { token } = useAuth();

  if (!onGetOrder) {
    throw new Error("onGetOrder is required.");
  }
  if (!onPaid) {
    throw new Error("onPaid is required.");
  }

  const submitPayment = (payment_id: string, checksum: string) => {
    const form = document.createElement("form");
    form.action = "https://secure.paygate.co.za/payweb3/process.trans";
    form.method = "POST";

    const input1 = document.createElement("input");
    input1.type = "hidden";
    input1.name = "PAY_REQUEST_ID";
    input1.value = payment_id;
    form.appendChild(input1);

    const input2 = document.createElement("input");
    input2.type = "hidden";
    input2.name = "CHECKSUM";
    input2.value = checksum;
    form.appendChild(input2);

    document.body.appendChild(form);
    form.submit();
  };

  const createOrder = async () => {
    try {
      const order = await onGetOrder();
      if (!order) {
        console.error("Order creation failed: No order returned.");
        throw new Error("Order creation failed.");
      }

      const response = await fetch(
        combineUrlAndPath(
          REACT_APP_PAYWEB3_API,
          `initiate.php?order_id=${order.id}`
        ),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
            App_id: tenant,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok.");
      }

      const result = await response.json();
      console.log("PAYGATE order created:",  JSON.stringify(result));
      const { payment_id, checksum } = result;

      console.log("PAYGATE payment ID:", payment_id);
      console.log("PAYGATE checksum:", checksum);

      if (!payment_id || !checksum) {
        console.error("Invalid response from PAYGATE:", JSON.stringify(result));
        throw new Error("Invalid response from PAYGATE.");
      }

      submitPayment(payment_id, checksum);
      return checksum;
    } catch (error) {
      console.error("Error creating PAYGATE order:", error);
      return Promise.reject(error);
    }
  };

  const onApprove = async () => {
    try {
      onPaid();
    } catch (error) {
      console.error("Error handling PAYGATE approval:", error);
    }
  };

  return (
    <div>
      <PayGateButton createOrder={createOrder} />
    </div>
  );
};

export default PayGate;
