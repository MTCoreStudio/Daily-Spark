/** Tiny static server used only to preview the Play feature graphic. */
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const types = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".css": "text/css",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    const file = path.join(ROOT, url.replace(/^\/+/, ""));
    fs.readFile(file, (err, data) => {
      if (err || !file.startsWith(ROOT)) {
        res.writeHead(404);
        res.end("not found");
        return;
      }
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(8899, () => {
    console.log("serving on http://localhost:8899");
  });