#!/bin/sh
# ─── deployer-entrypoint.sh ─────────────────────────────────────────────────
# Один раз: ждёт hardhat-ноду, компилирует контракт (с повторами), деплоит.

set -e

RPC_URL="${HARDHAT_URL:-http://hardhat:8545}"

echo "[deployer] Жду hardhat-ноду на $RPC_URL..."

# Ждём, пока нода ответит
node - <<'EOF'
const http = require('http');
const url = new URL(process.env.HARDHAT_URL || "http://hardhat:8545");
const payload = JSON.stringify({jsonrpc:"2.0",method:"eth_chainId",params:[],id:1});

async function tryOnce() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: url.hostname,
      port: url.port,
      path: '/',
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Content-Length': payload.length},
      timeout: 2000,
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.result ? true : false);
        } catch { resolve(false); }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.write(payload);
    req.end();
  });
}

(async () => {
  for (let i = 0; i < 60; i++) {
    if (await tryOnce()) {
      console.log("[deployer] Нода готова");
      process.exit(0);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  console.error("[deployer] Нода не ответила за 2 минуты");
  process.exit(1);
})();
EOF

# Компиляция контракта с повторными попытками.
# Скачивание компилятора solc может оборваться (SocketError) — повторяем.
echo "[deployer] Компилирую контракт (с повторами при сетевых сбоях)..."
COMPILE_OK=0
for attempt in 1 2 3 4 5; do
  echo "[deployer] Попытка компиляции #$attempt..."
  if npx hardhat compile; then
    COMPILE_OK=1
    echo "[deployer] Контракт скомпилирован успешно"
    break
  else
    echo "[deployer] Попытка #$attempt не удалась, жду 5 сек и повторяю..."
    sleep 5
  fi
done

if [ "$COMPILE_OK" != "1" ]; then
  echo "[deployer] ОШИБКА: не удалось скомпилировать контракт за 5 попыток."
  echo "[deployer] Вероятно, заблокирован доступ к binaries.soliditylang.org."
  exit 1
fi

echo "[deployer] Запускаю деплой контракта..."
npx hardhat run scripts/deploy.js --network docker

echo "[deployer] Готово."
