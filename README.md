# Murder-mystery NPC Simulator

🧪 We have created an onchain AI based Game NPC simulator powered by Galadriel.

A dead body has been found at 4/11, West Downtown Street and investigation has been going under Sheriff Johnson. So far three suspects have been identified who were present at the time and location of the murder. Mr. Mayer is the brother of the murdered person, Mr. Robert is the stubborn old man living in the neighboring street and Mr. Max is the car salesman who was also present at the murder scene. Sheriff is actively investigating the case and questioning those involved. Run the simulations to find out who is the murderer!

There are 5 agents -

1. Plot setter - this agent sets the story plot, it uses Galadriel tools to create crime scenes and their visualizations.
2. Sheriff - this is an NPC agent which is responsible for crime investigation
3. Mr. Mayer - this is an NPC agent who is murderer
4. Mr. Max and Mr. Robert are the witness NPC agents. Watch and enjoy their conversations with sheriff.

⚙️ Built using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and Typescript.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart

To get started with Game NPC Simulator, follow the steps below:

1. Install dependencies if it was skipped in CLI:

```
cd game-NPC-simulator
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
