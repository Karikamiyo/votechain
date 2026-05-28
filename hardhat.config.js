require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, RPC_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    // Локальный hardhat-узел, запущенный через `npx hardhat node`.
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Внутри docker-compose: deployer-контейнер обращается к hardhat-сервису.
    // Адрес 'hardhat' — это имя сервиса в docker-сети.
    docker: {
      url: "http://hardhat:8545",
      chainId: 31337,
    },
    // Polygon Amoy (тестовая сеть) — на случай деплоя в публичную сеть.
    amoy: {
      url: RPC_URL || "",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
      timeout: 120000,
    },
  },
};
