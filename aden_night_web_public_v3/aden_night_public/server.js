'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon' };
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
    return res.end(JSON.stringify({ ok:true, app:'aden-night', time:new Date().toISOString() }));
  }
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';
  const file = path.resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) {
    res.writeHead(403); return res.end('Forbidden');
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); return res.end('Not Found'); }
    res.writeHead(200, { 'Content-Type':MIME[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control':path.basename(file)==='index.html'?'no-cache':'public, max-age=3600', 'X-Content-Type-Options':'nosniff' });
    fs.createReadStream(file).pipe(res);
  });
});
server.listen(PORT, HOST, () => console.log(`아덴의 밤 서버 실행: http://${HOST}:${PORT}`));
for (const sig of ['SIGINT','SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
