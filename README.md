# VibeFeed Frontend + Contract Integration

This repo includes a React (Vite) frontend in `VibeFeed/` and the Solidity contract `contracts/VibeFeed.sol`.

## Use a Remix-deployed contract in the frontend

1. Find your Remix deployment address and network.
	- In Remix, check the address in the Deployed Contracts panel.
	- If you used Injected Provider with MetaMask, the network is whatever MetaMask was on (e.g., Sepolia).
2. Update `VibeFeed/src/contracts/addresses.js`:
	- Set `CONTRACTS.VIBEFEED` to your deployed address.
	- Set `CHAIN_ID`, `CHAIN_NAME`, and `RPC_URL` to match the network.
3. In MetaMask, switch to the same network and connect the wallet in the app.

## Local testing on Anvil (Foundry)

Prereqs: Install Foundry (`foundryup`) and Bun/NPM for the frontend.

1. Install dependencies for contracts (OpenZeppelin):
	```bash
	forge install openzeppelin/openzeppelin-contracts
	```
	Then build once to verify:
	```bash
	forge build
	```

2. Start Anvil:
	```bash
	anvil
	```
3. Deploy:
	- Create `.env` in the repo root: `PRIVATE_KEY=<anvil_private_key>`.
	- Run:
	```bash
	forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
	```
	Copy the printed address.
4. Configure the frontend:
	- In `VibeFeed/src/contracts/addresses.js` set `CONTRACTS.VIBEFEED` to the address.
	- Set `CHAIN_ID=31337` and `NETWORK_CONFIG.rpcUrls=["http://127.0.0.1:8545"]`.
5. Run the frontend:
	```bash
	cd VibeFeed
	bun install
	bun run dev
	```
	In MetaMask, add a custom network for `http://127.0.0.1:8545` and connect.

## Deploy to Sepolia via Remix/MetaMask

1. In Remix, select `Injected Provider - MetaMask`, switch MetaMask to Sepolia, and deploy `VibeFeed.sol`.
2. Copy the address into `CONTRACTS.VIBEFEED` and set `CHAIN_ID=11155111`.
3. Make sure your account has Sepolia ETH.

## ABI & functions

The frontend uses the combined ABI in `VibeFeed/src/contracts/abis.js` that matches `VibeFeed.sol`.
Key functions:
- registerHandle(string)
- createPost(string cid, string handle)
- like(uint256 postId)
- stake(uint256 amount), unstake()
- claimRewards()

## Troubleshooting

- If the app prompts to switch network, approve the switch.
- If transactions fail, ensure you have test ETH on the target network.
- If posts/likes don't update, check `CONTRACTS.VIBEFEED` and that MetaMask is on the same network.
