// healthcheck.js — проверка готовности hardhat-ноды.
// Делает JSON-RPC запрос eth_chainId. Если есть result — нода жива (exit 0).
// Используется в healthcheck сервиса hardhat (docker-compose.yml).
const http = require('http');
const payload = JSON.stringify({ jsonrpc: '2.0', method: 'eth_chainId', params: [], id: 1 });

const req = http.request({
  host: 'localhost',
  port: 8545,
  method: 'POST',
  path: '/',
  headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length },
  timeout: 3000,
}, (res) => {
  let body = '';
  res.on('data', (c) => (body += c));
  res.on('end', () => {
    try {
      process.exit(JSON.parse(body).result ? 0 : 1);
    } catch {
      process.exit(1);
    }
  });
});

req.on('error', () => process.exit(1));
req.on('timeout', () => { req.destroy(); process.exit(1); });
req.write(payload);
req.end();
