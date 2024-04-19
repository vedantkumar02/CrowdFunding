import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import {ThirdwebProvider} from '@thirdweb-dev/react';
import './index.css';
import App from './App';
import { StateContextProvider } from "./context/index.jsx";
import {Sepolia} from "@thirdweb-dev/chains"

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThirdwebProvider activeChain={Sepolia} clientId={import.meta.env.VITE_TEMPLATE_CLIENT_ID}> 
    <Router>
      <StateContextProvider >
        <App />
      </StateContextProvider>
    </Router>
  </ThirdwebProvider> 
)