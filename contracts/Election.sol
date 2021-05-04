// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

contract Election {
    // Candidate model
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store candidates
    mapping(uint256 => Candidate) public candidates;
    // Store Candidates Count
    uint256 public candidatesCount;

    // voted event
    event VotedEvent(uint256 indexed _candidateId);

    constructor() public {
        candidatesCount = 0;
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
    }

    function addCandidate(string memory name) private {
        candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
        candidatesCount++;
    }

    function vote(uint256 _candidateId) public payable {
        require(!voters[msg.sender]); // require that they haven't voted before
        require(_candidateId > 0 && _candidateId <= candidatesCount); // require a valid candidate

        // record that voter has voted
        voters[msg.sender] = true;
        // update candidate vote Count
        candidates[_candidateId].voteCount++;
        // trigger voted event
        emit VotedEvent(_candidateId);
    }

    function getAllVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < candidatesCount; i++) {
            totalVotes += candidates[i].voteCount;
        }
        return totalVotes;
    }

    function getWinner() public view returns (string memory) {
        uint256 idWinner = candidates[0].id;
        uint256 candidateVotes = candidates[0].voteCount;

        for (uint256 i = 1; i < candidatesCount; i++) {
            if (candidates[i].voteCount > candidateVotes) {
                idWinner = candidates[i].id;
                candidateVotes = candidates[i].voteCount;
            }
        }

        return candidates[idWinner].name;
    }
}
