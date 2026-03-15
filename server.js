/**
 * AgentFit 로컬 프록시 서버
 * - 정적 파일 서빙 (index.html, doc.html 등)
 * - Claude API CORS 우회 프록시 (/api/claude)
 *
 * 실행: node server.js
 * 접속: http://localhost:3000
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const PORT = 3000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.png':  'image/png',
};

const server = http.createServer((req, res) => {

  // ── Claude API 프록시 ──────────────────────────
  if (req.url === '/api/claude' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const options = {
        hostname: 'api.anthropic.com',
        path:     '/v1/messages',
        method:   'POST',
        headers: {
          'Content-Type':      'application/json',
          'x-api-key':         req.headers['x-api-key'] || '',
          'anthropic-version': req.headers['anthropic-version'] || '2023-06-01',
          'Content-Length':    Buffer.byteLength(body),
        },
      };

      const proxyReq = https.request(options, proxyRes => {
        res.writeHead(proxyRes.statusCode, {
          'Content-Type':                'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        proxyRes.pipe(res);
      });

      proxyReq.on('error', err => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      });

      proxyReq.write(body);
      proxyReq.end();
    });
    return;
  }

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version',
    });
    res.end();
    return;
  }

  // ── 정적 파일 서빙 ─────────────────────────────
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(__dirname, urlPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  AgentFit 로컬 서버 실행 중');
  console.log('  ───────────────────────────────');
  console.log(`  평가 도구  →  http://localhost:${PORT}`);
  console.log(`  방법론 가이드  →  http://localhost:${PORT}/doc.html`);
  console.log('');
  console.log('  종료: Ctrl + C');
  console.log('');
});
