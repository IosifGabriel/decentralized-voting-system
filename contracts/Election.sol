pragma solidity >=0.4.22 <0.8.0;

contract Election {
  // Candidate model
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  // Store candidates
  mapping(uint => Candidate) public candidates;
  // Store Candidates Count
  uint public candidatesCount;

  constructor () public {
    candidatesCount = 0;
    addCandidate("Candidate 1");
    addCandidate("Candidate 2");
  }

  function addCandidate (string memory name) private {
    candidates[candidatesCount] = Candidate(candidatesCount, name, 0);
    candidatesCount++;
  }
}