#!/bin/sh
# ─── backend-entrypoint.sh ──────────────────────────────────────────────────
# Этот скрипт запускается при старте backend-контейнера.
# Делает три вещи:
#   1. Ждёт, пока hardhat-нода ответит на RPC-запрос (иначе Django упадёт
#      при инициализации модуля api.blockchain — он сразу пытается прочитать ABI
#      и подключиться к контракту).
#   2. Прогоняет миграции Django (для встроенных таблиц auth/sessions).
#   3. Запускает dev-сервер.

set -e  # выход при первой же ошибке

RPC_URL="${RPC_URL:-http://hardhat:8545}"

echo "[entrypoint] Жду hardhat-ноду на $RPC_URL..."

# Простой цикл: делаем JSON-RPC запрос eth_chainId. Пока не отвечает — ждём.
# Используем python вместо curl (он у нас уже есть в образе, а curl — нет).
python - <<EOF
import sys, time, urllib.request, json
url = "$RPC_URL"
payload = json.dumps({"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}).encode()
for i in range(60):  # 60 попыток * 2 сек = 2 минуты
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type":"application/json"})
        with urllib.request.urlopen(req, timeout=2) as r:
            data = json.loads(r.read())
            if "result" in data:
                print(f"[entrypoint] Нода готова, chainId={data['result']}")
                sys.exit(0)
    except Exception as e:
        pass
    time.sleep(2)
print("[entrypoint] Нода не ответила за 2 минуты, выходим")
sys.exit(1)
EOF

# Тут же ждём, пока контракт будет задеплоен.
# Признак — отвечает ли он на запрос eth_getCode (вернёт непустой байткод).
echo "[entrypoint] Жду деплой контракта по адресу $CONTRACT_ADDRESS..."
python - <<EOF
import sys, time, urllib.request, json
url = "$RPC_URL"
addr = "$CONTRACT_ADDRESS"
payload = json.dumps({"jsonrpc":"2.0","method":"eth_getCode","params":[addr,"latest"],"id":1}).encode()
for i in range(60):
    try:
        req = urllib.request.Request(url, data=payload, headers={"Content-Type":"application/json"})
        with urllib.request.urlopen(req, timeout=2) as r:
            data = json.loads(r.read())
            code = data.get("result", "0x")
            # "0x" = контракта по этому адресу нет. Любое более длинное — есть.
            if code and len(code) > 2:
                print(f"[entrypoint] Контракт найден ({len(code)} байт байткода)")
                sys.exit(0)
    except Exception:
        pass
    time.sleep(2)
print("[entrypoint] Контракт не задеплоен за 2 минуты")
sys.exit(1)
EOF

echo "[entrypoint] Прогоняю миграции..."
python manage.py migrate --noinput

echo "[entrypoint] Запускаю Django..."
# 0.0.0.0 — слушаем на всех интерфейсах внутри контейнера
exec python manage.py runserver 0.0.0.0:8000
