const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("VoteChainModule", (m) => {
  const electionTitle = m.getParameter(
    "electionTitle",
    "University Council Election 2026"
  );
  const candidates = m.getParameter("candidates", [
    "Alice Ivanova",
    "Dmitry Petrov",
    "Maria Sokolova",
  ]);

  const voteChain = m.contract("VoteChain", [electionTitle, candidates]);

  return { voteChain };
});