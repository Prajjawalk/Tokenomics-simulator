// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";

contract PlotSetterAgent {
	string public prompt;

	struct Message {
		string role;
		string content;
	}

	struct AgentRun {
		address owner;
		Message[] messages;
		uint responsesCount;
		uint8 max_iterations;
		bool is_finished;
	}

	mapping(uint => AgentRun) public agentRuns;
	uint private agentRunCount;

	event AgentRunCreated(address indexed owner, uint indexed runId);

	address private owner;
	address public oracleAddress;

	event OracleAddressUpdated(address indexed newOracleAddress);

	IOracle.OpenAiRequest private config;

	constructor(address initialOracleAddress, string memory systemPrompt) {
		owner = msg.sender;
		oracleAddress = initialOracleAddress;
		prompt = systemPrompt;

		config = IOracle.OpenAiRequest({
			model: "gpt-4-turbo-preview",
			frequencyPenalty: 21, // > 20 for null
			logitBias: "", // empty str for null
			maxTokens: 1000, // 0 for null
			presencePenalty: 21, // > 20 for null
			responseFormat: '{"type":"text"}',
			seed: 0, // null
			stop: "", // null
			temperature: 10, // Example temperature (scaled up, 10 means 1.0), > 20 means null
			topP: 101, // Percentage 0-100, > 100 means null
			tools: "[{\"type\":\"function\",\"function\":{\"name\":\"web_search\",\"description\":\"Search the internet\",\"parameters\":{\"type\":\"object\",\"properties\":{\"query\":{\"type\":\"string\",\"description\":\"Search query\"}},\"required\":[\"query\"]}}},{\"type\":\"function\",\"function\":{\"name\":\"image_generation\",\"description\":\"Generates an image using Dalle-2\",\"parameters\":{\"type\":\"object\",\"properties\":{\"prompt\":{\"type\":\"string\",\"description\":\"Dalle-2 prompt to generate an image\"}},\"required\":[\"prompt\"]}}}]",
			toolChoice: "auto", // "none" or "auto"
			user: "" // null
		});
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Caller is not owner");
		_;
	}

	modifier onlyOracle() {
		require(msg.sender == oracleAddress, "Caller is not oracle");
		_;
	}

	function setOracleAddress(address newOracleAddress) public onlyOwner {
		require(msg.sender == owner, "Caller is not the owner");
		oracleAddress = newOracleAddress;
		emit OracleAddressUpdated(newOracleAddress);
	}

	function RunPlotSetterAgent(
		
	) public returns (uint i) {
		string memory query = "You are a helpful assistant.\n A murder has occurred and you need to describe a crime scene that involves the murdered person, the murderer (Mr. Mayer) who is the brother of that person, the sheriff (Sheriff Johnson) in charge of the investigation, and two witnesses (Mr. Robert and Mr. Max). \n Task: \n Search through the web for murder mystery stories and read them for inspiration. \n Describe the crime scene in detail \n Generate a picture to represent the crime scene, plot and characters";

		return runAgent(query, 3);
	}

	function runAgent(
		string memory query,
		uint8 max_iterations
	) public returns (uint i) {
		AgentRun storage run = agentRuns[agentRunCount];

		run.owner = msg.sender;
		run.is_finished = false;
		run.responsesCount = 0;
		run.max_iterations = max_iterations;

		Message memory systemMessage;
		systemMessage.content = prompt;
		systemMessage.role = "system";
		run.messages.push(systemMessage);

		Message memory newMessage;
		newMessage.content = query;
		newMessage.role = "user";
		run.messages.push(newMessage);

		uint currentId = agentRunCount;
		agentRunCount = agentRunCount + 1;

		IOracle(oracleAddress).createOpenAiLlmCall(currentId, config);
		emit AgentRunCreated(run.owner, currentId);

		return currentId;
	}

	function onOracleOpenAiLlmResponse(
		uint runId,
		IOracle.OpenAiResponse memory response,
		string memory errorMessage
	) public onlyOracle {
		AgentRun storage run = agentRuns[runId];

		if (!compareStrings(errorMessage, "")) {
			Message memory newMessage;
			newMessage.role = "assistant";
			newMessage.content = errorMessage;
			run.messages.push(newMessage);
			run.responsesCount++;
			run.is_finished = true;
			return;
		}
		if (run.responsesCount >= run.max_iterations) {
			run.is_finished = true;
			return;
		}
		if (!compareStrings(response.content, "")) {
			Message memory assistantMessage;
			assistantMessage.content = response.content;
			assistantMessage.role = "assistant";
			run.messages.push(assistantMessage);
			run.responsesCount++;
		}
		if (!compareStrings(response.functionName, "")) {
			IOracle(oracleAddress).createFunctionCall(
				runId,
				response.functionName,
				response.functionArguments
			);
			return;
		}
		run.is_finished = true;
	}

	function onOracleFunctionResponse(
		uint runId,
		string memory response,
		string memory errorMessage
	) public onlyOracle {
		AgentRun storage run = agentRuns[runId];
		require(!run.is_finished, "Run is finished");
		string memory result = response;
		if (!compareStrings(errorMessage, "")) {
			result = errorMessage;
		}
		Message memory newMessage;
		newMessage.role = "user";
		newMessage.content = result;
		run.messages.push(newMessage);
		run.responsesCount++;
		IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
	}

  // @notice Adds a new message to an existing chat run
    // @param message The new message to add
    // @param runId The ID of the chat run
    function addMessage(string memory message, uint runId) public {
        AgentRun storage run = agentRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.responsesCount - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only chat owner can add messages"
        );

        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.responsesCount++;
        
        IOracle(oracleAddress).createOpenAiLlmCall(runId, config);
    }


	function getMessageHistoryContents(
		uint agentId
	) public view returns (string[] memory) {
		string[] memory messages = new string[](
			agentRuns[agentId].messages.length
		);
		for (uint i = 0; i < agentRuns[agentId].messages.length; i++) {
			messages[i] = agentRuns[agentId].messages[i].content;
		}
		return messages;
	}

	function getMessageHistoryRoles(
		uint agentId
	) public view returns (string[] memory) {
		string[] memory roles = new string[](
			agentRuns[agentId].messages.length
		);
		for (uint i = 0; i < agentRuns[agentId].messages.length; i++) {
			roles[i] = agentRuns[agentId].messages[i].role;
		}
		return roles;
	}

	function isRunFinished(uint runId) public view returns (bool) {
		return agentRuns[runId].is_finished;
	}

	function compareStrings(
		string memory a,
		string memory b
	) private pure returns (bool) {
		return (keccak256(abi.encodePacked((a))) ==
			keccak256(abi.encodePacked((b))));
	}
}
