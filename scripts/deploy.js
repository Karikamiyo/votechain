const hre = require("hardhat");

async function main() {
  const electionTitle = "University Council Election 2026";
  const candidates = ["Alice Ivanova", "Dmitry Petrov", "Maria Sokolova"];

  const VoteChain = await hre.ethers.getContractFactory("VoteChain");
  const voteChain = await VoteChain.deploy(electionTitle, candidates);

  await voteChain.waitForDeployment();

  const contractAddress = await voteChain.getAddress();

  console.log("VoteChain deployed successfully");
  console.log("Network:", hre.network.name);
  console.log("Contract address:", contractAddress);
  console.log("Initial election title:", electionTitle);
  console.log("Candidates:", candidates.join(", "));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});