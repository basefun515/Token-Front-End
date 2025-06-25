import React, { useState } from 'react';
import './App.css';
import { ethers } from 'ethers';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Row, Col, Alert } from 'react-bootstrap';
import TokenDeploymentForm from './TokenDeploymentForm';
// Uncomment BuySellForm when ready to test it
// import BuySellForm from './BuySellForm';


function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null); // eslint-disable-line no-unused-vars
  const [error, setError] = useState(null);
  const [showDeploymentForm, setShowDeploymentForm] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState(null);
  // State to store deployed contract address for Buy/Sell form (if uncommented)
  // const [deployedContractAddress, setDeployedContractAddress] = useState(null);


  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setProvider(provider);
        setError(null);
      } catch (error) {
        setError(error.message);
        setAccount(null);
        setProvider(null);
      }
    } else {
      setError('MetaMask or another Ethereum provider is not detected.');
      setAccount(null);
      setProvider(null);
    }
  };

  // Function to handle token deployment via backend API
  const handleDeployToken = async (tokenDetails) => {
    setDeploymentStatus({ message: 'Initiating deployment via backend...', variant: 'info' });
    console.log("Attempting to deploy token with details:", tokenDetails);

    try {
      // Use the Backend Public URL for backend API calls
      // This URL is provided by the ngrok tunnel for port 5000
      const backendUrl = 'BACKEND_URL_PLACEHOLDER'; // <<< REPLACE THIS with the actual Backend Public URL


      const response = await fetch(`${backendUrl}/deploy-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const deployedAddress = result.tokenAddress;
      setDeploymentStatus({ message: `Deployment successful! Token Address: ${deployedAddress}`, variant: 'success' });
      console.log("Deployment successful. Token Address:", deployedAddress);

      // If you uncomment BuySellForm, you would pass this address to it
      // setDeployedContractAddress(deployedAddress);


    } catch (error) {
      setDeploymentStatus({ message: `Deployment failed: ${error.message}`, variant: 'danger' });
      console.error("Deployment error:", error);
    }
  };


  return (
    <Container className="mt-5">
      <Row className="justify-content-md-center">
        <Col md="auto">
          <h1>Token Launch Platform</h1>
          {!account ? (
            <Button onClick={connectWallet}>Connect Wallet</Button>
          ) : (
            <div>
              <Alert variant="success">
                Wallet Connected: {account}
              </Alert>

              {/* Button to toggle deployment form visibility */}
              <Button onClick={() => setShowDeploymentForm(!showDeploymentForm)} className="mb-3">
                {showDeploymentForm ? 'Hide Deployment Form' : 'Show Deployment Form'}
              </Button>

              {/* Conditionally render the TokenDeploymentForm */}
              {showDeploymentForm && (
                <TokenDeploymentForm onDeploy={handleDeployToken} />
              )}

              {/* Display deployment status */}
              {deploymentStatus && (
                <Alert variant={deploymentStatus.variant} className="mt-3">
                  {deploymentStatus.message}
                </Alert>
              )}

              {/* Uncomment and use BuySellForm when you have a deployed contract address */}
              {/* {account && provider && deployedContractAddress && (
                 <BuySellForm account={account} provider={provider} contractAddress={deployedContractAddress} />
              )} */}

              {/* Add other platform features here */}
            </div>
          )}
          {error && (
            <Alert variant="danger" className="mt-3">
              Error: {error}
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;
