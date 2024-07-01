// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "./interfaces/IOracle.sol";

// @title InvestigatorAgent
// @notice This contract handles chat interactions and integrates with teeML oracle for LLM and knowledge base queries.
contract InvestigatorAgent {

    struct Message {
        string role;
        string content;
    }

    struct ChatRun {
        address owner;
        Message[] messages;
        uint messagesCount;
    }

    // @notice Mapping from chat ID to ChatRun
    mapping(uint => ChatRun) public chatRuns;
    uint private chatRunsCount;

    // @notice Event emitted when a new chat is created
    event ChatCreated(address indexed owner, uint indexed chatId);

    // @notice Address of the contract owner
    address private owner;
    
    // @notice Address of the oracle contract
    address public oracleAddress;
    
    // @notice CID of the knowledge base
    string public knowledgeBase;

    // @notice Event emitted when the oracle address is updated
    event OracleAddressUpdated(address indexed newOracleAddress);

    // @param initialOracleAddress Initial address of the oracle contract
    // @param knowledgeBaseCID CID of the initial knowledge base
    constructor(address initialOracleAddress, string memory knowledgeBaseCID) {
        owner = msg.sender;
        oracleAddress = initialOracleAddress;
        knowledgeBase = knowledgeBaseCID;
    }

    // @notice Ensures the caller is the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    // @notice Ensures the caller is the oracle contract
    modifier onlyOracle() {
        require(msg.sender == oracleAddress, "Caller is not oracle");
        _;
    }

    // @notice Sets a new oracle address
    // @param newOracleAddress The new oracle address
    function setOracleAddress(address newOracleAddress) public onlyOwner {
        oracleAddress = newOracleAddress;
        emit OracleAddressUpdated(newOracleAddress);
    }

    function RunStubbornInvestigatorNPC(
		
    ) public returns (uint i) {
      string memory query = "You are a NPC character in a game. \n You are an investigator in a murder case and you are questioning multiple people to get as much information as you can to solve the case.\n Task: You will act like the NPC character AT ALL TIMES. You will speak to an uneducated street person in olden times who is not willing to give up the information about the murder. \n You will have to pressurise him to get information. You can threaten him, but get as much information as you can by hook or crook. You need to be polite but stern. Keep your conversation concise, within 50 words.";

      return startChat(query);
    }

    function RunCarSalesmanInvestigatorNPC(
      
    ) public returns (uint i) {
      string memory query = "You are a NPC character in a game. \n You are an investigator in a murder case and you are questioning multiple people to get as much information as you can to solve the case. \n Task: You will act like the NPC character AT ALL TIMES. You will speak to a car salesman about the murder case. \n The salesman might distract you into buying the car but you need to stick to the case and get as much information out of him as possible. You can frame subsequent conversion based on the inputs. Keep your conversation concise, within 50 words.";

      return startChat(query);
    }

    function RunMurdererInvestigatorNPC(
      
    ) public returns (uint i) {
      string memory query = "You are a NPC character in a game. \n You are an investigator in a murder case and you are questioning multiple people to get as much information as you can to solve the case. \n Task: You will act like the NPC character AT ALL TIMES. You will speak to the brother of the murdered person and you suspect him to be a murderer. \n You need to get as much information out of him as possible and don't get swayed by his emotional manipulations. You need to get information out of him by hook or crook. You can frame subsequent conversion based on the inputs. Keep your conversation concise, within 50 words.";

      return startChat(query);
    }


    // @notice Starts a new chat
    // @param message The initial message to start the chat with
    // @return The ID of the newly created chat
    function startChat(string memory message) public returns (uint) {
        ChatRun storage run = chatRuns[chatRunsCount];

        run.owner = msg.sender;
        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount = 1;

        uint currentId = chatRunsCount;
        chatRunsCount++;

        // If there is a knowledge base, create a knowledge base query
        if (bytes(knowledgeBase).length > 0) {
            IOracle(oracleAddress).createKnowledgeBaseQuery(
                currentId,
                knowledgeBase,
                message,
                3
            );
        } else {
            // Otherwise, create an LLM call
            IOracle(oracleAddress).createLlmCall(currentId);
        }
        emit ChatCreated(msg.sender, currentId);

        return currentId;
    }

    // @notice Handles the response from the oracle for an LLM call
    // @param runId The ID of the chat run
    // @param response The response from the oracle
    // @dev Called by teeML oracle
    function onOracleLlmResponse(
        uint runId,
        string memory response,
        string memory /*errorMessage*/
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to respond to"
        );

        Message memory newMessage;
        newMessage.content = response;
        newMessage.role = "assistant";
        run.messages.push(newMessage);
        run.messagesCount++;
    }

    // @notice Handles the response from the oracle for a knowledge base query
    // @param runId The ID of the chat run
    // @param documents The array of retrieved documents
    // @dev Called by teeML oracle
    function onOracleKnowledgeBaseQueryResponse(
        uint runId,
        string[] memory documents,
        string memory /*errorMessage*/
    ) public onlyOracle {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("user")),
            "No message to add context to"
        );
        // Retrieve the last user message
        Message storage lastMessage = run.messages[run.messagesCount - 1];

        // Start with the original message content
        string memory newContent = lastMessage.content;

        // Append "Relevant context:\n" only if there are documents
        if (documents.length > 0) {
            newContent = string(abi.encodePacked(newContent, "\n\nRelevant context:\n"));
        }

        // Iterate through the documents and append each to the newContent
        for (uint i = 0; i < documents.length; i++) {
            newContent = string(abi.encodePacked(newContent, documents[i], "\n"));
        }

        // Finally, set the lastMessage content to the newly constructed string
        lastMessage.content = newContent;

        // Call LLM
        IOracle(oracleAddress).createLlmCall(runId);
    }

    // @notice Adds a new message to an existing chat run
    // @param message The new message to add
    // @param runId The ID of the chat run
    function addMessage(string memory message, uint runId) public {
        ChatRun storage run = chatRuns[runId];
        require(
            keccak256(abi.encodePacked(run.messages[run.messagesCount - 1].role)) == keccak256(abi.encodePacked("assistant")),
            "No response to previous message"
        );
        require(
            run.owner == msg.sender, "Only chat owner can add messages"
        );

        Message memory newMessage;
        newMessage.content = message;
        newMessage.role = "user";
        run.messages.push(newMessage);
        run.messagesCount++;
        // If there is a knowledge base, create a knowledge base query
        if (bytes(knowledgeBase).length > 0) {
            IOracle(oracleAddress).createKnowledgeBaseQuery(
                runId,
                knowledgeBase,
                message,
                3
            );
        } else {
            // Otherwise, create an LLM call
            IOracle(oracleAddress).createLlmCall(runId);
        }
    }

    // @notice Retrieves the message history contents of a chat run
    // @param chatId The ID of the chat run
    // @return An array of message contents
    // @dev Called by teeML oracle
    function getMessageHistoryContents(uint chatId) public view returns (string[] memory) {
        string[] memory messages = new string[](chatRuns[chatId].messages.length);
        for (uint i = 0; i < chatRuns[chatId].messages.length; i++) {
            messages[i] = chatRuns[chatId].messages[i].content;
        }
        return messages;
    }

    // @notice Retrieves the roles of the messages in a chat run
    // @param chatId The ID of the chat run
    // @return An array of message roles
    // @dev Called by teeML oracle
    function getMessageHistoryRoles(uint chatId) public view returns (string[] memory) {
        string[] memory roles = new string[](chatRuns[chatId].messages.length);
        for (uint i = 0; i < chatRuns[chatId].messages.length; i++) {
            roles[i] = chatRuns[chatId].messages[i].role;
        }
        return roles;
    }
}