import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Alert, ListGroup, Badge } from 'react-bootstrap';
import PayGate from '../components/payment/PayGate';
import PageLayout from '../components/pagelayout';
import { useTenant } from '../hooks/useTenant';
import { useAuth } from '../context/AuthContext';
import { useSubscriptions } from '../context/SubscriptionsContext';
import { accessElf } from '../utils/accessElf';

const Payment = ({ subscriptionItems = [], onPaid }) => {
  const [amount, setAmount] = useState('0.00');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { tenant } = useTenant();
  const { token } = useAuth();
  const { createOrder } = useSubscriptions();

  accessElf.track("Payment");

  useEffect(() => {
    if (subscriptionItems.length > 0) {
      const total = subscriptionItems.reduce((sum, item) => sum + (item.price || 0), 0);
      setAmount(total.toFixed(2));
    }
  }, [subscriptionItems]);

  const handleGetOrder = async () => {
    const order = await createOrder(subscriptionItems);
    if (order && !order.error) {
      console.log("ORDER", order);
      return {
        id: order.order_id,
        total_price: order.total_price,
        currency: 'ZAR'
      };
    } else {
      setError('Failed to create order');
      return null;
    }
  };

  const handlePaymentSuccess = () => {
    setSuccess('Payment completed successfully!');
    setError('');
    
    // Call the onPaid callback if provided
    if (typeof onPaid === 'function') {
      onPaid();
    }
  };

  return (
    <PageLayout>
      <Card style={{ maxWidth: '600px' }} className="mx-auto">
        <Card.Body>
          <h2 className="text-center mb-4">Make Payment</h2>

          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess('')} dismissible>
              {success}
            </Alert>
          )}

          {subscriptionItems.length > 0 && (
            <ListGroup className="mb-4">
              <ListGroup.Item variant="info" className="d-flex justify-content-between align-items-center">
                <strong>Subscription Items</strong>
                <strong>Price (ZAR)</strong>
              </ListGroup.Item>
              {subscriptionItems.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>{item.name || 'Unnamed Item'}</div>
                  <Badge bg="secondary">R {(item.price || 0).toFixed(2)}</Badge>
                </ListGroup.Item>
              ))}
              <ListGroup.Item variant="success" className="d-flex justify-content-between align-items-center">
                <strong>Total</strong>
                <strong>R {amount}</strong>
              </ListGroup.Item>
            </ListGroup>
          )}

          <Form className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Amount (ZAR)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                readOnly={subscriptionItems.length > 0}
              />
            </Form.Group>
          </Form>

          <PayGate
            onGetOrder={handleGetOrder}
            onPaid={handlePaymentSuccess}
          />
        </Card.Body>
      </Card></PageLayout>
  );
};

export default Payment;
