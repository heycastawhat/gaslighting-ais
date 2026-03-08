const https = require("https");

module.exports = (req, res) => {
  // Strip "/api/" prefix to get the downstream path
  const targetPath = "/proxy/" + req.url.replace(/^\/api\//, "");

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    const opts = {
      hostname: "ai.hackclub.com",
      port: 443,
      path: targetPath,
      method: req.method,
      headers: {
        "content-type": req.headers["content-type"] || "application/json",
        ...(req.headers["authorization"] && { authorization: req.headers["authorization"] }),
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
};
