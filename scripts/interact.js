const hre = require("hardhat");
require("dotenv").config();

async function main() {
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!contractAddress) {
    throw new Error("Set CONTRACT_ADDRESS in .env before running this script");
  }

  const [owner, voter] = await hre.ethers.getSigners();
  const voteChain = await hre.ethers.getContractAt("VoteChain", contractAddress);
  const electionId = 0;
  const candidate = "Alice Ivanova";

  const whitelistTx = await voteChain
    .connect(owner)
    .addToWhitelist(electionId, voter.address);
  await whitelistTx.wait();
  console.log("Whitelisted voter:", voter.address);

  const voteTx = await voteChain.connect(voter).vote(electionId, candidate);
  await voteTx.wait();
  console.log(`Vote cast for: ${candidate}`);

  const [candidates, votes] = await voteChain.getResults(electionId);

  console.log("Current results:");
  candidates.forEach((name, index) => {
    console.log(`- ${name}: ${votes[index].toString()}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});