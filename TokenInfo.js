import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';

function TokenInfo({ tokenAddress, name, symbol, totalSupply, currentPrice }) {
  return (
    <Card className="mt-4">
      <Card.Header>Token Information</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item><b>Address:</b> {tokenAddress}</ListGroup.Item>
        <ListGroup.Item><b>Name:</b> {name}</ListGroup.Item>
        <ListGroup.Item><b>Symbol:</b> {symbol}</ListGroup.Item>
        <ListGroup.Item><b>Total Supply:</b> {totalSupply}</ListGroup.Item>
        <ListGroup.Item><b>Current Price:</b> {currentPrice} ETH</ListGroup.Item>
      </ListGroup>
    </Card>
  );
}

export default TokenInfo;
