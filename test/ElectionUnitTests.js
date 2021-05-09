const Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
    let electionInstance;

    it("Initializes with three candidates", function() {
      return Election.deployed().then(function(instance) {
        return instance.candidatesCount();
      }).then(function(count) {
        assert.equal(count, 3);
      });
    });

    it("Cast a vote", function() {
      return Election.deployed().then(function(instance) {
        electionInstance = instance;
        candidateId = 1;
        return electionInstance.vote(candidateId, { from: accounts[0] });
      }).then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "Triggered an event");
        assert.equal(receipt.logs[0].event, "VotedEvent", "Correct event type");
        assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "Candidate Id is correct");
        return electionInstance.voters(accounts[0]);
      }).then(function(voted) {
        assert(voted, "Voter was marked as voted");
        return electionInstance.candidates(candidateId);
      }).then(function(candidate) {
        var voteCount = candidate[2];
        assert.equal(voteCount, 1, "Increment vote count");
      })
    });

    it("Throw an exception for invalid candiates", function() {
      return Election.deployed().then(function(instance) {
        electionInstance = instance;
        return electionInstance.vote(99, { from: accounts[1] })
      }).then(assert.fail).catch(function(error) {
        assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
        return electionInstance.candidates(1);
      }).then(function(candidate1) {
        var voteCount = candidate1[2];
        assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
        return electionInstance.candidates(2);
      }).then(function(candidate2) {
        var voteCount = candidate2[2];
        assert.equal(voteCount, 0, "candidate 2 did not receive any votes");
        return electionInstance.candidates(3);
      }).then(function(candidate3) {
        var voteCount = candidate3[2];
        assert.equal(voteCount, 0, "candidate 3 did not receive any votes");
        return electionInstance.candidates(4);
      });
    });
});
