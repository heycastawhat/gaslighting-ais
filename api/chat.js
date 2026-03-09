const https = require("https");

module.exports = (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", () => {
    const body = Buffer.concat(chunks);

    const provider = req.headers["x-provider"] || "hackclub";
    let authorization = req.headers["authorization"] || "";

    const passphrase = process.env.PASSPHRASE;
    const isPassphrase = passphrase && authorization.toLowerCase() === "bearer " + passphrase.toLowerCase();
    let hostname, targetPath;

    if (isPassphrase) {
      const envKey = process.env.HACKCLUB_API_KEY;
      if (!envKey) {
        res.writeHead(401, { "content-type": "text/plain" });
        return res.end("No API key configured on server");
      }
      authorization = "Bearer " + envKey;
      hostname = "ai.hackclub.com";
      targetPath = "/proxy/v1/chat/completions";
    } else if (provider === "openai") {
      hostname = "api.openai.com";
      targetPath = "/v1/chat/completions";
    } else {
      hostname = "ai.hackclub.com";
      targetPath = "/proxy/v1/chat/completions";
    }

    const opts = {
      hostname,
      port: 443,
      path: targetPath,
      method: "POST",
      headers: {
        "content-type": "application/json",
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
};
