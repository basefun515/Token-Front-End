import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';

function TokenDeploymentForm({ onDeploy }) {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState('info');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageVariant('info');

    const tokenDetails = {
      name,
      symbol,
      // LP Migration Market Cap and Fee Recipient will be hardcoded in the backend
    };

    // Call the parent function to handle deployment (calls backend)
    try {
      await onDeploy(tokenDetails);
      // Message and status handled by parent (App.js)
      // setMessage("Deployment initiated. Check console for details.");
      // setMessageVariant('info');
      // Reset form after successful initiation (optional)
      // setName('');
      // setSymbol('');

    } catch (error) {
      // Error message handled by parent (App.js)
      // setMessage(`Deployment failed: ${error.message}`);
      // setMessageVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>Deploy New Token</Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formTokenName">
            <Form.Label>Token Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter token name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formTokenSymbol">
            <Form.Label>Token Symbol</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter token symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
            />
          </Form.Group>

          {/* LP Migration Market Cap and Fee Recipient fields removed for pump.fun model */}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Deploying...' : 'Deploy Token'}
          </Button>
        </Form>

        {/* Message display handled by parent (App.js) */}
        {/* {message && (
          <Alert variant={messageVariant} className="mt-3">
            {message}
          </Alert>
        )} */}
      </Card.Body>
    </Card>
  );
}

export default TokenDeploymentForm;
