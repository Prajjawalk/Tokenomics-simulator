"use client";

import { useCallback, useEffect, useState } from "react";
import { ExchangeSimulationData } from "./exchangesimulation";
import { ICOSimulationData } from "./icosimulation";
import { InvestorSimulationData } from "./investorsimulation";
import type { NextPage } from "next";
import {
  PublicClient,
  TransactionReceipt,
  WalletClient,
  createPublicClient,
  createWalletClient,
  custom,
  getContract,
  http,
  parseEventLogs,
} from "viem";
import { useAccount } from "wagmi";
import { InputBase } from "~~/components/scaffold-eth";
import deployedContracts from "~~/contracts/deployedContracts";

interface Message {
  role: string;
  content: string;
}

const Home: NextPage = () => {
  const [tokenName, setTokenName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [tokenTotalSupply, setTokenTotalSupply] = useState("");
  const [founderAllocation, setFounderAllocation] = useState("");
  const [advisorAllocation, setAdvisorAllocation] = useState("");
  const [publicSaleAllocation, setPublicSaleAllocation] = useState("");
  const [privateSaleAllocation, setPrivateSaleAllocation] = useState("");
  const [communityAllocation, setCommunityAllocation] = useState("");
  const [futureDevelopmentAllocation, setFutureDevelopmentAllocation] = useState("");
  const [tokenPrice, setTokenPrice] = useState("");
  const [hardcap, setHardcap] = useState("");
  const [softcap, setSoftcap] = useState("");
  const [acceptedCrypto, setAcceptedCrypto] = useState("");
  const [consensus, setConsensus] = useState("");
  const [exchangeCirculatingSupply, setExchangeCirculatingSupply] = useState("");
  const [communitySize, setCommunitySize] = useState("");
  const [poolPercentage, setPoolPercentage] = useState("");
  const [liquidityPoolValue, setLiquidityPoolValue] = useState("");
  const [utility, setUtility] = useState("");
  const [ecosystemSize, setEcosystemSize] = useState("");
  const [partnerships, setPartnerships] = useState("");
  const [regulation, setRegulation] = useState("");
  const [roadmap, setRoadmap] = useState("");
  const [newOutreach, setNewOutreach] = useState("");
  const [tradingVol, setTradingVol] = useState("");
  const [priceVolatility, setPriceVolatility] = useState("");
  const [historicalPriceTrends, setHistoricalPriceTrends] = useState("");
  const [holderDistribution, setHolderDistribution] = useState("");
  const [burnRate, setBurnRate] = useState("");
  const [inflation, setInflation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number>();
  const [totalIcoBuyers, setTotalIcoBuyers] = useState<string>();
  const [communitySentiments, setCommunitySentiments] = useState<Array<string>>([]);
  const [totalNewHolders, setTotalNewHolders] = useState<string>();
  const [totalTokensListed, setTotalTokensListed] = useState<string>();
  const [willExchangeList, setWillExchangeList] = useState<string>();
  const [exchangeListingFees, setExchangeListingFees] = useState<string>();
  const [totalNewCommunityMembers, setTotalNewCommunityMembers] = useState<string>();
  const [circulatingSupplyListingPercent, setCirculatingSupplyListingPercent] = useState<string>();
  const [newDevelopments, setNewDevelopments] = useState<string>();
  const [walletClient, setWalletClient] = useState<any>();
  const [publicClient, setPublicClient] = useState<any>();

  useEffect(() => {
    setWalletClient(
      createWalletClient({
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
        transport: custom(window.ethereum as any),
      }),
    );

    setPublicClient(
      createPublicClient({
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
        transport: http(),
      }),
    );
  }, []);

  const categories = [...Array(7).keys()];
  const categoryDappMap = {
    0: "Dex",
    1: "AI",
    2: "ZK",
    3: "Dapp",
    4: "Gaming",
    5: "L1",
    6: "L2",
  };
  const templates = {
    tokenName: ["CryptoConnect"],
    projectDescription: [
      "CryptoConnect is a decentralized platform designed to bridge the gap between various blockchain networks, providing seamless interoperability and enhanced scalability.",
    ],
    tokenTotalSupply: [" 1,000,000,000"],
    founderAllocation: ["20%"],
    advisorAllocation: ["5%"],
    publicSaleAllocation: ["40%"],
    privateSaleAllocation: ["15%"],
    communityAllocation: ["10%"],
    futureDevelopmentAllocation: ["10%"],
    tokenPrice: ["0.01 ETH"],
    hardcap: ["10,000 ETH"],
    softcap: ["2000 ETH"],
    acceptedCrypto: ["ETH, BTC, USDT"],
    consensus: ["POS"],
    exchangeCirculatingSupply: ["300000000"],
    communitySize: ["50,000"],
    poolPercentage: ["15%"],
    liquidityPoolValue: ["1500 ETH"],
    utility: ["Used for transaction fees, staking rewards, and access to premium features on the platform.    "],
    ecosystemSize: ["50,000 users and 500 developers."],
    partnerships: ["Collaborations with major blockchain networks like Ethereum, Binance Smart Chain, and Polkadot."],
    regulation: ["Compliant with KYC and AML regulations in multiple jurisdictions."],
    roadmap: [
      `Q1 2024: Token sale and initial exchange listing.
    Q2 2024: Launch of the mainnet and staking functionality.
    Q3 2024: Integration with partner blockchain networks.`,
    ],
    tradingVol: ["10,000 ETH (daily trading volume)"],
    priceVolatility: [" High (30% daily price movement)    "],
    historicalPriceTrends: [
      `Monthly: Stable at around 0.01 ETH with occasional spikes up to 0.015 ETH.
    Weekly: Fluctuations between 0.009 ETH and 0.011 ETH.
    Yearly: Started at 0.005 ETH and gradually increased to 0.01 ETH.
    `,
    ],
    holderDistribution: [
      `Top 10 holders: 60% of total supply
    Bottom 10 holders: 1% of total supply
    `,
    ],
    burnRate: [
      `Monthly: 1,000,000 CRT
    Yearly: 12,000,000 CRT
    `,
    ],
    inflation: [
      `Monthly: 0.5%
    Yearly: 6%
    `,
    ],
  };

  const loadTemplate = useCallback(() => {
    setTokenName(templates.tokenName[0]);
    setProjectDescription(templates.projectDescription[0]);
    setTokenTotalSupply(templates.tokenTotalSupply[0]);
    setFounderAllocation(templates.founderAllocation[0]);
    setAdvisorAllocation(templates.advisorAllocation[0]);
    setPublicSaleAllocation(templates.publicSaleAllocation[0]);
    setPrivateSaleAllocation(templates.privateSaleAllocation[0]);
    setCommunityAllocation(templates.communityAllocation[0]);
    setFutureDevelopmentAllocation(templates.futureDevelopmentAllocation[0]);
    setTokenPrice(templates.tokenPrice[0]);
    setHardcap(templates.hardcap[0]);
    setSoftcap(templates.softcap[0]);
    setAcceptedCrypto(templates.acceptedCrypto[0]);
    setConsensus(templates.consensus[0]);
    setExchangeCirculatingSupply(templates.exchangeCirculatingSupply[0]);
    setCommunitySize(templates.communitySize[0]);
    setPoolPercentage(templates.poolPercentage[0]);
    setLiquidityPoolValue(templates.liquidityPoolValue[0]);
    setUtility(templates.utility[0]);
    setEcosystemSize(templates.ecosystemSize[0]);
    setPartnerships(templates.partnerships[0]);
    setRegulation(templates.regulation[0]);
    setRoadmap(templates.roadmap[0]);
    setTradingVol(templates.tradingVol[0]);
    setPriceVolatility(templates.priceVolatility[0]);
    setHistoricalPriceTrends(templates.historicalPriceTrends[0]);
    setHolderDistribution(templates.holderDistribution[0]);
    setBurnRate(templates.burnRate[0]);
    setInflation(templates.inflation[0]);
  }, [
    templates.acceptedCrypto,
    templates.advisorAllocation,
    templates.burnRate,
    templates.communityAllocation,
    templates.communitySize,
    templates.consensus,
    templates.ecosystemSize,
    templates.exchangeCirculatingSupply,
    templates.founderAllocation,
    templates.futureDevelopmentAllocation,
    templates.hardcap,
    templates.historicalPriceTrends,
    templates.holderDistribution,
    templates.inflation,
    templates.liquidityPoolValue,
    templates.partnerships,
    templates.poolPercentage,
    templates.priceVolatility,
    templates.privateSaleAllocation,
    templates.projectDescription,
    templates.publicSaleAllocation,
    templates.regulation,
    templates.roadmap,
    templates.softcap,
    templates.tokenName,
    templates.tokenPrice,
    templates.tokenTotalSupply,
    templates.tradingVol,
    templates.utility,
  ]);

  const account = useAccount();

  async function getAgentRunId(receipt: TransactionReceipt, contractABI: any) {
    const receiptLogs = parseEventLogs({
      abi: contractABI,
      logs: receipt.logs,
      eventName: "AgentRunCreated",
    });
    console.log(receiptLogs);

    //@ts-ignore
    const agentRunID = receiptLogs[0]["args"].runId;

    return agentRunID;
  }

  async function getNewMessages(contract: any, agentRunID: number, currentMessagesCount: number): Promise<Message[]> {
    const messages = await contract.read.getMessageHistoryContents([agentRunID]);
    const roles = await contract.read.getMessageHistoryRoles([agentRunID]);

    const newMessages: Message[] = [];
    messages.forEach((message: any, i: number) => {
      if (i >= currentMessagesCount) {
        newMessages.push({
          role: roles[i],
          content: messages[i],
        });
      }
    });
    return newMessages;
  }

  const simulateICO = useCallback(async () => {
    const traderAgent = getContract({
      abi: deployedContracts[696969].TraderAgent.abi,
      address: deployedContracts[696969].TraderAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    const tx = await traderAgent.write.ICOTradeBehaviour(
      [
        tokenName,
        projectDescription,
        tokenTotalSupply,
        founderAllocation,
        advisorAllocation,
        publicSaleAllocation,
        privateSaleAllocation,
        communityAllocation,
        futureDevelopmentAllocation,
        tokenPrice,
        hardcap,
        softcap,
        acceptedCrypto,
        consensus,
        exchangeCirculatingSupply,
        communitySize,
        poolPercentage,
        liquidityPoolValue,
      ],
      {
        account: account.address as string,
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
      },
    );

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    // Get the agent run ID from transaction receipt logs
    const agentRunID = await getAgentRunId(receipt, traderAgent.abi);
    console.log(`Created agent run ID: ${agentRunID}`);
    if (!agentRunID && agentRunID !== 0) {
      return;
    }

    const allMessages: Message[] = [];
    // Run the chat loop: read messages and send messages
    let exitNextLoop = false;
    while (true) {
      const newMessages: Message[] = await getNewMessages(traderAgent, agentRunID, allMessages.length);
      if (newMessages) {
        for (const message of newMessages) {
          const roleDisplay = message.role === "assistant" ? "THOUGHT" : "STEP";
          const color = message.role === "assistant" ? "\x1b[36m" : "\x1b[33m"; // Cyan for thought, yellow for step
          console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
          allMessages.push(message);
          if (message.role === "assistant") {
            const jsonMessage = JSON.parse(message.content);
            setTokenPrice(jsonMessage["tokenPrice"]);
            setTotalIcoBuyers(jsonMessage["totalHolders"]);
            setExchangeCirculatingSupply(jsonMessage["tokenSupply"]);
            setNewDevelopments(newDevelopments + " launched a successful");
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (exitNextLoop) {
        console.log(`agent run ID ${agentRunID} finished!`);
        break;
      }
      if (await traderAgent.read.isRunFinished([BigInt(agentRunID)])) {
        exitNextLoop = true;
      }
    }

    const communityAgent = getContract({
      abi: deployedContracts[696969].CommunityAgent.abi,
      address: deployedContracts[696969].CommunityAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    const ctx = await communityAgent.write.reactionToNewDevelopment(
      [
        tokenName,
        projectDescription,
        tokenTotalSupply,
        tokenPrice,
        consensus,
        exchangeCirculatingSupply,
        communitySize,
        tokenTotalSupply + " * " + tokenPrice,
        tradingVol,
        priceVolatility,
        historicalPriceTrends,
        holderDistribution,
        burnRate,
        inflation,
        utility,
        ecosystemSize,
        partnerships,
        regulation,
        roadmap,
        String(newDevelopments),
      ],
      {
        account: account.address as string,
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
      },
    );

    const creceipt = await publicClient.waitForTransactionReceipt({
      hash: ctx,
    });

    // Get the agent run ID from transaction receipt logs
    const cagentRunID = await getAgentRunId(creceipt, communityAgent.abi);
    console.log(`Created agent run ID: ${cagentRunID}`);
    if (!cagentRunID && cagentRunID !== 0) {
      return;
    }

    const callMessages: Message[] = [];
    // Run the chat loop: read messages and send messages
    let cexitNextLoop = false;
    while (true) {
      const cnewMessages: Message[] = await getNewMessages(communityAgent, cagentRunID, callMessages.length);
      if (cnewMessages) {
        for (const message of cnewMessages) {
          const roleDisplay = message.role === "assistant" ? "THOUGHT" : "STEP";
          const color = message.role === "assistant" ? "\x1b[36m" : "\x1b[33m"; // Cyan for thought, yellow for step
          console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
          callMessages.push(message);
          if (message.role === "assistant") {
            const jsonMessage = JSON.parse(message.content[0] === "`" ? message.content.slice(7, -3) : message.content);
            setCommunitySentiments(jsonMessage["communityMessages"]);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (cexitNextLoop) {
        console.log(`agent run ID ${cagentRunID} finished!`);
        break;
      }
      if (await communityAgent.read.isRunFinished([BigInt(cagentRunID)])) {
        cexitNextLoop = true;
      }
    }
  }, [
    acceptedCrypto,
    account.address,
    advisorAllocation,
    burnRate,
    communityAllocation,
    communitySize,
    consensus,
    ecosystemSize,
    exchangeCirculatingSupply,
    founderAllocation,
    futureDevelopmentAllocation,
    hardcap,
    historicalPriceTrends,
    holderDistribution,
    inflation,
    liquidityPoolValue,
    newDevelopments,
    partnerships,
    poolPercentage,
    priceVolatility,
    privateSaleAllocation,
    projectDescription,
    publicClient,
    publicSaleAllocation,
    regulation,
    roadmap,
    softcap,
    tokenName,
    tokenPrice,
    tokenTotalSupply,
    tradingVol,
    utility,
    walletClient,
  ]);

  const simulateInvestors = useCallback(async () => {
    const investorsAgent = getContract({
      abi: deployedContracts[696969].RetailInvestorAgent.abi,
      address: deployedContracts[696969].RetailInvestorAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    const tx = await investorsAgent.write.TokenInvestBehaviour(
      [
        tokenName,
        projectDescription,
        tokenTotalSupply,
        tokenPrice,
        consensus,
        exchangeCirculatingSupply,
        communitySize,
        tokenTotalSupply + " * " + tokenPrice,
        tradingVol,
        priceVolatility,
        historicalPriceTrends,
        holderDistribution,
        burnRate,
        inflation,
        utility,
        ecosystemSize,
        partnerships,
        regulation,
        roadmap,
        newOutreach,
      ],
      {
        account: account.address as string,
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
      },
    );

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    // Get the agent run ID from transaction receipt logs
    const agentRunID = await getAgentRunId(receipt, investorsAgent.abi);
    console.log(`Created agent run ID: ${agentRunID}`);
    if (!agentRunID && agentRunID !== 0) {
      return;
    }

    const allMessages: Message[] = [];
    // Run the chat loop: read messages and send messages
    let exitNextLoop = false;
    while (true) {
      const newMessages: Message[] = await getNewMessages(investorsAgent, agentRunID, allMessages.length);
      if (newMessages) {
        for (const message of newMessages) {
          const roleDisplay = message.role === "assistant" ? "THOUGHT" : "STEP";
          const color = message.role === "assistant" ? "\x1b[36m" : "\x1b[33m"; // Cyan for thought, yellow for step
          console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
          allMessages.push(message);
          if (message.role === "assistant") {
            const jsonMessage = JSON.parse(message.content);
            setTokenPrice(jsonMessage["tokenPrice"]);
            setTotalNewHolders(jsonMessage["totalNewHolders"]);
            setTotalIcoBuyers(jsonMessage["totalHolders"]);
            setCommunitySize(jsonMessage["communitySize"]);
            setTotalNewCommunityMembers(jsonMessage["newCommunityMembers"]);
            setExchangeCirculatingSupply(jsonMessage["tokenSupply"]);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (exitNextLoop) {
        console.log(`agent run ID ${agentRunID} finished!`);
        break;
      }
      if (await investorsAgent.read.isRunFinished([BigInt(agentRunID)])) {
        exitNextLoop = true;
      }
    }
  }, [
    account.address,
    burnRate,
    communitySize,
    consensus,
    ecosystemSize,
    exchangeCirculatingSupply,
    historicalPriceTrends,
    holderDistribution,
    inflation,
    newOutreach,
    partnerships,
    priceVolatility,
    projectDescription,
    publicClient,
    regulation,
    roadmap,
    tokenName,
    tokenPrice,
    tokenTotalSupply,
    tradingVol,
    utility,
    walletClient,
  ]);

  const simulateExchange = useCallback(async () => {
    const exchangeAgent = getContract({
      abi: deployedContracts[696969].ExchangeAgent.abi,
      address: deployedContracts[696969].ExchangeAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    const tx = await exchangeAgent.write.TokenListingBehaviour(
      [
        tokenName,
        projectDescription,
        tokenTotalSupply,
        tokenPrice,
        consensus,
        exchangeCirculatingSupply,
        communitySize,
        tokenTotalSupply + " * " + tokenPrice,
        tradingVol,
        priceVolatility,
        historicalPriceTrends,
        holderDistribution,
        burnRate,
        inflation,
        utility,
        ecosystemSize,
        partnerships,
        communitySentiments.join(", "),
        regulation,
        roadmap,
      ],
      {
        account: account.address as string,
        chain: {
          id: 696969,
          name: "Galadriel Devnet",
          nativeCurrency: {
            name: "Galadriel Token",
            symbol: "GAL",
            decimals: 18,
          },
          rpcUrls: {
            default: {
              http: ["https://devnet.galadriel.com/"],
            },
          },
        },
      },
    );

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    // Get the agent run ID from transaction receipt logs
    const agentRunID = await getAgentRunId(receipt, exchangeAgent.abi);
    console.log(`Created agent run ID: ${agentRunID}`);
    if (!agentRunID && agentRunID !== 0) {
      return;
    }

    const allMessages: Message[] = [];
    // Run the chat loop: read messages and send messages
    let exitNextLoop = false;
    while (true) {
      const newMessages: Message[] = await getNewMessages(exchangeAgent, agentRunID, allMessages.length);
      if (newMessages) {
        for (const message of newMessages) {
          const roleDisplay = message.role === "assistant" ? "THOUGHT" : "STEP";
          const color = message.role === "assistant" ? "\x1b[36m" : "\x1b[33m"; // Cyan for thought, yellow for step
          console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
          allMessages.push(message);
          if (message.role === "assistant") {
            const jsonMessage = JSON.parse(message.content);
            setTotalTokensListed(jsonMessage["totalTokensListed"]);
            setCirculatingSupplyListingPercent(jsonMessage["percentageOfTotalCirculatingSupplyListed"]);
            setWillExchangeList(jsonMessage["willYouListThisToken"]);
            setExchangeListingFees(jsonMessage["listingFees"]);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (exitNextLoop) {
        console.log(`agent run ID ${agentRunID} finished!`);
        break;
      }
      if (await exchangeAgent.read.isRunFinished([BigInt(agentRunID)])) {
        exitNextLoop = true;
      }
    }
  }, [
    account.address,
    burnRate,
    communitySentiments,
    communitySize,
    consensus,
    ecosystemSize,
    exchangeCirculatingSupply,
    historicalPriceTrends,
    holderDistribution,
    inflation,
    partnerships,
    priceVolatility,
    projectDescription,
    publicClient,
    regulation,
    roadmap,
    tokenName,
    tokenPrice,
    tokenTotalSupply,
    tradingVol,
    utility,
    walletClient,
  ]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Tokenomics Simulator</span>
            <span className="block text-md font-bold">AI based tokenomics simulator powered by Galadriel</span>
          </h1>
          <div className="grid grid-cols-2 gap-10 w-full max-w-7xl">
            <div className="z-10">
              <div className="adafelbg bg-base-100 rounded-3xl  border-base-300 flex flex-col mt-10 relative">
                <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <p className="my-0 text-sm">Details</p>
                  </div>
                </div>
                <div className="p-5 divide-y divide-base-300 h-screen overflow-scroll">
                  <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
                    <p className="text-lg my-0 break-words">Add token details</p>
                    <p className="text-sm my-0 break-words">OR</p>
                    <p className="text-lg my-0 break-words">Choose from the templates below</p>
                    <p className="font-medium my-0 break-words">Select Category</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      {categories.length === 0 ? (
                        <p className="text-3xl mt-14">No categories found!</p>
                      ) : (
                        <>
                          {categories.length > 1 && (
                            <div className="flex flex-row gap-2 w-full max-w-7xl pb-1 px-6 lg:px-10 flex-wrap">
                              {categories.map(category => (
                                <button
                                  className={`btn btn-secondary btn-md ${
                                    category === selectedCategory ? "text-white buttoneffect" : "text-black"
                                  }`}
                                  // disabled={String(attestationId) != "" || isLoading}
                                  onClick={() => setSelectedCategory(category)}
                                  key={category}
                                >
                                  {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                                  {categoryDappMap[category as keyof typeof categoryDappMap]}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <button
                      className={`btn btn-primary btn-md`}
                      // disabled={String(attestationId) != "" || isLoading}
                      onClick={loadTemplate}
                    >
                      {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                      Load Template
                    </button>
                    <p className="font-medium my-0 break-words">Token Name</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="TokenName" value={tokenName} onChange={setTokenName} />
                    </div>
                    <p className="font-medium my-0 break-words">Project description</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Description"
                        value={projectDescription}
                        onChange={setProjectDescription}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">The token’s total supply</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Total Supply"
                        value={tokenTotalSupply}
                        onChange={setTokenTotalSupply}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for founders/team</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Team allocation"
                        value={founderAllocation}
                        onChange={setFounderAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for advisors</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Advisor allocation"
                        value={advisorAllocation}
                        onChange={setAdvisorAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for private sale</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Private sale allocation"
                        value={privateSaleAllocation}
                        onChange={setPrivateSaleAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for public sale</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Public sale allocation"
                        value={publicSaleAllocation}
                        onChange={setPublicSaleAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for community</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Community allocation"
                        value={communityAllocation}
                        onChange={setCommunityAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Allocation for future development</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Future development allocation"
                        value={futureDevelopmentAllocation}
                        onChange={setFutureDevelopmentAllocation}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Token price</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Price" value={tokenPrice} onChange={setTokenPrice} />
                    </div>
                    <p className="font-medium my-0 break-words">Hardcap</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Hardcap" value={hardcap} onChange={setHardcap} />
                    </div>
                    <p className="font-medium my-0 break-words">Softcap</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Softcap" value={softcap} onChange={setSoftcap} />
                    </div>
                    <p className="font-medium my-0 break-words">Accepted crypto for investments</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Accepted cryptocurrencies"
                        value={acceptedCrypto}
                        onChange={setAcceptedCrypto}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Consensus</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Consensus" value={consensus} onChange={setConsensus} />
                    </div>
                    <p className="font-medium my-0 break-words">Circulating supply in exchange</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Circulating supply"
                        value={exchangeCirculatingSupply}
                        onChange={setExchangeCirculatingSupply}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Community size</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Community size"
                        value={communitySize}
                        onChange={setCommunitySize}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Pool Percentage</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Pool Percentage"
                        value={poolPercentage}
                        onChange={setPoolPercentage}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Liquidity Pool Value</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Liquidity Pool Value"
                        value={liquidityPoolValue}
                        onChange={setLiquidityPoolValue}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Utility</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="token utility" value={utility} onChange={setUtility} />
                    </div>
                    <p className="font-medium my-0 break-words">Ecosystem Size</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase
                        name=""
                        placeholder="Ecosystem Size"
                        value={ecosystemSize}
                        onChange={setEcosystemSize}
                      />
                    </div>
                    <p className="font-medium my-0 break-words">Partnerships</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Partnerships" value={partnerships} onChange={setPartnerships} />
                    </div>
                    <p className="font-medium my-0 break-words">Roadmap</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Roadmap" value={roadmap} onChange={setRoadmap} />
                    </div>
                    <p className="font-medium my-0 break-words">Regulation</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="Regulation" value={regulation} onChange={setRegulation} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="z-10">
              <div className="adafelbg bg-base-100 rounded-3xl  border-base-300 flex flex-col mt-10 relative">
                <div className="h-[5rem] w-[5.5rem] bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] shadow-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <p className="my-0 text-sm">Simulate</p>
                  </div>
                </div>
                <div className="p-5 divide-y divide-base-300">
                  <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
                    <p className="font-medium my-0 break-words">ICO Launch:</p>
                    <button
                      className={`btn btn-primary btn-md`}
                      // disabled={String(attestationId) != "" || isLoading}
                      onClick={simulateICO}
                    >
                      {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                      Simulate ICO Launch
                    </button>
                    {totalIcoBuyers && communitySentiments.length > 0 ? (
                      <ICOSimulationData
                        simulationDetails={{
                          finalTokenPrice: tokenPrice,
                          totalBuyers: totalIcoBuyers,
                          finalCirculatingSupply: exchangeCirculatingSupply,
                          communitySentiments: communitySentiments,
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
                    <p className="font-large my-0 break-words">Investor:</p>
                    <p className="font-medium my-0 break-words">New outreach:</p>
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex items-center ml-2">
                        <span className="block text-xs font-extralight leading-none">string</span>
                      </div>
                      <InputBase name="" placeholder="set new outreach" value={newOutreach} onChange={setNewOutreach} />
                    </div>
                    <button
                      className={`btn btn-primary btn-md`}
                      // disabled={String(attestationId) != "" || isLoading}
                      onClick={simulateInvestors}
                    >
                      {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                      Simulate Investors behaviour
                    </button>
                    {totalNewCommunityMembers && totalNewHolders ? (
                      <InvestorSimulationData
                        simulationDetails={{
                          finalTokenPrice: tokenPrice,
                          totalNewBuyers: totalNewHolders,
                          totalNewCommunityMembers: totalNewCommunityMembers,
                          finalCirculatingSupply: exchangeCirculatingSupply,
                          communitySentiments: communitySentiments,
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
                    <p className="font-medium my-0 break-words">Exchange:</p>
                    <button
                      className={`btn btn-primary btn-md`}
                      // disabled={String(attestationId) != "" || isLoading}
                      onClick={simulateExchange}
                    >
                      {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                      Simulate Exchange
                    </button>
                    {totalTokensListed && willExchangeList && exchangeListingFees && circulatingSupplyListingPercent ? (
                      <ExchangeSimulationData
                        simulationDetails={{
                          totalTokensListed: totalTokensListed,
                          circulatingSupplyPercent: circulatingSupplyListingPercent,
                          willList: willExchangeList,
                          listingFees: exchangeListingFees,
                        }}
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-3 py-5 first:pt-0 last:pb-1">
                    <p className="font-medium my-0 break-words">Community Simulation:</p>
                    <button
                      className={`btn btn-primary btn-md`}
                      // disabled={String(attestationId) != "" || isLoading}
                      // onClick={() => setSelectedCategory(category)}
                    >
                      {/* {isLoading && <span className="loading loading-spinner loading-xs"></span>} */}
                      Simulate Community
                    </button>
                    {communitySentiments.length > 0 ? (
                      <div className="h-[120px] w-[400px] overflow-auto mt-5 ">
                        {communitySentiments.map((i, idx) => (
                          <p key={idx}>{i}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
