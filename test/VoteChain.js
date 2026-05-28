const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VoteChain", function () {
  async function deployVoteChainFixture() {
    const [owner, voter, outsider] = await ethers.getSigners();
    const VoteChain = await ethers.getContractFactory("VoteChain");
    const voteChain = await VoteChain.deploy("Student Election", [
      "Alice",
      "Bob",
    ]);

    await voteChain.waitForDeployment();

    return { voteChain, owner, voter, outsider };
  }

  it("allows a whitelisted user to vote once", async function () {
    const { voteChain, voter } = await deployVoteChainFixture();

    await voteChain.addToWhitelist(0, voter.address);

    await expect(voteChain.connect(voter).vote(0, "Alice"))
      .to.emit(voteChain, "VoteCast")
      .withArgs(0, voter.address, "Alice");

    expect(await voteChain.getVotes(0, "Alice")).to.equal(1);

    await expect(voteChain.connect(voter).vote(0, "Bob")).to.be.revertedWith(
      "User has already voted"
    );
  });

  it("rejects non-whitelisted voters", async function () {
    const { voteChain, outsider } = await deployVoteChainFixture();

    await expect(voteChain.connect(outsider).vote(0, "Alice")).to.be.revertedWith(
      "User is not whitelisted"
    );
  });

  it("prevents votes after election is closed", async function () {
    const { voteChain, voter } = await deployVoteChainFixture();

    await voteChain.addToWhitelist(0, voter.address);
    await voteChain.closeElection(0);

    await expect(voteChain.connect(voter).vote(0, "Alice")).to.be.revertedWith(
      "Election is closed"
    );
  });

  it("returns all results", async function () {
    const { voteChain, voter } = await deployVoteChainFixture();

    await voteChain.addToWhitelist(0, voter.address);
    await voteChain.connect(voter).vote(0, "Bob");

    const [candidates, votes] = await voteChain.getResults(0);

    expect(candidates).to.deep.equal(["Alice", "Bob"]);
    expect(votes.map((vote) => Number(vote))).to.deep.equal([0, 1]);
  });
});