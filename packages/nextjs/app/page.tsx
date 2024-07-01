"use client";

import { useCallback, useEffect, useState } from "react";
import { PlotDetails } from "./plotDetails";
import { SheriffMaxConvo } from "./sheriffMaxConvo";
import { SheriffMayerConvo } from "./sheriffMayerConvo";
import { SheriffRobertConvo } from "./sheriffRobertConvo";
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
import {
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import deployedContracts from "~~/contracts/deployedContracts";

interface Message {
  role: string;
  content: string;
}

const Home: NextPage = () => {
  const [robertSheriffId, setRobertSheriffId] = useState(0);
  const [mayerSheriffId, setMayerSheriffId] = useState(0);
  const [maxSheriffId, setMaxSheriffId] = useState(0);
  const [robertId, setRobertId] = useState(0);
  const [mayerId, setMayerId] = useState(0);
  const [maxId, setMaxId] = useState(0);
  const [walletClient, setWalletClient] = useState<any>();
  const [publicClient, setPublicClient] = useState<any>();
  const [plot, setPlot] = useState<any>();
  const [plotImage, setPlotImage] = useState<string>();
  const [robertQuestion, setRobertQuestion] = useState<string>();
  const [robertAnswer, setRobertAnswer] = useState<string>();
  const [mayerQuestion, setMayerQuestion] = useState<string>();
  const [mayerAnswer, setMayerAnswer] = useState<string>();
  const [maxQuestion, setMaxQuestion] = useState<string>();
  const [maxAnswer, setMaxAnswer] = useState<string>();
  const [sheriffRobertConvo, setSheriffRobertConvo] = useState<string>();
  const [sheriffMayerConvo, setSheriffMayerConvo] = useState<string>();
  const [sheriffMaxConvo, setSheriffMaxConvo] = useState<string>();

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

  async function getChatId(receipt: TransactionReceipt, contractABI: any) {
    const receiptLogs = parseEventLogs({
      abi: contractABI,
      logs: receipt.logs,
      eventName: "ChatCreated",
    });
    console.log(receiptLogs);

    //@ts-ignore
    const agentRunID = receiptLogs[0]["args"].chatId;

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

  const simulatePlotCreation = useCallback(async () => {
    const investigatorAgent = getContract({
      abi: deployedContracts[696969].PlotSetterAgent.abi,
      address: deployedContracts[696969].PlotSetterAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    const tx = await investigatorAgent.write.RunPlotSetterAgent({
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
    });

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: tx,
    });

    // Get the agent run ID from transaction receipt logs
    const agentRunID = await getAgentRunId(receipt, investigatorAgent.abi);
    console.log(`Created agent run ID: ${agentRunID}`);
    if (!agentRunID && agentRunID !== 0) {
      return;
    }

    const allMessages: Message[] = [];
    // Run the chat loop: read messages and send messages
    let exitNextLoop = false;
    while (true) {
      const newMessages: Message[] = await getNewMessages(investigatorAgent, agentRunID, allMessages.length);
      if (newMessages) {
        for (const message of newMessages) {
          const roleDisplay = message.role === "assistant" ? "THOUGHT" : "STEP";
          const color = message.role === "assistant" ? "\x1b[36m" : "\x1b[33m"; // Cyan for thought, yellow for step
          console.log(`${color}${roleDisplay}\x1b[0m: ${message.content}`);
          allMessages.push(message);
          if (message.role === "assistant") {
            setPlot(message.content);
          }

          if (message.content.startsWith("https")) {
            setPlotImage(message.content);
          }
        }
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
      if (exitNextLoop) {
        console.log(`agent run ID ${agentRunID} finished!`);
        break;
      }
      if (await investigatorAgent.read.isRunFinished([BigInt(agentRunID)])) {
        exitNextLoop = true;
      }
    }
  }, [account.address, publicClient, walletClient]);

  const simulateStubbornInvestigation = useCallback(async () => {
    const stubbornInvestigatorAgent = getContract({
      abi: deployedContracts[696969].InvestigatorAgent.abi,
      address: deployedContracts[696969].InvestigatorAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (robertSheriffId == 0) {
      const tx = await stubbornInvestigatorAgent.write.RunStubbornInvestigatorNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, stubbornInvestigatorAgent.abi);
      setRobertSheriffId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(
          stubbornInvestigatorAgent,
          robertSheriffId,
          allMessages.length,
        );
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setRobertQuestion(message.content);
              setSheriffRobertConvo(`Sheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await stubbornInvestigatorAgent.write.addMessage([String(robertAnswer), BigInt(robertSheriffId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(
          stubbornInvestigatorAgent,
          robertSheriffId,
          allMessages.length,
        );
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setRobertQuestion(message.content);
              setSheriffRobertConvo(sheriffRobertConvo + `\nSheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, publicClient, robertAnswer, robertSheriffId, sheriffRobertConvo, walletClient]);

  const simulateStubborn = useCallback(async () => {
    const stubbornAgent = getContract({
      abi: deployedContracts[696969].StubbornAgent.abi,
      address: deployedContracts[696969].StubbornAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (robertId == 0) {
      const tx = await stubbornAgent.write.RunStubbornNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, stubbornAgent.abi);
      setRobertId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(stubbornAgent, robertId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setRobertAnswer(message.content);
              setSheriffRobertConvo(sheriffRobertConvo + `\nRobert: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await stubbornAgent.write.addMessage([String(robertQuestion), BigInt(robertId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(stubbornAgent, robertId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setRobertAnswer(message.content);
              setSheriffRobertConvo(sheriffRobertConvo + `\nRobert: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, publicClient, robertId, robertQuestion, sheriffRobertConvo, walletClient]);

  const simulateMurderer = useCallback(async () => {
    const murdererAgent = getContract({
      abi: deployedContracts[696969].MurdererAgent.abi,
      address: deployedContracts[696969].MurdererAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (mayerId == 0) {
      const tx = await murdererAgent.write.RunMurdererNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, murdererAgent.abi);
      setMayerId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(murdererAgent, mayerId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMayerAnswer(message.content);
              setSheriffMayerConvo(sheriffMayerConvo + `\nMayer: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await murdererAgent.write.addMessage([String(mayerQuestion), BigInt(mayerId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(murdererAgent, mayerId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMayerAnswer(message.content);
              setSheriffMayerConvo(sheriffMayerConvo + `\nMayer: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, mayerId, mayerQuestion, publicClient, sheriffMayerConvo, walletClient]);

  const simulateMurdererInvestigation = useCallback(async () => {
    const murdererInvestigatorAgent = getContract({
      abi: deployedContracts[696969].InvestigatorAgent.abi,
      address: deployedContracts[696969].InvestigatorAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (mayerSheriffId == 0) {
      const tx = await murdererInvestigatorAgent.write.RunMurdererInvestigatorNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, murdererInvestigatorAgent.abi);
      setMayerSheriffId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(
          murdererInvestigatorAgent,
          mayerSheriffId,
          allMessages.length,
        );
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMayerQuestion(message.content);
              setSheriffMayerConvo(`\nSheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await murdererInvestigatorAgent.write.addMessage([String(mayerAnswer), BigInt(mayerSheriffId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(
          murdererInvestigatorAgent,
          mayerSheriffId,
          allMessages.length,
        );
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMayerQuestion(message.content);
              setSheriffMayerConvo(sheriffMayerConvo + `\nSheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, mayerAnswer, mayerSheriffId, publicClient, sheriffMayerConvo, walletClient]);

  const simulateSeller = useCallback(async () => {
    const sellerAgent = getContract({
      abi: deployedContracts[696969].SalesmanAgent.abi,
      address: deployedContracts[696969].SalesmanAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (maxId == 0) {
      const tx = await sellerAgent.write.RunSalesmanNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, sellerAgent.abi);
      setMaxId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(sellerAgent, maxId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMaxAnswer(message.content);
              setSheriffMaxConvo(sheriffMaxConvo + `\nMax: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await sellerAgent.write.addMessage([String(maxQuestion), BigInt(maxId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(sellerAgent, maxId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMaxAnswer(message.content);
              setSheriffMaxConvo(sheriffMaxConvo + `\nMax: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, maxId, maxQuestion, publicClient, sheriffMaxConvo, walletClient]);

  const simulateSellerInvestigation = useCallback(async () => {
    const sellerInvestigatorAgent = getContract({
      abi: deployedContracts[696969].InvestigatorAgent.abi,
      address: deployedContracts[696969].InvestigatorAgent.address,
      client: {
        public: publicClient as PublicClient,
        wallet: walletClient as WalletClient,
      },
    });

    if (maxSheriffId == 0) {
      const tx = await sellerInvestigatorAgent.write.RunCarSalesmanInvestigatorNPC({
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
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      // Get the agent run ID from transaction receipt logs
      const agentRunID = await getChatId(receipt, sellerInvestigatorAgent.abi);
      setMaxSheriffId(agentRunID);
      console.log(`Created agent run ID: ${agentRunID}`);
      if (!agentRunID && agentRunID !== 0) {
        return;
      }

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(sellerInvestigatorAgent, maxSheriffId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMaxQuestion(message.content);
              setSheriffMaxConvo(`\nSheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      await sellerInvestigatorAgent.write.addMessage([String(maxAnswer), BigInt(maxSheriffId)], {
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
      });

      const allMessages: Message[] = [];
      // Run the chat loop: read messages and send messages
      while (true) {
        const newMessages: Message[] = await getNewMessages(sellerInvestigatorAgent, maxSheriffId, allMessages.length);
        if (newMessages) {
          for (const message of newMessages) {
            console.log(`${message.role}: ${message.content}`);
            allMessages.push(message);
            if (allMessages.at(-1)?.role == "assistant") {
              setMaxQuestion(message.content);
              setSheriffMaxConvo(sheriffMaxConvo + `\nSheriff: ${message.content}`);
              return;
            }
          }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }, [account.address, maxAnswer, maxSheriffId, publicClient, sheriffMaxConvo, walletClient]);

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center mb-8">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">A Murder Game NPC Simulation</span>
          </h1>
          <p className="text-center text-lg">
            A dead body has been found at 4/11, West Downtown Street and investigation has been going under Sheriff
            Johnson. So far three suspects have been identified who were present at the time and location of the murder.
            Mr. Mayer is the brother of the murdered person, Mr. Robert is the stubborn old man living in the
            neighboring street and Mr. Max is the car salesman who was also present at the murder scene. Sheriff is
            actively investigating the case and questioning those involved. Run the simulations to find out who is the
            murderer!
          </p>
          <div className="flex items-center justify-center">
            <button
              className={`btn btn-primary btn-md`}
              // disabled={String(attestationId) != "" || isLoading}
              onClick={simulatePlotCreation}
            >
              Create Plot
            </button>
          </div>
          {plot ? (
            <PlotDetails
              simulationDetails={{
                data: plot,
              }}
            />
          ) : null}
          {plotImage ? <div>Plot Image: {plotImage}</div> : null}
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              {/* <BugAntIcon className="h-8 w-8 fill-secondary" /> */}
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>Sheriff Johnson</p>
              <button
                className={`btn btn-primary btn-md`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateStubbornInvestigation}
              >
                Question Mr. Robert
              </button>
              <button
                className={`btn btn-primary btn-md mt-5`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateMurdererInvestigation}
              >
                Question Mr. Mayer
              </button>
              <button
                className={`btn btn-primary btn-md mt-5`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateSellerInvestigation}
              >
                Question Mr. Max
              </button>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ChatBubbleBottomCenterTextIcon className="h-8 w-8 fill-secondary" />
              <p>Mr. Robert</p>
              <button
                className={`btn btn-primary btn-md`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateStubborn}
              >
                Simulate
              </button>
              {sheriffRobertConvo ? (
                <SheriffRobertConvo
                  simulationDetails={{
                    data: sheriffRobertConvo,
                  }}
                />
              ) : null}
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ExclamationTriangleIcon className="h-8 w-8 fill-secondary" />
              <p>Mr. Mayer</p>
              <button
                className={`btn btn-primary btn-md`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateMurderer}
              >
                Simulate
              </button>
              {sheriffMayerConvo ? (
                <SheriffMayerConvo
                  simulationDetails={{
                    data: sheriffMayerConvo,
                  }}
                />
              ) : null}
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <ShoppingCartIcon className="h-8 w-8 fill-secondary" />
              <p>Mr. Max</p>
              <button
                className={`btn btn-primary btn-md`}
                // disabled={String(attestationId) != "" || isLoading}
                onClick={simulateSeller}
              >
                Simulate
              </button>
              {sheriffMaxConvo ? (
                <SheriffMaxConvo
                  simulationDetails={{
                    data: sheriffMaxConvo,
                  }}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
