const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const API_TARGET = "https://ai.hackclub.com";

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
};

const server = http.createServer((req, res) => {
  // Proxy API requests
  if (req.url === "/api/chat") {
    const targetPath = "/proxy/v1/chat/completions";
    const chunks = [];

    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const body = Buffer.concat(chunks);

      const provider = req.headers["x-provider"] || "hackclub";
      let authorization = req.headers["authorization"] || "";

      const passphrase = process.env.PASSPHRASE;
      const isPassphrase = passphrase && authorization.toLowerCase() === "bearer " + passphrase.toLowerCase();
      let proxyHost, proxyPath;

      if (isPassphrase) {
        const envKey = process.env.HACKCLUB_API_KEY;
        if (!envKey) {
          res.writeHead(401, { "content-type": "text/plain" });
          return res.end("No API key configured on server");
        }
        authorization = "Bearer " + envKey;
        proxyHost = "ai.hackclub.com";
        proxyPath = "/proxy/v1/chat/completions";
      } else if (provider === "openai") {
        proxyHost = "api.openai.com";
        proxyPath = "/v1/chat/completions";
      } else {
        proxyHost = "ai.hackclub.com";
        proxyPath = targetPath;
      }

      const opts = {
        hostname: proxyHost,
        port: 443,
        path: proxyPath,
        method: req.method,
        headers: {
          "content-type": req.headers["content-type"] || "application/json",
          ...(authorization && { authorization }),
        },
      };

      const proxy = https.request(opts, (upstream) => {
        res.writeHead(upstream.statusCode, {
          "content-type": upstream.headers["content-type"] || "application/octet-stream",
          "transfer-encoding": upstream.headers["transfer-encoding"] || "",
        });
        upstream.pipe(res);
      });

      proxy.on("error", (e) => {
        res.writeHead(502, { "content-type": "text/plain" });
        res.end("Proxy error: " + e.message);
      });

      if (body.length) proxy.write(body);
      proxy.end();
    });
    return;
  }

  // Serve static files
  let filePath = req.url === "/" ? "/index.html" : req.url;
  filePath = path.join(__dirname, "public", filePath);

  // Prevent directory traversal
  const publicDir = path.join(__dirname, "public");
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "content-type": "text/plain" });
      return res.end("Not found");
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "content-type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Gaslight-a-Bot running at http://localhost:${PORT}`);
});
