/**
 * abi.ts — ABI (Application Binary Interface) контракта VoteChain.
 *
 * ABI — это "оглавление" контракта: какие у него функции, события,
 * какие параметры они принимают и возвращают.
 *
 * Из этого огромного JSON фронту нужны только функции,
 * которые он вызывает напрямую (без бэка):
 *   - vote(electionId, candidate) — голосование
 *   - owner() — кто владелец (но это и через бэк есть)
 *
 * Я оставил полный ABI, чтобы при желании можно было звать любые методы.
 * Он скопирован из artifacts/contracts/VoteChain.sol/VoteChain.json
 * (поле "abi").
 *
 * `as const` в конце — это важная TypeScript-фишка: она "замораживает" объект,
 * и wagmi смог выводить точные типы аргументов и возвращаемых значений.
 */

export const VOTE_CHAIN_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'initialTitle', type: 'string' },
      { internalType: 'string[]', name: 'initialCandidates', type: 'string[]' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'title', type: 'string' },
    ],
    name: 'ElectionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'ElectionClosed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'UserWhitelisted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'voter', type: 'address' },
      { indexed: false, internalType: 'string', name: 'candidate', type: 'string' },
    ],
    name: 'VoteCast',
    type: 'event',
  },
  // --- write functions ---
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { internalType: 'address', name: 'user', type: 'address' },
    ],
    name: 'addToWhitelist',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'closeElection',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string[]', name: 'candidates', type: 'string[]' },
    ],
    name: 'createElection',
    outputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
      { internalType: 'string', name: 'candidate', type: 'string' },
    ],
    name: 'vote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // --- read functions ---
  {
    inputs: [],
    name: 'owner',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'electionCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'getElection',
    outputs: [
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'bool', name: 'isOpen', type: 'bool' },
      { internalType: 'uint256', name: 'totalVotes', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'getAllCandidates',
    outputs: [
      { internalType: 'string[]', name: '', type: 'string[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'electionId', type: 'uint256' },
    ],
    name: 'getResults',
    outputs: [
      { internalType: 'string[]', name: 'candidates', type: 'string[]' },
      { internalType: 'uint256[]', name: 'votes', type: 'uint256[]' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'whitelist',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '', type: 'uint256' },
      { internalType: 'address', name: '', type: 'address' },
    ],
    name: 'hasVoted',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Адрес контракта берём из переменных окружения.
// Если не задан — используем дефолтный hardhat-адрес.
export const CONTRACT_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`) ||
  '0x5FbDB2315678afecb367f032d93F642f64180aa3'
