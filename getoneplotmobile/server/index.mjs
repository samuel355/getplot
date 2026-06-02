/**
 * Standalone mobile admin API (Clerk). Not the Next.js web app.
 *
 * Run: npm run dev:api
 * Default: http://localhost:8787
 *
 * Routes:
 *   GET  /api/users
 *   POST /api/admin/update-user
 *   GET  /api/health
 */
import http from "node:http";
import { loadEnvLocal } from "./loadEnv.mjs";

// Load .env.local before clerkAdmin reads CLERK_* (static imports run too early)
loadEnvLocal();
const { handleGetUsers, handleUpdateUser } = await import("./clerkAdmin.mjs");

const PORT = Number(process.env.MOBILE_API_PORT || 8787);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

async function toWebRequest(req) {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || "/", `http://${host}`);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const body = chunks.length ? Buffer.concat(chunks) : undefined;

  return new Request(url.toString(), {
    method: req.method,
    headers: req.headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? body : undefined,
  });
}

async function sendNodeResponse(webRes, res) {
  cors(res);
  res.statusCode = webRes.status;
  webRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "content-type") {
      res.setHeader("Content-Type", value);
    }
  });
  const text = await webRes.text();
  res.end(text);
}

const server = http.createServer(async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const path = (req.url || "").split("?")[0];

  try {
    if (req.method === "GET" && path === "/api/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", service: "getoneplot-mobile-api" }));
      return;
    }

    const webReq = await toWebRequest(req);

    if (req.method === "GET" && path === "/api/users") {
      await sendNodeResponse(await handleGetUsers(webReq), res);
      return;
    }

    if (req.method === "POST" && path === "/api/admin/update-user") {
      await sendNodeResponse(await handleUpdateUser(webReq), res);
      return;
    }

    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found", path }));
  } catch (err) {
    console.error("[mobile-api]", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message || "Internal server error" }));
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[mobile-api] listening on http://0.0.0.0:${PORT}`);
  console.log(`[mobile-api] CLERK_SECRET_KEY loaded: ${!!process.env.CLERK_SECRET_KEY}`);
  console.log(
    `[mobile-api] EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY loaded: ${!!process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}`,
  );
});
