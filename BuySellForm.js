import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { ethers } from 'ethers';

// Assuming you have the contract ABI and address
// Import the contract artifact JSON file
// Note: In a real frontend setup, you might configure your build tool
// to handle importing JSON from outside src, or copy this file to src.
// For simplicity in this Colab context, we'll assume it's accessible.
import BondingCurveTokenArtifact from '../artifacts/contracts/BondingCurveToken.sol/BondingCurveToken.json';


// This component will receive the deployedContractAddress as a prop
function BuySellForm({ account, provider, contractAddress }) {
  const [tokenAmount, setTokenAmount] = useState('');
  const [etherAmount, setEtherAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageVariant, setMessageVariant] = useState('info');
  const [contract, setContract] = useState(null); // State to hold the contract instance

  // Update contract instance when provider, account, or contractAddress changes
  useEffect(() => {
    if (provider && account && contractAddress && BondingCurveTokenArtifact.abi) {
      try {
        // Create a contract instance with the signer for sending transactions
        const signer = provider.getSigner(account); // Get signer for the connected account
        const contractInstance = new ethers.Contract(contractAddress, BondingCurveTokenArtifact.abi, signer);
        setContract(contractInstance);
        setMessage(''); // Clear messages on contract load
        setMessageVariant('info');
        console.log("BuySellForm: Contract instance created.", contractAddress);
      } catch (error) {
         console.error("BuySellForm: Error creating contract instance:", error);
         setMessage(`Error loading contract: ${error.message}`);
         setMessageVariant('danger');
         setContract(null); // Clear contract on error
      }
    } else {
      setContract(null); // Clear contract if prerequisites are missing
       if (!account) setMessage("Connect your wallet to enable trading.");
       else if (!contractAddress) setMessage("Deploy a token first to enable trading.");
       else setMessage("Provider or ABI not available.");
       setMessageVariant('info'); // Info message if not ready
    }
  }, [account, provider, contractAddress]); // Depend on these values


  const handleBuy = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageVariant('info');

    if (!contract) {
      setMessage("Contract not loaded. Connect wallet and deploy a token.");
      setMessageVariant('danger');
      setLoading(false);
      return;
    }
     if (!etherAmount || parseFloat(etherAmount) <= 0) {
        setMessage("Please enter a valid amount of Ether to buy.");
        setMessageVariant('warning');
        setLoading(false);
        return;
    }


    try {
      // Assuming user inputs ether amount to buy tokens
      const amountToSend = ethers.parseEther(etherAmount);

      setMessage(`Sending buy transaction...`);
      setMessageVariant('info');

      // Call the buyTokens function, sending Ether with the transaction
      const tx = await contract.buyTokens({ value: amountToSend });
      setMessage(`Transaction sent: ${tx.hash}`);
      setMessageVariant('info');

      console.log("Buy transaction sent, waiting for confirmation:", tx.hash);
      setMessage(`Waiting for transaction confirmation...`);
      setMessageVariant('info');

      // Wait for the transaction to be mined and confirmed
      const receipt = await tx.wait();

      if (receipt.status === 1) {
          setMessage(`Buy successful! Transaction confirmed.`);
          setMessageVariant('success');
          setEtherAmount(''); // Clear input after successful transaction
          console.log("Buy transaction confirmed:", receipt);
      } else {
          setMessage(`Buy transaction failed on chain.`);
          setMessageVariant('danger');
          console.error("Buy transaction failed:", receipt);
           // Attempt to get more error details if possible (e.g., revert reason)
           // This is more advanced and depends on RPC support
      }


    } catch (error) {
      console.error("Buy error:", error);
      // Provide more user-friendly error messages
      if (error.code === 'ACTION_REJECTED') {
          setMessage("Transaction rejected by user.");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
          setMessage("Insufficient funds in your wallet for this transaction.");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
           setMessage(`Could not estimate gas. Check if contract is deployed and arguments are valid: ${error.message}`);
      }
      else {
         setMessage(`Buy failed: ${error.message}`);
      }
      setMessageVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageVariant('info');

    if (!contract) {
      setMessage("Contract not loaded. Connect wallet and deploy a token.");
      setMessageVariant('danger');
      setLoading(false);
      return;
    }
     if (!tokenAmount || parseFloat(tokenAmount) <= 0) {
        setMessage("Please enter a valid amount of tokens to sell.");
        setMessageVariant('warning');
        setLoading(false);
        return;
    }

    try {
      // Assuming user inputs token amount to sell
      const amountToSell = ethers.parseEther(tokenAmount); // Assuming token uses 18 decimals

      setMessage(`Sending sell transaction...`);
      setMessageVariant('info');

      // Call the sellTokens function
      const tx = await contract.sellTokens(amountToSell);
      setMessage(`Transaction sent: ${tx.hash}`);
      setMessageVariant('info');

      console.log("Sell transaction sent, waiting for confirmation:", tx.hash);
      setMessage(`Waiting for transaction confirmation...`);
      setMessageVariant('info');

      // Wait for the transaction to be mined and confirmed
      const receipt = await tx.wait();

       if (receipt.status === 1) {
          setMessage(`Sell successful! Transaction confirmed.`);
          setMessageVariant('success');
          setTokenAmount(''); // Clear input after successful transaction
          console.log("Sell transaction confirmed:", receipt);
      } else {
          setMessage(`Sell transaction failed on chain.`);
          setMessageVariant('danger');
          console.error("Sell transaction failed:", receipt);
      }


    } catch (error) {
      console.error("Sell error:", error);
       // Provide more user-friendly error messages
      if (error.code === 'ACTION_REJECTED') {
          setMessage("Transaction rejected by user.");
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
          setMessage("Insufficient funds in your wallet for this transaction.");
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
           setMessage(`Could not estimate gas. Check if you have enough tokens and contract is deployed: ${error.message}`);
      }
      else {
         setMessage(`Sell failed: ${error.message}`);
      }
      setMessageVariant('danger');
    } finally {
      setLoading(false);
    }
  };

  // Render Buy/Sell forms only if contract is loaded
  if (!contract) {
      return (
         <Card className="mt-4">
            <Card.Header>Buy/Sell Tokens</Card.Header>
            <Card.Body>
               <Alert variant={messageVariant}>{message}</Alert>
            </Card.Body>
         </Card>
      );
  }


  return (
    <Card className="mt-4">
      <Card.Header>Buy/Sell Tokens (Contract: {contractAddress ? `${contractAddress.substring(0, 6)}...${contractAddress.substring(38)}` : 'Loading...'})</Card.Header>
      <Card.Body>
        <Form onSubmit={handleBuy}>
          <Form.Group className="mb-3" controlId="formBuyAmountEther">
            <Form.Label>Amount of Ether to Spend</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter Ether amount"
              value={etherAmount}
              onChange={(e) => setEtherAmount(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading || !account}>
            {loading ? 'Processing...' : 'Buy Tokens'}
          </Button>
        </Form>

        <hr className="my-4" />

        <Form onSubmit={handleSell}>
          <Form.Group className="mb-3" controlId="formSellAmountTokens">
            <Form.Label>Amount of Tokens to Sell</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter token amount"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="danger" type="submit" disabled={loading || !account}>
            {loading ? 'Processing...' : 'Sell Tokens'}
          </Button>
        </Form>

        {message && (
          <Alert variant={messageVariant} className="mt-3">
            {message}
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
}

export default BuySellForm;
