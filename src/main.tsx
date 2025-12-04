import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { WalletProvider } from './hooks/WalletContext';

createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<WalletProvider>
			<App />
		</WalletProvider>
	</React.StrictMode>,
);
