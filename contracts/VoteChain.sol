// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VoteChain
/// @notice Production-like prototype for transparent blockchain elections.
/// @dev The contract stores votes directly in blockchain state and exposes
///      read methods for backend/frontend verification.
contract VoteChain {
    struct Election {
        string title;
        string[] candidates;
        bool isOpen;
        uint256 totalVotes;
    }

    address public immutable owner;
    uint256 public electionCount;

    mapping(uint256 => Election) private elections;
    mapping(uint256 => mapping(address => bool)) public whitelist;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(string => uint256)) private voteCounters;
    mapping(uint256 => mapping(bytes32 => bool)) private candidateExists;

    event UserWhitelisted(uint256 indexed electionId, address indexed user);
    event VoteCast(uint256 indexed electionId, address indexed voter, string candidate);
    event ElectionClosed(uint256 indexed electionId);
    event ElectionCreated(uint256 indexed electionId, string title);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier electionExists(uint256 electionId) {
        require(electionId < electionCount, "Election does not exist");
        _;
    }

    constructor(string memory initialTitle, string[] memory initialCandidates) {
        owner = msg.sender;
        _createElection(initialTitle, initialCandidates);
    }

    /// @notice Creates a new election with a fixed candidate list.
    /// @dev Candidates are immutable for each election after creation.
    function createElection(
        string memory title,
        string[] memory candidates
    ) external onlyOwner returns (uint256 electionId) {
        electionId = _createElection(title, candidates);
    }

    /// @notice Adds one voter address to the election whitelist.
    function addToWhitelist(
        uint256 electionId,
        address user
    ) external onlyOwner electionExists(electionId) {
        require(user != address(0), "Invalid user address");
        require(!whitelist[electionId][user], "User already whitelisted");

        whitelist[electionId][user] = true;

        emit UserWhitelisted(electionId, user);
    }

    /// @notice Adds multiple voter addresses to the election whitelist.
    /// @dev Useful for backend-admin batch operations.
    function addManyToWhitelist(
        uint256 electionId,
        address[] calldata users
    ) external onlyOwner electionExists(electionId) {
        require(users.length > 0, "Users list is empty");

        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];

            require(user != address(0), "Invalid user address");
            require(!whitelist[electionId][user], "User already whitelisted");

            whitelist[electionId][user] = true;

            emit UserWhitelisted(electionId, user);
        }
    }

    /// @notice Casts a vote for a whitelisted user.
    /// @dev Each address can vote only once per election.
    function vote(
        uint256 electionId,
        string calldata candidate
    ) external electionExists(electionId) {
        Election storage election = elections[electionId];

        require(election.isOpen, "Election is closed");
        require(whitelist[electionId][msg.sender], "User is not whitelisted");
        require(!hasVoted[electionId][msg.sender], "User has already voted");
        require(_candidateExists(electionId, candidate), "Candidate does not exist");

        hasVoted[electionId][msg.sender] = true;
        voteCounters[electionId][candidate] += 1;
        election.totalVotes += 1;

        emit VoteCast(electionId, msg.sender, candidate);
    }

    /// @notice Closes an election and prevents future votes.
    function closeElection(uint256 electionId) external onlyOwner electionExists(electionId) {
        Election storage election = elections[electionId];

        require(election.isOpen, "Election already closed");

        election.isOpen = false;

        emit ElectionClosed(electionId);
    }

    /// @notice Returns the number of votes for a candidate.
    function getVotes(
        uint256 electionId,
        string calldata candidate
    ) external view electionExists(electionId) returns (uint256) {
        require(_candidateExists(electionId, candidate), "Candidate does not exist");

        return voteCounters[electionId][candidate];
    }

    /// @notice Returns all candidates for an election.
    function getAllCandidates(
        uint256 electionId
    ) external view electionExists(electionId) returns (string[] memory) {
        return elections[electionId].candidates;
    }

    /// @notice Returns the core election metadata.
    function getElection(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (string memory title, bool isOpen, uint256 totalVotes)
    {
        Election storage election = elections[electionId];

        return (election.title, election.isOpen, election.totalVotes);
    }

    /// @notice Returns candidates and their vote counts in one call.
    /// @dev Intended for dashboards and frontend result screens.
    function getResults(
        uint256 electionId
    )
        external
        view
        electionExists(electionId)
        returns (string[] memory candidates, uint256[] memory votes)
    {
        Election storage election = elections[electionId];

        candidates = election.candidates;
        votes = new uint256[](candidates.length);

        for (uint256 i = 0; i < candidates.length; i++) {
            votes[i] = voteCounters[electionId][candidates[i]];
        }
    }

    function _createElection(
        string memory title,
        string[] memory candidates
    ) private returns (uint256 electionId) {
        require(bytes(title).length > 0, "Election title is required");
        require(candidates.length >= 2, "At least two candidates required");

        electionId = electionCount;
        Election storage election = elections[electionId];

        election.title = title;
        election.isOpen = true;

        for (uint256 i = 0; i < candidates.length; i++) {
            string memory candidate = candidates[i];
            bytes32 candidateHash = keccak256(bytes(candidate));

            require(bytes(candidate).length > 0, "Candidate name is required");
            require(!candidateExists[electionId][candidateHash], "Duplicate candidate");

            election.candidates.push(candidate);
            candidateExists[electionId][candidateHash] = true;
        }

        electionCount += 1;

        emit ElectionCreated(electionId, title);
    }

    function _candidateExists(
        uint256 electionId,
        string memory candidate
    ) private view returns (bool) {
        return candidateExists[electionId][keccak256(bytes(candidate))];
    }
}