# Tokenomics Simulator

🧪 We have created an onchain AI based tokenomics simulator powered by Galadriel.

Designing a good tokenomics is the most crucial step for any blockchain protocol because the tokenomics either make or break the protocol. Currently we don't have sufficient toolsets and frameworks to create and test tokenomics. In order to solve this problem we have created the tokenomics simulator tool where anybody can enter the token details (circulating supply, allocations etc.) and run the simulations on how the token will behave, community will react and also price actions.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Tokenomics Simulator, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd tokenomics-simulator
yarn install
```

2. On a second terminal, deploy the contracts to galadriel network:

```
yarn deploy --network galadriel
```

The contract is located in `packages/hardhat/contracts` and can be modified to suit your needs. The `yarn deploy` command uses the deploy script located in `packages/hardhat/deploy` to deploy the contract to the network. You can also customize the deploy script.

3. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`.

The core of tokenomics simulator is powered by Galadriel network which is an onchain AI platform where we can call LLM's and get predictions.

We have created 4 AI Agents on Galadriel -

1. Trader agent who trades on the launch of an ICO
2. Community agent who reacts on token price actions, new developments etc.
3. Investor agent which determines how will the investor behave
4. Exchange agent which determines whether the token will be listed or not.

These 4 agents communicate with one another to get the relevant information and simulate actions accordingly.
