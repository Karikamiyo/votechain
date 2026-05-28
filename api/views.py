"""
views.py — обработчики REST API для VoteChain.

Эндпоинты:
  GET    /api/elections/                              — список всех голосований
  POST   /api/elections/                              — создать голосование
  GET    /api/elections/<id>/                         — данные голосования
  GET    /api/elections/<id>/candidates/              — список кандидатов
  POST   /api/elections/<id>/whitelist/               — добавить адрес в whitelist
  POST   /api/elections/<id>/close/                   — закрыть голосование
  GET    /api/elections/<id>/results/                 — результаты
  GET    /api/elections/<id>/voters/<address>/status/ — статус избирателя
  GET    /api/owner/                                  — адрес владельца контракта
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from web3 import Web3
from web3.exceptions import ContractLogicError

from .blockchain import contract, w3, send_transaction


# ─────────────────────────────────────────────────────────────────────────────
# Вспомогательное
# ─────────────────────────────────────────────────────────────────────────────

def extract_revert_reason(exc):
    """Извлекает читаемое сообщение об ошибке из ContractLogicError."""
    msg = str(exc)
    if "execution reverted:" in msg:
        return msg.split("execution reverted:")[-1].strip()
    if "revert" in msg.lower():
        return msg
    return "Ошибка выполнения транзакции"


def handle_contract_error(exc):
    """Универсальный маппинг ошибки контракта в HTTP-ответ."""
    reason = extract_revert_reason(exc)
    if "does not exist" in reason.lower():
        return Response({"error": reason}, status=status.HTTP_404_NOT_FOUND)
    return Response({"error": reason}, status=status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────────────────────
# GET  /api/elections/  — список всех голосований
# POST /api/elections/  — создать новое голосование
# ─────────────────────────────────────────────────────────────────────────────

class ElectionListView(APIView):
    """
    GET /api/elections/

    Ответ (200 OK):
    {
        "count": 2,
        "elections": [
            {"election_id": 0, "title": "...", "is_open": true,  "total_votes": 3},
            {"election_id": 1, "title": "...", "is_open": false, "total_votes": 7}
        ]
    }

    POST /api/elections/
    Тело: {"title": "...", "candidates": ["A", "B", ...]}
    """

    def get(self, request):
        try:
            election_count = contract.functions.electionCount().call()

            elections = []
            for election_id in range(election_count):
                title, is_open, total_votes = (
                    contract.functions.getElection(election_id).call()
                )
                elections.append({
                    "election_id": election_id,
                    "title": title,
                    "is_open": is_open,
                    "total_votes": total_votes,
                })

            return Response({
                "count": election_count,
                "elections": elections,
            })
        except Exception as e:
            return Response(
                {"error": f"Ошибка при получении списка голосований: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        title = request.data.get("title")
        candidates = request.data.get("candidates")

        if not title:
            return Response(
                {"error": "Поле 'title' обязательно"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not candidates or not isinstance(candidates, list):
            return Response(
                {"error": "Поле 'candidates' обязательно и должно быть списком"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if len(candidates) < 2:
            return Response(
                {"error": "Нужно минимум 2 кандидата"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            receipt = send_transaction(
                contract.functions.createElection(title, candidates)
            )

            # Новый ID = electionCount - 1
            election_count = contract.functions.electionCount().call()
            new_election_id = election_count - 1

            return Response(
                {
                    "election_id": new_election_id,
                    "message": "Голосование успешно создано",
                    "tx_hash": receipt["transactionHash"].hex(),
                },
                status=status.HTTP_201_CREATED
            )

        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при создании голосования: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/elections/<id>/  — данные голосования
# ─────────────────────────────────────────────────────────────────────────────

class ElectionDetailView(APIView):
    def get(self, request, election_id):
        try:
            title, is_open, total_votes = (
                contract.functions.getElection(election_id).call()
            )
            return Response({
                "election_id": election_id,
                "title": title,
                "is_open": is_open,
                "total_votes": total_votes,
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при получении данных: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/elections/<id>/candidates/  — список кандидатов
# ─────────────────────────────────────────────────────────────────────────────

class CandidatesView(APIView):
    """
    GET /api/elections/<id>/candidates/

    Ответ (200 OK):
    {
        "election_id": 0,
        "candidates": ["Alice Ivanova", "Dmitry Petrov", "Maria Sokolova"]
    }
    """

    def get(self, request, election_id):
        try:
            candidates = contract.functions.getAllCandidates(election_id).call()
            return Response({
                "election_id": election_id,
                "candidates": list(candidates),
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при получении кандидатов: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/elections/<id>/whitelist/
# ─────────────────────────────────────────────────────────────────────────────

class WhitelistView(APIView):
    def post(self, request, election_id):
        user_address = request.data.get("userAddress")

        if not user_address:
            return Response(
                {"error": "Поле 'userAddress' обязательно"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not Web3.is_address(user_address):
            return Response(
                {"error": f"Некорректный Ethereum-адрес: {user_address}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checksum_address = Web3.to_checksum_address(user_address)
            receipt = send_transaction(
                contract.functions.addToWhitelist(election_id, checksum_address)
            )
            return Response({
                "message": f"Адрес {checksum_address} успешно добавлен в белый список",
                "tx_hash": receipt["transactionHash"].hex(),
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при добавлении в белый список: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/elections/<id>/close/
# ─────────────────────────────────────────────────────────────────────────────

class CloseElectionView(APIView):
    def post(self, request, election_id):
        try:
            receipt = send_transaction(
                contract.functions.closeElection(election_id)
            )
            return Response({
                "message": f"Голосование {election_id} успешно закрыто",
                "tx_hash": receipt["transactionHash"].hex(),
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при закрытии голосования: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/elections/<id>/results/
# ─────────────────────────────────────────────────────────────────────────────

class ElectionResultsView(APIView):
    def get(self, request, election_id):
        try:
            candidates, votes = contract.functions.getResults(election_id).call()
            results = [
                {"candidate": candidate, "votes": vote_count}
                for candidate, vote_count in zip(candidates, votes)
            ]
            return Response({
                "election_id": election_id,
                "results": results,
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при получении результатов: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/elections/<id>/voters/<address>/status/
# ─────────────────────────────────────────────────────────────────────────────

class VoterStatusView(APIView):
    def get(self, request, election_id, address):
        if not Web3.is_address(address):
            return Response(
                {"error": f"Некорректный Ethereum-адрес: {address}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            checksum_address = Web3.to_checksum_address(address)

            is_whitelisted = contract.functions.whitelist(
                election_id, checksum_address
            ).call()
            has_voted = contract.functions.hasVoted(
                election_id, checksum_address
            ).call()
            can_vote = is_whitelisted and not has_voted

            return Response({
                "election_id": election_id,
                "address": checksum_address,
                "whitelisted": is_whitelisted,
                "has_voted": has_voted,
                "can_vote": can_vote,
            })
        except ContractLogicError as e:
            return handle_contract_error(e)
        except Exception as e:
            return Response(
                {"error": f"Ошибка при проверке статуса: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/owner/  — адрес владельца контракта
# Нужно фронту, чтобы понять, показывать ли админ-панель.
# ─────────────────────────────────────────────────────────────────────────────

class OwnerView(APIView):
    """
    GET /api/owner/

    Ответ (200 OK):
    {
        "owner": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "chain_id": 31337
    }
    """

    def get(self, request):
        try:
            owner = contract.functions.owner().call()
            return Response({
                "owner": owner,
                "contract_address": contract.address,
                "chain_id": w3.eth.chain_id,
            })
        except Exception as e:
            return Response(
                {"error": f"Ошибка при получении владельца: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
