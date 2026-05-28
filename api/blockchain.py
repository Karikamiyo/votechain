"""
blockchain.py — модуль для подключения к смарт-контракту VoteChain через web3.py.

Здесь мы:
1. Читаем настройки из .env (RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS)
2. Подключаемся к локальному узлу Hardhat
3. Загружаем ABI контракта из файла
4. Создаём объект контракта для вызова его методов
"""

import os
import json
from pathlib import Path
from web3 import Web3
from dotenv import load_dotenv

# Загружаем переменные окружения из .env
load_dotenv()

# ─── Настройки подключения ───────────────────────────────────────────────────

# URL узла блокчейна (локальный Hardhat)
RPC_URL = os.getenv("RPC_URL", "http://127.0.0.1:8545")

# Приватный ключ владельца (owner) для подписи транзакций
PRIVATE_KEY = os.getenv("PRIVATE_KEY")

# Адрес развёрнутого контракта
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS")

# ─── Подключение к блокчейну ─────────────────────────────────────────────────

# Создаём объект Web3 с HTTP-провайдером (синхронный, без async)
w3 = Web3(Web3.HTTPProvider(RPC_URL))

# ─── Загрузка ABI контракта ──────────────────────────────────────────────────

# Путь к файлу с ABI (относительно корня проекта)
BASE_DIR = Path(__file__).resolve().parent.parent
ABI_PATH = BASE_DIR / "artifacts" / "contracts" / "VoteChain.sol" / "VoteChain.json"

# Читаем JSON-файл и извлекаем только поле "abi"
with open(ABI_PATH, "r", encoding="utf-8") as f:
    artifact = json.load(f)
    CONTRACT_ABI = artifact["abi"]

# ─── Объект контракта ────────────────────────────────────────────────────────

# Создаём объект контракта — через него мы будем вызывать методы
contract = w3.eth.contract(
    address=Web3.to_checksum_address(CONTRACT_ADDRESS),
    abi=CONTRACT_ABI
)

# ─── Вспомогательные функции ─────────────────────────────────────────────────

def get_owner_address():
    """Возвращает адрес кошелька владельца (owner) из приватного ключа."""
    account = w3.eth.account.from_key(PRIVATE_KEY)
    return account.address


def send_transaction(func):
    """
    Подписывает и отправляет транзакцию от имени владельца.
    
    Параметры:
        func — объект функции контракта, например:
               contract.functions.createElection(title, candidates)
    
    Возвращает:
        receipt — квитанция транзакции (dict с txHash, blockNumber и т.д.)
    
    Пример использования:
        receipt = send_transaction(
            contract.functions.createElection("Выборы 2024", ["Кандидат А", "Кандидат Б"])
        )
    """
    owner_address = get_owner_address()
    
    # Получаем текущий nonce (счётчик транзакций) для аккаунта
    nonce = w3.eth.get_transaction_count(owner_address)
    
    # Строим транзакцию: указываем отправителя, nonce и лимит газа
    tx = func.build_transaction({
        "from": owner_address,
        "nonce": nonce,
        "gas": 500_000,          # Лимит газа (достаточно для большинства операций)
        "gasPrice": w3.eth.gas_price,  # Текущая цена газа в сети
    })
    
    # Подписываем транзакцию приватным ключом
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
    
    # Отправляем подписанную транзакцию в сеть
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    
    # Ждём подтверждения транзакции (майнинга)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return receipt