import React from 'react';
import Button from '../../../../components/Button';

interface PayGateButtonProps {
  createOrder: () => void;
}

const PayGateButton: React.FC<PayGateButtonProps> = ({ createOrder }) => {
  if (!createOrder) {
    throw new Error("createOrder is required.");
  }

  const click = () => {
    createOrder();
  };

  return (
    <Button
    variant='primary'
      className="w-full h-14"
      onClick={click}
    >
      Pay with PayGate
    </Button>
  );
};

export default PayGateButton;
